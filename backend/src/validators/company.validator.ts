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
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
