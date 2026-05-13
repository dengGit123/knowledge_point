# CommonJS 与 ES6 模块详解

## 一、CommonJS 模块

### 1.1 概述

CommonJS 是 Node.js 采用的模块规范，主要用于服务端 JavaScript 开发。

### 1.2 基本语法

```javascript
// 导出
// 方式1: 导出单个值
module.exports = {
  name: 'test',
  foo: function() {}
};

// 方式2: 使用 exports（注意：不能直接赋值 exports = xxx）
exports.name = 'test';
exports.foo = function() {};

// 方式3: 使用 exports 对象的属性
exports.bar = 'hello';

// 导入
const module = require('./module');
const { name, foo } = require('./module');
```

### 1.3 特点

| 特性 | 说明 |
|------|------|
| 运行时加载 | 代码执行时才加载模块 |
| 值的拷贝 | 导出的是值的拷贝，模块内部变化不影响已导入的值 |
| 同步加载 | 适合服务端，不适合浏览器 |
| 动态加载 | 可以在代码任意位置 require |

### 1.4 核心机制

```javascript
// module.js
let count = 0;

function increment() {
  count++;
}

module.exports = {
  count,
  increment
};

// main.js
const { count, increment } = require('./module');
console.log(count); // 0
increment();
console.log(count); // 仍然是 0！因为导出的是值的拷贝
```

### 1.5 加载过程

```javascript
// CommonJS 加载流程
// 1. 路径分析
// 2. 文件定位（查找 .js, .json, .node）
// 3. 编译执行
// 4. 缓存（缓存在 require.cache 中）
```

---

## 二、ES6 模块（ESM）

### 2.1 概述

ES6 模块是 JavaScript 官方的模块化方案，原生支持，设计目标是成为浏览器和服务端通用的模块解决方案。

### 2.2 基本语法

```javascript
// 命名导出
// 方式1: 导出时声明
export const name = 'test';
export function foo() {}
export class Bar {}

// 方式2: 统一导出
const name = 'test';
function foo() {}
export { name, foo };

// 方式3: 导出时重命名
export { name as userName };

// 默认导出
export default function() {}
// 或
export { foo as default };

// 导入
import { name, foo } from './module.js';
import * as module from './module.js';
import foo from './module.js'; // 导入默认导出
import { default as foo } from './module.js'; // 默认导出的另一种写法

// 导入再导出
export { name, foo } from './module.js';
export * from './module.js';
export { default } from './module.js';
```

### 2.3 特点

| 特性 | 说明 |
|------|------|
| 编译时加载 | 编译阶段就确定模块依赖关系 |
| 值的引用 | 导出的是值的引用，动态绑定 |
| 异步加载 | 适合浏览器，不会阻塞执行 |
| 静态分析 | 支持 tree-shaking，可进行静态优化 |

### 2.4 核心机制

```javascript
// module.js
export let count = 0;

export function increment() {
  count++;
}

// main.js
import { count, increment } from './module.js';
console.log(count); // 0
increment();
console.log(count); // 1！因为是引用，能获取到最新值
```

---

## 三、CommonJS vs ES6 模块对比

### 3.1 核心区别

| 对比项 | CommonJS | ES6 模块 |
|--------|----------|----------|
| **加载时机** | 运行时加载 | 编译时加载（静态） |
| **导出方式** | 值拷贝 | 值引用（动态绑定） |
| **加载模式** | 同步 | 异步 |
| **this 指向** | 指向模块自身 | 指向 undefined |
| **顶层命令** | require | import |
| **导入特性** | 动态，可条件加载 | 静态，必须顶层 |
| **tree-shaking** | 不支持 | 支持 |
| **兼容性** | Node.js 默认支持 | 现代浏览器/Node |

### 3.2 代码示例对比

