# 智能体应用 (AI Agent Desktop Application)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Electron](https://img.shields.io/badge/Electron-29.4.6-47848F.svg)
![Vue](https://img.shields.io/badge/Vue-2.7.16-4FC08D.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

一个基于 Electron + Vue2 的桌面端智能体应用，专注于直播管理和 AI 内容审核

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [构建说明](#-构建说明) • [使用文档](#-使用文档)

</div>

---

## ✨ 功能特性

- 🔐 **完整的用户系统** - 支持账号登录、注册、短信验证
- 📺 **直播管理** - 直播列表查看、主播添加、实时监控
- 🤖 **AI 智能复盘** - 自动分析直播内容，智能识别违规
- 🎨 **精美暗黑主题** - 专业的 UI 设计，护眼舒适
- 🪟 **无边框窗口** - 自定义标题栏，原生体验
- ⚡ **快速响应** - 基于 Vite 构建，开发体验极佳

## 🚀 快速开始

### 运行已打包的应用

```bash
# 直接运行 exe 文件
build/AI-Agent-win32-x64/AI-Agent.exe

# 或使用启动脚本
启动应用.bat
```

### 开发模式

```bash
# 1. 安装依赖
npm install

# 2. 启动前端开发服务器
npm run dev

# 3. 启动 Electron（新终端窗口）
npm run electron:dev
```

## 📦 构建说明

### 前端构建

```bash
npm run build
```

### 打包桌面应用

```bash
# 使用自定义脚本（推荐）
.\build-app.ps1

# 或使用 npm 命令
npm run package
```

构建产物位于 `build/AI-Agent-win32-x64/` 目录。

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: Vue 2.7.16
- **UI 组件库**: Element UI 2.15.13
- **路由管理**: Vue Router 3.6.5
- **状态管理**: Vuex 3.6.2
- **HTTP 客户端**: Axios 1.12.2
- **构建工具**: Vite 5.2.11
- **桌面框架**: Electron 29.4.6

### 项目结构

```
智能体/
├── src/
│   ├── views/          # 页面组件
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Home.vue
│   │   ├── LiveList.vue
│   │   ├── AddStreamer.vue
│   │   └── AiReview.vue
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── App.vue         # 根组件
│   └── main.js         # Vue 入口
├── build/              # 打包输出
│   └── AI-Agent-win32-x64/
├── dist/               # 前端构建产物
├── main.js             # Electron 主进程
├── preload.js          # 预加载脚本
├── build-app.ps1       # 打包脚本
└── package.json        # 项目配置
```

## 📚 使用文档

- [构建报告](./BUILD_REPORT.md) - 详细的构建和优化说明
- [使用指南](./USER_GUIDE.md) - 完整的功能使用说明
- [开发文档](./app.md) - 开发者参考文档

## 🎯 系统要求

- **操作系统**: Windows 10/11
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **内存**: >= 4GB RAM
- **磁盘**: >= 500MB 可用空间

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建前端
npm run build

# 启动 Electron 开发模式
npm run electron:dev

# 打包应用
.\build-app.ps1
```

## 📝 更新日志

### v1.0.0 (2025-10-23)

- ✨ 首次发布
- ✨ 实现用户登录注册系统
- ✨ 实现直播管理功能
- ✨ 实现 AI 复盘功能
- ✨ 支持无边框自定义窗口
- ✨ 暗黑主题 UI
- 🐛 修复 preload 脚本冲突
- 🐛 优化主进程日志系统
- 🔨 添加自定义打包脚本

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

智能体应用开发团队

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [Vue.js](https://vuejs.org/)
- [Element UI](https://element.eleme.io/)
- [Vite](https://vitejs.dev/)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

</div>