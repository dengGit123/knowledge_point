# Object.create() 方法

## 概述

`Object.create()` 是 JavaScript 中用于**创建新对象**的静态方法，它允许你指定新对象的**原型**（prototype），并可选择性地定义**属性描述符**。它是 JavaScript 实现原型式继承的核心方法。

```javascript
Object.create(proto, propertiesObject)
```

> 📖 [MDN 官方文档 — Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
>
> 📖 [ECMAScript 规范 — Object.create](https://tc39.es/ecma262/#sec-object.create)

---

## 语法

```javascript
Object.create(proto)
Object.create(proto, propertiesObject)
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `proto` | Object / null | 是 | 新对象的原型对象。传入 `null` 可创建一个没有原型的"纯净"对象 |
| `propertiesObject` | Object | 否 | 可选的属性描述符对象，格式与 `Object.defineProperties()` 的第二个参数一致 |

### 返回值

返回一个新对象，该对象的 `__proto__`（内部 `[[Prototype]]`）指向 `proto` 参数。

---

## 核心概念：原型链

在深入 `Object.create` 之前，需要理解 JavaScript 的原型链机制：

```
新对象 ---> proto ---> proto.__proto__ ---> ... ---> null
```

`Object.create` 创建的新对象，其原型直接指向传入的 `proto` 参数，而不是像 `new` 关键字那样通过构造函数间接建立原型关系。

### Object.create vs new 关键字的区别

```javascript
// 使用构造函数 + new
function Person(name) {
  this.name = name
}
Person.prototype.sayHi = function () {
  console.log('Hi, I am ' + this.name)
}
const alice = new Person('Alice')

// 使用 Object.create
const personProto = {
  sayHi() {
    console.log('Hi, I am ' + this.name)
  }
}
const bob = Object.create(personProto)
bob.name = 'Bob'
```

| 对比维度 | `new Constructor()` | `Object.create(proto)` |
|----------|--------------------|-----------------------|
| 创建方式 | 通过构造函数 | 直接指定原型对象 |
| 是否执行构造函数 | ✅ 执行函数体 | ❌ 不执行任何函数 |
| 原型指向 | `Constructor.prototype` | 传入的 `proto` 参数 |
| 初始化属性 | 构造函数体内 `this.xxx` | 手动赋值 或 `propertiesObject` |
| 适用场景 | 需要初始化逻辑 | 纯原型继承 / 原型链操作 |

---

## 基础用法

### 1. 指定原型创建对象

```javascript
const animal = {
  type: '动物',
  speak() {
    console.log(this.name + ' makes a sound')
  }
}

const dog = Object.create(animal)
dog.name = '旺财'
dog.speak() // "旺财 makes a sound"

console.log(dog.type)     // "动物"（继承自原型）
console.log(dog.__proto__ === animal) // true
```

### 2. 创建一个"空"对象（以 null 为原型）

```javascript
const pureObj = Object.create(null)

console.log(pureObj.__proto__)      // undefined
console.log(pureObj.toString)       // undefined
console.log(pureObj.hasOwnProperty) // undefined
```

以 `null` 为原型创建的对象**没有任何继承的属性和方法**，它是一个完全"干净"的对象。这种对象常用于：

- **字典 / Hash 映射**：避免原型链上的属性名冲突（如 `toString`、`constructor`）
- **干净的数据容器**：确保 `for...in` 和 `Object.keys()` 只遍历自身属性

```javascript
// 经典问题：普通对象的键名陷阱
const dict = {}
console.log(dict['toString'])     // ƒ toString() { ... }（从原型链继承）
console.log(dict['constructor'])  // ƒ Object() { ... }（从原型链继承）

// 使用 null 原型解决
const cleanDict = Object.create(null)
console.log(cleanDict['toString'])    // undefined
console.log(cleanDict['constructor']) // undefined
```

### 3. 使用 propertiesObject 定义属性

第二个参数 `propertiesObject` 的格式与 `Object.defineProperties()` 一致，使用**属性描述符**（Property Descriptor）：

```javascript
const proto = {
  greet() {
    console.log('Hello, ' + this.name)
  }
}

const obj = Object.create(proto, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 25,
    writable: false,      // 只读属性
    enumerable: true,
    configurable: false   // 不可删除 / 重新配置
  },
  _secret: {
    value: 'hidden',
    enumerable: false,    // 不可枚举
    writable: true,
    configurable: true
  }
})

