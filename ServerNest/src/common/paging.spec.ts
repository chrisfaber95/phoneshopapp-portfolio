import { BadRequestException } from '@nestjs/common';
import { pagingFromQuery } from './paging';

describe('pagingFromQuery', () => {
  it('without limit and offset there is no paging: the whole list, as the old Server did', () => {
    expect(pagingFromQuery({})).toEqual({ limit: undefined, offset: undefined });
  });

  it('reads limit and offset', () => {
    expect(pagingFromQuery({ limit: '50', offset: '100' })).toEqual({ limit: 50, offset: 100 });
    expect(pagingFromQuery({ offset: '0' })).toEqual({ limit: undefined, offset: 0 });
  });

  it.each([['abc'], ['-1'], ['1.5'], [''], ['1e3'], ['1234567890']])('rejects limit=%s', (limit) => {
    expect(() => pagingFromQuery({ limit })).toThrow(BadRequestException);
  });

  it('rejects limit=0 and lists instead of numbers', () => {
    expect(() => pagingFromQuery({ limit: '0' })).toThrow(BadRequestException);
    expect(() => pagingFromQuery({ offset: ['1', '2'] })).toThrow(BadRequestException);
  });
});
