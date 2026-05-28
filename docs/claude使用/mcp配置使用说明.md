# .mcp.json 使用说明

## 什么是 .mcp.json

`.mcp.json` 是**MCP 服务器配置文件**，用于连接外部工具和数据源，让 Claude Code 能够访问更多能力。

> **通俗理解**：就像给 Claude 安装"插件"或"扩展"。通过 MCP 服务器，Claude 可以访问 GitHub、数据库、网页搜索等外部资源。

## 文件位置

```
项目/.claude/.mcp.json
```

## 什么是 MCP

MCP (Model Context Protocol) 是一个开放协议，让 AI 助手能够连接外部工具：

- 访问数据库（PostgreSQL、MongoDB 等）
- 调用 API（GitHub、Slack 等）
- 搜索网页（Brave Search、Google 等）
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
- 使用特定工具

### 解决方案

通过 MCP 服务器，Claude 可以：
- 查看 GitHub Issue 和 PR
- 查询 PostgreSQL 数据库
- 调用 Slack API
- 访问文件系统的特定目录

## 配置结构

```json
{
  "mcpServers": {
    "服务器名称": {
      "command": "启动命令",
      "args": ["参数1", "参数2"],
      "env": {
        "环境变量": "值"
      }
    }
  }
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| command | string | 启动服务器的命令 |
| args | string[] | 命令参数列表 |
| env | object | 环境变量 |
| disabled | boolean | 是否禁用（可选） |

## 常用 MCP 服务器

### 1. GitHub 服务器

访问 GitHub 仓库数据。

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "你的 GitHub 令牌"
      }
    }
  }
}
```

**功能**：
- 查看 Issue 和 PR
- 读取仓库文件
- 创建和更新 Issue
- 管理 Pull Request

**获取 GitHub Token**：
1. 访问 https://github.com/settings/tokens
2. 生成新的 Personal Access Token
3. 选择需要的权限（repo, read:org 等）

### 2. PostgreSQL 服务器

访问 PostgreSQL 数据库。

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "postgresql://用户名:密码@主机:端口/数据库"
      }
    }
  }
}
```

**功能**：
- 执行 SQL 查询
- 查看表结构
- 分析数据

### 3. Brave 搜索服务器

网页搜索功能。

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "你的 Brave API 密钥"
      }
    }
  }
}
```

**功能**：
- 网页搜索
- 获取最新信息
- 查找技术文档

**获取 Brave API Key**：
1. 访问 https://api.search.brave.com/app/keys
2. 注册并获取 API 密钥

### 4. 文件系统服务器

访问指定目录的文件。

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/允许访问的路径"]
    }
  }
}
```

**功能**：
- 读取指定目录的文件
- 列出目录内容
- 搜索文件

### 5. Slack 服务器

与 Slack 集成。

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_TOKEN": "xoxb-你的令牌",
        "SLACK_CHANNELS": "general,dev-team"
      }
    }
  }
}
```

**功能**：
- 读取频道消息
- 发送消息
- 查看用户信息

### 6. Puppeteer 服务器

网页自动化。

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**功能**：
- 访问网页
- 截取屏幕截图
- 提取网页内容

## 环境变量处理

### 使用 .env 文件

不要在 `.mcp.json` 中硬编码敏感信息：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

在 `.env` 文件中：
```
GITHUB_TOKEN=ghp_xxxx
```

### 使用全局配置

敏感信息也可以放在 `~/.claude.json` 的 `personalMcpServers` 中：

```json
// ~/.claude.json
{
  "personalMcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "你的个人令牌"
      }
    }
  }
}
```

## 完整示例

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"],
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "${DATABASE_URL}"
      },
      "disabled": true
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

## 可用的官方 MCP 服务器

| 服务器 | 功能 | NPM 包 |
|--------|------|--------|
| Filesystem | 文件系统访问 | @modelcontextprotocol/server-filesystem |
| GitHub | GitHub API | @modelcontextprotocol/server-github |
| Postgres | PostgreSQL 数据库 | @modelcontextprotocol/server-postgres |
| Brave Search | 网页搜索 | @modelcontextprotocol/server-brave-search |
| Slack | Slack 集成 | @modelcontextprotocol/server-slack |
| Puppeteer | 网页自动化 | @modelcontextprotocol/server-puppeteer |
| Fetch | HTTP 请求 | @modelcontextprotocol/server-fetch |

## 使用场景

### 场景 1：开发工作流

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    }
  }
}
```

**用途**：
- 查看 GitHub Issue
- 读取项目文档
- 代码审查

### 场景 2：数据查询

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

**用途**：
- 查询用户数据
- 分析业务数据
- 验证数据完整性

### 场景 3：信息检索

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**用途**：
- 搜索技术文档
- 查找最新信息
- 研究问题解决方案

## 最佳实践

### 1. 分离敏感信息

```json
// ✅ 好的做法：使用环境变量
{
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"
  }
}

// ❌ 不好的做法：硬编码密钥
{
  "env": {
    "GITHUB_TOKEN": "ghp_真实的令牌"
  }
}
```

### 2. 禁用未使用的服务器

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "${DATABASE_URL}"
      },
      "disabled": true  // 不需要时禁用
    }
  }
}
```

### 3. 添加注释说明

JSON 不支持注释，可以在服务器名称中说明：

```json
{
  "mcpServers": {
    "github-用于代码审查": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "postgres-生产数据库只读": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"]
    }
  }
}
```

### 4. 版本锁定

指定 MCP 服务器版本：

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github@0.5.0"]
  }
}
```

## 故障排查

### 检查 MCP 状态

```bash
claude mcp status
```

### 测试特定服务器

```bash
claude mcp test github
```

### 查看 MCP 日志

```bash
claude mcp logs
```

### 常见问题

**问题 1：服务器启动失败**

原因：命令或参数错误

解决：
```bash
# 手动测试命令
npx -y @modelcontextprotocol/server-github
```

**问题 2：权限不足**

原因：环境变量或 Token 无效

解决：
- 检查环境变量是否设置
- 验证 Token 是否有效
- 确认 Token 有足够权限

**问题 3：网络问题**

原因：无法访问外部服务

解决：
- 检查网络连接
- 配置代理（如需要）
- 使用镜像源

## 注意事项

1. **API 密钥安全**：不要直接写入 `.mcp.json`，使用环境变量
2. **提交到代码库**：`.mcp.json` 应该提交（不包含密钥）
3. **个人配置**：个人密钥使用 `~/.claude.json`
4. **权限最小化**：只授予必要的权限
5. **定期更新**：保持 MCP 服务器最新版本

## 与个人配置的关系

| 配置位置 | 文件 | 用途 | 提交 |
|----------|------|------|------|
| 项目 | `.claude/.mcp.json` | 团队共享的 MCP 服务器 | ✅ |
| 个人 | `~/.claude.json` (personalMcpServers) | 个人 MCP 服务器 | ❌ |
