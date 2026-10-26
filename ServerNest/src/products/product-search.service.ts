import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Product } from '../database/models';

// Relevance of a search text: matches in the product itself count 3x, matches in the product information 2.2x
const relevanceQuery = (productText: string, infoText: string) => `
  SELECT info.*, Product.* FROM (
    SELECT eancode, SUM(relevance) AS totalrelevance FROM (
      SELECT 'product' AS 'table_name', ean AS eancode,
             3 * (MATCH(ean, categoryname2, categoryname1) AGAINST (${productText})) AS relevance
      FROM Product AS p
      UNION
      SELECT 'info' AS 'table_name', ean AS eancode,
             2.2 * (MATCH(omschrijving, title, variant, ingredients) AGAINST (${infoText})) AS relevance
      FROM Product_Information AS pi
    ) AS sitewide
    WHERE relevance > 0
    GROUP BY eancode
    ORDER BY totalrelevance DESC
    LIMIT 0, 50
  ) AS info, Product
  WHERE info.eancode = Product.ean`;

const INFO_TITLE = 'SELECT title FROM Product_Information WHERE ean = :ean LIMIT 1';

const text = (value: unknown): string | null => (typeof value === 'string' ? value : null);

// GET /api/v1/product/search?search=<text>[&department_id=<id>]: same ranking as the old Server, but with bound parameters
// instead of text built into the SQL.
@Injectable()
export class ProductSearchService {
  constructor(@InjectConnection() private readonly connection: Sequelize) {}

  private run(sql: string, replacements: Record<string, string | null>): Promise<Product[]> {
    return this.connection.query(sql, { replacements, type: QueryTypes.SELECT, model: Product, mapToModel: true, nest: true, raw: false, logging: false }) as Promise<Product[]>;
  }

  async search(query: Record<string, unknown>): Promise<Product[]> {
    const search = text(query.search);
    const departmentId = text(query.department_id);

    // an 8 digit number is an EAN-8 (exact or prefix match), "code_128..." a code 128 barcode (exact match)
    let extra = '';
    if (search !== null && /^[0-9]{8}$/.test(search)) extra = ' AND (Product.ean = :search OR Product.ean LIKE :ean_prefix)';
    else if (search !== null && /^code_128/.test(search)) extra = ' AND Product.ean = :search';
    if (departmentId !== null) extra += ' AND Product.department_id = :department_id';

    const products = await this.run(`${relevanceQuery(':search', ':search')}
      AND Product.stock >= 1 AND beschikbaar IS NOT NULL AND department_id IS NOT NULL${extra}
      LIMIT 0, 50;`, { search, ean_prefix: `${search}%`, department_id: departmentId });

    // exactly one hit: add the products that are most like it (same category and title)
    if (products.length !== 1) return products;
    const [first] = products;
    const titles = await this.connection.query<{ title: string }>(INFO_TITLE, { replacements: { ean: first.ean }, type: QueryTypes.SELECT, logging: false });
    if (titles.length === 0) return [];
    const similar = await this.run(`${relevanceQuery(':category', ':title')}
      AND Product.stock >= 1 AND beschikbaar IS NOT NULL AND department_id IS NOT NULL;`, { category: first.categoryname1, title: titles[0].title });
    return [first, ...similar];
  }
}
