import { Op } from 'sequelize';
import { whereFromFilters } from './order-filters';

const columns = ['customer_id', 'status', 'pickupDate', 'id'];
const group = (filterType: string, value: unknown[]) => [JSON.stringify({ filterType, value })];

describe('whereFromFilters', () => {
  it('no filters means no restriction, other query keys are ignored', () => {
    expect(whereFromFilters(columns, {})).toEqual({});
    expect(whereFromFilters(columns, { page: '2' })).toEqual({});
  });

  it('plain values are equals, groups are combined with and', () => {
    const where = whereFromFilters(columns, { 0: group('and', [{ customer_id: 'c-1' }]), 1: group('or', [{ status: 'a' }, { status: 'b' }]) });
    expect(where).toEqual({ [Op.and]: [{ [Op.and]: [{ customer_id: 'c-1' }] }, { [Op.or]: [{ status: 'a' }, { status: 'b' }] }] });
  });

  it('maps the operators the clients use', () => {
    const where = whereFromFilters(columns, { 0: group('and', [{ status: { filterType: 'notLike', value: 'pending' } }, { id: { filterType: 'in', value: [1, 2] } }]) });
    expect(where).toEqual({ [Op.and]: [{ [Op.and]: [{ status: { [Op.notLike]: 'pending' } }, { id: { [Op.in]: [1, 2] } }] }] });
  });

  it('turns a pickupDate into an ISO date like the old Server', () => {
    const where = whereFromFilters(columns, { 0: group('and', [{ pickupDate: '2026-05-01' }]) });
    expect(where).toEqual({ [Op.and]: [{ [Op.and]: [{ pickupDate: new Date('2026-05-01').toISOString() }] }] });
  });

  it.each([
    ['an unknown column', group('and', [{ password: 'x' }])],
    ['an operator that is not allowed', group('and', [{ status: { filterType: 'regexp', value: 'x' } }])],
    ['an operator named after a prototype property', group('and', [{ status: { filterType: 'constructor', value: 'x' } }])],
    ['an object as value', group('and', [{ status: { filterType: 'eq', value: { a: 1 } } }])],
    ['a list operator without a list', group('and', [{ id: { filterType: 'in', value: 1 } }])],
    ['an unknown group type', group('xor', [{ status: 'a' }])],
    ['an invalid date', group('and', [{ pickupDate: 'never' }])],
    ['invalid JSON', ['{nope']],
  ])('rejects %s', (_name, filter) => {
    expect(() => whereFromFilters(columns, { 0: filter })).toThrow();
  });
});

describe('whereFromFilters with bracketed fields', () => {
  it('takes the object the query parser makes of 0[0][filterType]=and&0[0][value][0][status]=x like the JSON text', () => {
    const asObject = { 0: [{ filterType: 'and', value: [{ status: { filterType: 'notLike', value: 'pending' } }] }] };
    const asJson = { 0: [JSON.stringify({ filterType: 'and', value: [{ status: { filterType: 'notLike', value: 'pending' } }] })] };
    expect(whereFromFilters(['status'], asObject)).toEqual(whereFromFilters(['status'], asJson));
  });

  it('still rejects an object that is not a filter', () => {
    expect(() => whereFromFilters(['status'], { 0: [{ filterType: 'xor', value: [] }] })).toThrow();
    expect(() => whereFromFilters(['status'], { 0: [5] })).toThrow();
  });
});
