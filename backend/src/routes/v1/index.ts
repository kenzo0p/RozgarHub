import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import jobRoutes from './job.routes.js';
import companyRoutes from './company.routes.js';
import applicationRoutes from './application.routes.js';
import analyticsRoutes from './analytics.routes.js';
import recommendationRoutes from './recommendation.routes.js';

const router = Router();

/**
 * V1 API Route Aggregator
 *
 * All v1 endpoints are mounted here, then this router is mounted at /api/v1
 * in the main routes/index.ts.
 *
 * Route groups:
 *   /auth            — Authentication (login, register, logout)
 *   /user            — User profile management
 *   /job             — Job CRUD + search
 *   /company         — Company CRUD
 *   /application     — Job applications
 *   /analytics       — Platform & employer analytics (aggregation pipelines)
 *   /recommendations — Personalized job recommendations (TF-IDF matching)
 */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/job', jobRoutes);
router.use('/company', companyRoutes);
router.use('/application', applicationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/recommendations', recommendationRoutes);

export default router;
