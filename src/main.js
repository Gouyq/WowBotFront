import Vue from 'vue'
import {mapActions, mapGetters} from 'vuex'
import App from './App.vue'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'

import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './assets/sass/app.scss'

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

import helpers from './helpers'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

import Toasted from 'vue-toasted'

Vue.use(Toasted, {
  iconPack: 'fontawesome',
  position: 'top-right',
  fitToScreen: true,
  duration: 3000,
  type: 'success',
  className: 'min-width-200',
  action: {
    icon: 'fa-times',
    onClick: (e, toastObject) => {
      toastObject.goAway(0)
    }
  }
})

Vue.mixin({
  computed: {
    ...mapGetters('auth', [
      'isAuthenticated',
      'isImpersonating',
      'user',
      'roles'
    ])
  },
  methods: {
    ...mapActions('auth', [
      'loadUserFromToken',
      'logOut'
    ]),
    ...helpers,
    isGranted (...roles) {
      if (!this.isAuthenticated) return false

      let granted = false

      roles.forEach(role => {
        if (this.roles.includes(role)) {
          granted = true
        }
      })

      return granted
    }
  }
})

window.axios = require('axios')
window.axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL

window.moment = require('moment')

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
