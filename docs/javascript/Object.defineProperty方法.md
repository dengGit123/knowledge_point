# Object.defineProperty() 方法

## 概述

`Object.defineProperty()` 是 ES5（ECMAScript 2009）引入的核心方法，用于**精确控制对象属性的行为**。它允许你定义或修改对象的属性，并设置属性的各种特性（如是否可写、可枚举、可配置，以及 getter/setter）。

这是 Vue 2 响应式系统的**底层核心实现**，也是 JavaScript 中实现数据绑定、不可变对象、计算属性等高级功能的基础。

```javascript
Object.defineProperty(obj, prop, descriptor)
```

> 📖 [MDN 官方文档 — Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
>
> 📖 [ECMAScript 规范 — Object.defineProperty](https://tc39.es/ecma262/#sec-object.defineproperty)
>
> 📖 **相关阅读**：[Object.assign()](file:///Users/dyc/Desktop/学习/knowledge_point/docs/javascript/Object.assign方法.md)、[Object.create()](file:///Users/dyc/Desktop/学习/knowledge_point/docs/javascript/Object.create方法.md)

---

## 语法

```javascript
Object.defineProperty(obj, prop, descriptor)
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `obj` | Object | 是 | 要定义属性的目标对象 |
| `prop` | String / Symbol | 是 | 要定义或修改的属性名称 |
| `descriptor` | Object | 是 | 属性描述符对象，定义属性的行为特性 |

### 返回值

返回**目标对象** `obj`（即被修改后的同一个对象引用）。

---

## 属性描述符详解

### 数据描述符（Data Descriptor）

用于定义普通属性值的描述符：

```javascript
{
  value: undefined,        // 属性值
  writable: false,         // 是否可写
  enumerable: false,       // 是否可枚举
  configurable: false      // 是否可配置
}
```

### 存取描述符（Accessor Descriptor）

用于定义 getter/setter 的描述符：

```javascript
{
  get: undefined,          // getter 函数
  set: undefined,          // setter 函数
  enumerable: false,       // 是否可枚举
  configurable: false      // 是否可配置
}
```

> ⚠️ **互斥规则**：`value` / `writable` 与 `get` / `set` 不能同时存在。

### 描述符字段完整说明

| 字段 | 默认值 | 类型 | 说明 |
|------|--------|------|------|
| `value` | `undefined` | any | 属性的值，可以是任意类型 |
| `writable` | `false` | Boolean | `true` 时属性值可被修改 |
| `enumerable` | `false` | Boolean | `true` 时属性会出现在 `for...in`、`Object.keys()`、`JSON.stringify()` 中 |
| `configurable` | `false` | Boolean | `true` 时属性可被删除，且描述符可被重新配置 |
| `get` | `undefined` | Function | 获取属性值时调用的函数，返回值即为属性值 |
| `set` | `undefined` | Function | 设置属性值时调用的函数，接收一个参数（新值） |

---

## 基础用法

### 1. 定义不可写属性

```javascript
const obj = {}

Object.defineProperty(obj, 'name', {
  value: '张三',
  writable: false  // 不可写
})

console.log(obj.name) // "张三"

obj.name = '李四'     // 严格模式下抛出 TypeError
console.log(obj.name) // "张三"（值未改变）
```

### 2. 定义不可枚举属性

```javascript
const obj = {}

Object.defineProperty(obj, 'public', {
  value: '公开属性',
  enumerable: true
})

Object.defineProperty(obj, 'private', {
  value: '私有属性',
  enumerable: false  // 不可枚举
})

console.log(Object.keys(obj))  // ["public"]
console.log(obj.private)       // "私有属性"（仍可访问）

for (const key in obj) {
  console.log(key)  // 只输出 "public"
}
```

### 3. 定义不可配置属性

```javascript
const obj = {}

Object.defineProperty(obj, 'id', {
  value: 123,
  configurable: false  // 不可配置
})

delete obj.id          // 严格模式下抛出 TypeError
console.log(obj.id)    // 123（未被删除）

// 尝试重新配置也会失败
Object.defineProperty(obj, 'id', {
  writable: true       // TypeError: Cannot redefine property
})
```

### 4. 定义 getter 和 setter

```javascript
const obj = {
  _age: 25
}

Object.defineProperty(obj, 'age', {
  get() {
    console.log('读取 age')
    return this._age
  },
  set(newValue) {
    console.log('设置 age:', newValue)
    if (newValue < 0 || newValue > 120) {
      throw new Error('年龄必须在 0-120 之间')
    }
    this._age = newValue
  },
  enumerable: true,
  configurable: true
})

console.log(obj.age)   // "读取 age" → 25
obj.age = 30           // "设置 age: 30"
console.log(obj.age)   // "读取 age" → 30

obj.age = 200          // Error: 年龄必须在 0-120 之间
```

---

## 深入理解

### 1. 直接赋值 vs defineProperty

```javascript
// 方式一：直接赋值
const a = {}
a.name = '张三'
// 等价于：
Object.defineProperty(a, 'name', {
  value: '张三',
  writable: true,
  enumerable: true,
  configurable: true
})

// 方式二：defineProperty
const b = {}
Object.defineProperty(b, 'name', {
  value: '张三'
  // writable: false（默认）
  // enumerable: false（默认）
  // configurable: false（默认）
})
```

| 对比维度 | 直接赋值 `obj.key = value` | `Object.defineProperty` |
|----------|--------------------------|------------------------|
| `writable` | `true` | `false` |
| `enumerable` | `true` | `false` |
| `configurable` | `true` | `false` |
| 可控性 | 低（固定行为） | 高（精确控制） |

### 2. 属性描述符的优先级

```javascript
// ❌ 错误：value/writable 与 get/set 不能同时存在
Object.defineProperty(obj, 'prop', {
  value: 10,
  get() { return 20 }  // TypeError
})

// ✅ 正确：使用数据描述符
Object.defineProperty(obj, 'dataProp', {
  value: 10,
  writable: true
})

// ✅ 正确：使用存取描述符
Object.defineProperty(obj, 'accessorProp', {
  get() { return this._value },
  set(val) { this._value = val }
})
```

### 3. 获取属性描述符

```javascript
const obj = { name: '张三' }

// 获取单个属性的描述符
const descriptor = Object.getOwnPropertyDescriptor(obj, 'name')
console.log(descriptor)
// { value: "张三", writable: true, enumerable: true, configurable: true }

// 获取所有自有属性的描述符
const allDescriptors = Object.getOwnPropertyDescriptors(obj)
console.log(allDescriptors)
// { name: { value: "张三", writable: true, enumerable: true, configurable: true } }
```

### 4. 批量定义属性

使用 `Object.defineProperties()`（注意是复数形式）：

```javascript
const obj = {}

Object.defineProperties(obj, {
  name: {
    value: '张三',
    writable: true,
    enumerable: true
  },
  age: {
    value: 25,
    writable: false,
    enumerable: true
  },
  fullName: {
    get() { return this.name },
    enumerable: true
  }
})

console.log(obj.name)      // "张三"
console.log(obj.age)       // 25
console.log(obj.fullName)  // "张三"
```

---

## 高级应用

### 1. 实现数据绑定（Vue 2 响应式原理）

```javascript
// 简化版响应式系统
const Dep = {
  target: null,  // 当前正在执行的 watcher
  
  depend(key, watchers) {
    // 收集依赖：将当前 watcher 添加到依赖列表
    if (this.target && !watchers.includes(this.target)) {
      watchers.push(this.target)
    }
  },
  
  notify(watchers) {
    // 触发更新：执行所有 watcher
    watchers.forEach(watcher => watcher())
  }
}

function reactive(obj) {
  const dep = {}  // 依赖收集：{ key: [watcher1, watcher2, ...] }
  
  Object.keys(obj).forEach(key => {
    let value = obj[key]
    dep[key] = []  // 为每个属性创建依赖列表
    
    // 将每个属性转换为 getter/setter
    Object.defineProperty(obj, key, {
      get() {
        // ✅ 收集依赖（仅记录，不执行）
        Dep.depend(key, dep[key])
        return value
      },
      set(newValue) {
        if (value !== newValue) {
          value = newValue
          // ✅ 触发更新（在 setter 中执行 watcher）
          Dep.notify(dep[key])
        }
      },
      enumerable: true,
      configurable: true
    })
  })
  
  // 订阅方法
  obj.$watch = function(key, callback) {
    // 设置当前 target，然后读取属性触发依赖收集
    Dep.target = callback
    obj[key]  // 触发 getter，将 callback 添加到 dep[key]
    Dep.target = null  // 重置
  }
  
  return obj
}

// 使用示例
const state = reactive({ count: 0 })

state.$watch('count', () => {
  console.log('count changed:', state.count)
})

state.count = 1  // "count changed: 1"
state.count = 2  // "count changed: 2"
```

> 💡 **核心原理**：getter 只负责**收集依赖**（记录哪些函数依赖这个属性），setter 才负责**触发更新**（执行所有依赖函数）。

### 2. 实现计算属性

```javascript
function computed(obj, getters) {
  for (const key of Object.keys(getters)) {
    Object.defineProperty(obj, key, {
      get: getters[key],
      enumerable: true,
      configurable: true
    })
  }
  return obj
}

// 使用示例
const person = computed({
  firstName: '张',
  lastName: '三'
}, {
  fullName() {
    return this.lastName + this.firstName
  },
  nameLength() {
    return this.fullName.length
  }
})

console.log(person.fullName)    // "张三"
console.log(person.nameLength)  // 2
```

### 3. 创建不可变对象

```javascript
function freeze(obj) {
  Object.keys(obj).forEach(key => {
    Object.defineProperty(obj, key, {
      writable: false,
      configurable: false
    })
    // 递归冻结嵌套对象
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      freeze(obj[key])
    }
  })
  return Object.preventExtensions(obj)
}

const config = freeze({
  apiUrl: 'https://api.example.com',
  timeout: 5000
})

config.apiUrl = 'new url'  // 静默失败（严格模式报错）
console.log(config.apiUrl) // "https://api.example.com"
```

### 4. 实现私有属性

```javascript
class Person {
  constructor(name) {
    // 使用 Symbol 作为私有属性名
    const _name = Symbol('name')
    
    Object.defineProperty(this, _name, {
      value: name,
      writable: true
    })
    
    // 公开访问器
    Object.defineProperty(this, 'name', {
      get() {
        return this[_name]
      },
      set(newName) {
        if (typeof newName !== 'string') {
          throw new TypeError('name must be a string')
        }
        this[_name] = newName
      },
      enumerable: true
    })
  }
}

const p = new Person('张三')
console.log(p.name)      // "张三"
console.log(Object.keys(p)) // ["name"]（私有属性不可枚举）
```

### 5. 实现属性验证

```javascript
function createValidatedObject(schema) {
  const obj = {}
  
  for (const [key, validator] of Object.entries(schema)) {
    let value
    
    Object.defineProperty(obj, key, {
      get() {
        return value
      },
      set(newValue) {
        if (validator(newValue)) {
          value = newValue
        } else {
          throw new Error(`Invalid value for ${key}`)
        }
      },
      enumerable: true,
      configurable: true
    })
  }
  
  return obj
}

// 使用示例
const user = createValidatedObject({
  name: val => typeof val === 'string' && val.length > 0,
  age: val => typeof val === 'number' && val >= 0 && val <= 120,
  email: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
})

user.name = '张三'   // ✅ 有效
user.age = 25       // ✅ 有效
user.email = 'test@example.com' // ✅ 有效

user.age = 200      // ❌ Error: Invalid value for age
user.name = ''      // ❌ Error: Invalid value for name
```

---

## 在框架中的应用

### Vue 2 响应式系统

```javascript
// Vue 2 的响应式核心（简化版）
function defineReactive(obj, key, val) {
  const dep = new Dep()
  
  // 递归处理嵌套对象
  if (typeof val === 'object') {
    observe(val)
  }
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集：将当前 Watcher 添加到 dep
      if (Dep.target) {
        dep.depend()
      }
      return val
    },
    set(newVal) {
      if (val === newVal) return
      val = newVal
      // 递归处理新值
      if (typeof newVal === 'object') {
        observe(newVal)
      }
      // 触发更新
      dep.notify()
    }
  })
}
```

### React 不可变状态

```javascript
// 使用 defineProperty 冻结状态，防止直接修改
function freezeState(state) {
  Object.keys(state).forEach(key => {
    Object.defineProperty(state, key, {
      writable: false
    })
    if (typeof state[key] === 'object') {
      freezeState(state[key])
    }
  })
  return state
}

