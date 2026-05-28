# MEMORY.md 使用说明

## 什么是 MEMORY.md

`MEMORY.md` 是**记忆系统的索引文件**，你可以把它理解为"记忆目录"或"知识清单"。它记录了所有记忆文件的入口，让 Claude 能够快速找到之前存储的重要信息。

> **通俗理解**：就像一本书的目录，告诉你每一章在哪一页。`MEMORY.md` 告诉 Claude 各种记忆（用户偏好、项目背景、反馈记录等）存储在哪些文件中。

## 文件位置

```
项目/.claude/memory/MEMORY.md
```

## 为什么需要 MEMORY.md

### 问题场景

在与 Claude 的长期协作中，会产生大量需要记住的信息：
- 用户的角色和偏好
- 项目背景和目标
- 用户的反馈和指导
- 外部资源链接

这些信息分散在不同的文件中，`MEMORY.md` 提供了一个集中管理的入口。

### 解决方案

通过 `MEMORY.md`，Claude 可以：
1. 快速找到相关的记忆文件
2. 了解有哪些可用的记忆
3. 在需要时查阅具体信息

## 文件格式

### 基本结构

```markdown
# 记忆索引

## 用户记忆
<!-- 关于用户的信息 -->

## 反馈记忆
<!-- 用户的反馈和指导 -->

## 项目记忆
<!-- 项目相关的信息 -->

## 参考记忆
<!-- 外部资源链接 -->
```

### 索引条目格式

```markdown
- [记忆标题](文件路径.md) — 简短描述
```

## 可配置的内容

### 1. 用户记忆

记录用户的基本信息、角色、偏好等。

```markdown
## 用户记忆

### 基本信息
- [用户角色](user_role.md) — 前端工程师，熟悉 Vue 和 React
- [技术栈](user_stack.md) — 主要使用 TypeScript，正在学习 Rust
- [工作经验](user_experience.md) — 5 年前端开发经验

### 个人偏好
- [编码风格](user_coding_style.md) — 喜欢函数式编程，避免使用类
- [沟通方式](user_communication.md) — 喜欢直接简洁的回答
- [学习风格](user_learning.md) — 偏好实践导向的学习
```

### 2. 反馈记忆

记录用户对工作方式的反馈和指导。

```markdown
## 反馈记忆

### 代码质量
- [测试要求](feedback_testing.md) — 必须为所有功能编写测试
- [代码审查](feedback_review.md) — 提交前需要自我审查
- [命名规范](feedback_naming.md) — 使用语义化的变量命名

### 工作流程
- [提交规范](feedback_commit.md) — 使用 Conventional Commits 格式
- [分支管理](feedback_branch.md) — 功能分支从 develop 分支创建
- [发布流程](feedback_release.md) — 遵循语义化版本控制

### 沟通偏好
- [解释风格](feedback_explanation.md) — 先给结论，再解释原因
- [示例要求](feedback_examples.md) — 提供可运行的代码示例
```

### 3. 项目记忆

记录项目的背景、目标、架构等信息。

```markdown
## 项目记忆

### 项目概况
- [项目目标](project_goals.md) — 重构电商平台，提升性能 50%
- [项目时间线](project_timeline.md) — 计划 Q3 上线
- [团队成员](project_team.md) — 前端 3 人，后端 4 人

### 技术架构
- [技术选型](project_tech.md) — Vue 3 + TypeScript + Vite
- [架构设计](project_architecture.md) — 前后端分离，RESTful API
- [数据模型](project_data.md) — 核心实体和关系

### 业务规则
- [业务流程](project_workflow.md) — 订单处理流程
- [权限模型](project_permission.md) — RBAC 权限控制
- [数据校验](project_validation.md) — 输入验证规则
```

### 4. 参考记忆

记录外部资源的链接和用途。

```markdown
## 参考记忆

### 官方文档
- [Vue 文档](reference_vue_docs.md) — Vue 3 官方文档链接
- [TypeScript](reference_ts_docs.md) — TypeScript 手册
- [Vite](reference_vite_docs.md) — Vite 配置指南

### 工具资源
- [API 文档](reference_api.md) — 后端 API 接口文档
- [组件库](reference_ui.md) — Element Plus 组件库
- [图标库](reference_icons.md) — 使用的图标库

### 监控面板
- [错误监控](reference_sentry.md) — Sentry 错误追踪
- [性能监控](reference_perf.md) — 性能分析工具
- [日志平台](reference_logs.md) - 日志查询系统
```

