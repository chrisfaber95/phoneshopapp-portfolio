// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ActieOrderHasProduct } from './actie-order-has-product.model';
import { ProductVariant } from './product-variant.model';

@Table({ tableName: 'Actie_Order_Product_has_Variant', freezeTableName: true, timestamps: false })
export class ActieOrderProductHasVariant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare actie_order_product_variant_id: number;

  @Column(DataType.INTEGER)
  declare actie_order_has_product_id: number | null;

  @Column(DataType.INTEGER)
  declare product_variant_id: number | null;

  @BelongsTo(() => ActieOrderHasProduct, { foreignKey: 'actie_order_has_product_id', targetKey: 'actie_order_has_product_id' })
  declare actie_order_product: ActieOrderHasProduct | null;

  @BelongsTo(() => ProductVariant, { foreignKey: 'product_variant_id', targetKey: 'product_variant_id' })
  declare product_variant: ProductVariant | null;
}
