import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/sequelize';
import request from 'supertest';
import { HealthController } from '../src/health/health.controller';

// The real database is never used in tests: the connection is replaced by a fake that succeeds or fails on demand.
const appWith = async (authenticate: () => Promise<void>): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: getConnectionToken(), useValue: { authenticate } }],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  await app.init();
  return app;
};

describe('GET /api/health', () => {
  it('answers 200 when the database can be reached', async () => {
    const app = await appWith(() => Promise.resolve());
    await request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok', database: 'up' });
    await app.close();
  });

  it('answers 503 when the database cannot be reached', async () => {
    const app = await appWith(() => Promise.reject(new Error('connect ECONNREFUSED')));
    await request(app.getHttpServer()).get('/api/health').expect(503).expect({ status: 'error', database: 'down' });
    await app.close();
  });
});
