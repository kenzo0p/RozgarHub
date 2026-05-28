import logger from './logger.js';

/**
 * Retry utility — exponential backoff with jitter for external service calls.
 *
 * Why retry with backoff?
 * - Transient failures (network blips, temporary overload) often succeed on retry
 * - Fixed intervals cause "thundering herd" (all retries hit the service at once)
 * - Exponential backoff + jitter spreads retry load across time
 *
 * Usage:
 *   const result = await retry(
 *     () => cloudinary.upload(file),
 *     { maxRetries: 3, baseDelay: 500, backoff: 'exponential' }
 *   );
 *
 * Interview note: Understanding retry strategies is critical for building
 * resilient distributed systems. Key concepts:
 * - Idempotency (safe to retry)
 * - Circuit breaker (stop retrying after too many failures)
 * - Backoff strategies (linear, exponential, decorrelated jitter)
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;     // Base delay in ms
  maxDelay?: number;     // Cap on delay (default: 30s)
  backoff: 'linear' | 'exponential';
  retryOn?: (error: Error) => boolean;  // Only retry on specific errors
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 30_000,
  backoff: 'exponential',
};

/**
 * Execute a function with retry logic.
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries are exhausted
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this specific error
      if (opts.retryOn && !opts.retryOn(lastError)) {
        throw lastError;
      }

      // Don't wait after the last attempt
      if (attempt < opts.maxRetries) {
        const delay = calculateDelay(attempt, opts);
        logger.warn(
          `Retry ${attempt + 1}/${opts.maxRetries} after ${delay}ms: ${lastError.message}`,
        );
        await sleep(delay);
      }
    }
  }

  logger.error(`All ${opts.maxRetries} retries exhausted: ${lastError?.message}`);
  throw lastError;
}

/**
 * Calculate delay with jitter to prevent thundering herd.
 *
 * Exponential: delay = min(baseDelay * 2^attempt + jitter, maxDelay)
 * Linear:      delay = min(baseDelay * (attempt + 1) + jitter, maxDelay)
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const { baseDelay, maxDelay = 30_000, backoff } = options;

  let delay: number;
  if (backoff === 'exponential') {
    delay = baseDelay * Math.pow(2, attempt);
  } else {
    delay = baseDelay * (attempt + 1);
  }

  // Add jitter (±25% of delay) to prevent synchronized retries
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  delay = Math.min(delay + jitter, maxDelay);

  return Math.max(0, Math.round(delay));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
