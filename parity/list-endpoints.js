// Lists every HTTP endpoint of the old Server, exactly as Express registers them, and marks the ones the
// Klant client calls. Run:  node parity/list-endpoints.js        (prints a summary)
//                           node parity/list-endpoints.js --write (writes parity/inventory.json)
//
// It records the router calls while the route files load. Nothing is started and no database is contacted.

const fs = require('node:fs');
const path = require('node:path');
const { safeEnv } = require('./safe-env');

const repoDir = path.resolve(__dirname, '..');
const serverDir = path.join(repoDir, 'Server');
const METHODS = ['get', 'post', 'put', 'delete', 'patch', 'all', 'options', 'head'];

const isRouter = (fn) => typeof fn === 'function' && Array.isArray(fn.stack);
const join = (...parts) => ('/' + parts.join('/')).replace(/\/+/g, '/').replace(/(.)\/$/, '$1');

// The auth middleware of the old server, by function, so every endpoint can be labelled with its guard
const loadGuards = () => [
    ['user', require(path.join(serverDir, 'routes', 'middleware', 'auth'))],
    ['customer', require(path.join(serverDir, 'routes', 'middleware', 'customer_auth'))],
    ['store', require(path.join(serverDir, 'store_routes', 'middleware', 'auth'))],
];
const guardOf = (guards, fns) => (guards.find(([, fn]) => fns.includes(fn)) || [null])[0];

// What the route files register, recorded per router
const recordRouters = (express, guards) => {
    const routers = new Map();
    const of = (router) => {
        if (!routers.has(router)) routers.set(router, { mounts: [], endpoints: [], guard: null });
        return routers.get(router);
    };
    // Express 5: Router() returns a function whose prototype is an instance; the methods live one level higher
    const proto = Object.getPrototypeOf(Object.getPrototypeOf(express.Router()));

    const use = proto.use;
    proto.use = function (...args) {
        const mountPath = typeof args[0] === 'string' ? args[0] : '/';
        const fns = args.flat().filter((a) => typeof a === 'function');
        fns.filter(isRouter).forEach((child) => of(this).mounts.push({ path: mountPath, child, guard: guardOf(guards, fns) }));
        const routerGuard = guardOf(guards, fns.filter((fn) => !isRouter(fn)));
        if (routerGuard && fns.every((fn) => !isRouter(fn))) of(this).guard = routerGuard; // router.use(auth): applies to routes added after it
        return use.apply(this, args);
    };
    for (const method of METHODS) {
        const original = proto[method];
        proto[method] = function (routePath, ...rest) {
            const guard = guardOf(guards, rest.flat()) || of(this).guard;
            of(this).endpoints.push({ method: method.toUpperCase(), path: String(routePath), guard });
            return original.call(this, routePath, ...rest);
        };
    }
    return of;
};

const walk = (of, router, prefix, out, inherited = null) => {
    const { mounts, endpoints } = of(router);
    endpoints.forEach((e) => out.push({ method: e.method, path: join(prefix, e.path), guard: e.guard || inherited }));
    mounts.forEach((m) => walk(of, m.child, join(prefix, m.path), out, m.guard || inherited));
};

// Paths the Klant client calls, e.g. { base: 'v1', path: 'customer_spaaractie/:x' }
const klantCalls = () => {
    const srcDir = path.join(repoDir, 'Klant', 'src');
    const calls = new Set();
    const call = /\b(HTTP_Store|HTTP)\.(get|post|put|delete|patch)\(\s*([`'"])([^`'"]*)\3/g;
    const visit = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) visit(full);
            else if (/\.(js|vue|ts)$/.test(entry.name)) {
                const text = fs.readFileSync(full, 'utf8');
                for (const m of text.matchAll(call)) {
                    const clean = m[4].replace(/\$\{[^}]*\}/g, ':x').split('?')[0].replace(/^\/+|\/+$/g, '');
                    calls.add(JSON.stringify({ base: m[1] === 'HTTP' ? 'v1' : 'v2', method: m[2].toUpperCase(), path: clean }));
                }
            }
        }
    };
    visit(srcDir);
    return [...calls].map((c) => JSON.parse(c));
};

const matches = (endpointPath, clientPath) => {
    const a = endpointPath.split('/').filter(Boolean);
    const b = clientPath.split('/').filter(Boolean);
    return a.length === b.length && a.every((seg, i) => seg.startsWith(':') || b[i].startsWith(':') || seg === b[i]);
};

const buildInventory = () => {
    Object.assign(process.env, safeEnv()); // keep the real .env values out of this process
    process.chdir(serverDir);
    const express = require(path.join(serverDir, 'node_modules', 'express'));
    const guards = loadGuards();
    const of = recordRouters(express, guards);
    const v1 = require(path.join(serverDir, 'routes'));
    const v2 = require(path.join(serverDir, 'store_routes'));

    const endpoints = [];
    walk(of, v1, '/api/v1', endpoints);
    walk(of, v2, '/api/v2', endpoints);

    const calls = klantCalls();
    return endpoints
        .map((e) => {
            const base = e.path.startsWith('/api/v2') ? 'v2' : 'v1';
            const relative = e.path.replace(/^\/api\/v[12]\/?/, '');
            const usedByKlant = calls.some((c) => c.base === base && (e.method === 'ALL' || c.method === e.method) && matches(relative, c.path));
            return { method: e.method, path: e.path, guard: e.guard || 'none', usedByKlant };
        })
        .sort((x, y) => x.path.localeCompare(y.path) || x.method.localeCompare(y.method));
};

module.exports = { buildInventory, matches, join };

if (require.main === module) {
    const inventory = buildInventory();
    const count = (pred) => inventory.filter(pred).length;
    console.log(`endpoints: ${inventory.length}  (v1: ${count((e) => e.path.startsWith('/api/v1'))}, v2: ${count((e) => e.path.startsWith('/api/v2'))})`);
    console.log(`by method: ${['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL'].map((m) => `${m} ${count((e) => e.method === m)}`).join(', ')}`);
    console.log(`called by Klant: ${count((e) => e.usedByKlant)}`);
    console.log(`guard: ${['user', 'customer', 'store', 'none'].map((g) => `${g} ${count((e) => e.guard === g)}`).join(', ')}`);
    if (process.argv.includes('--write')) {
        fs.writeFileSync(path.join(__dirname, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
        console.log('written parity/inventory.json');
    }
    process.exit(0);
}
