export default {
    namespaced: true,
    state () {
        return{
            orders: Object.create(null)
        }
    },
    getters: {
        getOrders(state){
            return state.orders
        }
    },
    mutations: {
        addOrderToList(state, payload){
            if(!(payload.id in state.orders)){
                state.orders[payload.id] = payload
            }
        },
        removeOrderFromList(state, payload){
            if(payload.id in state.orders){
                delete state.orders[payload.id]
            }
        },
        newOrdersList(state, payload){
            for(const key in payload){
                if(!(payload[key].id in state.orders)){
                    state.orders[payload[key].id] = payload[key]
                }
            }
        },
        updateOrderInList(state, payload){
            state.orders[payload.id] = payload
        }
        
    },
    actions: {},
    modules: {}
}