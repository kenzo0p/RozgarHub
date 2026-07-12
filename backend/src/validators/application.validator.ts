import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'started', 'completed', 'paid'], {
    error: 'Invalid application status',
  }),
});

export const applicationParamsSchema = z.object({
  id: z.string({ error: 'ID is required' }).min(1, 'ID is required'),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
