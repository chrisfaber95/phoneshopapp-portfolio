import { initModels } from '../../test/helpers/init-models';
import { Order } from '../database/models';
import { MailService } from '../mail/mail.service';
import { MollieService } from './mollie.service';
import { OrderPaymentsService, UnknownPaymentError } from './order-payments.service';

const setup = (over: { payment?: { id: string; status: string } | null; order?: Record<string, unknown> | null; updated?: number; full?: unknown } = {}) => {
  const orders = {
    findOne: jest.fn().mockResolvedValue(over.order === undefined ? { uuid_id: 'o-1', status: 'pending' } : over.order),
    update: jest.fn().mockResolvedValue([over.updated ?? 1]),
    findByPk: jest.fn().mockResolvedValue(
      over.full ?? {
        order_information: { customerEmail: 'jan@example.invalid', customer: null },
        get: () => ({ pickupTime: '10:30:00', totalPrice: '10.70', delivery: false, product_list: [{ amount: 2, product: { product_information: { title: 'Melk', variant: '1L' } } }] }),
      },
    ),
  };
  const mollie = { getPayment: jest.fn().mockResolvedValue(over.payment === undefined ? { id: 'tr_1', status: 'paid', checkoutUrl: null } : over.payment) };
  const mail = { order: jest.fn((to: string, html: string) => ({ to, html })), send: jest.fn().mockResolvedValue(true) };
  const service = new OrderPaymentsService(orders as unknown as typeof Order, mollie as unknown as MollieService, mail as unknown as MailService);
  return { service, orders, mollie, mail };
};

describe('OrderPaymentsService', () => {
  beforeAll(() => { initModels(); });

  it('a paid first payment turns the pending order into ordered and mails the customer', async () => {
    const { service, orders, mail } = setup();
    await expect(service.handle({ id: 'tr_1' })).resolves.toBe('paid');
    expect(orders.update).toHaveBeenCalledWith({ status: 'ordered' }, expect.objectContaining({ where: { uuid_id: 'o-1', status: 'pending' } }));
    expect(mail.order).toHaveBeenCalledWith('jan@example.invalid', expect.stringContaining('Melk'));
    expect(mail.send).toHaveBeenCalledTimes(1);
  });

  it('sends no second mail when Mollie calls again (the conditional update changed nothing)', async () => {
    const { service, mail } = setup({ updated: 0 });
    await service.handle({ id: 'tr_1' });
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('falls back to the e-mail address of the customer account', async () => {
    const { service, mail } = setup({ full: { order_information: { customerEmail: '', customer: { email: 'account@example.invalid' } }, get: () => ({ pickupTime: '10:30:00', totalPrice: '10.70', delivery: false, product_list: [{ amount: 1, product: { product_information: { title: 'Brood', variant: '' } } }] }) } });
    await service.handle({ id: 'tr_1' });
    expect(mail.order).toHaveBeenCalledWith('account@example.invalid', expect.any(String));
  });

  it('a paid second payment turns a scanned order into payed, without a mail', async () => {
    const { service, orders, mail } = setup({ order: { uuid_id: 'o-2', status: 'scanned' } });
    await service.handle({ id: 'tr_1' });
    expect(orders.update).toHaveBeenCalledWith({ status: 'payed' }, expect.objectContaining({ where: { uuid_id: 'o-2', status: 'scanned' } }));
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('leaves orders in any other status alone', async () => {
    const { service, orders } = setup({ order: { uuid_id: 'o-3', status: 'afgehaald' } });
    await service.handle({ id: 'tr_1' });
    expect(orders.update).not.toHaveBeenCalled();
  });

  it('does not change anything for a payment that is not paid', async () => {
    const { service, orders } = setup({ payment: { id: 'tr_1', status: 'expired' } });
    await expect(service.handle({ id: 'tr_1' })).resolves.toBe('expired');
    expect(orders.findOne).not.toHaveBeenCalled();
  });

  it('a paid payment without an order is only logged', async () => {
    const { service, orders } = setup({ order: null });
    await expect(service.handle({ id: 'tr_1' })).resolves.toBe('paid');
    expect(orders.update).not.toHaveBeenCalled();
  });

  it('asks Mollie instead of trusting the body, and rejects ids that are not payment ids', async () => {
    const { service, mollie } = setup();
    for (const body of [null, {}, { id: 5 }, { id: '' }, { id: 'tr_1; DROP' }, { id: 'abc' }]) {
      await expect(service.handle(body)).rejects.toThrow(UnknownPaymentError);
    }
    expect(mollie.getPayment).not.toHaveBeenCalled();
  });

  it('rejects a payment Mollie does not know', async () => {
    const { service, orders } = setup({ payment: null });
    await expect(service.handle({ id: 'tr_nope' })).rejects.toThrow('Unknown payment');
    expect(orders.findOne).not.toHaveBeenCalled();
  });

  it('a failing confirmation mail does not fail the webhook', async () => {
    const { service, orders } = setup();
    orders.findByPk.mockRejectedValue(new Error('db down'));
    await expect(service.handle({ id: 'tr_1' })).resolves.toBe('paid');
  });
});
