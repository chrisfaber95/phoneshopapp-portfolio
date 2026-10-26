// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'PortionUoMs', freezeTableName: true, timestamps: false })
export class PortionUoMs extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare PortionUoMs_id: string;

  @Column(DataType.STRING)
  declare label: string | null;
}
