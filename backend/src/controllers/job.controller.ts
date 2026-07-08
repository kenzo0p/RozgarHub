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

/**
 * Offset-based job listing with full pagination metadata.
 * Used by traditional page navigation UIs.
 */
export const getAllJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobs, pagination } = await jobService.getAllJobs(
    req.query as Record<string, string>,
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Jobs retrieved successfully',
    data: jobs,
    pagination,
  });
});

/**
 * Cursor-based job listing for infinite scroll.
 * Returns jobs + nextCursor + hasMore instead of page numbers.
 */
export const getJobsCursor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobs, nextCursor, hasMore } = await jobService.getJobsWithCursor(
    req.query as Record<string, string>,
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Jobs retrieved successfully',
    data: jobs,
    cursor: {
      next: nextCursor,
      hasMore,
    },
  });
});

export const getJobById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { job, totalApplications, isApplied } = await jobService.getJobById(
    req.params.id as string,
    req.user?.id,
  );

  res.status(200).json(
    ApiResponse.success(
      { job, totalApplications, isApplied },
      'Job retrieved successfully',
    ),
  );
});

export const getAdminJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const jobs = await jobService.getJobsByCreator(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ jobs }, 'Jobs retrieved successfully'),
  );
});

export const reportJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await jobService.reportJob(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  res.status(201).json(
    ApiResponse.success(result, 'Thanks — this job has been reported for review.'),
  );
});
