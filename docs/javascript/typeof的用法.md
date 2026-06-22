### typeof 运算符
* `typeof` 是一个**一元运算符**，放在操作数前面，返回该操作数的**数据类型**（小写字符串）
* 语法：`typeof 操作数` 或 `typeof(操作数)`
* 作用：判断数据的**基本类型**，是 JavaScript 中最常用的类型判断方式

```js
typeof 'abc'        // 'string'
typeof 123          // 'number'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof function(){} // 'function'
typeof null         // 'object'   ⚠️ 历史遗留的 bug
typeof {}           // 'object'
typeof []           // 'object'   ⚠️ 无法区分数组
```

---

### typeof 的返回值（共 8 种）

| 返回值 | 对应类型 | 示例 |
|:---|:---|:---|
| `'string'` | 字符串 | `typeof 'abc'` |
| `'number'` | 数字（含 `NaN`、`Infinity`） | `typeof 123`、`typeof NaN` |
| `'boolean'` | 布尔 | `typeof true` |
| `'undefined'` | 未定义 / 未声明 | `typeof undefined` |
| `'bigint'` | 大整数（ES2020） | `typeof 10n` |
| `'symbol'` | Symbol（ES6） | `typeof Symbol()` |
| `'function'` | 函数 | `typeof function(){}`、`typeof Array` |
| `'object'` | 对象 / 数组 / null / 正则 / 包装对象… | `typeof {}`、`typeof []`、`typeof null` |

> 💡 除以上 8 种外，**任何值**的 `typeof` 结果都落在这 8 种之内。

---

### typeof 的独特优势：判断变量是否声明（不报错）

* `typeof` 对**未声明的变量**也返回 `'undefined'`，**不会抛出 ReferenceError**
* 这是其他判断方式（如直接 `=== undefined`）做不到的，常用于运行环境/特性检测

```js
// 直接访问未声明变量 → 报错
console.log(a)          // ❌ ReferenceError: a is not defined

// 用 typeof 判断 → 安全，不报错
if (typeof a === 'undefined') {
  console.log('a 未声明或值为 undefined')
}

// 常见场景：检测某个全局 API 是否存在
if (typeof Promise !== 'undefined') {
  // 当前环境支持 Promise
}
```

---

### typeof 的常见坑（重点）

#### 1. `typeof null === 'object'`（最经典）
* 这是 JavaScript 早期实现遗留的 bug
* 原因：JS 最初用值的低位标签区分类型，`null` 的低位是 `000`，与对象标签相同（详见底层原理）
```js
typeof null        // 'object'   ❌（null 实际不是对象）
null instanceof Object  // false（可用来辅助区分）
```

#### 2. `typeof` 无法区分具体的引用类型
* 数组、普通对象、正则、Date 等统统返回 `'object'`
```js
typeof []            // 'object'
typeof {}            // 'object'
typeof new Date()    // 'object'
typeof /abc/         // 'object'
```

#### 3. `typeof NaN === 'number'`
* `NaN` 虽然表示"非数字"，但它本质上属于 number 类型
```js
typeof NaN           // 'number'
// 判断 NaN 要用 isNaN() 或 Number.isNaN()
```

#### 4. 包装对象 vs 基本类型字面量
```js
typeof 'abc'             // 'string'   （字面量）
typeof new String('abc') // 'object'   （包装对象）⚠️ 不推荐用 new
```

---

### typeof 的使用场景

#### 1. 判断基本类型
```js
function check(value) {
  if (typeof value === 'string') return '字符串'
  if (typeof value === 'number') return '数字'
  if (typeof value === 'boolean') return '布尔'
}
```

#### 2. 判断是否为函数
```js
if (typeof callback === 'function') {
  callback()  // 安全调用，避免传入非函数报错
}
```

#### 3. 安全检测变量/特性是否存在（不报错）
```js
if (typeof window !== 'undefined') {
  // 浏览器环境
}
if (typeof module !== 'undefined') {
  // CommonJS 环境
}
```

---

### typeof vs instanceof

| 特性 | `typeof` | `instanceof` |
|:---|:---|:---|
| 作用 | 判断**数据类型**（基本类型） | 判断**对象与构造函数**的关系 |
| 返回值 | 类型字符串 | 布尔值 |
| 基本类型 | ✅ 准确 | ❌ 字面量全返回 false |
| 具体引用类型（Array/Date…） | ❌ 只能返回 `'object'` | ✅ 能精确区分 |
| `null` | `typeof null === 'object'`（坑） | `null instanceof X` → false |
| 未声明变量 | ✅ 返回 `'undefined'`，不报错 | ❌ 直接报 ReferenceError |
| 原理 | 根据值的底层类型标签 | 沿原型链查找 |
| 详见 | 本文档 | [instanceof的用法](./instanceof的用法.md) |

```js
typeof []            // 'object'   （无法区分数组）
[] instanceof Array  // true       （能精确区分，见 instanceof 文档）
```

---

### 精确判断类型的方法（弥补 typeof 的不足）

#### 1. 判断数组：`Array.isArray()`
```js
Array.isArray([])        // true
Array.isArray({})        // false
```

#### 2. 万能方法：`Object.prototype.toString.call()`
* 返回 `[object 类型]` 格式的字符串，能精确区分所有类型
```js
Object.prototype.toString.call([])         // '[object Array]'
Object.prototype.toString.call(null)        // '[object Null]'
Object.prototype.toString.call(new Date())  // '[object Date]'
Object.prototype.toString.call(/abc/)       // '[object RegExp]'

// 封装一个通用类型判断函数
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}
getType([])       // 'array'
getType(null)     // 'null'
getType('abc')    // 'string'
```

---

### 底层原理：为什么 `typeof null === 'object'`

* JavaScript 最初（1995 年）的实现中，变量的值在底层用**低位标签（type tag）**区分类型：
  * 对象的低位标签是 `000`
  * `null` 在内存中被表示为空指针（全 0），低位也是 `000`
* 因此 `typeof` 检测到 `null` 的低位标签是 `000`，就误判为 `object`
* 这是公认的 bug，但为了**向后兼容**，至今未修复（修复会导致大量旧代码出错）

> 💡 这也解释了为什么 ES6 新增类型时，`typeof` 专门为 `symbol` 和 `bigint` 加了新的返回值，却无法修正 `null`。

---

### 总结
* `typeof` 用于判断**基本类型**（返回小写类型字符串，共 8 种），是安全、常用的类型检测方式
* ⚠️ 三大坑：`typeof null === 'object'`、无法区分数组等引用类型、`typeof NaN === 'number'`
* ✅ 独特优势：对**未声明变量**返回 `'undefined'` 不报错，适合做特性检测
* 精确判断引用类型请用：`instanceof`（见 [instanceof的用法](./instanceof的用法.md)）、`Array.isArray()`、`Object.prototype.toString.call()`
* `typeof null` 返回 `object` 是历史 bug，源于早期的低位类型标签实现
