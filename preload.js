const { contextBridge, ipcRenderer } = require('electron')

// 向渲染进程暴露安全的IPC接口
contextBridge.exposeInMainWorld('electronAPI', {
  // 登录相关
  showLoginWindow: () => ipcRenderer.send('show-login-window'),
  loginSuccess: () => ipcRenderer.send('login-success'),
  logout: () => ipcRenderer.send('logout'),
  onLoginStatusChanged: (callback) => {
    const wrappedCallback = (event, arg) => callback(arg)
    ipcRenderer.on('login-status-changed', wrappedCallback)
    return () => ipcRenderer.removeListener('login-status-changed', wrappedCallback)
  },
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  
  // 设置和获取cookie
  setCookie: (name, value, expires) => {
    ipcRenderer.send('set-cookie', { name, value, expires })
  },
  getCookie: (name) => ipcRenderer.invoke('get-cookie', name),
  
  // 窗口控制方法
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  resizeWindow: (width, height, center) => ipcRenderer.send('window-resize', { width, height, center }),
  showMainWindow: () => ipcRenderer.send('show-main-window'),
  
  // 退出确认
  onShowExitConfirmation: (callback) => {
    ipcRenderer.on('show-exit-confirmation', callback)
  },
  confirmExit: () => ipcRenderer.send('confirm-exit'),
  cancelExit: () => ipcRenderer.send('cancel-exit'),
  
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // 窗口位置
  getWindowPosition: () => ipcRenderer.invoke('get-window-position')
})

// 导出应用常量
contextBridge.exposeInMainWorld('APP_CONSTANTS', {
  VERSION: '1.0.0',
  APP_NAME: '智能体应用'
})