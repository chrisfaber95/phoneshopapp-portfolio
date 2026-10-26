import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RULES, classify } from '../src/auth/access/access.rules';
import { CustomerSpaaractiesController } from '../src/spaaracties/customer-spaaracties.controller';
import { CustomerSpaaractiesService } from '../src/spaaracties/customer-spaaracties.service';
import { SpaaractiesController } from '../src/spaaracties/spaaracties.controller';
import { SpaaractiesService } from '../src/spaaracties/spaaracties.service';

const actions = { list: jest.fn().mockResolvedValue([]), single: jest.fn().mockResolvedValue({ actie: null }), create: jest.fn().mockResolvedValue({ ok: 1 }), update: jest.fn().mockResolvedValue({ ok: 2 }) };
const cards = {
  list: jest.fn().mockResolvedValue([]), forCustomer: jest.fn().mockResolvedValue([]), exchange: jest.fn().mockResolvedValue({ ok: 3 }),
  employeeUpdate: jest.fn().mockResolvedValue({ success: true }), employeeChange: jest.fn().mockResolvedValue({ success: true }), noStamps: jest.fn().mockReturnValue({ success: true }),
};

describe('savings actions and stamp cards', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SpaaractiesController, CustomerSpaaractiesController],
      providers: [{ provide: SpaaractiesService, useValue: actions }, { provide: CustomerSpaaractiesService, useValue: cards }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(() => app.close());

  it('serves the actions and a single action', async () => {
    const server = app.getHttpServer();
    await request(server).get('/api/v1/spaaractie').expect(200, []);
    await request(server).get('/api/v1/spaaractie/abc').expect(200, { actie: null });
    expect(actions.single).toHaveBeenCalledWith('abc');
  });

  it('creates and changes actions', async () => {
    const server = app.getHttpServer();
    await request(server).post('/api/v1/spaaractie').send({ title: 'x' }).expect(200, { ok: 1 });
    await request(server).put('/api/v1/spaaractie').send({ spaaractie_id: 'a' }).expect(200, { ok: 2 });
  });

  it('routes the employee functions to their handlers, not to /:customerId', async () => {
    const server = app.getHttpServer();
    await request(server).put('/api/v1/customer_spaaractie/employeeupdate').send({}).expect(200);
    await request(server).put('/api/v1/customer_spaaractie/employeechange').send({}).expect(200);
    await request(server).put('/api/v1/customer_spaaractie/nostamps').send({}).expect(200);
    await request(server).put('/api/v1/customer_spaaractie').send({ params: {} }).expect(200, { ok: 3 });
    await request(server).get('/api/v1/customer_spaaractie/c-1').expect(200);
    expect(cards.employeeUpdate).toHaveBeenCalledTimes(1);
    expect(cards.forCustomer).toHaveBeenCalledWith(null, 'c-1');
  });

  it('the access rules: reading actions is public, writing and the counter functions are for employees, cards are for owners', () => {
    const v1 = (method: string, path: string) => classify(RULES.v1, method, path);
    expect(v1('GET', '/spaaractie')).toBe('public');
    expect(v1('GET', '/spaaractie/abc')).toBe('public');
    expect(v1('POST', '/spaaractie')).toBe('user');
    expect(v1('PUT', '/spaaractie')).toBe('user');
    for (const name of ['employeeupdate', 'employeechange', 'nostamps']) expect(v1('PUT', `/customer_spaaractie/${name}`)).toBe('user');
    expect(v1('PUT', '/customer_spaaractie')).toBe('owner');
    expect(v1('GET', '/customer_spaaractie/c-1')).toBe('owner');
  });
});
