import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv, AppEnv } from './config/env.validation';
import { ActieOrdersModule } from './actie-orders/actie-orders.module';
import { AuthModule } from './auth/auth.module';
import { SHOP_MODELS } from './database/models';
import { HealthModule } from './health/health.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module';
import { SpaaractiesModule } from './spaaracties/spaaracties.module';
import { DaytotalsModule } from './daytotals/daytotals.module';
import { ProductAdminModule } from './product-admin/product-admin.module';
import { UsersModule } from './users/users.module';
import { SiteModule } from './site/site.module';
import { ReferenceDataModule } from './reference-data/reference-data.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { storeImports } from './store/store.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Rate limits per client address: 300 requests a minute for every route (a shop page makes a few dozen), 10 a minute for the
    // routes that can be abused without a login (@Strict, see common/rate-limit.ts). RATE_LIMIT=off switches them off.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }],
        skipIf: () => config.get('RATE_LIMIT', { infer: true }) === 'off',
      }),
    }),
    // Shop database (same database and settings as the old Server's config/connection.js).
    // The store-site database ("shops", /api/v2) is a second connection, see store/store.module.ts.
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        dialect: 'mysql' as const,
        host: config.get('DB_HOST', { infer: true }),
        username: config.get('DB_USER', { infer: true }),
        password: config.get('DB_PASS', { infer: true }),
        database: config.get('DB_NAME', { infer: true }),
        timezone: '+01:00',
        // every model is registered up front: the associations between models need all of them to exist
        models: SHOP_MODELS,
        synchronize: false, // the schema belongs to the existing database, never create or alter tables from here
        logging: false,
        retryAttempts: 3,
        retryDelay: 1000,
        pool: { max: 30, min: 0, idle: 5000 },
      }),
    }),
    AuthModule,
    ReferenceDataModule,
    ProductsModule,
    OrdersModule,
    ActieOrdersModule,
    CustomersModule,
    ShoppingListsModule,
    SpaaractiesModule,
    UsersModule,
    DaytotalsModule,
    ProductAdminModule,
    ReceiptsModule,
    SiteModule,
    HealthModule,
    ...storeImports(),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
