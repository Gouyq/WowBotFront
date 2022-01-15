const state = {
  realms: []
}

const getters = {
  realms () {
    return state.realms
  }
}

const actions = {
  getRealms ({commit}) {
    window.axios
      .get('/api/realms')
      .then(response => {
        commit('SET_REALMS', response.data.data)
      })
  }
}

const mutations = {
  SET_REALMS (state, realms) {
    state.realms = realms
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
