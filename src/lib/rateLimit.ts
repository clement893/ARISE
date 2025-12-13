/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based solution like @upstash/ratelimit
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

/**
 * Default rate limits
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Token refresh - more permissive since it's automatic
  refresh: {
    maxRequests: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // API endpoints - moderate limits
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Strict limits for sensitive operations
  strict: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  const record = store[key];

  // Clean up expired entries periodically (simple cleanup)
  if (Object.keys(store).length > 10000) {
    // Clear expired entries
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }

  // If no record exists or window has expired, create new record
  if (!record || record.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (useful behind proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limit middleware helper
 */
export function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; response?: NextResponse } {
  const identifier = getClientIdentifier(request);
  const result = checkRateLimit(identifier, config);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${new Date(result.resetTime).toISOString()}`,
        resetTime: result.resetTime,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
        },
      }
    );
    return { allowed: false, response };
  }

  return { allowed: true };
}
