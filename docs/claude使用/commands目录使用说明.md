# commands/ 目录使用说明

> 📚 **官方文档**：[Claude Code Slash Commands](https://code.claude.com/docs/en/slash-commands)

## 什么是 commands/

`commands/` 目录用于存放**自定义斜杠命令**，让你通过 `/命令名` 快速执行常用的任务。

> **通俗理解**：就像给 Claude 定义"快捷指令"或"模板"。比如你经常需要"清理缓存"，就可以定义一个 `/cleanup` 命令，以后直接输入就能执行，不用每次都详细说明。

## 文件位置

```
项目/.claude/commands/*.md    # 项目级（团队共享）
~/.claude/commands/*.md       # 用户级（个人全局）
```

命令名称就是文件名：`cleanup.md` 对应 `/cleanup`。放在子目录中会形成带命名空间的命令，如 `frontend/build.md` 对应 `/frontend:build`。

## 为什么需要自定义命令

### 问题场景

有些任务你会反复做，每次都要详细说明：
- "帮我运行测试、检查类型、然后检查代码风格"
- "帮我构建项目、检查构建结果、报告文件大小"

### 解决方案

通过自定义命令，这些操作只需一行：
- `/check` — 完整检查
- `/build` — 构建项目

## 文件格式

### 基本结构

````markdown
---
description: 命令的简短描述（显示在命令列表中）
argument-hint: [参数提示]          # 可选，如 [issue-number]
allowed-tools: Bash(git *), Read  # 可选，命令中允许使用的工具
model: sonnet                     # 可选，指定使用的模型
---

# 命令标题

请执行以下操作，目标：$ARGUMENTS

1. 第一步
2. 第二步
3. 第三步
````

### Frontmatter 字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| description | string | ✅ | 命令的简短描述，显示在 `/` 命令列表中 |
| argument-hint | string | ❌ | 参数提示，输入命令时展示，如 `[模块名]` |
| allowed-tools | string | ❌ | 该命令允许使用的工具列表 |
| model | string | ❌ | 指定执行该命令时使用的模型 |

### 动态内容

命令文件本质是提示词模板，支持以下动态语法：

| 语法 | 说明 | 示例 |
|------|------|------|
| `$ARGUMENTS` | 接收用户输入的全部参数 | `审查这个文件：$ARGUMENTS` |
| `$1`、`$2`… | 按位置接收参数 | `把 $1 重命名为 $2` |
| `` !`命令` `` | 在命令执行前先运行 shell 命令，把输出注入提示词 | `` 当前分支：!`git branch --show-current` `` |
| `@文件` | 引用文件内容作为上下文 | `参考 @src/typedoc.md 的规范` |

> **通俗理解**：`!` 开头的命令像"准备工作"，先执行并把结果填进提示词；`$` 是"留空待填"的参数位。

## 如何使用命令

### 1. 斜杠调用

```
/cleanup
/build
/check src/utils
```

### 2. 带参数调用

```
# 命令文件中用 $ARGUMENTS 接收
/review src/auth.ts

# 命令文件中用 $1 $2 接收
/rename utils.ts helper.ts
```

## 常用命令示例

### 1. 检查命令

检查代码质量（演示 bash 前置执行和参数）。

````markdown
---
description: 运行类型检查、代码风格检查和测试
allowed-tools: Bash(npm run *), Bash(npm test)
---

# 代码质量检查

当前分支：!`git branch --show-current`

请对 $ARGUMENTS（未指定则为整个项目）执行以下检查：

## 1. 类型检查
- 运行 `npm run typecheck`
- 报告所有类型错误

## 2. 代码风格
- 运行 `npm run lint`
- 报告风格问题

## 3. 测试
- 运行 `npm test`
- 显示测试覆盖率

## 输出格式

### ✅ 通过
- 列出通过的检查项

### ❌ 失败
- 列出失败项及位置，并给出修复建议
````

### 2. 清理命令

清理缓存和临时文件。

````markdown
---
description: 清理构建缓存和临时文件
allowed-tools: Bash(rm *), Bash(du *)
---

# 清理缓存

请执行以下清理操作：

## 1. 缓存目录
- 删除 `node_modules/.cache/`
- 删除 `dist/`
- 删除 `.vite/`

## 2. 临时文件
- 删除 `*.log` 文件
- 删除 `.DS_Store`

## 3. 确认清理
- 显示删除的文件列表
- 报告释放的磁盘空间
````

### 3. 构建命令

构建生产版本。

````markdown
---
description: 构建项目并验证结果
allowed-tools: Bash(npm run *), Bash(du *)
---

# 项目构建

## 前置检查
- 确认依赖已安装（node_modules 是否存在）

## 构建步骤
1. 清理旧的构建产物
2. 执行 `npm run build`
3. 检查构建输出目录

## 构建验证
- 确认构建成功
- 报告构建文件大小
- 检查是否有警告

## 错误处理
- 如果构建失败，显示错误信息
- 分析失败原因
- 提供修复建议
````

### 4. 发布命令

发布新版本。

````markdown
---
description: 发布新版本
allowed-tools: Bash(git *), Bash(npm *)
argument-hint: [版本号]
---

# 版本发布

## 前置检查
- [ ] 所有测试通过
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新（目标版本：$ARGUMENTS）

## 发布步骤
1. 运行完整测试套件
2. 构建生产版本
3. 创建 git tag
4. 推送到远程仓库
5. 触发 CI/CD 流程

## 发布后验证
- 检查部署状态
- 验证主要功能
- 监控错误日志

## 回滚计划
如果发布失败：
1. 停止新版本
2. 恢复到上一版本
3. 检查错误日志
4. 修复后重试
````

## 目录结构示例

```
.claude/commands/
├── build.md          # /build 构建命令
├── test.md           # /test 测试命令
├── lint.md           # /lint 代码检查命令
├── cleanup.md        # /cleanup 清理命令
└── frontend/
    └── build.md      # /frontend:build 带命名空间的命令
```

## 与 skills/ 的区别

| 特性 | commands/ | skills/ |
|------|-----------|---------|
| 文件结构 | 单文件 `*.md` | 目录 `name/SKILL.md` |
| 支持文件 | 不支持 | 可包含配置、辅助文件 |
| 适用场景 | 简单单功能命令 | 复杂多步骤流程 |
| 复杂度 | 轻量级 | 重量级 |

> **通俗理解**：
> - **commands** 是"快捷方式"：一键完成简单任务
> - **skills** 是"工作流"：复杂的多步骤任务流程

## 命名规范

### 文件命名

使用小写字母和连字符：

```
# ✅ 好的命名
cleanup.md
code-format.md
run-tests.md

# ❌ 不好的命名
Cleanup.md
codeFormat.md
runTests.md
```

### 描述规范

简洁明了，说明命令做什么：

```markdown
---
description: 清理缓存文件        # ✅ 好的描述
description: 帮你清理各种缓存    # ❌ 不要用"帮你"这种口语
---
```

## 最佳实践

### 1. 命名清晰

文件名要能清楚描述命令功能：

```bash
# ✅ 好的命名
cleanup.md      # 清理
format.md       # 格式化
deploy.md       # 部署

# ❌ 不好的命名
cmd1.md         # 含义不明
do-it.md        # 不清晰
stuff.md        # 太随意
```

### 2. 步骤明确

命令执行步骤要清晰详细：

````markdown
# ✅ 好的命令
## 步骤
1. 第一步具体做什么
2. 第二步具体做什么
3. 第三步验证结果

# ❌ 不好的命令
## 步骤
- 做一些操作
- 然后做其他操作
- 最后检查
````

### 3. 限制工具范围

通过 `allowed-tools` 限定命令能使用的工具，更安全可控：

````markdown
---
description: 查看 git 历史
allowed-tools: Bash(git log *), Bash(git diff *)
---
````

### 4. 错误处理

包含错误情况的处理说明：

````markdown
## 错误处理
- 如果命令执行失败，显示错误信息
- 分析失败原因
- 提供修复建议
- 不要忽略错误继续执行
````

### 5. 合理拆分

复杂任务考虑拆分成多个命令：

```bash
# ✅ 合理拆分
build.md      # 构建
test.md       # 测试
deploy.md     # 部署

# ❌ 一个命令做太多
everything.md # 构建+测试+部署+发布
```

## 选择建议

### 使用 commands/ 的场景

- 简单的单功能命令
- 不需要辅助文件
- 快速定义和修改
- 频繁使用的操作

### 使用 skills/ 的场景

- 复杂的多步骤流程
- 需要配置或辅助文件
- 需要独立的文档说明
- 团队共享的复杂功能

## 注意事项

1. **文件名即命令名**：`cleanup.md` 对应 `/cleanup`
2. **避免内置冲突**：不要使用与内置命令冲突的名称
3. **提交到代码库**：项目级命令文件应该提交，让团队共享
4. **同步更新文档**：更新命令时同步更新说明
5. **复杂命令升级**：过于复杂的命令考虑升级为 skill

## 常见问题

### Q：命令和内置命令有冲突怎么办？

**A**：自定义命令会覆盖同名内置命令。建议使用不同的名称避免冲突。

### Q：命令可以接受参数吗？

**A**：可以。在命令文件中使用 `$ARGUMENTS` 接收全部参数，或使用 `$1`、`$2` 按位置接收：

````markdown
---
description: 审查指定文件
argument-hint: [文件路径]
---
请审查这个文件：$ARGUMENTS
````

### Q：命令可以执行 shell 命令吗？

**A**：可以。使用 `` !`命令` `` 语法在命令执行前先运行 shell 命令，输出会注入提示词。需要配合 `allowed-tools` 授权。

### Q：命令修改后需要重启吗？

**A**：不需要。命令修改后立即生效。

### Q：如何测试命令是否工作？

**A**：直接使用 `/命令名` 测试，观察输出是否符合预期。

## 示例模板

````markdown
---
description: 简短描述命令的功能
argument-hint: [参数说明]
allowed-tools: Bash(允许的命令)
---

# 命令标题

请执行以下操作，目标：$ARGUMENTS

## 步骤
1. 第一步做什么
2. 第二步做什么

## 验证
- 检查点1
- 检查点2

## 错误处理
- 如果失败，说明原因
- 提供修复建议
````
