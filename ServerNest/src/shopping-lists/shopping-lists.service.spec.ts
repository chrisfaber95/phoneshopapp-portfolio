import { initModels } from '../../test/helpers/init-models';
import { ShoppingList } from '../database/models';
import { ShoppingListsService } from './shopping-lists.service';

const serviceWith = (lists: Record<string, jest.Mock>) => new ShoppingListsService(lists as unknown as typeof ShoppingList);

describe('ShoppingListsService', () => {
  beforeAll(() => { initModels(); });

  it('lists shopping lists with their products, never with the customer they belong to', async () => {
    const findAll = jest.fn().mockResolvedValue([{ shopping_list_id: 'l-1' }]);
    expect(await serviceWith({ findAll }).list({ shopping_list_id: 'l-1' })).toEqual([{ shopping_list_id: 'l-1' }]);
    const call = findAll.mock.calls[0][0];
    expect(call.where).toEqual({ shopping_list_id: 'l-1' });
    expect(call.attributes).toEqual({ exclude: ['customer_id'] });
    expect(call.include[0].as).toBe('shoppinglist_products');
  });

  it('one list by id, loaded the same way', async () => {
    const findByPk = jest.fn().mockResolvedValue({ shopping_list_id: 'l-1' });
    expect(await serviceWith({ findByPk }).single('l-1')).toEqual({ shopping_list_id: 'l-1' });
    expect(findByPk.mock.calls[0][1].attributes).toEqual({ exclude: ['customer_id'] });
  });

  it('creates a list with its products; only product_id and amount are taken', async () => {
    const create = jest.fn().mockResolvedValue({ shopping_list_id: 'l-1' });
    await serviceWith({ create }).create({ customer_id: 'c-1', shoppinglist_products: [{ product_id: 1, amount: 2, shopping_list_id: 'other', list_product_id: 9 }] });
    expect(create.mock.calls[0][0]).toEqual({ customer_id: 'c-1', shoppinglist_products: [{ product_id: 1, amount: 2 }] });
    expect(create.mock.calls[0][1].include[0].as).toBe('shoppinglist_products');
  });

  it('a list without customer or products is still a list; a failure answers { err }', async () => {
    const create = jest.fn().mockResolvedValue({});
    await serviceWith({ create }).create({});
    expect(create.mock.calls[0][0]).toEqual({ customer_id: null, shoppinglist_products: [] });
    expect(await serviceWith({ create: jest.fn().mockRejectedValue(new Error('x')) }).create({})).toEqual({ err: 'Aanmaken mislukt' });
  });
});
