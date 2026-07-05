/**
 * Application-wide constants.
 * Centralized to avoid magic numbers/strings scattered across the codebase.
 */
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Auth — dual token strategy
  ACCESS_TOKEN_EXPIRY: '15m',         // Short-lived (was '1d')
  REFRESH_TOKEN_EXPIRY: '7d',         // Long-lived, stored in DB
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
  PASSWORD_RESET_EXPIRY_MS: 60 * 60 * 1000, // 1 hour
  BCRYPT_SALT_ROUNDS: 12,
  ACCESS_COOKIE_NAME: 'accessToken',
  REFRESH_COOKIE_NAME: 'refreshToken',

  // Rate limiting — per client IP (requires trust proxy, set in index.ts).
  // A normal browsing session fires several API calls per page, so 100/15min
  // throttled legitimate users; 500 still comfortably blocks scraping/abuse.
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 500,
  AUTH_RATE_LIMIT_MAX: 10,           // Stricter limit for auth endpoints

  // File uploads
  MAX_FILE_SIZE: 5 * 1024 * 1024,   // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_RESUME_TYPES: ['application/pdf'],

  // API versioning
  API_PREFIX: '/api',
  CURRENT_API_VERSION: 'v1',
} as const;

export const USER_ROLES = {
  EMPLOYEE: 'employee',
  EMPLOYER: 'employer',
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const NOTIFICATION_TYPES = {
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  NEW_JOB_MATCH: 'new_job_match',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

