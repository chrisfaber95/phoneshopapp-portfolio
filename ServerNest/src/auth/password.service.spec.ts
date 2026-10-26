import * as fs from 'node:fs';
import * as path from 'node:path';
import { PasswordService } from './password.service';

const passwords = new PasswordService();

describe('PasswordService', () => {
  it('hashes with bcrypt cost 10 and verifies', async () => {
    const hash = await passwords.hash('secret');
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
    expect(await passwords.verify('secret', hash)).toBe(true);
    expect(await passwords.verify('other', hash)).toBe(false);
  });

  it('verifies a hash created by the old Server', async () => {
    const fixture = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'parity', 'fixtures', 'auth.sql'), 'utf8');
    const hash = /'(\$2[aby]\$10\$[^']+)'/.exec(fixture)?.[1];
    expect(hash).toBeDefined();
    expect(await passwords.verify('parity-pass', hash)).toBe(true);
  });

  it('never throws: an account without a (valid) hash, or an empty password, is simply a mismatch', async () => {
    expect(await passwords.verify('secret', null)).toBe(false);
    expect(await passwords.verify('secret', undefined)).toBe(false);
    expect(await passwords.verify('secret', 'not-a-bcrypt-hash')).toBe(false);
    expect(await passwords.verify('', await passwords.hash('secret'))).toBe(false);
  });
});
