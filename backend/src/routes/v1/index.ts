import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import jobRoutes from './job.routes.js';
import companyRoutes from './company.routes.js';
import applicationRoutes from './application.routes.js';
import analyticsRoutes from './analytics.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import notificationRoutes from './notification.routes.js';
import savedJobRoutes from './savedJob.routes.js';
import reviewRoutes from './review.routes.js';
import disputeRoutes from './dispute.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

/**
 * V1 API Route Aggregator
 *
 * Route groups:
 *   /auth            — Authentication (login, register, logout, refresh, password reset)
 *   /user            — User profile management
 *   /job             — Job CRUD + search (offset + cursor pagination)
 *   /company         — Company CRUD
 *   /application     — Job applications
 *   /analytics       — Platform & employer analytics (aggregation pipelines)
 *   /recommendations — Personalized job recommendations (TF-IDF matching)
 *   /notifications   — In-app notifications (event-driven)
 *   /saved-jobs      — Job bookmarking (employee only)
 *   /reviews         — Post-engagement ratings & reviews (both directions)
 *   /health          — Health checks (liveness + readiness)
 */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/job', jobRoutes);
router.use('/company', companyRoutes);
router.use('/application', applicationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/reviews', reviewRoutes);
router.use('/disputes', disputeRoutes);
router.use('/health', healthRoutes);

export default router;
