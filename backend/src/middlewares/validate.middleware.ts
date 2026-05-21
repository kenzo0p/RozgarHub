import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/ApiError.js';

/**
 * Generic Zod validation middleware factory.
 *
 * Usage in routes:
 *   router.post('/jobs', validate(createJobSchema), jobController.create)
 *   router.get('/jobs', validate(jobQuerySchema, 'query'), jobController.list)
 *
 * Benefits over manual validation:
 * 1. Validation logic is co-located with schema (validators/), not scattered in controllers
 * 2. Validated + typed data replaces raw req.body — no runtime type guessing
 * 3. Consistent error format for all validation failures
 */
export const validate = (schema: z.ZodType, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace raw data with validated + transformed data
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
