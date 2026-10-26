// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'Daytotals', freezeTableName: true })
export class Daytotals extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare daytotal_id: number;

  @Column(DataType.DATEONLY)
  declare date: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare total_revenue: string | null;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare timestamp: Date | null;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.UUID)
  declare user_id: string | null;

  @BelongsTo(() => User, { foreignKey: 'user_id', targetKey: 'user_id' })
  declare daytotals_user: User | null;
}
