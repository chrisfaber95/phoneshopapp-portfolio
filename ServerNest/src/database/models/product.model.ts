// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, DefaultScope, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { CustomerHasFavorite } from './customer-has-favorite.model';
import { Department } from './department.model';
import { Levertijden } from './levertijden.model';
import { Nutrients } from './nutrients.model';
import { OrderHasProduct } from './order-has-product.model';
import { ProductHasDiscount } from './product-has-discount.model';
import { ProductVariant } from './product-variant.model';
import { Productinformation } from './productinformation.model';

@DefaultScope(() => ({ attributes: {"exclude":["product_list"]} }))
@Table({ tableName: 'Product', freezeTableName: true, timestamps: false })
export class Product extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'product_id' })
  declare id: number;

  @Column(DataType.STRING)
  declare categoryname1: string | null;

  @Column(DataType.INTEGER)
  declare department_id: number | null;

  @Column(DataType.STRING)
  declare categoryname2: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare price: string | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare ean: string;

  @Column(DataType.INTEGER)
  declare schaphoogte: number | null;

  @Column(DataType.INTEGER)
  declare schapplaats: number | null;

  @Column(DataType.INTEGER)
  declare beschikbaar: number | null;

  @Column(DataType.STRING)
  declare schapcode: string | null;

  @Column(DataType.FLOAT)
  declare btw: number | null;

  @Column(DataType.DECIMAL(10, 2))
  declare statiegeld: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare sup_price: string | null;

  @Column(DataType.INTEGER)
  declare end_of_life: number | null;

  @Column(DataType.INTEGER)
  declare stock: number | null;

  @Column(DataType.BOOLEAN)
  declare nix18: boolean | null;

  @Column(DataType.STRING)
  declare syndyid: string | null;

  @Column(DataType.INTEGER)
  declare product_list: number | null;

  @Column(DataType.INTEGER)
  declare levertijd_id: number | null;

  @BelongsTo(() => Productinformation, { foreignKey: 'ean', targetKey: 'ean' })
  declare product_information: Productinformation | null;

  @HasMany(() => OrderHasProduct, { foreignKey: 'product_id', sourceKey: 'id' })
  declare order_list: OrderHasProduct[];

  @HasMany(() => ProductVariant, { foreignKey: 'product_id', sourceKey: 'id' })
  declare variant_list: ProductVariant[];

  @HasMany(() => ProductHasDiscount, { foreignKey: 'product_id', sourceKey: 'id' })
  declare product_has_discount_list: ProductHasDiscount[];

  @BelongsTo(() => Levertijden, { foreignKey: 'levertijd_id', targetKey: 'levertijd_id' })
  declare levertijd: Levertijden | null;

  @BelongsTo(() => Department, { foreignKey: 'department_id', targetKey: 'department_id' })
  declare department: Department | null;

  @HasMany(() => CustomerHasFavorite, { foreignKey: 'product_id', sourceKey: 'id' })
  declare favorite_products_list: CustomerHasFavorite[];

  @HasMany(() => Nutrients, { foreignKey: 'product_id', sourceKey: 'id' })
  declare nutrients: Nutrients[];
}
