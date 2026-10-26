// Builds the pdfmake document definition for the order receipt / invoice. Pure functions (no database, no network), ported 1:1 from
// Server/routes/order/receipt_document.js (REV-006) so the receipt looks the same.

const VAT = 21; // vat % used for the personal shopper / delivery fee of a first payment
const PERSONAL_SHOPPER_PRICE = 2;

type Num = number | string | null | undefined;

export interface ReceiptContact {
  customerName?: string | null;
  first_name?: string | null;
  surname?: string | null;
  klantenkaart?: string | null;
  business?: string | null;
  contactperson?: string | null;
  businessphone?: string | null;
  customerPhone?: string | null;
  street?: string | null;
  house_number?: string | null;
  house_addition?: string | null;
  zipcode?: string | null;
  city?: string | null;
}

export interface ReceiptLine {
  amount?: Num;
  picked?: Num;
  price?: Num;
  normal_total_price?: Num;
  discounted_price?: Num;
  product: { btw?: Num; statiegeld?: Num; product_information: { title?: string | null; ean?: string | null } };
}

export interface ReceiptOrder {
  status?: string | null;
  invoice_number?: string | null;
  orderDate?: Date | string | null;
  winkelbon?: string | null;
  picking_price?: Num;
  order_information?: ReceiptContact | null;
  invoice_order_information?: ReceiptContact | null;
}

export interface ReceiptShop {
  shopname?: string | null;
  information?: {
    kvk?: string | null; btw?: string | null; phone?: string | null; mobile?: string | null; mail?: string | null; admin_mail?: string | null; logo_url?: string | null;
    address?: { street?: string | null; house_number?: string | null; house_addition?: string | null; zipcode?: string | null; city?: string | null } | null;
  } | null;
}

export interface Row { title: string | null | undefined; ean: string | null | undefined; quantity: number; vat: Num; excl: number; incl: number; total: number; discount: number; deposit: number }
export interface Totals { no_vat: Record<string, { price: number; vat: number }>; total: number; discount_total: number }

export const euro = (value: Num): string => `€${(+(value as number)).toFixed(2)}`;

const getName = (first?: string | null, last?: string | null): string | null => (!first && !last ? null : `${first || ''} ${last || ''}`);

const isPicked = (status?: string | null): boolean => status === 'ordered';

