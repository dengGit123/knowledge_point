# rules/ 目录使用说明

## 概述

`rules/` 目录用于存放主题范围的指令文件，支持路径门控（path gating），让特定规则只在匹配的文件路径下生效。

## 文件位置

```
项目/.claude/rules/*.md
全局/.claude/rules/*.md
```

## 作用

- 定义特定主题的编码规范和约定
- 通过路径门控限制规则作用范围
- 与 CLAUDE.md 配合使用，提供更细粒度的控制

## 文件格式

### 基本结构

```markdown
---
globs: ["src/**/*.ts", "lib/**/*.ts"]
description: TypeScript 编码规范
---

# TypeScript 规范

## 类型定义
- 所有函数必须有返回类型注解
- 禁止使用 `any` 类型
- 接口优先于类型别名
```

### Frontmatter 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| globs | string[] | 匹配的文件路径模式 |
| description | string | 规则描述 |
| id | string | 可选的规则标识符 |

## 路径门控示例

### 按文件类型

```markdown
---
globs: ["**/*.test.ts"]
description: 测试文件规范
---

# 测试规范

- 使用 `describe` 和 `it` 组织测试
- 每个测试应该独立运行
- Mock 外部依赖
```

### 按目录路径

```markdown
---
globs: ["src/components/**/*.tsx"]
description: React 组件规范
---

# 组件规范

- 使用函数式组件
- Props 使用 TypeScript 接口
- 使用 memo 优化性能
```

### 按模块划分

```markdown
---
globs: ["src/api/**/*.ts"]
description: API 层规范
---

# API 规范

- 所有 API 函数必须处理错误
- 使用统一的返回格式
- 添加请求日志
```

## 常见规则模板

### 数据库操作规则

```markdown
---
globs: ["src/db/**/*.ts", "**/*migration*.ts"]
description: 数据库操作规范
---

# 数据库规范

## 安全规则
- 使用参数化查询，禁止 SQL 拼接
- 敏感字段必须加密
- 数据库密码不提交到代码库

## 迁移规则
- 迁移文件必须可回滚
- 先在测试环境验证
- 备份生产数据
```

### 样式文件规则

```markdown
---
globs: ["**/*.css", "**/*.scss", "**/*.module.css"]
description: 样式文件规范
---

# 样式规范

## 命名
- 使用 BEM 命名法
- 避免嵌套超过 3 层
- 使用 CSS 变量管理颜色

## 性能
- 避免使用 `@import`
- 使用 `will-change` 优化动画
```

### 文档规则

```markdown
---
globs: ["**/*.md", "docs/**/*"]
description: 文档编写规范
---

# 文档规范

## 格式
- 使用中文编写
- 代码块指定语言
- 添加适当的表格和列表

## 结构
- 每个文档有清晰的标题
- 使用目录索引
- 添加示例代码
```

## 与 CLAUDE.md 的区别

| 特性 | CLAUDE.md | rules/*.md |
|------|-----------|------------|
| 作用范围 | 整个项目 | 特定路径 |
| 加载时机 | 每次会话开始 | 匹配路径时 |
| 数量 | 通常一个 | 可以多个 |
| 细粒度 | 粗粒度 | 细粒度 |

## 最佳实践

1. **按职责分离**：不同主题的规则放在不同文件
2. **精确匹配**：使用精确的 glob 模式
3. **清晰描述**：description 字段说明规则用途
4. **避免重叠**：多个规则不要覆盖相同路径
5. **版本控制**：rules 文件应该提交到代码库

## 注意事项

- glob 模式使用 gitignore 风格的通配符
- 规则文件会合并，同一路径可以有多条规则
- 规则优先级：项目 > 全局
- 规则太多可能影响性能，合理组织

## 目录示例

```
.claude/rules/
├── typescript.md
├── react.md
├── database.md
├── testing.md
├── styles.md
└── security.md
```
