# AMD 模块规范（Asynchronous Module Definition）

> AMD 是 JavaScript 的**浏览器端模块化规范**，专为浏览器环境设计，核心特点是**异步加载模块**，不会阻塞页面渲染。

> 官方文档：[AMD 规范 GitHub](https://github.com/amdjs/amdjs-api/wiki/AMD)

---

## 一、核心概念

### 1.1 什么是 AMD

AMD（Asynchronous Module Definition，异步模块定义）是由 [RequireJS](https://requirejs.org/) 作者 James Burke 提出的一种模块化规范。它的核心理念是：**浏览器环境下模块必须异步加载**，因为同步加载远程文件会导致页面冻结。

> 通俗类比：如果 CommonJS 是去仓库直接拿货（同步），那 AMD 就是网购下单——下单后继续做别的事，货到了通知你（异步回调）。

### 1.2 为什么需要 AMD

```
JavaScript 模块化的困境：

2009 年前 → 没有模块系统，只能用 <script> 标签手动管理
            ❌ 全局变量污染
            ❌ 依赖关系混乱
            ❌ 加载顺序难以维护

CommonJS → 解决了服务端模块化问题
            ✅ 适合 Node.js（文件在本地磁盘）
            ❌ require() 是同步的，浏览器中同步加载远程文件会阻塞页面

AMD → 专门为浏览器设计的异步模块方案
            ✅ 异步加载，不阻塞页面
            ✅ 自动管理依赖关系
            ✅ 浏览器原生可用（无需打包工具）
```

### 1.3 核心特性

| 特性 | 说明 |
|------|------|
| **异步加载** | 模块加载不阻塞浏览器，通过回调函数获取模块 |
| **依赖前置** | 声明模块时即声明所有依赖，加载器提前加载 |
| **浏览器原生运行** | 无需编译/打包，直接在浏览器中运行 |
| **依赖自动管理** | 加载器自动解析依赖图，按正确顺序加载 |

---

## 二、基本语法

AMD 规范只定义了一个全局函数 `define()`，以及一个模块加载函数 `require()`。

### 2.1 define() — 定义模块

#### 语法签名

```javascript
define(id?, dependencies?, factory)
```

| 参数 | 类型 | 是否必须 | 说明 |
|------|------|---------|------|
| `id` | `string` | 可选 | 模块 ID（通常省略，由文件路径决定） |
| `dependencies` | `string[]` | 可选 | 依赖模块 ID 数组 |
| `factory` | `function` / `object` | 必须 | 模块工厂函数或直接导出的对象 |

#### 定义简单模块（无依赖）

```javascript
// ========== math.js ==========
define(function () {
  return {
    add(a, b) { return a + b },
    subtract(a, b) { return a - b },
    multiply(a, b) { return a * b },
    divide(a, b) { return b !== 0 ? a / b : NaN }
  }
})
```

#### 定义有依赖的模块

```javascript
// ========== calculator.js ==========
// 第一个参数：依赖数组
// 第二个参数：工厂函数，参数对应依赖数组中的模块
define(['./math'], function (math) {
  return {
    calculate(expression) {
      // 使用 math 模块中的方法
      const [a, operator, b] = expression.split(' ')
      switch (operator) {
        case '+': return math.add(Number(a), Number(b))
        case '-': return math.subtract(Number(a), Number(b))
        case '*': return math.multiply(Number(a), Number(b))
        case '/': return math.divide(Number(a), Number(b))
        default: throw new Error(`Unknown operator: ${operator}`)
      }
    }
  }
})
```

#### 多依赖模块

```javascript
// ========== app.js ==========
define([
  './math',       // 依赖 1
  './logger',     // 依赖 2
  './config'      // 依赖 3
], function (math, logger, config) {
  // 参数顺序与依赖数组一一对应
  logger.log('App initialized')

  return {
    run() {
      const result = math.add(config.baseValue, 10)
      logger.log(`Result: ${result}`)
      return result
    }
  }
})
```

#### 直接导出对象（无需工厂函数）

```javascript
// ========== config.js ==========
// 如果模块不需要依赖且只是导出配置，可以直接传对象
define({
  apiBaseUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3
})
```

#### 使用 CommonJS 简化写法（Simplified CommonJS Wrapping）

AMD 支持一种类似 CommonJS 的写法，方便从 Node.js 模块迁移：

```javascript
// 使用 require, exports, module 三个特殊依赖
define(function (require, exports, module) {
  // 和 CommonJS 写法几乎一致
  const math = require('./math')
  const logger = require('./logger')

  exports.calculate = function (expression) {
    const result = math.add(1, 2)
    logger.log(`Result: ${result}`)
    return result
  }
})
```

> **注意**：这种写法看起来是同步 `require()`，但 AMD 加载器仍然会**异步加载**这些模块——它在内部扫描 `factory.toString()` 中的 `require()` 调用来提取依赖。

#### 指定模块 ID

```javascript
// 通常省略 id，由加载器根据文件路径自动生成
// 显式指定 id 的场景较少
define('my-module', ['lodash'], function (_) {
  return {
    chunk(arr, size) { return _.chunk(arr, size) }
  }
})
```

### 2.2 require() — 加载模块

#### 语法签名

```javascript
require(dependencies, callback, errback)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `dependencies` | `string[]` | 要加载的模块 ID 数组 |
| `callback` | `function` | 所有模块加载完成后的回调 |
| `errback` | `function` | 加载失败的回调（可选） |

#### 基本用法

```javascript
// 异步加载模块，加载完成后执行回调
require(['./calculator'], function (calculator) {
  const result = calculator.calculate('1 + 2')
  console.log(result) // 3
})
```

#### 加载多个模块

```javascript
require(['./math', './logger', './config'], function (math, logger, config) {
  // 所有依赖加载完成后才会执行
  const result = math.add(config.baseValue, 100)
  logger.log(`Final result: ${result}`)
})
```

#### 错误处理

```javascript
require(
  ['./nonexistent-module'],
  function (module) {
    // 成功回调
    module.doSomething()
  },
  function (err) {
    // 加载失败回调
    console.error('模块加载失败:', err)
  }
})
```

#### 全局 require 配置（RequireJS）

```javascript
// ========== main.js（入口文件）==========
requirejs.config({
  // 基础路径
  baseUrl: './src',

  // 模块路径映射（别名）
  paths: {
    'lodash': 'vendor/lodash.min',
    'jquery': 'vendor/jquery.min',
    'vue': 'vendor/vue.min'
  },

  // 非 AMD 模块的适配
  shim: {
    'jquery.plugin': {
      deps: ['jquery'],      // 依赖 jquery
      exports: 'jQuery.plugin' // 全局变量名
    }
  },

  // 配置特定模块
  config: {
    'app/settings': {
      environment: 'production'
    }
  }
})

// 配置后启动应用
require(['app/main'], function (app) {
  app.init()
})
```

---

## 三、RequireJS 加载器

### 3.1 什么是 RequireJS

RequireJS 是 AMD 规范最流行的实现，提供：

- 模块异步加载
- 依赖自动解析
- 路径别名配置
- 非 AMD 模块的适配（shim）
- 插件机制（文本、CSS 等）

### 3.2 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMD 示例</title>
  <!--
    data-main: 指定入口文件（自动加载 main.js）
    RequireJS 会自动在 main.js 之前加载自身
  -->
  <script src="vendor/require.js" data-main="src/main"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

### 3.3 项目结构

```
project/
├── index.html              ← 入口页面
├── vendor/
│   └── require.js          ← RequireJS 库
├── src/
│   ├── main.js             ← 应用入口（data-main 指向这里）
│   ├── config.js           ← RequireJS 配置
│   ├── modules/
│   │   ├── math.js         ← 模块
│   │   ├── logger.js       ← 模块
│   │   └── calculator.js   ← 模块
│   └── app/
│       └── main.js         ← 应用主逻辑
└── vendor/
    ├── lodash.min.js
    └── jquery.min.js
```

### 3.4 路径解析规则

```javascript
requirejs.config({
  baseUrl: './src',  // 基础路径

  paths: {
    // 键: 模块 ID（require 时使用）
    // 值: 相对于 baseUrl 的路径（不含 .js 后缀）
    'utils': 'modules/utils',
    'math': 'modules/math',
    'lodash': '../vendor/lodash.min'
  }
})

// 使用
require(['utils', 'lodash'], function (utils, _) {
  // 解析为 ./src/modules/utils.js
  // 解析为 ./vendor/lodash.min.js
})
```

### 3.5 shim —— 适配非 AMD 模块

许多早期库（jQuery 插件等）没有使用 AMD，需要 shim 配置：

```javascript
requirejs.config({
  paths: {
    'jquery': 'vendor/jquery.min',
    'jquery.cookie': 'vendor/jquery.cookie',
    'backbone': 'vendor/backbone',
    'underscore': 'vendor/underscore'
  },

  shim: {
    // jquery.cookie 依赖 jquery，导出全局变量 $.cookie
    'jquery.cookie': {
      deps: ['jquery'],
      exports: 'jQuery.cookie'
    },

    // backbone 依赖 underscore 和 jquery
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },

    // 只声明依赖，不导出（该库会挂载到其他全局变量上）
    'bootstrap': {
      deps: ['jquery']
    }
  }
})
```

### 3.6 RequireJS 插件

```javascript
// ========== text 插件：加载文本文件 ==========
define(['text!./template.html'], function (template) {
  // template 是 HTML 文件的字符串内容
  document.getElementById('app').innerHTML = template
})

