# settings.json 使用说明

> 📚 **官方文档**：[Claude Code Settings](https://code.claude.com/docs/en/settings)

## 什么是 settings.json

`settings.json` 是**Claude Code 的核心配置文件**，控制权限设置、自动化 hooks、环境变量等项目级配置。

> **通俗理解**：就像项目的"操作手册"，规定在这个项目中可以使用哪些命令、执行前/后要做什么、有哪些环境变量等。

## 文件位置与优先级

| 级别 | 位置 | 优先级 | 是否提交 |
|------|------|--------|----------|
| 企业策略 | 系统级 managed-settings.json | 最高 | — |
| 命令行参数 | `claude --settings <file>` | 高 | — |
| 项目本地 | `<项目>/.claude/settings.local.json` | 高 | ❌ 不提交 |
| 项目共享 | `<项目>/.claude/settings.json` | 中 | ✅ 应提交 |
| 用户全局 | `~/.claude/settings.json` | 低 | ❌ 不提交 |

优先级从高到低依次覆盖，级别高的配置覆盖级别低的同名配置。

> **通俗理解**：就像公司的规章制度——总部有基本规定（用户全局），分公司有补充规定（项目共享），个人岗位有自己的安排（项目本地）。越具体的越优先。

## 配置结构

```json
{
  "model": "opus",
  "permissions": {},
  "hooks": {},
  "env": {},
  "outputStyle": "default"
}
```

## 配置项详解

### 1. permissions - 权限设置

控制哪些工具调用可以自动执行、哪些需要询问、哪些直接拒绝。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Bash(git diff:*)",
      "Read(./src/**)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

**规则格式**：`工具名(限定范围)`

| 写法 | 含义 |
|------|------|
| `Bash(npm run test)` | 精确匹配该命令 |
| `Bash(npm run test:*)` | 匹配 `npm run test` 开头的命令（`:*` 表示前缀匹配） |
| `Read(./.env.*)` | 匹配读取 .env 开头的文件 |
| `WebFetch(domain:example.com)` | 允许访问指定域名 |

**三个列表的行为**：

- `allow`：自动允许，无需确认
- `ask`：每次执行前询问用户
- `deny`：直接拒绝，即使同时匹配 allow 也以 deny 为准

### 2. hooks - 自动化钩子

在特定事件发生时自动执行 shell 命令。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[$(date '+%H:%M:%S')] 执行 Bash 命令\" >> .claude/activity.log"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "npx prettier --write $CLAUDE_FILE_PATHS" }
        ]
      }
    ]
  }
}
```

**可用事件**：

| 事件 | 触发时机 |
|------|----------|
| PreToolUse | 工具调用前（可通过退出码 2 阻止执行） |
| PostToolUse | 工具调用成功后 |
| UserPromptSubmit | 用户提交提示词时 |
| Notification | Claude 发送通知时 |
| Stop | 主代理完成响应时 |
| SessionStart / SessionEnd | 会话开始 / 结束时 |

**结构说明**：

- 每个事件下是匹配器数组，`matcher` 用正则匹配工具名（如 `"Bash"`、`"Edit|Write"`），留空匹配所有工具
- `hooks` 数组中的每项为 `{ "type": "command", "command": "..." }`
- 事件详情通过 **stdin 以 JSON** 传给命令（如 `tool_name`、`tool_input` 等），而不是字符串替换变量
- PreToolUse 中命令以退出码 `2` 退出可阻止该工具调用，stderr 内容会反馈给 Claude

**使用场景**：
- 记录执行历史
- 编辑后自动格式化
- 提交前自动检查
- 发送通知

### 3. env - 环境变量

为每个会话设置环境变量。

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

指定默认使用的 Claude 模型，可使用模型 ID 或别名。

```json
{
  "model": "opus"
}
```

**常用别名**：
- `opus` - 最强模型，适合复杂任务
- `sonnet` - 平衡模型，适合日常任务
- `haiku` - 快速模型，适合简单任务

### 5. 其他常用配置

```json
{
  "outputStyle": "default",           // 输出风格（见 output-styles 文档）
  "includeCoAuthoredBy": false,       // 提交信息中是否包含 Co-Authored-By
  "cleanupPeriodDays": 30,            // 本地聊天记录保留天数
  "statusLine": {                     // 状态栏脚本
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

## 完整示例

```json
{
  "model": "sonnet",

  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Bash(npm run build)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)",
      "Read(./.env.*)"
    ]
  },

  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[$(date '+%Y-%m-%d %H:%M:%S')] bash\" >> .claude/activity.log"
          }
        ]
      }
    ]
  },

  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug",
    "API_BASE_URL": "http://localhost:3000"
  }
}
```

## 常见配置场景

### 场景 1：前端项目

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run dev)",
      "Bash(npm run lint)",
      "Bash(npx vitest:*)",
      "Bash(git status)",
      "Bash(git diff:*)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 场景 2：安全优先

```json
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": [
      "Bash(rm:*)",
      "Bash(git push --force:*)",
      "Read(./.env.*)",
      "Read(./**/*secret*)"
    ]
  }
}
```

## 最佳实践

### 1. 最小权限原则

只允许必要的命令，规则要具体：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test)",     // ✅ 具体
      "Bash(npm run build)"     // ✅ 具体
    ],
    "deny": [
      "Bash(rm -rf:*)"          // ✅ 阻止危险操作
    ]
  }
}
```

避免 `"Bash(*)"` 这类全量放行。

### 2. 使用本地配置存放敏感信息

敏感信息放在 `settings.local.json` 并加入 `.gitignore`（Claude Code 默认会自动生成该忽略规则）：

```json
// settings.local.json
{
  "env": {
    "API_KEY": "本地开发密钥",
    "DATABASE_URL": "postgresql://localhost/dev"
  }
}
```

### 3. 记录自动化命令

用 hooks 记录操作日志：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/log-command.js"
          }
        ]
      }
    ]
  }
}
```

