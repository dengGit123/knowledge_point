# package.json 详解

## 概述

`package.json` 是 Node.js 项目的核心配置文件，位于项目根目录。它记录了项目的元数据、依赖关系、脚本命令等重要信息。

---

## 一、基础字段

### `name`（必需）

**定义含义**：项目的唯一标识符名称。

**用法**：作为包在 npm 仓库中的唯一标识，其他项目通过这个名称安装你的包。

**影响的地方**：
- npm 发布后的包名
- `npm install` 时使用的名称
- `require()` 或 `import` 时使用的名称

**使用示例**：

```json
{
  "name": "my-awesome-project"
}
```

其他项目安装：
```bash
npm install my-awesome-project
```

代码中使用：
```javascript
import something from 'my-awesome-project';
```

**命名规则**：
- 长度 ≤ 214 字符
- 只能包含小写字母、数字、连字符（-）、下划线（_）
- 不能以 `.` 或 `_` 开头
- 不能使用 Node.js 核心模块名（http、fs 等）

---

### `version`（必需）

**定义含义**：项目的当前版本号，遵循语义化版本规范（SemVer）。

**用法**：格式为 `主版本号.次版本号.修订号`，用于版本管理和更新控制。

**影响的地方**：
- npm 发布时的版本
- 依赖版本匹配时作为基准
- `npm version` 命令会更新此字段

**版本号规则**：
- **主版本号**：不兼容的 API 修改（1.0.0 → 2.0.0）
- **次版本号**：向下兼容的功能新增（1.0.0 → 1.1.0）
- **修订号**：向下兼容的问题修正（1.0.0 → 1.0.1）

**使用示例**：

```json
{
  "version": "1.2.3"
}
```

更新版本：
```bash
npm version patch   # 1.2.3 → 1.2.4
npm version minor   # 1.2.3 → 1.3.0
npm version major   # 1.2.3 → 2.0.0
```

---

## 二、描述性字段

### `description`

**定义含义**：项目的简短描述。

**用法**：帮助用户快速了解项目用途，显示在 npm 搜索结果中。

**影响的地方**：
- `npm search` 结果中显示
- npm 包页面展示

**使用示例**：

```json
{
  "description": "一个用于处理用户数据的实用工具库，支持数据验证、转换和持久化"
}
```

---

### `keywords`

**定义含义**：项目相关的关键词数组。

**用法**：提高项目在 npm 中的可搜索性。

**影响的地方**：
- `npm search` 的搜索匹配
- 帮助用户发现你的包

**使用示例**：

```json
{
  "keywords": ["utility", "data", "validation", "helper", "tools"]
}
```

---

### `author`

**定义含义**：项目作者信息。

**用法**：标识包的作者，便于联系和责任追溯。

**影响的地方**：
- npm 包页面显示作者信息

**使用示例**：

```json
{
  "author": "张三 <zhangsan@example.com> (https://zhangsan.com)"
}
```

或对象形式：

```json
{
  "author": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "url": "https://zhangsan.com"
  }
}
```

---

### `license`

**定义含义**：项目的开源许可证类型。

**用法**：告知用户可以如何使用、修改和分发你的代码。

**影响的地方**：
- npm 包页面显示许可证
- 法律效力，告知用户权利和义务

**常用许可证**：

| 许可证 | 说明 |
|--------|------|
| `MIT` | 最宽松，可随意使用 |
| `Apache-2.0` | 需要保留版权和许可声明 |
| `GPL-3.0` | 要求衍生作品开源 |
| `BSD-3-Clause` | 类似 MIT，有更多条款 |

**使用示例**：

```json
{
  "license": "MIT"
}
```

或自定义许可证：

```json
{
  "license": "UNLICENSED",
  "private": true
}
```

---

## 三、文件相关字段

### `main`

**定义含义**：项目的默认入口文件（CommonJS）。

**用法**：当其他代码使用 `require()` 导入你的包时，加载的文件。

**影响的地方**：
- CommonJS 环境下的模块解析
- Node.js 直接导入包时的入口

**使用示例**：

```json
{
  "main": "./dist/index.js"
}
```

其他项目使用：

```javascript
const myLib = require('my-awesome-project');
// 加载的是 my-awesome-project/dist/index.js
```

---

### `module`

**定义含义**：ES Module 的入口文件（非官方，但广泛支持）。

**用法**：告知打包工具（webpack、Rollup 等）ES Module 的入口位置。

**影响的地方**：
- 打包工具优先使用此字段而非 `main`
- 支持 tree-shaking 优化

