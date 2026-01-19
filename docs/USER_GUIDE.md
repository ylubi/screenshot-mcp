# Screenshot MCP 用户指南

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

## 核心功能

### 5 个工具

1. **list_windows** - 列出所有窗口
2. **capture_window** - 截取窗口（支持 3 种查找方式）
3. **capture_region** - 截取屏幕区域
4. **save_screenshot** - 保存截图到文件
5. **capture_and_save** - 一步完成截图和保存（推荐）

### 三种窗口查找方式

| 方式 | 参数 | 示例 | 特点 |
|------|------|------|------|
| 窗口句柄 | `windowHandle` | `"12345"` | 精确匹配 |
| 窗口标题 | `windowTitle` | `"简单的UI窗口"` | 部分匹配，区分大小写 |
| 进程名 | `processName` | `"python.exe"` | 部分匹配，不区分大小写 ⭐ |

## 使用示例

### 示例 1：使用进程名截图并保存

```
用户：请截取 Python 窗口并保存到 C:\screenshots\python.png
```

AI 会调用：
```json
{
  "name": "capture_and_save",
  "arguments": {
    "mode": "window",
    "processName": "python.exe",
    "filePath": "C:\\screenshots\\python.png"
  }
}
```

### 示例 2：截取屏幕区域并保存

```
用户：请截取屏幕左上角 400x300 的区域并保存
```

AI 会调用：
```json
{
  "name": "capture_and_save",
  "arguments": {
    "mode": "region",
    "x": 0,
    "y": 0,
    "width": 400,
    "height": 300,
    "filePath": "C:\\screenshots\\region.png"
  }
}
```

### 示例 3：使用窗口标题截图

```
用户：请截取"简单的UI窗口"
```

AI 会调用：
```json
{
  "name": "capture_window",
  "arguments": {
    "windowTitle": "简单的UI窗口"
  }
}
```

## 常见应用程序进程名

| 应用程序 | 进程名 | 推荐搜索词 |
|---------|--------|-----------|
| Python | python.exe | `"python"` |
| Chrome | chrome.exe | `"chrome"` |
| Firefox | firefox.exe | `"firefox"` |
| Edge | msedge.exe | `"edge"` |
| 记事本 | notepad.exe | `"notepad"` |
| VS Code | Code.exe | `"code"` |
| Excel | EXCEL.EXE | `"excel"` |

## 性能建议

| 尺寸 | 数据量 | 响应时间 | 推荐用途 |
|------|--------|----------|----------|
| 100x100 | 52KB | < 1秒 | 快速预览 |
| 200x200 | 208KB | < 1秒 | 一般使用 |
| 400x300 | 625KB | 1-2秒 | 详细查看 |
| 800x600 | 2.5MB | 3-5秒 | 大图（谨慎） |

**建议：**
- 快速预览：100x100 到 200x200
- 一般使用：200x200 到 400x300
- 详细查看：400x300 到 800x600
- 避免使用：超过 1000x1000

## 故障排除

### 问题 1：找不到窗口

**错误信息：**
```
No window found with process name containing: xxx
```

**解决方案：**
1. 确保窗口没有被最小化
2. 使用 `list_windows` 查看所有可用窗口
3. 检查进程名或窗口标题是否正确

### 问题 2：截图超时

**原因：** 图像尺寸太大

**解决方案：**
1. 使用更小的尺寸（200x200 到 400x300）
2. 避免截取整个屏幕
3. 使用 `capture_and_save` 直接保存，避免传输大量 base64 数据

### 问题 3：文件已存在

**错误信息：**
```
File already exists: xxx. Set overwrite=true to replace it
```

**解决方案：**
添加 `overwrite: true` 参数

## 更新

### 重新构建

```bash
npm run build
```

### 重启 Kiro

完全关闭并重新打开 Kiro

## 技术支持

- 项目地址：C:\work\tools\screenshot-mcp
- 配置文件：.kiro/settings/mcp.json
- 构建输出：dist/index.js
