const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const fetchHtml = require('../routes/middleware/fetch_html');

const start = () => new Promise((resolve) => {
    const server = http.createServer((req, res) => {
        if (req.url === '/ok') return res.end('<html>hello</html>');
        res.statusCode = 404;
        res.end('nope');
    }).listen(0, () => resolve({ server, url: `http://localhost:${server.address().port}` }));
});

test('resolves with the body text on 200', async () => {
    const { server, url } = await start();
    try {
        assert.strictEqual(await fetchHtml(`${url}/ok`), '<html>hello</html>');
    } finally { server.close(); }
});

test('rejects on a non-2xx status', async () => {
    const { server, url } = await start();
    try {
        await assert.rejects(fetchHtml(`${url}/missing`), /404/);
    } finally { server.close(); }
});
