import { createStore } from 'vuex'
import old from './old'
import order from './order'
import picking from './picking'
import settings from './settings'
import scanning from './scanning'
import actie from './actie'

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    old,
    order,
    picking,
    settings,
    scanning,
    actie
  }
})
export default store