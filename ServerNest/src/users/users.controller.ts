import { Body, Controller, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';

// Not carried over: `POST /user/register` (it called a stored procedure that does not exist and never answered). Login is in the
// auth module. Everything here is for employees (the access rules' default).
@Controller('v1/user')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.service.list(query);
  }

  @Get('single/:userId')
  single(@Param('userId') userId: string) {
    return this.service.single(userId);
  }

  @Get('employ/:userId')
  employ(@Param('userId') userId: string) {
    return this.service.employ(userId);
  }

  @Post()
  @HttpCode(200)
  add(@Body() body: unknown) {
    return this.service.add(body);
  }

  @Put()
  update(@Body() body: unknown) {
    return this.service.update(body);
  }
}
