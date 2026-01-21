# 长截图功能完整指南

## 目录

1. [功能概述](#功能概述)
2. [快速开始](#快速开始)
3. [参数说明](#参数说明)
4. [兼容性说明](#兼容性说明)
5. [使用指南](#使用指南)
6. [故障排除](#故障排除)
7. [技术实现](#技术实现)
8. [示例代码](#示例代码)

---

## 功能概述

长截图功能通过自动滚动窗口并智能拼接多张截图，实现对长页面的完整捕获。适用于网页、文档、聊天记录等需要完整截取的场景。

### 核心特性

- ✅ **自动滚动**：使用 Page Down 键自动滚动窗口
- ✅ **智能拼接**：自动检测最佳重叠位置进行拼接
- ✅ **底部检测**：自动识别何时到达页面底部
- ✅ **跨平台**：支持 Windows 和 macOS
- ✅ **高兼容性**：支持浏览器、编辑器等大多数应用

### 工作原理

```
1. 捕获第一张截图
   ↓
2. 按 Page Down 键滚动
   ↓
3. 等待内容加载
   ↓
4. 捕获下一张截图
   ↓
5. 检测是否到达底部
   ├─ 否 → 返回步骤 2
   └─ 是 → 继续
   ↓
6. 智能拼接所有截图
   ↓
7. 保存为 PNG 文件
```

---

## 快速开始

### 基本用法

```javascript
{
  "name": "capture_and_save",
  "arguments": {
    "mode": "window",
    "windowTitle": "简书",        // 或使用 processName: "chrome.exe"
    "includeFrame": false,
    "longScreenshot": true,       // 启用长截图
    "scrollDelay": 1000,
    "maxScrolls": 20,
    "overlapPixels": 150,
    "filePath": "output.png",
    "overwrite": true
  }
}
```

### 推荐配置

**浏览器网页（推荐）：**
```javascript
{
  longScreenshot: true,
  scrollDelay: 1000,
  maxScrolls: 20,
  overlapPixels: 150,
  includeFrame: false
}
```

**文档编辑器：**
```javascript
{
  longScreenshot: true,
  scrollDelay: 600,
  maxScrolls: 30,
  overlapPixels: 100,
  includeFrame: false
}
```

---

## 参数说明

### 必需参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `longScreenshot` | boolean | 设为 `true` 启用长截图 |
| `filePath` | string | 输出文件路径（必须以 .png 结尾） |

### 可选参数

| 参数 | 默认值 | 说明 | 推荐值 |
|------|--------|------|--------|
| `scrollDelay` | 500 | 每次滚动后等待时间（ms） | 800-1200（动态内容）<br>500-800（静态内容） |
| `maxScrolls` | 20 | 最大滚动次数 | 10-20（普通页面）<br>30-50（超长页面） |
| `overlapPixels` | 50 | 截图间重叠像素 | 100-200（更好的拼接） |
| `includeFrame` | true | 是否包含窗口边框 | false（避免重复边框） |

### 参数说明

**scrollDelay（滚动延迟）：**
- 用于等待页面内容加载
- 动态加载页面需要更长时间
- 太短可能导致内容缺失
- 太长会增加总时间

**maxScrolls（最大滚动次数）：**
- 防止无限滚动
- 到达底部会自动停止
- 超长页面需要增加此值

**overlapPixels（重叠像素）：**
- 用于智能拼接
- 更大的重叠提供更好的匹配
- 但会增加计算时间

---

## 兼容性说明

### ✅ 完全支持

以下类型的窗口可以正常使用长截图功能：

**Web 浏览器：**
- Google Chrome
- Microsoft Edge
- Firefox
- 其他基于 Chromium 的浏览器

**原生应用：**
- 记事本
- 文件资源管理器
- 大多数标准 Windows 应用

**Electron 应用：**
- VS Code
- Discord
- Slack
- 其他 Electron 应用

### ⚠️ 部分支持

以下类型可能需要特殊处理：

- Qt 应用（取决于具体实现）
- WPF 应用（取决于具体实现）
- 自定义 UI 框架

### ❌ 不支持

以下类型无法使用自动滚动：

- Tkinter (Python) - 不响应模拟输入
- 某些 Java Swing/JavaFX 应用
- 全屏游戏
- 视频播放器
- 虚拟机窗口

### 为什么某些应用不支持？

1. **事件处理机制不同**
   - 某些 GUI 框架只处理真实系统事件
   - 模拟事件可能被过滤

2. **自定义滚动实现**
   - 应用使用自定义滚动逻辑
   - 不响应标准滚动消息

3. **焦点和安全限制**
   - 跨进程输入模拟可能被阻止
   - 窗口无法正确获得焦点

---

## 使用指南

### 准备工作

**确保窗口状态正确：**
- ✅ 窗口可见且在前台
- ✅ 页面已滚动到顶部
- ✅ 页面内容已完全加载
- ✅ 关闭自动播放的视频/动画

### 不同场景的配置

#### 场景 1：新闻网站/博客

```javascript
{
  mode: "window",
  processName: "chrome.exe",
  longScreenshot: true,
  scrollDelay: 800,
  maxScrolls: 15,
  overlapPixels: 150,
  includeFrame: false,
  filePath: "news.png",
  overwrite: true
}
```

**特点：**
- 内容静态，加载快
- 通常不太长
- 拼接质量要求高

#### 场景 2：社交媒体（动态加载）

```javascript
{
  mode: "window",
  windowTitle: "Twitter",
  longScreenshot: true,
  scrollDelay: 1500,      // 更长等待时间
  maxScrolls: 25,
  overlapPixels: 200,     // 更大重叠
  includeFrame: false,
  filePath: "social.png",
  overwrite: true
}
```

**特点：**
- 内容动态加载
- 需要更长等待时间
- 可能有无限滚动

#### 场景 3：文档/PDF 查看器

```javascript
{
  mode: "window",
  processName: "AcroRd32.exe",
  longScreenshot: true,
  scrollDelay: 600,
  maxScrolls: 30,
  overlapPixels: 100,
  includeFrame: false,
  filePath: "document.png",
  overwrite: true
}
```

**特点：**
- 内容固定
- 页面可能很长
- 滚动稳定

### 质量检查清单

截图完成后，检查以下方面：

- [ ] **拼接缝隙**：是否有明显断层？
- [ ] **内容重复**：是否有重复段落？
- [ ] **内容缺失**：是否遗漏重要内容？
- [ ] **图像质量**：文字是否清晰？
- [ ] **文件大小**：是否合理？

### 高级技巧

#### 技巧 1：分段截图

对于超长页面，分段截图后手动拼接：

```javascript
// 第一段：顶部到中间
{
  longScreenshot: true,
  maxScrolls: 10,
  filePath: "part1.png"
}

// 手动滚动到中间位置

// 第二段：中间到底部
{
  longScreenshot: true,
  maxScrolls: 10,
  filePath: "part2.png"
}
```

#### 技巧 2：使用浏览器开发者工具

优化网页截图：

1. 打开 Chrome DevTools (F12)
2. 切换到设备模拟模式
3. 设置较窄宽度（如 800px）
4. 进行长截图

**优势：**
- 减少页面宽度
- 增加内容高度
- 更容易捕获完整内容

#### 技巧 3：预处理页面

在截图前优化页面（在浏览器控制台执行）：

```javascript
// 隐藏固定定位的元素
document.querySelectorAll('[style*="position: fixed"]').forEach(el => {
  el.style.display = 'none';
});

// 隐藏粘性定位的元素
document.querySelectorAll('[style*="position: sticky"]').forEach(el => {
  el.style.display = 'none';
});

// 隐藏广告
document.querySelectorAll('.ad, .advertisement').forEach(el => {
  el.style.display = 'none';
});
```

---

## 故障排除

### 问题 1：窗口没有滚动

**症状：**
- 只截取了一屏
- 日志显示 "Image unchanged"

**可能原因：**
1. 窗口类型不支持
2. 页面已在底部
3. 窗口失去焦点
4. 页面不可滚动

**解决方法：**

```
1. 检查窗口类型是否支持
   ├─ 浏览器 → 应该支持
   ├─ Tkinter → 不支持
   └─ 其他 → 查看兼容性列表

2. 确认页面状态
   ├─ 手动滚动到顶部
   ├─ 确认内容可滚动
   └─ 点击窗口获得焦点

3. 调整参数
   ├─ 增加 scrollDelay 到 1000-1500ms
   ├─ 确保 maxScrolls 足够大
   └─ 检查 includeFrame 设置
```

### 问题 2：拼接有重复内容

**症状：**
- 图片中有重复的段落
- 某些内容出现多次

**可能原因：**
1. 页面有固定元素（导航栏）
2. 滚动量计算不准确
3. 重叠检测失败

**解决方法：**

```
1. 使用 includeFrame: false
   → 避免重复窗口边框

2. 调整重叠参数
   → 增加 overlapPixels 到 150-200

3. 预处理页面
   → 隐藏固定定位元素

4. 手动编辑
   → 使用图像编辑工具去除重复
```

### 问题 3：拼接有缺失内容

**症状：**
- 某些段落缺失
- 内容跳跃

**可能原因：**
1. 滚动太快，内容未加载
2. 重叠区域太大
3. 页面有懒加载

**解决方法：**

```
1. 增加等待时间
   → scrollDelay: 1000-1500

2. 减少重叠
   → overlapPixels: 50-100

3. 增加滚动次数
   → maxScrolls: 30-50

4. 禁用懒加载
   → 在浏览器中预加载所有内容
```

### 问题 4：截图时间太长

**症状：**
- 等待时间超过 1 分钟
- 进度缓慢

**可能原因：**
1. scrollDelay 太大
2. maxScrolls 太多
3. 页面内容太长

**解决方法：**

```
1. 优化参数
   ├─ 减少 scrollDelay 到 500-800ms
   ├─ 减少 maxScrolls
   └─ 减少 overlapPixels

2. 分段截图
   → 将长页面分成多段

3. 使用更快的方法
   → 考虑使用浏览器插件
```

### 调试步骤

#### 步骤 1：查看日志

长截图会输出详细日志：

```
[Long Screenshot] Starting long screenshot capture
[Long Screenshot] Options: scrollDelay=1000, maxScrolls=20
[Long Screenshot] Window dimensions: 947x875
[Long Screenshot] Will scroll 20 times using Page Down key
[Long Screenshot] Scroll 1/20
[Long Screenshot] Pressing Page Down key...
[Long Screenshot] Page Down completed
[Long Screenshot] Captured screenshot 2
...
[Long Screenshot] Captured 13 screenshots total
[Long Screenshot] Stitching images...
[Long Screenshot] Overlap between image 1 and 2: 130px
...
[Long Screenshot] Final image: 947x9815
```

**分析日志：**
- "Image unchanged" 立即出现 → 滚动未生效
- "Captured screenshot X" → 滚动正常
- "Reached bottom" 很快 → 内容未变化

#### 步骤 2：测试滚动

使用简单应用测试：

**记事本测试：**
1. 打开记事本
2. 粘贴大量文本（50+ 行）
3. 使用长截图功能
4. 应该能看到多张截图

**浏览器测试：**
1. 打开长网页
2. 滚动到顶部
3. 使用长截图功能
4. 检查结果

#### 步骤 3：调整参数

逐步调整参数找到最佳配置：

```javascript
// 第一次尝试：保守配置
{
  scrollDelay: 1500,
  maxScrolls: 10,
  overlapPixels: 200
}

// 如果成功，优化速度
{
  scrollDelay: 1000,
  maxScrolls: 15,
  overlapPixels: 150
}

// 如果失败，增加等待
{
  scrollDelay: 2000,
  maxScrolls: 5,
  overlapPixels: 250
}
```

---

## 技术实现

### 滚动机制

#### Windows 平台

使用 **Page Down 键模拟**：

```powershell
# 1. 恢复窗口（如果最小化）
[WinAPI]::ShowWindow($handle, SW_RESTORE)

# 2. 附加到窗口线程
[WinAPI]::AttachThreadInput($currentThread, $windowThread, $true)

# 3. 设置窗口为前台
[WinAPI]::SetForegroundWindow($handle)

# 4. 等待窗口获得焦点
Start-Sleep -Milliseconds 500

# 5. 按下 Page Down 键
[WinAPI]::keybd_event(VK_NEXT, 0, 0, 0)
Start-Sleep -Milliseconds 50
[WinAPI]::keybd_event(VK_NEXT, 0, KEYEVENTF_KEYUP, 0)

# 6. 分离线程
[WinAPI]::AttachThreadInput($currentThread, $windowThread, $false)
```

**关键点：**
- 每次只按 1 次 Page Down
- 让应用程序决定滚动量
- 更可靠，兼容性更好

#### macOS 平台

使用 AppleScript 模拟键盘：

```applescript
tell application "System Events"
  key code 125  -- Down arrow
  delay 0.05
end tell
```

### 拼接算法

#### 智能重叠检测

```typescript
function findBestOverlap(img1, img2, maxOverlap) {
  let bestOverlap = maxOverlap;
  let bestScore = Infinity;
  
  // 搜索最佳重叠位置
  for (let overlap = minOverlap; overlap <= maxSearchOverlap; overlap += 5) {
    let score = 0;
    
    // 比较重叠区域（跳过顶部和底部 20%）
    for (let y = overlap * 0.2; y < overlap * 0.8; y++) {
      for (let x = 0; x < width; x += 5) {
        // 计算颜色差异
        const dr = img1[y1][x].r - img2[y2][x].r;
        const dg = img1[y1][x].g - img2[y2][x].g;
        const db = img1[y1][x].b - img2[y2][x].b;
        
        score += sqrt(dr² + dg² + db²);
      }
    }
    
    if (score < bestScore) {
      bestScore = score;
      bestOverlap = overlap;
    }
  }
  
  return bestOverlap;
}
```

**优势：**
- 自动找到最佳拼接位置
- 减少重复和缺失
- 提高拼接质量

#### 底部检测

```typescript
function hashImage(image) {
  // 采样 100 个点创建哈希
  const samples = 100;
  const step = Math.floor(image.data.length / samples);
  let hash = '';
  
  for (let i = 0; i < image.data.length; i += step) {
    hash += image.data[i].toString(16);
  }
  
  return hash;
}

// 使用哈希检测内容是否变化
if (currentHash === previousHash) {
  unchangedCount++;
  if (unchangedCount >= 2) {
    // 连续 2 次未变化，认为到达底部
    break;
  }
}
```

### 性能考虑

#### 时间估算

```
总时间 = (滚动次数 × scrollDelay) + (截图次数 × 200ms) + 拼接时间

示例：
- 20 次滚动 × 1000ms = 20秒
- 13 张截图 × 200ms = 2.6秒
- 拼接时间 ≈ 2-3秒
- 总计：约 24-26秒
```

#### 文件大小

```
文件大小 ≈ 宽度 × 高度 × 4 字节 × 压缩率

示例：
- 947px × 9815px × 4 = 37MB (未压缩)
- PNG 压缩后 ≈ 2-5MB
```

**典型大小：**
- 简单页面：500KB - 2MB
- 复杂页面：2MB - 10MB
- 超长页面：10MB - 50MB

---

## 示例代码

### Node.js 示例

```javascript
import { spawn } from 'child_process';
import path from 'path';

// 启动 MCP 服务器
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let responseBuffer = '';

serverProcess.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || '';
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        console.log('Response:', message);
      } catch (e) {
        console.log('Output:', line);
      }
    }
  }
});

function sendRequest(method, params, id = 1) {
  const request = {
    jsonrpc: '2.0',
    method,
    params,
    id
  };
  
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
}

// 初始化
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' }
  });
}, 1000);

// 捕获长截图
setTimeout(() => {
  sendRequest('tools/call', {
    name: 'capture_and_save',
    arguments: {
      mode: 'window',
      windowTitle: '简书',
      includeFrame: false,
      longScreenshot: true,
      scrollDelay: 1000,
      maxScrolls: 20,
      overlapPixels: 150,
      filePath: path.join(__dirname, 'output.png'),
      overwrite: true
    }
  });
}, 2000);
```

### Python 示例

```python
import json
import subprocess
import time

class MCPClient:
    def __init__(self):
        self.process = subprocess.Popen(
            ['node', 'dist/index.js'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
    
    def send_request(self, method, params, id=1):
        request = {
            'jsonrpc': '2.0',
            'method': method,
            'params': params,
            'id': id
        }
        
        self.process.stdin.write(json.dumps(request) + '\n')
        self.process.stdin.flush()
        
        # 读取响应
        response = self.process.stdout.readline()
        return json.loads(response)
    
    def capture_long_screenshot(self, window_title, output_path):
        return self.send_request('tools/call', {
            'name': 'capture_and_save',
            'arguments': {
                'mode': 'window',
                'windowTitle': window_title,
                'includeFrame': False,
                'longScreenshot': True,
                'scrollDelay': 1000,
                'maxScrolls': 20,
                'overlapPixels': 150,
                'filePath': output_path,
                'overwrite': True
            }
        })

# 使用示例
client = MCPClient()

# 初始化
client.send_request('initialize', {
    'protocolVersion': '2024-11-05',
    'capabilities': {},
    'clientInfo': {'name': 'python-client', 'version': '1.0.0'}
})

# 捕获长截图
result = client.capture_long_screenshot('简书', 'output.png')
print(f"Screenshot saved: {result}")
```

---

## 总结

### 关键要点

1. **使用 Page Down 键滚动**
   - 每次只按 1 次
   - 让应用决定滚动量
   - 兼容性最好

2. **智能拼接算法**
   - 自动检测最佳重叠
   - 减少重复和缺失
   - 提高质量

3. **参数调优很重要**
   - scrollDelay: 1000ms（动态内容）
   - maxScrolls: 20（普通页面）
   - overlapPixels: 150（更好拼接）

4. **兼容性限制**
   - 浏览器：✅ 完全支持
   - 标准应用：✅ 大多支持
   - 自定义 GUI：❌ 可能不支持

### 最佳实践

- ✅ 优先使用浏览器测试
- ✅ 确保窗口在前台
- ✅ 页面滚动到顶部
- ✅ 使用 includeFrame: false
- ✅ 根据内容类型调整参数
- ✅ 检查日志输出
- ✅ 验证截图质量

### 获取帮助

如果遇到问题：

1. 查看本文档的故障排除部分
2. 检查日志输出
3. 尝试不同的参数配置
4. 使用支持的应用程序测试
5. 提供详细的错误信息反馈

---

## 相关文档

- [API 文档](./API.md)
- [用户指南](./USER_GUIDE.md)
- [README](../README.md)
