// Checks the environment at start-up, so a missing variable fails immediately and clearly instead of at the first request.
// The variable names are the same as in the old Server (see .env.example).

import { DEFAULT_MAIL_HOST, DEFAULT_MAIL_PORT } from '../mail/mail.defaults';

export interface AppEnv {
  PORT: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  TOKEN_KEY: string;
  ORDER_CRYPT_KEY?: string;
  // 'log' only logs the requests the access rules would deny (for trying the rules on live traffic)
  ACCESS_MODE: 'enforce' | 'log';
  // SMTP server of the shop (defaults: the server the old Server used); the account is optional so the app starts without mail
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER?: string;
  MAIL_PASS?: string;
  // where the feedback form is mailed to (default: the shop mailbox, MAIL_USER)
  FEEDBACK_EMAIL?: string;
  // the store-site database (/api/v2): the same server and account as the shop database, the old Server's fixed name by default
  SHOPS_DB_NAME: string;
  // 'off' switches the rate limits off (they are on by default, see common/rate-limit.ts)
  RATE_LIMIT: 'on' | 'off';
  // behind a reverse proxy: how many proxies to trust for the client address (a number, 'true' or a subnet name); unset = none
  TRUST_PROXY?: string;
  // the origins that may call the API from a browser (the shop front, the admin app); '*' (every origin) when unset, as the old Server
  CORS_ORIGINS: string[] | '*';
  // the folder of the product and discount images (default: ./public next to where the server is started, see common/images.ts)
  IMAGES_DIR?: string;
  // the shop (in the store database) whose details are printed on receipts; the old Server had its id hardcoded. Default: the first shop.
  RECEIPT_SHOP_ID?: string;
  // where the shop's note about a savings action order goes (default: FEEDBACK_EMAIL, then the shop mailbox)
  ACTIE_ORDER_EMAIL?: string;
  // Mollie: the live key, an optional test key, and the URL Mollie calls when a payment changes
  MOLLIE_API?: string;
  MOLLIE_TEST_API?: string;
  MOLLIE_WEBHOOK?: string;
  // the loyalty card numbers whose orders are paid with the Mollie test key (the old Server had two numbers hardcoded)
  MOLLIE_TEST_CARDS: string[];
  // where Mollie sends the customer back to (default: the Origin of the request)
  BASE_URL?: string;
  // the amount paid online when the order is placed (what the Klant client showed as hardcoded prices)
  PICKUP_FEE: number;
  DELIVERY_FEE: number;
}

// the text of an optional variable, or undefined when it is missing or empty
const optionalText = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined);

// a price in euros, or the default when the variable is missing or not a positive number
const fee = (value: unknown, fallback: number): number => (Number(value) > 0 ? Number(value) : fallback);

// a comma separated list of origins, or '*' when the variable is missing or says '*'
const origins = (value: unknown): string[] | '*' => {
  const list = (optionalText(value) ?? '*').split(',').map((origin) => origin.trim()).filter((origin) => origin !== '');
  return list.length === 0 || list.includes('*') ? '*' : list;
};

const REQUIRED = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'TOKEN_KEY'] as const;

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const missing = REQUIRED.filter((key) => typeof config[key] !== 'string' || config[key] === '');
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')} (see .env.example)`);
  }

  const port = config.PORT === undefined || config.PORT === '' ? 3001 : Number(config.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a number between 1 and 65535, got "${String(config.PORT)}"`);
  }

  const orderKey = config.ORDER_CRYPT_KEY;
  return {
    PORT: port,
    DB_HOST: config.DB_HOST as string,
    DB_USER: config.DB_USER as string,
    DB_PASS: config.DB_PASS as string,
    DB_NAME: config.DB_NAME as string,
    TOKEN_KEY: config.TOKEN_KEY as string,
    ORDER_CRYPT_KEY: typeof orderKey === 'string' && orderKey !== '' ? orderKey : undefined,
    ACCESS_MODE: config.ACCESS_MODE === 'log' ? 'log' : 'enforce',
    MAIL_HOST: optionalText(config.MAIL_HOST) ?? DEFAULT_MAIL_HOST,
    MAIL_PORT: Number(config.MAIL_PORT) > 0 ? Number(config.MAIL_PORT) : DEFAULT_MAIL_PORT,
    MAIL_USER: optionalText(config.MAIL_USER),
    MAIL_PASS: optionalText(config.MAIL_PASS),
    FEEDBACK_EMAIL: optionalText(config.FEEDBACK_EMAIL),
    SHOPS_DB_NAME: optionalText(config.SHOPS_DB_NAME) ?? 'shops',
    RATE_LIMIT: config.RATE_LIMIT === 'off' ? 'off' : 'on',
    TRUST_PROXY: optionalText(config.TRUST_PROXY),
    CORS_ORIGINS: origins(config.CORS_ORIGINS),
    IMAGES_DIR: optionalText(config.IMAGES_DIR),
    RECEIPT_SHOP_ID: optionalText(config.RECEIPT_SHOP_ID),
    ACTIE_ORDER_EMAIL: optionalText(config.ACTIE_ORDER_EMAIL),
    MOLLIE_API: optionalText(config.MOLLIE_API),
    MOLLIE_TEST_API: optionalText(config.MOLLIE_TEST_API),
    MOLLIE_WEBHOOK: optionalText(config.MOLLIE_WEBHOOK),
    MOLLIE_TEST_CARDS: (optionalText(config.MOLLIE_TEST_CARDS) ?? '')
      .split(',')
      .map((card) => card.trim())
      .filter((card) => card !== ''),
    BASE_URL: optionalText(config.BASE_URL),
    PICKUP_FEE: fee(config.PICKUP_FEE, 2),
    DELIVERY_FEE: fee(config.DELIVERY_FEE, 3),
  };
}
