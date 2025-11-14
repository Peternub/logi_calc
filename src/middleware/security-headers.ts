import { NextRequest, NextResponse } from 'next/server';

// Security headers configuration
interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | boolean;
  hsts?: boolean | {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions?: boolean;
  referrerPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
  permissionsPolicy?: string;
  expectCertificateTransparency?: boolean;
  featurePolicy?: string;
  customHeaders?: Record<string, string>;
}

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig = {}) {
    this.config = {
      contentSecurityPolicy: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameOptions: 'DENY',
      contentTypeOptions: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
      expectCertificateTransparency: true,
      ...config,
    };
  }

  private generateCSPHeader(): string {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.supabase.co https://*.supabase.co wss://*.supabase.co",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return cspDirectives.join('; ');
  }

  middleware() {
    return (req: NextRequest) => {
      const response = NextResponse.next();

      // Content Security Policy
      if (this.config.contentSecurityPolicy) {
        const cspValue = typeof this.config.contentSecurityPolicy === 'string'
          ? this.config.contentSecurityPolicy
          : this.generateCSPHeader();
        response.headers.set('Content-Security-Policy', cspValue);
      }

      // HTTP Strict Transport Security
      if (this.config.hsts) {
        let hstsValue = '';
        if (typeof this.config.hsts === 'boolean') {
          hstsValue = 'max-age=31536000; includeSubDomains; preload';
        } else {
          const { maxAge = 31536000, includeSubDomains = true, preload = true } = this.config.hsts;
          hstsValue = `max-age=${maxAge}`;
          if (includeSubDomains) hstsValue += '; includeSubDomains';
          if (preload) hstsValue += '; preload';
        }
        response.headers.set('Strict-Transport-Security', hstsValue);
      }

      // X-Frame-Options
      if (this.config.frameOptions) {
        response.headers.set('X-Frame-Options', this.config.frameOptions);
      }

      // X-Content-Type-Options
      if (this.config.contentTypeOptions) {
        response.headers.set('X-Content-Type-Options', 'nosniff');
      }

      // Referrer Policy
      if (this.config.referrerPolicy) {
        response.headers.set('Referrer-Policy', this.config.referrerPolicy);
      }

      // Cross-Origin-Embedder-Policy
      if (this.config.crossOriginEmbedderPolicy) {
        response.headers.set('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
      }

      // Cross-Origin-Opener-Policy
      if (this.config.crossOriginOpenerPolicy) {
        response.headers.set('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
      }

      // Cross-Origin-Resource-Policy
      if (this.config.crossOriginResourcePolicy) {
        response.headers.set('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
      }

      // Permissions Policy
      if (this.config.permissionsPolicy) {
        response.headers.set('Permissions-Policy', this.config.permissionsPolicy);
      }

      // Expect-Certificate-Transparency
      if (this.config.expectCertificateTransparency) {
        response.headers.set('Expect-CT', 'max-age=86400, enforce');
      }

      // Feature Policy (deprecated but still supported)
      if (this.config.featurePolicy) {
        response.headers.set('Feature-Policy', this.config.featurePolicy);
      }

      // Custom headers
      if (this.config.customHeaders) {
        Object.entries(this.config.customHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      // Remove potentially dangerous headers
      response.headers.delete('Server');
      response.headers.delete('X-Powered-By');

      return response;
    };
  }
}

// CSRF Protection
export class CSRFProtection {
  private secretKey: string;
  private tokenLength: number;
  private cookieName: string;
  private headerName: string;

  constructor({
    secretKey = process.env.CSRF_SECRET || 'default-csrf-secret',
    tokenLength = 32,
    cookieName = 'csrf-token',
    headerName = 'x-csrf-token',
  } = {}) {
    this.secretKey = secretKey;
    this.tokenLength = tokenLength;
    this.cookieName = cookieName;
    this.headerName = headerName;
  }

  generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < this.tokenLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token + this.secretKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyToken(token: string, hash: string): Promise<boolean> {
    const computedHash = await this.hashToken(token);
    return computedHash === hash;
  }

  middleware() {
    return async (req: NextRequest) => {
      // Skip CSRF protection for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return NextResponse.next();
      }

      const token = req.headers.get(this.headerName) || req.cookies.get(this.cookieName)?.value;
      const storedHash = req.cookies.get(`${this.cookieName}-hash`)?.value;

      if (!token || !storedHash) {
        return NextResponse.json(
          { error: 'CSRF token missing' },
          { status: 403 }
        );
      }

      const isValid = await this.verifyToken(token, storedHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    };
  }

  async setTokenCookie(response: NextResponse): Promise<void> {
    const token = this.generateToken();
    const hash = await this.hashToken(token);

    response.cookies.set(this.cookieName, token, {
      httpOnly: false, // Allow JavaScript access for AJAX requests
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set(`${this.cookieName}-hash`, hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }
}

// XSS Protection utilities
export class XSSProtection {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
  ];

  static sanitizeHTML(input: string): string {
    let sanitized = input;

    // Remove dangerous patterns
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Encode HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  static detectXSS(input: string): boolean {
    return this.XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  middleware() {
    return (req: NextRequest) => {
      const response = NextResponse.next();

      // Set XSS protection headers
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Content-Type-Options', 'nosniff');

      return response;
    };
  }
}

// Predefined security configurations
export const securityConfigs = {
  strict: new SecurityHeaders({
    contentSecurityPolicy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    referrerPolicy: 'no-referrer',
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
  }),

  moderate: new SecurityHeaders({
    contentSecurityPolicy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameOptions: 'SAMEORIGIN',
    contentTypeOptions: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
  }),

  basic: new SecurityHeaders({
    contentSecurityPolicy: false,
    hsts: true,
    frameOptions: 'SAMEORIGIN',
    contentTypeOptions: true,
    referrerPolicy: 'same-origin',
  }),
};

export default SecurityHeaders;