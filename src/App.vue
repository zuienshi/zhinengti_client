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
    // 移除可能导致问题的登录状态检查
    // 路由守卫已经处理了登录状态检查
    if (window.electronAPI) {
      // 保留IPC监听器，但简化逻辑
      window.electronAPI.onLoginStatusChanged((status) => {
        if (status) {
          this.$store.commit('SET_AUTHENTICATED', true)
        } else {
          this.$store.commit('SET_AUTHENTICATED', false)
        }
      })
    }
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
  /* 移除浅色背景设置，让Home.vue中的暗黑模式样式能够应用 */
  background-color: var(--bg-primary, #121212);
  color: var(--text-primary, #e0e0e0);
}

#app {
  height: 100vh;
  width: 100vw;
}
</style>