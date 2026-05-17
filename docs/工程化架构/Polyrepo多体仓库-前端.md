# Polyrepo 多体仓库（前端架构篇）

> 本文档专注于前端项目的 Polyrepo 架构实践

## 目录

- [什么是 Polyrepo](#一什么是-polyrepo)
- [前端 Polyrepo 的优势与劣势](#二前端-polyrepo-的优势与劣势)
- [适用场景](#三适用场景)
- [完整实现指南](#四完整实现指南)
- [代码共享方案](#五代码共享方案)
- [版本管理](#六版本管理)
- [CI/CD 配置](#七cicd-配置)
- [与 Monorepo 对比](#八polyrepo-vs-monorepo)
- [最佳实践](#九最佳实践)

---

## 一、什么是 Polyrepo

### 1.1 基本定义

**Polyrepo** = **Poly**（多个）+ **Repo**（仓库）

每个前端项目都有自己独立的 Git 仓库，这是最传统、最常见的代码组织方式。

### 1.2 前端 Polyrepo 的典型结构

```
GitHub 组织：company-frontend

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  company-web    │  │ company-admin   │  │ company-mobile  │
│  (官网 Vue3)    │  │ (后台 React)    │  │ (H5 Vue3)       │
│                 │  │                 │  │                 │
│  独立 Git 仓库  │  │  独立 Git 仓库  │  │  独立 Git 仓库  │
│  独立 CI/CD     │  │  独立 CI/CD     │  │  独立 CI/CD     │
│  独立部署       │  │  独立部署       │  │  独立部署       │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ company-ui-kit  │  │ company-shared  │
│ (组件库)        │  │ (工具库)        │
│                 │  │                 │
│ 发布到 npm      │  │ 发布到 npm      │
└─────────────────┘  └─────────────────┘

各项目通过 npm 安装共享代码
```

### 1.3 前端开发中的典型场景

```
场景：修改组件库并更新到多个应用

Polyrepo 方式：
1. 修改 company-ui-kit 组件
2. 构建 + 发布到 npm (v1.2.0 → v1.3.0)
3. 各应用更新依赖：pnpm update @company/ui-kit
4. 分别测试、部署

优点：
✅ 各应用独立发版，互不影响
✅ 组件库版本明确
✅ 适合不同团队维护

缺点：
❌ 流程繁琐，调试需要 npm link
❌ 跨项目修改需要多次 PR
```

---

## 二、前端 Polyrepo 的优势与劣势

### 2.1 核心优势

#### 优势 1：项目完全独立

```
前端项目独立性的体现：

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   官网项目       │    │  管理后台项目    │    │   H5 项目       │
│   company-web   │    │  company-admin  │    │ company-mobile  │
│                 │    │                 │    │                 │
│  自己的 Git     │    │  自己的 Git     │    │  自己的 Git     │
│  自己的 CI/CD   │    │  自己的 CI/CD   │    │  自己的 CI/CD   │
│  自己的部署     │    │  自己的部署     │    │  自己的部署     │
│  自己的发布节奏 │    │  自己的发布节奏 │    │  自己的发布节奏 │
└─────────────────┘    └─────────────────┘    └─────────────────┘

官网可以每小时发版        后台可以每周发版          H5 可以按需发版
互不影响！               互不影响！               互不影响！
```

#### 优势 2：灵活的技术栈

```
Polyrepo 允许各项目选择不同技术栈：

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  company-web    │    │ company-admin   │    │ company-mobile  │
│                 │    │                 │    │                 │
│  框架：Vue 3    │    │  框架：React 18 │    │  框架：Vue 3    │
│  状态：Pinia    │    │  状态：Redux    │    │  状态：Pinia    │
│  构建：Vite     │    │  构建：Webpack  │    │  构建：Vite     │
│  UI：自研组件库 │    │  UI：Ant Design │    │  UI：Vant      │
│  部署：Vercel   │    │  部署：Docker    │    │  部署：CDN     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

各项目完全自由选择技术栈！
```

#### 优势 3：减小仓库体积

```
Monorepo 的问题：
company-monorepo/
├── node_modules/     ← 所有依赖在一起
│   ├── vue/
│   ├── react/
│   ├── webpack/
│   └── 10000+ 个包...
└── Git 仓库体积巨大
   - clone 慢
   - IDE 索引慢
   - Git 操作慢

Polyrepo 的优势：
company-web/          company-admin/         company-mobile/
node_modules/         node_modules/          node_modules/
只包含 Vue 依赖       只包含 React依赖        只包含 Vue3依赖
~500MB               ~800MB                 ~400MB

✅ 每个 repo 体积小，操作快
✅ 只 clone 需要的项目
✅ Git 历史清晰
```

### 2.2 核心劣势

#### 劣势 1：代码共享困难

```
场景：多个应用共享相同的组件

Monorepo 方式：
修改组件 packages/ui/Button.vue
↓ 自动热更新
所有应用立即看到效果
✅ 即时反馈，开发体验好

Polyrepo 方式：
1. 修改组件库 company-ui-kit/Button.vue
2. 构建 + 发布到 npm
3. 各应用更新依赖 pnpm update
4. 重启开发服务器
5. 看到效果
❌ 流程繁琐，开发体验差
```

#### 劣势 2：跨项目修改复杂

```
场景：组件库 API 变更，需要同步更新所有应用

Monorepo 方式：
一次 PR 包含所有改动：
├── packages/ui/        ← 组件 API 修改
├── apps/web/          ← Web 应用适配
└── apps/admin/        ← Admin 应用适配
✅ 一次 Code Review
✅ 一次测试
✅ 确保所有应用同步更新

Polyrepo 方式：
1. company-ui-kit 提交 PR #1（组件 API 修改）
2. 发布新版本 v2.0.0
3. company-web 提交 PR #2（适配新 API）
4. company-admin 提交 PR #3（适配新 API）
5. 分别 Code Review（3次）
6. 分别测试
7. 分别部署
❌ 流程复杂，容易出错
```

---

## 三、适用场景

### 3.1 ✅ 适合 Polyrepo 的前端场景

| 场景 | 说明 | 例子 |
|------|------|------|
| **完全独立的产品** | 不同产品，无代码共享 | 公司官网 + 内部管理系统 |
| **技术栈差异大** | 各项目使用不同框架 | Vue 官网 + React 后台 + 小程序 |
| **不同团队负责** | 不同团队/外包公司负责 | 前端团队 A 负责 Web，团队 B 负责 Admin |
| **发布周期差异大** | 发版节奏完全不同 | 营销页(日发) + 核心产品(周发) |
| **权限隔离需求** | 需要严格的访问控制 | 敏感项目 + 对外包开放的项目 |
| **开源组件库** | 独立的开源项目 | Element UI、Ant Design 各自独立 |

### 3.2 ❌ 不适合 Polyrepo 的前端场景

| 场景 | 原因 |
|------|------|
| **频繁共享组件** | 每次修改都需要发布 npm 包 |
| **设计系统维护** | 组件库和应用需要紧密配合开发 |
| **统一技术栈** | 多个项目使用相同技术，无差异化需求 |
| **小团队** | 团队规模小，多仓库管理成本高 |

---

## 四、完整实现指南

### 4.1 创建共享 UI 组件库

```bash
# 1. 创建组件库仓库
mkdir company-ui-kit
cd company-ui-kit
git init

# 2. 初始化项目
pnpm init

# 3. package.json 配置
{
  "name": "@company/ui-kit",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./style.css": "./dist/style.css"
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && vue-tsc --emitDeclarationOnly",
    "release": "changeset publish"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}

# 4. 创建 Button 组件
# src/components/Button/Button.vue
<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  loading: false
})
</script>

<template>
  <button :class="['c-btn', `c-btn--${type}`, `c-btn--${size}`]">
    <slot />
  </button>
</template>

<style scoped>
.c-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.c-btn--primary { background: #1890ff; color: white; }
.c-btn--danger { background: #ff4d4f; color: white; }
</style>

# 5. 构建、发布
pnpm install
pnpm build
pnpm publish
```

### 4.2 在应用中使用组件库

```bash
# 创建前端应用
mkdir company-web
cd company-web
pnpm create vite@latest . --template vue-ts

# 安装组件库
pnpm add @company/ui-kit

# 使用组件
# src/App.vue
<script setup lang="ts">
import { Button } from '@company/ui-kit'
import '@company/ui-kit/style.css'
</script>

<template>
  <Button type="primary">点击我</Button>
</template>
```

### 4.3 完整的项目结构

```
company-frontend/
├── company-ui-kit/              ← UI 组件库仓库
│   ├── src/
│   │   ├── components/
│   │   └── index.ts
│   ├── package.json
│   └── .git/
│
├── company-web/                 ← 官网仓库
│   ├── src/
│   ├── package.json
│   └── .git/
│
├── company-admin/               ← 管理后台仓库
│   ├── src/
│   ├── package.json
│   └── .git/
│
└── company-shared/              ← 工具库仓库
    ├── src/
    ├── package.json
    └── .git/
```

---

## 五、代码共享方案

### 5.1 通过 npm 包共享（推荐）

```
开发流程：
1. 本地开发共享库 company-shared/
2. 发布到 npm pnpm publish
3. 其他项目安装 pnpm add @company/shared
4. 使用 import { xxx } from '@company/shared'
```

### 5.2 本地调试方案

```bash
# 方案一：npm link
cd company-ui-kit
pnpm link --global

cd ../company-web
pnpm link --global @company/ui-kit

# 方案二：使用本地路径（package.json）
{
  "dependencies": {
    "@company/ui-kit": "file:../company-ui-kit"
  }
}

# 方案三：pnpm patch（临时修改）
pnpm patch @company/ui-kit
```

---

## 六、版本管理

### 6.1 语义化版本

```
版本格式：MAJOR.MINOR.PATCH

@company/ui-kit@1.0.0  → 初始发布
@company/ui-kit@1.0.1  → 修复 bug
@company/ui-kit@1.1.0  → 新增功能
@company/ui-kit@2.0.0  → 破坏性变更
```

### 6.2 使用 Changesets

```bash
# 安装
pnpm add -D @changesets/cli

# 添加变更
pnpm changeset

# 生成版本
pnpm changeset version

# 发布
pnpm changeset publish
```

---

## 七、CI/CD 配置

### 7.1 各仓库独立的 CI/CD

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### 7.2 组件库自动发布

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 八、Polyrepo vs Monorepo

### 8.1 快速对比

| 维度 | Polyrepo | Monorepo |
|------|----------|----------|
| 仓库数量 | 多个独立 | 单一仓库 |
| 代码共享 | 通过 npm | 直接引用 |
| 跨项目修改 | 需要 PR × N | 一次 PR |
| 技术栈 | ✅ 各自选择 | ⚠️ 统一 |
| 发布周期 | ✅ 各自独立 | ⚠️ 统一 |
| 学习成本 | ✅ 低 | ⚠️ 中 |

### 8.2 决策树

```
你有多个前端项目？
       ↓
项目之间需要共享代码？
       ↓           ↓
      是           否 → Polyrepo
       ↓
项目使用相同技术栈？
       ↓           ↓
      是           否 → Polyrepo
       ↓
由同一团队维护？
       ↓
      是
       ↓
  考虑 Monorepo
```

---

## 九、最佳实践

### 9.1 统一代码规范

```bash
# 创建共享配置仓库
company-coding-standards/
├── eslint-config/
├── prettier-config/
└── tsconfig-base/

# 各项目使用
pnpm add -D @company/eslint-config
```

### 9.2 统一的 README 模板

```markdown
# 项目名称

## 简介
简要描述

## 技术栈
- 框架：Vue 3 / React 18
- 构建：Vite / Webpack
- UI：@company/ui-kit

## 安装
pnpm install

## 开发
pnpm dev

## 相关仓库
- [@company/ui-kit](链接) - UI 组件库
```

### 9.3 统一的 Git 工作流

```
main → develop → feature/* → develop → main

1. 从 develop 创建 feature 分支
2. 完成开发后 PR 回 develop
3. Code Review 通过后合并
4. 定期从 develop 发布到 main
```

---

## 十、总结

### 10.1 选择 Polyrepo 如果你需要

✅ 项目完全独立，无代码共享
✅ 不同技术栈（Vue + React 混合）
✅ 不同团队负责
✅ 需要严格权限控制
✅ 发布周期差异大
✅ 想要最简单的管理方式

### 10.2 快速开始

```bash
# 创建第一个仓库
mkdir my-project-1
cd my-project-1
git init
pnpm init
# ... 开发 ...
git push

# 创建第二个仓库
cd ..
mkdir my-project-2
cd my-project-2
git init
pnpm init
# ... 开发 ...
git push
```

### 10.3 相关资源

- [pnpm 文档](https://pnpm.io/)
- [语义化版本](https://semver.org/)
- [Changesets](https://github.com/changesets/changesets)
- [前端单体仓库文档](./前端单体仓库.md)
