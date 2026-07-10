import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createReviewSchema } from '../../validators/review.validator.js';
import * as reviewController from '../../controllers/review.controller.js';

const router = Router();

/**
 * Review Routes (all require authentication)
 *
 * POST /              — Leave a review for the other party of an accepted application
 * GET  /mine/given    — Application IDs the caller has already reviewed
 * GET  /user/:userId  — Reviews received by a user, with a rating summary
 */
router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);
router.get('/mine/given', authenticate, reviewController.getGivenApplicationIds);
router.get('/user/:userId', authenticate, reviewController.getUserReviews);

export default router;
