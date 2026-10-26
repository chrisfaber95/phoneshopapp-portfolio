// Models of the `shops` database (the store site, /api/v2): the lookup database with the shop, its contact details, opening hours,
// time slots, delivery zip codes and job offers. Same tables and associations as Server/store_models (rebuilt in REV-033).
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'Address', freezeTableName: true, timestamps: false })
export class Address extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) declare address_id: number;
  @Column(DataType.STRING) declare street: string | null;
  @Column(DataType.STRING) declare house_number: string | null;
  @Column(DataType.STRING) declare house_addition: string | null;
  @Column(DataType.STRING) declare city: string | null;
  @Column(DataType.STRING) declare zipcode: string | null;
}

@Table({ tableName: 'Information', freezeTableName: true, timestamps: false })
export class Information extends Model {
  @PrimaryKey @AllowNull(false) @Default(DataType.UUIDV4) @Column(DataType.UUID) declare information_id: string;
  @Column(DataType.STRING) declare name: string | null;
  @Column(DataType.STRING) declare phone: string | null;
  @Column(DataType.STRING) declare mail: string | null;
  @Column(DataType.STRING) declare kvk: string | null;
  @Column(DataType.STRING) declare btw: string | null;
  @Column(DataType.STRING) declare mobile: string | null;
  @Column(DataType.STRING) declare admin_mail: string | null;
  @Column(DataType.STRING) declare logo_url: string | null;
  @Column(DataType.STRING) declare contact_image_url: string | null;
  @Column(DataType.INTEGER) declare address_id: number | null;
  @BelongsTo(() => Address, { foreignKey: 'address_id', targetKey: 'address_id' }) declare address: Address | null;
}

@Table({ tableName: 'Terms_And_Conditions', freezeTableName: true, timestamps: false })
export class TermsAndConditionsStore extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) declare TAC_id: number;
  @Column(DataType.TEXT) declare content: string | null;
}

@Table({ tableName: 'Shops', freezeTableName: true, timestamps: false })
export class Shop extends Model {
  @PrimaryKey @AllowNull(false) @Default(DataType.UUIDV4) @Column(DataType.UUID) declare shop_id: string;
  @Column(DataType.STRING) declare shopname: string | null;
  // the access data of the shop's own main database: never sent to a client
  @Column(DataType.STRING) declare database_name: string | null;
  @Column(DataType.STRING) declare database_pw: string | null;
  @Column(DataType.STRING) declare database_user: string | null;
  @Column(DataType.STRING) declare styling_url: string | null;
  @Column(DataType.STRING) declare domain: string | null;
  @Column(DataType.INTEGER) declare TAC_id: number | null;
  @Column(DataType.UUID) declare information_id: string | null;

  @BelongsTo(() => Information, { foreignKey: 'information_id', targetKey: 'information_id' }) declare information: Information | null;
  @HasMany(() => Socials, { foreignKey: 'shop_id', sourceKey: 'shop_id' }) declare socials: Socials[];
  @HasMany(() => BusinessHours, { foreignKey: 'shop_id', sourceKey: 'shop_id' }) declare business_hours: BusinessHours[];
}

@Table({ tableName: 'Socials', freezeTableName: true, timestamps: false })
export class Socials extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) declare social_id: number;
  @Column(DataType.STRING) declare type: string | null;
  @Column(DataType.STRING) declare url: string | null;
  @Column(DataType.BOOLEAN) declare visible: boolean | null;
  @Column(DataType.UUID) declare shop_id: string | null;
}

@Table({ tableName: 'Business_Hours', freezeTableName: true, timestamps: false })
export class BusinessHours extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) declare business_hours_id: number;
  @Column(DataType.INTEGER) declare weekday: number | null;
  @Column(DataType.INTEGER) declare week: number | null;
  @Column(DataType.INTEGER) declare year: number | null;
  @Column({ type: DataType.BOOLEAN, field: 'default' }) declare default: boolean | null;
  @Column(DataType.TIME) declare start: string | null;
  @Column(DataType.TIME) declare end: string | null;
  @Column(DataType.STRING) declare custom_label: string | null;
  @Column(DataType.UUID) declare shop_id: string | null;
}

