const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const jwt = require('jsonwebtoken');
const rules = require('../routes/middleware/access_rules');
const { createAccess } = require('../routes/middleware/access');
const requestTimeout = require('../routes/middleware/request_timeout');

const SECRET = 'test-secret';
const employee = { user_id: 'u-1' };
const customer = { user_id: 'c-1' };

const sign = (payload, options) => jwt.sign(payload, SECRET, options);

// an app with the access middleware and a handler that answers 200 for everything
const start = async ({ ruleSet = rules.v1, mode, log = () => {} } = {}) => {
    const app = express();
    app.use(express.json());
    app.use(createAccess({
        rules: ruleSet,
        findUser: async (id) => (id === employee.user_id ? { id } : null),
        findCustomer: async (id) => (id === customer.user_id ? { id } : null),
        secret: () => SECRET,
        mode: mode && (() => mode),
        log,
    }));
    app.use((req, res) => res.json({ ok: true, principal: req.principal || null }));
    const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
    const call = async (method, url, { token, body } = {}) => {
        const res = await fetch(`http://localhost:${server.address().port}${url}`, {
            method,
            headers: { ...(token ? { authorization: token } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
            body: body ? JSON.stringify(body) : undefined,
        });
        return { status: res.status, body: await res.json() };
    };
    return { call, close: () => server.close() };
};

// ---- the rule table --------------------------------------------------------------------------------------------

const access = (method, url) => rules.classify(rules.v1, method, url);

test('shop front, accounts, guest checkout and e-mail links are public', () => {
    for (const [method, url] of [
        ['GET', '/'], ['GET', '/product'], ['GET', '/product/search'], ['GET', '/product/abc'], ['GET', '/departments'],
        ['GET', '/discounts'], ['GET', '/spaaractie'], ['GET', '/order/count/2026-09-30'],
        ['POST', '/customer/login'], ['POST', '/customer/passwordreset'], ['POST', '/customer'], ['POST', '/user/login'],
        ['POST', '/order'], ['PUT', '/order/abc'], ['POST', '/actie_order'], ['GET', '/order/single/abc'], ['GET', '/order/receipt/abc'],
        ['GET', '/shoppinglist/abc'], ['POST', '/site/cookies'], ['POST', '/feedback'], ['POST', '/mollie/webhook'],
    ]) assert.strictEqual(access(method, url), 'public', `${method} ${url}`);
});

test("a customer's own data needs a token or the customer id", () => {
    for (const [method, url] of [
        ['GET', '/customer'], ['PUT', '/customer'], ['GET', '/customer_favorites'], ['POST', '/customer_favorites'], ['DELETE', '/customer_favorites'],
        ['GET', '/customer_spaaractie'], ['GET', '/customer_spaaractie/abc'], ['PUT', '/customer_spaaractie'], ['GET', '/order_information'],
        ['DELETE', '/order_information'], ['GET', '/order'],
    ]) assert.strictEqual(access(method, url), 'owner', `${method} ${url}`);
});

test('admin endpoints need an employee token, and unknown endpoints are denied by default', () => {
    for (const [method, url] of [
        ['POST', '/product/post'], ['PUT', '/product'], ['DELETE', '/product/delete/abc'], ['POST', '/product/scanner'], ['POST', '/product/update_images'],
        ['POST', '/departments/post'], ['PUT', '/departments/update/abc'], ['DELETE', '/order/abc'], ['GET', '/order/2026-09-30'], ['DELETE', '/customer'],
        ['POST', '/customer/register'], ['POST', '/user/register'], ['GET', '/user/single/abc'], ['POST', '/daytotals'], ['GET', '/daytotals'],
        ['POST', '/discounts/images'], ['POST', '/info/post'], ['GET', '/userroles'], ['GET', '/settings/language'], ['POST', '/shoppinglist'],
        ['GET', '/shoppinglist'], ['PUT', '/spaaractie'], ['GET', '/customer_spaaractie/reminder'], ['GET', '/something/new'],
    ]) assert.strictEqual(access(method, url), 'user', `${method} ${url}`);
});

test('store site: public information, employee-only applications and shop edits', () => {
    const store = (method, url) => rules.classify(rules.v2, method, url);
    for (const url of ['/shops', '/terms', '/job_offer', '/timeslot', '/delivery_location']) assert.strictEqual(store('GET', url), 'public', url);
    assert.strictEqual(store('GET', '/job_application'), 'user');
    assert.strictEqual(store('PUT', '/shops'), 'user');
    assert.strictEqual(store('POST', '/unknown'), 'user');
});

// Every endpoint of the old server (parity/inventory.json) is classified, and nothing that changes data
// without being used by the Klant client is public
const inventoryFile = path.join(__dirname, '..', '..', 'parity', 'inventory.json');
test('no admin endpoint in the inventory is public', { skip: !fs.existsSync(inventoryFile) && 'parity/inventory.json not found' }, () => {
    const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
    const toUrl = (p) => p.replace(/^\/api\/v[12]/, '').replace(/:[A-Za-z]+/g, 'abc') || '/';
    const exposed = inventory
        .filter((e) => e.path.startsWith('/api/v1') && e.method !== 'GET' && !e.usedByKlant)
        .filter((e) => access(e.method, toUrl(e.path)) === 'public')
        .map((e) => `${e.method} ${e.path}`);
    // the only public mutations that Klant does not call: Mollie's webhook and the employee login
    assert.deepStrictEqual(exposed.sort(), ['POST /api/v1/mollie/webhook', 'POST /api/v1/user/login']);
});

// ---- the middleware -------------------------------------------------------------------------------------------

test('public endpoints need no token; a missing or invalid token is treated as logged out', async () => {
    const { call, close } = await start();
    try {
        assert.strictEqual((await call('GET', '/product')).status, 200);
        assert.strictEqual((await call('GET', '/product', { token: 'null' })).status, 200);
    } finally { close(); }
});

test('employee endpoints: no token 401, customer token 403, employee token 200', async () => {
    const { call, close } = await start();
    try {
        assert.strictEqual((await call('DELETE', '/product/delete/1')).status, 401);
        assert.strictEqual((await call('DELETE', '/product/delete/1', { token: sign(customer) })).status, 403);
        const ok = await call('DELETE', '/product/delete/1', { token: sign(employee) });
        assert.strictEqual(ok.status, 200);
        assert.deepStrictEqual(ok.body.principal, { type: 'user', id: 'u-1' });
    } finally { close(); }
});

test('bad tokens are rejected: wrong key, expired, unknown user, Bearer prefix accepted', async () => {
    const { call, close } = await start();
    try {
        assert.strictEqual((await call('GET', '/userroles', { token: jwt.sign(employee, 'other-key') })).status, 401);
        assert.strictEqual((await call('GET', '/userroles', { token: sign(employee, { expiresIn: -10 }) })).status, 401);
        assert.strictEqual((await call('GET', '/userroles', { token: sign({ user_id: 'nobody' }) })).status, 401);
        assert.strictEqual((await call('GET', '/userroles', { token: `Bearer ${sign(employee)}` })).status, 200);
    } finally { close(); }
});

test('customer data: a token or the customer id is enough, nothing at all is not', async () => {
    const { call, close } = await start();
    try {
        assert.strictEqual((await call('GET', '/order_information')).status, 401);
        assert.strictEqual((await call('GET', '/order_information?customer_id=abc')).status, 200);
        assert.strictEqual((await call('GET', '/order_information?customer_id=')).status, 401);
        assert.strictEqual((await call('DELETE', '/order_information', { body: { customer_id: 'abc' } })).status, 200);
        assert.strictEqual((await call('GET', '/order_information', { token: sign(customer) })).status, 200);
        assert.strictEqual((await call('GET', '/order_information', { token: sign(employee) })).status, 200);
    } finally { close(); }
});

test('CORS preflight requests are never blocked', async () => {
    const { call, close } = await start();
    try {
        assert.strictEqual((await call('OPTIONS', '/order_information')).status, 200);
    } finally { close(); }
});

test('log mode lets everything through but logs what would be denied', async () => {
    const lines = [];
    const { call, close } = await start({ mode: 'log', log: (line) => lines.push(line) });
    try {
        assert.strictEqual((await call('DELETE', '/product/delete/1')).status, 200);
        assert.strictEqual(lines.length, 1);
        assert.match(lines[0], /would be denied: DELETE \/product\/delete\/1 \(user\)/);
    } finally { close(); }
});

// ---- request timeout -------------------------------------------------------------------------------------------

test('a handler that never answers gets a 503; a fast one is not affected', async () => {
    const app = express();
    app.use(requestTimeout(50));
    app.get('/hang', () => {});
    app.get('/fast', (req, res) => res.json({ ok: true }));
    const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
    try {
        const base = `http://localhost:${server.address().port}`;
        assert.strictEqual((await fetch(`${base}/hang`)).status, 503);
        assert.strictEqual((await fetch(`${base}/fast`)).status, 200);
    } finally { server.close(); }
});
