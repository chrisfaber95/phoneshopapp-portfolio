import store from '@/store';
import {DateTime} from 'luxon'

       const calculatePrice = ((item) => {
        var discount = isDiscounted(item.product)
        if(discount){
            if(discount.isPercentage){
                return parseFloat(item.product.price * (1 - discount.discount_price/100)).toFixed(2)
            }
        }
        return item.product.price
    })

    const calculateDiscountPrice = ((item) => {
        
        var totalPrice = 0
       // let cart = store.getters.getShoppingCart
       // for (const [key, value] of Object.entries(cart)) {
            var discount = isDiscounted(item)
       // }
        if(discount){
            if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                let totals = discountPercentageNoCombination(item, discount, discount.discount_info.discount_type.min_amount)
                //totalPrice +=  parseFloat((parseFloat(value.product.price) *(1 - discount.discount_price/100))) * parseFloat(value.amount)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                let totals = discountNoPercentageCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                let totals = discountPercentageCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                let totals = discountNoPercentageNoCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = totals.discount + totals.remainder
            }
        }
        else{
            totalPrice = parseFloat(item.product.price) * parseFloat(item.amount)
        }
        return totalPrice
    })


    const calculateProductPriceWithDiscountDate = ((item, date, cart) => {        
        var totalPrice = 0
       // let cart = store.getters.getShoppingCart
       // for (const [key, value] of Object.entries(cart)) {
            //console.log(item)
           // console.log(date)
            var discount = isDiscounted(item.product, date)
           // console.log(discount)
       // }
       console.log(cart)
        if(discount){
            if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                //console.log(discount)
                let totals = discountPercentageNoCombination(item.product, discount, item.picked, item.price)
                //totalPrice +=  parseFloat((parseFloat(value.product.price) *(1 - discount.discount_price/100))) * parseFloat(value.amount)
               // console.log(totals)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
               // console.log(discount)
                let totals = discountNoPercentageCombination(item.product, discount, item.picked, item.price)
              //  console.log(totals)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
              //  console.log(discount)
                let totals = discountPercentageCombination(item.product, discount, item.picked, item.price)
             //   console.log(totals)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
            //    console.log(discount)
                let totals = discountNoPercentageNoCombination(item.product, discount, item.picked, item.price)
           //     console.log(totals)
                totalPrice = totals.discount + totals.remainder
            }
        }
        else{
            totalPrice = parseFloat(item.price) * parseFloat(item.amount)
        }
        return totalPrice
    })

    const calculatePriceWithDiscounts = ((item) => {
        var totalPrice = 0
        let cart = store.getters['shoppingcart/getShoppingCart']
        if (Object.keys(cart).length > 0) {
            var discount = isDiscounted(item.product)
        }
        if(discount){
            if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                let totals = discountPercentageNoCombination(item.product, discount, item.amount)
                //totalPrice +=  parseFloat((parseFloat(value.product.price) *(1 - discount.discount_price/100))) * parseFloat(value.amount)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                let totals = discountNoPercentageCombination(item.product, discount, item.amount)
                totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                let totals = discountPercentageCombination(item.product, discount, item.amount)
               totalPrice = totals.discount + totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                let totals = discountNoPercentageNoCombination(item.product, discount, item.amount)
                totalPrice = totals.discount + totals.remainder
            }
        }
        else{
            totalPrice = parseFloat(item.product.price) * parseFloat(item.amount)
        }
        return totalPrice
    })

    const clearItems = (() => {
        var result = confirm("Weet u zeker dat u het mandje wilt legen?");
        if (result) {
            store.commit('shoppingcart/clearAllItems')
        }
    })

    const clearItemsNoMessage = (() => {
        store.commit('shoppingcart/clearAllItems')
    })

    const isDiscounted = ((item, date) => {
        var data = null
        if(Array.isArray(item.product_has_discount_list)){
            if(item.product_has_discount_list.length > 0)
            item.product_has_discount_list.forEach((element) => {
                if(DateTime.fromISO(element.discount_info.starting_date) <= DateTime.fromISO(date) && DateTime.fromISO(element.discount_info.end_date) >= DateTime.fromISO(date)){
                    data = element
                }
            });
        }
        return data
        
    })
    
    //Input product, amount in cart
    //Returns original price
    

    //Input product, discount type, amount in cart
    //Returns remainder price and discounted price
    const discountPercentageNoCombination = ((cartItem, discount, amount, price) => {

        const minAmount = discount.discount_info.discount_type.min_amount

        let remainder = amount % minAmount
        let amountWithDiscount = amount - remainder

        let priceWithDiscount = parseFloat(amountWithDiscount) * parseFloat(price) * (1 - parseFloat(discount.discount_price/100))
        let priceRemainder = (parseFloat(remainder) * parseFloat(price))

        return {remainder: priceRemainder, discount: priceWithDiscount}
    })

    const discountNoPercentageNoCombination = ((cartItem, discount, amount, price) => {

        const minAmount = discount.discount_info.discount_type.min_amount
        let remainder = amount % minAmount
        let amountWithDiscount = amount - remainder
        

        let priceWithDiscount = parseFloat(amountWithDiscount) * (parseFloat(discount.discount_price) / parseInt(discount.discount_info.discount_type.min_amount))
        let priceRemainder = (parseFloat(remainder) * parseFloat(price))

        return {remainder: priceRemainder, discount: priceWithDiscount}
    })

    const discountPercentageCombination =((cartItem, discount, amount, price, cart) => {
        
        var combination = []
        var totalAmount = 0
        var highestPriceProduct = cartItem
        //var cart = store.getters.getShoppingCart
        for(const value of Object.values(cart)){
            let discount2 = isDiscounted(value.product)
            if(discount2?.discount_id == discount.discount_id){
                combination.push({product: value.product, amount: value.amount, price: value.price})
                totalAmount += value.amount
                if(value.price > highestPriceProduct.price){
                    highestPriceProduct = value.product
                }
                else if(value.product.price == highestPriceProduct.price && value.product.product_id > highestPriceProduct.product_id){
                    highestPriceProduct = value.product
                }
            }
        }
        
        combination = combination.sort((a, b) =>  b.price - a.price)
        const minAmount = discount.discount_info.discount_type.min_amount
        if(cartItem.id != highestPriceProduct.id){
            if((amount - totalAmount % minAmount) < 0){
                let totalAmountCopy = totalAmount
                for(var i = 0; i < combination.length; i++){
                    let remind = totalAmountCopy - combination[i].amount
                    if(remind <= 0){
                        break;
                    }
                    else if(remind > 0){                        
                        let priceWithDiscount = parseFloat(amount) * parseFloat(cartItem.price) * (1 - parseFloat(discount.discount_price/100))
                        let priceWithoutDiscount = parseFloat(remind) * parseFloat(cartItem.price)
                       return {remainder: priceWithoutDiscount, discount: priceWithDiscount}
                    }
                    else{
                        totalAmountCopy -= combination[i].amount
                    }
                }
            }
            
            let priceWithDiscount = parseFloat(amount) * parseFloat(cartItem.price) * (1 - parseFloat(discount.discount_price/100))
            return {remainder: parseFloat(0.00), discount: priceWithDiscount}
        }
        else{
            let remainder = totalAmount % minAmount
            if(remainder > 0){
                let nonDiscountAmount = amount - remainder
                if(nonDiscountAmount <= 0 ){
                    nonDiscountAmount = 0
                    let priceWithDiscount = parseFloat(nonDiscountAmount) * parseFloat(cartItem.price) * (1 - parseFloat(discount.discount_price/100))
                    let priceWithoutDiscount = parseFloat(remainder) * parseFloat(cartItem.price)
                    return {remainder: priceWithoutDiscount, discount: priceWithDiscount}
                }
                else{
                    let priceWithDiscount = parseFloat(nonDiscountAmount) * parseFloat(cartItem.price) * (1 - parseFloat(discount.discount_price/100))
                    let priceWithoutDiscount = parseFloat(remainder) * parseFloat(cartItem.price)
                    return {remainder: priceWithoutDiscount, discount: priceWithDiscount}
                }
            }
            else{
                let priceWithDiscount = parseFloat(amount) * parseFloat(cartItem.price) * (1 - parseFloat(discount.discount_price/100))
                return {remainder: parseFloat(0.00), discount: priceWithDiscount}
            }
        }        
    })

    const discountNoPercentageCombination =((cartItem, discount, amount, price, cart) => {
        
        var combination = []
        var totalAmount = 0
        var highestPriceProduct = cartItem

        cart = store.getters['shoppingcart/getShoppingCart']
        for(const value of Object.values(cart)){
            let discount2 = isDiscounted(value.product)
            if(discount2?.discount_id == discount.discount_id){
                combination.push({product: value.product, amount: value.amount, price: value.product.price})
                totalAmount += value.amount
                if(value.product.price > highestPriceProduct.price){
                    highestPriceProduct = value.product
                }
                else if(value.product.price == highestPriceProduct.price && value.product.product_id > highestPriceProduct.product_id){
                    highestPriceProduct = value.product
                }
            }
        }
        
        combination = combination.sort((a, b) =>  b.price - a.price)
        const minAmount = discount.discount_info.discount_type.min_amount
        if(cartItem.id != highestPriceProduct.id){
            if((amount - totalAmount % minAmount) < 0){
                let totalAmountCopy = totalAmount
                for(var i = 0; i < combination.length; i++){
                    let remind = totalAmountCopy - combination[i].amount
                    if(remind <= 0){
                        break;
                    }
                    else if(remind > 0){                        
                        let priceWithDiscount = parseFloat(amount) * (parseFloat(discount.discount_price) / parseInt(discount.discount_info.discount_type.min_amount))
                        let priceWithoutDiscount = parseFloat(remind) * parseFloat(cartItem.price)

                        return {remainder: priceWithoutDiscount, discount: priceWithDiscount}
                    }
                    else{
                        totalAmountCopy -= combination[i].amount
                    }
                }
            }
            
            let priceWithDiscount = parseFloat(amount) * (parseFloat(discount.discount_price) / parseInt(discount.discount_info.discount_type.min_amount))
            return {remainder: parseFloat(0.00), discount: priceWithDiscount}
        }
        else{
            let remainder = totalAmount % minAmount
            if(remainder > 0){
                let nonDiscountAmount = amount - remainder
                if(nonDiscountAmount <= 0 ){
                    //let priceWithDiscount = parseFloat(amount) * (parseFloat(discount.discount_price) / parseInt(discount.discount_info.discount_type.min_amount))
                    let priceWithoutDiscount = parseFloat(remainder) * parseFloat(cartItem.price)
                    return {remainder: priceWithoutDiscount, discount: parseFloat(0.00)}
                }
                else{
                    let priceWithDiscount = parseFloat(nonDiscountAmount) * (parseFloat(discount.discount_price) / parseInt(discount.discount_info.discount_type.min_amount))
                    let priceWithoutDiscount = parseFloat(remainder) * parseFloat(cartItem.price)

                    return {remainder: priceWithoutDiscount, discount: priceWithDiscount}
                }
            }
            else{
                let priceWithDiscount = parseFloat(amount) * (parseFloat(discount.discount_price) / parseInt(discount.discount_info.discount_type.min_amount))
                return {remainder: parseFloat(0.00), discount: priceWithDiscount}
            }
        }        
    })

    const calculateTotalPrice = (() =>{
        var totalPrice = 0
        let cart = store.getters['shoppingcart/getShoppingCart']
        for (const value of Object.values(cart)) {
            var discount = isDiscounted(value.product)
            if(discount){
                if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                    let totals = discountPercentageNoCombination(value.product, discount, value.amount)
                    //totalPrice +=  parseFloat((parseFloat(value.product.price) *(1 - discount.discount_price/100))) * parseFloat(value.amount)
                    totalPrice += totals.discount + totals.remainder
                }
                else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                    let totals = discountNoPercentageCombination(value.product, discount, value.amount)
                    totalPrice += totals.discount + totals.remainder
                }
                else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                    let totals = discountPercentageCombination(value.product, discount, value.amount)
                    totalPrice += totals.discount + totals.remainder
                }
                else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                    let totals = discountNoPercentageNoCombination(value.product, discount, value.amount)
                   totalPrice += totals.discount + totals.remainder
                }
                 /*    if(discount.discount_info.isCombination == false){
                        if(value.amount >= discount.discount_info.discount_type.min_amount){
                            let remainder = value.amount % discount.discount_info.discount_type.min_amount
                            totalPrice += (parseFloat(value.amount) - parseFloat(remainder)) * parseFloat(value.product.price) * parseFloat(discount.discount_info.discount_type.default_calculation)
                            totalPrice += (parseFloat(remainder) * parseFloat(value.product.price))
                        }
                        else{
                            totalPrice += (parseFloat(value.amount) * parseFloat(value.product.price))
                        }
                    }
                    else{

                    }
                   if(discount.discount_info.isCombination == true){
                        var combination = [{product: value.product, amount: value.amount}]
                        var highest = value
                        var totalamount = value.amount
                        for(const [key1, value1] of Object.entries(cart)){
                            var discount1 = isDiscounted(value1.product)
                            if(discount1 && value1.product.product_id != value.product.product_id){
                                if(discount.discount_id == discount1.discount_id){
                                    combination.push({product: value1.product, amount: value1.amount})
                                    totalamount += value1.amount
                                    if(highest.product.price < value1.product.price) highest = value1
                                }
                            }
                        }
                        if(totalamount >= discount.discount_info.discount_type.min_amount){
                            if(value.product.price == highest.product.price){
                                let remainder = totalamount % discount.discount_info.discount_type.min_amount
                                var amount = value.amount
                                if(remainder >= 0 ){
                                    amount -= remainder
                                    totalPrice +=  (parseFloat(value.product.price) * parseFloat(amount) * parseFloat(discount.discount_info.discount_type.default_calculation))
                                    totalPrice +=  (parseFloat(value.product.price) * parseFloat(remainder))
                                
                                }
                                else{
                                    totalPrice +=  (parseFloat(value.product.price) * parseFloat(amount) * parseFloat(discount.discount_info.discount_type.default_calculation))
                                }
                                if(amount <= 0){
                                    totalPrice +=  (parseFloat(value.product.price) * parseFloat(value.amount))
                                }
                                
                            }
                            else{
                                totalPrice +=  (parseFloat(value.product.price) * parseFloat(value.amount) * parseFloat(discount.discount_info.discount_type.default_calculation))
                            }
                        }
                        else{
                            totalPrice += parseFloat(value.product.price) * parseFloat(value.amount || 0)
                        }                    
                    }
                    else{
                        if(value.amount >= discount.discount_info.discount_type.min_amount){
                            let remainder = value.amount % discount.discount_info.discount_type.min_amount
                            console.log(remainder)
                            console.log((parseFloat(discount.discount_price) * parseFloat(value.amount - remainder)))
                            totalPrice +=  (parseFloat(discount.discount_price) * parseFloat(value.amount - remainder) * parseFloat(discount.discount_info.discount_type.default_calculation)) 
                            totalPrice += (parseFloat(value.product.price) * parseFloat(remainder || 0))
                        }
                        else{
                            totalPrice += parseFloat(value.product.price) * parseFloat(value.amount || 0)
                        }    
                    }                
                }*/
            }
            else{
                totalPrice += parseFloat(value.product.price) * parseFloat(value.amount || 0)
               }
        }
        //store.getters.getShoppingCart.map().forEach(element => {
       //     totalPrice += parseFloat(element.product.price) * parseFloat(element.amount)
       // });
        return totalPrice.toFixed(2)
    })

    const isItemInCart = ((item) => {
        let cart = store.getters['shoppingcart/getShoppingCart']
        if(cart[item.id]) return cart[item.id].amount
        return 0
    })

    const calculateZegels = ((gap, toggle) =>{
		if(toggle) return Math.floor(calculateTotalPrice() / gap)
		return 0
	})

    
    const calculateMunten = ((gap, toggle, checkedActies, acties) =>{
        var highest = 0.00;
        for(var item in checkedActies){
            let actie = acties.find(el => el.spaaractie_id === checkedActies[item])
            let amount = calculateZegels(actie.stamp_price, true)
            if(highest < amount * actie.stamp_price) highest = amount * actie.stamp_price
        }
        let leftover = calculateTotalPrice() - highest
		if(toggle) return Math.floor(leftover / gap)
		return 0
	})

    const validateZegels =  ((amount, max) =>{
        if(amount > max) return max
        if(amount < 0) return 0
        if(!amount) return 0
        return amount
    })

    const calculateDeposit = (() => {
        var totalDeposit = 0
        let cart = store.getters['shoppingcart/getShoppingCart']
        for (const value of Object.values(cart)) {
            totalDeposit += parseFloat((parseFloat(value.product.statiegeld || 0).toFixed(2) * parseFloat(value.amount || 0).toFixed(2)))
        }
        return totalDeposit.toFixed(2)
    })

    const calculateVAT = (() => {
        var totalVat = 0
        let cart = store.getters['shoppingcart/getShoppingCart']
        for (const value of Object.values(cart)) {
            totalVat += parseFloat((parseFloat(value.product.price || 0).toFixed(2) *parseFloat(value.amount || 0)) / (parseFloat(value.product.btw || 0) + 100) * parseFloat(value.product.btw || 0))
        }
        return totalVat.toFixed(2)
    })

    const calculateTotalPriceWithExtra = ((extra) => {
        return parseFloat((calculateDeposit() || 0)) + parseFloat((extra.reduce((a, b) => a + b, 0))) + parseFloat(calculateTotalPrice()) 
    })
    
   export default {
       calculatePrice,
       calculateDiscountPrice,
       calculatePriceWithDiscounts,
       isItemInCart,
       calculateTotalPrice,
       calculateTotalPriceWithExtra,
       clearItems,
       clearItemsNoMessage,
       calculateZegels,
       validateZegels,
       calculateDeposit,
       calculateVAT,
       calculateMunten,
       isDiscounted,
       calculateProductPriceWithDiscountDate
   }