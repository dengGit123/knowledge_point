### 一、概述

State 是 Pinia Store 中的**核心数据**，相当于组件中的 `data`（或 `ref` / `reactive`）。它是响应式的——当 State 发生变化时，所有使用了该 State 的组件都会自动更新。

简单理解：**State 就是仓库里存放的数据本身。**

> 📖 [Pinia 官方文档 - State](https://pinia.vuejs.org/zh/core-concepts/state.html)

### 二、定义 State

#### 1. 选项式 Store 中定义

```js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // state 必须是一个函数，返回初始状态对象
  // ⚠️ 写成函数是为了确保每个 Store 实例拥有独立的数据（避免引用共享）
  state: () => ({
    name: 'Alice',
    age: 25,
    hobbies: ['reading', 'coding'],
    address: {
      city: 'Beijing',
      district: 'Haidian',
    },
  }),
})
```

> ⚠️ **注意：** `state` 必须是**函数**（工厂函数），不能是对象。这和 Vue 组件中 `data` 必须是函数的原因一样——避免多个实例共享同一份引用数据。

```js
// ❌ 错误：直接写对象
state: {
  name: 'Alice',
}

// ✅ 正确：写成函数
state: () => ({
  name: 'Alice',
})
```

#### 2. Setup Store 中定义

使用 `ref` 或 `reactive` 定义：

```js
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 方式 1：用 ref 定义（推荐，更灵活）
  const name = ref('Alice')
  const age = ref(25)

  // 方式 2：用 reactive 定义（适合一组相关数据）
  const address = reactive({
    city: 'Beijing',
    district: 'Haidian',
  })

  // 方式 3：ref 包裹复杂类型
  const hobbies = ref(['reading', 'coding'])
  const profile = ref({
    avatar: 'xxx.png',
    bio: 'A developer',
  })

  return { name, age, address, hobbies, profile }
})
```

#### 3. ref vs reactive 选择

| 对比项 | `ref` | `reactive` |
| :--: | :--: | :--: |
| 支持**替换整个值** | ✅ `name.value = 'Bob'` | ❌ 不能直接替换对象 |
| 解构友好 | ✅ 配合 `storeToRefs` | ❌ 解构丢失响应式 |
| 类型推断 | ✅ 自动推断 | ⚠️ 有时需要手动标注 |
| 适用场景 | 单个值、需要整体替换的对象 | 一组强相关的属性 |
| 推荐度 | ⭐ 推荐 | 较少使用 |

```js
// ref 的优势：可以整体替换
const list = ref([1, 2, 3])
list.value = [4, 5, 6] // ✅ 直接替换

// reactive 的局限：不能整体替换
const list = reactive([1, 2, 3])
list = [4, 5, 6]       // ❌ 丢失响应式
list.splice(0, list.length, 4, 5, 6) // ✅ 但写法麻烦
```

### 三、访问 State

#### 1. 在组件中访问

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 方式 1：通过 store 实例直接访问
console.log(userStore.name)  // 'Alice'
console.log(userStore.age)   // 25

// 方式 2：解构访问（必须用 storeToRefs 保持响应式）
const { name, age } = storeToRefs(userStore)
console.log(name.value) // 'Alice'
</script>

<template>
  <!-- 模板中直接使用，不需要 .value -->
  <p>{{ userStore.name }}</p>

  <!-- 解构后在模板中使用，也不需要 .value（模板自动解包 ref） -->
  <p>{{ name }}</p>
</template>
```

#### 2. 在 Setup Store 内部访问

```js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  // 在 action / 其他函数中访问
  function increment() {
    count.value++ // 注意：在 JS 中需要 .value
  }

  // 在 getter（computed）中访问
  const doubled = computed(() => count.value * 2)

  return { count, increment, doubled }
})
```

#### 3. 访问嵌套 State

```js
const userStore = useUserStore()

// 直接点语法访问嵌套属性
console.log(userStore.address.city)     // 'Beijing'
console.log(userStore.hobbies[0])       // 'reading'

// 修改嵌套属性也是响应式的
userStore.address.city = 'Shanghai'     // ✅ 触发更新
userStore.hobbies.push('music')         // ✅ 触发更新
```

### 四、修改 State

Pinia 提供了多种修改 State 的方式：

#### 1. 直接修改

```js
const userStore = useUserStore()

