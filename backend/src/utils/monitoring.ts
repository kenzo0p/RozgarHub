import logger from './logger.js';
import { env } from '../config/env.js';

type Context = Record<string, unknown>;

/**
 * Report an exception to the error-monitoring pipeline.
 *
 * Right now this logs at error level with a stable `monitored` marker so
 * alerting can be built on top. To wire a real provider (e.g. Sentry): install
 * `@sentry/node`, `Sentry.init({ dsn: env.SENTRY_DSN })` in the bootstrap, and
 * call `Sentry.captureException` in the guarded block below. Kept behind
 * `SENTRY_DSN` so it stays a no-op until configured — no hard dependency.
 */
export function captureException(error: unknown, context: Context = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));

  logger.error(`[monitored] ${err.message}`, {
    monitored: true,
    stack: err.stack,
    ...context,
  });

  if (env.SENTRY_DSN) {
    // Provider configured — forward here once @sentry/node is initialized:
    //   Sentry.captureException(err, { extra: context });
    logger.debug('[monitored] SENTRY_DSN configured — forward to provider here');
  }
}
