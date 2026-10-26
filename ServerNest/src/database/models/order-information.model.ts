// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ActieOrder } from './actie-order.model';
import { Customer } from './customer.model';
import { Order } from './order.model';

@Table({ tableName: 'Order_Information', freezeTableName: true, paranoid: true })
export class OrderInformation extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare order_information_id: string;

  @Column(DataType.STRING)
  declare customerName: string | null;

  @Column(DataType.STRING)
  declare first_name: string | null;

  @Column(DataType.STRING)
  declare surname: string | null;

  @Column(DataType.STRING)
  declare kvk: string | null;

  @Column(DataType.STRING)
  declare btw: string | null;

  @Column(DataType.STRING)
  declare business: string | null;

  @Column(DataType.STRING)
  declare customerPhone: string | null;

  @Column(DataType.STRING)
  declare customerEmail: string | null;

  @Column(DataType.STRING)
  declare klantenkaart: string | null;

  @Column(DataType.STRING)
  declare street: string | null;

  @Column(DataType.STRING)
  declare house_number: string | null;

  @Column(DataType.STRING)
  declare house_addition: string | null;

  @Column(DataType.STRING)
  declare city: string | null;

  @Column(DataType.STRING)
  declare zipcode: string | null;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @HasMany(() => Order, { foreignKey: 'order_information_id', sourceKey: 'order_information_id' })
  declare order: Order[];

  @HasMany(() => Order, { foreignKey: 'invoice_order_information_id', sourceKey: 'order_information_id' })
  declare invoice_order: Order[];

  @HasMany(() => ActieOrder, { foreignKey: 'order_information_id', sourceKey: 'order_information_id' })
  declare actie_order: ActieOrder[];

  @HasMany(() => ActieOrder, { foreignKey: 'invoice_order_information_id', sourceKey: 'order_information_id' })
  declare invoice_actie_order: ActieOrder[];

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;
}
