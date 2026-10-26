// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Product } from './product.model';
import { Spaaractie } from './spaaractie.model';

@Table({ tableName: 'Spaaractie_has_Product', freezeTableName: true, timestamps: false })
export class SpaaractieHasProduct extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'spaaractie_has_product_id' })
  declare id: number;

  @Column(DataType.INTEGER)
  declare spaaractie_id: number | null;

  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @Column(DataType.INTEGER)
  declare discount_percentage: number | null;

  @Column(DataType.STRING)
  declare title: string | null;

  @Column(DataType.STRING)
  declare description: string | null;

  @Column(DataType.INTEGER)
  declare points_cost: number | null;

  @Column(DataType.INTEGER)
  declare stamps_cost: number | null;

  @BelongsTo(() => Spaaractie, { foreignKey: 'spaaractie_id', targetKey: 'spaaractie_id' })
  declare spaaractie: Spaaractie | null;

  @BelongsTo(() => Product, { foreignKey: 'product_id', targetKey: 'id' })
  declare product: Product | null;
}
