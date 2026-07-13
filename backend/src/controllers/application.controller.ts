import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { applicationService } from '../services/application.service.js';
import type { AuthRequest } from '../types/express.js';

export const applyJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await applicationService.applyToJob(
    req.params.id as string,
    req.user!.id,
  );

  res.status(201).json(
    ApiResponse.created({ application }, 'Application submitted successfully'),
  );
});

export const getAppliedJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applications = await applicationService.getAppliedJobs(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ applications }, 'Applied jobs retrieved successfully'),
  );
});

export const getApplicants = asyncHandler(async (req: AuthRequest, res: Response) => {
  const job = await applicationService.getApplicantsForJob(
    req.params.id as string,
    req.user!.id,
  );

  res.status(200).json(
    ApiResponse.success({ job }, 'Applicants retrieved successfully'),
  );
});

export const updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id as string,
    req.body.status,
    req.user!.id,
    { paidAmount: req.body.paidAmount, paymentMethod: req.body.paymentMethod },
  );

  res.status(200).json(
    ApiResponse.success({ application }, 'Application status updated successfully'),
  );
});

export const confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await applicationService.confirmPayment(
    req.params.id as string,
    req.user!.id,
  );

  res.status(200).json(
    ApiResponse.success({ application }, 'Payment confirmed'),
  );
});
