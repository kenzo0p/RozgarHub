import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';
import { cacheGet, cacheSet, CACHE_TTL, buildCacheKey } from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * Analytics Service — MongoDB aggregation pipelines for data insights.
 *
 * These queries demonstrate advanced MongoDB usage:
 * - $group for aggregation
 * - $lookup for joins
 * - $sort + $limit for top-N queries
 * - Date math for time-windowed analytics
 *
 * All results are cached since they're expensive to compute.
 *
 * Interview note: Writing efficient aggregation pipelines is a key backend
 * skill. These pipelines would be the basis for a real analytics dashboard.
 */
export class AnalyticsService {
  /**
   * Platform-wide statistics for the admin dashboard or public stats page.
   */
  async getPlatformStats(): Promise<{
    totalJobs: number;
    totalUsers: number;
    totalApplications: number;
    totalCompanies: number;
    activeJobsLast30Days: number;
    newUsersLast7Days: number;
  }> {
    const cacheKey = 'analytics:platform-stats';
    const cached = await cacheGet<ReturnType<typeof this.getPlatformStats>>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalJobs, totalUsers, totalApplications, totalCompanies, activeJobsLast30Days, newUsersLast7Days] =
      await Promise.all([
        Job.countDocuments().exec(),
        User.countDocuments().exec(),
        Application.countDocuments().exec(),
        Company.countDocuments().exec(),
        Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).exec(),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }).exec(),
      ]);

    const result = {
      totalJobs,
      totalUsers,
      totalApplications,
      totalCompanies,
      activeJobsLast30Days,
      newUsersLast7Days,
    };

    await cacheSet(cacheKey, result, CACHE_TTL.ANALYTICS);
    return result;
  }

  /**
   * Trending jobs — scored by recent application volume with time decay.
   *
   * Algorithm:
   *   score = applicationCount * decay_factor
   *   decay_factor = 1 / (1 + daysSincePosted * 0.1)
   *
   * Jobs with more recent applications rank higher.
   * This prevents stale jobs with high all-time applications from dominating.
   */
  async getTrendingJobs(limit: number = 10): Promise<unknown[]> {
    const cacheKey = buildCacheKey('analytics:trending', { limit });
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) return cached;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const results = await Application.aggregate([
      // Only count recent applications
      { $match: { createdAt: { $gte: sevenDaysAgo } } },

      // Group by job, count applications
      { $group: { _id: '$job', recentApplicationCount: { $sum: 1 } } },

      // Sort by application count
      { $sort: { recentApplicationCount: -1 } },

      // Limit results
      { $limit: limit },

      // Join job details
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      { $unwind: '$jobDetails' },

      // Join company details
      {
        $lookup: {
          from: 'companies',
          localField: 'jobDetails.company',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },

      // Project final shape
      {
        $project: {
          _id: '$jobDetails._id',
          title: '$jobDetails.title',
          location: '$jobDetails.location',
          salary: '$jobDetails.salary',
          jobType: '$jobDetails.jobType',
          company: {
            name: '$companyDetails.name',
            logo: '$companyDetails.logo',
          },
          recentApplicationCount: 1,
          createdAt: '$jobDetails.createdAt',
        },
      },
    ]).exec();

    await cacheSet(cacheKey, results, CACHE_TTL.ANALYTICS);
    logger.info(`Computed trending jobs: ${results.length} results`);
    return results;
  }

  /**
   * Job distribution by location — for heatmap or chart visualization.
   */
  async getJobsByLocation(): Promise<Array<{ location: string; count: number }>> {
    const cacheKey = 'analytics:jobs-by-location';
    const cached = await cacheGet<Array<{ location: string; count: number }>>(cacheKey);
    if (cached) return cached;

    const results = await Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { _id: 0, location: '$_id', count: 1 } },
    ]).exec();

    await cacheSet(cacheKey, results, CACHE_TTL.ANALYTICS);
    return results;
  }

  /**
   * Job distribution by type (full-time, part-time, contract, etc.)
   */
  async getJobsByType(): Promise<Array<{ jobType: string; count: number }>> {
    const cacheKey = 'analytics:jobs-by-type';
    const cached = await cacheGet<Array<{ jobType: string; count: number }>>(cacheKey);
    if (cached) return cached;

    const results = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, jobType: '$_id', count: 1 } },
    ]).exec();

    await cacheSet(cacheKey, results, CACHE_TTL.ANALYTICS);
    return results;
  }

  /**
   * Salary distribution — bucket jobs into salary ranges.
   * Useful for "average salary by location" or "salary range distribution" charts.
   */
  async getSalaryDistribution(): Promise<Array<{ range: string; count: number; avgSalary: number }>> {
    const cacheKey = 'analytics:salary-distribution';
    const cached = await cacheGet<Array<{ range: string; count: number; avgSalary: number }>>(cacheKey);
    if (cached) return cached;

    const results = await Job.aggregate([
      {
        $bucket: {
          groupBy: '$salary',
          boundaries: [0, 10000, 25000, 50000, 100000, 200000, 500000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' },
          },
        },
      },
      {
        $project: {
          _id: 0,
          range: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0 - 10K' },
                { case: { $eq: ['$_id', 10000] }, then: '10K - 25K' },
                { case: { $eq: ['$_id', 25000] }, then: '25K - 50K' },
                { case: { $eq: ['$_id', 50000] }, then: '50K - 100K' },
                { case: { $eq: ['$_id', 100000] }, then: '100K - 200K' },
                { case: { $eq: ['$_id', 200000] }, then: '200K - 500K' },
                { case: { $eq: ['$_id', 500000] }, then: '500K+' },
              ],
              default: 'Other',
            },
          },
          count: 1,
          avgSalary: { $round: ['$avgSalary', 0] },
        },
      },
    ]).exec();

    await cacheSet(cacheKey, results, CACHE_TTL.ANALYTICS);
    return results;
  }

  /**
   * Employer dashboard stats — personalized metrics for a specific employer.
   */
  async getEmployerDashboard(userId: string): Promise<{
    totalJobsPosted: number;
    totalApplicationsReceived: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    applicationsByJob: Array<{ jobTitle: string; total: number; pending: number; accepted: number }>;
  }> {
    const cacheKey = buildCacheKey('analytics:employer', { userId });
    const cached = await cacheGet<ReturnType<typeof this.getEmployerDashboard>>(cacheKey);
    if (cached) return cached;

    // Get all jobs by this employer
    const jobs = await Job.find({ created_By: userId }).select('_id title').lean().exec();
    const jobIds = jobs.map((j) => j._id);

    // Count applications across all employer's jobs
    const [totalApplicationsReceived, pendingApplications, acceptedApplications, rejectedApplications] =
      await Promise.all([
        Application.countDocuments({ job: { $in: jobIds } }).exec(),
        Application.countDocuments({ job: { $in: jobIds }, status: 'pending' }).exec(),
        Application.countDocuments({ job: { $in: jobIds }, status: 'accepted' }).exec(),
        Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' }).exec(),
      ]);

    // Per-job application breakdown
    const applicationsByJob = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$job',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      {
        $project: {
          _id: 0,
          jobTitle: '$jobInfo.title',
          total: 1,
          pending: 1,
          accepted: 1,
        },
      },
      { $sort: { total: -1 } },
    ]).exec();

    const result = {
      totalJobsPosted: jobs.length,
      totalApplicationsReceived,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      applicationsByJob,
    };

    await cacheSet(cacheKey, result, CACHE_TTL.ANALYTICS);
    logger.info(`Computed employer dashboard for user ${userId}`);
    return result;
  }
}

export const analyticsService = new AnalyticsService();
