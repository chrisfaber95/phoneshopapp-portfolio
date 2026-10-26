import { createRouter, createWebHistory } from 'vue-router';
import auth from '@/assets/scripts/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import( '../views/Home.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/bestellen',
    name: 'bestellen',
    component: () => import( '../views/Order.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/grocerylist',
    name: 'Boodschappenlijstje',
    component: () => import( '../views/GroceryList.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import( '../views/Service.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/algemenevoorwaarden',
    name: 'Algemene Voorwaarden',
    component: () => import( '../views/Privacy.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/spaaracties',
    name: 'Spaaracties',
    component: () => import( '../views/Spaaracties.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/actieshop/:actie',
    name: 'Actieshop',
    component: () => import( '../views/ActieShop.vue'),
    meta: {
        requiresAuth: false
    }
    
  },
  {
    path: '/actieorder/:actie',
    name: 'ActieOrder',
    component: () => import( '../views/ActieOrder.vue'),
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import( '../views/LoginScreen.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import( '../views/Register.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/resetpassword',
    name: 'resetpassword',
    component: () => import( '../views/Resetpassword.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import( '../views/Contact.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/postregistercard',
    name: 'Postregistercard',
    component: () => import( '../views/Postregistercard.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/loyalty_card',
    name: 'loyalty_card',
    component: () => import( '../views/Klantenkaart.vue'),
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import( '../views/Home.vue'),
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/discounts',
    name: 'Discounts',
    component: () => import( '../views/Discounts.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/folder',
    name: 'Folder',
    component: () => import( '../views/Folder.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/returns',
    name: 'Returns',
    component: () => import( '../views/Returns.vue'),
    meta: {
        requiresAuth: false
    }
  },
  {
    path: '/accountOrders',
    name: 'AccountOrders',
    component: () => import( '../views/AccountOrders.vue'),
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/vacatures',
    name: 'Vacatures',
    component: () => import( '../views/JoboffersScreen.vue'),
    meta: {
        requiresAuth: false
    }
  },
  /*{
    path: '/receiptdownload/:id',
    name: 'receiptdownload',
    component: () => import( '../components/AccountComponents/ReceiptPDF.vue'),
    meta: {
        requiresAuth: false
    }
  },*/
  {
    path: '/:pathMatch(.*)*',
    redirect: "/",
  },
    {
      path: '/settings',
      name: 'settings',
      component: () => import( '../views/Settings.vue'),
      meta: {
          requiresAuth: true
      }
    },
   {
      path: '/paypage/:orderid',
      name: 'Paypage',
      component: () => import( '../views/Paypage.vue')
    }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!auth.isAuthenticated()) {
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
