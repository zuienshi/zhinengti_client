const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// 确保应用不会自动退出
app.on('window-all-closed', (e) => {
  e.preventDefault();
  console.log('阻止应用退出');
});

function createTestWindow() {
  console.log('创建测试窗口...');
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });
  
  // 直接打开开发工具
  win.webContents.openDevTools();
  
  // 测试加载简单的HTML文件
  const testHtmlPath = path.join(__dirname, 'dist', 'index.html');
  console.log('尝试加载:', testHtmlPath);
  
  if (fs.existsSync(testHtmlPath)) {
    console.log('文件存在，大小:', fs.statSync(testHtmlPath).size, 'bytes');
    
    // 读取文件内容以验证
    const content = fs.readFileSync(testHtmlPath, 'utf8');
    console.log('文件内容前50个字符:', content.substring(0, 50), '...');
    
    // 尝试加载文件
    win.loadFile(testHtmlPath)
      .then(() => {
        console.log('✓ 文件加载成功');
        
        // 等待一下再执行检查
        setTimeout(() => {
          win.webContents.executeJavaScript(`
            console.log('✓ 渲染进程运行正常');
            console.log('文档标题:', document.title);
            console.log('资源列表:', performance.getEntriesByType('resource').map(r => r.name));
          `).catch(err => console.error('执行JavaScript失败:', err));
        }, 2000);
      })
      .catch(error => {
        console.error('✗ 文件加载失败:', error);
      });
  } else {
    console.error('✗ 文件不存在');
    // 加载一个简单的HTML字符串
    win.loadURL('data:text/html,<h1>测试页面</h1><p>如果看到这个，说明Electron基本功能正常</p>');
  }
  
  // 详细的事件监听
  win.on('ready-to-show', () => {
    console.log('✓ 窗口准备显示');
    win.show();
  });
  
  win.webContents.on('did-start-loading', () => console.log('⟳ 开始加载'));
  win.webContents.on('dom-ready', () => console.log('✓ DOM就绪'));
  win.webContents.on('did-finish-load', () => console.log('✓ 加载完成'));
  win.webContents.on('did-fail-load', (e, code, desc, url) => 
    console.error('✗ 加载失败:', { code, desc, url })
  );
  win.webContents.on('console-message', (e, level, msg) => 
    console.log(`[渲染] ${msg}`)
  );
  
  win.on('closed', () => console.log('✗ 窗口关闭'));
}

app.whenReady().then(() => {
  console.log('应用就绪');
  createTestWindow();
  
  // 在macOS上保持应用活跃
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createTestWindow();
    }
  });
});

console.log('脚本启动完成，等待应用就绪...');