# this 指向

> 官方文档：[MDN - this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)

---

## 一、this 是什么

`this` 是函数内部的一个**特殊引用**，指向调用该函数的对象。它的值**在运行时确定**，取决于函数的调用方式，而非定义方式。

> **通俗理解**：`this` 就是"谁调用的这个函数，`this` 就指向谁"。

---

## 二、this 的四种绑定规则

### 优先级（从高到低）

```
new 绑定 > 显式绑定（call/apply/bind） > 隐式绑定（对象调用） > 默认绑定（独立调用）
```

### 1. 默认绑定（Default Binding）

函数**独立调用**（没有任何修饰符）时，`this` 指向全局对象（浏览器中是 `window`）。严格模式下是 `undefined`。

```javascript
function foo() {
  console.log(this)
}

foo()              // window（非严格模式）
// undefined（严格模式）

// 严格模式
function bar() {
  'use strict'
  console.log(this)
}
bar()              // undefined
```

### 2. 隐式绑定（Implicit Binding）

函数作为**对象的方法调用**时，`this` 指向**调用该函数的对象**（最近的那个）。

```javascript
const obj = {
  name: 'Tom',
  greet() {
    console.log(`Hello, ${this.name}`)
  }
}

obj.greet()        // 'Hello, Tom' —— this 指向 obj

// ⚠️ 隐式丢失
const greet = obj.greet
greet()            // 'Hello, undefined' —— this 指向 window（独立调用）

// ⚠️ 回调中的隐式丢失
function doSomething(fn) {
  fn()             // 独立调用，this 丢失
}
doSomething(obj.greet)  // 'Hello, undefined'
```

### 3. 显式绑定（Explicit Binding）

使用 `call()`、`apply()`、`bind()` **手动指定** `this` 的指向。

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`)
}

const user = { name: 'Tom' }

// call —— 逐个传参
greet.call(user, 'Hello')     // 'Hello, Tom'

// apply —— 数组传参
greet.apply(user, ['Hi'])     // 'Hi, Tom'

// bind —— 返回一个新函数，永久绑定 this
const boundGreet = greet.bind(user)
boundGreet('Hey')             // 'Hey, Tom'
```

### call / apply / bind 对比

| 维度 | `call` | `apply` | `bind` |
|------|--------|---------|--------|
| 参数传递 | 逐个传参 `fn.call(obj, arg1, arg2)` | 数组传参 `fn.apply(obj, [arg1, arg2])` | 逐个传参 `fn.bind(obj, arg1)` |
| 执行时机 | **立即执行** | **立即执行** | **返回新函数**，不立即执行 |
| 绑定次数 | 仅本次调用 | 仅本次调用 | 永久绑定 |
| 返回值 | 函数的返回值 | 函数的返回值 | 绑定了 this 的新函数 |

```javascript
// bind 的偏函数特性
function add(a, b) {
  return a + b
}

const addFive = add.bind(null, 5)  // 预设第一个参数
addFive(3)                          // 8
```

### 4. new 绑定（New Binding）

使用 `new` 调用构造函数时，`this` 指向**新创建的对象**。

```javascript
function Person(name) {
  // this = 新创建的空对象 {}
  this.name = name
  // 隐式返回 this
}

const tom = new Person('Tom')
console.log(tom.name)  // 'Tom'
```

---

## 三、箭头函数的 this

箭头函数**没有自己的 `this`**，它会捕获定义时所在的**词法作用域**的 `this` 值（即外层非箭头函数的 `this`）。

```javascript
const obj = {
  name: 'Tom',

  // 普通函数 —— this 取决于调用方式
  greet() {
    console.log(this.name)  // 'Tom'（obj 调用）
  },

  // 箭头函数 —— this 继承外层
  greetArrow: () => {
    console.log(this.name)  // undefined（外层是全局作用域）
  },

  // 正确使用箭头函数
  greetLater() {
    setTimeout(() => {
      console.log(this.name)  // 'Tom'（继承 greetLater 的 this）
    }, 100)
  }
}
```

### 箭头函数 vs 普通函数的 this

```javascript
// ❌ 普通函数在回调中 this 丢失
const obj = {
  name: 'Tom',
  greetLater() {
    setTimeout(function() {
      console.log(this.name)  // undefined（this 是 window/undefined）
    }, 100)
  }
}

// ✅ 箭头函数保持 this
const obj2 = {
  name: 'Tom',
  greetLater() {
    setTimeout(() => {
      console.log(this.name)  // 'Tom'（继承外层 this）
    }, 100)
  }
}
```

### 箭头函数的限制

