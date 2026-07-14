import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { captureException } from '../utils/monitoring.js';
import mongoose from 'mongoose';

/**
 * Centralized error handling middleware.
 *
 * This is the single place where all errors become HTTP responses.
 * Every thrown error (from controllers, services, or other middleware)
 * flows here via Express's error handling chain.
 *
 * Key benefits:
 * 1. Consistent error response format across ALL endpoints
 * 2. Prevents leaking internal details (stack traces, DB errors) in production
 * 3. Auto-maps Mongoose errors to user-friendly messages
 * 4. Single place to add error monitoring/alerting (Sentry, etc.)
 *
 * Interview note: This pattern is universally used in production Express apps.
 * It implements the "last line of defense" principle — no error escapes unformatted.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let errors: unknown[] = [];

  // ─── Known operational errors (our ApiError hierarchy) ────────────────────
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errors = err.errors;
  }

  // ─── Mongoose validation errors ──────────────────────────────────────────
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ─── Mongoose cast error (invalid ObjectId, etc.) ────────────────────────
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ─── MongoDB duplicate key error ─────────────────────────────────────────
  else if (err.name === 'MongoServerError' && (err as unknown as Record<string, unknown>).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const keyValue = (err as unknown as Record<string, unknown>).keyValue as Record<string, unknown>;
    const field = Object.keys(keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  // ─── JWT errors ──────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // ─── Log the error ──────────────────────────────────────────────────────
  if (statusCode >= 500) {
    // Server errors — log full details and report to error monitoring.
    logger.error(`[${code}] ${message}`, {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
    captureException(err, { url: req.originalUrl, method: req.method, code });
  } else {
    // Client errors — log at warn level (expected, not urgent)
    logger.warn(`[${code}] ${message}`, {
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ─── Send response ──────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    statusCode,
    code,
    message,
    ...(errors.length > 0 && { errors }),
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
