import { z } from 'zod';

export const createReviewSchema = z.object({
  applicationId: z
    .string({ error: 'Application ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid application ID'),
  rating: z
    .number({ error: 'Rating is required' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').trim().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
