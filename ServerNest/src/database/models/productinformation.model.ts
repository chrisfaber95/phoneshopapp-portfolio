// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, AutoIncrement, Column, DataType, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Product } from './product.model';
import { ProductAdditionInformation } from './product-addition-information.model';

@Table({ tableName: 'Product_Information', freezeTableName: true, timestamps: false })
export class Productinformation extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'product_information_id' })
  declare id: number;

  @Column(DataType.STRING)
  declare variant: string | null;

  @Column(DataType.STRING)
  declare title: string | null;

  @Column(DataType.STRING)
  declare url: string | null;

  @Column(DataType.STRING)
  declare dataproduct: string | null;

  @Column(DataType.STRING)
  declare datasyndyproductid: string | null;

  @Column(DataType.TEXT)
  declare omschrijving: string | null;

  @Column(DataType.STRING)
  declare imgurl: string | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare ean: string;

  @Column(DataType.TEXT)
  declare ingredients: string | null;

  @HasOne(() => Product, { foreignKey: 'ean', sourceKey: 'id' })
  declare product_info: Product | null;

  @HasMany(() => ProductAdditionInformation, { foreignKey: 'product_information_id', sourceKey: 'id' })
  declare product_additional_information_list: ProductAdditionInformation[];
}
