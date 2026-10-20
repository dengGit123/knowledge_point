# ~/.claude.json 使用说明

> 📚 **官方文档**：[Claude Code Settings](https://code.claude.com/docs/en/settings)

## 什么是 ~/.claude.json

`~/.claude.json` 是 Claude Code 的**全局状态文件**，由 CLI 自动创建和维护，存储登录认证信息、项目记录、用户级 MCP 服务器配置等。

> **通俗理解**：这是 Claude Code 的"工作日志本"——记录你登录了哪个账号、最近打开过哪些项目。它主要由程序自动读写，**一般不需要手动编辑**。

⚠️ **注意区分**：个人偏好设置（模型、主题等）应该放在 `~/.claude/settings.json` 中，而不是这个文件。两者分工见下文。

## 文件位置

```
~/.claude.json
```

`~` 代表用户主目录：
- macOS/Linux: `/Users/你的用户名/.claude.json`
- Windows: `C:\Users\你的用户名\.claude.json`

## 主要内容

```json
{
  "hasCompletedOnboarding": true,
  "oauthAccount": {},
  "projects": {},
  "mcpServers": {},
  "tipsHistory": {}
}
```

### 1. hasCompletedOnboarding - 初始化状态

记录是否完成首次运行的引导流程。

### 2. oauthAccount - 登录账户信息

使用 Claude 账号登录时的账户信息，由登录流程自动写入，无需手动编辑。

### 3. projects - 项目记录

记录每个项目的状态（如各项目的会话历史索引、该项目下完成的引导步骤等），按项目路径作为键。

### 4. mcpServers - 用户级 MCP 服务器

通过 `claude mcp add -s user` 添加的**用户级 MCP 服务器**保存在这里，对你所有项目生效。

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "你的个人令牌"
      }
    }
  }
}
```

**推荐做法**：使用命令添加，不要手改文件：

```bash
# 添加用户级 MCP 服务器（写入 ~/.claude.json）
claude mcp add github -s user -e GITHUB_TOKEN=你的令牌 -- npx -y @modelcontextprotocol/server-github

# 查看已配置的服务器
claude mcp list
```

**与项目 MCP 的区别**：
- `~/.claude.json` 的 `mcpServers`：用户级，所有项目可用，仅本人生效
- 项目根目录 `.mcp.json` 的 `mcpServers`：项目级，团队共享，随代码库提交

详见 [mcp配置使用说明](./mcp配置使用说明.md)。

## 与其他配置文件的关系

| 文件 | 作用范围 | 主要内容 | 是否手动编辑 |
|------|----------|----------|--------------|
| `~/.claude.json` | 全局个人 | 状态数据、用户级 MCP | ⚠️ 尽量不 |
| `~/.claude/settings.json` | 全局个人 | 个人偏好、权限、hooks | ✅ 可以 |
| `项目/.claude/settings.json` | 项目共享 | 项目权限、hooks | ✅ 可以 |
| `项目/.claude/settings.local.json` | 项目个人 | 个人项目覆盖 | ✅ 可以 |
| `项目根目录/.mcp.json` | 项目共享 | 团队 MCP 服务器 | ✅ 可以 |

## 最佳实践

### 1. 不要把 ~/.claude.json 提交到代码库

该文件包含登录凭据和个人数据，永远不要提交或分享。

### 2. 个人偏好写进 settings.json

想自定义模型、主题、hooks 等设置时，编辑 `~/.claude/settings.json`：

```json
{
  "model": "opus",
  "permissions": {
    "allow": ["Bash(git status)"]
  }
}
```

### 3. 定期备份（可选）

```bash
# 备份状态文件（注意：包含凭据，妥善保管）
cp ~/.claude.json ~/.claude.json.backup
```

### 4. 多机器迁移

在新机器上重新登录即可，大部分状态会自动恢复；用户级 MCP 服务器需要重新用 `claude mcp add -s user` 添加：

```bash
# 旧机器上导出用户级 MCP 配置供参考
claude mcp list

# 新机器上重新添加
claude mcp add github -s user -e GITHUB_TOKEN=你的令牌 -- npx -y @modelcontextprotocol/server-github
```

## 故障排查

### 配置文件损坏

如果 JSON 格式损坏，Claude Code 可能无法启动：

```bash
# 1. 检查 JSON 语法是否有效
jq . ~/.claude.json > /dev/null && echo "JSON 有效"

# 2. 备份后删除，重新运行会引导重新初始化
cp ~/.claude.json ~/.claude.json.backup
rm ~/.claude.json
claude
```

### 检查文件权限

该文件包含凭据，建议限制为仅本人可读写：

```bash
chmod 600 ~/.claude.json
```

## 常见问题

### Q：~/.claude.json 和 ~/.claude/settings.json 有什么区别？

**A**：`~/.claude.json` 是 CLI 自动管理的**状态文件**（登录信息、项目记录），一般不需要手动编辑；`~/.claude/settings.json` 是**设置文件**（模型、权限、hooks），按需手动配置。

### Q：可以手动编辑 ~/.claude.json 吗？

**A**：不推荐。CLI 会频繁重写这个文件，手动修改容易被覆盖。用户级 MCP 用 `claude mcp add -s user` 添加，个人偏好写进 `~/.claude/settings.json`。

### Q：配置文件应该提交到代码库吗？

**A**：`~/.claude.json` 绝对不提交（含登录凭据）。`~/.claude/settings.json` 是个人配置，一般也不提交。

### Q：误删了 ~/.claude.json 会怎样？

**A**：重新运行 `claude` 会引导重新登录和初始化，历史对话记录仍保留在 `~/.claude/projects/` 中，不会丢失。