// ========== json 插件：加载 JSON ==========
define(['json!./config.json'], function (config) {
  console.log(config.apiKey)
})

// ========== css 插件：加载 CSS ==========
define(['css!./style.css'], function () {
  // CSS 已自动注入到页面
})
```

---

## 四、模块加载流程

### 4.1 AMD 加载时序

```
页面加载 require.js
       │
       ▼
加载 data-main 指定的入口文件（main.js）
       │
       ▼
解析 requirejs.config() 配置
       │
       ▼
执行 require(['app'], callback)
       │
       ▼
┌─────────────────────────────────────┐
│  解析 'app' 的依赖树                │
│                                     │
│  app.js                             │
│  ├── math.js                        │
│  ├── logger.js                      │
│  │   └── utils.js                   │
│  └── config.js                      │
│                                     │
│  → 递归解析所有依赖                 │
│  → 确定加载顺序（依赖在前）          │
└──────────────┬──────────────────────┘
               ▼
   异步并行下载所有依赖模块
   （不阻塞页面渲染！）
       │
       ▼ 按依赖顺序执行 factory
       │
  config.js → utils.js → logger.js → math.js → app.js
       │
       ▼
  执行 require 的 callback
```

### 4.2 依赖前置 vs 依赖就近

```
┌─────────────────────────────────────────────────┐
│                AMD（依赖前置）                    │
│                                                 │
│  define(['a', 'b', 'c'], function(a, b, c) {    │
│      // 所有依赖在 define 时就声明并加载          │
│      // 即使某些依赖在特定条件下才用到             │
│  })                                              │
│                                                 │
│  ✅ 加载器可以提前知道所有依赖，并行下载           │
│  ✅ 一次性加载完成，运行时无需等待                 │
├─────────────────────────────────────────────────┤
│                CMD（依赖就近）                    │
│                                                 │
│  define(function(require) {                      │
│      var a = require('a')  // 用到时才加载        │
│                                                 │
│      if (condition) {                            │
│          var b = require('b') // 按需加载         │
│      }                                           │
│  })                                              │
│                                                 │
│  ✅ 只加载真正用到的模块                          │
│  ⚠️ 运行时才知道依赖，无法提前并行下载             │
└─────────────────────────────────────────────────┘
```

---

## 五、实战示例

### 5.1 完整项目示例

```html
<!-- ========== index.html ========== -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMD Demo</title>
  <script src="vendor/require.js" data-main="src/main"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