console.log(obj.name)         // "Alice"
console.log(obj.age)          // 25
obj.age = 30                  // 严格模式下抛出 TypeError，非严格模式静默失败
console.log(obj.age)          // 25（未改变）
console.log(Object.keys(obj)) // ["name", "age"]（_secret 不可枚举）
```

#### 属性描述符字段说明

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `value` | `undefined` | 属性的值 |
| `writable` | `false` | 是否可以修改属性的值 |
| `enumerable` | `false` | 是否出现在 `for...in` 和 `Object.keys()` 中 |
| `configurable` | `false` | 是否可以删除属性或修改描述符 |
| `get` | `undefined` | getter 函数（与 `value` / `writable` 互斥） |
| `set` | `undefined` | setter 函数（与 `value` / `writable` 互斥） |

> ⚠️ 注意：通过 `propertiesObject` 定义的属性，描述符默认值都是 `false` / `undefined`，这与直接赋值（`obj.x = 1`）的默认行为不同。

---

## 进阶用法

### 1. 实现原型链继承

`Object.create` 是实现 JavaScript 继承最干净的方式之一：

```javascript
// 父类
const Animal = {
  init(name, sound) {
    this.name = name
    this.sound = sound
    return this
  },
  speak() {
    console.log(`${this.name} says ${this.sound}`)
  }
}

// 子类
const Dog = Object.create(Animal)
Dog.init = function (name) {
  Animal.init.call(this, name, '汪汪汪')
  return this
}
Dog.fetch = function () {
  console.log(`${this.name} is fetching...`)
}

const wangcai = Object.create(Dog).init('旺财')
wangcai.speak()  // "旺财 says 汪汪汪"
wangcai.fetch()  // "旺财 is fetching..."

// 验证原型链
console.log(Object.getPrototypeOf(wangcai) === Dog)    // true
console.log(Object.getPrototypeOf(Dog) === Animal)     // true
```

### 2. 使用 getter / setter

```javascript
const person = Object.create(Object.prototype, {
  firstName: {
    value: '三',
    writable: true,
    enumerable: true,
    configurable: true
  },
  lastName: {
    value: '张',
    writable: true,
    enumerable: true,
    configurable: true
  },
  fullName: {
    get() {
      return this.lastName + this.firstName
    },
    set(name) {
      this.lastName = name.charAt(0)
      this.firstName = name.slice(1)
    },
    enumerable: true,
    configurable: true
  }
})

console.log(person.fullName) // "张三"
person.fullName = '李四'
console.log(person.firstName) // "四"
console.log(person.lastName)  // "李"
```

### 3. 实现 Object.create 的简易 polyfill

理解 `Object.create` 最好的方式是实现一个简化版本：

```javascript
function myCreate(proto, propertiesObject) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }

  function F() {}
  F.prototype = proto
  const obj = new F()

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject)
  }

  return obj
}
```

**原理说明**：

1. 创建一个空的**临时构造函数** `F`
2. 将 `F.prototype` 指向传入的 `proto`
3. 通过 `new F()` 创建新对象，此时新对象的 `[[Prototype]]` 就是 `proto`
4. 如果提供了 `propertiesObject`，则调用 `Object.defineProperties` 定义属性

### 4. 创建对象的深拷贝原型链

```javascript
const original = {
  a: 1,
  nested: { x: 10 }
}

// Object.create 是浅拷贝原型，不是深拷贝
const clone = Object.create(original)
console.log(clone.a)          // 1（从原型读取）
console.log(clone.nested.x)   // 10（从原型读取）

// 修改 clone 的自有属性不影响原型
clone.a = 100
console.log(original.a) // 1（不受影响）

// 但嵌套对象是共享的（浅拷贝）
clone.nested.x = 999
console.log(original.nested.x) // 999（被修改了！）
```

### 5. 实现 Mixin 模式（混入）

```javascript
const serializable = {
  toJSON() {
    return JSON.stringify(this)
  }
}

const loggable = {
  log() {
    console.log(`[${new Date().toISOString()}]`, this.toString())
  }
}

// 创建一个同时继承两个 mixin 的对象
const myObject = Object.create(Object.assign(serializable, loggable))
myObject.name = 'test'

myObject.log()    // 输出日志
```

---

## 常见应用场景

### 1. 安全的字典对象

```javascript
// ✅ 推荐：使用 Object.create(null) 作为字典
const cache = Object.create(null)

