# Monorepo 单体仓库

## 一、什么是 Monorepo

### 1.1 基本定义

**Monorepo** = **Mono**（单一）+ **Repo**（仓库）

简单来说，就是把**多个项目**放在**同一个 Git 仓库**中进行管理。

### 1.2 形象理解

想象一个大型公司：

```
传统方式（Polyrepo）                  Monorepo 方式
─────────────────────────────────────────────────────────
办公楼 A                               总部大楼
├── 财务部（独立建筑）                  ├── 1楼：财务部
├── 技术部（独立建筑）                  ├── 2楼：技术部
└── 人事部（独立建筑）                  └── 3楼：人事部

各部门独立运作，沟通需要                所有部门在同一栋楼，
跨楼开会、发邮件                       转身就能交流
```

### 1.3 目录结构对比

```
┌─────────────────── Polyrepo 多仓库 ───────────────────┐
│                                                           │
│  company-frontend/      company-backend/      company-app/ │
│  ├── src/               ├── src/               ├── src/    │
│  ├── package.json       ├── package.json       ├── package.json
│  └── .git/              └── .git/              └── .git/   │
│                                                           │
│   3个独立仓库 → 3次 clone → 3套 node_modules              │
└───────────────────────────────────────────────────────────┘

┌─────────────────── Monorepo 单仓库 ───────────────────┐
│                                                           │
│  company-monorepo/                                        │
│  ├── packages/                                            │
│  │   ├── frontend/        ← 前端项目                      │
│  │   │   ├── src/                                        │
│  │   │   └── package.json                                │
│  │   ├── backend/         ← 后端项目                      │
│  │   │   ├── src/                                        │
│  │   │   └── package.json                                │
│  │   └── shared/          ← 共享代码                      │
│  │       ├── utils/                                      │
│  │       └── package.json                                │
│  ├── package.json         ← 根配置文件                    │
│  ├── pnpm-workspace.yaml ← workspace 配置                │
│  └── .git/                ← 只有一个 Git 仓库             │
│                                                           │
│   1个仓库 → 1次 clone → 共享 node_modules                 │
└───────────────────────────────────────────────────────────┘
```

---

## 二、Monorepo 的作用/优势

### 2.1 代码共享

```
场景：多个项目都需要用户登录功能

Polyrepo 方式：
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  项目 A     │    │  项目 B     │    │  项目 C     │
│  自己写登录  │    │  自己写登录  │    │  自己写登录  │
└─────────────┘    └─────────────┘    └─────────────┘
    ↓ 重复劳动，代码不一致

Monorepo 方式：
┌──────────────────────────────────────────────┐
│           packages/auth                      │
│           统一的登录模块                      │
└──────────────────────────────────────────────┘
    ↑               ↑               ↑
    └───────┬───────┴───────┬───────┘
            ↓               ↓
        项目 A           项目 B           项目 C
```

### 2.2 原子提交

```
场景：修改共享库的 API，需要同步更新所有使用方

Polyrepo 方式：
1. 修改 shared 库
2. 发布新版本到 npm
3. 修改项目 A，更新版本
4. 修改项目 B，更新版本
5. 分别测试、分别发布
6. 任何一步出错，版本就不同步 ❌

Monorepo 方式：
1. 一次 commit 同时修改:
   - packages/shared/
   - apps/web/
   - apps/admin/
2. 一次 PR 审查所有改动
3. 一次测试确保所有项目正常 ✅
```

### 2.3 依赖去重

```
Polyrepo - 每个项目独立安装依赖：

web-app/node_modules/react/      ← 200MB
admin-app/node_modules/react/    ← 200MB  重复！
mobile-app/node_modules/react/   ← 200MB  重复！
总计：600MB × 3 = 1.8GB

Monorepo - 统一管理依赖：

node_modules/react/              ← 200MB 只安装一次！
web-app/node_modules/react       → 软链接到根目录
admin-app/node_modules/react     → 软链接到根目录
mobile-app/node_modules/react    → 软链接到根目录
总计：200MB
```

### 2.4 统一工具链

