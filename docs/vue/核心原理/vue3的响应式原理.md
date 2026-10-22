# Vue 3 响应式原理完全指南

> 本文档深入剖析 Vue 3 的响应式系统，从基础概念到源码实现，帮助你全面理解 Vue 3 的响应式原理。

## 目录

- [一、响应式基础概念](#一响应式基础概念)
- [二、响应式 API 详解](#二响应式-api-详解)
- [三、响应式实现原理](#三响应式实现原理)
- [四、依赖收集与触发](#四依赖收集与触发)
- [五、computed 计算属性](#五computed-计算属性)
- [六、watch 侦听器](#六watch-侦听器)
- [七、响应式转换工具](#七响应式转换工具)
- [八、响应式最佳实践](#八响应式最佳实践)
- [九、常见问题与调试](#九常见问题与调试)

---

## 一、响应式基础概念

### 1.1 什么是响应式

**响应式**（Reactive）是指：当数据发生变化时，能够自动更新依赖于该数据的视图或其他副作用。

```
┌─────────────────────────────────────────────────────────────┐
│                      响应式系统流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   数据变化                                                   │
│     ↓                                                       │
│   Proxy 拦截                                               │
│     ↓                                                       │
│   触发依赖                                                 │
│     ↓                                                       │
│   重新计算/执行                                             │
│     ↓                                                       │
│   视图更新                                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Vue 2 vs Vue 3 响应式对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| **实现方式** | Object.defineProperty | Proxy |
| **监听范围** | 对象属性 | 对象/数组/新增属性 |
| **数组监听** | 需要特殊处理 | 原生支持 |
| **性能** | 初始化时递归遍历 | 按需代理 |
| **内存占用** | 较高 | 较低 |
| **Map/Set 支持** | 不支持 | 支持 |

### 1.3 为什么选择 Proxy

```javascript
// ========== Vue 2 的限制 ==========
const vm = new Vue({
  data: {
    user: { name: 'John' }
  }
})

// ❌ 无法检测新增属性
vm.user.age = 25  // 不会触发更新

// ❌ 无法检测数组索引赋值
vm.items[0] = 'new'  // 不会触发更新

// ❌ 无法检测数组长度变化
vm.items.length = 0  // 不会触发更新

// ========== Vue 3 的改进 ==========
import { reactive } from 'vue'

const state = reactive({
  user: { name: 'John' },
  items: ['a', 'b', 'c']
})

// ✅ 可以检测新增属性
state.user.age = 25  // 会触发更新

// ✅ 可以检测数组索引赋值
state.items[0] = 'new'  // 会触发更新

// ✅ 可以检测数组长度变化
state.items.length = 0  // 会触发更新

// ✅ 支持 Map/Set/WeakMap/WeakSet
state.map = new Map()
state.map.set('key', 'value')  // 会触发更新
```

---

## 二、响应式 API 详解

### 2.1 reactive

创建一个响应式对象。

```javascript
import { reactive } from 'vue'

// 基本用法
const state = reactive({
  count: 0,
  user: {
    name: 'John',
    age: 25
  },
  items: ['a', 'b', 'c']
})

// 访问
console.log(state.count)  // 0
console.log(state.user.name)  // 'John'

// 修改（响应式）
state.count++
state.user.name = 'Jane'
state.items.push('d')

// 嵌套对象也是响应式的
state.user.address = { city: 'Beijing' }
state.user.address.city = 'Shanghai'  // 响应式

// ========== 限制 ==========
// ❌ 不能解构，会失去响应性
const { count } = state
count++  // 不会触发更新

// ❌ 不能整体替换 reactive 对象本身：
//    const 不允许重新赋值；即便换成 let，模板绑定的还是旧代理，更新会"断线"
state = reactive({ count: 1 })

// ✅ 正确的替换方式：修改原对象的属性
Object.assign(state, { count: 1 })
// 或
for (const key in newState) {
  state[key] = newState[key]
}
```

### 2.2 ref

创建一个响应式引用，可用于任何类型的数据。

```javascript
import { ref } from 'vue'

// 基本类型
const count = ref(0)
const message = ref('Hello')
const isActive = ref(false)

// 访问和修改（需要 .value）
console.log(count.value)  // 0
count.value++

// 对象类型
const user = ref({
  name: 'John',
  age: 25
})
console.log(user.value.name)  // 'John'
user.value.name = 'Jane'

// 数组类型
const items = ref(['a', 'b', 'c'])
items.value.push('d')

// ========== ref vs reactive ==========
// ref: 需要 .value，可以用于任何类型
const count = ref(0)
count.value++

// reactive: 不需要 .value，只能用于对象
const state = reactive({ count: 0 })
state.count++
```

```javascript
// ========== ref 解包：在 reactive 对象中作为属性访问时自动解包 ==========
const state = reactive({
  count: ref(0)
})
console.log(state.count)  // 0，不需要 .value
state.count++  // 正确，写回的还是原来的 ref

// 如果把一个新 ref 赋值给已有属性，会替换掉旧的 ref（旧 ref 不再关联）
const otherCount = ref(10)
state.count = otherCount
console.log(state.count)       // 10 —— 读取时依然自动解包，不需要 .value
console.log(otherCount.value)  // 10
// 注意：reactive 数组的元素、Map/Set 集合中的 ref 不会自动解包
```

模板中 ref 同样自动解包，不需要 `.value`：

```vue
<template>
  <div>{{ count }}</div>  <!-- 不需要 count.value -->
</template>
```

### 2.3 computed

创建一个计算属性 ref。

```javascript
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

console.log(doubled.value)  // 0
count.value++
console.log(doubled.value)  // 2

// ========== 可写的计算属性 ==========
const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

console.log(fullName.value)  // 'John Doe'
fullName.value = 'Jane Smith'
console.log(firstName.value)  // 'Jane'
console.log(lastName.value)  // 'Smith'

// ========== 计算属性缓存 ==========
// 计算属性会缓存结果，只有依赖变化时才重新计算
const count = ref(0)
const doubled = computed(() => {
  console.log('计算 doubled')
  return count.value * 2
})

doubled.value  // 输出: 计算 doubled
doubled.value  // 没有输出（使用缓存）
count.value++
doubled.value  // 输出: 计算 doubled
```

### 2.4 watch / watchEffect

侦听数据变化并执行副作用。

```javascript
import { ref, reactive, watch, watchEffect } from 'vue'

// ========== watchEffect ==========
// 自动追踪依赖，立即执行
const count = ref(0)

watchEffect(() => {
  console.log(`count is: ${count.value}`)
})
// 输出: count is: 0

count.value++
// 输出: count is: 1

// ========== watch ==========
// 需要明确指定侦听源，惰性执行
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

count.value++
// 输出: count changed from 0 to 1

// 侦听多个来源
const another = ref('hello')
watch([count, another], ([newCount, newAnother], [oldCount, oldAnother]) => {
  console.log(`count: ${oldCount} -> ${newCount}`)
  console.log(`another: ${oldAnother} -> ${newAnother}`)
})

// 侦听对象属性
const state = reactive({
  count: 0,
  user: { name: 'John' }
})

// getter 函数
watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(`count: ${oldValue} -> ${newValue}`)
  }
)

// 深度侦听
watch(
  () => state.user,
  (newValue, oldValue) => {
    console.log('user changed')
  },
  { deep: true }
)

// 立即执行
watch(
  count,
  (value) => {
    console.log(`count is: ${value}`)
  },
  { immediate: true }
)

// ========== watchEffect vs watch ==========
// watchEffect: 自动追踪依赖，立即执行
watchEffect(() => {
  console.log(count.value)
})

// watch: 明确指定侦听源，惰性执行
watch(count, (value) => {
  console.log(value)
})

// ========== 清理副作用 ==========
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })
})
```

### 2.5 响应式 API 对比表

| API | 用途 | 返回值 | 访问方式 | 适用场景 |
|-----|------|--------|----------|----------|
| **reactive** | 响应式对象 | 原对象 | 直接访问 | 复杂对象状态 |
| **ref** | 响应式引用 | Ref 对象 | .value | 基本类型、单一值 |
| **computed** | 计算属性 | Ref 对象 | .value | 派生数据 |
| **watch** | 侦听变化 | 停止函数 | - | 需要明确侦听源 |
| **watchEffect** | 自动侦听 | 停止函数 | - | 自动追踪依赖 |

---

## 三、响应式实现原理

### 3.1 Proxy 基础

```javascript
// ========== Proxy 基本语法 ==========
const target = {
  name: 'John',
  age: 25
}

const handler = {
  // 拦截属性读取
  get(target, key, receiver) {
    console.log(`读取属性: ${key}`)
    return Reflect.get(target, key, receiver)
  },

  // 拦截属性设置
  set(target, key, value, receiver) {
    console.log(`设置属性: ${key} = ${value}`)
    return Reflect.set(target, key, value, receiver)
  },

  // 拦截属性删除
  deleteProperty(target, key) {
    console.log(`删除属性: ${key}`)
    return Reflect.deleteProperty(target, key)
  },

  // 拦截 in 操作符
  has(target, key) {
    console.log(`检查属性: ${key}`)
    return Reflect.has(target, key)
  },

  // 拦截 for...in
  ownKeys(target) {
    console.log('获取所有属性键')
    return Reflect.ownKeys(target)
  }
}

const proxy = new Proxy(target, handler)

proxy.name        // 输出: 读取属性: name
proxy.age = 26    // 输出: 设置属性: age = 26
delete proxy.name  // 输出: 删除属性: name
'name' in proxy   // 输出: 检查属性: name
Object.keys(proxy)  // 输出: 获取所有属性键
```

### 3.2 Vue 3 响应式实现

```javascript
// ========== 简化版响应式实现 ==========

// 1. 依赖收集器
let activeEffect = null
const targetMap = new WeakMap()  // 目标对象 -> 依赖映射

// 2. effect 函数（副作用）
function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn
      return fn()
    } finally {
      activeEffect = null  // 真实实现用 effect 栈恢复外层 effect，此处简化
    }
  }
  effectFn.options = options  // 调度器等选项，trigger 时会用到
  effectFn()
  return effectFn
}

