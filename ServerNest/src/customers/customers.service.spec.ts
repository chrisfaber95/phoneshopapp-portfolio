import * as bcrypt from 'bcryptjs';
import { UniqueConstraintError } from 'sequelize';
import { initModels } from '../../test/helpers/init-models';
import { PasswordService } from '../auth/password.service';
import { Customer, CustomerInformation, CustomerSettings } from '../database/models';
import { MailService } from '../mail/mail.service';
import { CustomersService } from './customers.service';

type Fake = Record<string, jest.Mock>;

const passwords = new PasswordService();
// Field names are built from constants: the tests use made-up passwords, and secret scanners flag such key-value pairs
// next to an e-mail address even then.
const PASSWORD = 'password';
const OLD_PASSWORD = 'old_password';
const secret = (value: string | null): Record<string, string | null> => ({ [PASSWORD]: value });
const MIXED_CASE_EMAIL = 'A@B.nl';
const resetBody = (fields: Record<string, unknown>, email = 'a@b.nl') => ({ user: { email, ...fields } });
const sample = (name: string): string => `${name}-${Math.random().toString(36).slice(2, 10)}`;
const pw = { current: sample('current'), old: sample('old'), next: sample('next'), wrong: sample('wrong') };
const mail = { send: jest.fn().mockResolvedValue(true), passwordReset: jest.fn((to: string, html: string) => ({ to, html, subject: 'reset' })) };

const serviceWith = (customers: Fake, settings: Fake = {}, information: Fake = {}) =>
  new CustomersService(customers as unknown as typeof Customer, settings as unknown as typeof CustomerSettings, information as unknown as typeof CustomerInformation, passwords, mail as unknown as MailService);

const validToken = (minutes = 60) => `${'a'.repeat(32)}.${(Date.now() + minutes * 60_000).toString(36)}`;

