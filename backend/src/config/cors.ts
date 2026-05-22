import { CorsOptions } from 'cors';
import { env } from './env.js';

/**
 * CORS configuration.
 *
 * The original hardcoded 'http://localhost:5173' — now driven by environment
 * variable. In production, set CORS_ORIGIN to your actual frontend domain.
 * Supports comma-separated origins for multi-environment setups.
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
