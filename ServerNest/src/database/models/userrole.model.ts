// Generated from Server/models by tools/generate-models.js, maintained by hand from here on.
import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'Userrole', freezeTableName: true, timestamps: false })
export class Userrole extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, field: 'role_id' })
  declare roleId: string;

  @Column({ type: DataType.STRING, field: 'role_name' })
  declare roleName: string | null;
}
