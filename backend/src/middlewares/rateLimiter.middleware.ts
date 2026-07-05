import rateLimit from 'express-rate-limit';
import { APP_CONSTANTS } from '../utils/constants.js';
import { env } from '../config/env.js';

// Integration tests fire hundreds of requests from one IP; rate limiting
// there only produces flaky 429s. Never skipped in dev/production.
const skipInTests = () => env.NODE_ENV === 'test';

/**
 * Rate limiting middleware — prevents abuse and brute-force attacks.
 *
 * Two tiers:
 * 1. Global: 100 requests per 15 minutes (general API usage)
 * 2. Auth:   10 requests per 15 minutes (login/register — prevents brute force)
 *
 * In production with multiple server instances, switch to a Redis-backed
 * rate limiter store (rate-limit-redis) for distributed counting.
 */

export const globalRateLimiter = rateLimit({
  windowMs: APP_CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: APP_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    statusCode: 429,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,    // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,     // Disable `X-RateLimit-*` headers
  skip: skipInTests,
});

export const authRateLimiter = rateLimit({
  windowMs: APP_CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: APP_CONSTANTS.AUTH_RATE_LIMIT_MAX,
  message: {
    success: false,
    statusCode: 429,
    code: 'RATE_LIMITED',
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
});
