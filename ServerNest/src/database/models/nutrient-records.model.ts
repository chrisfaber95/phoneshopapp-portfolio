// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { NutrientTypes } from './nutrient-types.model';
import { Nutrients } from './nutrients.model';
import { PrecisionTypes } from './precision-types.model';
import { RecordUoMs } from './record-uo-ms.model';

@Table({ tableName: 'NutrientRecords', freezeTableName: true, timestamps: false })
export class NutrientRecords extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare nutrient_record_id: number;

  @Column(DataType.FLOAT)
  declare default_amount: number | null;

  @Column(DataType.FLOAT)
  declare default_gda: number | null;

  @Column(DataType.FLOAT)
  declare portion_amount: number | null;

  @Column(DataType.FLOAT)
  declare portion_gda: number | null;

  @Column(DataType.STRING)
  declare nutrient_id: string | null;

  @Column(DataType.UUID)
  declare precision_type_id: string | null;

  @Column(DataType.UUID)
  declare record_uom_id: string | null;

  @Column(DataType.UUID)
  declare nutrient_type_id: string | null;

  @BelongsTo(() => Nutrients, { foreignKey: 'nutrient_id', targetKey: 'NutrientId' })
  declare nutrient: Nutrients | null;

  @BelongsTo(() => PrecisionTypes, { foreignKey: 'precision_type_id', targetKey: 'PrecisionTypes_id' })
  declare precision_type: PrecisionTypes | null;

  @BelongsTo(() => RecordUoMs, { foreignKey: 'record_uom_id', targetKey: 'RecordUoMs_id' })
  declare record_uom: RecordUoMs | null;

  @BelongsTo(() => NutrientTypes, { foreignKey: 'nutrient_type_id', targetKey: 'nutrient_type_id' })
  declare nutrient_type: NutrientTypes | null;
}
