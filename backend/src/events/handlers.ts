import { eventBus } from './eventBus.js';
import { notificationService } from '../services/notification.service.js';
import { NOTIFICATION_TYPES, DEFAULT_LANGUAGE, type Language } from '../utils/constants.js';
import { cacheInvalidatePattern } from '../utils/cache.js';
import { sendSms } from '../utils/sms.js';
import { tn } from '../utils/notificationI18n.js';
import { userRepository } from '../repositories/user.repository.js';
import logger from '../utils/logger.js';

/**
 * Look up the phone number and language preference of a notification recipient
 * in one query. Language drives which translation we render; phone decides
 * whether an SMS goes out. Falls back to English if the user is gone.
 */
async function getRecipient(
  userId: string,
): Promise<{ phoneNumber?: number; language: Language }> {
  try {
    const user = await userRepository.findById(userId, 'phoneNumber language');
    return {
      phoneNumber: user?.phoneNumber,
      language: (user?.language as Language) ?? DEFAULT_LANGUAGE,
    };
  } catch (error) {
    logger.warn(`Recipient lookup failed for user ${userId}: ${(error as Error).message}`);
    return { language: DEFAULT_LANGUAGE };
  }
}

/**
 * Send an SMS — fire-and-forget. In-app notifications reach users who open the
 * app; blue-collar workers largely won't, so the important moments (new
 * application, accept/reject) also go out over SMS, in the user's language.
 */
async function sendSmsSafe(phoneNumber: number | undefined, message: string): Promise<void> {
  if (!phoneNumber) return;
  try {
    await sendSms(phoneNumber, message);
  } catch (error) {
    logger.warn(`SMS send failed for ${phoneNumber}: ${(error as Error).message}`);
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
    // Notify the employer that they have a new applicant, in their language
    const { phoneNumber, language } = await getRecipient(payload.employerId);
    const vars = { jobTitle: payload.jobTitle };

    await notificationService.create({
      recipientId: payload.employerId,
      type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
      title: tn(language, 'application_received.title'),
      message: tn(language, 'application_received.message', vars),
      relatedEntity: { kind: 'Application', id: payload.applicationId },
    });

    // Also reach the employer over SMS
    await sendSmsSafe(phoneNumber, tn(language, 'application_received.sms', vars));

    // Invalidate analytics caches (trending jobs, employer dashboard)
    await cacheInvalidatePattern('analytics:*');

    logger.info(`[Event] application.created → notification sent to employer ${payload.employerId}`);
  });

  eventBus.on('application.statusChanged', async (payload) => {
    // Notify the applicant about their application status, in their language
    const accepted = payload.newStatus === 'accepted';
    const type = accepted
      ? NOTIFICATION_TYPES.APPLICATION_ACCEPTED
      : NOTIFICATION_TYPES.APPLICATION_REJECTED;
    const keyBase = accepted ? 'application_accepted' : 'application_rejected';

    const { phoneNumber, language } = await getRecipient(payload.applicantId);
    const vars = { jobTitle: payload.jobTitle };

    await notificationService.create({
      recipientId: payload.applicantId,
      type,
      title: tn(language, `${keyBase}.title`),
      message: tn(language, `${keyBase}.message`, vars),
      relatedEntity: { kind: 'Application', id: payload.applicationId },
    });

    // SMS the worker — accepted workers are told to open the app for the
    // employer's contact details.
    await sendSmsSafe(phoneNumber, tn(language, `${keyBase}.sms`, vars));

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
    // Welcome notification in the user's language
    const { language } = await getRecipient(payload.userId);
    await notificationService.create({
      recipientId: payload.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: tn(language, 'welcome.title'),
      message: payload.role === 'employee'
        ? tn(language, 'welcome.employee')
        : tn(language, 'welcome.employer'),
    });

    logger.info(`[Event] user.registered → welcome notification for ${payload.email}`);
  });

  eventBus.on('user.passwordReset', async (payload) => {
    // Security notification in the user's language
    const { language } = await getRecipient(payload.userId);
    await notificationService.create({
      recipientId: payload.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: tn(language, 'password_changed.title'),
      message: tn(language, 'password_changed.message'),
    });

    logger.info(`[Event] user.passwordReset → security notification for ${payload.email}`);
  });

  logger.info('✅ Domain event handlers registered');
}
