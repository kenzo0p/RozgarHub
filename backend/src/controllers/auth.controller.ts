import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import type { AuthRequest } from '../types/express.js';

/**
 * Auth Controller — HTTP layer for authentication.
 *
 * Controllers are now THIN — they only:
 * 1. Extract data from the request
 * 2. Call the appropriate service method
 * 3. Format and send the HTTP response
 *
 * All business logic lives in the service layer.
 * All validation is handled by middleware (Zod schemas).
 * All error formatting is handled by the error middleware.
 */

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.register(req.body, req.file);

  res.status(201).json(
    ApiResponse.created(result, 'Account created successfully'),
  );
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, user } = await authService.login(req.body);

  // Set JWT in httpOnly cookie — prevents XSS from accessing the token
  res
    .status(200)
    .cookie(APP_CONSTANTS.COOKIE_NAME, token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,      // Fixed: was 'httpsOnly' in original (a bug)
      sameSite: 'strict',  // CSRF protection
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    })
    .json(ApiResponse.success({ user }, `Welcome back, ${user.fullname}`));
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res
    .status(200)
    .cookie(APP_CONSTANTS.COOKIE_NAME, '', { maxAge: 0, httpOnly: true })
    .json(ApiResponse.message('Logged out successfully'));
});
