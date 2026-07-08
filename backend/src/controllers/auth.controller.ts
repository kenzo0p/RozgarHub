import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import { UnauthorizedError } from '../utils/ApiError.js';
import type { AuthRequest } from '../types/express.js';
import { env } from '../config/env.js';

/**
 * Auth Controller — HTTP layer for authentication.
 *
 * Handles cookie management for the dual-token strategy:
 * - Access token: httpOnly cookie, short-lived (15 min)
 * - Refresh token: httpOnly cookie, long-lived (7 days)
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: env.NODE_ENV === 'production',
  path: '/',
};

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.register(req.body, req.file);

  res.status(201).json(
    ApiResponse.created(result, 'Account created successfully'),
  );
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const meta = {
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
  };

  const { accessToken, refreshToken, user } = await authService.login(req.body, meta);

  res
    .status(200)
    .cookie(APP_CONSTANTS.ACCESS_COOKIE_NAME, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie(APP_CONSTANTS.REFRESH_COOKIE_NAME, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: APP_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
    })
    .json(ApiResponse.success({ user }, `Welcome back, ${user.fullname}`));
});

/**
 * Request a phone-login OTP.
 */
export const requestOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.requestOtp(req.body.phoneNumber);

  res.status(200).json(
    ApiResponse.success(result, 'If the number is valid, a verification code has been sent.'),
  );
});

/**
 * Verify a phone-login OTP — logs in an existing user or creates a
 * phone-only account, then sets the dual-token cookies.
 */
export const verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const meta = {
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
  };

  const { accessToken, refreshToken, user, isNewUser } = await authService.verifyOtp(
    req.body,
    meta,
  );

  res
    .status(isNewUser ? 201 : 200)
    .cookie(APP_CONSTANTS.ACCESS_COOKIE_NAME, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    })
    .cookie(APP_CONSTANTS.REFRESH_COOKIE_NAME, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: APP_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
    })
    .json(ApiResponse.success({ user, isNewUser }, `Welcome, ${user.fullname}`));
});

/**
 * Refresh endpoint — exchange refresh token for new token pair.
 *
 * Flow:
 * 1. Extract refresh token from cookie
 * 2. Validate and rotate (old token revoked, new pair issued)
 * 3. Set new cookies
 */
export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshTokenValue = req.cookies[APP_CONSTANTS.REFRESH_COOKIE_NAME];

  if (!refreshTokenValue) {
    throw new UnauthorizedError('No refresh token provided');
  }

  const meta = {
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
  };

  const { accessToken, refreshToken } = await authService.refreshTokens(
    refreshTokenValue,
    meta,
  );

  res
    .status(200)
    .cookie(APP_CONSTANTS.ACCESS_COOKIE_NAME, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    })
    .cookie(APP_CONSTANTS.REFRESH_COOKIE_NAME, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: APP_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
    })
    .json(ApiResponse.message('Tokens refreshed successfully'));
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshTokenValue = req.cookies[APP_CONSTANTS.REFRESH_COOKIE_NAME];

  // Revoke the refresh token in DB
  await authService.logout(refreshTokenValue);

  // Clear both cookies
  res
    .status(200)
    .cookie(APP_CONSTANTS.ACCESS_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    .cookie(APP_CONSTANTS.REFRESH_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    .json(ApiResponse.message('Logged out successfully'));
});

export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.logoutAll(req.user!.id);

  res
    .status(200)
    .cookie(APP_CONSTANTS.ACCESS_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    .cookie(APP_CONSTANTS.REFRESH_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    .json(ApiResponse.message('Logged out from all devices'));
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);

  // Identical response whether or not the email exists (no enumeration).
  // The token itself is only exposed in development for manual testing —
  // in production it would be emailed (see auth.service.forgotPassword).
  const data =
    env.NODE_ENV === 'development' && result
      ? { resetToken: result.resetToken, expiresAt: result.expiresAt }
      : {};

  res.status(200).json(
    ApiResponse.success(
      data,
      'If an account with this email exists, a password reset link has been sent.',
    ),
  );
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);

  // Clear any existing auth cookies
  res
    .status(200)
    .cookie(APP_CONSTANTS.ACCESS_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    .cookie(APP_CONSTANTS.REFRESH_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    .json(ApiResponse.message('Password reset successful. Please log in with your new password.'));
});

export const getSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await authService.getActiveSessions(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ sessions }, 'Active sessions retrieved'),
  );
});
