import axios from 'axios';

export const HTTP = axios.create({
    baseURL: `${process.env.VUE_APP_API}api/v1/`,
    headers: {
    }
})

HTTP.interceptors.request.use(function(config) {
    const token = process.env.VUE_APP_PUBLIC_API_KEY;
    config.headers.Authorization = localStorage.getItem('access_token') || token;

    return config;
});

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

export const HTTP_Files = axios.create({
    baseURL: `${process.env.VUE_APP_API}api/back-images/`,
    headers: {
        //"content-type": "multipart/form-data",
        //Authorization: 'Bearer 123456'
    }
})

HTTP_Files.interceptors.request.use(function(config) {
    const token = process.env.VUE_APP_PUBLIC_API_KEY;
    //config.headers.Authorization = localStorage.getItem('access_token');
    config.headers.Authorization = localStorage.getItem('access_token') || token;

    return config;
});