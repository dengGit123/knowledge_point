# Polyrepo 多体仓库

## 一、什么是 Polyrepo

### 1.1 基本定义

**Polyrepo** = **Poly**（多个）+ **Repo**（仓库）

简单来说，就是**每个项目**都有**自己独立的 Git 仓库**进行管理。

这是最传统、最常见的一种代码组织方式，也叫 **Multi-repo**（多仓库）。

### 1.2 形象理解

想象一个大型公司的办公方式：

```
Polyrepo 方式                     Monorepo 方式
─────────────────────────────────────────────────────────
独立办公园区                       总部大楼
├── 财务部（独立园区）              ├── 1楼：财务部
│   ├── 独立门禁                  │
│   ├── 独立食堂                  │   所有部门在同一栋楼
│   └── 独立管理                  │   转身就能交流
├── 技术部（独立园区）
│   ├── 独立门禁
│   ├── 独立食堂
│   └── 独立管理
└── 人事部（独立园区）
    ├── 独立门禁
    ├── 独立食堂
    └── 独立管理

各部门完全独立，                   各部门共享资源，
互不干扰，自主管理                 统一管理
```

### 1.3 目录结构对比

```
┌─────────────────── Polyrepo 多仓库 ───────────────────┐
│                                                           │
│  GitHub / GitLab 仓库列表：                               │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ company-frontend│  │ company-backend │              │
│  │                 │  │                 │              │
│  │ ├── src/        │  │ ├── src/        │              │
│  │ ├── package.json│  │ ├── package.json│              │
│  │ └── .git/       │  │ └── .git/       │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ company-admin   │  │ company-shared  │              │
│  │                 │  │                 │              │
│  │ ├── src/        │  │ ├── src/        │              │
│  │ ├── package.json│  │ ├── package.json│              │
│  │ └── .git/       │  │ └── .git/       │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                           │
│   4个独立仓库 → 4次 clone → 4套 node_modules              │
│   → 独立部署、独立管理                                    │
└───────────────────────────────────────────────────────────┘

┌─────────────────── Monorepo 单仓库 ───────────────────┐
│                                                           │
│  company-monorepo/                                        │
│  ├── packages/                                            │
│  │   ├── frontend/        ← 前端项目                      │
│  │   ├── backend/         ← 后端项目                      │
│  │   ├── admin/           ← 管理后台                      │
│  │   └── shared/          ← 共享代码                      │
│  ├── package.json         ← 根配置文件                    │
│  ├── pnpm-workspace.yaml ← workspace 配置                │
│  └── .git/                ← 只有一个 Git 仓库             │
│                                                           │
│   1个仓库 → 1次 clone → 共享 node_modules                 │
└───────────────────────────────────────────────────────────┘
```

### 1.4 Polyrepo 的典型工作流程

```
┌─────────────────────────────────────────────────────────┐
│                    开发者工作流程                        │
└─────────────────────────────────────────────────────────┘

1. 需要开发新功能
   ↓
2. 确定涉及哪些仓库
   ↓
3. 分别 clone 各个仓库
   ↓
4. 在各自仓库中开发
   ↓
5. 分别提交 PR（Pull Request）
   ↓
6. 分别进行 Code Review
   ↓
7. 分别部署到测试环境
   ↓
8. 测试通过后，分别部署到生产环境
```

---

## 二、Polyrepo 的作用/优势

### 2.1 独立性与隔离

```
场景：不同团队负责不同项目

Polyrepo 方式：
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端团队       │    │   后端团队       │    │   算法团队       │
│                 │    │                 │    │                 │
│  web-app 仓库   │    │  api-server仓库  │    │  ml-model 仓库  │
│                 │    │                 │    │                 │
│  自己的 Git     │    │  自己的 Git     │    │  自己的 Git     │
│  自己的 CI/CD   │    │  自己的 CI/CD   │    │  自己的 CI/CD   │
│  自己的部署     │    │  自己的部署     │    │  自己的部署     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
     ↓ 独立发布              ↓ 独立发布              ↓ 独立发布

互不影响，各自为政
```

### 2.2 精细的权限控制

