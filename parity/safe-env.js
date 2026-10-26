// Environment for running the old Server (or the new one) in parity tests.
//
// dotenv never overrides variables that are already set, so setting every variable the servers read
// keeps the real values in Server/.env (live database, live Mollie key, real mail account) out of the
// process. The database points at the disposable test container from docker-compose.yml.
//
// Anything you want to change (ports, database host) is done with PARITY_* variables, not by editing .env.

const testDatabase = {
    DB_HOST: process.env.PARITY_DB_HOST || '127.0.0.1',
    DB_USER: process.env.PARITY_DB_USER || 'root',
    DB_PASS: process.env.PARITY_DB_PASS || 'password', // the test container's password from docker-compose.yml
    DB_NAME: process.env.PARITY_DB_NAME || 'cooplubbers_test',
};

// Refuse to run against anything that does not look like a disposable local test database.
const assertDisposableDatabase = (env = testDatabase) => {
    const local = ['127.0.0.1', 'localhost', '::1'].includes(env.DB_HOST);
    const testName = /_test$/.test(env.DB_NAME);
    if (!local || !testName) {
        throw new Error(`Refusing to run: DB_HOST=${env.DB_HOST} DB_NAME=${env.DB_NAME} is not a local *_test database`);
    }
};

const safeEnv = (extra = {}) => ({
    ...testDatabase,
    // Payments and mail must never reach the real services: dummy keys make those calls fail harmlessly.
    MOLLIE_API: 'test_dummy_dummy_dummy_dummy_dummy_dummy',
    MOLLIE_TEST_API: 'test_dummy_dummy_dummy_dummy_dummy_dummy',
    MOLLIE_WEBHOOK: 'http://127.0.0.1:9/mollie-webhook',
    MOLLIE_ACTIE_WEBHOOK: 'http://127.0.0.1:9/mollie-actie-webhook',
    MAIL_USER: 'parity@example.invalid',
    MAIL_PASS: 'not-a-real-password',
    MOLLIE_DESCRIPTION: 'parity test',
    BASE_URL: 'http://127.0.0.1:8080/',
    TOKEN_KEY: 'parity-test-token-key',
    ORDER_CRYPT_KEY: 'parity-test-order-key',
    RATE_LIMIT: 'off', // the harness sends many logins from one address
    ...extra,
});

module.exports = { safeEnv, assertDisposableDatabase, testDatabase };
