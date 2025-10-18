<template>
  <div class="login" style="-webkit-app-region: drag;">
    <!-- 登录框头部 -->
    <header>
      <div class="logo"></div>
      <div class="menu" style="-webkit-app-region: no-drag;">
        <span class="menu-icon minimize" title="最小化" @click="minimizeWindow">-</span>
        <span class="menu-icon close" title="关闭" @click="closeWindow">×</span>
      </div>
    </header>

    <!-- 登录框主体 -->
    <main>
      <!-- 阿里云盘Logo -->
      <div class="aliyun-logo">
        <div class="logo-icon"></div>
        <div class="logo-text"></div>
      </div>

      <!-- 账号密码登录表单 -->
      <div class="form">
        <div class="login_options">
          <div class="login_tabs">
            <span class="tab active">账号登录</span>
          </div>

          <div class="validate_msg" v-if="errorMessage">
            <span class="error-text">{{ errorMessage }}</span>
          </div>

          <form style="-webkit-app-region: no-drag;">
            <div class="form_item">
              <input v-model="loginForm.username" placeholder="请输入手机号码" class="text" type="text"
                @keyup.enter="handleLogin">
            </div>
            <div class="form_item">
              <input v-model="loginForm.password" class="text" placeholder="请输入密码" type="password"
                @keyup.enter="handleLogin">
            </div>
            <div class="form_options">
              <label>
                <input type="checkbox" v-model="loginForm.autoLogin">
                <span style="padding-left: 0;" class="text">下次自动登录</span>
              </label>
              <a class="sms-login" @click="switchToSmsLogin">验证码登录</a>
            </div>
          </form>

          <button type="button" class="submit" :class="{ 'loading': loading }" @click="handleLogin" :disabled="loading"
            style="-webkit-app-region: no-drag;">
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div class="footer" style="-webkit-app-region: no-drag;">
            <a class="register" @click="showRegister">还没有注册？注册一个</a>
          </div>
        </div>
      </div>

      <!-- 底部说明链接 -->
      <div class="bottom-links">
        <span>手机号不可用？<a href="#" @click.prevent>点击这里</a></span>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      errorMessage: '',
      loginForm: {
        username: '',
        password: '',
        autoLogin: true,
        rememberPassword: false
      }
    }
  },
  created() {
    // 如果已经记住用户名和密码，则填充
    this.loadSavedCredentials()
  },
  mounted() {
    console.log('Login组件已挂载');
    console.log('路由信息:', this.$route);
    // 阻止窗口自动关闭
    if (window.require) {
      const { remote } = window.require('electron');
      if (remote && remote.getCurrentWindow) {
        const win = remote.getCurrentWindow();
        console.log('获取到当前窗口');
      }
    }
  },
  methods: {
    // 加载保存的凭据
    loadSavedCredentials() {
      const savedUsername = localStorage.getItem('rememberedUsername')
      if (savedUsername) {
        this.loginForm.username = savedUsername
        this.loginForm.rememberPassword = true
      }
    },

    // 最小化窗口 - 直接使用全局注入的方法
    minimizeWindow() {
      console.log('调用最小化窗口方法');
      try {
        // 优先使用全局注入的方法
        if (typeof window !== 'undefined' && window.minimizeWindow) {
          console.log('使用全局window.minimizeWindow方法');
          window.minimizeWindow();
        }
        // 备用方案：如果全局方法不可用，使用remote模块
        else if (window.require) {
          console.log('使用remote模块执行最小化');
          const { remote } = window.require('electron');
          const win = remote.getCurrentWindow();
          win.minimize();
        }
        console.log('最小化操作完成');
      } catch (e) {
        console.error('最小化窗口操作出错:', e);
      }
    },

    // 关闭窗口 - 直接使用全局注入的方法
    closeWindow() {
      console.log('调用关闭窗口方法');
      try {
        // 优先使用全局注入的方法
        if (typeof window !== 'undefined' && window.closeWindow) {
          console.log('使用全局window.closeWindow方法');
          window.closeWindow();
        }
        // 备用方案：如果全局方法不可用，使用remote模块
        else if (window.require) {
          console.log('使用remote模块执行关闭');
          const { remote } = window.require('electron');
          const win = remote.getCurrentWindow();
          win.close();
        }
        console.log('关闭操作完成');
      } catch (e) {
        console.error('关闭窗口操作出错:', e);
      }
    },

    // 处理登录
    async handleLogin() {
      // 添加立即反馈，确认点击事件被触发
      console.log('登录按钮被点击!', new Date().toISOString())

      // 给用户即时视觉反馈
      const button = document.querySelector('.submit')
      if (button) {
        button.style.transform = 'scale(0.98)'
        setTimeout(() => {
          button.style.transform = 'scale(1)'
        }, 100)
      }

      // 表单验证
      if (!this.loginForm.username) {
        this.errorMessage = '请输入手机号'
        console.log('验证失败: 未输入手机号')
        return
      }

      if (!this.loginForm.password) {
        this.errorMessage = '请输入密码'
        console.log('验证失败: 未输入密码')
        return
      }

      // 手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.loginForm.username)) {
        this.errorMessage = '请输入正确的手机号'
        console.log('验证失败: 手机号格式不正确', this.loginForm.username)
        return
      }

      // 清除之前的错误信息
      this.errorMessage = ''
      console.log('表单验证通过，准备登录')

      // 模拟登录请求
      this.loading = true
      console.log('设置loading状态为true')

      try {
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 实际的登录逻辑
        console.log('正在发送登录请求...', this.loginForm)

        // 模拟API调用，设置token表示登录成功
        // 在实际项目中，这里应该是真正的登录API请求
        const mockToken = 'mock-user-token-' + Date.now();
        localStorage.setItem('userToken', mockToken)

        // 登录成功后的处理
        if (this.loginForm.autoLogin) {
          localStorage.setItem('rememberedUsername', this.loginForm.username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }

        console.log('登录成功，设置token:', mockToken)
        console.log('准备跳转到主页...')

        // 登录成功后，通知主进程切换到主窗口
        try {
          console.log('登录成功，通知主进程切换到主窗口')
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('login-success');
          console.log('IPC消息已发送')
        } catch (ipcError) {
          console.error('发送IPC消息失败:', ipcError)
        }
        
        // 不再尝试在当前窗口跳转，完全由主进程控制窗口切换
        console.log('已通知主进程切换到主窗口，等待主进程响应')
      } catch (error) {
        this.errorMessage = '登录失败，请稍后重试'
        console.error('登录失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 切换到扫码登录
    switchToQrLogin() {
      console.log('切换到扫码登录')
      // 实际项目中可能会切换表单或跳转到扫码登录页面
      this.errorMessage = '扫码登录功能暂未开放'
    },

    // 切换到账号登录
    switchToAccountLogin() {
      console.log('切换到账号登录')
      // 实际项目中可能会切换表单
    },

    // 切换到验证码登录
    switchToSmsLogin() {
      console.log('切换到验证码登录')
      try {
        // 打印路由实例信息进行调试
        console.log('路由实例:', this.$router)
        console.log('当前路由:', this.$route)
        
        // 先尝试使用名称路由
        console.log('尝试使用命名路由导航')
        this.$router.push({ name: 'SmsLogin' })
      } catch (error) {
        console.error('路由跳转失败:', error)
        // 如果命名路由失败，尝试使用路径路由作为备用
        try {
          console.log('尝试使用路径路由导航')
          this.$router.push('/sms-login')
        } catch (secondError) {
          console.error('备用路由跳转也失败:', secondError)
          // 如果所有路由方式都失败，使用传统的URL跳转作为最后的备选
          window.location.href = '#/sms-login'
        }
      }
    },

    // 显示注册页面
    showRegister() {
      console.log('开始导航到注册页面')
      try {
        // 打印路由实例信息进行调试
        console.log('路由实例:', this.$router)
        console.log('当前路由:', this.$route)

        // 先尝试使用名称路由
        console.log('尝试使用命名路由导航')
        this.$router.push({ name: 'Register' })
      } catch (error) {
        console.error('路由跳转失败:', error)
        // 如果命名路由失败，尝试使用路径路由作为备用
        try {
          console.log('尝试使用路径路由导航')
          this.$router.push('/register')
        } catch (secondError) {
          console.error('备用路由跳转也失败:', secondError)
          // 如果所有路由方式都失败，使用传统的URL跳转作为最后的备选
          window.location.href = '#/register'
        }
      }
    },

    // 显示其他登录方式
    showOtherLogin() {
      console.log('显示其他登录方式')
      // 实际项目中可能会显示其他登录选项
      this.errorMessage = '其他登录方式暂未开放'
    },

    // 下载App
    downloadApp() {
      console.log('下载App')
      // 实际项目中可能会跳转到下载页面
      this.errorMessage = '下载功能暂未开放'
    }
  }
}
</script>

<style scoped>
.login {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
}

header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.logo {
  width: 80px;
  height: 30px;
  background-image: url('/img/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-icon {
  font-size: 18px;
  color: #666666;
}

.menu-icon.minimize {
  font-size: 20px;
}

.menu-icon.close {
  font-size: 22px;
}

.menu-icon.close:hover {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.menu-icon.minimize:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  padding-top: 50px;
}

.aliyun-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background-color: #1677ff;
  border-radius: 16px;
  margin-bottom: 16px;
  position: relative;
}

.logo-icon::before {
  content: '☁';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: white;
}

.logo-text {
  font-size: 24px;
  font-weight: 500;
  color: #1677ff;
}

.form {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
}

.login_tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px 0 12px;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  position: relative;
  transition: color 0.3s;
}

.tab:hover {
  color: #1677ff;
}

.tab.active {
  color: #1677ff;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 25%;
  width: 50%;
  height: 2px;
  background-color: #1677ff;
}

.validate_msg {
  margin-bottom: 16px;
  color: #ff4d4f;
  font-size: 14px;
}

.error-text {
  color: #ff4d4f;
}

/* 输入框样式 */
.form_item input[type="text"],
.form_item input[type="password"] {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: white;
  line-height: 40px;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  outline: none;
}

.form_item {
  position: relative;
  margin-bottom: 20px;
}

.form_item input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.text:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form_options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
}

