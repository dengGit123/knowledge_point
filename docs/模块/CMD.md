# CMD 模块规范（Common Module Definition）

> CMD 是由国内前端团队**玉伯（王保平）**发起的浏览器端模块化规范，由 [SeaJS](https://seajs.github.io/seajs/docs/) 实现。核心理念是**依赖就近、按需加载**。

> 官方文档：[CMD 模块定义规范](https://github.com/seajs/seajs/issues/242)

---

## 一、核心概念

### 1.1 什么是 CMD

CMD（Common Module Definition，通用模块定义）是由阿里巴巴前端工程师玉伯在 SeaJS 中提出的模块规范。它与 AMD 同为浏览器端异步模块方案，但设计哲学不同——CMD 主张**依赖就近、用时加载**，而非 AMD 的依赖前置。

> 通俗类比：如果 AMD 是"出发前把所有行李都装上车"（依赖前置），那 CMD 就是"走到哪用到哪，需要时再拿"（依赖就近）。

### 1.2 CMD 诞生的背景

```
2011 年前后的模块化格局：

CommonJS（2009）→ 服务端模块化，同步加载
                    ❌ 浏览器不能直接用

AMD（2009）    → 浏览器异步模块化，依赖前置
                    ✅ 解决了浏览器模块化
                    ⚠️ 但 require(['a','b','c'], fn) 写法冗长
                    ⚠️ 必须提前声明所有依赖（即使某些只在特定条件下才用到）

CMD（2011）    → 浏览器异步模块化，依赖就近
                    ✅ 写法接近 CommonJS，学习成本低
                    ✅ 用到时才加载，更节省资源
                    ✅ 由 SeaJS 实现，在国内广泛使用
```

### 1.3 核心特性

| 特性 | 说明 |
|------|------|
| **依赖就近** | 在代码中需要用到某个模块时才 `require()`，不必提前声明全部依赖 |
| **异步加载** | 模块仍然是异步加载，不阻塞浏览器 |
| **延迟执行** | 依赖模块加载后不会立即执行，而是在首次 `require()` 时才执行 factory |
| **写法简洁** | 语法接近 CommonJS，降低学习成本 |
| **按需加载** | 条件分支中的模块只在条件成立时才加载 |

### 1.4 CMD 与 AMD 的设计哲学对比

```
AMD 的理念：
"提前声明所有依赖，加载器一次性并行下载，运行时零等待"
define(['a', 'b', 'c', 'd'], function(a, b, c, d) {
  // 即使 d 只在某个条件下用到，也在一开始就加载了
})

CMD 的理念：
"用到才加载，不浪费网络请求，更接近 CommonJS 的书写直觉"
define(function(require, exports, module) {
  var a = require('a')  // 用到 a 才加载 a

  if (condition) {
    var b = require('b') // 只在需要时才加载 b
  }
})
```

---

## 二、基本语法

CMD 的核心 API 由 SeaJS 提供，包含 `define()`、`require()`、`exports`、`module` 四个部分。

### 2.1 define() — 定义模块

#### 语法签名

```javascript
define(id?, deps?, factory)
```

| 参数 | 类型 | 是否必须 | 说明 |
|------|------|---------|------|
| `id` | `string` | 可选 | 模块 ID（通常省略，由文件路径决定） |
| `deps` | `string[]` | 可选 | 依赖数组（CMD 中通常省略） |
| `factory` | `function` / `object` / `string` | 必须 | 工厂函数或直接导出的值 |

#### 定义简单模块（无依赖）

```javascript
// ========== math.js ==========
define(function (require, exports, module) {
  // 导出方式 1：挂载到 exports
  exports.add = function (a, b) { return a + b }
  exports.subtract = function (a, b) { return a - b }
})

// 或者直接导出对象
define({
  add(a, b) { return a + b },
  subtract(a, b) { return a - b }
})
```

#### 定义有依赖的模块

```javascript
// ========== calculator.js ==========
define(function (require, exports, module) {
  // 用到时才 require，不需要在 define 的时候声明
  var math = require('./math')
  var logger = require('./logger')

  exports.calculate = function (expression) {
    var parts = expression.split(' ')
    var a = Number(parts[0])
    var op = parts[1]
    var b = Number(parts[2])

    var result
    switch (op) {
      case '+': result = math.add(a, b); break
      case '-': result = math.subtract(a, b); break
      default: throw new Error('Unknown operator: ' + op)
    }

    logger.log(expression + ' = ' + result)
    return result
  }
})
```

#### 条件按需加载

```javascript
// ========== app.js ==========
define(function (require) {
  var config = require('./config')

  // 只在开发环境加载 mock 模块
  if (config.debug) {
    var mock = require('./mock')
    mock.setup()
  }

  // 只在移动端加载移动端适配模块
  if (/Mobile/.test(navigator.userAgent)) {
    var mobileAdapter = require('./mobile-adapter')
    mobileAdapter.init()
  }

  // 正常逻辑
  var api = require('./api')
  api.get('/data').then(function (data) {
    console.log(data)
  })
})
```

#### 三种导出方式

```javascript
define(function (require, exports, module) {
  var internalValue = 'I am private'

  // ===== 方式 1：通过 exports 挂载属性 =====
  exports.methodA = function () { return 'A' }
  exports.methodB = function () { return 'B' }

  // ===== 方式 2：通过 module.exports 整体替换 =====
  module.exports = {
    methodA: function () { return 'A' },
    methodB: function () { return 'B' }
  }

  // ===== 方式 3：通过 return 返回值（CMD 独有）=====
  return {
    methodA: function () { return 'A' },
    methodB: function () { return 'B' }
  }
})
```

### 2.2 require() — 同步加载模块

```javascript
// require 是同步风格的 API
// 但在 CMD 中，模块仍然是异步加载的
// require 的"同步"只是写法上的便利
define(function (require) {
  var math = require('./math')
  var result = math.add(1, 2) // 直接使用，无需回调
  console.log(result) // 3
})
```

### 2.3 require.async() — 异步加载模块

```javascript
// require.async 用于需要异步加载的场景
define(function (require) {
  // 同步加载（推荐，大部分场景用这个）
  var math = require('./math')

  // 异步加载（用于不需要立即使用的模块，或条件加载）
  require.async('./chart', function (chart) {
    chart.render(document.getElementById('chart-container'))
  })

  // 异步加载多个模块
  require.async(['./chart', './report'], function (chart, report) {
    chart.render()
    report.generate()
  })
})
```

### 2.4 require.resolve() — 获取模块路径

```javascript
define(function (require) {
  // 返回模块的绝对 URL，不会加载模块
  var path = require.resolve('./math')
  console.log(path) // http://example.com/src/math.js
})
```

### 2.5 exports 和 module

```javascript
define(function (require, exports, module) {
  // exports — 导出对象的引用
  exports.foo = 'bar'

  // module.exports — 模块真正的导出值
  // 可以整体替换导出对象
  module.exports = {
    name: 'MyModule',
    version: '1.0.0'
  }

  // module.uri — 模块的绝对路径
  console.log(module.uri) // http://example.com/src/app.js

  // module.dependencies — 模块的依赖列表
  console.log(module.dependencies) // ['./math', './logger']
})
```

---

## 三、SeaJS 加载器

### 3.1 什么是 SeaJS

SeaJS 是 CMD 规范的实现，由玉伯开发，提供了：

- 模块异步加载
- 依赖就近解析
- 路径别名配置
- 插件机制
- 与 CommonJS 风格一致的 API

### 3.2 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CMD / SeaJS 示例</title>
</head>
<body>
  <div id="app"></div>

  <!-- 引入 SeaJS -->
  <script src="vendor/sea.js"></script>

  <!-- 配置并启动 -->
  <script>
    // 配置 SeaJS
    seajs.config({
      base: './src/',
      alias: {
        'jquery': 'vendor/jquery.min',
        'lodash': 'vendor/lodash.min'
      }
    })

    // 加载入口模块
    seajs.use('./src/main')
  </script>
</body>
</html>
```

### 3.3 seajs.config() — 配置

```javascript
seajs.config({
  // 基础路径：模块 ID 解析的基准目录
  base: './src/',

  // 别名：给常用模块起短名
  alias: {
    'jquery': 'vendor/jquery.min',
    'lodash': 'vendor/lodash.min',
    'utils': 'common/utils'
  },

  // 路径映射：将某个前缀映射到指定路径
  paths: {
    'lib': 'https://cdn.example.com/lib',
    'app': './src/app'
  },

  // 预加载：在所有模块加载前先加载这些模块
  preload: [
    'jquery'  // 确保 jQuery 在所有模块之前加载
  ],

  // 调试模式
  debug: true,

  // 文件编码
  charset: 'utf-8'
})
```

#### 别名解析规则

```javascript
seajs.config({
  base: './src/',
  alias: {
    'jquery': 'vendor/jquery.min',  // 相对于 base
    'lodash': 'vendor/lodash.min'
  }
})

// 使用别名
define(function (require) {
  var $ = require('jquery')      // 解析为 ./src/vendor/jquery.min.js
  var _ = require('lodash')      // 解析为 ./src/vendor/lodash.min.js
  var utils = require('./utils') // 相对路径，解析为 ./src/utils.js
})
```

### 3.4 seajs.use() — 加载入口模块

```javascript
// 加载单个模块
seajs.use('./main', function (main) {
  main.init()
})

// 加载多个模块
seajs.use(['./app', './router'], function (app, router) {
  router.start()
  app.run()
})

// 最简写法（不需要回调）
seajs.use('./main')
```

### 3.5 项目结构

```
project/
├── index.html
├── vendor/
│   ├── sea.js               ← SeaJS 库
│   ├── jquery.min.js
│   └── lodash.min.js
├── src/
│   ├── main.js              ← 入口模块
│   ├── config.js
│   ├── modules/
│   │   ├── math.js
│   │   ├── logger.js
│   │   └── calculator.js
│   ├── api/
│   │   └── request.js
│   └── utils/
│       ├── string.js
│       └── dom.js
```

### 3.6 SeaJS 插件

```javascript
// ========== seajs-text：加载文本文件 ==========
define(function (require) {
  var template = require('./template.html')
  // template 是 HTML 文件的字符串内容
  document.getElementById('app').innerHTML = template
})

// ========== seajs-css：加载 CSS ==========
define(function (require) {
  require('./style.css')
  // CSS 已自动注入到页面
})

// ========== seajs-debug：调试工具 ==========
// 开启后会显示模块加载日志和耗时
seajs.config({ debug: true })
```

---

## 四、模块加载流程

### 4.1 CMD 加载时序

```
页面加载 sea.js
       │
       ▼
执行 seajs.config() 配置
       │
       ▼
执行 seajs.use('./main')
       │
       ▼
异步下载 main.js
       │
       ▼
执行 main.js 的 define()
       │
       ▼
扫描 factory.toString() 中的 require() 调用 ← 提取依赖
       │
       ▼
异步下载所有依赖模块（并行下载）
       │
       ▼
依赖模块的 define() 执行时继续递归扫描
       │
       ▼
所有模块下载完毕后，按依赖顺序执行 factory
       │
       ▼
执行 seajs.use() 的回调
```

### 4.2 CMD 的依赖解析细节

```javascript
// SeaJS 通过以下方式解析依赖：
// 1. 将 factory 函数 toString()
// 2. 正则匹配所有 require('xxx') 调用
// 3. 提取模块 ID 列表
// 4. 异步下载所有依赖（和 AMD 一样是并行下载）

define(function (require) {
  // SeaJS 扫描到这些 require 调用
  var a = require('a') // ← 识别为依赖
  var b = require('b') // ← 识别为依赖

  // 但注意：SeaJS 识别的是 require 的字符串字面量
  // ❌ 动态拼接的路径无法识别
  var name = 'c'
  var c = require(name) // ← 无法识别！

  // ❌ 条件中的 require 会被识别但可能不会执行
  if (false) {
    var d = require('d') // ← 仍然会被下载（被识别为依赖）
  }
})
```

### 4.3 AMD vs CMD 加载时序对比

```
AMD（依赖前置，提前执行）：

时间线 →
main.js 下载 ──────► 扫描依赖 ──► 下载 a,b,c ──► 执行 a ──► 执行 b ──► 执行 c ──► 执行 main
                                                                    ↑ 所有 factory 立即执行

CMD（依赖就近，延迟执行）：

时间线 →
main.js 下载 ──────► 扫描依赖 ──► 下载 a,b,c ──► 执行 main（遇到 require('a') 时才执行 a 的 factory）
                                                                   ↑ 按需执行 factory
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
  <title>CMD / SeaJS 示例</title>
</head>
<body>
  <div id="app"></div>
  <script src="vendor/sea.js"></script>
  <script>
    seajs.config({
      base: './src/',
      alias: {
        'jquery': '../vendor/jquery.min'
      }
    })
    seajs.use('main')
  </script>
</body>
</html>
```

```javascript
// ========== src/main.js ==========
define(function (require) {
  var app = require('./app')
  app.start()
})
```

```javascript
// ========== src/logger.js ==========
define(function (require, exports) {
  var level = 'info'

  exports.setLevel = function (newLevel) {
    level = newLevel
  }

  exports.info = function (msg) {
    if (level === 'info' || level === 'debug') {
      console.log('[INFO] ' + new Date().toISOString() + ' - ' + msg)
    }
  }

  exports.error = function (msg) {
    console.error('[ERROR] ' + msg)
  }
})
```

```javascript
// ========== src/api.js ==========
define(function (require, exports) {
  var $ = require('jquery')
  var logger = require('./logger')

  exports.get = function (url) {
    logger.info('GET ' + url)
    return $.ajax({ url: url, method: 'GET' })
  }

  exports.post = function (url, data) {
    logger.info('POST ' + url)
    return $.ajax({ url: url, method: 'POST', data: data })
  }
})
```

```javascript
// ========== src/app.js ==========
define(function (require, exports) {
  var api = require('./api')
  var logger = require('./logger')

  exports.start = function () {
    logger.info('Application starting...')

    api.get('/api/users').then(function (users) {
      logger.info('Loaded ' + users.length + ' users')
      renderUserList(users)
    }).catch(function (err) {
      logger.error('Failed: ' + err.message)
    })
  }

  function renderUserList(users) {
    var html = users.map(function (u) {
      return '<li>' + u.name + '</li>'
    }).join('')
    document.getElementById('app').innerHTML = '<ul>' + html + '</ul>'
  }
})
```

### 5.2 按需加载示例

```javascript
// ========== router.js ==========
define(function (require) {
  var currentRoute = null

  return {
    navigate(route) {
      // 根据路由按需加载页面模块
      switch (route) {
        case 'home':
          currentRoute = require('./pages/home')
          break
        case 'about':
          currentRoute = require('./pages/about')
          break
        case 'dashboard':
          // dashboard 体积大，用异步加载
          require.async('./pages/dashboard', function (dashboard) {
            currentRoute = dashboard
            dashboard.render()
          })
          return // 异步加载，提前返回
        default:
          currentRoute = require('./pages/404')
      }

      if (currentRoute && currentRoute.render) {
        currentRoute.render()
      }
    }
  }
})
```

### 5.3 继承/复用模式

```javascript
// ========== base-component.js ==========
define(function (require, exports, module) {
  function Component(options) {
    this.el = options.el
    this.data = options.data || {}
  }

  Component.prototype.render = function () {
    console.log('Rendering into ' + this.el)
  }

  Component.prototype.destroy = function () {
    this.el = null
    this.data = null
  }

  module.exports = Component
})
```

```javascript
// ========== user-list.js ==========
define(function (require, exports, module) {
  var Component = require('./base-component')
  var api = require('./api')

  function UserList(options) {
    // 调用父类构造函数
    Component.call(this, options)
    this.users = []
  }

  // 继承原型
  UserList.prototype = Object.create(Component.prototype)
  UserList.prototype.constructor = UserList

  UserList.prototype.load = function () {
    var self = this
    return api.get('/users').then(function (users) {
      self.users = users
      return users
    })
  }

  UserList.prototype.render = function () {
    Component.prototype.render.call(this)
    var html = this.users.map(function (u) {
      return '<li>' + u.name + '</li>'
    }).join('')
    document.querySelector(this.el).innerHTML = '<ul>' + html + '</ul>'
  }

  module.exports = UserList
})
```

---

## 六、CMD 与其他模块规范对比

### 6.1 CMD vs AMD（最常对比）

| 对比项 | CMD（SeaJS） | AMD（RequireJS） |
|--------|-------------|-----------------|
| **依赖声明** | 依赖就近（代码中 `require()`） | 依赖前置（`define(['deps'], fn)`） |
| **执行时机** | 依赖模块**延迟执行**（首次 require 时） | 依赖模块**提前执行**（下载后立即执行） |
| **语法风格** | 接近 CommonJS | 独特的数组+回调风格 |
| **写法** | `define(function(require){...})` | `define(['a','b'], function(a,b){...})` |
| **按需加载** | ✅ `require.async()` | ⚠️ 需要在 define 中提前声明 |
| **主要实现** | SeaJS | RequireJS |
| **作者** | 玉伯（阿里） | James Burke |
| **流行区域** | 国内为主 | 国际社区 |
| **现状** | 🔻 已停止维护 | 🔻 已过时 |

### 6.2 代码写法直观对比

```javascript
// ========== AMD（RequireJS）==========
define(['./math', './logger'], function (math, logger) {
  // 所有依赖必须在第一个参数中提前声明
  // 即使 logger 只在特定条件下使用

  var result = math.add(1, 2)

  if (result > 10) {
    logger.log(result) // logger 可能在所有场景都加载了
  }

  return result
})
```

```javascript
// ========== CMD（SeaJS）==========
define(function (require, exports, module) {
  // 依赖就近，用到时再 require
  var math = require('./math')
  var result = math.add(1, 2)

  if (result > 10) {
    var logger = require('./logger') // 只在需要时才加载
    logger.log(result)
  }

  module.exports = result
})
```

```javascript
// ========== CommonJS（Node.js）==========
// 写法与 CMD 几乎一致，但 require 是真正同步的
var math = require('./math')
var result = math.add(1, 2)

if (result > 10) {
  var logger = require('./logger')
  logger.log(result)
}

module.exports = result
```

```javascript
// ========== ES Module ==========
// 静态声明，编译时确定依赖
import math from './math'
import logger from './logger'

const result = math.add(1, 2)
if (result > 10) {
  logger.log(result)
}

export default result
```

### 6.3 四大规范完整对比

| 对比项 | CMD | AMD | CommonJS | ES Module |
|--------|-----|-----|----------|-----------|
| **设计目标** | 浏览器端 | 浏览器端 | 服务端 | 通用标准 |
| **加载方式** | 异步 | 异步 | 同步 | 异步 |
| **依赖声明** | 就近 | 前置 | 就近 | 静态声明 |
| **执行时机** | 延迟执行 | 提前执行 | 同步执行 | 编译时链接 |
| **主要实现** | SeaJS | RequireJS | Node.js | 原生 |
| **Tree-shaking** | ❌ | ❌ | ❌ | ✅ |
| **动态 require** | ✅ | ✅ | ✅ | ❌（需 `import()`） |
| **值导入** | 拷贝 | 拷贝 | 拷贝 | 引用绑定 |
| **学习成本** | 低（类 CJS） | 中（独特语法） | 低 | 低 |
| **现状** | 🔻 已过时 | 🔻 已过时 | ✅ Node.js 在用 | ✅ **现代标准** |

---

## 七、SeaJS 适配非 CMD 模块

和 RequireJS 的 shim 类似，SeaJS 也需要处理不支持 CMD 的第三方库：

### 7.1 通过别名 + 全局变量

```javascript
// jQuery 暴露了全局变量 jQuery 和 $
// SeaJS 中可以这样使用：
seajs.config({
  alias: {
    'jquery': 'vendor/jquery.min'
  }
})

// 使用时需要手动包装
define(function (require) {
  // 先加载 jQuery（会执行并挂载到 window）
  require('jquery')

  // 然后通过全局变量使用
  var $ = window.jQuery
  $('#app').text('Hello')
})
```

### 7.2 手动包装为 CMD 模块

```javascript
// ========== vendor/jquery.cmd.js ==========
// 将 jQuery 包装为 CMD 模块
define(function (require, exports, module) {
  // 先清除可能存在的全局 jQuery，避免冲突
  var _jQuery = window.jQuery
  var _$ = window.$

  // 加载原始 jQuery
  require('./jquery.min')

  // 获取 jQuery
  var jQuery = window.jQuery

  // 恢复之前的全局变量
  window.jQuery = _jQuery
  window.$ = _$

  // 通过 module.exports 导出
  module.exports = jQuery
})
```

### 7.3 使用 noConflict 全局包装

```javascript
// 更简洁的包装方式（jQuery 自带 noConflict）
define(function (require, exports, module) {
  var _jQuery = window.jQuery
  require('./jquery.min')
  var jQuery = window.jQuery.noConflict(true)
  window.jQuery = _jQuery
  module.exports = jQuery
})
```

---

## 八、CMD 的历史意义与现状

### 8.1 历史贡献

```
CMD / SeaJS 的贡献：

1. 降低了浏览器模块化的学习成本
   → 写法接近 CommonJS，Node.js 开发者可以无缝切换

2. 推广了"依赖就近"的理念
   → 影响了后续工具的设计（如 Webpack 的 Code Splitting）

3. 在国内前端社区影响深远
   → 阿里内部大量项目曾使用 SeaJS
   → 培养了一代前端的模块化意识

4. 推动了 JavaScript 模块化的讨论
   → AMD vs CMD 的争论促进了 ES Module 的设计
```

### 8.2 JavaScript 模块化演进时间线

```
2009 ─── CommonJS 诞生
  │        服务端模块化标准
  │
  ├── 2009 ─── AMD 规范提出
  │           RequireJS 实现
  │           浏览器端异步模块化（依赖前置）
  │
  ├── 2011 ─── CMD 规范提出
  │           SeaJS 实现
  │           浏览器端异步模块化（依赖就近）
  │
  ├── 2012-2014 ─── AMD vs CMD 社区争论
  │               两种方案的优劣讨论
  │
  ├── 2015 ─── ES6 发布 ES Module
  │           JavaScript 官方模块标准
  │
  ├── 2015+ ─── Webpack / Rollup / Vite 兴起
  │            打包工具解决一切模块问题
  │            AMD 和 CMD 都不再是必需的
  │
  ├── 2015 ─── SeaJS 停止维护
  │          玉伯转投 React/ESM 生态
  │
  └── 现在 ─── ES Module 一统天下
              AMD、CMD 作为历史方案被淘汰
```

### 8.3 为什么 CMD 被淘汰

| 原因 | 说明 |
|------|------|
| **ES Module 标准化** | JavaScript 有了官方模块系统，浏览器和 Node.js 均原生支持 |
| **打包工具普及** | Webpack/Vite 可处理任何模块格式，无需浏览器端模块加载器 |
| **SeaJS 停止维护** | 自 2015 年后不再更新，社区逐渐消失 |
| **性能不如 ESM** | 无法静态分析、不能 Tree-shaking、运行时开销大 |
| **国际社区接受度低** | CMD/SeaJS 主要在国内流行，国际主流是 AMD/RequireJS |

---

## 九、常见面试题

### Q1：CMD 和 AMD 的区别？

**答：** 两者都是浏览器端异步模块规范。核心区别：① **依赖声明**——CMD 依赖就近（用到时 `require()`），AMD 依赖前置（`define(['deps'], fn)` 提前声明）；② **执行时机**——CMD 延迟执行（首次 require 时才执行 factory），AMD 提前执行（下载后立即执行）；③ **写法**——CMD 接近 CommonJS 风格，AMD 有独特的数组+回调语法。实现分别是 SeaJS 和 RequireJS。

### Q2：CMD 的 `require()` 和 CommonJS 的 `require()` 有什么区别？

**答：** 写法几乎一致，但**本质不同**。CommonJS 的 `require()` 是真正的**同步**操作（从磁盘读取文件），CMD 的 `require()` 看起来同步，实际底层是**异步**的——SeaJS 通过 `factory.toString()` 提前扫描所有 `require()` 调用，提取依赖列表，然后异步下载，下载完成后按需执行 factory。所以 CMD 只是"看起来同步"，实际还是异步加载。

### Q3：`require.async` 和 `require` 的区别？

**答：** `require` 用于加载**确定性依赖**（模块一定需要用到的），SeaJS 会通过静态扫描提前下载。`require.async` 用于**按需加载**场景（模块可能用不到、或需要延迟加载），接受回调函数，在模块加载完成后执行。`require.async` 不会被静态扫描识别为依赖。

### Q4：为什么 CMD 最终输给了 ES Module？

**答：** ① ES Module 是**JavaScript 语言标准**，浏览器和 Node.js 原生支持，不需要额外库；② ESM 支持**静态分析**和 Tree-shaking，打包体积更小；③ ESM 的 `import/export` 语法更简洁直观；④ 打包工具（Webpack/Vite）让开发者无需关心模块规范的差异。CMD 是历史过渡方案，在 ESM 成熟后自然退出。

### Q5：SeaJS 如何识别模块依赖？

**答：** SeaJS 将 factory 函数通过 `toString()` 转为字符串，然后用正则表达式匹配所有 `require('moduleId')` 调用，提取模块 ID 列表作为依赖。这意味着只有**字面量形式的 require** 才能被识别，动态拼接路径（如 `require(varName)`）无法被扫描到。

---

## 十、注意事项

1. **了解历史即可**：现代项目直接使用 ES Module，不需要 CMD/SeaJS
2. **require 必须使用字面量**：`require('./math')` ✅，`require('./' + name)` ❌ 无法识别
3. **factory 不要写成箭头函数**：SeaJS 需要扫描 `factory.toString()`，箭头函数在某些压缩工具下可能导致问题
4. **模块 ID 不要省略扩展名**：`require('./math')` 而不是 `require('./math.js')`，SeaJS 会自动补全
5. **CMD 的"同步 require"只是语法糖**：底层仍然异步加载，不要在 factory 外部使用 require

---

## 官方文档

- [CMD 模块定义规范 - GitHub](https://github.com/seajs/seajs/issues/242)
- [SeaJS 官方文档](https://seajs.github.io/seajs/docs/)
- [SeaJS - 快速入门](https://seajs.github.io/seajs/docs/quick-start.html)
- [与 RequireJS 的异同 - 玉伯](https://github.com/seajs/seajs/issues/277)
