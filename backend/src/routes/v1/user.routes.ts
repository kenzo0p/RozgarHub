import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { singleUpload } from '../../middlewares/upload.middleware.js';
import { updateProfileSchema, updateLanguageSchema } from '../../validators/auth.validator.js';

const router = Router();

/**
 * User Routes (all require authentication)
 *
 * GET   /profile        — Get current user's profile
 * PUT   /profile/update — Update profile (with optional resume upload)
 * PATCH /language       — Update preferred language (notifications/SMS)
 */
router.get('/profile', authenticate, userController.getProfile);

router.put(
  '/profile/update',
  authenticate,
  singleUpload,
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.patch(
  '/language',
  authenticate,
  validate(updateLanguageSchema),
  userController.updateLanguage,
);

export default router;
