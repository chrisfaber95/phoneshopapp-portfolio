// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { BelongsTo, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';

@Table({ tableName: 'Customer_Information', freezeTableName: true, timestamps: false })
export class CustomerInformation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare customer_information_id: string;

  @Column(DataType.STRING)
  declare first_name: string | null;

  @Column(DataType.STRING)
  declare surname: string | null;

  @Column(DataType.STRING)
  declare phone: string | null;

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

  @Column(DataType.STRING)
  declare business: string | null;

  @Column(DataType.STRING)
  declare kvk: string | null;

  @Column(DataType.STRING)
  declare btw: string | null;

  @Column(DataType.STRING)
  declare title: string | null;

  @Column(DataType.STRING)
  declare contactperson: string | null;

  @Column(DataType.STRING)
  declare businessphone: string | null;

  @Column(DataType.STRING)
  declare custom_label: string | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;
}
