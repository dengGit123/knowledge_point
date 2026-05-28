# ~/.claude.json 使用说明

## 什么是 ~/.claude.json

`~/.claude.json` 是**全局配置文件**，存储你的个人设置、API 密钥、UI 偏好和个人 MCP 服务器配置。这个文件只在你自己的电脑上生效。

> **通俗理解**：就像你的"个人设置档案"，记录了你使用 Claude Code 的各种偏好设置，比如用什么主题、字体多大、哪些命令可以直接执行等。

## 文件位置

```
~/.claude.json
```

`~` 代表用户主目录：
- macOS/Linux: `/Users/你的用户名/.claude.json`
- Windows: `C:\Users\你的用户名\.claude.json`

## 配置层级关系

Claude Code 的配置有多层，优先级从高到低：

```
项目 settings.local.json     (最高优先级，个人本地配置)
        ↓
项目 settings.json           (项目共享配置)
        ↓
~/.claude.json (settings)    (个人全局配置)
        ↓
全局 settings.json           (默认配置，最低优先级)
```

> **通俗理解**：就像公司的规章制度——全局配置是公司基本规定，项目配置是部门规定，本地配置是你的个人安排。

## 配置结构

```json
{
  "apiKey": "",
  "uiPreferences": {},
  "personalMcpServers": {},
  "recentProjects": [],
  "settings": {},
  "oauth": {}
}
```

## 配置项详解

### 1. apiKey - API 密钥

存储你的 Anthropic API 密钥。

```json
{
  "apiKey": "sk-ant-api03-xxxxx"
}
```

**注意事项**：
- ⚠️ 敏感信息，不要分享或提交到代码库
- ⚠️ 文件权限应该设置为只有你能读写
- ⚠️ 定期更换密钥以保证安全

**设置文件权限**（macOS/Linux）：
```bash
chmod 600 ~/.claude.json
```

### 2. uiPreferences - UI 偏好

界面外观和行为相关设置。

```json
{
  "uiPreferences": {
    "theme": "dark",           // 主题：light 或 dark
    "fontSize": 14,            // 字体大小
    "fontFamily": "Monaco",    // 字体名称
    "showLineNumbers": true,   // 显示行号
    "wordWrap": false,         // 自动换行
    "minimap": false,          // 显示代码缩略图
    "tabSize": 2               // Tab 宽度
  }
}
```

**可用选项**：

| 选项 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| theme | string | 主题 | light, dark |
| fontSize | number | 字体大小 | 12-24 |
| fontFamily | string | 字体名称 | Monaco, Menlo, Consolas 等 |
| showLineNumbers | boolean | 显示行号 | true, false |
| wordWrap | boolean | 自动换行 | true, false |
| minimap | boolean | 代码缩略图 | true, false |
| tabSize | number | Tab 宽度 | 2, 4 |

### 3. personalMcpServers - 个人 MCP 服务器

个人使用的 MCP 服务器配置，不与团队共享。