## 目录结构

```
.claude/memory/
├── MEMORY.md              # 索引文件（本文件）
│
├── user_*.md             # 用户相关记忆
│   ├── user_role.md
│   ├── user_stack.md
│   └── user_preferences.md
│
├── feedback_*.md         # 用户反馈记忆
│   ├── feedback_testing.md
│   ├── feedback_style.md
│   └── feedback_process.md
│
├── project_*.md          # 项目相关记忆
│   ├── project_goals.md
│   ├── project_deadline.md
│   └── project_team.md
│
└── reference_*.md        # 参考资源记忆
    ├── reference_docs.md
    ├── reference_tools.md
    └── reference_apis.md
```

## 完整示例

```markdown
# 项目记忆索引

## 用户记忆

### 角色与专长
- [用户角色](user_role.md) — 前端工程师，5 年经验
- [技术栈](user_stack.md) — 精通 Vue/React，熟悉 Node.js
- [学习方向](user_learning.md) — 正在学习 Rust 和 WebAssembly

### 工作偏好
- [编码风格](user_coding_style.md) — 函数式编程优先
- [代码组织](user_organization.md) — 按功能模块组织代码
- [注释习惯](user_comments.md) — 代码自解释，少用注释

## 反馈记忆

### 质量要求
- [测试标准](feedback_testing.md) — 覆盖率不低于 80%
- [错误处理](feedback_error.md) — 必须处理所有错误情况
- [性能要求](feedback_performance.md) — 首屏加载小于 2 秒

### 流程规范
- [提交信息](feedback_commit.md) — Conventional Commits 格式
- [代码审查](feedback_review.md) — PR 需要至少一人审查
- [发布流程](feedback_release.md) — 每周五发布稳定版本

### 沟通偏好
- [回答风格](feedback_answer.md) — 直接给出答案，避免过多铺垫
- [示例要求](feedback_example.md) — 提供完整可运行的代码
- [问题诊断](feedback_debug.md) — 按步骤分析，给出根本原因

## 项目记忆

### 项目背景
- [项目目标](project_goals.md) — 电商管理后台重构
- [时间规划](project_timeline.md) — 3 个月完成，Q3 上线
- [团队构成](project_team.md) — 前端 3 人，后端 4 人，测试 2 人

### 技术方案
- [技术选型](project_tech.md) — Vue 3 + TypeScript + Vite
- [架构设计](project_architecture.md) — 前后端分离，模块化
- [数据流设计](project_dataflow.md) — Pinia 状态管理

### 业务规则
- [业务流程](project_workflow.md) — 商品、订单、用户管理
- [权限模型](project_permission.md) — 基于 RBAC 的权限控制
- [数据校验](project_validation.md) — 前后端双重校验

## 参考记忆

### 文档资源
- [Vue 3 文档](reference_vue.md) — https://cn.vuejs.org
- [TypeScript](reference_ts.md) — https://www.typescriptlang.org
- [Element Plus](reference_element.md) — https://element-plus.org

### 工具平台
- [API 文档](reference_api.md) — https://api.example.com/docs
- [图标库](reference_icons.md) — Iconify 图标选择器
- [Figma 设计](reference_design.md) — https://figma.com/design/xxx

### 监控工具
- [错误追踪](reference_sentry.md) — Sentry 控制台
- [性能监控](reference_perf.md) — Lighthouse 报告
- [用户反馈](reference_feedback.md) — 用户反馈渠道
```

## 编写规范

### 1. 分类清晰

将记忆按类型分组，便于查找：

```markdown
## 分类名称
- [记忆标题](文件.md) — 描述
```

### 2. 描述简洁

描述控制在 150 字符以内：

```markdown
# ✅ 好的描述
- [测试要求](testing.md) — 覆盖率不低于 80%，使用 Vitest

# ❌ 不好的描述
- [测试要求](testing.md) — 这个文档记录了我们项目对测试的所有要求，包括单元测试、集成测试和端到端测试，覆盖率要求是不低于百分之八十，使用的测试框架是 Vitest，还有...
```

