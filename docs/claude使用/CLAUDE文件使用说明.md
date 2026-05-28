# CLAUDE.md 使用说明

## 什么是 CLAUDE.md

`CLAUDE.md` 是**项目级配置文件**，你可以把它理解为项目的"使用说明书"或"操作指南"。每次打开项目与 Claude 对话时，它会自动被加载，告诉 Claude 这个项目的规则、约定和特殊要求。

> **通俗理解**：想象你是一位新加入的团队成员，`CLAUDE.md` 就是老员工递给你的那份"项目规则手册"，让你快速了解这个项目该怎么写代码、有哪些注意事项。

## 文件位置

```
项目根目录/.claude/CLAUDE.md
```

## 为什么需要 CLAUDE.md

### 问题场景

没有 `CLAUDE.md` 时，每次与 Claude 对话你可能需要重复说：
- "我们项目使用 Vue 3 + TypeScript"
- "组件文件要放在 `src/components` 目录"
- "测试文件必须以 `.spec.ts` 结尾"
- "不要用 ESLint 禁止的那些语法"

### 解决方案

有了 `CLAUDE.md`，这些规则只需写一次，Claude 会自动遵守，大大提高效率。

## 文件格式

### 基本结构

```markdown
# 项目名称 - Claude 指令

## 项目概述
<!-- 简要描述项目是做什么的 -->

## 技术栈
<!-- 列出使用的技术和框架 -->

## 目录结构
<!-- 说明项目的文件组织方式 -->

## 开发规范
<!-- 代码风格、命名约定等 -->

## 工作流程
<!-- 开发、测试、部署的流程 -->

## 常用命令
<!-- 项目常用的命令 -->

## 注意事项
<!-- 需要特别注意的地方 -->
```

## 可配置的内容

### 1. 技术栈说明

告诉 Claude 项目使用了哪些技术，让它给出更合适的建议。

```markdown
## 技术栈

### 前端
- 框架：Vue 3
- 语言：TypeScript
- 状态管理：Pinia
- 路由：Vue Router
- UI 组件：Element Plus

### 后端
- 框架：Express.js
- 数据库：PostgreSQL
- ORM：Prisma
```

### 2. 目录结构说明

让 Claude 知道项目文件应该如何组织。

```markdown
## 目录结构

```
src/
├── assets/       # 静态资源（图片、字体等）
├── components/   # 可复用组件
├── composables/  # 组合式函数
├── pages/        # 页面组件
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── utils/        # 工具函数
├── types/        # TypeScript 类型定义
└── main.ts       # 入口文件
```

### 3. 代码风格约定

指定代码应该如何编写。

```markdown
## 代码风格

### 命名规范
- 组件文件：使用 PascalCase，如 `UserProfile.vue`
- 工具文件：使用 camelCase，如 `formatDate.ts`
- 常量：使用 UPPER_SNAKE_CASE，如 `API_BASE_URL`

### 组件编写
- 优先使用 `<script setup>` 语法
- Props 使用 TypeScript 接口定义
- 使用组合式 API 而非选项式 API

### 禁止的做法
- ❌ 禁止使用 `any` 类型
- ❌ 禁止在模板中编写复杂逻辑
- ❌ 禁止使用 `var` 声明变量
```

### 4. 工作流程指南

说明开发和部署的标准流程。

```markdown
## 开发流程

### 功能开发
1. 从 main 分支创建功能分支：`feature/功能名称`
2. 开发完成后运行测试：`npm test`
3. 检查代码风格：`npm run lint`
4. 修复所有错误和警告

### 提交规范
- 使用 Conventional Commits 格式
- feat: 新功能
- fix: 问题修复
- docs: 文档更新
- style: 代码格式（不影响功能）
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

### 合并要求
- 代码必须通过 CI 检查
- 至少一人代码审查
- 关联相关的 Issue
```

### 5. 常用命令

列出项目常用的命令，方便 Claude 执行。

```markdown
## 常用命令

| 命令 | 说明 |
|------|------|
| npm dev | 启动开发服务器（端口 5173） |
| npm build | 构建生产版本 |
| npm test | 运行测试 |
| npm run lint | 代码风格检查 |
| npm run format | 代码格式化 |
| npm run typecheck | TypeScript 类型检查 |
```

### 6. 特殊注意事项

提醒 Claude 需要特别注意的地方。

```markdown
## 注意事项

### 禁止修改
- 不要直接修改 `src/core/` 中的文件，这些是核心库文件
- 不要修改 `public/config.json`，这是运行时配置

### 特殊处理
- API 请求必须包含认证 token
- 所有日期使用 ISO 8601 格式
- 错误必须上报到监控系统

### 兼容性要求
- 支持 Chrome 最新版本
- 支持 Safari 最新版本
- 支持 Edge 最新版本
```

## 完整示例

```markdown
# 电商管理后台 - Claude 指令

## 项目概述

这是一个基于 Vue 3 + TypeScript 的电商管理后台系统，用于管理商品、订单、用户等业务数据。

## 技术栈

### 前端技术
- **框架**：Vue 3.4+（使用 Composition API）
- **语言**：TypeScript 5.0+
- **构建工具**：Vite 5.0+
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **UI 组件库**：Element Plus
- **HTTP 客户端**：Axios
- **CSS 预处理**：Sass

### 代码规范
- **检查工具**：ESLint + Prettier
- **提交规范**：Conventional Commits
- **Git Hooks**：Husky + lint-staged

## 目录结构

