import { jobRepository } from '../repositories/job.repository.js';
import { NotFoundError, ValidationError } from '../utils/ApiError.js';
import type { CreateJobInput, JobQueryInput } from '../validators/job.validator.js';
import type { IJob } from '../types/models.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Job Service — job posting and search business logic.
 */
export class JobService {
  async createJob(data: CreateJobInput, userId: string): Promise<IJob> {
    const job = await jobRepository.create({
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      salary: Number(data.salary),
      location: data.location,
      jobType: data.jobType,
      position: Number(data.position),
      experienceLevel: Number(data.experience),
      company: data.companyId as unknown as IJob['company'],
      created_By: userId as unknown as IJob['created_By'],
    });

    logger.info(`Job created: "${job.title}" by user ${userId}`);
    return job;
  }

  /**
   * Search jobs with keyword filtering and pagination.
   *
   * The original loaded ALL jobs with no pagination — problematic at scale.
   * Now supports keyword search across title+description, with configurable
   * page size and sorting.
   */
  async getAllJobs(query: JobQueryInput): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(query.page) || APP_CONSTANTS.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, Number(query.limit) || APP_CONSTANTS.DEFAULT_LIMIT),
      APP_CONSTANTS.MAX_LIMIT,
    );

    // Build filter from query params
    const filter: Record<string, unknown> = {};

    if (query.keyword) {
      filter.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { description: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    if (query.jobType) {
      filter.jobType = { $regex: query.jobType, $options: 'i' };
    }

    const { jobs, total } = await jobRepository.findWithFilters(
      filter,
      page,
      limit,
    );

    return { jobs, total, page, limit };
  }

  async getJobById(id: string): Promise<IJob> {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError('Job');
    }
    return job;
  }

  async getJobsByCreator(userId: string): Promise<IJob[]> {
    return jobRepository.findByCreator(userId);
  }
}

export const jobService = new JobService();
