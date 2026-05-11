# ~/.claude.json 使用说明

## 概述

`~/.claude.json` 是全局配置文件，存储应用状态、OAuth 凭据、UI 设置和个人 MCP 服务器配置。仅在全局范围内有效。

## 文件位置

```
~/.claude.json
```

## 配置结构

```json
{
  "apiKey": "",
  "uiPreferences": {},
  "personalMcpServers": {},
  "recentProjects": [],
  "settings": {}
}
```

## 配置项详解

### 1. apiKey - API 密钥

存储 Anthropic API 密钥。

```json
{
  "apiKey": "sk-ant-xxxxx"
}
```

### 2. uiPreferences - UI 偏好

界面相关设置。

```json
{
  "uiPreferences": {
    "theme": "dark",
    "fontSize": 14,
    "fontFamily": "Monaco",
    "showLineNumbers": true,
    "wordWrap": false
  }
}
```

| 选项 | 类型 | 说明 |
|------|------|------|
| theme | string | 主题：light/dark |
| fontSize | number | 字体大小 |
| fontFamily | string | 字体名称 |
| showLineNumbers | boolean | 显示行号 |
| wordWrap | boolean | 自动换行 |

### 3. personalMcpServers - 个人 MCP 服务器

个人使用的 MCP 服务器配置（不共享给团队）。

```json
{
  "personalMcpServers": {
    "my-github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-personal-token"
      }
    },
    "personal-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "postgresql://localhost/personal"
      }
    }
  }
}
```

### 4. recentProjects - 最近项目

最近打开的项目列表。

```json
{
  "recentProjects": [
    {
      "path": "/Users/user/projects/project-a",
      "lastOpened": "2024-01-15T10:30:00Z"
    },
    {
      "path": "/Users/user/projects/project-b",
      "lastOpened": "2024-01-14T15:45:00Z"
    }
  ]
}
```

### 5. settings - 全局设置

全局默认设置。

```json
{
  "settings": {
    "model": "claude-opus-4-7",
    "permissions": {
      "allowed": ["git status", "git log"]
    }
  }
}
```

### 6. oauth - OAuth 配置

OAuth 认证相关配置。

```json
{
  "oauth": {
    "accessToken": "xxx",
    "refreshToken": "xxx",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

## 完整示例

```json
{
  "apiKey": "sk-ant-api03-xxxxx",
  "uiPreferences": {
    "theme": "dark",
    "fontSize": 14,
    "fontFamily": "JetBrains Mono",
    "showLineNumbers": true,
    "wordWrap": false,
    "minimap": false
  },
  "personalMcpServers": {
    "github-personal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  },
  "recentProjects": [
    {
      "path": "/Users/user/work/main-project",
      "lastOpened": "2024-01-15T10:30:00Z"
    }
  ],
  "settings": {
    "model": "claude-opus-4-7",
    "autoApprove": ["Read"]
  }
}
```

## 配置优先级

```
项目 settings.local.json (最高)
    ↓
项目 settings.json
    ↓
~/.claude.json (settings)
    ↓
全局 settings.json (最低)
```

## 最佳实践

1. **敏感信息**：API 密钥放在这里，不提交到代码库
2. **个人配置**：UI 偏好等个人设置放在这里
3. **个人 MCP**：个人的 MCP 服务器配置放在这里
4. **版本控制**：不要提交这个文件
5. **备份**：定期备份配置文件

## 注意事项

- 该文件不应提交到版本控制
- 包含敏感信息（API 密钥）
- 文件权限应设置为仅用户可读写
- 删除文件会清除所有配置
- 修改后可能需要重启 Claude Code

## 文件权限

```bash
# 设置正确的文件权限
chmod 600 ~/.claude.json
```

## 故障排查

### 配置未生效

```bash
# 检查文件语法
cat ~/.claude.json | jq .

# 检查文件权限
ls -la ~/.claude.json

# 重启 Claude Code
```

### 重置配置

```bash
# 备份当前配置
cp ~/.claude.json ~/.claude.json.backup

# 删除配置（会重新生成）
rm ~/.claude.json
```

## 与其他配置文件的关系

| 文件 | 作用 | 范围 | 提交 |
|------|------|------|------|
| ~/.claude.json | 个人配置 | 全局 | ❌ |
| settings.json | 项目配置 | 项目 | ✅ |
| settings.local.json | 个人覆盖 | 项目 | ❌ |
| keybindings.json | 快捷键 | 全局 | ❌ |
