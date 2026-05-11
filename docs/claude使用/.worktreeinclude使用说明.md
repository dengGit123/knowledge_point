# .worktreeinclude 使用说明

## 概述

`.worktreeinclude` 文件用于指定在创建新的 git worktree 时需要复制的文件列表，通常已加入 `.gitignore`。

## 文件位置

```
项目/.claude/.worktreeinclude
```

## 作用

- 定义 worktree 需要的配置文件
- 确保每个 worktree 有正确的配置
- 避免配置文件被 gitignore 忽略

## 文件格式

每行一个文件路径，使用相对于项目根目录的路径：

```
.claude/settings.json
.claude/CLAUDE.md
.env.local
config/development.json
```

## 使用场景

### 1. 本地配置文件

```
.claude/settings.local.json
.env.local
config.local.json
```

### 2. IDE 配置

```
.vscode/settings.json
.idea/
```

### 3. 临时文件

```
*.log
*.tmp
.cache/
```

## 工作流程

```
1. 创建 worktree
2. 读取 .worktreeinclude
3. 复制列出的文件到新 worktree
4. 应用配置
```

## 完整示例

```
# Claude 配置
.claude/settings.local.json
.claude/.mcp.json.local

# 环境配置
.env.local
.env.development

# IDE 配置
.vscode/settings.json
.idea/workspace.xml

# 构建配置
.next/cache/
node_modules/.cache/
```

## 最佳实践

1. **只包含必要文件**：避免复制不必要的文件
2. **使用注释**：用 `#` 添加说明
3. **分组组织**：按类型分组配置文件
4. **定期清理**：删除不再需要的条目
5. **版本控制**：文件本身应加入 gitignore

## 注意事项

- 文件路径是相对于项目根目录
- 不存在的文件会被忽略
- 使用通配符时要小心
- 敏感文件需要额外保护

## 与 .gitignore 的关系

`.worktreeinclude` 中的文件通常也在 `.gitignore` 中，因为：

- 它们是本地配置
- 包含敏感信息
- 因人而异

```
# .gitignore
.claude/settings.local.json
.env.local

# .worktreeinclude
.claude/settings.local.json
.env.local
```

## 示例配置

### 前端项目

```
# 开发环境
.env.local
.env.development

# 构建缓存
.next/cache/
dist/

# IDE
.vscode/settings.json
```

### 后端项目

```
# 环境配置
.env.local
config/development.yaml

# 数据
data/*.db
logs/

# IDE
.idea/
```

### 全栈项目

```
# Claude 配置
.claude/settings.local.json

# 前端
frontend/.env.local
frontend/.next/cache/

# 后端
backend/.env.local
backend/data/

# 共享
.env.local
docker-compose.override.yml
```