```javascript
// ========== src/main.js ==========
requirejs.config({
  baseUrl: './src',
  paths: {
    'jquery': '../vendor/jquery.min'
  }
})

require(['app'], function (app) {
  app.start()
})
```

```javascript
// ========== src/logger.js ==========
define(function () {
  return {
    info(msg) { console.log(`[INFO] ${new Date().toISOString()} - ${msg}`) },
    error(msg) { console.error(`[ERROR] ${msg}`) }
  }
})
```

```javascript
// ========== src/api.js ==========
define(['jquery', './logger'], function ($, logger) {
  return {
    get(url) {
      logger.info(`GET ${url}`)
      return $.ajax({ url, method: 'GET' })
    },
    post(url, data) {
      logger.info(`POST ${url}`)
      return $.ajax({ url, method: 'POST', data })
    }
  }
})
```

```javascript
// ========== src/app.js ==========
define(['./api', './logger'], function (api, logger) {
  return {
    async start() {
      logger.info('Application starting...')
      try {
        const users = await api.get('/api/users')
        logger.info(`Loaded ${users.length} users`)
      } catch (err) {
        logger.error(`Failed to load users: ${err.message}`)
      }
    }
  }
})
```

### 5.2 条件加载

```javascript
// AMD 支持运行时决定加载哪些模块
define(function () {
  const isMobile = /Mobile/.test(navigator.userAgent)

  // 动态 require
  require([isMobile ? './mobile-handler' : './desktop-handler'], function (handler) {
    handler.init()
  })
})
```

