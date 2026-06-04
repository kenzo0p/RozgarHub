import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../../config/redis.js';

const router = Router();

/**
 * Health Check Routes — system status for monitoring and load balancers.
 *
 * GET /health        — Simple liveness check (is the process running?)
 * GET /health/ready  — Readiness check (can the app serve traffic?)
 *
 * Why two endpoints?
 * - Kubernetes/Docker use liveness probes to restart crashed containers
 * - Readiness probes determine if a container should receive traffic
 * - A container can be alive (process running) but not ready (DB down)
 *
 * Interview note: Health checks are a standard requirement at all MAANG companies.
 * They enable zero-downtime deployments, auto-scaling, and automated recovery.
 */

// Liveness — is the process running?
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Readiness — can the app serve traffic?
router.get('/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, { status: string; latency?: number; details?: string }> = {};

  // ─── MongoDB Check ──────────────────────────────────────────────────────
  const mongoStart = Date.now();
  try {
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state === 1) {
      // Ping to verify actual connectivity (not just state)
      await mongoose.connection.db?.admin().ping();
      checks.mongodb = {
        status: 'healthy',
        latency: Date.now() - mongoStart,
      };
    } else {
      const stateMap: Record<number, string> = {
        0: 'disconnected',
        2: 'connecting',
        3: 'disconnecting',
      };
      checks.mongodb = {
        status: 'unhealthy',
        details: stateMap[state] || 'unknown',
      };
    }
  } catch (error) {
    checks.mongodb = {
      status: 'unhealthy',
      latency: Date.now() - mongoStart,
      details: (error as Error).message,
    };
  }

  // ─── Redis Check ────────────────────────────────────────────────────────
  const redisStart = Date.now();
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      checks.redis = {
        status: 'healthy',
        latency: Date.now() - redisStart,
      };
    } else {
      checks.redis = {
        status: 'not_configured',
        details: 'Redis client not initialized (caching disabled)',
      };
    }
  } catch (error) {
    checks.redis = {
      status: 'unhealthy',
      latency: Date.now() - redisStart,
      details: (error as Error).message,
    };
  }

  // ─── System Metrics ─────────────────────────────────────────────────────
  const memUsage = process.memoryUsage();
  const system = {
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    },
    nodeVersion: process.version,
    pid: process.pid,
  };

  // Overall status: unhealthy if MongoDB is down (Redis is optional)
  const isHealthy = checks.mongodb?.status === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
    system,
  });
});

export default router;
