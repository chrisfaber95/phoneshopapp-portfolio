import * as fs from 'node:fs';
import * as path from 'node:path';
import * as bodies from '../src/mail/mail-bodies';
import type { ActieOrderMailInfo, OrderMailInfo, ReminderMailInfo } from '../src/mail/mail.types';

// Renders every e-mail template with the code of the old Server and with the ported code and compares the HTML. The old
// module is loaded without sending anything. Skipped once the old Server folder is gone (after the cutover).
const oldServer = path.resolve(__dirname, '..', '..', 'Server');
const oldMailing = path.join(oldServer, 'config', 'mailing.js');

type OldMailing = {
  pickedTemplate(mystr: string, order: unknown): string;
  orderedTemplate(order: unknown): string;
  actiePickedTemplate(mystr: string, order: unknown): string;
  orderedActieTemplate(order: unknown): string;
  orderedDonarTemplate(order: unknown): string;
  accountCreatedTemplate(): string;
  accountForgetTemplate(code: string): string;
  feedbackTemplate(text: string): string;
  actieReminderTemplate(info: unknown): string;
};

const line = (title: string, variant: string, extra: object = {}) => ({ amount: 2, picked: 1, product: { product_information: { title, variant } }, ...extra });
const variants = [{ product_variant: { variant_label: 'Rood' } }, { product_variant: { variant_label: '<b>Blauw</b>' } }];

const order: OrderMailInfo = {
  pickupTime: '14:00',
  finalPrice: '12.50',
  totalPrice: '13.00',
  delivery: true,
  product_list: [line('Halfvolle melk', '1 L'), line("Ben & Jerry's", '<i>500 ml</i>'), line('Brood', 'heel')],
};
const actieOrder: ActieOrderMailInfo = {
  ...order,
  product_list: [line('Donar shirt', 'M', { actie_order_product_variant_list: variants, product_id: 5 }), line('Mok', '', { actie_order_product_variant_list: [], product_id: 6 })] as ActieOrderMailInfo['product_list'],
  actie_order_information: { first_name: 'Piet', surname: '<script>x</script>', customerEmail: 'piet@example.nl', street: 'Teststraat', house_number: '1', house_addition: 'a', zipcode: '1234 AB', city: 'Stad', createdAt: '2026-09-30T10:00:00.000Z' },
};
const reminder: ReminderMailInfo = { storepoints: 12, spaaractie_list: [{ stamp_amount: 34 }] };

(fs.existsSync(oldMailing) ? describe : describe.skip)('e-mail templates match the old Server', () => {
  const previous = { ...process.env };
  let old: OldMailing;

  beforeAll(() => {
    Object.assign(process.env, { BASE_URL: 'https://shop.example.nl/', MAIL_USER: 'x', MAIL_PASS: 'x' });
    const cwd = process.cwd();
    process.chdir(oldServer);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    old = require(oldMailing) as OldMailing;
    process.chdir(cwd);
  });
  afterAll(() => { process.env = previous; });

  it('pickedTemplate', () => expect(bodies.pickedTemplate('enc-id', order)).toBe(old.pickedTemplate('enc-id', order)));
  it('actiePickedTemplate', () => expect(bodies.actiePickedTemplate('enc-id', actieOrder)).toBe(old.actiePickedTemplate('enc-id', actieOrder)));
  it('orderedActieTemplate', () => expect(bodies.orderedActieTemplate(actieOrder)).toBe(old.orderedActieTemplate(actieOrder)));
  it('orderedDonarTemplate', () => expect(bodies.orderedDonarTemplate(actieOrder)).toBe(old.orderedDonarTemplate(actieOrder)));
  it('accountCreatedTemplate', () => expect(bodies.accountCreatedTemplate()).toBe(old.accountCreatedTemplate()));
  it('accountForgetTemplate', () => expect(bodies.accountForgetTemplate('code-1"><b>')).toBe(old.accountForgetTemplate('code-1"><b>')));
  it('feedbackTemplate', () => expect(bodies.feedbackTemplate('<script>alert(1)</script>')).toBe(old.feedbackTemplate('<script>alert(1)</script>')));
  it('actieReminderTemplate', () => expect(bodies.actieReminderTemplate(reminder)).toBe(old.actieReminderTemplate(reminder)));

  // The one deliberate difference: the old orderedTemplate dropped the closing tags and the footer (a forgotten `html +=`)
  it('orderedTemplate: the old HTML plus the closing tags and footer that the old code dropped', () => {
    const oldHtml = old.orderedTemplate(order);
    const newHtml = bodies.orderedTemplate(order);
    expect(newHtml.startsWith(oldHtml)).toBe(true);
    const added = newHtml.slice(oldHtml.length);
    expect(added).toContain('</td>');
    expect(added).toContain('</html>');
  });
});
