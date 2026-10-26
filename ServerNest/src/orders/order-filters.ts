import { BadRequestException } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';

// The order list is filtered with a small JSON language that the Klant client and the admin app already use:
//   ?0[]={"filterType":"and","value":[{"customer_id":"..."}]}&1[]={"filterType":"and","value":[{"status":{"filterType":"notLike","value":"pending"}}]}
// Every numbered parameter is a group ("and" / "or") of conditions on columns; a condition is a plain value (equals) or
// { filterType: <operator>, value }. The old Server mapped the names straight onto Sequelize operators (`Op[name]`), so a caller
// could pick any operator; only the listed ones are accepted here, on real columns, with plain values.

const GROUPS = { and: Op.and, or: Op.or } as const;
const OPERATORS = {
  eq: Op.eq, ne: Op.ne, gt: Op.gt, gte: Op.gte, lt: Op.lt, lte: Op.lte,
  like: Op.like, notLike: Op.notLike, in: Op.in, notIn: Op.notIn,
} as const;
const LIST_OPERATORS = ['in', 'notIn'];

type Scalar = string | number | boolean | null;
const isScalar = (value: unknown): value is Scalar => value === null || ['string', 'number', 'boolean'].includes(typeof value);
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

const bad = (message: string): never => {
  throw new BadRequestException({ error: message });
};

const DATE_COLUMNS = ['pickupDate', 'pickup_date'];
// the pickup date (pickupDate of an order, pickup_date of an actie order) is compared as an ISO date, like the old Server did (moment(new Date(value)).toISOString())
const normalize = (column: string, value: unknown): unknown => {
  if (!DATE_COLUMNS.includes(column) || typeof value !== 'string') return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? bad(`Invalid date for ${column}`) : date.toISOString();
};

const condition = (columns: string[], column: string, raw: unknown): Record<string, unknown> => {
  if (!columns.includes(column)) bad(`Unknown filter column: ${column}`);
  if (isRecord(raw)) {
    const { filterType, value } = raw;
    if (typeof filterType !== 'string' || !Object.hasOwn(OPERATORS, filterType)) return bad(`Unknown filter operator for ${column}`);
    const isList = LIST_OPERATORS.includes(filterType);
    if (isList ? !Array.isArray(value) || !value.every(isScalar) : !isScalar(value)) return bad(`Invalid value for ${column}`);
    const operator = OPERATORS[filterType as keyof typeof OPERATORS];
    return { [column]: { [operator]: Array.isArray(value) ? value.map((v) => normalize(column, v)) : normalize(column, value) } };
  }
  if (!isScalar(raw)) return bad(`Invalid value for ${column}`);
  return { [column]: normalize(column, raw) };
};

const parseGroup = (columns: string[], raw: unknown): WhereOptions => {
  // The filter arrives as JSON text (`0[]={"filterType":...}`, how axios 0.x sends an object) or, from axios 1.x and form encoders, as
  // bracketed fields (`0[0][filterType]=and&0[0][value][0][status]=x`), which the query parser turns into the same object.
  const first = Array.isArray(raw) ? raw[0] : raw;
  let group: unknown = first;
  if (typeof first === 'string') {
    try {
      group = JSON.parse(first);
    } catch {
      return bad('A filter is not valid JSON');
    }
  }
  if (!isRecord(group) || typeof group.filterType !== 'string' || !Object.hasOwn(GROUPS, group.filterType) || !Array.isArray(group.value)) return bad('A filter needs filterType (and/or) and a value list');

  const conditions = group.value.map((item): Record<string, unknown> => {
    if (!isRecord(item)) return bad('Every filter condition must be an object');
    const entries = Object.entries(item);
    if (entries.length === 0) return bad('Empty filter condition');
    return Object.assign({}, ...entries.map(([column, value]) => condition(columns, column, value)));
  });
  return { [GROUPS[group.filterType as keyof typeof GROUPS]]: conditions };
};

// Turns the query string into a where clause; no filters at all means no restriction
export const whereFromFilters = (columns: string[], query: Record<string, unknown>): WhereOptions => {
  const groups = Object.keys(query)
    .filter((key) => /^[0-9]+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => parseGroup(columns, query[key]));
  return groups.length > 0 ? { [Op.and]: groups } : {};
};
