import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { ImageError, imageColumn } from '../common/images';
import { asRecord, pick } from '../customers/customer-fields';
import { Spaaractie, SpaaractieHasProduct } from '../database/models';

const IMAGE_COLUMNS = ['back_imgurl', 'front_imgurl', 'imgurl', 'list_image', 'stamp_imgurl'] as const;
const SYSTEM_COLUMNS = ['spaaractie_id', 'createdAt', 'updatedAt', 'deletedAt'];
const PRODUCT_FIELDS = ['product_id', 'discount_percentage', 'title', 'description', 'points_cost', 'stamps_cost'] as const;

// The savings actions ("spaaracties") with the products that can be bought with their stamps or points
@Injectable()
export class SpaaractiesService {
  // where images are saved (default: public/ of the working directory, which is served under /api/back-images/); changed by tests
  imageRoot?: string;

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Spaaractie) private readonly actions: typeof Spaaractie,
    @InjectModel(SpaaractieHasProduct) private readonly products: typeof SpaaractieHasProduct,
  ) {}

  private include() {
    return [{ model: SpaaractieHasProduct, as: 'spaaractie_products' }, { association: 'terms' }];
  }

  list(): Promise<Spaaractie[]> {
    return this.actions.findAll({ include: this.include(), logging: false });
  }

  // `{ actie }`, with null for an unknown id (like the old Server)
  async single(id: string): Promise<{ actie: Spaaractie | null }> {
    return { actie: await this.actions.findByPk(id, { logging: false }) };
  }

  // The columns an employee may set: every column of the action except its id and the timestamps
  private async columns(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const allowed = Object.keys(this.actions.getAttributes()).filter((column) => !SYSTEM_COLUMNS.includes(column));
    const values: Record<string, unknown> = pick(body, allowed);
    try {
      for (const column of IMAGE_COLUMNS) {
        if (column in values) values[column] = await imageColumn(values[column], 'acties', this.imageRoot);
      }
    } catch (error) {
      if (error instanceof ImageError) throw new BadRequestException({ error: error.message });
      throw error;
    }
    return values;
  }

  private productRows(list: unknown, actionId: string): Record<string, unknown>[] {
    if (!Array.isArray(list)) throw new BadRequestException({ error: 'spaaractie_products must be a list' });
    return list.map((entry) => ({ ...pick(asRecord(entry), PRODUCT_FIELDS), spaaractie_id: actionId }));
  }

  // POST /spaaractie: creates an action with its products (the old code lost the link between the two: it set the id on the list
  // instead of on every product)
  async create(body: unknown) {
    const input = asRecord(body);
    const values = await this.columns(input);
    const created = await this.sequelize.transaction(async (transaction) => {
      const action = await this.actions.create(values, { transaction, logging: false });
      if (input.spaaractie_products !== undefined) await this.products.bulkCreate(this.productRows(input.spaaractie_products, action.spaaractie_id) as never[], { transaction, logging: false });
      return action;
    });
    return this.actions.findByPk(created.spaaractie_id, { include: this.include(), logging: false });
  }

  // PUT /spaaractie: changes an action; when the body has a product list, it replaces the products of the action
  async update(body: unknown) {
    const input = asRecord(body);
    const id = input.spaaractie_id;
    const existing = typeof id === 'string' ? await this.actions.findByPk(id, { logging: false }) : null;
    if (!existing) throw new NotFoundException({ error: 'Row not found' });

    const values = await this.columns(input);
    await this.sequelize.transaction(async (transaction) => {
      if (Object.keys(values).length > 0) await existing.update(values, { transaction, logging: false });
      if (input.spaaractie_products !== undefined) {
        const rows = this.productRows(input.spaaractie_products, existing.spaaractie_id);
        await this.products.destroy({ where: { spaaractie_id: existing.spaaractie_id }, transaction, logging: false });
        await this.products.bulkCreate(rows as never[], { transaction, logging: false });
      }
    });
    return this.actions.findByPk(existing.spaaractie_id, { include: this.include(), logging: false });
  }
}
