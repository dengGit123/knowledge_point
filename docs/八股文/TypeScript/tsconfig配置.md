# tsconfig.json 配置详解

> [TypeScript 官方文档 - TSConfig Reference](https://www.typescriptlang.org/tsconfig)
>
> [TypeScript 官方文档 - Project Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

---

## 一、什么是 tsconfig.json

### 通俗解释

你可以把 `tsconfig.json` 理解为 **TypeScript 编译器的"使用说明书"**。

类比：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   就像你买了一台洗衣机：                                            │
│                                                                  │
│   ┌──────────────┐        ┌──────────────────────┐               │
│   │  洗衣机说明书  │   vs   │   tsconfig.json       │              │
│   │              │        │                      │               │
│   │  水温：30°C   │        │  target: es2020      │               │
│   │  转速：1200   │        │  strict: true        │               │
│   │  模式：快洗   │        │  module: esnext      │               │
│   └──────────────┘        └──────────────────────┘               │
│                                                                  │
│   告诉机器「怎么工作」           告诉编译器「怎么编译」              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

简单来说：**`tsconfig.json` 告诉 TypeScript 编译器——你要把代码编译成什么样子、遵循什么规则、包含哪些文件。**

### 项目根目录的配置文件

`tsconfig.json` 通常放在项目根目录。一个典型的 Vue 3 项目结构：

```
my-project/
├── tsconfig.json          ← 主配置（根目录）
├── tsconfig.node.json     ← Node 环境（如 vite.config.ts）专用配置
├── src/
│   ├── main.ts
│   ├── App.vue
│   └── ...
├── vite.config.ts
└── package.json
```

### 配置文件查找规则

TypeScript 编译器（`tsc`）查找 `tsconfig.json` 的规则：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   1. 显式指定（最高优先级）                                        │
│      tsc -p tsconfig.production.json                             │
│      → 直接使用指定文件                                           │
│                                                                  │
│   2. 向上查找                                                     │
│      tsc                                                         │
│      → 从当前目录开始，逐级向上找 tsconfig.json                     │
│                                                                  │
│   查找顺序：                                                      │
│   /project/src/components/  ← 没有？继续往上                       │
│   /project/src/             ← 没有？继续往上                       │
│   /project/                 ← 找到了！使用这个                     │
│                                                                  │
│   3. 未找到                                                       │
│      → 使用默认配置编译（不推荐）                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

> **注意**：编辑器（如 VSCode）也会读取 `tsconfig.json` 来提供类型提示和错误检查。

---

## 二、compilerOptions 核心配置

`compilerOptions` 是 `tsconfig.json` 中最重要的部分，它控制 TypeScript 编译器的行为。

```json
{
  "compilerOptions": {
    // 所有编译选项都写在这里
  }
}
```

### target - 编译目标

**通俗解释**：告诉 TypeScript 编译器，你要把 TS 代码"翻译"成哪个版本的 JavaScript。

类比：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   target 就像「翻译目标语言」：                                     │
│                                                                  │
│   TypeScript 代码                                                 │
│       │                                                          │
│       ├── target: es5    →  翻译成"古英语"（IE11 能读懂）          │
│       ├── target: es2015 →  翻译成"现代英语"（主流浏览器）          │
│       ├── target: es2020 →  翻译成"最新英语"（现代浏览器）          │
│       └── target: esnext →  翻译成"未来英语"（最前沿特性）          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 对比表格

| target 值 | 输出特性 | 典型用途 | 浏览器兼容性 |
|-----------|---------|---------|-------------|
| `es5` | 箭头函数 → `function`，`let/const` → `var`，模板字符串 → 字符串拼接 | 需要兼容 IE11 | 最广 |
| `es2015` (es6) | 保留箭头函数、`let/const`、类，但不含 `async/await` | 基础现代项目 | 较广 |
| `es2020` | 保留 `async/await`、可选链 `?.`、空值合并 `??` | 现代 Vue/React 项目 | 主流浏览器 |
| `es2022` | 保留 `top-level await`、类字段 | Node.js 16+ | 现代浏览器 |
| `esnext` | 最新的 ECMAScript 特性 | 实验性项目 | 最新浏览器 |

#### 实际效果对比

```typescript
// 源码（TypeScript）
const greet = (name: string): string => {
  return `Hello, ${name}!`
}

class Person {
  constructor(public name: string) {}
}
```

```javascript
// target: es5 编译结果
var greet = function (name) {
    return "Hello, ".concat(name, "!");
};
var Person = /** @class */ (function () {
    function Person(name) {
        this.name = name;
    }
    return Person;
}());
```

```javascript
// target: es2020 编译结果（几乎不变）
const greet = (name) => {
    return `Hello, ${name}!`;
};
class Person {
    constructor(name) {
        this.name = name;
    }
}
```

> **提示**：在 Vue 3 + Vite 项目中，`target` 通常设为 `esnext`，因为 Vite 使用 esbuild 进行转换，不依赖 tsc 的 target。

---

### module - 模块系统

**通俗解释**：告诉 TypeScript 编译器，编译后的代码使用哪种模块规范来组织 `import/export`。

类比：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   module 就像「快递包装方式」：                                     │
│                                                                  │
│   同一个商品（你的代码），可以装进不同的包装盒：                       │
│                                                                  │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│   │ CommonJS  │  │  ESNext   │  │   AMD     │  │   UMD     │    │
│   │ require() │  │ import    │  │ define()  │  │ 通用格式   │    │
│   │ Node.js   │  │ 浏览器/   │  │ 老浏览器  │  │ 哪都行    │    │
│   │ 专用      │  │ 构建工具  │  │           │  │           │    │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 对比表格

| module 值 | 输入 | 输出 | 适用场景 |
|-----------|------|------|---------|
| `commonjs` | `import` | `require()` | Node.js 项目 |
| `es2015` / `es6` | `import` | `import/export` | 基础 ES 模块项目 |
| `es2020` | `import` | `import/export` | 支持 `import.meta` |
| `esnext` | `import` | `import/export` | 前端项目（Vite / Webpack） |
| `amd` | `import` | `define()` | 老旧浏览器（几乎不用了） |
| `umd` | `import` | 通用包装 | 库开发（兼容多种环境） |
| `node16` / `nodenext` | `import` | 根据 `package.json` 的 `type` 决定 | Node.js 现代 ESM 项目 |
| `preserve` | `import` | 原样保留 `import` | Vite / esbuild 项目 |

#### 如何选择

```typescript
// ┌─────────────────────────────────────────┐
// │         如何选择 module ？                │
// └──────────────┬──────────────────────────┘
//                │
//      ┌─────────┴─────────┐
//      │                   │
//   前端项目？           Node.js 项目？
//      │                   │
//   Vite?               Node 版本？
//   ├─ 是 → esnext      ├─ < 16 → commonjs
//   └─ 否 → esnext      └─ >= 16 → nodenext
//      或 amd（极少）
```

#### 实际效果对比

```typescript
// 源码
import { ref } from 'vue'
export const count = ref(0)
```

```javascript
// module: commonjs 编译结果
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = void 0;
const vue_1 = require("vue");
exports.count = (0, vue_1.ref)(0);
```

```javascript
// module: esnext 编译结果
import { ref } from 'vue';
export const count = ref(0);
```

> **提示**：在 Vite 项目中，推荐使用 `"module": "esnext"`，因为 Vite 本身就是基于 ES 模块的开发服务器。

---

### moduleResolution - 模块解析策略

**通俗解释**：当你在代码中写 `import { ref } from 'vue'` 时，TypeScript 需要知道去哪里找 `vue` 这个模块——这就是模块解析策略要解决的问题。

#### 解析策略对比

| 策略 | 适用场景 | 说明 |
|------|---------|------|
| `node` (node10) | Node.js 项目（旧） | 经典的 Node.js 解析方式 |
| `classic` | 已废弃 | 仅用于向后兼容 |
| `bundler` | Vite / Webpack 项目 | 让 TS 模仿打包工具的解析逻辑 |
| `node16` / `nodenext` | Node.js 项目（新） | 支持 ESM 的 Node.js 解析 |

#### 解析流程图

```
import { ref } from './utils'      ← 相对路径导入
import { ref } from 'vue'          ← 裸模块导入

========================================================

模块解析流程（node 策略）：

  import { ref } from './utils'
       │
       ▼
  ① 查找 ./utils.ts        ← 存在？→ 使用
       │ 不存在
       ▼
  ② 查找 ./utils.tsx        ← 存在？→ 使用
       │ 不存在
       ▼
  ③ 查找 ./utils.d.ts       ← 存在？→ 使用
       │ 不存在
       ▼
  ④ 查找 ./utils/index.ts   ← 存在？→ 使用
       │ 不存在
       ▼
  ⑤ 查找 ./utils/index.tsx  ← ...以此类推
       │
       ▼
  ❌ 报错：Cannot find module './utils'

--------------------------------------------------------

  import { ref } from 'vue'
       │
       ▼
  ① 查找 node_modules/vue.ts    ← 存在？→ 使用
       │ 不存在
       ▼
  ② 查找 node_modules/vue/index.ts
       │ 不存在
       ▼
  ③ 读取 node_modules/vue/package.json
     → 找到 "types" 或 "typings" 字段
     → 找到 "exports" 字段
       │
       ▼
  ✅ 找到类型声明文件
```

#### bundler 策略

`bundler` 是 TypeScript 5.0 新增的解析策略，专为前端构建工具设计：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   为什么需要 bundler 策略？                                        │
│                                                                  │
│   Vite/Webpack 的解析行为 ≠ Node.js 的解析行为                     │
│                                                                  │
│   比如：                                                          │
│   import './style.css'          ← 打包工具能处理，但 TS 会报错      │
│   import '#internal'            ← 打包工具的别名，TS 不认识         │
│   import 'vue'                  ← 打包工具能找到，TS 可能找不到     │
│                                                                  │
│   moduleResolution: "bundler" 让 TS 的行为与打包工具保持一致       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

> **提示**：Vue 3 + Vite 项目推荐使用 `"moduleResolution": "bundler"`。

---

### strict 家族

**通俗解释**：`strict` 就像一个严格的老师——打开它，TypeScript 会用最严格的标准检查你的代码，帮你提前发现更多潜在问题。

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   strict: true 等于一次性开启以下所有检查：                         │
│                                                                  │
│   ┌────────────────────────────────┐                              │
│   │  strict: true                  │                              │
│   │                                │                              │
│   │  ├─ strictNullChecks       ✅  │  null/undefined 更严格       │
│   │  ├─ strictFunctionTypes     ✅  │  函数类型更严格              │
│   │  ├─ strictBindCallApply     ✅  │  bind/call/apply 更严格     │
│   │  ├─ strictPropertyInitialization ✅ │ 类属性初始化更严格    │
│   │  ├─ noImplicitAny           ✅  │  禁止隐式 any              │
│   │  ├─ noImplicitThis          ✅  │  禁止隐式 this             │
│   │  ├─ alwaysStrict            ✅  │  始终使用严格模式           │
│   │  └─ useUnknownInCatchVariables ✅ │ catch 变量为 unknown   │
│   └────────────────────────────────┘                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 各选项独立说明

##### strictNullChecks

这是 `strict` 家族中**最重要的选项**，改变了 `null` 和 `undefined` 的行为。

```typescript
// strictNullChecks: false（默认行为）
let name: string = null      // ✅ 不报错，但运行时可能崩溃
let age: number = undefined  // ✅ 不报错

function printLength(text: string) {
  console.log(text.length)   // 如果 text 实际是 null → 运行时报错！
}
printLength(null)             // ✅ 编译不报错，运行时爆炸 💥
```

```typescript
// strictNullChecks: true
let name: string = null      // ❌ 报错：不能将 null 赋值给 string
let age: number = undefined  // ❌ 报错：不能将 undefined 赋值给 number

// 正确写法：显式声明可能为 null
let name: string | null = null      // ✅
let age: number | undefined = undefined // ✅

function printLength(text: string | null) {
  if (text === null) return         // ✅ 先检查再使用
  console.log(text.length)          // ✅ 安全
}
```

##### strictFunctionTypes

对函数参数进行**逆变**（contravariant）检查，而不是双向协变。

```typescript
// strictFunctionTypes: false
type AnimalHandler = (animal: Animal) => void
type DogHandler = (dog: Dog) => void

let handler: AnimalHandler = (dog: Dog) => {
  // 编译不报错，但 dog.bark() 可能不存在
  dog.bark()
}
```

```typescript
// strictFunctionTypes: true
let handler: AnimalHandler = (dog: Dog) => {
  // ❌ 报错：Dog 不能赋值给 Animal 的参数类型
  dog.bark()
}
```

##### noImplicitAny

禁止隐式推断为 `any` 类型。

```typescript
// noImplicitAny: false
function add(a, b) {    // a: any, b: any → 隐式 any
  return a + b          // 不会报错，但丢失了类型检查
}
```

```typescript
// noImplicitAny: true
function add(a, b) {    // ❌ 报错：参数 a 隐式具有 any 类型
  return a + b
}

// 正确写法：显式标注类型
function add(a: number, b: number): number {  // ✅
  return a + b
}
```

#### 推荐做法

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

> **强烈建议**：新项目一律开启 `strict: true`。虽然初期可能会多一些类型标注的工作，但能避免大量运行时 bug。如果老项目迁移，可以逐步开启各个子选项。

---

### lib - 类型库

**通俗解释**：`lib` 告诉 TypeScript："你要帮我检查哪些内置 API 的类型？"

类比：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   lib 就像「字典」：                                               │
│                                                                  │
│   你写代码时会用到各种内置 API：                                    │
│                                                                  │
│   - Array.prototype.map     → 需要 "ES2015" 字典                  │
│   - Promise                 → 需要 "ES2015" 字典                  │
│   - document.querySelector  → 需要 "DOM" 字典                     │
│   - fetch                   → 需要 "DOM" 字典                     │
│   - Object.entries          → 需要 "ES2017" 字典                  │
│                                                                  │
│   如果不包含对应的字典，TS 就不认识这些 API → 报错                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 默认行为

```
当 target 为 es5    → 默认 lib: ["ES5", "DOM", "ScriptHost"]
当 target 为 es6    → 默认 lib: ["ES2015", "DOM", "ScriptHost"]
当 target 为 es2020 → 默认 lib: ["ES2020", "DOM", "ScriptHost"]
```

> **注意**：一旦你手动设置了 `lib`，默认值就不再生效，你需要自己把需要的都写上。

#### 常见配置

```json
// Vue 3 + Vite 前端项目（需要 DOM 和现代 ES 特性）
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  }
}
```

```json
// Node.js 项目（不需要 DOM）
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["ES2022"]
  }
}
```

```json
// 需要用到较新的 API（如 structuredClone）
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM"]
  }
}
```

#### 各 lib 包含的核心 API 速查

| lib | 包含的关键 API |
|-----|--------------|
| `ES5` | `Array`、`Object`、`String`、`Number`、`RegExp` 等基础方法 |
| `ES2015` | `Promise`、`Map`、`Set`、`Symbol`、`for...of`、`Array.from` |
| `ES2016` | `Array.prototype.includes`、`**` 运算符 |
| `ES2017` | `Object.entries`、`Object.values`、`async/await` |
| `ES2018` | `Promise.finally`、对象展开 `...rest` |
| `ES2019` | `Array.prototype.flat`、`Object.fromEntries` |
| `ES2020` | `BigInt`、`?.` 可选链、`??` 空值合并、`Promise.allSettled` |
| `ES2021` | `Promise.any`、`replaceAll`、逻辑赋值 `??=` |
| `ES2022` | `Object.hasOwn`、`Array.prototype.at`、`Error.cause` |
| `DOM` | `document`、`window`、`HTMLElement`、`fetch`、`console` |
| `DOM.Iterable` | `NodeList` 的 `forEach`/`for...of`、`DOMTokenList` 迭代 |
| `WebWorker` | `Worker`、`self`、`postMessage` 等 WebWorker API |

---

### 路径别名

**通俗解释**：路径别名让你用简短的"昵称"来代替长长的相对路径。

```typescript
// 没有 alias —— 相对路径地狱
import { useUser } from '../../../composables/useUser'
import { UserCard } from '../../components/UserCard.vue'
import { api } from '../../../utils/api'

// 有 alias —— 清爽干净
import { useUser } from '@/composables/useUser'
import { UserCard } from '@/components/UserCard.vue'
import { api } from '@/utils/api'
```

#### tsconfig.json 中的配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",                        // 基准目录（项目根目录）
    "paths": {
      "@/*": ["src/*"],                    // @ 指向 src 目录
      "@components/*": ["src/components/*"], // 可定义多个别名
      "@composables/*": ["src/composables/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

#### 与 Vite 配合

`tsconfig.json` 的 `paths` **只影响 TypeScript 的类型检查**，实际的模块打包还需要在构建工具中配置对应的别名。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')       // 必须与 tsconfig.json 的 paths 对应
    }
  }
})
```

#### 与 Webpack 配合

```javascript
// webpack.config.js
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')  // 必须与 tsconfig.json 的 paths 对应
    }
  }
}
```

> **关键点**：`tsconfig.json` 的 `paths` 和构建工具的 `alias` 必须**保持一致**，否则会出现"TS 不报错但运行时找不到模块"的问题。

---

### 其他重要配置

#### esModuleInterop

**通俗解释**：让你能用更自然的方式从 CommonJS 模块中 `import`。

```typescript
// esModuleInterop: false
import * as fs from 'fs'        // ✅ 必须用 * as
import fs from 'fs'              // ❌ 报错

