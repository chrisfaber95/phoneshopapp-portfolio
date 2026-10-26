import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Principal } from './principal.service';

// Employees may act for any customer; a customer only for themself. Used by endpoints that change or read one customer's data
// (the old Server checked only that *a* customer was logged in, so one customer could change another's data by id).
export const assertCustomerAccess = (principal: Principal | null, customerId: unknown): void => {
  if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
  if (principal.type === 'user') return;
  if (typeof customerId !== 'string' || customerId !== principal.id) throw new ForbiddenException({ error: 'Not allowed' });
};

// The endpoint is for logged-in customers only (not for employees)
export const assertCustomer = (principal: Principal | null): Principal => {
  if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
  if (principal.type !== 'customer') throw new ForbiddenException({ error: 'Not allowed' });
  return principal;
};

// The endpoint is for employees only
export const assertEmployee = (principal: Principal | null): void => {
  if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
  if (principal.type !== 'user') throw new ForbiddenException({ error: 'Not allowed' });
};
