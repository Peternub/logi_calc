import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from './rate-limiting';
import { SecurityHeaders, CSRFProtection, XSSProtection, securityConfigs } from './security-headers';
import { InputValidator } from '../utils/input-validation';

// Security middleware configuration
interface SecurityMiddlewareConfig {
  rateLimiting?: {
    enabled: boolean;
    type: 'api' | 'auth' | 'upload' | 'search' | 'email' | 'passwordReset';
  };
  securityHeaders?: {
    enabled: boolean;
    config: 'strict' | 'moderate' | 'basic';
  };
  csrfProtection?: {
    enabled: boolean;
    excludePaths?: string[];
  };
  xssProtection?: {
    enabled: boolean;
    sanitizeBody?: boolean;
  };
  inputValidation?: {
    enabled: boolean;
    validateBody?: boolean;
    validateQuery?: boolean;
  };
  logging?: {
    enabled: boolean;
    logAttempts?: boolean;
    logBlocked?: boolean;
  };
}

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;
  private securityHeaders: SecurityHeaders;
  private csrfProtection: CSRFProtection;
  private xssProtection: XSSProtection;
  private inputValidator: InputValidator;

  constructor(config: SecurityMiddlewareConfig = {}) {
    this.config = {
      rateLimiting: { enabled: true, type: 'api' },
      securityHeaders: { enabled: true, config: 'moderate' },
      csrfProtection: { enabled: true, excludePaths: ['/api/auth/callback'] },
      xssProtection: { enabled: true, sanitizeBody: true },
      inputValidation: { enabled: true, validateBody: true, validateQuery: true },
      logging: { enabled: true, logAttempts: true, logBlocked: true },
      ...config,
    };

    // Initialize security components
    this.securityHeaders = securityConfigs[this.config.securityHeaders?.config || 'moderate'];
    this.csrfProtection = new CSRFProtection();
    this.xssProtection = new XSSProtection();
    this.inputValidator = new InputValidator();
  }

  private shouldSkipPath(path: string, excludePaths: string[] = []): boolean {
    return excludePaths.some(excludePath => {
      if (excludePath.endsWith('*')) {
        return path.startsWith(excludePath.slice(0, -1));
      }
      return path === excludePath;
    });
  }

  private async validateRequestData(req: NextRequest): Promise<{
    valid: boolean;
    errors: string[];
    sanitizedData?: any;
  }> {
    const errors: string[] = [];
    let sanitizedData: any = {};

    try {
      // Validate and sanitize request body
      if (this.config.inputValidation?.validateBody && req.body) {
        const bodyText = await req.text();
        if (bodyText) {
          try {
            const body = JSON.parse(bodyText);
            const sanitizedBody: any = {};

            Object.entries(body).forEach(([key, value]) => {
              if (typeof value === 'string') {
                // Check for XSS
                if (XSSProtection.detectXSS(value)) {
                  errors.push(`XSS detected in field: ${key}`);
                  return;
                }

                // Sanitize the value
                if (this.config.xssProtection?.sanitizeBody) {
                  sanitizedBody[key] = XSSProtection.sanitizeHTML(value);
                } else {
                  sanitizedBody[key] = value;
                }

                // Validate based on field name patterns
                if (key.toLowerCase().includes('email')) {
                  const emailValidation = this.inputValidator.validate(value, 'email');
                  if (!emailValidation.isValid) {
                    errors.push(`Invalid email in field: ${key}`);
                  }
                } else if (key.toLowerCase().includes('url')) {
                  const urlValidation = this.inputValidator.validate(value, 'url');
                  if (!urlValidation.isValid) {
                    errors.push(`Invalid URL in field: ${key}`);
                  }
                }
              } else {
                sanitizedBody[key] = value;
              }
            });

            sanitizedData.body = sanitizedBody;
          } catch (parseError) {
            errors.push('Invalid JSON in request body');
          }
        }
      }

      // Validate query parameters
      if (this.config.inputValidation?.validateQuery) {
        const url = new URL(req.url);
        const sanitizedQuery: any = {};

        url.searchParams.forEach((value, key) => {
          // Check for XSS in query parameters
          if (XSSProtection.detectXSS(value)) {
            errors.push(`XSS detected in query parameter: ${key}`);
            return;
          }

          sanitizedQuery[key] = XSSProtection.sanitizeHTML(value);
        });

        sanitizedData.query = sanitizedQuery;
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined,
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Failed to validate request data'],
      };
    }
  }

  private async logSecurityEvent(
    req: NextRequest,
    event: 'blocked' | 'attempt' | 'error',
    details: any
  ): Promise<void> {
    if (!this.config.logging?.enabled) return;

    const logData = {
      timestamp: new Date().toISOString(),
      event,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      method: req.method,
      url: req.url,
      details,
    };

    console.log('[SECURITY]', JSON.stringify(logData));

    // In production, you might want to send this to a logging service
    // await sendToLoggingService(logData);
  }

  middleware() {
    return async (req: NextRequest) => {
      const startTime = Date.now();
      let response: NextResponse;

      try {
        // 1. Rate Limiting
        if (this.config.rateLimiting?.enabled) {
          const rateLimiter = rateLimiters[this.config.rateLimiting.type];
          const limitResult = await rateLimiter.checkLimit(req);

          if (!limitResult.allowed) {
            await this.logSecurityEvent(req, 'blocked', {
              reason: 'rate_limit_exceeded',
              type: this.config.rateLimiting.type,
              remaining: limitResult.remaining,
            });

            return NextResponse.json(
              { error: limitResult.error },
              {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
                  'X-RateLimit-Remaining': limitResult.remaining.toString(),
                  'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
                },
              }
            );
          }
        }

        // 2. Input Validation and XSS Protection
        if (this.config.inputValidation?.enabled || this.config.xssProtection?.enabled) {
          const validation = await this.validateRequestData(req);

          if (!validation.valid) {
            await this.logSecurityEvent(req, 'blocked', {
              reason: 'input_validation_failed',
              errors: validation.errors,
            });

            return NextResponse.json(
              { error: 'Invalid request data', details: validation.errors },
              { status: 400 }
            );
          }

          // Attach sanitized data to request for use in API handlers
          if (validation.sanitizedData) {
            (req as any).sanitizedData = validation.sanitizedData;
          }
        }

        // 3. CSRF Protection
        if (this.config.csrfProtection?.enabled) {
          const shouldSkip = this.shouldSkipPath(
            new URL(req.url).pathname,
            this.config.csrfProtection.excludePaths
          );

          if (!shouldSkip && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            const csrfMiddleware = this.csrfProtection.middleware();
            const csrfResult = await csrfMiddleware(req);

            if (csrfResult.status === 403) {
              await this.logSecurityEvent(req, 'blocked', {
                reason: 'csrf_token_invalid',
              });

              return csrfResult;
            }
          }
        }

        // 4. Continue with the request
        response = NextResponse.next();

        // 5. Apply Security Headers
        if (this.config.securityHeaders?.enabled) {
          const headersMiddleware = this.securityHeaders.middleware();
          response = headersMiddleware(req) || response;
        }

        // 6. Apply XSS Protection Headers
        if (this.config.xssProtection?.enabled) {
          const xssMiddleware = this.xssProtection.middleware();
          response = xssMiddleware(req) || response;
        }

        // 7. Add rate limiting headers
        if (this.config.rateLimiting?.enabled) {
          const rateLimiter = rateLimiters[this.config.rateLimiting.type];
          const limitResult = await rateLimiter.checkLimit(req);

          response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxRequests.toString());
          response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString());
          response.headers.set('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString());
        }

        // 8. Log successful request
        if (this.config.logging?.logAttempts) {
          await this.logSecurityEvent(req, 'attempt', {
            status: 'allowed',
            processingTime: Date.now() - startTime,
          });
        }

        return response;
      } catch (error) {
        await this.logSecurityEvent(req, 'error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json(
          { error: 'Internal security error' },
          { status: 500 }
        );
      }
    };
  }
}

