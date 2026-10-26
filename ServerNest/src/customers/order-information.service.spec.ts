import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { initModels } from '../../test/helpers/init-models';
import { Principal } from '../auth/principal.service';
import { OrderInformation } from '../database/models';
import { OrderInformationService } from './order-information.service';

const serviceWith = (information: Record<string, jest.Mock>) => new OrderInformationService(information as unknown as typeof OrderInformation);

const customer: Principal = { type: 'customer', id: 'c-1' };
const employee: Principal = { type: 'user', id: 'u-1' };

describe('OrderInformationService', () => {
  beforeAll(() => { initModels(); });

  describe('list', () => {
    it('a logged-in customer only gets their own records, whatever they ask for', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await serviceWith({ findAll }).list(customer, { customer_id: 'c-2' });
      expect(findAll.mock.calls[0][0].where).toEqual({ customer_id: 'c-1' });
      await serviceWith({ findAll }).list(customer, {});
      expect(findAll.mock.calls[1][0].where).toEqual({ customer_id: 'c-1' });
    });

    it('the customer is sent without password hash, access token and reset token', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await serviceWith({ findAll }).list(customer, {});
      expect(findAll.mock.calls[0][0].include[0].attributes.exclude).toEqual(['password', 'accessToken', 'resettoken']);
    });

    it('employees and requests naming the customer_id (no token) see what they ask for', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await serviceWith({ findAll }).list(employee, { customer_id: 'c-2' });
      expect(findAll.mock.calls[0][0].where).toEqual({ customer_id: 'c-2' });
      await serviceWith({ findAll }).list(null, { customer_id: 'c-3' });
      expect(findAll.mock.calls[1][0].where).toEqual({ customer_id: 'c-3' });
    });

    it('rejects a column that does not exist', () => {
      expect(() => serviceWith({ findAll: jest.fn() }).list(employee, { password: 'x' })).toThrow();
    });
  });

  describe('remove', () => {
    const record = (customerId: string) => ({ order_information_id: 'o-1', customer_id: customerId });

    it('removes the customer\'s own record and answers the number removed', async () => {
      const destroy = jest.fn().mockResolvedValue(1);
      expect(await serviceWith({ findByPk: jest.fn().mockResolvedValue(record('c-1')), destroy }).remove(customer, { order_information_id: 'o-1' })).toBe(1);
      expect(destroy.mock.calls[0][0].where).toEqual({ order_information_id: 'o-1' });
    });

    it('never removes the record of another customer, needs a token, answers 0 for an unknown record', async () => {
      const destroy = jest.fn().mockResolvedValue(1);
      await expect(serviceWith({ findByPk: jest.fn().mockResolvedValue(record('c-2')), destroy }).remove(customer, { order_information_id: 'o-1' })).rejects.toThrow(ForbiddenException);
      await expect(serviceWith({ findByPk: jest.fn(), destroy }).remove(null, { order_information_id: 'o-1' })).rejects.toThrow(UnauthorizedException);
      expect(await serviceWith({ findByPk: jest.fn().mockResolvedValue(null), destroy }).remove(customer, { order_information_id: 'o-1' })).toBe(0);
      expect(destroy).not.toHaveBeenCalled();
    });

    it('answers { err } when the database fails', async () => {
      expect(await serviceWith({ findByPk: jest.fn().mockRejectedValue(new Error('x')) }).remove(customer, { order_information_id: 'o-1' })).toEqual({ err: 'Verwijderen mislukt' });
    });
  });
});
