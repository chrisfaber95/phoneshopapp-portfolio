import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { imageRoot } from '../common/images';

export interface UploadedImage {
  buffer: Buffer;
  originalname: string;
  size: number;
}

const MAX_UPLOAD = 5 * 1024 * 1024;

// Images of discounts (table Images, files under the images folder, ./public by default). The old routes for these never answered (a database callback that
// was never called); this is what they were meant to do.
@Injectable()
export class ImagesService {
  constructor(@InjectConnection() private readonly connection: Sequelize) {}

  // GET /api/v1/discounts/get_images: all image records
  list(): Promise<Record<string, unknown>[]> {
    return this.connection.query('SELECT * FROM Images', { type: QueryTypes.SELECT, logging: false });
  }

  // GET /api/v1/discounts/get_images/:imgId: the image file as base64 text (the format the old route sent)
  async base64(imageId: string): Promise<string> {
    const rows = await this.connection.query<{ path: string }>('SELECT path FROM Images WHERE images_id = :id', { replacements: { id: imageId }, type: QueryTypes.SELECT, logging: false });
    if (rows.length === 0 || typeof rows[0].path !== 'string') throw new NotFoundException({ message: 'Image not found' });

    // the path comes from the database ('public/sales/uploads/x.jpeg'); only serve files below the images folder
    const publicDir = imageRoot();
    const file = path.resolve(publicDir, path.normalize(rows[0].path).replace(/^public[\\/]/, ''));
    if (!file.startsWith(publicDir + path.sep)) throw new NotFoundException({ message: 'Image not found' });
    try {
      return (await fs.readFile(file)).toString('base64');
    } catch {
      throw new NotFoundException({ message: 'Image not found' });
    }
  }

  // POST /api/v1/discounts/images: saves uploaded jpeg files under public/sales/uploads and records them in the Images table. The
  // old route called a stored procedure that is not in the schema dump and answered before the work was done.
  async upload(files: UploadedImage[] | undefined, root: string = imageRoot()): Promise<string> {
    if (!files || files.length === 0) return 'file is not found';
    for (const file of files) {
      const jpeg = file.buffer.length > 3 && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
      if (!jpeg || file.size > MAX_UPLOAD) throw new BadRequestException({ message: 'Only jpeg images up to 5 MB are accepted' });
    }
    const folder = path.join(root, 'sales', 'uploads');
    await fs.mkdir(folder, { recursive: true });
    for (const file of files) {
      const name = `${Date.now()}-${randomBytes(6).toString('hex')}.jpeg`;
      await fs.writeFile(path.join(folder, name), file.buffer);
      await this.connection.query('INSERT INTO Images (path, name, type) VALUES (:path, :name, :type)', {
        replacements: { path: `public/sales/uploads/${name}`, name: file.originalname.slice(0, 200), type: 'image/jpeg' },
        logging: false,
      });
    }
    return 'uploaded';
  }
}
