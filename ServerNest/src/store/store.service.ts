import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { whereFromQuery } from '../common/query-filter';
import { asRecord, pick } from '../customers/customer-fields';
import { Address, BusinessHours, DeliveryLocation, Information, JobApplication, JobOffer, SHOPS_CONNECTION, Shop, Socials, TermsAndConditionsStore, Timeslot } from './store.models';

// The access data of the shop's own main database lives in the Shops table: it is never sent to a client (the old Server sent it
// with every public shop, delivery location and job offer request)
const SECRET_SHOP_COLUMNS = ['database_name', 'database_pw', 'database_user'];

const SHOP_FIELDS = ['shopname', 'styling_url', 'domain', 'TAC_id'] as const;
const INFORMATION_FIELDS = ['name', 'phone', 'mail', 'kvk', 'btw', 'mobile', 'admin_mail', 'logo_url', 'contact_image_url'] as const;
const ADDRESS_FIELDS = ['street', 'house_number', 'house_addition', 'city', 'zipcode'] as const;
const SOCIAL_FIELDS = ['type', 'url', 'visible'] as const;
const HOURS_FIELDS = ['weekday', 'week', 'year', 'default', 'start', 'end', 'custom_label'] as const;
const OFFER_FIELDS = ['title', 'description', 'experience', 'labour_conditions', 'expires_at', 'hours', 'shop_id'] as const;
const APPLICATION_FIELDS = ['name', 'birthday', 'address', 'zipcode', 'house_number', 'house_addition', 'city', 'email', 'phonenumber', 'cv', 'motivatie', 'beschikbaarheid', 'job_offer_id'] as const;
const MAX_LIST = 500;
const MAX_TEXT = 5000;

const shopWithoutSecrets = { model: Shop, as: 'shop', attributes: { exclude: SECRET_SHOP_COLUMNS } };

const checkValues = (values: Record<string, unknown>): void => {
  for (const [key, value] of Object.entries(values)) {
    const ok = value === null || typeof value === 'number' || typeof value === 'boolean' || (typeof value === 'string' && value.length <= MAX_TEXT);
    if (!ok) throw new BadRequestException({ error: `Invalid value for ${key}` });
  }
};

const list = (value: unknown, what: string): Record<string, unknown>[] => {
  if (!Array.isArray(value) || value.length > MAX_LIST) throw new BadRequestException({ error: `${what} must be a list of at most ${MAX_LIST} records` });
  return value.map(asRecord);
};

// The store site (/api/v2): the shop's contact details, opening hours, time slots, delivery zip codes and job offers
@Injectable()
export class StoreService {
  constructor(
    @InjectConnection(SHOPS_CONNECTION) private readonly sequelize: Sequelize,
    @InjectModel(Shop, SHOPS_CONNECTION) private readonly shops: typeof Shop,
    @InjectModel(Information, SHOPS_CONNECTION) private readonly information: typeof Information,
    @InjectModel(Address, SHOPS_CONNECTION) private readonly addresses: typeof Address,
    @InjectModel(Socials, SHOPS_CONNECTION) private readonly socials: typeof Socials,
    @InjectModel(BusinessHours, SHOPS_CONNECTION) private readonly hours: typeof BusinessHours,
    @InjectModel(Timeslot, SHOPS_CONNECTION) private readonly timeslots: typeof Timeslot,
    @InjectModel(DeliveryLocation, SHOPS_CONNECTION) private readonly locations: typeof DeliveryLocation,
    @InjectModel(JobOffer, SHOPS_CONNECTION) private readonly offers: typeof JobOffer,
    @InjectModel(JobApplication, SHOPS_CONNECTION) private readonly applications: typeof JobApplication,
    @InjectModel(TermsAndConditionsStore, SHOPS_CONNECTION) private readonly terms: typeof TermsAndConditionsStore,
  ) {}

  private shopIncludes() {
    return [
      { model: Information, as: 'information', include: [{ model: Address, as: 'address' }] },
      { model: Socials, as: 'socials' },
      { model: BusinessHours, as: 'business_hours' },
    ];
  }

  // GET /shops?<column>=: the shop with its information, address, socials and opening hours
  findShops(query: Record<string, unknown>): Promise<Shop[]> {
    for (const column of SECRET_SHOP_COLUMNS) if (column in query) throw new BadRequestException({ error: `Unknown filter: ${column}` });
    return this.shops.findAll({ where: whereFromQuery(this.shops, query), include: this.shopIncludes(), attributes: { exclude: SECRET_SHOP_COLUMNS }, logging: false });
  }

  private async shopById(shopId: string): Promise<Shop | null> {
    return this.shops.findOne({ where: { shop_id: shopId }, include: this.shopIncludes(), attributes: { exclude: SECRET_SHOP_COLUMNS }, logging: false });
  }

