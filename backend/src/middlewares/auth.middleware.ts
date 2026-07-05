import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import { UnauthorizedError } from '../utils/ApiError.js';
import type { AuthRequest } from '../types/express.js';

interface JWTPayload {
  userId: string;
}

/**
 * JWT authentication middleware.
 *
 * Updated for dual-token strategy:
 * 1. First tries the access token cookie (short-lived, 15 min)
 * 2. Falls back to the legacy 'token' cookie (backward compatibility with frontend)
 *
 * When the access token expires, the frontend should call POST /auth/refresh
 * which uses the refresh token cookie to issue a new access token.
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Try new access token cookie first, fall back to legacy cookie name
    const token =
      req.cookies[APP_CONSTANTS.ACCESS_COOKIE_NAME] ||
      req.cookies.token; // Backward compatibility

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    const decoded = jwt.verify(token, env.SECRET_KEY) as JWTPayload;

    // Attach user context to request for downstream handlers.
    // Role is intentionally NOT set here — the JWT doesn't carry it, and a
    // fake default invites bugs. authorize() populates it from the DB.
    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired. Please refresh your session.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};
