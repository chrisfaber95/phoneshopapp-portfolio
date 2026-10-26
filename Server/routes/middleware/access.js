const jwt = require('jsonwebtoken');
const { classify } = require('./access_rules');

// Reads the token the clients send: the raw token, or "Bearer <token>"; "null"/"undefined" (a logged-out client) count as none
const tokenOf = (req) => {
    const header = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    return ['', 'null', 'undefined'].includes(header) ? null : header;
};

const hasCustomerId = (req) => {
    const id = req.query?.customer_id ?? req.body?.customer_id;
    return id !== undefined && id !== null && String(id).trim() !== '';
};

/**
 * @param {object} options
 * @param {Array}  options.rules          compiled rules from access_rules.js (v1 or v2)
 * @param {(id: *) => Promise<object|null>} options.findUser      employee by id
 * @param {(id: *) => Promise<object|null>} options.findCustomer  customer by id
 * @param {() => string} options.secret   JWT secret
 * @param {() => string} [options.mode]   'enforce' (default) or 'log' (log what would be denied, let it through)
 * @param {(message: string) => void} [options.log]
 */
const createAccess = ({ rules, findUser, findCustomer, secret, mode = () => 'enforce', log = () => {} }) => {
    // Who is behind the token: { type: 'user' | 'customer', id } or null when missing/invalid/unknown
    const principalOf = async (token) => {
        if (!token) return null;
        let payload;
        try {
            payload = jwt.verify(token, secret());
        } catch {
            return null;
        }
        if (!payload || payload.user_id === undefined || payload.user_id === null) return null;
        if (await findUser(payload.user_id)) return { type: 'user', id: payload.user_id };
        if (await findCustomer(payload.user_id)) return { type: 'customer', id: payload.user_id };
        return null;
    };

    return async (req, res, next) => {
        try {
            if (req.method === 'OPTIONS') return next(); // CORS preflight carries no token
            const access = classify(rules, req.method, req.path);
            if (access === 'public') return next();

            const principal = await principalOf(tokenOf(req));
            if (principal) req.principal = principal;

            let denied = null;
            if (access === 'user' && !principal) denied = { status: 401, reason: 'no valid token' };
            else if (access === 'user' && principal.type !== 'user') denied = { status: 403, reason: 'employee token required' };
            else if (access === 'owner' && !principal && !hasCustomerId(req)) denied = { status: 401, reason: 'no valid token and no customer_id' };

            if (!denied) return next();
            log(`access ${mode() === 'enforce' ? 'denied' : 'would be denied'}: ${req.method} ${req.originalUrl.split('?')[0]} (${access}): ${denied.reason}`);
            if (mode() !== 'enforce') return next();
            return res.status(denied.status).json({ error: denied.status === 401 ? 'Authentication required' : 'Not allowed' });
        } catch (err) {
            log(`access check failed: ${err && err.message}`);
            return res.status(500).json({ error: 'Access check failed' });
        }
    };
};

// The middleware wired to the real models, secret and logger
const forRules = (rules) => {
    const { User, Customer } = require('../../models/index');
    const Logger = require('../../config/logging.js');
    return createAccess({
        rules,
        findUser: (id) => User.findByPk(id, { logging: false }),
        findCustomer: (id) => Customer.findByPk(id, { logging: false }),
        secret: () => process.env.TOKEN_KEY,
        mode: () => (process.env.ACCESS_MODE === 'log' ? 'log' : 'enforce'),
        log: (message) => Logger.log(1, message),
    });
};

module.exports = { createAccess, forRules, tokenOf };
