# 发布 MCP 服务器指南

本文档指导如何将 Screenshot MCP Server 发布到 npm，让其他用户可以通过 `npx` 使用。

## 发布前准备

### 1. 检查 package.json

确保以下字段正确配置：

```json
{
  "name": "@modelcontextprotocol/server-screenshot",
  "version": "0.1.0",
  "description": "MCP server providing screenshot capabilities for AI assistants...",
  "main": "dist/index.js",
  "bin": {
    "mcp-server-screenshot": "dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "mcp",
    "screenshot",
    "model-context-protocol",
    "ai-tools"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/screenshot-mcp.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/screenshot-mcp/issues"
  },
  "homepage": "https://github.com/yourusername/screenshot-mcp#readme"
}
```

**重要字段说明：**
- `name`: 包名，使用 `@modelcontextprotocol/server-*` 格式
- `version`: 版本号，遵循语义化版本
- `bin`: 可执行命令名称
- `files`: 要发布的文件列表（只包含必要文件）
- `keywords`: 便于搜索的关键词
- `repository`: Git 仓库地址

### 2. 添加 .npmignore

创建 `.npmignore` 文件，排除不需要发布的文件：

```
# 源代码（只发布编译后的 dist）
src/
*.ts
!*.d.ts

# 测试文件
tests/
*.test.js
*.test.ts
coverage/

# 开发配置
.kiro/
temp/
.vscode/
.idea/

# 构建配置
tsconfig.json
vitest.config.ts

# Git
.git/
.gitignore

# 其他
node_modules/
*.log
.DS_Store
```

### 3. 构建项目

确保项目可以正常构建：

```bash
# 清理旧的构建
rm -rf dist

# 安装依赖
npm install

# 构建
npm run build

# 运行测试
npm test
```

### 4. 测试本地包

在发布前，先在本地测试：

```bash
# 创建本地链接
npm link

# 在另一个目录测试
npx mcp-server-screenshot

# 或者打包测试
npm pack
# 这会生成 modelcontextprotocol-server-screenshot-0.1.0.tgz
# 可以用 npm install ./modelcontextprotocol-server-screenshot-0.1.0.tgz 测试
```

## 发布到 npm

### 1. 注册 npm 账号

如果还没有 npm 账号：

1. 访问 [npmjs.com](https://www.npmjs.com/)
2. 点击 "Sign Up" 注册账号
3. 验证邮箱

### 2. 登录 npm

```bash
npm login
```

输入用户名、密码和邮箱。

### 3. 检查发布内容

查看将要发布的文件：

```bash
npm publish --dry-run
```

这会显示将要发布的文件列表，确认无误后继续。

### 4. 发布包

#### 首次发布

如果使用 `@modelcontextprotocol` scope（需要权限）：

```bash
# 公开发布
npm publish --access public
```

如果使用自己的 scope（如 `@yourname/server-screenshot`）：

```bash
# 修改 package.json 中的 name
# "name": "@yourname/server-screenshot"

# 发布
npm publish --access public
```

#### 后续更新

1. 更新版本号：

```bash
# 补丁版本（bug 修复）: 0.1.0 -> 0.1.1
npm version patch

# 次版本（新功能）: 0.1.0 -> 0.2.0
npm version minor

# 主版本（破坏性更改）: 0.1.0 -> 1.0.0
npm version major
```

2. 推送到 Git：

```bash
git push
git push --tags
```

3. 发布新版本：

```bash
npm publish
```

## 发布后验证

### 1. 检查 npm 页面

访问 `https://www.npmjs.com/package/@modelcontextprotocol/server-screenshot` 查看包信息。

### 2. 测试安装

```bash
# 使用 npx 测试
npx -y @modelcontextprotocol/server-screenshot

# 或全局安装测试
npm install -g @modelcontextprotocol/server-screenshot
mcp-server-screenshot
```

### 3. 在 MCP 客户端中测试

在 Claude Desktop 配置中添加：

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-screenshot"]
    }
  }
}
```

重启 Claude Desktop，测试截图功能。

## 发布到 MCP 服务器列表

### 1. 提交到官方列表

访问 [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)，提交 Pull Request 将你的服务器添加到列表中。

需要提供：
- 服务器名称
- 简短描述
- npm 包名
- GitHub 仓库链接
- 使用示例

### 2. 更新文档

确保 README.md 包含：
- 清晰的功能说明
- 安装配置步骤
- 使用示例
- 故障排除

## 版本管理最佳实践

### 语义化版本

遵循 [Semantic Versioning](https://semver.org/)：

- **主版本号（Major）**: 不兼容的 API 更改
- **次版本号（Minor）**: 向后兼容的新功能
- **补丁版本号（Patch）**: 向后兼容的 bug 修复

### 版本发布流程

```bash
# 1. 确保在 main 分支且代码最新
git checkout main
git pull

# 2. 运行测试
npm test

# 3. 更新版本号
npm version patch  # 或 minor/major

# 4. 推送代码和标签
git push
git push --tags

# 5. 发布到 npm
npm publish

# 6. 创建 GitHub Release
# 在 GitHub 上创建 Release，使用刚才的 tag
```

### CHANGELOG.md

每次发布前更新 `CHANGELOG.md`：

```markdown
# Changelog

## [0.2.0] - 2026-01-21

### Added
- 长截图功能
- 智能拼接算法

### Fixed
- 修复滚动逻辑问题

### Changed
- 优化性能

## [0.1.0] - 2026-01-20

### Added
- 初始版本
- 窗口截图
- 区域截图
- 窗口列表
```

## 常见问题

### 1. 发布失败：需要权限

**问题**: `npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@modelcontextprotocol/server-screenshot`

**解决**:
- `@modelcontextprotocol` scope 需要组织权限
- 改用自己的 scope: `@yourname/server-screenshot`
- 或者不使用 scope: `screenshot-mcp-server`

### 2. 包名已被占用

**问题**: `npm ERR! 403 Forbidden - Package name already exists`

**解决**:
- 使用不同的包名
- 添加前缀或后缀: `screenshot-mcp-server`, `mcp-screenshot-tool`

### 3. 文件太大

**问题**: 发布的包体积过大

**解决**:
- 检查 `.npmignore` 是否正确配置
- 只发布 `dist` 目录
- 排除 `node_modules`, `tests`, `temp` 等

### 4. 可执行文件无法运行

**问题**: `npx` 运行时报错

**解决**:
- 确保 `dist/index.js` 开头有 `#!/usr/bin/env node`
- 检查 `package.json` 中 `bin` 字段配置
- 确保文件有执行权限

## 撤销发布

如果需要撤销已发布的版本：

```bash
# 撤销特定版本（发布后 72 小时内）
npm unpublish @modelcontextprotocol/server-screenshot@0.1.0

# 撤销整个包（慎用！）
npm unpublish @modelcontextprotocol/server-screenshot --force
```

**注意**: npm 不鼓励撤销发布，建议发布新版本修复问题。

## 持续集成（可选）

### GitHub Actions 自动发布

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

需要在 GitHub 仓库设置中添加 `NPM_TOKEN` secret。

## 总结

发布 MCP 服务器的关键步骤：

1. ✅ 配置 `package.json`（name, version, bin, files）
2. ✅ 添加 `.npmignore` 排除不必要文件
3. ✅ 构建和测试
4. ✅ 登录 npm 账号
5. ✅ 发布: `npm publish --access public`
6. ✅ 验证安装和使用
7. ✅ 提交到 MCP 官方列表

遵循这些步骤，你的 MCP 服务器就可以被全球用户通过 `npx` 轻松使用了！