```
Polyrepo 权限管理：

GitHub/GitLab 仓库设置
├── web-app/
│   ├── 团队成员：@frontend-team
│   ├── 访问权限：只有前端团队可见
│   └── 外部协作者：可单独添加
├── api-server/
│   ├── 团队成员：@backend-team
│   ├── 访问权限：只有后端团队可见
│   └── 外部协作者：可单独添加
└── company-secrets/
    ├── 团队成员：@admin-only
    ├── 访问权限：高度机密，极少数人
    └── 保护分支：严格审查

优势：
✅ 敏感项目可以完全隔离
✅ 外部协作者只能访问特定项目
✅ 不同团队可以有不同的规则
```

### 2.3 灵活的发布周期

```
场景：各项目发布频率不同

Polyrepo 方式：

web-app           → 每周发布 2-3 次
├── 快速迭代      ↓
├── 敏捷开发      修改 → 测试 → 发布（2小时）
└── 用户反馈快
                    独立进行，互不影响

api-server        → 每月发布 1 次
├── 稳定为主      ↓
├── 变更谨慎      修改 → 测试 → 发布（2周）
└── 兼容性优先
                    独立进行，互不影响

ml-model          → 每季度发布 1 次
├── 研发周期长    ↓
├── 实验性质      研究 → 训练 → 部署（3个月）
└── 变更较少
                    独立进行，互不影响
```

### 2.4 减少不必要的干扰

```
Polyrepo 干扰隔离：

场景 1：某个仓库出现紧急问题
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  web-app        │    │  admin-panel    │    │  api-server     │
│  发现 BUG       │    │  正常开发       │    │  正常开发       │
│                 │    │                 │    │                 │
│  紧急修复       │    │  不受影响       │    │  不受影响       │
│  紧急发布       │    │  继续开发       │    │  继续开发       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

场景 2：CI/CD 配置修改
┌─────────────────┐    ┌─────────────────┐
│  web-app        │    │  admin-panel    │
│  需要升级 CI    │    │  保持原有配置   │
│                 │    │                 │
│  只修改自己的   │    │  不受任何影响   │
│  .github/       │    │  继续正常构建   │
└─────────────────┘    └─────────────────┘
```

### 2.5 更清晰的项目边界

```
Polyrepo 边界清晰：

每个仓库都有明确的：
├── 独立的 README.md        ← 项目文档
├── 独立的 CHANGELOG.md     ← 变更记录
├── 独立的 package.json     ← 依赖声明
├── 独立的 LICENSE          ← 开源协议
├── 独立的 Issues           ← 问题追踪
├── 独立的 Wiki             │项目知识库
└── 独立的 Release Notes    ← 版本说明

对外就是一个完整、独立的产品
```

---

## 三、使用场景

### 3.1 ✅ 适合使用 Polyrepo 的场景

| 场景 | 说明 | 例子 |
|------|------|------|
| **完全独立的项目** | 项目之间没有代码共享 | 个人博客 + 公司官网 + 开源工具 |
| **不同团队负责** | 不同团队/公司负责不同项目 | 外包项目、合作开发 |
| **敏感项目隔离** | 需要严格的权限控制 | 金融系统、政府项目 |
| **发布周期差异大** | 各项目发布节奏完全不同 | 核心服务(月发) + 营销页(日发) |
| **开源项目** | 独立的开源库 | React、Vue、Express 各自独立 |
| **微服务架构** | 每个服务独立部署 | 用户服务、订单服务、支付服务 |

### 3.2 ❌ 不适合使用 Polyrepo 的场景

| 场景 | 原因 |
|------|------|
| **频繁跨项目改动** | 需要多个 PR、多次测试 |
| **共享大量代码** | 需要发布 npm 包或复制代码 |
| **统一工具链** | 各自维护配置，容易不一致 |
| **原子性修改** | 无法保证多个项目同步发布 |

### 3.3 真实案例

```
┌─────────────────────────────────────────────────────┐
│  公司/项目          │  使用的架构                     │
├─────────────────────────────────────────────────────┤
│  Netflix            │  Polyrepo（微服务架构）        │
│  Amazon             │  Polyrepo（服务独立仓库）      │
│  Uber               │  Polyrepo（数千个仓库）        │
│  GitHub             │  各产品独立仓库                │
│  │  ├─ github.com                                         │
│  │  ├─ GitHub Actions                                    │
│  │  └─ GitHub Desktop                                    │
│  开源 npm 包       │  Polyrepo（每个包独立仓库）      │
│  │  ├─ express                                           │
│  │  ├─ lodash                                            │
│  │  └─ axios                                             │
└─────────────────────────────────────────────────────┘
```

