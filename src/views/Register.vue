<template>
  <div class="register" style="-webkit-app-region: drag;">
    <!-- 注册框头部 -->
    <header>
      <div class="logo"></div>
      <div class="menu" style="-webkit-app-region: no-drag;">
        <span class="menu-icon minimize" title="最小化" @click="minimizeWindow">-</span>
    <span class="menu-icon close" title="关闭" @click="closeWindow">×</span>
      </div>
    </header>
    
    <!-- 注册框主体 -->
    <main>
      <!-- 阿里云盘Logo -->
      <div class="aliyun-logo">
        <div class="logo-icon"></div>
        <div class="logo-text"></div>
      </div>
      
      <!-- 注册表单 -->
      <div class="form">
        <div class="register_options">
          <div class="register_tabs">
            <span class="tab active">账号注册</span>
          </div>
          
          <div class="validate_msg" v-if="errorMessage">
            <span class="error-text">{{ errorMessage }}</span>
          </div>
          
          <form style="-webkit-app-region: no-drag;">
            <div class="form_item">
              <input 
                v-model="registerForm.phone" 
                placeholder="请输入手机号" 
                class="text" 
                type="tel"
                @keyup.enter="handleRegister"
              >
            </div>
            <div class="form_item">
              <input 
                v-model="registerForm.code" 
                placeholder="请输入验证码" 
                class="text code-input" 
                type="text"
                @keyup.enter="handleRegister"
              >
              <button 
                type="button" 
                class="code-btn"
                :disabled="countDown > 0"
                @click="sendVerificationCode"
              >
                {{ countDown > 0 ? `${countDown}秒后重新获取` : '获取验证码' }}
              </button>
            </div>
            <div class="form_item">
              <input 
                v-model="registerForm.password" 
                class="text" 
                placeholder="请设置密码（6-20位字母、数字或符号）" 
                type="password"
                @keyup.enter="handleRegister"
              >
            </div>
            <div class="form_item">
              <input 
                v-model="registerForm.confirmPassword" 
                class="text" 
                placeholder="请确认密码" 
                type="password"
                @keyup.enter="handleRegister"
              >
            </div>
            <div class="form_options">
              <label>
                <input type="checkbox" v-model="registerForm.agreeTerms">
                <span>我已阅读并同意</span>
                <a href="#" class="terms-link">《用户协议》</a>
                <a href="#" class="terms-link">《隐私政策》</a>
              </label>
            </div>
          </form>
          
          <button 
            type="button" 
            class="submit"
            :class="{ 'loading': loading }"
            @click="handleRegister"
            :disabled="loading"
            style="-webkit-app-region: no-drag;"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
          
          <div class="footer" style="-webkit-app-region: no-drag;">
            <a class="login" @click="showLogin">已有账号？立即登录</a>
          </div>
        </div>
      </div>
      
      <!-- 底部链接 -->
    </main>
  </div>
</template>

<script>
// import axios from 'axios' // 暂时注释掉axios，使用fetch API进行测试

