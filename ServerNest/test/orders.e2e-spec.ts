import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RULES } from '../src/auth/access/access.rules';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersCreateService } from '../src/orders/orders-create.service';
import { OrdersUpdateService } from '../src/orders/orders-update.service';
import { OrdersService } from '../src/orders/orders.service';

const creating = { create: jest.fn().mockResolvedValue({ payment: 'https://pay.test/checkout', success: true }) };
const updating = { update: jest.fn().mockResolvedValue({ success: true }) };
const orders = { list: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue([]), single: jest.fn() };

describe('orders (read side)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [OrdersController], providers: [{ provide: OrdersService, useValue: orders }, { provide: OrdersCreateService, useValue: creating }, { provide: OrdersUpdateService, useValue: updating }] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(() => app.close());

  it('lists orders on / and on /:date', async () => {
    await request(app.getHttpServer()).get('/api/v1/order').expect(200, []);
    await request(app.getHttpServer()).get('/api/v1/order/2026-05-01').expect(200, []);
    expect(orders.list).toHaveBeenCalledTimes(2);
  });

  it('places an order and passes the body and the Origin header on', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/order').set('Origin', 'https://shop.test').send({ orderDetails: {} }).expect(200);
    expect(res.body).toEqual({ payment: 'https://pay.test/checkout', success: true });
    expect(creating.create).toHaveBeenCalledWith(null, { orderDetails: {} }, 'https://shop.test');
  });

  it('passes an update with the order reference and the body on', async () => {
    await request(app.getHttpServer()).put('/api/v1/order/abc').send({ type: 'Storepayment', picker: 'jan' }).expect(200, { success: true });
    expect(updating.update).toHaveBeenCalledWith(null, 'abc', { type: 'Storepayment', picker: 'jan' });
  });

  it('counts per day', async () => {
    await request(app.getHttpServer()).get('/api/v1/order/count/2026-05-01').expect(200, []);
    expect(orders.count).toHaveBeenCalledWith('2026-05-01');
  });

  it('answers JSON null for an unknown order', async () => {
    orders.single.mockResolvedValue(null);
    const res = await request(app.getHttpServer()).get('/api/v1/order/single/abc').expect(200);
    expect(res.text).toBe('null');
  });

  it('the access rules: the list needs a login, count and single are public', () => {
    const rule = (path: string) => RULES.v1.find((r) => r.method === 'GET' && r.regex.test(path))?.access;
    expect(rule('/order')).toBe('owner');
    expect(rule('/order/2026-05-01')).toBe('owner');
    expect(rule('/order/count/2026-05-01')).toBe('public');
    expect(rule('/order/single/abc')).toBe('public');
  });
});