### 3.4 Polyrepo vs Monorepo 快速对比

| 维度 | Polyrepo | Monorepo |
|------|----------|----------|
| **代码共享** | 通过 npm 包 | 直接引用 |
| **跨项目修改** | 需要 PR × N | 一次 PR |
| **权限控制** | 精细 | 粗粒度 |
| **CI/CD** | 各自配置 | 统一配置 |
| **发布速度** | 快（只构建一个） | 慢（构建全部） |
| **学习成本** | 低（传统方式） | 中（需要工具） |
| **适用规模** | 任何规模 | 中小型更佳 |

---

## 四、如何实现 - 基础方案

### 4.1 Polyrepo 的本质

```
Polyrepo 不需要特殊工具！

本质上就是：
┌─────────────────────────────────────────────────────┐
│  1. 创建多个 Git 仓库                                │
│  2. 每个仓库独立开发                                 │
│  3. 需要共享代码时，发布为 npm 包                    │
│  4. 各自配置 CI/CD                                   │
└─────────────────────────────────────────────────────┘

这就是我们最熟悉的开发方式！
```

### 4.2 共享代码的方式

```
Polyrepo 中共享代码的方案：

方案一：发布到 npm（推荐）
┌─────────────────┐         ┌─────────────────┐
│  utils-lib      │────────▶│     npm         │
│  仓库           │  发布   │     仓库        │
└─────────────────┘         └─────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ↓                 ↓                 ↓
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   web-app    │  │  admin-app   │  │ mobile-app  │
            │ npm install  │  │ npm install  │  │ npm install  │
            └──────────────┘  └──────────────┘  └──────────────┘

方案二：Git Submodule（不推荐，复杂）
方案三：直接复制代码（不推荐，难维护）
```

---

## 五、实现步骤 - 完整示例

### 5.1 场景设定

我们要创建一个完整的 Polyrepo 架构：
- **web-app**：前端应用（Vue3）
- **api-server**：后端服务（Node.js）
- **shared-utils**：共享工具库

### 5.2 创建共享工具库

```bash
# 1. 创建仓库目录
mkdir company-shared-utils
cd company-shared-utils

# 2. 初始化 Git
git init
git remote add origin https://github.com/yourname/company-shared-utils.git

# 3. 初始化项目
pnpm init

# 4. 修改 package.json
cat > package.json << EOF
{
  "name": "@company/shared-utils",
  "version": "1.0.0",
  "description": "公司共享工具库",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest",
    "lint": "eslint src",
    "publish:public": "npm publish",
    "publish:beta": "npm publish --tag beta"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF

# 5. 创建源码
mkdir src
cat > src/index.ts << EOF
// 格式化日期
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN');
}

// 格式化数字
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
EOF

# 6. 创建 TypeScript 配置
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
EOF

# 7. 构建
pnpm install
pnpm build

# 8. 提交代码
git add .
git commit -m "feat: initial commit"
git push -u origin main

# 9. 发布到 npm（先在 npmjs.com 注册账号）
pnpm publish:public
```

### 5.3 创建前端应用

```bash
# 1. 创建新的 Git 仓库
cd ..
mkdir company-web-app
cd company-web-app

# 2. 初始化 Git
git init
git remote add origin https://github.com/yourname/company-web-app.git

# 3. 创建 Vue3 项目
pnpm create vite@latest . --template vue-ts

# 4. 安装共享工具库
pnpm add @company/shared-utils

# 5. 使用共享工具
cat > src/App.vue << EOF
<script setup lang="ts">
import { formatDate, formatNumber, debounce } from '@company/shared-utils';

const handleSearch = debounce((keyword: string) => {
  console.log('搜索:', keyword);
}, 300);

const currentDate = formatDate(new Date());
const largeNumber = formatNumber(1234567.89);
</script>

<template>
  <div class="app">
    <h1>公司官网</h1>
    <p>今天日期：{{ currentDate }}</p>
    <p>数字格式化：{{ largeNumber }}</p>
    <input
      type="text"
      placeholder="搜索..."
      @input="e => handleSearch((e.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
}
</style>
EOF

# 6. 配置 .gitignore
cat > .gitignore << EOF
# 依赖
node_modules/

# 构建产物
dist/

# 本地环境文件
.env.local

# 编辑器
.vscode/
.idea/

# 日志
*.log
EOF

# 7. 提交代码
git add .
git commit -m "feat: initial commit with shared utils"
git push -u origin main
```

