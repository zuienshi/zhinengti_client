const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// 环境判断
const isDev = process.env.NODE_ENV === 'development'

// 日志函数
function log(message, ...args) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}]`, message, ...args)
}

// 简化的主进程代码
let loginWindow
let mainWindow

function createLoginWindow() {
  log('创建登录窗口...')
  
  // 创建窗口配置 - 保持原始固定尺寸
  loginWindow = new BrowserWindow({
    width: 450,  // 原始宽度
    height: 700, // 原始高度
    frame: false,
    title: '智能体应用',
    resizable: false, // 不可调整大小
    maximizable: false, // 不可最大化
    fullscreenable: false, // 不可全屏显示
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true
    }
  })
  
  // 加载文件
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('加载文件:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    console.log('index.html文件存在');
    // 使用loadFile方法更简单直接
    loginWindow.loadFile(indexPath)
      .then(() => {
        log('文件加载成功');
        // 仅在开发模式下打开开发者工具
        if (isDev) {
          loginWindow.webContents.openDevTools();
          log('开发工具已打开');
        }
      })
      .catch(error => {
        console.error('文件加载失败:', error);
      });
    
    // 在DOM加载完成后，注入窗口控制支持
    loginWindow.webContents.on('dom-ready', () => {
      log('DOM加载完成，注入窗口控制支持');
      loginWindow.webContents.executeJavaScript(`
        console.log('执行注入的JavaScript代码');
        if (typeof window !== 'undefined') {
          // 获取ipcRenderer
          const { ipcRenderer } = require('electron');
          
          // 创建简单的窗口控制方法
          window.minimizeWindow = function() {
            console.log('调用minimizeWindow');
            ipcRenderer.send('window-minimize');
          };
          
          window.closeWindow = function() {
            console.log('调用closeWindow');
            ipcRenderer.send('window-close');
          };
          
          console.log('窗口控制方法已成功注入到window对象');
        } else {
          console.error('window对象不可用');
        }
      `);
    });
  } else {
    console.error('index.html文件不存在:', indexPath);
    // 如果文件不存在，尝试加载直接的index.html
    try {
      console.log('尝试直接加载index.html');
      loginWindow.loadURL('file://' + path.join(__dirname, 'index.html'));
    } catch (error) {
      console.error('加载失败:', error);
    }
  }
  
  // 基本窗口事件监听
  loginWindow.on('closed', () => {
    console.log('窗口已关闭');
    loginWindow = null;
  });
  
  // 窗口准备显示事件
  loginWindow.on('ready-to-show', () => {
    console.log('登录窗口准备显示');
    loginWindow.show(); // 显示窗口
    loginWindow.focus(); // 聚焦窗口
    console.log('登录窗口已显示');
  });
  
  // 窗口显示事件
  loginWindow.on('show', () => {
    console.log('窗口显示事件触发');
  });
  
  // 窗口获得焦点事件
  loginWindow.on('focus', () => {
    console.log('窗口获得焦点');
  });
  
  // 窗口控制事件
  loginWindow.on('minimize', () => {
    console.log('窗口已最小化');
  });
  
  loginWindow.on('restore', () => {
    console.log('窗口已恢复');
  });
}

// 创建主应用窗口（Home页面）
function createMainWindow() {
  log('创建主应用窗口...')
  
  // 创建主应用窗口配置 - 使用系统标题栏，允许调整大小
  mainWindow = new BrowserWindow({
    width: 1200,  // 默认宽度
    height: 800,  // 默认高度
    minWidth: 1000,  // 最小宽度
    minHeight: 600,  // 最小高度
    frame: true,  // 使用系统标题栏（包含最小化、最大化、关闭按钮）
    title: '智能体应用',
    resizable: true,  // 允许调整窗口大小
    maximizable: true,  // 允许最大化窗口
    fullscreenable: true,  // 允许全屏显示
    autoHideMenuBar: true,  // 自动隐藏菜单栏（File、Edit等）
    show: false,  // 初始不显示，等待检查登录状态
    center: true,  // 窗口居中显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      devTools: true
    }
  })
  
  // 加载文件
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  log('加载文件:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    log('index.html文件存在');
    // 使用loadFile方法更简单直接
    mainWindow.loadFile(indexPath)
      .then(() => {
        log('文件加载成功');
        // 仅在开发模式下打开开发者工具
        if (isDev) {
          mainWindow.webContents.openDevTools();
          log('开发工具已打开');
        }
      })
      .catch(error => {
        log('文件加载失败:', error);
      });
    
    // 在DOM加载完成后，注入窗口控制支持
    mainWindow.webContents.on('dom-ready', () => {
      log('DOM加载完成，注入窗口控制支持');
      mainWindow.webContents.executeJavaScript(`
        console.log('执行注入的JavaScript代码');
        if (typeof window !== 'undefined') {
          // 获取ipcRenderer
          const { ipcRenderer } = require('electron');
          
          // 创建简单的窗口控制方法
          window.minimizeWindow = function() {
            console.log('调用minimizeWindow');
            ipcRenderer.send('window-minimize');
          };
          
          window.closeWindow = function() {
            console.log('调用closeWindow');
            ipcRenderer.send('window-close');
          };
          
          // 添加窗口大小调整方法
          window.resizeWindow = function(width, height, center) {
            console.log('调用resizeWindow，参数:', {width, height, center});
            ipcRenderer.send('window-resize', {width, height, center});
          };
          
          console.log('窗口控制方法已成功注入到window对象');
        } else {
          console.error('window对象不可用');
        }
      `);
    });
  } else {
    log('index.html文件不存在:', indexPath);
    // 如果文件不存在，尝试加载直接的index.html
    try {
      log('尝试直接加载index.html');
      mainWindow.loadURL('file://' + path.join(__dirname, 'index.html'));
    } catch (error) {
      log('加载失败:', error);
    }
  }
  
  // 基本窗口事件监听
  mainWindow.on('closed', () => {
    log('主窗口已关闭');
    mainWindow = null;
  });
  
  // 窗口准备显示事件 - 不自动显示，等待渲染进程检查登录状态
  mainWindow.on('ready-to-show', () => {
    log('主窗口准备显示，等待登录状态检查');
    // 不在这里显示，让App.vue或路由器决定
  });
  
  // 窗口显示事件
  mainWindow.on('show', () => {
    log('主窗口显示事件触发');
  });
  
  // 窗口获得焦点事件
  mainWindow.on('focus', () => {
    log('主窗口获得焦点');
  });
  
  // 窗口控制事件
  mainWindow.on('minimize', () => {
    log('主窗口已最小化');
  });
  
  mainWindow.on('restore', () => {
    log('主窗口已恢复');
  });
}

// 处理登录成功事件，切换到主窗口
ipcMain.on('login-success', () => {
  console.log('收到登录成功事件');
  
  // 无论如何先创建主窗口，确保它存在
  if (!mainWindow) {
    console.log('主窗口不存在，创建新的主窗口');
    createMainWindow();
    
    // 等待主窗口加载完成
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('主窗口加载完成，延迟200ms后执行路由跳转');
      
      // 等待一下确保 Vue 和 Router 初始化完成
      setTimeout(() => {
        mainWindow.webContents.executeJavaScript(`
          console.log('=== 开始执行路由跳转 ===');
          console.log('当前 URL:', window.location.href);
          console.log('当前 hash:', window.location.hash);
          
          // 直接修改 hash
          window.location.hash = '#/home';
          console.log('路由跳转完成，新 hash:', window.location.hash);
        `).then(() => {
          console.log('路由跳转脚本执行成功');
          
          // 显示主窗口
          setTimeout(() => {
            console.log('显示主窗口');
            mainWindow.show();
            mainWindow.focus();
            
            // 隐藏登录窗口
            if (loginWindow) {
              console.log('隐藏登录窗口');
              loginWindow.hide();
            }
          }, 300);
        }).catch(error => {
          console.error('路由跳转失败:', error);
        });
      }, 200);
    });
  } else {
    console.log('主窗口已存在，准备显示');
    
    // 执行路由跳转
    mainWindow.webContents.executeJavaScript(`
      console.log('=== 开始执行路由跳转 ===');
      window.location.hash = '#/home';
      console.log('跳转完成');
    `).then(() => {
      // 显示主窗口
      mainWindow.show();
      mainWindow.focus();
      
      // 隐藏登录窗口
      if (loginWindow) {
        setTimeout(() => {
          console.log('隐藏登录窗口');
          loginWindow.hide();
        }, 300);
      }
    });
  }
  
  console.log('登录成功流程完成');
});

// 处理最小化窗口事件
ipcMain.on('window-minimize', () => {
  console.log('收到最小化窗口事件');
  
  // 优先处理可见的窗口
  if (mainWindow && mainWindow.isVisible() && !mainWindow.isMinimized()) {
    mainWindow.minimize();
    console.log('主窗口已最小化');
  } else if (loginWindow && loginWindow.isVisible() && !loginWindow.isMinimized()) {
    loginWindow.minimize();
    console.log('登录窗口已最小化');
  } else {
    console.log('没有可见的窗口需要最小化');
  }
});

// 处理窗口移动事件
ipcMain.on('window-move', (event, { x, y }) => {
  console.log('收到窗口移动事件，位置:', { x, y });
  
  // 只移动可见的窗口
  if (mainWindow && mainWindow.isVisible() && !mainWindow.isFullScreen() && !mainWindow.isMaximized()) {
    mainWindow.setPosition(x, y);
    console.log('主窗口已移动');
  } else if (loginWindow && loginWindow.isVisible() && !loginWindow.isFullScreen() && !loginWindow.isMaximized()) {
    loginWindow.setPosition(x, y);
    console.log('登录窗口已移动');
  }
});

// 获取窗口位置
ipcMain.handle('get-window-position', (event) => {
  console.log('收到获取窗口位置请求');
  let window = mainWindow || loginWindow;
  if (window) {
    const position = window.getPosition();
    console.log('窗口位置:', { x: position[0], y: position[1] });
    return { x: position[0], y: position[1] };
  }
  return { x: 0, y: 0 };
});

// 处理关闭窗口事件
ipcMain.on('window-close', () => {
  console.log('收到关闭窗口事件');
  if (mainWindow && mainWindow.isVisible()) {
    // 主窗口可见时，向渲染进程发送退出提醒消息
    mainWindow.webContents.send('show-exit-confirmation');
  } else if (loginWindow && loginWindow.isVisible()) {
    // 如果只有登录窗口可见，直接退出应用
    console.log('关闭登录窗口，退出应用');
    app.quit();
  }
});

// 处理确认退出事件
ipcMain.on('confirm-exit', () => {
  console.log('收到确认退出事件');
  if (mainWindow) {
    // 先关闭主窗口
    mainWindow.close();
    console.log('主窗口已关闭');
  }
  // 然后退出应用
  setTimeout(() => {
    app.quit();
    console.log('应用程序已退出');
  }, 300);
});

// 处理取消退出事件
ipcMain.on('cancel-exit', () => {
  console.log('收到取消退出事件');
  // 不需要额外操作，保持当前状态
});

// 处理退出登录事件，切换回登录窗口
ipcMain.on('logout', () => {
  console.log('收到退出登录事件');
  
  // 强制创建新的登录窗口，确保完全重置状态
  if (loginWindow) {
    console.log('销毁旧的登录窗口');
    loginWindow.destroy();
    loginWindow = null;
  }
  
  console.log('创建全新的登录窗口');
  createLoginWindow();
  
  // 处理主窗口
  if (mainWindow) {
    console.log('主窗口存在，立即隐藏');
    // 立即隐藏主窗口
    mainWindow.hide();
  }
  
  // 直接显示登录窗口
  setTimeout(() => {
    if (loginWindow) {
      console.log('确保登录窗口可见');
      loginWindow.show();
      loginWindow.focus();
    }
  }, 50);
  
  console.log('退出登录流程完成');
});

// 检查登录状态的IPC处理
ipcMain.handle('check-login-status', async () => {
  // 这里返回一个标志，让渲染进程自己检查localStorage
  return { needCheck: true }
})

// 显示主窗口的IPC处理
ipcMain.on('show-main-window', () => {
  log('收到显示主窗口请求')
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})

// 应用就绪后创建窗口
app.whenReady().then(() => {
  log('应用就绪，检测登录状态')
  
  // 直接创建登录窗口，登录成功后会创建主窗口
  createLoginWindow();
  
  // 处理macOS的特殊情况
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoginWindow();
    }
  })
})

// 当所有窗口关闭时处理
app.on('window-all-closed', () => {
  console.log('所有窗口已关闭')
  // 在macOS上，应用即使没有窗口也会继续运行
  if (process.platform === 'darwin') {
    // macOS默认行为已处理
  }
  // 在Windows和Linux上，保持应用运行而不自动退出
  // 这样可以通过系统托盘或其他方式再次激活应用
})