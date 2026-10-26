// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';
import { Product } from './product.model';

@Table({ tableName: 'Customer_has_Favorite', freezeTableName: true, timestamps: false })
export class CustomerHasFavorite extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare customer_has_favorite_id: number;

  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare customer_id: string | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product: Product | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer_favorite: Customer | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare favorite_product: Product | null;
}
