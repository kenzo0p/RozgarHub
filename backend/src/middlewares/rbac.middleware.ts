import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import type { AuthRequest } from '../types/express.js';
import type { UserRole } from '../types/models.js';

/**
 * Role-Based Access Control (RBAC) middleware.
 *
 * Used after authenticate middleware to restrict endpoints to specific roles.
 * Example: authorize('employer') — only employers can post jobs.
 *
 * This middleware also fetches the user's actual role from DB to prevent
 * privilege escalation if a token was issued before a role change.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new ForbiddenError('Access denied');
      }

      // Fetch current role from DB (not just from token) for security
      const user = await User.findById(req.user.id).select('role').lean();
      if (!user) {
        throw new ForbiddenError('User not found');
      }

      // Update request context with actual role from DB
      req.user.role = user.role;

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError(
          `Role '${user.role}' is not authorized to access this resource`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
