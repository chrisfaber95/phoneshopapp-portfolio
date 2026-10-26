// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Product } from './product.model';

@Table({ tableName: 'Levertijden', freezeTableName: true, timestamps: false })
export class Levertijden extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare levertijd_id: number;

  @Column(DataType.INTEGER)
  declare minimum_days: number | null;

  @Column(DataType.INTEGER)
  declare maximum_days: number | null;

  @Column(DataType.STRING)
  declare label: string | null;

  @HasMany(() => Product, { foreignKey: 'product_list', sourceKey: 'levertijd_id' })
  declare product: Product[];
}
