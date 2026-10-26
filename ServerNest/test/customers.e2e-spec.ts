import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { CustomersController } from '../src/customers/customers.controller';
import { FavoritesController, OrderInformationController } from '../src/customers/customers-related.controllers';
import { CustomersService } from '../src/customers/customers.service';
import { FavoritesService } from '../src/customers/favorites.service';
import { OrderInformationService } from '../src/customers/order-information.service';
import { ShoppingListsController } from '../src/shopping-lists/shopping-lists.controller';
import { ShoppingListsService } from '../src/shopping-lists/shopping-lists.service';
import { SiteController } from '../src/site/site.controller';
import { SiteService } from '../src/site/site.service';

const customers = {
  findWithToken: jest.fn(), findOne: jest.fn().mockResolvedValue({ customer_id: 'c-1' }), findOneByQuery: jest.fn().mockResolvedValue(null),
  findAllByQuery: jest.fn().mockResolvedValue([]), signUp: jest.fn().mockResolvedValue({ customer_id: 'c-9' }), update: jest.fn().mockResolvedValue({ data: { success: true } }),
  passwordReset: jest.fn().mockResolvedValue({ success: true }), deleteIsDisabled: jest.fn().mockReturnValue({ err: 'No' }),
};
const favorites = { list: jest.fn().mockReturnValue([]), add: jest.fn().mockResolvedValue([{}, true]), remove: jest.fn().mockResolvedValue(1) };
const information = { list: jest.fn().mockResolvedValue([]), remove: jest.fn().mockResolvedValue(1) };
const lists = { list: jest.fn().mockResolvedValue([]), single: jest.fn(), create: jest.fn().mockResolvedValue({ shopping_list_id: 'l-1' }) };
const site = { acceptCookies: jest.fn().mockResolvedValue({ message: 'cookie accepted' }), feedback: jest.fn().mockReturnValue({ success: true }) };

// Stands in for the access guard: "x-principal: customer:c-1" or "user:u-1" becomes req.principal
const start = async (): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    controllers: [CustomersController, FavoritesController, OrderInformationController, ShoppingListsController, SiteController],
    providers: [
      { provide: CustomersService, useValue: customers },
      { provide: FavoritesService, useValue: favorites },
      { provide: OrderInformationService, useValue: information },
      { provide: ShoppingListsService, useValue: lists },
      { provide: SiteService, useValue: site },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.use((req: Request & { principal?: unknown }, _res: Response, next: NextFunction) => {
    const header = req.headers['x-principal'];
    if (typeof header === 'string') {
      const [type, id] = header.split(':');
      req.principal = { type, id };
    }
    next();
  });
  app.setGlobalPrefix('api');
  await app.init();
  return app;
};

