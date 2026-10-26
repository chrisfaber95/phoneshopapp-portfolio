import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { ActieOrder, ActieOrderHasProduct, CustomerHasSpaaractie, Product, ProductVariant, SpaaractieHasProduct } from '../database/models';
import { MailModule } from '../mail/mail.module';
import { ActieOrdersCreateService } from './actie-orders-create.service';
import { ActieOrdersUpdateService } from './actie-orders-update.service';
import { ActieOrdersController } from './actie-orders.controller';
import { ActieOrdersService } from './actie-orders.service';

// Orders of the savings action shop (products paid with stamps)
@Module({
  imports: [SequelizeModule.forFeature([ActieOrder, ActieOrderHasProduct, CustomerHasSpaaractie, SpaaractieHasProduct, Product, ProductVariant]), AuthModule, MailModule],
  controllers: [ActieOrdersController],
  providers: [ActieOrdersService, ActieOrdersCreateService, ActieOrdersUpdateService],
})
export class ActieOrdersModule {}
