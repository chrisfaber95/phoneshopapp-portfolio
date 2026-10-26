// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from './product.model';

@Table({ tableName: 'Order_has_Product', freezeTableName: true, timestamps: false })
export class OrderHasProduct extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'Order_has_Product_id' })
  declare id: number;

  @Column(DataType.INTEGER)
  declare amount: number | null;

  @Column(DataType.INTEGER)
  declare order_id: number | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @Column(DataType.DECIMAL(10, 2))
  declare price: string | null;

  @Column(DataType.INTEGER)
  declare picked: number | null;

  @Column(DataType.INTEGER)
  declare returned: number | null;

  @Column(DataType.STRING)
  declare reason_return: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare discounted_price: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare normal_total_price: string | null;

  @Column(DataType.INTEGER)
  declare discount_override: number | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product: Product | null;

  @BelongsTo(() => Order, { foreignKey: 'order_id', targetKey: 'uuid_id' })
  declare order: Order | null;
}
