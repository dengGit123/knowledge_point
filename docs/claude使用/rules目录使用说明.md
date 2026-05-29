# rules/ 目录使用说明

## 什么是 rules/

`rules/` 目录用于存放**主题范围的规则文件**，支持**路径门控（path gating）**，让特定规则只在匹配的文件路径下生效。

> **通俗理解**：就像给 Claude 设置"分门别类的工作手册"。不同的规则文件针对不同的文件类型或目录生效，比如处理测试文件时遵循测试规范，处理数据库代码时遵循数据库规范。

## 文件位置

```text
项目/.claude/rules/*.md
全局/.claude/rules/*.md
```

## 目录结构

```text
.claude/rules/
├── typescript.md      # TypeScript 文件规范
├── react.md           # React 组件规范
├── testing.md         # 测试文件规范
├── database.md        # 数据库操作规范
├── styles.md          # 样式文件规范
├── security.md        # 安全相关规范
└── documentation.md   # 文档编写规范
```

## 为什么需要 rules/

### 问题场景

在不同类型的文件中，需要遵循不同的规范：
- 测试文件：需要遵循测试命名、Mock 使用等规范
- 数据库代码：需要遵循安全查询、迁移规范
- React 组件：需要遵循组件结构、Hooks 使用规范
- 样式文件：需要遵循命名、嵌套等规范

### 解决方案

通过规则文件的路径门控功能：
- 不同文件类型应用不同规则
- 规则只在相关路径下生效
- 与 CLAUDE.md 配合，提供更精细的控制

## 核心概念：路径门控 (Path Gating)

### 什么是路径门控

路径门控是指根据文件路径模式（glob）来控制规则的生效范围。

> **通俗理解**：就像"智能开关"，当操作某个文件时，只有匹配该文件的规则才会生效。

### 工作原理

```text
操作文件: src/components/Button.tsx
         ↓
检查 rules/*.md 中的 globs
         ↓
找到匹配的规则: react.md (globs: ["src/components/**/*.tsx"])
         ↓
应用 react.md 中的规则
```

## 作用

| 作用 | 说明 |
|------|------|
| 定义主题规范 | 为不同主题的代码定义专门规范 |
| 路径门控控制 | 规则只在匹配的文件路径下生效 |
| 细粒度控制 | 比 CLAUDE.md 更精细的规则控制 |
| 模块化组织 | 不同主题的规则独立管理 |

## 文件格式

### 基本结构

```markdown
---
globs: ["src/**/*.ts", "lib/**/*.ts"]
description: TypeScript 编码规范
id: typescript-rules
---

# TypeScript 规范

## 类型定义
- 所有函数必须有返回类型注解
- 禁止使用 `any` 类型
- 接口优先于类型别名
```

### Frontmatter 字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| globs | string[] | ✅ | 匹配的文件路径模式（glob 表达式） |
| description | string | ✅ | 规则的简短描述 |
| id | string | ❌ | 可选的规则标识符 |

### Glob 模式语法

| 模式 | 匹配 | 说明 |
|------|------|------|
| `*.ts` | 所有 .ts 文件 | 当前目录 |
| `**/*.ts` | 所有 .ts 文件 | 递归所有目录 |
| `src/**/*.tsx` | src 下所有 .tsx | 递归匹配 |
| `**/*.test.{ts,js}` | 测试文件 | 多扩展名 |
| `!src/vendor/**` | 排除 vendor 目录 | 否定模式 |

## 路径门控示例

### 1. 按文件类型

```markdown
---
globs: ["**/*.test.ts", "**/*.spec.ts"]
description: 测试文件规范
---

# 测试文件规范

## 命名规范
- 测试文件名与源文件对应：`Button.tsx` → `Button.test.tsx`
- 测试用例描述使用 `应该...` 格式

## 结构规范
- 使用 `describe` 和 `it` 组织测试
- 每个测试应该独立运行，不依赖顺序
- 使用 `beforeEach` 和 `afterEach` 管理状态

## Mock 规范
- Mock 外部依赖和 API 调用
- 使用清晰的 mock 数据
- 测试完成后恢复 mock
```

### 2. 按目录路径

```markdown
---
globs: ["src/components/**/*.tsx", "src/components/**/*.jsx"]
description: React 组件规范
---

# React 组件规范

## 组件结构
- 使用函数式组件，避免类组件
- Props 使用 TypeScript 接口定义
- 组件文件使用 PascalCase 命名

## Hooks 规范
- Hooks 只在函数顶层调用
- 自定义 Hook 以 `use` 开头
- 遵循 Hooks 规则：不在条件、循环中使用

## 性能优化
- 纯展示组件使用 `React.memo`
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 稳定函数引用
```

