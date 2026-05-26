import { getRedisClient, isRedisConnected } from '../config/redis.js';
import logger from './logger.js';

/**
 * Cache utility — thin wrapper over Redis with graceful fallback.
 *
 * All methods are safe to call even when Redis is down — they return null/false
 * instead of throwing. This ensures cache failures never break the app.
 *
 * TTL defaults:
 * - Job listings: 60s (changes frequently, but 60s saves many DB queries)
 * - Job details: 300s (individual job data changes infrequently)
 * - Analytics: 600s (expensive aggregation, okay to be 10 min stale)
 * - Recommendations: 1800s (compute-heavy, fine to be 30 min stale)
 */

export const CACHE_TTL = {
  JOB_LISTING: 60,
  JOB_DETAIL: 300,
  ANALYTICS: 600,
  RECOMMENDATIONS: 1800,
  COMPANY: 300,
} as const;

/**
 * Get a cached value by key.
 * Returns parsed JSON or null if not found / Redis unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisConnected()) return null;

  try {
    const client = getRedisClient();
    if (!client) return null;

    const value = await client.get(key);
    if (!value) return null;

    logger.debug(`Cache HIT: ${key}`);
    return JSON.parse(value) as T;
  } catch (error) {
    logger.warn(`Cache GET error for ${key}:`, error);
    return null;
  }
}

/**
 * Set a cached value with TTL (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttl: number): Promise<boolean> {
  if (!isRedisConnected()) return false;

  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.setex(key, ttl, JSON.stringify(value));
    logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.warn(`Cache SET error for ${key}:`, error);
    return false;
  }
}

/**
 * Delete a cached value.
 */
export async function cacheDel(key: string): Promise<boolean> {
  if (!isRedisConnected()) return false;

  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.del(key);
    logger.debug(`Cache DEL: ${key}`);
    return true;
  } catch (error) {
    logger.warn(`Cache DEL error for ${key}:`, error);
    return false;
  }
}

/**
 * Invalidate all keys matching a pattern.
 * Used when data changes (e.g., new job posted → invalidate all job listing caches).
 *
 * Pattern examples:
 *   'jobs:*'       — all job-related caches
 *   'analytics:*'  — all analytics caches
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  if (!isRedisConnected()) return;

  try {
    const client = getRedisClient();
    if (!client) return;

    // SCAN is non-blocking — unlike KEYS which blocks the Redis server
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
        logger.debug(`Cache INVALIDATE: ${keys.length} keys matching '${pattern}'`);
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.warn(`Cache invalidation error for ${pattern}:`, error);
  }
}

/**
 * Generate a cache key from route and query parameters.
 * Ensures consistent key generation across the app.
 */
export function buildCacheKey(prefix: string, params: Record<string, unknown> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined && params[k] !== '')
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
}
