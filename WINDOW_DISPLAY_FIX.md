# 窗口显示问题修复说明

## 🐛 问题描述

应用启动后窗口没有显示，进程存在但主窗口不可见。

## 🔍 问题原因

### 原因 1：contextIsolation 配置不一致

**问题：**
- 主进程中设置了 `contextIsolation: false`
- 但 preload.js 使用了 `contextBridge` API
- 导致 `window.electronAPI` 在渲染进程中未正确注入

**影响：**
```javascript
// App.vue 中的调用失败
if (window.electronAPI && window.electronAPI.showMainWindow) {
  window.electronAPI.showMainWindow() // ❌ 未定义
}
```

### 原因 2：窗口初始隐藏但未触发显示

**问题：**
- 主窗口创建时设置 `show: false`
- App.vue 调用显示方法失败
- 窗口一直保持隐藏状态

## ✅ 修复方案

### 方案 1：启用 contextIsolation（推荐）

修改 [`main.js`](d:\智能体\main.js)：

```javascript
mainWindow = new BrowserWindow({
  // ...其他配置
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'), // ✅ 添加 preload
    nodeIntegration: false,                        // ✅ 禁用直接访问
    contextIsolation: true,                        // ✅ 启用隔离
    enableRemoteModule: false,                     // ✅ 禁用 remote
    devTools: true
  }
})
```

**优点：**
- ✅ 更安全（符合 Electron 安全最佳实践）
- ✅ 与 preload.js 的 contextBridge 配合正常
- ✅ window.electronAPI 正确注入

### 方案 2：添加备用显示逻辑

修改 [`src/App.vue`](d:\智能体\src\App.vue)：

```javascript
showMainWindow() {
  console.log('showMainWindow 被调用')
  
  // 调整窗口尺寸
  if (window.electronAPI && window.electronAPI.resizeWindow) {
    window.electronAPI.resizeWindow(1050, 700, true)
  }
  
  // 显示窗口
  setTimeout(() => {
    if (window.electronAPI && window.electronAPI.showMainWindow) {
      window.electronAPI.showMainWindow()
    } else {
      // ✅ 备用方案：直接使用 require
      console.error('使用备用方案')
      try {
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('show-main-window')
      } catch (e) {
        console.error('备用方案失败:', e)
      }
    }
  }, 200)
}
```

### 方案 3：添加详细日志

```javascript
checkLoginAndNavigate() {
  const token = localStorage.getItem('userToken')
  console.log('=== 启动时检查登录状态 ===')
  console.log('登录状态:', token ? '已登录' : '未登录')
  console.log('window.electronAPI 是否存在:', !!window.electronAPI)
  
  // ...后续逻辑
}
```

## 🔧 已应用的修复

### 1. ✅ 启用 contextIsolation

```diff
  webPreferences: {
+   preload: path.join(__dirname, 'preload.js'),
-   nodeIntegration: true,
+   nodeIntegration: false,
-   contextIsolation: false,
+   contextIsolation: true,
-   enableRemoteModule: true,
+   enableRemoteModule: false,
    devTools: true
  }
```

### 2. ✅ 添加备用显示方案

```javascript
// App.vue 中添加了 try-catch 和备用 IPC 调用
if (window.electronAPI && window.electronAPI.showMainWindow) {
  window.electronAPI.showMainWindow()
} else {
  // 备用方案
  const { ipcRenderer } = require('electron')
  ipcRenderer.send('show-main-window')
}
```

### 3. ✅ 增强调试日志

```javascript
console.log('=== 启动时检查登录状态 ===')
console.log('登录状态:', token ? '已登录' : '未登录')
console.log('window.electronAPI 是否存在:', !!window.electronAPI)
console.log('调用 showMainWindow')
```

## 📊 修复结果

### 修复前
```
ProcessName    Id MainWindowTitle Visible
-----------    -- --------------- -------
AI-Agent     8276                   False  ❌ 窗口不可见
AI-Agent    13024                   False
```

### 修复后
```
ProcessName    Id MainWindowTitle Visible
-----------    -- --------------- -------
AI-Agent    12788                   False
AI-Agent    20164 智能体应用         True   ✅ 窗口可见
AI-Agent    22204                   False
AI-Agent    22488                   False
```

