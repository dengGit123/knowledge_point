# Object.assign() 方法

## 概述

`Object.assign()` 是 ES6（ECMAScript 2015）引入的静态方法，用于将一个或多个**源对象**的**可枚举自有属性****浅拷贝**到**目标对象**中。它是 JavaScript 中实现对象合并、属性拷贝和对象混入（Mixin）的标准方式。

```javascript
Object.assign(target, ...sources)
```

> 📖 [MDN 官方文档 — Object.assign()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
>
> 📖 [ECMAScript 规范 — Object.assign](https://tc39.es/ecma262/#sec-object.assign)

---

## 语法

```javascript
Object.assign(target)
Object.assign(target, source1)
Object.assign(target, source1, source2)
Object.assign(target, source1, source2, /* ..., */ sourceN)
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `target` | Object | 是 | 目标对象，接收来自源对象的属性，**会被修改并返回** |
| `...sources` | Object | 否 | 一个或多个源对象，其可枚举的自有属性将被拷贝到目标对象 |

### 返回值

返回**目标对象** `target`（即修改后的同一个对象引用）。

---

## 核心特性

### 拷贝规则一览

| 特性 | 行为 |
|------|------|
| 拷贝范围 | 仅拷贝源对象的**自有属性**（`hasOwnProperty` 为 `true`） |
| 可枚举性 | 仅拷贝**可枚举**属性（`enumerable: true`） |
| 拷贝深度 | **浅拷贝**——属性值为对象时，拷贝的是引用 |
| 覆盖策略 | 后续源对象的同名属性会**覆盖**之前的值 |
| Getter / Setter | 读取源对象的 getter 返回值，作为普通值赋给目标对象（不复制描述符） |
| Symbol 属性 | ✅ 会被拷贝 |

### 拷贝过程示意

```
source 对象的属性 ----读取----> 值 ----赋值----> target 对象
                  (仅可枚举自有)          (普通赋值)
```

---

## 基础用法

### 1. 合并多个对象

```javascript
const target = { a: 1 }

const result = Object.assign(target, { b: 2 }, { c: 3 })

console.log(target) // { a: 1, b: 2, c: 3 }
console.log(result === target) // true（返回值就是 target 本身）
```

### 2. 克隆对象

```javascript
const original = { name: '张三', age: 25 }
const clone = Object.assign({}, original)

console.log(clone)           // { name: '张三', age: 25 }
console.log(clone === original) // false（不同的对象引用）
```

> ⚠️ 这是**浅克隆**，嵌套对象仍然是引用共享的。

### 3. 合并时属性覆盖

```javascript
const defaults = {
  theme: 'light',
  lang: 'zh-CN',
  fontSize: 14
}

const userConfig = {
  theme: 'dark',
  fontSize: 16
}

const finalConfig = Object.assign({}, defaults, userConfig)

console.log(finalConfig)
// { theme: 'dark', lang: 'zh-CN', fontSize: 16 }
//    ↑ 被覆盖         ↑ 保留默认      ↑ 被覆盖
```

**规则**：后面的源对象中的同名属性会覆盖前面的。

---

## 深入理解

### 1. 仅拷贝可枚举的自有属性

```javascript
const source = Object.create(
  { inheritedProp: '来自原型' },  // 原型上的属性 —— 不会被拷贝
  {
    enumerableProp: {
      value: '可枚举属性',
      enumerable: true   // 可枚举 —— 会被拷贝
    },
    nonEnumerableProp: {
      value: '不可枚举属性',
      enumerable: false  // 不可枚举 —— 不会被拷贝
    }
  }
)

const target = Object.assign({}, source)

console.log(target)
// { enumerableProp: '可枚举属性' }
// inheritedProp 和 nonEnumerableProp 都未被拷贝
```

### 2. 浅拷贝 —— 引用类型共享

```javascript
const source = {
  name: 'test',
  info: { city: '北京' },
  tags: ['js', 'css']
}

const target = Object.assign({}, source)

// 修改嵌套对象
target.info.city = '上海'
console.log(source.info.city) // '上海'（原始数据被改动了！）

// 修改数组
target.tags.push('html')
console.log(source.tags) // ['js', 'css', 'html']（也被改了！）
```

**原因**：`Object.assign` 拷贝的是属性值的引用，而不是深拷贝。

### 3. Getter 的处理方式

`Object.assign` 调用源对象的 getter，将返回值作为**普通值**赋给目标对象，不会复制 getter 本身。

```javascript
const source = {
  firstName: '三',
  lastName: '张',
  get fullName() {
    return this.lastName + this.firstName
  }
}

const target = Object.assign({}, source)

console.log(target.fullName) // "张三"（getter 的返回值，变成了普通属性值）
console.log(Object.getOwnPropertyDescriptor(target, 'fullName'))
// { value: "张三", writable: true, enumerable: true, configurable: true }
// 注意：这是一个普通的数据属性，不再是 getter
```

### 4. Symbol 属性会被拷贝

```javascript
const sym = Symbol('id')

const source = { [sym]: 100, name: 'test' }
const target = Object.assign({}, source)

console.log(target[sym])  // 100
console.log(Object.getOwnPropertySymbols(target)) // [Symbol(id)]
```

---

## 进阶用法

### 1. 实现配置项合并（Options 模式）

```javascript
function createUser(options) {
  const defaults = {
    name: '匿名用户',
    role: 'guest',
    permissions: ['read'],
    active: true
  }

  // 将用户配置合并到默认配置上
  const config = Object.assign({}, defaults, options)

  return {
    id: Date.now(),
    ...config
  }
}

const user1 = createUser({ name: '张三', role: 'admin', permissions: ['read', 'write', 'delete'] })
console.log(user1)
// { id: 1749..., name: '张三', role: 'admin', permissions: ['read', 'write', 'delete'], active: true }

const user2 = createUser()
console.log(user2)
// { id: 1749..., name: '匿名用户', role: 'guest', permissions: ['read'], active: true }
```

### 2. 为对象添加方法（Mixin 模式）

```javascript
// 可序列化混入
const serializableMixin = {
  toJSON() {
    return JSON.stringify(this, null, 2)
  },
  fromJSON(json) {
    return JSON.parse(json)
  }
}

// 事件监听混入
const eventMixin = {
  _events: null,

  on(event, callback) {
    if (!this._events) this._events = {}
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(callback)
  },

  emit(event, ...args) {
    if (this._events && this._events[event]) {
      this._events[event].forEach(cb => cb(...args))
    }
  }
}

// 创建一个带有混入能力的对象
const widget = Object.assign({}, serializableMixin, eventMixin)

widget.on('click', (data) => console.log('clicked:', data))
widget.emit('click', { x: 100, y: 200 }) // clicked: {x: 100, y: 200}
```

### 3. 对象的深拷贝替代方案

`Object.assign` 本身只做浅拷贝。如果需要深拷贝，可以结合其他方式：

```javascript
// 方式一：JSON 序列化（简单但有限制）
function deepCloneJSON(obj) {
  return JSON.parse(JSON.stringify(obj))
}
// 缺点：不支持 Function、Symbol、undefined、循环引用、Date、RegExp 等

// 方式二：structuredClone（现代浏览器原生支持）
function deepClone(obj) {
  return structuredClone(obj)
}
// 支持：循环引用、Date、RegExp、Map、Set、ArrayBuffer 等
// 不支持：Function、DOM 节点、Symbol

// 方式三：递归手动实现（简化版）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (map.has(obj)) return map.get(obj) // 处理循环引用

  const clone = Array.isArray(obj) ? [] : {}
  map.set(obj, clone)

  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], map)
  }

  return clone
}
```

### 4. 使用 Object.assign 实现函数参数默认值（Vue 项目常见）

```javascript
// 在 Vue/Vuex 插件或工具函数中常见的模式
function mergeOptions(userOptions = {}) {
  const defaultOptions = {
    baseURL: '/api',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false
  }

  // 不直接修改 userOptions，返回合并后的新对象
  return Object.assign({}, defaultOptions, userOptions)
}

