import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { CurrentPrincipal } from '../auth/access/principal.decorator';
import { Principal } from '../auth/principal.service';
import { CustomerSpaaractiesService } from './customer-spaaracties.service';

// Not carried over from the old Server: `POST /customer_spaaractie` (a copy of the customer sign-up that created a Customer from the
// body) and `GET /customer_spaaractie/reminder` (hardcoded to a test address, and never reached because `/:customerId` came first).
@Controller('v1/customer_spaaractie')
export class CustomerSpaaractiesController {
  constructor(private readonly service: CustomerSpaaractiesService) {}

  @Get()
  list(@CurrentPrincipal() principal: Principal | null, @Query() query: Record<string, unknown>) {
    return this.service.list(principal, query);
  }

  // the employee functions come first so that `employeeupdate` is never read as a customer id
  @Put('employeeupdate')
  employeeUpdate(@Body() body: unknown) {
    return this.service.employeeUpdate(body);
  }

  @Put('employeechange')
  employeeChange(@Body() body: unknown) {
    return this.service.employeeChange(body);
  }

  @Put('nostamps')
  noStamps() {
    return this.service.noStamps();
  }

  @Get(':customerId')
  forCustomer(@CurrentPrincipal() principal: Principal | null, @Param('customerId') customerId: string) {
    return this.service.forCustomer(principal, customerId);
  }

  @Put()
  exchange(@CurrentPrincipal() principal: Principal | null, @Body() body: unknown) {
    return this.service.exchange(principal, body);
  }
}
