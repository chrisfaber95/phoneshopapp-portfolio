import { Sequelize } from 'sequelize-typescript';
import { ProductSearchService } from './product-search.service';

const serviceWith = (query: jest.Mock) => new ProductSearchService({ query } as unknown as Sequelize);
const sqlOf = (query: jest.Mock, call: number): string => query.mock.calls[call][0];
const replacementsOf = (query: jest.Mock, call: number): Record<string, unknown> => query.mock.calls[call][1].replacements;

describe('ProductSearchService', () => {
  it('searches with bound parameters: the search text never ends up inside the SQL', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await serviceWith(query).search({ search: "o'hara\" OR 1=1 --" });
    expect(sqlOf(query, 0)).not.toContain('hara');
    expect(sqlOf(query, 0)).toContain('AGAINST (:search)');
    expect(replacementsOf(query, 0).search).toBe("o'hara\" OR 1=1 --");
  });

  it('only shows products that are in stock, available and in a department, at most 50', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await serviceWith(query).search({ search: 'melk' });
    const sql = sqlOf(query, 0);
    expect(sql).toContain('Product.stock >= 1');
    expect(sql).toContain('beschikbaar IS NOT NULL');
    expect(sql).toContain('department_id IS NOT NULL');
    expect(sql).toMatch(/LIMIT 0, 50;\s*$/);
  });

  it('an 8 digit number also matches the EAN exactly or by prefix', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await serviceWith(query).search({ search: '40365671' });
    expect(sqlOf(query, 0)).toContain('Product.ean = :search OR Product.ean LIKE :ean_prefix');
    expect(replacementsOf(query, 0).ean_prefix).toBe('40365671%');
  });

  it('a code 128 barcode matches the EAN exactly', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await serviceWith(query).search({ search: 'code_128_10010' });
    expect(sqlOf(query, 0)).toContain('AND Product.ean = :search');
    expect(sqlOf(query, 0)).not.toContain('LIKE');
  });

  it('department_id narrows the search', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await serviceWith(query).search({ search: 'melk', department_id: '180' });
    expect(sqlOf(query, 0)).toContain('Product.department_id = :department_id');
    expect(replacementsOf(query, 0).department_id).toBe('180');
  });

  it('no text (or a list instead of text) finds nothing without failing', async () => {
    const query = jest.fn().mockResolvedValue([]);
    expect(await serviceWith(query).search({})).toEqual([]);
    expect(replacementsOf(query, 0).search).toBeNull();
    await serviceWith(query).search({ search: ['a', 'b'] });
    expect(replacementsOf(query, 1).search).toBeNull();
  });

  it('several hits are returned as they are (one query)', async () => {
    const query = jest.fn().mockResolvedValue([{ ean: '1' }, { ean: '2' }]);
    expect(await serviceWith(query).search({ search: 'melk' })).toEqual([{ ean: '1' }, { ean: '2' }]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('exactly one hit is followed by the products most like it (same category and title)', async () => {
    const first = { ean: '1', categoryname1: 'Zuivel' };
    const query = jest.fn()
      .mockResolvedValueOnce([first])
      .mockResolvedValueOnce([{ title: 'Halfvolle melk' }])
      .mockResolvedValueOnce([{ ean: '2' }, { ean: '3' }]);
    expect(await serviceWith(query).search({ search: '40365671' })).toEqual([first, { ean: '2' }, { ean: '3' }]);
    expect(replacementsOf(query, 1)).toEqual({ ean: '1' });
    expect(sqlOf(query, 2)).toContain('MATCH(ean, categoryname2, categoryname1) AGAINST (:category)');
    expect(sqlOf(query, 2)).toContain('AGAINST (:title)');
    expect(replacementsOf(query, 2)).toEqual({ category: 'Zuivel', title: 'Halfvolle melk' });
  });

  it('one hit without product information answers an empty list (as the old Server did)', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ ean: '1' }]).mockResolvedValueOnce([]);
    expect(await serviceWith(query).search({ search: '40365671' })).toEqual([]);
  });
});
