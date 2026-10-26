// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AutoIncrement, BelongsTo, Column, DataType, DefaultScope, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { DiscountType } from './discount-type.model';
import { ProductHasDiscount } from './product-has-discount.model';

@DefaultScope(() => ({ include: [{ model: DiscountType, as: 'discount_type' }] }))
@Table({ tableName: 'Discounts', freezeTableName: true, timestamps: false })
export class Discounts extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare discount_id: number;

  @Column(DataType.DATEONLY)
  declare starting_date: string | null;

  @Column(DataType.DATEONLY)
  declare end_date: string | null;

  @Column(DataType.STRING)
  declare discount_image_url: string | null;

  @Column(DataType.BOOLEAN)
  declare isCombination: boolean | null;

  @Column(DataType.INTEGER)
  declare discounttype_id: number | null;

  @BelongsTo(() => DiscountType, { foreignKey: 'discounttype_id', targetKey: 'discounttype_id' })
  declare discount_type: DiscountType | null;

  @HasMany(() => ProductHasDiscount, { foreignKey: 'discount_id', sourceKey: 'discount_id' })
  declare product_discount_list: ProductHasDiscount[];
}
