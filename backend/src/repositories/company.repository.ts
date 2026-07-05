import { Company } from '../models/company.model.js';
import type { ICompany } from '../types/models.js';
import type { UpdateQuery } from 'mongoose';

export class CompanyRepository {
  async create(companyData: Partial<ICompany>): Promise<ICompany> {
    return Company.create(companyData);
  }

  async findById(id: string): Promise<ICompany | null> {
    return Company.findById(id).lean().exec() as unknown as Promise<ICompany | null>;
  }

  async findByName(name: string): Promise<ICompany | null> {
    return Company.findOne({ name }).lean().exec() as unknown as Promise<ICompany | null>;
  }

  async findByUserId(userId: string): Promise<ICompany[]> {
    return Company.find({ userId }).lean().exec() as unknown as Promise<ICompany[]>;
  }

  async findByIdAndUpdate(
    id: string,
    update: UpdateQuery<ICompany>,
  ): Promise<ICompany | null> {
    return Company.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec() as unknown as Promise<ICompany | null>;
  }
}

export const companyRepository = new CompanyRepository();