### 5.3 插件式架构

```javascript
// ========== plugin-manager.js ==========
define(function () {
  const plugins = []

  return {
    register(plugin) {
      plugins.push(plugin)
    },
    async loadAll(pluginNames) {
      return new Promise((resolve) => {
        require(pluginNames, function (...loadedPlugins) {
          loadedPlugins.forEach((plugin) => plugins.push(plugin))
          resolve(plugins)
        })
      })
    },
    getAll() {
      return plugins
    }
  }
})
```

---

## 六、AMD 与其他模块规范对比

### 6.1 四大规范横向对比

| 对比项 | AMD | CommonJS | CMD | ES Module |
|--------|-----|----------|-----|-----------|
| **设计目标** | 浏览器端 | 服务端（Node.js） | 浏览器端 | 通用标准 |
| **加载方式** | 异步 | 同步 | 异步 | 异步 |
| **加载时机** | 运行时 | 运行时 | 运行时 | 编译时（静态） |
| **依赖声明** | 依赖前置 | 就近加载 | 依赖就近 | 静态声明 |
| **主要实现** | RequireJS | Node.js | SeaJS | 原生浏览器 + Node.js |
| **Tree-shaking** | ❌ | ❌ | ❌ | ✅ |
| **现状** | 🔻 已过时 | ✅ Node.js 在用 | 🔻 已过时 | ✅ **现代标准** |

### 6.2 AMD vs CommonJS

| 对比项 | AMD | CommonJS |
|--------|-----|----------|
| 加载方式 | 异步（`define` + 回调） | 同步（`require()`） |
| 适用环境 | 浏览器 | 服务端 |
| 依赖声明 | `define(['dep'], factory)` | `const dep = require('dep')` |
| 导出方式 | `factory` 返回值 | `module.exports` |
| 语法复杂度 | 较复杂（回调嵌套） | 简洁直观 |
| 动态导入 | ✅ `require([deps], cb)` | ✅ `require(path)`（同步） |
| 文件 IO | 网络请求（慢，需异步） | 磁盘读取（快，可同步） |

### 6.3 AMD vs CMD（SeaJS）

| 对比项 | AMD（RequireJS） | CMD（SeaJS） |
|--------|-----------------|-------------|
| 依赖时机 | **依赖前置**（提前加载所有依赖） | **依赖就近**（用到时才加载） |
| 执行时机 | 依赖加载后**立即执行** factory | 依赖加载后**延迟执行**（按需执行） |
| 代码风格 | `define(['a','b'], fn)` | `define(function(require){ var a = require('a') })` |
| 性能 | 首次加载时间稍长（加载所有依赖） | 首次加载时间稍短（按需加载） |

### 6.4 AMD vs ES Module

| 对比项 | AMD | ES Module |
|--------|-----|-----------|
| 语法 | `define(['dep'], fn)` | `import dep from 'dep'` |
| 静态分析 | ❌ 运行时才知道依赖 | ✅ 编译时确定依赖 |
| Tree-shaking | ❌ | ✅ |
| 异步加载 | `require([deps], cb)` | `import()` |
| 浏览器支持 | 需 RequireJS 库 | 原生支持（现代浏览器） |
| 值的导入 | 拷贝 | 引用绑定（实时） |
| 现状 | 已被 ESM 取代 | ✅ **现代标准** |

---

## 七、AMD 的简化写法（Simplified CommonJS Wrapper）

AMD 提供了一种兼容 CommonJS 风格的写法，降低学习成本：

```javascript
// 标准 AMD 写法
define(['./math', './logger'], function (math, logger) {
  return {
    calculate(expr) {
      const result = math.add(1, 2)
      logger.log(result)
      return result
    }
  }
})

// 简化 CommonJS 风格写法
define(function (require, exports, module) {
  const math = require('./math')
  const logger = require('./logger')

  // 使用 exports 导出
  exports.calculate = function (expr) {
    const result = math.add(1, 2)
    logger.log(result)
    return result
  }

  // 或使用 module.exports
  // module.exports = { calculate: function() { ... } }
})
```

两种写法在 RequireJS 中**完全等价**。RequireJS 通过扫描 `factory.toString()` 中的 `require()` 调用来提取依赖列表。

---

## 八、AMD 的历史意义与现状

### 8.1 历史贡献