// ✅ 直接修改（Pinia 允许，不像 Vuex 必须通过 mutation）
userStore.name = 'Bob'
userStore.age = 30
userStore.hobbies.push('gaming')
userStore.address.city = 'Shanghai'
```

> 💡 **与 Vuex 的区别：** Vuex 要求必须通过 `mutation` 修改 state。Pinia 去掉了这个限制，可以直接修改，也可以在 action 中修改。

#### 2. $patch —— 批量修改

```js
const userStore = useUserStore()

// 方式 A：传入对象
userStore.$patch({
  name: 'Bob',
  age: 30,
})
// ⚠️ 对象形式的 $patch 会用 Object.assign 合并
// 无法处理数组操作（push、splice 等）

// 方式 B：传入函数（推荐，更灵活）
userStore.$patch((state) => {
  state.name = 'Bob'
  state.age = 30
  state.hobbies.push('gaming') // ✅ 支持数组操作
})
```

**$patch 对象 vs 函数对比：**

| 对比项 | `$patch(object)` | `$patch(function)` |
| :--: | :--: | :--: |
| 批量修改 | ✅ | ✅ |
| 数组操作（push/splice） | ❌ | ✅ |
| 基于旧值计算 | ❌ | ✅ |
| 性能 | 多次修改合并为一次更新 | 相同 |
| 推荐度 | 简单场景可用 | ⭐ 推荐 |

```js
// ❌ $patch 对象形式无法处理数组操作
userStore.$patch({
  hobbies: userStore.hobbies.concat('gaming'), // 看起来行，但要小心引用
})

// ✅ $patch 函数形式更直观
userStore.$patch((state) => {
  state.hobbies.push('gaming')
})
```

#### 3. 在 Action 中修改（推荐）

```js
// stores/counter.js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const history = ref([])

  // ✅ 推荐做法：在 action 中封装修改逻辑
  function increment() {
    history.value.push(count.value) // 记录历史
    count.value++
  }

  function incrementBy(amount) {
    history.value.push(count.value)
    count.value += amount
  }

  function reset() {
    count.value = 0
    history.value = []
  }

  return { count, history, increment, incrementBy, reset }
})
```

> 💡 **最佳实践：** 简单的直接赋值可以写在组件里，但涉及多个 state 联动修改的复杂逻辑，建议封装到 action 中。

#### 4. 替换整个 State

```js
const userStore = useUserStore()

// $state 可以获取和替换整个 state
console.log(userStore.$state) // { name: 'Alice', age: 25, ... }

// 替换（结构必须与原 state 一致）
userStore.$state = {
  name: 'Charlie',
  age: 28,
  hobbies: ['writing'],
  address: { city: 'Guangzhou', district: 'Tianhe' },
}
```

### 五、重置 State（$reset）

将 State 恢复到**初始值**：

```js
const userStore = useUserStore()

// 修改了一些数据
userStore.name = 'Bob'
userStore.age = 30

// 重置为初始值
userStore.$reset()

console.log(userStore.name) // 'Alice'（回到初始值）
console.log(userStore.age)  // 25（回到初始值）
```

> ⚠️ **注意：** `$reset()` **仅选项式 Store 原生支持**。Setup Store 需要手动实现：

```js
// Setup Store 手动实现 $reset
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const list = ref([])

  // 手动实现
  function $reset() {
    count.value = 0
    list.value = []
  }

  return { count, list, $reset }
})

// 或者通过插件为所有 Setup Store 添加 $reset
function resetPlugin({ store }) {
  // 保存初始 state 的快照
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$reset = () => {
    store.$patch(initialState)
  }
}

const pinia = createPinia()
pinia.use(resetPlugin)
```

### 六、监听 State 变化

#### 1. watch 监听（推荐）

```vue
<script setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { name, age } = storeToRefs(userStore)

// 监听单个 state
watch(name, (newName, oldName) => {
  console.log('名字变化:', oldName, '→', newName)
})

// 监听多个 state
watch([name, age], ([newName, newAge]) => {
  console.log('名字或年龄变了:', newName, newAge)
})

// 监听嵌套对象（需要 deep）
watch(
  () => userStore.address,
  (newAddr) => {
    console.log('地址变化:', newAddr)
  },
  { deep: true }
)
</script>
```

#### 2. $subscribe 监听

```js
const userStore = useUserStore()

// $subscribe 监听 state 的任何变化
const unsubscribe = userStore.$subscribe((mutation, state) => {
  // mutation.type：变化类型
  //   'direct'          → 直接修改 state.xxx = yyy
  //   'patch object'    → $patch({ xxx: yyy })
  //   'patch function'  → $patch(state => { state.xxx = yyy })

  // mutation.storeId：Store 的 id
  console.log('Store:', mutation.storeId)
  console.log('变化类型:', mutation.type)
  console.log('当前 state:', state)
})

