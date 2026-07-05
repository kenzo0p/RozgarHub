import { Job } from '../models/job.model.js';
import type { IJob } from '../types/models.js';
import type { FilterQuery } from 'mongoose';
import { APP_CONSTANTS } from '../utils/constants.js';
import { buildCursorFilter } from '../utils/pagination.js';

export class JobRepository {
  async create(jobData: Partial<IJob>): Promise<IJob> {
    return Job.create(jobData);
  }

  async findById(id: string): Promise<IJob | null> {
    // Deliberately does NOT populate applications: a popular job would embed
    // thousands of docs in one response, and applicant data would be exposed
    // to every viewer. Callers needing application info query it separately.
    return Job.findById(id)
      .populate({ path: 'company' })
      .exec();
  }

  async findByIdLean(id: string): Promise<IJob | null> {
    return Job.findById(id).lean().exec() as Promise<IJob | null>;
  }

  /**
   * Paginated job search with keyword matching and filters (offset-based).
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

  /**
   * Cursor-based pagination for infinite scroll.
   *
   * Why cursor > offset for infinite scroll:
   * - skip(N) scans and discards N documents → O(N) at database level
   * - cursor uses index range scan → O(log N) regardless of position
   * - No duplicate/missing items when new data is inserted between pages
   *
   * The cursor is the _id of the last item from the previous page.
   * Since ObjectIds are monotonically increasing, _id < cursor gives
   * the next page in descending order.
   */
  async findWithCursor(
    filter: FilterQuery<IJob>,
    cursor: string | undefined,
    limit: number = APP_CONSTANTS.DEFAULT_LIMIT,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ jobs: IJob[]; hasMore: boolean; nextCursor: string | null }> {
    const cursorFilter = buildCursorFilter(cursor, sortOrder);
    const combinedFilter = { ...filter, ...cursorFilter };
    const sort: Record<string, 1 | -1> = { _id: sortOrder === 'asc' ? 1 : -1 };

    // Fetch one extra to determine if there are more pages
    const jobs = await Job.find(combinedFilter)
      .populate({ path: 'company' })
      .sort(sort)
      .limit(limit + 1)
      .lean()
      .exec() as IJob[];

    const hasMore = jobs.length > limit;
    if (hasMore) jobs.pop(); // Remove the extra item

    const nextCursor = hasMore && jobs.length > 0
      ? (jobs[jobs.length - 1]._id as unknown as { toString(): string }).toString()
      : null;

    return { jobs, hasMore, nextCursor };
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

  /**
   * Count jobs matching a filter — used for analytics.
   */
  async countByFilter(filter: FilterQuery<IJob>): Promise<number> {
    return Job.countDocuments(filter).exec();
  }
}

export const jobRepository = new JobRepository();
