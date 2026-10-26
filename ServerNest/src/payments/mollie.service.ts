import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnv } from '../config/env.validation';

export interface PaymentRequest {
  amount: number; // euros
  description: string;
  redirectUrl: string;
  method?: string;
  // pay with the Mollie test key (for the loyalty cards listed in MOLLIE_TEST_CARDS)
  test?: boolean;
}

export interface PaymentInfo {
  id: string;
  status: string;
  checkoutUrl: string | null;
}

// What this app uses of the Mollie client (the real one is created in the payments module, tests pass a fake)
export interface MollieApi {
  payments: {
    create(parameters: Record<string, unknown>): Promise<{ id: string; status: string; getCheckoutUrl(): string | null }>;
    get(id: string): Promise<{ id: string; status: string; getCheckoutUrl(): string | null }>;
  };
}

export const MOLLIE_FACTORY = 'MOLLIE_FACTORY';
export type MollieFactory = (apiKey: string) => MollieApi;

// The payment methods the shop offers; an unknown method from the client is ignored (Mollie then shows its own method list)
const METHODS = ['ideal', 'paypal', 'creditcard', 'bancontact', 'applepay', 'banktransfer'];

export class PaymentNotConfiguredError extends Error {}

// Mollie payments, in live mode or (for the test cards) test mode. The keys come from MOLLIE_API / MOLLIE_TEST_API.
@Injectable()
export class MollieService {
  private readonly logger = new Logger(MollieService.name);

  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    @Inject(MOLLIE_FACTORY) private readonly factory: MollieFactory,
  ) {}

  private client(test: boolean): MollieApi {
    const key = this.config.get(test ? 'MOLLIE_TEST_API' : 'MOLLIE_API', { infer: true });
    if (!key) throw new PaymentNotConfiguredError(test ? 'MOLLIE_TEST_API is not set' : 'MOLLIE_API is not set');
    return this.factory(key);
  }

  // Loyalty cards that pay in test mode (only when a test key is configured)
  isTestCard(card: unknown): boolean {
    return typeof card === 'string' && card !== '' && this.config.get('MOLLIE_TEST_CARDS', { infer: true }).includes(card) && !!this.config.get('MOLLIE_TEST_API', { infer: true });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentInfo> {
    const payment = await this.client(!!request.test).payments.create({
      amount: { value: request.amount.toFixed(2), currency: 'EUR' },
      description: request.description,
      redirectUrl: request.redirectUrl,
      webhookUrl: this.config.get('MOLLIE_WEBHOOK', { infer: true }),
      method: request.method && METHODS.includes(request.method) ? request.method : undefined,
    });
    return { id: payment.id, status: payment.status, checkoutUrl: payment.getCheckoutUrl() };
  }

  // The payment as Mollie knows it (live first, then test); null when neither mode knows the id. The webhook only trusts this
  // answer, never the body of the request.
  async getPayment(id: string): Promise<PaymentInfo | null> {
    for (const test of [false, true]) {
      try {
        const payment = await this.client(test).payments.get(id);
        return { id: payment.id, status: payment.status, checkoutUrl: payment.getCheckoutUrl() };
      } catch (error) {
        if (!(error instanceof PaymentNotConfiguredError)) this.logger.warn(`payment ${id} not found in ${test ? 'test' : 'live'} mode: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return null;
  }
}
