import type { PaginationMeta } from '../types/api.js';

/**
 * Standardized API response builder.
 *
 * Ensures every endpoint returns a predictable envelope:
 * { success, statusCode, message, data?, meta? }
 *
 * Frontend can always check `response.data.success` and access `response.data.data`.
 * Paginated endpoints include `meta` with page info for infinite scrolling / pagination UI.
 */
export class ApiResponse {
  static success<T>(data: T, message: string = 'Success', statusCode: number = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static created<T>(data: T, message: string = 'Created successfully') {
    return this.success(data, message, 201);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
  ) {
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      success: true,
      statusCode: 200,
      message,
      data,
      meta,
    };
  }

  static message(message: string, statusCode: number = 200) {
    return {
      success: true,
      statusCode,
      message,
    };
  }
}
