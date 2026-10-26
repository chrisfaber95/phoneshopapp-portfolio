// Fetch a page and resolve with its body text (replaces the deprecated request-promise).
// Rejects on a non-2xx status, like request-promise did.
module.exports = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.text();
};
