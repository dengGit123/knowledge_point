# MEMORY.md 使用说明

## 概述

`MEMORY.md` 是记忆系统的索引文件，用于组织和引用 memory/ 目录中的各种记忆文件。

## 文件位置

```
项目根目录/.claude/memory/MEMORY.md
```

## 作用

1. **记忆索引**：记录所有记忆文件的入口
2. **快速检索**：每次会话自动加载，方便查找
3. **结构组织**：按主题分类组织记忆

## 文件格式

### 基本格式

```markdown
- [记忆标题](记忆文件.md) — 简短描述
```

### 示例

```markdown
# 项目记忆

## 用户相关
- [用户角色](user_role.md) — 用户是前端工程师，熟悉 React
- [编码偏好](coding_style.md) — 喜欢函数式编程风格

## 反馈相关
- [测试要求](testing_feedback.md) — 必须编写单元测试
- [提交规范](commit_feedback.md) — 使用 Conventional Commits

## 项目相关
- [架构说明](architecture.md) — 微服务架构设计
- [API 规范](api_standards.md) — RESTful API 约定
```

## 编写规范

1. **一行一条**：每个记忆占一行
2. **简洁描述**：描述控制在 150 字符以内
3. **分类清晰**：使用标题组织不同类型
4. **链接准确**：确保链接到正确的文件

## 最佳实践

### 1. 按类型分组

```markdown
## 用户记忆
- [角色](user_role.md)
- [偏好](preferences.md)

## 反馈记忆
- [错误修正](error_fixes.md)
- [成功案例](success_cases.md)

## 项目记忆
- [架构](architecture.md)
- [工作流](workflow.md)

## 参考记忆
- [文档链接](docs_links.md)
- [工具链](toolchain.md)
```

### 2. 使用有意义的标题

```markdown
❌ - [文件1](a.md)
✅ - [用户角色定义](user_role.md) — 前端工程师，React 专家
```

### 3. 保持简洁

```markdown
❌ - [编码规范](coding.md) — 这个文档包含了我们项目中关于编码风格的所有规范，包括命名规则、文件组织、注释要求等详细内容
✅ - [编码规范](coding.md) — 命名规则、文件组织、注释规范
```

## 与 memory/ 目录的关系

```
.claude/memory/
├── MEMORY.md          # 索引文件（本文件）
├── user_role.md       # 记忆文件
├── coding_style.md    # 记忆文件
└── project_info.md    # 记忆文件
```

- `MEMORY.md` 是目录，指向各个记忆文件
- 记忆文件存储实际内容
- 每次会话开始时加载 `MEMORY.md`

## 注意事项

1. **不要写记忆内容**：`MEMORY.md` 只存放索引，不存放具体内容
2. **保持同步**：添加/删除记忆文件时同步更新索引
3. **定期清理**：删除过时的记忆和索引
4. **使用相对链接**：使用相对路径链接到记忆文件

## 示例模板

```markdown
# 记忆索引

## 用户记忆
<!-- 用户相关的记忆 -->

## 反馈记忆
<!-- 用户反馈和指导 -->

## 项目记忆
<!-- 项目背景和目标 -->

## 参考记忆
<!-- 外部资源链接 -->
```