```
一套配置，所有项目共用：

monorepo/
├── packages/
│   ├── config/
│   │   ├── eslint-config/     ← 统一的 ESLint 配置
│   │   ├── tsconfig/          ← 统一的 TS 配置
│   │   └── tailwind-config/   ← 统一的样式配置
│   ├── web/     → 使用 @company/eslint-config
│   └── admin/   → 使用 @company/eslint-config
```

### 2.5 跨项目重构

```
场景：要把某个函数重命名

Polyrepo：
- 在每个仓库中搜索
- 分别修改、分别测试
- 容易遗漏 ❌

Monorepo：
- IDE 全局搜索替换
- 一次性修改所有地方
- 统一测试 ✅
```

---

## 三、使用场景

### 3.1 ✅ 适合使用 Monorepo 的场景

| 场景 | 说明 | 例子 |
|------|------|------|
| **共享组件库** | 多个项目共用 UI 组件 | 公司内部组件库 |
| **微前端架构** | 多个子应用共享基础代码 | 电商前台 + 管理后台 |
| **全栈开发** | 前后端代码在同一仓库 | Next.js 项目 |
| **插件生态** | 核心包 + 多个插件 | Vite、Babel、ESLint |
| **npm 包开发** | 开发多个相关的 npm 包 | lodash、date-fns |

### 3.2 ❌ 不适合使用 Monorepo 的场景

| 场景 | 原因 |
|------|------|
| **完全独立的项目** | 没有代码共享需求 |
| **超大仓库** | Git clone 太慢 |
| **不同团队/公司** | 权限隔离困难 |
| **发布周期差异大** | 一个项目每天发版，另一个一年发一次 |

### 3.3 真实案例

```
┌─────────────────────────────────────────────────────┐
│  公司/项目          │  使用的架构                     │
├─────────────────────────────────────────────────────┤
│  Google             │  超大型 Monorepo（所有代码）    │
│  Facebook/Meta      │  Monorepo 管理所有项目         │
│  Babel              │  Monorepo（核心 + 插件）       │
│  Vue                │  Monorepo（核心 + 生态包）     │
│  React              │  Monorepo                      │
│  Vite               │  Monorepo（核心 + 插件）       │
│  TypeScript         │  Monorepo                      │
└─────────────────────────────────────────────────────┘
```

---

## 四、如何实现 - 工具选择

### 4.1 主流工具对比

| 工具 | 定位 | 学习成本 | 适用场景 |
|------|------|----------|----------|
| **pnpm workspace** | 包管理器自带的 workspace 功能 | ⭐ 低 | 中小型项目 |
| **Turborepo** | 专注于构建加速和缓存 | ⭐⭐ 中 | 大型项目，追求性能 |
| **Nx** | 全功能工程化平台 | ⭐⭐⭐ 高 | 复杂企业级项目 |
| **Lerna** | 老牌版本管理工具 | ⭐⭐ 中 | 传统项目维护 |

### 4.2 推荐方案

```
┌─────────────────────────────────────────────────────┐
│  项目规模                  │  推荐工具               │
├─────────────────────────────────────────────────────┤
│  小型（<5 个包）            │  pnpm workspace         │
│  中型（5-20 个包）          │  pnpm + Turborepo       │
│  大型（20+ 个包）           │  pnpm + Turborepo/Nx    │
└─────────────────────────────────────────────────────┘
```

---

## 五、实现步骤 - pnpm workspace 方案

### 5.1 初始化项目

```bash
# 1. 创建项目目录
mkdir my-monorepo
cd my-monorepo

# 2. 初始化 Git
git init

# 3. 初始化 pnpm 项目
pnpm init

# 4. 创建 workspace 配置文件
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'      # 应用目录
  - 'packages/*'  # 包目录
EOF
```

### 5.2 创建目录结构

```bash
# 创建目录
mkdir -p apps/web apps/admin packages/ui packages/shared
```

完成后目录结构：
```
my-monorepo/
├── apps/
│   ├── web/        ← Web 应用
│   └── admin/      ← 管理后台
├── packages/
│   ├── ui/         ← UI 组件库
│   └── shared/     ← 共享工具
├── package.json
├── pnpm-workspace.yaml
└── .git/
```

