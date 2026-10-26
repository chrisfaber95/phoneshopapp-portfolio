import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Customer, CustomerHasFavorite, CustomerInformation, CustomerSettings, OrderInformation } from '../database/models';
import { MailModule } from '../mail/mail.module';
import { CustomersController } from './customers.controller';
import { FavoritesController, OrderInformationController } from './customers-related.controllers';
import { CustomersService } from './customers.service';
import { FavoritesService } from './favorites.service';
import { OrderInformationService } from './order-information.service';

// Customers: sign-up, profile, password reset, favorites and the saved delivery/invoice details
@Module({
  imports: [SequelizeModule.forFeature([Customer, CustomerSettings, CustomerInformation, CustomerHasFavorite, OrderInformation]), AuthModule, MailModule],
  controllers: [CustomersController, FavoritesController, OrderInformationController],
  providers: [CustomersService, FavoritesService, OrderInformationService],
})
export class CustomersModule {}
