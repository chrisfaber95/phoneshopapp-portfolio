import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CurrentPrincipal } from '../auth/access/principal.decorator';
import { Principal } from '../auth/principal.service';
import { DaytotalsService } from './daytotals.service';

@Controller('v1/daytotals')
export class DaytotalsController {
  constructor(private readonly service: DaytotalsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':date')
  forDate(@Param('date') date: string) {
    return this.service.list(date);
  }

  @Post()
  @HttpCode(200)
  save(@CurrentPrincipal() principal: Principal | null, @Body() body: Record<string, unknown>) {
    return this.service.save(principal, body ?? {});
  }
}
