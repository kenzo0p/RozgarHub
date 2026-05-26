import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import v1Routes from './v1/index.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import { isRedisConnected } from '../config/redis.js';

const router = Router();

/**
 * API Versioning Router
 *
 * All API routes are prefixed with /api/v1, /api/v2, etc.
 * This allows running multiple API versions simultaneously during migrations.
 *
 * Adding a new version:
 *   1. Create routes/v2/ directory
 *   2. router.use('/v2', v2Routes)
 *   3. Frontend gradually migrates, old version stays up
 */
router.use(`/${APP_CONSTANTS.CURRENT_API_VERSION}`, v1Routes);

/**
 * Health check endpoint.
 *
 * Reports status of all dependent services (database, cache).
 * Used by:
 * - Load balancers (determines if instance should receive traffic)
 * - Docker HEALTHCHECK (restarts unhealthy containers)
 * - Monitoring dashboards (uptime tracking, alerting)
 * - CI/CD pipelines (verifies deployment success)
 *
 * GET /api/health
 */
router.get('/health', (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  const mongoState = mongoose.connection.readyState;
  const mongoStatus: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const health = {
    success: true,
    message: 'RozgarHub API is running',
    version: APP_CONSTANTS.CURRENT_API_VERSION,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: mongoStatus[mongoState] || 'unknown',
        healthy: mongoState === 1,
      },
      cache: {
        status: isRedisConnected() ? 'connected' : 'disconnected',
        healthy: isRedisConnected(),
        required: false, // App works without Redis
      },
    },
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    },
  };

  // Return 503 if critical services are down
  const statusCode = health.services.database.healthy ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
