import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { AppEnv } from '../config/env.validation';
import { Cookies } from '../database/models';
import { feedbackTemplate } from '../mail/mail-bodies';
import { MailService } from '../mail/mail.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SiteService {
  private readonly logger = new Logger(SiteService.name);

  constructor(
    @InjectModel(Cookies) private readonly cookies: typeof Cookies,
    private readonly mail: MailService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  // POST /site/cookies { ip, customer_id }: records that the visitor accepted the cookies. The old Server also stored the whole
  // Authorization header (the login token) next to it; a token has no business in that table and is not stored.
  async acceptCookies(userAgent: string | undefined, body: Record<string, unknown>): Promise<{ message: string } | { err: string }> {
    try {
      await this.cookies.create({
        device: userAgent?.slice(0, 245) ?? null,
        user_auth: null,
        cookie_type: '1',
        ip: typeof body.ip === 'string' ? body.ip.slice(0, 45) : null,
        customer_id: typeof body.customer_id === 'string' && UUID.test(body.customer_id) ? body.customer_id : null,
      });
      return { message: 'cookie accepted' };
    } catch (err) {
      this.logger.error(`saving the cookie acceptance failed: ${(err as Error).message}`);
      return { err: 'Opslaan mislukt' };
    }
  }

  // POST /feedback { details: { email, ... } }: mails the feedback to the shop (FEEDBACK_EMAIL, or the shop mailbox MAIL_USER).
  // The old Server mailed a personal gmail address that was hardcoded in the code.
  feedback(body: Record<string, unknown>): { message: string; success: boolean } {
    const details = body.details;
    if (!details || typeof details !== 'object') return { message: 'Something went wrong', success: false };

    const to = this.config.get('FEEDBACK_EMAIL', { infer: true }) ?? this.config.get('MAIL_USER', { infer: true });
    if (to) void this.mail.send(this.mail.feedback(to, feedbackTemplate(JSON.stringify(details))));
    else this.logger.warn('feedback received but neither FEEDBACK_EMAIL nor MAIL_USER is set: it was not mailed');
    return { message: 'Bedankt voor uw feedback.', success: true };
  }
}