**使用示例**：

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.esm.js"
}
```

打包工具会优先使用 `module`，Node.js 使用 `main`。

---

### `type`

**定义含义**：指定项目使用的模块系统类型。

**用法**：设置为 `"module"` 时，`.js` 文件被当作 ES Module 处理。

**影响的地方**：
- `.js` 文件的解析方式
- 是否可以使用 `import/export`
- `require()` 是否可用

**可选值**：
- `"commonjs"`：使用 `require/module.exports`（默认）
- `"module"`：使用 `import/export`

**使用示例**：

```json
{
  "type": "module"
}
```

设置后，所有 `.js` 文件被视为 ES Module：

```javascript
// ✅ 可以使用
import { foo } from './foo.js';

// ❌ 不可以使用
const bar = require('./bar.js');
```

**注意**：CommonJS 文件需要使用 `.cjs` 扩展名，ES Module 需要明确配置。

---

### `exports`

**定义含义**：定义包的导出规则（官方推荐的现代方式）。

**用法**：精细控制包的哪些路径可以被外部访问，支持条件导出。

**影响的地方**：
- 优先级高于 `main`/`module`
- 限制子路径访问
- 支持不同环境的入口

**使用示例**：

**基础导出**：

```json
{
  "exports": "./dist/index.js"
}
```

**条件导出**（推荐）：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts",
      "browser": "./dist/index.browser.js",
      "default": "./dist/index.js"
    },
    "./utils": "./dist/utils.js",
    "./components/*": "./dist/components/*.js"
  }
}
```

使用效果：

```javascript
// 不同环境加载不同文件
import pkg from 'my-package';           // 根据环境选择
import pkg from 'my-package/utils';     // 子路径
```

**安全限制**：

```json
{
  "exports": {
    ".": "./index.js",
    "./lib": "./lib.js"
    // 只能访问这两个路径，其他路径被禁止
  }
}
```

---

### `browser`

**定义含义**：浏览器环境的入口文件或模块替换规则。

**用法**：告诉打包工具在浏览器环境下使用哪些文件。

**影响的地方**：
- webpack 等打包工具的模块解析
- 可以替换 Node.js 特定的模块

**使用示例**：

**简写形式**：

```json
{
  "browser": "./dist/index.browser.js"
}
```

**对象形式（替换规则）**：

```json
{
  "browser": {
    "./dist/index.js": "./dist/index.browser.js",
    "./lib/server.js": false,
    "./lib/node-only.js": "./lib/browser-shim.js"
  }
}
```

设置为 `false` 表示该模块在浏览器中被排除。

---

### `sideEffects`

**定义含义**：告知打包工具哪些模块包含副作用。

**用法**：用于 tree-shaking 优化，标记纯函数模块。

**影响的地方**：
- webpack/Rollup 的 tree-shaking
- 未使用的导出是否会被删除
- CSS 文件是否会被保留

**使用示例**：

**所有文件无副作用**（推荐纯函数库）：

```json
{
  "sideEffects": false
}
```

**指定有副作用的文件**：

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js",
    "./src/register.js"
  ]
}
```

**副作用示例**：

```javascript
// 有副作用 - 修改全局变量
Array.prototype.myMethod = function() {};

// 有副作用 - 执行初始化代码
const config = loadConfig();

// 无副作用 - 纯函数
export function add(a, b) {
  return a + b;
}
```

---

### `files`

**定义含义**：发布到 npm 时包含的文件/目录。

**用法**：控制哪些文件会被打包发布，减少包体积。

**影响的地方**：
- `npm publish` 发布的内容
- 用户安装包时下载的文件
- 默认会包含所有文件（除了 `.gitignore` 中的）

**使用示例**：

```json
{
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

**排除文件**：创建 `.npmignore` 文件：

```
# .npmignore
src/
tests/
*.log
.gitignore
```

---

### `bin`

**定义含义**：命令行工具的可执行文件映射。

**用法**：创建全局命令，让用户可以直接在终端运行你的工具。

**影响的地方**：
- `npm install -g` 后创建的命令
- `npm link` 创建的本地命令
- `node_modules/.bin/` 中的命令

**使用示例**：

```json
{
  "bin": {
    "mycli": "./bin/cli.js",
    "mycli-build": "./bin/build.js"
  }
}
```

可执行文件顶部需要 shebang：

```javascript
#!/usr/bin/env node

console.log('My CLI Tool');
```

用户使用：

```bash
# 全局安装
npm install -g my-package

# 可以直接运行
mycli
mycli-build
```

---

### `types` / `typings`

**定义含义**：TypeScript 类型声明文件的路径。

**用法**：告知 TypeScript 编辑器类型文件的位置。

**影响的地方**：
- TypeScript 的类型提示
- 编辑器的自动补全
- 类型检查

**使用示例**：

```json
{
  "types": "./dist/index.d.ts"
}
```

或配合 `exports` 使用：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

---

## 四、依赖管理字段

### `dependencies`

**定义含义**：生产环境必需的依赖包。

**用法**：项目运行时必须的包，用户安装你的包时会自动安装这些依赖。

**影响的地方**：
- `npm install` 自动安装
- `npm publish` 时作为必需依赖
- 生产环境部署时需要

**版本号格式**：

| 格式 | 示例 | 说明 |
|------|------|------|
| 精确版本 | `1.0.0` | 只安装 1.0.0 |
| `^` 插入符 | `^1.0.0` | ≥1.0.0 且 <2.0.0 |
| `~` 波浪号 | `~1.0.0` | ≥1.0.0 且 <1.1.0 |
| `>=` 大于等于 | `>=1.0.0` | 1.0.0 及以上 |
| `<` 小于 | `<2.0.0` | 小于 2.0.0 |
| `*` 任意版本 | `*` | 最新版本 |
| `latest` | `latest` | 最新版本 |
| `git` | `git+https://...` | 从 git 仓库安装 |

**使用示例**：

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "axios": "^1.6.0",
    "lodash-es": "^4.17.21",
    "my-private-lib": "github:username/repo#v1.0.0"
  }
}
```

安装依赖：

```bash
npm install vue@^3.3.0
```

---

### `devDependencies`

**定义含义**：开发环境依赖，仅在开发时需要。

**用法**：用于开发工具、测试框架、构建工具等，不影响运行。

**影响的地方**：
- `npm install` 会安装
- 用户安装你的包时**不会**安装这些依赖
- CI/CD 环境可能需要安装

**使用示例**：

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "webpack": "^5.0.0",
    "eslint": "^8.55.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.10.0"
  }
}
```

