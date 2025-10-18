@echo off

echo ====================================================
echo 智能体应用启动脚本
 echo 优化配置已应用 - 修复了资源加载和窗口关闭问题
 echo ====================================================

:: 设置工作目录为脚本所在目录
cd /d "%~dp0"

:: 检查必要的目录和文件
if not exist "dist\index.html" (
    echo 错误: 构建文件不存在，请先运行 npm run build
    pause
    exit /b 1
)

if not exist "node_modules\electron\dist\electron.exe" (
    echo 错误: Electron未安装，请先运行 npm install
    pause
    exit /b 1
)

echo 正在启动应用程序...
echo 请等待应用加载完成...

:: 运行应用程序
"node_modules\electron\dist\electron.exe" .

echo 应用程序已退出
pause