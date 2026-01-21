# Screenshot MCP API 文档

## 工具列表（5 个工具）

### 1. list_windows

列出所有可用窗口及其信息。

**参数：**
- `includeMinimized` (boolean, 可选): 是否包含最小化的窗口（默认：false）

**返回：**
```json
{
  "windows": [
    {
      "handle": "12345",
      "title": "窗口标题",
      "processName": "process.exe",
      "bounds": { "x": 0, "y": 0, "width": 800, "height": 600 }
    }
  ]
}
```

---

### 2. capture_window

截取特定窗口的截图。**支持长截图模式**。

**参数：**
- `windowHandle` (string, 可选): 窗口句柄（如 "12345"）
- `windowTitle` (string, 可选): 窗口标题（如 "简单的UI窗口"）
- `processName` (string, 可选): 进程名（如 "python.exe"）⭐ 推荐
- `includeFrame` (boolean, 可选): 是否包含窗口边框（默认：true）
- **`longScreenshot` (boolean, 可选): 是否启用长截图模式（默认：false）⭐ 新功能**
- `scrollDelay` (number, 可选): 滚动延迟（毫秒，默认：500）
- `scrollAmount` (number, 可选): 每次滚动像素数（默认：窗口高度的 80%）
- `maxScrolls` (number, 可选): 最大滚动次数（默认：20）
- `overlapPixels` (number, 可选): 截图重叠像素数（默认：50）

**注意：** 
- `windowHandle`、`windowTitle`、`processName` 三选一
- 长截图模式会返回很大的 base64 数据，可能超时
- **推荐使用 `capture_and_save` 工具保存长截图**

**返回：**
```json
{
  "image": "base64编码的PNG图像数据",
  "mimeType": "image/png",
  "width": 800,
  "height": 600,
  "timestamp": "2026-01-19T10:30:00.000Z"
}
```

---

### 3. capture_region

截取屏幕指定区域的截图。

**参数：**
- `x` (number, 必需): 区域左上角 X 坐标（像素）
- `y` (number, 必需): 区域左上角 Y 坐标（像素）
- `width` (number, 必需): 区域宽度（像素）
- `height` (number, 必需): 区域高度（像素）
- `display` (number, 可选): 显示器编号（0 为主显示器，默认：0）

**返回：**
```json
{
  "image": "base64编码的PNG图像数据",
  "mimeType": "image/png",
  "width": 400,
  "height": 300,
  "timestamp": "2026-01-19T10:30:00.000Z"
}
```

---

### 4. save_screenshot

保存 base64 编码的截图到文件。

**参数：**
- `image` (string, 必需): Base64 编码的图像数据（来自 capture_window 或 capture_region）
- `filePath` (string, 必需): 保存路径（必须以 .png 结尾）
- `overwrite` (boolean, 可选): 是否覆盖已存在的文件（默认：false）

**返回：**
```json
{
  "filePath": "C:\\screenshots\\test.png",
  "fileSize": 213336,
  "saved": true
}
```

---

### 5. capture_and_save ⭐ 推荐

一步完成截图和保存。**支持长截图模式**。

**通用参数：**
- `mode` (string, 必需): 模式 - "region" 或 "window"
- `filePath` (string, 必需): 保存路径（必须以 .png 结尾）
- `overwrite` (boolean, 可选): 是否覆盖已存在的文件（默认：false）

**Region 模式参数：**
- `x` (number, 必需): X 坐标
- `y` (number, 必需): Y 坐标
- `width` (number, 必需): 宽度
- `height` (number, 必需): 高度
- `display` (number, 可选): 显示器编号（默认：0）

**Window 模式参数：**
- `windowHandle` (string, 可选): 窗口句柄
- `windowTitle` (string, 可选): 窗口标题
- `processName` (string, 可选): 进程名 ⭐ 推荐
- `includeFrame` (boolean, 可选): 是否包含边框（默认：true）
- **`longScreenshot` (boolean, 可选): 是否启用长截图模式（默认：false）⭐ 新功能**
- `scrollDelay` (number, 可选): 滚动延迟（毫秒，默认：500）
- `scrollAmount` (number, 可选): 每次滚动像素数（默认：窗口高度的 80%）
- `maxScrolls` (number, 可选): 最大滚动次数（默认：20）
- `overlapPixels` (number, 可选): 截图重叠像素数（默认：50）

**注意：** Window 模式下，`windowHandle`、`windowTitle`、`processName` 三选一

