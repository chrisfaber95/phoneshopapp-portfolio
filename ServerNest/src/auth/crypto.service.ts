import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import { AppEnv } from '../config/env.validation';

// The key that used to be hardcoded in the old Server. Order links in e-mails that were already sent are encrypted with
// it, so it is the fallback until ORDER_CRYPT_KEY is set (to the same value first, rotate later).
export const LEGACY_ORDER_CRYPT_KEY = 'myTotalySecretKey';

// Encrypts order ids for the links in e-mails (Cryptr, the same library and format as the old Server)
@Injectable()
export class CryptoService {
  private readonly cryptr: Cryptr;

  constructor(config: ConfigService<AppEnv, true>) {
    const key = config.get('ORDER_CRYPT_KEY', { infer: true });
    if (!key) new Logger(CryptoService.name).warn('ORDER_CRYPT_KEY is not set, falling back to the legacy built-in key');
    this.cryptr = new Cryptr(key || LEGACY_ORDER_CRYPT_KEY);
  }

  encrypt(value: string): string {
    return this.cryptr.encrypt(value);
  }

  // Returns null for a value that was not encrypted with this key
  decrypt(value: string): string | null {
    try {
      return this.cryptr.decrypt(value);
    } catch {
      return null;
    }
  }
}
