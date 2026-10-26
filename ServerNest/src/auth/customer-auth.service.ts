import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer, CustomerInformation, CustomerSettings } from '../database/models';
import { LOGIN_MESSAGES, LoginResult } from './auth.messages';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

// Customer login (POST /api/v1/customer/login): e-mail + password, answers like the old Server.
@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    @InjectModel(Customer) private readonly customers: typeof Customer,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async login(body: Record<string, unknown>): Promise<LoginResult> {
    try {
      const rawEmail = body.email || null;
      const password = (body.password as string | undefined) || null;
      const email = rawEmail ? (rawEmail as string).toLowerCase().replace(/ /g, '') : null;
      const serial = body.serial || null;

      // (the old check `!(tag, serial)` only looked at `serial`; kept so the same requests get the same answer)
      if (!(email && password) && !serial) return { err: LOGIN_MESSAGES.incomplete };

      // Customers have no NFC columns, so the old tag login could never match anything
      if (!email || !password) return this.invalid('tag login is not supported');

      const customer = await this.customers.findOne({
        where: { email },
        include: [CustomerSettings, { model: CustomerInformation, required: false }],
        attributes: { include: ['password', 'accessToken'] },
      });
      if (!customer || !(await this.passwords.verify(password, customer.password))) return this.invalid(`unknown account or wrong password for ${email}`);

      const token = this.tokens.sign(customer.customer_id, customer.email);
      customer.accessToken = token;
      await customer.save();

      const sent = customer.toJSON() as Record<string, unknown>;
      delete sent.password;
      delete sent.id;
      return { user: sent };
    } catch (err) {
      this.logger.error(`customer login failed: ${(err as Error).message}`);
      return { err: LOGIN_MESSAGES.failed };
    }
  }

  private invalid(reason: string): LoginResult {
    this.logger.warn(`invalid credentials (${reason})`); // never log the password, the request body or the headers
    return { err: LOGIN_MESSAGES.invalid };
  }
}
