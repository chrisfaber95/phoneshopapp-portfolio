import axios from 'axios';
import store from '../../store'

export const HTTP = axios.create({
    baseURL: `${process.env.VUE_APP_API}api/v1/`,
    headers: {
        //"content-type": "multipart/form-data",
        //Authorization: 'Bearer 123456'
    }
})

HTTP.interceptors.request.use(function(config) {
    //const token = process.env.VUE_APP_PUBLIC_API_KEY;
    config.headers.Authorization = localStorage.getItem('access_token');

    return config;
});

axios.interceptors.response.use((response) => {
    return response
  }, (error) => {
    // Do something with response error
    // check for errorHandle config
  
    // if has response show the error
    if (error.response) {
      if (error.response.status === 401) {
        // if you ever get an unauthorized, logout the user
        store.commit('settings/updateUnAuth', true)
      // you can also redirect to /login if needed !
      }
    }
    return Promise.reject(error)
  })

  export const HTTP_Store = axios.create({
    baseURL: `${process.env.VUE_APP_API}api/v2/`,
    headers: {
        //"content-type": "multipart/form-data",
        //Authorization: 'Bearer 123456'
    }
})

HTTP_Store.interceptors.request.use(function(config) {
    const token = process.env.VUE_APP_PUBLIC_API_KEY;
    //config.headers.Authorization = localStorage.getItem('access_token');
    config.headers.Authorization = localStorage.getItem('access_token') || token;

    return config;
});