```
src/
├── api/              # API 请求封装
│   └── modules/      # 各模块 API
├── assets/           # 静态资源
├── components/       # 全局组件
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── styles/           # 全局样式
├── utils/            # 工具函数
├── views/            # 页面视图
├── types/            # TypeScript 类型定义
└── main.ts           # 应用入口
```

## 代码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserProfile.vue` |
| 工具文件 | camelCase | `formatDate.ts` |
| 接口/类型 | PascalCase | `interface UserInfo` |
| 常量 | UPPER_SNAKE_CASE | `const API_BASE_URL` |
| 变量/函数 | camelCase | `function getUserData()` |

### 组件编写规范

```vue
<script setup lang="ts">
// 1. 导入放在最前面
import { ref, computed } from 'vue'

// 2. Props 定义
interface Props {
  title: string
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 3. Emits 定义
interface Emits {
  (e: 'update', value: number): void
}
const emit = defineEmits<Emits>()

// 4. 响应式状态
const count = ref(props.count)

// 5. 计算属性
const doubled = computed(() => count.value * 2)

// 6. 方法
function increment() {
  count.value++
  emit('update', count.value)
}
</script>
```

### API 请求规范

- 所有 API 请求放在 `src/api/modules/` 目录
- 使用统一的请求封装（已配置拦截器和错误处理）
- 请求函数必须明确返回类型

```typescript
// src/api/modules/user.ts
import request from '../request'
import type { UserInfo, LoginParams } from '@/types'

export function getUserInfo(id: number) {
  return request<UserInfo>({
    url: `/users/${id}`,
    method: 'GET'
  })
}

export function login(data: LoginParams) {
  return request<{ token: string }>({
    url: '/auth/login',
    method: 'POST',
    data
  })
}
```

## 工作流程

### 开发新功能

```bash
# 1. 创建分支
git checkout -b feature/订单管理

# 2. 开发并实时检查
npm run lint          # 每次保存都自动格式化
npm run typecheck     # 确保没有类型错误

# 3. 提交前检查
npm test             # 运行测试

# 4. 提交代码
git commit -m "feat: 添加订单管理功能"

# 5. 推送并创建 PR
git push origin feature/订单管理
```

### 提交信息格式

```bash
feat: 添加用户登录功能
fix: 修复订单金额计算错误
docs: 更新 API 文档
style: 统一代码缩进
refactor: 重构用户状态管理
test: 添加订单模块测试用例
chore: 更新依赖版本
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm dev` | 启动开发服务器（http://localhost:5173） |
| `npm build` | 构建生产版本到 `dist/` 目录 |
| `npm preview` | 预览构建结果 |
| `npm test` | 运行测试套件 |
| `npm run lint` | 检查代码风格 |
| `npm run format` | 自动格式化代码 |
| `npm run typecheck` | TypeScript 类型检查 |

## 注意事项

### ⚠️ 禁止操作

- ❌ 不要直接修改 `node_modules/` 中的文件
- ❌ 不要在组件中使用 `any` 类型
- ❌ 不要将敏感信息（密钥、密码）提交到代码库
- ❌ 不要在生产环境构建中包含调试代码

### ⚠️ 必须遵守

- ✅ 所有新功能必须编写测试
- ✅ 所有 API 调用必须处理错误情况
- ✅ 所有用户输入必须进行验证和清理
- ✅ 敏感操作需要二次确认

### 🔒 安全规范

- 用户密码绝不记录日志
- 所有外部输入必须进行 XSS 防护
- API 密钥使用环境变量存储
- 生产环境禁止显示详细错误信息

## 快速参考

### 项目信息

- **项目名称**：电商管理后台
- **代码仓库**：https://github.com/example/admin
- **文档地址**：https://docs.example.com
- **测试环境**：https://admin-test.example.com
- **生产环境**：https://admin.example.com

### 联系方式

- **技术负责人**：张三
- **架构师**：李四
- **问题反馈**：在 GitHub 提 Issue
```

## 最佳实践

### 1. 保持简洁

只写真正需要 Claude 知道的内容。如果项目中某些信息可以通过 README 或其他文档获取，就不需要在 `CLAUDE.md` 中重复。

### 2. 分类清晰

使用标题和列表来组织内容，让信息层次分明、易于查找。

### 3. 及时更新

当项目的技术栈、规范或流程发生变化时，同步更新 `CLAUDE.md`。

### 4. 团队同步

`CLAUDE.md` 应该提交到代码库，让整个团队共享同一份规则。

## 与其他配置的关系

| 文件 | 作用范围 | 是否提交 |
|------|----------|----------|
| `CLAUDE.md` | 项目级规则 | ✅ 应提交 |
| `.claude/rules/*.md` | 特定路径规则 | ✅ 应提交 |
| `settings.json` | 权限和配置 | ✅ 应提交 |
| `settings.local.json` | 个人配置覆盖 | ❌ 不提交 |

## 常见问题

### Q：CLAUDE.md 和 README 有什么区别？

**A**：README 是给人类开发者看的，包含项目介绍、安装步骤、使用方法等；CLAUDE.md 是给 AI 助手看的，包含代码规范、工作流程、技术约定等。两者可以有关联，但服务于不同的读者。

### Q：规则太多会不会影响性能？

**A**：不会。`CLAUDE.md` 的内容在每次会话开始时一次性加载，对性能的影响微乎其微。但建议保持简洁，只包含必要信息。

### Q：可以覆盖 CLAUDE.md 中的规则吗？

**A**：可以。在对话中直接告诉 Claude 临时修改规则即可，但这只影响当前会话。永久修改应该更新文件。

### Q：项目没有 .claude 目录怎么办？

**A**：在项目根目录创建 `.claude` 目录，然后创建 `CLAUDE.md` 文件即可。
