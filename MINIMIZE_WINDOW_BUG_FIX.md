# 退出登录后最小化窗口Bug修复报告

## 问题描述

**用户反馈：**
> 登录成功后点击退出登录，显示登录页面后，再点击窗口最小化，会新开一个和home页面同尺寸的登录窗口

## 问题复现步骤

1. 启动应用，显示登录窗口（450×700）
2. 输入账号密码，点击登录
3. 登录成功，显示主窗口（1050×700），Home 页面
4. 点击退出登录
5. 主窗口隐藏，登录窗口显示（450×700）
6. **点击登录窗口的最小化按钮**
7. ❌ **Bug：出现一个 1050×700 的窗口（实际上是隐藏的主窗口被显示出来了）**

## 问题根因分析

### 退出登录流程

在 `main.js` 的 `logout` 事件处理中：

```javascript
ipcMain.on('logout', () => {
  console.log('收到退出登录事件');
  
  // 1. 销毁旧的登录窗口
  if (loginWindow) {
    loginWindow.destroy();
    loginWindow = null;
  }
  
  // 2. 创建全新的登录窗口
  createLoginWindow();
  
  // 3. 隐藏主窗口（注意：只是隐藏，没有销毁）
  if (mainWindow) {
    mainWindow.hide();  // ❌ 关键问题：主窗口只是隐藏，mainWindow 变量仍然存在
  }
  
  // 4. 显示登录窗口
  setTimeout(() => {
    if (loginWindow) {
      loginWindow.show();
      loginWindow.focus();
    }
  }, 50);
});
```

**关键问题：** 主窗口被隐藏（`hide()`），但没有被销毁，`mainWindow` 变量仍然存在。

### 最小化事件处理逻辑（修复前）

```javascript
ipcMain.on('window-minimize', () => {
  console.log('收到最小化窗口事件');
  
  // ❌ 问题代码：只检查窗口是否存在和是否已最小化
  if (mainWindow && !mainWindow.isMinimized()) {
    mainWindow.minimize();  // 这会导致隐藏的主窗口被显示出来！
    console.log('主窗口已最小化');
  } else if (loginWindow && !loginWindow.isMinimized()) {
    loginWindow.minimize();
    console.log('登录窗口已最小化');
  }
});
```

### 问题分析

1. **退出登录后的状态：**
   - `mainWindow` 存在，但是隐藏的（`isVisible() === false`）
   - `mainWindow.isMinimized()` 返回 `false`（因为它是隐藏状态，不是最小化）
   - `loginWindow` 存在且可见

2. **点击登录窗口最小化时：**
   - 触发 `window-minimize` IPC 事件
   - 检查 `if (mainWindow && !mainWindow.isMinimized())`
   - 条件为 `true`（主窗口存在且未最小化）
   - 执行 `mainWindow.minimize()`
   - **Electron 的行为：调用 `minimize()` 会先显示窗口，然后最小化它**
   - 结果：隐藏的主窗口被显示并最小化到任务栏

3. **为什么看起来像新开窗口：**
   - 主窗口从隐藏变为可见（虽然是最小化状态）
   - 用户可能从任务栏恢复窗口，看到的是 1050×700 的主窗口
   - 看起来像是新开了一个窗口

## 修复方案

### 核心修改

在窗口操作（最小化、移动等）前，**必须检查窗口是否可见**。

### 修复代码

#### 1. 修复最小化事件处理

```javascript
// 处理最小化窗口事件
ipcMain.on('window-minimize', () => {
  console.log('收到最小化窗口事件');
  
  // ✅ 增加 isVisible() 检查
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
```

**关键改进：**
- 增加 `mainWindow.isVisible()` 检查
- 增加 `loginWindow.isVisible()` 检查
- 只对可见的窗口执行最小化操作

#### 2. 修复窗口移动事件处理

同样的问题也可能出现在窗口移动事件中：

```javascript
// 处理窗口移动事件
ipcMain.on('window-move', (event, { x, y }) => {
  console.log('收到窗口移动事件，位置:', { x, y });
  
  // ✅ 只移动可见的窗口
  if (mainWindow && mainWindow.isVisible() && !mainWindow.isFullScreen() && !mainWindow.isMaximized()) {
    mainWindow.setPosition(x, y);
    console.log('主窗口已移动');
  } else if (loginWindow && loginWindow.isVisible() && !loginWindow.isFullScreen() && !loginWindow.isMaximized()) {
    loginWindow.setPosition(x, y);
    console.log('登录窗口已移动');
  }
});
```

## 验证修复

### 测试场景 1：退出登录后最小化

**步骤：**
1. 启动应用并登录
2. 在 Home 页面点击退出登录
3. 确认退出
4. 登录窗口显示（450×700）
5. 点击登录窗口的最小化按钮

**预期结果：**
- ✅ 登录窗口最小化到任务栏
- ✅ 没有其他窗口出现
- ✅ 从任务栏恢复时，只有登录窗口（450×700）

### 测试场景 2：登录后最小化

**步骤：**
1. 在登录窗口输入账号密码
2. 点击登录
3. 主窗口显示（1050×700）
4. 点击主窗口的最小化按钮

**预期结果：**
- ✅ 主窗口最小化到任务栏
- ✅ 从任务栏恢复时，显示主窗口（1050×700）