### 5.4 创建后端服务

```bash
# 1. 创建新的 Git 仓库
cd ..
mkdir company-api-server
cd company-api-server

# 2. 初始化 Git
git init
git remote add origin https://github.com/yourname/company-api-server.git

# 3. 初始化项目
pnpm init

# 4. 修改 package.json
cat > package.json << EOF
{
  "name": "company-api-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "lint": "eslint src"
  },
  "dependencies": {
    "@company/shared-utils": "^1.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

# 5. 创建源码
mkdir src
cat > src/index.ts << EOF
import express from 'express';
import cors from 'cors';
import { formatDate, formatNumber } from '@company/shared-utils';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: formatDate(new Date()),
    server: 'company-api-server'
  });
});

app.get('/api/stats', (req, res) => {
  const stats = {
    users: 1234567,
    orders: 98765.43,
    revenue: 1234567.89
  };

  res.json({
    ...stats,
    formatted: {
      users: formatNumber(stats.users),
      orders: formatNumber(stats.orders),
      revenue: formatNumber(stats.revenue)
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
EOF

# 6. 创建 TypeScript 配置
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
EOF

# 7. 创建 .gitignore
cat > .gitignore << EOF
node_modules/
dist/
.env
*.log
EOF

# 8. 安装依赖并提交
pnpm install
git add .
git commit -m "feat: initial API server"
git push -u origin main
```

### 5.5 完整的 Polyrepo 结构

```
GitHub/GitLab 组织：company

├── company-shared-tools/    ← 共享工具仓库
│   ├── src/
│   ├── package.json
│   ├── README.md
│   └── .git/
│
├── company-web-app/         ← 前端应用仓库
│   ├── src/
│   ├── package.json
│   ├── README.md
│   └── .git/
│
├── company-admin-panel/     ← 管理后台仓库
│   ├── src/
│   ├── package.json
│   ├── README.md
│   └── .git/
│
├── company-api-server/      ← 后端服务仓库
│   ├── src/
│   ├── package.json
│   ├── README.md
│   └── .git/
│
└── company-docs/            ← 文档站点仓库
    ├── docs/
    ├── package.json
    ├── README.md
    └── .git/
```

---

## 六、CI/CD 配置

### 6.1 各仓库独立的 CI/CD

```yaml
# company-web-app/.github/workflows/ci.yml

name: Web App CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

```yaml
# company-api-server/.github/workflows/ci.yml

name: API Server CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        run: |
          # 部署到服务器的命令
          ssh user@server "cd /app && git pull && pnpm install && pnpm build && pm2 restart api"
```

### 6.2 共享的 GitHub Actions

```yaml
# .github/workflows reusable actions 可以放在一个专门的仓库中

# company-shared-actions/.github/workflows/nodejs-ci.yml
name: Node.js CI

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

---

## 七、版本管理策略

### 7.1 语义化版本（Semantic Versioning）

```
版本格式：MAJOR.MINOR.PATCH

┌─────────────────────────────────────────────────────┐
│  1.0.0   2.0.0   2.1.0   2.1.1                     │
│  │       │       │       │                          │
│  │       │       │       └── PATCH：修复 BUG        │
│  │       │       │                                  │
│  │       │       └── MINOR：新增功能（向后兼容）     │
│  │       │                                          │
│  │       └── MAJOR：破坏性更新                      │
│  │                                                  │
│  └── 初始版本                                        │
└─────────────────────────────────────────────────────┘

示例：
@company/shared-utils@1.0.0  → 初始发布
@company/shared-utils@1.0.1  → 修复 bug
@company/shared-utils@1.1.0  → 新增 formatDate 函数
@company/shared-utils@2.0.0  → API 重大变更，不兼容 1.x
```

### 7.2 依赖版本控制

```json
// package.json 中的版本声明

{
  "dependencies": {
    // 精确版本：只安装 1.0.0
    "@company/shared-utils": "1.0.0",

    // 波浪号：安装 1.0.x 的最新版（不包含 1.1.0）
    "@company/shared-utils": "~1.0.0",

    // 插入号：安装 1.x.x 的最新版（不包含 2.0.0）
    "@company/shared-utils": "^1.0.0",

    // 大于等于：安装 1.0.0 及以上
    "@company/shared-utils": ">=1.0.0",

    // 最新版本：总是安装最新版（风险高）
    "@company/shared-utils": "*",

    // 预发布版本
    "@company/shared-utils": "beta",
    "@company/shared-utils": "next"
  }
}
```

