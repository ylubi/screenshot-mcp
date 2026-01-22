# Screenshot MCP Server

一个为 AI 助手提供截图功能的 MCP（Model Context Protocol）服务器。让你的 AI 助手能够看到屏幕内容。

## 功能特性

- 🖼️ **窗口截图**: 按窗口标题或进程名截取指定窗口
- 📐 **区域截图**: 截取屏幕指定区域
- 📜 **长截图**: 自动滚动并拼接，捕获完整网页或长文档
- 📋 **窗口列表**: 查看所有可用窗口
- 💾 **直接保存**: 截图直接保存为 PNG 文件
- 🌐 **跨平台**: 支持 Windows、macOS 和 Linux

## 平台支持状态

| 平台 | 基础截图 | 长截图 | 测试状态 |
|------|---------|--------|---------|
| Windows | ✅ 完全支持 | ✅ 完全支持 | ✅ 已充分测试 |
| macOS | ⚠️ 理论支持 | ⚠️ 理论支持 | ⚠️ 未经测试 |
| Linux | ⚠️ 理论支持 | ⚠️ 理论支持 | ⚠️ 未经测试 |

**注意**: 
- 本项目在 **Windows** 平台上开发和测试，功能完整可靠
- **macOS** 和 **Linux** 平台的代码已实现，但未经过实际测试
- 如果你在 macOS 或 Linux 上使用遇到问题，欢迎提交 Issue 或 Pull Request

## 快速开始

### 在 Claude Desktop 中使用

编辑 Claude Desktop 配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

添加配置：

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@ylubi/screenshot-mcp"]
    }
  }
}
```

保存后重启 Claude Desktop，即可使用截图功能。

### 在 Cline (VS Code) 中使用

在 VS Code 设置中搜索 "Cline: MCP Settings"，或编辑 `settings.json`：

```json
{
  "cline.mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@ylubi/screenshot-mcp"]
    }
  }
}
```

### 在其他 MCP 客户端中使用

参考客户端文档，使用以下配置：

```json
{
  "command": "npx",
  "args": ["-y", "@ylubi/screenshot-mcp"]
}
```

## 使用方法

配置完成后，在 AI 对话中直接使用自然语言：

```
请截取 Chrome 浏览器窗口
请截取屏幕左上角 400x300 的区域
请列出所有打开的窗口
请对记事本窗口进行长截图
```

AI 会自动调用相应的截图工具。

## 系统要求

- **Node.js** >= 18.0.0（[下载安装](https://nodejs.org/)）
- **操作系统**: 
  - Windows 10+ ✅ 已测试
  - macOS 10.14+ ⚠️ 未测试
  - Linux（X11/Wayland）⚠️ 未测试

首次使用时，`npx` 会自动下载并安装服务器，无需手动安装。

**重要提示**: 本项目主要在 Windows 平台上开发和测试。macOS 和 Linux 平台虽然已实现相关代码，但尚未经过充分测试。如果你在这些平台上使用，可能会遇到问题，欢迎反馈。

## 可用功能

### 窗口截图
按窗口标题或进程名截取指定窗口。

**示例：**
```
请截取 Chrome 浏览器窗口
请截取 notepad.exe 进程的窗口
```

### 区域截图
截取屏幕指定区域。

**示例：**
```
请截取屏幕左上角 400x300 的区域
请截取坐标 (100, 100) 开始，大小 500x400 的区域
```

### 长截图
自动滚动窗口并拼接多张截图，适用于网页、文档等长内容。

**示例：**
```
请对 Chrome 窗口进行长截图
请对简书网页进行长截图，保存为 article.png
```

**特点：**
- 自动滚动和拼接
- 智能检测页面底部
- 支持自定义滚动参数
- 直接保存为文件

详细说明请查看 [长截图指南](docs/LONG_SCREENSHOT.md)

### 窗口列表
列出所有可用窗口及其信息。

**示例：**
```
请列出所有打开的窗口
```

## 文档

- **[用户指南](docs/USER_GUIDE.md)** - 完整的使用说明
- **[长截图指南](docs/LONG_SCREENSHOT.md)** - 长截图功能详解
- **[API 文档](docs/API.md)** - 开发者 API 参考
- **[更新日志](CHANGELOG.md)** - 版本历史

## 常见问题

### 截图失败怎么办？

1. 确认窗口可见且未最小化
2. 尝试使用进程名而不是窗口标题
3. 检查是否有权限限制

### 长截图效果不好？

1. 确保页面滚动到顶部
2. 增加滚动延迟参数（1000-1500ms）
3. 查看 [长截图指南](docs/LONG_SCREENSHOT.md) 的故障排除部分

### 支持哪些应用？

- ✅ 浏览器（Chrome、Edge、Firefox）- Windows 已测试
- ✅ 文本编辑器（记事本、VS Code）- Windows 已测试
- ✅ 办公软件（Word、Excel）- Windows 已测试
- ✅ 大多数标准 Windows 应用
- ⚠️ macOS 和 Linux 应用未经测试
- ⚠️ 某些自定义 GUI 框架可能不支持长截图

### macOS/Linux 用户注意

本项目目前仅在 Windows 平台上经过充分测试。如果你在 macOS 或 Linux 上使用：

1. 基础截图功能应该可以工作（使用 node-screenshots 库）
2. 长截图功能可能需要调整（滚动模拟方式不同）
3. 遇到问题请在 GitHub 提交 Issue，附上详细的错误信息
4. 欢迎提交 Pull Request 改进跨平台支持

## 技术信息

### 技术栈
- TypeScript/JavaScript
- MCP (Model Context Protocol)
- node-screenshots（跨平台截图库）

### 性能参考

| 截图尺寸 | 响应时间 | 数据量 |
|---------|---------|--------|
| 200x200 | < 1秒 | ~200KB |
| 400x300 | 1-2秒 | ~600KB |
| 800x600 | 3-5秒 | ~2.5MB |

**建议**：普通截图使用 200-400 像素宽度，长截图会自动处理大小。

## 开发

### 从源码运行

```bash
git clone <repository-url>
cd screenshot-mcp
npm install
npm run build
```

### 开发命令

```bash
npm run dev          # 开发模式（监听文件变化）
npm test             # 运行测试
npm run test:all     # 运行所有测试
```

### 本地测试配置

如果从源码运行，使用以下配置：

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "node",
      "args": ["/absolute/path/to/screenshot-mcp/dist/index.js"]
    }
  }
}
```

## 许可证

MIT

## 交流反馈

如果你在使用过程中遇到问题、有任何建议或者新需求，欢迎通过以下方式联系：

- 📧 **邮箱**: yhuiche@gmail.com
- � **QQ 群**: [点击加入](https://qm.qq.com/q/hKOkL4z9dK)（群号：661990120）
- �🐛 **问题反馈**: [GitHub Issues](https://github.com/ylubi/screenshot-mcp/issues)
- ⭐ **项目地址**: [github.com/ylubi/screenshot-mcp](https://github.com/ylubi/screenshot-mcp)

欢迎 Star ⭐ 和贡献代码！
