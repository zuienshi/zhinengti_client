# 登录到主页跳转测试指南

## 问题描述
用户反馈：点击登录后没有显示 home.vue 页面

## 修复内容

### 问题分析
登录成功后的窗口切换流程存在时序问题：
1. 主窗口创建后立即执行路由跳转
2. 但此时 Vue 和 Router 可能还未完全初始化
3. 导致路由跳转失败或主窗口未显示

### 修复方案

#### main.js - 优化登录成功处理逻辑

**关键改进点：**

1. **增加延迟等待** - 确保 Vue/Router 初始化完成
   ```javascript
   setTimeout(() => {
     mainWindow.webContents.executeJavaScript(`
       window.location.hash = '#/home';
     `);
   }, 200);
   ```

2. **分步显示窗口** - 先跳转路由，再显示窗口
   ```javascript
   // 1. 执行路由跳转
   window.location.hash = '#/home';
   
   // 2. 延迟显示主窗口
   setTimeout(() => {
     mainWindow.show();
     mainWindow.focus();
   }, 300);
   ```

3. **增加详细日志** - 便于调试
   ```javascript
   console.log('=== 开始执行路由跳转 ===');
   console.log('当前 URL:', window.location.href);
   console.log('当前 hash:', window.location.hash);
   ```

## 完整的登录流程

### 1. 用户操作
```
1. 输入手机号：13800138000
2. 输入密码：任意密码
3. 点击"登录"按钮
```

### 2. Login.vue 处理
```javascript
// 1. 表单验证
if (!this.loginForm.username) {
  this.errorMessage = '请输入手机号'
  return
}

// 2. 模拟登录请求
await new Promise(resolve => setTimeout(resolve, 1000))

// 3. 设置 token
const mockToken = 'mock-user-token-' + Date.now();
localStorage.setItem('userToken', mockToken)

// 4. 更新 Vuex 状态
this.$store.commit('SET_TOKEN', mockToken)
this.$store.commit('SET_AUTHENTICATED', true)

// 5. 发送 IPC 到主进程
if (window.electronAPI && window.electronAPI.loginSuccess) {
  window.electronAPI.loginSuccess()
} else {
  const { ipcRenderer } = require('electron');
  ipcRenderer.send('login-success');
}
```

### 3. main.js 主进程处理
```javascript
ipcMain.on('login-success', () => {
  console.log('收到登录成功事件');
  
  if (!mainWindow) {
    // 3.1 创建主窗口
    console.log('主窗口不存在，创建新的主窗口');
    createMainWindow();
    
    // 3.2 等待窗口加载完成
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('主窗口加载完成，延迟200ms后执行路由跳转');
      
      // 3.3 延迟执行路由跳转（确保 Vue/Router 初始化完成）
      setTimeout(() => {
        mainWindow.webContents.executeJavaScript(`
          console.log('=== 开始执行路由跳转 ===');
          window.location.hash = '#/home';
          console.log('跳转完成');
        `).then(() => {
          // 3.4 再次延迟后显示窗口
          setTimeout(() => {
            console.log('显示主窗口');
            mainWindow.show();
            mainWindow.focus();
            
            // 3.5 隐藏登录窗口
            if (loginWindow) {
              console.log('隐藏登录窗口');
              loginWindow.hide();
            }
          }, 300);
        });
      }, 200);
    });
  }
});
```

### 4. 路由守卫检查
```javascript
// src/router/index.js
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userToken') !== null
  
  console.log('路由守卫:', {
    to: to.path,
    from: from.path,
    isAuthenticated
  })
  
  // 已登录访问 /home，放行
  if (isAuthenticated && to.path === '/home') {
    next()
  }
})
```

## 测试步骤

### 测试 1：首次启动登录
1. **清除登录状态**
   ```powershell
   # 删除应用数据（可选）
   Remove-Item "$env:APPDATA\AI-Agent" -Recurse -Force -ErrorAction SilentlyContinue
   ```

2. **启动应用**
   ```powershell
   .\build\AI-Agent-win32-x64\AI-Agent.exe
   ```

3. **预期结果**
   - ✅ 显示登录窗口（450×700）
   - ✅ 显示登录表单

4. **执行登录**
   - 手机号：13800138000
   - 密码：123456
   - 点击"登录"

5. **预期结果**
   - ✅ 显示"登录中..."
   - ✅ 1秒后主窗口出现（1050×700）
   - ✅ 主窗口显示 Home 页面
   - ✅ 登录窗口隐藏
   - ✅ 主窗口获得焦点

### 测试 2：已登录再次启动
1. **关闭应用**（保持 localStorage 中的 token）

2. **再次启动应用**
   ```powershell
   .\build\AI-Agent-win32-x64\AI-Agent.exe
   ```

3. **预期结果**
   - ⚠️ 当前：显示登录窗口（450×700），路由守卫重定向到 /home
   - 💡 改进空间：主进程可以预先检测登录状态，直接创建主窗口

