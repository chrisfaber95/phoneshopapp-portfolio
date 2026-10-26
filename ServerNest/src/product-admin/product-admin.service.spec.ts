import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { Sequelize } from 'sequelize';
import { ActieOrderHasProduct, OrderHasProduct, Product, ProductAdditionInformation, Productinformation } from '../database/models';
import { ProductAdminService } from './product-admin.service';

interface Setup { existing?: unknown; info?: unknown; used?: number; extraCount?: number }
const setup = (over: Setup = {}) => {
  const existing = over.existing === undefined ? null : over.existing;
  const products = {
    getAttributes: () => ({ id: {}, ean: {}, price: {}, nix18: {}, department_id: {}, beschikbaar: {}, schaphoogte: {}, schapplaats: {}, schapcode: {}, stock: {} }),
    findOne: jest.fn().mockResolvedValue(existing),
    create: jest.fn().mockResolvedValue({ id: 42 }),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    count: jest.fn().mockResolvedValue(1),
  };
  const information = { findOne: jest.fn().mockResolvedValue(over.info ?? null), create: jest.fn().mockResolvedValue({ id: 7 }), update: jest.fn().mockResolvedValue([1]) };
  const additional = { count: jest.fn().mockResolvedValue(over.extraCount ?? 0), bulkCreate: jest.fn().mockResolvedValue([]) };
  const orderLines = { count: jest.fn().mockResolvedValue(over.used ?? 0) };
  const actieLines = { count: jest.fn().mockResolvedValue(0) };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const service = new ProductAdminService(
    sequelize as unknown as Sequelize, products as unknown as typeof Product, information as unknown as typeof Productinformation, additional as unknown as typeof ProductAdditionInformation,
    orderLines as unknown as typeof OrderHasProduct, actieLines as unknown as typeof ActieOrderHasProduct,
  );
  return { service, products, information, additional, orderLines };
};

