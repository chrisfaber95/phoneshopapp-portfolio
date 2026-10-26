// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { SpaaractieHasProduct } from './spaaractie-has-product.model';
import { TermsAndConditions } from './terms-and-conditions.model';

@Table({ tableName: 'Spaaractie', freezeTableName: true, paranoid: true })
export class Spaaractie extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare spaaractie_id: string;

  @Column(DataType.STRING)
  declare slug: string | null;

  @Column(DataType.STRING)
  declare title: string | null;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column(DataType.TEXT)
  declare koptekst: string | null;

  @Column(DataType.STRING)
  declare imgurl: string | null;

  @Column(DataType.DATE)
  declare start_date: Date | null;

  @Column(DataType.DATE)
  declare end_date: Date | null;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.INTEGER)
  declare amount_of_stamps: number | null;

  @Column(DataType.INTEGER)
  declare point_for_stamp: number | null;

  @Column(DataType.DECIMAL(10, 2))
  declare stamp_price: string | null;

  @Column(DataType.STRING)
  declare stamp_imgurl: string | null;

  @Column(DataType.STRING)
  declare background_card: string | null;

  @Column(DataType.STRING)
  declare front_imgurl: string | null;

  @Column(DataType.STRING)
  declare back_imgurl: string | null;

  @Column(DataType.STRING)
  declare list_image: string | null;

  @Column(DataType.STRING)
  declare maincolor: string | null;

  @Column(DataType.BOOLEAN)
  declare price_visible: boolean | null;

  @Column(DataType.INTEGER)
  declare actietype_id: number | null;

  @Column(DataType.STRING)
  declare tac: string | null;

  @Column(DataType.INTEGER)
  declare tac_pages: number | null;

  @Column(DataType.BOOLEAN)
  declare physical: boolean | null;

  @Column(DataType.INTEGER)
  declare TAC_id: number | null;

  @HasMany(() => SpaaractieHasProduct, { foreignKey: 'spaaractie_id', sourceKey: 'spaaractie_id' })
  declare spaaractie_products: SpaaractieHasProduct[];

  @BelongsTo(() => TermsAndConditions, { foreignKey: 'TAC_id', targetKey: 'TAC_id' })
  declare terms: TermsAndConditions | null;
}
