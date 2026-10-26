import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Passwords are stored as bcrypt hashes (bcryptjs, cost 10), the same as the old Server, so existing hashes keep working.
@Injectable()
export class PasswordService {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // false for a wrong password and also when the account has no (valid) hash; it never throws
  async verify(password: string, hash: string | null | undefined): Promise<boolean> {
    if (!password || !hash) return false;
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
}
