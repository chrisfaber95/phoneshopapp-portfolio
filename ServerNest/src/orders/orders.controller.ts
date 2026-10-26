import { Body, Controller, Get, Header, Headers, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentPrincipal } from '../auth/access/principal.decorator';
import { Principal } from '../auth/principal.service';
import { Strict } from '../common/rate-limit';
import { OrdersCreateService } from './orders-create.service';
import { OrdersUpdateService } from './orders-update.service';
import { OrdersService } from './orders.service';

@Controller('v1/order')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly creating: OrdersCreateService,
    private readonly updating: OrdersUpdateService,
  ) {}

  // `/order/:date` is the same list: the old Server ignored the date and only used the filters
  @Get(['', ':date'])
  list(@CurrentPrincipal() principal: Principal | null, @Query() query: Record<string, unknown>) {
    return this.service.list(principal, query);
  }

  // Guest checkout is allowed; the order is linked to the customer when the request carries that customer's token
  @Post()
  @Strict()
  @HttpCode(200)
  create(@CurrentPrincipal() principal: Principal | null, @Body() body: unknown, @Headers('origin') origin: string | undefined) {
    return this.creating.create(principal, body, origin);
  }

  // The rules leave this route open for the customer's payment link (type Onlinepayment); the service asks employees for the rest
  @Put(':orderId')
  update(@CurrentPrincipal() principal: Principal | null, @Param('orderId') orderId: string, @Body() body: unknown) {
    return this.updating.update(principal, orderId, body);
  }

  @Get('count/:date')
  count(@Param('date') date: string) {
    return this.service.count(date);
  }

  // `res.json(null)` for an unknown order, like the old Server
  @Get('single/:orderRef')
  @Header('Content-Type', 'application/json')
  async single(@Param('orderRef') orderRef: string): Promise<string> {
    return JSON.stringify(await this.service.single(orderRef));
  }
}