// esModuleInterop: true
import fs from 'fs'              // ✅ 可以用默认导入
import * as fs from 'fs'         // ✅ 仍然可用
```

```json
{
  "compilerOptions": {
    "esModuleInterop": true   // 推荐：开启
  }
}
```

> **注意**：开启 `esModuleInterop` 时，TypeScript 会自动开启 `allowSyntheticDefaultImports`。

#### allowSyntheticDefaultImports

允许从**没有默认导出**的模块中使用默认导入（`import X from 'module'`）。

```typescript
// allowSyntheticDefaultImports: true
// 即使 'vue' 没有默认导出，也可以这样写：
import Vue from 'vue'
```

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true
  }
}
```

> **提示**：通常不需要单独设置，`esModuleInterop: true` 会自动开启此选项。

#### resolveJsonModule

允许在 TypeScript 中直接 `import` JSON 文件。

```typescript
// resolveJsonModule: true
import packageInfo from '../package.json'

console.log(packageInfo.version)  // ✅ 有类型提示
```

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

#### isolatedModules

**通俗解释**：确保每个文件可以独立编译，不依赖其他文件的类型信息。

> 这是为了兼容 esbuild、Babel、swc 等单文件编译工具（它们不会做跨文件类型分析）。

```json
{
  "compilerOptions": {
    "isolatedModules": true   // Vite 项目必须开启
  }
}
```

