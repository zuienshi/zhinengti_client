@echo off
chcp 65001 > nul
echo ========================================
echo    智能体应用启动器
echo ========================================
echo.
echo 正在启动应用...
echo.

start "" "build\AI-Agent-win32-x64\AI-Agent.exe"

echo 应用已启动！
echo.
timeout /t 2 > nul
