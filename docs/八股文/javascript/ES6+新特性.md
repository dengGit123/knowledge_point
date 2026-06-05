# ES6+ 新特性

> 官方文档：[MDN - JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference)

> 规范提案：[TC39 Proposals](https://github.com/tc39/proposals)

---

## 一、let 和 const

### 块级作用域

```javascript
// var —— 函数作用域
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 输出：3, 3, 3

// let —— 块级作用域
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 输出：0, 1, 2
```

### 暂时性死区（TDZ）

```javascript
// let/const 声明的变量在块级作用域内，从块开始到声明语句之间不可访问
{
  // console.log(x)  // ReferenceError（TDZ）
  let x = 1
  console.log(x)     // 1 ✅
}
```

### const 注意事项

```javascript
const arr = [1, 2, 3]
const obj = { name: 'Tom' }

arr.push(4)         // ✅ 可以修改内容（引用没变）
obj.name = 'Jerry'  // ✅ 可以修改属性

// arr = [5, 6]     // ❌ TypeError（不能重新赋值引用）
// obj = {}         // ❌ TypeError
```

---

## 二、解构赋值（Destructuring）

### 数组解构

```javascript
const [a, b, c] = [1, 2, 3]
console.log(a, b, c)  // 1, 2, 3

// 默认值
const [x, y = 10] = [5]
console.log(x, y)  // 5, 10

// 跳过元素
const [, second, , fourth] = [1, 2, 3, 4]
console.log(second, fourth)  // 2, 4

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4]
console.log(head, tail)  // 1, [2, 3, 4]

// 交换变量
let m = 1, n = 2
[m, n] = [n, m]
```

### 对象解构

```javascript
const { name, age } = { name: 'Tom', age: 18 }
console.log(name, age)  // 'Tom', 18

// 重命名
const { name: userName, age: userAge } = { name: 'Tom', age: 18 }

// 默认值
const { x = 0, y = 0 } = { x: 5 }

// 嵌套解构
const { data: { list, total } } = response

// 剩余属性
const { a, ...rest } = { a: 1, b: 2, c: 3 }
console.log(rest)  // { b: 2, c: 3 }
```

### 函数参数解构

```javascript
function createUser({ name, age = 18, role = 'user' }) {
  return { name, age, role }
}

createUser({ name: 'Tom', age: 20 })
// { name: 'Tom', age: 20, role: 'user' }
```

---

## 三、展开运算符与剩余参数

### 展开运算符（Spread）`...`

```javascript
// 数组展开
const a = [1, 2, 3]
const b = [...a, 4, 5]          // [1, 2, 3, 4, 5]

// 对象展开（浅拷贝）
const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 }  // { a: 1, b: 2, c: 3 }

// 合并对象（后面的覆盖前面的）
const defaults = { theme: 'light', lang: 'zh' }
const userConfig = { theme: 'dark' }
const config = { ...defaults, ...userConfig }  // { theme: 'dark', lang: 'zh' }

// 函数调用时展开
const nums = [1, 5, 3, 2, 4]
Math.max(...nums)  // 5

// 数组浅拷贝
const copy = [...originalArray]
const objCopy = { ...originalObj }
```

### 剩余参数（Rest）`...`

```javascript
// 函数参数
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0)
}
sum(1, 2, 3, 4)  // 10

// 与具名参数配合
function log(level, ...messages) {
  messages.forEach(msg => console.log(`[${level}]`, msg))
}
log('INFO', '用户登录', 'IP: 192.168.1.1')
```

---

## 四、模板字符串

```javascript
const name = 'Tom'
const age = 18

// 基本用法
const greeting = `Hello, ${name}! You are ${age} years old.`

// 多行字符串
const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>Age: ${age}</p>
  </div>
`

// 表达式
const result = `2 + 3 = ${2 + 3}`       // '2 + 3 = 5'
const upper = `${name.toUpperCase()}`     // 'TOM'

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? `<mark>${values[i]}</mark>` : ''
    return result + str + value
  }, '')
}

const output = highlight`Hello ${name}, age ${age}`
// 'Hello <mark>Tom</mark>, age <mark>18</mark>'
```

---

## 五、箭头函数

```javascript
// 基本语法
const add = (a, b) => a + b

// 等价于
const add = function(a, b) { return a + b }

// 单参数可省略括号
const double = n => n * 2

// 无参数
const getRandom = () => Math.random()

// 多行需要 return
const sum = (a, b) => {
  const total = a + b
  return total
}

// 返回对象字面量需要加括号
const createUser = (name) => ({ name, role: 'user' })

// 立即执行
const result = ((x) => x * 2)(5)  // 10
```

---

## 六、Symbol

```javascript
// 创建唯一标识符
const s1 = Symbol('desc')
const s2 = Symbol('desc')
s1 === s2                    // false（始终唯一）

// 用作对象属性键
const KEY = Symbol('key')
const obj = {
  [KEY]: 'secret value',
  publicProp: 'public'
}

// 不可枚举
Object.keys(obj)             // ['publicProp']
Object.getOwnPropertySymbols(obj)  // [Symbol(key)]

