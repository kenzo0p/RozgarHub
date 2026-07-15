import { z } from 'zod';

export const addCredentialSchema = z.object({
  type: z.enum(['driving_license', 'certificate', 'other'], {
    error: 'Invalid credential type',
  }),
  // Format is checked per-type in the service (e.g. Indian DL). Here we just
  // require a non-trivial value.
  number: z
    .string({ error: 'Credential number is required' })
    .trim()
    .min(3, 'Enter a valid credential number'),
});

export type AddCredentialInput = z.infer<typeof addCredentialSchema>;
