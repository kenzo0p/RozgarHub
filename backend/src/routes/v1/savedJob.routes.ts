import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { idempotent } from '../../middlewares/idempotency.middleware.js';
import * as savedJobController from '../../controllers/savedJob.controller.js';

const router = Router();

/**
 * Saved Job Routes (all authenticated, employee only)
 *
 * POST   /save/:id       — Save (bookmark) a job (idempotent)
 * DELETE /unsave/:id     — Unsave (remove bookmark) a job
 * GET    /               — Get all saved jobs (paginated)
 * GET    /ids            — Get saved job IDs only (for bookmark icons)
 * GET    /check/:id      — Check if a specific job is saved
 */

router.use(authenticate, authorize('employee'));

router.post('/save/:id', idempotent, savedJobController.saveJob);
router.delete('/unsave/:id', savedJobController.unsaveJob);
router.get('/', savedJobController.getSavedJobs);
router.get('/ids', savedJobController.getSavedJobIds);
router.get('/check/:id', savedJobController.checkSavedStatus);

export default router;
