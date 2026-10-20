# .mcp.json 使用说明

> 📚 **官方文档**：[Claude Code MCP](https://code.claude.com/docs/en/mcp) ｜ [MCP 官方服务器列表](https://github.com/modelcontextprotocol/servers)

## 什么是 .mcp.json

`.mcp.json` 是**项目级 MCP 服务器配置文件**，用于连接外部工具和数据源，让 Claude Code 能够访问更多能力。

> **通俗理解**：就像给 Claude 安装"插件"或"扩展"。通过 MCP 服务器，Claude 可以访问 GitHub、数据库、网页搜索等外部资源。

## 文件位置

```
项目根目录/.mcp.json
```

⚠️ 注意：项目级 MCP 配置文件放在**项目根目录**（与 `package.json` 同级），而不是 `.claude/` 目录中。

## 什么是 MCP

MCP (Model Context Protocol) 是一个开放协议，让 AI 助手能够连接外部工具：

- 访问数据库（PostgreSQL、MongoDB 等）
- 调用 API（GitHub、Slack 等）
- 搜索网页（Brave Search 等）
- 操作文件系统
- 运行自定义服务

## 为什么需要 MCP

### 问题场景

Claude 默认只能：
- 读取和编辑本地文件
- 运行命令行工具
- 进行网络搜索

无法直接：
- 访问 GitHub 仓库
- 查询数据库
- 调用内部 API

### 解决方案

通过 MCP 服务器，Claude 可以：
- 查看 GitHub Issue 和 PR
- 查询 PostgreSQL 数据库
- 调用 Slack API
- 访问文件系统的特定目录

## 配置的三个范围（Scope）

MCP 服务器可以在三个范围配置，各有不同用途：

| 范围 | 存储位置 | 适用场景 | 是否提交 |
|------|----------|----------|----------|
| `local`（默认） | `~/.claude.json` 的项目记录中 | 本项目个人使用 | ❌ |
| `project` | 项目根目录 `.mcp.json` | 团队共享 | ✅ 应提交 |
| `user` | `~/.claude.json` 的 `mcpServers` | 个人所有项目通用 | ❌ |

```bash
# 添加服务器时用 -s 指定范围
claude mcp add github -s project -e GITHUB_TOKEN=你的令牌 -- npx -y @modelcontextprotocol/server-github
```

## 配置结构

stdio 类型（本地进程，最常见）：

```json
{
  "mcpServers": {
    "服务器名称": {
      "type": "stdio",
      "command": "启动命令",
      "args": ["参数1", "参数2"],
      "env": {
        "环境变量": "值"
      }
    }
  }
}
```

HTTP / SSE 类型（远程服务）：

```json
{
  "mcpServers": {
    "远程服务器": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${MY_TOKEN}"
      }
    }
  }
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 传输类型：`stdio`（本地进程）/ `http` / `sse` |
| command | string | stdio 类型：启动服务器的命令 |
| args | string[] | stdio 类型：命令参数列表 |
| env | object | stdio 类型：环境变量 |
| url | string | http/sse 类型：服务器地址 |
| headers | object | http/sse 类型：请求头 |

## 环境变量展开

配置值支持 `${变量名}` 语法，从环境变量中展开，**不要把密钥明文写进文件**：

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

在 shell 配置（如 `~/.zshrc`）中导出：

```bash
export GITHUB_TOKEN=ghp_xxxx
```

## 常用 MCP 服务器

### 1. GitHub 服务器

访问 GitHub 仓库数据。

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**功能**：查看 Issue 和 PR、读取仓库文件、创建和更新 Issue、管理 Pull Request

**获取 GitHub Token**：
1. 访问 https://github.com/settings/tokens
2. 生成新的 Personal Access Token
3. 选择需要的权限（repo, read:org 等）

> 提示：GitHub 官方也维护了功能更全的 [github-mcp-server](https://github.com/github/github-mcp-server)，支持远程托管方式接入。

### 2. PostgreSQL 服务器

访问 PostgreSQL 数据库（只读查询）。

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

**功能**：执行 SQL 查询、查看表结构、分析数据

### 3. Brave 搜索服务器

网页搜索功能。

```json
{
  "mcpServers": {
    "brave-search": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**功能**：网页搜索、获取最新信息、查找技术文档

**获取 Brave API Key**：访问 https://api.search.brave.com/app/keys 注册并获取

### 4. 文件系统服务器

访问指定目录的文件。

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/允许访问的路径"]
    }
  }
}
```

**功能**：读取指定目录的文件、列出目录内容、搜索文件

更多官方与社区服务器见 [MCP 官方服务器列表](https://github.com/modelcontextprotocol/servers)。

## 管理命令

MCP 服务器优先使用 CLI 命令管理，而不是手动编辑文件：

```bash
# 添加（stdio）
claude mcp add 名称 -e KEY=value -- npx -y 包名

