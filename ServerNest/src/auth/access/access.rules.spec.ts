import * as fs from 'node:fs';
import * as path from 'node:path';
import { classify, RULES, splitVersion } from './access.rules';

const v1 = (method: string, url: string) => classify(RULES.v1, method, url);
const v2 = (method: string, url: string) => classify(RULES.v2, method, url);

describe('access rules (the table of the old Server)', () => {
  it.each([
    ['GET', '/'], ['GET', '/product'], ['GET', '/product/search'], ['GET', '/product/abc'], ['GET', '/departments'],
    ['GET', '/discounts'], ['GET', '/spaaractie'], ['GET', '/order/count/2026-09-30'],
    ['POST', '/customer/login'], ['POST', '/customer/passwordreset'], ['POST', '/customer'], ['POST', '/user/login'],
    ['POST', '/order'], ['PUT', '/order/abc'], ['POST', '/actie_order'], ['GET', '/order/single/abc'], ['GET', '/order/receipt/abc'],
    ['GET', '/shoppinglist/abc'], ['POST', '/site/cookies'], ['POST', '/feedback'], ['POST', '/mollie/webhook'],
  ])('%s %s is public (shop front, accounts, guest checkout, e-mail links)', (method, url) => {
    expect(v1(method, url)).toBe('public');
  });

  it.each([
    ['GET', '/customer'], ['PUT', '/customer'], ['GET', '/customer_favorites'], ['POST', '/customer_favorites'], ['DELETE', '/customer_favorites'],
    ['GET', '/customer_spaaractie'], ['GET', '/customer_spaaractie/abc'], ['PUT', '/customer_spaaractie'], ['GET', '/order_information'],
    ['DELETE', '/order_information'], ['GET', '/order'],
  ])("%s %s is a customer's own data (token or customer id)", (method, url) => {
    expect(v1(method, url)).toBe('owner');
  });

  it.each([
    ['POST', '/product/post'], ['PUT', '/product'], ['DELETE', '/product/delete/abc'], ['POST', '/product/scanner'], ['POST', '/product/update_images'],
    ['POST', '/departments/post'], ['PUT', '/departments/update/abc'], ['DELETE', '/order/abc'], ['DELETE', '/customer'],
    ['POST', '/customer/register'], ['POST', '/user/register'], ['GET', '/user/single/abc'], ['POST', '/daytotals'], ['GET', '/daytotals'],
    ['POST', '/discounts/images'], ['POST', '/info/post'], ['GET', '/userroles'], ['GET', '/settings/language'], ['POST', '/shoppinglist'],
    ['GET', '/shoppinglist'], ['PUT', '/spaaractie'], ['GET', '/customer_spaaractie/reminder'], ['GET', '/customer/employee'], ['GET', '/customer/employee-all'], ['GET', '/something/new'],
  ])('%s %s needs an employee token (admin endpoints and everything unknown)', (method, url) => {
    expect(v1(method, url)).toBe('user');
  });

  it('store site: public information, employee-only applications and shop edits', () => {
    for (const url of ['/shops', '/terms', '/job_offer', '/timeslot', '/delivery_location']) expect(v2('GET', url)).toBe('public');
    expect(v2('GET', '/job_application')).toBe('user');
    expect(v2('PUT', '/shops')).toBe('user');
    expect(v2('POST', '/unknown')).toBe('user');
  });

  it('splits the version prefix and ignores the query string', () => {
    expect(splitVersion('/api/v1/product?x=1')).toEqual({ version: 'v1', path: '/product' });
    expect(splitVersion('/api/v2')).toEqual({ version: 'v2', path: '/' });
    expect(splitVersion('/api/health')).toBeNull();
    expect(splitVersion('/api/v3/x')).toBeNull();
  });

  // The inventory lists every endpoint of the old Server: none that changes data and is not used by the Klant client
  // may be public (only Mollie's webhook and the employee login).
  const inventoryFile = path.join(__dirname, '..', '..', '..', '..', 'parity', 'inventory.json');
  const inventory = fs.existsSync(inventoryFile) ? (JSON.parse(fs.readFileSync(inventoryFile, 'utf8')) as { method: string; path: string; usedByKlant: boolean }[]) : [];

  (inventory.length ? it : it.skip)('no admin endpoint of the inventory is public', () => {
    const toUrl = (p: string) => p.replace(/^\/api\/v[12]/, '').replace(/:[A-Za-z]+/g, 'abc') || '/';
    const exposed = inventory
      .filter((e) => e.path.startsWith('/api/v1') && e.method !== 'GET' && !e.usedByKlant)
      .filter((e) => v1(e.method, toUrl(e.path)) === 'public')
      .map((e) => `${e.method} ${e.path}`);
    expect(exposed.sort()).toEqual(['POST /api/v1/mollie/webhook', 'POST /api/v1/user/login']);
  });
});
