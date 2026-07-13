import { Types } from 'mongoose';
import { Dispute, IDispute, DisputeReason } from '../models/dispute.model.js';
import { Application } from '../models/application.model.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/ApiError.js';
import { eventBus } from '../events/eventBus.js';
import type { IJob, UserRole } from '../types/models.js';
import logger from '../utils/logger.js';

const ENGAGED = ['accepted', 'started', 'completed', 'paid'];

/**
 * Dispute Service — post-engagement grievances. A dispute can only be raised
 * by a participant of an engaged application, about the other participant.
 */
export class DisputeService {
  async raiseDispute(
    raisedBy: string,
    input: { applicationId: string; reason: DisputeReason; description?: string },
  ): Promise<IDispute> {
    const application = await Application.findById(input.applicationId)
      .populate({ path: 'job', select: 'title created_By' })
      .exec();

    if (!application) {
      throw new NotFoundError('Application');
    }
    if (!ENGAGED.includes(application.status)) {
      throw new ForbiddenError('You can only raise a dispute on an active engagement');
    }

    const job = application.job as unknown as IJob;
    const applicantId = (application.applicant as Types.ObjectId).toString();
    const employerId = job.created_By.toString();

    let against: string;
    let raisedByRole: UserRole;
    if (raisedBy === applicantId) {
      against = employerId;
      raisedByRole = 'employee';
    } else if (raisedBy === employerId) {
      against = applicantId;
      raisedByRole = 'employer';
    } else {
      throw new ForbiddenError('You were not part of this engagement');
    }

    let dispute: IDispute;
    try {
      dispute = await Dispute.create({
        application: application._id,
        job: job._id,
        raisedBy,
        raisedByRole,
        against,
        reason: input.reason,
        description: input.description,
      });
    } catch (error: unknown) {
      if ((error as Record<string, unknown>).code === 11000) {
        throw new ConflictError('You have already raised a dispute for this engagement');
      }
      throw error;
    }

    logger.info(`Dispute raised: ${raisedBy} → ${against} (${input.reason}) on job ${job._id}`);

    eventBus.emit('dispute.raised', {
      disputeId: dispute._id.toString(),
      againstId: against,
      raisedById: raisedBy,
      reason: input.reason,
      jobTitle: job.title,
    });

    return dispute;
  }

  /** Disputes involving the user — both the ones they raised and against them. */
  async getMyDisputes(userId: string): Promise<IDispute[]> {
    const oid = new Types.ObjectId(userId);
    return Dispute.find({ $or: [{ raisedBy: oid }, { against: oid }] })
      .sort({ createdAt: -1 })
      .populate({ path: 'job', select: 'title' })
      .populate({ path: 'raisedBy', select: 'fullname' })
      .populate({ path: 'against', select: 'fullname' })
      .lean()
      .exec() as unknown as Promise<IDispute[]>;
  }

  /** Application IDs the caller has already raised a dispute on (hide the button). */
  async getRaisedApplicationIds(raisedBy: string): Promise<string[]> {
    const rows = await Dispute.find({ raisedBy }).select('application').lean().exec();
    return rows.map((r) => r.application.toString());
  }
}

export const disputeService = new DisputeService();
