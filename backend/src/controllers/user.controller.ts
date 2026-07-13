import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { userService } from '../services/user.service.js';
import type { AuthRequest } from '../types/express.js';

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await userService.updateProfile(userId, req.body, req.file);

  res.status(200).json(
    ApiResponse.success({ user }, 'Profile updated successfully'),
  );
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await userService.getProfile(userId);

  res.status(200).json(
    ApiResponse.success({ user }, 'Profile retrieved successfully'),
  );
});

export const updateLanguage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await userService.updateLanguage(userId, req.body.language);

  res.status(200).json(
    ApiResponse.success({ user }, 'Language preference updated'),
  );
});

export const verifyIdentity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await userService.verifyIdentity(userId, req.body.idNumber);

  res.status(200).json(
    ApiResponse.success({ user }, 'Identity verified successfully'),
  );
});

export const searchWorkers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const { workers, total } = await userService.searchWorkers(
    {
      q: (req.query.q as string) || undefined,
      trade: (req.query.trade as string) || undefined,
      location: (req.query.location as string) || undefined,
      availableOnly: req.query.availableOnly === 'true',
      verifiedOnly: req.query.verifiedOnly === 'true',
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    },
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Workers retrieved',
    data: workers,
    meta: { total, page, limit },
  });
});
