import { createApp } from 'vue';
import store from './store'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import lazyPlugin from 'vue3-lazy'
import Vue3TouchEvents from "vue3-touch-events";
import VueSimpleAlert from "vue3-simple-alert";

const app = createApp(App)

// Product and action images are served by the API host; templates build their src from this
app.config.globalProperties.$imageHost = (process.env.VUE_APP_API || '').replace(/\/$/, '')

app
    .use(router)
    .use(store)
    .use(Vue3TouchEvents)
    .use(VueSimpleAlert)
    .use(lazyPlugin, {
      loading: 'loading.png',
      error: 'error.png'
    })
    .mount('#app')