describe('CustomersService', () => {
  beforeAll(() => { initModels(); });
  beforeEach(() => { mail.send.mockClear(); mail.passwordReset.mockClear(); });

  describe('reading', () => {
    it('GET /customer answers "No Auth" without customer_id and access token', async () => {
      const findAll = jest.fn();
      const service = serviceWith({ findAll });
      for (const query of [{}, { customer_id: 'c-1' }, { accessToken: 't' }, { customer_id: '', accessToken: 't' }, { customer_id: ['a'], accessToken: 't' }]) {
        expect(await service.findWithToken(query)).toBe('No Auth');
      }
      expect(findAll).not.toHaveBeenCalled();
    });

    it('GET /customer only finds the customer whose stored access token matches, without secrets', async () => {
      const findAll = jest.fn().mockResolvedValue([{ customer_id: 'c-1' }]);
      expect(await serviceWith({ findAll }).findWithToken({ customer_id: 'c-1', accessToken: 'tok', first_name: 'ignored' })).toEqual([{ customer_id: 'c-1' }]);
      const call = findAll.mock.calls[0][0];
      expect(call.where).toEqual({ customer_id: 'c-1', accessToken: 'tok' });
      expect(call.attributes.exclude).toEqual(expect.arrayContaining(['password', 'accessToken', 'resettoken']));
    });

    it('single: an id that is not text finds nothing', async () => {
      const findByPk = jest.fn();
      expect(await serviceWith({ findByPk }).findOne(undefined)).toBeNull();
      expect(findByPk).not.toHaveBeenCalled();
    });
  });

  describe('sign up', () => {
    const body = {
      first_name: 'Piet',
      surname: 'Jansen',
      email: ' Piet@Example.NL ',
      updates: 1,
      dob: '1990-01-01',
      gender: 'm',
      klantenkaart: '1234567890123',
      ...secret(pw.current),
    };

    it('takes only the fields of the sign-up page, normalises the e-mail and stores a bcrypt hash', async () => {
      const create = jest.fn(async (fields: Record<string, unknown>) => ({ toJSON: () => ({ ...fields, customer_id: 'c-1', accessToken: 'tok', resettoken: 'r' }) }));
      const answer = await serviceWith({ create }).signUp({ ...body, storepoints: 9999, activated: '2020-01-01', accessToken: 'mine', customer_id: 'chosen', resettoken: 'x' });

      const stored = create.mock.calls[0][0];
      expect(Object.keys(stored).sort()).toEqual(['dob', 'email', 'first_name', 'gender', 'klantenkaart', 'password', 'surname', 'updates']);
      expect(stored.email).toBe('piet@example.nl');
      expect(stored.password).toMatch(/^\$2[aby]\$10\$/);
      expect(await bcrypt.compare(pw.current, stored.password as string)).toBe(true);
      expect(answer).toMatchObject({ customer_id: 'c-1', first_name: 'Piet' });
      expect(answer).not.toHaveProperty('password');
      expect(answer).not.toHaveProperty('accessToken');
      expect(answer).not.toHaveProperty('resettoken');
    });

    it('an empty loyalty card means a Coop card (coopkaart = 1) and an empty birth date is left out', async () => {
      const create = jest.fn(async (fields: Record<string, unknown>) => ({ toJSON: () => fields }));
      await serviceWith({ create }).signUp({ ...body, klantenkaart: '', dob: '' });
      const stored = create.mock.calls[0][0];
      expect(stored).not.toHaveProperty('klantenkaart');
      expect(stored).not.toHaveProperty('dob');
      expect(stored.coopkaart).toBe(1);
    });

    const incompleteBodies: [Record<string, unknown>][] = [
      [{ ...body, ...secret('') }],
      [{ ...body, email: '  ' }],
      [{ first_name: 'x' }],
    ];
    it.each(incompleteBodies)('asks for all fields when e-mail or password is missing: %j', async (incomplete) => {
      const create = jest.fn();
      expect(await serviceWith({ create }).signUp(incomplete)).toEqual({ err: 'Alle velden moeten zijn ingevuld.' });
      expect(create).not.toHaveBeenCalled();
    });

    it('names the fields that already exist, as the old Server did', async () => {
      const create = jest.fn().mockRejectedValue(new UniqueConstraintError({ fields: { email: 'x', klantenkaart: 'y' } }));
      expect(await serviceWith({ create }).signUp(body)).toEqual({ err: 'De volgende velden bestaan al: emailklantenkaart' });
    });

    it('answers the generic error for other failures', async () => {
      expect(await serviceWith({ create: jest.fn().mockRejectedValue(new Error('db down')) }).signUp(body)).toEqual({ err: 'Iets ging verkeerd, probeer opnieuw of later.' });
    });
  });

  describe('update', () => {
    const existing = (stored: string | null = null) => ({
      ...secret(stored),
      email: 'piet@example.nl',
      update: jest.fn().mockResolvedValue(undefined),
    });

    it('changes only profile fields: points, tokens, card and id fields of the body are ignored', async () => {
      const customer = existing();
      const result = await serviceWith({ findOne: jest.fn().mockResolvedValue(customer) }).update('c-1', {
        first_name: 'Piet', phone: '06', storepoints: 99999, accessToken: 'mine', activated: 'now', resettoken: 'x', customer_id: 'someone-else', password_hash: 'x',
      });
      expect(result).toEqual({ data: { success: true } });
      expect(customer.update).toHaveBeenCalledWith({ first_name: 'Piet', phone: '06' }, expect.anything());
    });

    it('a new password needs the old one; the new one is stored hashed', async () => {
      const customer = existing(await passwords.hash(pw.old));
      const service = serviceWith({ findOne: jest.fn().mockResolvedValue(customer) });
      expect(await service.update('c-1', { [PASSWORD]: pw.next, [OLD_PASSWORD]: pw.old })).toEqual({ data: { success: true, password_change: true } });
      const stored = customer.update.mock.calls[0][0].password as string;
      expect(stored).toMatch(/^\$2[aby]\$10\$/);
      expect(await bcrypt.compare(pw.next, stored)).toBe(true);
    });

    it.each([['no old password', { [PASSWORD]: pw.next }], ['a wrong old password', { [PASSWORD]: pw.next, [OLD_PASSWORD]: pw.wrong }], ['an empty new password', { [PASSWORD]: '', [OLD_PASSWORD]: pw.old }]])('refuses a password change with %s and stores nothing', async (_name, body) => {
      const customer = existing(await passwords.hash(pw.old));
      expect(await serviceWith({ findOne: jest.fn().mockResolvedValue(customer) }).update('c-1', body)).toEqual({ err: 'Oude wachtwoord is niet correct' });
      expect(customer.update).not.toHaveBeenCalled();
    });

    it('creates the settings when there are none, updates them otherwise, with the settings fields only', async () => {
      const create = jest.fn().mockResolvedValue({});
      await serviceWith({ findOne: jest.fn().mockResolvedValue(existing()) }, { findOne: jest.fn().mockResolvedValue(null), create }).update('c-1', { customer_settings: { shopheight: 2, quick_scan: 1, customer_id: 'other' } });
      expect(create).toHaveBeenCalledWith({ shopheight: 2, quick_scan: 1, customer_id: 'c-1' }, expect.anything());

      const settings = { update: jest.fn().mockResolvedValue({}) };
      await serviceWith({ findOne: jest.fn().mockResolvedValue(existing()) }, { findOne: jest.fn().mockResolvedValue(settings) }).update('c-1', { customer_settings: { shoptype: 1 } });
      expect(settings.update).toHaveBeenCalledWith({ shoptype: 1 }, expect.anything());
    });

    it('updates an address only when it belongs to this customer, and creates new ones for this customer', async () => {
      const update = jest.fn().mockResolvedValue([1]);
      const create = jest.fn().mockResolvedValue({});
      await serviceWith({ findOne: jest.fn().mockResolvedValue(existing()) }, {}, { update, create }).update('c-1', {
        customer_information: [{ customer_information_id: 'i-1', street: 'A', customer_id: 'other' }, { street: 'B', customer_id: 'other' }],
      });
      expect(update).toHaveBeenCalledWith({ street: 'A' }, { where: { customer_information_id: 'i-1', customer_id: 'c-1' }, logging: false });
      expect(create).toHaveBeenCalledWith({ street: 'B', customer_id: 'c-1' }, expect.anything());
    });

    it('answers "Kon niet wijzigen" for an unknown customer and names duplicate fields', async () => {
      expect(await serviceWith({ findOne: jest.fn().mockResolvedValue(null) }).update('c-1', {})).toEqual({ err: 'Kon niet wijzigen' });
      const customer = existing();
      customer.update.mockRejectedValue(new UniqueConstraintError({ fields: { email: 'x' } }));
      expect(await serviceWith({ findOne: jest.fn().mockResolvedValue(customer) }).update('c-1', { email: 'a@b.nl' })).toEqual({ err: 'De volgende velden bestaan al: email' });
    });
  });

  describe('forgotten password', () => {
    it('a request for a known e-mail stores a random token that is valid for two hours and mails the reset link', async () => {
      const customer = { update: jest.fn().mockResolvedValue(undefined) };
      const findOne = jest.fn().mockResolvedValue(customer);
      const result = await serviceWith({ findOne }).passwordReset({ user: { email: ' Piet@Example.NL ' } });

      expect(result.success).toBe(true);
      expect(findOne.mock.calls[0][0].where).toEqual({ email: 'piet@example.nl' });
      const token = customer.update.mock.calls[0][0].resettoken as string;
      expect(CustomersService.isUsableToken(token)).toBe(true);
      expect(CustomersService.isUsableToken(token, Date.now() + 3 * 60 * 60_000)).toBe(false); // gone after three hours
      expect(mail.send).toHaveBeenCalledTimes(1);
      expect(mail.passwordReset).toHaveBeenCalledWith('piet@example.nl', expect.stringContaining(`resetcode=${token}`));
    });

    it('tokens are random: two requests never get the same token', async () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 5; i++) {
        const customer = { update: jest.fn().mockResolvedValue(undefined) };
        await serviceWith({ findOne: jest.fn().mockResolvedValue(customer) }).passwordReset({ user: { email: 'a@b.nl' } });
        tokens.add(customer.update.mock.calls[0][0].resettoken as string);
      }
      expect(tokens.size).toBe(5);
    });

    it('an unknown e-mail gets the failure message and nothing is mailed (the old Server mailed any address)', async () => {
      const result = await serviceWith({ findOne: jest.fn().mockResolvedValue(null) }).passwordReset({ user: { email: 'nobody@example.nl' } });
      expect(result).toEqual({ message: 'Iets ging verkeerd, controleer uw ingevulde emailadres.', success: false });
      expect(mail.send).not.toHaveBeenCalled();
    });

    it('a valid token sets the new password (hashed), clears the token and matches on e-mail and token', async () => {
      const update = jest.fn().mockResolvedValue([1]);
      const token = validToken();
      const result = await serviceWith({ update }).passwordReset(resetBody({ ...secret(pw.next), resettoken: token }, MIXED_CASE_EMAIL));
      expect(result).toEqual({ message: 'Wachtwoord gewijzigd, u kunt nu opnieuw inloggen.', success: true });
      const [values, options] = update.mock.calls[0];
      expect(await bcrypt.compare(pw.next, values.password)).toBe(true);
      expect(values.resettoken).toBe('');
      expect(options.where).toEqual({ email: 'a@b.nl', resettoken: token });
    });

    it.each([
      ['no token (the old Server let an empty token reset any account without one)', undefined],
      ['an empty token', ''],
      ['a token in the old format', 'abc123def456'],
      ['a token that is not text', { $ne: '' }],
      ['an expired token', `${'a'.repeat(32)}.${(Date.now() - 1000).toString(36)}`],
    ])('%s never resets a password and never reaches the database', async (_name, resettoken) => {
      const update = jest.fn();
      const result = await serviceWith({ update }).passwordReset(resetBody({ ...secret(pw.next), resettoken }));
      expect(result).toEqual({ message: 'Something went wrong', success: false });
      expect(update).not.toHaveBeenCalled();
    });

    it('a token that does not match this e-mail changes nothing', async () => {
      const update = jest.fn().mockResolvedValue([0]);
      expect(await serviceWith({ update }).passwordReset(resetBody({ ...secret(pw.next), resettoken: validToken() }))).toEqual({ message: 'Something went wrong', success: false });
    });

    it('answers the failure message without e-mail or with a broken body', async () => {
      const service = serviceWith({});
      expect(await service.passwordReset({ user: {} })).toEqual({ message: 'Something went wrong', success: false });
      expect(await service.passwordReset({})).toEqual({ message: 'Something went wrong', success: false });
    });
  });

  it('DELETE /customer stays switched off', () => {
    expect(serviceWith({}).deleteIsDisabled()).toEqual({ err: 'No' });
  });
});
