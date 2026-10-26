import { Controller, Delete, Get, INestApplication, Options, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as jsonwebtoken from 'jsonwebtoken';
import request from 'supertest';
import type { Request } from 'express';
import { AccessGuard, RequestWithPrincipal } from '../src/auth/access/access.guard';
import { Public } from '../src/auth/access/public.decorator';
import { PrincipalService } from '../src/auth/principal.service';
import { TokenService } from '../src/auth/token.service';

const KEY = 'test-key';
const token = (userId: string, options?: jsonwebtoken.SignOptions) => jsonwebtoken.sign({ user_id: userId }, KEY, options);

// Stand-ins for a few real endpoints: what matters is which access rule the guard applies to them
@Controller('api/v1')
class FakeRoutes {
  @Get('product') product(@Req() req: Request) { return { ok: true, principal: (req as RequestWithPrincipal).principal ?? null }; }
  @Delete('product/delete/1') remove() { return { ok: true }; }
  @Get('userroles') roles() { return { ok: true }; }
  @Get('order_information') info() { return { ok: true }; }
  @Delete('order_information') removeInfo() { return { ok: true }; }
  @Options('order_information') preflight() { return { ok: true }; }
  @Post('customer/login') login() { return { ok: true }; }
}

@Public()
@Controller('api/health')
class FakeHealth {
  @Get() health() { return { ok: true }; }
}

const start = async (accessMode: 'enforce' | 'log' = 'enforce'): Promise<INestApplication> => {
  const config = { get: (key: string) => (key === 'TOKEN_KEY' ? KEY : key === 'ACCESS_MODE' ? accessMode : undefined) };
  const principals = { find: async (id: string) => (id === 'u-1' ? { type: 'user', id } : id === 'c-1' ? { type: 'customer', id } : null) };
  const moduleRef = await Test.createTestingModule({
    controllers: [FakeRoutes, FakeHealth],
    providers: [
      JwtService,
      TokenService,
      { provide: ConfigService, useValue: config },
      { provide: PrincipalService, useValue: principals },
      { provide: APP_GUARD, useClass: AccessGuard },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
};

describe('access guard', () => {
  let app: INestApplication;
  afterEach(async () => app.close());

  it('public endpoints need no token; a logged-out client ("null") is fine too', async () => {
    app = await start();
    await request(app.getHttpServer()).get('/api/v1/product').expect(200);
    await request(app.getHttpServer()).get('/api/v1/product').set('authorization', 'null').expect(200);
    await request(app.getHttpServer()).post('/api/v1/customer/login').expect(201);
    await request(app.getHttpServer()).get('/api/health').expect(200); // @Public()
  });

  it('a valid token is recognised on a public endpoint too, a bad one is just ignored', async () => {
    app = await start();
    const server = app.getHttpServer();
    const body = (header?: string) => request(server).get('/api/v1/product').set('authorization', header ?? '').expect(200).then((res) => (res.body as { principal: unknown }).principal);
    await expect(body(token('c-1'))).resolves.toEqual({ type: 'customer', id: 'c-1' });
    await expect(body('garbage')).resolves.toBeNull();
    await expect(body()).resolves.toBeNull();
  });

  it('employee endpoints: no token 401, customer token 403, employee token 200', async () => {
    app = await start();
    const server = app.getHttpServer();
    await request(server).delete('/api/v1/product/delete/1').expect(401).expect({ error: 'Authentication required' });
    await request(server).delete('/api/v1/product/delete/1').set('authorization', token('c-1')).expect(403).expect({ error: 'Not allowed' });
    await request(server).delete('/api/v1/product/delete/1').set('authorization', token('u-1')).expect(200);
  });

  it('bad tokens are rejected: wrong key, expired, unknown user; a Bearer prefix is accepted', async () => {
    app = await start();
    const server = app.getHttpServer();
    await request(server).get('/api/v1/userroles').set('authorization', jsonwebtoken.sign({ user_id: 'u-1' }, 'other-key')).expect(401);
    await request(server).get('/api/v1/userroles').set('authorization', token('u-1', { expiresIn: -10 })).expect(401);
    await request(server).get('/api/v1/userroles').set('authorization', token('nobody')).expect(401);
    await request(server).get('/api/v1/userroles').set('authorization', `Bearer ${token('u-1')}`).expect(200);
  });

  it("customer data: a token or the customer id is enough, nothing at all is not", async () => {
    app = await start();
    const server = app.getHttpServer();
    await request(server).get('/api/v1/order_information').expect(401);
    await request(server).get('/api/v1/order_information?customer_id=abc').expect(200);
    await request(server).get('/api/v1/order_information?customer_id=').expect(401);
    await request(server).delete('/api/v1/order_information').send({ customer_id: 'abc' }).expect(200);
    await request(server).get('/api/v1/order_information').set('authorization', token('c-1')).expect(200);
    await request(server).get('/api/v1/order_information').set('authorization', token('u-1')).expect(200);
  });

  it('CORS preflight requests are never blocked', async () => {
    app = await start();
    await request(app.getHttpServer()).options('/api/v1/order_information').expect(200);
  });

  it('ACCESS_MODE=log lets everything through', async () => {
    app = await start('log');
    await request(app.getHttpServer()).delete('/api/v1/product/delete/1').expect(200);
  });
});
