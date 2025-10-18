<template>
  <div class="register-container" style="-webkit-app-region: drag;">
    <div class="header-bar">
      <div class="header-buttons">
        <button class="header-btn" @click="minimizeWindow" style="-webkit-app-region: no-drag;">
          <span class="minimize-icon">—</span>
        </button>
        <button class="header-btn" @click="closeWindow" style="-webkit-app-region: no-drag;">
          <span class="close-icon">×</span>
        </button>
      </div>
    </div>

    <div class="register-content">
      <div class="logo-area">
        <img src="https://img.alicdn.com/imgextra/i4/O1CN01Cq6nZl1kPZ7sRqgQK_!!6000000004245-2-tps-200-72.png" alt="阿里云" class="logo">
        <div class="title">验证码登录</div>
      </div>

      <div class="form-container">
        <div class="form-input-group">
          <div class="input-wrapper">
            <input
              v-model="loginForm.phone"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
              class="form-input"
              :class="{ 'error': errorMessage && !loginForm.phone }"
              style="-webkit-app-region: no-drag;"
            >
          </div>
        </div>

        <div class="form-input-group">
          <div class="input-wrapper code-wrapper">
            <input
              v-model="loginForm.code"
              type="text"
              placeholder="请输入验证码"
              maxlength="6"
              class="form-input code-input"
              :class="{ 'error': errorMessage && !loginForm.code }"
              style="-webkit-app-region: no-drag;"
            >
            <button
              class="send-code-btn"
              :disabled="countDown > 0 || !loginForm.phone"
              @click="sendVerificationCode"
              style="-webkit-app-region: no-drag;"
            >
              {{ countDown > 0 ? `${countDown}秒后重发` : '获取验证码' }}
            </button>
          </div>
        </div>

        <!-- 错误消息显示 -->
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button
            class="submit"
            :disabled="loading"
            @click="handleSmsLogin"
            style="-webkit-app-region: no-drag;"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>

        <div class="form-options">
          <div class="switch-area">
            <span>账号密码登录？</span>
            <a @click="showLogin" class="link-text">返回登录</a>
          </div>
        </div>

        <div class="footer">
          <div class="links">
            <a class="footer-link">用户协议</a>
            <span class="separator">|</span>
            <a class="footer-link">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmsLogin',
  data() {
    return {
      loginForm: {
        phone: '',
        code: '',
        agreeTerms: true
      },
      loading: false,
      errorMessage: '',
      countDown: 0,
      timer: null
    }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    // 最小化窗口
    minimizeWindow() {
      console.log('调用最小化窗口方法')
      try {
        // 优先使用全局注入的方法
        if (typeof window !== 'undefined' && window.minimizeWindow) {
          console.log('使用全局window.minimizeWindow方法')
          window.minimizeWindow()
        }
        // 备用方案：如果全局方法不可用，使用remote模块
        else if (window.require) {
          console.log('使用remote模块执行最小化')
          const { remote } = window.require('electron')
          const win = remote.getCurrentWindow()
          win.minimize()
        }
        console.log('最小化操作完成')
      } catch (e) {
        console.error('最小化窗口操作出错:', e)
      }
    },
    
    // 关闭窗口
    closeWindow() {
      console.log('调用关闭窗口方法')
      try {
        // 优先使用全局注入的方法
        if (typeof window !== 'undefined' && window.closeWindow) {
          console.log('使用全局window.closeWindow方法')
          window.closeWindow()
        }
        // 备用方案：如果全局方法不可用，使用remote模块
        else if (window.require) {
          console.log('使用remote模块执行关闭')
          const { remote } = window.require('electron')
          const win = remote.getCurrentWindow()
          win.close()
        }
        console.log('关闭操作完成')
      } catch (e) {
        console.error('关闭窗口操作出错:', e)
      }
    },
    
    // 发送验证码
    async sendVerificationCode() {
      console.log('开始发送验证码')
      
      // 验证手机号
      if (!this.loginForm.phone) {
        this.errorMessage = '请输入手机号'
        return
      }
      
      // 简单的手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.loginForm.phone)) {
        this.errorMessage = '请输入正确的手机号格式'
        return
      }
      
      // 清除之前的错误信息
      this.errorMessage = ''
      
      try {
        console.log('正在发送验证码请求...')
        console.log('请求参数:', {
          mobile: this.loginForm.phone,
          type: 'login' // 设置type为login，表示登录类型的验证码
        })
        
        // 调用发送验证码的API
        const response = await fetch(
          'https://env-00jxtwyjidvm.dev-hz.cloudbasefunction.cn/http/router/user/pub/sendSmsCode',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mobile: this.loginForm.phone,
              type: 'login'
            })
          }
        )
        
        console.log('收到HTTP响应，状态码:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('发送验证码请求成功，收到响应数据:', data)
        
        // 根据返回的状态结构解析响应
        if (data.code === 0 && data.requestRes && data.requestRes.success) {
          console.log('验证码发送成功')
          // 优先使用data.msg作为成功提示
          this.errorMessage = data.msg || '验证码已发送，请查收'
          
          // 开始倒计时
          this.startCountDown()
        } else {
          // 发送失败，显示错误信息
          console.log('验证码发送失败')
          // 构建错误提示信息
          let errorText = '验证码发送失败'
          
          if (data.msg) {
            errorText = data.msg
          } else if (data.requestRes?.errCode) {
            errorText = `发送失败: ${data.requestRes.errCode}`
          }
          
          this.errorMessage = errorText
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          this.errorMessage = '网络请求失败，可能是网络连接问题或CORS策略限制'
        } else if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
          this.errorMessage = '服务器返回的数据格式错误'
        } else {
          this.errorMessage = error.message || '发送验证码失败，请稍后重试'
        }
      }
    },
    
    // 开始倒计时
    startCountDown() {
      this.countDown = 60
      this.timer = setInterval(() => {
        if (this.countDown > 0) {
          this.countDown--
        } else {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    
    // 处理验证码登录
    async handleSmsLogin() {
      console.log('开始处理验证码登录请求')
      console.log('表单数据:', this.loginForm)
      
      // 表单验证
      if (!this.loginForm.phone) {
        console.log('验证失败: 手机号为空')
        this.errorMessage = '请输入手机号'
        return
      }
      
      // 手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.loginForm.phone)) {
        console.log('验证失败: 手机号格式不正确')
        this.errorMessage = '请输入正确的手机号格式'
        return
      }
      
      if (!this.loginForm.code) {
        console.log('验证失败: 验证码为空')
        this.errorMessage = '请输入验证码'
        return
      }
      
      console.log('所有验证通过，准备发送网络请求')
      
      // 清除之前的错误信息
      this.errorMessage = ''
      
      // 实际登录请求
      this.loading = true
      
      try {
        console.log('正在发送验证码登录请求...')
        console.log('请求URL:', 'https://env-00jxtwyjidvm.dev-hz.cloudbasefunction.cn/http/router/user/pub/loginBySms')
        console.log('请求参数:', {
          mobile: this.loginForm.phone,
          code: this.loginForm.code,
          type: 'login'
        })
        
        // 使用fetch API发送请求
        const response = await fetch(
          'https://env-00jxtwyjidvm.dev-hz.cloudbasefunction.cn/http/router/user/pub/loginBySms',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mobile: this.loginForm.phone,
              code: this.loginForm.code,
              type: 'login'
            })
          }
        )
        
        console.log('收到HTTP响应，状态码:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('登录请求发送成功，收到响应数据:', data)
        
        // 检查响应状态
        if (data.code === 0) {
          console.log('登录成功')
          
          // 登录成功后的处理
          this.errorMessage = data.msg || data.message || '登录成功，正在跳转到首页'
          
          // 模拟API调用，设置token表示登录成功
          // 在实际项目中，这里应该是从服务器返回的真实token
          const mockToken = 'mock-user-token-' + Date.now()
          localStorage.setItem('userToken', mockToken)
          console.log('登录成功，设置token:', mockToken)
          
          // 登录成功后，通知主进程切换到主窗口
        try {
          console.log('验证码登录成功，通知主进程切换到主窗口')
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('login-success');
          console.log('IPC消息已发送')
        } catch (ipcError) {
          console.error('发送IPC消息失败:', ipcError)
        }
        
        // 不再尝试在当前窗口跳转，完全由主进程控制窗口切换
        console.log('已通知主进程切换到主窗口，等待主进程响应')
        } else {
          // 登录失败，显示错误信息
          console.log('登录失败，错误码不为0')
          this.errorMessage = data.errMsg || data.msg || data.message || '登录失败'
        }
      } catch (error) {
        console.error('登录请求发生异常:', error)
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          this.errorMessage = '网络请求失败，可能是网络连接问题或CORS策略限制'
        } else if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
          this.errorMessage = '服务器返回的数据格式错误'
        } else {
          this.errorMessage = error.message || '登录请求失败，请稍后重试'
        }
      } finally {
        this.loading = false
      }
    },
    
    // 显示登录页面
    showLogin() {
      console.log('开始导航到登录页面')
      try {
        // 打印路由实例信息进行调试
        console.log('路由实例:', this.$router)
        console.log('当前路由:', this.$route)
        
        // 先尝试使用名称路由
        console.log('尝试使用命名路由导航')
        this.$router.push({ name: 'Login' })
      } catch (error) {
        console.error('路由跳转失败:', error)
        // 如果命名路由失败，尝试使用路径路由作为备用
        try {
          console.log('尝试使用路径路由导航')
          this.$router.push('/login')
        } catch (secondError) {
          console.error('备用路由跳转也失败:', secondError)
          // 如果所有路由方式都失败，使用传统的URL跳转作为最后的备选
          window.location.href = '#/login'
        }
      }
    }
  }
}
</script>

