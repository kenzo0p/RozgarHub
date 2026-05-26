import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet, buildCacheKey } from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * Route-level response caching middleware.
 *
 * Usage:
 *   router.get('/jobs', cacheResponse('jobs', 60), jobController.getAllJobs)
 *
 * How it works:
 * 1. Build cache key from route prefix + query params
 * 2. Check Redis for cached response
 * 3. If HIT: send cached response directly (skip controller)
 * 4. If MISS: let controller run, intercept response, cache it
 *
 * This is a read-through cache — the controller always produces fresh data
 * on a miss, and the middleware transparently caches the result.
 *
 * Only caches successful responses (2xx status codes).
 * Only caches GET requests (mutations should never be cached).
 */
export const cacheResponse = (prefix: string, ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = buildCacheKey(prefix, req.query as Record<string, unknown>);

    // Check cache
    const cached = await cacheGet<{ statusCode: number; body: unknown }>(cacheKey);
    if (cached) {
      logger.http(`Cache HIT: ${req.originalUrl}`);
      res.status(cached.statusCode).json(cached.body);
      return;
    }

    // Cache MISS — intercept the response to cache it
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(cacheKey, { statusCode: res.statusCode, body }, ttlSeconds).catch(() => {
          // Swallow cache write errors — they shouldn't affect the response
        });
      }
      return originalJson(body);
    };

    next();
  };
};
