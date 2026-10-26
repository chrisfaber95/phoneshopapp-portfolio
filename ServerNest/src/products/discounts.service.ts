import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { whereFromQuery } from '../common/query-filter';
import { DiscountType, Discounts, Product, ProductHasDiscount } from '../database/models';
import { departmentOptional, deliveryTime, favoritesOf, productInformationPlain, variants } from './product-includes';

const DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(Discounts) private readonly discounts: typeof Discounts,
    @InjectModel(DiscountType) private readonly types: typeof DiscountType,
  ) {}

  // GET /api/v1/discounts?[date=YYYY-MM-DD][&customer_id=<id>][&<column>=<value>]
  // The discounts (optionally only those valid on `date`) with their products that are in stock; with customer_id every
  // product carries that customer's favorite mark.
  list(query: Record<string, unknown>): Promise<Discounts[]> {
    const customerId = typeof query.customer_id === 'string' && query.customer_id !== '' ? query.customer_id : null;
    const date = query.date;
    if (date !== undefined && (typeof date !== 'string' || !DATE.test(date))) throw new BadRequestException({ error: 'date must be YYYY-MM-DD' });

    const where: WhereOptions[] = [whereFromQuery(Discounts, query, ['customer_id', 'date'])];
    if (date !== undefined) where.push({ starting_date: { [Op.lte]: date }, end_date: { [Op.gte]: date } });

    return this.discounts.findAll({
      where: { [Op.and]: where },
      include: [
        {
          model: ProductHasDiscount,
          as: 'product_discount_list',
          include: [
            {
              model: Product,
              as: 'product_discount',
              required: true,
              where: { stock: 1 },
              include: [productInformationPlain, variants, departmentOptional, deliveryTime, ...(customerId ? [favoritesOf(customerId)] : [])],
            },
          ],
        },
      ],
      logging: false,
    });
  }

  // GET /api/v1/discounts/types
  listTypes(query: Record<string, unknown>): Promise<DiscountType[]> {
    return this.types.findAll({ where: whereFromQuery(DiscountType, query), logging: false });
  }
}