### 测试 3：退出登录
1. **在 Home 页面点击右上角用户头像**
2. **选择"退出登录"**
3. **确认退出**

4. **预期结果**
   - ✅ 主窗口隐藏
   - ✅ 登录窗口显示（450×700）
   - ✅ localStorage.userToken 已清除
   - ✅ 显示登录表单

## 调试技巧

### 1. 查看控制台日志
登录窗口和主窗口都开启了 DevTools（开发模式）：
```javascript
// main.js
if (isDev) {
  loginWindow.webContents.openDevTools();
  mainWindow.webContents.openDevTools();
}
```

### 2. 关键日志输出
- `收到登录成功事件` - IPC 消息已接收
- `主窗口不存在，创建新的主窗口` - 开始创建主窗口
- `主窗口加载完成` - index.html 加载完成
- `=== 开始执行路由跳转 ===` - 开始执行路由跳转
- `显示主窗口` - 主窗口 show()
- `隐藏登录窗口` - 登录窗口 hide()

### 3. 检查路由状态
在 DevTools Console 中执行：
```javascript
// 查看当前路由
console.log(window.location.hash)

// 查看 localStorage
console.log(localStorage.getItem('userToken'))

// 手动跳转
window.location.hash = '#/home'
```

### 4. 检查窗口状态
```powershell
# PowerShell 中检查进程
Get-Process AI-Agent | Select-Object Id, ProcessName, MainWindowTitle
```

## 常见问题

### Q1: 点击登录后主窗口一闪而过
**原因：** 主窗口显示太快，路由还未加载完成

**解决方案：**
- ✅ 已增加延迟：200ms 等待 Vue 初始化，300ms 延迟显示窗口
- ✅ 主窗口初始设置 `show: false`，手动控制显示时机

### Q2: 主窗口显示但是空白页面
**原因：** 路由跳转失败或 Home.vue 渲染错误

**排查步骤：**
1. 打开 DevTools 查看是否有报错
2. 检查 `window.location.hash` 是否为 `#/home`
3. 检查路由配置是否正确
4. 检查 Home.vue 是否有语法错误

### Q3: 登录窗口没有隐藏
**原因：** `loginWindow.hide()` 调用失败或时序问题

**解决方案：**
- ✅ 增加了延迟：300ms 后隐藏登录窗口
- ✅ 检查 loginWindow 是否存在

### Q4: 窗口尺寸不正确
**原因：** 显示了错误的窗口

**检查：**
- 登录窗口：450×700
- 主窗口：1050×700

## 时间线分析

### 成功的登录流程时间线
```
T+0ms    : 用户点击"登录"按钮
T+1000ms : 登录验证完成，发送 IPC
T+1001ms : 主进程收到 login-success
T+1002ms : 开始创建主窗口
T+1500ms : 主窗口加载完成（did-finish-load）
T+1700ms : 执行路由跳转（延迟200ms）
T+2000ms : 显示主窗口，隐藏登录窗口（延迟300ms）
```

### 关键延迟说明
- **200ms** - 等待 Vue 和 Router 初始化
- **300ms** - 等待路由跳转完成和 Home.vue 渲染

## 窗口配置对比

### 登录窗口
```javascript
{
  width: 450,
  height: 700,
  frame: false,
  resizable: false,
  webPreferences: {
    nodeIntegration: true,      // 允许使用 require
    contextIsolation: false,    // 不隔离上下文
    enableRemoteModule: true
  }
}
```

### 主窗口
```javascript
{
  width: 1050,
  height: 700,
  frame: false,
  show: false,                  // 初始不显示
  resizable: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: false,     // 禁止使用 require
    contextIsolation: true,     // 隔离上下文（安全）
    enableRemoteModule: false
  }
}
```

## 相关文件

- **主进程**: `main.js` - 窗口管理和 IPC 处理
- **登录页面**: `src/views/Login.vue` - 登录表单和验证
- **主页面**: `src/views/Home.vue` - 主界面
- **路由配置**: `src/router/index.js` - 路由守卫
- **预加载脚本**: `preload.js` - 主窗口 API 暴露

## 下一步改进

### 改进 1：优化已登录用户的启动体验
**当前问题：** 已登录用户启动时仍然先显示登录窗口

**改进方案：**
可以在渲染进程初始化时立即检查 token 并通知主进程：
```javascript
// App.vue created 钩子
created() {
  const token = localStorage.getItem('userToken')
  if (token) {
    // 立即通知主进程切换到主窗口
    if (window.electronAPI) {
      window.electronAPI.loginSuccess()
    }
  }
}
```

### 改进 2：添加加载动画
**目的：** 提升用户体验，在窗口切换时显示加载状态

### 改进 3：统一窗口安全配置
**目的：** 将登录窗口也改为 `contextIsolation: true`，提高安全性

---

**生成时间：** 2025-10-23  
**测试状态：** ⏳ 待用户验证  
**修复版本：** v1.0.2
