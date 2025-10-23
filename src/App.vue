<template>
  <div id="app">
    <!-- 直接显示路由视图，不使用条件判断 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    console.log('App.vue created 钩子被调用')
  },
  mounted() {
    console.log('App.vue mounted 钩子被调用')
    
    // 在登录窗口中，不需要做额外的跳转，由路由守卫处理
    // 只需要监听登录状态变化
    if (window.electronAPI) {
      window.electronAPI.onLoginStatusChanged((status) => {
        console.log('IPC: 登录状态变化:', status)
        if (status) {
          this.$store.commit('SET_AUTHENTICATED', true)
        } else {
          this.$store.commit('SET_AUTHENTICATED', false)
        }
      })
    }
  },
  methods: {
    // 删除不再需要的方法，由主进程和路由守卫处理
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa; /* 统一为浅灰色背景 */
  color: rgba(0, 0, 0, 0.85); /* 主文本颜色 */
}

#app {
  height: 100vh;
  width: 100vw;
}
</style>