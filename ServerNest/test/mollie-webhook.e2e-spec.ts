import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RULES } from '../src/auth/access/access.rules';
import { MollieWebhookController } from '../src/payments/mollie-webhook.controller';
import { OrderPaymentsService, UnknownPaymentError } from '../src/payments/order-payments.service';

const service = { handle: jest.fn() };

describe('mollie webhook', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [MollieWebhookController], providers: [{ provide: OrderPaymentsService, useValue: service }] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(() => app.close());

  it('takes the form encoded body Mollie sends and answers the payment status as text', async () => {
    service.handle.mockResolvedValue('paid');
    const res = await request(app.getHttpServer()).post('/api/v1/mollie/webhook').type('form').send({ id: 'tr_1' }).expect(200);
    expect(res.text).toBe('paid');
    expect(service.handle).toHaveBeenCalledWith({ id: 'tr_1' });
  });

  it('answers 422 for an unknown or invalid payment, so Mollie does not treat it as handled', async () => {
    service.handle.mockRejectedValue(new UnknownPaymentError('Unknown payment'));
    await request(app.getHttpServer()).post('/api/v1/mollie/webhook').send({ id: 'x' }).expect(422);
  });

  it('is public (Mollie sends no token)', () => {
    expect(RULES.v1.find((r) => r.method === 'POST' && r.regex.test('/mollie/webhook'))?.access).toBe('public');
  });
});
