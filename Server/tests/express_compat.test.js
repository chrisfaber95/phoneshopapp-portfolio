const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const expressCompat = require('../routes/middleware/express_compat');

const start = () => new Promise((resolve) => {
    const app = express();
    app.use(express.json());
    expressCompat(app);
    app.get('/query', (req, res) => {
        const customer_id = req.query.customer_id;
        delete req.query.customer_id;
        res.json({ customer_id, rest: req.query });
    });
    app.get('/body', (req, res) => res.json({ body: req.body }));
    const server = app.listen(0, () => resolve({ server, url: `http://localhost:${server.address().port}` }));
});

test('deleting a query key persists for the rest of the request', async () => {
    const { server, url } = await start();
    try {
        const res = await (await fetch(`${url}/query?customer_id=5&stock=1`)).json();
        assert.deepStrictEqual(res, { customer_id: '5', rest: { stock: '1' } });
    } finally { server.close(); }
});

test('nested query strings are parsed', async () => {
    const { server, url } = await start();
    try {
        const res = await (await fetch(`${url}/query?a[b]=2`)).json();
        assert.deepStrictEqual(res.rest, { a: { b: '2' } });
    } finally { server.close(); }
});

test('req.body defaults to an empty object when the request has no body', async () => {
    const { server, url } = await start();
    try {
        const res = await (await fetch(`${url}/body`)).json();
        assert.deepStrictEqual(res, { body: {} });
    } finally { server.close(); }
});
