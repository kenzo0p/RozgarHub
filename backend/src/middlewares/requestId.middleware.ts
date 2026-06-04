import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import crypto from 'crypto';

/**
 * Request ID Middleware — assigns a unique ID to each request for log correlation.
 *
 * Why?
 * In production, thousands of requests are processed concurrently.
 * Without request IDs, it's impossible to trace a single request across
 * multiple log entries (e.g., middleware log → service log → DB query log).
 *
 * How it works:
 * 1. Each incoming request gets a unique ID (UUID v4)
 * 2. The ID is stored in AsyncLocalStorage (Node.js thread-local equivalent)
 * 3. The logger reads this ID and includes it in every log entry
 * 4. The ID is also returned in the response header (X-Request-ID)
 *
 * Client usage: If a user reports an error, they can include the X-Request-ID
 * from the response header, and we can grep all logs for that request.
 *
 * Interview note: This is the distributed tracing approach used by all FAANG companies.
 * At scale, you'd use OpenTelemetry or AWS X-Ray for full distributed tracing.
 */

// AsyncLocalStorage — Node.js equivalent of thread-local storage
// Each async context (request) gets its own storage that's accessible
// anywhere in the call chain without passing it through every function.
export const requestContext = new AsyncLocalStorage<Map<string, string>>();

/**
 * Get the current request ID from async context.
 * Returns 'unknown' if called outside a request context (e.g., startup logs).
 */
export function getRequestId(): string {
  const store = requestContext.getStore();
  return store?.get('requestId') || 'unknown';
}

/**
 * Middleware that wraps each request in an AsyncLocalStorage context
 * with a unique request ID.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Accept client-provided ID (for distributed tracing) or generate one
  const requestId =
    (req.headers['x-request-id'] as string) || crypto.randomUUID();

  // Set response header so the client can reference this request
  res.setHeader('X-Request-ID', requestId);

  // Run the rest of the request in an async context with the ID
  const store = new Map<string, string>();
  store.set('requestId', requestId);

  requestContext.run(store, () => {
    next();
  });
};