// Predefined security middleware configurations
export const securityMiddlewareConfigs = {
  // Maximum security for production
  production: new SecurityMiddleware({
    rateLimiting: { enabled: true, type: 'api' },
    securityHeaders: { enabled: true, config: 'strict' },
    csrfProtection: { enabled: true },
    xssProtection: { enabled: true, sanitizeBody: true },
    inputValidation: { enabled: true, validateBody: true, validateQuery: true },
    logging: { enabled: true, logAttempts: true, logBlocked: true },
  }),

  // Balanced security for development
  development: new SecurityMiddleware({
    rateLimiting: { enabled: false, type: 'api' },
    securityHeaders: { enabled: true, config: 'moderate' },
    csrfProtection: { enabled: true },
    xssProtection: { enabled: true, sanitizeBody: true },
    inputValidation: { enabled: true, validateBody: true, validateQuery: true },
    logging: { enabled: true, logAttempts: false, logBlocked: true },
  }),

  // Minimal security for testing
  testing: new SecurityMiddleware({
    rateLimiting: { enabled: false, type: 'api' },
    securityHeaders: { enabled: true, config: 'basic' },
    csrfProtection: { enabled: false },
    xssProtection: { enabled: true, sanitizeBody: false },
    inputValidation: { enabled: false },
    logging: { enabled: false },
  }),

  // Authentication endpoints (more restrictive)
  auth: new SecurityMiddleware({
    rateLimiting: { enabled: true, type: 'auth' },
    securityHeaders: { enabled: true, config: 'strict' },
    csrfProtection: { enabled: true },
    xssProtection: { enabled: true, sanitizeBody: true },
    inputValidation: { enabled: true, validateBody: true, validateQuery: true },
    logging: { enabled: true, logAttempts: true, logBlocked: true },
  }),
};

export default SecurityMiddleware;