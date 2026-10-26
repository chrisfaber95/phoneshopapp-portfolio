// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { AllowNull, BelongsTo, Column, DataType, Default, DefaultScope, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Userrole } from './userrole.model';

@DefaultScope(() => ({ attributes: {"exclude":["password","accessToken","nfcToken","nfcSerial"]} }))
@Table({ tableName: 'User', freezeTableName: true, paranoid: true })
export class User extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.STRING)
  declare name: string | null;

  @Column(DataType.STRING)
  declare email: string | null;

  @Column(DataType.STRING)
  declare cardnumber: string | null;

  @Column(DataType.STRING)
  declare password: string | null;

  @Column(DataType.DATE)
  declare createdAt: Date | null;

  @Column(DataType.DATE)
  declare updatedAt: Date | null;

  @Column(DataType.STRING)
  declare accessToken: string | null;

  @Column(DataType.STRING)
  declare nfc_token: string | null;

  @Column(DataType.STRING)
  declare nfc_serial: string | null;

  @Column(DataType.STRING)
  declare store: string | null;

  @Column(DataType.DATE)
  declare deletedAt: Date | null;

  @Column(DataType.UUID)
  declare role_id: string | null;

  @BelongsTo(() => Userrole, { foreignKey: 'role_id', targetKey: 'roleId' })
  declare user_role: Userrole | null;
}
