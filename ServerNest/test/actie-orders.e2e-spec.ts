import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RULES, classify } from '../src/auth/access/access.rules';
import { ActieOrdersCreateService } from '../src/actie-orders/actie-orders-create.service';
import { ActieOrdersUpdateService } from '../src/actie-orders/actie-orders-update.service';
import { ActieOrdersController } from '../src/actie-orders/actie-orders.controller';
import { ActieOrdersService } from '../src/actie-orders/actie-orders.service';

const reading = { list: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue({ ordercounter: [] }), single: jest.fn().mockResolvedValue(null) };
const creating = { create: jest.fn().mockResolvedValue({ message: 'Bestelling verwerkt', success: true }) };
const updating = { update: jest.fn().mockResolvedValue({ ok: true }) };

describe('actie orders', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ActieOrdersController],
      providers: [{ provide: ActieOrdersService, useValue: reading }, { provide: ActieOrdersCreateService, useValue: creating }, { provide: ActieOrdersUpdateService, useValue: updating }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(() => app.close());

  it('lists on / and /:date, counts, answers JSON null for an unknown order', async () => {
    const server = app.getHttpServer();
    await request(server).get('/api/v1/actie_order').expect(200, []);
    await request(server).get('/api/v1/actie_order/2026-05-01').expect(200, []);
    expect(reading.list).toHaveBeenCalledTimes(2);
    await request(server).get('/api/v1/actie_order/count/2026-05-01').expect(200, { ordercounter: [] });
    const single = await request(server).get('/api/v1/actie_order/single/abc').expect(200);
    expect(single.text).toBe('null');
  });

  it('places and changes orders', async () => {
    const server = app.getHttpServer();
    await request(server).post('/api/v1/actie_order').send({ orderDetails: {} }).expect(200, { message: 'Bestelling verwerkt', success: true });
    await request(server).put('/api/v1/actie_order/ao-1').send({ type: 'Update' }).expect(200, { ok: true });
    expect(updating.update).toHaveBeenCalledWith(null, 'ao-1', { type: 'Update' });
  });

  it('the access rules: placing, counting and the mail link are public; listing and updating are for employees', () => {
    const v1 = (method: string, path: string) => classify(RULES.v1, method, path);
    expect(v1('POST', '/actie_order')).toBe('public');
    expect(v1('GET', '/actie_order/count/2026-05-01')).toBe('public');
    expect(v1('GET', '/actie_order/single/abc')).toBe('public');
    expect(v1('GET', '/actie_order')).toBe('user');
    expect(v1('GET', '/actie_order/2026-05-01')).toBe('user');
    expect(v1('PUT', '/actie_order/ao-1')).toBe('user');
  });
});
