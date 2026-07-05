import { Router } from 'express';
import * as jobController from '../../controllers/job.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createJobSchema, jobQuerySchema } from '../../validators/job.validator.js';
import { cacheResponse } from '../../middlewares/cache.middleware.js';
import { CACHE_TTL } from '../../utils/cache.js';
import { auditLog } from '../../middlewares/audit.middleware.js';
import { idempotent } from '../../middlewares/idempotency.middleware.js';

const router = Router();

/**
 * Job Routes
 *
 * POST /             — Create a job posting (employer only)
 * GET  /             — Search/list all jobs (public, paginated, cached)
 * GET  /admin        — Get jobs created by current employer (employer only)
 * GET  /:id          — Get single job by ID (authenticated, cached)
 *
 * Caching: Job listings are cached for 60s (high-traffic, changes infrequently).
 * Individual job details are cached for 300s.
 * Cache is invalidated on job creation.
 */
router.post(
  '/',
  authenticate,
  authorize('employer'),
  idempotent,
  validate(createJobSchema),
  auditLog('Job'),
  jobController.postJob,
);

router.get(
  '/',
  validate(jobQuerySchema, 'query'),
  cacheResponse('jobs:list', CACHE_TTL.JOB_LISTING),
  jobController.getAllJobs,
);

// Cursor-based endpoint for infinite scroll (no page numbers, uses cursor token)
router.get(
  '/cursor',
  validate(jobQuerySchema, 'query'),
  cacheResponse('jobs:cursor', CACHE_TTL.JOB_LISTING),
  jobController.getJobsCursor,
);

router.get(
  '/admin',
  authenticate,
  authorize('employer'),
  jobController.getAdminJobs,
);

// No response cache here: the payload includes viewer-specific data
// (isApplied), so a shared cache would leak one user's state to another.
router.get(
  '/:id',
  authenticate,
  jobController.getJobById,
);

export default router;