| 特性 | 箭头函数 | 普通函数 |
|------|---------|---------|
| `this` | 词法作用域继承 | 运行时绑定 |
| `arguments` | ❌ 没有 | ✅ 有 |
| `prototype` | ❌ 没有 | ✅ 有 |
| 构造函数 | ❌ 不能用 `new` | ✅ 可以 |
| `yield` | ❌ 不能用作 Generator | ✅ 可以 |

---

## 四、特殊场景的 this

### 1. DOM 事件处理

```javascript
// 普通函数 —— this 指向触发事件的元素
button.addEventListener('click', function() {
  console.log(this)  // <button> 元素
})

// 箭头函数 —— this 继承外层
button.addEventListener('click', () => {
  console.log(this)  // window / 外层 this
})

// 推荐：使用 event.currentTarget
button.addEventListener('click', (event) => {
  console.log(event.currentTarget)  // <button> 元素
})
```

### 2. class 中的 this

```javascript
class Counter {
  count = 0

  // 普通方法 —— this 取决于调用方式
  increment() {
    this.count++
  }

  // 箭头函数类字段 —— this 永远绑定到实例
  decrement = () => {
    this.count--
  }
}

const counter = new Counter()
const { increment, decrement } = counter

increment()   // ❌ TypeError: this is undefined（this 丢失）
decrement()   // ✅ 正常工作（箭头函数绑定到实例）
```

### 3. 原型链中的 this

```javascript
function Person(name) {
  this.name = name
}
Person.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`)
}

const tom = new Person('Tom')
tom.sayHi()           // 'Hi, Tom' —— this 指向 tom 实例

const greet = tom.sayHi
greet()               // 'Hi, undefined' —— this 丢失
greet.call(tom)       // 'Hi, Tom' —— 显式绑定
```

---

## 五、绑定优先级验证

```javascript
function foo() {
  console.log(this.name)
}

const obj1 = { name: 'obj1', foo }
const obj2 = { name: 'obj2' }

// 隐式绑定 vs 默认绑定
obj1.foo()               // 'obj1'（隐式绑定 > 默认绑定）

// 显式绑定 vs 隐式绑定
obj1.foo.call(obj2)      // 'obj2'（显式绑定 > 隐式绑定）

// new 绑定 vs 显式绑定
const boundFoo = foo.bind(obj1)
new boundFoo()            // undefined（new 绑定 > 显式绑定，this 指向新对象）
```

---

## 六、手写 call / apply / bind

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context ?? window
  const fn = Symbol('fn')       // 使用 Symbol 避免属性冲突
  context[fn] = this            // 将函数挂到 context 上
  const result = context[fn](...args)  // 执行函数
  delete context[fn]            // 删除临时属性
  return result
}

// 手写 apply
Function.prototype.myApply = function(context, args) {
  context = context ?? window
  const fn = Symbol('fn')
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}

// 手写 bind（简化版）
Function.prototype.myBind = function(context, ...bindArgs) {
  const fn = this

  const boundFn = function(...callArgs) {
    // 作为构造函数时 this 指向新实例，否则使用 context
    return fn.apply(
      this instanceof boundFn ? this : context,
      [...bindArgs, ...callArgs]
    )
  }

  // 继承原型
  boundFn.prototype = Object.create(fn.prototype)
  return boundFn
}
```

---

## 七、面试常见问题

### Q1：箭头函数和普通函数的 this 有什么区别？

- **普通函数**：`this` 在运行时确定，取决于调用方式（谁调用指向谁）
- **箭头函数**：`this` 在定义时确定，继承外层词法作用域的 `this`，无法被 `call/apply/bind` 修改

### Q2：如何解决回调函数中 this 丢失的问题？

```javascript
const obj = {
  name: 'Tom',
  greet() { console.log(this.name) }
}

// 方式一：箭头函数（推荐）
setTimeout(() => obj.greet(), 100)

// 方式二：bind
setTimeout(obj.greet.bind(obj), 100)

// 方式三：保存 this 引用
const self = obj
setTimeout(function() { self.greet() }, 100)
```

### Q3：为什么 class 方法需要绑定 this？

class 中的方法默认不会被绑定到实例。当方法被单独取出传递时（如作为回调），`this` 会丢失。解决方案：
1. 在构造函数中 `this.method = this.method.bind(this)`
2. 使用箭头函数类字段 `method = () => { ... }`
3. 在使用时绑定 `onClick={this.method.bind(this)}`

### Q4：this 的绑定优先级是什么？

**new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定**

- `new` 可以覆盖 `bind` 的绑定
- `call/apply` 可以覆盖对象方法调用的绑定
- 对象方法调用优先于独立调用
