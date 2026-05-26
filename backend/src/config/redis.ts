import { Redis } from 'ioredis';
import { env } from './env.js';
import logger from '../utils/logger.js';

/**
 * Redis client with graceful degradation.
 *
 * If Redis is unavailable, the app still works — it just skips caching.
 * This is critical for:
 * - Local development (no Redis installed)
 * - Single-developer projects that don't need distributed caching yet
 * - Deployment environments where Redis isn't provisioned initially
 *
 * In production with multiple server instances, Redis is essential for:
 * - Shared cache across instances
 * - Distributed rate limiting
 * - Session storage
 * - Pub/sub for Socket.io scaling
 */

let redisClient: Redis | null = null;
let isRedisAvailable = false;

const REDIS_URL = env.REDIS_URL;

function createRedisClient(): Redis | null {
  if (!REDIS_URL) {
    logger.warn('⚠️  REDIS_URL not set — running without Redis cache');
    return null;
  }

  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) {
          logger.warn('Redis max retries reached — disabling cache');
          return null; // Stop retrying
        }
        return Math.min(times * 500, 3000); // Exponential backoff
      },
      lazyConnect: true,
    });

    client.on('connect', () => {
      isRedisAvailable = true;
      logger.info('✅ Redis connected');
    });

    client.on('error', (err: Error) => {
      isRedisAvailable = false;
      logger.warn('Redis error (cache disabled):', err.message);
    });

    client.on('close', () => {
      isRedisAvailable = false;
      logger.warn('Redis connection closed');
    });

    // Attempt connection
    client.connect().catch(() => {
      logger.warn('Redis connection failed — cache disabled');
    });

    return client;
  } catch {
    logger.warn('Redis initialization failed — cache disabled');
    return null;
  }
}

// Initialize on import
redisClient = createRedisClient();

/**
 * Get the Redis client instance.
 * Returns null if Redis is not configured or unavailable.
 */
export function getRedisClient(): Redis | null {
  return isRedisAvailable ? redisClient : null;
}

/**
 * Check if Redis is currently available for use.
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable;
}

/**
 * Gracefully close Redis connection.
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.error('Error closing Redis:', error);
    }
  }
}

export default redisClient;