开启后，以下写法会报错：

```typescript
// ❌ isolatedModules 模式下，纯类型导出必须用 type 关键字
export { SomeType }         // 报错
export type { SomeType }    // ✅ 正确

// ❌ const enum 在单文件编译中无法正确处理
export const enum Color {   // 报错
  Red = 'red'
}
```

#### skipLibCheck

跳过对所有声明文件（`.d.ts`）的类型检查。

```json
{
  "compilerOptions": {
    "skipLibCheck": true    // 推荐：大幅提升编译速度
  }
}
```

> **为什么推荐开启**：第三方库的类型声明可能有错误或互相冲突，`skipLibCheck` 跳过这些检查，只检查你自己的代码。这能显著加快编译速度。

#### declaration / declarationDir

自动生成类型声明文件（`.d.ts`），用于**库开发**。

```json
{
  "compilerOptions": {
    "declaration": true,              // 生成 .d.ts 文件
    "declarationDir": "./dist/types"  // .d.ts 输出到指定目录
  }
}
```

```
src/
├── index.ts          →  编译后生成 →  dist/types/index.d.ts
├── utils.ts          →  编译后生成 →  dist/types/utils.d.ts
```

#### sourceMap

生成 source map 文件，方便在浏览器调试时定位到源码。

```json
{
  "compilerOptions": {
    "sourceMap": true    // 生成 .js.map 文件
  }
}
```

