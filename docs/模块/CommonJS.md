# CommonJS 模块规范

> CommonJS 是 JavaScript 的**服务端模块化规范**，由 Node.js 实现，用于组织代码为可复用的模块。它是 Node.js 生态的基石。

> 官方文档：[Node.js - Modules: CommonJS modules](https://nodejs.org/api/modules.html)

---

## 一、核心概念

### 1.1 什么是 CommonJS

CommonJS 是一个 JavaScript 模块化规范，定义了**如何声明、导出和引入模块**。它最初是为服务端（Node.js）设计的，每个文件就是一个模块，拥有独立的作用域。

> 通俗类比：CommonJS 就像快递系统——`module.exports` 是寄件（打包发出），`require()` 是收件（拆包使用）。每个包裹（模块）都是独立的，互不干扰。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **同步加载** | `require()` 同步读取文件，适合服务端（文件在本地磁盘，读取速度快） |
| **运行时加载** | 代码执行到 `require()` 时才加载模块 |
| **值的拷贝** | 导出的是值的副本，修改不影响原模块 |
| **缓存机制** | 模块首次加载后被缓存，后续 `require()` 返回缓存实例 |
| **每个文件是一个模块** | 模块拥有独立作用域，不会污染全局 |

### 1.3 CommonJS 与 ES Module 的定位

| 环境 | CommonJS | ES Module |
|------|----------|-----------|
| Node.js | ✅ 默认（`.js`） | ✅ 支持（`.mjs` 或 `"type": "module"`） |
| 浏览器 | ❌ 原生不支持 | ✅ 原生支持（`<script type="module">`） |
| 打包工具（Vite/Webpack） | ✅ 支持 | ✅ 支持 |

---

## 二、基本语法

### 2.1 导出（module.exports）

`module.exports` 是模块导出的核心对象。`require()` 返回的就是 `module.exports` 的值。

#### 导出单个值

```javascript
// ========== math.js ==========
module.exports = function add(a, b) {
  return a + b
}
```

```javascript
// 使用
const add = require('./math')
console.log(add(1, 2)) // 3
```

#### 导出对象

```javascript
// ========== math.js ==========
module.exports = {
  add(a, b) { return a + b },
  subtract(a, b) { return a - b },
  multiply(a, b) { return a * b }
}
```

```javascript
// 使用
const math = require('./math')
console.log(math.add(1, 2))      // 3
console.log(math.subtract(3, 1)) // 2
```

#### 导出类

```javascript
// ========== Person.js ==========
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    return `Hello, I'm ${this.name}, ${this.age} years old.`
  }
}

module.exports = Person
```

```javascript
// 使用
const Person = require('./Person')
const p = new Person('Tom', 25)
console.log(p.greet()) // Hello, I'm Tom, 25 years old.
```

### 2.2 使用 exports 快捷导出

`exports` 是 `module.exports` 的**引用快捷方式**，用于在导出对象上挂载属性。

```javascript
// ========== utils.js ==========

// ✅ 正确：通过 exports 挂载属性
exports.formatDate = function (date) {
  return date.toISOString().split('T')[0]
}

exports.generateId = function () {
  return Math.random().toString(36).substr(2, 9)
}

// 等同于：
// module.exports.formatDate = function () { ... }
// module.exports.generateId = function () { ... }
```

#### ⚠️ exports 的陷阱

```javascript
// ❌ 错误：直接给 exports 赋值会断开与 module.exports 的引用
exports = function add(a, b) {
  return a + b
}
// require('./file') 不会得到这个函数！
// 因为 exports 不再指向 module.exports

// ❌ 错误：同理
exports = { add, subtract }

// ✅ 正确：使用 module.exports 替代
module.exports = { add, subtract }

// ✅ 正确：逐个挂载到 exports 上
exports.add = add
exports.subtract = subtract
```

```
初始状态：
exports ──────→ { } ←────── module.exports
                  ↑
            require() 返回这个

