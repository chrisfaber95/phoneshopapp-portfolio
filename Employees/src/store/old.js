
export default {
    namespaced: true,
    state () {
        return{
            pickingMethod: '',
            alarm: 0,
            unAuth: false
        }
    },
    getters: {
        getUnAuth (state) {
            return state.unAuth
        }
    },
    mutations: {
        updateUnAuth(state, payload){
            state.unAuth = payload
        },
        updatePickingMethod(state, payload) {
            state.pickingMethod = payload
        },
        updateAlarm(state, payload){
            state.alarm = payload
        },
        clearAlarm(state){
            state.alarm = 0
        }
    },
    actions: {},
    modules: {}
}
