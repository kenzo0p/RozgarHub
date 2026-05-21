import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected'], {
    error: 'Status must be pending, accepted, or rejected',
  }),
});

export const applicationParamsSchema = z.object({
  id: z.string({ error: 'ID is required' }).min(1, 'ID is required'),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
