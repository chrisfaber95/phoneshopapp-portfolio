import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Images that arrive as base64 data URLs in a JSON body (products, discounts, savings actions) are saved under public/<folder>/ and
// the column keeps the URL path, like the old Server. The old code took the file extension from the text after `image/` (so any
// text became part of a file name) and wrote whatever was sent; here the type must be one of four, the bytes must start like that
// type and the size is limited.
export class ImageError extends Error {}

// The folder the images are saved in and served from (/api/back-images/): IMAGES_DIR, or ./public next to where the server was started
export const imageRoot = (): string => resolve(process.env.IMAGES_DIR || join(process.cwd(), 'public'));

const TYPES: Record<string, { extension: string; magic: number[][] }> = {
  png: { extension: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  jpeg: { extension: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  jpg: { extension: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  gif: { extension: 'gif', magic: [[0x47, 0x49, 0x46, 0x38]] },
  webp: { extension: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] },
};

const DATA_URL = /^data:image\/([a-z]+);base64,([A-Za-z0-9+/=\s]+)$/;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const isDataUrl = (value: unknown): value is string => typeof value === 'string' && value.startsWith('data:image/');

// The URL path stored in the database for a saved file ("api/back-images/<folder>/<file>")
export const publicPath = (folder: string, file: string): string => `api/back-images/${folder}/${file}`;

// The checked bytes of a data URL (type, first bytes and size are verified)
export const decodeDataUrl = (dataUrl: string): { bytes: Buffer; extension: string } => {
  const match = DATA_URL.exec(dataUrl);
  const type = match ? TYPES[match[1]] : undefined;
  if (!match || !type) throw new ImageError('Only png, jpeg, gif and webp images are accepted');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) throw new ImageError('The image is empty or larger than 5 MB');
  if (!type.magic.some((magic) => magic.every((byte, i) => bytes[i] === byte))) throw new ImageError('The image is not what its type says');
  return { bytes, extension: type.extension };
};

// Saves one data URL and returns the URL path for the database
export const saveImage = async (dataUrl: string, folder: string, root: string = imageRoot()): Promise<string> => {
  const { bytes, extension } = decodeDataUrl(dataUrl);
  const file = `${Date.now()}-${randomBytes(6).toString('hex')}.${extension}`;
  await mkdir(join(root, folder), { recursive: true });
  await writeFile(join(root, folder, file), bytes);
  return publicPath(folder, file);
};

// An image column of a body: a data URL is saved, an existing URL path is kept as text, anything else is rejected
export const imageColumn = async (value: unknown, folder: string, root?: string): Promise<string | null | undefined> => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (isDataUrl(value)) return saveImage(value, folder, root);
  if (typeof value === 'string' && value.length <= 255 && !value.includes('..')) return value;
  throw new ImageError('Invalid image');
};
