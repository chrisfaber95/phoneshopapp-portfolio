// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';

@Table({ tableName: 'Customer_Settings', freezeTableName: true, timestamps: false })
export class CustomerSettings extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare customer_settings_id: number;

  @Column(DataType.INTEGER)
  declare shoptype: number | null;

  @Column(DataType.INTEGER)
  declare shopheight: number | null;

  @Column(DataType.BOOLEAN)
  declare standard_promotions: boolean | null;

  @Column(DataType.BOOLEAN)
  declare standard_storestamps: boolean | null;

  @Column(DataType.BOOLEAN)
  declare easy_order: boolean | null;

  @Column(DataType.BOOLEAN)
  declare quick_scan: boolean | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;
}
