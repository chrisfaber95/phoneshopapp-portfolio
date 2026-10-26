import { BadRequestException, Body, Controller, Get, Header, HttpCode, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DiscountsService } from './discounts.service';
import { ImagesService, UploadedImage } from './images.service';
import { InformationImportService } from './information-import.service';
import { ProductSearchService } from './product-search.service';
import { ProductsService } from './products.service';

const isDigits = (value: string): boolean => /^[0-9]+$/.test(value);

@Controller('v1/product')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly search: ProductSearchService,
  ) {}

  @Get()
  all(@Query() query: Record<string, unknown>) {
    return this.products.list(query);
  }

  // declared before :ean, otherwise "search" would be taken as an EAN
  @Get('search')
  find(@Query() query: Record<string, unknown>) {
    return this.search.search(query);
  }

  // `res.json(null)` for an unknown product, like the old Server: a JSON body "null", not an empty one
  @Get(':ean')
  @Header('Content-Type', 'application/json')
  async single(@Param('ean') ean: string): Promise<string> {
    return JSON.stringify(await this.products.single(ean));
  }
}

@Controller('v1/discounts')
export class DiscountsController {
  constructor(
    private readonly discounts: DiscountsService,
    private readonly images: ImagesService,
  ) {}

  @Get()
  all(@Query() query: Record<string, unknown>) {
    return this.discounts.list(query);
  }

  @Get('types')
  types(@Query() query: Record<string, unknown>) {
    return this.discounts.listTypes(query);
  }

  // multipart field "sales", jpeg only, 5 MB per file (the old limits)
  @Post('images')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('sales', 20, { limits: { fileSize: 5 * 1024 * 1024 } }))
  upload(@UploadedFiles() files: UploadedImage[]) {
    return this.images.upload(files);
  }

  @Get('get_images')
  listImages() {
    return this.images.list();
  }

  @Get('get_images/:imgId')
  @Header('Content-Type', 'image/jpeg')
  async image(@Param('imgId') imageId: string): Promise<string> {
    if (!isDigits(imageId)) throw new BadRequestException({ message: 'Invalid image id' });
    return this.images.base64(imageId);
  }
}

@Controller('v1/info')
export class InfoController {
  constructor(
    private readonly products: ProductsService,
    private readonly importing: InformationImportService,
  ) {}

  @Post('post')
  @HttpCode(200)
  import(@Body() body: unknown) {
    return this.importing.importRecords(body);
  }

  @Get()
  all() {
    return this.products.allInformation();
  }
}
