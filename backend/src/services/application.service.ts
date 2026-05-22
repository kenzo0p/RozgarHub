import { applicationRepository } from '../repositories/application.repository.js';
import { jobRepository } from '../repositories/job.repository.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/ApiError.js';
import type { IApplication, ApplicationStatus } from '../types/models.js';
import { Job } from '../models/job.model.js';
import logger from '../utils/logger.js';

/**
 * Application Service — job application workflow.
 *
 * Handles the full application lifecycle:
 * apply → employer reviews → accept/reject
 */
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
    return application;
  }

  async getAppliedJobs(applicantId: string): Promise<IApplication[]> {
    return applicationRepository.findByApplicant(applicantId);
  }

  async getApplicantsForJob(jobId: string): Promise<unknown> {
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

    return job;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<IApplication> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    application.status = status;
    await application.save();

    logger.info(
      `Application ${applicationId} status updated to '${status}'`,
    );
    return application;
  }
}

export const applicationService = new ApplicationService();
