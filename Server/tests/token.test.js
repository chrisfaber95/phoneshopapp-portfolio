const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.TOKEN_KEY = 'test-token-key';

const auth = require('../config/authentication');
const customerAuth = require('../config/customer_authentication');

const fakeUser = (fields) => {
    const user = { email: 'jan@example.nl', ...fields, saved: 0 };
    user.save = async () => { user.saved += 1; };
    return user;
};

test('user token carries user_id and email, is stored on the user and saved', async () => {
    const user = fakeUser({ user_id: 7 });
    const token = await auth.sign_token(user);
    const payload = jwt.verify(token, 'test-token-key');
    assert.strictEqual(payload.user_id, 7);
    assert.strictEqual(payload.email, 'jan@example.nl');
    assert.strictEqual(user.accessToken, token);
    assert.strictEqual(user.saved, 1);
});

test('customer token puts customer_id in the user_id claim', async () => {
    const user = fakeUser({ customer_id: 42, user_id: 1 });
    const payload = jwt.verify(await customerAuth.sign_token(user), 'test-token-key');
    assert.strictEqual(payload.user_id, 42);
});

test('default lifetime is 20 hours and a custom duration is honoured', async () => {
    const hours = async (promise) => { const p = jwt.decode(await promise); return (p.exp - p.iat) / 3600; };
    assert.strictEqual(await hours(auth.sign_token(fakeUser({ user_id: 1 }))), 20);
    assert.strictEqual(await hours(auth.sign_token(fakeUser({ user_id: 1 }), '1h')), 1);
});

test('a token signed with another key does not verify', async () => {
    const token = await auth.sign_token(fakeUser({ user_id: 1 }));
    assert.throws(() => jwt.verify(token, 'other-key'));
});
