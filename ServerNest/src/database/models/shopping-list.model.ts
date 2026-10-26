// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';
import { ShoppingListHasProduct } from './shopping-list-has-product.model';

@Table({ tableName: 'ShoppingList', freezeTableName: true })
export class ShoppingList extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare shopping_list_id: string;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;

  @HasMany(() => ShoppingListHasProduct, { foreignKey: 'shopping_list_id', sourceKey: 'shopping_list_id' })
  declare shoppinglist_products: ShoppingListHasProduct[];
}