# 添加（HTTP）
claude mcp add --transport http 名称 https://example.com/mcp

# 查看所有已配置的服务器及连接状态
claude mcp list

# 查看某个服务器的详情
claude mcp get 名称

# 删除
claude mcp remove 名称
```

在会话中使用 `/mcp` 命令可以查看服务器的连接状态和可用工具。

## 完整示例

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "${DATABASE_URL}"
      }
    },
    "docs-site": {
      "type": "http",
      "url": "https://docs.example.com/mcp"
    }
  }
}
```

## 使用场景

### 场景 1：开发工作流

配置 GitHub + 文件系统服务器：
- 查看 GitHub Issue 并生成修复方案
- 读取项目文档
- 代码审查

### 场景 2：数据查询

配置 PostgreSQL 服务器：
- 查询用户数据
- 分析业务数据
- 验证数据完整性

### 场景 3：信息检索

配置搜索服务器：
- 搜索技术文档
- 查找最新信息
- 研究问题解决方案

## 故障排查

### 检查服务器状态

```bash
# 查看所有服务器及连接状态
claude mcp list

# 会话内查看工具是否加载
/mcp
```

### 常见问题

**问题 1：服务器启动失败**

原因：命令或参数错误

解决：
```bash
# 手动测试命令能否运行
npx -y @modelcontextprotocol/server-github
```

**问题 2：认证失败**

原因：环境变量或 Token 无效

解决：
- 检查环境变量是否已导出（`echo $GITHUB_TOKEN`）
- 验证 Token 是否有效、是否有足够权限
- 注意 `${VAR}` 展开发生在 Claude Code 读取配置时

**问题 3：网络问题**

原因：无法访问外部服务

解决：
- 检查网络连接
- 配置代理（如需要）
- HTTP 类型服务器确认 URL 可达

## 最佳实践

### 1. 分离敏感信息

```json
// ✅ 好的做法：使用环境变量
{ "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" } }

// ❌ 不好的做法：硬编码密钥
{ "env": { "GITHUB_TOKEN": "ghp_真实的令牌" } }
```

### 2. 项目级只放团队都需要的

`.mcp.json` 会随代码库提交，只配置团队通用的服务器；个人专用的用 `local` 或 `user` 范围。

### 3. 权限最小化

只授予必要的 Token 权限（如只读权限），数据库连接使用只读账号。

### 4. 版本锁定

指定 MCP 服务器版本，避免自动更新带来的不稳定：

```json
{
  "args": ["-y", "@modelcontextprotocol/server-github@0.6.2"]
}
```

## 注意事项

1. **API 密钥安全**：不要明文写入 `.mcp.json`，使用 `${VAR}` 环境变量展开
2. **位置正确**：项目级配置在项目根目录 `.mcp.json`，不在 `.claude/` 内
3. **首次使用确认**：项目级 `.mcp.json` 中的服务器首次使用时需要用户批准
4. **权限最小化**：只授予必要的权限
5. **定期更新**：保持 MCP 服务器版本更新，但关键项目建议锁定版本

## 与个人配置的关系

| 范围 | 配置位置 | 用途 | 提交 |
|------|----------|------|------|
| project | 项目根目录 `.mcp.json` | 团队共享的 MCP 服务器 | ✅ |
| user | `~/.claude.json`（mcpServers） | 个人所有项目通用 | ❌ |
| local | `~/.claude.json`（项目记录内） | 本项目个人使用 | ❌ |
