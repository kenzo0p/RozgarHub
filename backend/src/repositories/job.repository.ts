import { Job } from '../models/job.model.js';
import type { IJob } from '../types/models.js';
import type { FilterQuery } from 'mongoose';
import { APP_CONSTANTS } from '../utils/constants.js';

export class JobRepository {
  async create(jobData: Partial<IJob>): Promise<IJob> {
    return Job.create(jobData);
  }

  async findById(id: string): Promise<IJob | null> {
    return Job.findById(id)
      .populate({ path: 'company' })
      .populate({ path: 'applications' })
      .exec();
  }

  async findByIdLean(id: string): Promise<IJob | null> {
    return Job.findById(id).lean().exec() as Promise<IJob | null>;
  }

  /**
   * Paginated job search with keyword matching and filters.
   * Uses MongoDB text index when available, falls back to regex.
   */
  async findWithFilters(
    filter: FilterQuery<IJob>,
    page: number = APP_CONSTANTS.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.DEFAULT_LIMIT,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ jobs: IJob[]; total: number }> {
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate({ path: 'company' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Job.countDocuments(filter).exec(),
    ]);

    return { jobs: jobs as IJob[], total };
  }

  async findByCreator(userId: string): Promise<IJob[]> {
    return Job.find({ created_By: userId })
      .populate({ path: 'company' })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<IJob[]>;
  }

  async addApplication(jobId: string, applicationId: string): Promise<void> {
    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: applicationId },
    }).exec();
  }
}

export const jobRepository = new JobRepository();
