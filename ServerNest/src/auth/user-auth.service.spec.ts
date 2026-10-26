import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as jsonwebtoken from 'jsonwebtoken';
import { AppEnv } from '../config/env.validation';
import { User } from '../database/models';
import { LOGIN_MESSAGES } from './auth.messages';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { UserAuthService } from './user-auth.service';

const tokens = new TokenService(new JwtService(), { get: () => 'test-key' } as unknown as ConfigService<AppEnv, true>);

// a row as Sequelize returns it: attributes, save() and toJSON()
const row = (password: string | null) => {
  const data: Record<string, unknown> = { user_id: 'u-1', name: 'Jan', email: 'jan@example.nl', password, accessToken: null, user_role: { roleId: 'r-1', roleName: 'admin' } };
  return Object.assign(data, { save: jest.fn().mockResolvedValue(undefined), toJSON: () => ({ ...data, save: undefined, toJSON: undefined }) });
};

const serviceWith = (findOne: jest.Mock) => new UserAuthService({ findOne } as unknown as typeof User, new PasswordService(), tokens);

describe('UserAuthService', () => {
  const hash = bcrypt.hashSync('secret', 4);

  it('logs in with e-mail + password: answers { user } without the password, with a 20 hour token that is saved', async () => {
    const user = row(hash);
    const findOne = jest.fn().mockResolvedValue(user);
    const result = await serviceWith(findOne).login({ email: 'Jan@Example.nl', password: 'secret' });

    expect(findOne.mock.calls[0][0].where).toBeDefined();
    const sent = (result as { user: Record<string, unknown> }).user;
    expect(sent.password).toBeUndefined();
    expect(sent.user_role).toEqual({ roleId: 'r-1', roleName: 'admin' });
    const payload = jsonwebtoken.verify(sent.accessToken as string, 'test-key') as jsonwebtoken.JwtPayload;
    expect(payload.user_id).toBe('u-1');
    expect((payload.exp! - payload.iat!) / 3600).toBe(20);
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it('looks the account up by the lower-cased e-mail (or card number)', async () => {
    const findOne = jest.fn().mockResolvedValue(null);
    await serviceWith(findOne).login({ email: 'JAN@Example.NL', password: 'secret' });
    const where = findOne.mock.calls[0][0].where;
    const conditions = Object.getOwnPropertySymbols(where).map((s) => where[s]).flat();
    expect(conditions).toEqual([{ email: 'jan@example.nl' }, { cardnumber: 'jan@example.nl' }]);
  });

  it.each([
    ['wrong password', hash, { email: 'jan@example.nl', password: 'nope' }],
    ['an account without a password', null, { email: 'jan@example.nl', password: 'secret' }],
    ['an unknown account', undefined, { email: 'jan@example.nl', password: 'secret' }],
  ])('answers "Verkeerde gegevens ingevoerd" (HTTP 200 body) for %s and saves nothing', async (_name, stored, body) => {
    const user = stored === undefined ? null : row(stored);
    const result = await serviceWith(jest.fn().mockResolvedValue(user)).login(body);
    expect(result).toEqual({ err: LOGIN_MESSAGES.invalid });
    if (user) expect(user.save).not.toHaveBeenCalled();
  });

  it.each([[{}], [{ email: 'jan@example.nl' }], [{ password: 'secret' }]])('asks for all fields when e-mail or password is missing: %j', async (body) => {
    const findOne = jest.fn();
    expect(await serviceWith(findOne).login(body)).toEqual({ err: LOGIN_MESSAGES.incomplete });
    expect(findOne).not.toHaveBeenCalled();
  });

  describe('NFC card login (employees only)', () => {
    it('logs in with tag + serial without a password: same { user } answer, token saved', async () => {
      const user = row(hash);
      const findOne = jest.fn().mockResolvedValue(user);
      const result = await serviceWith(findOne).login({ tag: 'CARD-1', serial: 'SER-1' });

      expect(findOne.mock.calls[0][0].where).toEqual({ nfc_token: 'CARD-1', nfc_serial: 'SER-1' }); // both must match
      const sent = (result as { user: Record<string, unknown> }).user;
      expect(sent.password).toBeUndefined();
      expect(jsonwebtoken.verify(sent.accessToken as string, 'test-key')).toMatchObject({ user_id: 'u-1' });
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    it('an unknown card is "Verkeerde gegevens ingevoerd"', async () => {
      expect(await serviceWith(jest.fn().mockResolvedValue(null)).login({ tag: 'CARD-1', serial: 'SER-1' })).toEqual({ err: LOGIN_MESSAGES.invalid });
    });

    it.each([
      ['a tag without a serial', { tag: 'CARD-1' }, LOGIN_MESSAGES.incomplete],
      ['an empty tag', { tag: '', serial: 'SER-1' }, LOGIN_MESSAGES.invalid],
      ['a blank serial', { tag: 'CARD-1', serial: '   ' }, LOGIN_MESSAGES.invalid],
      ['a tag that is not text', { tag: { not: 'text' }, serial: 'SER-1' }, LOGIN_MESSAGES.invalid],
      ['a serial that is not text', { tag: 'CARD-1', serial: 123 }, LOGIN_MESSAGES.invalid],
    ])('%s never reaches the database', async (_name, body, expected) => {
      const findOne = jest.fn();
      expect(await serviceWith(findOne).login(body)).toEqual({ err: expected });
      expect(findOne).not.toHaveBeenCalled();
    });

    it('an e-mail without a password never falls back to the card', async () => {
      const findOne = jest.fn();
      expect(await serviceWith(findOne).login({ email: 'jan@example.nl', tag: 'CARD-1', serial: 'SER-1' })).toEqual({ err: LOGIN_MESSAGES.invalid });
      expect(findOne).not.toHaveBeenCalled();
    });

    it('with e-mail and password the password path is used, the card is ignored', async () => {
      const findOne = jest.fn().mockResolvedValue(row(hash));
      await serviceWith(findOne).login({ email: 'jan@example.nl', password: 'secret', tag: 'CARD-1', serial: 'SER-1' });
      expect(findOne.mock.calls[0][0].where.nfc_token).toBeUndefined();
    });
  });

  it('answers the generic error text when the database fails or the input is not text', async () => {
    expect(await serviceWith(jest.fn().mockRejectedValue(new Error('db down'))).login({ email: 'a@b.nl', password: 'x' })).toEqual({ err: LOGIN_MESSAGES.failed });
    expect(await serviceWith(jest.fn()).login({ email: { $ne: 1 }, password: 'x' })).toEqual({ err: LOGIN_MESSAGES.failed });
  });
});
