import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Runtime environment validation using Zod.
 *
 * The app crashes on startup if any required env var is missing or malformed.
 * This is intentional — fail fast in deployment rather than discovering missing
 * config at runtime when a user hits a specific code path.
 *
 * Interview note: This pattern is standard at companies like Stripe and Vercel.
 * It prevents the class of bugs where app "works" locally but fails in staging
 * because someone forgot to set an env var.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),

  // Database
  MONGODB_URL: z.string().min(1, 'MongoDB connection string is required'),

  // Auth
  SECRET_KEY: z.string().min(16, 'JWT secret must be at least 16 characters'),

  // Cloudinary
  CLOUD_NAME: z.string().min(1, 'Cloudinary cloud name is required'),
  CLOUD_API_KEY: z.string().min(1, 'Cloudinary API key is required'),
  CLOUD_API_SECRET: z.string().min(1, 'Cloudinary API secret is required'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment validation failed:');
  console.error(parseResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parseResult.data;