### 3. 命名一致

使用统一的命名前缀：

```markdown
# 用户相关：user_ 前缀
user_role.md
user_stack.md
user_preferences.md

# 反馈相关：feedback_ 前缀
feedback_testing.md
feedback_style.md
feedback_process.md

# 项目相关：project_ 前缀
project_goals.md
project_timeline.md
project_team.md
```

### 4. 链接准确

确保链接指向正确的文件：

```markdown
# ✅ 使用相对路径
- [角色](user_role.md)

# ❌ 不要使用绝对路径
- [角色](./memory/user_role.md)
```

## 工作流程

### 创建新记忆

```
1. 创建记忆文件
   → 在 memory/ 目录创建新的 .md 文件

2. 编写记忆内容
   → 按照记忆模板编写内容

3. 更新索引
   → 在 MEMORY.md 中添加索引条目

4. 验证链接
   → 确保链接正确可访问
```

### 删除记忆

```
1. 删除记忆文件
   → 删除对应的 .md 文件

2. 更新索引
   → 从 MEMORY.md 中移除条目

3. 检查引用
   → 确保没有其他记忆引用该文件
```

### 更新记忆

```
1. 直接修改记忆文件
   → 更新过时的信息

2. 检查索引
   → 确认索引描述是否准确

3. 添加变更记录
   → 在文件末尾标注更新时间
```

## 最佳实践

### 1. 及时记录

当以下情况发生时，立即创建记忆：
- 用户说"记住这个"
- 用户纠正某个做法
- 了解到重要的项目背景
- 发现有价值的外部资源

### 2. 定期清理

定期（如每月）检查记忆：
- 删除过时的记忆
- 更新不再准确的信息
- 合并重复的记忆

### 3. 描述准确

索引描述应该：
- 概括记忆的核心内容
- 使用简洁的语言
- 包含关键信息

### 4. 结构一致

保持统一的结构：
- 使用相同的分类
- 遵循命名规范
- 格式统一

## 与 memory/ 目录的关系

`MEMORY.md` 和 `memory/` 目录是相辅相成的：

```
.claude/memory/
├── MEMORY.md              # 索引/目录
├── user_role.md           # 实际记忆内容
├── user_stack.md          # 实际记忆内容
└── feedback_testing.md    # 实际记忆内容
```

- **MEMORY.md**：是目录，告诉你有什么记忆
- **各 .md 文件**：是记忆的实际内容
- 每次会话开始时会自动加载 MEMORY.md

## 常见问题

### Q：MEMORY.md 和各记忆文件有什么区别？

**A**：`MEMORY.md` 是索引，记录"有哪些记忆"；各 `.md` 文件是记忆内容，记录"记忆的具体信息"。就像书本的目录和正文。

### Q：记忆内容应该多详细？

**A**：记忆应该简洁、突出重点。记录关键信息即可，避免冗长。详细内容可以通过其他文档获取。

### Q：哪些信息应该记忆？

**A**：应该记忆的是：
- 跨会话需要的信息（用户偏好、项目背景）
- 不容易从代码中获取的信息（团队约定、业务规则）
- 需要长期保存的反馈（编码风格、工作流程）

不需要记忆：
- 可以从代码分析出的信息（目录结构、技术栈）
- 临时性的信息（当前的 bug、待办事项）

### Q：记忆可以更新吗？

**A**：可以。当信息变化时，直接更新对应的记忆文件，同时检查 `MEMORY.md` 中的描述是否仍然准确。

### Q：如何避免记忆过多导致混乱？

**A**：
1. 定期清理过时的记忆
2. 使用清晰的分类和命名
3. 保持描述简洁
4. 合并相似的记忆

## 示例模板

```markdown
# 项目记忆索引

## 用户记忆
<!-- 关于用户角色、技术栈、偏好的记忆 -->

## 反馈记忆
<!-- 用户对代码质量、工作流程的反馈 -->

## 项目记忆
<!-- 项目目标、时间线、团队等背景信息 -->

## 参考记忆
<!-- 文档、工具、监控等外部资源链接 -->
```