### 7.3 使用 Changesets 管理版本

```bash
# 安装 changesets
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init

# 添加变更记录
pnpm changeset

# 选择变更类型：
#   patch - 修复 bug (1.0.0 → 1.0.1)
#   minor - 新功能 (1.0.0 → 1.1.0)
#   major - 破坏性变更 (1.0.0 → 2.0.0)

# 生成版本号和 CHANGELOG
pnpm changeset version

# 发布到 npm
pnpm changeset publish
```

---

## 八、最佳实践

### 8.1 仓库组织建议

```
GitHub/GitLab 组织结构：

company/                          ← 组织名
├── team-frontend/                ← 前端团队
│   ├── web-app/
│   ├── admin-panel/
│   └── mobile-app/
├── team-backend/                 ← 后端团队
│   ├── api-gateway/
│   ├── user-service/
│   └── order-service/
├── team-devops/                  ← 运维团队
│   ├── deployment-scripts/
│   └── monitoring/
├── shared/                       ← 共享资源
│   ├── shared-utils/
│   ├── shared-types/
│   └── shared-ui-components/
└── docs/                         ← 文档
    ├── api-docs/
    └── developer-guide/
```

### 8.2 统一代码规范

虽然项目独立，但建议统一代码风格：

```bash
# 创建共享配置仓库
company-coding-standards/

├── eslint-config/
│   ├── index.js
│   └── package.json
├── prettier-config/
│   └── index.json
└── tsconfig-base/
    └── base.json

# 发布为 npm 包
@company/eslint-config
@company/prettier-config
@company/tsconfig

# 各项目引用
pnpm add -D @company/eslint-config @company/prettier-config
```

### 8.3 统一的 README 模板

```markdown
# 项目名称

## 简介
简要描述项目用途

## 安装
\`\`\`bash
pnpm install
\`\`\`

## 开发
\`\`\`bash
pnpm dev
\`\`\`

## 构建
\`\`\`bash
pnpm build
\`\`\`

## 测试
\`\`\`bash
pnpm test
\`\`\`

## 部署
说明部署流程

## 相关仓库
- [shared-utils](https://github.com/company/shared-utils)
- [api-server](https://github.com/company/api-server)

## 许可证
MIT
```

### 8.4 Git 工作流建议

```
main 分支        ← 稳定版本，用于生产
    ↑
develop 分支     ← 开发集成分支
    ↑
feature/* 分支   ← 功能开发分支
hotfix/* 分支    ← 紧急修复分支

工作流程：
1. 从 develop 创建 feature 分支
2. 完成开发后 PR 回 develop
3. Code Review 通过后合并
4. 定期从 develop 发布到 main
```

---

## 九、常见问题

### 9.1 常见问题及解决方案

| 问题 | 解决方案 |
|------|----------|
| **代码重复** | 提取为独立的 npm 包 |
| **版本不一致** | 使用统一的版本管理策略 |
| **CI/CD 重复配置** | 创建共享的 GitHub Actions |
| **跨仓库测试困难** | 使用 Git Submodule 或集成测试 |
| **依赖版本冲突** | 明确指定版本范围，定期更新 |
| **发布流程繁琐** | 自动化发布脚本 |

### 9.2 跨仓库调试技巧

```bash
# 方案一：使用 npm link

# 1. 在共享库目录
cd company-shared-utils
pnpm link --global

# 2. 在使用方目录
cd company-web-app
pnpm link --global @company/shared-utils

# 3. 开发完成后取消链接
pnpm unlink @company/shared-utils

# 方案二：直接修改 node_modules（临时调试）
# 修改后记得恢复或提交 PR

# 方案三：使用本地包路径
{
  "dependencies": {
    "@company/shared-utils": "file:../company-shared-utils"
  }
}
```

### 9.3 依赖管理工具

```bash
# 检查过时的依赖
pnpm outdated

# 更新依赖
pnpm update

# 审计安全漏洞
pnpm audit

# 自动修复安全问题
pnpm audit fix

# 检查依赖树
pnpm list --depth=0
```