const options = mergeOptions({
  timeout: 10000,
  headers: { 'Authorization': 'Bearer token123' }
})

console.log(options)
// { baseURL: '/api', timeout: 10000, headers: { Authorization: 'Bearer token123' }, withCredentials: false }
// 注意：headers 被完全覆盖了，不是深层合并！
```

### 5. 深层合并工具函数

`Object.assign` 只做一层合并，需要深层合并时可自行实现：

```javascript
function deepMerge(target, ...sources) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const targetVal = target[key]
      const sourceVal = source[key]

      if (isObject(targetVal) && isObject(sourceVal)) {
        // 递归合并嵌套对象
        deepMerge(targetVal, sourceVal)
      } else {
        // 直接赋值（覆盖或新增）
        target[key] = sourceVal
      }
    }
  }
  return target
}

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val)
}

// 使用示例
const a = { info: { name: '张三', age: 20 }, tags: ['js'] }
const b = { info: { age: 25, city: '北京' }, tags: ['css'] }

const result = deepMerge({}, a, b)
console.log(result)
// { info: { name: '张三', age: 25, city: '北京' }, tags: ['css'] }
```

---

## Object.assign 与展开运算符的对比

ES2018 引入的对象展开运算符 `...` 与 `Object.assign` 功能非常相似：

```javascript
const source = { a: 1, b: 2 }

