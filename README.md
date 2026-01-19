# Screenshot MCP Server

一个为 AI 助手提供截图功能的 MCP（Model Context Protocol）服务器。

## 功能特性

- 🖼️ **窗口截图**: 支持三种方式查找窗口（句柄、标题、进程名）⭐
- 📐 **区域截图**: 通过坐标捕获屏幕指定区域的截图
- 📋 **窗口列表**: 列出所有可用窗口及其信息
- 💾 **保存截图**: 直接保存截图到文件
- 🔄 **一步完成**: 截图和保存一步完成
- 🌐 **跨平台支持**: 支持 Windows、macOS 和 Linux
- 🔌 **MCP 协议**: 完全符合 Model Context Protocol 规范
- 📦 **标准格式**: 返回 Base64 编码的 PNG 图像

### 三种窗口查找方式

1. **窗口句柄** - 精确匹配（传统方式）
2. **窗口标题** - 按标题搜索（推荐）⭐
3. **进程名** - 按进程名搜索（推荐，不区分大小写）⭐

## 快速开始

### 1. 安装和构建

```bash
npm install
npm run build
```

### 2. 在 Kiro 中配置

在项目的 `.kiro/settings/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "node",
      "args": ["C:\\work\\tools\\screenshot-mcp\\dist\\index.js"],
      "disabled": false
    }
  }
}
```

### 3. 测试

在 Kiro 中输入：

```
请截取 Python 窗口
请截取屏幕左上角 300x300 的区域
```

## 文档

- **[用户指南](docs/USER_GUIDE.md)** - 完整的使用说明和示例
- **[API 文档](docs/API.md)** - 详细的 API 参考
- **[更新日志](CHANGELOG.md)** - 版本历史

## 项目结构

```
screenshot-mcp/
├── src/                    # 源代码
│   ├── server/            # MCP 服务器实现
│   ├── tools/             # 截图工具实现
│   ├── platform/          # 平台抽象层
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── docs/                   # 文档
│   ├── USER_GUIDE.md      # 用户指南
│   └── API.md             # API 文档
├── dist/                   # 构建输出
└── tests/                  # 测试（空目录）
```

## 常用命令

```bash
npm install          # 安装依赖
npm run build        # 构建项目
npm test             # 运行单元测试
npm run test:integration  # 运行集成测试
npm run test:all     # 运行所有测试
npm start            # 启动 MCP 服务器
```

## 测试

项目包含完整的测试套件：

- **单元测试**：122 个测试，覆盖所有核心功能
- **集成测试**：9 个测试，验证 MCP 协议和工具功能

详见 [tests/README.md](tests/README.md)

## 技术栈

- **TypeScript/JavaScript** - 主要实现语言
- **Node.js** - 运行时环境
- **MCP (Model Context Protocol)** - AI 工具集成协议
- **JSON-RPC 2.0** - 通信协议
- **node-screenshots** - 跨平台截图库

## 许可证

MIT

## 性能数据（实测）

| 尺寸 | 数据量 | 响应时间 |
|------|--------|----------|
| 100x100 | 52KB | < 1秒 |
| 200x200 | 208KB | < 1秒 |
| 400x300 | 625KB | 1-2秒 |
| 800x600 | 2.5MB | 3-5秒 |

**推荐尺寸**: 200x200 到 400x300 像素

## 开发命令

```bash
# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev

# 运行单元测试
npm test

# 运行基于属性的测试
npm run test:pbt

# 测试 MCP 协议和工具调用
npm run test:mcp

# 测试不同尺寸的性能
npm run test:sizes

# 监听模式运行测试
npm run test:watch

# 启动 MCP 服务器
npm start
```

## 可用工具

### 1. list_windows
列出所有可用窗口及其信息。

### 2. capture_window
捕获指定窗口的截图。

### 3. capture_region
捕获屏幕指定区域的截图。

详细 API 文档请查看 [MCP_USAGE.md](MCP_USAGE.md)

## 故障排除

如果遇到问题：

1. **AI 调用工具时卡住**
   - 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - 尝试更小的截图尺寸（200x200）
   - 运行 `npm run test:sizes` 验证服务器

2. **连接错误**
   - 确认已运行 `npm run build`
   - 检查 MCP 配置路径是否正确
   - 重启 Kiro

3. **性能问题**
   - 避免截取大窗口（> 1000x1000）
   - 始终指定具体尺寸
   - 查看性能数据表选择合适尺寸

## 文档

- [快速开始指南](QUICK_START.md) - 5 分钟上手
- [完整使用指南](MCP_USAGE.md) - 详细 API 文档
- [MCP AI 接口说明](MCP_AI_INTERFACE.md) - AI 如何理解和使用工具
- [故障排除](TROUBLESHOOTING.md) - 常见问题解决
- [Kiro 测试指南](KIRO_TESTING_GUIDE.md) - 在 Kiro 中测试
- [更新日志](CHANGELOG.md) - 版本历史

## 项目结构

```
src/
├── server/          # MCP 服务器实现
│   ├── mcp-server.ts       # 主服务器类
│   └── tool-registry.ts    # 工具注册表
├── tools/           # 截图工具实现
│   ├── list-windows.ts
│   ├── capture-window.ts
│   └── capture-region.ts
├── platform/        # 平台抽象层
│   ├── interface.ts        # 平台接口
│   ├── windows.ts          # Windows 实现
│   ├── macos.ts            # macOS 实现
│   └── linux.ts            # Linux 实现
├── types/           # TypeScript 类型定义
│   ├── mcp.ts              # MCP 协议类型
│   ├── screenshot.ts       # 截图相关类型
│   └── errors.ts           # 错误类型
└── utils/           # 工具函数
    ├── image.ts            # 图像处理
    └── validation.ts       # 输入验证
```

## 技术栈

- **TypeScript**: 类型安全的开发
- **Node.js**: 运行时环境 (>= 18.0.0)
- **MCP SDK**: Model Context Protocol 实现
- **node-screenshots**: 跨平台截图库
- **Vitest**: 测试框架
- **fast-check**: 基于属性的测试

## 最佳实践

### ✅ 推荐做法

```
1. 始终指定具体尺寸
   "请截取屏幕左上角 400x300 的区域"

2. 先查询再操作
   "请列出所有窗口" → "请截取窗口 XXX"

3. 使用合适的尺寸
   200x200 到 400x300 像素
```

### ❌ 避免做法

```
1. 不要截取整个屏幕
   "请截取整个屏幕" ❌

2. 不要截取大窗口
   "请截取这个 1920x1080 的窗口" ❌

3. 不要同时截取多个窗口
   "请截取所有窗口" ❌
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
