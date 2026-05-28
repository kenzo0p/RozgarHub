import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { cacheGet, cacheSet } from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * Idempotency Middleware — prevents duplicate mutations.
 *
 * Problem: Network retries, double-clicks, and client bugs can cause
 * the same POST/PUT request to execute twice, leading to:
 * - Duplicate job applications
 * - Double job postings
 * - Multiple payments (in financial systems)
 *
 * Solution: The client sends an `Idempotency-Key` header. The server:
 * 1. Checks if this key was seen before
 * 2. If yes → return the cached response (no side effects)
 * 3. If no → execute the request, cache the response
 *
 * Implementation:
 * - Keys are stored in Redis with a 24-hour TTL
 * - Falls back to pass-through if Redis is unavailable
 * - Only applies to POST, PUT, PATCH (not GET or DELETE)
 *
 * Usage:
 *   router.post('/apply/:id', authenticate, idempotent, applicationController.apply)
 *
 * Client usage:
 *   fetch('/api/v1/application/apply/123', {
 *     method: 'POST',
 *     headers: { 'Idempotency-Key': crypto.randomUUID() }
 *   })
 *
 * Interview note: Idempotency is a critical concept in distributed systems.
 * AWS, Stripe, and PayPal all require idempotency keys for write operations.
 */

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours

export const idempotent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Only apply to mutating methods
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    next();
    return;
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  // If no key provided, skip (backward compatible — existing clients still work)
  if (!idempotencyKey) {
    next();
    return;
  }

  // Build cache key incorporating the route to prevent cross-endpoint collisions
  const cacheKey = `idempotency:${idempotencyKey}:${req.method}:${req.originalUrl}`;

  // Check if we've seen this key before
  const cached = await cacheGet<{ statusCode: number; body: unknown }>(cacheKey);
  if (cached) {
    logger.info(`Idempotent replay: ${idempotencyKey}`);
    res.status(cached.statusCode).json(cached.body);
    return;
  }

  // Intercept the response to cache it
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown): Response {
    // Cache the response for future replays
    cacheSet(cacheKey, { statusCode: res.statusCode, body }, IDEMPOTENCY_TTL).catch(() => {
      // Cache write failure is non-critical
    });
    return originalJson(body);
  };

  next();
};
