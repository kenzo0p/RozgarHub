import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Application logger built on Winston.
 *
 * Dev: Pretty-printed, colorized console output.
 * Prod: Structured JSON for log aggregation (ELK, Datadog, CloudWatch).
 *
 * Log levels: error > warn > info > http > debug
 * - error: Unrecoverable failures (DB down, unhandled exceptions)
 * - warn:  Recoverable issues (deprecated API usage, slow queries)
 * - info:  Key business events (user registered, job posted)
 * - http:  HTTP request/response logs
 * - debug: Development-only verbose output
 */

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    if (stack) return `${timestamp} ${level}: ${message}\n${stack}`;
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'rozgarhub-api' },
  transports: [
    new winston.transports.Console(),
  ],
  // Prevent Winston from exiting on uncaught exceptions — we handle those separately
  exitOnError: false,
});

export default logger;
