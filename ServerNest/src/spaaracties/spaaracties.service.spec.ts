import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Spaaractie, SpaaractieHasProduct } from '../database/models';
import { SpaaractiesService } from './spaaracties.service';

const PNG = `data:image/png;base64,${Buffer.from('89504e470d0a1a0a', 'hex').toString('base64')}`;

const setup = (existing: unknown = { spaaractie_id: 'a-1', update: jest.fn().mockResolvedValue(undefined) }) => {
  const actions = {
    getAttributes: () => ({ spaaractie_id: {}, title: {}, imgurl: {}, back_imgurl: {}, point_for_stamp: {}, createdAt: {}, updatedAt: {}, deletedAt: {} }),
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(existing),
    create: jest.fn().mockResolvedValue({ spaaractie_id: 'a-new' }),
  };
  const products = { bulkCreate: jest.fn().mockResolvedValue([]), destroy: jest.fn().mockResolvedValue(1) };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const service = new SpaaractiesService(sequelize as unknown as Sequelize, actions as unknown as typeof Spaaractie, products as unknown as typeof SpaaractieHasProduct);
  service.imageRoot = imageRoot;
  return { service, actions, products };
};

let imageRoot: string;

describe('SpaaractiesService', () => {
  beforeEach(() => { imageRoot = mkdtempSync(join(tmpdir(), 'acties-')); });
  afterEach(() => { rmSync(imageRoot, { recursive: true, force: true }); });

  it('answers { actie: null } for an unknown id', async () => {
    const { service } = setup(null);
    await expect(service.single('nope')).resolves.toEqual({ actie: null });
  });

  describe('create', () => {
    it('writes only the columns of the action and links the products to the new action', async () => {
      const { service, actions, products } = setup();
      await service.create({ title: 'Zegels', point_for_stamp: 5, spaaractie_id: 'chosen', deletedAt: 'x', evil: 1, spaaractie_products: [{ product_id: 3, stamps_cost: 2, id: 99, spaaractie_id: 'other' }] });
      expect(actions.create.mock.calls[0][0]).toEqual({ title: 'Zegels', point_for_stamp: 5 });
      expect(products.bulkCreate.mock.calls[0][0]).toEqual([{ product_id: 3, stamps_cost: 2, spaaractie_id: 'a-new' }]);
    });

    it('saves a base64 image and stores its URL path', async () => {
      const { service, actions } = setup();
      await service.create({ title: 'x', imgurl: PNG });
      expect(actions.create.mock.calls[0][0].imgurl).toMatch(/^api\/back-images\/acties\/.+\.png$/);
    });

    it('rejects an image that is not an accepted type', async () => {
      const { service, actions } = setup();
      await expect(service.create({ imgurl: 'data:image/svg+xml;base64,PHN2Zz4=' })).rejects.toThrow(BadRequestException);
      expect(actions.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('is a 404 for an unknown action', async () => {
      await expect(setup(null).service.update({ spaaractie_id: 'nope', title: 'x' })).rejects.toThrow(NotFoundException);
      await expect(setup().service.update({ title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('changes the columns and replaces the products of that action', async () => {
      const row = { spaaractie_id: 'a-1', update: jest.fn().mockResolvedValue(undefined) };
      const { service, products } = setup(row);
      await service.update({ spaaractie_id: 'a-1', title: 'New', spaaractie_products: [{ product_id: 4, title: 'Mok', id: 7, spaaractie_id: 'other' }] });
      expect(row.update.mock.calls[0][0]).toEqual({ title: 'New' });
      expect(products.destroy.mock.calls[0][0].where).toEqual({ spaaractie_id: 'a-1' });
      expect(products.bulkCreate.mock.calls[0][0]).toEqual([{ product_id: 4, title: 'Mok', spaaractie_id: 'a-1' }]);
    });

    it('leaves the products alone when the body has no list (the old code crashed)', async () => {
      const { service, products } = setup();
      await service.update({ spaaractie_id: 'a-1', title: 'New' });
      expect(products.destroy).not.toHaveBeenCalled();
      expect(products.bulkCreate).not.toHaveBeenCalled();
    });

    it('rejects a product list that is not a list', async () => {
      await expect(setup().service.update({ spaaractie_id: 'a-1', spaaractie_products: 'x' })).rejects.toThrow(BadRequestException);
    });
  });
});
