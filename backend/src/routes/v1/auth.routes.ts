import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { singleUpload } from '../../middlewares/upload.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { registerSchema, loginSchema } from '../../validators/auth.validator.js';

const router = Router();

/**
 * Auth Routes
 *
 * POST /register — Create a new account (rate limited, file upload for profile photo)
 * POST /login    — Authenticate and receive JWT cookie (rate limited)
 * POST /logout   — Clear JWT cookie (requires auth)
 *
 * Rate limiting is stricter on auth endpoints to prevent brute-force attacks.
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

router.post('/logout', authenticate, authController.logout);

export default router;