exports 赋值后：
exports ──→ { 新对象 }     { } ←────── module.exports
                            ↑
                      require() 仍然返回空对象！
```

### 2.3 导入（require）

#### 基本用法

```javascript
// 导入自定义模块（必须带路径前缀）
const math = require('./math')        // 同目录
const config = require('../config')   // 上级目录
const utils = require('./utils/index') // 可省略 .js 后缀

// 导入 Node.js 内置模块
const fs = require('fs')
const path = require('path')
const http = require('http')

// 导入 node_modules 中的第三方模块
const express = require('express')
const lodash = require('lodash')
```

#### 解构导入

```javascript
// ✅ 解构导入
const { add, subtract } = require('./math')

console.log(add(1, 2))      // 3
console.log(subtract(3, 1)) // 2
```

#### 条件导入

```javascript
// 根据环境条件加载不同模块
let db
if (process.env.NODE_ENV === 'test') {
  db = require('./mock-db')
} else {
  db = require('./real-db')
}
```

### 2.4 module.exports vs exports 对比

| 对比项 | `module.exports` | `exports` |
|--------|-----------------|-----------|
| 本质 | 模块真正的导出对象 | `module.exports` 的引用 |
| 赋值导出 | ✅ `module.exports = func` | ❌ `exports = func` 无效 |
| 挂载属性 | ✅ `module.exports.fn = fn` | ✅ `exports.fn = fn` |
| 适用场景 | 导出单个值、整体替换 | 导出多个方法/属性 |
| 推荐 | ⭐ 推荐统一使用 | ⚠️ 理解即可 |

```javascript
// 推荐风格一：统一用 module.exports
module.exports = {
  add,
  subtract,
  multiply
}

// 推荐风格二：统一用 module.exports.xxx
module.exports.add = add
module.exports.subtract = subtract
```

---

## 三、模块加载机制

### 3.1 require() 的解析流程

```
require('moduleName')
       │
       ▼
  ┌─────────────────┐
  │ 1. 路径解析      │ ← 解析为绝对路径
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │ 2. 缓存检查      │ ← 已缓存？直接返回
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │ 3. 文件定位      │ ← 补全扩展名（.js / .json / .node）
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │ 4. 编译执行      │ ← 包裹到函数中执行
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │ 5. 缓存并返回    │ ← 存入 require.cache
  └─────────────────┘
```

### 3.2 模块查找路径

```javascript
// 当 require('lodash') 时，Node.js 按以下顺序查找：

// 1. 内置模块（fs、path、http 等）
// 如果 lodash 是内置模块，直接返回

// 2. 当前目录的 node_modules
// /project/node_modules/lodash

// 3. 父目录的 node_modules
// /node_modules/lodash

// 4. 一直向上查找到根目录
// /node_modules/lodash

// 查看模块查找路径
console.log(module.paths)
// [
//   '/project/node_modules',
//   '/node_modules'
// ]
```

### 3.3 扩展名补全

```javascript
// require('./math') 会依次尝试：
require('./math.js')      // 1. 先找 .js
require('./math.json')    // 2. 再找 .json
require('./math.node')    // 3. 最后找 .node（C++ 扩展）
require('./math/index')   // 4. 如果是目录，找目录下的 index.js
require('./math/index.json') // 5. index.json
```

### 3.4 目录作为模块

```
utils/
├── index.js      ← require('./utils') 会加载这个
├── string.js
└── number.js
```

```javascript
// ========== utils/index.js ==========
const string = require('./string')
const number = require('./number')

module.exports = {
  ...string,
  ...number
}
```

---

## 四、模块缓存机制

### 4.1 缓存原理

**模块首次加载后被缓存，后续 `require()` 返回同一个实例**（单例模式）。

```javascript
// ========== counter.js ==========
let count = 0

module.exports = {
  increment() { return ++count },
  getCount() { return count }
}
```

```javascript
// ========== main.js ==========
const counterA = require('./counter')
const counterB = require('./counter') // 返回缓存，不是重新加载

