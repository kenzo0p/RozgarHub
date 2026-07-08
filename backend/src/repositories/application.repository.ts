import { Application } from '../models/application.model.js';
import type { IApplication, ApplicationStatus } from '../types/models.js';

export class ApplicationRepository {
  async create(applicationData: Partial<IApplication>): Promise<IApplication> {
    return Application.create(applicationData);
  }

  async findByJobAndApplicant(
    jobId: string,
    applicantId: string,
  ): Promise<IApplication | null> {
    return Application.findOne({ job: jobId, applicant: applicantId })
      .lean()
      .exec() as unknown as Promise<IApplication | null>;
  }

  async findByApplicant(applicantId: string): Promise<IApplication[]> {
    return Application.find({ applicant: applicantId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        populate: [
          { path: 'company' },
          // Employer's name/phone — used to build the contact shown to
          // accepted applicants (stripped for non-accepted in the service).
          { path: 'created_By', select: 'fullname phoneNumber' },
        ],
      })
      .lean()
      .exec() as unknown as Promise<IApplication[]>;
  }

  async findById(id: string): Promise<IApplication | null> {
    return Application.findOne({ _id: id }).exec();
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<IApplication | null> {
    return Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).exec();
  }
}

export const applicationRepository = new ApplicationRepository();
