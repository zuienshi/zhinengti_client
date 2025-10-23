# 登录窗口尺寸问题修复报告

## 问题描述

用户反馈：应用启动后显示的窗口尺寸是主窗口的尺寸（1050×700），而不是登录窗口的尺寸（450×700）。

## 问题根因分析

### 原有逻辑存在的问题：

1. **启动时创建错误的窗口**
   - 应用启动时始终创建主窗口（1050×700）
   - 从未创建登录窗口（createLoginWindow 函数定义了但未被调用）

2. **错误的窗口切换方式**
   - App.vue 尝试通过 `resizeWindow` IPC 来动态调整窗口尺寸
   - 但主窗口设置了 `resizable: false`，无法动态调整尺寸
   - 这种方式不符合 Electron 的最佳实践

3. **逻辑流程问题**
   ```
   错误流程：
   app.whenReady() 
   → 创建主窗口(1050×700) 
   → App.vue 尝试 resize 到 450×700 ❌ (无效)
   → 结果：显示 1050×700 窗口
   ```

## 修复方案

### 正确的逻辑流程：

```
应用启动
↓
检查登录状态
↓
├─ 未登录 → 创建登录窗口(450×700) → 显示登录页
└─ 已登录 → 创建主窗口(1050×700) → 显示主页
```

### 具体修改：

#### 1. main.js - 应用启动逻辑

**修改前：**
```javascript
app.whenReady().then(() => {
  log('应用就绪，检测登录状态')
  // 先创建主窗口但不显示
  createMainWindow();  // ❌ 总是创建主窗口
  // ...
})
```

**修改后：**
```javascript
app.whenReady().then(() => {
  log('应用就绪，检测登录状态')
  // 直接创建登录窗口，登录成功后会创建主窗口
  createLoginWindow();  // ✅ 先创建登录窗口
  // ...
})
```

#### 2. App.vue - 移除动态调整逻辑

**修改前：**
```javascript
mounted() {
  // 在 mounted 中检查登录状态，调整窗口尺寸
  this.$nextTick(() => {
    this.checkLoginAndNavigate()  // ❌ 尝试用 resize 改变尺寸
  })
}

methods: {
  checkLoginAndNavigate() {
    if (token) {
      this.showMainWindow()  // 调用 resizeWindow(1050, 700)
    } else {
      this.showLoginWindow() // 调用 resizeWindow(450, 700)
    }
  }
}
```

**修改后：**
```javascript
mounted() {
  // 只需监听登录状态变化，不需要调整窗口尺寸
  // 窗口切换由主进程的 login-success 和 logout 事件处理
  if (window.electronAPI) {
    window.electronAPI.onLoginStatusChanged((status) => {
      if (status) {
        this.$store.commit('SET_AUTHENTICATED', true)
      } else {
        this.$store.commit('SET_AUTHENTICATED', false)
      }
    })
  }
}

methods: {
  // 删除不再需要的方法，由主进程和路由守卫处理
}
```

#### 3. 登录窗口显示优化

**修改前：**
```javascript
loginWindow.on('ready-to-show', () => {
  console.log('窗口准备显示');
  loginWindow.show(); // 显示窗口
  console.log('窗口已显示');
});
```

**修改后：**
```javascript
loginWindow.on('ready-to-show', () => {
  console.log('登录窗口准备显示');
  loginWindow.show(); // 显示窗口
  loginWindow.focus(); // 聚焦窗口 ✅ 确保窗口获得焦点
  console.log('登录窗口已显示');
});
```

## 新的工作流程

### 1. 应用启动流程

```
1. app.whenReady()
   ↓
2. createLoginWindow()
   - 创建 450×700 的登录窗口
   - nodeIntegration: true
   - contextIsolation: false
   ↓
3. 加载 index.html
   ↓
4. 路由守卫检查登录状态
   - 无 token → 显示 /login
   - 有 token → 重定向到 /home (但窗口仍是登录窗口)
   ↓
5. 显示登录窗口 (450×700)
```

