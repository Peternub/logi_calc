import { SecurityAuditor } from '../utils/security-audit';
import { InputValidator } from '../utils/input-validation';
import { SecurityMiddleware, securityMiddlewareConfigs } from '../middleware/security';
import { rateLimiters } from '../middleware/rate-limiting';
import { CSRFProtection } from '../middleware/security-headers';

// Local interface for security audit configuration
interface SecurityAuditConfig {
  checkXSS: boolean;
  checkCSRF: boolean;
  checkSQLInjection: boolean;
  checkHeaders: boolean;
  checkAuthentication: boolean;
  checkDataExposure: boolean;
  checkInputValidation: boolean;
  checkRateLimiting: boolean;
}

// Centralized security configuration
export interface AppSecurityConfig {
  environment: 'development' | 'production' | 'testing';
  features: {
    securityAudit: boolean;
    inputValidation: boolean;
    rateLimiting: boolean;
    csrfProtection: boolean;
    xssProtection: boolean;
    securityHeaders: boolean;
    logging: boolean;
  };
  audit: {
    enabled: boolean;
    schedule: string; // cron expression
    alertOnCritical: boolean;
    reportTo: string[];
  };
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      blockedRequests: number;
      failedAttempts: number;
      errorRate: number;
    };
  };
}

class SecurityManager {
  private config: AppSecurityConfig;
  private auditor: SecurityAuditor;
  private inputValidator: InputValidator;
  private middleware: SecurityMiddleware;
  private csrfProtection: CSRFProtection;

  constructor(config: AppSecurityConfig) {
    this.config = config;
    
    // Initialize security components
    this.auditor = new SecurityAuditor({
      checkXSS: config.features.xssProtection,
      checkCSRF: config.features.csrfProtection,
      checkSQLInjection: config.features.inputValidation,
      checkHeaders: config.features.securityHeaders,
      checkAuthentication: true,
      checkDataExposure: true,
      checkInputValidation: config.features.inputValidation,
      checkRateLimiting: config.features.rateLimiting,
    });

    this.inputValidator = new InputValidator();
    this.csrfProtection = new CSRFProtection();

    // Select middleware configuration based on environment
    this.middleware = this.getMiddlewareForEnvironment();
  }

  private getMiddlewareForEnvironment(): SecurityMiddleware {
    switch (this.config.environment) {
      case 'production':
        return securityMiddlewareConfigs.production;
      case 'development':
        return securityMiddlewareConfigs.development;
      case 'testing':
        return securityMiddlewareConfigs.testing;
      default:
        return securityMiddlewareConfigs.development;
    }
  }

  // Run comprehensive security audit
  async runSecurityAudit(): Promise<{
    passed: boolean;
    results: any;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    console.log('🔍 Running security audit...');
    
    const auditResults = await this.auditor.runSecurityAudit();
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Analyze results and extract critical issues
    auditResults.vulnerabilities.forEach((vulnerability: any) => {
      if (vulnerability.severity === 'critical') {
        criticalIssues.push(vulnerability.description);
      }
    });

    // Alert on critical issues if configured
    if (this.config.audit.alertOnCritical && criticalIssues.length > 0) {
      await this.alertOnCriticalIssues(criticalIssues);
    }

    return {
      passed: auditResults.overallScore >= 80,
      results: auditResults,
      criticalIssues,
      recommendations: auditResults.recommendations,
    };
  }

  private async alertOnCriticalIssues(issues: string[]): Promise<void> {
    const alertMessage = {
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      message: 'Critical security issues detected',
      issues,
      environment: this.config.environment,
    };

    console.error('🚨 CRITICAL SECURITY ALERT:', alertMessage);

    // In production, send alerts to configured recipients
    if (this.config.environment === 'production' && this.config.audit.reportTo.length > 0) {
      // Send email/slack/webhook notifications
      await this.sendSecurityAlert(alertMessage);
    }
  }

