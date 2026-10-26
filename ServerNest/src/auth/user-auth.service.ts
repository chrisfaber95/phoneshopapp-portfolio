import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User, Userrole } from '../database/models';
import { LOGIN_MESSAGES, LoginResult } from './auth.messages';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

// Text values only: anything else (numbers, objects) in these fields is never a valid tag or serial
const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() !== '' ? value : null);

// Employee login (POST /api/v1/user/login), answers like the old Server:
//   - e-mail (or card number) + password, or
//   - an NFC card: `tag` + `serial`, both must match; no password (employees only, customers have no NFC)
@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);

  constructor(
    @InjectModel(User) private readonly users: typeof User,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async login(body: Record<string, unknown>): Promise<LoginResult> {
    try {
      const rawEmail = body.email || null;
      const password = (body.password as string | undefined) || null;
      const email = rawEmail ? (rawEmail as string).toLowerCase() : null;

      // (the old check `!(tag, serial)` only looked at `serial`; kept so the same requests get the same answer)
      if (!(email && password) && !body.serial) return { err: LOGIN_MESSAGES.incomplete };

      if (email && password) return await this.withPassword(email, password);
      // an e-mail without a password never falls back to the card
      if (!email) return await this.withCard(text(body.tag), text(body.serial));
      return this.invalid('password missing');
    } catch (err) {
      this.logger.error(`employee login failed: ${(err as Error).message}`);
      return { err: LOGIN_MESSAGES.failed };
    }
  }

  private async withPassword(email: string, password: string): Promise<LoginResult> {
    const user = await this.users.findOne({
      where: { [Op.or]: [{ email }, { cardnumber: email }] },
      include: [Userrole],
      attributes: { include: ['password', 'accessToken'] },
    });
    if (!user || !(await this.passwords.verify(password, user.password))) return this.invalid(`unknown account or wrong password for ${email}`);
    return this.complete(user);
  }

  // The card is the credential: the token and the serial number must both match exactly
  private async withCard(tag: string | null, serial: string | null): Promise<LoginResult> {
    if (!tag || !serial) return this.invalid('card login without a usable tag and serial');
    const user = await this.users.findOne({
      where: { nfc_token: tag, nfc_serial: serial },
      include: [Userrole],
      attributes: { include: ['password', 'accessToken'] },
    });
    if (!user) return this.invalid('unknown card');
    this.logger.log(`card login for employee ${user.user_id}`);
    return this.complete(user);
  }

  private async complete(user: User): Promise<LoginResult> {
    const token = this.tokens.sign(user.user_id, user.email);
    user.accessToken = token;
    await user.save();

    const sent = user.toJSON() as Record<string, unknown>;
    delete sent.password;
    delete sent.id;
    return { user: sent };
  }

  private invalid(reason: string): LoginResult {
    this.logger.warn(`invalid credentials (${reason})`); // never log the password or the request headers
    return { err: LOGIN_MESSAGES.invalid };
  }
}
