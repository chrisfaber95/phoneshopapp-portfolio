import { BadRequestException } from '@nestjs/common';
import { initModels } from '../../test/helpers/init-models';
import { Product, Productinformation } from '../database/models';
import { ProductsService } from './products.service';

const serviceWith = (products: Record<string, jest.Mock>, information: Record<string, jest.Mock> = {}) =>
  new ProductsService(products as unknown as typeof Product, information as unknown as typeof Productinformation);

const aliases = (call: { include: { as?: string }[] }) => call.include.map((i) => i.as);

describe('ProductsService', () => {
  beforeAll(() => { initModels(); });

  it('lists products with their related data (no customer: no favorites)', async () => {
    const findAll = jest.fn().mockResolvedValue([{ id: 1 }]);
    const result = await serviceWith({ findAll }).list({ department_id: '180' });
    expect(result).toEqual([{ id: 1 }]);
    const call = findAll.mock.calls[0][0];
    expect(call.where).toEqual({ department_id: '180' });
    expect(aliases(call)).toEqual(['product_information', 'variant_list', 'department', 'levertijd', 'product_has_discount_list']);
    expect(call.limit).toBeUndefined();
  });

  it('with customer_id it also loads that customer\'s favorite mark and does not use customer_id as a column filter', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    await serviceWith({ findAll }).list({ customer_id: 'c-1', ean: '10010' });
    const call = findAll.mock.calls[0][0];
    expect(call.where).toEqual({ ean: '10010' });
    expect(aliases(call)).toContain('favorite_products_list');
    expect(call.include.at(-1).where).toEqual({ customer_id: 'c-1' });
    expect(call.include.at(-1).required).toBe(false);
  });

  it('passes limit and offset on (optional paging)', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    await serviceWith({ findAll }).list({ limit: '50', offset: '100' });
    expect(findAll.mock.calls[0][0]).toMatchObject({ limit: 50, offset: 100, where: {} });
  });

  it('rejects an unknown column and a bad limit before touching the database', () => {
    const findAll = jest.fn();
    expect(() => serviceWith({ findAll }).list({ password: 'x' })).toThrow(BadRequestException);
    expect(() => serviceWith({ findAll }).list({ limit: 'many' })).toThrow(BadRequestException);
    expect(findAll).not.toHaveBeenCalled();
  });

  it('single: finds by ean with nutrients, variants, department, delivery time and discounts', async () => {
    const findOne = jest.fn().mockResolvedValue({ ean: '10010' });
    expect(await serviceWith({ findOne }).single('10010')).toEqual({ ean: '10010' });
    const call = findOne.mock.calls[0][0];
    expect(call.where).toEqual({ ean: '10010' });
    expect(aliases(call)).toEqual(['product_information', 'nutrients', 'variant_list', 'department', 'levertijd', 'product_has_discount_list']);
  });

  it('allInformation lists all product information', async () => {
    const findAll = jest.fn().mockResolvedValue([{ id: 1 }]);
    expect(await serviceWith({}, { findAll }).allInformation()).toEqual([{ id: 1 }]);
  });
});
