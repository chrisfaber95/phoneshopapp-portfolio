import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as jsonwebtoken from 'jsonwebtoken';
import { AppEnv } from '../config/env.validation';
import { TokenService } from './token.service';

const config = (key: string) => ({ get: () => key }) as unknown as ConfigService<AppEnv, true>;
const service = (key = 'test-key') => new TokenService(new JwtService(), config(key));

describe('TokenService', () => {
  it('signs the token format of the old Server: { user_id, email }, 20 hours', () => {
    const payload = jsonwebtoken.verify(service().sign('u-1', 'a@b.nl'), 'test-key') as jsonwebtoken.JwtPayload;
    expect(Object.keys(payload).sort()).toEqual(['email', 'exp', 'iat', 'user_id']);
    expect(payload.user_id).toBe('u-1');
    expect(payload.email).toBe('a@b.nl');
    expect((payload.exp! - payload.iat!) / 3600).toBe(20);
  });

  it('accepts a custom lifetime', () => {
    const payload = jsonwebtoken.decode(service().sign('u-1', null, '1h')) as jsonwebtoken.JwtPayload;
    expect(payload.exp! - payload.iat!).toBe(3600);
  });

  it('verifies a token signed by the old Server (plain jsonwebtoken, same key)', () => {
    const oldToken = jsonwebtoken.sign({ user_id: 'u-9', email: 'x@y.nl' }, 'test-key', { expiresIn: '20h' });
    expect(service().verify(oldToken)?.user_id).toBe('u-9');
  });

  it('verify returns null for missing, malformed, expired, wrong-key and id-less tokens', () => {
    const tokens = service();
    expect(tokens.verify(null)).toBeNull();
    expect(tokens.verify(undefined)).toBeNull();
    expect(tokens.verify('')).toBeNull();
    expect(tokens.verify('not-a-token')).toBeNull();
    expect(tokens.verify(jsonwebtoken.sign({ user_id: 'u-1' }, 'other-key'))).toBeNull();
    expect(tokens.verify(jsonwebtoken.sign({ user_id: 'u-1' }, 'test-key', { expiresIn: -10 }))).toBeNull();
    expect(tokens.verify(jsonwebtoken.sign({ email: 'x@y.nl' }, 'test-key'))).toBeNull();
  });
});
