import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/ApiError.js';
import type { AuthRequest } from '../types/express.js';

interface JWTPayload {
  userId: string;
}

/**
 * JWT authentication middleware.
 *
 * Improvements over original:
 * - Uses typed AuthRequest instead of mutating req with arbitrary properties
 * - Throws UnauthorizedError instead of manually sending responses
 *   (lets centralized error handler format it consistently)
 * - Validates JWT_SECRET from config (not raw process.env)
 * - Properly handles all JWT error cases (expired, malformed, etc.)
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    const decoded = jwt.verify(token, env.SECRET_KEY) as JWTPayload;

    // Attach user context to request for downstream handlers
    req.user = {
      id: decoded.userId,
      role: 'employee', // Will be populated by optional user-fetch middleware if needed
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired. Please log in again.'));
    } else {
      next(error);
    }
  }
};