  // PUT /shops { shop_id, shopname, ..., information: { ..., address: {...} } | address, socials: [...], business_hours: [...] }
  // (employees). The old Server saved only the opening hours (the nested records were ignored) and then crashed in its error
  // handler; the access data of the main database cannot be changed from here.
  async updateShop(body: unknown): Promise<Shop | null> {
    const input = asRecord(body);
    const shopId = input.shop_id;
    const shop = typeof shopId === 'string' ? await this.shops.findByPk(shopId, { logging: false }) : null;
    if (!shop) throw new NotFoundException({ error: 'Shop not found' });

    const shopValues: Record<string, unknown> = pick(input, SHOP_FIELDS);
    const info = asRecord(input.information);
    const infoValues: Record<string, unknown> = pick(info, INFORMATION_FIELDS);
    const addressValues: Record<string, unknown> = pick(asRecord(info.address ?? input.address), ADDRESS_FIELDS);
    const socials = input.socials === undefined ? [] : list(input.socials, 'socials');
    const hours = input.business_hours === undefined ? [] : list(input.business_hours, 'business_hours');
    for (const values of [shopValues, infoValues, addressValues, ...socials.map((s) => pick(s, SOCIAL_FIELDS)), ...hours.map((h) => pick(h, HOURS_FIELDS))]) checkValues(values);

    await this.sequelize.transaction(async (transaction) => {
      if (Object.keys(shopValues).length > 0) await shop.update(shopValues, { transaction, logging: false });

      if (Object.keys(infoValues).length > 0 || Object.keys(addressValues).length > 0) {
        let information = shop.information_id ? await this.information.findByPk(shop.information_id, { transaction, logging: false }) : null;
        if (!information) {
          information = await this.information.create({ ...infoValues }, { transaction, logging: false });
          await shop.update({ information_id: information.information_id }, { transaction, logging: false });
        } else if (Object.keys(infoValues).length > 0) {
          await information.update(infoValues, { transaction, logging: false });
        }
        if (Object.keys(addressValues).length > 0) {
          const address = information.address_id ? await this.addresses.findByPk(information.address_id, { transaction, logging: false }) : null;
          if (address) await address.update(addressValues, { transaction, logging: false });
          else await information.update({ address_id: (await this.addresses.create(addressValues, { transaction, logging: false })).address_id }, { transaction, logging: false });
        }
      }

      for (const social of socials) {
        const values = pick(social, SOCIAL_FIELDS);
        const id = Number(social.social_id);
        if (Number.isInteger(id) && id > 0) await this.socials.update(values, { where: { social_id: id, shop_id: shop.shop_id }, transaction, logging: false });
        else await this.socials.create({ ...values, shop_id: shop.shop_id }, { transaction, logging: false });
      }
      for (const entry of hours) {
        const values = pick(entry, HOURS_FIELDS);
        const id = Number(entry.business_hours_id);
        if (Number.isInteger(id) && id > 0) await this.hours.update(values, { where: { business_hours_id: id, shop_id: shop.shop_id }, transaction, logging: false });
        else await this.hours.create({ ...values, shop_id: shop.shop_id }, { transaction, logging: false });
      }
    });
    return this.shopById(shop.shop_id);
  }

  // GET /timeslot: the time slots with their shop (without the access data of its database)
  findTimeslots(): Promise<Timeslot[]> {
    return this.timeslots.findAll({ include: [shopWithoutSecrets], logging: false });
  }

  // GET /delivery_location: the zip codes the shop delivers to
  findLocations(): Promise<DeliveryLocation[]> {
    return this.locations.findAll({ include: [shopWithoutSecrets], logging: false });
  }

  // GET /terms?<column>=
  findTerms(query: Record<string, unknown>): Promise<TermsAndConditionsStore[]> {
    return this.terms.findAll({ where: whereFromQuery(this.terms, query), logging: false });
  }

  // GET /job_offer: the offers with their shop, its information and address
  findOffers(): Promise<JobOffer[]> {
    return this.offers.findAll({
      include: [{ model: Shop, as: 'shop', attributes: { exclude: SECRET_SHOP_COLUMNS }, include: [{ model: Information, as: 'information', include: [{ model: Address, as: 'address' }] }] }],
      logging: false,
    });
  }

  // POST /job_offer [ { title, description, ... } ] (employees). The old route was a copy of the product information import and
  // wrote into the wrong database.
  async createOffers(body: unknown): Promise<string> {
    const records = list(body, 'The body').map((record) => pick(record, OFFER_FIELDS) as Record<string, unknown>);
    if (records.length === 0 || records.some((record) => typeof record.title !== 'string' || record.title.trim() === '')) throw new BadRequestException({ error: 'Every offer needs a title' });
    records.forEach(checkValues);
    await this.offers.bulkCreate(records as never[], { logging: false });
    return 'nice';
  }

  // GET /job_application (employees: it holds personal data)
  findApplications(): Promise<JobApplication[]> {
    return this.applications.findAll({ logging: false });
  }

  // POST /job_application: anyone may apply for an offer. (The old route was a copy of the product information import and could not
  // store anything.) Answers the number of the application.
  async createApplication(body: unknown): Promise<{ job_application_id: string }> {
    const values: Record<string, unknown> = pick(asRecord(body), APPLICATION_FIELDS);
    checkValues(values);
    if (typeof values.name !== 'string' || values.name.trim() === '') throw new BadRequestException({ error: 'A name is required' });
    if (typeof values.email !== 'string' || !/^[^\s@]+@[^\s@]+$/.test(values.email)) throw new BadRequestException({ error: 'A valid e-mail address is required' });
    if (values.birthday !== undefined && values.birthday !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(values.birthday))) throw new BadRequestException({ error: 'Invalid birthday' });
    if (values.job_offer_id !== undefined && values.job_offer_id !== null && !(await this.offers.findByPk(String(values.job_offer_id), { logging: false }))) throw new BadRequestException({ error: 'Unknown job offer' });
    const created = await this.applications.create({ ...values, status: 'new' }, { logging: false });
    return { job_application_id: created.job_application_id };
  }
}
