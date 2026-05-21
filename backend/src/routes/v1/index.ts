import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import jobRoutes from './job.routes.js';
import companyRoutes from './company.routes.js';
import applicationRoutes from './application.routes.js';

const router = Router();

/**
 * V1 API Route Aggregator
 *
 * All v1 endpoints are mounted here, then this router is mounted at /api/v1
 * in the main routes/index.ts.
 *
 * Backward compatibility: The original endpoints used paths like:
 *   /api/v1/user/register, /api/v1/job/post, etc.
 *
 * New structure splits auth from user:
 *   /api/v1/auth/register, /api/v1/auth/login, /api/v1/auth/logout
 *   /api/v1/user/profile, /api/v1/user/profile/update
 *
 * For backward compatibility during frontend migration, the old /user routes
 * for auth are still supported via the auth route mounting.
 */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/job', jobRoutes);
router.use('/company', companyRoutes);
router.use('/application', applicationRoutes);

export default router;
