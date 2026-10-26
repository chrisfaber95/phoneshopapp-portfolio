export default {
    namespaced: true,
    state () {
        return{
            groceryList: Object.create(null)
        }
    },
    getters: {
        getGroceryList (state) {
            return state.groceryList
        }
    },
    mutations: {
        addItemToGroceryList(state, payload){
            if(state.groceryList[payload.product.id]){
                state.groceryList[payload.product.id].amount += payload.amount
                state.groceryList[payload.product.id].check = payload.check
            } 
            else { 
                state.groceryList[payload.product.id] = payload 
            }
            localStorage.setItem('groceryList', JSON.stringify(state.groceryList))
        },
        updateItemAmountGroceryList(state, payload){
            var check = false
            if(state.groceryList[payload.product.id]){
                check = state.groceryList[payload.product.id].check
            }
            payload.check = check
            state.groceryList[payload.product.id] = payload
            if(payload.amount <= 0 || !payload.amount) delete state.groceryList[payload.product.id]
            localStorage.setItem('groceryList', JSON.stringify(state.groceryList))
        },
        clearAllItemsGroceryList(state){
            state.groceryList = Object.create(null)
            localStorage.setItem('groceryList', JSON.stringify(state.groceryList))
        },
        reloadGroceryList(state){
            state.groceryList = JSON.parse(localStorage.getItem('groceryList'))
        },
        updateCheckListItem(state, payload){
            if(state.groceryList[payload.product.id]){
                if(state.groceryList[payload.product.id].check != payload.check){
                    state.groceryList[payload.product.id].check = payload.check
                }
            }
            localStorage.setItem('groceryList', JSON.stringify(state.groceryList))
        }
    },
    actions: {},
    modules: {}
}