// 取消监听
unsubscribe()
```

**watch vs $subscribe 对比：**

| 对比项 | `watch` | `$subscribe` |
| :--: | :--: | :--: |
| 粒度 | 监听具体属性 | 监听整个 store |
| 获取旧值 | ✅ | ❌ |
| 获取变化类型 | ❌ | ✅（direct / patch） |
| 用法灵活度 | ⭐ 更灵活 | 适合全局监听 |
| 持久化场景 | 需要手动写 | 配合插件更方便 |
| 推荐场景 | 组件内监听特定数据 | 插件、日志、持久化 |

### 七、State 与组合式函数

Setup Store 的优势在于可以自由使用 Vue 的组合式函数：

```js
import { defineStore } from 'pinia'
import { ref, computed, watch, onScopeDispose } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  // watch 自动同步到 localStorage
  watch(theme, (val) => {
    localStorage.setItem('theme', val)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
})
```

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 封装通用的分页 state 逻辑
function usePagination(defaultPageSize = 10) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  function setPage(page) {
    currentPage.value = page
  }

  function setTotal(count) {
    total.value = count
  }

  function reset() {
    currentPage.value = 1
  }

  return { currentPage, pageSize, total, totalPages, setPage, setTotal, reset }
}

// 在 Store 中复用
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const pagination = usePagination(20)

  // pagination.currentPage, pagination.pageSize 等都可以直接使用

  return { products, ...pagination }
})
```

### 八、常见问题与注意事项

#### 1. 解构丢失响应式

```js
const userStore = useUserStore()

// ❌ 直接解构 → 丢失响应式
const { name, age } = userStore
// name 只是一个字符串 'Alice'，不再是响应式

// ✅ 使用 storeToRefs 解构
const { name, age } = storeToRefs(userStore)
// name 是 ref('Alice')，保持响应式

// ✅ 访问时在 JS 中需要 .value
console.log(name.value) // 'Alice'

// ✅ 模板中不需要 .value（自动解包）
// <p>{{ name }}</p>
```

#### 2. state 函数返回的对象不要共享引用

```js
// ❌ 错误：外部对象被共享
const sharedData = { count: 0 }

export const useStoreA = defineStore('a', {
  state: () => sharedData, // A 和 B 会共享同一个对象！
})
export const useStoreB = defineStore('b', {
  state: () => sharedData,
})

// ✅ 正确：每次返回新的对象
export const useStoreA = defineStore('a', {
  state: () => ({ count: 0 }),
})
```

#### 3. 数组/对象的响应式陷阱

```js
// ❌ 直接赋值新数组会丢失响应式（在 reactive 中）
const state = reactive({ list: [1, 2, 3] })
state.list = [4, 5, 6] // 在 reactive 中这是可以的
// 但如果从 store 解构出来，就可能有问题

// ✅ 使用 ref 包裹数组更安全
const list = ref([1, 2, 3])
list.value = [4, 5, 6] // ✅ 完全没问题

// ✅ 修改数组内容用变异方法
list.value.push(4)          // ✅
list.value.splice(0, 1)     // ✅
```

#### 4. 避免在 State 中存储非序列化数据

```js
// ❌ 不要在 state 中存储这些
const badState = {
  domElement: document.getElementById('app'), // DOM 节点
  handler: (e) => console.log(e),              // 函数
  circular: null,                              // 循环引用对象
}
badState.circular = badState

// 这些数据无法 JSON 序列化，会导致持久化、调试工具等出问题

// ✅ 只存储可序列化的数据
const goodState = {
  name: 'Alice',
  count: 0,
  tags: ['a', 'b'],
  config: { theme: 'dark' },
}
```

### 九、总结

| 操作 | 选项式 Store | Setup Store |
| :--: | :--: | :--: |
| 定义 | `state: () => ({})` | `ref()` / `reactive()` |
| 访问 | `store.xxx` | `store.xxx` |
| 直接修改 | `store.xxx = yyy` | `store.xxx = yyy` |
| 批量修改 | `store.$patch({})` | `store.$patch({})` |
| 重置 | `store.$reset()` ✅ | 需手动实现 |
| 监听 | `watch` / `$subscribe` | `watch` / `$subscribe` |
| 解构 | `storeToRefs(store)` | `storeToRefs(store)` |
