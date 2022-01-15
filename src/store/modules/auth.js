import helpers from '../../helpers'

const jwtDecode = require('jwt-decode')

const state = {
  user: null,
  isImpersonating: false
}

const getters = {
  isAuthenticated () {
    return state.user !== null
  },
  isImpersonating () {
    return state.isImpersonating
  },
  user () {
    return state.user
  },
  roles () {
    return state.user ? state.user.roles : []
  }
}

const actions = {
  loadUserFromToken ({commit}, t = null) {
    const token = t ? t : localStorage.getItem('token')
    const tokenImpersonate = localStorage.getItem('token_impersonate')

    if (tokenImpersonate) {
      return actions.impersonate({commit})
    }

    if (token) {
      const decodedToken = jwtDecode(token)

      if (decodedToken) {
        const data = decodedToken

        const expiresAt = window.moment.unix(data.exp)

        if (window.moment() > expiresAt) {
          commit('SET_USER', null)
          localStorage.removeItem('token')
        } else {
          localStorage.setItem('token', token)
          commit('SET_USER', data.data)
          window.axios.defaults.headers['Authorization'] = `Bearer ${token}`
        }
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  impersonate ({commit}, userId = null) {
    /* eslint-disable no-async-promise-executor */
    return new Promise(async resolve => {
      if (userId) {
        const response = await window.axios.get(`/auth/${userId}/impersonate`)

        localStorage.setItem('token_impersonate', response.data.jwtToken)
      }

      const token = localStorage.getItem('token_impersonate')

      if (token) {
        const decodedToken = jwtDecode(token)

        if (decodedToken) {
          const data = decodedToken

          const expiresAt = window.moment.unix(data.exp)

          if (window.moment() > expiresAt) {
            commit('SET_USER', null)
            commit('SET_IS_IMPERSONATING', false)
            localStorage.removeItem('token_impersonate')
          } else {
            commit('SET_USER', data.data)
            commit('SET_IS_IMPERSONATING', true)
            window.axios.defaults.headers['Authorization'] = `Bearer ${token}`
          }
        } else {
          localStorage.removeItem('token_impersonate')
        }
      }

      resolve()
    })
  },
  exitImpersonation ({commit}) {
    localStorage.removeItem('token_impersonate')
    commit('SET_IS_IMPERSONATING', false)

    return actions.loadUserFromToken({commit})
  },
  logOut ({commit}) {
    if (localStorage.getItem('token_impersonate')) {
      return actions.exitImpersonation({commit})
    }

    localStorage.removeItem('token')
    commit('SET_USER', null)
  }
}

const mutations = {
  SET_IS_IMPERSONATING (state, value) {
    state.isImpersonating = value
  },
  SET_USER (state, user) {
    if (user === null) {
      state.user = null
      return
    }

    if (state.user) {
      helpers.fill(state.user, user, [], false)
    } else {
      state.user = user
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
