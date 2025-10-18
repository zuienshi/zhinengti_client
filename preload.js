const { contextBridge, ipcRenderer, remote } = require('electron')

// 向渲染进程暴露安全的IPC接口
contextBridge.exposeInMainWorld('electronAPI', {
  // 登录相关
  showLoginWindow: () => ipcRenderer.send('show-login-window'),
  loginSuccess: () => ipcRenderer.send('login-success'),
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
  minimizeWindow: () => {
    try {
      if (remote && remote.getCurrentWindow) {
        remote.getCurrentWindow().minimize()
      }
    } catch (error) {
      console.error('最小化窗口失败:', error)
    }
  },
  closeWindow: () => {
    try {
      if (remote && remote.getCurrentWindow) {
        remote.getCurrentWindow().close()
      }
    } catch (error) {
      console.error('关闭窗口失败:', error)
    }
  },
  // 调整窗口大小
  resizeWindow: (width, height, center) => {
    try {
      ipcRenderer.send('window-resize', { width, height, center })
    } catch (error) {
      console.error('调整窗口大小失败:', error)
    }
  }
})