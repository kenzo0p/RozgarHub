import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { singleUpload, workPhotosUpload } from '../../middlewares/upload.middleware.js';
import {
  updateProfileSchema,
  updateLanguageSchema,
  verifyIdentitySchema,
} from '../../validators/auth.validator.js';
import { addCredentialSchema } from '../../validators/credential.validator.js';

const router = Router();

/**
 * User Routes (all require authentication)
 *
 * GET   /profile        — Get current user's profile
 * PUT   /profile/update — Update profile (with optional resume upload)
 * PATCH /language       — Update preferred language (notifications/SMS)
 * POST  /verify         — Verify identity via Aadhaar (worker only)
 * GET   /workers        — Search/discover workers (employer only)
 */
router.get('/profile', authenticate, userController.getProfile);

router.get(
  '/workers',
  authenticate,
  authorize('employer'),
  userController.searchWorkers,
);

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

router.post(
  '/verify',
  authenticate,
  authorize('employee'),
  validate(verifyIdentitySchema),
  userController.verifyIdentity,
);

router.post(
  '/work-photos',
  authenticate,
  authorize('employee'),
  workPhotosUpload,
  userController.addWorkPhotos,
);

router.delete(
  '/work-photos',
  authenticate,
  authorize('employee'),
  userController.removeWorkPhoto,
);

router.post(
  '/credentials',
  authenticate,
  authorize('employee'),
  singleUpload,
  validate(addCredentialSchema),
  userController.addCredential,
);

router.delete(
  '/credentials/:id',
  authenticate,
  authorize('employee'),
  userController.removeCredential,
);

export default router;
