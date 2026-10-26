// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Productinformation } from './productinformation.model';

@Table({ tableName: 'Product_Additional_Information', freezeTableName: true, timestamps: false })
export class ProductAdditionInformation extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare product_additional_information_id: number;

  @Column(DataType.STRING)
  declare name: string | null;

  @Column(DataType.STRING)
  declare value: string | null;

  @Column(DataType.STRING)
  declare type: string | null;

  @Column(DataType.INTEGER)
  declare product_information_id: number | null;

  @BelongsTo(() => Productinformation, { foreignKey: 'product_information_id', targetKey: 'id' })
  declare product_additional_information: Productinformation | null;
}
