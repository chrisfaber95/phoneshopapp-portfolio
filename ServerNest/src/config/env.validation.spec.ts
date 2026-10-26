import { DEFAULT_MAIL_HOST, DEFAULT_MAIL_PORT } from '../mail/mail.defaults';
import { validateEnv } from './env.validation';

const valid = { DB_HOST: 'localhost', DB_USER: 'root', DB_PASS: 'pw', DB_NAME: 'shop_test', TOKEN_KEY: 'key' };

describe('validateEnv', () => {
  it('accepts the required variables and defaults PORT to 3001', () => {
    expect(validateEnv(valid)).toEqual({ ...valid, PORT: 3001, ORDER_CRYPT_KEY: undefined, ACCESS_MODE: 'enforce', MAIL_HOST: DEFAULT_MAIL_HOST, MAIL_PORT: DEFAULT_MAIL_PORT, MAIL_USER: undefined, MAIL_PASS: undefined, FEEDBACK_EMAIL: undefined, SHOPS_DB_NAME: 'shops', RATE_LIMIT: 'on', TRUST_PROXY: undefined, CORS_ORIGINS: '*', IMAGES_DIR: undefined, RECEIPT_SHOP_ID: undefined, ACTIE_ORDER_EMAIL: undefined, MOLLIE_API: undefined, MOLLIE_TEST_API: undefined, MOLLIE_WEBHOOK: undefined, MOLLIE_TEST_CARDS: [], BASE_URL: undefined, PICKUP_FEE: 2, DELIVERY_FEE: 3 });
  });

  it('reads PORT and ORDER_CRYPT_KEY when given', () => {
    const env = validateEnv({ ...valid, PORT: '4000', ORDER_CRYPT_KEY: 'order-key' });
    expect(env.PORT).toBe(4000);
    expect(env.ORDER_CRYPT_KEY).toBe('order-key');
  });

  it('reads ACCESS_MODE: log, anything else enforces', () => {
    expect(validateEnv({ ...valid, ACCESS_MODE: 'log' }).ACCESS_MODE).toBe('log');
    expect(validateEnv({ ...valid, ACCESS_MODE: 'nonsense' }).ACCESS_MODE).toBe('enforce');
  });

  it('reads the mail settings and defaults to the SMTP host of the old Server', () => {
    const mail = validateEnv({ ...valid, MAIL_HOST: 'mail.test', MAIL_PORT: '2525', MAIL_USER: 'the-user', MAIL_PASS: 'the-secret' });
    expect([mail.MAIL_HOST, mail.MAIL_PORT, mail.MAIL_USER, mail.MAIL_PASS]).toEqual(['mail.test', 2525, 'the-user', 'the-secret']);
    expect(validateEnv({ ...valid, MAIL_PORT: 'abc' }).MAIL_PORT).toBe(DEFAULT_MAIL_PORT);
  });

  it('reads the payment settings, the test cards as a list and the fees as positive numbers', () => {
    const env = validateEnv({ ...valid, MOLLIE_TEST_CARDS: ' 111, 222 ,,', PICKUP_FEE: '2.5', DELIVERY_FEE: 'abc', BASE_URL: 'https://shop.test' });
    expect([env.MOLLIE_TEST_CARDS, env.PICKUP_FEE, env.DELIVERY_FEE, env.BASE_URL]).toEqual([['111', '222'], 2.5, 3, 'https://shop.test']);
  });

  it('reads the images folder, and leaves it unset when empty', () => {
    expect(validateEnv({ ...valid, IMAGES_DIR: '../Server/public' }).IMAGES_DIR).toBe('../Server/public');
    expect(validateEnv({ ...valid, IMAGES_DIR: '' }).IMAGES_DIR).toBeUndefined();
  });

  it('reads the rate limit switch, the proxy setting and the CORS origins', () => {
    const env = validateEnv({ ...valid, RATE_LIMIT: 'off', TRUST_PROXY: '1', CORS_ORIGINS: ' https://a.test , https://b.test ' });
    expect([env.RATE_LIMIT, env.TRUST_PROXY, env.CORS_ORIGINS]).toEqual(['off', '1', ['https://a.test', 'https://b.test']]);
    expect(validateEnv({ ...valid, RATE_LIMIT: 'nonsense' }).RATE_LIMIT).toBe('on');
    expect(validateEnv({ ...valid, CORS_ORIGINS: 'https://a.test,*' }).CORS_ORIGINS).toBe('*');
  });

  it('names every missing variable', () => {
    expect(() => validateEnv({ DB_HOST: 'localhost' })).toThrow('Missing environment variables: DB_USER, DB_PASS, DB_NAME, TOKEN_KEY');
  });

  it('treats an empty string as missing', () => {
    expect(() => validateEnv({ ...valid, TOKEN_KEY: '' })).toThrow('TOKEN_KEY');
  });

  it.each(['abc', '0', '70000', '3.5'])('rejects the invalid PORT %s', (port) => {
    expect(() => validateEnv({ ...valid, PORT: port })).toThrow('PORT must be a number');
  });
});
