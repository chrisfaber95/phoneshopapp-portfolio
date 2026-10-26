import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { CryptoService } from '../auth/crypto.service';
import { Principal } from '../auth/principal.service';
import { ActieOrder, ActieOrderHasProduct } from '../database/models';
import { MailService } from '../mail/mail.service';
import { ActieOrdersUpdateService } from './actie-orders-update.service';
import { ActieOrdersService } from './actie-orders.service';

const employee: Principal = { type: 'user', id: 'u-1' };
const customer: Principal = { type: 'customer', id: 'c-1' };

const answered = (status: string) => ({
  actie_order_id: 'ao-1', status,
  actie_order_information: { customerEmail: 'jan@example.invalid' },
  get: () => ({ actie_order_information: { customerEmail: 'jan@example.invalid', createdAt: '2026-09-30' }, product_list: [{ picked: 1, product: { product_information: { title: 'Donar', variant: '' } }, actie_order_product_variant_list: [] }] }),
});

const setup = (over: { order?: unknown; updated?: unknown } = {}) => {
  const orders = { findByPk: jest.fn().mockResolvedValue(over.order === undefined ? { actie_order_id: 'ao-1', status: 'ordered' } : over.order), update: jest.fn().mockResolvedValue([1]) };
  const lines = { findAll: jest.fn().mockResolvedValue([{ actie_order_has_product_id: 10 }]), update: jest.fn().mockResolvedValue([1]), create: jest.fn().mockResolvedValue({}) };
  const reading = { single: jest.fn().mockResolvedValue(over.updated === undefined ? answered('ordered') : over.updated) };
  const crypto = { encrypt: jest.fn().mockReturnValue('encrypted') };
  const mail = { orderWithQr: jest.fn().mockResolvedValue({ to: 'x' }), send: jest.fn().mockResolvedValue(true) };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const service = new ActieOrdersUpdateService(
    sequelize as unknown as Sequelize, orders as unknown as typeof ActieOrder, lines as unknown as typeof ActieOrderHasProduct,
    reading as unknown as ActieOrdersService, crypto as unknown as CryptoService, mail as unknown as MailService,
  );
  return { service, orders, lines, mail };
};

describe('ActieOrdersUpdateService', () => {
  it('is for employees only', async () => {
    const { service, orders } = setup();
    await expect(service.update(null, 'ao-1', { type: 'Update' })).rejects.toThrow(UnauthorizedException);
    await expect(service.update(customer, 'ao-1', { type: 'Update' })).rejects.toThrow(ForbiddenException);
    expect(orders.update).not.toHaveBeenCalled();
  });

  it('rejects an unknown order and an unknown type', async () => {
    await expect(setup({ order: null }).service.update(employee, 'x', { type: 'Update' })).rejects.toThrow(BadRequestException);
    await expect(setup().service.update(employee, 'ao-1', { type: 'Nope' })).rejects.toThrow(BadRequestException);
  });

  it('Update saves only whitelisted order fields and lines of this order', async () => {
    const { service, orders, lines } = setup();
    await service.update(employee, 'ao-1', { type: 'Update', order: { status: 'picked', paycode: 'x', delivery_cost: 99, order_information_id: 'o', product_list: [{ actie_order_has_product_id: 10, picked: 1, stamps_cost: 0, actie_order_id: 'other' }] } });
    expect(orders.update.mock.calls[0][0]).toEqual({ status: 'picked' });
    expect(lines.update).toHaveBeenCalledWith({ picked: 1 }, expect.objectContaining({ where: { actie_order_has_product_id: 10, actie_order_id: 'ao-1' } }));
  });

  it('rejects lines of another order or without id', async () => {
    const { service } = setup();
    await expect(service.update(employee, 'ao-1', { type: 'Update', order: { product_list: [{ actie_order_has_product_id: 999, picked: 1 }] } })).rejects.toThrow(BadRequestException);
    await expect(service.update(employee, 'ao-1', { type: 'Update', order: { product_list: [{ picked: 1 }] } })).rejects.toThrow(BadRequestException);
  });

  it('mails the customer once, when the status changes to picked', async () => {
    const changed = setup({ updated: answered('picked') });
    await changed.service.update(employee, 'ao-1', { type: 'Update', order: { status: 'picked' } });
    expect(changed.mail.orderWithQr).toHaveBeenCalledWith('jan@example.invalid', expect.stringContaining('Donar'), 'encrypted');
    expect(changed.mail.send).toHaveBeenCalledTimes(1);

    const same = setup({ order: { actie_order_id: 'ao-1', status: 'picked' }, updated: answered('picked') });
    await same.service.update(employee, 'ao-1', { type: 'Update', order: { status: 'picked' } });
    expect(same.mail.send).not.toHaveBeenCalled();
  });

  it('a failing mail does not fail the update', async () => {
    const { service, mail } = setup({ updated: answered('picked') });
    mail.orderWithQr.mockRejectedValue(new Error('qr'));
    await expect(service.update(employee, 'ao-1', { type: 'Update', order: { status: 'picked' } })).resolves.toBeDefined();
  });

  it('Product adds a line to the order of the URL', async () => {
    const { service, lines } = setup();
    await service.update(employee, 'ao-1', { type: 'Product', product: { product_id: 5, amount: 1, stamps_cost: 3, actie_order_id: 'other' } });
    expect(lines.create).toHaveBeenCalledWith({ product_id: 5, amount: 1, stamps_cost: 3, actie_order_id: 'ao-1' }, expect.anything());
    await expect(service.update(employee, 'ao-1', { type: 'Product', product: {} })).rejects.toThrow(BadRequestException);
  });
});
