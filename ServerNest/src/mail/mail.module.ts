import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppEnv } from '../config/env.validation';
import { MAIL_TRANSPORT, MailService, MailTransport } from './mail.service';

// The SMTP transport of the shop: server and account come from the MAIL_* settings
@Module({
  providers: [
    {
      provide: MAIL_TRANSPORT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>): MailTransport =>
        nodemailer.createTransport({
          host: config.get('MAIL_HOST', { infer: true }),
          port: config.get('MAIL_PORT', { infer: true }),
          auth: { user: config.get('MAIL_USER', { infer: true }), pass: config.get('MAIL_PASS', { infer: true }) },
        }) as unknown as MailTransport,
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
