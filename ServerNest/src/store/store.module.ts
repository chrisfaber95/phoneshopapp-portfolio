import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppEnv } from '../config/env.validation';
import { DeliveryLocationController, JobApplicationController, JobOfferController, ShopsController, TermsController, TimeslotController } from './store.controllers';
import { SHOPS_CONNECTION, STORE_MODELS } from './store.models';
import { StoreService } from './store.service';

@Module({
  imports: [SequelizeModule.forFeature(STORE_MODELS, SHOPS_CONNECTION)],
  controllers: [ShopsController, TimeslotController, DeliveryLocationController, TermsController, JobOfferController, JobApplicationController],
  providers: [StoreService],
})
export class StoreModule {}

// The store site (/api/v2) lives in its own database ("shops"). The server connects to it at start-up, so a missing database would stop
// the whole server: with SHOPS_DB_NAME=off the store site is left out (its routes answer 404) until the database exists.
export const storeImports = (): (DynamicModule | Type<unknown>)[] => {
  if (process.env.SHOPS_DB_NAME === 'off') return [];
  return [
    SequelizeModule.forRootAsync({
      name: SHOPS_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        name: SHOPS_CONNECTION,
        dialect: 'mysql' as const,
        host: config.get('DB_HOST', { infer: true }),
        username: config.get('DB_USER', { infer: true }),
        password: config.get('DB_PASS', { infer: true }),
        database: config.get('SHOPS_DB_NAME', { infer: true }),
        timezone: '+01:00',
        models: STORE_MODELS,
        synchronize: false,
        logging: false,
        retryAttempts: 3,
        retryDelay: 1000,
        pool: { max: 10, min: 0, idle: 5000 },
      }),
    }),
    StoreModule,
  ];
};
