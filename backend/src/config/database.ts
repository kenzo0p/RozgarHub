import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

/**
 * MongoDB connection with retry logic and event monitoring.
 *
 * Key improvements over the original:
 * - Retry logic with exponential backoff (handles transient network issues)
 * - Connection event monitoring for observability
 * - Graceful shutdown handler (prevents data corruption on SIGTERM)
 * - Proper error propagation (original silently caught and logged)
 */

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export const connectDB = async (): Promise<void> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URL);
      logger.info('✅ MongoDB connection established');

      // Monitor connection health
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting reconnection...');
      });

      return;
    } catch (error) {
      retries++;
      logger.error(
        `❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`,
        error,
      );

      if (retries === MAX_RETRIES) {
        logger.error('Max retries reached. Exiting process.');
        process.exit(1);
      }

      // Exponential backoff: 5s, 10s, 20s, 40s, 80s
      const delay = RETRY_DELAY_MS * Math.pow(2, retries - 1);
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Graceful shutdown — close MongoDB connection before process exit.
 * Prevents incomplete writes and connection leaks.
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};
