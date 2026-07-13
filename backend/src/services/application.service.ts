import { applicationRepository } from '../repositories/application.repository.js';
import { jobRepository } from '../repositories/job.repository.js';
import { ConflictError, NotFoundError, ForbiddenError, ValidationError } from '../utils/ApiError.js';
import type { IApplication, ApplicationStatus, IJob, PaymentMethod } from '../types/models.js';
import { Job } from '../models/job.model.js';
import { eventBus } from '../events/eventBus.js';
import logger from '../utils/logger.js';

/**
 * Application Service — job application workflow.
 *
 * Handles the full application lifecycle:
 * apply → employer reviews → accept/reject
 *
 * Event integration:
 * - Emits 'application.created' when a user applies (triggers employer notification)
 * - Emits 'application.statusChanged' on accept/reject (triggers applicant notification)
 */
/**
 * Legal forward-only status transitions the employer may make. The lifecycle
 * runs pending → accepted → started → completed → paid; rejection is allowed
 * while the worker hasn't started. This prevents illegal jumps (e.g. marking
 * a pending application "paid").
 */
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ['accepted', 'rejected'],
  accepted: ['started', 'rejected'],
  started: ['completed'],
  completed: ['paid'],
  rejected: [],
  paid: [],
};

export class ApplicationService {
  async applyToJob(jobId: string, applicantId: string): Promise<IApplication> {
    // Verify job exists
    const job = await jobRepository.findByIdLean(jobId);
    if (!job) {
      throw new NotFoundError('Job');
    }

    // Check for duplicate application
    const existing = await applicationRepository.findByJobAndApplicant(
      jobId,
      applicantId,
    );
    if (existing) {
      throw new ConflictError('You have already applied for this job');
    }

    // Create application
    const application = await applicationRepository.create({
      job: jobId as unknown as IApplication['job'],
      applicant: applicantId as unknown as IApplication['applicant'],
    });

    // Add application reference to the job document
    await jobRepository.addApplication(jobId, application._id.toString());

    logger.info(`Application submitted: user ${applicantId} → job ${jobId}`);

    // Emit event — handlers create notification for employer, invalidate caches
    eventBus.emit('application.created', {
      applicationId: application._id.toString(),
      jobId,
      applicantId,
      employerId: (job as IJob).created_By.toString(),
      jobTitle: (job as IJob).title,
    });

    return application;
  }

  async getAppliedJobs(applicantId: string): Promise<unknown[]> {
    const applications = await applicationRepository.findByApplicant(applicantId);

    // Reveal the employer's contact only once the worker is accepted — before
    // that it stays private. The raw created_By (which carries the employer's
    // phone) is stripped from every row so it never leaks on non-accepted ones.
    return applications.map((app) => {
      const application = app as unknown as {
        status: string;
        job?: {
          company?: { name?: string; contactPhone?: string };
          created_By?: { fullname?: string; phoneNumber?: number };
        };
      };
      const job = application.job;
      const employer = job?.created_By;

      let employerContact = null;
      // Reveal the employer's contact once hired — and keep it revealed through
      // the rest of the lifecycle (started/completed/paid), not just 'accepted'.
      const engaged = ['accepted', 'started', 'completed', 'paid'].includes(
        application.status,
      );
      if (engaged && job) {
        const phone = job.company?.contactPhone || employer?.phoneNumber;
        if (phone) {
          employerContact = {
            phone: String(phone),
            name: job.company?.name || employer?.fullname || 'Employer',
          };
        }
      }

      // Drop the populated employer object so its phone never ships raw.
      if (job) delete job.created_By;

      return { ...application, employerContact };
    });
  }

  async getApplicantsForJob(jobId: string, employerId: string): Promise<unknown> {
    const job = await Job.findById(jobId)
      .populate({
        path: 'applications',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'applicant' },
      })
      .exec();

    if (!job) {
      throw new NotFoundError('Job');
    }

    if (job.created_By.toString() !== employerId) {
      throw new ForbiddenError('You can only view applicants for your own jobs');
    }

    return job;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    employerId: string,
    payment?: { paidAmount?: number; paymentMethod?: PaymentMethod },
  ): Promise<IApplication> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    // Ownership check BEFORE mutating — only the job's poster may change status
    const job = await jobRepository.findByIdLean(
      (application.job as unknown as { toString(): string }).toString(),
    );
    if (!job || job.created_By.toString() !== employerId) {
      throw new ForbiddenError('You can only manage applications for your own jobs');
    }

    // Enforce a legal forward-only lifecycle transition.
    const current = application.status;
    if (current !== status && !ALLOWED_TRANSITIONS[current].includes(status)) {
      throw new ValidationError(`Cannot change status from '${current}' to '${status}'`);
    }

    application.status = status;
    // Record the payment details the employer entered when marking it paid.
    if (status === 'paid') {
      if (payment?.paidAmount !== undefined) application.paidAmount = payment.paidAmount;
      if (payment?.paymentMethod !== undefined) application.paymentMethod = payment.paymentMethod;
    }
    await application.save();

    logger.info(
      `Application ${applicationId} status updated to '${status}'`,
    );

    eventBus.emit('application.statusChanged', {
      applicationId,
      jobId: (application.job as unknown as { toString(): string }).toString(),
      applicantId: (application.applicant as unknown as { toString(): string }).toString(),
      newStatus: status,
      jobTitle: job?.title || 'Unknown Job',
    });

    return application;
  }

  /**
   * The worker confirms they actually received the payment the employer
   * recorded. Only the applicant can confirm, and only once the employer has
   * marked the work 'paid'. This is the trust half of the payment record —
   * "the boss says paid" is not the same as "I got the money".
   */
  async confirmPayment(applicationId: string, applicantId: string): Promise<IApplication> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }
    if ((application.applicant as unknown as { toString(): string }).toString() !== applicantId) {
      throw new ForbiddenError('You can only confirm payment for your own application');
    }
    if (application.status !== 'paid') {
      throw new ValidationError('Payment can only be confirmed once the employer marks it paid');
    }

    application.paymentConfirmed = true;
    application.paymentConfirmedAt = new Date();
    await application.save();

    const job = await jobRepository.findByIdLean(
      (application.job as unknown as { toString(): string }).toString(),
    );

    logger.info(`Payment confirmed by worker ${applicantId} on application ${applicationId}`);

    eventBus.emit('payment.confirmed', {
      applicationId,
      employerId: job?.created_By.toString() || '',
      applicantId,
      jobTitle: job?.title || 'Unknown Job',
    });

    return application;
  }
}

export const applicationService = new ApplicationService();
