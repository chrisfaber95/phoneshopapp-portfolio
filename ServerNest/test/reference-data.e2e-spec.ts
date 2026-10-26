import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Userrole } from '../src/database/models';
import { DepartmentsService } from '../src/reference-data/departments.service';
import { DepartmentsController, RootV1Controller, RootV2Controller, SettingsController, UserrolesController } from '../src/reference-data/reference-data.controllers';

const roles = [{ roleId: 'r-1', roleName: 'admin' }];
const findAllRoles = jest.fn().mockResolvedValue(roles);
const departments = { list: jest.fn().mockResolvedValue([{ department_id: 1 }]), remove: jest.fn() };

// the Userrole model needs real attributes for the filter helper
Object.assign(Userrole, { getAttributes: () => ({ roleId: {}, roleName: {} }) });

const start = async (): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    controllers: [RootV1Controller, RootV2Controller, DepartmentsController, UserrolesController, SettingsController],
    providers: [
      { provide: DepartmentsService, useValue: departments },
      { provide: getModelToken(Userrole), useValue: { findAll: findAllRoles } },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
  return app;
};

describe('reference data endpoints', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await start(); });
  afterAll(async () => app.close());

  it('GET /api/v1 and /api/v2 answer { message: "Connected" }', async () => {
    await request(app.getHttpServer()).get('/api/v1').expect(200).expect({ message: 'Connected' });
    await request(app.getHttpServer()).get('/api/v2').expect(200).expect({ message: 'Connected' });
  });

  it('GET /api/v1/departments passes the query to the service', async () => {
    await request(app.getHttpServer()).get('/api/v1/departments?visible=1').expect(200).expect([{ department_id: 1 }]);
    expect(departments.list).toHaveBeenCalledWith({ visible: '1' });
  });

  it('DELETE /api/v1/departments answers the service result as a JSON value with HTTP 200', async () => {
    departments.remove.mockResolvedValueOnce(1).mockResolvedValueOnce({ err: 'x' });
    const first = await request(app.getHttpServer()).delete('/api/v1/departments?department_id=5').expect(200);
    expect(first.headers['content-type']).toMatch(/application\/json/);
    expect(first.text).toBe('1');
    await request(app.getHttpServer()).delete('/api/v1/departments').expect(200).expect({ err: 'x' });
    expect(departments.remove).toHaveBeenNthCalledWith(1, '5');
  });

  it('the department routes that were never implemented answer the JSON string "No" with HTTP 200', async () => {
    const calls = [
      () => request(app.getHttpServer()).get('/api/v1/departments/single/1'),
      () => request(app.getHttpServer()).post('/api/v1/departments/post'),
      () => request(app.getHttpServer()).put('/api/v1/departments/update/1'),
    ];
    for (const call of calls) {
      const res = await call().expect(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.text).toBe('"No"');
    }
  });

  it('GET /api/v1/userroles lists roles, an unknown filter answers 400', async () => {
    await request(app.getHttpServer()).get('/api/v1/userroles').expect(200).expect(roles);
    await request(app.getHttpServer()).get('/api/v1/userroles?password=x').expect(400).expect({ error: 'Unknown filter: password' });
  });

  it('GET /api/v1/settings/rights lists the roles, /language is an empty list', async () => {
    await request(app.getHttpServer()).get('/api/v1/settings/rights').expect(200).expect({ rights: roles });
    await request(app.getHttpServer()).get('/api/v1/settings/language').expect(200).expect({ language: [] });
  });
});
