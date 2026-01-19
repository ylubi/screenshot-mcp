# 测试说明

## 测试结构

```
tests/
├── integration/           # 集成测试
│   ├── mcp-protocol.test.js    # MCP 协议测试
│   ├── tools.test.js           # 工具功能测试
│   └── server-info.test.js     # 服务器信息测试
└── README.md             # 本文件
```

## 单元测试

单元测试位于源代码目录中，与被测试的代码放在一起：

```
src/
├── server/
│   ├── mcp-server.test.ts
│   └── tool-registry.test.ts
├── platform/
│   ├── factory.test.ts
│   ├── windows.test.ts
│   └── macos.test.ts
├── tools/
│   └── save-screenshot.test.ts
└── types/
    └── validation.test.ts
```

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行单元测试

```bash
npm test
```

### 运行集成测试

```bash
npm run test:integration
```

## 集成测试说明

### mcp-protocol.test.js

测试 MCP 协议的完整流程：
- initialize 请求
- tools/list 请求
- tools/call 请求

### tools.test.js

测试所有工具的功能：
- 验证 processName 参数存在
- 验证工具描述完整
- 验证保存功能提示

### server-info.test.js

测试服务器信息：
- 验证服务器描述存在
- 验证描述包含关键信息

## 测试要求

1. **构建后测试**：集成测试需要先构建项目
   ```bash
   npm run build
   npm run test:integration
   ```

2. **服务器启动**：集成测试会自动启动和关闭服务器

3. **超时设置**：集成测试超时时间为 10 秒

## 添加新测试

### 添加单元测试

在源代码目录中创建 `.test.ts` 文件：

```typescript
// src/module/feature.test.ts
import { describe, it, expect } from 'vitest';
import { feature } from './feature.js';

describe('Feature', () => {
  it('should work', () => {
    expect(feature()).toBe(true);
  });
});
```

### 添加集成测试

在 `tests/integration/` 目录中创建 `.test.js` 文件：

```javascript
// tests/integration/new-feature.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('New Feature', () => {
  it('should work', () => {
    assert.ok(true);
  });
});
```

## 测试覆盖率

当前测试覆盖：
- ✅ MCP 协议层
- ✅ 工具注册层
- ✅ 平台抽象层
- ✅ 工具实现层
- ✅ 类型验证
- ✅ 图像处理

总计：122 个单元测试 + 3 个集成测试