// 全局注册
const g1 = Symbol.for('app.key')
const g2 = Symbol.for('app.key')
g1 === g2                    // true
Symbol.keyFor(g1)            // 'app.key'

// 内置 Symbol
// Symbol.iterator —— 迭代器
// Symbol.toPrimitive —— 类型转换
// Symbol.toStringTag —— toString 标识
```

---

## 七、Proxy 和 Reflect

### Proxy — 代理对象

```javascript
const target = { name: 'Tom', age: 18 }

const proxy = new Proxy(target, {
  // 拦截属性读取
  get(obj, prop) {
    console.log(`读取属性: ${prop}`)
    return Reflect.get(obj, prop)
  },

  // 拦截属性设置
  set(obj, prop, value) {
    console.log(`设置属性: ${prop} = ${value}`)
    return Reflect.set(obj, prop, value)
  },

  // 拦截属性删除
  deleteProperty(obj, prop) {
    console.log(`删除属性: ${prop}`)
    return Reflect.deleteProperty(obj, prop)
  },

  // 拦截 in 操作符
  has(obj, prop) {
    console.log(`检查属性: ${prop}`)
    return Reflect.has(obj, prop)
  }
})

proxy.name         // 读取属性: name → 'Tom'
proxy.age = 20     // 设置属性: age = 20
'name' in proxy    // 检查属性: name → true
delete proxy.age   // 删除属性: age
```

### 实用场景

```javascript
// 1. 数据验证
function createValidator(rules) {
  return new Proxy({}, {
    set(obj, prop, value) {
      if (rules[prop] && !rules[prop](value)) {
        throw new Error(`Invalid value for ${prop}`)
      }
      obj[prop] = value
      return true
    }
  })
}

const user = createValidator({
  age: (v) => v >= 0 && v <= 150,
  name: (v) => typeof v === 'string'
})
user.age = 20    // ✅
// user.age = -1  // Error: Invalid value for age

// 2. 私有属性保护
function createPrivate(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop.startsWith('_')) {
        throw new Error('不能访问私有属性')
      }
      return target[prop]
    }
  })
}

// 3. 响应式（Vue 3 原理）
function reactive(target) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key)  // 收集依赖
      return Reflect.get(obj, key, receiver)
    },
    set(obj, key, value, receiver) {
      const result = Reflect.set(obj, key, value, receiver)
      trigger(obj, key)  // 触发更新
      return result
    }
  })
}
```

### Reflect

`Reflect` 是一个内置对象，提供与 Proxy 拦截器对应的**默认行为**方法。

```javascript
const obj = { name: 'Tom', age: 18 }

// Reflect 方法与 Object 方法对应，但行为更统一
Reflect.get(obj, 'name')          // 'Tom'
Reflect.set(obj, 'age', 20)      // true
Reflect.has(obj, 'name')          // true
Reflect.deleteProperty(obj, 'age') // true
Reflect.ownKeys(obj)              // ['name']

// Reflect.apply 替代 Function.prototype.apply
Reflect.apply(Math.max, null, [1, 5, 3])  // 5

// Reflect.construct 替代 new
Reflect.construct(Array, [1, 2, 3])  // [1, 2, 3]
```

---

## 八、Map 和 Set

### Map — 键值对集合

```javascript
const map = new Map()

// 设置和获取
map.set('name', 'Tom')
map.set(42, 'number key')       // 任意类型作为键
map.set(obj, 'object key')

map.get('name')                  // 'Tom'
map.has('name')                  // true
map.size                         // 3

// 删除和清空
map.delete('name')
map.clear()

// 初始化
const map2 = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
])

// 遍历
for (const [key, value] of map2) {
  console.log(key, value)
}
map2.forEach((value, key) => {
  console.log(key, value)
})
```

### Set — 唯一值集合

```javascript
const set = new Set([1, 2, 3, 2, 1])
console.log(set)   // Set { 1, 2, 3 }

set.add(4)
set.delete(2)
set.has(3)         // true
set.size            // 3

// 数组去重
const unique = [...new Set([1, 2, 3, 2, 1])]  // [1, 2, 3]

// 交集
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])
const intersection = new Set([...a].filter(x => b.has(x)))  // {2, 3}

// 并集
const union = new Set([...a, ...b])  // {1, 2, 3, 4}

// 差集
const diff = new Set([...a].filter(x => !b.has(x)))  // {1}
```

### Object vs Map

| 维度 | Object | Map |
|------|--------|-----|
| 键类型 | 字符串 / Symbol | **任意类型** |
| 顺序 | ES6+ 基本有序 | **插入顺序** |
| 大小 | `Object.keys().length` | `map.size` |
| 性能 | 大量增删较慢 | **大量操作更快** |
| 迭代 | `for...in` / `Object.keys()` | `for...of` / `forEach()` |
| 默认原型 | 有（可能冲突） | 无 |
| 序列化 | 原生支持 JSON | 不直接支持 |

---

## 九、迭代器（Iterator）和 for...of

### 迭代器协议

```javascript
// 可迭代对象实现了 Symbol.iterator 方法
const arr = [1, 2, 3]
const iterator = arr[Symbol.iterator]()

