// Who may call which endpoint: the table of the old Server (Server/routes/middleware/access_rules.js), unchanged.
//
//   public  no token needed (shop front, login/registration, guest checkout, links from e-mails)
//   owner   a valid token (customer or employee) OR the caller names the customer (customer_id in the query or body)
//   user    an employee token (admin app)
//
// The first matching rule wins; an endpoint that matches no rule needs an employee token (deny by default).
// Paths are relative to the version prefix (/api/v1 or /api/v2), without the query string.

export type Access = 'public' | 'owner' | 'user';
type Method = string; // an HTTP method or '*'
type RuleSource = [Method, string, Access];

export interface Rule {
  method: Method;
  regex: RegExp;
  access: Access;
}

const V1: RuleSource[] = [
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
  ['GET', '^/customer/(employee|employee-all)/?$', 'user'],
  ['POST', '^/customer/register/?$', 'user'],
  ['DELETE', '^/customer/?$', 'user'],
  ['POST', '^/customer_spaaractie/?$', 'user'],
  ['PUT', '^/customer_spaaractie/(employeeupdate|employeechange|nostamps)/?$', 'user'], // the old routes had the employee check inside the route
  ['*', '^/(customer|customer_favorites|customer_spaaractie|order_information)(/[^/]+)?/?$', 'owner'],
  ['GET', '^/order(/[^/]+)?/?$', 'owner'], // the list (the date in the path is ignored, like before)
];

const V2: RuleSource[] = [
  ['GET', '^/job_application/?$', 'user'], // job applications contain personal data
  ['PUT', '^/shops/?$', 'user'],
  ['*', '^/(timeslot|business_hours)/?$', 'public'], // POST/DELETE are guarded per route
  ['GET', '^/.*$', 'public'], // shop information for the store site
  ['POST', '^/job_application/?$', 'public'],
];

const compile = (table: RuleSource[]): Rule[] => table.map(([method, pattern, access]) => ({ method, regex: new RegExp(pattern), access }));

export const RULES = { v1: compile(V1), v2: compile(V2) };

export const classify = (rules: Rule[], method: string, path: string): Access => {
  const rule = rules.find((r) => (r.method === '*' || r.method === method) && r.regex.test(path));
  return rule ? rule.access : 'user';
};

// '/api/v1/product?x=1' -> { version: 'v1', path: '/product' }; null for paths outside /api/v1 and /api/v2
export const splitVersion = (fullPath: string): { version: 'v1' | 'v2'; path: string } | null => {
  const match = /^\/api\/(v1|v2)(\/.*)?$/.exec(fullPath.split('?')[0]);
  return match ? { version: match[1] as 'v1' | 'v2', path: match[2] || '/' } : null;
};
