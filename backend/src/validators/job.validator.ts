import { z } from 'zod';

export const createJobSchema = z.object({
  title: z
    .string({ error: 'Job title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string({ error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  requirements: z.string().optional(),
  salary: z
    .number({ error: 'Salary is required' })
    .or(z.string().transform(Number))
    .pipe(z.number().min(0, 'Salary cannot be negative')),
  wageType: z
    .enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'fixed'])
    .default('monthly'),
  location: z
    .string({ error: 'Location is required' })
    .min(2, 'Location is required')
    .trim(),
  jobType: z
    .string({ error: 'Job type is required' })
    .min(1, 'Job type is required')
    .trim(),
  position: z
    .number({ error: 'Number of positions is required' })
    .or(z.string().transform(Number))
    .pipe(z.number().int().min(1, 'At least 1 position required')),
  experience: z
    .number()
    .or(z.string().transform(Number))
    .pipe(z.number().min(0, 'Experience cannot be negative')),
  companyId: z
    .string({ error: 'Company ID is required' })
    .min(1, 'Company ID is required'),
});

export const jobQuerySchema = z.object({
  keyword: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  salaryMin: z.string().transform(Number).optional(),
  salaryMax: z.string().transform(Number).optional(),
  wageType: z
    .enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'fixed'])
    .optional(),
  // Proximity ("jobs near me"): searcher's lat/lng + radius in km
  lat: z.string().transform(Number).optional(),
  lng: z.string().transform(Number).optional(),
  radius: z.string().transform(Number).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'salary', 'position']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  cursor: z.string().optional(), // For cursor-based pagination
});

export const reportJobSchema = z.object({
  reason: z.enum(['fake', 'asks_for_money', 'misleading_pay', 'offensive', 'other']),
  note: z.string().max(500).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
export type ReportJobInput = z.infer<typeof reportJobSchema>;
