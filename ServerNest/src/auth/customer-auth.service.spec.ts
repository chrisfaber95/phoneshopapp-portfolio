import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as jsonwebtoken from 'jsonwebtoken';
import { AppEnv } from '../config/env.validation';
import { Customer } from '../database/models';
import { LOGIN_MESSAGES } from './auth.messages';
import { CustomerAuthService } from './customer-auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

const tokens = new TokenService(new JwtService(), { get: () => 'test-key' } as unknown as ConfigService<AppEnv, true>);

const row = (password: string | null) => {
  const data: Record<string, unknown> = {
    customer_id: 'c-1', first_name: 'Piet', email: 'piet@example.nl', password, accessToken: null,
    customer_settings: { shoptype: 1 }, customer_information: [{ street: 'Teststraat' }],
  };
  return Object.assign(data, { save: jest.fn().mockResolvedValue(undefined), toJSON: () => ({ ...data, save: undefined, toJSON: undefined }) });
};

const serviceWith = (findOne: jest.Mock) => new CustomerAuthService({ findOne } as unknown as typeof Customer, new PasswordService(), tokens);

describe('CustomerAuthService', () => {
  const hash = bcrypt.hashSync('secret', 4);

  it('logs in: answers { user } with settings and addresses but without the password, token carries the customer id', async () => {
    const customer = row(hash);
    const result = await serviceWith(jest.fn().mockResolvedValue(customer)).login({ email: 'piet@example.nl', password: 'secret' });
    const sent = (result as { user: Record<string, unknown> }).user;
    expect(sent.password).toBeUndefined();
    expect(sent.customer_settings).toEqual({ shoptype: 1 });
    expect(sent.customer_information).toEqual([{ street: 'Teststraat' }]);
    const payload = jsonwebtoken.verify(sent.accessToken as string, 'test-key') as jsonwebtoken.JwtPayload;
    expect(payload.user_id).toBe('c-1');
    expect(customer.save).toHaveBeenCalledTimes(1);
  });

  it('lower-cases the e-mail and removes spaces before looking it up', async () => {
    const findOne = jest.fn().mockResolvedValue(null);
    await serviceWith(findOne).login({ email: ' Piet@Example.NL ', password: 'secret' });
    expect(findOne.mock.calls[0][0].where).toEqual({ email: 'piet@example.nl' });
  });

  it.each([
    ['wrong password', hash, { email: 'piet@example.nl', password: 'nope' }],
    ['an account without a password', null, { email: 'piet@example.nl', password: 'secret' }],
    ['an unknown account', undefined, { email: 'piet@example.nl', password: 'secret' }],
  ])('answers "Verkeerde gegevens ingevoerd" for %s and saves nothing', async (_name, stored, body) => {
    const customer = stored === undefined ? null : row(stored);
    expect(await serviceWith(jest.fn().mockResolvedValue(customer)).login(body)).toEqual({ err: LOGIN_MESSAGES.invalid });
    if (customer) expect(customer.save).not.toHaveBeenCalled();
  });

  it('asks for all fields when e-mail or password is missing, and does not support tag login', async () => {
    const findOne = jest.fn();
    expect(await serviceWith(findOne).login({})).toEqual({ err: LOGIN_MESSAGES.incomplete });
    expect(await serviceWith(findOne).login({ email: 'piet@example.nl' })).toEqual({ err: LOGIN_MESSAGES.incomplete });
    expect(await serviceWith(findOne).login({ tag: 'abc', serial: '1' })).toEqual({ err: LOGIN_MESSAGES.invalid });
    expect(findOne).not.toHaveBeenCalled();
  });

  it('answers the generic error text when the database fails', async () => {
    expect(await serviceWith(jest.fn().mockRejectedValue(new Error('db down'))).login({ email: 'a@b.nl', password: 'x' })).toEqual({ err: LOGIN_MESSAGES.failed });
  });
});
