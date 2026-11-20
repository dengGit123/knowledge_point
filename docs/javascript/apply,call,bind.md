# call、apply、bind

`call()`、`apply()`、`bind()` 是定义在 `Function.prototype` 上的三个方法，共同作用只有一个：**手动指定函数运行时的 `this` 指向**。三者的区别在于调用时机、传参方式和返回值。

> 📖 [MDN — Function.prototype.call()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
>
> 📖 [MDN — Function.prototype.apply()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
>
> 📖 [MDN — Function.prototype.bind()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
>
> 📖 [ECMAScript 规范 — Function Objects](https://tc39.es/ecma262/#sec-function-objects)

## 对比速览

| 方法 | 是否立即执行 | 返回值 | 传参方式 | `this` 绑定有效期 | 一句话定位 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `call()` | ✅ 立即执行 | 原函数的执行结果 | 参数逐个列出 | 仅本次调用 | 指定 `this` 后"用一次" |
| `apply()` | ✅ 立即执行 | 原函数的执行结果 | 数组 / 类数组对象 | 仅本次调用 | 把数组展开成参数再调用 |
| `bind()` | ❌ 不执行 | 绑定好的**新函数** | 参数逐个列出，可预置 | 永久 | 复制一份 `this` 已固定的函数 |

一个类比：`call` / `apply` 像"借"——当场借来用一次，用完就还；`bind` 像"复制"——复制出一个 `this` 已经焊死的函数，之后随便用多少次。

> 💡 **兼容性：** `call()` 和 `apply()` 是 ES3（1999）规范就纳入的老牌方法；`bind()` 是 ES5（2009）新增。所有现代浏览器和 Node.js 均支持，无需关心兼容问题。

---

## 核心原理：this 为什么会"丢"

三者存在的意义，源于 `this` 的动态绑定规则。MDN 明确指出：**`this` 的值取决于函数被调用的方式**，而不是函数定义在哪里。常规规则是"谁调用，`this` 就指向谁"——即 `obj.fn()` 里 `this` 是 `obj`。

问题出在：JavaScript 的函数是"值"，可以被赋给变量、作为参数传递。一旦函数离开了它原来的对象再被调用，"宿主"信息就丢了：

```javascript
const user = {
  nickname: '张三',
  sayHi() {
    console.log(`你好，我是 ${this.nickname}`)
  },
}

user.sayHi() // 你好，我是 张三：通过 user 调用，this === user

const fn = user.sayHi // 赋值给变量后，与 user 的关联断裂
fn() // 你好，我是 undefined：非严格模式 this 指向 globalThis，其上没有 nickname
```

回调场景最常见——把方法交给 `setTimeout`、事件监听、`map` 等去调用时，`this` 几乎必然丢失。`call()`、`apply()`、`bind()` 就是用来人工把 `this` "接回去"的三件工具。

---

## call()

`call()` 的作用：**指定 `this` 并立即调用函数，参数逐个传入**。

```javascript
call(thisArg)
call(thisArg, arg1, /* …, */ argN)
```

| 参数 | 说明 |
| :--- | :--- |
| `thisArg` | 调用时使用的 `this` 值；非严格模式下 `null`/`undefined` 会被替换为全局对象，原始值会被包装成对象 |
| `arg1, …, argN` | 可选。传给函数的实参，从第二个参数起逐个列出 |

返回值：函数的执行结果。

### 1. 指定 this 并传参

```javascript
function introduce(city, hobby) {
  console.log(`我是 ${this.name}，住在 ${city}，爱好${hobby}`)
}

introduce.call({ name: '张三' }, '北京', '跑步')
// 我是 张三，住在北京，爱好跑步
```

### 2. 不传 thisArg 时的行为

第一个参数省略时默认是 `undefined`，其表现依赖**严格模式**：

```javascript
function checkThis() {
  console.log(this)
}

// 非严格模式（默认）
checkThis.call()     // globalThis：undefined 被替换为全局对象（浏览器中是 window）
checkThis.call(null) // globalThis：null 同样被替换
checkThis.call(123)  // Number {123}：原始值被包装成对应类型的对象

// 严格模式：this 原样传入，不做任何替换
function strictCheckThis() {
  'use strict'
  console.log(this)
}

strictCheckThis.call()     // undefined
strictCheckThis.call(123)  // 123（不再是包装对象）
```

### 3. 借用构造函数复用初始化逻辑

在一个构造函数内部，用 `call()` 借用另一个构造函数的初始化逻辑：

```javascript
function Product(name, price) {
  this.name = name
  this.price = price
}

function Food(name, price) {
  // 借用 Product 的逻辑，把属性写到 Food 的实例上
  Product.call(this, name, price)
  this.category = 'food'
}

const food = new Food('奶酪', 5)
console.log(food.name, food.price, food.category) // 奶酪 5 food
```

> ⚠️ **注意：** MDN 明确警告不要用 `call()` / `apply()` 去"串联构造函数"实现继承——此时函数是作为普通函数被调用的，`new.target` 为 `undefined`；若被借用的构造函数是 `class`，会直接抛出 `TypeError`。上面的写法仅适用于普通函数形式的初始化复用；实现类继承请使用 `extends` 或 `Reflect.construct()`。

---

## apply()

`apply()` 与 `call()` 几乎完全相同，唯一区别：**参数以数组（或类数组对象）一次性传入**。

```javascript
apply(thisArg)
apply(thisArg, argsArray)
```

| 参数 | 说明 |
| :--- | :--- |
| `thisArg` | 同 `call()` 的 `thisArg` |
| `argsArray` | 可选。数组或类数组对象（须有 `length` 属性和对应数字下标）；传 `null` 或 `undefined` 表示无参数 |

返回值：函数的执行结果。

### 1. 展开数组传参

经典场景：`Math.max()` 不接受数组，用 `apply()` 把数组展开成参数列表：

```javascript
const numbers = [5, 6, 2, 3, 7]

const max = Math.max.apply(null, numbers) // 等价于 Math.max(5, 6, 2, 3, 7)
console.log(max) // 7
```

同理可以把一个数组的元素"展开"追加到另一个数组（`concat` 不修改原数组，而这样是原地追加）：

```javascript
const array = ['a', 'b']
const elements = [0, 1, 2]

array.push.apply(array, elements) // 等价于 array.push(0, 1, 2)
console.log(array) // ['a', 'b', 0, 1, 2]
```

### 2. 类数组对象也能当参数列表

`argsArray` 不要求是真数组，只要有 `length` 和数字下标即可，例如 `arguments`、`NodeList`、自定义对象：

```javascript
const args = { length: 2, 0: 'eat', 1: 'bananas' }
console.log(...args) // ❌ 普通展开语法要求可迭代对象，这里会报错

function test(a, b) {
  console.log(a, b)
}
test.apply(null, args) // ✅ apply 接受类数组：eat bananas
```

> 💡 **ES6 之后更推荐展开语法：** `fn.apply(null, args)` 等价于 `fn(...args)`。区别在于前者接受类数组对象，后者要求可迭代对象。日常遇到真数组时，`fn(...args)` 更直观。另外 ES6 还提供了 `Reflect.apply(fn, thisArg, argsArray)`，功能与 `apply()` 类似。

### 3. 参数数量有上限

用 `apply()`（或展开语法）传入数万级的参数列表有风险：**超出引擎参数长度上限时行为未在规范中定义**——大多数引擎直接抛异常，例如 JavaScriptCore 硬编码的上限是 65536。数组可能很大时应分块处理：

```javascript
const QUANTUM = 32768 // 每块最多 3 万多个参数

function maxOfArray(arr) {
  let max = -Infinity
  for (let i = 0; i < arr.length; i += QUANTUM) {
    const subMax = Math.max.apply(null, arr.slice(i, i + QUANTUM))
    max = Math.max(subMax, max)
  }
  return max
}
```

---

## bind()

`bind()` 的作用：**创建并返回一个绑定了固定 `this` 的新函数**——原函数不会被调用。这是它与 `call()` / `apply()` 最本质的区别。

```javascript
bind(thisArg)
bind(thisArg, arg1, /* …, */ argN)
```

| 参数 | 说明 |
| :--- | :--- |
| `thisArg` | 新函数被调用时使用的 `this`；用 `new` 调用绑定函数时该值被忽略 |
| `arg1, …, argN` | 可选。预置参数，会排在调用时传入的实参之前 |

返回值：一个新函数（称为"绑定函数"），调用它才会执行原函数。

> ⚠️ **注意：** `bind()` 只负责返回新函数，**不会执行**。"绑定了怎么没反应"多半是忘了调用返回的那个新函数。

### 1. 修复回调中的 this

```javascript
const module = {
  x: 81,
  getX() {
    return this.x
  },
}

console.log(module.getX()) // 81

const retrieveX = module.getX // 方法被提取出来，this 丢失
console.log(retrieveX()) // undefined：非严格模式 this 指向 globalThis，其上没有 x

const boundGetX = retrieveX.bind(module) // 把 this 焊回 module
console.log(boundGetX()) // 81
```

> 💡 严格模式下，上面 `retrieveX()` 的 `this` 是 `undefined`，读取 `this.x` 会直接报错。

### 2. 预置参数（偏函数）

偏函数（Partial Application）指**固定函数的部分参数，生成一个参数更少的新函数**。`bind()` 从第二个参数起就是预置参数：

```javascript
function addArguments(arg1, arg2) {
  return arg1 + arg2
}

// 第一个参数 thisArg 传 null：addArguments 内部不使用 this，绑定给谁都无所谓
const addThirtySeven = addArguments.bind(null, 37)

console.log(addThirtySeven(5))     // 42（37 + 5）
console.log(addThirtySeven(5, 10)) // 42（目标函数只吃两个参数，多余的 10 被忽略）
```

### 3. 定时器、事件监听中保持实例

`setTimeout` 的回调默认 `this` 是 `globalThis`，类方法作为回调传入前需要绑定：

```javascript
class LateBloomer {
  constructor() {
    this.petalCount = Math.floor(Math.random() * 12) + 1
  }

  bloom() {
    setTimeout(this.declare.bind(this), 1000) // 绑定后 this 指向实例
  }

  declare() {
    console.log(`我是一朵有 ${this.petalCount} 片花瓣的花！`)
  }
}

const flower = new LateBloomer()
flower.bloom() // 1 秒后正确打印 petalCount
```

用箭头函数 `setTimeout(() => this.declare(), 1000)` 效果相同（箭头函数没有自己的 `this`，天然继承外层作用域）。

### 4. 二次 bind 与参数累积

对绑定函数再次 `bind()` 时，**新的 `thisArg` 会被忽略**（`this` 只能绑定一次），但预置参数会按顺序累积：

```javascript
function log(...args) {
  'use strict'
  console.log(this, ...args)
}

const boundLog = log.bind('this value', 1, 2)
const boundLog2 = boundLog.bind('new this value', 3, 4)

boundLog2(5, 6) // 'this value' 1 2 3 4 5 6
```

最终结果：`this` 是第一次绑定的 `'this value'`；参数依次为第一次预置的 `1, 2`、第二次预置的 `3, 4`、调用时传入的 `5, 6`。

### 5. bind 与 new 的关系

绑定函数可以用 `new` 调用，此时绑定的 `this` 被忽略（构造过程会自建 `this`），预置参数照常前置，`instanceof` 表现如常：

```javascript
function Point(x, y) {
  this.x = x
  this.y = y
}

Point.prototype.toString = function () {
  return `${this.x},${this.y}`
}

const p = new Point(1, 2)
p.toString() // '1,2'

// thisArg 传什么都无所谓，new 时会被忽略
const YAxisPoint = Point.bind(null, 0) // 预置 x = 0

const axisPoint = new YAxisPoint(5)
axisPoint.toString() // '0,5'

console.log(axisPoint instanceof Point)      // true
console.log(axisPoint instanceof YAxisPoint) // true
```

但要注意绑定函数**没有 `prototype` 属性**，因此不能作为 `extends` 的父类：

```javascript
class Derived extends class {}.bind(null) {}
// TypeError: Class extends value does not have valid prototype property undefined
```

对类使用 `bind()` 还会丢失**自有静态属性**（原型链上继承来的静态属性仍可访问）：

```javascript
class Base {
  static baseProp = 'base'
}

class Derived extends Base {
  static derivedProp = 'derived'
}

const BoundDerived = Derived.bind(null)
console.log(BoundDerived.baseProp)    // 'base'（继承来的仍在）
console.log(BoundDerived.derivedProp) // undefined（自有静态属性丢失）
console.log(new BoundDerived() instanceof Derived) // true
```

### 6. 绑定函数的 name 与 length

| 属性 | 规则 | 示例 |
| :--- | :--- | :--- |
| `name` | 目标函数名加 `"bound "` 前缀 | `fn.bind(null).name` → `"bound fn"` |
| `length` | 目标函数形参个数 − 已预置参数个数（下限 0，不含 `thisArg`） | 见下方代码 |

```javascript
function fn(a, b, c) {}

console.log(fn.bind(null).length)    // 3（未预置参数）
console.log(fn.bind(null, 1).length) // 2（预置了 1 个参数）
```

---

## 手写实现

面试高频考点。核心思路一句话：**用 `Symbol` 作为临时属性名把函数挂到目标对象上执行**（`call` / `apply`），`bind` 则用闭包加中转原型实现并兼容 `new`。

```javascript
// myCall：把函数临时挂到 thisArg 上，以 thisArg 的身份调用，用完即删
Function.prototype.myCall = function (thisArg, ...args) {
  thisArg = thisArg != null ? Object(thisArg) : globalThis
  const key = Symbol('fn') // Symbol 保证不会覆盖对象上同名属性
  thisArg[key] = this
  const result = thisArg[key](...args)
  delete thisArg[key]
  return result
}

// myApply：与 myCall 相同，只是参数来自数组 / 类数组
Function.prototype.myApply = function (thisArg, argsArray) {
  thisArg = thisArg != null ? Object(thisArg) : globalThis
  const key = Symbol('fn')
  thisArg[key] = this
  // Array.from 兼容类数组对象；展开语法只接受可迭代对象，所以先转换
  const args = argsArray ? Array.from(argsArray) : []
  const result = thisArg[key](...args)
  delete thisArg[key]
  return result
}

// myBind：返回闭包；new 调用时忽略 thisArg
Function.prototype.myBind = function (thisArg, ...boundArgs) {
  const target = this

  function bound(...args) {
    // new bound() 时，this 是新实例（原型链上有 bound.prototype），
    // 此时应忽略 thisArg，让构造流程自建 this
    return target.apply(this instanceof bound ? this : thisArg, boundArgs.concat(args))
  }

  // 让 bound 的实例能访问目标函数原型上的方法
  if (target.prototype) {
    bound.prototype = Object.create(target.prototype)
  }
  return bound
}
```

> 💡 这是简化实现，仅覆盖核心行为。与原生方法的差异：原生的 `call()` / `apply()` 还处理了严格模式下 `this` 原样传入、对象不可扩展等边界；原生的 `bind()` 返回的函数**没有** `prototype` 属性，且 `name` 带 `"bound "` 前缀。

---

## 实际应用场景

以下四个场景在实际项目与面试中出现频率最高，覆盖了三者的典型用法。

### 1. 精确判断数据类型

`typeof` 无法区分 `null` 与对象、数组与普通对象，借用 `Object.prototype.toString` 才能精确判断：

```javascript
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

console.log(getType([]))         // 'array'
console.log(getType(null))       // 'null'
console.log(getType(new Date())) // 'date'
console.log(getType(/a/))        // 'regexp'
```

这里用 `call()` 是因为 `toString` 定义在 `Object.prototype` 上，需要以任意值为 `this` 来调用它。

### 2. 类数组对象转真数组

`arguments`、`NodeList` 等类数组对象没有数组方法，借用数组的 `slice` 即可转换：

```javascript
const arrayLike = { 0: 'a', 1: 'b', length: 2 }

const arr = Array.prototype.slice.call(arrayLike)
console.log(arr) // ['a', 'b']
```

### 3. 定时器与事件监听中保住 this

把实例方法直接交给 `setInterval` / `addEventListener` 时 `this` 必丢，在构造函数里统一绑定一次即可：

```javascript
class Counter {
  count = 0

  constructor() {
    // 提前绑定，之后无论怎么传递，this 都指向实例
    this.handleTick = this.handleTick.bind(this)
  }

  handleTick() {
    this.count++
    console.log(this.count)
  }
}

const timer = new Counter()
setInterval(timer.handleTick, 1000) // 每秒打印 1、2、3……
```

### 4. 预置参数生成小工具函数

用 `bind()` 固定部分参数，批量生成语义化的函数变体：

```javascript
function request(method, url, data) {
  console.log(`${method} ${url}`, data)
}

const get = request.bind(null, 'GET')
const post = request.bind(null, 'POST')

get('/api/users')                    // GET /api/users undefined
post('/api/users', { name: '张三' }) // POST /api/users { name: '张三' }
```

---

## 注意事项与总结

注意事项均为前文结论的一句话回顾：

1. **执行时机不同**：`call()` / `apply()` 立即执行并返回结果；`bind()` 只返回新函数，不执行。
2. **箭头函数对三者免疫**：箭头函数没有自己的 `this`，`call()` / `apply()` / `bind()` 无法改变它的 `this`（第一个参数被忽略），但参数仍会正常传递。
3. **`thisArg` 有转换规则**：非严格模式下 `null`/`undefined` 被替换为全局对象、原始值被包装成对象；严格模式下原样传入。
4. **`this` 只能绑定一次**：对绑定函数再次 `bind()` / `call()` 都无法覆盖 `this`，预置参数则按顺序累积。
5. **`bind()` 每次都返回新函数**：解绑事件监听（`removeEventListener`）或做函数比较时，必须保存同一份引用，否则解绑无效。
6. **两个继承相关的坑**：不要用 `call()` / `apply()` 实现继承链（`new.target` 为 `undefined`，`class` 直接抛错）；绑定函数没有 `prototype` 属性，不能被 `extends`。

选择建议速查：

| 需求 | 用哪个 |
| :--- | :--- |
| 立即调用并指定 `this`，参数已知且固定 | `call()` |
| 立即调用，参数来自数组 / 类数组 | `apply()` |
| 多次调用、固定 `this`、预置参数 | `bind()` |
| ES6+ 展开真数组传参 | 优先 `fn(...args)` |
