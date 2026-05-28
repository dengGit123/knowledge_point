# settings.json 使用说明

## 什么是 settings.json

`settings.json` 是**Claude Code 的核心配置文件**，控制权限设置、自动化 hooks、环境变量等项目级配置。

> **通俗理解**：就像项目的"操作手册"，规定在这个项目中可以使用哪些命令、执行前/后要做什么、有哪些环境变量等。

## 文件位置与优先级

| 级别 | 位置 | 优先级 | 是否提交 |
|------|------|--------|----------|
| 全局 | `~/.claude/settings.json` | 默认 | ✅ |
| 用户 | `~/.claude/settings.user.json` | 覆盖全局 | ❌ |
| 项目 | `<项目>/.claude/settings.json` | 覆盖用户 | ✅ |
| 项目本地 | `<项目>/.claude/settings.local.json` | 最高 | ❌ |

> **通俗理解**：就像公司的规章制度——总部有基本规定，分公司有补充规定，个人岗位有自己的安排。

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
      "rm -rf *",
      "git push --force",
      "docker rm *"
    ]
  }
}
```

**allowed（允许列表）**：
- 支持通配符 `*` 匹配任意字符
- `npm install *` 允许所有 npm install 命令
- `git status` 允许查看 git 状态

**blocked（阻止列表）**：
- 即使匹配 allowed，也会被阻止
- 用于防止危险操作

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

**使用场景**：
- 记录执行历史
- 发送通知
- 验证状态

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

**用途**：
- 设置运行环境
- 配置 API 地址
- 开启调试模式

### 4. model - 模型选择

指定默认使用的 Claude 模型。

```json
{
  "model": "claude-opus-4-7"
}
```

**可用模型**：
- `claude-opus-4-7` - 最强模型，适合复杂任务
- `claude-sonnet-4-6` - 平衡模型，适合日常任务
- `claude-haiku-4-5` - 快速模型，适合简单任务

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
    "baseRef": "main"
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
      "yarn *",
      "pnpm *",
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
      "Bash": "echo '[$(date)] %cmd%' >> .claude/command.log"
    }
  },

  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug",
    "API_BASE_URL": "http://localhost:3000"
  },

  "autoApprove": ["Read"],

  "worktree": {
    "baseRef": "origin/main"
  },

  "maxTurns": 50,
  "timeout": 180000
}
```

## 常见配置场景

### 场景 1：前端项目

```json
{
  "permissions": {
    "allowed": [
      "npm *",
      "npx *",
      "git status",
      "git diff"
    ]
  },
  "env": {
    "NODE_ENV": "development",
    "VITE_PORT": "3000"
  }
}
```

### 场景 2：后端项目

```json
{
  "permissions": {
    "allowed": [
      "python *",
      "pip *",
      "pytest *",
      "python manage.py *"
    ]
  },
  "env": {
    "DJANGO_SETTINGS_MODULE": "myproject.settings",
    "DATABASE_URL": "${DATABASE_URL}"
  }
}
```

### 场景 3：Go 项目

```json
{
  "permissions": {
    "allowed": [
      "go *",
      "git *"
    ]
  },
  "env": {
    "GO_ENV": "development"
  }
}
```

### 场景 4：安全优先

```json
{
  "permissions": {
    "allowed": [
      "git status",
      "git diff",
      "git log"
    ]
  },
  "autoApprove": ["Read"],
  "blocked": [
    "rm *",
    "git push --force",
    "* drop",
    "* delete"
  ]
}
```

## 最佳实践

### 1. 最小权限原则

只允许必要的命令：

```json
{
  "permissions": {
    "allowed": [
      "npm test",       // ✅ 具体
      "npm run build"   // ✅ 具体
    ],
    "blocked": [
      "npm *",          // ❌ 太宽松
      "rm -rf *"       // ✅ 阻止危险操作
    ]
  }
}
```

### 2. 使用本地配置

敏感信息放在 `settings.local.json`：

```bash
# .gitignore
.claude/settings.local.json
```

```json
// settings.local.json
{
  "env": {
    "API_KEY": "${API_KEY}",
    "DATABASE_URL": "${DATABASE_URL}"
  }
}
```

### 3. 合理使用通配符

避免过于宽松的权限：

```json
{
  "permissions": {
    "allowed": [
      "npm install *",     // ✅ 合理
      "npm test",          // ✅ 具体
      "npm run dev:*"      // ✅ 范围有限
    ],
    "blocked": [
      "npm *",            // ❌ 太宽松
      "rm *"              // ❌ 危险
    ]
  }
}
```

### 4. 记录自动化命令

用 hooks 记录操作日志：

```json
{
  "hooks": {
    "preTool": {
      "Bash": "echo \"[$(date '+%Y-%m-%d %H:%M:%S')] %tool%: %cmd%\" >> .claude/activity.log"
    }
  }
}
```

## 配置优先级示例

```
全局: ~/.claude/settings.json
  { "permissions": { "allowed": ["git status"] } }
        ↓
用户: ~/.claude/settings.user.json
  { "permissions": { "allowed": ["git *"] } }
        ↓
项目: .claude/settings.json
  { "permissions": { "allowed": ["npm *"] } }
        ↓
本地: .claude/settings.local.json
  { "permissions": { "allowed": ["npm test"] } }
        ↓
最终生效: allowed = ["npm test"]
```

## 注意事项

1. **本地配置不提交**：`settings.local.json` 应该加入 `.gitignore`
2. **权限精确性**：权限配置要精确，避免过于宽松
3. **hooks 性能**：hooks 命令必须快速执行，否则影响体验
4. **环境变量安全**：敏感环境变量不要存储在配置中

## 与其他配置的关系

| 文件 | 作用 | 关系 |
|------|------|------|
| `CLAUDE.md` | 项目规则 | 与 settings 配合使用 |
| `.mcp.json` | MCP 服务器 | 独立配置 |
| `~/.claude.json` | 个人配置 | 优先级低于项目配置 |

## 常见问题

### Q：配置修改后需要重启吗？

**A**：大部分配置修改需要重启 Claude Code 才能生效。

### Q：如何查看当前生效的配置？

**A**：使用 `/config` 命令查看当前配置。

### Q：allowed 和 blocked 的优先级？

**A**：blocked 优先级更高，即使命令匹配 allowed 也会被阻止。

### Q：环境变量可以使用 shell 变量吗？

**A**：可以使用 `${变量名}` 格式引用环境变量。
