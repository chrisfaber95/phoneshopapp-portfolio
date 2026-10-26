const {Order, OrderHasProduct, Product, Productinformation, ProductHasDiscount, Discounts, OrderInformation}= require('../../models/index');
const {JobOffer, Shop, Information, Address, Socials, Business_Hours}= require('../../store_models/index');
const { Op } = require("sequelize");
const Logger = require('../../config/logging.js');
const bwipjs = require('bwip-js');
const path = require('path');
const pdfmake = require('pdfmake');
const { buildReceipt, productRows, firstPaymentRows, firstPaymentTotals } = require('./receipt_document');

pdfmake.setFonts(require('pdfmake/fonts/Roboto'));
// the receipt only embeds data URIs (logo and barcode are fetched/generated beforehand); allow nothing but the bundled fonts
const fontsDir = path.dirname(require.resolve('pdfmake/fonts/Roboto'));
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy((file) => path.resolve(file).startsWith(fontsDir));

const { cryptr } = require('../middleware/secrets');

const getStoreInfo = async (shop_id) => {
    
    return new Promise((resolve) => {
        var where = {'shop_id': shop_id}
        Shop.findAll({        
            logging: false,
            where: where,
            include: [
                {
                    model: Information,
                    as: 'information',
                    include:[{
                        model: Address,
                        as: 'address'
                    }]
                },
                {
                    model: Socials,
                    as: 'socials'
                },
                {
                    model: Business_Hours,
                    as: 'business_hours'
                }
            ],
        })
        .then((store_info) => {
            resolve(store_info[0])
        })
        .catch((err) =>{        
            resolve(null)
        })
    })
}

// Resolves with a PNG data URI, or '' when the barcode cannot be generated
const generateBarcode = async (code, type = 'code128') => {
    return new Promise((resolve) => {
        bwipjs.toBuffer({
            bcid: type,
            text: code,
            scale: 2,
            height: 15,
            includetext: true,
            textxalign: 'center',
            textsize: 12,
            paddingwidth: 10,
        }, function (err, png) {
            if (err) {
                console.log(err)
                resolve('')
            } else {
                resolve(`data:image/png;base64,${Buffer.from(png).toString('base64')}`)
            }
        });
    })
}

// pdfmake only embeds PNG/JPEG, so download the logo and resolve with a data URI, or '' to fall back to the shop name
const getLogo = async (url) => {
    if(!url) return ''
    try {
        const res = await fetch(url)
        const type = (res.headers.get('content-type') || '').split(';')[0]
        if(!res.ok || !['image/png', 'image/jpeg'].includes(type)) return ''
        return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
    } catch (err) {
        console.log(err)
        return ''
    }
}

const SHOP_ID = '31bc6562-6672-11ed-b67e-0242ac110003'

const generateReceipt = async (order, first = false) => {
    const shop = await getStoreInfo(SHOP_ID)
    const rows = first ? firstPaymentRows(order) : productRows(order.product_list, order.status)
    const totals = first ? firstPaymentTotals(order) : await getTotalPrice(order.product_list, order)
    const barcode = order.winkelbon ? await generateBarcode(order.winkelbon) : ''
    const logo = await getLogo(shop?.information?.logo_url)
    return buildReceipt({ order, shop, rows, totals, barcode, logo, first })
}

const getTotalPrice = (async (products, order) => {
    return new Promise((resolve) => {
        var total = {
            no_vat: {},
            total: 0.00,
            discount_total: 0.00
        }
        try {
            console.log(products)
            console.log(order)
            if(order.status == 'ordered'){
                products.forEach(element => {
                    let price = element.normal_total_price || (element.price * element.amount)
                    let disc_price = element.discounted_price || (element.price * element.amount)
                    let quantity = element.amount
                    let vat = element.product.btw
                    let deposit = +element.product.statiegeld * element.amount

                    if(quantity > 0){
                        total.total += +price + +deposit
                        if(vat in total.no_vat){
                            total.no_vat[vat].price = total.no_vat[vat].price + (+price / (1 + (+vat / 100)))
                            total.no_vat[vat].vat = total.no_vat[vat].vat + (+price - (+price / (1 + (+vat / 100))))
                        }
                        else{
                            total.no_vat[vat] = {}
                            total.no_vat[vat]['price'] = (+price / (1 + (+vat / 100)))
                            total.no_vat[vat]['vat'] = (+price - (+price / (1 + (+vat / 100))))
                        }
                        total.discount_total += +price - +disc_price
                    }
                })
                resolve(total)
            }
            else{
                products.forEach(element => {
                    if(element.picked > 0){
                        let price = element.normal_total_price || (element.price * element.picked)
                        let disc_price = element.discounted_price || (element.price * element.picked)
                        let quantity = element.picked
                        let vat = element.product.btw
                        let deposit = +element.product.statiegeld * element.picked
        
                        if(quantity > 0){
                            total.total += +price + +deposit
                            if(vat in total.no_vat){
                                total.no_vat[vat].price = total.no_vat[vat].price + (+price / (1 + (+vat / 100)))
                                total.no_vat[vat].vat = total.no_vat[vat].vat + (+price - (+price / (1 + (+vat / 100))))
                            }
                            else{
                                total.no_vat[vat] = {}
                                total.no_vat[vat]['price'] = (+price / (1 + (+vat / 100)))
                                total.no_vat[vat]['vat'] = (+price - (+price / (1 + (+vat / 100))))
                            }
                            total.discount_total += +price - +disc_price
                        }
                    }
                })
                resolve(total)
            }
        } catch (error) { 
            resolve(total)
            console.log(error)
        }
    })
})

module.exports = (req, res) => {
    const first_payment = req.query.first
    Order.findOne({     
        logging: false,
        paranoid: false,
        where: {
            uuid_id: req.params.orderId
        },
        include: [
            { all: true}, 
            {model: OrderHasProduct, 
                as: "product_list", 
                include: [{
                    model: Product, 
                    as: "product", 
                    include: [{
                        model: Productinformation,
                        as: 'product_information',
                       attributes: ['title', 'ean']
                    },
                {
                    model: ProductHasDiscount,
                    as: 'product_has_discount_list',
                    required: false,
                    include: [
                        {
                            model: Discounts,
                            as: 'discount_info'
                        }
                    ]  
                }]
                }]
            },
            {model: OrderInformation, 
                as: "order_information",
                include: []
            },
            {model: OrderInformation, 
                as: "invoice_order_information",
                include: []
            }
        ]
       
    })
    .then(async (order) => {

        try {
            const doc = await generateReceipt(order, first_payment == '1')
            const pdf = await pdfmake.createPdf(doc).getBuffer()
            res.setHeader('Content-type', 'application/pdf')
            res.end(pdf)
        } catch (err) {
            Logger.log(1, err)
            res.send(err)
        }
    })
    .catch((err) =>{     
        if (err) return res.send(err);             
        Logger.log(1, err)
    })
};
