import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { assertCustomerAccess } from '../auth/ownership';
import { Principal } from '../auth/principal.service';
import { whereFromQuery } from '../common/query-filter';
import { Customer, CustomerHasFavorite, Department, Product } from '../database/models';
import { deliveryTime, discounts, productInformationPlain } from '../products/product-includes';
import { SECRET_COLUMNS } from './customer-fields';

// A customer's favorite products (Customer_has_Favorite)
@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(@InjectModel(CustomerHasFavorite) private readonly favorites: typeof CustomerHasFavorite) {}

  // GET /customer_favorites?customer_id=[&stock=][&<column>=]: the favorites with their products (optionally only those with
  // that stock value) and the customer (without secrets: the old Server sent the password hash with every favorite)
  list(query: Record<string, unknown>): Promise<CustomerHasFavorite[]> | { err: string } {
    const customerId = query.customer_id;
    if (typeof customerId !== 'string' || customerId === '') return { err: 'No user selected' };
    const stock = typeof query.stock === 'string' ? query.stock : undefined;

    return this.favorites.findAll({
      where: whereFromQuery(CustomerHasFavorite, query, ['customer_id', 'stock']),
      include: [
        {
          model: Product,
          as: 'favorite_product',
          required: false,
          ...(stock !== undefined ? { where: { stock } } : {}),
          include: [
            productInformationPlain,
            { model: Department, as: 'department' },
            deliveryTime,
            { model: CustomerHasFavorite, as: 'favorite_products_list', where: { customer_id: customerId }, required: true },
            discounts,
          ],
        },
        { model: Customer, as: 'customer', where: { customer_id: customerId }, required: true, attributes: { exclude: SECRET_COLUMNS } },
      ],
      logging: false,
    });
  }

  // POST /customer_favorites { user_id, product_id }: marks a product as favorite (once). Answers [favorite, created] like the old
  // Server. A customer can only add to their own favorites.
  async add(principal: Principal | null, body: Record<string, unknown>): Promise<unknown> {
    assertCustomerAccess(principal, body.user_id);
    try {
      return await this.favorites.findOrCreate({ where: { customer_id: body.user_id as string, product_id: body.product_id as number }, logging: false });
    } catch (err) {
      this.logger.error(`adding a favorite failed: ${(err as Error).message}`);
      return { err: 'Toevoegen mislukt' };
    }
  }

  // DELETE /customer_favorites { fav_id }: removes one favorite and answers the number removed. A customer can only remove their own.
  async remove(principal: Principal | null, body: Record<string, unknown>): Promise<number | { err: string }> {
    if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
    let favorite: CustomerHasFavorite | null;
    try {
      favorite = await this.favorites.findByPk(body.fav_id as number, { logging: false });
    } catch (err) {
      this.logger.error(`looking up a favorite failed: ${(err as Error).message}`);
      return { err: 'Verwijderen mislukt' };
    }
    if (!favorite) return 0;
    assertCustomerAccess(principal, favorite.customer_id);
    try {
      return await this.favorites.destroy({ where: { customer_has_favorite_id: favorite.customer_has_favorite_id }, logging: false });
    } catch (err) {
      this.logger.error(`removing a favorite failed: ${(err as Error).message}`);
      return { err: 'Verwijderen mislukt' };
    }
  }
}
