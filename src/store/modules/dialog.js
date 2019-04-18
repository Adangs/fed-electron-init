// 全局弹出层状态控制
const dialog = {
  namespaced: true,
  state: {
    download: false
  },
  mutations: {
    SET_MESSAGE: (state, status) => {
      for (const key in status) {
        state[key] = status[key]
      }
    }
  },
  actions: {
    set ({ commit, state }, data) {
      return new Promise((resolve, reject) => {
        commit('SET_MESSAGE', data)
        resolve()
      })
    }
  }
}

export default dialog
