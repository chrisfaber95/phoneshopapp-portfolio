import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Department, Userrole } from '../database/models';
import { DepartmentsService } from './departments.service';
import { DepartmentsController, RootV1Controller, RootV2Controller, SettingsController, UserrolesController } from './reference-data.controllers';

// Small lookup data: departments, user roles, settings and the "Connected" root routes
@Module({
  imports: [SequelizeModule.forFeature([Department, Userrole])],
  controllers: [RootV1Controller, RootV2Controller, DepartmentsController, UserrolesController, SettingsController],
  providers: [DepartmentsService],
})
export class ReferenceDataModule {}
