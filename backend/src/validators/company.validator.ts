import { z } from 'zod';

export const registerCompanySchema = z.object({
  companyName: z
    .string({ error: 'Company name is required' })
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name cannot exceed 200 characters')
    .trim(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().max(200).trim().optional(),
  contactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
});

// GSTIN: 15 chars — 2-digit state, 10-char PAN, entity digit, 'Z', checksum.
export const verifyCompanySchema = z.object({
  gstNumber: z
    .string({ error: 'GST number is required' })
    .trim()
    .toUpperCase()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Enter a valid 15-character GSTIN',
    ),
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type VerifyCompanyInput = z.infer<typeof verifyCompanySchema>;
