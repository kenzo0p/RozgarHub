import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async handler wrapper — eliminates try/catch boilerplate in controllers.
 *
 * BEFORE (every controller had this):
 *   export const getJobs = async (req, res) => {
 *     try { ... } catch (error) { console.log(error) }
 *   }
 *
 * AFTER:
 *   export const getJobs = asyncHandler(async (req, res) => { ... });
 *
 * Any thrown error (including ApiError subclasses) automatically gets
 * forwarded to the centralized error handling middleware via next(error).
 *
 * Interview note: This pattern is used in production Express apps to keep
 * controllers focused on business logic rather than error plumbing.
 */
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
