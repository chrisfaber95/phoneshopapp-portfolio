import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Daytotals } from '../database/models';
import { DaytotalsController } from './daytotals.controller';
import { DaytotalsService } from './daytotals.service';

@Module({
  imports: [SequelizeModule.forFeature([Daytotals])],
  controllers: [DaytotalsController],
  providers: [DaytotalsService],
})
export class DaytotalsModule {}
