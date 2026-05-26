import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { recommendationService } from '../services/recommendation.service.js';
import type { AuthRequest } from '../types/express.js';

/**
 * Recommendation Controller — personalized job recommendations.
 */

export const getRecommendedJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const recommendations = await recommendationService.getRecommendedJobs(
    req.user!.id,
    limit,
  );

  res.status(200).json(
    ApiResponse.success(
      { recommendations },
      'Job recommendations retrieved',
    ),
  );
});

export const getSimilarJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const similarJobs = await recommendationService.getSimilarJobs(
    req.params.id as string,
    limit,
  );

  res.status(200).json(
    ApiResponse.success(
      { similarJobs },
      'Similar jobs retrieved',
    ),
  );
});