### 2. 登录成功流程

```
1. Login.vue - handleLogin()
   ↓
2. 设置 localStorage.userToken
   ↓
3. 发送 IPC: 'login-success'
   ↓
4. main.js 监听 'login-success'
   ↓
5. 创建主窗口 (1050×700)
   - nodeIntegration: false
   - contextIsolation: true
   - show: false (初始不显示)
   ↓
6. 主窗口加载完成后
   - 执行路由跳转到 /home
   - 显示主窗口
   - 隐藏登录窗口
```

### 3. 退出登录流程

```
1. Home.vue - handleLogout()
   ↓
2. 清除 localStorage.userToken
   ↓
3. 清除 Vuex 状态
   ↓
4. 发送 IPC: 'logout'
   ↓
5. main.js 监听 'logout'
   ↓
6. 销毁旧的登录窗口
   ↓
7. 创建全新的登录窗口 (450×700)
   ↓
8. 显示登录窗口
   ↓
9. 隐藏主窗口
```

## 验证方法

### 测试场景 1：首次启动（未登录）

**预期结果：**
- ✅ 窗口尺寸：450×700
- ✅ 显示登录页面
- ✅ 窗口居中显示
- ✅ 窗口可拖动，不可调整大小

**验证命令：**
```powershell
# 清除登录状态
rm $env:LOCALAPPDATA\AI-Agent\* -Recurse -Force

# 启动应用
.\build\AI-Agent-win32-x64\AI-Agent.exe
```

### 测试场景 2：登录成功

**操作步骤：**
1. 输入手机号：13800138000
2. 输入密码：任意密码
3. 点击"登录"按钮

**预期结果：**
- ✅ 登录窗口隐藏
- ✅ 主窗口显示（1050×700）
- ✅ 显示 Home 页面
- ✅ 窗口居中显示

### 测试场景 3：已登录再次启动

**操作步骤：**
1. 登录成功后关闭应用
2. 再次启动应用

**预期结果：**
- ⚠️ **当前实现：** 仍然先显示登录窗口(450×700)，然后路由守卫重定向到 /home
- 💡 **改进建议：** 可以在主进程启动时先检查 localStorage，直接创建对应的窗口

### 测试场景 4：退出登录

**操作步骤：**
1. 在 Home 页面点击右上角用户头像
2. 选择"退出登录"
3. 确认退出

**预期结果：**
- ✅ 主窗口隐藏
- ✅ 登录窗口显示（450×700）
- ✅ 显示登录页面
- ✅ localStorage.userToken 已清除

## 窗口尺寸对比

| 窗口类型 | 宽度 | 高度 | 可调整大小 | 用途 |
|---------|------|------|-----------|------|
| 登录窗口 | 450px | 700px | ❌ 禁止 | 登录、注册、短信登录 |
| 主窗口 | 1050px | 700px | ❌ 禁止 | 主界面、直播管理、AI审核 |

## 技术细节

### 登录窗口配置
```javascript
loginWindow = new BrowserWindow({
  width: 450,              // 固定宽度
  height: 700,             // 固定高度
  frame: false,            // 无边框
  resizable: false,        // 不可调整大小
  maximizable: false,      // 不可最大化
  fullscreenable: false,   // 不可全屏
  webPreferences: {
    nodeIntegration: true,     // 启用 Node 集成
    contextIsolation: false,   // 禁用上下文隔离
    enableRemoteModule: true,  // 启用 remote 模块
    devTools: true
  }
})
```

### 主窗口配置
```javascript
mainWindow = new BrowserWindow({
  width: 1050,             // 固定宽度
  height: 700,             // 固定高度
  frame: false,            // 无边框
  show: false,             // 初始不显示
  center: true,            // 居中显示
  resizable: false,        // 不可调整大小
  maximizable: false,      // 不可最大化
  fullscreenable: false,   // 不可全屏
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: false,    // 禁用 Node 集成（安全）
    contextIsolation: true,    // 启用上下文隔离（安全）
    enableRemoteModule: false, // 禁用 remote 模块（安全）
    devTools: true
  }
})
```

