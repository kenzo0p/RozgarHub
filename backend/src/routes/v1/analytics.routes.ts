import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { cacheResponse } from '../../middlewares/cache.middleware.js';
import { CACHE_TTL } from '../../utils/cache.js';
import * as analyticsController from '../../controllers/analytics.controller.js';

const router = Router();

/**
 * Analytics Routes
 *
 * Public endpoints (platform stats, trending) are cacheable.
 * Employer dashboard is authenticated + role-checked.
 *
 * GET /api/v1/analytics/platform    — Platform-wide statistics
 * GET /api/v1/analytics/trending    — Trending jobs
 * GET /api/v1/analytics/locations   — Job distribution by location
 * GET /api/v1/analytics/types       — Job distribution by type
 * GET /api/v1/analytics/salaries    — Salary distribution
 * GET /api/v1/analytics/employer    — Employer dashboard (authenticated)
 */

router.get('/platform', cacheResponse('analytics:platform', CACHE_TTL.ANALYTICS), analyticsController.getPlatformStats);
router.get('/trending', cacheResponse('analytics:trending', CACHE_TTL.ANALYTICS), analyticsController.getTrendingJobs);
router.get('/locations', cacheResponse('analytics:locations', CACHE_TTL.ANALYTICS), analyticsController.getJobsByLocation);
router.get('/types', cacheResponse('analytics:types', CACHE_TTL.ANALYTICS), analyticsController.getJobsByType);
router.get('/salaries', cacheResponse('analytics:salaries', CACHE_TTL.ANALYTICS), analyticsController.getSalaryDistribution);

// Employer-only
router.get('/employer', authenticate, authorize('employer'), analyticsController.getEmployerDashboard);

export default router;
