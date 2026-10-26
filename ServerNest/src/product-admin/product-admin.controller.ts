import { Body, Controller, Delete, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ProductAdminService } from './product-admin.service';

// Product maintenance (employees: the access rules' default). Reading products is in the products module.
@Controller('v1/product')
export class ProductAdminController {
  constructor(private readonly service: ProductAdminService) {}

  @Put()
  update(@Body() body: unknown) {
    return this.service.update(body);
  }

  @Post('post')
  @HttpCode(200)
  upsert(@Body() body: unknown) {
    return this.service.upsert(body);
  }

  @Delete('delete/:productId')
  remove(@Param('productId') productId: string) {
    return this.service.remove(productId);
  }

  @Post('scanner')
  @HttpCode(200)
  scanner(@Body() body: unknown) {
    return this.service.scanner(body);
  }

  @Post('update_images')
  @HttpCode(200)
  updateImage(@Body() body: unknown) {
    return this.service.updateImage(body);
  }
}
