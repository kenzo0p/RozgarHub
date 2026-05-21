import { companyRepository } from '../repositories/company.repository.js';
import { uploadService } from './upload.service.js';
import { ConflictError, NotFoundError } from '../utils/ApiError.js';
import type { RegisterCompanyInput, UpdateCompanyInput } from '../validators/company.validator.js';
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
    file?: Express.Multer.File,
  ): Promise<ICompany> {
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
}

export const companyService = new CompanyService();
