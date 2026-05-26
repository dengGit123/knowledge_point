# pnpm 详解

## 目录

- [什么是 pnpm](#什么是-pnpm)
- [安装](#安装)
- [.npmrc 配置文件](#npmrc-配置文件)
- [pnpm-workspace.yaml 配置](#pnpm-workspaceyaml-配置)
- [pnpmfile.js 配置](#pnpmfilejs-配置)
- [实现 Monorepo](#实现-monorepo)
- [常用命令](#常用命令)
- [其他用法](#其他用法)
- [常见问题](#常见问题)

---

## 什么是 pnpm

[pnpm](https://pnpm.io/zh/) 是一款快速、节省磁盘空间的包管理器，通过硬链接和符号链接机制实现高效依赖管理。

### 核心优势

| 特性 | pnpm | npm | yarn |
|------|------|-----|------|
| 安装速度 | ⚡⚡⚡ | 🐢 | 🚀 |
| 磁盘占用 | 💾 极省 | 💿💿 | 💿💿 |
| 幽灵依赖 | ❌ 无 | ✅ 有 | ✅ 有 |
| Monorepo | ✅ 原生 | ❌ | ⚠️ |

---

## 安装

### 步骤 1：全局安装 pnpm

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 步骤 2：验证安装

```bash
pnpm --version
```

---

## .npmrc 配置文件

### 配置文件位置

`.npmrc` 文件可以存在于多个位置，优先级从高到低：

| 位置 | 范围 | 文件路径 |
|------|------|----------|
| 项目级 | 当前项目 | `项目根目录/.npmrc` |
| 用户级 | 所有项目 | `~/.npmrc` |
| 全局级 | 系统全局 | `/etc/npmrc` |

### 配置项详解

#### 1. registry（注册源）

**含义**：指定 npm 包下载的注册源地址。

**作用**：控制从哪里下载 npm 包。

**用法**：

```ini
# .npmrc

# 使用淘宝镜像
registry=https://registry.npmmirror.com

# 或使用官方源
registry=https://registry.npmjs.org/
```

**验证**：

```bash
pnpm config get registry
```

---

#### 2. strict-peer-dependencies（严格检查同伴依赖）

**含义**：是否严格检查 peerDependencies。

**作用**：
- `true`：peerDependencies 版本不匹配时报错
- `false`：只警告，继续安装

**用法**：

```ini
# .npmrc

# 启用严格检查（推荐）
strict-peer-dependencies=true
```

**场景示例**：

你的包依赖 `vue@^3.0.0`，但项目中安装了 `vue@2.6.0`：
- 开启时：安装失败，提示版本不匹配
- 关闭时：警告但继续安装

---

#### 3. shamefully-hoist（提升依赖）

**含义**：是否将所有依赖提升到根 node_modules。

**作用**：
- `true`：像 npm 一样扁平化结构（失去 pnpm 优势）
- `false`：保持 pnpm 的严格依赖结构

**用法**：

```ini
# .npmrc

# 不推荐开启，会失去 pnpm 的优势
# shamefully-hoist=true
```

**何时使用**：
- 某些工具不兼容符号链接时
- 作为迁移过渡方案

---

#### 4. public-hoist-pattern（选择性提升）

**含义**：指定哪些包需要提升到根 node_modules。

**作用**：解决特定工具的兼容性问题，同时保持其他包的严格结构。

**用法**：

```ini
# .npmrc

# 提升匹配的包
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*webpack*
public-hoist-pattern[]=@types/*
```

**场景**：ESLint 插件需要能访问 eslint，需要提升。

---

#### 5. auto-install-peers（自动安装同伴依赖）

**含义**：是否自动安装缺失的 peerDependencies。

**作用**：
- `true`：自动安装缺失的 peer 依赖
- `false`：只提示，不自动安装

**用法**：

```ini
# .npmrc

# 自动安装 peer 依赖
auto-install-peers=true
```

---

#### 6. store-dir（存储目录）

**含义**：指定全局 store 的存储位置。

**作用**：控制 .pnpm-store 的存放路径。

**用法**：

```ini
# .npmrc

# 自定义存储位置
store-dir=/data/pnpm-store

# 或使用环境变量
# store-dir=${PNPM_STORE_DIR}
```

**默认位置**：
- macOS/Linux: `~/.pnpm-store`
- Windows: `%LOCALAPPDATA%\pnpm-store`

---

#### 7. virtual-store-dir（虚拟存储目录）

**含义**：指定项目中虚拟存储的位置。

**作用**：控制 .pnpm 目录的存放位置。

**用法**：

```ini
# .npmrc

# 默认是 node_modules/.pnpm
virtual-store-dir=node_modules/.pnpm
```

---

#### 8. shamefully-hoist-public-hoist-pattern

**含义**：配合 shamefully-hoist 使用，控制提升模式。

**作用**：精细控制哪些包被提升。

**用法**：

```ini
# .npmrc

public-hoist-pattern[]=*vue*
public-hoist-pattern[]=*react*
```

---

#### 9. network-concurrency（并发下载数）

**含义**：同时下载的包数量。

**作用**：控制网络并发，可能影响安装速度。

**用法**：

```ini
# .npmrc

# 增加并发数（默认 4）
network-concurrency=16
```

---

#### 10. lockfile-format（锁文件格式）

**含义**：指定 pnpm-lock.yaml 的格式版本。

**作用**：控制锁文件的格式。

**用法**：

```ini
# .npmrc

# 使用 v6 格式（推荐）
lockfile-format=v6
```

---

#### 11. prefer-offline（优先离线）

**含义**：优先使用本地缓存，即使有新版本也不检查。

**作用**：加快安装速度，适合 CI 环境。

**用法**：

```ini
# .npmrc

prefer-offline=true
```

---

#### 12. ignore-scripts（忽略脚本）

**含义**：是否跳过 package.json 中的 scripts 生命周期脚本。

**作用**：
- `true`：不运行 install、postinstall 等脚本
- `false`：正常执行

**用法**：

```ini
# .npmrc

# 跳过生命周期脚本（不推荐）
ignore-scripts=true
```

---

#### 13. child-concurrency（子任务并发数）

**含义**：同时执行的子任务数量。

**作用**：控制构建等任务的并发。

**用法**：

```ini
# .npmrc

child-concurrency=4
```

---

#### 14. fetch-retries（下载重试次数）

**含义**：下载失败时的重试次数。

**作用**：提高不稳定网络的下载成功率。

**用法**：

```ini
# .npmrc

fetch-retries=5
```

---

#### 15. fetch-retry-maxtimeout（重试最大超时）

**含义**：下载重试的最大等待时间（毫秒）。

**用法**：

```ini
# .npmrc

fetch-retry-maxtimeout=60000
```

---

#### 16. 针对特定 scope 的配置

**含义**：为特定的 @scope 设置独立的注册源。

**作用**：不同来源的包使用不同的下载地址。

**用法**：

```ini
# .npmrc

# @babel 包使用官方源
@babel:registry=https://registry.npmjs.org/

# @vue 包使用淘宝镜像
@vue:registry=https://registry.npmmirror.com

# 私有包
@company:registry=https://npm.company.com/
```

---

### 完整 .npmrc 示例

```ini
# ============================================
# 基础配置
# ============================================

# 使用淘宝镜像
registry=https://registry.npmmirror.com

# ============================================
# 依赖管理
# ============================================

# 严格检查 peer 依赖
strict-peer-dependencies=true

# 自动安装 peer 依赖
auto-install-peers=true

# 选择性提升（解决兼容性问题）
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*

# ============================================
# 存储配置
# ============================================

# 自定义 store 位置（可选）
# store-dir=/data/pnpm-store

# ============================================
# 性能配置
# ============================================

# 并发下载数
network-concurrency=16

# 优先使用缓存
prefer-offline=true

# ============================================
# 特定 scope 配置
# ============================================

@babel:registry=https://registry.npmjs.org/
@vue:registry=https://registry.npmmirror.com
```

---

## pnpm-workspace.yaml 配置

### 基本语法

```yaml
# pnpm-workspace.yaml

packages:
  - 'packages/*'      # 匹配 packages 目录下的所有包
  - 'apps/*'          # 匹配 apps 目录下的所有包
  - 'tools/**'        # 匹配 tools 目录及其子目录的所有包
  - 'shared'          # 精确匹配 shared 目录
```

### 排除模式

```yaml
# pnpm-workspace.yaml

packages:
  - 'packages/*'
  - '!**/test'        # 排除所有 test 目录
  - '!**/__tests__'   # 排除所有 __tests__ 目录
```

### 对象形式（高级）

```yaml
# pnpm-workspace.yaml

packages:
  - 'packages/*'

# 不提升的包（nohoist）
nohoist:
  - '**/react'
  - '**/react-dom'
```

---

## pnpmfile.js 配置

### 什么是 pnpmfile.js

**含义**：一个 JavaScript 文件，用于自定义 pnpm 的安装行为。

**作用**：
- 修改包的安装版本
- 添加或删除依赖
- 设置包别名
- 执行安装后的钩子

**位置**：项目根目录，文件名为 `.pnpmfile.js` 或 `pnpmfile.js`

---

### hooks（钩子）

#### readPackage

**含义**：在读取包信息后触发，可以修改包的配置。

**作用**：统一修改依赖版本、添加依赖等。

**用法**：

```javascript
// .pnpmfile.js

function readPackage(pkg, context) {
  // pkg: 包的信息对象
  // context: 安装上下文

  // 1. 修改特定依赖的版本
  if (pkg.dependencies && pkg.dependencies.react) {
    pkg.dependencies.react = '^18.0.0';
  }

  // 2. 添加依赖
  if (pkg.name === '@mycompany/app') {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies.source-map-support = 'latest';
  }

  // 3. 删除不想安装的依赖
  if (pkg.devDependencies && pkg.devDependencies.typescript) {
    delete pkg.devDependencies.typescript;
  }

  // 返回修改后的包信息
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
```

**实际场景**：

```javascript
// 场景：统一所有包的 React 版本
function readPackage(pkg) {
  if (pkg.dependencies) {
    // 所有使用 React 的包统一用 18
    if (pkg.dependencies.react) {
      pkg.dependencies.react = '^18.2.0';
    }
  }

  if (pkg.peerDependencies) {
    // 统一 peerDependencies 版本
    if (pkg.peerDependencies.react) {
      pkg.peerDependencies.react = '^18.2.0';
    }
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
```

---

#### afterAllInstalled

**含义**：所有包安装完成后触发。

**作用**：执行后续操作，如生成文件、运行脚本。

**用法**：

```javascript
// .pnpmfile.js

const { writeFileSync } = require('fs');
const { join } = require('path');

function afterAllInstalled(lockfile, context) {
  // lockfile: 锁文件对象
  // context: 安装上下文

  console.log('所有依赖安装完成！');

  // 生成版本信息文件
  const versionInfo = {
    lockfileVersion: lockfile.lockfileVersion,
    packageCount: Object.keys(lockfile.packages).length,
    installedAt: new Date().toISOString()
  };

  writeFileSync(
    join(context.rootDir, 'install-info.json'),
    JSON.stringify(versionInfo, null, 2)
  );
}

module.exports = {
  hooks: {
    afterAllInstalled
  }
};
```

---

### aliases（别名）

**含义**：为包创建别名，安装时使用不同的名称。

**作用**：同时安装同一包的不同版本。

**用法**：

```javascript
// .pnpmfile.js

module.exports = {
  aliases: {
    // 将 vue 2 安装为 'vue2'
    'vue2': 'npm:vue@2',

    // 将 react 17 安装为 'react-old'
    'react-old': 'npm:react@17',

    // 从 GitHub 安装
    'my-lib': 'github:username/repo#v1.0.0'
  }
};
```

**使用**：

```bash
# 安装别名
pnpm add vue2

# package.json 中
{
  "dependencies": {
    "vue2": "npm:vue@2"
  }
}
```

---

### packageExtensions（包扩展）

**含义**：修改现有包的 package.json 内容。

**作用**：补充缺失的 peerDependencies 等字段。

**用法**：

```javascript
// .pnpmfile.js

module.exports = {
  packageExtensions: {
    // 为 some-package 补充 peerDependencies
    'some-package': {
      peerDependencies: {
        'react': '*',
        'react-dom': '*'
      },
      peerDependenciesMeta: {
        'react': {
          optional: true
        }
      }
    },

    // 为 another-package 补充 dependencies
    'another-package': {
      dependencies: {
        'lodash': '^4.17.21'
      }
    }
  }
};
```

**场景**：某个包缺少 peerDependencies 声明，导致警告。

---

### shims（垫片）

**含义**：替换特定包的入口文件。

**作用**：修复某些包的问题，或提供兼容层。

**用法**：

```javascript
// .pnpmfile.js

module.exports = {
  shims: {
    // 替换 old-package 的入口
    'old-package': {
      // 导出对象
      exports: {
        default: './shims/old-package-shim.js'
      }
    }
  }
};
```

---

### 完整 pnpmfile.js 示例

```javascript
// .pnpmfile.js

const { writeFileSync } = require('fs');
const { join } = require('path');

// ============================================
// 钩子函数
// ============================================

function readPackage(pkg, context) {
  // 统一 React 版本
  if (pkg.dependencies?.react) {
    pkg.dependencies.react = '^18.2.0';
  }
  if (pkg.peerDependencies?.react) {
    pkg.peerDependencies.react = '^18.2.0';
  }

  // 为特定包添加依赖
  if (pkg.name === '@myapp/web') {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies.source-map-support = 'latest';
  }

  return pkg;
}

function afterAllInstalled(lockfile, context) {
  console.log('✅ 依赖安装完成！');
  console.log(`📦 共安装 ${Object.keys(lockfile.packages).length} 个包`);

  // 生成构建时间戳
  writeFileSync(
    join(context.rootDir, '.build-timestamp'),
    new Date().toISOString()
  );
}

// ============================================
// 导出配置
// ============================================

module.exports = {
  hooks: {
    readPackage,
    afterAllInstalled
  },

  // 别名
  aliases: {
    'vue2': 'npm:vue@2.7.16'
  },

  // 包扩展
  packageExtensions: {
    'some-broken-package': {
      peerDependencies: {
        'react': '*'
      }
    }
  }
};
```

---

## 实现 Monorepo

### 步骤 1：创建项目根目录

```bash
mkdir my-monorepo
cd my-monorepo
```

### 步骤 2：初始化根项目

```bash
pnpm init
```

生成的 `package.json`：

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true
}
```

### 步骤 3：创建 workspace 配置

```bash
# 创建 pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'apps/*'
EOF
```

### 步骤 4：创建目录结构

```bash
mkdir -p packages/shared packages/ui apps/web apps/admin
```

### 步骤 5：初始化子包

**packages/shared/package.json**：

```bash
cd packages/shared
pnpm init
```

```json
{
  "name": "@monorepo/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  }
}
```

**packages/ui/package.json**：

```bash
cd ../ui
pnpm init
```

```json
{
  "name": "@monorepo/ui",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "dependencies": {
    "@monorepo/shared": "workspace:*"
  }
}
```

**apps/web/package.json**：

```bash
cd ../../apps/web
pnpm init
```

```json
{
  "name": "@monorepo/web",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@monorepo/shared": "workspace:*",
    "@monorepo/ui": "workspace:^",
    "vue": "^3.4.0"
  }
}
```

### 步骤 6：安装依赖

```bash
cd ../../  # 回到根目录
pnpm install
```

### 步骤 7：添加根级开发依赖

```bash
pnpm add -D typescript vite
```

### 步骤 8：配置根脚本

**package.json**：

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter './packages/*' build",
    "dev": "pnpm -r --parallel --filter './apps/*' dev",
    "lint": "pnpm -r run lint",
    "clean": "pnpm -r exec rm -rf dist node_modules"
  }
}
```

### 最终目录结构

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   └── src/
│   └── ui/
│       ├── package.json
│       └── src/
└── apps/
    ├── web/
    │   ├── package.json
    │   └── src/
    └── admin/
        ├── package.json
        └── src/
```

---

## 常用命令

### 项目初始化

```bash
pnpm init              # 创建 package.json
pnpm init -y           # 使用默认值
```

### 依赖安装

```bash
pnpm install           # 安装所有依赖
pnpm add <package>     # 添加依赖
pnpm add -D <package>  # 添加开发依赖
pnpm remove <package>  # 卸载依赖
```

### 依赖更新

```bash
pnpm update            # 更新所有依赖
pnpm update <package>  # 更新指定包
pnpm outdated          # 查看过时的包
```

### 脚本执行

```bash
pnpm run <script>      # 运行脚本
pnpm exec <command>    # 执行命令
pnpm dlx <package>     # 临时执行
```

### Monorepo 命令

```bash
# 在所有包中执行
pnpm -r install                # 所有工作区安装依赖
pnpm -r run build              # 所有工作区运行 build

# 过滤执行
pnpm --filter @monorepo/web dev    # 在指定包中执行
pnpm --filter './packages/*' build  # 在匹配的包中执行

# 依赖关系执行
pnpm --filter "@monorepo/ui..." run build  # 构建 ui 及其依赖
```

### Store 管理

```bash
pnpm store path          # 查看 store 路径
pnpm store prune         # 清理未引用的包
pnpm store status        # 查看状态
```

### 其他命令

```bash
# 查看信息
pnpm list                # 列出依赖
pnpm why <package>       # 查看包为何被安装
pnpm info <package>      # 查看包信息

# 链接本地包
pnpm link --global       # 全局链接
pnpm link --global <pkg> # 链接全局包

# 导入锁文件
pnpm import              # 从 npm/yarn 导入
```

---

## 其他用法

### 1. workspace 协议

在 Monorepo 中引用工作区包：

```json
{
  "dependencies": {
    "@monorepo/shared": "workspace:*"      // 精确匹配
    "@monorepo/shared": "workspace:^"      // 兼容更新
    "@monorepo/shared": "workspace:~"      // 补丁更新
  }
}
```

### 2. Filter 语法

```bash
# 包名匹配
pnpm --filter @monorepo/web test

# 目录匹配
pnpm --filter ./packages/ui build

# 通配符
pnpm --filter "./packages/*" lint

# 依赖关系（... 表示依赖）
pnpm --filter "@monorepo/app..." build
# 构建 app 及其所有依赖的包

# 被依赖关系（^... 表示被依赖）
pnpm --filter "@monorepo/shared^..." test
# 在依赖 shared 的所有包中执行

# 排除
pnpm --filter "!@monorepo/web" build
```

### 3. 并发控制

```bash
# 并行执行（默认）
pnpm -r run build

# 串行执行
pnpm -r --workspace-concurrency=1 run build

# 限制并发数
pnpm -r --workspace-concurrency=2 run build
```

### 4. 离线模式

```bash
# 完全离线
pnpm install --offline

# 优先缓存
pnpm install --prefer-offline

# 忽略缓存
pnpm install --force
```

### 5. 覆盖依赖版本

在 `package.json` 中：

```json
{
  "pnpm": {
    "overrides": {
      "react": "^18.2.0",
      "lodash": "^4.17.21"
    }
  }
}
```

### 6. 扩展包配置

在 `package.json` 中：

```json
{
  "pnpm": {
    "packageExtensions": {
      "some-package": {
        "peerDependencies": {
          "react": "*"
        }
      }
    }
  }
}
```

---

## 常见问题

### Q1: 符号链接兼容性问题

某些工具不兼容 pnpm 的符号链接。

**解决方案**：

```ini
# .npmrc
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
```

### Q2: 下载速度慢

**解决方案**：

```ini
# .npmrc
registry=https://registry.npmmirror.com
network-concurrency=16
```

### Q3: peer 依赖警告

**解决方案**：

```ini
# .npmrc
auto-install-peers=true
```

或使用 pnpmfile.js：

```javascript
module.exports = {
  packageExtensions: {
    'some-package': {
      peerDependencies: {
        'react': '*'
      }
    }
  }
};
```

### Q4: 与 npm 项目共存

需要将现有项目迁移到 pnpm。

**步骤**：

```bash
# 1. 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json yarn.lock

# 2. 使用 pnpm 安装
pnpm install
```

### Q5: 强制使用 pnpm

防止团队成员误用 npm。

**在 package.json 中**：

```json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

---

## 总结

```
┌─────────────────────────────────────────────────────┐
│                    pnpm 核心优势                      │
├─────────────────────────────────────────────────────┤
│  ⚡ 快速         比 npm 快 2-3 倍                   │
│  💾 节省空间     硬链接共享，节省 50%+ 空间          │
│  🔒 严格依赖     杜绝幽灵依赖                       │
│  📦 Monorepo     原生 workspace 支持                │
└─────────────────────────────────────────────────────┘
```

> 官方文档：https://pnpm.io/zh/