```
JavaScript 模块化演进时间线：

2009 ─── CommonJS 诞生（服务端模块化）
  │
  ├── 同年 ─── AMD 规范提出（浏览器端异步模块化）
  │         RequireJS 实现了 AMD
  │         解决了浏览器端模块化问题
  │
  ├── 2011 ─── CMD 规范提出（SeaJS）
  │         依赖就近的浏览器端方案
  │
  ├── 2015 ─── ES6 发布 ES Module 标准
  │         JavaScript 终于有了官方模块系统
  │
  ├── 2015+ ─── Webpack / Rollup / Vite 等打包工具兴起
  │            任何模块规范都能打包为浏览器可执行代码
  │
  └── 现在 ─── ES Module 成为现代标准
              AMD 逐渐退出历史舞台
```

### 8.2 AMD 解决的问题

在 ES Module 和打包工具出现之前，AMD 解决了：

1. **浏览器端模块化**：首个可行的浏览器模块方案
2. **异步加载**：不会阻塞页面渲染
3. **依赖管理**：自动解析依赖图，无需手动管理 `<script>` 顺序
4. **全局污染**：模块独立作用域，不再依赖全局变量

### 8.3 为什么 AMD 被淘汰

| 原因 | 说明 |
|------|------|
| **ES Module 标准化** | JavaScript 有了官方模块系统，浏览器原生支持 |
| **打包工具普及** | Webpack/Vite 可以处理任何模块格式，无需在浏览器中做模块加载 |
| **语法冗余** | AMD 的 `define(['dep'], fn)` 回调写法不如 `import/export` 简洁 |
| **无法静态分析** | 运行时加载导致无法 Tree-shaking |
| **社区迁移** | 主流库已全面支持 ESM |

---

## 九、常见面试题

### Q1：什么是 AMD？和 CommonJS 有什么区别？

**答：** AMD（异步模块定义）是专为浏览器端设计的模块化规范，通过 `define()` 定义模块、`require()` 异步加载模块。和 CommonJS 的核心区别：① AMD **异步加载**（回调），CommonJS **同步加载**（直接返回）；② AMD **依赖前置**（声明时列出所有依赖），CommonJS **就近加载**（用到时 require）；③ AMD 用于浏览器，CommonJS 用于 Node.js。

### Q2：为什么 CommonJS 不适合浏览器？

**答：** CommonJS 的 `require()` 是**同步**的。浏览器中加载模块需要通过网络请求远程文件，同步等待会导致页面完全冻结（白屏），用户体验极差。AMD 通过异步加载 + 回调机制解决了这个问题。

### Q3：AMD 的依赖前置和 CMD 的依赖就近有什么区别？

**答：** AMD 在 `define(['a','b'], fn)` 中**提前声明所有依赖**，加载器在执行 factory 前就把所有依赖并行下载好。CMD 在 `define(function(require){ var a = require('a') })` 中**用到时才 require**，加载器扫描到 `require()` 后才去加载。AMD 首次加载稍慢（全量加载），但运行时无延迟；CMD 按需加载节省带宽，但运行时可能有等待。

### Q4：AMD 现在还在用吗？

**答：** 基本不再使用。现代开发使用 **ES Module** 作为标准模块方案，配合 Webpack/Vite 等打包工具处理兼容性。AMD 是在 ES Module 出现之前的过渡方案，已被 ESM 取代。但了解 AMD 有助于理解 JavaScript 模块化的演进历史。

### Q5：RequireJS 的 shim 是做什么的？

**答：** `shim` 用于适配**不支持 AMD 的第三方库**（如 jQuery 插件）。通过 `deps` 声明该库依赖的其他模块，通过 `exports` 声明该库暴露的全局变量名。这样 RequireJS 就能正确管理这些非 AMD 库的加载顺序和依赖关系。

---

## 十、注意事项

1. **历史了解即可**：现代项目不需要使用 AMD，理解其原理和设计思想即可
2. **`define` 的 factory 只执行一次**：模块首次加载后结果被缓存，后续 `require` 返回缓存
3. **路径配置很重要**：RequireJS 的 `baseUrl` 和 `paths` 配置直接影响模块查找
4. **循环依赖**：AMD 可以通过 `require('./a')` 在 factory 内部延迟加载来解决循环依赖
5. **和打包工具的关系**：Webpack 等工具可以打包 AMD 模块，但不再需要 RequireJS 作为运行时加载器

---

## 官方文档

- [AMD 规范 - GitHub Wiki](https://github.com/amdjs/amdjs-api/wiki/AMD)
- [RequireJS 官方文档](https://requirejs.org/docs/api.html)
- [RequireJS 中文文档](https://www.requirejs-cn.com/)
- [Why AMD? - RequireJS](https://requirejs.org/docs/whyamd.html)
