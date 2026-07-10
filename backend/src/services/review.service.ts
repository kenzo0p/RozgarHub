import { Types } from 'mongoose';
import { Review, IReview } from '../models/review.model.js';
import { Application } from '../models/application.model.js';
import { User } from '../models/user.model.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/ApiError.js';
import { eventBus } from '../events/eventBus.js';
import type { IJob, UserRole } from '../types/models.js';
import logger from '../utils/logger.js';

interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * Review Service — post-engagement reputation.
 *
 * A review can only be written by a participant of an *accepted* application,
 * about the other participant. This keeps ratings tied to real engagements
 * instead of drive-by scoring.
 */
export class ReviewService {
  async createReview(
    raterId: string,
    input: { applicationId: string; rating: number; comment?: string },
  ): Promise<IReview> {
    const application = await Application.findById(input.applicationId)
      .populate({ path: 'job', select: 'title created_By' })
      .exec();

    if (!application) {
      throw new NotFoundError('Application');
    }

    // Reviews are only meaningful once the worker was actually hired.
    if (application.status !== 'accepted') {
      throw new ForbiddenError('You can only review after the application is accepted');
    }

    const job = application.job as unknown as IJob;
    const applicantId = (application.applicant as Types.ObjectId).toString();
    const employerId = job.created_By.toString();

    // The rater must be one of the two parties; the ratee is the other one.
    let rateeId: string;
    let raterRole: UserRole;
    if (raterId === applicantId) {
      rateeId = employerId;
      raterRole = 'employee';
    } else if (raterId === employerId) {
      rateeId = applicantId;
      raterRole = 'employer';
    } else {
      throw new ForbiddenError('You were not part of this engagement');
    }

    let review: IReview;
    try {
      review = await Review.create({
        rater: raterId,
        ratee: rateeId,
        job: job._id,
        application: application._id,
        raterRole,
        rating: input.rating,
        comment: input.comment,
      });
    } catch (error: unknown) {
      if ((error as Record<string, unknown>).code === 11000) {
        throw new ConflictError('You have already reviewed this engagement');
      }
      throw error;
    }

    await this.recomputeUserRating(rateeId);

    logger.info(`Review created: ${raterId} → ${rateeId} (${input.rating}★) on job ${job._id}`);

    eventBus.emit('review.created', {
      reviewId: review._id.toString(),
      rateeId,
      raterId,
      rating: input.rating,
      jobTitle: job.title,
    });

    return review;
  }

  /**
   * Recompute and persist a user's denormalized rating aggregates from their
   * received reviews. Called after each new review so list/badge reads stay
   * cheap and never drift.
   */
  private async recomputeUserRating(userId: string): Promise<void> {
    const [agg] = await Review.aggregate<{ average: number; count: number }>([
      { $match: { ratee: new Types.ObjectId(userId) } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    await User.updateOne(
      { _id: userId },
      {
        ratingAverage: agg ? Math.round(agg.average * 10) / 10 : 0,
        ratingCount: agg ? agg.count : 0,
      },
    ).exec();
  }

  /**
   * Reviews received by a user, newest first, plus a summary (average, count,
   * star distribution) for the header.
   */
  async getUserReviews(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: IReview[]; total: number; summary: RatingSummary }> {
    const [reviews, total, summary] = await Promise.all([
      Review.find({ ratee: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'rater', select: 'fullname profile.profilePhoto role' })
        .populate({ path: 'job', select: 'title' })
        .lean()
        .exec(),
      Review.countDocuments({ ratee: userId }).exec(),
      this.getSummary(userId),
    ]);

    return { reviews: reviews as unknown as IReview[], total, summary };
  }

  private async getSummary(userId: string): Promise<RatingSummary> {
    const rows = await Review.aggregate<{ _id: number; count: number }>([
      { $match: { ratee: new Types.ObjectId(userId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const distribution: RatingSummary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    for (const row of rows) {
      const star = row._id as 1 | 2 | 3 | 4 | 5;
      distribution[star] = row.count;
      total += row.count;
      sum += row._id * row.count;
    }

    return {
      average: total ? Math.round((sum / total) * 10) / 10 : 0,
      count: total,
      distribution,
    };
  }

  /**
   * Application IDs the caller has already reviewed — lets the frontend hide
   * the "Rate" action on engagements that are done. Mirrors the saved-job-ids
   * pattern.
   */
  async getGivenApplicationIds(raterId: string): Promise<string[]> {
    const reviews = await Review.find({ rater: raterId }).select('application').lean().exec();
    return reviews.map((r) => r.application.toString());
  }
}

export const reviewService = new ReviewService();
