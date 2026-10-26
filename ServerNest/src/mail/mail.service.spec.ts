import { MailOptions, MailService, MailTransport } from './mail.service';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const serviceWith = (sendMail: jest.Mock = jest.fn().mockResolvedValue({})) => new MailService({ sendMail } as MailTransport);

describe('MailService', () => {
  it('order mail with QR code: customer, subject, html and a PNG QR attachment with the cid the HTML uses', async () => {
    const options = await serviceWith().orderWithQr('klant@example.nl', '<p>hi</p>', 'order-abc');
    expect(options).toMatchObject({ to: 'klant@example.nl', subject: 'Bestelling bij Coop', text: 'Uw bestelling bij Coop Lubbers', html: '<p>hi</p>', from: 'Coop Lubbers Bestellingen <bestellingen@cooplubbers.nl>' });
    expect(options.attachments).toHaveLength(1);
    expect(options.attachments[0].cid).toBe('qrcode@cooplubbers.nl');
    expect(options.attachments[0].filename).toBe('image.png');
    expect(options.attachments[0].content?.subarray(0, 4)).toEqual(PNG_SIGNATURE);
  });

  it.each<[string, (s: MailService) => MailOptions, string, string, number]>([
    ['order', (s) => s.order('a@example.nl', '<b>x</b>'), 'Bestelling bij Coop', 'Coop Lubbers Bestellingen <bestellingen@cooplubbers.nl>', 0],
    ['passwordReset', (s) => s.passwordReset('a@example.nl', '<b>x</b>'), 'Wachtwoord vergeten Coop Lubbers', 'Coop Lubbers Accounts <bestellingen@cooplubbers.nl>', 0],
    ['feedback', (s) => s.feedback('a@example.nl', '<b>x</b>'), 'Feedback Coop Lubbers', 'Coop Lubbers Feedback <bestellingen@cooplubbers.nl>', 0],
    ['actieReminder', (s) => s.actieReminder('a@example.nl', '<b>x</b>'), 'Spaaracties Coop Lubbers', 'Coop Lubbers Feedback <bestellingen@cooplubbers.nl>', 2],
  ])('%s mail has the sender, subject and attachments of the old Server', (_name, build, subject, from, attachments) => {
    const options = build(serviceWith());
    expect(options).toMatchObject({ to: 'a@example.nl', subject, from, html: '<b>x</b>' });
    expect(options.attachments).toHaveLength(attachments);
  });

  it('the reminder references its two images by cid', () => {
    const cids = serviceWith().actieReminder('a@example.nl', '').attachments.map((a) => a.cid);
    expect(cids).toEqual(['storefront@cooplubbers.nl', 'donar_zegel@cooplubbers.nl']);
  });

  it('send hands the mail to the transport and answers true', async () => {
    const sendMail = jest.fn().mockResolvedValue({});
    const options = serviceWith().order('a@example.nl', '<b>x</b>');
    expect(await serviceWith(sendMail).send(options)).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(options);
  });

  it('send answers false (and does not throw) when the mail server refuses', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('535 authentication failed'));
    expect(await serviceWith(sendMail).send(serviceWith().order('a@example.nl', '<b>x</b>'))).toBe(false);
  });
});
