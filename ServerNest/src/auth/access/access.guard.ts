import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppEnv } from '../../config/env.validation';
import { Principal, PrincipalService } from '../principal.service';
import { TokenService } from '../token.service';
import { classify, RULES, splitVersion } from './access.rules';
import { IS_PUBLIC } from './public.decorator';

export type RequestWithPrincipal = Request & { principal?: Principal };

// The raw token, or "Bearer <token>"; "null"/"undefined" (a logged-out client) count as no token
export const tokenOf = (req: Request): string | null => {
  const header = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  return ['', 'null', 'undefined'].includes(header) ? null : header;
};

const hasCustomerId = (req: Request): boolean => {
  const query = req.query as Record<string, unknown> | undefined;
  const body = req.body as Record<string, unknown> | undefined;
  const id = query?.customer_id ?? body?.customer_id;
  return id !== undefined && id !== null && String(id).trim() !== '';
};

// Applies the access rules (access.rules.ts) to every request. Same behaviour as the old Server's access middleware:
// 401 without a valid token, 403 when a customer token hits an employee endpoint, ACCESS_MODE=log only logs.
@Injectable()
export class AccessGuard implements CanActivate {
  private readonly logger = new Logger(AccessGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly principals: PrincipalService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;

    const req = context.switchToHttp().getRequest<RequestWithPrincipal>();
    if (req.method === 'OPTIONS') return true; // CORS preflight carries no token

    const split = splitVersion(req.originalUrl);
    const access = split ? classify(RULES[split.version], req.method, split.path) : 'user';
    // a valid token is recognised on public routes too (guest checkout links the order to the customer who is logged in)
    const payload = this.tokens.verify(tokenOf(req));
    const principal = payload ? await this.principals.find(payload.user_id) : null;
    if (principal) req.principal = principal;
    if (access === 'public') return true;

    let denied: { error: Error; reason: string } | null = null;
    if (access === 'user' && !principal) denied = { error: new UnauthorizedException({ error: 'Authentication required' }), reason: 'no valid token' };
    else if (access === 'user' && principal?.type !== 'user') denied = { error: new ForbiddenException({ error: 'Not allowed' }), reason: 'employee token required' };
    else if (access === 'owner' && !principal && !hasCustomerId(req)) denied = { error: new UnauthorizedException({ error: 'Authentication required' }), reason: 'no valid token and no customer_id' };
    if (!denied) return true;

    const enforce = this.config.get('ACCESS_MODE', { infer: true }) !== 'log';
    this.logger.warn(`access ${enforce ? 'denied' : 'would be denied'}: ${req.method} ${req.originalUrl.split('?')[0]} (${access}): ${denied.reason}`);
    if (!enforce) return true;
    throw denied.error;
  }
}