### 4. 保持 hooks 轻量

hooks 命令在每次匹配的事件上都会执行，必须快速返回，否则会拖慢交互体验。

## 配置优先级示例

```
用户全局: ~/.claude/settings.json
  { "permissions": { "allow": ["Bash(git status)"] } }
        ↓ 覆盖
项目共享: .claude/settings.json
  { "permissions": { "allow": ["Bash(npm run test)"] } }
        ↓ 覆盖
项目本地: .claude/settings.local.json
  { "permissions": { "allow": ["Bash(npm run dev)"] } }
        ↓
最终生效: 三条 allow 规则合并生效（列表类配置合并，标量类配置覆盖）
```

## 注意事项

1. **本地配置不提交**：`settings.local.json` 应该加入 `.gitignore`
2. **权限精确性**：权限配置要精确，避免过于宽松
3. **hooks 性能**：hooks 命令必须快速执行，否则影响体验
4. **环境变量安全**：敏感环境变量不要写在共享配置中
5. **修改后生效**：大部分配置修改需要重启 Claude Code 或新开会话

## 与其他配置的关系

| 文件 | 作用 | 关系 |
|------|------|------|
| [CLAUDE.md](./CLAUDE文件使用说明.md) | 项目规则 | 与 settings 配合使用 |
| [.mcp.json](./mcp配置使用说明.md) | MCP 服务器 | 独立配置 |
| [~/.claude.json](./claude配置使用说明.md) | CLI 状态文件 | 自动管理，勿手动编辑 |

## 常见问题

### Q：配置修改后需要重启吗？

**A**：大部分配置修改需要重启 Claude Code 或新开会话才能生效。

### Q：如何查看当前生效的配置？

**A**：使用 `/config` 命令查看当前配置。

### Q：allow 和 deny 的优先级？

**A**：deny 优先级更高，即使命令同时匹配 allow 也会被拒绝。

### Q：permissions 里可以写环境变量引用吗？

**A**：`env` 中的值是直接设置的环境变量；hooks 命令本身由 shell 执行，可以正常使用 `$环境变量`。
