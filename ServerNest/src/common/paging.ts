import { BadRequestException } from '@nestjs/common';

export interface Paging {
  limit?: number;
  offset?: number;
}

// Optional ?limit= and ?offset= for the long lists. The old Server had no paging and always answered the whole collection
// (GET /product: 12,304 products, 26 MB); without these parameters that is still what happens, so existing clients keep working.
export const pagingFromQuery = (query: Record<string, unknown>): Paging => {
  const read = (key: 'limit' | 'offset'): number | undefined => {
    const value = query[key];
    if (value === undefined) return undefined;
    if (typeof value !== 'string' || !/^[0-9]{1,9}$/.test(value)) throw new BadRequestException({ error: `${key} must be a whole number` });
    return Number(value);
  };
  const limit = read('limit');
  if (limit === 0) throw new BadRequestException({ error: 'limit must be at least 1' });
  return { limit, offset: read('offset') };
};

export const PAGING_KEYS = ['limit', 'offset'];
