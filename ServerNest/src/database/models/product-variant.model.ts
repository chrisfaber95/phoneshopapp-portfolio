// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ActieOrderProductHasVariant } from './actie-order-product-has-variant.model';

@Table({ tableName: 'Product_Variant', freezeTableName: true, timestamps: false })
export class ProductVariant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare product_variant_id: number;

  @Column(DataType.DECIMAL(10, 2))
  declare price_override: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare discount_price_override: string | null;

  @Column(DataType.INTEGER)
  declare beschikbaar_override: number | null;

  @Column(DataType.INTEGER)
  declare schapcode_override: number | null;

  @Column(DataType.INTEGER)
  declare end_of_life_override: number | null;

  @Column(DataType.INTEGER)
  declare stock_override: number | null;

  @Column(DataType.INTEGER)
  declare variant_group: number | null;

  @Column(DataType.STRING)
  declare variant_label: string | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @HasMany(() => ActieOrderProductHasVariant, { foreignKey: 'product_variant_id', sourceKey: 'product_variant_id' })
  declare actie_order_product_variant_list: ActieOrderProductHasVariant[];
}
