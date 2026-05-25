# package.json 详解

## 概述

`package.json` 是 Node.js 项目的核心配置文件，位于项目根目录。它记录了项目的元数据、依赖关系、脚本命令等重要信息。

## 一、基础字段

### 必需字段

#### `name`
项目的名称，必须满足以下条件：
- 长度小于等于 214 个字符
- 只能包含小写字母、数字、连字符（-）或下划线（_）
- 不能以 `.` 或 `_` 开头
- 不能包含大写字母（为了兼容 npm）
- 不能使用 Node.js 核心模块的名称（如 http、fs 等）

```json
{
  "name": "my-awesome-project"
}
```

#### `version`
项目的版本号，遵循 [语义化版本（SemVer）](https://semver.org/lang/zh-CN/) 规范：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

```json
{
  "version": "1.0.0"
}
```

---

## 二、描述性字段

### `description`
项目的简短描述，帮助用户了解项目用途

```json
{
  "description": "一个用于处理用户数据的实用工具库"
}
```

### `keywords`
关键词数组，便于在 npm 搜索时被发现

```json
{
  "keywords": ["utility", "data", "helper", "tools"]
}
```

### `author`
项目作者信息

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

### `license`
项目的开源许可证

```json
{
  "license": "MIT"
}
```

常用许可证：
- `MIT` - 最宽松的许可证
- `Apache-2.0` - Apache 许可证
- `GPL-3.0` - GNU 通用公共许可证
- `BSD-3-Clause` - BSD 许可证

---

## 三、文件相关字段

### `main`
项目的主入口文件（CommonJS），当其他模块 `require` 你的包时加载的文件

```json
{
  "main": "index.js"
}
```

### `module`
ES Module 入口文件，供 webpack、Rollup 等打包工具使用（非 Node.js 官方字段）

```json
{
  "module": "./dist/index.mjs"
}
```

### `browser`
浏览器环境的入口文件或模块替换规则

```json
{
  "browser": {
    "./dist/index.js": "./dist/index.browser.js",
    "./server.js": false
  }
}
```

简写形式：
```json
{
  "browser": "./dist/index.browser.js"
}
```

### `sideEffects`
告知打包工具哪些模块包含副作用，用于 tree-shaking 优化

```json
{
  "sideEffects": false
}
```

指定有副作用的文件：
```json
{
  "sideEffects": ["*.css", "*.scss", "./src/polyfills.js"]
}
```

设置为 `false` 表示所有文件都是无副作用的，可以安全地进行 tree-shaking。

### `style`
指定 CSS 入口文件

```json
{
  "style": "./dist/style.css"
}
```

### `type`
指定模块系统类型
- `"type": "commonjs"` - 使用 CommonJS（require/module.exports）
- `"type": "module"` - 使用 ES Module（import/export）

```json
{
  "type": "module"
}
```

### `files`
发布到 npm 时包含的文件/目录

```json
{
  "files": [
    "src",
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### `bin`
命令行工具的可执行文件，可以创建全局命令

```json
{
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
```

配置后，用户安装你的包后，可以直接在终端运行 `my-cli` 命令。

---

## 四、依赖管理字段

### `dependencies`
生产环境依赖，项目运行时必需的包

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "axios": "^1.4.0",
    "lodash": "^4.17.21"
  }
}
```

**版本号格式**：
- `exact`（精确版本）：`1.0.0` - 只安装 1.0.0
- `^`（插入符）：`^1.0.0` - 可安装 >=1.0.0 且 <2.0.0
- `~`（波浪号）：`~1.0.0` - 可安装 >=1.0.0 且 <1.1.0
- `*` 或 `x`：任意版本
- `>=`、`<`、`<=`：范围约束
- `||`：或条件
- `latest`：最新版本
- `git`：从 git 仓库安装

```json
{
  "dependencies": {
    "package1": "1.0.0",        // 精确版本
    "package2": "^1.2.3",       // 兼容补丁和小版本更新
    "package3": "~1.2.3",       // 仅兼容补丁更新
    "package4": ">=1.0.0",      // 大于等于指定版本
    "package5": "https://github.com/user/repo.git"  // 从 git 安装
  }
}
```

### `devDependencies`
开发环境依赖，仅在开发时需要（如构建工具、测试框架、代码检查工具等）

```json
{
  "devDependencies": {
    "vite": "^4.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### `peerDependencies`
同伴依赖，指定你的包与某个包的版本兼容性，要求使用者自己安装

```json
{
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}
```

### `optionalDependencies`
可选依赖，即使安装失败也不会中断整个安装过程

```json
{
  "optionalDependencies": {
    "chalk": "^4.0.0"
  }
}
```

### `bundledDependencies`
打包依赖，发布时会将这些依赖打包进去

```json
{
  "bundledDependencies": ["package1", "package2"]
}
```

---

## 五、脚本字段

### `scripts`
定义可执行的 npm 脚本命令

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix",
    "format": "prettier --write src/",
    "test": "vitest"
  }
}
```

**常用生命周期钩子**：

```json
{
  "scripts": {
    "preinstall": "在 install 之前执行",
    "install": "安装依赖时执行",
    "postinstall": "在 install 之后执行",
    "preuninstall": "在 uninstall 之前执行",
    "predev": "在 dev 之前执行",
    "postdev": "在 dev 之后执行",
    "prebuild": "在 build 之前执行",
    "postbuild": "在 build 之后执行"
  }
}
```

**使用方式**：
```bash
npm run dev
npm run build
npm run lint
```

---

## 六、配置字段

### `config`
配置脚本中使用的环境变量

```json
{
  "config": {
    "port": "8080",
    "mode": "production"
  }
}
```

在脚本中通过 `npm_package_config_port` 访问。

### `engines`
指定项目运行的 Node.js 和 npm 版本要求

```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

### `browserslist`
指定项目需要支持的浏览器范围（供 autoprefixer、postcss 等工具使用）

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

---

## 七、发布相关字段

### `private`
设为 `true` 时，防止包被意外发布到 npm

```json
{
  "private": true
}
```

### `publishConfig`
发布时的配置

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/",
    "tag": "latest"
  }
}
```

---

## 八、仓库与主页

### `repository`
项目的代码仓库地址

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  }
}
```

简写形式：
```json
{
  "repository": "username/repo"
}
```

### `homepage`
项目的主页 URL

```json
{
  "homepage": "https://github.com/username/repo#readme"
}
```

### `bugs`
提交问题（bug）的地址

```json
{
  "bugs": {
    "url": "https://github.com/username/repo/issues",
    "email": "bugs@example.com"
  }
}
```

---

## 九、现代前端相关字段

### `exports`
定义包的导出路径（现代导出方式，优先级高于 `main`）

```json
{
  "exports": {
    ".": "./src/index.js",
    "./utils": "./src/utils/index.js",
    "./components/*": "./src/components/*/index.js"
  }
}
```

**条件导出**（支持不同环境）：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

### `imports`
定义包内部的导入路径别名

```json
{
  "imports": {
    "#utils": "./src/utils/index.js",
    "#components/*": "./src/components/*/index.js"
  }
}
```

使用时：
```javascript
import { helper } from '#utils';
```

### `types` / `typings`
指定 TypeScript 类型声明文件

```json
{
  "types": "./dist/index.d.ts"
}
```

---

### `funding`
项目的资金赞助链接，npm 会显示赞助信息

```json
{
  "funding": {
    "type": "github",
    "url": "https://github.com/sponsors/username"
  }
}
```

或简写形式：
```json
{
  "funding": "https://github.com/sponsors/username"
}
```

### `man`
man 手册文件的路径（用于 Unix/Linux 命令行工具）

```json
{
  "man": "./man/package.1"
}
```

或数组形式：
```json
{
  "man": ["./man/package.1", "./man/package.2"]
}
```

### `directories`
指定项目目录结构的说明（已过时，主要用于文档说明）

```json
{
  "directories": {
    "lib": "./lib",
    "bin": "./bin",
    "man": "./man",
    "doc": "./doc",
    "example": "./examples"
  }
}
```

---

## 十一、依赖覆盖字段

### `overrides`
覆盖依赖树的版本（npm 8.7+，推荐使用）

```json
{
  "overrides": {
    "some-package": "^1.0.0",
    "nested-package": {
      "some-dep": "2.0.0"
    }
  }
}
```

### `resolutions`
Yarn 的依赖版本覆盖（类似 overrides）

```json
{
  "resolutions": {
    "some-package": "^1.0.0",
    "**/some-dep": "2.0.0"
  }
}
```

---

## 十二、CDN 入口字段

### `unpkg`
指定在 unpkg CDN 上的入口文件

```json
{
  "unpkg": "./dist/index.umd.js"
}
```

### `jsdelivr`
指定在 jsDelivr CDN 上的入口文件

```json
{
  "jsdelivr": "./dist/index.umd.js"
}
```

---

## 十三、工具配置字段

许多工具直接在 package.json 中配置，使用各自的前缀：

### `eslintConfig`
ESLint 配置

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
Babel 配置

```json
{
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

### `jest`
Jest 测试配置

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage"
  }
}
```

### `postcss`
PostCSS 配置

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

## 十四、其他字段

### `workspaces`
定义 monorepo 的工作空间

```json
{
  "workspaces": [
    "packages/*"
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

### `os`
指定项目支持的操作系统

```json
{
  "os": ["darwin", "linux"]
}
```

### `cpu`
指定项目支持的 CPU 架构

```json
{
  "cpu": ["x64", "arm64"]
}
```

---

## 十五、完整的 package.json 示例

```json
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "一个用于处理用户数据的实用工具库",
  "keywords": ["utility", "data", "helper"],
  "author": "张三 <zhangsan@example.com>",
  "license": "MIT",
  "private": false,
  "type": "module",

  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "browser": "./dist/index.browser.js",
  "types": "./dist/index.d.ts",
  "style": "./dist/style.css",
  "sideEffects": ["*.css", "*.scss"],

  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.browser.js",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./utils": "./dist/utils/index.js",
    "./style.css": "./dist/style.css"
  },

  "imports": {
    "#utils": "./src/utils/index.js",
    "#config": "./src/config/index.js"
  },

  "files": ["dist", "README.md", "LICENSE"],

  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  },

  "dependencies": {
    "axios": "^1.6.0",
    "lodash-es": "^4.17.21"
  },

  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },

  "peerDependencies": {
    "vue": "^3.3.0"
  },

  "optionalDependencies": {
    "chalk": "^5.0.0"
  },

  "overrides": {
    "some-package": "^1.0.0"
  },

  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },

  "browserslist": ["> 1%", "last 2 versions", "not dead"],

  "funding": {
    "type": "github",
    "url": "https://github.com/sponsors/username"
  },

  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-project.git"
  },

  "homepage": "https://github.com/username/my-project#readme",

  "bugs": {
    "url": "https://github.com/username/my-project/issues"
  }
}
```

---

## 十六、字段速查表

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 项目名称（必需） |
| `version` | string | 版本号（必需） |
| `description` | string | 项目描述 |
| `keywords` | array | 关键词 |
| `author` | string/object | 作者信息 |
| `license` | string | 开源许可证 |
| `main` | string | 主入口文件（CJS） |
| `module` | string | ES Module 入口 |
| `browser` | string/object | 浏览器入口/替换规则 |
| `type` | string | 模块类型（module/commonjs） |
| `types`/`typings` | string | TypeScript 声明文件 |
| `exports` | object | 导出路径配置 |
| `imports` | object | 内部导入别名 |
| `files` | array | 发布时包含的文件 |
| `bin` | string/object | 命令行工具入口 |
| `scripts` | object | 脚本命令 |
| `dependencies` | object | 生产依赖 |
| `devDependencies` | object | 开发依赖 |
| `peerDependencies` | object | 同伴依赖 |
| `optionalDependencies` | object | 可选依赖 |
| `bundledDependencies` | array | 打包依赖 |
| `overrides` | object | 依赖版本覆盖（npm） |
| `resolutions` | object | 依赖版本覆盖（Yarn） |
| `engines` | object | Node/npm 版本要求 |
| `browserslist` | array/string | 浏览器兼容范围 |
| `os` | array | 支持的操作系统 |
| `cpu` | array | 支持的 CPU 架构 |
| `private` | boolean | 是否禁止发布 |
| `publishConfig` | object | 发布配置 |
| `workspaces` | array/object | monorepo 工作空间 |
| `sideEffects` | boolean/array | 是否有副作用（tree-shaking） |
| `style` | string | CSS 入口文件 |
| `unpkg` | string | unpkg CDN 入口 |
| `jsdelivr` | string | jsDelivr CDN 入口 |
| `funding` | string/object | 赞助链接 |
| `repository` | string/object | 代码仓库 |
| `homepage` | string | 项目主页 |
| `bugs` | string/object | 问题提交地址 |
| `man` | string/array | man 手册路径 |
| `directories` | object | 目录结构说明 |
| `config` | object | 脚本配置变量 |

---

## 十七、常用命令速查

| 命令 | 说明 |
|------|------|
| `npm init` | 交互式创建 package.json |
| `npm init -y` | 使用默认值创建 package.json |
| `npm install` | 安装所有依赖 |
| `npm install <package>` | 安装依赖并添加到 dependencies |
| `npm install <package> --save-dev` | 安装依赖并添加到 devDependencies |
| `npm install <package> --global` | 全局安装包 |
| `npm update` | 更新所有依赖 |
| `npm run <script>` | 执行脚本命令 |
| `npm publish` | 发布包到 npm |
| `npm version <version>` | 更新版本号 |

---

## 参考链接

- [npm 官方文档 - package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [语义化版本规范（SemVer）](https://semver.org/lang/zh-CN/)
- [Node.js 模块 exports 字段说明](https://nodejs.org/api/packages.html#package-entry-points)
- [browserslist 官方文档](https://browsersl.ist/)

- [npm 官方文档 - package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [语义化版本规范（SemVer）](https://semver.org/lang/zh-CN/)
- [Node.js 模块 exports 字段说明](https://nodejs.org/api/packages.html#exports)
