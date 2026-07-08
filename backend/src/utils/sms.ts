import { env } from '../config/env.js';
import logger from './logger.js';

/**
 * SMS sender — pluggable delivery for OTPs and alerts.
 *
 * In development/test there's no SMS provider, so the message is logged
 * (and the OTP is surfaced to the caller for manual testing, mirroring the
 * mock password-reset flow). In production, wire an Indian SMS gateway
 * (MSG91 / Gupshup / Twilio) here — the contract stays the same, so no
 * caller changes are needed.
 */
export async function sendSms(phoneNumber: number, message: string): Promise<void> {
  if (env.NODE_ENV === 'production') {
    // TODO: integrate a real SMS provider (MSG91 / Twilio) here.
    logger.warn(
      `SMS provider not configured — message to ${phoneNumber} not sent: "${message}"`,
    );
    return;
  }
  logger.info(`📱 [DEV SMS] to ${phoneNumber}: ${message}`);
}
