import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { Sequelize } from 'sequelize';
import { ImageError, decodeDataUrl, imageRoot as defaultImageRoot } from '../common/images';
import { asRecord, pick } from '../customers/customer-fields';
import { ActieOrderHasProduct, OrderHasProduct, Product, ProductAdditionInformation, Productinformation } from '../database/models';

const SYSTEM_COLUMNS = ['id', 'ean'];
const CREATE_FIELDS = ['price', 'nix18', 'syndyid', 'department_id'] as const;
const INFO_FIELDS = ['title', 'variant', 'ingredients'] as const;
const SHELF_FIELDS = ['schaphoogte', 'schapplaats', 'schapcode'] as const;
const DIGITS = /^[0-9]{1,20}$/;

const isScalar = (value: unknown): boolean => value === null || ['string', 'number', 'boolean'].includes(typeof value);

// Product maintenance for the admin app (employees only: the access rules' default)
@Injectable()
export class ProductAdminService {
  private readonly logger = new Logger(ProductAdminService.name);
  // where product images are saved (served under /api/back-images/products/); changed by tests
  imageRoot: string = defaultImageRoot();

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Product) private readonly products: typeof Product,
    @InjectModel(Productinformation) private readonly information: typeof Productinformation,
    @InjectModel(ProductAdditionInformation) private readonly additional: typeof ProductAdditionInformation,
    @InjectModel(OrderHasProduct) private readonly orderLines: typeof OrderHasProduct,
    @InjectModel(ActieOrderHasProduct) private readonly actieLines: typeof ActieOrderHasProduct,
  ) {}

  private columns(body: Record<string, unknown>): Record<string, unknown> {
    const allowed = Object.keys(this.products.getAttributes()).filter((column) => !SYSTEM_COLUMNS.includes(column));
    const values: Record<string, unknown> = pick(body, allowed);
    for (const [key, value] of Object.entries(values)) if (!isScalar(value)) throw new BadRequestException({ error: `Invalid value for ${key}` });
    return values;
  }

  // PUT /product { id, ...columns } (or { product: { id, ...columns } }, which the admin app also sends): changes a product (the old
  // Server wrote whatever the body held). Answers [number changed].
  async update(body: unknown) {
    const outer = asRecord(body);
    const input = outer.id === undefined && outer.product !== undefined ? asRecord(outer.product) : outer;
    const id = Number(input.id);
    if (!Number.isInteger(id) || id < 1) throw new BadRequestException({ error: 'id is required' });
    const values = this.columns(input);
    if (Object.keys(values).length === 0) return [0];
    return this.products.update(values, { where: { id }, logging: false });
  }

  // POST /product/post { ean, price, nix18, syndyid, department_id, product_information: { title, variant, ingredients,
  // product_additional_information: [{ name, type, value }] } }: creates the product, or refreshes the existing one with that EAN.
  // (The old handler never answered: it used a variable that did not exist.)
  async upsert(body: unknown): Promise<{ id: number; ean: string; created: boolean }> {
    const input = asRecord(body);
    const ean = input.ean;
    if (typeof ean !== 'string' || !DIGITS.test(ean)) throw new BadRequestException({ error: 'A numeric ean is required' });
    const info = asRecord(input.product_information);
    const infoValues: Record<string, unknown> = pick(info, INFO_FIELDS);
    for (const [key, value] of Object.entries(infoValues)) if (value !== null && typeof value !== 'string') throw new BadRequestException({ error: `Invalid value for ${key}` });
    const extra = Array.isArray(info.product_additional_information) ? info.product_additional_information.map(asRecord) : [];
    const values: Record<string, unknown> = pick(input, CREATE_FIELDS);
    for (const [key, value] of Object.entries(values)) if (!isScalar(value)) throw new BadRequestException({ error: `Invalid value for ${key}` });

    return this.sequelize.transaction(async (transaction) => {
      const existing = await this.products.findOne({ where: { ean }, transaction, logging: false });
      let product: Product;
      if (existing) {
        await existing.update(values, { transaction, logging: false });
        product = existing;
      } else {
        product = await this.products.create({ ...values, ean }, { transaction, logging: false });
      }

      let information = await this.information.findOne({ where: { ean }, transaction, logging: false });
      if (information) {
        if (Object.keys(infoValues).length > 0) await information.update(infoValues, { transaction, logging: false });
      } else {
        information = await this.information.create({ ...infoValues, ean } as never, { transaction, logging: false });
      }
      if (extra.length > 0 && (await this.additional.count({ where: { product_information_id: information.id }, transaction, logging: false })) === 0) {
        await this.additional.bulkCreate(extra.map((entry) => ({ ...pick(entry, ['name', 'type', 'value']), product_information_id: information.id })) as never[], { transaction, logging: false });
      }
      return { id: product.id, ean, created: !existing };
    });
  }

  // DELETE /product/delete/:id: removes a product that no order refers to. (The old route ran an unrelated query against a database
  // that does not exist and crashed.) A product that is used in orders is kept: answer { err }.
  async remove(id: string): Promise<number | { err: string }> {
    if (!DIGITS.test(id)) throw new BadRequestException({ error: 'Invalid product id' });
    const used = (await this.orderLines.count({ where: { product_id: Number(id) }, logging: false })) + (await this.actieLines.count({ where: { product_id: Number(id) }, logging: false }));
    if (used > 0) return { err: 'Het product komt voor in bestellingen en kan niet worden verwijderd' };
    try {
      return await this.products.destroy({ where: { id: Number(id) }, logging: false });
    } catch (error) {
      this.logger.error(`deleting product ${id} failed: ${(error as Error).message}`);
      return { err: 'Het product kan niet worden verwijderd' };
    }
  }

  // POST /product/scanner { ean, aantal, schaphoogte, schapplaats, schapcode }: the shelf scanner updates the stock and the place of
  // a known product. (The old route also scraped coop.nl for unknown EANs and inserted them with columns the Product table no longer
  // has; new products are created with POST /product/post.)
  async scanner(body: unknown): Promise<{ docs: string }> {
    const input = asRecord(body);
    const ean = input.ean;
    if (typeof ean !== 'string' || !DIGITS.test(ean)) throw new BadRequestException({ error: 'A numeric ean is required' });
    const changes: Record<string, unknown> = pick(input, SHELF_FIELDS);
    if (input.aantal !== undefined) changes.beschikbaar = input.aantal;
    for (const [key, value] of Object.entries(changes)) if (!isScalar(value)) throw new BadRequestException({ error: `Invalid value for ${key}` });
    const [changed] = await this.products.update(changes, { where: { ean }, logging: false });
    return { docs: changed > 0 || (await this.products.count({ where: { ean }, logging: false })) > 0 ? 'product updated' : 'product not found' };
  }

  // POST /product/update_images { product: { ean }, imageData }: replaces the product image: scaled into 1000x1000 on a white
  // background, saved as a jpeg, and the information record points to it. (The old route sent two answers and wrote a PNG into a
  // .jpg file.)
  async updateImage(body: unknown): Promise<{ message: string }> {
    const input = asRecord(body);
    const ean = asRecord(input.product).ean;
    if (typeof ean !== 'string' || !DIGITS.test(ean)) throw new BadRequestException({ error: 'Invalid ean' });
    if (typeof input.imageData !== 'string') throw new BadRequestException({ error: 'imageData is required' });

    let bytes: Buffer;
    try {
      bytes = decodeDataUrl(input.imageData).bytes;
    } catch (error) {
      if (error instanceof ImageError) throw new BadRequestException({ error: error.message });
      throw error;
    }
    let jpeg: Buffer;
    try {
      jpeg = await sharp(bytes).resize(1000, 1000, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toBuffer();
    } catch {
      throw new BadRequestException({ error: 'The image could not be read' });
    }
    const name = `${ean}-base.jpg`;
    await mkdir(join(this.imageRoot, 'products'), { recursive: true });
    await writeFile(join(this.imageRoot, 'products', name), jpeg);
    await this.information.update({ imgurl: `/api/back-images/products/${name}` }, { where: { ean }, logging: false });
    return { message: 'Image changed successfully' };
  }
}
