import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

/**
 * HTTP request logging middleware.
 *
 * Logs every incoming request with method, URL, status code, and duration.
 * In production, these logs are essential for:
 * - Monitoring API latency and identifying slow endpoints
 * - Debugging issues from user reports ("it was slow at 3pm")
 * - Compliance and audit trails
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100), // Truncate long UAs
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};