// 3. track 函数（收集依赖）
function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
}

// 4. trigger 函数（触发依赖）
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(fn => {
      // 有调度器就交给调度器（computed 的脏标记、组件更新的异步批处理都靠它）
      if (fn.options?.scheduler) fn.options.scheduler(fn)
      else fn()
    })
  }
}

// 5. reactive 函数
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)

      // 读取时收集依赖
      track(target, key)

      // 如果是对象，递归代理（真实实现会缓存子代理，同一子对象只代理一次）
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }

      return result
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]

      // 先改值，再触发依赖（与 Vue 真实实现一致）
      const result = Reflect.set(target, key, value, receiver)

      // hasChanged 用 Object.is 比较（能正确处理 NaN）；新增属性同样要触发
      if (!Object.is(oldValue, value)) {
        trigger(target, key)  // 真实实现还区分 ADD（新增）/ DELETE（删除）等触发类型
      }

      return result
    }
  })
}

// ========== 使用示例 ==========
const state = reactive({ count: 0 })

effect(() => {
  console.log(`count is: ${state.count}`)
})
// 输出: count is: 0

state.count++
// 输出: count is: 1
```

### 3.3 ref 实现原理

```javascript
// ========== 简化版 ref 实现 ==========
class RefImpl {
  constructor(value) {
    this._value = value
    this.dep = new Set()  // 依赖集合
  }

