import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { disputeService } from '../services/dispute.service.js';
import type { AuthRequest } from '../types/express.js';

export const raiseDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dispute = await disputeService.raiseDispute(req.user!.id, {
    applicationId: req.body.applicationId,
    reason: req.body.reason,
    description: req.body.description,
  });

  res.status(201).json(ApiResponse.created({ dispute }, 'Issue reported'));
});

export const getMyDisputes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const disputes = await disputeService.getMyDisputes(req.user!.id);
  res.status(200).json(ApiResponse.success({ disputes }, 'Disputes retrieved'));
});

export const getRaisedApplicationIds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applicationIds = await disputeService.getRaisedApplicationIds(req.user!.id);
  res.status(200).json(ApiResponse.success({ applicationIds }, 'Raised disputes retrieved'));
});
