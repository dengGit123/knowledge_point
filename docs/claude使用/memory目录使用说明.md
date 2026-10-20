# memory/ 目录使用说明

> 📚 **官方文档**：[Claude Code Memory](https://code.claude.com/docs/en/memory)

## 什么是 memory/

`memory/` 目录用于存储**记忆文件**，让 Claude Code 在不同会话之间保持上下文和知识的连续性。

> **通俗理解**：就像 Claude 的"笔记本"或"知识库"，记录需要长期记住的信息，比如用户偏好、项目背景、团队约定等。

## 目录位置

```
~/.claude/projects/<项目路径编码>/memory/
```

- 这是 Claude Code 的**自动记忆目录**，按项目隔离
- 每个项目有自己独立的记忆，互不干扰
- 记忆索引 `MEMORY.md` 会在每次会话开始时自动加载，具体记忆文件按需读取

## 目录结构

```
memory/
├── MEMORY.md              # 记忆索引文件（见 MEMORY文件使用说明.md）
├── user_role.md           # 用户相关记忆
├── feedback_testing.md    # 用户反馈记忆
├── project_goals.md       # 项目相关记忆
└── reference_docs.md      # 参考资源记忆
```

## 为什么需要记忆系统

### 问题场景

在与 Claude 的长期协作中：
- 每次会话需要重复说明用户背景
- 项目背景信息需要反复解释
- 用户的反馈和偏好容易遗忘
- 外部资源链接难以记忆

### 解决方案

通过记忆系统：
- 用户信息只需记录一次
- 项目背景自动加载
- 反馈意见长期保存
- 参考资源集中管理

## 文件格式

### 基本结构

每个记忆文件由 frontmatter 和正文组成，遵循"**一文件一事**"原则：

````markdown
---
name: 记忆名称（短横线小写命名）
description: 一句话描述，用于判断是否相关
metadata:
  type: user
---

记忆的具体内容。

对 feedback / project 类型，补充 Why 和 How to apply 两行：

**Why:** 为什么会有这条记忆（背景或原因）。

**How to apply:** 下次遇到类似情况应该怎么做。
````

### Frontmatter 字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| name | string | ✅ | 记忆的唯一标识，kebab-case 短横线命名 |
| description | string | ✅ | 一句话描述，Claude 用它判断相关性 |
| metadata.type | string | ✅ | 类型：`user` / `feedback` / `project` / `reference` |

## 记忆类型

### 1. user - 用户记忆

记录用户的角色、目标、知识水平和偏好。

```markdown
---
name: user-role
description: 前端工程师，熟悉 Vue 和 TypeScript
metadata:
  type: user
---

# 用户角色

## 基本信息
- 角色：前端工程师
- 经验：5 年
- 主要技术：Vue、TypeScript

## 专长领域
- 前端架构设计
- 组件库开发
- 性能优化

## 学习目标
- 深入学习 Rust
- 掌握 WebAssembly
```

### 2. feedback - 反馈记忆

记录用户对工作方式的反馈和指导，需要写明 **Why** 和 **How to apply**。

```markdown
---
name: testing-requirement
description: 必须为所有新功能编写单元测试
metadata:
  type: feedback
---

# 测试要求

## 规则
- 新功能必须有单元测试
- 覆盖率不能低于 80%
- 使用 Vitest 运行测试

**Why:** 曾因缺少测试导致生产环境故障。

**How to apply:** 每次完成功能后运行测试并确保通过，再向用户汇报。
```

### 3. project - 项目记忆

记录项目的背景、目标、时间线等信息。

```markdown
---
name: project-background
description: SaaS 管理平台开发，Beta 测试阶段
metadata:
  type: project
---

# 项目背景

## 业务类型
面向中小企业的 SaaS 管理平台

## 技术栈
- 前端：Vue 3 + TypeScript
- 后端：Node.js + PostgreSQL
- 部署：Docker + AWS

## 团队规模
前端 3 人，后端 4 人，测试 2 人

## 当前阶段
Beta 测试阶段，计划 2026 年 Q2 上线
```

### 4. reference - 参考记忆

记录外部资源的链接和用途。

```markdown
---
name: reference-docs
description: 项目相关的官方文档与监控面板链接
metadata:
  type: reference
---

# 参考文档

## 官方文档
- [Vue 文档](https://cn.vuejs.org)
- [Vite 配置指南](https://cn.vitejs.dev/config/)

## 监控面板
- [错误监控](https://sentry.example.com)
- [性能监控](https://perf.example.com)
```

## 使用场景

### 场景 1：记录用户技术栈

当用户说"记住我是前端工程师"时，创建 `user_role.md`（见上文 user 类型示例），并在 `MEMORY.md` 中添加索引条目。

### 场景 2：记录编码偏好

当用户纠正代码风格时，创建反馈记忆：

```markdown
---
name: component-style-preference
description: 组件默认使用组合式 API 和 script setup
metadata:
  type: feedback
---

# 组件风格偏好

## 规则
- 优先使用 `<script setup>` 语法
- 使用 `defineProps<T>()` 定义 Props
- 使用组合式函数（composables）复用逻辑

**Why:** 用户发现组合式写法更容易理解和维护。

**How to apply:** 编写 Vue 组件时默认使用 `<script setup>`，不要使用选项式 API。
```

### 场景 3：记录项目背景

当了解项目信息时，创建 `project_background.md`（见上文 project 类型示例）。

## 工作流程

### 创建新记忆

```
1. 识别需要记忆的信息
   ↓
2. 选择合适的类型和命名
   ↓
3. 创建记忆文件（含 frontmatter）
   ↓
4. 在 MEMORY.md 中添加索引
```

### 更新记忆

```
1. 找到相关记忆文件
   ↓
2. 更新文件内容
   ↓
3. 检查 MEMORY.md 中的描述是否准确
```

### 删除记忆

```
1. 找到相关记忆文件
   ↓
2. 删除记忆文件
   ↓
3. 从 MEMORY.md 中移除索引
```

## 最佳实践

### 1. 及时保存

当以下情况发生时，立即创建记忆：
- 用户说"记住这个"
- 用户纠正某个做法
- 了解到重要的项目背景
- 发现有价值的外部资源

### 2. 准确分类

使用正确的类型和命名：
- 用户信息 → `type: user`
- 用户反馈 → `type: feedback`
- 项目信息 → `type: project`
- 外部链接 → `type: reference`

### 3. 定期清理

定期（如每月）检查记忆：
- 删除过时的记忆
- 更新不再准确的信息
- 合并重复的记忆

### 4. 保持简洁

记忆应该：
- 一文件一事，记录关键信息
- 避免冗长描述
- 突出重点内容

## 注意事项

1. **不要重复存储**：可以从代码分析出的信息不需要记忆
2. **保持更新**：项目状态变化时及时更新记忆
3. **验证准确**：使用记忆前验证信息是否仍然有效（记忆反映的是写入时的状态）
4. **索引同步**：文件增删改时同步维护 `MEMORY.md`
5. **定期审查**：定期检查和清理过时的记忆

## 与其他配置的关系

| 配置 | 作用 | 与 memory 的关系 |
|------|------|----------------|
| [CLAUDE.md](./CLAUDE文件使用说明.md) | 项目级规则 | 记录稳定的团队约定，团队共享 |
| [settings.json](./settings配置使用说明.md) | 权限和设置 | 与记忆独立 |
| [MEMORY.md](./MEMORY文件使用说明.md) | 记忆索引 | 指向 memory/ 中的文件 |

## 常见问题

### Q：记忆会自动加载吗？

**A**：`MEMORY.md` 索引会自动加载。具体记忆文件在 Claude 判断相关时才读取，这样既节省上下文又能按需获取细节。

### Q：记忆和 CLAUDE.md 应该记什么？

**A**：
- `CLAUDE.md`：团队共享的**稳定规则**（编码规范、工作流程），提交到代码库
- `memory/`：**个人化、易变的信息**（用户偏好、进行中的工作、反馈记录），存在本地

### Q：哪些信息应该记忆？

**A**：应该记忆跨会话需要的信息：
- 用户角色和偏好
- 项目背景和目标
- 重要的反馈和指导
- 外部资源链接

不需要记忆可以从代码中获取的信息（目录结构、技术栈等）。

### Q：记忆可以更新吗？

**A**：可以。直接修改记忆文件，同时检查 `MEMORY.md` 中的描述。

### Q：如何避免记忆过多导致混乱？

**A**：
1. 定期清理过时的记忆
2. 使用清晰的分类和命名
3. 保持描述简洁
4. 合并相似的记忆
