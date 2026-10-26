import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ImagesService } from './images.service';

const jpeg = Buffer.from('ffd8ffe000104a464946', 'hex');
const file = (buffer: Buffer, name = 'sale.jpeg') => ({ buffer, originalname: name, size: buffer.length });

describe('ImagesService upload', () => {
  let root: string;
  beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'upload-')); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it('saves jpeg files under sales/uploads and records them', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const service = new ImagesService({ query } as unknown as Sequelize);
    await expect(service.upload([file(jpeg)], root)).resolves.toBe('uploaded');
    const [saved] = readdirSync(join(root, 'sales', 'uploads'));
    expect(saved).toMatch(/^\d+-[0-9a-f]{12}\.jpeg$/);
    expect(query.mock.calls[0][1].replacements).toEqual({ path: `public/sales/uploads/${saved}`, name: 'sale.jpeg', type: 'image/jpeg' });
  });

  it('answers the old text when there is no file', async () => {
    const service = new ImagesService({ query: jest.fn() } as unknown as Sequelize);
    await expect(service.upload(undefined, root)).resolves.toBe('file is not found');
    await expect(service.upload([], root)).resolves.toBe('file is not found');
  });

  it('refuses anything that is not a jpeg, before writing anything', async () => {
    const query = jest.fn();
    const service = new ImagesService({ query } as unknown as Sequelize);
    await expect(service.upload([file(jpeg), file(Buffer.from('<svg onload=alert(1)>'), 'x.jpeg')], root)).rejects.toThrow(BadRequestException);
    expect(query).not.toHaveBeenCalled();
    expect(() => readdirSync(join(root, 'sales'))).toThrow();
  });
});
