import { z } from 'zod';

export const createDisputeSchema = z.object({
  applicationId: z
    .string({ error: 'Application ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid application ID'),
  reason: z.enum(
    ['not_paid', 'underpaid', 'no_show', 'incomplete_work', 'unsafe', 'other'],
    { error: 'Invalid dispute reason' },
  ),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').trim().optional(),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
