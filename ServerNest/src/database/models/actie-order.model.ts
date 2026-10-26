// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ActieOrderHasProduct } from './actie-order-has-product.model';
import { OrderInformation } from './order-information.model';
import { User } from './user.model';

@Table({ tableName: 'Actie_Order', freezeTableName: true })
export class ActieOrder extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare actie_order_id: string;

  @Column(DataType.DATE)
  declare order_date: Date | null;

  @Column(DataType.DATEONLY)
  declare pickup_date: string | null;

  @Column(DataType.STRING)
  declare status: string | null;

  @Column(DataType.TIME)
  declare pickup_time: string | null;

  @Column(DataType.STRING)
  declare paycode: string | null;

  @Column(DataType.BOOLEAN)
  declare delivery: boolean | null;

  @Column(DataType.DECIMAL(10, 2))
  declare delivery_cost: string | null;

  @Column({ type: DataType.DATE, field: 'picking_time' })
  declare pickingtime: Date | null;

  @Column(DataType.DATE)
  declare pickedup_time: Date | null;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.UUID)
  declare order_information_id: string | null;

  @Column(DataType.UUID)
  declare picking_user: string | null;

  @Column(DataType.UUID)
  declare pickup_user: string | null;

  @Column(DataType.UUID)
  declare invoice_order_information_id: string | null;

  @BelongsTo(() => OrderInformation, { foreignKey: 'order_information_id', targetKey: 'order_information_id' })
  declare actie_order_information: OrderInformation | null;

  @BelongsTo(() => User, { foreignKey: 'picking_user', targetKey: 'user_id' })
  declare pickingUser: User | null;

  @BelongsTo(() => User, { foreignKey: 'pickup_user', targetKey: 'user_id' })
  declare pickupUser: User | null;

  @BelongsTo(() => OrderInformation, { foreignKey: 'invoice_order_information_id', targetKey: 'order_information_id' })
  declare invoice_actie_order_information: OrderInformation | null;

  @HasMany(() => ActieOrderHasProduct, { foreignKey: 'actie_order_id', sourceKey: 'actie_order_id' })
  declare product_list: ActieOrderHasProduct[];
}
