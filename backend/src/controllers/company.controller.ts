import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { companyService } from '../services/company.service.js';
import type { AuthRequest } from '../types/express.js';

export const registerCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const company = await companyService.registerCompany(req.body, req.user!.id);

  res.status(201).json(
    ApiResponse.created({ company }, 'Company registered successfully'),
  );
});

export const getCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const companies = await companyService.getCompaniesByUser(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ companies }, 'Companies retrieved successfully'),
  );
});

export const getCompanyById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const company = await companyService.getCompanyById(req.params.id as string);

  res.status(200).json(
    ApiResponse.success({ company }, 'Company retrieved successfully'),
  );
});

export const updateCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const company = await companyService.updateCompany(
    req.params.id as string,
    req.body,
    req.user!.id,
    req.file,
  );

  res.status(200).json(
    ApiResponse.success({ company }, 'Company updated successfully'),
  );
});

export const verifyCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const company = await companyService.verifyCompany(
    req.params.id as string,
    req.body,
    req.user!.id,
  );

  res.status(200).json(
    ApiResponse.success({ company }, 'Company verified successfully'),
  );
});
