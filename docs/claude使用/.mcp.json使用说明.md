# .mcp.json 使用说明

## 概述

`.mcp.json` 用于配置团队共享的 MCP（Model Context Protocol）服务器，让 Claude Code 能够访问外部工具和数据源。

## 文件位置

```
项目/.claude/.mcp.json
```

## 作用

- 连接外部 MCP 服务器
- 扩展 Claude Code 的能力
- 团队共享配置，统一开发体验

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

## 常用 MCP 服务器

### 1. 文件系统服务器

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed"]
    }
  }
}
```

### 2. GitHub 服务器

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token-here"
      }
    }
  }
}
```

### 3. 数据库服务器

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "postgresql://..."
      }
    }
  }
}
```

### 4. Web 搜索服务器

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 5. Slack 服务器

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_TOKEN": "xoxb-...",
        "SLACK_CHANNELS": "general,dev-team"
      }
    }
  }
}
```

## 环境变量处理

### 使用 .env 文件

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

### 使用全局配置

敏感信息应放在 `~/.claude.json` 的个人 MCP 配置中：

```json
{
  "personalMcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
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

## 最佳实践

1. **分离敏感信息**：使用环境变量
2. **禁用未使用的服务器**：设置 `disabled: true`
3. **文档化配置**：注释说明每个服务器的用途
4. **版本锁定**：指定 MCP 服务器版本

## 注意事项

- API 密钥不要直接写入文件
- .mcp.json 会被提交到代码库
- 个人配置使用 `~/.claude.json`
- 服务器启动失败会显示错误信息
- 确保 MCP 服务器已安装

## 故障排查

```bash
# 检查 MCP 服务器是否正常运行
claude mcp status

# 测试特定服务器
claude mcp test <server-name>

# 查看 MCP 日志
claude mcp logs
```
