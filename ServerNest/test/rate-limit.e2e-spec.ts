import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SkipThrottle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { Strict } from '../src/common/rate-limit';

@Controller('limited')
class LimitedController {
  @Post('login') @Strict() login() { return { ok: true }; }
  @Get('plain') plain() { return { ok: true }; }
  @Get('health') @SkipThrottle() health() { return { ok: true }; }
}

const start = async (skip = false): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot({ throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }], skipIf: () => skip })],
    controllers: [LimitedController],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
};

describe('rate limits', () => {
  it('a @Strict route answers 429 after 10 requests a minute, other routes keep their generous limit', async () => {
    const app = await start();
    const server = app.getHttpServer();
    for (let i = 0; i < 10; i++) await request(server).post('/limited/login').expect(201);
    const blocked = await request(server).post('/limited/login').expect(429);
    expect(blocked.headers['retry-after']).toBeDefined();
    await request(server).get('/limited/plain').expect(200);
    await app.close();
  });

  it('a route marked SkipThrottle is never limited', async () => {
    const app = await start();
    for (let i = 0; i < 20; i++) await request(app.getHttpServer()).get('/limited/health').expect(200);
    await app.close();
  });

  it('can be switched off', async () => {
    const app = await start(true);
    for (let i = 0; i < 15; i++) await request(app.getHttpServer()).post('/limited/login').expect(201);
    await app.close();
  });
});
