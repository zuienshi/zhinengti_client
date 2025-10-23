import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    userInfo: null,
    token: null
  },
  mutations: {
    SET_AUTHENTICATED(state, status) {
      state.isAuthenticated = status
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    SET_TOKEN(state, token) {
      state.token = token
      // 保存到localStorage
      if (token) {
        localStorage.setItem('userToken', token)
      } else {
        localStorage.removeItem('userToken')
      }
    },
    LOGOUT(state) {
      state.isAuthenticated = false
      state.userInfo = null
      state.token = null
      localStorage.removeItem('userToken')
    }
  },
  actions: {
    // 登录操作
    async login({ commit }, { username, password }) {
      try {
        // 这里模拟登录请求，实际项目中需要调用后端API
        // const response = await api.login(username, password)
        
        // 模拟登录成功
        const mockToken = 'mock-jwt-token-' + Date.now()
        const mockUserInfo = {
          username,
          nickname: '用户' + username,
          avatar: ''
        }
        
        commit('SET_TOKEN', mockToken)
        commit('SET_USER_INFO', mockUserInfo)
        commit('SET_AUTHENTICATED', true)
        
        // 通知Electron主进程登录成功
        if (window.electronAPI) {
          window.electronAPI.loginSuccess()
        }
        
        return { success: true }
      } catch (error) {
        console.error('登录失败:', error)
        return { success: false, error: error.message || '登录失败' }
      }
    },
    
    // 登出操作
    logout({ commit }) {
      commit('LOGOUT')
    },
    
    // 检查登录状态
    checkLoginStatus({ commit, state }) {
      // 从localStorage获取token
      const token = localStorage.getItem('userToken')
      if (token) {
        // 这里可以添加token验证逻辑
        commit('SET_TOKEN', token)
        commit('SET_AUTHENTICATED', true)
        return true
      } else {
        commit('SET_AUTHENTICATED', false)
        return false
      }
    }
  },
  getters: {
    isLoggedIn: state => state.isAuthenticated,
    currentUser: state => state.userInfo
  }
})