### 5.3 创建共享包

```bash
# 创建共享工具包
cd packages/shared
pnpm init

# 修改 package.json
cat > package.json << EOF
{
  "name": "@my-monorepo/shared",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "build": "echo 'building shared...'"
  }
}
EOF

# 创建源码文件
mkdir src
cat > src/index.js << EOF
// 格式化日期
export function formatDate(date) {
  return date.toLocaleDateString('zh-CN');
}

// 格式化数字
export function formatNumber(num) {
  return num.toLocaleString('zh-CN');
}
EOF
```

### 5.4 创建 UI 组件包

```bash
cd ../../packages/ui
pnpm init

# 修改 package.json
cat > package.json << EOF
{
  "name": "@my-monorepo/ui",
  "version": "1.0.0",
  "main": "src/index.js",
  "dependencies": {
    "@my-monorepo/shared": "workspace:*"  ← 引用本地包
  }
}
EOF

# 创建组件
mkdir src
cat > src/Button.js << EOF
export function Button(text) {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = \`
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  \`;
  return button;
}
EOF

cat > src/index.js << EOF
export * from './Button.js';
EOF
```

### 5.5 创建 Web 应用

```bash
cd ../../apps/web
pnpm init

# 修改 package.json
cat > package.json << EOF
{
  "name": "@my-monorepo/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@my-monorepo/ui": "workspace:*",
    "@my-monorepo/shared": "workspace:*"
  },
  "devDependencies": {
    "vite": "latest"
  }
}
EOF

# 创建 HTML 入口
cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>My Monorepo App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
EOF

# 创建 JS 入口
mkdir src
cat > src/main.js << EOF
import { Button } from '@my-monorepo/ui';
import { formatDate, formatNumber } from '@my-monorepo/shared';

const app = document.getElementById('app');

// 使用 UI 组件
const btn = new Button('点击我');
app.appendChild(btn);

// 使用共享工具
const dateSpan = document.createElement('p');
dateSpan.textContent = '今天日期：' + formatDate(new Date());
app.appendChild(dateSpan);

const numSpan = document.createElement('p');
numSpan.textContent = '数字格式化：' + formatNumber(1234567.89);
app.appendChild(numSpan);
EOF
```

### 5.6 配置根 package.json

```bash
cd ../..

# 修改根 package.json
cat > package.json << EOF
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",    // 并行运行所有 dev
    "build": "pnpm -r build",            // 运行所有 build
    "lint": "pnpm -r lint"               // 运行所有 lint
  }
}
EOF
```

### 5.7 安装依赖

```bash
# pnpm 会自动处理 workspace 依赖
pnpm install
```

### 5.8 运行项目

```bash
# 启动开发服务器
pnpm --filter @my-monorepo/web dev
```

浏览器访问 `http://localhost:5173` 查看效果。

---

## 六、实现步骤 - Turborepo 方案（推荐）

### 6.1 为什么选择 Turborepo

```
┌─────────────────────────────────────────────────────┐
│  Turborepo 核心优势                                 │
├─────────────────────────────────────────────────────┤
│  1. 增量构建：只重新构建改动的包                     │
│  2. 远程缓存：团队共享构建缓存                       │
│  3. 并行执行：智能并行执行任务                       │
│  4. 任务管道：定义任务依赖关系                       │
└─────────────────────────────────────────────────────┘
```

### 6.2 快速创建

```bash
# 方式一：使用 create-turbo
pnpm create turbo@latest my-turborepo

# 方式二：手动创建
mkdir my-turborepo
cd my-turborepo
pnpm init
```