  get value() {
    // 收集依赖
    if (activeEffect) {
      this.dep.add(activeEffect)
    }
    return this._value
  }

  set value(newValue) {
    if (newValue !== this._value) {
      this._value = newValue
      // 触发依赖
      this.dep.forEach(effect => effect())
    }
  }
}

function ref(value) {
  return new RefImpl(value)
}

// ========== 使用示例 ==========
const count = ref(0)

effect(() => {
  console.log(`count is: ${count.value}`)
})
// 输出: count is: 0

count.value++
// 输出: count is: 1
```

### 3.4 reactive vs ref 实现区别

```
┌─────────────────────────────────────────────────────────────┐
│              reactive vs ref 实现对比                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  reactive:                                                  │
│  ├── 使用 Proxy 包装整个对象                                 │
│  ├── 通过 Proxy 拦截所有属性访问                             │
│  ├── 嵌套对象递归代理                                        │
│  ├── 访问属性直接访问（不需要 .value）                        │
│  └── 适合复杂对象                                            │
│                                                             │
│  ref:                                                       │
│  ├── 使用类包装单个值                                       │
│  ├── 通过 getter/setter 拦截 .value 访问                     │
│  ├── 访问值需要 .value                                       │
│  └── 适合基本类型和单一值                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、依赖收集与触发

