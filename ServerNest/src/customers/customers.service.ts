import { randomBytes } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { LOGIN_MESSAGES } from '../auth/auth.messages';
import { PasswordService } from '../auth/password.service';
import { Principal } from '../auth/principal.service';
import { whereFromQuery } from '../common/query-filter';
import { Customer, CustomerInformation, CustomerSettings } from '../database/models';
import { accountForgetTemplate } from '../mail/mail-bodies';
import { MailService } from '../mail/mail.service';
import { HIDDEN_COLUMNS, INFORMATION_FIELDS, PROFILE_FIELDS, SECRET_COLUMNS, SETTINGS_FIELDS, SIGNUP_FIELDS, asRecord, normalizeEmail, pick } from './customer-fields';

const RESET_LIFETIME_MS = 2 * 60 * 60 * 1000; // "binnen twee uur", as the e-mail promises

const withDetails = [
  { model: CustomerSettings, as: 'customer_settings', required: false },
  { model: CustomerInformation, as: 'customer_information', required: false },
];

export type ErrorAnswer = { err: string };

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer) private readonly customers: typeof Customer,
    @InjectModel(CustomerSettings) private readonly settings: typeof CustomerSettings,
    @InjectModel(CustomerInformation) private readonly information: typeof CustomerInformation,
    private readonly passwords: PasswordService,
    private readonly mail: MailService,
  ) {}

  // ---- reading

  // GET /customer?customer_id=&accessToken=: the customer whose stored access token matches (the "token in the query" way the
  // Klant pages read the profile). Without both values: the text "No Auth".
  async findWithToken(query: Record<string, unknown>): Promise<Customer[] | 'No Auth'> {
    const { customer_id: customerId, accessToken } = query;
    if (typeof customerId !== 'string' || customerId === '' || typeof accessToken !== 'string' || accessToken === '') return 'No Auth';
    return this.customers.findAll({ where: { customer_id: customerId, accessToken }, include: withDetails, attributes: { exclude: HIDDEN_COLUMNS }, logging: false });
  }

  // GET /customer/single?customer_id=: one customer with settings and addresses (the caller has been checked to be that customer)
  findOne(customerId: unknown): Promise<Customer | null> {
    if (typeof customerId !== 'string' || customerId === '') return Promise.resolve(null);
    return this.customers.findByPk(customerId, { include: withDetails, attributes: { exclude: HIDDEN_COLUMNS }, logging: false });
  }

  // GET /customer/employee and /employee-all (employees): look customers up by any column
  findOneByQuery(query: Record<string, unknown>): Promise<Customer | null> {
    return this.customers.findOne({ where: whereFromQuery(Customer, query), attributes: { exclude: HIDDEN_COLUMNS }, logging: false });
  }

  findAllByQuery(query: Record<string, unknown>): Promise<Customer[]> {
    return this.customers.findAll({ where: whereFromQuery(Customer, query), include: withDetails, attributes: { exclude: HIDDEN_COLUMNS }, logging: false });
  }

  // ---- signing up

  // POST /customer: only the fields of the sign-up page are taken; the answer never contains the password hash or a token
  async signUp(body: Record<string, unknown>): Promise<Record<string, unknown> | ErrorAnswer> {
    try {
      const fields = pick(body, SIGNUP_FIELDS) as Record<string, unknown>;
      const email = normalizeEmail(fields.email);
      if (!email || typeof fields.password !== 'string' || fields.password === '') return { err: LOGIN_MESSAGES.incomplete };
      fields.email = email; // the login looks up the lower-case address without spaces
      fields.password = await this.passwords.hash(fields.password);
      if (fields.klantenkaart === '') {
        delete fields.klantenkaart;
        fields.coopkaart = 1;
      }
      if (fields.dob === '') delete fields.dob;

      const created = await this.customers.create(fields);
      const answer = created.toJSON() as Record<string, unknown>;
      for (const column of SECRET_COLUMNS) delete answer[column];
      return answer;
    } catch (err) {
      if (err instanceof UniqueConstraintError) return { err: `De volgende velden bestaan al: ${Object.keys(err.fields).join('')}` };
      this.logger.error(`sign up failed: ${(err as Error).message}`);
      return { err: LOGIN_MESSAGES.failed };
    }
  }

  // ---- updating one's own profile

  // PUT /customer: body { user: { customer_id, ...profile, customer_settings, customer_information: [...], password + old_password } }
  async update(customerId: string, user: Record<string, unknown>): Promise<{ data: { success: true; password_change?: true } } | ErrorAnswer> {
    try {
      const customer = await this.customers.findOne({ where: { customer_id: customerId }, attributes: { include: ['password'] }, logging: false });
      if (!customer) return { err: 'Kon niet wijzigen' };

      const changes = pick(user, PROFILE_FIELDS) as Record<string, unknown>;
      let passwordChanged = false;
      if (Object.prototype.hasOwnProperty.call(user, 'password')) {
        // a new password needs the old one (the old Server stored a password without old_password as plain text)
        if (typeof user.password !== 'string' || user.password === '' || typeof user.old_password !== 'string' || !(await this.passwords.verify(user.old_password, customer.password))) {
          return { err: 'Oude wachtwoord is niet correct' };
        }
        changes.password = await this.passwords.hash(user.password);
        passwordChanged = true;
      }
      if (typeof changes.email === 'string') changes.email = normalizeEmail(changes.email) ?? customer.email;

      await this.saveSettings(customerId, asRecord(user.customer_settings));
      await this.saveInformation(customerId, Array.isArray(user.customer_information) ? user.customer_information : []);
      await customer.update(changes, { logging: false });

      return { data: { success: true, ...(passwordChanged ? { password_change: true as const } : {}) } };
    } catch (err) {
      if (err instanceof UniqueConstraintError) return { err: `De volgende velden bestaan al: ${Object.keys(err.fields).join('')}` };
      this.logger.error(`update of customer ${customerId} failed: ${(err as Error).message}`);
      return { err: (err as Error).message };
    }
  }

  private async saveSettings(customerId: string, input: Record<string, unknown>): Promise<void> {
    const values = pick(input, SETTINGS_FIELDS) as Record<string, unknown>;
    if (Object.keys(values).length === 0) return;
    const existing = await this.settings.findOne({ where: { customer_id: customerId }, logging: false });
    if (existing) await existing.update(values, { logging: false });
    else await this.settings.create({ ...values, customer_id: customerId }, { logging: false });
  }

  // Addresses with an id are updated, without an id created. An id of another customer's address is never touched.
  private async saveInformation(customerId: string, items: unknown[]): Promise<void> {
    for (const item of items) {
      const record = asRecord(item);
      const values = pick(record, INFORMATION_FIELDS) as Record<string, unknown>;
      const id = record.customer_information_id;
      if (typeof id === 'string' && id !== '') await this.information.update(values, { where: { customer_information_id: id, customer_id: customerId }, logging: false });
      else await this.information.create({ ...values, customer_id: customerId }, { logging: false });
    }
  }

  // ---- forgotten password

  // POST /customer/passwordreset: { user: { email } } asks for a reset e-mail; { user: { email, password, resettoken } } sets the
  // new password. The token is random, valid for two hours and used once.
  async passwordReset(body: Record<string, unknown>): Promise<{ message: string; success: boolean }> {
    const failed = { message: 'Something went wrong', success: false };
    try {
      const user = asRecord(body.user);
      const email = normalizeEmail(user.email);
      if (!email) return failed;
      if (Object.prototype.hasOwnProperty.call(user, 'password')) return await this.resetWithToken(email, user);
      return await this.requestReset(email);
    } catch (err) {
      this.logger.error(`password reset failed: ${(err as Error).message}`);
      return failed;
    }
  }

  private async requestReset(email: string): Promise<{ message: string; success: boolean }> {
    const customer = await this.customers.findOne({ where: { email }, logging: false });
    // nothing is sent to an address that is not a customer (the old Server mailed any address)
    if (!customer) return { message: 'Iets ging verkeerd, controleer uw ingevulde emailadres.', success: false };

    const token = `${randomBytes(16).toString('hex')}.${(Date.now() + RESET_LIFETIME_MS).toString(36)}`;
    await customer.update({ resettoken: token }, { logging: false });
    void this.mail.send(this.mail.passwordReset(email, accountForgetTemplate(token)));
    return { message: 'Je hebt succesvol een nieuw wachtwoord aangevraagd. Binnen twee uur ontvang je een e-mail met verdere instructies.', success: true };
  }

  private async resetWithToken(email: string, user: Record<string, unknown>): Promise<{ message: string; success: boolean }> {
    const token = user.resettoken;
    const password = user.password;
    if (typeof password !== 'string' || password === '' || !CustomersService.isUsableToken(token)) return { message: 'Something went wrong', success: false };

    const [updated] = await this.customers.update(
      { password: await this.passwords.hash(password), resettoken: '' },
      { where: { email, resettoken: token }, logging: false },
    );
    if (updated !== 1) return { message: 'Something went wrong', success: false };
    return { message: 'Wachtwoord gewijzigd, u kunt nu opnieuw inloggen.', success: true };
  }

  // A reset token has the form <random>.<expiry in base 36>; empty, malformed and expired tokens never match
  static isUsableToken(token: unknown, now: number = Date.now()): token is string {
    if (typeof token !== 'string') return false;
    const match = /^[0-9a-f]{32}\.([0-9a-z]{6,10})$/.exec(token);
    return match !== null && parseInt(match[1], 36) > now;
  }

  // POST /customer/login is in AuthModule; DELETE /customer is switched off in the old Server and stays so
  deleteIsDisabled(): ErrorAnswer {
    return { err: 'No' };
  }
}

export type { Principal };