cache['key1'] = 'value1'
cache['key2'] = 'value2'

// 不用担心与原型属性冲突
for (const key in cache) {
  console.log(key, cache[key])
  // 只输出 key1 和 key2，不会遍历到 toString 等原型属性
}

// 检查属性也更安全
console.log('toString' in cache) // false
```

### 2. 防止原型污染

```javascript
function safeCreate(o) {
  // 确保 o 是有效的对象，避免原型污染
  if (o === null || typeof o !== 'object') {
    return Object.create(null)
  }
  return Object.create(o)
}
```

### 3. 与 class 语法配合使用（模拟抽象类）

```javascript
const AbstractShape = {
  area() {
    throw new Error('子类必须实现 area() 方法')
  },
  perimeter() {
    throw new Error('子类必须实现 perimeter() 方法')
  },
  describe() {
    console.log(`面积: ${this.area()}, 周长: ${this.perimeter()}`)
  }
}

const Circle = Object.create(AbstractShape)
Circle.init = function (radius) {
  this.radius = radius
  return this
}
Circle.area = function () {
  return Math.PI * this.radius ** 2
}
Circle.perimeter = function () {
  return 2 * Math.PI * this.radius
}

const c = Object.create(Circle).init(5)
c.describe() // "面积: 78.53981633974483, 周长: 31.41592653589793"
```

---

## 注意事项与常见陷阱

### 1. proto 参数的类型限制

```javascript
// ✅ 合法：对象
Object.create({ a: 1 })

// ✅ 合法：null
Object.create(null)

// ✅ 合法：数组（也是对象）
Object.create([1, 2, 3])

// ❌ 报错：原始值
Object.create(42)        // TypeError
Object.create('hello')   // TypeError
Object.create(true)      // TypeError
Object.create(undefined) // TypeError
```

### 2. 属性描述符默认值陷阱

```javascript
// 直接赋值 —— 描述符默认全为 true
const a = {}
a.x = 1
// 等价于：{ value: 1, writable: true, enumerable: true, configurable: true }

// Object.create 第二个参数 —— 描述符默认全为 false
const b = Object.create(null, {
  x: { value: 1 }
  // writable: false（默认）
  // enumerable: false（默认）
  // configurable: false（默认）
})

console.log(Object.keys(a)) // ["x"]
console.log(Object.keys(b)) // []（x 不可枚举）

a.x = 2
console.log(a.x) // 2

b.x = 2          // 严格模式下 TypeError
console.log(b.x) // 1（未改变）
```

### 3. Object.create 不是深拷贝

```javascript
const original = { data: [1, 2, 3] }
const copy = Object.create(original)

// copy 自身没有 data 属性，通过原型链读取
console.log(copy.data)        // [1, 2, 3]
console.log(copy.hasOwnProperty('data')) // false

// 修改共享的引用类型
copy.data.push(4)
console.log(original.data)    // [1, 2, 3, 4]（原型被修改！）
```

### 4. 创建的对象没有 constructor

```javascript
const obj = Object.create({})
console.log(obj.constructor) // ƒ Object()（从原型链继承的，不是自身的）

const obj2 = Object.create(null)
console.log(obj2.constructor) // undefined
```

---

## 方法对比总结

| 方法 | 原型指向 | 执行构造函数 | 能否定义属性 | 典型场景 |
|------|---------|-------------|-------------|---------|
| `Object.create(proto)` | `proto` | 否 | 通过第二参数 | 原型继承、纯净对象 |
| `new Constructor()` | `Constructor.prototype` | 是 | 构造函数体内 | 实例化类 |
| `{}` (字面量) | `Object.prototype` | 否 | 直接赋值 | 普通对象创建 |
| `Object.assign(target, source)` | 不改变原型 | 否 | 浅拷贝属性 | 对象合并、混入 |

---

## 兼容性

`Object.create()` 在 ES5（ECMAScript 5.1, 2009 年）中引入，所有现代浏览器均已支持。

| 环境 | 支持版本 |
|------|---------|
| Chrome | 5+ |
| Firefox | 4+ |
| Safari | 5+ |
| Edge | 12+ |
| Node.js | 全部版本 |
| IE | 9+（部分支持） |

> 在需要兼容极旧环境时，可使用上文提到的 polyfill 方案。

---

## 参考

- [MDN — Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [MDN — 属性描述符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description)
- [ECMAScript 规范 — Object.create](https://tc39.es/ecma262/#sec-object.create)