counterA.increment() // 1
counterA.increment() // 2
console.log(counterB.getCount()) // 2 ← 共享同一个实例！
console.log(counterA === counterB) // true
```

### 4.2 查看缓存

```javascript
// 查看所有已缓存的模块
console.log(Object.keys(require.cache))

// 查看某个模块的缓存信息
const resolvedPath = require.resolve('./counter')
console.log(require.cache[resolvedPath])
```

### 4.3 清除缓存

```javascript
// 清除指定模块的缓存（强制重新加载）
delete require.cache[require.resolve('./counter')]

// 清除所有缓存
Object.keys(require.cache).forEach((key) => {
  delete require.cache[key]
})
```

**应用场景**：测试中需要"干净的"模块实例，或热更新场景。

### 4.4 循环依赖

当模块 A 引入模块 B，模块 B 又引入模块 A 时，会发生**循环依赖**：

```javascript
// ========== a.js ==========
exports.loaded = false
const b = require('./b')
console.log('a.js: b.loaded =', b.loaded) // true
exports.loaded = true
```

```javascript
// ========== b.js ==========
exports.loaded = false
const a = require('./a')  // 此时 a.js 还没执行完，拿到的是部分导出
console.log('b.js: a.loaded =', a.loaded) // false
exports.loaded = true
```

```javascript
// ========== main.js ==========
const a = require('./a')
// 输出：
// b.js: a.loaded = false  ← a.js 还没执行完
// a.js: b.loaded = true
```

**循环依赖的处理规则**：

1. Node.js 使用**深度优先**的加载策略
2. 遇到循环依赖时，返回**当前已执行部分的导出**
3. 可能拿到**不完整**的模块内容

```
main.js → require('./a')
  a.js → exports.loaded = false
  a.js → require('./b')
    b.js → exports.loaded = false
    b.js → require('./a') ← 循环！返回 a 的部分导出 { loaded: false }
    b.js → console.log(a.loaded) → false
    b.js → exports.loaded = true
  a.js → console.log(b.loaded) → true
  a.js → exports.loaded = true
```

---

## 五、值的拷贝机制

CommonJS 导出的是**值的副本**，不是引用。

### 5.1 基本类型——值的拷贝

```javascript
// ========== counter.js ==========
let count = 0
module.exports = {
  count,
  increment() { count++ }
}
```

```javascript
// ========== main.js ==========
const { count, increment } = require('./counter')

console.log(count) // 0 ← 拿到的是导出时的副本
increment()
console.log(count) // 0 ← 仍然是 0，不会改变
```

### 5.2 对象类型——引用的拷贝

```javascript
// ========== config.js ==========
module.exports = {
  data: { value: 1 }
}
```

```javascript
// ========== main.js ==========
const config = require('./config')

config.data.value = 999
// ⚠️ 修改了引用指向的对象，其他 require 此模块的地方也会受影响
// 这是因为缓存机制 + 引用共享
```

### 5.3 如何实现"动态获取"

```javascript
// ========== counter.js ==========
let count = 0

module.exports = {
  get count() { return count },  // 通过 getter 动态获取
  increment() { count++ }
}
```

```javascript
// ========== main.js ==========
const counter = require('./counter')

console.log(counter.count) // 0
counter.increment()
console.log(counter.count) // 1 ← 通过 getter 可以拿到最新值
```

---

## 六、模块包装函数

### 6.1 模块代码的包装

Node.js 在执行模块代码前，会将其包裹在一个函数中：

```javascript
// 你写的代码：
const pi = 3.14
module.exports = { pi }

