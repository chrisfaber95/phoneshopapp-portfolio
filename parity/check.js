// One command for a parity check of one or more modules:
//   node parity/check.js --spec reference-data,auth [--fixtures auth.sql] [--no-build]
//
// It builds ServerNest, loads the fixtures into the disposable test database, starts the old Server (port 3101) and the new
// ServerNest (port 3102) with the safe environment, runs run.js for every spec (mutating requests included), stops both
// servers and removes the fixtures again. Exit code 1 when any response differs.
//
// Spec names are files in parity/specs/ without .json. Fixtures are files in parity/fixtures/; `<name>.sql` is removed
// with `<name>-cleanup.sql` when that file exists. The default fixtures are auth.sql (the test accounts used for tokens).

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { safeEnv, assertDisposableDatabase } = require('./safe-env');

const root = path.resolve(__dirname, '..');
const args = { spec: '', fixtures: 'auth.sql' };
for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === '--no-build') args.noBuild = true;
    else if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
const specs = args.spec.split(',').filter(Boolean);
const fixtures = args.fixtures.split(',').filter(Boolean);
if (specs.length === 0) { console.error('usage: node parity/check.js --spec <name>[,<name>] [--fixtures auth.sql[,other.sql]] [--no-build]'); process.exit(2); }

assertDisposableDatabase();

const engine = () => {
    for (const cmd of ['podman', 'docker']) if (spawnSync(cmd, ['--version'], { shell: true }).status === 0) return cmd;
    const fallback = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Podman', 'podman.exe');
    if (fs.existsSync(fallback)) return `"${fallback}"`;
    throw new Error('Neither podman nor docker was found');
};

const loadFixture = (file) => {
    const sql = fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8');
    const res = spawnSync(`${engine()} exec -i cooplubbers_mysql mysql -uroot -ppassword cooplubbers_test`, { shell: true, input: sql, encoding: 'utf8' });
    const errors = `${res.stderr || ''}`.split('\n').filter((l) => l.trim() && !/Using a password/.test(l));
    if (res.status !== 0) throw new Error(`loading ${file} failed: ${errors.join(' ')}`);
};
const cleanupOf = (file) => (fs.existsSync(path.join(__dirname, 'fixtures', file.replace(/\.sql$/, '-cleanup.sql'))) ? file.replace(/\.sql$/, '-cleanup.sql') : null);

const killTree = (child) => { if (child && child.pid) spawnSync(`taskkill /PID ${child.pid} /T /F`, { shell: true, stdio: 'ignore' }); };
const launch = (dir, port, cmd, label) => {
    const child = spawn('node', [path.join(__dirname, 'start-server.js'), '--dir', dir, '--port', String(port), ...(cmd ? ['--cmd', cmd] : [])], { cwd: root, stdio: 'ignore', env: { ...process.env, ...safeEnv() } });
    child.label = label;
    return child;
};
const waitFor = async (port) => {
    for (let i = 0; i < 60; i++) {
        try { await fetch(`http://127.0.0.1:${port}/`); return; } catch { await new Promise((r) => setTimeout(r, 500)); }
    }
    throw new Error(`nothing answers on port ${port}`);
};

(async () => {
    const children = [];
    let exitCode = 0;
    try {
        if (!args.noBuild) {
            console.log('building ServerNest ...');
            const build = spawnSync('npm run -s build', { cwd: path.join(root, 'ServerNest'), shell: true, stdio: 'inherit' });
            if (build.status !== 0) throw new Error('build failed');
        }
        fixtures.forEach((f) => { console.log(`loading fixture ${f}`); loadFixture(f); });
        children.push(launch('Server', 3101, null, 'old'), launch('ServerNest', 3102, 'node dist/main', 'new'));
        await Promise.all([waitFor(3101), waitFor(3102)]);

        for (const spec of specs) {
            console.log(`\n=== spec ${spec}`);
            const run = spawnSync('node', [path.join(__dirname, 'run.js'), '--old', 'http://127.0.0.1:3101', '--new', 'http://127.0.0.1:3102', '--spec', path.join(__dirname, 'specs', `${spec}.json`), '--spec-only', '--include-mutations', '--timeout', '20000'], {
                cwd: root, stdio: 'inherit', env: { ...process.env, PARITY_CONFIRM_DISPOSABLE_DB: 'yes' },
            });
            if (run.status !== 0) exitCode = 1;
        }
    } catch (err) {
        console.error(`check failed: ${err.message}`);
        exitCode = 2;
    } finally {
        children.forEach(killTree);
        // the launcher's child survives a forced kill of the launcher when it is not part of the tree: free the ports too
        spawnSync('powershell.exe -NoProfile -Command "foreach($p in 3101,3102){ Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"', { shell: true, stdio: 'ignore' });
        // removed in reverse order: later fixtures reference earlier ones
        fixtures.slice().reverse().map(cleanupOf).filter(Boolean).forEach((f) => { try { loadFixture(f); console.log(`removed fixture (${f})`); } catch (e) { console.error(e.message); } });
    }
    process.exit(exitCode);
})();
