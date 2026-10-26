import { ConfigService } from '@nestjs/config';
import { AppEnv } from '../config/env.validation';
import { Cookies } from '../database/models';
import { MailService } from '../mail/mail.service';
import { SiteService } from './site.service';

const mail = { send: jest.fn().mockResolvedValue(true), feedback: jest.fn((to: string, html: string) => ({ to, html })) };
const serviceWith = (create: jest.Mock, env: Partial<Record<keyof AppEnv, string>> = {}) =>
  new SiteService({ create } as unknown as typeof Cookies, mail as unknown as MailService, { get: (key: string) => (env as Record<string, string | undefined>)[key] } as unknown as ConfigService<AppEnv, true>);

describe('SiteService', () => {
  beforeEach(() => { mail.send.mockClear(); mail.feedback.mockClear(); });

  describe('cookies', () => {
    it('records the acceptance without the login token', async () => {
      const create = jest.fn().mockResolvedValue({});
      const result = await serviceWith(create).acceptCookies('Mozilla/5.0', { ip: '1.2.3.4', customer_id: 'bbbbbbbb-0000-4000-8000-000000000001', authorization: 'secret-token' });
      expect(result).toEqual({ message: 'cookie accepted' });
      expect(create).toHaveBeenCalledWith({ device: 'Mozilla/5.0', user_auth: null, cookie_type: '1', ip: '1.2.3.4', customer_id: 'bbbbbbbb-0000-4000-8000-000000000001' });
    });

    it('only stores a customer id that is a UUID and keeps long texts within the columns', async () => {
      const create = jest.fn().mockResolvedValue({});
      await serviceWith(create).acceptCookies('x'.repeat(500), { ip: 'y'.repeat(100), customer_id: "1'; DROP TABLE Customer;--" });
      const stored = create.mock.calls[0][0];
      expect(stored.customer_id).toBeNull();
      expect(stored.device).toHaveLength(245);
      expect(stored.ip).toHaveLength(45);
    });

    it('answers { err } when saving fails', async () => {
      expect(await serviceWith(jest.fn().mockRejectedValue(new Error('x'))).acceptCookies(undefined, {})).toEqual({ err: 'Opslaan mislukt' });
    });
  });

  describe('feedback', () => {
    it('mails the feedback (HTML-escaped by the template) to FEEDBACK_EMAIL', () => {
      const result = serviceWith(jest.fn(), { FEEDBACK_EMAIL: 'feedback@shop.test', MAIL_USER: 'orders@shop.test' }).feedback({ details: { email: 'a@b.nl', text: '<script>x</script>' } });
      expect(result).toEqual({ message: 'Bedankt voor uw feedback.', success: true });
      expect(mail.feedback).toHaveBeenCalledWith('feedback@shop.test', expect.stringContaining('&lt;script&gt;'));
      expect(mail.send).toHaveBeenCalledTimes(1);
    });

    it('falls back to the shop mailbox; without any address the feedback is acknowledged but not mailed', () => {
      serviceWith(jest.fn(), { MAIL_USER: 'orders@shop.test' }).feedback({ details: { a: 1 } });
      expect(mail.feedback).toHaveBeenCalledWith('orders@shop.test', expect.any(String));
      mail.send.mockClear();
      expect(serviceWith(jest.fn()).feedback({ details: { a: 1 } }).success).toBe(true);
      expect(mail.send).not.toHaveBeenCalled();
    });

    it.each([[{}], [{ details: 'text' }], [{ details: null }]])('without details it answers "Something went wrong" and mails nothing: %j', (body) => {
      expect(serviceWith(jest.fn(), { FEEDBACK_EMAIL: 'f@shop.test' }).feedback(body)).toEqual({ message: 'Something went wrong', success: false });
      expect(mail.send).not.toHaveBeenCalled();
    });
  });
});
