import { ConfigService } from '@nestjs/config';
import { MollieApi, MollieService } from './mollie.service';

const settings: Record<string, unknown> = { MOLLIE_API: 'live-key', MOLLIE_TEST_API: 'test-key', MOLLIE_WEBHOOK: 'https://api.test/mollie/webhook', MOLLIE_TEST_CARDS: ['999'] };
const config = (over: Record<string, unknown> = {}) => ({ get: (key: string) => ({ ...settings, ...over })[key] }) as unknown as ConfigService<never, true>;

const payment = (id: string, status = 'open') => ({ id, status, getCheckoutUrl: () => `https://pay.test/${id}` });
const fakeApi = (create = jest.fn(), get = jest.fn()): MollieApi => ({ payments: { create, get } });

describe('MollieService', () => {
  it('creates a payment in euros with the webhook and a known method', async () => {
    const create = jest.fn().mockResolvedValue(payment('tr_1'));
    const keys: string[] = [];
    const service = new MollieService(config(), (key) => (keys.push(key), fakeApi(create)));
    const result = await service.createPayment({ amount: 2, description: 'x', redirectUrl: 'https://shop.test?return=payment', method: 'ideal' });
    expect(result).toEqual({ id: 'tr_1', status: 'open', checkoutUrl: 'https://pay.test/tr_1' });
    expect(create).toHaveBeenCalledWith({ amount: { value: '2.00', currency: 'EUR' }, description: 'x', redirectUrl: 'https://shop.test?return=payment', webhookUrl: 'https://api.test/mollie/webhook', method: 'ideal' });
    expect(keys).toEqual(['live-key']);
  });

  it('ignores a payment method that is not offered and uses the test key on request', async () => {
    const create = jest.fn().mockResolvedValue(payment('tr_2'));
    const keys: string[] = [];
    const service = new MollieService(config(), (key) => (keys.push(key), fakeApi(create)));
    await service.createPayment({ amount: 3.5, description: 'x', redirectUrl: 'u', method: 'cash', test: true });
    expect(create.mock.calls[0][0]).toMatchObject({ amount: { value: '3.50' }, method: undefined });
    expect(keys).toEqual(['test-key']);
  });

  it('fails clearly when the key is not configured', async () => {
    const service = new MollieService(config({ MOLLIE_API: undefined }), () => fakeApi());
    await expect(service.createPayment({ amount: 2, description: 'x', redirectUrl: 'u' })).rejects.toThrow('MOLLIE_API is not set');
  });

  it('test cards only count when a test key is set', () => {
    expect(new MollieService(config(), () => fakeApi()).isTestCard('999')).toBe(true);
    expect(new MollieService(config(), () => fakeApi()).isTestCard('123')).toBe(false);
    expect(new MollieService(config(), () => fakeApi()).isTestCard(null)).toBe(false);
    expect(new MollieService(config({ MOLLIE_TEST_API: undefined }), () => fakeApi()).isTestCard('999')).toBe(false);
  });

  it('looks a payment up in live mode first, then in test mode, and answers null when neither knows it', async () => {
    const live = jest.fn().mockRejectedValue(new Error('not found'));
    const test = jest.fn().mockResolvedValue(payment('tr_3', 'paid'));
    const service = new MollieService(config(), (key) => fakeApi(jest.fn(), key === 'live-key' ? live : test));
    await expect(service.getPayment('tr_3')).resolves.toEqual({ id: 'tr_3', status: 'paid', checkoutUrl: 'https://pay.test/tr_3' });
    test.mockRejectedValue(new Error('not found'));
    await expect(service.getPayment('tr_4')).resolves.toBeNull();
  });
});
