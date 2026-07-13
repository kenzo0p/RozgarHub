import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createDisputeSchema } from '../../validators/dispute.validator.js';
import * as disputeController from '../../controllers/dispute.controller.js';

const router = Router();

/**
 * Dispute Routes (all require authentication)
 *
 * POST /                — Raise a dispute on an engagement (either party)
 * GET  /mine            — Disputes I raised or that are against me
 * GET  /mine/raised-ids — Application IDs I've already raised a dispute on
 */
router.post('/', authenticate, validate(createDisputeSchema), disputeController.raiseDispute);
router.get('/mine', authenticate, disputeController.getMyDisputes);
router.get('/mine/raised-ids', authenticate, disputeController.getRaisedApplicationIds);

export default router;
