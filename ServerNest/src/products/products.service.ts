import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PAGING_KEYS, pagingFromQuery } from '../common/paging';
import { whereFromQuery } from '../common/query-filter';
import { Product, Productinformation } from '../database/models';
import { department, departmentOptional, deliveryTime, discounts, favoritesOf, nutrients, productInformation, productInformationPlain, variants } from './product-includes';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product) private readonly products: typeof Product,
    @InjectModel(Productinformation) private readonly information: typeof Productinformation,
  ) {}

  // GET /api/v1/product?<column>=<value>[&customer_id=<id>][&limit=&offset=]
  // With customer_id every product also carries that customer's favorite mark (favorite_products_list).
  list(query: Record<string, unknown>): Promise<Product[]> {
    const customerId = typeof query.customer_id === 'string' && query.customer_id !== '' ? query.customer_id : null;
    const where = whereFromQuery(Product, query, ['customer_id', ...PAGING_KEYS]);
    const { limit, offset } = pagingFromQuery(query);
    return this.products.findAll({
      where,
      include: customerId
        ? [productInformation, variants, departmentOptional, deliveryTime, discounts, favoritesOf(customerId)]
        : [productInformation, variants, department, deliveryTime, discounts],
      limit,
      offset,
      logging: false,
    });
  }

  // GET /api/v1/product/:ean: one product with all its related data including the nutrition facts; null when unknown
  single(ean: string): Promise<Product | null> {
    return this.products.findOne({
      where: { ean },
      include: [productInformationPlain, nutrients, variants, department, deliveryTime, discounts],
      logging: false,
    });
  }

  // GET /api/v1/info: the product information of every product (used by the admin app)
  allInformation(): Promise<Productinformation[]> {
    return this.information.findAll({ logging: false });
  }
}
