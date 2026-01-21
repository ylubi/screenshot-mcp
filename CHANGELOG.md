# 更新日志

## [1.1.0] - 2026-01-19

### 新增
- ⭐ **长截图功能**：新增 `capture_long_screenshot` 工具
  - 自动滚动窗口并拼接多张截图
  - 支持自定义滚动延迟、滚动量和重叠像素
  - 自动检测是否到达底部
  - 支持 Windows 和 macOS 平台
- 更新 API 文档，添加长截图使用说明
- 更新用户指南，添加长截图示例和性能建议

### 改进
- 优化工具描述，更清晰地说明三种窗口查找方式
- 更新 package.json 描述，包含长截图功能

### 技术细节
- 实现 Windows 平台滚动（使用 PowerShell 和 SendMessage API）
- 实现 macOS 平台滚动（使用 AppleScript）
- 实现图像拼接算法，支持可配置的重叠区域
- 实现图像哈希比较，用于检测滚动是否到达底部

### 测试
- ✅ 所有现有测试通过（122/122）
- ✅ TypeScript 编译成功
- ✅ 工具注册成功（6 个工具）

## [1.0.0] - 2026-01-19

### 新增
- 初始化项目结构
- 创建 TypeScript 配置（tsconfig.json）
- 创建 package.json 和依赖管理
- 设置 Vitest 测试框架
- 定义核心 MCP 协议类型（JSONRPCRequest, JSONRPCResponse, Tool, ToolDefinition）
- 定义截图相关类型（WindowScreenshotParams, RegionScreenshotParams, ScreenshotResult, WindowInfo）
- 定义错误类型和错误码（ErrorCode, ScreenshotError, ValidationError, PlatformError）
- 定义平台抽象接口（PlatformScreenshot）
- 创建类型验证测试套件
- 创建项目文档（README.md）
- 实现三种窗口查找方式（句柄、标题、进程名）
- 实现 `capture_window` 工具
- 实现 `capture_region` 工具
- 实现 `list_windows` 工具
- 实现 `save_screenshot` 工具
- 实现 `capture_and_save` 工具
- 实现 Windows 平台支持
- 实现 macOS 平台支持
- 实现 MCP 服务器和 JSON-RPC 2.0 协议

### 技术栈
- TypeScript 5.3+
- Node.js 18+
- Vitest 测试框架
- fast-check 属性测试库
- @modelcontextprotocol/sdk
- node-screenshots 跨平台截图库
- pngjs PNG 图像处理

### 验证
- ✅ 所有类型定义测试通过（13/13）
- ✅ TypeScript 编译成功
- ✅ 项目结构符合设计规范
- ✅ 所有单元测试通过（122/122）
