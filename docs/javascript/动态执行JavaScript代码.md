# 动态执行 JavaScript 代码

## 目录

1. [概述](#1-概述)
2. [eval() 函数](#2-eval-函数)
3. [new Function()](#3-new-function)
4. [setTimeout/setInterval](#4-settimeoutsetinterval)
5. [动态 script 标签](#5-动态-script-标签)
6. [import() 动态导入](#6-import-动态导入)
7. [安全性对比](#7-安全性对比)
8. [最佳实践](#8-最佳实践)

---

## 1. 概述

JavaScript 提供了多种动态执行代码的方式，每种方式都有其特定的使用场景和注意事项：

```
┌─────────────────────────────────────────────────────────┐
│                  动态执行代码的方式                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  eval()           ──► 当前作用域执行，性能差，不推荐      │
│  new Function()   ──► 全局作用域，相对安全，稍好          │
│  setTimeout(str)  ──► 全局作用域，延迟执行                │
│  <script> 标签    ──► 全局作用域，可加载外部资源          │
│  import()         ──► ES6 模块，推荐方式                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. eval() 函数

### 2.1 基本语法

```js
eval(codeString)
```

- **参数**：要执行的 JavaScript 代码字符串
- **返回值**：执行代码的返回值

### 2.2 执行作用域

`eval()` 在**当前作用域**中执行代码，可以访问局部变量：

```js
let a = 10; // 全局变量

function test() {
  let a = 20; // 局部变量
  eval('console.log(a)'); // 输出 20（访问局部变量）
  eval('a = 30');          // 修改局部变量
  console.log(a);          // 30
}

test();
console.log(a); // 10（全局变量未受影响）
```

### 2.3 直接 eval 与 间接 eval

```js
// 直接 eval - 在当前作用域执行
function directEval() {
  let x = 1;
  eval('console.log(x)'); // 1
}

// 间接 eval - 在全局作用域执行
function indirectEval() {
  let x = 1;
  (0, eval)('console.log(x)'); // ReferenceError: x is not defined
  window.eval('console.log(x)'); // ReferenceError
  const e = eval; e('console.log(x)'); // ReferenceError
}
```

### 2.4 为什么不推荐使用 eval？

| 问题 | 说明 |
|------|------|
| 🔒 安全风险 | 可能执行恶意代码 |
| 🐌 性能问题 | 引擎无法优化代码 |
| 🔍 调试困难 | 代码来源不明确，错误堆栈混乱 |
| 📦 代码膨胀 | 增加打包体积 |

---

## 3. new Function()

### 3.1 基本语法

```js
new Function(arg1, arg2, ..., argN, functionBody)
```

| 参数 | 说明 |
|------|------|
| `arg1, arg2, ...` | 函数参数名（字符串） |
| `functionBody` | 函数体（字符串形式的代码） |

### 3.2 基本用法

```js
// 创建一个简单的加法函数
const add = new Function('a', 'b', 'return a + b');
console.log(add(2, 3)); // 5

// 等价于
function add(a, b) {
  return a + b;
}
```

### 3.3 执行作用域

`new Function()` 在**全局作用域**中执行，不能访问局部变量：

```js
let a = 10; // 全局变量

function test() {
  let a = 20; // 局部变量
  let func = new Function('console.log(a)');
  func(); // 输出 10（访问全局变量，局部变量不可见）
}

test();
```

### 3.4 传递参数

```js
function test() {
  let a = 20; // 局部变量

  // 通过参数传递局部变量
  let func = new Function('x', 'console.log(x)');
  func(a); // 输出 20
}

test();
```

---

## 4. setTimeout/setInterval

### 4.1 基本用法

当第一个参数是字符串时，会动态执行代码：

```js
// 字符串形式（不推荐）
setTimeout('console.log("Hello")', 1000);
setInterval('console.log("Tick")', 1000);

// 函数形式（推荐）
setTimeout(() => console.log('Hello'), 1000);
setInterval(() => console.log('Tick'), 1000);
```

### 4.2 执行作用域

字符串形式的代码在**全局作用域**执行：

```js
let a = 10; // 全局变量

function test() {
  let a = 20; // 局部变量
  setTimeout('console.log(a)', 1000); // 输出 10
}

test();
```

> ⚠️ **注意**：使用字符串形式与 `eval()` 有类似的安全和性能问题，应避免使用。

---

## 5. 动态 script 标签

### 5.1 内联脚本

```js
let a = 10; // 全局变量

function test() {
  let a = 20; // 局部变量

  const script = document.createElement('script');
  script.textContent = 'console.log(a)'; // 访问全局变量
  document.body.appendChild(script);
}

test(); // 输出 10
```

### 5.2 加载外部脚本

```js
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 使用
loadScript('https://example.com/script.js')
  .then(() => console.log('脚本加载成功'))
  .catch(() => console.error('加载失败'));
```

### 5.3 JSONP 实现

```js
function jsonp(url, callbackName) {
  return new Promise((resolve, reject) => {
    // 创建全局回调函数
    window[callbackName] = (data) => {
      delete window[callbackName];
      resolve(data);
    };

    const script = document.createElement('script');
    script.src = `${url}?callback=${callbackName}`;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// 使用
jsonp('https://example.com/api', 'handleData')
  .then(data => console.log(data));
```

---

## 6. import() 动态导入

### 6.1 基本用法

ES2020 引入的动态导入函数，返回 Promise：

```js
// 动态导入模块
const module = await import('./utils.js');
module.myFunction();

// 直接解构
const { myFunction } = await import('./utils.js');
myFunction();

// 动态导入默认导出
const MyComponent = (await import('./MyComponent.js')).default;
```

### 6.2 按需加载

```js
button.addEventListener('click', async () => {
  // 只在需要时加载
  const { heavyProcess } = await import('./heavyModule.js');
  heavyProcess();
});
```

### 6.3 条件加载

```js
if (condition) {
  const moduleA = await import('./moduleA.js');
} else {
  const moduleB = await import('./moduleB.js');
}
```

### 6.4 在 script 标签中使用

```html
<script type="module">
  const module = await import('./app.js');
</script>
```

---

## 7. 安全性对比

### 7.1 风险等级对比

| 方式 | 作用域 | 安全性 | 性能 | 推荐度 |
|------|--------|--------|------|--------|
| `eval()` | 当前 | ⚠️ 最低 | ⚠️ 最差 | ❌ 不推荐 |
| `new Function()` | 全局 | ⚡ 中等 | 🟡 一般 | ⚡ 谨慎使用 |
| `setTimeout(str)` | 全局 | ⚠️ 较低 | 🟡 一般 | ❌ 不推荐 |
| `<script>` | 全局 | ⚡ 中等 | 🟢 较好 | ⚡ 谨慎使用 |
| `import()` | 模块 | 🔒 最安全 | 🟢 较好 | ✅ 推荐 |

### 7.2 常见安全风险

#### XSS 攻击示例

```js
// ❌ 危险：用户输入直接执行
const userInput = '<script>alert("XSS")</script>';
eval(userInput); // 执行恶意代码

// ❌ 危险：new Function 也不能免疫
new Function(userInput)();

// ✅ 安全：使用 import() 或避免动态执行
```

#### 防护措施

```js
// 1. 输入验证
function sanitizeInput(str) {
  // 只允许特定字符
  return /^[a-zA-Z0-9]+$/.test(str);
}

// 2. 使用沙箱环境（如 Web Worker）
const worker = new Worker('worker.js');
worker.postMessage(codeToExecute);

// 3. 使用专门的解析库
import { parse } from 'some-parser-lib';
```

---

## 8. 最佳实践

### 8.1 优先级选择

```
┌─────────────────────────────────────────────────────┐
│              动态执行代码选择指南                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1️⃣ 需要加载模块？                                   │
│     └─► 使用 import() ✅                            │
│                                                     │
│  2️⃣ 需要从服务器加载脚本？                           │
│     └─► 使用动态 <script> 标签 ✅                   │
│                                                     │
│  3️⃣ 需要动态创建函数？                               │
│     └─► 使用 new Function() ⚡                      │
│                                                     │
│  4️⃣ 其他情况                                         │
│     └─► 重新设计代码结构，避免动态执行 🔄            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 8.2 使用建议

#### ✅ 推荐做法

```js
// 1. 使用 import() 按需加载
const module = await import('./feature.js');

// 2. 使用 new Function 创建可配置函数
const formula = new Function('x', 'return ' + userFormula);
console.log(formula(5));

// 3. 使用动态 script 标签加载第三方库
loadScript('https://cdn.example.com/library.js');
```

#### ❌ 避免做法

```js
// 1. 避免使用 eval
eval(userInput); // 危险！

// 2. 避免字符串形式的 setTimeout
setTimeout(userCode, 1000); // 危险！

// 3. 避免直接拼接用户输入到代码中
new Function('return ' + userInput); // 危险！
```

### 8.3 性能优化

```js
// ❌ 低效：重复创建函数
for (let i = 0; i < 1000; i++) {
  new Function('x', 'return x * 2')(i);
}

// ✅ 高效：创建一次，重复使用
const double = new Function('x', 'return x * 2');
for (let i = 0; i < 1000; i++) {
  double(i);
}
```

### 8.4 调试技巧

```js
// 为动态代码添加 source map 以便调试
const fn = new Function('x', `
  //# sourceURL=myDynamicFunction.js
  return x * 2;
`);

// 在开发者工具中会显示为 myDynamicFunction.js
```

---

## 9. 快速参考

```js
// === eval（不推荐）===
eval('console.log("Hello")'); // 当前作用域

// === new Function ===
new Function('a', 'b', 'return a + b')(1, 2); // 3，全局作用域

// === setTimeout/setInterval ===
setTimeout('console.log(1)', 1000); // 全局作用域，不推荐
setTimeout(() => console.log(1), 1000); // 推荐

// === 动态 script ===
const script = document.createElement('script');
script.src = 'url';
document.head.appendChild(script);

// === import() ===
const module = await import('./module.js');
const { fn } = await import('./module.js');
```

---

## 10. 总结

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 动态加载模块 | `import()` | 标准、安全、支持 tree-shaking |
| 加载第三方库 | 动态 `<script>` | 兼容性好、支持跨域 |
| 动态创建函数 | `new Function()` | 作用域隔离、相对安全 |
| 其他 | 重新设计 | 避免安全和性能问题 |

> 💡 **核心原则**：尽量避免动态执行代码。如果必须使用，优先选择 `import()` 或 `new Function()`，永远不要使用 `eval()` 和字符串形式的定时器。
