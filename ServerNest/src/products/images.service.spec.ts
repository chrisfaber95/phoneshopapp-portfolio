import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ImagesService } from './images.service';

const serviceWith = (rows: unknown[]) => new ImagesService({ query: jest.fn().mockResolvedValue(rows) } as unknown as Sequelize);

describe('ImagesService', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'images-'));
    fs.mkdirSync(path.join(dir, 'public', 'sales'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'public', 'sales', 'a.jpeg'), 'JPEGDATA');
    fs.writeFileSync(path.join(dir, 'secret.txt'), 'secret');
    jest.spyOn(process, 'cwd').mockReturnValue(dir);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('reads below IMAGES_DIR instead of ./public when it is set', async () => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'images-dir-'));
    fs.mkdirSync(path.join(elsewhere, 'sales'), { recursive: true });
    fs.writeFileSync(path.join(elsewhere, 'sales', 'b.jpeg'), 'OTHERDATA');
    process.env.IMAGES_DIR = elsewhere;
    try {
      expect(await serviceWith([{ path: 'public/sales/b.jpeg' }]).base64('1')).toBe(Buffer.from('OTHERDATA').toString('base64'));
      await expect(serviceWith([{ path: 'public/sales/a.jpeg' }]).base64('1')).rejects.toThrow(NotFoundException);
    } finally {
      delete process.env.IMAGES_DIR;
      fs.rmSync(elsewhere, { recursive: true, force: true });
    }
  });

  it('lists the image records', async () => {
    expect(await serviceWith([{ images_id: 1 }]).list()).toEqual([{ images_id: 1 }]);
  });

  it('answers the file below ./public as base64 text', async () => {
    expect(await serviceWith([{ path: 'public/sales/a.jpeg' }]).base64('1')).toBe(Buffer.from('JPEGDATA').toString('base64'));
    expect(await serviceWith([{ path: './public/sales/a.jpeg' }]).base64('1')).toBe(Buffer.from('JPEGDATA').toString('base64'));
  });

  it.each([['unknown image', []], ['a path outside ./public', [{ path: '../secret.txt' }]], ['an absolute path elsewhere', [{ path: path.join(os.tmpdir(), 'x') }]], ['a missing file', [{ path: 'public/sales/none.jpeg' }]], ['a record without path', [{ images_id: 1 }]]])(
    'answers 404 for %s',
    async (_name, rows) => {
      await expect(serviceWith(rows).base64('1')).rejects.toThrow(NotFoundException);
    },
  );
});
