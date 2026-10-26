import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { User, Userrole } from '../database/models';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Userrole]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
