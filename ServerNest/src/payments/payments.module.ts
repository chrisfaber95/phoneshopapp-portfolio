import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { createMollieClient } from '@mollie/api-client';
import { Order } from '../database/models';
import { MailModule } from '../mail/mail.module';
import { MollieWebhookController } from './mollie-webhook.controller';
import { MOLLIE_FACTORY, MollieApi, MollieFactory, MollieService } from './mollie.service';
import { OrderPaymentsService } from './order-payments.service';

// Mollie payments: creating them (used when an order is placed) and the webhook that follows them up
@Module({
  imports: [SequelizeModule.forFeature([Order]), MailModule],
  controllers: [MollieWebhookController],
  providers: [
    { provide: MOLLIE_FACTORY, useValue: ((apiKey: string) => createMollieClient({ apiKey }) as unknown as MollieApi) as MollieFactory },
    MollieService,
    OrderPaymentsService,
  ],
  exports: [MollieService],
})
export class PaymentsModule {}
