import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { cacheResponse } from '../../middlewares/cache.middleware.js';
import { CACHE_TTL } from '../../utils/cache.js';
import * as recommendationController from '../../controllers/recommendation.controller.js';

const router = Router();

/**
 * Recommendation Routes
 *
 * GET /api/v1/recommendations/jobs          — Personalized job recommendations for authenticated user
 * GET /api/v1/recommendations/similar/:id   — Jobs similar to a given job
 */

router.get(
  '/jobs',
  authenticate,
  recommendationController.getRecommendedJobs,
);

router.get(
  '/similar/:id',
  cacheResponse('recs:similar', CACHE_TTL.RECOMMENDATIONS),
  recommendationController.getSimilarJobs,
);

export default router;
