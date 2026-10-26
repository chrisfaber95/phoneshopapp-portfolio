import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

// Rate limits per client address. Every route is limited generously (see app.module.ts); the routes that can be abused without a
// login (logins, sign-up, password reset, guest checkout, applications, feedback) have this stricter limit: 10 requests a minute.
export const STRICT_LIMIT = { limit: 10, ttl: 60_000 };

export const Strict = (): MethodDecorator & ClassDecorator => applyDecorators(Throttle({ default: STRICT_LIMIT })) as MethodDecorator & ClassDecorator;