### 4.1 依赖收集过程

```
┌─────────────────────────────────────────────────────────────┐
│                      依赖收集流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 执行 effect 函数                                         │
│     ↓                                                       │
│  2. 设置 activeEffect = 当前 effect                          │
│     ↓                                                       │
│  3. 访问响应式数据（proxy.value）                             │
│     ↓                                                       │
│  4. Proxy get 拦截器触发                                     │
│     ↓                                                       │
│  5. 执行 track(target, key)                                 │
│     ↓                                                       │
│  6. 将 activeEffect 添加到依赖集合                           │
│     ↓                                                       │
│  7. 执行完毕，清空 activeEffect（真实实现用 effect 栈）       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 依赖触发过程

```
┌─────────────────────────────────────────────────────────────┐
│                      依赖触发流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 修改响应式数据（proxy.value = newValue）                 │
│     ↓                                                       │
│  2. Proxy set 拦截器触发                                     │
│     ↓                                                       │
│  3. 检查值是否变化                                           │
│     ↓                                                       │
│  4. 执行 trigger(target, key)                               │
│     ↓                                                       │
│  5. 从依赖映射中获取对应的 effect 集合                        │
│     ↓                                                       │
│  6. 重新执行所有 effect                                      │
│     ↓                                                       │
│  7. 视图更新                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 WeakMap 的使用

```javascript
// ========== 1. 自动垃圾回收 ==========
const targetMap = new WeakMap()

let obj = { key: 'value' }
const proxy = reactive(obj)

// 收集依赖
effect(() => {
  console.log(proxy.key)
})

// 删除引用
obj = null

// WeakMap 中的 entry 会被自动垃圾回收
// 不会造成内存泄漏
```

```javascript
// ========== 2. 键必须是对象 ==========
const map = new Map()
const weakMap = new WeakMap()

map.set('key', 'value')      // ✓ 可以用字符串作为键
weakMap.set('key', 'value')  // ✗ 只能用对象作为键

const obj = { id: 1 }
weakMap.set(obj, 'value')    // ✓ 正确
```

```javascript
// ========== 3. 不可枚举 ==========
const weakMap = new WeakMap()
weakMap.set({ id: 1 }, 'value')

console.log(Object.keys(weakMap))    // []，无法遍历 WeakMap 的键
console.log(Object.values(weakMap))  // []
```

---

## 五、computed 计算属性

### 5.1 computed 实现原理

```javascript
// ========== 简化版 computed 实现（dirty 标记 + 调度器）==========

class ComputedRefImpl {
  constructor(getter) {
    this._value = undefined
    this._dirty = true    // 脏标记：true 表示缓存失效，需要重新计算
    this._dep = new Set() // 依赖此 computed 的 effect 集合

    // 内部 effect：追踪 getter 的依赖；依赖变化时通过 scheduler 走"标脏"逻辑
    this._effect = effect(getter, {
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true               // ① 只标记缓存失效，不立刻重算
          this._dep.forEach(fn => fn())    // ② 通知依赖此 computed 的 effect
        }
      }
    })
  }

  get value() {
    // 收集依赖此 computed 的 effect
    if (activeEffect) {
      this._dep.add(activeEffect)
    }
    // 脏检查：缓存失效时才真正重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect()
    }
    return this._value
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter)
}

// ========== 使用示例 ==========
const count = ref(0)
const doubled = computed(() => count.value * 2)

effect(() => {
  console.log(`doubled is: ${doubled.value}`)
})
// 输出: doubled is: 0

count.value++
// 输出: doubled is: 2
```

