import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActieOrderHasProduct, OrderHasProduct, Product, ProductAdditionInformation, Productinformation } from '../database/models';
import { ProductAdminController } from './product-admin.controller';
import { ProductAdminService } from './product-admin.service';

@Module({
  imports: [SequelizeModule.forFeature([Product, Productinformation, ProductAdditionInformation, OrderHasProduct, ActieOrderHasProduct])],
  controllers: [ProductAdminController],
  providers: [ProductAdminService],
})
export class ProductAdminModule {}