const initialState = freezeState({
  count: 0,
  user: { name: '张三' }
})

// 直接修改会失败，必须通过 setState 更新
initialState.count = 1  // 错误！
```

---

## 注意事项与常见陷阱

### 1. 描述符默认值陷阱

```javascript
const obj = {}

// 使用 defineProperty
Object.defineProperty(obj, 'a', { value: 1 })
// writable: false, enumerable: false, configurable: false

// 直接赋值
obj.b = 2
// writable: true, enumerable: true, configurable: true

console.log(Object.keys(obj)) // ["b"]（a 不可枚举）
obj.a = 100                   // 静默失败
console.log(obj.a)            // 1
```

### 2. 数组的特殊性

```javascript
const arr = [1, 2, 3]

// 修改已有索引的属性描述符
Object.defineProperty(arr, 0, { writable: false })
arr[0] = 100  // 静默失败

// 但 push 方法仍然可以添加新元素
arr.push(4)
console.log(arr) // [1, 2, 3, 4]

// 要完全冻结数组，需要冻结原型方法或使用 Object.freeze
```

### 3. 继承属性不受影响

```javascript
const parent = {}
Object.defineProperty(parent, 'prop', {
  value: 'parent',
  writable: false
})

const child = Object.create(parent)
child.prop = 'child'  // 创建了子对象的自有属性