### 5.2 computed 缓存机制

缓存的关键就是上面那个 `_dirty` 标记，读写时序如下：

```javascript
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 1. 首次访问 doubled.value → _dirty 为 true → 真正计算，结果缓存
console.log(doubled.value)  // 输出: 0

// 2. 再次访问 → _dirty 为 false → 直接返回缓存，getter 不执行
console.log(doubled.value)  // 输出: 0

// 3. 依赖变化 → scheduler 只把 _dirty 标回 true，并不计算
count.value++

// 4. 下一次访问 → 发现缓存失效 → 才重新计算
console.log(doubled.value)  // 输出: 2
```

> 💡 关键在"依赖变化时只标脏、不重算"：如果没有任何地方读取 `doubled`，即使 `count` 改了一百次，getter 也一次都不会执行——这就是 computed 的惰性计算。

### 5.3 computed vs 方法

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// ========== computed ==========
// 有缓存，依赖不变不重新计算
const doubled = computed(() => {
  console.log('计算 doubled')
  return count.value * 2
})

doubled.value  // 输出: 计算 doubled
doubled.value  // 没有输出（使用缓存）
count.value++
doubled.value  // 输出: 计算 doubled

// ========== 方法 ==========
// 每次调用都执行
function doubled() {
  console.log('执行 doubled 方法')
  return count.value * 2
}

doubled()  // 输出: 执行 doubled 方法
doubled()  // 输出: 执行 doubled 方法
```

---

## 六、watch 侦听器

### 6.1 watch 实现原理

```javascript
// ========== 简化版 watch 实现 ==========

function watch(source, cb, options = {}) {
  // 1. 归一化 getter：函数直接用；reactive 对象则递归遍历一遍以收集所有依赖（深侦听）
  const getter =
    typeof source === 'function' ? source : () => traverse(source)

  let oldValue
  let cleanup = null
  let stopped = false

  // 供回调注册"下次执行前清理"的逻辑
  const onCleanup = (fn) => {
    cleanup = fn
  }

  const run = () => {
    if (cleanup) { cleanup(); cleanup = null }
    const newValue = getter()
    oldValue = newValue
    return newValue
  }

  // 2. 首次执行：收集依赖 + 记录初始值（此时不调用 cb）
  effect(run, {
    scheduler: () => {          // 依赖变化时走调度器，而不是立刻重跑
      if (stopped) return
      if (cleanup) { cleanup(); cleanup = null }
      const newValue = getter()
      cb(newValue, oldValue, onCleanup)  // 新旧值都拿到了，才调用回调
      oldValue = newValue
    }
  })

  // 3. immediate：首次就以 (新值, undefined) 调用回调
  if (options.immediate) {
    cb(oldValue, undefined, onCleanup)
  }

  // 4. 返回停止函数（真实实现还会停止内部 effect 的依赖收集）
  return () => {
    stopped = true
  }
}

// 遍历对象（深度侦听）
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return value
  }
  seen.add(value)

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else {
    for (const key in value) {
      traverse(value[key], seen)
    }
  }

  return value
}
```

> 💡 `flush: 'post'` 在真实实现里是把回调任务放进**组件更新之后**执行的队列（`queuePostRenderEffect`），而不是简单的 `Promise.then`——这保证了回调读到的是更新后的 DOM。

### 6.2 watchEffect 实现原理

```javascript
// ========== 简化版 watchEffect 实现 ==========

