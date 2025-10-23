// 预加载脚本，用于在渲染进程中提供安全的API访问
const { contextBridge, ipcRenderer } = require('electron')

// 向渲染进程暴露IPC通信API
contextBridge.exposeInMainWorld('electronAPI', {
  // 登录状态检查
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  // 发送登录请求
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  // 发送登出请求
  logout: () => ipcRenderer.invoke('logout'),
  // 接收登录状态变化事件
  onLoginStatusChanged: (callback) => ipcRenderer.on('login-status-changed', (event, status) => callback(status)),
  // 发送通知
  showNotification: (title, options) => ipcRenderer.send('show-notification', title, options),
  // 获取系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  // 打开外部链接
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  // 窗口控制功能
  minimizeWindow: () => ipcRenderer.send('window-control', 'minimize'),
  maximizeWindow: () => ipcRenderer.send('window-control', 'maximize'),
  unmaximizeWindow: () => ipcRenderer.send('window-control', 'unmaximize'),
  closeWindow: () => ipcRenderer.send('window-control', 'close'),
  // 调整窗口大小
  resizeWindow: (width, height, center) => ipcRenderer.send('window-resize', { width, height, center }),
  // 检查窗口状态
  isWindowMaximized: () => ipcRenderer.invoke('window-status', 'isMaximized')
})

// 导出一些全局常量
contextBridge.exposeInMainWorld('APP_CONSTANTS', {
  VERSION: process.env.npm_package_version || '1.0.0',
  APP_NAME: process.env.npm_package_name || '智能体应用'
})