describe('ProductAdminService', () => {
  describe('update', () => {
    it('changes whitelisted columns of the product with that id', async () => {
      const { service, products } = setup();
      await service.update({ id: 5, price: '2.50', stock: 1, ean: '999', evil: 'x', created: 'y' });
      expect(products.update).toHaveBeenCalledWith({ price: '2.50', stock: 1 }, expect.objectContaining({ where: { id: 5 } }));
    });

    it.each([[{ price: 1 }], [{ id: 'x', price: 1 }], [{ id: 5, price: { a: 1 } }]])('rejects %j', async (body) => {
      await expect(setup().service.update(body)).rejects.toThrow(BadRequestException);
    });

    it('writes nothing when no allowed column is sent', async () => {
      const { service, products } = setup();
      await expect(service.update({ id: 5, evil: 1 })).resolves.toEqual([0]);
      expect(products.update).not.toHaveBeenCalled();
    });
  });

  describe('upsert', () => {
    it('creates a product with its information and additional information', async () => {
      const { service, products, information, additional } = setup();
      const result = await service.upsert({ ean: '8710', price: '1.99', nix18: false, id: 5, product_information: { title: 'Melk', variant: '1L', product_additional_information: [{ name: 'merk', type: 't', value: 'x', id: 9 }] } });
      expect(result).toEqual({ id: 42, ean: '8710', created: true });
      expect(products.create.mock.calls[0][0]).toEqual({ price: '1.99', nix18: false, ean: '8710' });
      expect(information.create.mock.calls[0][0]).toEqual({ title: 'Melk', variant: '1L', ean: '8710' });
      expect(additional.bulkCreate.mock.calls[0][0]).toEqual([{ name: 'merk', type: 't', value: 'x', product_information_id: 7 }]);
    });

    it('refreshes an existing product and its information, and adds additional information only when there is none', async () => {
      const row = { id: 3, update: jest.fn().mockResolvedValue(undefined) };
      const info = { id: 7, update: jest.fn().mockResolvedValue(undefined) };
      const { service, products, additional } = setup({ existing: row, info, extraCount: 2 });
      await expect(service.upsert({ ean: '8710', price: '2.10', product_information: { title: 'New', product_additional_information: [{ name: 'a' }] } })).resolves.toEqual({ id: 3, ean: '8710', created: false });
      expect(row.update).toHaveBeenCalledWith({ price: '2.10' }, expect.anything());
      expect(info.update).toHaveBeenCalledWith({ title: 'New' }, expect.anything());
      expect(products.create).not.toHaveBeenCalled();
      expect(additional.bulkCreate).not.toHaveBeenCalled();
    });

    it.each([[{ price: 1 }], [{ ean: 'abc' }], [{ ean: '1', price: { a: 1 } }], [{ ean: '1', product_information: { title: 5 } }]])('rejects %j', async (body) => {
      const { service, products } = setup();
      await expect(service.upsert(body)).rejects.toThrow(BadRequestException);
      expect(products.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes a product that no order uses', async () => {
      const { service, products } = setup();
      await expect(service.remove('5')).resolves.toBe(1);
      expect(products.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 5 } }));
    });

    it('keeps a product that is used in orders', async () => {
      const { service, products } = setup({ used: 2 });
      await expect(service.remove('5')).resolves.toEqual({ err: expect.stringContaining('bestellingen') });
      expect(products.destroy).not.toHaveBeenCalled();
    });

    it('rejects an id that is not a number and answers { err } when the database refuses', async () => {
      const { service, products } = setup();
      await expect(service.remove('5; DROP')).rejects.toThrow(BadRequestException);
      products.destroy.mockRejectedValue(new Error('fk'));
      await expect(service.remove('5')).resolves.toEqual({ err: 'Het product kan niet worden verwijderd' });
    });
  });

  describe('scanner', () => {
    it('updates the stock and the shelf place of a known product', async () => {
      const { service, products } = setup();
      await expect(service.scanner({ ean: '8710', aantal: 4, schaphoogte: 2, schapplaats: 7, schapcode: 'A1', price: 0 })).resolves.toEqual({ docs: 'product updated' });
      expect(products.update).toHaveBeenCalledWith({ schaphoogte: 2, schapplaats: 7, schapcode: 'A1', beschikbaar: 4 }, expect.objectContaining({ where: { ean: '8710' } }));
    });

    it('says so for an unknown product and rejects a bad ean', async () => {
      const unknown = setup();
      unknown.products.update.mockResolvedValue([0]);
      unknown.products.count.mockResolvedValue(0);
      await expect(unknown.service.scanner({ ean: '1' })).resolves.toEqual({ docs: 'product not found' });
      await expect(setup().service.scanner({ ean: '../x' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateImage', () => {
    let root: string;
    beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'product-images-')); });
    afterEach(() => { rmSync(root, { recursive: true, force: true }); });

    const png = async () => `data:image/png;base64,${(await sharp({ create: { width: 300, height: 100, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } } }).png().toBuffer()).toString('base64')}`;

    it('scales the image into a white 1000x1000 jpeg and points the information at it', async () => {
      const { service, information } = setup();
      service.imageRoot = root;
      await expect(service.updateImage({ product: { ean: '8710' }, imageData: await png() })).resolves.toEqual({ message: 'Image changed successfully' });
      const saved = readFileSync(join(root, 'products', '8710-base.jpg'));
      const meta = await sharp(saved).metadata();
      expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1000, 1000]);
      expect(information.update).toHaveBeenCalledWith({ imgurl: '/api/back-images/products/8710-base.jpg' }, expect.objectContaining({ where: { ean: '8710' } }));
    });

    it.each([
      ['an ean with a path in it', { product: { ean: '../../x' }, imageData: 'x' }],
      ['no image', { product: { ean: '1' } }],
      ['an svg', { product: { ean: '1' }, imageData: 'data:image/svg+xml;base64,PHN2Zz4=' }],
      ['bytes that are not an image', { product: { ean: '1' }, imageData: `data:image/png;base64,${Buffer.from('89504e47aabbcc', 'hex').toString('base64')}` }],
    ])('rejects %s without writing anything', async (_name, body) => {
      const { service, information } = setup();
      service.imageRoot = root;
      await expect(service.updateImage(body)).rejects.toThrow(BadRequestException);
      expect(information.update).not.toHaveBeenCalled();
    });
  });
});

describe('ProductAdminService update with the wrapper of the admin app', () => {
  it('accepts { product: { id, ... } } as well', async () => {
    const products = { getAttributes: () => ({ id: {}, price: {} }), update: jest.fn().mockResolvedValue([1]) };
    const service = new ProductAdminService({} as never, products as never, {} as never, {} as never, {} as never, {} as never);
    await service.update({ product: { id: 5, price: '2.00' } });
    expect(products.update).toHaveBeenCalledWith({ price: '2.00' }, expect.objectContaining({ where: { id: 5 } }));
  });
});