安装开发依赖：

```bash
npm install --save-dev typescript
# 或
npm install -D typescript
```

---

### `peerDependencies`

**定义含义**：同伴依赖，指定与宿主环境的版本兼容性。

**用法**：告知用户你的包需要配合哪些包使用，但不自动安装。

**影响的地方**：
- 用户需要自己安装这些依赖
- npm 7+ 会自动安装（npm 3-6 只警告）
- 版本不匹配时会警告

**使用示例**：

```json
{
  "peerDependencies": {
    "vue": "^3.0.0",
    "vite": "^4.0.0"
  },
  "peerDependenciesMeta": {
    "vite": {
      "optional": true
    }
  }
}
```

用户安装你的包后：

```bash
npm install my-plugin
# 会提示：需要 vue@^3.0.0

# 用户需要手动安装
npm install vue@^3.0.0
```

---

### `optionalDependencies`

**定义含义**：可选依赖，安装失败不会中断。

**用法**：用于增强功能的包，即使缺失也不影响核心功能。

**影响的地方**：
- 安装失败不会报错
- 代码中需要判断是否存在

**使用示例**：

```json
{
  "optionalDependencies": {
    "chalk": "^5.0.0",
    "node-notifier": "^10.0.0"
  }
}
```

代码中使用：

```javascript
import chalk from 'chalk';

// 需要判断是否存在
if (chalk) {
  console.log(chalk.green('Success!'));
} else {
  console.log('Success!');
}
```

---

### `bundledDependencies`

**定义含义**：打包依赖，发布时将依赖打包进去。

**用法**：用于需要一起发布的依赖包。

**影响的地方**：
- 发布时会将这些依赖打包
- 增加包体积

**使用示例**：

```json
{
  "bundledDependencies": ["dep1", "dep2"],
  "dependencies": {
    "dep1": "1.0.0",
    "dep2": "2.0.0"
  }
}
```

**注意**：通常不推荐使用，应让用户自己安装依赖。

---

## 五、脚本字段

### `scripts`

**定义含义**：定义可执行的 npm 脚本命令。

**用法**：封装常用命令，简化开发流程。

**影响的地方**：
- `npm run <name>` 执行脚本
- 支持生命周期钩子
- 可以访问 npm 环境变量

**使用示例**：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --fix",
    "test": "vitest",
    "coverage": "vitest --coverage"
  }
}
```

执行脚本：

```bash
npm run dev
npm run build
npm run lint
```

**生命周期钩子**：

```json
{
  "scripts": {
    "preinstall": "echo '安装前执行'",
    "install": "echo '安装时执行'",
    "postinstall": "npm run build",
    "predev": "echo 'dev 前执行'",
    "dev": "vite",
    "postdev": "echo 'dev 后执行'"
  }
}
```

**npm 环境变量**：

```javascript
// 在脚本中可访问
process.env.npm_package_version        // 包版本
process.env.npm_package_name           // 包名
process.env.npm_lifecycle_event         // 当前生命周期事件
process.env.npm_config_user_agent      // npm 用户代理
```

---

## 六、配置字段

### `config`

**定义含义**：脚本中使用的配置变量。

**用法**：定义可在脚本中访问的配置值。

**影响的地方**：
- 通过 `npm_package_config_<key>` 访问
- `npm config get` 可查看

**使用示例**：

```json
{
  "config": {
    "port": "3000",
    "mode": "production"
  },
  "scripts": {
    "start": "node server.js $npm_package_config_port"
  }
}
```

用户可以覆盖：

```bash
npm config set mypackage:port 8080
npm run start
# 会使用 8080 端口
```

---

### `engines`

**定义含义**：指定 Node.js 和 npm 的版本要求。

**用法**：告知用户项目需要的运行环境版本。

**影响的地方**：
- `npm install` 会检查版本（如果设置 engine-strict）
- 不满足时会警告或报错

**使用示例**：

```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

