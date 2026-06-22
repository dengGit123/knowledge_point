### instanceof 运算符
* `instanceof` 用于判断**一个对象**是否是某个**构造函数**的实例
* 语法：`对象 instanceof 构造函数`
* 返回值：布尔值 `true` / `false`
* 本质：检测**构造函数的 `prototype`** 是否出现在**对象的原型链**上（原型链详见 [原型链](./原型链.md)）

```js
function Person() {}
const p = new Person()

p instanceof Person   // true  （p 是 Person 的实例）
p instanceof Object   // true  （原型链最终指向 Object）

const arr = [1, 2, 3]
arr instanceof Array  // true
arr instanceof Object // true  （数组也是对象）
```

---

### instanceof 的原理
* 沿着对象的 `__proto__`（原型链）逐层向上查找
* 在每一层比较：当前原型对象 `===` 构造函数的 `prototype`
* 找到了返回 `true`，一直找到原型链顶端（`null`）还没找到，返回 `false`

```
查找过程示意：p instanceof Person

p.__proto__                    →  Person.prototype   ✅ 相等，返回 true

p instanceof Object
p.__proto__ (Person.prototype)
   .__proto__ (Object.prototype) →  Object.prototype ✅ 相等，返回 true
```

---

### 常见用法

#### 1. 判断内置引用类型
```js
[] instanceof Array          // true
{} instanceof Object         // true
/abc/ instanceof RegExp      // true
new Date() instanceof Date   // true
function fn(){} fn instanceof Function  // true
```

#### 2. 判断自定义构造函数 / 类
```js
class Animal {}
class Dog extends Animal {}

const d = new Dog()
d instanceof Dog     // true
d instanceof Animal  // true  （继承关系，原型链上有 Animal）
```

#### 3. 区分错误类型
```js
try {
  null.foo
} catch (e) {
  e instanceof TypeError    // true
  e instanceof Error        // true  （TypeError 继承自 Error）
}
```

---

### 注意事项（重点）

#### 1. 只能准确判断**引用类型**，不能判断基本类型字面量
```js
'abc' instanceof String    // false  （字面量不是对象）
123 instanceof Number      // false
true instanceof Boolean    // false

// 用 new 创建的包装对象才能判断（但不推荐这么写）
new String('abc') instanceof String  // true
new Number(123) instanceof Number    // true
```

> 基本类型判断请用 `typeof`：`typeof 'abc' === 'string'`

#### 2. `null` 和 `undefined` 用 instanceof 返回 `false`（不报错）
```js
null instanceof Object       // false
undefined instanceof Object  // false
```

#### 3. 跨 `iframe` / 多窗口环境会失效（重要陷阱）
* 不同的 `window`（如 iframe）有各自独立的全局对象和内置构造函数
* 即使结构相同，跨窗口的对象 `instanceof` 也会判为 `false`
```js
const iframe = document.createElement('iframe')
document.body.appendChild(iframe)
const iframeArray = new iframe.contentWindow.Array()

iframeArray instanceof Array              // false ❌（当前窗口的 Array）
iframeArray instanceof iframe.contentWindow.Array  // true
```
> 跨环境判断类型，推荐用 `Array.isArray()` 或 `Object.prototype.toString.call()`

#### 4. `instanceof` 是**运行时**判断，依赖原型链
* 如果手动修改了原型（`Object.setPrototypeOf` / `__proto__`），结果会改变
```js
const obj = {}
obj instanceof Array        // false
Object.setPrototypeOf(obj, Array.prototype)
obj instanceof Array        // true  （原型链被改了）
```

---

### instanceof vs typeof

| 特性 | `typeof` | `instanceof` |
|:---|:---|:---|
| 作用 | 判断**数据类型**（基础类型） | 判断**对象与构造函数**的关系 |
| 能否判断具体引用类型 | ❌ 只能分出 `object`/`function` | ✅ 能区分 Array/Date/自定义类等 |
| 基本类型 | ✅ 准确（`'string'`/`'number'`…） | ❌ 字面量全返回 false |
| `null` | `typeof null === 'object'`（历史 bug） | `null instanceof X` → false |
| 原理 | 根据值的底层类型标签 | 沿原型链查找 |
| 跨窗口 | ✅ 不受影响 | ❌ 会失效 |

```js
typeof []           // 'object'   （无法区分数组）
[] instanceof Array // true       （能精确区分）

typeof null         // 'object'   （typeof 的坑）
null instanceof Object // false
```

---

### 手写实现 instanceof

```js
function myInstanceof(left, right) {
  // 1. 基本类型、null、undefined 直接返回 false（与原生行为一致）
  if (left == null || (typeof left !== 'object' && typeof left !== 'function')) {
    return false
  }
  // 2. 取左侧对象的原型
  let proto = Object.getPrototypeOf(left)
  // 3. 沿原型链向上查找
  while (proto) {
    if (proto === right.prototype) return true   // 找到了
    proto = Object.getPrototypeOf(proto)         // 继续向上
  }
  return false   // 找到 null 还没匹配，返回 false
}

// 测试
console.log(myInstanceof([], Array))          // true
console.log(myInstanceof(new Date(), Date))   // true
console.log(myInstanceof('abc', String))      // false
console.log(myInstanceof(null, Object))       // false
```

---

### instanceof 与原型链的关系
* `instanceof` 的判断**完全依赖原型链**
* 表达式 `a instanceof B` 等价于：在 `a` 的原型链上能否找到 `B.prototype`
* 因此理解 `instanceof` 的前提是理解 [原型链](./原型链.md)（`__proto__`、`prototype`、`constructor` 三者关系）

---

### 总结
* `instanceof` 判断**对象的原型链**上是否有构造函数的 `prototype`，用于**精确判断引用类型**及继承关系
* ⚠️ 不能判断基本类型字面量（用 `typeof`）、跨窗口会失效（用 `Array.isArray()` / `Object.prototype.toString.call()`）
* 与 `typeof` 互补：`typeof` 测基本类型，`instanceof` 测引用类型
* 底层就是**沿原型链查找**，可参照手写实现理解其原理