```json
{
  "personalMcpServers": {
    "github-personal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "你的个人令牌"
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

**使用场景**：
- 连接个人的 GitHub 账号
- 访问本地的个人数据库
- 使用个人的 API 服务

**与项目 MCP 的区别**：
- `personalMcpServers`：个人配置，存在 `~/.claude.json`
- `mcpServers`（项目）：团队配置，存在 `.claude/.mcp.json`

### 4. recentProjects - 最近项目

记录最近打开的项目列表。

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

**用途**：
- 快速访问最近的项目
- 按时间排序项目列表
- 这个列表通常自动管理，无需手动编辑

### 5. settings - 全局设置

全局默认的设置，会应用到所有项目。

```json
{
  "settings": {
    "model": "claude-opus-4-7",      // 默认使用的模型
    "permissions": {                   // 权限设置
      "allowed": ["git status", "git log"]
    },
    "autoApprove": ["Read"],          // 自动批准的操作
    "worktree": {
      "baseRef": "main"               // worktree 基础分支
    }
  }
}
```

**可用模型**：
- `claude-opus-4-7` - 最强模型，适合复杂任务
- `claude-sonnet-4-6` - 平衡模型，适合日常任务
- `claude-haiku-4-5` - 快速模型，适合简单任务

### 6. oauth - OAuth 认证

OAuth 认证相关配置（通常自动管理）。

```json
{
  "oauth": {
    "accessToken": "xxx",
    "refreshToken": "xxx",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

**说明**：这部分通常由系统自动管理，无需手动编辑。

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
    "minimap": false,
    "tabSize": 2
  },

  "personalMcpServers": {
    "github-personal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
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
    "permissions": {
      "allowed": [
        "npm install *",
        "npm test",
        "git status",
        "git diff",
        "git log"
      ],
      "blocked": [
        "rm -rf *",
        "git push --force"
      ]
    },
    "autoApprove": ["Read"],
    "worktree": {
      "baseRef": "origin/main"
    }
  }
}
```

## 与其他配置文件的关系

| 文件 | 作用范围 | 主要内容 | 是否提交 |
|------|----------|----------|----------|
| `~/.claude.json` | 全局个人 | API 密钥、UI 偏好、个人 MCP | ❌ 不提交 |
| `~/.claude/settings.json` | 全局共享 | 全局默认设置 | ✅ 可提交 |
| `项目/.claude/settings.json` | 项目共享 | 项目特定设置 | ✅ 应提交 |
| `项目/.claude/settings.local.json` | 项目个人 | 个人项目覆盖 | ❌ 不提交 |
| `项目/.claude/.mcp.json` | 项目共享 | 团队 MCP 服务器 | ✅ 应提交 |

## 最佳实践

### 1. 敏感信息保护

```json
// ✅ 好的做法：使用环境变量
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "personalMcpServers": {
    "github": {
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}

// ❌ 不好的做法：硬编码密钥
{
  "apiKey": "sk-ant-api03-真实的密钥",
  "personalMcpServers": {
    "github": {
      "env": {
        "GITHUB_TOKEN": "ghp_真实的令牌"
      }
    }
  }
}
```

### 2. 个人配置与团队配置分离

```bash
# 个人配置放在 ~/.claude.json
~/.claude.json
  ├── apiKey          # 个人 API 密钥
  ├── uiPreferences   # 个人 UI 偏好
  └── personalMcpServers  # 个人 MCP 服务器

# 团队配置放在项目目录
项目/.claude/.mcp.json
  └── mcpServers      # 团队共享的 MCP 服务器
```

### 3. 定期备份

```bash
# 备份配置
cp ~/.claude.json ~/.claude.json.backup

# 或使用版本控制（但不提交密钥）
git init ~/.claude-backup
cd ~/.claude-backup
echo '*' > .gitignore
echo '!.claude.json.template' >> .gitignore
# 创建模板文件（去掉密钥）
cp ~/.claude.json .claude.json.template
# 编辑模板文件，移除敏感信息
```

### 4. 多机器同步

如果你在多台机器上使用 Claude Code：

```bash
# 方法 1：使用 dotfiles 管理
git clone https://github.com/你的用户名/dotfiles.git ~/dotfiles
ln -s ~/dotfiles/claude.json ~/.claude.json

# 方法 2：使用同步工具（如 Dropbox）
ln -s ~/Dropbox/claude.json ~/.claude.json
```

## 故障排查

### 配置未生效

```bash
# 1. 检查文件语法
cat ~/.claude.json | jq .

# 2. 检查文件权限
ls -la ~/.claude.json

# 3. 重启 Claude Code
```

### 语法错误

如果 JSON 格式有错误，配置无法加载：

```bash
# 验证 JSON 语法
jq < ~/.claude.json

# 或使用在线工具
# https://jsonlint.com/
```

### 重置配置

如果配置出现问题需要重置：

```bash
# 1. 备份当前配置
cp ~/.claude.json ~/.claude.json.backup

# 2. 删除配置文件（会重新生成默认配置）
rm ~/.claude.json

# 3. 重新运行 Claude Code，会引导重新配置
claude
```

### 迁移到新机器

```bash
# 1. 复制配置文件
scp 旧机器:~/.claude.json ~/.claude.json

# 2. 更新路径相关的配置（如果有的话）

# 3. 设置正确的权限
chmod 600 ~/.claude.json
```

## 常见问题

### Q：配置修改后需要重启吗？

**A**：大部分配置修改需要重启 Claude Code 才能生效。UI 偏好可能即时生效。

### Q：可以同时有多个配置文件吗？

**A**：可以。配置会按优先级合并，优先级高的会覆盖优先级低的。

### Q：如何知道当前生效的配置？

**A**：可以在 Claude Code 中使用 `/config` 命令查看当前配置。

### Q：配置文件应该提交到代码库吗？

**A**：`~/.claude.json` 不应该提交，因为包含敏感信息。但可以提交一个模板文件（去掉密钥）。

### Q：环境变量如何使用？

**A**：使用 `${变量名}` 格式，系统会自动从环境变量中读取值：

```json
{
  "apiKey": "${ANTHROPIC_API_KEY}"
}
```
