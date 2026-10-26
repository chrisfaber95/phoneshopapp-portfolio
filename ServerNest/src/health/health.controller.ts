import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Public } from '../auth/access/public.decorator';

export interface HealthStatus {
  status: 'ok';
  database: 'up';
}

@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Sequelize) {}

  // Answers 200 when the shop database can be reached, 503 otherwise (for load balancers and the parity harness)
  @Get()
  async check(): Promise<HealthStatus> {
    try {
      await this.connection.authenticate();
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return { status: 'ok', database: 'up' };
  }
}
