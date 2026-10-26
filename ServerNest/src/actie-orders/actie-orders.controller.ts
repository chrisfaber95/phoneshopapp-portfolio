import { Body, Controller, Get, Header, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentPrincipal } from '../auth/access/principal.decorator';
import { Principal } from '../auth/principal.service';
import { Strict } from '../common/rate-limit';
import { ActieOrdersCreateService } from './actie-orders-create.service';
import { ActieOrdersUpdateService } from './actie-orders-update.service';
import { ActieOrdersService } from './actie-orders.service';

// Not carried over from the old Server: `DELETE /actie_order/:id` (an empty stub that never answered) and
// `GET /actie_order/product/:id` (an empty stub). Reading the list and updating are for employees (the access rules' default).
@Controller('v1/actie_order')
export class ActieOrdersController {
  constructor(
    private readonly service: ActieOrdersService,
    private readonly creating: ActieOrdersCreateService,
    private readonly updating: ActieOrdersUpdateService,
  ) {}

  // `/actie_order/:date` is the same list (the old Server only used the filters)
  @Get(['', ':date'])
  list(@Query() query: Record<string, unknown>) {
    return this.service.list(query);
  }

  @Get('count/:date')
  count(@Param('date') date: string) {
    return this.service.count(date);
  }

  // `res.json(null)` for an unknown order; the link in the mail is the proof
  @Get('single/:orderRef')
  @Header('Content-Type', 'application/json')
  async single(@Param('orderRef') orderRef: string): Promise<string> {
    return JSON.stringify(await this.service.single(orderRef));
  }

  @Post()
  @Strict()
  @HttpCode(200)
  create(@CurrentPrincipal() principal: Principal | null, @Body() body: unknown) {
    return this.creating.create(principal, body);
  }

  @Put(':orderId')
  update(@CurrentPrincipal() principal: Principal | null, @Param('orderId') orderId: string, @Body() body: unknown) {
    return this.updating.update(principal, orderId, body);
  }
}
