import { Router, Request, Response } from 'express';
import v1Routes from './v1/index.js';
import { APP_CONSTANTS } from '../utils/constants.js';

const router = Router();

/**
 * API Versioning Router
 *
 * All API routes are prefixed with /api/v1, /api/v2, etc.
 * This allows running multiple API versions simultaneously during migrations.
 *
 * Adding a new version:
 *   1. Create routes/v2/ directory
 *   2. router.use('/v2', v2Routes)
 *   3. Frontend gradually migrates, old version stays up
 */
router.use(`/${APP_CONSTANTS.CURRENT_API_VERSION}`, v1Routes);

// Health check at API root
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'RozgarHub API is running',
    version: APP_CONSTANTS.CURRENT_API_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
