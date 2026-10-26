// Answers 503 when a handler has not responded in time. Some routes never answer (a database callback that is never
// called); without this the client waits forever and the connection stays open.
module.exports = (ms = 30000) => (req, res, next) => {
    const timer = setTimeout(() => {
        if (!res.headersSent) res.status(503).json({ error: 'Request timed out' });
    }, ms);
    res.on('close', () => clearTimeout(timer));
    next();
};
