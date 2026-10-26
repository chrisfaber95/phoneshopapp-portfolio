export default {
    namespaced: true,
    state () {
        return{
            actieShoppingCart: Object.create(null)
        }
    },
    getters: {
        getActieShoppingCart (state) {
            return state.actieShoppingCart
        }
    },
    mutations: {
        addItemToActieCart(state, payload){
            if(state.actieShoppingCart[payload.product.id]){
                state.actieShoppingCart[payload.product.id].amount += payload.amount
                state.actieShoppingCart[payload.product.id].variant = payload.variant
            }
            else {
                state.actieShoppingCart[payload.product.id] = payload        
            }
            localStorage.setItem('actiecart', JSON.stringify(state.actieShoppingCart))
        },
        updateActieItemAmount(state, payload){
            state.actieShoppingCart[payload.product.id] = payload
            if(payload.amount <= 0 || !payload.amount) delete state.actieShoppingCart[payload.product.id]
            localStorage.setItem('actiecart', JSON.stringify(state.actieShoppingCart))
        },
        clearAllActieItems(state){
            state.actieShoppingCart = Object.create(null)
            localStorage.setItem('actiecart', JSON.stringify(state.actieShoppingCart))
        },
        reloadActieCart(state){
            state.actieShoppingCart = JSON.parse(localStorage.getItem('actiecart'))
        }
    },
    actions: {},
    modules: {}
}