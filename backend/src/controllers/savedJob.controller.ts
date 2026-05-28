import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { savedJobService } from '../services/savedJob.service.js';
import type { AuthRequest } from '../types/express.js';

export const saveJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const savedJob = await savedJobService.saveJob(req.user!.id, req.params.id as string);

  res.status(201).json(
    ApiResponse.created({ savedJob }, 'Job saved successfully'),
  );
});

export const unsaveJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  await savedJobService.unsaveJob(req.user!.id, req.params.id as string);

  res.status(200).json(
    ApiResponse.message('Job unsaved'),
  );
});

export const getSavedJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const { savedJobs, total } = await savedJobService.getSavedJobs(
    req.user!.id,
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Saved jobs retrieved',
    data: savedJobs,
    meta: { total, page, limit },
  });
});

export const checkSavedStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const isSaved = await savedJobService.isJobSaved(req.user!.id, req.params.id as string);

  res.status(200).json(
    ApiResponse.success({ isSaved }, 'Save status checked'),
  );
});

export const getSavedJobIds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const jobIds = await savedJobService.getSavedJobIds(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ jobIds }, 'Saved job IDs retrieved'),
  );
});
