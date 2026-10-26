import { createApp } from 'vue';
import store from '@/store';
import {DateTime} from 'luxon'
import auth from '../scripts/auth';
//import {VueSimpleAlert as VSA} from "vue3-simple-alert";
import VueSimpleAlert from 'vue3-simple-alert';

const app = createApp({});

app.use(VueSimpleAlert);

const checkNix18 = ( async (item) => {
    return new Promise((resolve) => {

        if(!localStorage.getItem('nix18') || localStorage.getItem('nix18') == 0){
            if(auth.isNotUnderaged()){
                localStorage.setItem('nix18', 1)
                resolve(true)
            }
            else{
                app.$confirm(                    
                    `Om "${item.product_information.title}" toe te voegen te gaan verklaart u hierbij dat u ouder bent dan 18 jaar.`,
                    "NIX18",
                    'warning',
                    {
                        confirmButtonText: 'Ja',
                        cancelButtonText: 'Nee',
                        confirmButtonColor: '#F58320',
                        cancelButtonColor: '#e4e4e4',
                        duration: 10000,
                    }
                )
                .then((e) => {
                    if(e === true){
                        localStorage.setItem('nix18', 1)
                        resolve(e)
                    }
                    else{                                    
                        localStorage.setItem('nix18', 0)
                        resolve(e)
                    }
                })
                .catch((e) => {
                    resolve(e)
                })   
            }
        }
        else{
            if(localStorage.getItem('nix18') == 1){
                resolve(true)
            }
            else{
                resolve(false)
            }
        }
    })
})


    const addItemToCart = ( async (item, amount) => {
        var nix18 = true;
        if(item.nix18 == true && amount > 0){            
            nix18 = await checkNix18(item);
        }
        if(nix18 === true){
            store.commit('grocerylist/addItemToGroceryList', {product: item, amount: amount, check: false})
        }
    })
    
    const updateItemAmount = ( async (item, amount) => {
        
        var nix18 = true;
        if(item.nix18 == true && amount > 0){            
            nix18 = await checkNix18(item);
        }
        if(nix18 === true){
        let cart = store.getters['grocerylist/getGroceryList'] || []
        if(item.id in cart && cart[item.id].amount == amount){
            if(amount == 0){
                app.$confirm(                    
                `Weet u zeker dat u '${cart[item.id].product.product_information.title}' ${cart[item.id].amount > 1 ? 'volledig ' : ''}uit uw winkelmandje wilt halen?`,
                "Product verwijderen",
                'warning',
                {
                    confirmButtonText: 'Ja',
                    cancelButtonText: 'Nee',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 10000,
                })
                .then(() => {
                    store.commit('grocerylist/updateItemAmountGroceryList', {product: item, amount: amount})
                })
                .catch(() => {

                })
            }
            else{
                store.commit('grocerylist/updateItemAmountGroceryList', {product: item, amount: amount})
            }
        }
        else{
            if(amount === 0 && !cart[item.id]){
                console.log('')
                }
            else if((amount === 0 && cart[item.id].amount > 0)){
                
                //if(VSA.confirm(`Weet u zeker dat u dit product ${cart[item.id].amount > 1 ? 'volledig ' : ''}uit uw winkelmandje wilt halen?`)){
                    app.$confirm(                    
                    `Weet u zeker dat u '${cart[item.id].product.product_information.title}' ${cart[item.id].amount > 1 ? 'volledig ' : ''}uit uw winkelmandje wilt halen?`,
                    "Product verwijderen",
                    'warning',
                    {
                        confirmButtonText: 'Ja',
                        cancelButtonText: 'Nee',
                        confirmButtonColor: '#F58320',
                        cancelButtonColor: '#e4e4e4',
                        duration: 10000,
                    }
                )
                .then(() => {
                    store.commit('grocerylist/updateItemAmountGroceryList', {product: item, amount: amount})
                })
                .catch(() => {

                })
            }
            else{
                store.commit('grocerylist/updateItemAmountGroceryList', {product: item, amount: amount})
            }
        }
    }
    })

    const updateCheckItem = ((item, check) =>{
        store.commit('grocerylist/updateCheckListItem', {product: item, check: check})
    })
    
    const calculatePrice = ((item) => {
        var discount = isDiscounted(item.product)
        if(discount){
            if(discount.isPercentage){
                return (+item.product.price * (1 - discount.discount_price/100)).toFixed(2)
            }
        }
        return item.product.price.toFixed(2)
    })

    const calculateDiscountPrice = ((item) => {
        
        var totalPrice = 0
       // let cart = store.getters['grocerylist/getGroceryList']']
       // for (const [key, value] of Object.entries(cart)) {
            var discount = isDiscounted(item)
       // }
        if(discount){
            if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                let totals = discountPercentageNoCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                let totals = discountNoPercentageCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                let totals = discountPercentageCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                let totals = discountNoPercentageNoCombination(item, discount, discount.discount_info.discount_type.min_amount)
                totalPrice = +totals.discount + +totals.remainder
            }
        }
        else{
            totalPrice = +item.product.price * +item.amount
        }
        return totalPrice.toFixed(2)
    })

    const calculateProductPriceWithDiscount = ((item) => {        
        var totalPrice = 0
       // let cart = store.getters['grocerylist/getGroceryList']']
       // for (const [key, value] of Object.entries(cart)) {
            var discount = isDiscounted(item.product)
       // }
        if(discount){
            if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                let totals = discountPercentageNoCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                let totals = discountNoPercentageCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                let totals = discountPercentageCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                let totals = discountNoPercentageNoCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
        }
        else{
            totalPrice = +item.product.price * +item.amount
        }
        return totalPrice.toFixed(2)
    })

    const calculatePriceWithDiscounts = ((item) => {
        var totalPrice = 0
        let cart = store.getters['grocerylist/getGroceryList']
        if (Object.keys(cart).length > 0) {
            var discount = isDiscounted(item.product)
        }
        if(discount){
            if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                let totals = discountPercentageNoCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                let totals = discountNoPercentageCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                let totals = discountPercentageCombination(item.product, discount, item.amount)
               totalPrice = +totals.discount + +totals.remainder
            }
            else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                let totals = discountNoPercentageNoCombination(item.product, discount, item.amount)
                totalPrice = +totals.discount + +totals.remainder
            }
        }
        else{
            totalPrice = +item.product.price * +item.amount
        }
        return totalPrice.toFixed(2)
    })

    const clearItems = (() => {
        
        app.$confirm(                    
            `Om "Weet u zeker dat u het mandje wilt legen?`,
            "Mandje legen",
            'warning',
            {
                confirmButtonText: 'Ja',
                cancelButtonText: 'Nee',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                duration: 10000,
            }
        )
        .then((e) => {
            if(e === true){
                store.commit('grocerylist/clearAllItemsGroceryList')
        }
        })
        .catch((e) => {
        })  
    })

    const clearItemsNoMessage = (() => {
        store.commit('grocerylist/clearAllItemsGroceryList')
    })

    const isDiscounted = ((item) => {
        var data = null
        if(Array.isArray(item.product_has_discount_list)){
            if(item.product_has_discount_list.length > 0)
            item.product_has_discount_list.forEach((element) => {
                if(DateTime.fromISO(element.discount_info.starting_date) <= DateTime.now() && DateTime.fromISO(element.discount_info.end_date) >= DateTime.now()){
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
    const discountPercentageNoCombination = ((cartItem, discount, amount) => {

        const minAmount = discount.discount_info.discount_type.min_amount

        let remainder = amount % minAmount
        let amountWithDiscount = amount - remainder

        let priceWithDiscount = +amountWithDiscount * +cartItem.price * (1 - +discount.discount_price/100)
        let priceRemainder = +remainder * +cartItem.price

        return {remainder: priceRemainder.toFixed(2), discount: priceWithDiscount.toFixed(2)}
    })

    const discountNoPercentageNoCombination = ((cartItem, discount, amount) => {

        const minAmount = discount.discount_info.discount_type.min_amount
        let remainder = amount % minAmount
        let amountWithDiscount = amount - remainder
        

        let priceWithDiscount = +amountWithDiscount * +discount.discount_price / +discount.discount_info.discount_type.min_amount
        let priceRemainder = +remainder * +cartItem.price

        return {remainder: priceRemainder.toFixed(2), discount: priceWithDiscount.toFixed(2)}
    })

    const discountPercentageCombination =((cartItem, discount, amount) => {
        
        var combination = []
        var totalAmount = 0
        var highestPriceProduct = cartItem
        var cart = store.getters['grocerylist/getGroceryList']
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
                        let priceWithDiscount = +amount * +cartItem.price * (1 - +discount.discount_price/100)
                        let priceWithoutDiscount = +remind * +cartItem.price
                        return {remainder: priceWithoutDiscount.toFixed(2), discount: priceWithDiscount.toFixed(2)}
                    }
                    else{
                        totalAmountCopy -= combination[i].amount
                    }
                }
            }
            
            let priceWithDiscount = +amount * +cartItem.price * (1 - +discount.discount_price/100)
            return {remainder: +0.00, discount: priceWithDiscount.toFixed(2)}
        }
        else{
            let remainder = totalAmount % minAmount
            if(remainder > 0){
                let nonDiscountAmount = amount - remainder
                if(nonDiscountAmount <= 0 ){
                    nonDiscountAmount = 0
                    let priceWithDiscount = +nonDiscountAmount * +cartItem.price * (1 - +discount.discount_price/100)
                    let priceWithoutDiscount = +remainder * +cartItem.price
                    return {remainder: priceWithoutDiscount.toFixed(2), discount: priceWithDiscount.toFixed(2)}
                }
                else{
                    let priceWithDiscount = +nonDiscountAmount * +cartItem.price * (1 - +discount.discount_price/100)
                    let priceWithoutDiscount = +remainder * +cartItem.price
                    return {remainder: priceWithoutDiscount.toFixed(2), discount: priceWithDiscount.toFixed(2)}
                }
            }
            else{
                let priceWithDiscount = +amount * +cartItem.price * (1 - +discount.discount_price/100)
                return {remainder: +0.00, discount: priceWithDiscount.toFixed(2)}
            }
        }        
    })

    const discountNoPercentageCombination =((cartItem, discount, amount) => {
        
        var combination = []
        var totalAmount = 0
        var highestPriceProduct = cartItem

        var cart = store.getters['grocerylist/getGroceryList']
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
                        let priceWithDiscount = +amount * (+discount.discount_price / +discount.discount_info.discount_type.min_amount)
                        let priceWithoutDiscount = +remind * +cartItem.price

                        return {remainder: priceWithoutDiscount.toFixed(2), discount: priceWithDiscount.toFixed(2)}
                    }
                    else{
                        totalAmountCopy -= combination[i].amount
                    }
                }
            }
            
            let priceWithDiscount = +amount * (+discount.discount_price / +discount.discount_info.discount_type.min_amount)
            return {remainder: +0.00, discount: priceWithDiscount.toFixed(2)}
        }
        else{
            let remainder = totalAmount % minAmount
            if(remainder > 0){
                let nonDiscountAmount = amount - remainder
                if(nonDiscountAmount <= 0 ){
                   let priceWithoutDiscount = +remainder * +cartItem.price
                    return {remainder: priceWithoutDiscount.toFixed(2), discount: +0.00}
                }
                else{
                    let priceWithDiscount = +nonDiscountAmount * (+discount.discount_price / +discount.discount_info.discount_type.min_amount)
                    let priceWithoutDiscount = +remainder * +cartItem.price

                    return {remainder: priceWithoutDiscount.toFixed(2), discount: priceWithDiscount.toFixed(2)}
                }
            }
            else{
                let priceWithDiscount = +amount * (+discount.discount_price / +discount.discount_info.discount_type.min_amount)
                return {remainder: +0.00, discount: priceWithDiscount.toFixed(2)}
            }
        }        
    })

    const calculateTotalPrice = (() =>{
        var totalPrice = 0
        let cart = store.getters['grocerylist/getGroceryList']
        for (const value of Object.values(cart)) {
            var discount = isDiscounted(value.product)
            if(discount){
                if(discount.isPercentage == true && discount.discount_info.isCombination == false){
                    let totals = discountPercentageNoCombination(value.product, discount, value.amount)
                   totalPrice += +totals.discount + +totals.remainder
                }
                else if(discount.isPercentage == false && discount.discount_info.isCombination == true){
                    let totals = discountNoPercentageCombination(value.product, discount, value.amount)
                    totalPrice += +totals.discount + +totals.remainder
                }
                else if(discount.isPercentage == true && discount.discount_info.isCombination == true){
                    let totals = discountPercentageCombination(value.product, discount, value.amount)
                    totalPrice += +totals.discount + +totals.remainder
                }
                else if(discount.isPercentage == false && discount.discount_info.isCombination == false){
                    let totals = discountNoPercentageNoCombination(value.product, discount, value.amount)
                   totalPrice += +totals.discount + +totals.remainder
                }
            }
            else{
                totalPrice += +value.product.price * +(value.amount || 0)
               }
        }
        return totalPrice.toFixed(2)
    })

    const isItemInCart = ((item) => {
        let cart = store.getters['grocerylist/getGroceryList']
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
        let cart = store.getters['grocerylist/getGroceryList']
        for (const value of Object.values(cart)) {
            totalDeposit += +(value.product.statiegeld || 0) * +(value.amount || 0)
        }
        return totalDeposit.toFixed(2)
    })

    const calculateVAT = (() => {
        var totalVat = 0
        let cart = store.getters['grocerylist/getGroceryList']
        for (const value of Object.values(cart)) {
            totalVat += (+(value.product.price || 0) * +(value.amount || 0)) / (+(value.product.btw || 0) + 100) * +(value.product.btw || 0)
        }
        return totalVat.toFixed(2)
    })

    const calculateTotalPriceWithExtra = ((extra) => {
        const deposit = calculateDeposit() || 0
        const totalprice = calculateTotalPrice() || 0
        const extras = extra.reduce((a, b) => a + b, 0)

        const price = +deposit + +totalprice + +extras
        
        return price.toFixed(2)
    })
    
   export default {
       addItemToCart,
       updateItemAmount,
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
       calculateProductPriceWithDiscount,
       updateCheckItem
   }