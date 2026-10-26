import { Inject, Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

export const MAIL_TRANSPORT = 'MAIL_TRANSPORT';

export interface MailAttachment {
  filename: string;
  content?: Buffer;
  path?: string;
  cid: string;
}

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments: MailAttachment[];
}

// The part of a nodemailer transporter that is used: lets tests replace it and keeps real mail out of them
export interface MailTransport {
  sendMail(options: MailOptions): Promise<unknown>;
}

const ORDERS = 'Coop Lubbers Bestellingen <bestellingen@cooplubbers.nl>';
const ACCOUNTS = 'Coop Lubbers Accounts <bestellingen@cooplubbers.nl>';
const FEEDBACK = 'Coop Lubbers Feedback <bestellingen@cooplubbers.nl>';

// Builds and sends the e-mails of the shop. The option builders keep the senders, subjects and attachments of the old Server
// (Server/config/mailing.js); the HTML comes from mail-bodies.ts.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@Inject(MAIL_TRANSPORT) private readonly transport: MailTransport) {}

  // Order mail with the order's QR code attached (cid qrcode@cooplubbers.nl, used in the HTML)
  async orderWithQr(to: string, html: string, qrText: string): Promise<MailOptions> {
    const dataUrl = await QRCode.toDataURL(qrText);
    return {
      from: ORDERS,
      to,
      subject: 'Bestelling bij Coop',
      text: 'Uw bestelling bij Coop Lubbers',
      html,
      attachments: [{ filename: 'image.png', content: Buffer.from(dataUrl.replace('data:image/png;base64,', ''), 'base64'), cid: 'qrcode@cooplubbers.nl' }],
    };
  }

  order(to: string, html: string): MailOptions {
    return { from: ORDERS, to, subject: 'Bestelling bij Coop', text: 'Uw bestelling bij Coop Lubbers', html, attachments: [] };
  }

  passwordReset(to: string, html: string): MailOptions {
    return { from: ACCOUNTS, to, subject: 'Wachtwoord vergeten Coop Lubbers', text: 'Wachtwoord vergeten Coop Lubbers', html, attachments: [] };
  }

  feedback(to: string, html: string): MailOptions {
    return { from: FEEDBACK, to, subject: 'Feedback Coop Lubbers', text: 'Feedback Coop Lubbers', html, attachments: [] };
  }

  // Reminder about the spaaractie: the two images are referenced from the HTML by cid
  actieReminder(to: string, html: string): MailOptions {
    return {
      from: FEEDBACK,
      to,
      subject: 'Spaaracties Coop Lubbers',
      text: 'Spaaracties Coop Lubbers',
      html,
      attachments: [
        { filename: 'storefront.jpg', path: 'https://www.cooplubbers.nl/img/background-opening.jpg', cid: 'storefront@cooplubbers.nl' },
        { filename: 'donar_zegel.png', path: 'https://www.cooplubbers.nl/img/acties/main_donar.png', cid: 'donar_zegel@cooplubbers.nl' },
      ],
    };
  }

  // Sends the mail; a failure is logged (never with the body) and reported to the caller
  async send(options: MailOptions): Promise<boolean> {
    try {
      await this.transport.sendMail(options);
      return true;
    } catch (err) {
      this.logger.error(`sending "${options.subject}" to ${options.to} failed: ${(err as Error).message}`);
      return false;
    }
  }
}
