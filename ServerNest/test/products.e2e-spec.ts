import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DiscountsService } from '../src/products/discounts.service';
import { ImagesService } from '../src/products/images.service';
import { InformationImportService } from '../src/products/information-import.service';
import { ProductSearchService } from '../src/products/product-search.service';
import { DiscountsController, InfoController, ProductsController } from '../src/products/products.controllers';
import { ProductsService } from '../src/products/products.service';

const products = { list: jest.fn().mockResolvedValue([{ id: 1 }]), single: jest.fn(), allInformation: jest.fn().mockResolvedValue([{ id: 9 }]) };
const search = { search: jest.fn().mockResolvedValue([{ ean: '1' }]) };
const discounts = { list: jest.fn().mockResolvedValue([{ discount_id: 1 }]), listTypes: jest.fn().mockResolvedValue([{ discounttype_id: 1 }]) };
const images = { list: jest.fn().mockResolvedValue([{ images_id: 1 }]), base64: jest.fn().mockResolvedValue('QUJD') };

const start = async (): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    controllers: [ProductsController, DiscountsController, InfoController],
    providers: [
      { provide: ProductsService, useValue: products },
      { provide: ProductSearchService, useValue: search },
      { provide: DiscountsService, useValue: discounts },
      { provide: ImagesService, useValue: images },
      { provide: InformationImportService, useValue: {} },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
  return app;
};

describe('product endpoints', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await start(); });
  afterAll(async () => app.close());

  it('GET /api/v1/product passes the query string on', async () => {
    await request(app.getHttpServer()).get('/api/v1/product?department_id=180&customer_id=c-1').expect(200).expect([{ id: 1 }]);
    expect(products.list).toHaveBeenCalledWith({ department_id: '180', customer_id: 'c-1' });
  });

  it('GET /api/v1/product/search is the search, not a product called "search"', async () => {
    await request(app.getHttpServer()).get('/api/v1/product/search?search=melk').expect(200).expect([{ ean: '1' }]);
    expect(search.search).toHaveBeenCalledWith({ search: 'melk' });
    expect(products.single).not.toHaveBeenCalled();
  });

  it('GET /api/v1/product/:ean answers the product, or the JSON value null (not an empty body) when unknown', async () => {
    products.single.mockResolvedValueOnce({ ean: '10010' }).mockResolvedValueOnce(null);
    await request(app.getHttpServer()).get('/api/v1/product/10010').expect(200).expect({ ean: '10010' });
    const unknown = await request(app.getHttpServer()).get('/api/v1/product/0000').expect(200);
    expect(unknown.headers['content-type']).toMatch(/application\/json/);
    expect(unknown.text).toBe('null');
  });

  it('GET /api/v1/discounts and /discounts/types', async () => {
    await request(app.getHttpServer()).get('/api/v1/discounts?date=2022-11-30').expect(200).expect([{ discount_id: 1 }]);
    expect(discounts.list).toHaveBeenCalledWith({ date: '2022-11-30' });
    await request(app.getHttpServer()).get('/api/v1/discounts/types').expect(200).expect([{ discounttype_id: 1 }]);
  });

  it('discount images: the list, and one image as base64 text with an image content type', async () => {
    await request(app.getHttpServer()).get('/api/v1/discounts/get_images').expect(200).expect([{ images_id: 1 }]);
    // supertest does not read text for an image content type: collect the body ourselves
    const image = await request(app.getHttpServer())
      .get('/api/v1/discounts/get_images/7')
      .buffer(true)
      .parse((res, done) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => done(null, data));
      })
      .expect(200);
    expect(image.headers['content-type']).toMatch(/image\/jpeg/);
    expect(image.body).toBe('QUJD');
    expect(images.base64).toHaveBeenCalledWith('7');
  });

  it('a non-numeric image id answers 400 without reaching the service', async () => {
    images.base64.mockClear();
    await request(app.getHttpServer()).get('/api/v1/discounts/get_images/1%20OR%201=1').expect(400);
    expect(images.base64).not.toHaveBeenCalled();
  });

  it('GET /api/v1/info lists all product information', async () => {
    await request(app.getHttpServer()).get('/api/v1/info').expect(200).expect([{ id: 9 }]);
  });
});
