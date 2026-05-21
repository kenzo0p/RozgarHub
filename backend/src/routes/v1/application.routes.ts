import { Router } from 'express';
import * as applicationController from '../../controllers/application.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateStatusSchema } from '../../validators/application.validator.js';

const router = Router();

/**
 * Application Routes
 *
 * POST /apply/:id          — Apply for a job (employee only)
 * GET  /                   — Get current user's applications (employee)
 * GET  /:id/applicants     — Get applicants for a job (employer only)
 * PATCH /:id/status        — Update application status (employer only)
 *
 * RBAC: Employees apply, employers review and update status.
 */
router.post(
  '/apply/:id',
  authenticate,
  authorize('employee'),
  applicationController.applyJob,
);

router.get(
  '/',
  authenticate,
  applicationController.getAppliedJobs,
);

router.get(
  '/:id/applicants',
  authenticate,
  authorize('employer'),
  applicationController.getApplicants,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('employer'),
  validate(updateStatusSchema),
  applicationController.updateStatus,
);

export default router;
