import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/CollectingScreen.vue'
//import Home from '../views/ActieOrders.vue'
import auth from '@/assets/services/auth'

const routes = [{
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/bestellingen',
        name: 'Bestellingen',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/BestellingenScreen.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/actie_orders',
        name: 'Actie Bestellingen',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/ActieOrders.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/bezorging',
        name: 'Bezorging',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/Bezorging.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/store',
        name: 'Winkel Instellingen',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/StoreSettings.vue'),
        meta: {
            requiresAdmin: true
        }
    },
    {
        path: '/store/:menu',
        name: 'Bezorging Info',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/StoreSettings.vue'),
        meta: {
            requiresAdmin: true
        }
    },
    {
        path: '/afhaalscanner',
        name: 'Afhaalscanner',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/AfhaalscannerScreen.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/actiescanner',
        name: 'Actiescanner',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/ActieScannerScreen.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/scanner',
        name: 'Scanner',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/ScannerScreen.vue'),
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/discounts',
        name: 'Discounts',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/Discounts.vue'),
        meta: {
            requiresAdmin: true
        }
    },
    {
        path: '/kassascanner',
        name: 'Kassascanner',
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/KassascannerScreen.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/admin',
        name: 'Administratie',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/AdministratieScreen.vue'),
        meta: {
            requiresAdmin: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/LoginScreen.vue'),
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/register',
        name: 'Register',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import ( /* webpackChunkName: "about" */ '../views/AccountsScreen.vue'),
        meta: {
            requiresAdmin: true
        }
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})
console.log(process.env)
router.beforeEach((to, from, next) => {
    console.log(to)
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!auth.isAuthenticated()) {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath
                }
            })
        } else {
            next();
        }
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!auth.isAdmin()) {
            next({
                path: '/',
                query: {
                    redirect: to.fullPath
                }
            })
        } else {
            next();
        }
    } else {
        next();
    }
})
export default router