> **提示**：Vite 项目通常不需要手动开启 `sourceMap`，Vite 自行处理开发环境的 source map。

#### outDir / rootDir

控制编译输出的目录和源码根目录。

```json
{
  "compilerOptions": {
    "rootDir": "./src",      // 源码根目录
    "outDir": "./dist"       // 编译输出目录
  }
}
```

```
编译前：                          编译后：
src/                              dist/
├── index.ts      →              ├── index.js
├── utils/                        ├── utils/
│   └── helper.ts →              │   └── helper.js
```

> **提示**：使用 Vite / Webpack 等构建工具的项目通常不需要配置 `outDir`，因为构建工具自己处理输出。`outDir` 主要用于纯 `tsc` 编译的场景。

---

## 三、include / exclude / files

**通俗解释**：这三个选项告诉 TypeScript 编译器——"你要处理哪些文件"和"你要忽略哪些文件"。

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   include / exclude / files 的关系：                              │
│                                                                  │
│   ┌─────────────────────────────────────────────┐                │
│   │                                             │                │
│   │   所有文件                                   │                │
│   │   ┌─────────────────────────────────────┐   │                │
│   │   │  include 匹配的文件                   │   │                │
│   │   │  ┌───────────────────────────────┐   │   │                │
│   │   │  │                               │   │   │                │
│   │   │  │  排除 exclude 匹配的文件       │   │   │                │
│   │   │  │  + 排除 node_modules          │   │   │                │
│   │   │  │  最终参与编译的文件             │   │   │                │
│   │   │  │                               │   │   │                │
│   │   │  └───────────────────────────────┘   │   │                │
│   │   └─────────────────────────────────────┘   │                │
│   │                                             │                │
│   └─────────────────────────────────────────────┘                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### files - 精确指定文件