```javascript
// ============ CommonJS ============
// lib.js
let count = 0;
module.exports = { count };

// main.js
const lib = require('./lib');
lib.count = 1; // 修改的是拷贝的值
// lib.js 内部的 count 不受影响

// ============ ES6 模块 ============
// lib.js
let count = 0;
export { count };

// main.js
import { count } from './lib.js';
count = 1; // 报错！导入的值是只读的
```

### 3.3 语法对比

```javascript
// ============ CommonJS ============
const fs = require('fs');
const path = require('path');

// 条件加载
if (condition) {
  const foo = require('./foo');
}

// 动态路径
const module = require(dynamicPath + '/module');

// ============ ES6 模块 ============
import fs from 'fs';  // Node 需要 package.json: "type": "module"

// import 必须在顶层，不能条件加载
// ❌ 错误
if (condition) {
  import { foo } from './foo.js';
}

// ✅ 使用 import() 动态导入（返回 Promise）
if (condition) {
  const { foo } = await import('./foo.js');
}

// 动态路径
const module = await import(`${dynamicPath}/module.js`);
```

---

## 四、this 指向差异

```javascript
// CommonJS
console.log(this); // {}
this.foo = 'bar';  // 可以给 this 添加属性
module.exports.foo = 'bar'; // 本质上是在操作 module.exports

// ES6 模块
console.log(this); // undefined
this.foo = 'bar';  // 报错：Cannot set property 'foo' of undefined
```

---

## 五、Node.js 中的使用

### 5.1 确定模块类型

```json
// package.json
{
  "type": "module"  // 使用 ES6 模块
}

// 或
{
  "type": "commonjs"  // 使用 CommonJS（默认）
}
```

### 5.2 文件扩展名规范

| 扩展名 | 说明 |
|--------|------|
| `.cjs` | 强制作为 CommonJS 处理 |
| `.mjs` | 强制作为 ES6 模块处理 |
| `.js` | 由 package.json 的 type 字段决定 |

### 5.3 混用注意事项

```javascript
// ES6 模块中可以导入 CommonJS
// ✅ 允许
import { foo } from './common.cjs';
import pkg from './common.cjs'; // 只能使用默认导入

// CommonJS 中不能直接导入 ES6 模块
// ❌ 不允许
const { foo } = require('./esm.mjs');

// ✅ 需要使用动态 import()
(async () => {
  const { foo } = await import('./esm.mjs');
})();
```

---

## 六、循环依赖处理

### 6.1 CommonJS 循环依赖

```javascript
// a.js
exports.done = false;
const b = require('./b.js');
console.log('在 a.js 中，b.done = %j', b.done);
exports.done = true;
console.log('a.js 执行完毕');

// b.js
exports.done = false;
const a = require('./a.js');
console.log('在 b.js 中，a.done = %j', a.done);
exports.done = true;
console.log('b.js 执行完毕');

// main.js
const a = require('./a.js');
const b = require('./b.js');
console.log('在 main 中，a.done = %j, b.done = %j', a.done, b.done);

// 输出：
// 在 b.js 中，a.done = false  ← a 还没执行完，只导出了 done
// b.js 执行完毕
// 在 a.js 中，b.done = true
// a.js 执行完毕
// 在 main 中，a.done = true, b.done = true
```

### 6.2 ES6 模块循环依赖

```javascript
// a.js
export let done = false;
import { bDone } from './b.js';
console.log('在 a.js 中，bDone = %j', bDone);
done = true;

// b.js
export let bDone = false;
import { done } from './a.js';
console.log('在 b.js 中，done = %j', done);
bDone = true;

// main.js
import { done, bDone } from './a.js';  // 或 './b.js'
console.log('在 main 中，done = %j, bDone = %j', done, bDone);

// 输出：
// 在 b.js 中，done = false  ← a 的 done 还未赋值
// 在 a.js 中，bDone = true
// 在 main 中，done = true, bDone = true
```

---

## 七、注意事项

### 7.1 CommonJS 注意事项

