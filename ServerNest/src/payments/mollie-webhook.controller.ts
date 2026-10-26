import { Body, Controller, Header, HttpCode, Post, UnprocessableEntityException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { OrderPaymentsService, UnknownPaymentError } from './order-payments.service';

@SkipThrottle() // called by Mollie, possibly many times for one payment
@Controller('v1/mollie')
export class MollieWebhookController {
  constructor(private readonly service: OrderPaymentsService) {}

  // Called by Mollie (form encoded `id=tr_...`); the access rules leave /mollie/* open. The answer is the payment status as text.
  @Post('webhook')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async webhook(@Body() body: unknown): Promise<string> {
    try {
      return await this.service.handle(body);
    } catch (error) {
      if (error instanceof UnknownPaymentError) throw new UnprocessableEntityException(error.message);
      throw error;
    }
  }
}
