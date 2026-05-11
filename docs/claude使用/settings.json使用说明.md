# settings.json 使用说明

## 概述

`settings.json` 是 Claude Code 的核心配置文件，控制权限设置、自动化 hooks、环境变量等。

## 文件位置

| 级别 | 位置 | 优先级 |
|------|------|--------|
| 全局 | `~/.claude/settings.json` | 默认 |
| 用户 | `~/.claude/settings.user.json` | 覆盖全局 |
| 项目 | `<项目>/.claude/settings.json` | 覆盖用户 |
| 项目本地 | `<项目>/.claude/settings.local.json` | 最高（不提交） |

## 配置结构

```json
{
  "permissions": {},
  "hooks": {},
  "env": {},
  "model": "",
  "autoApprove": []
}
```

## 配置项详解

### 1. permissions - 权限设置

控制哪些 Bash 命令可以自动执行，无需用户确认。

```json
{
  "permissions": {
    "allowed": [
      "npm install *",
      "npm test",
      "npm run build",
      "git status",
      "git diff",
      "git log"
    ],
    "blocked": [
      "rm -rf",
      "git push --force"
    ]
  }
}
```

**通配符支持**：
- `*` 匹配任意字符
- `npm install *` 允许所有 npm install 命令

### 2. hooks - 自动化钩子

在特定事件时自动执行的命令。

```json
{
  "hooks": {
    "preTool": {
      "Bash": "echo '执行命令: %cmd%'"
    },
    "postTool": {
      "Bash": "echo '命令完成'"
    },
    "preResponse": "echo '准备响应'",
    "postResponse": "echo '响应完成'"
  }
}
```

**可用钩子**：
| 钩子 | 触发时机 | 可用变量 |
|------|----------|----------|
| preTool | 工具调用前 | `%cmd%`, `%tool%` |
| postTool | 工具调用后 | `%cmd%`, `%tool%`, `%result%` |
| preResponse | 响应前 | - |
| postResponse | 响应后 | - |

### 3. env - 环境变量

为会话设置环境变量。

```json
{
  "env": {
    "NODE_ENV": "development",
    "API_BASE_URL": "http://localhost:3000",
    "DEBUG": "true"
  }
}
```

### 4. model - 模型选择

指定默认使用的 Claude 模型。

```json
{
  "model": "claude-opus-4-7"
}
```

**可用模型**：
- `claude-opus-4-7` - 最强模型
- `claude-sonnet-4-6` - 平衡模型
- `claude-haiku-4-5` - 快速模型

### 5. autoApprove - 自动批准

自动批准某些操作类型。

```json
{
  "autoApprove": [
    "Read",
    "Edit",
    "Write"
  ]
}
```

**可用工具**：
- `Read` - 读取文件
- `Write` - 写入文件
- `Edit` - 编辑文件
- `Bash` - 执行命令
- `Agent` - 调用代理

### 6. 其他配置

```json
{
  "worktree": {
    "baseRef": "fresh"
  },
  "maxTurns": 100,
  "timeout": 120000
}
```

## 完整示例

```json
{
  "model": "claude-opus-4-7",
  "permissions": {
    "allowed": [
      "npm *",
      "git status",
      "git diff",
      "git log",
      "go test *",
      "go build *"
    ],
    "blocked": [
      "rm -rf *",
      "git push --force",
      "docker rm *"
    ]
  },
  "hooks": {
    "preTool": {
      "Bash": "echo '[%date%] %cmd%' >> .claude/command.log"
    }
  },
  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug"
  },
  "autoApprove": ["Read"],
  "worktree": {
    "baseRef": "origin/main"
  }
}
```

## 最佳实践

1. **最小权限原则**：只允许必要的命令
2. **使用本地配置**：敏感信息放在 `settings.local.json`
3. **合理使用通配符**：避免过于宽松的权限
4. **记录自动化命令**：用 hooks 记录操作日志

## 注意事项

- `settings.local.json` 应该加入 `.gitignore`
- 权限配置支持模式匹配，要注意精确性
- hooks 中的命令必须快速执行，否则影响体验
- 环境变量不要存储敏感信息（使用密钥管理）
