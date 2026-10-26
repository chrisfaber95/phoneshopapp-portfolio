import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { initModels } from '../../test/helpers/init-models';
import { Principal } from '../auth/principal.service';
import { CustomerHasFavorite } from '../database/models';
import { FavoritesService } from './favorites.service';

const serviceWith = (favorites: Record<string, jest.Mock>) => new FavoritesService(favorites as unknown as typeof CustomerHasFavorite);

const customer: Principal = { type: 'customer', id: 'c-1' };
const employee: Principal = { type: 'user', id: 'u-1' };

describe('FavoritesService', () => {
  beforeAll(() => { initModels(); });

  describe('list', () => {
    it('answers "No user selected" without a customer_id', () => {
      const findAll = jest.fn();
      expect(serviceWith({ findAll }).list({ stock: '1' })).toEqual({ err: 'No user selected' });
      expect(findAll).not.toHaveBeenCalled();
    });

    it('lists the favorites of that customer with their products; the customer is sent without secrets', async () => {
      const findAll = jest.fn().mockResolvedValue([{ customer_has_favorite_id: 1 }]);
      const result = await serviceWith({ findAll }).list({ customer_id: 'c-1', stock: '1' });
      expect(result).toEqual([{ customer_has_favorite_id: 1 }]);
      const call = findAll.mock.calls[0][0];
      expect(call.where).toEqual({});
      const [product, owner] = call.include;
      expect(product.where).toEqual({ stock: '1' });
      expect(product.required).toBe(false);
      expect(owner.where).toEqual({ customer_id: 'c-1' });
      expect(owner.attributes.exclude).toEqual(['password', 'accessToken', 'resettoken']);
    });

    it('without stock the products are not restricted by stock', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await serviceWith({ findAll }).list({ customer_id: 'c-1' });
      expect(findAll.mock.calls[0][0].include[0]).not.toHaveProperty('where');
    });
  });

  describe('add', () => {
    it('adds a favorite for the customer themself and answers [favorite, created]', async () => {
      const findOrCreate = jest.fn().mockResolvedValue([{ customer_has_favorite_id: 5 }, true]);
      expect(await serviceWith({ findOrCreate }).add(customer, { user_id: 'c-1', product_id: 7 })).toEqual([{ customer_has_favorite_id: 5 }, true]);
      expect(findOrCreate.mock.calls[0][0].where).toEqual({ customer_id: 'c-1', product_id: 7 });
    });

    it('a customer cannot add a favorite for someone else; without a token it is 401; employees may', async () => {
      const findOrCreate = jest.fn().mockResolvedValue([{}, true]);
      const service = serviceWith({ findOrCreate });
      await expect(service.add(customer, { user_id: 'c-2', product_id: 7 })).rejects.toThrow(ForbiddenException);
      await expect(service.add(null, { user_id: 'c-1', product_id: 7 })).rejects.toThrow(UnauthorizedException);
      expect(findOrCreate).not.toHaveBeenCalled();
      await service.add(employee, { user_id: 'c-2', product_id: 7 });
      expect(findOrCreate).toHaveBeenCalledTimes(1);
    });

    it('answers { err } when the database refuses', async () => {
      expect(await serviceWith({ findOrCreate: jest.fn().mockRejectedValue(new Error('x')) }).add(customer, { user_id: 'c-1', product_id: 1 })).toEqual({ err: 'Toevoegen mislukt' });
    });
  });

  describe('remove', () => {
    const favorite = (customerId: string) => ({ customer_has_favorite_id: 5, customer_id: customerId });

    it('removes the customer\'s own favorite and answers the number removed', async () => {
      const destroy = jest.fn().mockResolvedValue(1);
      expect(await serviceWith({ findByPk: jest.fn().mockResolvedValue(favorite('c-1')), destroy }).remove(customer, { fav_id: 5 })).toBe(1);
      expect(destroy.mock.calls[0][0].where).toEqual({ customer_has_favorite_id: 5 });
    });

    it('never removes the favorite of another customer (the old Server checked nothing)', async () => {
      const destroy = jest.fn();
      const service = serviceWith({ findByPk: jest.fn().mockResolvedValue(favorite('c-2')), destroy });
      await expect(service.remove(customer, { fav_id: 5 })).rejects.toThrow(ForbiddenException);
      expect(destroy).not.toHaveBeenCalled();
    });

    it('needs a token; an unknown favorite answers 0; employees may remove any', async () => {
      const destroy = jest.fn().mockResolvedValue(1);
      await expect(serviceWith({ findByPk: jest.fn(), destroy }).remove(null, { fav_id: 5 })).rejects.toThrow(UnauthorizedException);
      expect(await serviceWith({ findByPk: jest.fn().mockResolvedValue(null), destroy }).remove(customer, { fav_id: 5 })).toBe(0);
      expect(await serviceWith({ findByPk: jest.fn().mockResolvedValue(favorite('c-2')), destroy }).remove(employee, { fav_id: 5 })).toBe(1);
    });

    it('answers { err } when the database fails', async () => {
      expect(await serviceWith({ findByPk: jest.fn().mockRejectedValue(new Error('x')) }).remove(customer, { fav_id: 5 })).toEqual({ err: 'Verwijderen mislukt' });
    });
  });
});