---

## 十、Polyrepo vs Monorepo 选择指南

### 10.1 决策树

```
                           你有多个项目吗？
                                ↓
                              是 │ 否
                                ↓
                    ┌───────────────────────┐
                    │  项目之间需要共享代码？  │
                    └───────────────────────┘
                         ↓           ↓
                        是           否
                         ↓           ↓
        ┌─────────────────────┐     ┌──────────────┐
        │  项目由同一团队维护？ │     │  → Polyrepo │
        └─────────────────────┘     │  (独立仓库)  │
             ↓           ↓          └──────────────┘
            是           否
             ↓           ↓
    ┌──────────────┐  ┌──────────────┐
    │ → Monorepo  │  │  看情况      │
    │ (考虑是否    │  │  通常选择    │
    │  共享收益大) │  │  Polyrepo   │
    └──────────────┘  └──────────────┘
```

### 10.2 快速对比表

| 决策因素 | 选择 Polyrepo | 选择 Monorepo |
|----------|---------------|---------------|
| 团队规模 | 多个独立团队 | 单一团队或紧密协作 |
| 项目关联度 | 低关联 | 高关联 |
| 代码共享 | 通过 npm | 本地引用 |
| 发布频率 | 各自独立 | 统一发布 |
| 权限控制 | 需要精细控制 | 不太关心 |
| 学习成本 | 低（传统方式） | 中（需要工具） |
| Git 操作 | 简单（单仓库） | 复杂（多仓库） |

### 10.3 混合方案

```
现实世界中，很多公司采用混合方案：

company/
├── product-monorepo/        ← 相关产品放在 Monorepo
│   ├── web-app/
│   ├── admin-panel/
│   └── shared/
│
├── other-product/           ← 独立产品，独立仓库
│
└── open-source-libs/        ← 开源库，各自独立
    ├── lib-a/
    ├── lib-b/
    └── lib-c/

核心原则：
- 高度耦合的项目 → Monorepo
- 完全独立的项目 → Polyrepo
```

---

## 十一、总结

### 11.1 Polyrepo 核心要点

```
┌─────────────────────────────────────────────────────┐
│  Polyrepo 的优势                                    │
├─────────────────────────────────────────────────────┤
│  ✅ 项目完全独立，互不干扰                           │
│  ✅ 精细的权限控制                                   │
│  ✅ 灵活的发布周期                                   │
│  ✅ 学习成本低，传统方式                             │
│  ✅ CI/CD 配置简单                                   │
│  ✅ 适合不同团队/公司协作                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Polyrepo 的挑战                                    │
├─────────────────────────────────────────────────────┤
│  ❌ 代码共享需要发布 npm 包                          │
│  ❌ 跨项目修改需要多个 PR                            │
│  ❌ 可能存在代码重复                                 │
│  ❌ 统一工具链需要额外工作                           │
│  ❌ 依赖版本可能不一致                               │
└─────────────────────────────────────────────────────┘
```

### 11.2 何时选择 Polyrepo

```
选择 Polyrepo 如果你需要：

✅ 项目完全独立，没有代码共享
✅ 不同团队/公司负责不同项目
✅ 需要严格的权限控制
✅ 发布周期差异很大
✅ 项目规模超大，Monorepo 无法承载
✅ 团队不熟悉 Monorepo 工具
✅ 想要最简单、最传统的管理方式
```

### 11.3 快速开始

```bash
# 最简单的方式 - 每个项目独立仓库

# 1. 创建第一个仓库
mkdir my-project-1
cd my-project-1
git init
pnpm init
# ... 开发 ...
git remote add origin https://github.com/yourname/my-project-1.git
git push -u origin main

# 2. 创建第二个仓库
cd ..
mkdir my-project-2
cd my-project-2
git init
pnpm init
# ... 开发 ...
git remote add origin https://github.com/yourname/my-project-2.git
git push -u origin main

# 就这么简单！
```

### 11.4 学习路径

```
1. 理解 Polyrepo 概念 ← 你在这里
   ↓
2. 掌握 Git 基础操作
   ↓
3. 学习 npm 包发布
   ↓
4. 配置 CI/CD（GitHub Actions）
   ↓
5. 了解版本管理策略（Semantic Versioning）
   ↓
6. （可选）了解 Monorepo，对比优劣
```