export default {
  name: 'Register',
  data() {
    return {
      loading: false,
      errorMessage: '',
      countDown: 0,
      registerForm: {
        phone: '',
        code: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      }
    }
  },
  beforeDestroy() {
    // 清除倒计时定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
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
    

    
    // 发送验证码
    async sendVerificationCode() {
      console.log('开始发送验证码')
      
      // 验证手机号
      if (!this.registerForm.phone) {
        this.errorMessage = '请输入手机号'
        return
      }
      
      // 简单的手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.registerForm.phone)) {
        this.errorMessage = '请输入正确的手机号格式'
        return
      }
      
      // 清除之前的错误信息
      this.errorMessage = ''
      
      try {
        console.log('正在发送验证码请求...')
        console.log('请求参数:', {
          mobile: this.registerForm.phone,
          type: 'register' // 设置type为register，表示注册类型的验证码
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
              mobile: this.registerForm.phone,
              type: 'register'
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
    
    // 处理注册
    async handleRegister() {
      console.log('开始处理注册请求')
      console.log('表单数据:', this.registerForm)
      
      // 表单验证
      if (!this.registerForm.phone) {
        console.log('验证失败: 手机号为空')
        this.errorMessage = '请输入手机号'
        return
      }
      
      // 手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.registerForm.phone)) {
        console.log('验证失败: 手机号格式不正确')
        this.errorMessage = '请输入正确的手机号格式'
        return
      }
      
      if (!this.registerForm.code) {
        console.log('验证失败: 验证码为空')
        this.errorMessage = '请输入验证码'
        return
      }
      
      if (!this.registerForm.password) {
        console.log('验证失败: 密码为空')
        this.errorMessage = '请设置密码'
        return
      }
      
      if (!this.registerForm.confirmPassword) {
        console.log('验证失败: 确认密码为空')
        this.errorMessage = '请确认密码'
        return
      }
      
      // 密码格式验证
      if (this.registerForm.password.length < 6 || this.registerForm.password.length > 20) {
        console.log('验证失败: 密码长度不符合要求')
        this.errorMessage = '密码长度应为6-20位'
        return
      }
      
      // 确认密码
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        console.log('验证失败: 两次输入的密码不一致')
        this.errorMessage = '两次输入的密码不一致'
        return
      }
      
      // 同意协议
      if (!this.registerForm.agreeTerms) {
        console.log('验证失败: 未同意用户协议')
        this.errorMessage = '请阅读并同意用户协议和隐私政策'
        return
      }
      
      console.log('所有验证通过，准备发送网络请求')
      
      // 清除之前的错误信息
      this.errorMessage = ''
      
      // 实际注册请求
      this.loading = true
      
      try {
        console.log('正在发送注册请求...')
        console.log('请求URL:', 'https://env-00jxtwyjidvm.dev-hz.cloudbasefunction.cn/http/router/user/pub/loginBySms')
        console.log('请求参数:', {
          mobile: this.registerForm.phone,
          code: this.registerForm.code,
          type: 'register',
          password: this.registerForm.password
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
              mobile: this.registerForm.phone,
              code: this.registerForm.code,
              type: 'register',
              password: this.registerForm.password
            })
          }
        )
        
        console.log('收到HTTP响应，状态码:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('注册请求发送成功，收到响应数据:', data)
        
        // 检查响应状态
        if (data.code === 0) {
          console.log('注册成功')
          
          // 注册成功后的处理
          this.errorMessage = data.msg || data.message || '注册成功，正在跳转到首页'
          
          // 模拟API调用，设置token表示登录成功
          // 在实际项目中，这里应该是从服务器返回的真实token
          const mockToken = 'mock-user-token-' + Date.now();
          localStorage.setItem('userToken', mockToken)
          console.log('注册成功，设置token:', mockToken)
          
          // 注册成功后，通知主进程切换到主窗口
          try {
            console.log('注册成功，通知主进程切换到主窗口')
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('login-success');
            console.log('IPC消息已发送')
            // 不再尝试在当前窗口跳转，完全由主进程控制窗口切换
            console.log('已通知主进程切换到主窗口，等待主进程响应')
          } catch (ipcError) {
            console.error('发送IPC消息失败:', ipcError)
          }
        } else {
          // 注册失败，显示错误信息
          console.log('注册失败，错误码不为0')
          this.errorMessage = data.errMsg || data.msg || data.message || '注册失败'
        }
      } catch (error) {
        console.error('注册请求发生异常:', error)
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          this.errorMessage = '网络请求失败，可能是网络连接问题或CORS策略限制'
        } else if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
          this.errorMessage = '服务器返回的数据格式错误'
        } else {
          this.errorMessage = error.message || '注册请求失败，请稍后重试'
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
.register {
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
  font-size: 18px;
  color: #666666;
}

.menu-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
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

.register_tabs {
  display: flex;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  position: relative;
}

.tab.active {
  color: #1677ff;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
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

/* 文本样式 */
.text[data-v-08aaad4e] {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: white;
  line-height: 40px;
}

.form_item {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.text {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: white;
  box-sizing: border-box;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 120px;
  height: 40px;
  background-color: #ecf5ff;
  color: #1890ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.code-btn:disabled {
  background-color: #f5f5f5;
  color: #bfbfbf;
  border-color: #d9d9d9;
  cursor: not-allowed;
}

.text:focus {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.form_options {
  display: flex;
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
  flex-wrap: wrap;
  gap: 4px;
}

.form_options input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
  margin-top: -2px; /* 微调垂直对齐 */
  vertical-align: middle;
}

.terms-link {
  color: #1677ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  margin: 0 2px;
}

.terms-link:hover {
  color: #4096ff;
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
}

.submit:hover:not(:disabled) {
  background-color: #4096ff;
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

.login {
  color: #1677ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 14px;
}

.login:hover {
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

/* 阿里云盘风格的复选框样式 */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  position: relative;
  background-color: white;
  transition: all 0.3s;
}

input[type="checkbox"]:checked {
  background-color: #1890ff;
  border-color: #1890ff;
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

/* 输入框和按钮的通用样式 */
.form input, .form button {
  outline: none;
}
</style>