import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { CustomerHasSpaaractie, Discounts, Order, OrderHasProduct, Product, Spaaractie } from '../database/models';
import { MailModule } from '../mail/mail.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersCreateService } from './orders-create.service';
import { OrdersUpdateService } from './orders-update.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

// Orders: reading, placing an order with its first Mollie payment, and updating it (picking, scanning, paying). The Mollie webhook is in the payments module.
@Module({
  imports: [SequelizeModule.forFeature([Order, OrderHasProduct, Product, Discounts, Spaaractie, CustomerHasSpaaractie]), AuthModule, PaymentsModule, MailModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersCreateService, OrdersUpdateService],
})
export class OrdersModule {}
