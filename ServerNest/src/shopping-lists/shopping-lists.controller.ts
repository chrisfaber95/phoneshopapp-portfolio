import { Body, Controller, Get, Header, HttpCode, Param, Post, Query } from '@nestjs/common';
import { asRecord } from '../customers/customer-fields';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('v1/shoppinglist')
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.service.list(query);
  }

  // `res.json(null)` for an unknown list, like the old Server
  @Get(':listId')
  @Header('Content-Type', 'application/json')
  async single(@Param('listId') listId: string): Promise<string> {
    return JSON.stringify(await this.service.single(listId));
  }

  @Post()
  @HttpCode(200)
  create(@Body() body: Record<string, unknown>) {
    return this.service.create(asRecord(body));
  }
}
