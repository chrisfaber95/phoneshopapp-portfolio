import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RULES, classify } from '../src/auth/access/access.rules';
import { DaytotalsController } from '../src/daytotals/daytotals.controller';
import { DaytotalsService } from '../src/daytotals/daytotals.service';
import { DiscountsService } from '../src/products/discounts.service';
import { ImagesService } from '../src/products/images.service';
import { InformationImportService } from '../src/products/information-import.service';
import { DiscountsController, InfoController } from '../src/products/products.controllers';
import { ProductsService } from '../src/products/products.service';

const daytotals = { list: jest.fn().mockResolvedValue([]), save: jest.fn().mockResolvedValue({ success: true }) };
const images = { upload: jest.fn().mockResolvedValue('uploaded'), list: jest.fn(), base64: jest.fn() };
const importing = { importRecords: jest.fn().mockResolvedValue('nice') };

describe('admin writes', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DaytotalsController, DiscountsController, InfoController],
      providers: [
        { provide: DaytotalsService, useValue: daytotals }, { provide: ImagesService, useValue: images }, { provide: InformationImportService, useValue: importing },
        { provide: DiscountsService, useValue: {} }, { provide: ProductsService, useValue: {} },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(() => app.close());

  it('day totals: list, list of a day, save', async () => {
    const server = app.getHttpServer();
    await request(server).get('/api/v1/daytotals').expect(200, []);
    await request(server).get('/api/v1/daytotals/2026-05-01').expect(200);
    expect(daytotals.list).toHaveBeenLastCalledWith('2026-05-01');
    await request(server).post('/api/v1/daytotals').send({ date: '2026-05-01', total_revenue: 5 }).expect(200, { success: true });
  });

  it('takes the multipart upload of discount images (field "sales")', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/discounts/images').attach('sales', Buffer.from('ffd8ffe0', 'hex'), 'sale.jpeg').expect(200);
    expect(res.text).toBe('uploaded');
    expect(images.upload.mock.calls[0][0]).toHaveLength(1);
    expect(images.upload.mock.calls[0][0][0]).toMatchObject({ originalname: 'sale.jpeg' });
  });

  it('imports product information', async () => {
    await request(app.getHttpServer()).post('/api/v1/info/post').send([{ ean: '1' }]).expect(200);
    expect(importing.importRecords).toHaveBeenCalledWith([{ ean: '1' }]);
  });

  it('all of these writes are for employees (the rules default), reading day totals too', () => {
    const v1 = (method: string, path: string) => classify(RULES.v1, method, path);
    expect(v1('POST', '/daytotals')).toBe('user');
    expect(v1('GET', '/daytotals/2026-05-01')).toBe('user');
    expect(v1('POST', '/discounts/images')).toBe('user');
    expect(v1('POST', '/info/post')).toBe('user');
  });
});

describe('product maintenance access rules', () => {
  it('every product write is for employees, the reads stay public', () => {
    const v1 = (method: string, path: string) => classify(RULES.v1, method, path);
    for (const [method, path] of [['PUT', '/product'], ['POST', '/product/post'], ['DELETE', '/product/delete/5'], ['POST', '/product/scanner'], ['POST', '/product/update_images']]) expect(v1(method, path)).toBe('user');
    expect(v1('GET', '/product')).toBe('public');
  });
});

describe('receipt access rule', () => {
  it('the receipt link is public (the reference is the proof)', () => {
    expect(classify(RULES.v1, 'GET', '/order/receipt/0b1d3a5c-1111-2222-3333-444455556666')).toBe('public');
  });
});