配合 `.npmrc` 严格检查：

```ini
# .npmrc
engine-strict=true
```

---

### `browserslist`

**定义含义**：指定项目需要支持的浏览器范围。

**用法**：供 autoprefixer、postcss、babel 等工具使用。

**影响的地方**：
- CSS 自动添加前缀
- JavaScript 转译目标
- polyfill 的添加

**使用示例**：

```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ]
}
```

常用配置：

```json
{
  "browserslist": "defaults" // 使用默认配置
}
```

查询结果：

```bash
npx browserslist
```

---

## 七、发布相关字段

### `private`

**定义含义**：标记包为私有，防止误发布。

**用法**：设为 `true` 时，`npm publish` 会失败。

**影响的地方**：
- `npm publish` 被禁止
- 适合公司内部项目

**使用示例**：

```json
{
  "private": true
}
```

---

### `publishConfig`

**定义含义**：发布到 npm 时的配置。

**用法**：覆盖发布时的默认配置。

**影响的地方**：
- 发布时的访问权限
- 发布的目标仓库
- 发布的标签

**使用示例**：

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/",
    "tag": "latest"
  }
}
```

发布到私有仓库：

```json
{
  "publishConfig": {
    "registry": "https://npm.company.com/"
  }
}
```

---

## 八、其他重要字段

### `workspaces`

**定义含义**：定义 monorepo 的工作空间。

**用法**：指定子包的位置，实现多包管理。

**影响的地方**：
- `npm install` 会自动安装所有工作区的依赖
- 支持工作区之间的相互引用

**使用示例**：

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

或对象形式：

```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/react"]
  }
}
```

---

### `imports`

**定义含义**：定义包内部的导入路径别名。

**用法**：创建简洁的内部导入路径，不需要相对路径。

**影响的地方**：
- 支持 `#` 开头的路径
- 仅限包内部使用

**使用示例**：

```json
{
  "imports": {
    "#utils": "./src/utils/index.js",
    "#config": "./src/config/index.js",
    "#components/*": "./src/components/*/index.js"
  }
}
```

使用：

```javascript
// 不需要相对路径
import { helper } from '#utils';
import { Button } from '#components/button';

// 等同于
import { helper } from './src/utils/index.js';
import { Button } from './src/components/button/index.js';
```

---

### `os`

**定义含义**：指定项目支持的操作系统。

**用法**：告知用户项目支持的系统。

**影响的地方**：
- 不匹配的系统安装时会警告

**使用示例**：

```json
{
  "os": ["darwin", "linux"]
}
```

取反：

```json
{
  "os": ["!win32"]
}
```

---

### `cpu`

**定义含义**：指定项目支持的 CPU 架构。

**用法**：告知用户项目支持的架构。

**影响的地方**：
- 不匹配的架构安装时会警告

**使用示例**：

```json
{
  "cpu": ["x64", "arm64"]
}
```

取反：

```json
{
  "cpu": ["!ia32"]
}
```

---

## 九、工具配置字段

许多工具可以在 package.json 中配置，使用各自的前缀：

### `eslintConfig`

```json
{
  "eslintConfig": {
    "extends": ["eslint:recommended"],
    "rules": {
      "no-console": "warn"
    }
  }
}
```

### `babel`

```json
{
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

### `jest`

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage"
  }
}
```

### `postcss`

```json
{
  "postcss": {
    "plugins": {
      "autoprefixer": {},
      "tailwindcss": {}
    }
  }
}
```

---

## 十、完整示例

```json
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "一个现代化的前端工具库",
  "keywords": ["utility", "frontend", "tools"],
  "author": "张三 <zhangsan@example.com>",
  "license": "MIT",
  "type": "module",
  "private": false,

  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": "./dist/utils.js"
  },
  "sideEffects": false,

  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint src --fix"
  },

  "dependencies": {
    "axios": "^1.6.0"
  },

  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },

  "peerDependencies": {
    "vue": "^3.0.0"
  },

  "engines": {
    "node": ">=16.0.0"
  },

  "browserslist": ["> 1%", "last 2 versions"]
}
```

---

## 参考链接

- [npm 官方文档](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Node.js exports 字段](https://nodejs.org/api/packages.html#exports)
- [browserslist](https://browsersl.ist/)
