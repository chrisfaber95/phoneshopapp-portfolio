import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CustomerAuthService } from '../src/auth/customer-auth.service';
import { CustomerLoginController, UserLoginController } from '../src/auth/login.controllers';
import { UserAuthService } from '../src/auth/user-auth.service';

// The login controllers with fake services: what is checked here is the HTTP contract of the old Server
const start = async (login: jest.Mock): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    controllers: [UserLoginController, CustomerLoginController],
    providers: [
      { provide: UserAuthService, useValue: { login } },
      { provide: CustomerAuthService, useValue: { login } },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
  return app;
};

describe('POST /api/v1/{user,customer}/login', () => {
  it.each(['user', 'customer'])('%s login answers HTTP 200 (not 201) with the service result, also for failures', async (kind) => {
    const login = jest.fn().mockResolvedValueOnce({ user: { name: 'x' } }).mockResolvedValueOnce({ err: 'Verkeerde gegevens ingevoerd' });
    const app = await start(login);
    await request(app.getHttpServer()).post(`/api/v1/${kind}/login`).send({ email: 'a@b.nl', password: 'p' }).expect(200).expect({ user: { name: 'x' } });
    await request(app.getHttpServer()).post(`/api/v1/${kind}/login`).send({ email: 'a@b.nl', password: 'bad' }).expect(200).expect({ err: 'Verkeerde gegevens ingevoerd' });
    expect(login).toHaveBeenCalledWith({ email: 'a@b.nl', password: 'p' });
    await app.close();
  });

  it('a request without a body reaches the service as an empty object', async () => {
    const login = jest.fn().mockResolvedValue({ err: 'Alle velden moeten zijn ingevuld.' });
    const app = await start(login);
    await request(app.getHttpServer()).post('/api/v1/user/login').expect(200);
    expect(login).toHaveBeenCalledWith({});
    await app.close();
  });
});