  private async sendSecurityAlert(alert: any): Promise<void> {
    // Implementation for sending alerts to configured recipients
    // This could include email, Slack, webhooks, etc.
    console.log('Sending security alert to:', this.config.audit.reportTo);
  }

  // Validate application security configuration
  validateSecurityConfig(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET environment variable is not set');
    }

    if (!process.env.SUPABASE_JWT_SECRET) {
      errors.push('SUPABASE_JWT_SECRET environment variable is not set');
    }

    if (this.config.environment === 'production') {
      if (!process.env.CSRF_SECRET) {
        errors.push('CSRF_SECRET environment variable is not set for production');
      }

      if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
        warnings.push('Database URL should use SSL in production');
      }

      if (!this.config.features.rateLimiting) {
        warnings.push('Rate limiting should be enabled in production');
      }

      if (!this.config.features.csrfProtection) {
        warnings.push('CSRF protection should be enabled in production');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Get security middleware for Express/Next.js
  getMiddleware() {
    return this.middleware.middleware();
  }

  // Get CSRF token for forms
  async getCSRFToken(): Promise<string> {
    return this.csrfProtection.generateToken();
  }

  // Validate input with centralized rules
  validateInput(value: string, type: 'email' | 'password' | 'text' | 'number' | 'url' | 'phone' | 'date' | 'html' | 'sql' | 'json') {
    return this.inputValidator.validate(value, type);
  }

  // Generate security report
  async generateSecurityReport(): Promise<{
    timestamp: string;
    environment: string;
    auditResults: any;
    configValidation: any;
    systemHealth: any;
    recommendations: string[];
  }> {
    const auditResults = await this.runSecurityAudit();
    const configValidation = this.validateSecurityConfig();

    const systemHealth = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    };

    const recommendations = [
      ...auditResults.recommendations,
      ...configValidation.warnings.map(w => `Config: ${w}`),
    ];

    return {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      auditResults: auditResults.results,
      configValidation,
      systemHealth,
      recommendations,
    };
  }
}

// Environment-specific configurations
export const securityConfigs = {
  development: {
    environment: 'development' as const,
    features: {
      securityAudit: true,
      inputValidation: true,
      rateLimiting: false,
      csrfProtection: true,
      xssProtection: true,
      securityHeaders: true,
      logging: true,
    },
    audit: {
      enabled: true,
      schedule: '0 */6 * * *', // Every 6 hours
      alertOnCritical: false,
      reportTo: [],
    },
    monitoring: {
      enabled: false,
      alertThresholds: {
        blockedRequests: 100,
        failedAttempts: 50,
        errorRate: 0.05,
      },
    },
  },

  production: {
    environment: 'production' as const,
    features: {
      securityAudit: true,
      inputValidation: true,
      rateLimiting: true,
      csrfProtection: true,
      xssProtection: true,
      securityHeaders: true,
      logging: true,
    },
    audit: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      alertOnCritical: true,
      reportTo: ['security@company.com'],
    },
    monitoring: {
      enabled: true,
      alertThresholds: {
        blockedRequests: 500,
        failedAttempts: 100,
        errorRate: 0.02,
      },
    },
  },

  testing: {
    environment: 'testing' as const,
    features: {
      securityAudit: false,
      inputValidation: true,
      rateLimiting: false,
      csrfProtection: false,
      xssProtection: true,
      securityHeaders: false,
      logging: false,
    },
    audit: {
      enabled: false,
      schedule: '',
      alertOnCritical: false,
      reportTo: [],
    },
    monitoring: {
      enabled: false,
      alertThresholds: {
        blockedRequests: 1000,
        failedAttempts: 200,
        errorRate: 0.1,
      },
    },
  },
};

// Initialize security manager based on environment
const getEnvironment = (): 'development' | 'production' | 'testing' => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'test') return 'testing';
  return 'development';
};

const environment = getEnvironment();
export const securityManager = new SecurityManager(securityConfigs[environment]);

// Export utilities for use throughout the app
export {
  SecurityManager,
  rateLimiters,
};

export default securityManager;