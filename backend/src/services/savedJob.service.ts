import { SavedJob, ISavedJob } from '../models/savedJob.model.js';
import { Job } from '../models/job.model.js';
import { ConflictError, NotFoundError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Saved Job Service — bookmark management for employees.
 */
export class SavedJobService {
  /**
   * Save (bookmark) a job.
   */
  async saveJob(userId: string, jobId: string): Promise<ISavedJob> {
    // Verify job exists
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      throw new NotFoundError('Job');
    }

    try {
      const savedJob = await SavedJob.create({ userId, jobId });
      logger.info(`Job ${jobId} saved by user ${userId}`);
      return savedJob;
    } catch (error: unknown) {
      // Duplicate key error from compound unique index
      if ((error as Record<string, unknown>).code === 11000) {
        throw new ConflictError('Job already saved');
      }
      throw error;
    }
  }

  /**
   * Unsave (remove bookmark) a job.
   */
  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const result = await SavedJob.deleteOne({ userId, jobId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundError('Saved job');
    }
    logger.info(`Job ${jobId} unsaved by user ${userId}`);
  }

  /**
   * Get all saved jobs for a user (with job details populated).
   */
  async getSavedJobs(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ savedJobs: ISavedJob[]; total: number }> {
    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: 'jobId',
          populate: { path: 'company', select: 'name logo' },
        })
        .lean()
        .exec(),
      SavedJob.countDocuments({ userId }).exec(),
    ]);

    return { savedJobs: savedJobs as unknown as ISavedJob[], total };
  }

  /**
   * Check if a specific job is saved by the user.
   */
  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const exists = await SavedJob.exists({ userId, jobId });
    return !!exists;
  }

  /**
   * Get saved job IDs for a user (for frontend to show bookmark icons).
   */
  async getSavedJobIds(userId: string): Promise<string[]> {
    const savedJobs = await SavedJob.find({ userId })
      .select('jobId')
      .lean()
      .exec();
    return savedJobs.map((s) => s.jobId.toString());
  }
}

export const savedJobService = new SavedJobService();
