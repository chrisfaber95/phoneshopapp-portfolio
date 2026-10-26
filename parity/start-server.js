// Starts a server (the old Server, later the Nest server) with the safe test environment and waits until it answers.
//
//   node parity/start-server.js --dir Server --port 3101
//   node parity/start-server.js --dir ServerNest --port 3102 --cmd "npm run start"
//
// The environment comes from safe-env.js: test database container, dummy Mollie keys, dummy mail account.
// It restarts the server when it exits. Stop it with Ctrl+C.

const { spawn } = require('node:child_process');
const path = require('node:path');
const { safeEnv, assertDisposableDatabase } = require('./safe-env');

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const dir = path.resolve(__dirname, '..', args.dir || 'Server');
const port = args.port || '3101';
const command = args.cmd || 'node index.js';

assertDisposableDatabase();

// The old server exits on some requests (unhandled promise rejections), so it is restarted automatically.
let child;
let stopping = false;
const start = () => {
    child = spawn(command, { cwd: dir, shell: true, stdio: 'inherit', env: { ...process.env, ...safeEnv({ PORT: port }) } });
    child.on('exit', (code) => {
        if (stopping) process.exit(0);
        console.log(`[parity] server exited (code ${code}), restarting`);
        setTimeout(start, 500);
    });
};
process.on('SIGINT', () => { stopping = true; child.kill(); });
start();

(async () => {
    for (let attempt = 0; attempt < 60; attempt++) {
        try {
            await fetch(`http://127.0.0.1:${port}/`);
            console.log(`[parity] ${args.dir || 'Server'} is answering on http://127.0.0.1:${port}`);
            return;
        } catch { await new Promise((resolve) => setTimeout(resolve, 500)); }
    }
    console.error('[parity] server did not answer within 30 seconds');
})();
