import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import { corsOptions } from './config/cors.js';
import './config/redis.js'; // Initialize Redis client on startup
import { disconnectRedis } from './config/redis.js';
import { APP_CONSTANTS } from './utils/constants.js';
import logger from './utils/logger.js';

// Middleware
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

// Events
import { registerEventHandlers } from './events/handlers.js';

// Routes
import apiRouter from './routes/index.js';

/**
 * RozgarHub API — Application Entry Point
 *
 * Middleware execution order matters:
 * 1. Security headers (helmet)
 * 2. CORS
 * 3. Rate limiting
 * 4. Body parsing
 * 5. Cookie parsing
 * 6. Request logging
 * 7. Routes
 * 8. Error handling (MUST be last)
 */

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());                  // Sets security HTTP headers (X-Content-Type-Options, etc.)
app.use(cors(corsOptions));         // CORS with env-driven origin whitelist
app.use(globalRateLimiter);         // Global rate limiting (100 req/15min)

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Observability ─────────────────────────────────────────────────────────────
app.use(requestIdMiddleware);  // Must be before requestLogger
app.use(requestLogger);

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use(APP_CONSTANTS.API_PREFIX, apiRouter);

// ─── Error Handling (must be registered AFTER all routes) ──────────────────────
app.use(errorHandler);

// ─── Server Startup ────────────────────────────────────────────────────────────
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

      server.close(async () => {
        logger.info('HTTP server closed');
        await Promise.all([
          disconnectDB(),
          disconnectRedis(),
        ]);
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ─── Unhandled Error Safety Nets ─────────────────────────────────────────
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
      // In production, you might want to restart the process here
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
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
