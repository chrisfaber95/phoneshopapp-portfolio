// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'NutrientTypes', freezeTableName: true, timestamps: false })
export class NutrientTypes extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare nutrient_type_id: string;

  @Column(DataType.STRING)
  declare name: string | null;

  @Column(DataType.STRING)
  declare internal_name: string | null;
}
