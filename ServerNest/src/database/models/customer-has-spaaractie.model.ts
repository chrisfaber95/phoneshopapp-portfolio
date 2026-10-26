// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Customer } from './customer.model';
import { Spaaractie } from './spaaractie.model';

@Table({ tableName: 'Customer_has_Spaaractie', freezeTableName: true, paranoid: true })
export class CustomerHasSpaaractie extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare customer_has_spaaractie_id: string;

  @Column(DataType.INTEGER)
  declare stamp_amount: number | null;

  @Column(DataType.INTEGER)
  declare point_amount: number | null;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.UUID)
  declare customer_id: string | null;

  @Column(DataType.UUID)
  declare spaaractie_id: string | null;

  @BelongsTo(() => Customer, { foreignKey: 'customer_id', targetKey: 'customer_id' })
  declare customer: Customer | null;

  @BelongsTo(() => Spaaractie, { foreignKey: 'spaaractie_id', targetKey: 'spaaractie_id' })
  declare spaaractie: Spaaractie | null;
}