### 3. 按模块划分

```markdown
---
globs: ["src/api/**/*.ts", "src/services/**/*.ts"]
description: API 层规范
---

# API 层规范

## 错误处理
- 所有 API 函数必须处理错误
- 使用统一的返回格式：`{ data, error }`
- 错误信息包含用户友好的描述

## 请求规范
- 添加请求超时设置
- 实现请求重试机制
- 添加请求取消支持

## 日志记录
- 记录请求参数和响应
- 不记录敏感信息（密码、token）
- 错误时记录完整的错误堆栈
```

### 4. 按技术栈

```markdown
---
globs: ["**/*.vue"]
description: Vue 组件规范
---

# Vue 组件规范

## 组件结构
- 使用 `<script setup>` 语法
- 组件命名使用 PascalCase
- Props 使用 `defineProps<T>()` 定义

## 样式规范
- 使用 scoped 样式
- 优先使用 CSS Modules
- 避免使用全局样式

## 响应式数据
- 使用 `ref` 和 `reactive` 管理状态
- 避免 `reactive` 解构
- computed 计算属性缓存计算结果
```

## 常见规则模板

### 1. 数据库操作规则

```markdown
---
globs: ["src/db/**/*.ts", "**/*migration*.ts", "**/seeds/**/*.ts"]
description: 数据库操作规范
---

# 数据库操作规范

## 安全规则
- 使用参数化查询，禁止 SQL 字符串拼接
- 用户输入必须经过验证和转义
- 敏感字段（密码、token）必须加密存储
- 数据库密码不提交到代码库，使用环境变量

## 迁移规则
- 迁移文件必须可回滚（提供 down 方法）
- 先在测试环境验证迁移
- 生产环境迁移前备份数据
- 迁移文件命名：`YYYYMMDDHHMMSS-description.ts`

## 查询优化
- 避免 N+1 查询问题
- 合理使用索引
- 分页查询限制结果数量
- 只选择需要的字段
```

### 2. 样式文件规则

```markdown
---
globs: ["**/*.css", "**/*.scss", "**/*.module.css", "**/*.module.scss"]
description: 样式文件规范
---

# 样式文件规范

## 命名规范
- 使用 BEM 命名法：`.block__element--modifier`
- 避免使用 ID 选择器
- 类名使用 kebab-case

## 嵌套规范
- Sass/SCSS 嵌套不超过 3 层
- 避免使用 `@import`，使用 `@use` 或 `@forward`
- 使用 CSS 变量管理颜色和尺寸

## 性能优化
- 避免通配符选择器 `*`
- 使用 `will-change` 优化动画属性
- 避免复杂的伪类选择器

## 响应式设计
- 使用媒体查询实现响应式
- 移动优先（Mobile First）策略
- 使用相对单位（rem, em, %）
```

### 3. 文档规则

```markdown
---
globs: ["**/*.md", "docs/**/*", "README.md"]
description: 文档编写规范
---

# 文档编写规范

## 格式规范
- 使用中文编写文档
- 代码块必须指定语言
- 添加适当的表格和列表
- 使用引用块标注重要信息

## 结构规范
- 每个文档有清晰的标题层级
- 使用 TOC（目录）索引
- 添加示例代码和预期输出
- 关键概念提供解释链接

## 维护规范
- 代码变更时同步更新文档
- 过时信息及时删除或标注
- 重要变更添加变更日志
```

### 4. 安全规则

```markdown
---
globs: ["src/auth/**/*.ts", "src/middleware/**/*.ts"]
description: 安全相关规范
---

# 安全规范

## 认证规则
- 密码使用 bcrypt 或 argon2 加密
- JWT token 使用安全随机密钥签名
- 实现 token 刷新机制
- 敏感操作需要二次验证

## 授权规则
- 验证用户权限后再执行操作
- 使用最小权限原则
- 资源访问检查所有权
- API 实现速率限制

## 数据保护
- 敏感数据不在 URL 中传递
- 日志中不记录敏感信息
- 实现 CSRF 保护
- 使用 HTTPS 传输
```

### 5. Git 提交规则

```markdown
---
globs: [".git/**/*", "COMMIT_EDITMSG"]
description: Git 工作规范
---

# Git 工作规范

## 提交信息规范
使用约定式提交格式：
```text
<type>(<scope>): <subject>

<body>

