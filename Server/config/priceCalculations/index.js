//const Logger = require('/config/logging.js');



const getProductDiscount = () => {

}

const getProductInfo = async (cart) => {
    const productIds = cart.map(obj => obj.product_id);
    const products = await Product.findAll({
        logging: false,
        where: { id: productIds},
        include: [
            Product.ProductVariant,
            {
            model: ProductHasDiscount,
            as: 'product_has_discount_list',
            required: false,
            include: [
                { model: Discounts, as: 'discount_info' }
            ]}
        ]
    })

    return products
}

const updateProductPrice = async (item) => {
    item.price = item.product.price
}

// ---- discount calculation -------------------------------------------------------------------------------------
//
// A discount is "<min_amount> for <discount_price>" (fixed price, e.g. 3 for 25.00) or "<discount_price>% off
// every <min_amount>". Units are counted per group of min_amount; the units that do not fill a group are the
// remainder and are charged the normal price.
// - isCombination = true:  all order lines with the same discount share one pool (3 for 25 across products)
// - isCombination = false: every order line is its own pool
// The remainder units are taken from the most expensive line first (the rule the old code used for combinations).

const toCents = (value) => Math.round(+value * 100)

const isActive = (discountInfo, currentDate) => {
    const startDate = new Date(discountInfo.starting_date)
    const endDate = new Date(discountInfo.end_date)
    return currentDate >= startDate && currentDate <= endDate
}

// Shares `totalCents` over the lines by their weights (whole cents, the parts always add up to the total)
const distributeCents = (totalCents, weights) => {
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
    if (weightSum === 0) return weights.map(() => 0)
    const shares = weights.map(weight => totalCents * weight / weightSum)
    const parts = shares.map(Math.floor)
    let left = totalCents - parts.reduce((sum, part) => sum + part, 0)
    shares
        .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
        .sort((a, b) => b.fraction - a.fraction)
        .forEach(({ index }) => { if (left > 0) { parts[index] += 1; left -= 1 } })
    return parts
}

// Prices one pool of order lines that share a discount. Returns the discounted price per line, in the same order.
const priceDiscountPool = (lines, discountRow, discountFromList) => {
    const minAmount = Math.max(1, +(discountRow.discount_info?.discount_type?.min_amount || discountFromList?.discount_type?.min_amount || 1))
    const unitPrice = (line) => +(line.price ?? line.product.price)

    const order = lines
        .map((line, index) => ({ line, index }))
        .sort((a, b) => (unitPrice(b.line) - unitPrice(a.line)) || (+b.line.product_id - +a.line.product_id) || (+b.line.id - +a.line.id))

    let remainder = lines.reduce((sum, line) => sum + +line.amount, 0) % minAmount
    const plan = new Array(lines.length)
    order.forEach(({ line, index }) => {
        const full = Math.min(remainder, +line.amount)
        remainder -= full
        plan[index] = { full, discounted: +line.amount - full }
    })

    const fullCents = lines.map((line, i) => toCents(plan[i].full * unitPrice(line)))
    let discountedCents
    if (discountRow.isPercentage) {
        discountedCents = lines.map((line, i) => toCents(plan[i].discounted * unitPrice(line) * (1 - +discountRow.discount_price / 100)))
    } else {
        const groups = plan.reduce((sum, p) => sum + p.discounted, 0) / minAmount
        discountedCents = distributeCents(Math.round(groups * toCents(discountRow.discount_price)), plan.map(p => p.discounted))
    }
    return lines.map((line, i) => (fullCents[i] + discountedCents[i]) / 100)
}

const calculateDiscountPrices = async (product_list, discount_list, date) => {
    // the order routes pass the pickup date as 'YYYY-MM-DD', so always convert to a Date before comparing
    const currentDate = date ? new Date(date) : new Date()
    const pools = new Map()

    product_list.forEach(product => {
        const applicableDiscount = (product.product.product_has_discount_list || [])
            .find(discount => isActive(discount.discount_info, currentDate))
        product.discounted_price = +(product.price ?? product.product.price) * +product.amount
        product.normal_total_price = +product.price * +(product.picked || product.amount)
        if (!applicableDiscount) return

        const key = applicableDiscount.discount_info.isCombination ? `discount-${applicableDiscount.discount_id}` : product
        if (!pools.has(key)) pools.set(key, { discountRow: applicableDiscount, lines: [] })
        pools.get(key).lines.push(product)
    })

    pools.forEach(({ discountRow, lines }) => {
        const discountFromList = (discount_list || []).find(obj => obj.discount_id === discountRow.discount_id)
        const prices = priceDiscountPool(lines, discountRow, discountFromList)
        lines.forEach((line, i) => { line.discounted_price = prices[i] })
    })
    return product_list
}

module.exports = {
    updateProductPrice,
    calculateDiscountPrices
};