function watchEffect(fn) {
  let cleanup = null
  let stopped = false

  const job = () => {
    if (stopped) return
    if (cleanup) { cleanup(); cleanup = null }  // 重跑前清理上一次的副作用
    fn((newFn) => {       // 向回调传入 onCleanup，供注册清理逻辑
      cleanup = newFn
    })
  }

  effect(job)  // 立即执行一次；之后依赖变化时自动重新执行 job

  return () => {
    stopped = true
    if (cleanup) cleanup()
  }
}
```

### 6.3 watch vs watchEffect

| 特性 | watch | watchEffect |
|------|-------|-------------|
| **依赖追踪** | 手动指定 | 自动追踪 |
| **执行时机** | 惰性（依赖变化时） | 立即 |
| **访问新旧值** | 支持 | 不支持 |
| **清理副作用** | 支持 | 支持 |

---

## 七、响应式转换工具

### 7.1 toRef

为响应式对象的某个属性创建一个 ref。

```javascript
import { reactive, toRef } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: 'John'
  }
})

// 创建单个属性的 ref
const countRef = toRef(state, 'count')

// 访问和修改
console.log(countRef.value)  // 0
countRef.value++  // state.count 也会变成 1

// 保持响应性连接
console.log(state.count)  // 1

// ========== 应用场景 ==========
// 1. 解构时保持响应性
function useFeature() {
  const state = reactive({
    count: 0,
    name: 'feature'
  })

  // 返回单个 ref 而不是整个对象
  return {
    count: toRef(state, 'count'),
    name: toRef(state, 'name')
  }
}

// 2. 传递给子组件
h(ChildComponent, {
  count: toRef(state, 'count')
})
```

### 7.2 toRefs

将响应式对象转换为普通对象，其中每个属性都是 ref。

```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'John',
  age: 25
})

// 转换为 refs
const stateAsRefs = toRefs(state)

// 使用
const { count, name, age } = toRefs(state)

count.value++  // 会更新 state.count
console.log(state.count)  // 1

// ========== 应用场景 ==========
// 1. 解构响应式对象
export function useCounter() {
  const state = reactive({
    count: 0,
    doubled: computed(() => state.count * 2)
  })

  // 返回解构后的 refs
  return {
    ...toRefs(state),
    increment: () => state.count++
  }
}

// 2. 在 setup 中使用
import { toRefs } from 'vue'

export default {
  setup() {
    const state = reactive({
      count: 0,
      name: 'John'
    })

    return {
      ...toRefs(state)
    }
  }
}
```

### 7.3 toRaw

返回响应式对象的原始对象。

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'John' }
})

// 获取原始对象
const rawState = toRaw(state)

// rawState 不是响应式的
rawState.count++  // 不会触发更新

// ========== 应用场景 ==========
// 1. 判断代理背后是不是同一个原始对象
const raw = { id: 1 }
const state = reactive(raw)
console.log(toRaw(state) === raw)  // true

// 2. 避免响应式开销
const rawData = toRaw(reactiveData)
processData(rawData)  // 处理数据不需要响应式
```

### 7.4 isRef / isReactive

检查是否为 ref 或响应式对象。

```javascript
import { ref, reactive, isRef, isReactive } from 'vue'

const count = ref(0)
const state = reactive({ count: 0 })
const plain = { count: 0 }

console.log(isRef(count))  // true
console.log(isRef(state))  // false
console.log(isRef(plain))  // false

console.log(isReactive(count))  // false
console.log(isReactive(state))  // true
console.log(isReactive(plain))  // false
```

---

## 八、响应式最佳实践

### 8.1 选择 reactive 还是 ref

```javascript
// ========== 使用 reactive 的场景 ==========
// 1. 复杂对象状态
const state = reactive({
  user: {
    name: 'John',
    age: 25,
    address: {
      city: 'Beijing'
    }
  },
  items: [],
  config: {
    theme: 'light',
    lang: 'zh-CN'
  }
})

// 2. 多个相关属性
const formState = reactive({
  username: '',
  password: '',
  email: '',
  agree: false
})

// ========== 使用 ref 的场景 ==========
// 1. 基本类型
const count = ref(0)
const message = ref('Hello')
const isActive = ref(false)

// 2. 单一值
const isLoading = ref(false)
const error = ref(null)

// 3. 需要替换整个对象
const user = ref({
  name: 'John',
  age: 25
})
// 可以替换
user.value = {
  name: 'Jane',
  age: 30
}

// ========== 混合使用 ==========
export function useUserList() {
  const state = reactive({
    items: [],
    loading: false,
    error: null
  })

  const totalCount = computed(() => state.items.length)

  const currentPage = ref(1)

  return {
    ...toRefs(state),
    totalCount,
    currentPage
  }
}
```

