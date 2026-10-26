// Compares two HTTP responses (old server vs new server) and describes the differences.
//
// Differences are reported as JSON paths and types, never as values, so a report can be shared without
// leaking data from the test database (it contains customer and order rows).

// Fields whose value legitimately differs between two runs or two servers
const VOLATILE_KEYS = /^(createdAt|updatedAt|deletedAt|accessToken|access_token|token|timestamp|date_added|lastLogin|last_login)$/i;

const typeOf = (value) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

// `mask`: keys whose value may differ (timestamps, tokens): present on both sides, value ignored.
// `drop`: keys that are left out completely (for example secrets the new server intentionally no longer sends).
const normalize = (value, mask, drop = []) => {
    if (Array.isArray(value)) return value.map((item) => normalize(item, mask, drop));
    if (value && typeof value === 'object') {
        const out = {};
        for (const key of Object.keys(value).sort()) {
            if (drop.some((re) => re.test(key))) continue;
            out[key] = mask.some((re) => re.test(key)) ? '<ignored>' : normalize(value[key], mask, drop);
        }
        return out;
    }
    return value;
};

// Numbers that are equal as numbers ("12.50" vs 12.5) are not a difference worth reporting as a type change
const sameScalar = (a, b) => a === b || (typeof a === 'string' && typeof b === 'number' && Number(a) === b) || (typeof a === 'number' && typeof b === 'string' && a === Number(b));

const diffValues = (a, b, path, diffs, limit) => {
    if (diffs.length >= limit) return;
    const ta = typeOf(a);
    const tb = typeOf(b);
    if (ta !== tb && !sameScalar(a, b)) {
        diffs.push(`${path || '$'}: type ${ta} != ${tb}`);
    } else if (ta === 'array') {
        if (a.length !== b.length) diffs.push(`${path || '$'}: array length ${a.length} != ${b.length}`);
        for (let i = 0; i < Math.min(a.length, b.length); i++) diffValues(a[i], b[i], `${path}[${i}]`, diffs, limit);
    } else if (ta === 'object') {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const key of [...keys].sort()) {
            if (!(key in a)) diffs.push(`${path}.${key}: only in new`);
            else if (!(key in b)) diffs.push(`${path}.${key}: only in old`);
            else diffValues(a[key], b[key], `${path}.${key}`, diffs, limit);
        }
    } else if (!sameScalar(a, b)) {
        diffs.push(`${path || '$'}: value differs (${ta})`);
    }
};

const mainType = (contentType) => (contentType || '').split(';')[0].trim().toLowerCase();

/**
 * @param {{status: number|string, contentType?: string, body?: string}} oldRes  status may be 'timeout' or 'error'
 * @param {{status: number|string, contentType?: string, body?: string}} newRes
 * @param {{ignore?: RegExp[], maxDiffs?: number}} [options]
 * @returns {{same: boolean, differences: string[]}}
 */
const compareResponses = (oldRes, newRes, options = {}) => {
    const mask = [VOLATILE_KEYS];
    const drop = options.ignore || [];
    const limit = options.maxDiffs ?? 20;
    const differences = [];

    if (oldRes.status !== newRes.status) differences.push(`status: ${oldRes.status} != ${newRes.status}`);
    if (mainType(oldRes.contentType) !== mainType(newRes.contentType)) {
        differences.push(`content-type: ${mainType(oldRes.contentType) || '-'} != ${mainType(newRes.contentType) || '-'}`);
    }

    const parse = (res) => {
        if (mainType(res.contentType) !== 'application/json') return { ok: false };
        try { return { ok: true, value: normalize(JSON.parse(res.body || 'null'), mask, drop) }; } catch { return { ok: false }; }
    };
    const a = parse(oldRes);
    const b = parse(newRes);
    if (a.ok && b.ok) {
        diffValues(a.value, b.value, '', differences, limit);
    } else if ((oldRes.body || '') !== (newRes.body || '') && differences.length === 0) {
        differences.push(`body: text differs (${(oldRes.body || '').length} vs ${(newRes.body || '').length} characters)`);
    }
    return { same: differences.length === 0, differences };
};

module.exports = { compareResponses, normalize, VOLATILE_KEYS };
