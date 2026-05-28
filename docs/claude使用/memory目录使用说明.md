# memory/ 目录使用说明

## 什么是 memory/

`memory/` 目录用于存储**记忆文件**，让 Claude Code 在不同会话之间保持上下文和知识的连续性。

> **通俗理解**：就像 Claude 的"笔记本"或"知识库"，记录需要长期记住的信息，比如用户偏好、项目背景、团队约定等。

## 文件位置

```
项目/.claude/memory/
```

## 目录结构

```
.claude/memory/
├── MEMORY.md              # 记忆索引文件
├── user_*.md              # 用户相关记忆
├── feedback_*.md          # 用户反馈记忆
├── project_*.md           # 项目相关记忆
└── reference_*.md         # 参考资源记忆
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

## 记忆类型

### 1. user - 用户记忆

记录用户的角色、目标、知识水平和偏好。

#### 文件命名

```
user_role.md         # 用户角色
user_preferences.md  # 用户偏好
user_expertise.md    # 用户专长
```

#### 文件示例

```markdown
---
name: 用户角色
description: 前端工程师，熟悉 Vue 和 React
type: user
---

# 用户角色

## 基本信息
- 角色：前端工程师
- 经验：5 年
- 主要技术：Vue, React, TypeScript

## 专长领域
- 前端架构设计
- 组件库开发
- 性能优化

## 学习目标
- 深入学习 Rust
- 掌握 WebAssembly
```

### 2. feedback - 反馈记忆

记录用户对工作方式的反馈和指导。

#### 文件命名

```
feedback_style.md        # 编码风格反馈
feedback_process.md      # 工作流程反馈
feedback_communication.md # 沟通方式反馈
```

#### 文件示例

```markdown
---
name: 编码风格偏好
description: 喜欢函数式编程，避免使用类
type: feedback
---

# 编码风格反馈

## 规则
- 优先使用函数式组件
- 避免使用 class 组件
- 使用自定义 Hooks 管理状态

## Why: 用户体验
用户发现函数式组件更容易理解和维护

## How to apply
在编写 React 组件时，默认使用函数式写法
```

### 3. project - 项目记忆

记录项目的背景、目标、时间线等信息。

#### 文件命名

```
project_goals.md        # 项目目标
project_deadline.md     # 项目截止日期
project_team.md         # 团队成员
project_context.md      # 项目背景
```

#### 文件示例

```markdown
---
name: 项目目标
description: 电商平台重构，计划 Q3 上线
type: project
---

# 项目目标

## 主要目标
- 重构旧版电商平台
- 提升页面加载速度 50%
- 改善移动端体验

## Why: 业务需求
旧平台性能差，影响转化率

## How to apply
所有代码变更优先考虑性能优化
```

### 4. reference - 参考记忆

记录外部资源的链接和用途。

#### 文件命名

```
reference_docs.md       # 文档链接
reference_tools.md      # 工具链接
reference_apis.md       # API 参考
```

#### 文件示例

```markdown
---
name: 参考文档
description: 项目相关的官方文档链接
type: reference
---

# 参考文档

## API 文档
- [后端 API](https://api.example.com/docs)
- [组件库文档](https://ui.example.com)

## 监控面板
- [错误监控](https://sentry.example.com)
- [性能监控](https://perf.example.com)
```

## 文件格式

### 基本结构

```markdown
---
name: 记忆名称
description: 简短描述
type: user|feedback|project|reference
---

# 记忆标题

## 内容
<!-- 记忆的具体内容 -->
```

### Frontmatter 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 记忆名称 |
| description | string | 简短描述 |
| type | string | 类型：user/feedback/project/reference |

## 使用场景

### 场景 1：记录用户技术栈

当用户说"记住我是前端工程师"时：

```markdown
# user_expertise.md

---
name: 用户技术水平
description: 前端专家，后端新手
type: user
---

# 技术水平

## 精通
- React / TypeScript
- CSS / Tailwind
- 前端工程化

## 熟悉
- Node.js
- GraphQL

## 学习中
- Rust
- WebAssembly
```

### 场景 2：记录编码偏好

当用户纠正代码风格时：

```markdown
# feedback_coding_style.md

---
name: 测试要求
description: 必须为所有功能编写测试
type: feedback
---

# 测试反馈

## 规则
- 新功能必须有单元测试
- 覆盖率不能低于 80%
- 使用 Vitest 运行测试

## Why: 之前的问题
曾因为缺少测试导致生产环境故障

## How to apply
每次完成功能后运行测试并确保通过
```

### 场景 3：记录项目背景

当了解项目信息时：

```markdown
# project_background.md

---
name: 项目背景
description: SaaS 管理平台开发
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
Beta 测试阶段，计划 Q2 上线
```

## 最佳实践

### 1. 及时保存

当以下情况发生时，立即创建记忆：
- 用户说"记住这个"
- 用户纠正某个做法
- 了解到重要的项目背景
- 发现有价值的外部资源

### 2. 准确分类

使用正确的类型前缀：
- 用户信息 → `user_` 前缀，`type: user`
- 用户反馈 → `feedback_` 前缀，`type: feedback`
- 项目信息 → `project_` 前缀，`type: project`
- 外部链接 → `reference_` 前缀，`type: reference`

### 3. 定期清理

定期（如每月）检查记忆：
- 删除过时的记忆
- 更新不再准确的信息
- 合并重复的记忆

### 4. 保持简洁

记忆应该：
- 记录关键信息
- 避免冗长描述
- 突出重点内容

## 与 MEMORY.md 的关系

```
.claude/memory/
├── MEMORY.md         # 索引文件
├── user_role.md      # 实际记忆内容
├── user_stack.md     # 实际记忆内容
└── feedback_test.md  # 实际记忆内容
```

- **MEMORY.md**：是目录，告诉有什么记忆
- **各 .md 文件**：是记忆的实际内容
- 每次会话开始时会自动加载 MEMORY.md

## 工作流程

### 创建新记忆

```
1. 识别需要记忆的信息
   ↓
2. 选择合适的类型和命名
   ↓
3. 创建记忆文件
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

## 注意事项

1. **不要重复存储**：可以从代码分析出的信息不需要记忆
2. **保持更新**：项目状态变化时及时更新记忆
3. **验证准确**：使用记忆前验证信息是否仍然有效
4. **简洁明确**：记忆文件应该简洁，突出重点
5. **定期审查**：定期检查和清理过时的记忆

## 与其他配置的关系

| 配置 | 作用 | 与 memory 的关系 |
|------|------|----------------|
| CLAUDE.md | 项目级规则 | 记忆项目约定和规范 |
| settings.json | 权限和设置 | 与记忆独立 |
| MEMORY.md | 记忆索引 | 指向 memory/ 中的文件 |

## 常见问题

### Q：记忆会自动加载吗？

**A**：`MEMORY.md` 索引会自动加载。具体记忆文件在需要时读取。

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

### Q：记忆文件应该提交到代码库吗？

**A**：看情况：
- 项目相关的记忆（project_*）应该提交
- 个人相关的记忆（user_*、feedback_*）可以不提交
- 敏感信息应该避免
