import { Body, Controller, Delete, Get, Header, HttpCode, Post, Put, Query } from '@nestjs/common';
import { CurrentPrincipal } from '../auth/access/principal.decorator';
import { assertCustomer, assertCustomerAccess, assertEmployee } from '../auth/ownership';
import { Principal } from '../auth/principal.service';
import { Strict } from '../common/rate-limit';
import { asRecord } from './customer-fields';
import { CustomersService } from './customers.service';

@Controller('v1/customer')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  // The text "No Auth" is a JSON string in the old Server (`res.json("No Auth")`)
  @Get()
  @Header('Content-Type', 'application/json')
  async all(@Query() query: Record<string, unknown>): Promise<string> {
    return JSON.stringify(await this.service.findWithToken(query));
  }

  // the logged-in customer's own profile
  @Get('single')
  async single(@CurrentPrincipal() principal: Principal | null, @Query('customer_id') customerId: unknown) {
    assertCustomerAccess(assertCustomer(principal), customerId);
    return { user: await this.service.findOne(customerId) };
  }

  @Get('employee')
  @Header('Content-Type', 'application/json')
  async employee(@CurrentPrincipal() principal: Principal | null, @Query() query: Record<string, unknown>): Promise<string> {
    assertEmployee(principal);
    return JSON.stringify(await this.service.findOneByQuery(query));
  }

  @Get('employee-all')
  employeeAll(@CurrentPrincipal() principal: Principal | null, @Query() query: Record<string, unknown>) {
    assertEmployee(principal);
    return this.service.findAllByQuery(query);
  }

  @Post()
  @Strict()
  @HttpCode(200)
  signUp(@Body() body: Record<string, unknown>) {
    return this.service.signUp(asRecord(body));
  }

  @Put()
  update(@CurrentPrincipal() principal: Principal | null, @Body() body: Record<string, unknown>) {
    const user = asRecord(asRecord(body).user);
    assertCustomerAccess(assertCustomer(principal), user.customer_id);
    return this.service.update(user.customer_id as string, user);
  }

  @Post('passwordreset')
  @Strict()
  @HttpCode(200)
  passwordReset(@Body() body: Record<string, unknown>) {
    return this.service.passwordReset(asRecord(body));
  }

  @Delete()
  remove() {
    return this.service.deleteIsDisabled();
  }
}
