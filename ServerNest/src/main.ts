import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { imageRoot } from './common/images';
import { AppEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });

  // Express 5 parses query strings simply by default; the old Server (and its clients) use the extended parser:
  // ?id[]=1&id[]=2 is a list, ?a[b]=c is an object
  app.set('query parser', 'extended');

  // Same body limits as the old Server (10 MB, used for base64 product images)
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { limit: '10mb', extended: true, parameterLimit: 10000 });

  const config = app.get<ConfigService<AppEnv, true>>(ConfigService);

  // Behind a reverse proxy the client address (used by the rate limits) comes from X-Forwarded-For: TRUST_PROXY says how far to trust it
  const proxy = config.get('TRUST_PROXY', { infer: true });
  if (proxy) app.set('trust proxy', /^\d+$/.test(proxy) ? Number(proxy) : proxy === 'true' ? true : proxy);

  // Security headers. The images are used by the shop front on another origin, so they must stay embeddable.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // The old Server answers every origin; that stays the default. CORS_ORIGINS (a comma separated list) restricts it to the shop front.
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
  });

  // Product and discount images, at the same URL as before
  app.useStaticAssets(imageRoot(), { prefix: '/api/back-images/' });

  // Start permissive (accept what the clients send today); modules tighten their DTOs once their parity checks pass
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));

  app.setGlobalPrefix('api');

  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