```json
{
  "files": [
    "src/index.ts",
    "src/main.ts"
  ]
}
```

> 只有列出的文件会参与编译，**适合文件很少的小项目**。

### include - 模式匹配

```json
{
  "include": [
    "src/**/*.ts",          // src 下所有 .ts 文件（含子目录）
    "src/**/*.tsx",         // src 下所有 .tsx 文件
    "src/**/*.vue",         // src 下所有 .vue 文件
    "tests/**/*.ts"         // tests 下所有 .ts 文件
  ]
}
```

**匹配模式说明**：

| 模式 | 含义 | 示例 |
|------|------|------|
| `*` | 匹配任意文件名（不含路径分隔符） | `src/*.ts` → `src/a.ts` |
| `**` | 匹配任意层级的目录 | `src/**/*.ts` → `src/a.ts`、`src/sub/b.ts` |
| `**/*` | 匹配所有文件 | `**/*` → 所有文件 |

### exclude - 排除文件

```json
{
  "exclude": [
    "node_modules",         // 永远应该排除
    "dist",                 // 编译输出目录
    "**/*.spec.ts",         // 测试文件
    "**/*.test.ts"
  ]
}
```

> **默认行为**：即使不写 `exclude`，TypeScript 也会自动排除 `node_modules`、`bower_components`、`jspm_packages` 和编译输出目录（`outDir`）。

