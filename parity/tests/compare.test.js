const test = require('node:test');
const assert = require('node:assert');
const { compareResponses } = require('../compare');

const json = (status, value) => ({ status, contentType: 'application/json; charset=utf-8', body: JSON.stringify(value) });

test('identical JSON responses are the same', () => {
    const res = compareResponses(json(200, { docs: [{ id: 1, name: 'a' }] }), json(200, { docs: [{ id: 1, name: 'a' }] }));
    assert.deepStrictEqual(res, { same: true, differences: [] });
});

test('key order does not matter', () => {
    assert.ok(compareResponses(json(200, { a: 1, b: 2 }), json(200, { b: 2, a: 1 })).same);
});

test('volatile fields (timestamps, tokens) are ignored', () => {
    const a = json(200, { id: 1, createdAt: '2026-01-01', accessToken: 'x' });
    const b = json(200, { id: 1, createdAt: '2026-09-30', accessToken: 'y' });
    assert.ok(compareResponses(a, b).same);
});

test('a different status is reported', () => {
    const res = compareResponses(json(200, {}), json(404, {}));
    assert.deepStrictEqual(res.differences, ['status: 200 != 404']);
});

test('a hanging endpoint on both sides compares equal, on one side it does not', () => {
    const timeout = { status: 'timeout' };
    assert.ok(compareResponses(timeout, { status: 'timeout' }).same);
    assert.ok(!compareResponses(timeout, json(200, {})).same);
});

test('differences name the JSON path and never contain the values', () => {
    const res = compareResponses(json(200, { docs: [{ name: 'Jan Jansen', phone: '0612345678' }] }), json(200, { docs: [{ name: 'Piet', phone: '0612345678', extra: 1 }] }));
    assert.deepStrictEqual(res.differences, ['.docs[0].extra: only in new', '.docs[0].name: value differs (string)']);
    assert.ok(!res.differences.join(' ').includes('Jan'));
});

test('missing keys, array length and type changes are reported', () => {
    const res = compareResponses(json(200, { a: [1, 2], b: 1, c: 'x' }), json(200, { a: [1], c: { y: 1 } }));
    assert.deepStrictEqual(res.differences.sort(), ['.a: array length 2 != 1', '.b: only in old', '.c: type string != object']);
});

test('the number 12.5 and the string "12.50" count as the same scalar', () => {
    assert.ok(compareResponses(json(200, { price: 12.5 }), json(200, { price: '12.50' })).same);
});

test('content type changes and non-JSON bodies are compared as text', () => {
    const a = { status: 200, contentType: 'text/html', body: '<p>a</p>' };
    const b = { status: 200, contentType: 'application/json', body: '{}' };
    assert.ok(compareResponses(a, b).differences[0].startsWith('content-type'));
    assert.ok(compareResponses(a, { ...a }).same);
    assert.ok(!compareResponses(a, { ...a, body: '<p>b</p>' }).same);
});

test('a caller can ignore keys: they are dropped, also when only one side has them', () => {
    const res = compareResponses(json(200, { id: 1, password: 'hash', nested: { password: 'h' } }), json(200, { id: 1, nested: {} }), { ignore: [/^password$/] });
    assert.ok(res.same);
    assert.ok(!compareResponses(json(200, { id: 1, password: 'hash' }), json(200, { id: 1 })).same);
});
