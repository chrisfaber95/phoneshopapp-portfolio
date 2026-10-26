// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';

@Table({ tableName: 'Cookies', freezeTableName: true, timestamps: false })
export class Cookies extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare cookie_id: number;

  @Column(DataType.STRING)
  declare device: string | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @Column(DataType.STRING)
  declare cookie_type: string | null;

  @Column(DataType.STRING)
  declare user_auth: string | null;

  @Column(DataType.STRING)
  declare ip: string | null;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare acceptance_date: Date | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare cookie_user: Customer | null;
}