console.log(child.prop)           // "child"
console.log(parent.prop)          // "parent"（不受影响）
console.log(child.hasOwnProperty('prop')) // true
```

### 4. 使用 `__proto__` 属性的陷阱

> ⚠️ **重要**：使用 `Object.defineProperty` 设置 `__proto__` 属性**不会**改变对象的原型链，而是创建一个遮蔽（shadowing）属性。

```javascript
const obj = {}
const proto = { greet: () => 'hello' }

// ❌ 错误：这只是创建了一个名为 "__proto__" 的普通数据属性
Object.defineProperty(obj, '__proto__', {
  value: proto,
  writable: true,
  configurable: true
})

console.log(obj.greet()) // TypeError: obj.greet is not a function
console.log(obj.__proto__ === proto) // true（但这只是普通属性，不影响原型链）
console.log(Object.getPrototypeOf(obj) === proto) // false（原型链未改变）

// ✅ 正确：使用 Object.setPrototypeOf 改变原型链
Object.setPrototypeOf(obj, proto)
console.log(obj.greet()) // "hello"
console.log(Object.getPrototypeOf(obj) === proto) // true
```

---

## 方法对比

| 方法 | 用途 | 修改原对象 | 是否支持 getter/setter |
|------|------|-----------|----------------------|
| `Object.defineProperty()` | 定义单个属性 | ✅ | ✅ |
| `Object.defineProperties()` | 定义多个属性 | ✅ | ✅ |
| `Object.assign()` | 浅拷贝属性 | ✅ | ❌（调用 getter 后拷贝值） |
| `Object.create()` | 创建指定原型的对象 | — | ✅（通过第二参数） |
| `Object.freeze()` | 冻结对象（不可写、不可配置） | ✅ | ❌ |
| `Object.seal()` | 密封对象（不可配置） | ✅ | ❌ |
| `Object.preventExtensions()` | 禁止添加新属性 | ✅ | ❌ |

---

## 兼容性

`Object.defineProperty()` 在 ES5（ECMAScript 5.1, 2009 年）中引入。

| 环境 | 支持版本 |
|------|---------|
| Chrome | 5+ |
| Firefox | 4+ |
| Safari | 5+ |
| Edge | 12+ |
| Node.js | 全部版本 |
| IE | 8+（部分支持，不支持 `get`/`set`） |

> **IE 8 限制**：只能在 DOM 元素上使用，且不支持 `get`/`set`、`configurable`。

---

## 参考

- [MDN — Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [MDN — 属性描述符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description)
- [ECMAScript 规范 — Object.defineProperty](https://tc39.es/ecma262/#sec-object.defineproperty)