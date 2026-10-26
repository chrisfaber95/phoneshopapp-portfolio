// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Spaaractie } from './spaaractie.model';

@Table({ tableName: 'Terms_And_Conditions', freezeTableName: true, timestamps: false })
export class TermsAndConditions extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare TAC_id: number;

  @Column(DataType.TEXT)
  declare content: string | null;

  @HasMany(() => Spaaractie, { foreignKey: 'TAC_id', sourceKey: 'TAC_id' })
  declare spaaractie: Spaaractie[];
}
