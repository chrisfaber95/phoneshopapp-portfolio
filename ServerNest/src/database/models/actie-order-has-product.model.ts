// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ActieOrder } from './actie-order.model';
import { ActieOrderProductHasVariant } from './actie-order-product-has-variant.model';
import { Product } from './product.model';

@Table({ tableName: 'Actie_Order_has_Product', freezeTableName: true, timestamps: false })
export class ActieOrderHasProduct extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare actie_order_has_product_id: number;

  @Column(DataType.INTEGER)
  declare amount: number | null;

  @Column(DataType.DECIMAL(10, 2))
  declare price: string | null;

  @Column(DataType.INTEGER)
  declare stamps_cost: number | null;

  @Column(DataType.INTEGER)
  declare picked: number | null;

  @Column(DataType.INTEGER)
  declare returned: number | null;

  @Column(DataType.STRING)
  declare reason_return: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare discounted_price: string | null;

  @Column(DataType.UUID)
  declare actie_order_id: string | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product: Product | null;

  @BelongsTo(() => ActieOrder, { foreignKey: 'actie_order_id', targetKey: 'actie_order_id' })
  declare actie_order: ActieOrder | null;

  @HasMany(() => ActieOrderProductHasVariant, { foreignKey: 'actie_order_has_product_id', sourceKey: 'actie_order_has_product_id' })
  declare actie_order_product_variant_list: ActieOrderProductHasVariant[];
}