<footer>
```

- type: feat, fix, docs, style, refactor, test, chore
- subject: 简短描述（50 字符内）
- body: 详细说明
- footer: 关联 Issue

## 分支规范
- main/master: 生产环境
- develop: 开发环境
- feature/*: 功能开发
- bugfix/*: 问题修复
- hotfix/*: 紧急修复
```

## 与 CLAUDE.md 的区别

| 特性 | CLAUDE.md | rules/*.md |
|------|-----------|------------|
| 作用范围 | 整个项目 | 特定路径/文件类型 |
| 加载时机 | 每次会话开始 | 匹配路径时动态加载 |
| 文件数量 | 通常一个 | 可以有多个 |
| 细粒度 | 粗粒度（项目级） | 细粒度（文件级） |
| 典型用途 | 项目整体规则 | 分类主题规则 |

> **通俗理解**：
> - **CLAUDE.md** 是"公司基本规定"：适用于所有人
> - **rules/*** 是"各部门手册"：开发部、测试部、运维部各有各的规定

## 配置优先级

```text
全局 rules
  ↓
项目 rules
  ↓
CLAUDE.md
  ↓
最终生效规则
```

## 最佳实践

### 1. 按职责分离

不同主题的规则放在不同文件，便于维护：

```text
✅ 好的设计
.claude/rules/
├── typescript.md
├── react.md
├── testing.md
└── database.md

❌ 不好的设计
.claude/rules/
├── all-rules.md         # 所有规则混在一起
└── more-rules.md
```

### 2. 精确匹配

使用精确的 glob 模式，避免过度匹配：

```text
✅ 好的设计
globs: ["src/components/**/*.tsx"]
globs: ["**/*.test.ts"]

❌ 不好的设计
globs: ["*"]              # 匹配所有文件
globs: ["src/**/*"]       # 过于宽泛
```

### 3. 清晰描述

description 字段准确说明规则用途：

```markdown
---
description: TypeScript 编码规范
---

✅ 清晰
description: 定义 TypeScript 类型注解、接口使用、泛型等规范

❌ 模糊
description: 代码规范
```

### 4. 避免重叠

多个规则不要覆盖相同路径，避免冲突：

```text
✅ 好的设计
typescript.md: globs: ["**/*.ts"]
vue.md:        globs: ["**/*.vue"]

❌ 不好的设计
typescript.md: globs: ["src/**/*"]
vue.md:        globs: ["src/**/*"]  # 重叠冲突
```

### 5. 版本控制

rules 文件应该提交到代码库，团队共享：

```bash
# 提交规则文件
git add .claude/rules/
git commit -m "docs: 添加 TypeScript 和 React 编码规范"
```

## 工作流程

### 创建新规则

```text
1. 确定规则主题和适用范围
   ↓
2. 设计 glob 模式
   ↓
3. 编写规则内容
   ↓
4. 测试规则生效
   ↓
5. 提交到代码库
```

### 更新规则

```text
1. 识别需要调整的规则
   ↓
2. 更新规则文件
   ↓
3. 验证变更效果
   ↓
4. 通知团队成员
   ↓
5. 提交更新
```

## 注意事项

1. **glob 模式使用 gitignore 风格**：支持 `*`、`**`、`?` 等通配符
2. **规则文件会合并**：同一路径可以匹配多条规则，规则会叠加生效
3. **规则优先级**：项目级 > 全局级
4. **规则数量适中**：规则太多可能影响性能，合理组织
5. **定期审查**：定期检查规则是否需要更新或删除过时规则

## 常见问题

### Q：rules 和 CLAUDE.md 如何配合使用？

**A**：
- **CLAUDE.md**：定义项目级别的通用规则
- **rules/**：定义特定文件类型的专项规则

配合示例：
```text
CLAUDE.md: "使用 TypeScript 编写代码"
rules/typescript.md: "所有函数必须有返回类型注解"
```

### Q：一个文件可以匹配多条规则吗？

**A**：可以。一个文件可以匹配多条规则，所有匹配的规则都会生效。需要注意规则之间的一致性。

### Q：如何调试规则是否生效？

**A**：
1. 检查 glob 模式是否正确匹配文件路径
2. 查看规则文件格式是否正确
3. 观察对话中 Claude 是否遵循该规则

### Q：规则支持嵌套引用吗？

**A**：不支持。每个规则文件是独立的，不能引用其他规则。

### Q：规则文件应该提交到代码库吗？

**A**：应该。规则是团队共享的编码规范，应该提交到代码库，确保所有成员使用相同的规则。