### 6.3 配置文件

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // 依赖包先构建
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,            // 开发模式不缓存
      "persistent": true         // 持续运行
    },
    "lint": {
      "outputs": []
    }
  }
}
```

```json
// package.json
{
  "name": "my-turborepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

### 6.4 项目结构

```
my-turborepo/
├── apps/
│   ├── web/              # Web 应用
│   │   ├── package.json
│   │   └── src/
│   └── admin/            # 管理后台
│       ├── package.json
│       └── src/
├── packages/
│   ├── ui/               # UI 组件库
│   │   ├── package.json
│   │   └── src/
│   ├── shared/           # 共享工具
│   │   ├── package.json
│   │   └── src/
│   └── config/           # 共享配置
│       ├── eslint-config
│       └── tsconfig
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 七、依赖引用方式

### 7.1 Workspace 协议

```json
// packages/app/package.json
{
  "dependencies": {
    // 方式一：workspace:*（推荐）
    "@my-monorepo/ui": "workspace:*",

    // 方式二：workspace:*
    "@my-monorepo/utils": "workspace:^",

    // 方式三：具体版本
    "@my-monorepo/types": "workspace:1.0.0"
  }
}
```

### 7.2 发布到 npm

```bash
# 本地开发时使用 workspace:*
# 发布时 pnpm 会自动替换为实际版本号
pnpm publish --filter @my-monorepo/ui
```

---

## 八、最佳实践

### 8.1 依赖原则

```
                    ┌─────────────────┐
                    │    apps/*       │  应用层
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  packages/ui/   │  组件层
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ packages/shared/│  工具层
                    └─────────────────┘

原则：
1. 上层可以依赖下层
2. 下层不能依赖上层
3. 同层之间尽量避免依赖
4. 禁止循环依赖！
```

### 8.2 代码组织建议

```
packages/
├── ui/              # 纯 UI 组件，不包含业务逻辑
├── business/        # 业务组件，包含业务逻辑
├── hooks/           # 自定义 Hooks
├── utils/           # 纯函数工具
├── types/           # TypeScript 类型定义
├── constants/       # 常量定义
└── config/          # 共享配置
```

### 8.3 Git Hooks 配置

```bash
# 安装 husky 和 lint-staged
pnpm add -D husky lint-staged

# 初始化 husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "pnpm lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 九、常见问题

### 9.1 常见问题及解决方案

| 问题 | 解决方案 |
|------|----------|
| **依赖安装慢** | 使用 `pnpm` 的 ` shamefully-hoist` 选项 |
| **本地包引用失败** | 检查 `package.json` 的 `name` 字段是否正确 |
| **TypeScript 报错** | 配置 `tsconfig.json` 的 `paths` 和 `references` |
| **循环依赖** | 使用 `madge` 工具检测依赖关系 |
| **构建顺序问题** | 使用 Turborepo 的 `dependsOn` 配置 |

### 9.2 TypeScript 配置

```json
// tsconfig.json (根目录)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@my-monorepo/*": ["packages/*/src"]
    }
  },
  "references": [
    { "path": "./packages/ui" },
    { "path": "./packages/shared" },
    { "path": "./apps/web" }
  ]
}
```

---

## 十、总结

### 10.1 选择建议

```
┌─────────────────────────────────────────────────────┐
│  什么时候选择 Monorepo？                             │
├─────────────────────────────────────────────────────┤
│  ✅ 多个项目共享代码                                 │
│  ✅ 需要统一管理依赖和工具链                         │
│  ✅ 团队规模适中，沟通成本低                         │
│  ✅ 需要频繁跨项目修改                               │
│                                                     │
│  什么时候选择 Polyrepo？                             │
├─────────────────────────────────────────────────────┤
│  ✅ 项目完全独立，没有代码共享                       │
│  ✅ 不同团队/公司，需要权限隔离                     │
│  ✅ 项目过大，影响克隆和构建速度                     │
└─────────────────────────────────────────────────────┘
```

### 10.2 快速开始

```bash
# 最简单的方式 - 使用 pnpm workspace
mkdir my-monorepo && cd my-monorepo
echo "packages:\n  - 'packages/*'" > pnpm-workspace.yaml
pnpm init
pnpm install

# 或使用 Turborepo
pnpm create turbo@latest my-turborepo
```

### 10.3 学习路径

```
1. 理解 Monorepo 概念 ← 你在这里
   ↓
2. 尝试 pnpm workspace
   ↓
3. 学习 Turborepo 基础
   ↓
4. 掌握 Turborepo 高级特性（缓存、管道）
   ↓
5. 了解 Nx（按需学习）
```