### 优先级规则

```
优先级从高到低：

1. files       → 精确指定，最高优先级
2. exclude     → 排除规则，优先于 include
3. include     → 包含规则，最低优先级

规则：
- files 指定的文件一定会被编译，即使 exclude 排除了它
- include 匹配的文件如果被 exclude 匹配，则不会被编译
- 如果同时没有 files 和 include，则默认包含根目录下所有 .ts 文件
```

---

## 四、项目引用（Project References）

**通俗解释**：项目引用允许你把一个大项目拆成多个小项目，每个小项目独立编译、独立配置。

类比：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   没有 Project References：                                       │
│   ┌──────────────────────────────────────────────┐               │
│   │               一个大 tsconfig.json            │               │
│   │                                              │               │
│   │   前端代码 + 后端代码 + 共享代码               │               │
│   │   编译慢，配置耦合                            │               │
│   └──────────────────────────────────────────────┘               │
│                                                                  │
│   有 Project References：                                         │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│   │  前端项目   │  │  后端项目   │  │  共享库     │                │
│   │  tsconfig   │  │  tsconfig   │  │  tsconfig   │                │
│   │  (独立编译) │  │  (独立编译) │  │  (独立编译) │                │
│   └──────┬─────┘  └──────┬─────┘  └──────┬─────┘                │
│          │               │               │                       │
│          └───────────────┴───────────────┘                       │
│                          │                                       │
│                  ┌───────┴───────┐                               │
│                  │  根 tsconfig   │  ← 只负责引用                  │
│                  └───────────────┘                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### composite 配置

被引用的项目必须设置 `composite: true`：

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,           // 必须：标记为可被引用的项目
    "declaration": true,         // 必须：生成 .d.ts 文件
    "declarationMap": true,      // 推荐：生成声明文件的 source map
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### 前后端分离配置

```
project/
├── tsconfig.json                   ← 根配置（只引用）
├── tsconfig.base.json              ← 共享基础配置
├── client/
│   ├── tsconfig.json               ← 前端配置
│   └── src/
│       └── main.ts
├── server/
│   ├── tsconfig.json               ← 后端配置
│   └── src/
│       └── index.ts
└── shared/
    ├── tsconfig.json               ← 共享类型配置
    └── src/
        └── types.ts
```

```json
// tsconfig.base.json（共享基础配置）
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```json
// tsconfig.json（根配置）
{
  "files": [],
  "references": [
    { "path": "./client" },
    { "path": "./server" },
    { "path": "./shared" }
  ]
}
```

```json
// client/tsconfig.json（前端配置）
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM"],
    "outDir": "./dist",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

```json
// server/tsconfig.json（后端配置）
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "types": ["node"]
  },
  "include": ["src"]
}
```

### monorepo 中的应用

```json
// monorepo 根 tsconfig.json
{
  "files": [],
  "references": [
    { "path": "packages/ui" },
    { "path": "packages/utils" },
    { "path": "packages/api-client" },
    { "path": "apps/web" },
    { "path": "apps/admin" }
  ]
}
```

