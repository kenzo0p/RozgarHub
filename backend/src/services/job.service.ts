import { jobRepository } from '../repositories/job.repository.js';
import { NotFoundError } from '../utils/ApiError.js';
import type { CreateJobInput, JobQueryInput } from '../validators/job.validator.js';
import type { IJob } from '../types/models.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import { cacheInvalidatePattern } from '../utils/cache.js';
import { buildPaginationMeta } from '../utils/pagination.js';
import type { PaginationMeta } from '../types/api.js';
import logger from '../utils/logger.js';

/**
 * Job Service — job posting and search business logic.
 *
 * Supports:
 * - Multi-field keyword search (title + description)
 * - Location, job type, salary range, experience level filters
 * - Offset-based pagination (for page navigation)
 * - Cursor-based pagination (for infinite scroll)
 * - Sort by salary, date, relevance
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

    // Invalidate caches that would show stale data
    await Promise.all([
      cacheInvalidatePattern('jobs:*'),
      cacheInvalidatePattern('analytics:*'),
    ]);

    return job;
  }

  /**
   * Search jobs with full filtering, sorting, and offset pagination.
   *
   * Supports:
   * - keyword: matches title and description (case-insensitive regex)
   * - location: partial match on location field
   * - jobType: exact or partial match on job type
   * - salaryMin/salaryMax: salary range filter
   * - sortBy: 'createdAt' | 'salary' (default: createdAt)
   * - sortOrder: 'asc' | 'desc' (default: desc)
   * - page, limit: offset pagination
   */
  async getAllJobs(query: JobQueryInput): Promise<{
    jobs: IJob[];
    pagination: PaginationMeta;
  }> {
    const page = Math.max(1, Number(query.page) || APP_CONSTANTS.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, Number(query.limit) || APP_CONSTANTS.DEFAULT_LIMIT),
      APP_CONSTANTS.MAX_LIMIT,
    );

    const filter = this.buildJobFilter(query);

    // Determine sort field — only allow whitelisted fields
    const allowedSortFields = ['createdAt', 'salary', 'position'];
    const sortBy = allowedSortFields.includes(query.sortBy as string)
      ? (query.sortBy as string)
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' as const : 'desc' as const;

    const { jobs, total } = await jobRepository.findWithFilters(
      filter,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    const pagination = buildPaginationMeta(total, page, limit);
    return { jobs, pagination };
  }

  /**
   * Cursor-based job search — optimized for infinite scroll.
   *
   * Instead of skip/limit (which degrades at high offsets), this uses
   * the _id of the last item as a cursor. MongoDB can use the _id index
   * directly, making every "page" equally fast.
   */
  async getJobsWithCursor(query: JobQueryInput & { cursor?: string }): Promise<{
    jobs: IJob[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const limit = Math.min(
      Math.max(1, Number(query.limit) || APP_CONSTANTS.DEFAULT_LIMIT),
      APP_CONSTANTS.MAX_LIMIT,
    );

    const filter = this.buildJobFilter(query);

    return jobRepository.findWithCursor(
      filter,
      query.cursor,
      limit,
      'desc',
    );
  }

  /**
   * Build MongoDB filter object from query parameters.
   * Extracted for reuse between offset and cursor pagination.
   */
  private buildJobFilter(query: JobQueryInput): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    // Keyword search — matches title or description
    if (query.keyword) {
      filter.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { description: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    // Location filter — case-insensitive partial match
    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    // Job type filter
    if (query.jobType) {
      filter.jobType = { $regex: query.jobType, $options: 'i' };
    }

    // Salary range filter
    if (query.salaryMin !== undefined || query.salaryMax !== undefined) {
      const salaryFilter: Record<string, number> = {};
      if (query.salaryMin !== undefined && !isNaN(Number(query.salaryMin))) {
        salaryFilter.$gte = Number(query.salaryMin);
      }
      if (query.salaryMax !== undefined && !isNaN(Number(query.salaryMax))) {
        salaryFilter.$lte = Number(query.salaryMax);
      }
      if (Object.keys(salaryFilter).length > 0) {
        filter.salary = salaryFilter;
      }
    }

    return filter;
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
