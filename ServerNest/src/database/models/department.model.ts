// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Product } from './product.model';

@Table({ tableName: 'Department', freezeTableName: true, timestamps: false })
export class Department extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare department_id: number;

  @Column(DataType.STRING)
  declare label: string | null;

  @Column(DataType.STRING)
  declare name: string | null;

  @Column(DataType.STRING)
  declare slug: string | null;

  @Column(DataType.INTEGER)
  declare main_department: number | null;

  @Column(DataType.BOOLEAN)
  declare nix18: boolean | null;

  @Column(DataType.BOOLEAN)
  declare visible: boolean | null;

  @Column(DataType.STRING)
  declare imgurl: string | null;

  @HasMany(() => Product, { foreignKey: 'product_list', sourceKey: 'department_id' })
  declare product: Product[];
}
