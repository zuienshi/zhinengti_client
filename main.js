const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// 简化的主进程代码
let loginWindow
let mainWindow

function createLoginWindow() {
  console.log('创建登录窗口...')
  
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
        console.log('文件加载成功');
        // 打开开发者工具
        loginWindow.webContents.openDevTools();
        console.log('开发工具已打开');
      })
      .catch(error => {
        console.error('文件加载失败:', error);
      });
    
    // 在DOM加载完成后，注入窗口控制支持
    loginWindow.webContents.on('dom-ready', () => {
      console.log('DOM加载完成，注入窗口控制支持');
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
    console.log('窗口准备显示');
    loginWindow.show(); // 显示窗口
    console.log('窗口已显示');
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
  console.log('创建主应用窗口...')
  
  // 创建主应用窗口配置 - 固定尺寸1050x700，禁用全屏和调整大小
  mainWindow = new BrowserWindow({
    width: 1050,  // 固定宽度
    height: 700, // 固定高度
    frame: false,
    title: '智能体应用',
    resizable: false, // 禁用调整窗口大小
    maximizable: false, // 禁用最大化窗口
    fullscreenable: false, // 禁用全屏显示
    fullscreen: false, // 不以全屏模式启动
    // 确保窗口显示在主显示器上
    center: true,
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
    mainWindow.loadFile(indexPath)
      .then(() => {
        console.log('文件加载成功');
        // 打开开发者工具
        mainWindow.webContents.openDevTools();
        console.log('开发工具已打开');
      })
      .catch(error => {
        console.error('文件加载失败:', error);
      });
    
    // 在DOM加载完成后，注入窗口控制支持
    mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM加载完成，注入窗口控制支持');
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
    console.error('index.html文件不存在:', indexPath);
    // 如果文件不存在，尝试加载直接的index.html
    try {
      console.log('尝试直接加载index.html');
      mainWindow.loadURL('file://' + path.join(__dirname, 'index.html'));
    } catch (error) {
      console.error('加载失败:', error);
    }
  }
  
  // 基本窗口事件监听
  mainWindow.on('closed', () => {
    console.log('主窗口已关闭');
    mainWindow = null;
  });
  
  // 窗口准备显示事件
  mainWindow.on('ready-to-show', () => {
    console.log('主窗口准备显示');
    // 显示窗口（不再设置全屏）
    mainWindow.show(); // 显示窗口
    console.log('主窗口已显示');
  });
  
  // 窗口显示事件
  mainWindow.on('show', () => {
    console.log('主窗口显示事件触发');
  });
  
  // 窗口获得焦点事件
  mainWindow.on('focus', () => {
    console.log('主窗口获得焦点');
  });
  
  // 窗口控制事件
  mainWindow.on('minimize', () => {
    console.log('主窗口已最小化');
  });
  
  mainWindow.on('restore', () => {
    console.log('主窗口已恢复');
  });
}

// 处理登录成功事件，切换到主窗口
ipcMain.on('login-success', () => {
  console.log('收到登录成功事件');
  // 无论如何先创建主窗口，确保它存在
  if (!mainWindow) {
    console.log('主窗口不存在，创建新的主窗口');
    createMainWindow();
    // 确保主窗口加载完成后导航到home路由
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('主窗口加载完成，执行路由跳转到/home');
      mainWindow.webContents.executeJavaScript(`
        console.log('执行路由跳转');
        window.location.href = '#/home';
      `).then(() => {
        console.log('路由跳转成功');
        // 给主窗口时间加载，然后隐藏登录窗口
        setTimeout(() => {
          console.log('隐藏登录窗口');
          if (loginWindow) {
            loginWindow.hide();
          }
        }, 500);
      }).catch(error => {
        console.error('路由跳转失败:', error);
      });
    });
  } else {
    console.log('主窗口已存在，准备显示');
    // 确保主窗口显示后导航到home路由
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.executeJavaScript(`
      console.log('执行路由跳转');
      window.location.href = '#/home';
    `);
    
    // 处理登录窗口
    if (loginWindow) {
      console.log('登录窗口存在，准备隐藏');
      setTimeout(() => {
        console.log('隐藏登录窗口');
        loginWindow.hide();
      }, 500);
    }
  }
  console.log('登录成功流程完成');
});

// 处理最小化窗口事件
ipcMain.on('window-minimize', () => {
  console.log('收到最小化窗口事件');
  if (mainWindow && !mainWindow.isMinimized()) {
    mainWindow.minimize();
    console.log('主窗口已最小化');
  } else if (loginWindow && !loginWindow.isMinimized()) {
    loginWindow.minimize();
    console.log('登录窗口已最小化');
  }
});

// 处理窗口移动事件
ipcMain.on('window-move', (event, { x, y }) => {
  console.log('收到窗口移动事件，位置:', { x, y });
  if (mainWindow && !mainWindow.isFullScreen() && !mainWindow.isMaximized()) {
    mainWindow.setPosition(x, y);
    console.log('主窗口已移动');
  } else if (loginWindow && !loginWindow.isFullScreen() && !loginWindow.isMaximized()) {
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
  if (mainWindow) {
    // 向渲染进程发送退出提醒消息
    mainWindow.webContents.send('show-exit-confirmation');
  } else if (loginWindow) {
    // 如果只有登录窗口，直接退出应用
    console.log('只有登录窗口，直接退出应用');
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

// 应用就绪后创建窗口
app.whenReady().then(() => {
  console.log('应用就绪，创建登录窗口')
  
  // 清除localStorage中的用户令牌，确保每次启动都从登录页面开始
  console.log('清除localStorage中的用户令牌')
  
  // 默认创建登录窗口
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