## 安全性说明

### 为什么两个窗口的安全配置不同？

1. **登录窗口（安全性较低）**
   - `nodeIntegration: true` - 允许直接使用 Node.js API
   - `contextIsolation: false` - 共享上下文
   - 原因：登录窗口需要直接调用 `require('electron')` 进行窗口控制
   - 风险：如果加载外部内容，存在 XSS 风险

2. **主窗口（安全性高）**
   - `nodeIntegration: false` - 禁止直接访问 Node.js API
   - `contextIsolation: true` - 隔离上下文
   - `preload.js` - 通过 contextBridge 暴露安全的 API
   - 原因：主窗口可能加载外部内容，需要更高的安全性

### 改进建议

**长期方案：** 统一两个窗口的安全配置
- 将登录窗口也改为 `contextIsolation: true`
- 修改 Login.vue，使用 `window.electronAPI` 而非 `require('electron')`
- 在 preload.js 中暴露所有需要的 API

## 相关文件

### 主要修改文件
- ✅ `main.js` - 修改应用启动逻辑，从创建主窗口改为创建登录窗口
- ✅ `src/App.vue` - 移除动态调整窗口尺寸的逻辑
- ✅ `main.js` - 优化登录窗口显示逻辑，增加 focus()

### 相关但未修改的文件
- `src/views/Login.vue` - 登录页面（无需修改）
- `src/views/Home.vue` - 主页面（无需修改）
- `src/router/index.js` - 路由配置（已正确配置路由守卫）
- `preload.js` - 预加载脚本（主窗口使用）

## 构建和测试

### 重新构建应用

```powershell
# 1. 构建前端资源
npm run build

# 2. 打包应用（使用自定义脚本）
.\build-app.ps1

# 3. 启动应用测试
.\build\AI-Agent-win32-x64\AI-Agent.exe
```

### 开发模式测试

```powershell
# 1. 启动 Vite 开发服务器
npm run dev

# 2. 在另一个终端启动 Electron
npm run electron:dev
```

## 已知问题和改进方向

### 问题 1：已登录用户启动时仍显示登录窗口

**现象：**
- 用户已登录，localStorage 中有 token
- 应用启动时仍然显示登录窗口（450×700）
- 然后路由守卫重定向到 /home
- 但窗口尺寸仍是 450×700

**原因：**
- 主进程无法直接访问 localStorage
- 应用启动时总是创建登录窗口

**改进方案：**
可以在渲染进程加载后立即发送登录状态给主进程：

```javascript
// App.vue created 钩子
created() {
  const token = localStorage.getItem('userToken')
  if (token) {
    // 立即通知主进程用户已登录
    if (window.electronAPI) {
      window.electronAPI.loginSuccess()
    }
  }
}
```

### 问题 2：窗口切换时的闪烁

**现象：**
- 登录成功后，可能看到窗口切换的闪烁

**改进方案：**
- 使用 `backgroundColor` 统一背景色
- 使用淡入淡出动画

## 总结

### 核心修复点
1. ✅ 修改应用启动逻辑：从创建主窗口改为创建登录窗口
2. ✅ 移除 App.vue 中的动态窗口调整逻辑
3. ✅ 由主进程根据登录事件切换窗口

### 效果
- ✅ 首次启动显示 450×700 登录窗口
- ✅ 登录成功后切换到 1050×700 主窗口
- ✅ 退出登录后恢复 450×700 登录窗口

### 验证状态
- ⏳ 待测试：需要重新构建应用并验证

---

**生成时间：** 2025-10-23  
**修复版本：** v1.0.1  
**修复人：** AI Assistant
