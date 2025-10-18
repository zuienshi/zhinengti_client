// 简单的Electron窗口测试脚本
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// 确保只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('应用程序已经在运行');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当第二个实例启动时，聚焦到已存在的窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  let mainWindow;

  function createWindow() {
    console.log('创建测试窗口...');
    
    // 创建窗口配置
    mainWindow = new BrowserWindow({
      width: 420,
      height: 620,
      frame: false,
      title: '智能体应用',
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        devTools: true
      }
    });

    // 加载应用
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log(`检查文件: ${indexPath}`);
    
    if (fs.existsSync(indexPath)) {
      console.log('文件存在，开始加载');
      mainWindow.loadURL(`file://${indexPath}`);
      
      // 打开开发者工具
      mainWindow.webContents.openDevTools();
      
      // 监听页面加载完成
      mainWindow.webContents.on('did-finish-load', () => {
        console.log('页面加载完成');
        
        // 注入窗口控制方法
        mainWindow.webContents.executeJavaScript(`
          // 直接暴露remote模块
          if (window.require) {
            window.electron_remote = window.require('electron').remote;
            console.log('已注入remote模块');
          }
          
          console.log('窗口控制准备就绪');
        `);
      });
    } else {
      console.error(`文件不存在: ${indexPath}`);
      app.quit();
    }

    // 窗口事件
    mainWindow.on('closed', () => {
      console.log('窗口已关闭');
      mainWindow = null;
    });
    
    mainWindow.on('ready-to-show', () => {
      console.log('窗口准备显示');
      mainWindow.show();
    });
  }

  app.on('ready', () => {
    console.log('应用就绪');
    createWindow();
  });

  app.on('window-all-closed', () => {
    console.log('所有窗口已关闭');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}