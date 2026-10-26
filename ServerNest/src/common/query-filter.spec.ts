import { BadRequestException } from '@nestjs/common';
import { whereFromQuery } from './query-filter';

// the detail of a BadRequestException is in its response body, not in its message
const errorOf = (query: Record<string, unknown>): unknown => {
  try {
    whereFromQuery(model, query);
  } catch (err) {
    return (err as BadRequestException).getResponse();
  }
  return null;
};

const model = { getAttributes: () => ({ department_id: {}, visible: {}, label: {} }) };

describe('whereFromQuery', () => {
  it('turns the query string into column filters', () => {
    expect(whereFromQuery(model, { visible: '1', label: 'Zuivel' })).toEqual({ visible: '1', label: 'Zuivel' });
  });

  it('accepts a list of text values (?department_id[]=1&department_id[]=2)', () => {
    expect(whereFromQuery(model, { department_id: ['1', '2'] })).toEqual({ department_id: ['1', '2'] });
  });

  it('an empty query means no filter', () => {
    expect(whereFromQuery(model, {})).toEqual({});
  });

  it('ignores the keys it is told to ignore', () => {
    expect(whereFromQuery(model, { visible: '1', customer_id: 'abc' }, ['customer_id'])).toEqual({ visible: '1' });
  });

  it('rejects a column that does not exist', () => {
    expect(() => whereFromQuery(model, { password: 'x' })).toThrow(BadRequestException);
    expect(errorOf({ password: 'x' })).toEqual({ error: 'Unknown filter: password' });
  });

  it.each([[{ department_id: { $gt: '1' } }], [{ visible: [{ a: 1 }] }], [{ visible: 1 }]])('rejects a value that is not plain text: %j', (query) => {
    expect(() => whereFromQuery(model, query)).toThrow(BadRequestException);
    expect(JSON.stringify(errorOf(query))).toContain('Invalid value for filter');
  });
});