const getDateTime = (value: Date | string | null | undefined): { date: string; time: string } => {
  const date = new Date(value as string);
  return { date: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`, time: date.toLocaleTimeString('nl-NL', { hour12: false }) };
};

export const customerLines = (details?: ReceiptContact | null, invoice?: ReceiptContact | null): string[] => {
  const lines = [`Naam: ${invoice?.customerName || getName(invoice?.first_name, invoice?.surname) || details?.customerName || getName(details?.first_name, details?.surname) || ''}`];
  if (invoice?.klantenkaart || details?.klantenkaart) lines.push(`Klant nr.: ${invoice?.klantenkaart || details?.klantenkaart || ''}`);
  if (invoice?.business) lines.push(`Bedrijf: ${invoice.business}`);
  if (invoice?.contactperson) lines.push(`Telefoon: ${invoice.contactperson}`);
  if (invoice?.businessphone) lines.push(`Telefoon: ${invoice.businessphone}`);
  lines.push(`Telefoon: ${invoice?.customerPhone || details?.customerPhone || ''}`);
  lines.push(`Adres: ${invoice?.street || details?.street || ''} ${invoice?.house_number || details?.house_number || ''} ${invoice?.house_addition || details?.house_addition || ''}`);
  lines.push(`${invoice?.zipcode || details?.zipcode || ''} ${invoice?.city || details?.city || ''}`);
  return lines;
};

export const invoiceLines = (details: ReceiptOrder, first = false): string[] => {
  const { date, time } = getDateTime(details?.orderDate);
  return [
    `${isPicked(details.status) ? 'Proforma' : 'Factuur nr.'}: ${details.invoice_number || ''}${first ? 'A' : 'B'}`,
    `Datum: ${date || ''}`,
    `Tijd: ${time || ''}`,
    `Winkelbon: ${details?.winkelbon || ''}`,
  ];
};

// One row per ordered/picked product
export const productRows = (products: ReceiptLine[], status?: string | null): Row[] => {
  const rows: Row[] = [];
  products.forEach((element) => {
    const quantity = +((status === 'ordered' ? element.amount : element.picked) as number);
    if (!(quantity > 0)) return;
    const price = element.normal_total_price || +(element.price as number) * quantity;
    const discountedPrice = element.discounted_price || +(element.price as number) * quantity;
    const deposit = +(element.product.statiegeld as number) * quantity;
    rows.push({
      title: element.product.product_information.title,
      ean: element.product.product_information.ean,
      quantity,
      vat: element.product.btw,
      excl: +(element.price as number) / (1 + +(element.product.btw as number) / 100),
      incl: +(element.price as number),
      total: +price,
      discount: +discountedPrice !== +price ? +price - +discountedPrice : 0,
      deposit: deposit > 0 ? deposit : 0,
    });
  });
  return rows;
};

// Totals of a normal receipt: the ordered amounts when the status is `ordered`, the picked amounts otherwise (getTotalPrice of the old receipt.js)
export const receiptTotals = (products: ReceiptLine[], status?: string | null): Totals => {
  const total: Totals = { no_vat: {}, total: 0, discount_total: 0 };
  products.forEach((element) => {
    const quantity = +((status === 'ordered' ? element.amount : element.picked) as number);
    if (!(quantity > 0)) return;
    const price = +(element.normal_total_price || +(element.price as number) * quantity);
    const discounted = +(element.discounted_price || +(element.price as number) * quantity);
    const vat = element.product.btw as number;
    const deposit = +(element.product.statiegeld as number) * quantity;
    total.total += price + deposit;
    const key = String(vat);
    const excl = price / (1 + +vat / 100);
    const entry = total.no_vat[key] ?? { price: 0, vat: 0 };
    entry.price += excl;
    entry.vat += price - excl;
    total.no_vat[key] = entry;
    total.discount_total += price - discounted;
  });
  return total;
};

// A first payment only charges the personal shopper fee and (above 2 euro) the delivery fee
export const firstPaymentRows = (order: ReceiptOrder): Row[] => {
  const fixedRow = (title: string, incl: number): Row => ({ title, ean: null, quantity: 1, vat: VAT, excl: incl / (1 + VAT / 100), incl, total: incl, discount: 0, deposit: 0 });
  const rows = [fixedRow('Personal Shopper', PERSONAL_SHOPPER_PRICE)];
  if (+(order.picking_price as number) > PERSONAL_SHOPPER_PRICE) rows.push(fixedRow('Bezorging', +(order.picking_price as number) - PERSONAL_SHOPPER_PRICE));
  return rows;
};

export const firstPaymentTotals = (order: ReceiptOrder): Totals => {
  const total = +(order.picking_price as number);
  const excl = total / (1 + VAT / 100);
  return { no_vat: { [VAT]: { price: excl, vat: total - excl } }, total, discount_total: 0 };
};

type Cell = Record<string, unknown>;
const cell = (text: unknown, options: Cell = {}): Cell => ({ text, margin: [4, 4, 4, 4], fontSize: 10, ...options });
const headerCell = (text: string, alignment = 'left'): Cell => cell(text, { bold: true, fillColor: '#f2f2f2', color: '#333333', alignment });

const rowCells = (row: Row): Cell[] => {
  const productText: Cell[] = [{ text: row.title }];
  if (row.ean) productText.push({ text: `\n${row.ean}`, italics: true, fontSize: 8 });
  if (row.deposit > 0) productText.push({ text: '\n\nStatiegeld', italics: true });

  const totalText: Cell[] = [{ text: euro(row.total) }];
  if (row.discount) totalText.push({ text: `\n- ${euro(row.discount)}` });
  if (row.deposit > 0) totalText.push({ text: `\n\n${euro(row.deposit)}` });

  return [
    cell(productText),
    cell(`${row.quantity}`, { alignment: 'right' }),
    cell(`${row.vat}`, { alignment: 'right' }),
    cell(euro(row.excl), { alignment: 'right' }),
    cell(euro(row.incl), { alignment: 'right' }),
    cell(totalText, { alignment: 'right' }),
  ];
};

const totalRow = (label: string, value: string): Cell[] => [{ ...cell(label, { alignment: 'right', bold: true }), colSpan: 5 }, {}, {}, {}, {}, cell(value, { alignment: 'right', bold: true })];

const footerText = (shop?: ReceiptShop | null): Cell => {
  const address = shop?.information?.address;
  const info = shop?.information;
  return {
    margin: [36, 0, 36, 20],
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 1.5, lineColor: '#999999' }] },
      {
        fontSize: 8, margin: [0, 4, 0, 0], color: '#555555',
        text: [
          { text: `${shop?.shopname || ''}, `, bold: true },
          { text: 'Adres: ', bold: true }, `${address?.street || ''} ${address?.house_number || ''}${address?.house_addition || ''}, ${address?.zipcode || ''} ${address?.city || ''}, `,
          { text: 'KVK: ', bold: true }, `${info?.kvk || ''}, `,
          { text: 'BTW: ', bold: true }, `${info?.btw || ''}, `,
          { text: 'Telefoon: ', bold: true }, `${info?.phone || ''}, `,
          { text: 'Mobiel: ', bold: true }, `${info?.mobile || ''}, `,
          { text: 'Email: ', bold: true }, `${info?.mail || ''}, `,
          { text: 'Administratie E-mail: ', bold: true }, `${info?.admin_mail || ''}`,
        ],
      },
    ],
  };
};

export interface ReceiptInput {
  order: ReceiptOrder;
  shop?: ReceiptShop | null;
  rows: Row[];
  totals: Totals;
  barcode?: string; // PNG data URI for order.winkelbon
  logo?: string; // PNG/JPEG data URI for the shop logo
  first?: boolean; // first payment invoice
}

export const buildReceipt = ({ order, shop, rows, totals, barcode, logo, first = false }: ReceiptInput): Record<string, unknown> => {
  const body: Cell[][] = [['Product', 'Aantal', 'btw', 'Prijs excl.', 'Prijs incl.', 'Totaal'].map((text, i) => headerCell(text, i === 0 ? 'left' : 'right')), ...rows.map(rowCells)];
  if (totals.discount_total > 0) body.push(totalRow('Totaal korting', `-${euro(totals.discount_total)}`));
  for (const [key, value] of Object.entries(totals.no_vat)) body.push(totalRow(`Totaal BTW ${key}%`, euro(value.vat)));
  for (const [key, value] of Object.entries(totals.no_vat)) body.push(totalRow(`Totaal excl. BTW ${key}%`, euro(value.price)));
  body.push(totalRow('Totaalbedrag', euro(totals.total)));

  const lines = (list: string[]): Cell[] => list.map((text) => ({ text, fontSize: 10, margin: [0, 0, 0, 2] }));
  const heading = (text: string): Cell => ({ text, fontSize: 13, color: '#333333', bold: true, margin: [0, 0, 0, 6] });

  return {
    info: { title: 'Factuur' },
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [36, 36, 36, 60],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    content: [
      {
        columns: [
          { width: 150, stack: [logo ? { image: logo, width: 150 } : { text: shop?.shopname || '', fontSize: 26, color: '#333333' }] },
          { width: '*', text: '' },
          { width: 150, stack: [heading('Details factuur'), ...lines(invoiceLines(order, first))] },
        ],
      },
      {
        margin: [0, 16, 0, 20],
        columns: [
          { width: 150, stack: [heading('Klant'), ...lines(customerLines(order.order_information, order.invoice_order_information))] },
          { width: '*', text: '' },
          { width: 150, stack: barcode ? [{ image: barcode, width: 140 }] : [] },
        ],
      },
      {
        table: { headerRows: 1, widths: ['*', 40, 30, 62, 62, 66], body },
        layout: { hLineColor: () => '#dddddd', vLineColor: () => '#dddddd', hLineWidth: () => 0.75, vLineWidth: () => 0.75 },
      },
    ],
    footer: footerText(shop),
  };
};
