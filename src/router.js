import Vue from 'vue'
import VueRouter from 'vue-router'

import store from './store'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./components/Home.vue')
    },
    {
      path: '/auth/callback',
      component: () => import('./components/Auth/Loader.vue')
    },
    {
      path: '/admin/boosts',
      name: 'admin-boost-index',
      meta: {roles: ['ROLE_ADMIN']},
      component: () => import('./components/Boost/Index.vue')
    },
    {
      path: '/admin/users',
      name: 'admin-user-index',
      meta: {roles: ['ROLE_ADMIN']},
      component: () => import('./components/User/Index.vue')
    },
    {
      path: '/admin/realms',
      name: 'admin-realm-index',
      meta: {roles: ['ROLE_ADMIN']},
      component: () => import('./components/Realm/Index.vue')
    },
    {
      path: '/admin/realms/overview',
      name: 'admin-realm-overview',
      meta: {roles: ['ROLE_ADMIN']},
      component: () => import('./components/Realm/Overview.vue')
    },
    {
      path: '/admin/realms/:id',
      name: 'admin-realm-show',
      meta: {roles: ['ROLE_ADMIN']},
      component: () => import('./components/Realm/Show.vue')
    },
    {
      path: '/booster/leaderboard',
      name: 'user-leaderboard-index',
      meta: {roles: ['ROLE_ADMIN']},
      component: () => import('./components/User/Leaderboard.vue')
    },
    {
      path: '/booster/:id',
      name: 'user-show',
      meta: {roles: ['ROLE_ADMIN', 'ROLE_BOOSTER', 'ROLE_ADVERTISER']},
      component: () => import('./components/User/Show.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  window.scrollTo(0, 0)

  await store.dispatch('auth/loadUserFromToken')
  const authenticated = store.getters['auth/isAuthenticated']

  if (to.meta.roles) {
    if (!authenticated) {
      next({name: 'home'})
    }

    const roles = store.getters['auth/roles']
    let granted = false

    to.meta.roles.forEach(role => {
      if (roles.includes(role)) {
        granted = true
      }
    })

    if (granted) {
      next()
    } else {
      next({name: 'home'})
    }
  } else {
    next()
  }
})


export default router