// Node.js 实际执行的是：
;(function (exports, require, module, __filename, __dirname) {
  const pi = 3.14
  module.exports = { pi }
})
```

### 6.2 五个模块内置变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `exports` | `object` | `module.exports` 的引用快捷方式 |
| `require` | `function` | 模块导入函数 |
| `module` | `object` | 当前模块对象 |
| `__filename` | `string` | 当前模块文件的**绝对路径** |
| `__dirname` | `string` | 当前模块文件所在**目录的绝对路径** |

```javascript
// ========== /project/src/utils.js ==========
console.log(__filename) // /project/src/utils.js
console.log(__dirname)  // /project/src
console.log(module.id)  // .（模块 ID）
console.log(module.filename) // /project/src/utils.js
console.log(module.parent)   // 引用此模块的父模块
console.log(module.children) // 此模块引用的子模块
```

### 6.3 模块作用域

```javascript
// ========== a.js ==========
const secret = 'I am private' // 模块内部变量，外部无法访问
var localVar = 'also private'

module.exports = { public: 'I am public' }
// require('./a') 只能拿到 { public: 'I am public' }
// secret 和 localVar 对外部完全不可见
```

```javascript
// ❌ 全局污染（避免使用）
global.sharedData = 'dangerous' // 所有模块都能访问

// ✅ 通过模块导出共享
module.exports = { sharedData: 'safe' }
```

---

## 七、实际应用模式

### 7.1 配置模块

```javascript
// ========== config/index.js ==========
const env = process.env.NODE_ENV || 'development'

const configs = {
  development: {
    db: 'mongodb://localhost:27017/dev',
    port: 3000,
    debug: true
  },
  production: {
    db: 'mongodb://prod-server:27017/app',
    port: 8080,
    debug: false
  },
  test: {
    db: 'mongodb://localhost:27017/test',
    port: 4000,
    debug: true
  }
}

module.exports = configs[env]
```

```javascript
const config = require('./config')
console.log(config.port) // 根据环境输出不同值
```

### 7.2 工厂函数导出

```javascript
// ========== database.js ==========
class Database {
  constructor(config) {
    this.config = config
    this.connected = false
  }

  connect() {
    this.connected = true
    console.log(`Connected to ${this.config.host}`)
    return this
  }

  query(sql) {
    if (!this.connected) throw new Error('Not connected')
    return `Result of: ${sql}`
  }
}

// 导出工厂函数，而不是实例
module.exports = function createDatabase(config) {
  return new Database(config)
}
```

```javascript
const createDatabase = require('./database')

const db1 = createDatabase({ host: 'localhost' })
const db2 = createDatabase({ host: 'remote' })
// db1 和 db2 是独立实例
```

### 7.3 单例模式

```javascript
// ========== logger.js ==========
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance
    }
    this.logs = []
    Logger.instance = this
  }

  log(message) {
    this.logs.push({ message, time: new Date() })
    console.log(`[LOG] ${message}`)
  }
}

// CommonJS 缓存天然支持单例
module.exports = new Logger()
```

```javascript
// 不同文件中 require 得到的是同一个实例
const loggerA = require('./logger')
const loggerB = require('./logger')

loggerA.log('Hello')
loggerB.log('World')

console.log(loggerA === loggerB) // true
console.log(loggerA.logs.length) // 2
```

### 7.4 插件/中间件注册模式

```javascript
// ========== app.js ==========
const app = {
  middlewares: [],
  use(middleware) {
    this.middlewares.push(middleware)
    return this // 链式调用
  },
  run(req) {
    let index = 0
    const next = () => {
      if (index < this.middlewares.length) {
        this.middlewares[index++](req, next)
      }
    }
    next()
  }
}

module.exports = app
```

```javascript
// ========== server.js ==========
const app = require('./app')
const authMiddleware = require('./middlewares/auth')
const logMiddleware = require('./middlewares/log')

// 注册中间件
app.use(logMiddleware).use(authMiddleware)

app.run({ url: '/api/data' })
```

### 7.5 按需加载（延迟 require）

```javascript
// ========== heavy-module.js ==========
console.log('heavy-module loaded!') // 只在首次 require 时执行
module.exports = { data: new Array(1000000).fill('heavy') }
```

```javascript
// ========== main.js ==========
let heavyModule = null

function getHeavyData() {
  // 延迟到真正需要时才加载
  if (!heavyModule) {
    heavyModule = require('./heavy-module')
  }
  return heavyModule.data
}