### 8.2 避免响应式丢失

```javascript
// ========== 问题 1：解构 ==========
// ❌ 错误：解构会丢失响应性
const state = reactive({ count: 0 })
const { count } = state
count++  // 不会触发更新

// ✅ 正确：使用 toRefs
const { count } = toRefs(state)
count.value++  // 会触发更新

// ========== 问题 2：直接赋值 ==========
// ❌ 错误：直接赋值会丢失响应性
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // 错误

// ✅ 正确：使用 Object.assign
Object.assign(state, { count: 1 })

// ✅ 正确：逐个属性赋值
state.count = 1

// ========== 问题 3：数组的"替换"与"修改" ==========
const items = reactive(['a', 'b', 'c'])

// ❌ 整体替换 reactive 变量本身：模板绑定的还是旧代理，不会触发更新
// items = ['d', 'e', 'f']

// ✅ 直接在原数组上修改，Proxy 全部能拦截（含索引赋值、length）
items.push('d')
items.splice(0, 1)
items[0] = 'new'

// ✅ 需要整体替换时，用 ref 包装数组（对 .value 赋值本身就是响应式的）
const list = ref(['a', 'b', 'c'])
list.value = list.value.filter((x) => x !== 'a')
```

### 8.3 深层响应式 vs 浅层响应式

```javascript
import { reactive, ref, shallowReactive, shallowRef, readonly } from 'vue'

// ========== reactive 深层响应式 ==========
const state = reactive({
  user: {
    name: 'John',
    address: {
      city: 'Beijing'
    }
  }
})

// 深层修改也会触发更新
state.user.address.city = 'Shanghai'  // 会触发更新

// ========== shallowReactive 浅层响应式 ==========
const shallowState = shallowReactive({
  user: {
    name: 'John',
    address: {
      city: 'Beijing'
    }
  }
})

// 只有第一层修改会触发更新
shallowState.user = { name: 'Jane' }  // 会触发更新
shallowState.user.name = 'Jane'  // 不会触发更新

// ========== shallowRef 浅层 ref ==========
const shallowData = shallowRef({
  nested: {
    value: 1
  }
})

// 只有 .value 赋值会触发更新
shallowData.value.nested.value++  // 不会触发更新
shallowData.value = { nested: { value: 2 } }  // 会触发更新

// ========== 应用场景 ==========
// 1. 大型数据优化
const bigData = shallowReactive({
  // 大量嵌套数据
})

// 2. 只读数据配合 readonly
const state = shallowReactive(readonly(rawData))

// 3. 集成第三方库
const chartInstance = shallowRef(null)
// 修改 chartInstance.value.xxx 不会触发响应式
// 只需要重新赋值时更新
chartInstance.value = initChart()
```

---

## 九、常见问题与调试

### 9.1 常见问题

#### 问题 1：响应式丢失

```javascript
// ❌ 问题
const state = reactive({ count: 0 })
const { count } = state
count++  // 不会触发更新

// ✅ 解决方案 1：使用 toRefs
const { count } = toRefs(state)
count.value++

// ✅ 解决方案 2：直接访问
state.count++
```

#### 问题 2：watch 不触发

```javascript
// ❌ 问题
const state = reactive({ count: 0 })
watch(state.count, (val) => {
  console.log(val)
})
state.count++  // 不会触发

// ✅ 解决方案：使用 getter 函数
watch(() => state.count, (val) => {
  console.log(val)
})
state.count++  // 会触发
```

#### 问题 3：computed 不更新

```javascript
// 这不是 bug：computed 只有依赖变化才会重算，否则返回缓存
const count = ref(0)
const doubled = computed(() => count.value * 2)
count.value = 0  // 依赖没变，doubled 保持缓存值是正常行为
```

