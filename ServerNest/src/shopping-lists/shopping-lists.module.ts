import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShoppingList, ShoppingListHasProduct } from '../database/models';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListsService } from './shopping-lists.service';

// Note: the old PUT /shoppinglist was a copy of the customer update (it changed a Customer, without any check) and is not carried over
@Module({
  imports: [SequelizeModule.forFeature([ShoppingList, ShoppingListHasProduct])],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService],
})
export class ShoppingListsModule {}
