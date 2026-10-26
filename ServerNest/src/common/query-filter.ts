import { BadRequestException } from '@nestjs/common';
import { WhereOptions } from 'sequelize';

type ModelWithAttributes = { getAttributes(): Record<string, unknown> };

// The old Server passed the whole query string to Sequelize as the `where` of a list query (`where: req.query`):
// `?visible=1&department_id=3` filters by those columns, `?id[]=1&id[]=2` filters by a list. That behaviour is kept, but
// only for real columns and plain text values; anything else answers 400 (the old server ran an invalid query and never
// answered).
export const whereFromQuery = (model: ModelWithAttributes, query: Record<string, unknown>, ignore: string[] = []): WhereOptions => {
  const attributes = Object.keys(model.getAttributes());
  const where: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(query)) {
    if (ignore.includes(key)) continue;
    if (!attributes.includes(key)) throw new BadRequestException({ error: `Unknown filter: ${key}` });
    const isText = typeof value === 'string';
    const isTextList = Array.isArray(value) && value.every((item) => typeof item === 'string');
    if (!isText && !isTextList) throw new BadRequestException({ error: `Invalid value for filter: ${key}` });
    where[key] = value as string | string[];
  }
  return where;
};
