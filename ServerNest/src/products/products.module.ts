import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiscountType, Discounts, Product, Productinformation } from '../database/models';
import { DiscountsService } from './discounts.service';
import { ImagesService } from './images.service';
import { InformationImportService } from './information-import.service';
import { ProductSearchService } from './product-search.service';
import { DiscountsController, InfoController, ProductsController } from './products.controllers';
import { ProductsService } from './products.service';

// What the shop front reads: products, search, discounts, product information
@Module({
  imports: [SequelizeModule.forFeature([Product, Productinformation, Discounts, DiscountType])],
  controllers: [ProductsController, DiscountsController, InfoController],
  providers: [ProductsService, ProductSearchService, DiscountsService, ImagesService, InformationImportService],
})
export class ProductsModule {}
