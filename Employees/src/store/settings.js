export default {
    namespaced: true,
    state () {
        return{
            loggedIn: false,
            unAuth: false,
            products: [],
            departments: [],
            editProduct: null
        }
    },
    getters: {
        getLoggedIn(state){
            return state.loggedIn
        },        
        getUnAuth(state){
            return state.unAuth
        },        
        getProducts(state){
            return state.products
        },        
        getDepartments(state){
            return state.departments
        },
        getEditProduct(state){
            return state.editProduct
        }
    },
    mutations: {
        updateLoggedIn(state, payload){
            state.loggedIn = payload
        },
        updateUnAuth(state, payload){
            state.unAuth = payload
        },
        updateProducts(state, payload){
            state.products = payload
        },
        updateDepartments(state, payload){
            state.departments = payload
        },
        updateEditProduct(state, payload){
            state.editProduct = payload
        }
    },
    actions: {},
    modules: {}
}