#### Project References 的好处

| 好处 | 说明 |
|------|------|
| **编译加速** | 只重新编译有改动的子项目 |
| **逻辑隔离** | 前后端各有独立的 `compilerOptions` |
| **依赖明确** | 项目间的引用关系一目了然 |
| **增量编译** | 配合 `tsc --build` 实现增量构建 |

---

## 五、常见配置模板

### Vue 3 + Vite 项目推荐配置

```
my-vue-app/
├── tsconfig.json              ← 主配置
├── tsconfig.app.json          ← 应用代码配置
├── tsconfig.node.json         ← Node 环境配置（vite.config.ts 等）
├── vite.config.ts
└── src/
    ├── main.ts
    ├── App.vue
    └── ...
```

```json
// tsconfig.json（主入口，只做引用）
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// tsconfig.app.json（应用代码）
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```json
// tsconfig.node.json（Node 环境）
{
  "extends": "@vue/tsconfig/tsconfig.node.json",
  "include": ["vite.config.*", "vitest.config.*", "cypress.config.*", "nightwatch.conf.*", "playwright.config.*"],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  }
}
```

#### 最简版（单文件配置）

如果不想拆分多文件，也可以用一个 `tsconfig.json` 搞定：

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

> **说明**：`noEmit: true` 表示 TypeScript 只做类型检查，不输出 JS 文件。因为 Vite 用 esbuild 处理代码转换，不需要 tsc 输出。

---

### 纯 Node.js 项目配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["es2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

> **说明**：Node.js 项目通常需要 `outDir` 和 `sourceMap`，因为要直接运行编译后的 JS。

---

### 库开发配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["es2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationDir": "./dist/types",
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": false,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### 三种模板对比

| 配置项 | Vue 3 + Vite | 纯 Node.js | 库开发 |
|-------|-------------|-----------|-------|
| `target` | `esnext` | `es2022` | `es2020` |
| `module` | `esnext` | `commonjs` | `esnext` |
| `moduleResolution` | `bundler` | `node` | `bundler` |
| `lib` | `["esnext", "dom"]` | `["es2022"]` | `["es2020"]` |
| `strict` | `true` | `true` | `true` |
| `noEmit` | `true` | 不设 | `false` |
| `declaration` | 不设 | `true` | `true` |
| `outDir` | 不设 | `./dist` | `./dist` |
| `sourceMap` | 不设 | `true` | `true` |
| `jsx` | `preserve` | 不需要 | 按需 |
| `types` | `["vite/client"]` | `["node"]` | 按需 |

---

## 六、面试常见问题

### Q1：tsconfig.json 中的 `strict: true` 具体开启了哪些选项？

**参考答案**：

`strict: true` 是一个快捷方式，它一次性开启以下所有严格类型检查选项：

1. **strictNullChecks** — `null` 和 `undefined` 不再是所有类型的子类型，必须显式声明
2. **strictFunctionTypes** — 函数参数使用逆变检查，而非双向协变
3. **strictBindCallApply** — 对 `bind`、`call`、`apply` 进行严格类型检查
4. **strictPropertyInitialization** — 类的属性必须在构造函数中初始化
5. **noImplicitAny** — 禁止隐式推断为 `any`，必须显式标注
6. **noImplicitThis** — 禁止 `this` 隐式为 `any`
7. **alwaysStrict** — 在输出文件顶部添加 `"use strict"`
8. **useUnknownInCatchVariables** — `catch` 中的变量类型为 `unknown` 而非 `any`

建议新项目一律开启 `strict: true`，老项目可以逐步开启各子选项进行迁移。

---

### Q2：`target` 和 `module` 有什么区别？

**参考答案**：

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   target  →  控制语法转换（代码语法翻译成哪个 JS 版本）         │
│   module  →  控制模块系统（import/export 编译成什么格式）       │
│                                                              │
│   举例：                                                      │
│                                                              │
│   target: es5   →  箭头函数变成 function                      │
│   module: commonjs → import 变成 require()                    │
│                                                              │
│   两者是独立的：                                               │
│   可以 target: es5 + module: esnext（语法降级但保留 ES 模块）  │
│   可以 target: esnext + module: commonjs（保留新语法但用 CJS） │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- `target` 决定**语法层面**编译成什么版本（箭头函数、类、async/await 等语法特性的转换）
- `module` 决定**模块层面**使用什么模块规范（import/export 如何处理）
- 两者可以独立配置，但通常 `target` 较新时 `module` 也选择较新的值

---

### Q3：为什么 Vite 项目中要设置 `noEmit: true`？

**参考答案**：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Vite 项目中的编译流程：                                         │
│                                                                  │
│   .ts 文件 ──→ esbuild（代码转换）──→ 浏览器                      │
│                                                                  │
│   .ts 文件 ──→ tsc（仅类型检查）──→ 不输出文件                     │
│                                                                  │
│   为什么要 noEmit: true？                                        │
│                                                                  │
│   1. Vite 用 esbuild 做代码转换，速度远超 tsc                     │
│   2. tsc 只负责类型检查，不需要输出 .js 文件                       │
│   3. 如果不设 noEmit，tsc 会在 src 目录旁边输出 .js 文件          │
│      → 造成混乱                                                  │
│                                                                  │
│   分工明确：                                                      │
│   tsc     → 只管类型检查（noEmit: true）                          │
│   esbuild → 只管代码转换                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

在 Vite 项目中，TypeScript 编译器（`tsc`）只负责**类型检查**，不负责代码编译。代码的转换和打包由 Vite 底层的 esbuild 完成。设置 `noEmit: true` 可以：
1. 避免 `tsc` 输出多余的 `.js` 文件
2. 加快类型检查速度（跳过代码生成步骤）
3. 保持职责分离，避免 tsc 和 esbuild 的输出冲突

---

### Q4：`moduleResolution: "bundler"` 和 `"node"` 有什么区别？

**参考答案**：

| 特性 | `node` | `bundler` |
|------|--------|-----------|
| 设计目标 | 模拟 Node.js 的模块解析 | 模拟打包工具的解析行为 |
| 扩展名省略 | 不允许省略 `.ts`/`.js` 扩展名 | 允许省略扩展名 |
| `exports` 字段 | 不支持 package.json 的 `exports` | 支持 |
| 相对路径导入 | 需要写完整的文件路径 | 可以省略扩展名 |
| 适用项目 | Node.js 项目 | Vite / Webpack 等前端项目 |

```typescript
// moduleResolution: "node" → 必须写扩展名（或不写，TS 自动尝试）
import { foo } from './utils'     // TS 自动尝试 ./utils.ts, ./utils/index.ts 等

