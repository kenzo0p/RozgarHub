import { Request } from 'express';
import { IUser } from './models.js';

/**
 * Extended Express Request with authenticated user context.
 * After auth middleware runs, `req.user` is populated with the decoded JWT payload.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    /** Populated by the authorize() RBAC middleware from the DB — undefined before that. */
    role?: IUser['role'];
  };
}

/**
 * Pagination query parameters common across list endpoints.
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
