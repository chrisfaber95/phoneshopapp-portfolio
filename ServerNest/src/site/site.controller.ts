import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { Strict } from '../common/rate-limit';
import { asRecord } from '../customers/customer-fields';
import { SiteService } from './site.service';

@Controller('v1')
export class SiteController {
  constructor(private readonly service: SiteService) {}

  @Post('site/cookies')
  @HttpCode(200)
  cookies(@Headers('user-agent') userAgent: string | undefined, @Body() body: Record<string, unknown>) {
    return this.service.acceptCookies(userAgent, asRecord(body));
  }

  @Post('feedback')
  @Strict()
  @HttpCode(200)
  feedback(@Body() body: Record<string, unknown>) {
    return this.service.feedback(asRecord(body));
  }
}