console.log('app started')
// heavy-module 还没被加载

if (needHeavyFeature) {
  const data = getHeavyData() // 此刻才加载
}
```

---

## 八、常用工具函数

### 8.1 require.resolve()

获取模块的**绝对路径**，不加载模块：

```javascript
const resolvedPath = require.resolve('./math')
console.log(resolvedPath) // /project/src/math.js

// 检查模块是否存在
function moduleExists(name) {
  try {
    require.resolve(name)
    return true
  } catch (e) {
    return false
  }
}
```

### 8.2 require.cache

所有已缓存模块的集合：

```javascript
// 清除指定模块缓存（用于测试或热更新）
function clearModuleCache(modulePath) {
  const resolved = require.resolve(modulePath)
  delete require.cache[resolved]
}
```

### 8.3 module.children / module.parent

```javascript
// ========== app.js ==========
const router = require('./router')

console.log(module.children)
// [Module { id: '/project/src/router.js', ... }]

// ========== router.js ==========
console.log(module.parent)
// Module { id: '/project/src/app.js', ... }
```

---

## 九、CommonJS 与 ES Module 对比

| 对比项 | CommonJS | ES Module |
|--------|----------|-----------|
| **语法** | `require()` / `module.exports` | `import` / `export` |
| **加载方式** | 同步 | 异步 |
| **加载时机** | 运行时（动态） | 编译时（静态） |
| **导入类型** | 值的拷贝 | 值的引用（绑定） |
| **是否可条件导入** | ✅ 可以 | ❌ 静态分析，不能条件导入 |
| **Tree-shaking** | ❌ 不支持（动态加载无法静态分析） | ✅ 支持 |
| **this 指向** | `module.exports` | `undefined` |
| **循环依赖** | 返回部分导出（可能不完整） | 引用绑定（ESM 更优） |
| **顶层 await** | ❌ 不支持 | ✅ 支持 |
| **`__dirname` / `__filename`** | ✅ 内置提供 | ❌ 需通过 `import.meta.url` 模拟 |
| **浏览器支持** | ❌ 不原生支持 | ✅ 原生支持 |

### 9.1 值拷贝 vs 值引用

```javascript
// ========== CommonJS（值的拷贝）==========
// counter.js
let count = 0
module.exports = { count, increment() { count++ } }

// main.js
const { count, increment } = require('./counter')
console.log(count) // 0
increment()
console.log(count) // 0 ← 不变，因为 count 是拷贝的原始值
```

```javascript
// ========== ES Module（值的引用/绑定）==========
// counter.mjs
export let count = 0
export function increment() { count++ }

// main.mjs
import { count, increment } from './counter.mjs'
console.log(count) // 0
increment()
console.log(count) // 1 ← 变了，因为 count 是实时绑定
```

### 9.2 动态导入能力

```javascript
// CommonJS：天生支持动态导入
if (condition) {
  const module = require('./module-a')
} else {
  const module = require('./module-b')
}

// ES Module：静态导入不支持条件语句
// ❌ if (condition) { import a from './a' }  // 语法错误

// ES Module：使用 import() 动态导入
if (condition) {
  import('./module-a.js').then(module => { /* ... */ })
}
```

### 9.3 __dirname 在 ESM 中的替代方案

```javascript
// CommonJS
console.log(__dirname)
console.log(__filename)

// ES Module 需要手动模拟
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

---

## 十、Node.js 中混合使用 CommonJS 和 ESM

### 10.1 在 CommonJS 中导入 ESM

```javascript
// ========== es-module.mjs ==========
export const name = 'ES Module'
export default function greet() {
  return 'Hello from ESM'
}
```

```javascript
// ========== commonjs-file.js ==========
// ❌ 不能用 require() 导入 ESM
// const esm = require('./es-module.mjs') // 报错！

// ✅ 使用动态 import()
async function loadESM() {
  const esm = await import('./es-module.mjs')
  console.log(esm.name)        // ES Module
  console.log(esm.default())   // Hello from ESM
}
loadESM()
```

