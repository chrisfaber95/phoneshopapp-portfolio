export default {
    namespaced: true,
    state () {
        return{
            loggedIn: false
        }
    },
    getters: {
        getLoggedIn(state){
            return state.loggedIn
        }
    },
    mutations: {
        updateLoggedIn(state, payload){
            state.loggedIn = payload
        }
    },
    actions: {},
    modules: {}
}