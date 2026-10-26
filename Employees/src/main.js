import { createApp, inject } from 'vue';
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

export const VueMeta = Symbol();

export function useToasted() {
  const VueMeta = inject(VueMeta);
  if (!VueMeta) throw new Error('No VueToasted provided!!!');

  return VueMeta;
}
  
createApp(App)
    .use(VueMeta)
    .use(router)
    .use(store)
    .mount('#app')
