// Who may call which endpoint. One table instead of a guard per route file.
//
//   public  no token needed (shop front, login/registration, guest checkout, links from e-mails)
//   owner   a valid token (customer or employee) OR the caller names the customer (customer_id in the query or body)
//           -> no bulk dump of records for anonymous callers; customer ids are UUIDs, so they cannot be guessed
//   user    an employee token (admin app)
//
// The first matching rule wins; an endpoint that matches no rule needs an employee token (deny by default).
// Paths are relative to the mount point (/api/v1 or /api/v2), without the query string.

const v1 = [
    // --- public: shop front ---
    ['GET', '^/$', 'public'],
    ['GET', '^/(product|departments|discounts|spaaractie|info)(/.*)?$', 'public'],
    ['GET', '^/(order|actie_order)/count/[^/]+$', 'public'],
    ['POST', '^/(site/cookies|feedback)/?$', 'public'],

    // --- public: accounts ---
    ['POST', '^/customer/(login|passwordreset)/?$', 'public'],
    ['POST', '^/customer/?$', 'public'], // registration from the Klant sign-up page
    ['POST', '^/user/login/?$', 'public'],

    // --- public: guest checkout, payment and links in e-mails (the ids in these links are UUIDs / encrypted) ---
    ['POST', '^/(order|actie_order)/?$', 'public'],
    ['PUT', '^/order/[^/]+$', 'public'],
    ['GET', '^/(order|actie_order)/(single|receipt)/[^/]+$', 'public'],
    ['GET', '^/shoppinglist/[^/]+$', 'public'], // a shared shopping list
    ['POST', '^/mollie/.*$', 'public'], // called by Mollie

    // --- owner: the logged-in customer's own data ---
    ['GET', '^/customer_spaaractie/reminder$', 'user'],
    ['POST', '^/customer/register/?$', 'user'],
    ['DELETE', '^/customer/?$', 'user'],
    ['POST', '^/customer_spaaractie/?$', 'user'],
    ['*', '^/(customer|customer_favorites|customer_spaaractie|order_information)(/[^/]+)?/?$', 'owner'],
    ['GET', '^/order/?$', 'owner'],
];

const v2 = [
    ['GET', '^/job_application/?$', 'user'], // job applications contain personal data
    ['PUT', '^/shops/?$', 'user'],
    ['*', '^/(timeslot|business_hours)/?$', 'public'], // POST/DELETE keep their own store guard
    ['GET', '^/.*$', 'public'], // shop information for the store site
    ['POST', '^/job_application/?$', 'public'],
];

const compile = (table) => table.map(([method, pattern, access]) => ({ method, regex: new RegExp(pattern), access }));

const classify = (compiled, method, path) => {
    const rule = compiled.find((r) => (r.method === '*' || r.method === method) && r.regex.test(path));
    return rule ? rule.access : 'user';
};

module.exports = { v1: compile(v1), v2: compile(v2), classify };
