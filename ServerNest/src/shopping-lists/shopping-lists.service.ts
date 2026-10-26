import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { whereFromQuery } from '../common/query-filter';
import { Product, ShoppingList, ShoppingListHasProduct } from '../database/models';
import { productInformationPlain } from '../products/product-includes';

const withProducts = [
  {
    model: ShoppingListHasProduct,
    as: 'shoppinglist_products',
    include: [{ model: Product, as: 'product', include: [productInformationPlain] }],
  },
];

// Shopping lists (ShoppingList with their products). The customer a list belongs to is never part of an answer.
@Injectable()
export class ShoppingListsService {
  private readonly logger = new Logger(ShoppingListsService.name);

  constructor(@InjectModel(ShoppingList) private readonly lists: typeof ShoppingList) {}

  // GET /shoppinglist?<column>=: the lists with their products (employees)
  list(query: Record<string, unknown>): Promise<ShoppingList[]> {
    return this.lists.findAll({ where: whereFromQuery(ShoppingList, query), include: withProducts, attributes: { exclude: ['customer_id'] }, logging: false });
  }

  // GET /shoppinglist/:listId: one list, for sharing by link (the id is a UUID); null when unknown
  single(listId: string): Promise<ShoppingList | null> {
    return this.lists.findByPk(listId, { include: withProducts, attributes: { exclude: ['customer_id'] }, logging: false });
  }

  // POST /shoppinglist { customer_id?, shoppinglist_products: [{ product_id, amount }] }
  async create(body: Record<string, unknown>): Promise<ShoppingList | { err: string }> {
    try {
      const products = Array.isArray(body.shoppinglist_products) ? (body.shoppinglist_products as { product_id?: number; amount?: number }[]) : [];
      return await this.lists.create(
        {
          customer_id: typeof body.customer_id === 'string' && body.customer_id !== '' ? body.customer_id : null,
          shoppinglist_products: products.map((p) => ({ product_id: p.product_id, amount: p.amount })),
        },
        { include: [{ model: ShoppingListHasProduct, as: 'shoppinglist_products' }], logging: false },
      );
    } catch (err) {
      this.logger.error(`creating a shopping list failed: ${(err as Error).message}`);
      return { err: 'Aanmaken mislukt' };
    }
  }
}
