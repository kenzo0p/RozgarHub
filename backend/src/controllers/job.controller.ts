import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { jobService } from '../services/job.service.js';
import type { AuthRequest } from '../types/express.js';

export const postJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const job = await jobService.createJob(req.body, req.user!.id);

  res.status(201).json(
    ApiResponse.created({ job }, 'Job created successfully'),
  );
});

export const getAllJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobs, total, page, limit } = await jobService.getAllJobs(req.query as Record<string, string>);

  res.status(200).json(
    ApiResponse.paginated(jobs, total, page, limit, 'Jobs retrieved successfully'),
  );
});

export const getJobById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const job = await jobService.getJobById(req.params.id as string);

  res.status(200).json(
    ApiResponse.success({ job }, 'Job retrieved successfully'),
  );
});

export const getAdminJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const jobs = await jobService.getJobsByCreator(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ jobs }, 'Jobs retrieved successfully'),
  );
});
