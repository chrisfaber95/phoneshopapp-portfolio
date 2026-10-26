import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Strict } from '../common/rate-limit';
import { LoginResult } from './auth.messages';
import { CustomerAuthService } from './customer-auth.service';
import { UserAuthService } from './user-auth.service';

// The old Server answers logins with HTTP 200 also for failures ({ err }), hence @HttpCode(200) (Nest defaults POST to 201)
@Controller('v1/user')
export class UserLoginController {
  constructor(private readonly service: UserAuthService) {}

  @Post('login')
  @Strict()
  @HttpCode(200)
  login(@Body() body: Record<string, unknown>): Promise<LoginResult> {
    return this.service.login(body ?? {});
  }
}

@Controller('v1/customer')
export class CustomerLoginController {
  constructor(private readonly service: CustomerAuthService) {}

  @Post('login')
  @Strict()
  @HttpCode(200)
  login(@Body() body: Record<string, unknown>): Promise<LoginResult> {
    return this.service.login(body ?? {});
  }
}
