import { Router } from 'express';
import * as jobController from '../../controllers/job.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createJobSchema, jobQuerySchema } from '../../validators/job.validator.js';

const router = Router();

/**
 * Job Routes
 *
 * POST /             — Create a job posting (employer only)
 * GET  /             — Search/list all jobs (public, paginated)
 * GET  /admin        — Get jobs created by current employer (employer only)
 * GET  /:id          — Get single job by ID (authenticated)
 *
 * RBAC: Only employers can create jobs. Job listing is public for SEO.
 */
router.post(
  '/',
  authenticate,
  authorize('employer'),
  validate(createJobSchema),
  jobController.postJob,
);

router.get(
  '/',
  validate(jobQuerySchema, 'query'),
  jobController.getAllJobs,
);

router.get(
  '/admin',
  authenticate,
  authorize('employer'),
  jobController.getAdminJobs,
);

router.get(
  '/:id',
  authenticate,
  jobController.getJobById,
);

export default router;
