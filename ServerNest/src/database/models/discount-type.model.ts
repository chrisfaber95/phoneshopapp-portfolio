// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'DiscountType', freezeTableName: true, timestamps: false })
export class DiscountType extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare discounttype_id: number;

  @Column(DataType.STRING)
  declare discounttype_label: string | null;

  @Column(DataType.INTEGER)
  declare min_amount: number | null;

  @Column(DataType.FLOAT)
  declare default_calculation: number | null;
}