iterator.next()  // { value: 1, done: false }
iterator.next()  // { value: 2, done: false }
iterator.next()  // { value: 3, done: false }
iterator.next()  // { value: undefined, done: true }
```

### 自定义迭代器

```javascript
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current <= this.last) {
          return { value: this.current++, done: false }
        }
        return { done: true }
      }
    }
  }
}

for (const num of range) {
  console.log(num)  // 1, 2, 3, 4, 5
}

// 也可用于展开运算符
[...range]  // [1, 2, 3, 4, 5]
```

### for...of vs for...in

| 维度 | `for...of` | `for...in` |
|------|-----------|-----------|
| 遍历内容 | **值** | **键（属性名）** |
| 适用对象 | 可迭代对象（Array、Map、Set、String 等） | 所有对象 |
| 原型链属性 | 不包含 | **包含** |
| Symbol 属性 | 不包含 | 不包含 |
| 推荐 | ✅ 数组/集合遍历 | 对象属性遍历 |

---

## 十、其他常用 ES6+ 特性

### 默认参数

```javascript
function createUser(name, role = 'user', active = true) {
  return { name, role, active }
}
createUser('Tom')                    // { name: 'Tom', role: 'user', active: true }
createUser('Tom', 'admin', false)    // { name: 'Tom', role: 'admin', active: false }
```

### 可选链操作符 `?.`（ES2020）

```javascript
const user = { address: { city: '北京' } }

// 安全访问深层属性
user?.address?.city        // '北京'
user?.phone?.number        // undefined（不会报错）
user?.getName?.()          // undefined（方法不存在时不调用）
user?.hobbies?.[0]         // undefined（数组索引安全访问）
```

### 空值合并运算符 `??`（ES2020）

```javascript
// 只有 null 和 undefined 时使用默认值（与 || 不同）
const value1 = null ?? 'default'      // 'default'
const value2 = undefined ?? 'default' // 'default'
const value3 = 0 ?? 'default'         // 0 ✅（0 不是 null/undefined）
const value4 = '' ?? 'default'        // '' ✅
const value5 = false ?? 'default'     // false ✅

// 对比 ||
const value6 = 0 || 'default'         // 'default' ⚠️（0 是 falsy）
const value7 = '' || 'default'        // 'default' ⚠️
```

### 逻辑赋值运算符（ES2021）

```javascript
let x = null
x ??= 'default'     // x = 'default'（仅 null/undefined 时赋值）

let y = 0
y ||= 100           // y = 100（falsy 时赋值）

let z = { count: 5 }
z.count &&= z.count + 1  // z.count = 6（truthy 时赋值）
```

### 数组方法

```javascript
const arr = [1, 2, 3, 4, 5]

// Array.from —— 从类数组或可迭代对象创建数组
Array.from('hello')           // ['h', 'e', 'l', 'l', 'o']
Array.from({ length: 3 }, (_, i) => i)  // [0, 1, 2]

// Array.of —— 创建数组
Array.of(1, 2, 3)             // [1, 2, 3]

// find / findIndex —— 查找元素
arr.find(x => x > 3)          // 4
arr.findIndex(x => x > 3)     // 3

// includes —— 包含检测
arr.includes(3)               // true

// flat / flatMap —— 扁平化
[1, [2, [3, 4]]].flat(Infinity)  // [1, 2, 3, 4]
[[1, 2], [3, 4]].flatMap(x => x) // [1, 2, 3, 4]

// fill —— 填充
new Array(3).fill(0)          // [0, 0, 0]

// at —— 按索引访问（支持负数）
arr.at(-1)                    // 5（最后一个元素）
```

---

## 十一、面试常见问题

### Q1：var、let、const 的区别？

| 维度 | `var` | `let` | `const` |
|------|-------|-------|---------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 提升 | ✅（初始化 undefined） | TDZ | TDZ |
| 重复声明 | ✅ | ❌ | ❌ |
| 重新赋值 | ✅ | ✅ | ❌ |
| 全局声明 | 挂载 window | 不挂载 | 不挂载 |

### Q2：Proxy 和 Object.defineProperty 的区别？

- Proxy 拦截整个对象，defineProperty 只能逐个属性拦截
- Proxy 可以拦截属性新增、删除、has 等更多操作
- Proxy 配合 Reflect 使用行为更一致
- Vue 3 使用 Proxy 替代 defineProperty 解决了数组索引和属性新增的问题

### Q3：展开运算符是深拷贝还是浅拷贝？

**浅拷贝**。只复制第一层引用：

```javascript
const obj = { a: 1, nested: { b: 2 } }
const copy = { ...obj }
copy.nested.b = 99
obj.nested.b   // 99（嵌套对象仍共享引用）
```

### Q4：Map 和 Object 该怎么选？

- 需要非字符串键 → **Map**
- 需要频繁增删键值对 → **Map**（性能更好）
- 需要直接 JSON 序列化 → **Object**
- 只是简单键值存储 → 都可以，**Object** 更常见
