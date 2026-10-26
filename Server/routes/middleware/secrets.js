// Central place for the secrets the routes need, read from the environment (.env).
// index.js loads dotenv after the routes are required, so load it here as well (idempotent).
require('dotenv').config({ quiet: true });
const Cryptr = require('cryptr');

// Key for the encrypted order ids in e-mail links. The fallback is the value that used to be hardcoded, so
// existing links keep working: set ORDER_CRYPT_KEY to it first, rotate later (rotating invalidates old links).
const LEGACY_ORDER_CRYPT_KEY = 'myTotalySecretKey';

if (!process.env.ORDER_CRYPT_KEY) {
    console.warn('ORDER_CRYPT_KEY is not set, falling back to the legacy built-in key');
}

const cryptr = new Cryptr(process.env.ORDER_CRYPT_KEY || LEGACY_ORDER_CRYPT_KEY);

// Secret for signing/verifying JWTs (the auth middleware verifies with the same TOKEN_KEY).
const getJwtSecret = () => {
    if (!process.env.TOKEN_KEY) throw new Error('TOKEN_KEY is not set');
    return process.env.TOKEN_KEY;
};

module.exports = { cryptr, getJwtSecret };
