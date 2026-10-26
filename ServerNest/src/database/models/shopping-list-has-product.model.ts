// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Product } from './product.model';
import { ShoppingList } from './shopping-list.model';

@Table({ tableName: 'ShoppingList_has_Products', freezeTableName: true, timestamps: false })
export class ShoppingListHasProduct extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare list_product_id: number;

  @Column(DataType.UUID)
  declare shopping_list_id: string | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @Column(DataType.INTEGER)
  declare amount: number | null;

  @BelongsTo(() => ShoppingList, { foreignKey: 'shopping_list_id', targetKey: 'shopping_list_id' })
  declare shoppinglist: ShoppingList | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product: Product | null;
}
