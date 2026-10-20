# .worktreeinclude 使用说明

> 📚 **官方文档**：[Common Workflows - Git worktrees](https://code.claude.com/docs/en/common-workflows#using-git-worktrees-in-parallel-sessions)

## 什么是 .worktreeinclude

`.worktreeinclude` 文件用于指定在创建新的 **git worktree** 时需要复制的文件列表，这些文件通常已加入 `.gitignore`。

> **通俗理解**：就像给项目准备"搬家清单"。当你创建一个新的 worktree（分支工作区）时，git 只会检出版本控制的文件，但有些本地配置文件（如 `.env.local`、IDE 设置）也需要复制过去，这个文件就是告诉 Claude 哪些文件需要"搬家"。

## 文件位置

```
项目/.claude/.worktreeinclude
```

## 什么是 Git Worktree

Git worktree 允许你在同一个仓库中同时检出多个分支到不同目录。

> **通俗理解**：就像给同一个项目开多个"分身"，每个分身可以在不同分支上独立工作，不需要来回切换分支。

```bash
# 创建新的 worktree
git worktree add ../feature-branch feature/新功能

# 目录结构
project-main/      # main 分支
project-feature/   # feature/新功能 分支
```

这个特性常与 Claude Code 的并行会话配合：每个 worktree 里开一个 Claude Code 会话，多条任务互不干扰地同时进行。

## 为什么需要 .worktreeinclude

### 问题场景

使用 worktree 时遇到的问题：
1. `.env.local` 等本地配置文件被 gitignore，不会自动复制
2. IDE 配置文件（如 `.vscode/settings.json`）需要手动复制
3. 缓存目录需要在每个 worktree 中独立存在

### 解决方案

通过 `.worktreeinclude` 文件：
- 指定需要复制到新 worktree 的文件
- 确保每个 worktree 有正确的配置
- 自动化 worktree 设置过程

## 文件格式

### 基本格式

每行一个文件路径，使用相对于项目根目录的路径：

```
# Claude 配置
.claude/settings.local.json

# 环境配置
.env.local
.env.development

# IDE 配置
.vscode/settings.json
```

### 格式规则

| 规则 | 说明 |
|------|------|
| `#` 开头 | 注释行，会被忽略 |
| 空行 | 被忽略 |
| 相对路径 | 相对于项目根目录 |
| 支持通配符 | 使用 `*`、`**` 匹配多个文件 |
| 目录路径 | 以 `/` 结尾表示目录 |

## 工作流程

### 创建 Worktree 的过程

```
1. 执行 git worktree add
   ↓
2. Git 检出版本控制的文件
   ↓
3. Claude 读取 .worktreeinclude
   ↓
4. 复制列出的文件到新 worktree
   ↓
5. 应用配置和环境，开始工作
```

### 示例流程

```bash
# 1. 确认清单内容
cat .claude/.worktreeinclude

# 2. 创建新 worktree
git worktree add ../my-feature origin/feature/my-feature

# 3. 进入新目录
cd ../my-feature

# 4. 清单中的文件已复制
# - .env.local ✓
# - .claude/settings.local.json ✓
# - .vscode/settings.json ✓

# 5. 安装依赖后开始工作
npm install
npm run dev
```

### 清理 Worktree

```bash
# 1. 退出 worktree
cd ../main-project

# 2. 删除 worktree
git worktree remove ../my-feature

# 3. 清理失效的 worktree 记录
git worktree prune
```

## 使用场景

### 1. 本地配置文件

开发环境相关的配置文件：

```
# Claude 本地配置
.claude/settings.local.json

# 环境变量
.env.local
.env.development

# 应用配置
config.local.json
config/development.yaml
```

### 2. IDE 配置

编辑器和 IDE 的配置文件：

```
# VS Code
.vscode/settings.json
.vscode/tasks.json

# JetBrains IDEs
.idea/workspace.xml
.idea/inspectionProfiles/

# Emacs
.dir-locals.el
```

### 3. 构建缓存

需要独立存在的缓存目录：

```
# Vite
node_modules/.vite/

# Webpack
node_modules/.cache/

# 通用
.cache/
```

### 4. 数据和日志

开发和调试相关的文件：

```
# 数据库
data/*.db
data/*.sqlite

# 日志
logs/
*.log
```

## 完整示例

### 前端项目

```
# Claude 配置
.claude/settings.local.json

# 开发环境
.env.local
.env.development

# 构建缓存
node_modules/.cache/

# IDE 配置
.vscode/settings.json
.vscode/extensions.json
```

### 全栈项目

```
# ============================
# 根目录配置
# ============================
.claude/settings.local.json
.env.local

# ============================
# 前端配置
# ============================
frontend/.env.local
frontend/node_modules/.cache/
frontend/.vscode/settings.json

# ============================
# 后端配置
# ============================
backend/.env.local
backend/data/
backend/logs/

# ============================
# 共享配置
# ============================
docker-compose.override.yml
```

## 最佳实践

### 1. 只包含必要文件

避免复制不必要的文件，只复制真正需要的：

```
✅ 好的做法
.claude/settings.local.json
.env.local

❌ 不好的做法
node_modules/          # 太大，应该重新安装
dist/                  # 构建产物，应该重新构建
*.log                  # 临时文件，不需要复制
```

### 2. 使用注释分组

用 `#` 添加说明，按类型分组配置文件：

```
# ============================
# Claude 配置
# ============================
.claude/settings.local.json

# ============================
# 环境变量
# ============================
.env.local
.env.development

# ============================
# IDE 配置
# ============================
.vscode/settings.json
```

### 3. 定期清理

删除不再需要的条目，保持文件简洁。

### 4. 文件本身应提交到代码库

`.worktreeinclude` 列表本身不含敏感内容，提交后团队成员都能使用相同的 worktree 配置。

### 5. 敏感文件额外保护

如果包含敏感文件，确保安全：

```
# 生产环境密钥 - 谨慎复制
.env.production

# 数据库备份 - 可能很大
backups/*.sql
```

## 与 .gitignore 的关系

### 对应关系

```bash
# .gitignore - 告诉 git 忽略这些文件
.claude/settings.local.json
.env.local
.vscode/settings.json

# .worktreeinclude - 告诉 Claude 复制这些文件
.claude/settings.local.json
.env.local
.vscode/settings.json
```

两个列表通常高度重合——`.worktreeinclude` 中的文件，多数正是被 `.gitignore` 忽略的文件。

> **通俗理解**：
> - `.gitignore` 说："不要把这些文件放进仓库"
> - `.worktreeinclude` 说："但创建 worktree 时要把它们复制过去"

## 注意事项

1. **文件路径是相对于项目根目录**：使用正确的相对路径
2. **不存在的文件会被忽略**：列出的文件如果不存在不会报错
3. **使用通配符要小心**：避免匹配过多文件
4. **敏感文件需要额外保护**：确保不会意外提交或泄露敏感信息
5. **定期更新文件**：项目结构变化时同步更新

## 常见问题

### Q：.worktreeinclude 和 .gitignore 冲突吗？

**A**：不冲突。它们服务于不同目的：
- `.gitignore`：告诉 git 哪些文件不需要版本控制
- `.worktreeinclude`：告诉 Claude 哪些文件需要在 worktree 间复制

### Q：是否应该提交 .worktreeinclude 到代码库？

**A**：应该提交。这样团队成员都能使用相同的 worktree 配置。

### Q：可以复制整个目录吗？

**A**：可以。在路径后加 `/` 表示目录：

```
.vscode/
.idea/
```

### Q：文件太大怎么办？

**A**：避免将大文件列入 `.worktreeinclude`：
- `node_modules/`：应该在 worktree 中重新安装
- `dist/`、`build/`：应该重新构建
- 大型数据库文件：考虑共享存储

### Q：如何验证 worktree 配置是否正确？

**A**：
1. 创建测试 worktree
2. 检查需要的文件是否存在
3. 验证应用能否正常运行
