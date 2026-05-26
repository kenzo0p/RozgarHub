import type { PaginationMeta } from '../types/api.js';
import { APP_CONSTANTS } from './constants.js';

/**
 * Pagination utilities supporting both offset-based and cursor-based approaches.
 *
 * Offset-based (skip/limit):
 *   - Simple, supports "jump to page N"
 *   - Performance degrades with large offsets (MongoDB must scan skipped docs)
 *   - Best for: admin dashboards, small datasets
 *
 * Cursor-based (lastId):
 *   - O(1) performance regardless of position in dataset
 *   - No "jump to page N" — forward/backward only
 *   - Best for: infinite scroll, large datasets, real-time feeds
 *
 * Interview note: Understanding when to use each pagination strategy is
 * a common senior-level question. Both are implemented here to demonstrate
 * the tradeoffs.
 */

// ─── Offset Pagination ──────────────────────────────────────────────────────────

export interface OffsetPaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function parseOffsetPagination(query: Record<string, unknown>): OffsetPaginationParams {
  const page = Math.max(1, Number(query.page) || APP_CONSTANTS.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, Number(query.limit) || APP_CONSTANTS.DEFAULT_LIMIT),
    APP_CONSTANTS.MAX_LIMIT,
  );
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' as const : 'desc' as const;

  return { page, limit, sortBy, sortOrder };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// ─── Cursor Pagination ──────────────────────────────────────────────────────────

export interface CursorPaginationParams {
  cursor?: string;  // MongoDB ObjectId of the last item from previous page
  limit: number;
  sortOrder: 'asc' | 'desc';
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export function parseCursorPagination(query: Record<string, unknown>): CursorPaginationParams {
  const limit = Math.min(
    Math.max(1, Number(query.limit) || APP_CONSTANTS.DEFAULT_LIMIT),
    APP_CONSTANTS.MAX_LIMIT,
  );
  const cursor = query.cursor as string | undefined;
  const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' as const : 'desc' as const;

  return { cursor, limit, sortOrder };
}

/**
 * Builds a MongoDB filter for cursor-based pagination.
 * 
 * For descending sort (newest first): { _id: { $lt: cursor } }
 * For ascending sort (oldest first):  { _id: { $gt: cursor } }
 *
 * This leverages the fact that MongoDB ObjectIds are monotonically increasing,
 * so _id ordering aligns with insertion order (approximately with time).
 */
export function buildCursorFilter(
  cursor: string | undefined,
  sortOrder: 'asc' | 'desc',
): Record<string, unknown> {
  if (!cursor) return {};
  return sortOrder === 'desc'
    ? { _id: { $lt: cursor } }
    : { _id: { $gt: cursor } };
}

export function buildCursorMeta<T extends { _id: { toString(): string } }>(
  items: T[],
  limit: number,
): CursorPaginationMeta {
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1]._id.toString()
    : null;

  return { nextCursor, hasMore, limit };
}
