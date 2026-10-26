import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { ImageError, MAX_IMAGE_BYTES, imageColumn, imageRoot, saveImage } from './images';

const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const dataUrl = (type: string, bytes: Buffer) => `data:image/${type};base64,${bytes.toString('base64')}`;

describe('imageRoot', () => {
  afterEach(() => { delete process.env.IMAGES_DIR; });

  it('is ./public next to where the server started when IMAGES_DIR is not set', () => {
    delete process.env.IMAGES_DIR;
    expect(imageRoot()).toBe(join(process.cwd(), 'public'));
  });

  it('is IMAGES_DIR when it is set, relative to where the server started', () => {
    process.env.IMAGES_DIR = '../Server/public';
    expect(imageRoot()).toBe(resolve('../Server/public'));
  });
});

describe('images', () => {
  let root: string;
  beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'images-')); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it('saves a data URL under the folder and answers the URL path', async () => {
    const path = await saveImage(dataUrl('png', PNG), 'acties', root);
    expect(path).toMatch(/^api\/back-images\/acties\/\d+-[0-9a-f]{12}\.png$/);
    const [file] = readdirSync(join(root, 'acties'));
    expect(readFileSync(join(root, 'acties', file))).toEqual(PNG);
  });

  it('maps jpeg to .jpg and checks the first bytes against the type', async () => {
    const jpeg = Buffer.from('ffd8ffe000104a464946', 'hex');
    await expect(saveImage(dataUrl('jpeg', jpeg), 'acties', root)).resolves.toMatch(/\.jpg$/);
    await expect(saveImage(dataUrl('jpeg', PNG), 'acties', root)).rejects.toThrow('not what its type says');
  });

  it.each([
    ['an svg (script carrier)', `data:image/svg+xml;base64,${Buffer.from('<svg onload=alert(1)>').toString('base64')}`],
    ['a made-up type with a path in it', `data:image/../../x;base64,${PNG.toString('base64')}`],
    ['text that is not base64', 'data:image/png;base64,***'],
    ['an empty image', 'data:image/png;base64,='],
  ])('rejects %s', async (_name, input) => {
    await expect(saveImage(input, 'acties', root)).rejects.toThrow(ImageError);
    expect(() => readdirSync(join(root, 'acties'))).toThrow(); // nothing was written
  });

  it('rejects an image above the size limit', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)]);
    await expect(saveImage(dataUrl('png', big), 'acties', root)).rejects.toThrow('larger than 5 MB');
  });

  describe('imageColumn', () => {
    it('leaves a missing value alone, clears null/empty, keeps an existing URL path', async () => {
      await expect(imageColumn(undefined, 'acties', root)).resolves.toBeUndefined();
      await expect(imageColumn(null, 'acties', root)).resolves.toBeNull();
      await expect(imageColumn('', 'acties', root)).resolves.toBeNull();
      await expect(imageColumn('api/back-images/acties/a.png', 'acties', root)).resolves.toBe('api/back-images/acties/a.png');
    });

    it('saves a data URL and rejects anything else', async () => {
      await expect(imageColumn(dataUrl('png', PNG), 'acties', root)).resolves.toMatch(/^api\/back-images\/acties\//);
      await expect(imageColumn('../../etc/passwd', 'acties', root)).rejects.toThrow(ImageError);
      await expect(imageColumn({ a: 1 }, 'acties', root)).rejects.toThrow(ImageError);
      await expect(imageColumn('x'.repeat(300), 'acties', root)).rejects.toThrow(ImageError);
    });
  });
});