// moduleResolution: "bundler" → 行为与 Vite 一致
import { foo } from './utils'     // 可以省略扩展名，TS 不会报错
import './style.css'              // 允许导入非 TS 文件
```

**选择建议**：Vite / Webpack 项目用 `bundler`，纯 Node.js 项目用 `node` 或 `nodenext`。

---

### Q5：如何理解 `tsconfig.json` 的 `extends` 继承机制？

**参考答案**：

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   extends 就像面向对象的"继承"：                                   │
│                                                                  │
│   基础配置（父类）           子配置（子类）                         │
│   ┌─────────────────┐      ┌─────────────────┐                   │
│   │ tsconfig.base   │      │ tsconfig.app    │                   │
│   │                 │      │                 │                    │
│   │ strict: true    │ ───→ │ extends: base   │                   │
│   │ target: esnext  │ 继承  │ lib: ["DOM"]    │ 覆盖/新增         │
│   │ module: esnext  │      │                 │                    │
│   └─────────────────┘      └─────────────────┘                   │
│                                                                  │
│   合并规则：                                                      │
│   - compilerOptions：子配置覆盖同名项（顶层覆盖）                  │
│   - include / exclude：子配置完全替换父配置（不合并）              │
│   - 数组类型（如 lib, types）：子配置完全替换父配置                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "module": "esnext",
    "skipLibCheck": true
  }
}
```

```json
// tsconfig.app.json（继承基础配置，添加/覆盖自己的选项）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],    // 新增
    "types": ["vite/client"]     // 新增
    // strict、target、module、skipLibCheck 从 base 继承
  },
  "include": ["src/**/*"]
}
```

`extends` 的优势：
1. **复用**：多个 tsconfig 共享基础配置
2. **维护**：修改一处即可影响所有子配置
3. **分层**：前端/后端/测试各有独立配置，同时共享公共选项

---

> [TypeScript 官方文档 - TSConfig Reference](https://www.typescriptlang.org/tsconfig)
>
> [TypeScript 官方文档 - Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
>
> [Vue 3 + TypeScript 官方推荐配置](https://vuejs.org/guide/typescript/overview.html)
