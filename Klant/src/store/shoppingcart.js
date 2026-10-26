import store from '@/store'
import cart from '@/assets/cart'
export default {
    namespaced: true,
    state () {
        return{
            shoppingCart: Object.create(null),
            koopzegelAmount: 0,
            favorites: Object.create(null),
        }
    },
    getters: {
        getShoppingCart (state) {
            return state.shoppingCart
        },
        getKoopzegels (state) {
            return state.koopzegelAmount
        },
        getFavorites (state) {
            return state.favorites
        }
    },
    mutations: {
        addItemToCart(state, payload){
            if(state.shoppingCart[payload.product.id]){
                state.shoppingCart[payload.product.id].amount += payload.amount
            } 
            else { 
                state.shoppingCart[payload.product.id] = payload 
            }
            localStorage.setItem('cart', JSON.stringify(state.shoppingCart))
        },
        updateItemAmount(state, payload){
            state.shoppingCart[payload.product.id] = payload
            if(payload.amount <= 0 || !payload.amount) delete state.shoppingCart[payload.product.id]
            localStorage.setItem('cart', JSON.stringify(state.shoppingCart))
        },
        clearAllItems(state){
            state.shoppingCart = Object.create(null)
            localStorage.setItem('cart', JSON.stringify(state.shoppingCart))
        },
        reloadCart(state){
            state.shoppingCart = JSON.parse(localStorage.getItem('cart'))
        },
        updateKoopzegelAmount(state, payload){
            state.koopzegelAmount = payload
        },
        listToMand(state){
            for (const key in store.state.grocerylist.groceryList) {
                if (Object.hasOwnProperty.call(store.state.grocerylist.groceryList, key)) {
                    const element = store.state.grocerylist.groceryList[key];
                    if(state.shoppingCart[element.product.id]){
                        state.shoppingCart[element.product.id].amount += element.amount
                    } 
                    else { 
                        state.shoppingCart[element.product.id] = element 
                    }
                    localStorage.setItem('cart', JSON.stringify(state.shoppingCart))
                }
            }
            cart.calculateBags()
            //state.shoppingCart = JSON.parse(localStorage.getItem('groceryList'))
        },
        addItemToFvorites(state, payload){
            if(state.shoppingCart[payload.product.id]){
                state.shoppingCart[payload.product.id].amount += payload.amount
            } 
            else { 
                state.shoppingCart[payload.product.id] = payload 
            }
            localStorage.setItem('cart', JSON.stringify(state.shoppingCart))
        }

    },
    actions: {},
    modules: {}
}