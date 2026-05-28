import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/auditLog.model.js';
import type { AuthRequest } from '../types/express.js';
import { featureFlags } from '../utils/featureFlags.js';
import logger from '../utils/logger.js';

/**
 * Audit Logging Middleware — automatically logs mutating operations.
 *
 * Only runs on POST, PUT, PATCH, DELETE requests.
 * Captures: who (actor), what (action, resource), when (timestamp),
 * and where (IP, user agent, HTTP method, path).
 *
 * This is a "fire-and-forget" pattern — audit log writes happen asynchronously
 * and never block the response. If the log write fails, the request still succeeds.
 *
 * Usage:
 *   router.post('/jobs', authenticate, auditLog('Job'), jobController.createJob)
 */

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const METHOD_TO_ACTION: Record<HttpMethod, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

export const auditLog = (resource: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!featureFlags.isEnabled('AUDIT_LOGGING')) {
      next();
      return;
    }

    const method = req.method as HttpMethod;

    // Only log mutating operations
    if (!METHOD_TO_ACTION[method]) {
      next();
      return;
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      next();
      return;
    }

    // Fire-and-forget: don't await, don't block the response
    AuditLog.create({
      actor: userId,
      action: METHOD_TO_ACTION[method],
      resource,
      resourceId: req.params.id || '',
      metadata: {
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        method: req.method,
        path: req.originalUrl,
      },
    }).catch((error) => {
      // Audit log failure should never crash the request
      logger.error('Audit log write failed:', error);
    });

    next();
  };
};
