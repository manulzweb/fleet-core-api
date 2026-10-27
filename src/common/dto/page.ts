import type { PaginationQueryDto } from './pagination-query.dto.js';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const toPage = <T, R>(
  [rows, total]: [T[], number],
  q: PaginationQueryDto,
  map: (r: T) => R,
): Page<R> => ({ items: rows.map(map), total, page: q.page, limit: q.limit });
