import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { reviewService } from '../services/review.service.js';
import type { AuthRequest } from '../types/express.js';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await reviewService.createReview(req.user!.id, {
    applicationId: req.body.applicationId,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  res.status(201).json(ApiResponse.created({ review }, 'Review submitted'));
});

export const getUserReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { reviews, total, summary } = await reviewService.getUserReviews(
    req.params.userId as string,
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Reviews retrieved',
    data: { reviews, summary },
    meta: { total, page, limit },
  });
});

export const getGivenApplicationIds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applicationIds = await reviewService.getGivenApplicationIds(req.user!.id);

  res.status(200).json(ApiResponse.success({ applicationIds }, 'Given reviews retrieved'));
});
