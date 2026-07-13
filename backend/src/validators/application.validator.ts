import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'started', 'completed', 'paid'], {
    error: 'Invalid application status',
  }),
  // Optional payment record, meaningful only when status becomes 'paid'.
  paidAmount: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  paymentMethod: z.enum(['cash', 'upi', 'bank']).optional(),
});

export const applicationParamsSchema = z.object({
  id: z.string({ error: 'ID is required' }).min(1, 'ID is required'),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
