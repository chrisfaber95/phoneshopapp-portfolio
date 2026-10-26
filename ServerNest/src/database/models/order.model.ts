// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';
import { OrderHasProduct } from './order-has-product.model';
import { OrderInformation } from './order-information.model';
import { User } from './user.model';

@Table({ tableName: 'Order', freezeTableName: true, paranoid: true })
export class Order extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare uuid_id: string;

  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'order_id' })
  declare id: number;

  @Column(DataType.BOOLEAN)
  declare delivery: boolean | null;

  @Column(DataType.DECIMAL(10, 2))
  declare totalPrice: string | null;

  @Column(DataType.STRING)
  declare paymentMethod: string | null;

  @Column(DataType.DATE)
  declare orderDate: Date | null;

  @Column(DataType.DATEONLY)
  declare pickupDate: string | null;

  @Column(DataType.STRING)
  declare status: string | null;

  @Column(DataType.TIME)
  declare pickupTime: string | null;

  @Column(DataType.STRING)
  declare pickingcrate: string | null;

  @Column(DataType.STRING)
  declare paycode: string | null;

  @Column(DataType.STRING)
  declare winkelbon: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare finalPrice: string | null;

  @Column(DataType.DATE)
  declare pickingtime: Date | null;

  @Column(DataType.INTEGER)
  declare koopzegels: number | null;

  @Column(DataType.STRING)
  declare spaarzegels: string | null;

  @Column(DataType.INTEGER)
  declare storepoints: number | null;

  @Column(DataType.DECIMAL(10, 2))
  declare picking_price: string | null;

  @Column(DataType.STRING)
  declare pickup_code: string | null;

  @Column(DataType.STRING)
  declare pickup_confirm: string | null;

  @Column(DataType.STRING)
  declare id_check: string | null;

  @Column(DataType.DATE)
  declare scanningtime: Date | null;

  @Column(DataType.DATE)
  declare pickedup_time: Date | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare invoice_number: string;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.UUID)
  declare picking_user: string | null;

  @Column(DataType.UUID)
  declare scanning_user: string | null;

  @Column(DataType.UUID)
  declare pickup_user: string | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @Column(DataType.UUID)
  declare order_information_id: string | null;

  @Column(DataType.UUID)
  declare invoice_order_information_id: string | null;

  @BelongsTo(() => User, { foreignKey: 'picking_user', targetKey: 'user_id' })
  declare pickingUser: User | null;

  @BelongsTo(() => User, { foreignKey: 'scanning_user', targetKey: 'user_id' })
  declare scanningUser: User | null;

  @BelongsTo(() => User, { foreignKey: 'pickup_user', targetKey: 'user_id' })
  declare pickupUser: User | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;

  @BelongsTo(() => OrderInformation, { foreignKey: 'order_information_id', targetKey: 'order_information_id' })
  declare order_information: OrderInformation | null;

  @BelongsTo(() => OrderInformation, { foreignKey: 'invoice_order_information_id', targetKey: 'order_information_id' })
  declare invoice_order_information: OrderInformation | null;

  @HasMany(() => OrderHasProduct, { foreignKey: 'order_id', sourceKey: 'id' })
  declare product_list: OrderHasProduct[];
}