### 10.2 在 ESM 中导入 CommonJS

```javascript
// ========== commonjs-module.js ==========
module.exports = {
  name: 'CommonJS',
  greet() { return 'Hello from CJS' }
}
```

```javascript
// ========== esm-file.mjs ==========
// ✅ 可以直接用 import 导入 CommonJS 模块
import cjsModule from './commonjs-module.js'
console.log(cjsModule.name)  // CommonJS
console.log(cjsModule.greet()) // Hello from CJS
```

---

## 十一、常见面试题

### Q1：CommonJS 和 ES Module 的区别？

**答：** ① CommonJS 是同步加载、运行时加载，ESM 是异步加载、编译时静态分析；② CommonJS 导出值的**拷贝**，ESM 导出值的**引用（实时绑定）**；③ CommonJS 支持**动态条件导入**，ESM 静态导入不支持条件语句；④ ESM 支持 **Tree-shaking**，CommonJS 不支持；⑤ CommonJS 用于 Node.js 服务端，ESM 前后端通用。

### Q2：为什么 CommonJS 不支持 Tree-shaking？

**答：** CommonJS 是**运行时加载**，`require()` 可以出现在任何位置（if 判断、循环、函数内），打包工具在编译时无法确定哪些导出会被使用。ESM 的 `import/export` 是**静态声明**，编译时就能确定依赖关系，打包工具可以安全地移除未使用的导出。

### Q3：`module.exports` 和 `exports` 的区别？

**答：** `exports` 是 `module.exports` 的引用，初始指向同一个空对象。通过 `exports.xxx = xxx` 挂载属性是安全的，但直接 `exports = xxx` 会断开引用，导致导出无效。`module.exports = xxx` 可以替换整个导出对象。**推荐统一使用 `module.exports`**。

### Q4：CommonJS 的缓存机制是怎样的？

**答：** 模块首次 `require()` 后，Node.js 会将 `module.exports` 缓存在 `require.cache` 中。后续对同一模块的 `require()` 直接返回缓存实例，不会重新执行模块代码。这意味着所有 `require()` 同一模块的地方拿到的是**同一个对象**（天然单例）。可通过 `delete require.cache[...]` 清除缓存。

### Q5：CommonJS 的循环依赖怎么处理？

**答：** Node.js 遇到循环依赖时，会返回**当前已执行部分的导出**。例如 A 引入 B，B 又引入 A，此时 B 中的 `require('./A')` 拿到的只是 A 执行到 `require('./B')` 之前的导出内容，可能是不完整的。建议通过重构代码结构避免循环依赖，或延迟到函数调用时再 `require()`。

### Q6：为什么浏览器不原生支持 CommonJS？

**答：** CommonJS 的 `require()` 是**同步**的——在浏览器中同步加载远程文件会导致页面阻塞，用户体验极差。浏览器需要异步加载模块，所以设计了 ES Module 的异步加载机制。Webpack/Vite 等打包工具可以在构建时将 CommonJS 转换为浏览器可执行的代码。

---

## 十二、注意事项

1. **避免循环依赖**：循环依赖会导致模块拿到不完整的导出，应重构代码结构消除循环
2. **`require()` 是同步的**：不要在浏览器端直接使用，需通过打包工具转换
3. **模块级代码只执行一次**：模块顶层的副作用代码（如 `console.log`）只会在首次加载时执行
4. **`require` 不能解构出动态值**：基本类型的导出是拷贝，获取最新值需通过 getter 或方法调用
5. **`.json` 文件可以直接 require**：Node.js 会自动解析 JSON 文件为 JavaScript 对象

```javascript
// 直接 require JSON 文件
const packageJson = require('./package.json')
console.log(packageJson.version)
```

---

## 官方文档

- [Node.js - Modules: CommonJS modules](https://nodejs.org/api/modules.html)
- [Node.js - Modules: CommonJS vs ESM](https://nodejs.org/api/esm.html#commonjs-vs-esm)
- [MDN - JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
