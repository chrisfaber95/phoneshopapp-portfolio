import { BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { initModels } from '../../test/helpers/init-models';
import { DiscountType, Discounts } from '../database/models';
import { DiscountsService } from './discounts.service';

const serviceWith = (discounts: Record<string, jest.Mock>, types: Record<string, jest.Mock> = {}) =>
  new DiscountsService(discounts as unknown as typeof Discounts, types as unknown as typeof DiscountType);

describe('DiscountsService', () => {
  beforeAll(() => { initModels(); });

  it('lists discounts with their products that are in stock', async () => {
    const findAll = jest.fn().mockResolvedValue([{ discount_id: 1 }]);
    expect(await serviceWith({ findAll }).list({})).toEqual([{ discount_id: 1 }]);
    const call = findAll.mock.calls[0][0];
    const product = call.include[0].include[0];
    expect(product.required).toBe(true);
    expect(product.where).toEqual({ stock: 1 });
    expect(product.include.map((i: { as: string }) => i.as)).toEqual(['product_information', 'variant_list', 'department', 'levertijd']);
  });

  it('with a date, only discounts valid on that date; with customer_id the favorite mark is loaded', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    await serviceWith({ findAll }).list({ date: '2022-11-30', customer_id: 'c-1' });
    const call = findAll.mock.calls[0][0];
    expect(call.where[Op.and][1]).toEqual({ starting_date: { [Op.lte]: '2022-11-30' }, end_date: { [Op.gte]: '2022-11-30' } });
    const product = call.include[0].include[0];
    expect(product.include.at(-1)).toMatchObject({ as: 'favorite_products_list', where: { customer_id: 'c-1' }, required: false });
  });

  it.each([['yesterday'], ['2022-1-1'], ['2022-11-30; DROP TABLE x']])('rejects the date %s', (date) => {
    expect(() => serviceWith({ findAll: jest.fn() }).list({ date })).toThrow(BadRequestException);
  });

  it('lists discount types', async () => {
    const findAll = jest.fn().mockResolvedValue([{ discounttype_id: 1 }]);
    expect(await serviceWith({}, { findAll }).listTypes({})).toEqual([{ discounttype_id: 1 }]);
  });
});
