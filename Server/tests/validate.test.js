const test = require('node:test');
const assert = require('node:assert');
const { isDigits } = require('../routes/middleware/validate');

test('isDigits accepts digit strings and numbers', () => {
    assert.ok(isDigits('8710000000001'));
    assert.ok(isDigits(42));
});

test('isDigits rejects path traversal, SQL and empty values', () => {
    for (const value of ['../../etc/passwd', '1 OR 1=1', '1;DROP TABLE x', '', undefined, null, '12.5', '-1']) {
        assert.ok(!isDigits(value), `should reject ${value}`);
    }
});
