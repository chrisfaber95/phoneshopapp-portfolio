// Express 5 compatibility: keep the Express 4 behaviour the routes rely on.
// - nested query strings (a[b]=c) are parsed again ('simple' is the Express 5 default)
// - req.query is a fresh getter in Express 5, so `delete req.query.x` had no effect; pin it per request
// - req.body is undefined (not {}) when a request has no body
// Register after the body parsers.
module.exports = (app) => {
    app.set('query parser', 'extended');
    app.use(function(req, res, next) {
        Object.defineProperty(req, 'query', { value: req.query, writable: true, configurable: true, enumerable: true });
        if (req.body === undefined) req.body = {};
        next();
    });
};