// Object.assign 方式
const target1 = Object.assign({}, source)

// 展开运算符方式
const target2 = { ...source }

// 两者结果一致
console.log(target1) // { a: 1, b: 2 }
console.log(target2) // { a: 1, b: 2 }
```

### 关键差异

| 对比维度 | `Object.assign(target, source)` | `{ ...source }` |
|----------|-------------------------------|------------------|
| 是否修改目标对象 | ✅ 会修改 `target` | ❌ 总是创建新对象 |
| 返回值 | 修改后的 `target` | 新对象 |
| 设置原型 | 可以用 `Object.create` 配合 | ❌ 不继承原型 |
| Getter 处理 | 调用 getter，拷贝返回值 | 调用 getter，拷贝返回值 |
| 原型属性 | 不拷贝 | 不拷贝 |
| 用途倾向 | 需要**修改已有对象**时 | 需要**创建新对象**时（函数式风格） |

```javascript
// Object.assign 会修改目标对象
const existing = { a: 1 }
Object.assign(existing, { b: 2 })
console.log(existing) // { a: 1, b: 2 }（被修改了）

// 展开运算符不修改任何对象
const original = { a: 1 }
const merged = { ...original, b: 2 }
console.log(original) // { a: 1 }（未被修改）
console.log(merged)   // { a: 1, b: 2 }
```

---

## 注意事项与常见陷阱

### 1. 修改原始目标对象

```javascript
const target = { important: '数据' }

Object.assign(target, { newProp: '新增' })

console.log(target) // { important: '数据', newProp: '新增' }
// target 已经被修改了！

// ✅ 安全做法：用空对象作为 target
const safe = Object.assign({}, target, { newProp: '新增' })
```

### 2. 原始值参数会被包装

```javascript
// 字符串会被包装成 String 对象，其可枚举属性（每个字符的索引）会被拷贝
const result = Object.assign({}, 'abc', 10, true)
console.log(result) // { '0': 'a', '1': 'b', '2': 'c' }
// 只有字符串有可枚举的自有属性，数字和布尔值被忽略

// Symbol 值会被包装，但没有可枚举属性，所以被忽略
const result2 = Object.assign({}, Symbol('test'))
console.log(result2) // {}
```

### 3. 数组的处理

```javascript
// 数组作为 target 时，按索引覆盖
const arr = [1, 2, 3]
Object.assign(arr, [4, 5])
console.log(arr) // [4, 5, 3]

// 数组作为 source 时，索引变成属性名
const obj = Object.assign({}, ['a', 'b', 'c'])
console.log(obj) // { '0': 'a', '1': 'b', '2': 'c' }
```

### 4. 继承属性不会被拷贝

```javascript
function Parent() {}
Parent.prototype.inherited = '继承属性'

const parent = new Parent()
parent.own = '自有属性'

const target = Object.assign({}, parent)
console.log(target) // { own: '自有属性' }
// inherited 不会被拷贝，因为它在原型上，不是自有属性
```

### 5. 拷贝中断（遇到错误时）

```javascript
const target = Object.defineProperty({}, 'frozen', {
  value: 1,
  writable: false,     // 不可写
  configurable: true
})