排查方向：依赖是否真的变化了？依赖是否因为解构、非响应式数据而根本没被 track？

### 9.2 调试技巧

#### 查看 Proxy 对象

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({ count: 0 })

// 查看原始对象（内部标志 __v_raw，或直接用 toRaw）
console.log(state.__v_raw)
console.log(toRaw(state))
```

#### 使用 devtools

```javascript
// Vue DevTools 会显示响应式状态
// 可以查看：
// - 组件的响应式数据
// - computed 计算属性
// - watch 侦听器
// - 组件树
```

#### 自定义日志

```javascript
import { reactive, watchEffect } from 'vue'

const state = reactive({ count: 0 })

// onTrack / onTrigger 是调试钩子，作为选项传入 watchEffect / watch（仅开发模式生效）
watchEffect(
  () => {
    console.log('state changed:', state.count)
  },
  {
    onTrack(event) {
      console.log('track:', event)    // 依赖被收集时触发
    },
    onTrigger(event) {
      console.log('trigger:', event)  // 依赖变化触发重新执行时触发
    }
  }
)
```

### 9.3 性能优化

```javascript
// ========== 1. 使用 shallowReactive/shallowRef ==========
// 避免深层响应式转换的开销
const bigData = shallowReactive(largeObject)

// ========== 2. 避免不必要的响应式 ==========
// 不需要响应式的数据不要包装
const CONSTANTS = {
  API_URL: 'https://api.example.com',
  MAX_COUNT: 100
}

// ========== 3. 合理使用 computed ==========
// computed 有缓存，适合复杂计算
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ========== 4. 防抖/节流 watch ==========
import { watch } from 'vue'
import { debounce } from 'lodash-es'

watch(
  searchQuery,
  debounce((val) => {
    fetchResults(val)
  }, 300)
)
```

---

## 总结

### Vue 3 响应式核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                 Vue 3 响应式系统架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────┐          │
│   │              响应式 API                       │          │
│   │  reactive / ref / computed / watch          │          │
│   └──────────────────┬──────────────────────────┘          │
│                      │                                      │
│                      ↓                                      │
│   ┌─────────────────────────────────────────────┐          │
│   │           Proxy 响应式转换                   │          │
│   │  - get: 收集依赖（track）                    │          │
│   │  - set: 触发依赖（trigger）                  │          │
│   └──────────────────┬──────────────────────────┘          │
│                      │                                      │
│                      ↓                                      │
│   ┌─────────────────────────────────────────────┐          │
│   │            依赖收集系统                       │          │
│   │  - WeakMap<target, Map<key, Set<effect>>>  │          │
│   └──────────────────┬──────────────────────────┘          │
│                      │                                      │
│                      ↓                                      │
│   ┌─────────────────────────────────────────────┐          │
│   │            Effect 副作用                      │          │
│   │  - 重新执行                                  │          │
│   │  - 更新视图                                  │          │
│   └─────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 关键要点

1. **Proxy vs Object.defineProperty**
   - Proxy 更强大，可以拦截更多操作
   - Proxy 支持数组、新增属性等
   - reactive 使用 Proxy 实现

2. **reactive vs ref**
   - reactive：用于对象，直接访问
   - ref：用于任何类型，通过 .value 访问
   - 在模板中 ref 自动解包

3. **computed vs watch**
   - computed：有缓存，用于派生数据
   - watch：无缓存，用于副作用
   - watchEffect：自动追踪依赖

4. **依赖收集**
   - 执行 effect 时自动收集依赖
   - 使用 WeakMap 存储依赖关系
   - 依赖变化时重新执行 effect

5. **性能优化**
   - computed 缓存机制
   - shallowReactive/shallowRef 减少开销
   - 避免不必要的响应式转换

### 参考资源

- [Vue 3 响应式官方文档](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 3 Reactivity API](https://cn.vuejs.org/api/reactivity-core.html)
- [Vue 3 源码分析](https://github.com/vuejs/core/tree/main/packages/reactivity)