```javascript
// 1. module.exports 与 exports 的区别
// ✅ 正确
exports.foo = 'bar';
module.exports.bar = 'foo';

// ❌ 错误 - exports 只是 module.exports 的引用
exports = { foo: 'bar' };  // 不会生效

// ✅ 正确 - 重新赋值需要用 module.exports
module.exports = { foo: 'bar' };

// 2. 缓存机制
// 模块第一次加载后会被缓存，多次 require 返回同一对象
delete require.cache[require.resolve('./module')];  // 清除缓存

// 3. 路径解析
// 顺序：核心模块 -> ./相对路径 -> ../绝对路径 -> node_modules
```

### 7.2 ES6 模块注意事项

```javascript
// 1. import 具有提升效果
console.log(foo);  // 不会报错，因为 import 会提升
import { foo } from './module.js';

// 2. 导入的是只读引用
import { count } from './module.js';
count = 1;  // 报错：Assignment to constant variable

// 3. 动态 import() 返回 Promise
const module = await import('./module.js');
const { foo } = module;

// 4. 必须使用完整路径和扩展名（浏览器）
import { foo } from './module.js';  // ✅
import { foo } from './module';     // ❌ 需要配置
```

### 7.3 通用注意事项

```javascript
// 1. 避免循环依赖
// 如果出现循环依赖，重新设计模块结构

// 2. 统一模块规范
// 同一项目中尽量使用同一种模块规范

// 3. 注意环境兼容性
// 浏览器需要打包工具（Webpack、Vite）或使用 `<script type="module">`

// 4. Tree Shaking
// ES6 模块支持 tree-shaking，导出时注意使用具名导出
// ✅ 推荐
export { foo, bar };

// ❌ 不利于 tree-shaking
export default { foo, bar };
```

---

## 八、最佳实践

### 8.1 导出原则

```javascript
// 1. 优先使用具名导出（ES6）
export const API_URL = 'https://api.example.com';
export function fetchUser(id) {}
export class UserService {}

// 2. 默认导出用于主要功能
export default function createApp() {
  // 应用初始化逻辑
}

// 3. 统一在文件末尾导出
const config = { /* ... */ };
const utils = { /* ... */ };
export { config, utils };
```

### 8.2 导入原则

```javascript
// 1. 按需导入，减少内存占用
import { debounce } from 'lodash-es';

// 2. 合理组织导入顺序
// 1. Node 内置模块
// 2. 第三方库
// 3. 本地模块（相对路径）
import fs from 'fs';
import _ from 'lodash';
import { foo } from './utils';

// 3. 使用别名避免冲突
import { format as formatDate } from './date';
import { format as formatNumber } from './number';
```

### 8.3 模块设计

```javascript
// 单一职责原则
// ✅ 好的设计
// api/user.js
export async function getUser(id) {}
export async function createUser(data) {}

// api/order.js
export async function getOrder(id) {}
export async function createOrder(data) {}

// ❌ 不好的设计
// api.js
export async function getUser(id) {}
export async function getOrder(id) {}
export async function sendEmail() {}
// ...
```

---

## 九、常见问题

### 9.1 如何选择模块规范？

| 场景 | 推荐方案 |
|------|----------|
| 新项目（前端） | ES6 模块 |
| 新项目（Node.js） | ES6 模块 |
| 老项目维护 | 保持原有规范 |
| 开发 npm 库 | 同时支持两种（使用构建工具） |

### 9.2 在浏览器中使用

```html
<!-- 方式1：直接使用 ES6 模块 -->
<script type="module" src="main.js"></script>

<!-- 方式2：使用 nomodule 降级 -->
<script type="module" src="main.js"></script>
<script nomodule src="main.bundle.js"></script>
```

### 9.3 CommonJS 转 ES6

```javascript
// Before (CommonJS)
const express = require('express');
const router = express.Router();

module.exports = router;

// After (ES6)
import express from 'express';
const router = express.Router();

export default router;
```