try {
  Object.assign(target, { frozen: 2, other: 3 })
} catch (e) {
  console.log(e) // TypeError: Cannot assign to read only property
}

// 如果源对象的多个属性要写入目标对象，在出错之前已拷贝的属性会保留
// 但 frozen 之后的其他属性不会继续拷贝
```

---

## 实际应用场景汇总

### 场景一：Vue 组件默认 Props 合并

```javascript
// 在 Vue 组件中合并默认配置
export default {
  props: {
    size: {
      type: String,
      default: 'medium'
    }
  },
  computed: {
    mergedStyle() {
      const baseStyle = {
        padding: '8px',
        borderRadius: '4px'
      }
      const sizeMap = {
        small: { padding: '4px', fontSize: '12px' },
        medium: { padding: '8px', fontSize: '14px' },
        large: { padding: '12px', fontSize: '16px' }
      }
      return Object.assign({}, baseStyle, sizeMap[this.size])
    }
  }
}
```

### 场景二：工具函数可选参数

```javascript
function formatData(data, options) {
  const config = Object.assign({
    separator: ',',
    trim: true,
    lowercase: false,
    maxLength: Infinity
  }, options)

  let result = data

  if (config.trim) result = result.map(s => s.trim())
  if (config.lowercase) result = result.map(s => s.toLowerCase())
  if (result.length > config.maxLength) result = result.slice(0, config.maxLength)

  return result.join(config.separator)
}

formatData([' Hello ', 'World'], { separator: ' | ' })
// "Hello | World"
```

### 场景三：对象状态更新（不可变模式）

```javascript
// 类似 Vuex / Pinia 中的状态更新思路
const state = {
  user: { name: '张三', age: 25 },
  loading: false,
  error: null
}

// 更新状态时返回新对象，不直接修改原对象
function updateUser(state, updates) {
  return Object.assign({}, state, {
    user: Object.assign({}, state.user, updates)
  })
}

const newState = updateUser(state, { age: 26, city: '北京' })
console.log(newState.user) // { name: '张三', age: 26, city: '北京' }
console.log(state.user)    // { name: '张三', age: 25 }（原对象未被修改）
```

---

## 方法横向对比

| 方法 | 拷贝深度 | 修改原对象 | Symbol | Getter | 典型用途 |
|------|---------|-----------|--------|--------|---------|
| `Object.assign()` | 浅拷贝 | ✅ 修改 target | ✅ | 调用后拷贝返回值 | 对象合并、属性拷贝 |
| `{ ...spread }` | 浅拷贝 | ❌ 新对象 | ✅ | 调用后拷贝返回值 | 创建新对象（函数式） |
| `JSON.parse(JSON.stringify())` | 深拷贝 | ❌ 新对象 | ❌ | ❌ | 简单深克隆 |
| `structuredClone()` | 深拷贝 | ❌ 新对象 | ✅ | ❌ | 现代深克隆 |
| `Object.create()` | 不拷贝 | — | — | — | 创建指定原型的对象 |

---

## 兼容性

`Object.assign()` 在 ES6（ECMAScript 2015）中引入，所有现代浏览器均已支持。

| 环境 | 支持版本 |
|------|---------|
| Chrome | 45+ |
| Firefox | 34+ |
| Safari | 9+ |
| Edge | 12+ |
| Node.js | 4.0+ |
| IE | ❌ 不支持 |

> 在需要兼容 IE 等旧环境时，可使用 polyfill：
>
> ```javascript
> if (typeof Object.assign !== 'function') {
>   Object.assign = function (target) {
>     if (target == null) throw new TypeError('Cannot convert undefined or null to object')
>     const to = Object(target)
>     for (let i = 1; i < arguments.length; i++) {
>       const source = arguments[i]
>       if (source != null) {
>         for (const key in source) {
>           if (Object.prototype.hasOwnProperty.call(source, key)) {
>             to[key] = source[key]
>           }
>         }
>       }
>     }
>     return to
>   }
> }
> ```

---

## 参考

- [MDN — Object.assign()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [MDN — 属性的可枚举性和所有权](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)
- [ECMAScript 规范 — Object.assign](https://tc39.es/ecma262/#sec-object.assign)
