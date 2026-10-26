import { Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common';
import { CurrentPrincipal } from '../auth/access/principal.decorator';
import { Principal } from '../auth/principal.service';
import { asRecord } from './customer-fields';
import { FavoritesService } from './favorites.service';
import { OrderInformationService } from './order-information.service';

@Controller('v1/customer_favorites')
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.service.list(query);
  }

  @Post()
  @HttpCode(200)
  add(@CurrentPrincipal() principal: Principal | null, @Body() body: Record<string, unknown>) {
    return this.service.add(principal, asRecord(body));
  }

  @Delete()
  remove(@CurrentPrincipal() principal: Principal | null, @Body() body: Record<string, unknown>) {
    return this.service.remove(principal, asRecord(body));
  }
}

@Controller('v1/order_information')
export class OrderInformationController {
  constructor(private readonly service: OrderInformationService) {}

  @Get()
  list(@CurrentPrincipal() principal: Principal | null, @Query() query: Record<string, unknown>) {
    return this.service.list(principal, query);
  }

  @Delete()
  remove(@CurrentPrincipal() principal: Principal | null, @Body() body: Record<string, unknown>) {
    return this.service.remove(principal, asRecord(body));
  }
}
