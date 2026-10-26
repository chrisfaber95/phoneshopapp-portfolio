// Builds the pdfmake document definition for the order receipt / invoice.
// Pure functions only (no database, no network), so they can be unit tested.

const VAT = 21; // vat % used for the personal shopper / delivery fee of a first payment
const PERSONAL_SHOPPER_PRICE = 2;

const euro = (value) => `€${(+value).toFixed(2)}`;

const getName = (first, last) => {
    if(!first && !last) {
        return null
    }
    return `${first || ''} ${last || ''}`
}

const isPicked = (status) => status == 'ordered'

const getDateTime = (date) => {
    date = new Date(date)
    return {
        date: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`,
        time: date.toLocaleTimeString('nl-NL', { hour12: false })
    }
}

const customerLines = (details, invoice_details) => {
    const lines = [`Naam: ${invoice_details?.customerName ||
        getName(invoice_details?.first_name, invoice_details?.surname) ||
        details?.customerName ||
        getName(details?.first_name, details?.surname) ||
        ''}`]
    if(invoice_details?.klantenkaart || details?.klantenkaart) lines.push(`Klant nr.: ${invoice_details?.klantenkaart || details?.klantenkaart || ''}`)
    if(invoice_details?.business) lines.push(`Bedrijf: ${invoice_details.business}`)
    if(invoice_details?.contactperson) lines.push(`Telefoon: ${invoice_details.contactperson}`)
    if(invoice_details?.businessphone) lines.push(`Telefoon: ${invoice_details.businessphone}`)
    lines.push(`Telefoon: ${invoice_details?.customerPhone || details?.customerPhone || ''}`)
    lines.push(`Adres: ${invoice_details?.street || details?.street || ''} ${invoice_details?.house_number || details?.house_number || ''} ${invoice_details?.house_addition || details?.house_addition || ''}`)
    lines.push(`${invoice_details?.zipcode || details?.zipcode || ''} ${invoice_details?.city || details?.city || ''}`)
    return lines
}

const invoiceLines = (details, first = false) => {
    const { date, time } = getDateTime(details?.orderDate)
    return [
        `${isPicked(details.status) ? 'Proforma' : 'Factuur nr.'}: ${details.invoice_number || ''}${first ? 'A' : 'B'}`,
        `Datum: ${date || ''}`,
        `Tijd: ${time || ''}`,
        `Winkelbon: ${details?.winkelbon || ''}`
    ]
}

// One row per ordered/picked product, same pricing rules as getTotalPrice in receipt.js
const productRows = (products, status) => {
    const rows = []
    products.forEach(element => {
        const quantity = status == 'ordered' ? element.amount : element.picked
        if(!(quantity > 0)) return
        const price = element.normal_total_price || (element.price * quantity)
        const disc_price = element.discounted_price || (element.price * quantity)
        const deposit = +element.product.statiegeld * quantity
        rows.push({
            title: element.product.product_information.title,
            ean: element.product.product_information.ean,
            quantity,
            vat: element.product.btw,
            excl: +element.price / (1 + (+element.product.btw / 100)),
            incl: +element.price,
            total: +price,
            discount: disc_price != price ? +price - +disc_price : 0,
            deposit: deposit > 0 ? deposit : 0
        })
    })
    return rows
}

// A first payment only charges the personal shopper fee and (above 2 euro) the delivery fee
const firstPaymentRows = (order) => {
    const fixedRow = (title, incl) => ({
        title, ean: null, quantity: 1, vat: VAT,
        excl: incl / (1 + VAT / 100), incl, total: incl, discount: 0, deposit: 0
    })
    const rows = [fixedRow('Personal Shopper', PERSONAL_SHOPPER_PRICE)]
    if(order.picking_price > PERSONAL_SHOPPER_PRICE) {
        rows.push(fixedRow('Bezorging', +order.picking_price - PERSONAL_SHOPPER_PRICE))
    }
    return rows
}

const firstPaymentTotals = (order) => {
    const total = +order.picking_price
    const excl = total / (1 + VAT / 100)
    return { no_vat: { [VAT]: { price: excl, vat: total - excl } }, total, discount_total: 0 }
}

const cell = (text, options = {}) => ({ text, margin: [4, 4, 4, 4], fontSize: 10, ...options })

const headerCell = (text, alignment = 'left') =>
    cell(text, { bold: true, fillColor: '#f2f2f2', color: '#333333', alignment })

const rowCells = (row) => {
    const productText = [{ text: row.title }]
    if(row.ean) productText.push({ text: `\n${row.ean}`, italics: true, fontSize: 8 })
    if(row.deposit > 0) productText.push({ text: '\n\nStatiegeld', italics: true })

    const totalText = [{ text: euro(row.total) }]
    if(row.discount) totalText.push({ text: `\n- ${euro(row.discount)}` })
    if(row.deposit > 0) totalText.push({ text: `\n\n${euro(row.deposit)}` })

    return [
        cell(productText),
        cell(`${row.quantity}`, { alignment: 'right' }),
        cell(`${row.vat}`, { alignment: 'right' }),
        cell(euro(row.excl), { alignment: 'right' }),
        cell(euro(row.incl), { alignment: 'right' }),
        cell(totalText, { alignment: 'right' })
    ]
}

const totalRow = (label, value) => [
    { ...cell(label, { alignment: 'right', bold: true }), colSpan: 5 }, {}, {}, {}, {},
    cell(value, { alignment: 'right', bold: true })
]

const footerText = (shop) => {
    const address = shop?.information?.address
    const info = shop?.information
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
                    { text: 'Administratie E-mail: ', bold: true }, `${info?.admin_mail || ''}`
                ]
            }
        ]
    }
}

/**
 * @param {object} args
 * @param {object} args.order     order incl. order_information / invoice_order_information
 * @param {object} args.shop      shop incl. information.address
 * @param {Array}  args.rows      from productRows() / firstPaymentRows()
 * @param {object} args.totals    { no_vat: {vat: {price, vat}}, total, discount_total }
 * @param {string} [args.barcode] PNG data URI for order.winkelbon
 * @param {string} [args.logo]    PNG/JPEG data URI for the shop logo
 * @param {boolean} [args.first]  first payment invoice
 */
const buildReceipt = ({ order, shop, rows, totals, barcode, logo, first = false }) => {
    const body = [
        ['Product', 'Aantal', 'btw', 'Prijs excl.', 'Prijs incl.', 'Totaal'].map((text, i) => headerCell(text, i === 0 ? 'left' : 'right')),
        ...rows.map(rowCells)
    ]
    if(totals.discount_total > 0) body.push(totalRow('Totaal korting', `-${euro(totals.discount_total)}`))
    for (const [key, value] of Object.entries(totals.no_vat)) body.push(totalRow(`Totaal BTW ${key}%`, euro(value.vat)))
    for (const [key, value] of Object.entries(totals.no_vat)) body.push(totalRow(`Totaal excl. BTW ${key}%`, euro(value.price)))
    body.push(totalRow('Totaalbedrag', euro(totals.total)))

    const lines = (list) => list.map(text => ({ text, fontSize: 10, margin: [0, 0, 0, 2] }))
    const heading = (text) => ({ text, fontSize: 13, color: '#333333', bold: true, margin: [0, 0, 0, 6] })

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
                    { width: 150, stack: [heading('Details factuur'), ...lines(invoiceLines(order, first))] }
                ]
            },
            {
                margin: [0, 16, 0, 20],
                columns: [
                    { width: 150, stack: [heading('Klant'), ...lines(customerLines(order.order_information, order.invoice_order_information))] },
                    { width: '*', text: '' },
                    { width: 150, stack: barcode ? [{ image: barcode, width: 140 }] : [] }
                ]
            },
            {
                table: { headerRows: 1, widths: ['*', 40, 30, 62, 62, 66], body },
                layout: {
                    hLineColor: () => '#dddddd',
                    vLineColor: () => '#dddddd',
                    hLineWidth: () => 0.75,
                    vLineWidth: () => 0.75
                }
            }
        ],
        footer: footerText(shop)
    }
}

module.exports = { buildReceipt, productRows, firstPaymentRows, firstPaymentTotals, customerLines, invoiceLines, euro }
