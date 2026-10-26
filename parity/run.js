// Sends the same requests to two running servers and compares the responses.
//
//   node parity/run.js --old http://127.0.0.1:3101 --new http://127.0.0.1:3102
//
// Options
//   --spec <file>          extra requests (JSON array of { name, method, path, headers?, body?, mutation? })
//   --only <text>          only requests whose name contains <text>
//   --spec-only            only the requests of --spec, not the default GET of every endpoint without parameters
//   --timeout <ms>         per request, default 8000 (endpoints that never answer are reported as "timeout")
//   --include-mutations    also send POST/PUT/PATCH/DELETE requests from the spec file. Needs
//                          PARITY_CONFIRM_DISPOSABLE_DB=yes and a local *_test database (see safe-env.js)
//
// By default it sends a GET to every endpoint of parity/inventory.json that has no path parameters.
// Point --old and --new at the same server to check that a server answers deterministically.
// Differences are printed as JSON paths only; the full report (still without values) goes to parity/reports/.

const fs = require('node:fs');
const path = require('node:path');
const { compareResponses } = require('./compare');
const crypto = require('node:crypto');
const { assertDisposableDatabase, safeEnv } = require('./safe-env');

// Test accounts of parity/fixtures/auth.sql. Specs can use "{{token:employee}}" / "{{token:customer}}" in headers,
// which are replaced by a token signed with the parity environment's TOKEN_KEY.
const FIXTURE_IDS = { employee: 'aaaaaaaa-0000-4000-8000-000000000001', customer: 'bbbbbbbb-0000-4000-8000-000000000001' };
const b64url = (value) => Buffer.from(value).toString('base64url');
const signToken = (userId) => {
    const unsigned = `${b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ user_id: userId, email: null, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }))}`;
    return `${unsigned}.${crypto.createHmac('sha256', safeEnv().TOKEN_KEY).update(unsigned).digest('base64url')}`;
};
const withTokens = (headers = {}) =>
    Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, String(v).replace(/{{token:(employee|customer)}}/g, (_, who) => signToken(FIXTURE_IDS[who]))]));

const parseArgs = (argv) => {
    const args = { timeout: 8000 };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--include-mutations') args.includeMutations = true;
        else if (a === '--spec-only') args.specOnly = true;
        else if (a.startsWith('--')) args[a.slice(2)] = argv[++i];
    }
    if (args.timeout) args.timeout = Number(args.timeout);
    return args;
};

const defaultSpecs = () => {
    const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, 'inventory.json'), 'utf8'));
    return inventory
        .filter((e) => e.method === 'GET' && !e.path.includes(':'))
        .map((e) => ({ name: `GET ${e.path}`, method: 'GET', path: e.path }));
};

const RETRYABLE = ['ECONNREFUSED', 'ECONNRESET', 'UND_ERR_SOCKET'];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A server that crashed on the previous request is restarted by start-server.js: retry a few times
const send = async (base, spec, timeout) => {
    let result;
    for (let attempt = 0; attempt < 4; attempt++) {
        result = await sendOnce(base, spec, timeout);
        if (result.status !== 'error' || !RETRYABLE.includes(result.body)) return result;
        await sleep(1500);
    }
    return result;
};

const sendOnce = async (base, spec, timeout) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(base + spec.path, {
            method: spec.method,
            headers: { ...(spec.body ? { 'content-type': 'application/json' } : {}), ...withTokens(spec.headers) },
            body: spec.body ? JSON.stringify(spec.body) : undefined,
            signal: controller.signal,
        });
        return { status: res.status, contentType: res.headers.get('content-type') || '', body: await res.text() };
    } catch (err) {
        return err.name === 'AbortError' ? { status: 'timeout' } : { status: 'error', body: String(err.cause?.code || err.message) };
    } finally {
        clearTimeout(timer);
    }
};

const main = async () => {
    const args = parseArgs(process.argv.slice(2));
    if (!args.old || !args.new) {
        console.error('usage: node parity/run.js --old <url> --new <url> [--spec file] [--only text] [--timeout ms] [--include-mutations]');
        process.exit(2);
    }

    let specs = args.specOnly ? [] : defaultSpecs();
    if (args.spec) specs = specs.concat(JSON.parse(fs.readFileSync(args.spec, 'utf8')));
    if (args.only) specs = specs.filter((s) => s.name.includes(args.only));

    const mutating = specs.filter((s) => s.method !== 'GET' || s.mutation);
    if (mutating.length && !args.includeMutations) {
        console.log(`skipping ${mutating.length} mutating request(s) (use --include-mutations on a disposable database)`);
        specs = specs.filter((s) => !mutating.includes(s));
    } else if (mutating.length) {
        if (process.env.PARITY_CONFIRM_DISPOSABLE_DB !== 'yes') {
            console.error('mutating requests need PARITY_CONFIRM_DISPOSABLE_DB=yes (the database will be changed)');
            process.exit(2);
        }
        assertDisposableDatabase();
    }

    const results = [];
    for (const spec of specs) {
        const [oldRes, newRes] = await Promise.all([send(args.old, spec, args.timeout), send(args.new, spec, args.timeout)]);
        // `ignoreKeys`: keys the new server intentionally no longer sends (for example secrets). `knownDifference`: why the two
        // servers intentionally answer differently (reported as "known", not a failure).
        const ignore = (spec.ignoreKeys || []).map((key) => new RegExp(`^${key}$`));
        const { same, differences } = compareResponses(oldRes, newRes, { ignore });
        const known = !same && Boolean(spec.knownDifference);
        results.push({ name: spec.name, same, known, old: oldRes.status, new: newRes.status, differences });
        console.log(`${same ? 'same' : known ? 'known' : 'DIFF'}  ${String(oldRes.status).padEnd(7)} ${String(newRes.status).padEnd(7)} ${spec.name}`);
        if (known) console.log(`      intended: ${spec.knownDifference}`);
        else differences.slice(0, 5).forEach((d) => console.log(`      ${d}`));
    }

    const diffs = results.filter((r) => !r.same && !r.known).length;
    const knownCount = results.filter((r) => r.known).length;
    console.log(`\n${results.length} request(s): ${results.length - diffs - knownCount} same, ${knownCount} intended differences, ${diffs} different`);

    fs.mkdirSync(path.join(__dirname, 'reports'), { recursive: true });
    const file = path.join(__dirname, 'reports', `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify({ old: args.old, new: args.new, results }, null, 2));
    console.log(`report: ${path.relative(process.cwd(), file)}`);
    process.exit(diffs ? 1 : 0);
};

if (require.main === module) main();
module.exports = { parseArgs, defaultSpecs, send, signToken, withTokens };
