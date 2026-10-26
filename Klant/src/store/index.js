import { createStore } from 'vuex'
import actiecart from './actiecart'
import grocerylist from './grocerylist'
import location from './location'
import shoppingcart from './shoppingcart'
import shopsettings from './shopsettings.js'

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    actiecart,
    grocerylist,
    location,
    shoppingcart,
    shopsettings,
  }
})
export default store