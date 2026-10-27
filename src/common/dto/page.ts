// src/common/dto/page.ts
import type { PaginationQueryDto } from './pagination-query.dto.js';

/** Paginated result returned by list endpoints. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Builds a {@link Page} from a `findAndCount` result, mapping each row
 * (e.g. to a response DTO) and echoing the requested page and limit.
 */
export const toPage = <T, R>(
  [rows, total]: [T[], number],
  q: PaginationQueryDto,
  map: (r: T) => R,
): Page<R> => ({ items: rows.map(map), total, page: q.page, limit: q.limit });