<style scoped>
/* 样式与Register.vue保持一致 */
.register-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.header-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s;
}

.header-btn:hover {
  background-color: #f0f0f0;
}

.close-icon {
  font-size: 20px;
}

.minimize-icon {
  font-size: 24px;
}

.register-content {
  width: 400px;
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.logo-area {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 16px;
}

.title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.form-container {
  width: 100%;
}

.form-input-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
}

.code-wrapper {
  display: flex;
  gap: 10px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.form-input.error {
  border-color: #ff4d4f;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  height: 40px;
  background-color: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  color: #666;
}

.send-code-btn:not(:disabled):hover {
  background-color: #1677ff;
  border-color: #1677ff;
  color: white;
}

.send-code-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-bottom: 16px;
  height: 16px;
  line-height: 16px;
}

.form-actions {
  margin-bottom: 20px;
}

.submit {
  width: 100%;
  height: 40px;
  background-color: #1677ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit:hover:not(:disabled) {
  background-color: #0958d9;
}

.submit:disabled {
  background-color: #f5f5f5;
  color: #d9d9d9;
  cursor: not-allowed;
}

.submit.loading {
  opacity: 0.8;
}

.form-options {
  margin-bottom: 20px;
}

.switch-area {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.link-text {
  color: #1677ff;
  cursor: pointer;
  text-decoration: none;
  margin-left: 4px;
}

.link-text:hover {
  text-decoration: underline;
}

.footer {
  text-align: center;
  font-size: 12px;
  color: #999;
}

.links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.footer-link {
  color: #999;
  text-decoration: none;
  cursor: pointer;
}

.footer-link:hover {
  color: #1677ff;
}

.separator {
  color: #e8e8e8;
}
</style>