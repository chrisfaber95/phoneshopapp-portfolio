import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer, CustomerInformation, CustomerSettings, User, Userrole } from '../database/models';
import { AccessGuard } from './access/access.guard';
import { CryptoService } from './crypto.service';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginController, UserLoginController } from './login.controllers';
import { PasswordService } from './password.service';
import { PrincipalService } from './principal.service';
import { TokenService } from './token.service';
import { UserAuthService } from './user-auth.service';

@Module({
  imports: [SequelizeModule.forFeature([Userrole, User, Customer, CustomerSettings, CustomerInformation]), JwtModule.register({})],
  controllers: [UserLoginController, CustomerLoginController],
  providers: [
    TokenService,
    PasswordService,
    CryptoService,
    PrincipalService,
    UserAuthService,
    CustomerAuthService,
    // every request goes through the access rules
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
  exports: [TokenService, PasswordService, CryptoService],
})
export class AuthModule {}