.form_options label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.form_options input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
  margin-top: -2px;
  /* 微调垂直对齐 */
  vertical-align: middle;
}

.sms-login {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.sms-login:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.submit {
  width: 100%;
  height: 40px;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  outline: none;
}

.submit:hover:not(:disabled) {
  background-color: #4096ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
}

.submit:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.submit.loading {
  background-color: #d9d9d9;
  cursor: wait;
}

.footer {
  margin-top: 16px;
  text-align: center;
}

.register {
  color: #1677ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 14px;
}

.register:hover {
  color: #4096ff;
  text-decoration: underline;
}

.app-download-section {
  margin-top: 30px;
  text-align: center;
}

.app-download {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background-color: #e6f4ff;
  color: #1677ff;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  cursor: pointer;
}

.app-download:hover {
  background-color: #bae0ff;
  text-decoration: none;
}

.bottom-links {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.bottom-links a {
  color: #1677ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.bottom-links a:hover {
  color: #4096ff;
  text-decoration: underline;
}

.bottom-links {
  text-align: center;
  font-size: 12px;
  color: #999;
}

.bottom-links a {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.bottom-links a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.app-download {
  display: inline-block;
  padding: 4px 12px;
  background-color: #ecf5ff;
  color: #1890ff;
  border-radius: 15px;
  margin-top: 5px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.app-download:hover {
  background-color: #d9ecff;
  text-decoration: none;
}

/* 阿里云盘风格的复选框样式 */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  position: relative;
  background-color: white;
  transition: all 0.3s;
  -webkit-appearance: none;
  appearance: none;
}

input[type="checkbox"]:checked {
  background-color: #1677ff;
  border-color: #1677ff;
}

input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

input[type="checkbox"]:hover:not(:disabled) {
  border-color: #1677ff;
}

/* 输入框和按钮的通用样式 */
.form input,
.form button {
  outline: none;
}
</style>