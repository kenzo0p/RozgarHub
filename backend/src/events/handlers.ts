import { eventBus } from './eventBus.js';
import { notificationService } from '../services/notification.service.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { cacheInvalidatePattern } from '../utils/cache.js';
import { sendSms } from '../utils/sms.js';
import { userRepository } from '../repositories/user.repository.js';
import logger from '../utils/logger.js';

/**
 * Send an SMS to a user by id — fire-and-forget. In-app notifications reach
 * users who open the app; blue-collar workers largely won't, so the important
 * moments (new application, accept/reject) also go out over SMS.
 */
async function notifyBySms(userId: string, message: string): Promise<void> {
  try {
    const user = await userRepository.findById(userId, 'phoneNumber');
    if (user?.phoneNumber) {
      await sendSms(user.phoneNumber, message);
    }
  } catch (error) {
    logger.warn(`SMS notification failed for user ${userId}: ${(error as Error).message}`);
  }
}

/**
 * Event Handlers — react to domain events.
 *
 * This is the "subscriber" side of the event bus.
 * Each handler is independent and self-contained.
 * Adding a new reaction to an event requires zero changes to the emitter.
 *
 * Example flow:
 *   1. ApplicationService emits 'application.created'
 *   2. This handler creates a notification for the employer
 *   3. This handler invalidates analytics caches
 *   4. (Future) This handler sends an email, updates a search index, etc.
 */

export function registerEventHandlers(): void {
  // ─── Application Events ─────────────────────────────────────────────────────

  eventBus.on('application.created', async (payload) => {
    // Notify the employer that they have a new applicant
    await notificationService.create({
      recipientId: payload.employerId,
      type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
      title: 'New Application Received',
      message: `A new applicant has applied for "${payload.jobTitle}"`,
      relatedEntity: { kind: 'Application', id: payload.applicationId },
    });

    // Also reach the employer over SMS
    await notifyBySms(
      payload.employerId,
      `RozgarHub: New application for "${payload.jobTitle}". Open the app to review.`,
    );

    // Invalidate analytics caches (trending jobs, employer dashboard)
    await cacheInvalidatePattern('analytics:*');

    logger.info(`[Event] application.created → notification sent to employer ${payload.employerId}`);
  });

  eventBus.on('application.statusChanged', async (payload) => {
    // Notify the applicant about their application status
    const type = payload.newStatus === 'accepted'
      ? NOTIFICATION_TYPES.APPLICATION_ACCEPTED
      : NOTIFICATION_TYPES.APPLICATION_REJECTED;

    const statusText = payload.newStatus === 'accepted' ? 'accepted' : 'rejected';

    await notificationService.create({
      recipientId: payload.applicantId,
      type,
      title: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message: `Your application for "${payload.jobTitle}" has been ${statusText}`,
      relatedEntity: { kind: 'Application', id: payload.applicationId },
    });

    // SMS the worker — accepted workers are told to open the app for the
    // employer's contact details.
    const smsBody = payload.newStatus === 'accepted'
      ? `RozgarHub: Good news! You've been accepted for "${payload.jobTitle}". Open the app to contact the employer.`
      : `RozgarHub: Update on your application for "${payload.jobTitle}": ${statusText}.`;
    await notifyBySms(payload.applicantId, smsBody);

    logger.info(`[Event] application.statusChanged → notification sent to applicant ${payload.applicantId}`);
  });

  // ─── Job Events ─────────────────────────────────────────────────────────────

  eventBus.on('job.created', async (payload) => {
    // Invalidate job listing and analytics caches
    await Promise.all([
      cacheInvalidatePattern('jobs:*'),
      cacheInvalidatePattern('analytics:*'),
      cacheInvalidatePattern('recs:*'),
    ]);

    logger.info(`[Event] job.created → caches invalidated for job "${payload.title}"`);
  });

  // ─── User Events ────────────────────────────────────────────────────────────

  eventBus.on('user.registered', async (payload) => {
    // Welcome notification
    await notificationService.create({
      recipientId: payload.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'Welcome to RozgarHub!',
      message: payload.role === 'employee'
        ? 'Start exploring jobs that match your skills. Update your profile and skills to get personalized recommendations.'
        : 'Start by creating your company profile, then post your first job to find the right workers.',
    });

    logger.info(`[Event] user.registered → welcome notification for ${payload.email}`);
  });

  eventBus.on('user.passwordReset', async (payload) => {
    // Security notification
    await notificationService.create({
      recipientId: payload.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'Password Changed',
      message: 'Your password has been successfully reset. If you did not do this, please contact support immediately.',
    });

    logger.info(`[Event] user.passwordReset → security notification for ${payload.email}`);
  });

  logger.info('✅ Domain event handlers registered');
}
