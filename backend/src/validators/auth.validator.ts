import { z } from 'zod';

/**
 * Zod v4 validation schemas for authentication endpoints.
 *
 * Why Zod over Joi: Zod infers TypeScript types from schemas, so the
 * validated data is automatically typed — no need for separate type definitions.
 * Zod also has better tree-shaking and smaller bundle size.
 */

export const registerSchema = z.object({
  fullname: z
    .string({ error: 'Full name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  username: z
    .string({ error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .trim(),
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  phoneNumber: z
    .string({ error: 'Phone number is required' })
    .or(z.number())
    .transform(Number),
  role: z.enum(['employee', 'employer'], {
    error: 'Role must be employee or employer',
  }),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  username: z
    .string({ error: 'Username is required' })
    .min(1, 'Username is required')
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
  role: z.enum(['employee', 'employer'], {
    error: 'Role is required',
  }),
});

export const updateProfileSchema = z.object({
  fullname: z.string().min(2).max(100).trim().optional(),
  username: z.string().min(3).max(30).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phoneNumber: z.string().or(z.number()).transform(Number).optional(),
  bio: z.string().max(500).optional(),
  skills: z.string().optional(), // Comma-separated string, parsed in service layer
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ error: 'Reset token is required' })
    .min(1, 'Token is required'),
  password: z
    .string({ error: 'New password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

// ─── Phone / OTP ────────────────────────────────────────────────────────────

// Indian mobile numbers: 10 digits starting 6-9.
const phoneSchema = z
  .string({ error: 'Phone number is required' })
  .or(z.number())
  .transform((v) => String(v).trim())
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'))
  .transform(Number);

export const otpRequestSchema = z.object({
  phoneNumber: phoneSchema,
});

export const otpVerifySchema = z.object({
  phoneNumber: phoneSchema,
  otp: z
    .string({ error: 'OTP is required' })
    .or(z.number())
    .transform((v) => String(v).trim())
    .pipe(z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')),
  // Required only when the phone number belongs to a brand-new user.
  fullname: z.string().min(2).max(100).trim().optional(),
  role: z.enum(['employee', 'employer']).optional(),
});

// Infer TypeScript types from schemas
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

