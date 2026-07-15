import { jobRepository } from '../repositories/job.repository.js';
import { companyRepository } from '../repositories/company.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { Job } from '../models/job.model.js';
import { Report } from '../models/report.model.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/ApiError.js';
import type { CreateJobInput, JobQueryInput, ReportJobInput } from '../validators/job.validator.js';
import type { IJob } from '../types/models.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import { cacheInvalidatePattern } from '../utils/cache.js';
import { buildPaginationMeta } from '../utils/pagination.js';
import { geocodeLocation } from '../utils/geocode.js';
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
// Escape regex metacharacters in user input before building $regex filters.
// Prevents ReDoS and broken searches for terms like "C++" or "(remote)".
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class JobService {
  async createJob(data: CreateJobInput, userId: string): Promise<IJob> {
    // The company must exist and belong to the posting employer
    const company = await companyRepository.findById(data.companyId);
    if (!company) {
      throw new NotFoundError('Company');
    }
    if (company.userId.toString() !== userId) {
      throw new ForbiddenError('You can only post jobs for your own company');
    }

    // Resolve the location string to coordinates for "near me" search.
    // Unknown cities save without geo — still text-searchable, just not
    // in radius results.
    const coords = geocodeLocation(data.location);

    const job = await jobRepository.create({
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      salary: Number(data.salary),
      wageType: data.wageType,
      location: data.location,
      geo: coords ? { type: 'Point', coordinates: coords } : undefined,
      jobType: data.jobType,
      requiredCredential: data.requiredCredential,
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
    // Never surface flagged (repeatedly reported) jobs in public listings.
    const filter: Record<string, unknown> = { flagged: { $ne: true } };

    // Keyword search — matches title or description
    if (query.keyword) {
      const keyword = escapeRegex(query.keyword);
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Location filter — case-insensitive partial match
    if (query.location) {
      filter.location = { $regex: escapeRegex(query.location), $options: 'i' };
    }

    // Job type filter
    if (query.jobType) {
      filter.jobType = { $regex: escapeRegex(query.jobType), $options: 'i' };
    }

    // Wage type filter (daily / monthly / etc.)
    if (query.wageType) {
      filter.wageType = query.wageType;
    }

    // Proximity filter — jobs within `radius` km of the searcher. Uses the
    // 2dsphere index via $geoWithin/$centerSphere (which, unlike $near, can
    // be combined with an explicit sort). Earth radius ≈ 6378 km.
    if (
      query.lat !== undefined &&
      query.lng !== undefined &&
      !isNaN(Number(query.lat)) &&
      !isNaN(Number(query.lng))
    ) {
      const radiusKm = !isNaN(Number(query.radius)) && Number(query.radius) > 0
        ? Number(query.radius)
        : 25; // sensible default for local blue-collar work
      filter.geo = {
        $geoWithin: {
          $centerSphere: [[Number(query.lng), Number(query.lat)], radiusKm / 6378],
        },
      };
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

  /**
   * Job detail for a specific viewer.
   *
   * Computes `isApplied` server-side instead of shipping the full
   * applications array to the client (which leaked applicant IDs to
   * every authenticated user and grew unbounded with popular jobs).
   */
  async getJobById(id: string, viewerId?: string): Promise<{
    job: IJob;
    totalApplications: number;
    isApplied: boolean;
  }> {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError('Job');
    }

    const totalApplications = job.applications?.length ?? 0;

    let isApplied = false;
    if (viewerId) {
      const existing = await applicationRepository.findByJobAndApplicant(id, viewerId);
      isApplied = !!existing;
    }

    return { job, totalApplications, isApplied };
  }

  async getJobsByCreator(userId: string): Promise<IJob[]> {
    return jobRepository.findByCreator(userId);
  }

  /**
   * Report a job as suspicious. One report per user per job; once the report
   * count crosses the threshold the job is flagged and hidden from listings.
   */
  async reportJob(
    jobId: string,
    reporterId: string,
    data: ReportJobInput,
  ): Promise<{ reported: true; flagged: boolean }> {
    const job = await jobRepository.findByIdLean(jobId);
    if (!job) {
      throw new NotFoundError('Job');
    }

    try {
      await Report.create({
        job: jobId,
        reporter: reporterId,
        reason: data.reason,
        note: data.note,
      });
    } catch (error) {
      // Duplicate key = this user already reported this job
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictError('You have already reported this job');
      }
      throw error;
    }

    const reportCount = await Report.countDocuments({ job: jobId });
    const flagged = reportCount >= APP_CONSTANTS.REPORT_FLAG_THRESHOLD;

    await Job.findByIdAndUpdate(jobId, { reportCount, flagged });

    if (flagged) {
      logger.warn(`🚩 Job ${jobId} flagged after ${reportCount} reports`);
      await cacheInvalidatePattern('jobs:*');
    }

    return { reported: true, flagged };
  }
}

export const jobService = new JobService();
