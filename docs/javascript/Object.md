# Object 对象

## 一、概述

`Object` 是 JavaScript 中最重要的内置构造函数，也是所有对象的"根基"。在 JavaScript 里，**几乎所有值都是对象**（或能被"包装"成对象）——数组、函数、正则、日期都是对象；就连 `null` 之外的基本类型（字符串、数字、布尔）在调用方法时也会被临时包装成对象。

广义上的 `Object` 包含两层含义：

- **`Object` 构造函数 / 全局对象**：提供了一批**静态方法**（如 `Object.keys()`、`Object.assign()`、`Object.freeze()`），用于创建、复制、冻结、检测对象。
- **`Object.prototype`**：所有普通对象的原型，提供了一批**实例方法**（如 `hasOwnProperty()`、`toString()`），每个对象都能通过原型链访问到它们。

> 📖 [MDN 官方文档 — Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
>
> 📖 [ECMAScript 规范 — The Object Constructor](https://tc39.es/ecma262/#sec-object-constructor)

---

## 二、创建对象的方式

### 1. 对象字面量（最常用）

```js
// 字面量：直接写出键值对
const user = {
  name: 'Alice',
  age: 25,
  sayHi() {           // 方法简写，等价于 sayHi: function () {...}
    console.log('Hi')
  }
}
```

### 2. `new Object()`

```js
const obj = new Object()   // 等同于 const obj = {}
obj.name = 'Bob'
```

> 💡 **提示：** 几乎不会手写 `new Object()`，字面量更简洁，且字面量不会受到 `Object` 被重写的影响。

### 3. 构造函数 + `new`

```js
function Person(name) {
  this.name = name
}
Person.prototype.sayHi = function () {
  console.log('Hi, ' + this.name)
}
const p = new Person('Carol')   // this 指向新对象，原型指向 Person.prototype
```

### 4. `Object.create()`

指定原型来创建对象，常用于纯原型式继承。详见 [Object.create 方法](./Object.create方法.md)。

```js
const proto = { greet() { return 'hello' } }
const obj = Object.create(proto)   // obj.__proto__ === proto
```

### 5. 类（`class`，ES6 语法糖）

`class` 本质是构造函数 + 原型方法的语法糖。

```js
class Animal {
  constructor(name) { this.name = name }
  speak() { return `${this.name} makes a sound` }
}
const dog = new Animal('Rex')
```

---

## 三、属性描述符（理解 Object 方法的核心前置知识）

`Object` 的很多方法（`defineProperty`、`getOwnPropertyDescriptor`、`freeze` 等）都建立在**属性描述符**（Property Descriptor）概念之上。

每个对象属性除了"值"，还带有 4 个特性（attribute），分成两类描述符：

### 1. 数据描述符（Data Descriptor）

| 特性 | 默认值（字面量） | 默认值（`defineProperty`） | 说明 |
|------|:---:|:---:|------|
| `value` | 该值 | `undefined` | 属性的值 |
| `writable` | `true` | `false` | 是否可被赋值运算符修改 |
| `enumerable` | `true` | `false` | 是否可被 `for...in` / `Object.keys` 枚举 |
| `configurable` | `true` | `false` | 是否可被删除、是否可重新配置（改为存取描述符等） |

### 2. 存取描述符（Accessor Descriptor）

| 特性 | 说明 |
|------|------|
| `get` | 读取属性时调用的函数 |
| `set` | 设置属性时调用的函数 |
| `enumerable` | 同上 |
| `configurable` | 同上 |

> ⚠️ **注意：** 一个属性要么是数据描述符（有 `value`/`writable`），要么是存取描述符（有 `get`/`set`），不能两类混用。

```js
// 存取描述符示例：实现一个"永远不能小于 0"的 age
const person = {}
Object.defineProperty(person, 'age', {
  get() { return this._age },                  // 读取时返回内部值
  set(v) { this._age = v < 0 ? 0 : v },        // 写入时做校验
  enumerable: true,
  configurable: true
})
person.age = -5
console.log(person.age)   // 0
```

查看一个属性的描述符：

```js
const obj = { name: 'Alice' }
const desc = Object.getOwnPropertyDescriptor(obj, 'name')
// { value: 'Alice', writable: true, enumerable: true, configurable: true }
```

---

## 四、Object 静态方法全览

> 💡 **提示：** 静态方法是直接挂在 `Object` 上的方法（`Object.xxx()`），调用时不需要对象实例。

### 方法分类速查表

| 分类 | 方法 | 一句话说明 |
|------|------|------|
| **创建** | `Object.create()` | 指定原型创建新对象 |
| | `Object.assign()` | 浅合并多个对象到目标对象 |
| | `Object.fromEntries()` | 键值对列表 → 对象 |
| **获取属性** | `Object.keys()` | 所有可枚举自有属性的**键**数组 |
| | `Object.values()` | 所有可枚举自有属性的**值**数组 |
| | `Object.entries()` | 所有可枚举自有属性的 **[键, 值]** 数组 |
| | `Object.getOwnPropertyNames()` | 所有自有字符串属性（含不可枚举） |
| | `Object.getOwnPropertySymbols()` | 所有自有 Symbol 属性 |
| | `Object.getOwnPropertyDescriptor()` | 某属性的描述符 |
| | `Object.getOwnPropertyDescriptors()` | 所有属性的描述符 |
| **定义/控制属性** | `Object.defineProperty()` | 定义/修改一个属性及其描述符 |
| | `Object.defineProperties()` | 批量定义多个属性 |
| | `Object.preventExtensions()` | 禁止添加新属性 |
| | `Object.seal()` | 封印：禁止增删属性（值可改） |
| | `Object.freeze()` | 冻结：禁止增删改属性 |
| **状态检测** | `Object.isExtensible()` | 是否可扩展 |
| | `Object.isSealed()` | 是否被封印 |
| | `Object.isFrozen()` | 是否被冻结 |
| **判断/比较** | `Object.is()` | 判断两个值是否"绝对相等" |
| | `Object.hasOwn()` | 是否拥有（自有）某属性 |
| **原型操作** | `Object.getPrototypeOf()` | 获取对象原型 |
| | `Object.setPrototypeOf()` | 设置对象原型 |
| **分组（ES2024）** | `Object.groupBy()` | 按条件分组，返回普通对象 |

---

## 五、创建与合并类方法

### 1. Object.create(proto, propertiesObject)

以指定对象为原型创建新对象，可同时用属性描述符定义属性。

```js
// 原型继承
const animal = { type: 'mammal', breathe() { return '呼吸' } }
const dog = Object.create(animal)
dog.name = 'Rex'
console.log(dog.breathe())   // '呼吸'（来自原型）
console.log(dog.type)        // 'mammal'（来自原型）

// 传入属性描述符（注意：此时 enumerable/writable/configurable 默认为 false）
const obj = Object.create(Object.prototype, {
  name: { value: 'Alice', enumerable: true }   // 其他特性默认 false
})

// 创建"纯净对象"（无原型，适合做字典/哈希表）
const dict = Object.create(null)
```

> 📖 详见 [Object.create 方法](./Object.create方法.md)

### 2. Object.assign(target, ...sources)

将所有**可枚举的自有属性**从源对象复制到目标对象，返回目标对象。**浅拷贝**。

```js
const target = { a: 1, b: 2 }
const source = { b: 4, c: 5 }
const result = Object.assign(target, source)
console.log(result)   // { a: 1, b: 4, c: 5 }（同名属性 b 被覆盖）
console.log(target)   // { a: 1, b: 4, c: 5 }（目标对象本身被修改）

// 合并多个对象到一个新对象（常见用法）
const merged = Object.assign({}, { a: 1 }, { b: 2 })   // { a: 1, b: 2 }

// 浅拷贝：嵌套对象仍是引用
const original = { info: { age: 20 } }
const copy = Object.assign({}, original)
copy.info.age = 99
console.log(original.info.age)   // 99 ⚠️ 原对象也被改了
```

> ⚠️ **注意：** `Object.assign` 不会拷贝**继承属性**和**不可枚举属性**，也不会拷贝 Symbol 属性以外的存取描述符（getter 会触发，结果是值而非访问器）。

> 📖 详见 [Object.assign 方法](./Object.assign方法.md)

### 3. Object.fromEntries(iterable)  —— ES2019

`Object.entries()` 的逆操作：把 `[key, value]` 列表转成对象。

```js
// 数组 → 对象
const entries = [['name', 'Alice'], ['age', 25]]
const obj = Object.fromEntries(entries)   // { name: 'Alice', age: 25 }

// 配合 Map：Map → Object
const map = new Map([['x', 1], ['y', 2]])
const objFromMap = Object.fromEntries(map)   // { x: 1, y: 2 }

// 过滤并转换（配合 entries 做对象的 map/filter）
const prices = { apple: 3, banana: 6, cherry: 9 }
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
)   // { apple: 6, banana: 12, cherry: 18 }
```

---

## 六、遍历与获取属性类方法

### 1. Object.keys() / values() / entries()

这三个是日常最常用的遍历方法，**只返回可枚举的自有（own）字符串属性**，并遵循统一的遍历顺序。

```js
const obj = { a: 1, b: 2, c: 3 }

Object.keys(obj)      // ['a', 'b', 'c']    —— 键
Object.values(obj)    // [1, 2, 3]          —— 值
Object.entries(obj)   // [['a',1], ['b',2], ['c',3]] —— 键值对
```

**遍历顺序规则**（三者一致）：

1. **整数索引键**（如 `'0'`、`'1'`）按数值升序；
2. **字符串键**（非整数）按添加顺序；
3. **Symbol 键**会被忽略（这三个方法不返回 Symbol）。

```js
const obj = { 2: 'b', 1: 'a', 0: 'c' }
Object.keys(obj)   // ['0', '1', '2']（整数键升序，而非添加顺序）
```

> 📖 [MDN — Object.keys()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

### 2. Object.getOwnPropertyNames() 与 Object.getOwnPropertySymbols()

```js
const obj = {}
Object.defineProperty(obj, 'hidden', { value: 'x', enumerable: false })  // 不可枚举
obj[Symbol('s')] = 'symbol value'
obj.visible = 1

Object.keys(obj)                       // ['visible']（只含可枚举）
Object.getOwnPropertyNames(obj)        // ['visible', 'hidden']（含不可枚举的字符串键）
Object.getOwnPropertySymbols(obj)      // [Symbol(s)]（所有 Symbol 键）
```

| 方法 | 含继承 | 含不可枚举 | 含 Symbol |
|------|:---:|:---:|:---:|
| `for...in` | ✅ | ❌ | ❌ |
| `Object.keys()` | ❌ | ❌ | ❌ |
| `Object.getOwnPropertyNames()` | ❌ | ✅ | ❌ |
| `Object.getOwnPropertySymbols()` | ❌ | — | ✅ |
| `Reflect.ownKeys()` | ❌ | ✅ | ✅ |

### 3. 获取描述符

```js
const obj = { a: 1 }
Object.getOwnPropertyDescriptor(obj, 'a')
// { value: 1, writable: true, enumerable: true, configurable: true }

Object.getOwnPropertyDescriptors(obj)   // { a: { value:1, writable:true, ... } }
```

> 💡 **提示：** `Object.getOwnPropertyDescriptors()` 常与 `Object.create()` 配合，实现保留描述符的浅克隆：
> ```js
> const clone = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
> ```

---

## 七、定义与控制属性类方法

### 1. Object.defineProperty() / Object.defineProperties()

精确定义属性（可控制描述符的每个特性）。

```js
const obj = {}

// 定义单个属性
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: false,      // 只读
  enumerable: true,
  configurable: false   // 不可删除、不可重新配置
})
obj.name = 'Bob'        // 严格模式下抛错，非严格模式下静默失败
console.log(obj.name)   // 'Alice'

// 批量定义
Object.defineProperties(obj, {
  age:   { value: 25, enumerable: true },
  greet: { value() { return 'hi' }, enumerable: true }
})
```

> ⚠️ **注意：** 通过 `defineProperty` 新建属性时，未指定的特性默认都是 `false`（而字面量定义的属性默认是 `true`）。这是最常见的坑。

### 2. Object.preventExtensions() / seal() / freeze()

这三个方法**逐级收紧**对对象的操作权限，都只影响**自身属性**（浅层）。

| 操作 | preventExtensions | seal | freeze |
|------|:---:|:---:|:---:|
| 添加新属性 | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 |
| 删除属性 | ✅ 允许 | ❌ 禁止 | ❌ 禁止 |
| 修改属性值 | ✅ 允许 | ✅ 允许 | ❌ 禁止 |
| 修改属性描述符 | ✅ 允许 | ❌ 禁止 | ❌ 禁止 |

```js
// preventExtensions：只能加，不能……不，是不能加
const a = { x: 1 }
Object.preventExtensions(a)
a.y = 2            // 静默失败（严格模式报错）

// seal：封印，不能增删，但可改值
const b = { x: 1 }
Object.seal(b)
b.x = 99           // ✅ 可以
delete b.x         // ❌ 失败

// freeze：冻结，完全只读
const c = { x: 1 }
Object.freeze(c)
c.x = 99           // ❌ 失败
delete c.x         // ❌ 失败
```

> ⚠️ **注意：** `Object.freeze()` 是**浅冻结**，嵌套对象仍可修改：
> ```js
> const obj = { info: { age: 20 } }
> Object.freeze(obj)
> obj.info.age = 99
> console.log(obj.info.age)   // 99 ⚠️ 嵌套对象没被冻结
> ```
> 如需深冻结，需递归调用 `Object.freeze`。

配套的检测方法：

```js
Object.isExtensible(obj)   // 是否可扩展
Object.isSealed(obj)       // 是否被封印
Object.isFrozen(obj)       // 是否被冻结
```

> 💡 **提示：** `Object.seal` 也会调用 `preventExtensions`；`Object.freeze` 也会调用 `seal`。所以被冻结的对象，`isSealed()` 和 `isExtensible()`（返回 false）也满足。

---

## 八、判断与比较类方法

### 1. Object.is(value1, value2)

比 `===` 更严格的"同值"判断，主要修复了 `===` 的两个特例：

```js
Object.is(NaN, NaN)     // true   （NaN === NaN 是 false）
Object.is(-0, 0)        // false  （-0 === 0 是 true）
Object.is(+0, -0)       // false  （+0 === -0 是 true）
Object.is('a', 'a')     // true
Object.is({}, {})       // false  （引用不同）
```

| 比较 | `==` | `===` | `Object.is` |
|------|:---:|:---:|:---:|
| `1 == '1'` | ✅ true | ❌ false | ❌ false |
| `NaN` 比 `NaN` | ❌ false | ❌ false | ✅ true |
| `-0` 比 `0` | ✅ true | ✅ true | ❌ false |

> 💡 **提示：** 日常判断基本用 `===` 就够了；只有涉及 `NaN`、`±0` 时才需要 `Object.is`。

### 2. Object.hasOwn(obj, prop)  —— ES2022

判断对象是否**自有**某属性（不查原型链）。是 `Object.prototype.hasOwnProperty` 的现代替代品。

```js
const obj = Object.create({ inherited: '原型属性' })
obj.own = '自有属性'

Object.hasOwn(obj, 'own')        // true
Object.hasOwn(obj, 'inherited')  // false（在原型链上，非自有）

// 对比 hasOwnProperty：当对象没有原型或覆盖了该方法时，hasOwn 更安全
const dict = Object.create(null)   // 纯净对象，无原型
dict.x = 1
dict.hasOwnProperty('x')        // ❌ 报错：hasOwnProperty is not a function
Object.hasOwn(dict, 'x')        // ✅ true
```

> 📖 [MDN — Object.hasOwn()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)

---

## 九、原型操作类方法

### 1. Object.getPrototypeOf() / Object.setPrototypeOf()

```js
const proto = { greet() { return 'hi' } }
const obj = Object.create(proto)

Object.getPrototypeOf(obj) === proto   // true

// 修改原型（不推荐频繁使用，性能差）
const anotherProto = { bye() { return 'bye' } }
Object.setPrototypeOf(obj, anotherProto)
obj.bye()   // 'bye'
```

> ⚠️ **注意：** 修改对象原型（尤其对已存在的对象）会严重影响引擎优化性能，应尽量避免。新对象用 `Object.create(proto)` 创建更合适。

> 💡 **提示：** 也可以用 `obj.__proto__` 读写原型，但它是非标准（虽被广泛实现）的访问器，推荐用上面两个静态方法。

### 2. Object.create() 实现继承

见 [第五节](#1-objectcreateproto-propertiesobject)，以及 [Object.create 方法](./Object.create方法.md)。

---

## 十、分组方法（ES2024）

### Object.groupBy(items, callbackFn)

按回调返回的值对数组元素分组，返回一个**普通对象**（key 是回调返回值字符串化后的结果）。

```js
const inventory = [
  { name: 'asparagus', type: 'vegetables' },
  { name: 'apple', type: 'fruit' },
  { name: 'carrot', type: 'vegetables' },
  { name: 'banana', type: 'fruit' }
]

const grouped = Object.groupBy(inventory, (item) => item.type)
/*
{
  vegetables: [
    { name: 'asparagus', type: 'vegetables' },
    { name: 'carrot', type: 'vegetables' }
  ],
  fruit: [
    { name: 'apple', type: 'fruit' },
    { name: 'banana', type: 'fruit' }
  ]
}
*/
```

> 💡 **提示：** 如果分组键可能是任意类型（含数字、对象），用 `Map.groupBy()`，它返回 `Map` 且不把 key 字符串化。

> 📖 [MDN — Object.groupBy()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)

---

## 十一、Object 实例方法（Object.prototype）

实例方法定义在 `Object.prototype` 上，**所有普通对象都能直接调用**。

| 方法 | 作用 |
|------|------|
| `obj.hasOwnProperty(prop)` | 是否自有某属性（建议用 `Object.hasOwn`） |
| `obj.isPrototypeOf(obj2)` | `obj` 是否在 `obj2` 的原型链上 |
| `obj.propertyIsEnumerable(prop)` | 某自有属性是否可枚举 |
| `obj.toString()` | 返回对象的字符串表示（默认 `"[object Object]"`） |
| `obj.toLocaleString()` | 本地化字符串表示 |
| `obj.valueOf()` | 返回对象的原始值（默认返回对象本身） |

```js
const obj = { a: 1 }

obj.toString()                  // '[object Object]'
obj.hasOwnProperty('a')         // true
obj.propertyIsEnumerable('a')   // true

// valueOf：在需要原始值的场景被调用
const numObj = new Number(42)
numObj.valueOf()                // 42（拆箱出基本类型）

// isPrototypeOf：判断原型关系
const proto = {}
const child = Object.create(proto)
proto.isPrototypeOf(child)      // true
```

> 💡 **提示：** 很多内置对象（数组、函数）都**重写**了 `toString` / `valueOf`，例如 `[1,2].toString()` 返回 `'1,2'`。

---

## 十二、对象拷贝

### 1. 浅拷贝

只复制第一层，嵌套对象仍共享引用。

```js
// 方式一：展开运算符（最常用）
const shallow1 = { ...obj }

// 方式二：Object.assign
const shallow2 = Object.assign({}, obj)

// 数组的浅拷贝：[...arr] 或 arr.slice()
```

### 2. 深拷贝

递归复制所有层级，常见方案：

```js
// 方式一：structuredClone（推荐，原生支持，能处理循环引用、Date、Map 等）
const deep1 = structuredClone(obj)

// 方式二：JSON 序列化（简单但有限制）
const deep2 = JSON.parse(JSON.stringify(obj))
// ❌ 缺点：丢失函数、undefined、Symbol；不支持 Date（变字符串）、RegExp、Map/Set、循环引用

// 方式三：手写递归（需处理循环引用、各种类型，较复杂）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (map.has(obj)) return map.get(obj)        // 处理循环引用
  const clone = Array.isArray(obj) ? [] : {}
  map.set(obj, clone)
  for (const key of Reflect.ownKeys(obj)) {    // 含 Symbol、不可枚举
    clone[key] = deepClone(obj[key], map)
  }
  return clone
}
```

| 方案 | 循环引用 | 函数/Symbol | Date/Map | 性能 | 推荐场景 |
|------|:---:|:---:|:---:|:---:|------|
| `JSON` 法 | ❌ | ❌ | ❌ | 快 | 纯数据 |
| `structuredClone` | ✅ | ❌（抛错） | ✅ | 中 | 大多数场景（推荐） |
| 手写递归 | 可控 | 可控 | 可控 | 慢 | 特殊需求 |

---

## 十三、实际应用场景

### 场景 1：合并默认配置与用户配置

```js
function createRequest(options = {}) {
  const defaults = { method: 'GET', timeout: 5000, headers: {} }
  return Object.assign({}, defaults, options)   // 用户配置覆盖默认值
}
createRequest({ method: 'POST' })
// { method: 'POST', timeout: 5000, headers: {} }
```

### 场景 2：遍历对象渲染列表（Vue 3）

```vue
<script setup>
import { reactive } from 'vue'

const scores = reactive({ Alice: 90, Bob: 75, Carol: 88 })
</script>

<template>
  <!-- Object.entries 拿到 [名字, 分数]，渲染成列表 -->
  <ul>
    <li v-for="[name, score] in Object.entries(scores)" :key="name">
      {{ name }}: {{ score }}
    </li>
  </ul>
</template>
```

### 场景 3：用 freeze 冻结常量

```js
// 配置常量一旦定义就不应被修改，冻结它防止误改
const COLORS = Object.freeze({
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  DANGER: '#ff4d4f'
})
COLORS.PRIMARY = '#000'   // 静默失败，常量被保护
```

### 场景 4：对象属性的过滤与映射

```js
const users = { a: { age: 17 }, b: { age: 20 }, c: { age: 15 } }

// 过滤出成年人
const adults = Object.fromEntries(
  Object.entries(users).filter(([, u]) => u.age >= 18)
)
// { b: { age: 20 } }
```

### 场景 5：用 getter/setter 实现响应式数据（Vue 响应式原理简化版）

```js
// 简化版响应式：用 Object.defineProperty 把数据变成"可监听"的
function reactive(target) {
  Object.keys(target).forEach((key) => {
    let internal = target[key]
    Object.defineProperty(target, key, {
      get() {
        console.log(`读取 ${key}`)
        return internal
      },
      set(newVal) {
        console.log(`设置 ${key} = ${newVal}`)
        internal = newVal
      }
    })
  })
  return target
}

const state = reactive({ count: 0 })
state.count        // 打印：读取 count
state.count = 5    // 打印：设置 count = 5
```

> 💡 **提示：** Vue 3 的响应式底层用 `Proxy`（功能更强，能监听新增/删除属性），而 Vue 2 用的是 `Object.defineProperty`（这正是 Vue 2 无法检测属性新增/删除的根因）。

---

## 十四、常见问题与注意事项

### 1. `__proto__`、`prototype`、原型链别混淆

- `obj.__proto__`：对象实例的原型（指向其构造函数的 `prototype`）。
- `Func.prototype`：函数对象上的原型属性，供 `new Func()` 创建的实例共享。
- `Object.prototype` 是所有普通对象原型链的终点，再往上是 `null`。

```js
const arr = []
arr.__proto__ === Array.prototype           // true
Array.prototype.__proto__ === Object.prototype  // true
Object.prototype.__proto__                  // null（终点）
```

### 2. 对象的 key 只能是字符串或 Symbol

其他类型作为 key 会被**强制转为字符串**：

```js
const obj = {}
obj[1] = 'a'           // key 变成 '1'
obj[{ x: 1 }] = 'b'    // key 变成 '[object Object]'
console.log(obj)       // { '1': 'a', '[object Object]': 'b' }
```

> 💡 **提示：** 想用对象、数字等任意类型作为 key，请用 `Map`。

### 3. 引用类型导致的"相等"陷阱

```js
{} === {}               // false（两个不同的对象）
const a = {}; const b = a
a === b                 // true（同一引用）
```

对象比较的是引用，不是内容。要比较内容需自行实现（如 `JSON.stringify` 或库的深比较函数）。

### 4. `Object.keys` 不会返回 Symbol 和不可枚举属性

需要 Symbol 用 `Object.getOwnPropertySymbols`，需要不可枚举用 `Object.getOwnPropertyNames`，两者都要用 `Reflect.ownKeys`。

### 5. `for...in` 会遍历继承的可枚举属性

```js
const obj = Object.create({ inherited: 1 })
obj.own = 2
for (const key in obj) console.log(key)   // 'own', 'inherited'（都遍历到）
```

> 💡 **提示：** 通常遍历自有属性优先用 `Object.keys()` / `Object.entries()`，而不是 `for...in`。

### 6. 展开运算符 `{...obj}` 是浅拷贝

和 `Object.assign({}, obj)` 一样，嵌套对象仍是引用，修改会互相影响。

---

## 十五、总结

| 类别 | 关键方法 | 记忆要点 |
|------|------|------|
| 创建 | `create` / `assign` / `fromEntries` | `create` 定原型，`assign` 浅合并 |
| 遍历 | `keys` / `values` / `entries` | 只取可枚举自有属性，三者顺序一致 |
| 描述符 | `defineProperty` / `getOwnPropertyDescriptor` | `defineProperty` 默认值是 `false`（易错） |
| 控制 | `preventExtensions` / `seal` / `freeze` | 逐级收紧，且都是浅层 |
| 判断 | `is` / `hasOwn` | `is` 修了 `NaN`、`±0`；`hasOwn` 替代 `hasOwnProperty` |
| 原型 | `getPrototypeOf` / `setPrototypeOf` | 避免运行时改原型（性能差） |

**一句话记忆**：`Object` 是 JS 的对象基石，它通过**静态方法**（`Object.xxx`）提供对象的创建、遍历、控制、判断能力，通过**实例方法**（`Object.prototype`）提供基础的类型转换与属性判断；理解**属性描述符**和**浅拷贝**这两个概念，就掌握了绝大多数 `Object` 方法的精髓。

> 📖 更多细节参考 [MDN — Object 完整文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
