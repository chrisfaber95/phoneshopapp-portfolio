import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Principal } from '../principal.service';
import { RequestWithPrincipal } from './access.guard';

// The account behind the token of the request (set by the access guard), or null for a request without a valid token
export const CurrentPrincipal = createParamDecorator((_data: unknown, context: ExecutionContext): Principal | null => {
  return context.switchToHttp().getRequest<RequestWithPrincipal>().principal ?? null;
});
