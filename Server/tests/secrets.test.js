const test = require('node:test');
const assert = require('node:assert');

const load = (env) => {
    const saved = { ORDER_CRYPT_KEY: process.env.ORDER_CRYPT_KEY, TOKEN_KEY: process.env.TOKEN_KEY };
    for (const key of Object.keys(saved)) delete process.env[key];
    Object.assign(process.env, env);
    delete require.cache[require.resolve('../routes/middleware/secrets')];
    const secrets = require('../routes/middleware/secrets');
    return { secrets, restore: () => { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } } };
};

test('cryptr uses ORDER_CRYPT_KEY and only decrypts with the same key', () => {
    const a = load({ ORDER_CRYPT_KEY: 'key-one' });
    const encrypted = a.secrets.cryptr.encrypt('order-1');
    assert.strictEqual(a.secrets.cryptr.decrypt(encrypted), 'order-1');
    const b = load({ ORDER_CRYPT_KEY: 'key-two' });
    assert.throws(() => b.secrets.cryptr.decrypt(encrypted));
    b.restore();
});

test('cryptr falls back to the legacy key so existing links keep working', () => {
    const legacy = load({ ORDER_CRYPT_KEY: 'myTotalySecretKey' });
    const encrypted = legacy.secrets.cryptr.encrypt('order-2');
    const fallback = load({});
    assert.strictEqual(fallback.secrets.cryptr.decrypt(encrypted), 'order-2');
    fallback.restore();
});

test('getJwtSecret returns TOKEN_KEY and throws when it is missing', () => {
    const withKey = load({ TOKEN_KEY: 'jwt-secret' });
    assert.strictEqual(withKey.secrets.getJwtSecret(), 'jwt-secret');
    const without = load({});
    delete process.env.TOKEN_KEY; // load() also reads the local .env
    assert.throws(() => without.secrets.getJwtSecret(), /TOKEN_KEY/);
    without.restore();
});
