import { companyRepository } from '../repositories/company.repository.js';
import { uploadService } from './upload.service.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/ApiError.js';
import type {
  RegisterCompanyInput,
  UpdateCompanyInput,
  VerifyCompanyInput,
} from '../validators/company.validator.js';
import type { ICompany } from '../types/models.js';
import logger from '../utils/logger.js';

/**
 * Company Service — company registration and management.
 */
export class CompanyService {
  async registerCompany(
    data: RegisterCompanyInput,
    userId: string,
  ): Promise<ICompany> {
    // Check for duplicate company names
    const existing = await companyRepository.findByName(data.companyName);
    if (existing) {
      throw new ConflictError('A company with this name already exists');
    }

    const company = await companyRepository.create({
      name: data.companyName,
      userId: userId as unknown as ICompany['userId'],
    });

    logger.info(`Company registered: "${data.companyName}" by user ${userId}`);
    return company;
  }

  async getCompaniesByUser(userId: string): Promise<ICompany[]> {
    return companyRepository.findByUserId(userId);
  }

  async getCompanyById(id: string): Promise<ICompany> {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company');
    }
    return company;
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyInput,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<ICompany> {
    const existing = await companyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Company');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You can only update your own company');
    }

    const updateData: Record<string, unknown> = { ...data };

    if (file) {
      const logoUrl = await uploadService.uploadCompanyLogo(file);
      updateData.logo = logoUrl;
    }

    const company = await companyRepository.findByIdAndUpdate(id, updateData);
    if (!company) {
      throw new NotFoundError('Company');
    }

    logger.info(`Company updated: "${company.name}"`);
    return company;
  }

  /**
   * Submit a GST number to verify a company.
   *
   * DEMO: this trusts a valid GSTIN *format* and marks the company verified.
   * Production must call the GSTN verification API to confirm the business is
   * real and active — that's an admin/KYC step, so the seam is here.
   */
  async verifyCompany(
    id: string,
    data: VerifyCompanyInput,
    userId: string,
  ): Promise<ICompany> {
    const existing = await companyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Company');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You can only verify your own company');
    }

    const company = await companyRepository.findByIdAndUpdate(id, {
      gstNumber: data.gstNumber,
      verificationStatus: 'verified',
    });
    if (!company) {
      throw new NotFoundError('Company');
    }

    logger.info(`Company verified: "${company.name}" (GST ${data.gstNumber})`);
    return company;
  }
}

export const companyService = new CompanyService();
