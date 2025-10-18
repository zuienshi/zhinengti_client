@echo off

REM 切换到应用目录
cd /d %~dp0

REM 启动应用前的提示
echo =========================================
echo     智能体应用启动脚本
echo =========================================
echo 正在启动应用程序...
echo 请稍候...
echo.
echo 说明：
echo 1. 应用会自动显示登录窗口
echo 2. 如果需要关闭应用，请点击窗口右上角的关闭按钮
echo 3. 如有问题，请检查应用是否已成功构建
echo.

REM 检查是否存在electron.exe
if not exist "node_modules\electron\dist\electron.exe" (
    echo 错误：未找到electron.exe，请先运行 npm install
    pause
    exit /b 1
)

REM 检查是否存在dist目录
if not exist "dist" (
    echo 警告：未找到dist目录，正在尝试构建...
    npm run build
    if %errorlevel% neq 0 (
        echo 构建失败，请检查项目配置
        pause
        exit /b 1
    )
)

REM 直接运行electron.exe
node_modules\electron\dist\electron.exe .

REM 检查退出码
if %errorlevel% neq 0 (
    echo 应用启动失败，错误码：%errorlevel%
    pause
    exit /b %errorlevel%
)

REM 防止窗口自动关闭
pause