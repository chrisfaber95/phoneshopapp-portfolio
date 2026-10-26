export default {
    namespaced: true,
    state () {
        return{
            amountOfShelf: 4,
            shelfStyle: 0,
            loggedIn: false ,
            opened: 0,
            favoriteProducts: Object.create(null),
            userinfo: {}
        }
    },
    getters: {
        getShelfStyle(state){
            return state.shelfStyle
        },
        getAmountOfShelf(state){
            return state.amountOfShelf
        },
        getLoggedIn(state){
            return state.loggedIn
        },
        getOpened(state){
            return state.opened
        },
        getFavorites(state){
            return state.favoriteProducts
        },
        getUserinfo(state){
            return state.userinfo
        }
    },
    mutations: {
        changeShelfSize(state, payload){
            state.amountOfShelf = payload
        },       
        changeShelfStyle(state, payload){
            state.shelfStyle = payload
        },
        updateLoggedIn(state, payload){
            state.loggedIn = payload
        },
        updateOpened(state, payload){
            localStorage.setItem('opened', payload)
            state.opened = payload
        },
        updateFavorites(state, payload){
            state.favoriteProducts = Object.create(null)
            for (const key in payload) {
                state.favoriteProducts[payload[key].product_id] = payload[key]
            }
        },
        addFavorite(state, payload){
            state.favoriteProducts[payload.product_id] = payload
        },
        removeFavorite(state, payload){
            delete state.favoriteProducts[payload]
        },
        updateUserinfo(state, payload){
            state.userinfo = payload
        },
    },
    actions: {},
    modules: {}
}