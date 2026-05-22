/**
 * Custom API Error class hierarchy.
 *
 * Instead of scattering `res.status(xxx).json(...)` throughout controllers,
 * we throw typed errors and let the centralized error handler format them.
 * This keeps controllers clean and ensures consistent error responses.
 *
 * Scalability: In a microservices setup, error codes enable programmatic
 * error handling across service boundaries.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly errors: unknown[];

  constructor(
    statusCode: number,
    message: string,
    code: string = 'INTERNAL_ERROR',
    errors: unknown[] = [],
    isOperational: boolean = true,
    stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', errors: unknown[] = []) {
    super(400, message, 'VALIDATION_ERROR', errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(409, message, 'CONFLICT');
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMITED');
  }
}
