@echo off
chcp 65001 >nul
echo ========================================
echo 更新 Screenshot MCP 服务器
echo ========================================
echo.

echo [1/4] 运行测试...
call npm test
if errorlevel 1 (
    echo.
    echo ❌ 测试失败！请检查代码。
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] 构建项目...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 构建失败！请检查错误信息。
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] 验证构建...
if exist dist\index.js (
    echo ✅ 构建成功！
) else (
    echo ❌ 构建失败：找不到 dist\index.js
    pause
    exit /b 1
)

echo.
echo [4/4] 显示工具列表...
call npm run test:tools

echo.
echo ========================================
echo ✅ 更新完成！
echo ========================================
echo.
echo 📋 下一步操作：
echo.
echo 1. 重启 Kiro
echo    - 完全关闭 Kiro（不是最小化）
echo    - 重新打开 Kiro
echo.
echo 2. 打开测试项目
echo    - 打开 temp\pyscreeeshot-test 项目
echo.
echo 3. 测试新功能
echo    - 在 Kiro 中输入："请列出所有工具"
echo    - 应该看到 4 个工具（包括 save_screenshot）
echo.
echo 4. 测试保存功能
echo    - 输入："请截取屏幕左上角 300x300 的区域，并保存到 C:\temp\test.png"
echo.
echo ========================================
echo.
pause
