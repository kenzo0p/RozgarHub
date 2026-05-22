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