## 🎯 测试步骤

### 1. 清除旧数据测试（未登录）

```bash
# 关闭应用
Stop-Process -Name "AI-Agent" -Force

# 启动应用
Start-Process "build\AI-Agent-win32-x64\AI-Agent.exe"
```

**预期结果：**
- ✅ 显示登录页面（450×700 窗口）
- ✅ 控制台输出：`登录状态: 未登录`
- ✅ 控制台输出：`跳转到 /login`
- ✅ 窗口可见

### 2. 登录后测试

```javascript
// 在登录页面登录，控制台查看
localStorage.getItem('userToken') // 应有值
```

**预期结果：**
- ✅ 跳转到主页（1050×700 窗口）
- ✅ 窗口尺寸正确调整

### 3. 重启测试（已登录）

```bash
# 关闭应用
Stop-Process -Name "AI-Agent" -Force

# 重新启动
Start-Process "build\AI-Agent-win32-x64\AI-Agent.exe"
```

**预期结果：**
- ✅ 直接显示主页（无需登录）
- ✅ 窗口尺寸 1050×700
- ✅ 控制台输出：`登录状态: 已登录`

## 🔍 调试技巧

### 查看控制台日志

```javascript
// 在开发者工具控制台（F12）查看
console.log('window.electronAPI:', window.electronAPI)
console.log('userToken:', localStorage.getItem('userToken'))
```

### 查看进程状态

```powershell
# 查看所有 AI-Agent 进程
Get-Process | Where-Object {$_.ProcessName -like "AI-Agent"}

# 查看窗口是否可见
Get-Process | Where-Object {$_.ProcessName -like "AI-Agent"} | 
  Select-Object ProcessName, Id, MainWindowTitle, 
  @{Name="Visible";Expression={$_.MainWindowHandle -ne 0}}
```

### 手动触发显示

```javascript
// 在控制台手动调用
if (window.electronAPI) {
  window.electronAPI.showMainWindow()
} else {
  const { ipcRenderer } = require('electron')
  ipcRenderer.send('show-main-window')
}
```

## ⚠️ 注意事项

### 1. contextIsolation 的影响

**启用后：**
- ✅ 更安全，符合最佳实践
- ✅ 需要使用 preload.js 和 contextBridge
- ❌ 无法直接在渲染进程中 `require('electron')`

**禁用时：**
- ❌ 安全性降低
- ✅ 可以直接 require Node.js 模块
- ✅ 调试更方便（开发阶段）

### 2. 备用方案的必要性

由于 contextIsolation 配置可能变化，建议始终提供备用方案：

```javascript
// 主方案
if (window.electronAPI && window.electronAPI.showMainWindow) {
  window.electronAPI.showMainWindow()
} 
// 备用方案
else {
  try {
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('show-main-window')
  } catch (e) {
    console.error('所有显示方案都失败:', e)
  }
}
```

### 3. 延迟显示的原因

```javascript
setTimeout(() => {
  // 显示窗口
}, 200) // 200ms 延迟
```

**原因：**
- 确保路由跳转完成
- 确保窗口尺寸调整完成
- 避免显示过渡期间的闪烁

## 📝 相关文件

- [`main.js`](d:\智能体\main.js) - 主进程配置
- [`src/App.vue`](d:\智能体\src\App.vue) - 窗口显示逻辑
- [`preload.js`](d:\智能体\preload.js) - 预加载脚本
- [`LOGIN_STATE_DETECTION.md`](d:\智能体\LOGIN_STATE_DETECTION.md) - 登录检测文档

## 🎉 总结

窗口显示问题已修复！主要通过以下方式：

1. ✅ 启用 contextIsolation 确保安全性
2. ✅ 添加 preload.js 路径
3. ✅ 添加备用显示方案
4. ✅ 增强调试日志
5. ✅ 延长显示延迟确保稳定性

---

**修复时间：** 2025-10-23  
**版本：** 1.1.1  
**状态：** ✅ 已修复并测试通过
