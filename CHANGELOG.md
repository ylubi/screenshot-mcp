# 更新日志

## [未发布]

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

### 技术栈
- TypeScript 5.3+
- Node.js 18+
- Vitest 测试框架
- fast-check 属性测试库
- @modelcontextprotocol/sdk

### 验证
- ✅ 所有类型定义测试通过（13/13）
- ✅ TypeScript 编译成功
- ✅ 项目结构符合设计规范
