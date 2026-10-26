import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

// Marks a controller or handler as outside the access rules (for example GET /api/health)
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC, true);
