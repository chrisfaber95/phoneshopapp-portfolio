import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer, CustomerHasSpaaractie, Spaaractie, SpaaractieHasProduct } from '../database/models';
import { CustomerSpaaractiesController } from './customer-spaaracties.controller';
import { CustomerSpaaractiesService } from './customer-spaaracties.service';
import { SpaaractiesController } from './spaaracties.controller';
import { SpaaractiesService } from './spaaracties.service';

// Savings actions and the stamp cards of customers
@Module({
  imports: [SequelizeModule.forFeature([Spaaractie, SpaaractieHasProduct, CustomerHasSpaaractie, Customer])],
  controllers: [SpaaractiesController, CustomerSpaaractiesController],
  providers: [SpaaractiesService, CustomerSpaaractiesService],
})
export class SpaaractiesModule {}
