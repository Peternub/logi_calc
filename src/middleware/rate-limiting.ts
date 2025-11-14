import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      ...config,
    };

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key generation based on IP and user agent
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    return `${ip}:${userAgent}`;
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    const key = this.generateKey(req);
    const now = Date.now();

    // Initialize or reset if window expired
    if (!this.store[key] || this.store[key].resetTime <= now) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const entry = this.store[key];
    const allowed = entry.count < this.config.maxRequests;

    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      error: allowed ? undefined : this.config.message,
    };
  }

  middleware() {
    return async (req: NextRequest) => {
      const result = await this.checkLimit(req);

      if (!result.allowed) {
        return NextResponse.json(
          { error: result.error },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      return response;
    };
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests, please try again later.',
  }),

  // Authentication endpoints (more restrictive)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
  }),

  // Password reset (very restrictive)
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later.',
  }),

  // File upload
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many file uploads, please try again later.',
  }),

  // Search endpoints
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests, please try again later.',
  }),

  // Email sending
  email: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many email requests, please try again later.',
  }),
};

// Utility function to apply rate limiting to API routes
export function withRateLimit(
  rateLimiter: RateLimiter,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const limitResult = await rateLimiter.checkLimit(req);

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.error },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(req);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString());

    return response;
  };
}

// Advanced rate limiting with Redis (for production)
export class RedisRateLimiter {
  private redisClient: any; // Redis client
  private config: RateLimitConfig;

  constructor(redisClient: any, config: RateLimitConfig) {
    this.redisClient = redisClient;
    this.config = config;
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    const key = this.generateKey(req);
    const now = Date.now();
    const window = Math.floor(now / this.config.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      const current = await this.redisClient.incr(redisKey);
      
      if (current === 1) {
        // Set expiration for the key
        await this.redisClient.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
      }

      const allowed = current <= this.config.maxRequests;
      const resetTime = (window + 1) * this.config.windowMs;

      return {
        allowed,
        remaining: Math.max(0, this.config.maxRequests - current),
        resetTime,
        error: allowed ? undefined : this.config.message,
      };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fallback to allowing the request if Redis fails
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }

  private generateKey(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    return `${ip}:${userAgent}`;
  }
}

export default RateLimiter;