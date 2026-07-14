import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import './config/redis.js'; // Initialize Redis client on startup
import { disconnectRedis } from './config/redis.js';
import { APP_CONSTANTS } from './utils/constants.js';
import logger from './utils/logger.js';
import { captureException } from './utils/monitoring.js';

// Events
import { registerEventHandlers } from './events/handlers.js';

import app from './app.js';

/**
 * RozgarHub API — Server Bootstrap
 *
 * App construction lives in app.ts (imported by tests); this file owns the
 * runtime concerns: DB connection, event handlers, listening, and shutdown.
 */

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Register event handlers after DB is connected
    registerEventHandlers();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 RozgarHub API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📡 Health check: http://localhost:${env.PORT}${APP_CONSTANTS.API_PREFIX}/health`);
    });

    // ─── Graceful Shutdown ───────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Force shutdown if graceful shutdown hangs; cleared on clean exit path
      const forceExitTimer = setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10_000);

      server.close(async () => {
        logger.info('HTTP server closed');
        await Promise.all([
          disconnectDB(),
          disconnectRedis(),
        ]);
        clearTimeout(forceExitTimer);
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ─── Unhandled Error Safety Nets ─────────────────────────────────────────
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
      captureException(reason, { source: 'unhandledRejection' });
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      captureException(error, { source: 'uncaughtException' });
      // Uncaught exceptions leave the app in an undefined state — exit and let
      // the process manager (PM2, Docker, systemd) restart it
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
