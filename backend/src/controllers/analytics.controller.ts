import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { analyticsService } from '../services/analytics.service.js';
import type { AuthRequest } from '../types/express.js';

/**
 * Analytics Controller — exposes aggregation pipeline results.
 */

export const getPlatformStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await analyticsService.getPlatformStats();

  res.status(200).json(
    ApiResponse.success(stats, 'Platform stats retrieved'),
  );
});

export const getTrendingJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const jobs = await analyticsService.getTrendingJobs(limit);

  res.status(200).json(
    ApiResponse.success({ jobs }, 'Trending jobs retrieved'),
  );
});

export const getJobsByLocation = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await analyticsService.getJobsByLocation();

  res.status(200).json(
    ApiResponse.success({ distribution: data }, 'Job distribution by location'),
  );
});

export const getJobsByType = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await analyticsService.getJobsByType();

  res.status(200).json(
    ApiResponse.success({ distribution: data }, 'Job distribution by type'),
  );
});

export const getSalaryDistribution = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await analyticsService.getSalaryDistribution();

  res.status(200).json(
    ApiResponse.success({ distribution: data }, 'Salary distribution'),
  );
});

export const getEmployerDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dashboard = await analyticsService.getEmployerDashboard(req.user!.id);

  res.status(200).json(
    ApiResponse.success(dashboard, 'Employer dashboard data retrieved'),
  );
});
