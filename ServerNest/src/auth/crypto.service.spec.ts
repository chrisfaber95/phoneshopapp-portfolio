import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import { AppEnv } from '../config/env.validation';
import { CryptoService, LEGACY_ORDER_CRYPT_KEY } from './crypto.service';

const config = (key?: string) => ({ get: () => key }) as unknown as ConfigService<AppEnv, true>;

describe('CryptoService', () => {
  it('round-trips an order id', () => {
    const crypto = new CryptoService(config('order-key'));
    const encrypted = crypto.encrypt('order-42');
    expect(encrypted).not.toContain('order-42');
    expect(crypto.decrypt(encrypted)).toBe('order-42');
  });

  it('uses ORDER_CRYPT_KEY: another key cannot decrypt', () => {
    const encrypted = new CryptoService(config('key-one')).encrypt('order-1');
    expect(new CryptoService(config('key-two')).decrypt(encrypted)).toBeNull();
  });

  it('falls back to the legacy key, so links from e-mails sent by the old Server still open', () => {
    const fromOldServer = new Cryptr(LEGACY_ORDER_CRYPT_KEY).encrypt('order-7');
    expect(new CryptoService(config(undefined)).decrypt(fromOldServer)).toBe('order-7');
  });

  it('returns null for text that was not encrypted by this key', () => {
    expect(new CryptoService(config('order-key')).decrypt('garbage')).toBeNull();
  });
});