@Table({ tableName: 'Timeslots', freezeTableName: true, timestamps: false })
export class Timeslot extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) declare timeslot_id: number;
  @Column(DataType.DATEONLY) declare timeslot_date: string | null;
  @Column(DataType.TIME) declare timeslot_start: string | null;
  @Column(DataType.TIME) declare timeslot_end: string | null;
  @Column(DataType.BOOLEAN) declare is_delivery: boolean | null;
  @Column(DataType.INTEGER) declare available_slots: number | null;
  @Column(DataType.UUID) declare shop_id: string | null;
  @BelongsTo(() => Shop, { foreignKey: 'shop_id', targetKey: 'shop_id' }) declare shop: Shop | null;
}

@Table({ tableName: 'Delivery_Location', freezeTableName: true, timestamps: false })
export class DeliveryLocation extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) declare delivery_location_id: number;
  @Column(DataType.STRING) declare zipcode: string | null;
  @Column(DataType.UUID) declare shop_id: string | null;
  @BelongsTo(() => Shop, { foreignKey: 'shop_id', targetKey: 'shop_id' }) declare shop: Shop | null;
}

@Table({ tableName: 'Job_Offer', freezeTableName: true, paranoid: true })
export class JobOffer extends Model {
  @PrimaryKey @AllowNull(false) @Default(DataType.UUIDV4) @Column(DataType.UUID) declare job_offer_id: string;
  @Column(DataType.STRING) declare title: string | null;
  @Column(DataType.TEXT) declare description: string | null;
  @Column(DataType.TEXT) declare experience: string | null;
  @Column(DataType.TEXT) declare labour_conditions: string | null;
  @Column(DataType.DATE) declare expires_at: Date | null;
  @Column(DataType.STRING) declare hours: string | null;
  @Column(DataType.UUID) declare shop_id: string | null;
  @BelongsTo(() => Shop, { foreignKey: 'shop_id', targetKey: 'shop_id' }) declare shop: Shop | null;
}

@Table({ tableName: 'Job_Application', freezeTableName: true, paranoid: true })
export class JobApplication extends Model {
  @PrimaryKey @AllowNull(false) @Default(DataType.UUIDV4) @Column(DataType.UUID) declare job_application_id: string;
  @Column(DataType.STRING) declare name: string | null;
  @Column(DataType.DATEONLY) declare birthday: string | null;
  @Column(DataType.STRING) declare address: string | null;
  @Column(DataType.STRING) declare zipcode: string | null;
  @Column(DataType.STRING) declare house_number: string | null;
  @Column(DataType.STRING) declare house_addition: string | null;
  @Column(DataType.STRING) declare city: string | null;
  @Column(DataType.STRING) declare email: string | null;
  @Column(DataType.STRING) declare phonenumber: string | null;
  @Column(DataType.STRING) declare cv: string | null;
  @Column(DataType.STRING) declare motivatie: string | null;
  @Column(DataType.TEXT) declare beschikbaarheid: string | null;
  @Column(DataType.STRING) declare status: string | null;
  @Column(DataType.TEXT) declare opmerkingen: string | null;
  @Column(DataType.UUID) declare job_offer_id: string | null;
  @BelongsTo(() => JobOffer, { foreignKey: 'job_offer_id', targetKey: 'job_offer_id' }) declare job_offer: JobOffer | null;
}

export const STORE_MODELS = [Address, Information, TermsAndConditionsStore, Shop, Socials, BusinessHours, Timeslot, DeliveryLocation, JobOffer, JobApplication];
export const SHOPS_CONNECTION = 'shops';