describe('customer endpoints', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await start(); });
  afterAll(async () => app.close());
  const http = () => app.getHttpServer();

  it('GET /customer answers the JSON string "No Auth" (a JSON value, not text/html)', async () => {
    customers.findWithToken.mockResolvedValueOnce('No Auth');
    const res = await request(http()).get('/api/v1/customer').expect(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.text).toBe('"No Auth"');
  });

  it('GET /customer/single: a customer reads themself; someone else 403; no token 401; employees 403 (customers only)', async () => {
    await request(http()).get('/api/v1/customer/single?customer_id=c-1').set('x-principal', 'customer:c-1').expect(200).expect({ user: { customer_id: 'c-1' } });
    await request(http()).get('/api/v1/customer/single?customer_id=c-2').set('x-principal', 'customer:c-1').expect(403);
    await request(http()).get('/api/v1/customer/single?customer_id=c-1').expect(401);
    await request(http()).get('/api/v1/customer/single?customer_id=c-1').set('x-principal', 'user:u-1').expect(403);
  });

  it('GET /customer/employee and /employee-all are for employees only; an unknown customer answers the JSON value null', async () => {
    await request(http()).get('/api/v1/customer/employee?email=a').expect(401);
    await request(http()).get('/api/v1/customer/employee?email=a').set('x-principal', 'customer:c-1').expect(403);
    const found = await request(http()).get('/api/v1/customer/employee?email=a').set('x-principal', 'user:u-1').expect(200);
    expect(found.text).toBe('null');
    await request(http()).get('/api/v1/customer/employee-all?email=a').set('x-principal', 'user:u-1').expect(200).expect([]);
    await request(http()).get('/api/v1/customer/employee-all').set('x-principal', 'customer:c-1').expect(403);
  });

  it('POST /customer signs up (HTTP 200) and POST /customer/passwordreset answers HTTP 200', async () => {
    await request(http()).post('/api/v1/customer').send({ email: 'a@b.nl', password: 'x' }).expect(200).expect({ customer_id: 'c-9' });
    await request(http()).post('/api/v1/customer/passwordreset').send({ user: { email: 'a@b.nl' } }).expect(200);
    expect(customers.passwordReset).toHaveBeenCalledWith({ user: { email: 'a@b.nl' } });
  });

  it('PUT /customer: only the customer themself, never someone else', async () => {
    const body = { user: { customer_id: 'c-1', first_name: 'Piet' } };
    await request(http()).put('/api/v1/customer').send(body).expect(401);
    await request(http()).put('/api/v1/customer').set('x-principal', 'customer:c-2').send(body).expect(403);
    await request(http()).put('/api/v1/customer').set('x-principal', 'user:u-1').send(body).expect(403);
    await request(http()).put('/api/v1/customer').set('x-principal', 'customer:c-1').send(body).expect(200).expect({ data: { success: true } });
    expect(customers.update).toHaveBeenCalledTimes(1);
    expect(customers.update).toHaveBeenCalledWith('c-1', body.user);
  });

  it('DELETE /customer is switched off', async () => {
    await request(http()).delete('/api/v1/customer').expect(200).expect({ err: 'No' });
  });

  it('favorites and saved addresses pass the principal on', async () => {
    await request(http()).post('/api/v1/customer_favorites').set('x-principal', 'customer:c-1').send({ user_id: 'c-1', product_id: 1 }).expect(200);
    expect(favorites.add).toHaveBeenCalledWith({ type: 'customer', id: 'c-1' }, { user_id: 'c-1', product_id: 1 });
    await request(http()).delete('/api/v1/customer_favorites').set('x-principal', 'customer:c-1').send({ fav_id: 5 }).expect(200).expect('1');
    await request(http()).get('/api/v1/order_information?customer_id=c-1').set('x-principal', 'customer:c-1').expect(200);
    expect(information.list).toHaveBeenCalledWith({ type: 'customer', id: 'c-1' }, { customer_id: 'c-1' });
    await request(http()).delete('/api/v1/order_information').send({ order_information_id: 'o-1' }).expect(200);
    expect(information.remove).toHaveBeenCalledWith(null, { order_information_id: 'o-1' });
  });

  it('shopping lists: list, single (JSON null for an unknown list), create', async () => {
    lists.single.mockResolvedValueOnce({ shopping_list_id: 'l-1' }).mockResolvedValueOnce(null);
    await request(http()).get('/api/v1/shoppinglist').expect(200).expect([]);
    await request(http()).get('/api/v1/shoppinglist/l-1').expect(200).expect({ shopping_list_id: 'l-1' });
    const unknown = await request(http()).get('/api/v1/shoppinglist/nope').expect(200);
    expect(unknown.text).toBe('null');
    await request(http()).post('/api/v1/shoppinglist').send({ shoppinglist_products: [] }).expect(200).expect({ shopping_list_id: 'l-1' });
  });

  it('cookies and feedback answer HTTP 200', async () => {
    await request(http()).post('/api/v1/site/cookies').set('user-agent', 'agent').send({ ip: '1.2.3.4' }).expect(200).expect({ message: 'cookie accepted' });
    expect(site.acceptCookies).toHaveBeenCalledWith('agent', { ip: '1.2.3.4' });
    await request(http()).post('/api/v1/feedback').send({ details: { email: 'a@b.nl' } }).expect(200);
  });
});