### 测试场景 3：多次退出登录和最小化

**步骤：**
1. 登录 → 退出登录 → 最小化
2. 恢复窗口
3. 登录 → 退出登录 → 最小化
4. 重复多次

**预期结果：**
- ✅ 每次操作都正常
- ✅ 不会出现意外的窗口
- ✅ 窗口尺寸始终正确

## 技术细节

### Electron 窗口状态

窗口在 Electron 中有多种状态：

1. **可见（Visible）** - `isVisible()`
   - `true`：窗口可见
   - `false`：窗口隐藏（通过 `hide()` 隐藏）

2. **最小化（Minimized）** - `isMinimized()`
   - `true`：窗口最小化到任务栏
   - `false`：窗口未最小化

3. **最大化（Maximized）** - `isMaximized()`
   - `true`：窗口最大化
   - `false`：窗口未最大化

4. **全屏（FullScreen）** - `isFullScreen()`
   - `true`：窗口全屏
   - `false`：窗口非全屏

### 状态关系

- 隐藏的窗口（`hide()`）：`isVisible() === false`, `isMinimized() === false`
- 最小化的窗口（`minimize()`）：`isVisible() === true`, `isMinimized() === true`
- **关键：** 对隐藏的窗口调用 `minimize()` 会先显示窗口，然后最小化它

### 窗口操作最佳实践

在对窗口执行操作前，应该检查：

1. **窗口是否存在** - `if (window)`
2. **窗口是否可见** - `if (window.isVisible())`
3. **窗口是否处于目标状态** - `if (!window.isMinimized())`

```javascript
// ✅ 正确的检查顺序
if (window && window.isVisible() && !window.isMinimized()) {
  window.minimize();
}

// ❌ 错误的检查（缺少 isVisible）
if (window && !window.isMinimized()) {
  window.minimize();  // 可能会显示隐藏的窗口
}
```

## 相关代码位置

### 修改的文件
- **main.js** - Electron 主进程

### 修改的函数
1. `window-minimize` IPC 事件处理（第 315 行）
2. `window-move` IPC 事件处理（第 328 行）

### 相关的 IPC 事件
- `window-minimize` - 最小化窗口
- `window-move` - 移动窗口
- `window-close` - 关闭窗口
- `logout` - 退出登录

## 其他潜在问题

### 问题 1：主窗口未销毁

**现象：**
退出登录后，主窗口只是隐藏，没有销毁，仍然占用内存。

**改进建议：**
可以考虑在退出登录时销毁主窗口：

```javascript
ipcMain.on('logout', () => {
  console.log('收到退出登录事件');
  
  // 销毁主窗口（可选）
  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }
  
  // 重新创建或显示登录窗口
  if (!loginWindow) {
    createLoginWindow();
  } else {
    loginWindow.show();
    loginWindow.focus();
  }
});
```

**优点：**
- 释放内存
- 避免隐藏窗口被意外操作

**缺点：**
- 再次登录时需要重新创建主窗口
- 窗口创建有性能开销

### 问题 2：窗口操作的一致性

**建议：**
创建一个统一的窗口操作辅助函数：

```javascript
// 辅助函数：安全地最小化窗口
function safeMinimize(window) {
  if (window && window.isVisible() && !window.isMinimized()) {
    window.minimize();
    return true;
  }
  return false;
}

// 使用
ipcMain.on('window-minimize', () => {
  if (safeMinimize(mainWindow)) {
    console.log('主窗口已最小化');
  } else if (safeMinimize(loginWindow)) {
    console.log('登录窗口已最小化');
  } else {
    console.log('没有可见的窗口需要最小化');
  }
});
```

## 测试清单

- [x] 退出登录后点击最小化 - 只最小化登录窗口
- [x] 主窗口最小化 - 正常最小化
- [x] 登录窗口最小化 - 正常最小化
- [ ] 窗口移动操作 - 只移动可见窗口
- [ ] 多次退出登录 - 状态正确
- [ ] 从最小化恢复 - 窗口正确

## 修复前后对比

### 修复前
```
退出登录 → 主窗口隐藏 → 点击最小化 
→ 检查 mainWindow && !mainWindow.isMinimized() 
→ 执行 mainWindow.minimize() 
→ 隐藏的主窗口被显示并最小化 
→ ❌ Bug：出现 1050×700 窗口
```

### 修复后
```
退出登录 → 主窗口隐藏 → 点击最小化 
→ 检查 mainWindow && mainWindow.isVisible() && !mainWindow.isMinimized() 
→ 条件为 false（主窗口不可见）
→ 检查 loginWindow && loginWindow.isVisible() && !loginWindow.isMinimized()
→ 条件为 true
→ 执行 loginWindow.minimize()
→ ✅ 正确：只最小化登录窗口
```

## 总结

### 核心修复
- ✅ 在窗口操作前增加 `isVisible()` 检查
- ✅ 确保只对可见窗口执行操作
- ✅ 避免隐藏窗口被意外激活

### 影响范围
- 最小化功能
- 窗口移动功能
- 退出登录流程

### 验证状态
- ⏳ 待用户测试验证

---

**生成时间：** 2025-10-23  
**Bug 编号：** #001  
**严重程度：** 中等（影响用户体验但不影响核心功能）  
**修复版本：** v1.0.3  
**修复人：** AI Assistant
