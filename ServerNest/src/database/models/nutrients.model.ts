// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { NutrientRecords } from './nutrient-records.model';
import { PortionUoMs } from './portion-uo-ms.model';
import { Product } from './product.model';

@Table({ tableName: 'Nutrients', freezeTableName: true, timestamps: false })
export class Nutrients extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare nutrients_id: string;

  @Column(DataType.STRING)
  declare syndyid: string | null;

  @Column(DataType.BOOLEAN)
  declare has_portion: boolean | null;

  @Column(DataType.STRING)
  declare portion_size: string | null;

  @Column(DataType.STRING)
  declare NutrientId: string | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @Column(DataType.UUID)
  declare portion_uom_id: string | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product: Product | null;

  @BelongsTo(() => PortionUoMs, { foreignKey: 'portion_uom_id', targetKey: 'PortionUoMs_id' })
  declare portion_uom: PortionUoMs | null;

  @HasMany(() => NutrientRecords, { foreignKey: 'nutrient_id', sourceKey: 'NutrientId' })
  declare nutrient_records: NutrientRecords[];
}
