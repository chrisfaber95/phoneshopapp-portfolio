const test = require('node:test');
const assert = require('node:assert');

process.env.BASE_URL = 'https://shop.example.nl/';

const mailing = require('../config/mailing');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const order = {
    pickupTime: '14:00', finalPrice: '12.50',
    product_list: [
        { product: { product_information: { title: 'Halfvolle melk', variant: '1 L' } } },
        { product: { product_information: { title: 'Brood', variant: 'heel' } } }
    ]
};

test('setMailOptions addresses the customer and attaches the order QR code', async () => {
    const options = await mailing.setMailOptions('klant@example.nl', '<p>hi</p>', 'order-abc');
    assert.strictEqual(options.to, 'klant@example.nl');
    assert.strictEqual(options.subject, 'Bestelling bij Coop');
    assert.strictEqual(options.html, '<p>hi</p>');
    assert.strictEqual(options.attachments.length, 1);
    assert.strictEqual(options.attachments[0].cid, 'qrcode@cooplubbers.nl');
    assert.deepStrictEqual(options.attachments[0].content.subarray(0, 4), PNG_SIGNATURE);
});

test('the other mail option builders set recipient, subject and html', async () => {
    const cases = [
        [await mailing.setOrderMailOptions('a@example.nl', '<b>x</b>'), 'Bestelling bij Coop', 0],
        [await mailing.setPasswordResetMailOptions('a@example.nl', '<b>x</b>'), 'Wachtwoord vergeten Coop Lubbers', 0],
        [await mailing.setFeedbackMailOptions('a@example.nl', 'b@example.nl', '<b>x</b>'), 'Feedback Coop Lubbers', 0],
        [await mailing.setActieReminderOptions('a@example.nl', '<b>x</b>'), 'Spaaracties Coop Lubbers', 2]
    ];
    for (const [options, subject, attachments] of cases) {
        assert.strictEqual(options.to, 'a@example.nl');
        assert.strictEqual(options.subject, subject);
        assert.strictEqual(options.html, '<b>x</b>');
        assert.strictEqual(options.attachments.length, attachments);
    }
});

test('password reset mail links to the reset page with the code', () => {
    const html = mailing.accountForgetTemplate('code-123');
    assert.ok(html.includes('href="https://shop.example.nl/resetpassword?resetcode=code-123"'));
    assert.ok(html.includes('Wachtwoord vergeten'));
});

test('account created mail thanks the customer', () => {
    assert.ok(mailing.accountCreatedTemplate().includes('Bedankt voor het aanmaken van een account'));
});

test('order placed mail lists the products and the price', () => {
    const html = mailing.orderedTemplate(order);
    assert.ok(html.includes('Bestelling geplaatst'));
    assert.ok(html.includes('Halfvolle melk 1 L'));
    assert.ok(html.includes('Brood heel'));
    assert.ok(html.includes('Bedrag: € 12.50'));
});

test('order picked mail contains the pay link, pickup time and price', () => {
    const html = mailing.pickedTemplate('enc-order-id', order);
    assert.ok(html.includes('Bestelling verwerkt'));
    assert.ok(html.includes('https://shop.example.nl/paypage/enc-order-id'));
    assert.ok(html.includes('14:00'));
    assert.ok(html.includes('Bedrag: € 12.50'));
});

// HTML escaping (REV-014): values from customers and the database must not end up as raw HTML
const evil = '<script>alert(1)</script>';

test('feedback text is HTML-escaped and no stray characters follow it', () => {
    const html = mailing.feedbackTemplate(evil);
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(!html.includes('&lt;/script&gt;"'));
});

test('product names and variants are HTML-escaped in the order mails', () => {
    const hostile = { ...order, product_list: [{ product: { product_information: { title: evil, variant: '<b>big</b>' } } }] };
    for (const html of [mailing.orderedTemplate(hostile), mailing.pickedTemplate('id', hostile)]) {
        assert.ok(!html.includes('<script>'));
        assert.ok(!html.includes('<b>big</b>'));
        assert.ok(html.includes('&lt;b&gt;big&lt;/b&gt;'));
    }
});

test('normal characters in product names stay readable', () => {
    const html = mailing.orderedTemplate({ ...order, product_list: [{ product: { product_information: { title: "Ben & Jerry's", variant: '500 ml' } } }] });
    assert.ok(html.includes('Ben &amp; Jerry&#x27;s 500 ml'));
});

test('reset code and order id are escaped inside the links', () => {
    const reset = mailing.accountForgetTemplate('"><script>x</script>');
    assert.ok(!reset.includes('<script>'));
    assert.ok(reset.includes('href="https://shop.example.nl/resetpassword?resetcode=&quot;&gt;'));
    assert.ok(!mailing.pickedTemplate('"><script>x</script>', order).includes('<script>'));
});