**返回：**
```json
{
  "filePath": "C:\\screenshots\\test.png",
  "fileSize": 213336,
  "imageWidth": 400,
  "imageHeight": 300,
  "saved": true,
  "timestamp": "2026-01-19T10:30:00.000Z"
}
```

**长截图示例：**
```json
{
  "mode": "window",
  "processName": "chrome.exe",
  "filePath": "C:\\screenshots\\webpage.png",
  "longScreenshot": true,
  "scrollDelay": 800,
  "maxScrolls": 15,
  "overwrite": true
}
```

---

## 长截图功能 ⭐ 新功能

通过设置 `longScreenshot=true`，可以在 `capture_window` 和 `capture_and_save` 工具中启用长截图模式。

### 工作原理

1. 捕获窗口的第一张截图
2. 自动向下滚动窗口
3. 等待内容加载（scrollDelay）
4. 再次截图
5. 检测是否到达底部（图像不再变化）
6. 重复步骤 2-5，直到到达底部或达到 maxScrolls
7. 将所有截图拼接成一张长图

### 使用场景

- ✅ 捕获完整网页（Chrome、Firefox 等浏览器）
- ✅ 截取长文档（Word、PDF 阅读器）
- ✅ 保存聊天记录或长列表
- ✅ 捕获代码编辑器的完整文件

### 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `scrollDelay` | 500ms | 滚动后等待内容加载的时间 |
| `scrollAmount` | 窗口高度的 80% | 每次滚动的像素数 |
| `maxScrolls` | 20 | 最大滚动次数（防止无限循环） |
| `overlapPixels` | 50 | 截图之间的重叠像素数（用于平滑拼接） |

### 平台支持

- ✅ Windows
- ✅ macOS
- ❌ Linux（暂不支持）

### 注意事项

1. **使用 capture_and_save 而不是 capture_window**
   - 长截图会生成很大的图像（可能 5-20MB）
   - base64 数据传输可能超时
   - 直接保存到文件更可靠

2. **调整参数以适应不同内容**
   - 网页：`scrollDelay: 800-1000`（需要加载图片、脚本）
   - 本地文档：`scrollDelay: 300-500`（加载快）
   - 慢速网页：`scrollDelay: 1500-2000`

3. **避免在动态内容上使用**
   - 视频播放器
   - 自动刷新的页面
   - 无限滚动的列表

---

## 错误处理

所有工具在失败时返回：

```json
{
  "success": false,
  "error": "错误信息"
}
```

### 常见错误

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| `No window found with...` | 找不到匹配的窗口 | 检查窗口是否可见，使用 list_windows 查看 |
| `File already exists` | 文件已存在 | 设置 `overwrite: true` |
| `Invalid file extension` | 文件扩展名不是 .png | 使用 .png 扩展名 |
| `One of windowHandle, windowTitle, or processName must be provided` | 未提供窗口查找参数 | 提供至少一个参数 |
| `Long screenshot is not supported on this platform yet` | 平台不支持长截图 | 仅支持 Windows 和 macOS |

---

## 匹配规则

### windowTitle 匹配
- **大小写：** 敏感
- **匹配方式：** 包含关系或完全匹配
- **示例：** `"Python"` 匹配 `"Python 3.9"`, `"简单的Python窗口"`

### processName 匹配
- **大小写：** 不敏感
- **匹配方式：** 包含关系或完全匹配
- **示例：** `"python"` 匹配 `"python.exe"`, `"Python.exe"`, `"PYTHON.EXE"`

### 多窗口匹配
如果有多个窗口匹配搜索条件，会使用**第一个**匹配的窗口。

---

## 使用建议

### 什么时候使用 processName？
- ✅ 用户提到应用程序名称（如 "Python", "Chrome"）
- ✅ 不关心具体哪个窗口
- ✅ 想要简单快速的截图

### 什么时候使用 windowTitle？
- ✅ 用户提供了具体的窗口标题
- ✅ 窗口标题是唯一的
- ✅ 需要区分同一应用程序的不同窗口

### 什么时候使用 windowHandle？
- ✅ 需要精确控制截取哪个窗口
- ✅ 有多个相同进程名或标题的窗口

### 什么时候使用 capture_and_save？
- ✅ 需要保存截图到文件
- ✅ 在 Kiro 中使用（AI 无法访问工具返回值）
- ✅ 想要一步完成截图和保存

### 什么时候使用长截图？
- ✅ 需要捕获完整的可滚动内容
- ✅ 网页、文档或列表超过一屏
- ✅ 想要自动滚动和拼接
- ✅ 内容很长，避免数据传输超时（使用 capture_and_save）
