import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../database/models';
import { ReceiptService } from './receipt.service';
import { ReceiptsController } from './receipts.controller';

@Module({
  imports: [SequelizeModule.forFeature([Order]), AuthModule],
  controllers: [ReceiptsController],
  providers: [ReceiptService],
})
export class ReceiptsModule {}
