import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppEnv } from '../config/env.validation';

// Login tokens keep the format of the old Server so existing sessions stay valid:
// HS256, signed with TOKEN_KEY, payload { user_id, email }. Customers also carry their customer id in `user_id`.
export interface TokenPayload {
  user_id: string;
  email: string | null;
  iat?: number;
  exp?: number;
}

export const DEFAULT_TOKEN_LIFETIME = '20h';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private get secret(): string {
    return this.config.get('TOKEN_KEY', { infer: true });
  }

  sign(userId: string, email: string | null, expiresIn: string = DEFAULT_TOKEN_LIFETIME): string {
    return this.jwt.sign({ user_id: userId, email }, { secret: this.secret, expiresIn: expiresIn as never });
  }

  // Returns the payload, or null when the token is missing, malformed, expired or signed with another key
  verify(token: string | null | undefined): TokenPayload | null {
    if (!token) return null;
    try {
      const payload = this.jwt.verify<TokenPayload>(token, { secret: this.secret });
      return payload && payload.user_id !== undefined && payload.user_id !== null ? payload : null;
    } catch {
      return null;
    }
  }
}
