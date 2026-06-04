# ES Module 模块规范

> ES Module（ESM）是 JavaScript 的**官方模块标准**，由 ECMAScript 2015（ES6）引入，前后端通用。它是现代 JavaScript 模块化的终极方案。

> 官方文档：[MDN - JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

> 规范文档：[ECMAScript Language - Modules](https://tc39.es/ecma262/#sec-modules)

---

## 一、核心概念

### 1.1 什么是 ES Module

ES Module 是 ECMAScript 标准定义的模块系统，通过 `import` 和 `export` 语法组织代码。与 CommonJS、AMD、CMD 等社区规范不同，**ESM 是语言层面的标准**，浏览器和 Node.js 均原生支持。

> 通俗类比：CommonJS/AMD/CMD 是各家自建的"地方铁路"，ES Module 是"国家高铁标准"——统一、高效、所有平台通用。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **静态分析** | `import/export` 在编译时解析，不是运行时 |
| **值的引用（绑定）** | 导入的是原变量的实时绑定，而非值的拷贝 |
| **异步加载** | 浏览器中模块异步加载，不阻塞页面 |
| **Tree-shaking** | 静态分析使打包工具可移除未使用的导出 |
| **严格模式** | ESM 自动启用严格模式（`this === undefined`） |
| **前后端通用** | 浏览器 `<script type="module">` 和 Node.js 均原生支持 |

### 1.3 ESM 的设计目标

```
CommonJS 的不足 → ESM 的改进

同步加载        → 支持异步加载
运行时解析      → 编译时静态分析
值的拷贝        → 值的引用绑定
无法静态优化     → 支持 Tree-shaking
仅服务端        → 前后端通用
无异步导入      → import() 动态导入
```

---

## 二、导出（export）

### 2.1 命名导出（Named Export）

一个模块可以有**多个命名导出**。

#### 声明时直接导出

```javascript
// ========== math.js ==========
// 变量声明时直接导出
export const PI = 3.14159

// 函数声明时直接导出
export function add(a, b) {
  return a + b
}

// 类声明时直接导出
export class Calculator {
  multiply(a, b) { return a * b }
}

// 先声明再导出也可以
function subtract(a, b) {
  return a - b
}
function divide(a, b) {
  return a / b
}

export { subtract, divide }
```

#### 导出时重命名

```javascript
// ========== math.js ==========
function add(a, b) { return a + b }
function subtract(a, b) { return a - b }

// 重命名导出
export {
  add as sum,          // 外部用 sum 导入
  subtract as minus,   // 外部用 minus 导入
  add as default       // 同时作为默认导出
}
```

#### 导出列表

```javascript
// ========== utils.js ==========
// 统一在底部列出所有导出（推荐写法，清晰明了）
function formatDate(date) { /* ... */ }
function generateId() { /* ... */ }
function debounce(fn, delay) { /* ... */ }
function throttle(fn, delay) { /* ... */ }

export {
  formatDate,
  generateId,
  debounce,
  throttle
}
```

### 2.2 默认导出（Default Export）

一个模块**只能有一个默认导出**。

```javascript
// ========== logger.js ==========

// 方式 1：直接导出函数
export default function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

// 方式 2：直接导出类
export default class Logger {
  log(msg) { console.log(msg) }
  error(msg) { console.error(msg) }
}

// 方式 3：先定义后导出
class Database {
  connect() { /* ... */ }
  query(sql) { /* ... */ }
}
export default Database

// 方式 4：导出表达式
export default { host: 'localhost', port: 3000 }

// 方式 5：导出值
export default 42
```

### 2.3 默认导出与命名导出共存

```javascript
// ========== api.js ==========
// 默认导出：主功能
export default class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  get(path) { /* ... */ }
  post(path, data) { /* ... */ }
}

// 命名导出：辅助功能
export const DEFAULT_TIMEOUT = 5000
export function createApiClient(config) {
  return new ApiClient(config.baseURL)
}
```

### 2.4 聚合导出（Re-export）

将其他模块的导出"转发"出去，用于构建**模块入口文件**：

```javascript
// ========== index.js（模块入口）==========
// 从各子模块重新导出
export { add, subtract, multiply } from './math.js'
export { formatDate, generateId } from './utils.js'
export { default as ApiClient } from './api.js'

// 重命名后导出
export { add as sum } from './math.js'

// 将另一个模块的全部导出转发
export * from './constants.js'

// 将另一个模块的默认导出转为命名导出
export { default as Logger } from './logger.js'

// 将命名导出转为默认导出
export { add as default } from './math.js'
```

```javascript
// 使用方只需引入入口文件
import { add, formatDate, ApiClient } from './modules/index.js'
```

### 2.5 空导入（仅执行副作用）

```javascript
// 仅执行模块代码，不导入任何值
import './polyfill.js'
import './global-setup.js'
```

---

## 三、导入（import）

### 3.1 命名导入

```javascript
// 导入指定的命名导出
import { add, subtract } from './math.js'

console.log(add(1, 2))       // 3
console.log(subtract(3, 1))  // 2
```

### 3.2 导入时重命名

```javascript
// 用 as 重命名导入
import { add as sum, subtract as minus } from './math.js'

console.log(sum(1, 2))    // 3
console.log(minus(3, 1))  // 2
```

### 3.3 默认导入

```javascript
// 默认导出可以用任意名称导入（无需花括号）
import ApiClient from './api.js'
import MyLogger from './logger.js'
import anything from './module.js' // 任意名称都可以
```

### 3.4 默认导入 + 命名导入

```javascript
// 默认导入在前，命名导入在后
import ApiClient, { DEFAULT_TIMEOUT, createApiClient } from './api.js'

const client = new ApiClient('https://api.example.com')
console.log(DEFAULT_TIMEOUT) // 5000
```

### 3.5 命名空间导入（Namespace Import）

```javascript
// 用 * as 将所有命名导出导入为一个对象
import * as math from './math.js'

console.log(math.add(1, 2))      // 3
console.log(math.subtract(3, 1)) // 2
console.log(math.PI)             // 3.14159
```

> **注意**：`* as` 只能导入**命名导出**，默认导出需要通过 `moduleName.default` 访问。

### 3.6 动态导入 import()

`import()` 是 ESM 的**运行时异步导入**机制，返回 Promise：

```javascript
// 基本用法
const module = await import('./heavy-module.js')
module.doSomething()

// Promise 写法
import('./heavy-module.js').then((module) => {
  module.doSomething()
})

// 条件导入
if (featureEnabled) {
  const feature = await import('./feature.js')
  feature.init()
}

// 按路由懒加载（Vue Router）
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.vue')
  },
  {
    path: '/settings',
    component: () => import('./pages/Settings.vue')
  }
]
```

#### 动态导入的应用场景

| 场景 | 示例 |
|------|------|
| 路由懒加载 | `component: () => import('./Page.vue')` |
| 按需加载大型库 | `const echarts = await import('echarts')` |
| 条件加载 polyfill | `if (!window.IntersectionObserver) import('polyfill')` |
| 插件动态注册 | `const plugin = await import(pluginName)` |

### 3.7 import.meta

`import.meta` 是一个对象，包含当前模块的元信息：

```javascript
// ========== 浏览器中 ==========
console.log(import.meta.url)
// "https://example.com/src/main.js"

// 获取当前模块所在目录
const baseUrl = new URL('.', import.meta.url)

// 动态导入同目录下的模块
const module = await import(new URL('./helper.js', import.meta.url))
```

```javascript
// ========== Node.js 中（ESM 模式）==========
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 等同于 CommonJS 的 __filename 和 __dirname
console.log(__filename) // /project/src/main.js
console.log(__dirname)  // /project/src
```

---

## 四、值的引用绑定（Live Binding）

ESM 导入的是原变量的**实时绑定**，不是值的拷贝。这是 ESM 与 CommonJS 的**核心区别**。

### 4.1 基本类型——实时绑定

```javascript
// ========== counter.js ==========
export let count = 0

export function increment() {
  count++
}
```

```javascript
// ========== main.js ==========
import { count, increment } from './counter.js'

console.log(count)    // 0
increment()
increment()
console.log(count)    // 2 ← ESM 中 count 自动更新！
```

```javascript
// 对比 CommonJS（值的拷贝）：
const { count, increment } = require('./counter.js')

console.log(count)    // 0
increment()
console.log(count)    // 0 ← CommonJS 中 count 不变！
```

### 4.2 对象类型——引用共享

```javascript
// ========== state.js ==========
export const state = { count: 0 }

export function increment() {
  state.count++
}
```

```javascript
// ========== main.js ==========
import { state, increment } from './state.js'

console.log(state.count) // 0
increment()
console.log(state.count) // 1 ← ESM 和 CommonJS 对象类型表现一致
```

### 4.3 导入的变量是只读的

```javascript
import { count } from './counter.js'

// ❌ 导入的绑定是只读的，不能直接修改
count = 10 // TypeError: Assignment to constant variable

// ✅ 只能通过导出模块提供的方法修改
import { increment } from './counter.js'
increment() // 正确
```

### 4.4 实时绑定原理

```
ESM 导出/导入机制：

counter.js                  main.js
┌─────────────────┐        ┌─────────────────┐
│ let count = 0   │◄───────│ import { count } │
│                 │ 绑定    │                  │
│ increment() {   │        │ console.log      │
│   count++       │        │   (count) ← 实时读取
│ }               │        │                  │
└─────────────────┘        └─────────────────┘

main.js 中的 count 不是"复制了一份值"，
而是"绑定到了 counter.js 中的 count 变量"，
任何时刻读取都是最新的值。
```

---

## 五、静态分析与 Tree-shaking

### 5.1 静态分析

ESM 的 `import`/`export` 是**编译时声明**，不是运行时调用：

```javascript
// ✅ ESM：编译时确定依赖
import { add } from './math.js'       // 声明在文件顶层
export const result = add(1, 2)       // 静态可分析

// ❌ ESM 不允许：运行时动态导入（静态 import）
if (condition) {
  import { add } from './math.js'     // SyntaxError!
}
function loadModule() {
  import { add } from './math.js'     // SyntaxError!
}
```

```javascript
// ✅ 动态需求用 import() 函数（运行时）
if (condition) {
  const { add } = await import('./math.js')
}
```

### 5.2 Tree-shaking（摇树优化）

因为 ESM 的导入导出是静态的，打包工具可以**在编译时确定哪些导出从未被使用**，然后将它们安全移除：

```javascript
// ========== utils.js ==========
export function usedA() { console.log('A') }
export function usedB() { console.log('B') }
export function unusedC() { console.log('C') }  // 从未导入
export function unusedD() { console.log('D') }  // 从未导入
```

```javascript
// ========== main.js ==========
import { usedA, usedB } from './utils.js'
usedA()
usedB()
```

```
打包前（utils.js）：           打包后（产物）：
┌──────────────────┐          ┌──────────────────┐
│ usedA()          │          │ usedA()          │
│ usedB()          │          │ usedB()          │
│ unusedC() ← ✂️   │          └──────────────────┘
│ unusedD() ← ✂️   │          unusedC 和 unusedD
└──────────────────┘          被 Tree-shaking 移除！
```

> **为什么 CommonJS 不能 Tree-shaking？** 因为 `require()` 可以出现在任何位置、任何条件中，打包工具无法在编译时确定哪些导出会被使用。

---

## 六、浏览器中使用 ESM

### 6.1 `<script type="module">`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ES Module 浏览器示例</title>
</head>
<body>
  <!-- type="module" 声明这是一个 ES 模块 -->
  <script type="module">
    import { add } from './math.js'
    console.log(add(1, 2)) // 3
  </script>

  <!-- 也可以引用外部模块文件 -->
  <script type="module" src="./app.js"></script>
</body>
</html>
```

### 6.2 `<script type="module">` 的特性

| 特性 | 说明 |
|------|------|
| **自动严格模式** | 模块内自动启用 `'use strict'` |
| **独立作用域** | 顶级变量不会成为全局变量 |
| **`this` 为 `undefined`** | 顶级 `this` 不是 `window` |
| **延迟执行** | 等同于 `defer`，DOM 解析完成后执行 |
| **只执行一次** | 同一模块多次引入只执行一次 |
| **CORS 限制** | 跨域模块需要正确的 CORS 头 |
| **独立文件** | 模块路径必须正确（不能省略扩展名） |

```html
<!-- 普通脚本 vs 模块脚本 -->

<!-- 普通脚本：立即执行，阻塞解析，顶级 this === window -->
<script src="normal.js"></script>

<!-- 模块脚本：延迟执行，不阻塞，顶级 this === undefined -->
<script type="module" src="module.js"></script>

<!-- 模块内联 -->
<script type="module">
  console.log(this) // undefined（不是 window）
  var x = 1
  console.log(window.x) // undefined（不会成为全局变量）
</script>
```

### 6.3 nomodule 回退

```html
<!-- 支持 ESM 的浏览器执行 module.js -->
<script type="module" src="module.js"></script>

<!-- 不支持 ESM 的浏览器执行 fallback.js -->
<script nomodule src="fallback.js"></script>
```

### 6.4 模块路径要求

```html
<!-- ✅ 正确：必须写完整路径（含扩展名） -->
<script type="module">
  import { add } from './math.js'
  import { utils } from '/src/utils.js'
  import lodash from 'https://cdn.example.com/lodash.js'
</script>

<!-- ❌ 错误：不能省略扩展名（不像 Node.js/打包工具） -->
<script type="module">
  import { add } from './math'     // 浏览器中报错！
</script>

<!-- ❌ 错误：不能使用裸模块标识符（无打包工具时） -->
<script type="module">
  import lodash from 'lodash'      // 浏览器中报错！
</script>
```

### 6.5 Import Map（浏览器裸模块支持）

```html
<script type="importmap">
{
  "imports": {
    "lodash": "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm",
    "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js"
  }
}
</script>

<script type="module">
  // 现在可以使用裸模块标识符了
  import { ref } from 'vue'
  import _ from 'lodash'

  const count = ref(0)
</script>
```

---

## 七、Node.js 中使用 ESM

### 7.1 启用 ESM 的三种方式

```javascript
// 方式 1：使用 .mjs 扩展名
// 文件名：app.mjs
import { readFile } from 'fs'
console.log('This is ESM')

// 方式 2：在 package.json 中设置 type
// package.json
{
  "type": "module"
}
// 此时 .js 文件被视为 ESM，.cjs 文件被视为 CommonJS

// 方式 3：使用 .cjs 扩展名（当 type=module 时，CJS 文件用 .cjs）
// 文件名：legacy.cjs
const path = require('path') // CommonJS
```

### 7.2 Node.js 中 ESM 与 CJS 的差异

| 对比项 | CommonJS（`.cjs`） | ESM（`.mjs` 或 `type: module`） |
|--------|-------------------|-------------------------------|
| 导入 | `require()` | `import` |
| 导出 | `module.exports` | `export` |
| `__dirname` | ✅ 内置 | ❌ 需用 `import.meta.url` 模拟 |
| `__filename` | ✅ 内置 | ❌ 需用 `import.meta.url` 模拟 |
| `require.resolve` | ✅ 内置 | ❌ 需用 `import.meta.resolve` 或 `createRequire` |
| `this` 顶级 | `module.exports` | `undefined` |
| 加载 JSON | `require('./data.json')` | 需用 `createRequire` 或断言导入 |
| 加载 C++ 模块 | `require('./addon.node')` | 需用 `createRequire` |

### 7.3 __dirname 和 __filename 的替代方案

```javascript
// ========== ESM 中的替代方案 ==========
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

// __filename 替代
const __filename = fileURLToPath(import.meta.url)

// __dirname 替代
const __dirname = dirname(__filename)

// require 替代（用于加载 JSON 或 C++ 模块）
const require = createRequire(import.meta.url)
const data = require('./data.json')

// 路径拼接
const configPath = join(__dirname, 'config.json')
```

### 7.4 在 ESM 中使用 CommonJS 模块

```javascript
// ✅ 直接 import 导入 CJS 模块的 module.exports
import express from 'express'          // 导入默认导出
import lodash from 'lodash'            // 导入默认导出

// ✅ 具名导入也可以（Node.js 会自动处理）
import { readFileSync } from 'fs'      // 从 CJS 模块中具名导入
```

### 7.5 在 CJS 中使用 ESM 模块

```javascript
// ❌ 不能用 require() 导入 ESM 模块
// const esm = require('./module.mjs')  // 报错！

// ✅ 使用动态 import()
async function loadESM() {
  const module = await import('./module.mjs')
  module.doSomething()
}
loadESM()
```

---

## 八、模块加载流程

### 8.1 ESM 的三阶段处理

```
┌─────────────────────────────────────────────────┐
│ 阶段 1：构建（Construction）                      │
│                                                 │
│   查找、下载、解析所有模块文件                      │
│   递归解析 import 语句，构建依赖图                 │
│   ↓                                             │
│   import './a.js' ──→ 下载 a.js                  │
│     ├── import './b.js' ──→ 下载 b.js            │
│     └── import './c.js' ──→ 下载 c.js            │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│ 阶段 2：实例化（Instantiation）                   │
│                                                 │
│   在内存中为所有导出创建"绑定槽"（binding slot）    │
│   注意：此时还没有填充值！只是建立了引用关系         │
│   ↓                                             │
│   a.js 的 exports: { add → [slot], PI → [slot] } │
│   main.js 的 imports: { add → a.js.add }         │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│ 阶段 3：求值（Evaluation）                        │
│                                                 │
│   按依赖关系执行各模块的顶层代码                     │
│   将实际值填入之前创建的绑定槽                      │
│   ↓                                             │
│   执行顺序：b.js → c.js → a.js → main.js         │
│   （被依赖的先执行）                               │
└─────────────────────────────────────────────────┘
```

### 8.2 与 CommonJS 加载流程的对比

```
CommonJS 加载流程：
  1. 运行到 require() 时才加载
  2. 加载后立即执行整个模块
  3. 返回 module.exports 的值（拷贝）
  4. 缓存结果

ESM 加载流程：
  1. 编译时解析所有 import，构建完整依赖图
  2. 为所有导出创建绑定（此时不执行代码）
  3. 按依赖顺序执行模块代码，填充绑定值
  4. 导入方通过绑定实时读取最新值
```

---

## 九、循环依赖

### 9.1 ESM 的循环依赖处理

```javascript
// ========== a.js ==========
import { b } from './b.js'
export const a = 'A'
console.log('a.js: b =', b) // b.js 可能还没执行完
```

```javascript
// ========== b.js ==========
import { a } from './a.js'
export const b = 'B'
console.log('b.js: a =', a) // undefined（a.js 还没执行完）
```

```javascript
// ========== main.js ==========
import './a.js'
// 输出：
// b.js: a = undefined ← a.js 还没执行到 export const a
// a.js: b = B
```

### 9.2 ESM vs CommonJS 循环依赖对比

```
ESM 处理方式：
  - 通过"绑定槽"机制，引用的是变量本身
  - 在求值阶段，如果被依赖模块还没执行完，读取到的可能是 undefined
  - 一旦模块执行完毕，绑定自动指向正确值（实时绑定）

CommonJS 处理方式：
  - 返回 module.exports 的当前快照
  - 如果模块还没执行完，拿到的是部分导出
  - 后续不会自动更新（因为返回的是拷贝）
```

### 9.3 函数提升解决循环依赖

```javascript
// ========== a.js ==========
import { bFunc } from './b.js'
export function aFunc() {
  return 'A'
}
export function callB() {
  return bFunc() // ✅ 函数在调用时 b.js 已经执行完毕
}
```

```javascript
// ========== b.js ==========
import { aFunc, callB } from './a.js'
export function bFunc() {
  return aFunc() // ✅ 函数声明会被提升，调用时已可使用
}
```

> **最佳实践**：在存在循环依赖时，将需要跨模块访问的逻辑封装在**函数**中，利用函数延迟调用的特性规避循环依赖问题。

---

## 十、ESM 与 CommonJS 完整对比

| 对比项 | ES Module | CommonJS |
|--------|-----------|----------|
| **语法** | `import` / `export` | `require()` / `module.exports` |
| **加载方式** | 异步 | 同步 |
| **加载时机** | 编译时（静态） | 运行时（动态） |
| **导入类型** | 值的引用（实时绑定） | 值的拷贝 |
| **是否可条件导入** | 静态 import ❌，`import()` ✅ | ✅ |
| **Tree-shaking** | ✅ 支持 | ❌ 不支持 |
| **this 顶级** | `undefined` | `module.exports` |
| **严格模式** | 自动启用 | 需手动声明 |
| **循环依赖** | 实时绑定（可能暂为 undefined） | 返回部分导出的拷贝 |
| **浏览器原生支持** | ✅ `<script type="module">` | ❌ |
| **Node.js 支持** | ✅ `.mjs` 或 `"type": "module"` | ✅ 默认 `.js` |
| **模块查找** | 完整路径或 import map | 自动解析 + node_modules |
| **扩展名** | 浏览器必须写全 | 可省略 `.js` |
| **顶层 await** | ✅ 支持 | ❌ 不支持 |

---

## 十一、顶层 await（Top-level await）

ES2022 引入的**顶层 `await`** 允许在模块顶层直接使用 `await`，无需包裹在 async 函数中。

```javascript
// ========== config.js ==========
// 顶层 await：模块初始化时等待异步操作完成
const response = await fetch('/api/config')
const config = await response.json()

export default config
```

```javascript
// ========== main.js ==========
// 导入 config 时会等待 config.js 的顶层 await 完成
import config from './config.js'

console.log(config.apiUrl) // 配置已就绪
```

### 顶层 await 的影响

```javascript
// ⚠️ 顶层 await 会阻塞依赖当前模块的其他模块
// ========== slow-module.js ==========
console.log('slow-module: start')
await new Promise(resolve => setTimeout(resolve, 3000))
console.log('slow-module: done')
export const data = 'loaded'
```

```javascript
// ========== main.js ==========
// main.js 必须等待 slow-module.js 的 await 完成
import { data } from './slow-module.js'
console.log('main.js:', data)

// 输出顺序（3 秒后）：
// slow-module: start
// slow-module: done
// main.js: loaded
```

> **注意**：顶层 await 只能在 ESM 中使用，CommonJS 不支持。且只建议在模块初始化确实需要异步操作时使用，滥用会影响加载性能。

---

## 十二、Vite/Webpack 中的 ESM

### 12.1 Vite 与 ESM

Vite 以 ESM 为核心：

```javascript
// vite.config.js
export default defineConfig({
  // 开发模式：利用浏览器原生 ESM，按需编译
  // 生产构建：使用 Rollup 打包为优化的产物
})
```

```javascript
// Vite 中可以直接使用 ESM
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

### 12.2 Vite 的 ESM 开发模式

```
传统打包工具（Webpack dev）：
  启动 → 打包所有模块 → 启动服务器
  ❌ 项目越大启动越慢

Vite 开发模式：
  启动 → 立即启动服务器 → 浏览器请求模块时按需编译
  ✅ 利用浏览器原生 ESM，极速启动
```

### 12.3 Webpack 中的 ESM

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    outputModule: true // 输出 ESM 格式
  },
  output: {
    module: true,
    library: {
      type: 'module'
    }
  }
}
```

---

## 十三、常见面试题

### Q1：ES Module 和 CommonJS 的区别？

**答：**
- **加载方式**：ESM 编译时静态分析，CJS 运行时动态加载
- **值的导入**：ESM 导入值的**引用（实时绑定）**，CJS 导入值的**拷贝**
- **Tree-shaking**：ESM 支持静态分析和 Tree-shaking，CJS 不支持
- **语法**：ESM 用 `import/export`，CJS 用 `require/module.exports`
- **浏览器**：ESM 原生支持，CJS 不支持
- **严格模式**：ESM 自动严格模式，CJS 不是
- **顶层 await**：ESM 支持，CJS 不支持

### Q2：什么是 Tree-shaking？为什么 ESM 支持而 CJS 不支持？

**答：** Tree-shaking 是打包工具在编译时移除未使用代码的优化。ESM 的 `import/export` 是**静态声明**，编译时就能确定依赖关系和使用情况，工具可以安全移除未使用的导出。CJS 的 `require()` 是**运行时调用**，可以出现在条件语句、循环、函数中，编译时无法确定哪些导出会被使用，无法安全移除。

### Q3：`import()` 和 `import` 的区别？

**答：** `import` 是**静态声明**，必须在模块顶层使用，编译时解析，不能放在条件语句中。`import()` 是**运行时函数**，可以在任何位置调用，返回 Promise，支持按需加载和条件加载。`import()` 是 ESM 的动态导入机制，常用于路由懒加载和大型库按需加载。

### Q4：ESM 的"值的引用"是什么意思？

**答：** ESM 导入的不是值的拷贝，而是对原变量的**实时绑定**。当导出模块修改变量值时，导入方能立即读到最新值。例如 `import { count } from './counter'` 后，如果 counter.js 中 `count++`，导入方的 `count` 也会变为新值。但导入方不能直接修改这个值（只读）。CommonJS 则是拷贝，修改原模块的值不会影响已导入的值。

### Q5：浏览器中使用 ESM 有什么注意事项？

**答：** ① 必须使用 `<script type="module">`；② 导入路径必须包含完整扩展名（不像 Node.js 可以省略）；③ 裸模块标识符（如 `import 'lodash'`）需要 Import Map 或打包工具支持；④ 跨域模块需要 CORS 头；⑤ 模块自动延迟执行（类似 `defer`）；⑥ 模块内 `this` 是 `undefined`，不是 `window`。

### Q6：如何在 Node.js 中同时使用 ESM 和 CommonJS？

**答：** ① 通过 `.mjs`（ESM）和 `.cjs`（CJS）扩展名区分；② 或在 `package.json` 中设置 `"type": "module"`，此时 `.js` 为 ESM，`.cjs` 为 CJS；③ ESM 中可以通过 `import` 导入 CJS 模块（Node.js 自动处理）；④ CJS 中需要用 `await import()` 导入 ESM 模块；⑤ ESM 中可通过 `createRequire(import.meta.url)` 创建 `require` 函数来加载 JSON 和 C++ 模块。

---

## 十四、注意事项

1. **import 必须在顶层**：静态 `import` 不能放在 if/for/函数中，需要动态导入用 `import()`
2. **导入是只读的**：不能直接修改导入的值，只能通过导出模块的方法间接修改
3. **路径完整性**：浏览器中必须写完整路径含扩展名，Node.js/打包工具可省略
4. **循环依赖需谨慎**：可能导致部分变量为 `undefined`，用函数封装延迟访问
5. **`import.meta` 只在模块中可用**：普通 `<script>` 中没有 `import.meta`

---

## 官方文档

- [MDN - JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [MDN - import](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import)
- [MDN - export](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/export)
- [Node.js - ES Modules](https://nodejs.org/api/esm.html)
- [Vite - 依赖预构建](https://cn.vitejs.dev/guide/dep-pre-bundling.html)
