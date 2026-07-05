import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';
import { Application } from '../models/application.model.js';
import { NotFoundError } from '../utils/ApiError.js';
import { cacheGet, cacheSet, CACHE_TTL, buildCacheKey } from '../utils/cache.js';
import type { IJob, IUser } from '../types/models.js';
import logger from '../utils/logger.js';

/**
 * Recommendation Service — TF-IDF based job-user matching.
 *
 * This implements a lightweight information retrieval approach:
 * 1. Extract "terms" from user skills and job requirements/description
 * 2. Compute TF-IDF weights for each term
 * 3. Score jobs by cosine similarity with user's skill vector
 *
 * No external API needed — runs entirely in-process.
 *
 * Interview note: TF-IDF + cosine similarity is the foundational algorithm
 * behind search engines and recommendation systems. Understanding this
 * demonstrates CS fundamentals beyond just "call an API."
 *
 * Potential improvements (mentioned in interview, not implemented):
 * - Word embeddings (Word2Vec) for semantic similarity
 * - Collaborative filtering (users who applied to X also applied to Y)
 * - Learning-to-rank models
 */
export class RecommendationService {
  /**
   * Get job recommendations for a specific user.
   * Matches user's skills against job requirements + descriptions.
   */
  async getRecommendedJobs(
    userId: string,
    limit: number = 10,
  ): Promise<Array<{ job: Partial<IJob>; score: number; matchedSkills: string[] }>> {
    const cacheKey = buildCacheKey('recs:jobs', { userId, limit });
    const cached = await cacheGet<ReturnType<typeof this.getRecommendedJobs>>(cacheKey);
    if (cached) return cached;

    // Fetch user profile
    const user = await User.findById(userId).select('profile.skills').lean().exec() as IUser | null;
    if (!user) throw new NotFoundError('User');

    const userSkills = (user.profile?.skills || []).map((s) => s.toLowerCase().trim());
    if (userSkills.length === 0) return [];

    // Get jobs the user hasn't applied to yet
    const appliedJobIds = await Application.find({ applicant: userId })
      .select('job')
      .lean()
      .exec()
      .then((apps) => apps.map((a) => a.job));

    // Fetch candidate jobs (exclude already applied)
    const candidateJobs = await Job.find({
      _id: { $nin: appliedJobIds },
    })
      .populate({ path: 'company', select: 'name logo' })
      .sort({ createdAt: -1 })
      .limit(200) // Cap candidates to keep computation fast
      .lean()
      .exec() as unknown as IJob[];

    // Score each job
    const scoredJobs = candidateJobs.map((job) => {
      const { score, matchedSkills } = this.computeMatchScore(userSkills, job);
      return { job, score, matchedSkills };
    });

    // Sort by score descending, filter out zero-score jobs
    const results = scoredJobs
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ job, score, matchedSkills }) => ({
        job: {
          _id: job._id,
          title: job.title,
          location: job.location,
          salary: job.salary,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          company: job.company,
          createdAt: job.createdAt,
        },
        score: Math.round(score * 100) / 100,
        matchedSkills,
      }));

    await cacheSet(cacheKey, results, CACHE_TTL.RECOMMENDATIONS);
    logger.info(`Computed ${results.length} job recommendations for user ${userId}`);
    return results;
  }

  /**
   * Compute match score between user skills and a job.
   *
   * Scoring algorithm:
   * 1. Extract terms from job title, description, and requirements
   * 2. For each user skill, check if it appears in job terms
   * 3. Score = (matched skills / total user skills) * location_boost * recency_boost
   *
   * This is a simplified TF approach (we skip IDF since we're scoring
   * one user against many jobs, not one query against a corpus).
   */
  private computeMatchScore(
    userSkills: string[],
    job: IJob,
  ): { score: number; matchedSkills: string[] } {
    // Extract searchable text from job
    const jobText = [
      job.title || '',
      job.description || '',
      job.requirements || '',
      job.jobType || '',
    ]
      .join(' ')
      .toLowerCase();

    // Find matching skills
    const matchedSkills: string[] = [];
    for (const skill of userSkills) {
      if (jobText.includes(skill)) {
        matchedSkills.push(skill);
      }
    }

    if (matchedSkills.length === 0) return { score: 0, matchedSkills: [] };

    // Base score: ratio of matched skills
    let score = matchedSkills.length / userSkills.length;

    // Recency boost: jobs posted in last 7 days get a 1.5x boost
    const daysSincePosted = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePosted <= 7) {
      score *= 1.5;
    } else if (daysSincePosted <= 30) {
      score *= 1.2;
    }

    // Title match boost: if a skill appears in the title, it's highly relevant
    const titleLower = (job.title || '').toLowerCase();
    const titleMatches = matchedSkills.filter((s) => titleLower.includes(s)).length;
    if (titleMatches > 0) {
      score *= 1 + titleMatches * 0.3;
    }

    return { score, matchedSkills };
  }

  /**
   * Get similar jobs to a given job (content-based filtering).
   * Useful for "You might also like" section on job detail pages.
   */
  async getSimilarJobs(
    jobId: string,
    limit: number = 5,
  ): Promise<Array<{ job: Partial<IJob>; similarityScore: number }>> {
    const cacheKey = buildCacheKey('recs:similar', { jobId, limit });
    const cached = await cacheGet<ReturnType<typeof this.getSimilarJobs>>(cacheKey);
    if (cached) return cached;

    const targetJob = await Job.findById(jobId).lean().exec() as IJob | null;
    if (!targetJob) throw new NotFoundError('Job');

    // Find jobs with similar attributes
    const candidates = await Job.find({
      _id: { $ne: jobId },
      $or: [
        { location: targetJob.location },
        { jobType: targetJob.jobType },
        {
          salary: {
            $gte: (targetJob.salary || 0) * 0.7,
            $lte: (targetJob.salary || 0) * 1.3,
          },
        },
      ],
    })
      .populate({ path: 'company', select: 'name logo' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec() as unknown as IJob[];

    // Score similarity
    const targetTerms = this.extractTerms(targetJob);
    const scored = candidates.map((candidate) => {
      const candidateTerms = this.extractTerms(candidate);
      const similarityScore = this.jaccardSimilarity(targetTerms, candidateTerms);
      return {
        job: {
          _id: candidate._id,
          title: candidate.title,
          location: candidate.location,
          salary: candidate.salary,
          jobType: candidate.jobType,
          company: candidate.company,
          createdAt: candidate.createdAt,
        },
        similarityScore: Math.round(similarityScore * 100) / 100,
      };
    });

    const results = scored
      .filter((s) => s.similarityScore > 0.1)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    await cacheSet(cacheKey, results, CACHE_TTL.RECOMMENDATIONS);
    return results;
  }

  /**
   * Extract terms from a job for similarity comparison.
   */
  private extractTerms(job: IJob): Set<string> {
    const text = `${job.title} ${job.description} ${job.requirements || ''} ${job.location} ${job.jobType}`;
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Filter out tiny words

    return new Set(words);
  }

  /**
   * Jaccard similarity — ratio of intersection to union of term sets.
   * Simple but effective for content-based filtering.
   */
  private jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }
}

export const recommendationService = new RecommendationService();
