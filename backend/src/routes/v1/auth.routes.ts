import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { singleUpload } from '../../middlewares/upload.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { auditLog } from '../../middlewares/audit.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../validators/auth.validator.js';

const router = Router();

/**
 * Auth Routes
 *
 * POST /register        — Create a new account
 * POST /login           — Authenticate and receive dual token cookies
 * POST /logout          — Revoke refresh token, clear cookies
 * POST /logout-all      — Revoke all sessions, clear cookies
 * POST /refresh         — Exchange refresh token for new token pair
 * POST /forgot-password — Generate password reset token
 * POST /reset-password  — Reset password using valid token
 * GET  /sessions        — List active sessions
 */
router.post(
  '/register',
  authRateLimiter,
  singleUpload,
  validate(registerSchema),
  authController.register,
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login,
);

router.post('/logout', authController.logout);

router.post('/logout-all', authenticate, authController.logoutAll);

router.post('/refresh', authRateLimiter, authController.refresh);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  authRateLimiter,
  validate(resetPasswordSchema),
  auditLog('User'),
  authController.resetPassword,
);

router.get('/sessions', authenticate, authController.getSessions);

export default router;
