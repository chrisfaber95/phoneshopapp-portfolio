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
            if(!(payload.actie_order_id in state.orders)){
                state.orders[payload.actie_order_id] = payload
            }
        },
        removeOrderFromList(state, payload){
            if(payload.actie_order_id in state.orders){
                delete state.orders[payload.actie_order_id]
            }
        },
        newOrdersList(state, payload){
            for(const key in payload){
                if(!(payload[key].actie_order_id in state.orders)){
                    state.orders[payload[key].actie_order_id] = payload[key]
                }
            }
        },
        updateOrderInList(state, payload){
            state.orders[payload.actie_order_id] = payload
        }
        
    },
    actions: {},
    modules: {}
}