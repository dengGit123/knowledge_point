### 一、概述

Pinia 是 Vue 3 官方推荐的**状态管理库**，用于在多个组件之间共享和管理响应式数据。你可以把它理解为一个**全局的响应式数据仓库**——所有组件都可以从中读取数据、修改数据，且数据变化会自动同步到使用它的组件。

> 📖 [Pinia 官方文档](https://pinia.vuejs.org/zh/)

### 二、核心概念

| 概念 | 通俗理解 | 说明 | 详细文档 |
| :--: | :--: | :--: | :--: |
| **Store（仓库）** | 全局的数据容器 | 存放共享数据，所有组件可访问 | — |
| **State（状态）** | 仓库里的数据 | 相当于组件的 `data`，响应式 | [→ State.md](./State.md) |
| **Getter（计算属性）** | 从 State 派生的数据 | 相当于组件的 `computed`，有缓存 | [→ Getter.md](./Getter.md) |
| **Action（动作）** | 修改 State 的方法 | 相当于组件的 `methods`，支持异步 | [→ Action.md](./Action.md) |

```
┌─────────────────────────────┐
│          Pinia Store         │
│                              │
│  State ──→ Getter（派生）    │
│    ↑                         │
│    └──── Action（修改）      │
│                              │
└──────────┬───────────────────┘
           │
     ┌─────┼─────┐
     ↓     ↓     ↓
  组件A  组件B  组件C  （共享同一份数据）
```

### 三、安装与配置

```bash
npm install pinia
```

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 四、定义 Store

Pinia 提供两种风格，推荐使用组合式（Setup Store）：

#### 1. 选项式（Option Store）

```js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0, name: '计数器' }),
  getters: {
    doubledCount: (state) => state.count * 2,
  },
  actions: {
    increment() { this.count++ },
    async fetchData() {
      const data = await (await fetch('/api/count')).json()
      this.count = data.count
    },
  },
})
```

#### 2. 组合式（Setup Store）⭐ 推荐

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // ref() → state
  const count = ref(0)
  const name = ref('计数器')

  // computed() → getter
  const doubledCount = computed(() => count.value * 2)

  // 函数 → action
  function increment() { count.value++ }

  async function fetchData() {
    const data = await (await fetch('/api/count')).json()
    count.value = data.count
  }

  return { count, name, doubledCount, increment, fetchData }
})
```

#### 3. 两种风格对比

| 对比项 | 选项式 Store | Setup Store |
| :--: | :--: | :--: |
| State | `state: () => ({})` | `ref()` / `reactive()` |
| Getter | `getters: {}` | `computed()` |
| Action | `actions: {}` | 普通函数 |
| TypeScript | 需额外类型声明 | **自动推断** ⭐ |
| 灵活性 | 固定结构 | 可用任何组合式函数 |

### 五、在组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const counter = useCounterStore()

// ✅ storeToRefs 解构保持响应式（state 和 getter）
const { count, doubledCount } = storeToRefs(counter)

// ✅ action 直接解构，无需 storeToRefs
const { increment } = counter

// ✅ 也可以通过 store 实例直接访问
// counter.count / counter.doubledCount / counter.increment()
</script>

<template>
  <p>计数：{{ count }}</p>
  <p>双倍：{{ doubledCount }}</p>
  <button @click="increment">+1</button>
</template>
```

#### 修改 State 的方式

```js
const counter = useCounterStore()

// 直接修改
counter.count++

// 批量修改
counter.$patch({ count: counter.count + 1, name: '新名字' })
counter.$patch((state) => { state.count++; state.name = '新名字' })

// 重置为初始值（仅选项式 Store 原生支持）
counter.$reset()
```

> 💡 更多 State 操作详见 [State.md](./State.md)

### 六、快速 API 参考

| 方法 / 属性 | 描述 |
| :--: | :--: |
| `store.xxx` | 访问 state / getter / action |
| `store.$patch(object \| fn)` | 批量修改 state |
| `store.$reset()` | 重置为初始值（仅选项式） |
| `store.$subscribe(fn)` | 监听 state 变化 |
| `store.$onAction(fn)` | 监听 action 调用 |
| `store.$state` | 获取 / 替换整个 state |
| `storeToRefs(store)` | 解构 state/getter，保持响应式 |

### 七、Store 之间互相调用

```js
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  function checkout() {
    const userStore = useUserStore() // ✅ 在 action 内部获取其他 store
    if (!userStore.isLoggedIn) throw new Error('请先登录')
    // ...
  }
  return { checkout }
})
```

> ⚠️ **注意：** 不要在 Store 顶层调用 `useXxxStore()`，应在 action 函数内部调用。

### 八、监听 Store 变化

```js
const counter = useCounterStore()

// 方式 1：watch（推荐，灵活）
watch(count, (newVal, oldVal) => { /* ... */ })

// 方式 2：$subscribe（监听整个 store）
counter.$subscribe((mutation, state) => {
  // mutation.type: 'direct' | 'patch object' | 'patch function'
})

// 方式 3：$onAction（监听 action 调用）
counter.$onAction(({ name, args, after, onError }) => {
  after((result) => console.log(`${name} 成功`, result))
  onError((err) => console.error(`${name} 失败`, err))
})
```

### 九、持久化插件

```bash
npm install pinia-plugin-persistedstate
```

```js
// main.js
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

```js
// 在 Store 中启用
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  // ...
  return { token }
}, {
  persist: true, // 默认持久化到 localStorage
})

// 自定义配置
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  // ...
  return { items }
}, {
  persist: {
    key: 'my-cart',
    storage: sessionStorage,
    pick: ['items'], // 只持久化指定字段
  },
})
```

### 十、Pinia vs Vuex

| 特性 | Pinia | Vuex |
| :--: | :--: | :--: |
| Vue 3 支持 | ✅ 原生 | ⚠️ 需要 vuex 4 |
| TypeScript | ✅ 自动推断 | ❌ 大量手动声明 |
| Mutation | ❌ 不需要 | ✅ 必须通过 mutation |
| 模块化 | 多 Store，天然模块化 | 单 Store + modules |
| Composition API | ✅ 原生 | ⚠️ 额外 API |
| 官方推荐 | ✅ Vue 3 官方推荐 | 已维护模式 |

> 💡 **迁移建议：** 新项目直接用 Pinia，无需再学 Vuex。

### 十一、总结

| 知识点 | 要点 | 详细文档 |
| :--: | :--: | :--: |
| **Store 定义** | `defineStore(id, setup)` 推荐组合式 | — |
| **State** | `ref()` 定义，可直接修改，`$patch` 批量修改 | [→ State.md](./State.md) |
| **Getter** | `computed()` 定义，有缓存，自动派生 | [→ Getter.md](./Getter.md) |
| **Action** | 普通函数，支持 async/await | [→ Action.md](./Action.md) |
| **组件中使用** | `useXxxStore()` + `storeToRefs` 解构 | — |
| **Store 互调** | 在 action 内部调用其他 Store | — |
| **持久化** | `pinia-plugin-persistedstate` 插件 | — |
| **监听变化** | `watch` / `$subscribe` / `$onAction` | — |
