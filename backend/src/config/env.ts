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

  // Auth — 32+ chars so the JWT signing secret has real entropy.
  SECRET_KEY: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Cloudinary
  CLOUD_NAME: z.string().min(1, 'Cloudinary cloud name is required'),
  CLOUD_API_KEY: z.string().min(1, 'Cloudinary API key is required'),
  CLOUD_API_SECRET: z.string().min(1, 'Cloudinary API secret is required'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Redis (optional — app works without it, just no caching)
  REDIS_URL: z.string().optional(),

  // Error monitoring (optional — captureException stays a no-op until set)
  SENTRY_DSN: z.string().optional(),
})
  // Production guardrails — catch insecure defaults at boot rather than in prod.
  .superRefine((val, ctx) => {
    if (val.NODE_ENV !== 'production') return;
    if (val.CORS_ORIGIN.includes('localhost')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'CORS_ORIGIN must not be localhost in production',
      });
    }
    if (/change-this|your-jwt-secret|secret-key/i.test(val.SECRET_KEY)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SECRET_KEY'],
        message: 'SECRET_KEY looks like the example placeholder — set a real secret',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment validation failed:');
  console.error(parseResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parseResult.data;
