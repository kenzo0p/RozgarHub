/**
 * Application-wide constants.
 * Centralized to avoid magic numbers/strings scattered across the codebase.
 */
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Auth
  ACCESS_TOKEN_EXPIRY: '1d',
  BCRYPT_SALT_ROUNDS: 12,
  COOKIE_NAME: 'token',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
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
