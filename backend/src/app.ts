import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import { corsOptions } from './config/cors.js';
import { APP_CONSTANTS } from './utils/constants.js';

// Middleware
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { mongoSanitize } from './middlewares/sanitize.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

// Routes
import apiRouter from './routes/index.js';

/**
 * Express app construction — separated from server bootstrap (index.ts)
 * so integration tests can import the app and drive it with supertest
 * without opening a port or connecting to real infrastructure.
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

// Behind the nginx reverse proxy, req.ip must come from X-Forwarded-For.
// Without this, rate limiting keys every user by the proxy's IP — one shared
// bucket for the whole site — and login/session logs record the wrong IP.
app.set('trust proxy', 1);

// ─── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());                  // Sets security HTTP headers (X-Content-Type-Options, etc.)
app.use(cors(corsOptions));         // CORS with env-driven origin whitelist
app.use(globalRateLimiter);         // Global rate limiting

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Strip NoSQL operator ($) / dotted keys from all inputs (defense-in-depth).
app.use(mongoSanitize);

// ─── Observability ─────────────────────────────────────────────────────────────
app.use(requestIdMiddleware);  // Must be before requestLogger
app.use(requestLogger);

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use(APP_CONSTANTS.API_PREFIX, apiRouter);

// ─── Error Handling (must be registered AFTER all routes) ──────────────────────
app.use(errorHandler);

export default app;
