// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Discounts } from './discounts.model';
import { Product } from './product.model';

@Table({ tableName: 'Product_has_Discount', freezeTableName: true, timestamps: false })
export class ProductHasDiscount extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare product_discount_id: number;

  @Column(DataType.DECIMAL(10, 2))
  declare discount_price: string | null;

  @Column(DataType.BOOLEAN)
  declare isPercentage: boolean | null;

  @Column(DataType.INTEGER)
  declare discount_id: number | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product_discount: Product | null;

  @BelongsTo(() => Discounts, { foreignKey: 'discount_id', targetKey: 'discount_id' })
  declare discount_info: Discounts | null;
}
