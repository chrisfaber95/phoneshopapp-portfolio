import { Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { SpaaractiesService } from './spaaracties.service';

// Reading is public (the shop front shows the actions); creating and changing needs an employee (the access rules' default)
@Controller('v1/spaaractie')
export class SpaaractiesController {
  constructor(private readonly service: SpaaractiesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':actieId')
  single(@Param('actieId') actieId: string) {
    return this.service.single(actieId);
  }

  @Post()
  @HttpCode(200)
  create(@Body() body: unknown) {
    return this.service.create(body);
  }

  @Put()
  update(@Body() body: unknown) {
    return this.service.update(body);
  }
}
