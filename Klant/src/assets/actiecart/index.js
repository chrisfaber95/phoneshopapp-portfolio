import { createApp } from 'vue';
import store from '@/store';
import VueSimpleAlert from 'vue3-simple-alert';

const app = createApp({});

app.use(VueSimpleAlert);


    const addItemToCart = ((item, amount, actieItem, variant) => {
        if(store.getters['location/getCurrentActie'].stamp_amount < actieItem.stamps_cost * amount + calculateStampPrice()){
            app.$alert(                    
                `U heeft te weinig zegels om '${item.product_information.title}' toe te voegen aan uw mandje.`,
                "Te weinig zegels",
                'info',
                {
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 10000,
                }
            )
            .then(() => {
            })
        }
        else{
            if(variant.length > 0){
                var prev
                if(JSON.parse(localStorage.getItem('actiecart'))){
                    if(JSON.parse(localStorage.getItem('actiecart'))[item.id]){
                        prev = JSON.parse(localStorage.getItem('actiecart'))[item.id]?.variant
                        prev.push(variant)
                    }
                    else{
                        prev = [variant]
                    }
                }
                else{
                    prev = [variant]
                }
                var addedVariant = prev
            } 
            store.commit('actiecart/addItemToActieCart', {product: item, amount: amount, actieproduct: actieItem, variant: addedVariant || null})
        }
       // if(!bags.some(el => el.ean === item.ean)) calculateBags()
    })

    const deleteProductVariant = ((item, amount, actieItem, variant, variantlist) => {
        var filteredArray = variantlist.filter(e => e != variant)
        store.commit('actiecart/updateActieItemAmount', {product: item, amount: amount-1, actieproduct: actieItem, variant: filteredArray || null})
    })
    
    const updateItemAmount = ((item, amount, actieItem, variant) => {
        if(store.getters['actiecart/getActieShoppingCart'][item.id]){
            if(store.getters['location/getCurrentActie'].stamp_amount < actieItem.stamps_cost * (amount - parseInt(store.getters['actiecart/getActieShoppingCart'][item.id].amount)) + calculateStampPrice()){
                //store.commit('actiecart/updateActieItemAmount', {product: item, amount: max, actieproduct: actieItem, variant: addedVariant || null})
                app.$alert(                    
                    `U heeft te weinig zegels om '${item.product_information.title}' toe te voegen aan uw mandje.`,
                    "Te weinig zegels",
                    'info',
                    {
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#F58320',
                        cancelButtonColor: '#e4e4e4',
                        duration: 10000,
                    }
                )
                .then(() => {
                })
            }
            else{
                if(variant){
                    if(variant.length > 0){
                        var prev1
                        if(store.getters['actiecart/getActieShoppingCart'][item.id].variant != null){
                            if(store.getters['actiecart/getActieShoppingCart'][item.id].variant.length > amount){
                                const originalArray = store.getters['actiecart/getActieShoppingCart'][item.id].variant
                                
                                const arrayFromObject = Object.values(variant)
                                const indexToRemove = originalArray.findIndex((value) => {
                                    return JSON.stringify(value) === JSON.stringify(arrayFromObject);
                                  });
                                  
                                  const filteredArray =
                                    indexToRemove > -1
                                      ? [
                                          ...originalArray.slice(0, indexToRemove),
                                          ...originalArray.slice(indexToRemove + 1),
                                        ]
                                      : originalArray;

                                prev1 = filteredArray
                            }
                            else{
                                prev1 = store.getters['actiecart/getActieShoppingCart'][item.id].variant
                                prev1.push(variant)
                            }
                        }
                        else{
                            prev1 = [variant]
                        }
                        var addedVariant1 = prev1
                    }
                }
                store.commit('actiecart/updateActieItemAmount', {product: item, amount: amount, actieproduct: actieItem, variant: addedVariant1|| null})
            }
        }
        else{
            addItemToCart(item, amount, actieItem, variant)
        }
        //if(!bags.some(el => el.ean === item.ean)) calculateBags()
    })

    const calculatePrice = ((item) => {
        var calcPrice;
			calcPrice = parseFloat(item.product.price).toFixed(2);
			//calcPrice = (calcPrice * (1-(parseFloat(item.hasflyeroffer)/100))).toFixed(2);
			return calcPrice;
    })

    const calculatePriceWithDiscounts = ((item) => {
        return item.product.price * item.amount
    })

    const clearItems = (() => {
        var result = confirm("Weet u zeker dat u het mandje wilt legen?");
        if (result) {
            store.commit('actiecart/clearAllActieItems')
        }
    })
    
    const clearItemsNoMessage = (() => {
        store.commit('actiecart/clearAllActieItems')
    })

    const calculateTotalPrice = (() =>{
        var totalPrice = 0
        let cart = store.getters['actiecart/getActieShoppingCart']
        for (const value of Object.values(cart)) {
            totalPrice += parseFloat(value.product.price) * parseFloat(value.amount || 0)
        }
        //store.getters.getShoppingCart.map().forEach(element => {
       //     totalPrice += parseFloat(element.product.price) * parseFloat(element.amount)
       // });

        return totalPrice.toFixed(2)
    })

    
    const calculateStampPrice = (() => {
        var totalPrice = 0
        let cart = store.getters['actiecart/getActieShoppingCart']
        for (const value of Object.values(cart)) {
            totalPrice += parseInt(value.actieproduct.stamps_cost) * parseInt(value.amount || 0)
        }
        //store.getters.getShoppingCart.map().forEach(element => {
       //     totalPrice += parseFloat(element.product.price) * parseFloat(element.amount)
       // });

        return totalPrice
    })

    const isItemInCart = ((item) => {
        let cart = store.getters['actiecart/getActieShoppingCart']
        if(cart[item.id]) return cart[item.id].amount
        return 0
    })

    const calculateZegels = ((gap, toggle) =>{
		if(toggle) return Math.floor(calculateTotalPrice() / gap)
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
        let cart = store.getters['actiecart/getActieShoppingCart']
        for (const value of Object.values(cart)) {
            totalDeposit += parseFloat((parseFloat(value.product.statiegeld || 0).toFixed(2) * parseFloat(value.amount || 0).toFixed(2)))
        }
        return totalDeposit.toFixed(2)
    })

    const calculateVAT = (() => {
        var totalVat = 0
        let cart = store.getters['actiecart/getActieShoppingCart']
        for (const value of Object.values(cart)) {
            totalVat += parseFloat((parseFloat(value.product.price || 0).toFixed(2) *parseFloat(value.amount || 0)) / (parseFloat(value.product.btw || 0) + 100) * parseFloat(value.product.btw || 0))
        }
        return totalVat.toFixed(2)
    })

    const calculateTotalPriceWithExtra = ((extra) => {
        return parseFloat((calculateDeposit() || 0)) + parseFloat((extra.reduce((a, b) => a + b, 0))) + parseFloat(calculateTotalPrice()) 
    })
   export default {
       addItemToCart,
       deleteProductVariant,
       updateItemAmount,
       calculatePrice,
       calculateStampPrice,
       calculatePriceWithDiscounts,
       isItemInCart,
       calculateTotalPrice,
       calculateTotalPriceWithExtra,
       clearItems,
       calculateZegels,
       validateZegels,
       calculateDeposit,
       calculateVAT,
       clearItemsNoMessage
   }