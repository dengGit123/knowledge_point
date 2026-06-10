> 📖 [官方文档 - shallowReadonly](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreadonly)

### 一、概述

`shallowReadonly()` 是 Vue 3 提供的一个响应式 API，用于创建一个**浅层只读代理**。它是 `readonly()` 的浅层版本，只会将对象的**根级属性**设为只读，嵌套对象不会被递归地转为只读。

简单来说，`shallowReadonly()` 就像给一个对象套上了一层"透明保护罩"——只有最外层的属性被锁住了，不允许修改；而内层嵌套的对象仍然可以自由修改。

**为什么需要它？**

- **性能优化**：`readonly()` 会对整个对象树进行递归代理转换，当对象非常庞大或嵌套层级很深时，这会带来显著的性能开销。`shallowReadonly()` 只代理第一层，避免了递归转换的代价。
- **灵活控制**：有些场景下我们只需要保护顶层配置不被外部修改，但嵌套的子对象需要由内部逻辑来维护可变性。`shallowReadonly()` 提供了这种精细化的控制能力。
- **与其他系统集成**：当需要与第三方状态管理库或大型不可变数据源集成时，`shallowReadonly()` 可以避免不必要的深层代理转换。

### 二、核心原理

`shallowReadonly()` 的工作原理基于 ES6 的 Proxy 代理机制：

1. **代理拦截**：对传入对象的 `set`、`deleteProperty` 等操作进行拦截，阻止对根级属性的修改和删除。
2. **浅层转换**：只对传入对象的第一层属性进行只读代理，不会递归遍历嵌套对象。
3. **值原样存储**：属性的值会被原样存储和暴露，值为 `ref` 的属性**不会**被自动解包。
4. **开发模式警告**：在开发环境下，尝试修改根级属性时会在控制台输出警告信息；在生产环境下，修改操作会静默失败（不抛出错误，但值不会改变）。

```
┌──────────────────────────────────┐
│        shallowReadonly(obj)       │
├──────────────────────────────────┤
│  根级属性 foo  ──►  只读（锁定）    │
│  根级属性 bar  ──►  只读（锁定）    │
│  根级属性 nested ──► 可变（未锁定）│
│    ├─ nested.a ──►  可变          │
│    └─ nested.b ──►  可变          │
└──────────────────────────────────┘
```

### 三、详细用法

#### 1. 基本用法

```ts
import { shallowReadonly } from 'vue'

interface State {
  foo: number
  nested: {
    bar: number
  }
}

const state = shallowReadonly<State>({
  foo: 1,
  nested: {
    bar: 2
  }
})

// ❌ 根级属性不可修改 —— 控制台会输出警告
state.foo = 2
// [Vue warn]: Set operation on key "foo" failed: target is readonly.

// ❌ 根级属性不可删除
delete (state as any).foo
// [Vue warn]: Delete operation on key "foo" failed: target is readonly.

// ✅ 嵌套对象可以修改 —— 不会触发警告
state.nested.bar = 3
console.log(state.nested.bar) // 3
```

#### 2. 进阶用法

**与 reactive 配合使用**

```ts
import { reactive, shallowReadonly, toRaw } from 'vue'

interface AppConfig {
  apiUrl: string
  timeout: number
  features: {
    darkMode: boolean
    i18n: boolean
  }
}

// 内部维护可变状态
const internalConfig = reactive<AppConfig>({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: {
    darkMode: true,
    i18n: true
  }
})

// 对外暴露只读视图
export const config = shallowReadonly(internalConfig)

// 通过专门的方法修改
export function updateConfig<K extends keyof AppConfig>(
  key: K,
  value: AppConfig[K]
): void {
  internalConfig[key] = value
}

// ✅ 通过方法修改 —— 正确做法
updateConfig('apiUrl', 'https://new-api.example.com')

// ❌ 直接修改 —— 会被阻止
// config.apiUrl = 'https://hack.example.com'
```

**在组合式函数中返回只读状态**

```ts
import { ref, shallowReadonly, computed, type Ref, type ShallowReadonly } from 'vue'

interface User {
  id: number
  name: string
  role: string
}

export function useUser() {
  const user = ref<User | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchUser(id: number): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/users/${id}`)
      user.value = await response.json()
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  // 对外暴露只读状态，防止外部直接修改
  return {
    user: shallowReadonly(user) as ShallowReadonly<Ref<User | null>>,
    loading: shallowReadonly(loading) as ShallowReadonly<Ref<boolean>>,
    error: shallowReadonly(error) as ShallowReadonly<Ref<string | null>>,
    fetchUser
  }
}
```

**与 provide / inject 配合使用**

```vue
<!-- 父组件：提供只读配置 -->
<script setup lang="ts">
import { reactive, shallowReadonly, provide } from 'vue'

interface ThemeConfig {
  primaryColor: string
  fontSize: number
  layout: {
    sidebarWidth: number
    headerHeight: number
  }
}

const theme = reactive<ThemeConfig>({
  primaryColor: '#409eff',
  fontSize: 14,
  layout: {
    sidebarWidth: 200,
    headerHeight: 60
  }
})

// ✅ 提供只读版本，子组件无法修改根级属性
provide('theme', shallowReadonly(theme))
</script>
```

```vue
<!-- 子组件：注入并使用只读配置 -->
<script setup lang="ts">
import { inject, type ShallowReadonly } from 'vue'

interface ThemeConfig {
  primaryColor: string
  fontSize: number
  layout: {
    sidebarWidth: number
    headerHeight: number
  }
}

const theme = inject<ShallowReadonly<ThemeConfig>>('theme')!

// ✅ 可以读取
console.log(theme.primaryColor) // '#409eff'

// ❌ 不能修改根级属性
// theme.primaryColor = '#f00' // 警告：target is readonly
</script>
```

**利用 isReadonly 检测代理状态**

```ts
import { shallowReadonly, readonly, isReadonly } from 'vue'

const state = {
  nested: { count: 0 }
}

const shallow = shallowReadonly(state)
const deep = readonly(state)

// shallowReadonly 只保护第一层
console.log(isReadonly(shallow))        // true
console.log(isReadonly(shallow.nested)) // false —— 嵌套对象不是只读的

// readonly 递归保护所有层级
console.log(isReadonly(deep))        // true
console.log(isReadonly(deep.nested)) // true —— 嵌套对象也是只读的
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `target` | `T extends object` | 需要创建只读代理的原始对象，必须是对象类型（不支持原始值） |
| **返回值** | `Readonly<T>` | 返回原始对象的浅层只读代理 |

**函数签名：**

```ts
function shallowReadonly<T extends object>(target: T): Readonly<T>
```

> 💡 **提示：** `shallowReadonly()` 的泛型约束为 `T extends object`，因此不能传入原始值（如数字、字符串、布尔值）。如果需要创建只读的原始值引用，请使用 `readonly(ref(value))` 或 `computed(() => value)`。

### 四、实现效果

使用 `shallowReadonly()` 后，可以得到以下行为效果：

```ts
import { shallowReadonly, isReadonly, isReactive } from 'vue'

const state = shallowReadonly({
  count: 0,
  message: 'hello',
  config: {
    theme: 'light',
    lang: 'zh-CN'
  }
})

// ────── 读取行为 ──────
console.log(state.count)          // 0 —— ✅ 正常读取
console.log(state.config.theme)   // 'light' —— ✅ 正常读取嵌套属性

// ────── 修改行为 ──────
state.count = 1
// 开发环境：[Vue warn]: Set operation on key "count" failed: target is readonly.
// 生产环境：静默失败，值不变
console.log(state.count)          // 0 —— 修改无效

state.config.theme = 'dark'
// ✅ 修改成功，嵌套对象不受保护
console.log(state.config.theme)   // 'dark'

// ────── 检测行为 ──────
console.log(isReadonly(state))        // true —— 代理本身是只读的
console.log(isReadonly(state.config)) // false —— 嵌套对象不是只读的
```

**响应式追踪效果：**

```ts
import { shallowReadonly, watch, reactive } from 'vue'

const original = reactive({
  name: 'Vue',
  version: 3
})

const readonlyState = shallowReadonly(original)

// ✅ 可以侦听只读代理的变化（当原始对象变化时）
watch(
  () => readonlyState.name,
  (newVal) => {
    console.log(`name 变为: ${newVal}`)
  }
)

// 通过修改原始对象来触发变化
original.name = 'Vue.js'
// 控制台输出：name 变为: Vue.js
```

### 五、使用场景

#### 场景 1：保护应用全局配置

```ts
// src/composables/useAppConfig.ts
import { reactive, shallowReadonly, type ShallowReadonly } from 'vue'

interface AppConfig {
  apiBaseUrl: string
  appName: string
  version: string
  features: Record<string, boolean>
}

const defaultConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: 'My App',
  version: '1.0.0',
  features: {
    darkMode: true,
    notifications: true
  }
}

const config = reactive<AppConfig>({ ...defaultConfig })

// ✅ 对外暴露只读配置
export function useAppConfig(): {
  config: ShallowReadonly<AppConfig>
  setConfig: (key: keyof AppConfig, value: any) => void
  resetConfig: () => void
} {
  function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    config[key] = value
  }

  function resetConfig(): void {
    Object.assign(config, { ...defaultConfig })
  }

  return {
    config: shallowReadonly(config),
    setConfig,
    resetConfig
  }
}
```

#### 场景 2：封装状态管理 store 的只读接口

```ts
// src/stores/userStore.ts
import { reactive, shallowReadonly, computed, type ShallowReadonly } from 'vue'

interface UserState {
  userInfo: { id: number; name: string; avatar: string } | null
  token: string | null
  permissions: string[]
  settings: {
    theme: 'light' | 'dark'
    language: string
  }
}

const state = reactive<UserState>({
  userInfo: null,
  token: null,
  permissions: [],
  settings: {
    theme: 'light',
    language: 'zh-CN'
  }
})

export function useUserStore() {
  // ✅ 只读状态 —— 外部不能直接修改 token、userInfo 等根级属性
  const readonlyState = shallowReadonly(state)

  const isLoggedIn = computed(() => !!state.token)

  function login(token: string, userInfo: UserState['userInfo']): void {
    state.token = token
    state.userInfo = userInfo
  }

  function logout(): void {
    state.token = null
    state.userInfo = null
    state.permissions = []
  }

  function updateTheme(theme: 'light' | 'dark'): void {
    state.settings.theme = theme
  }

  return {
    state: readonlyState,
    isLoggedIn,
    login,
    logout,
    updateTheme
  }
}
```

#### 场景 3：Vue 插件配置保护

```ts
// src/plugins/analytics.ts
import { reactive, shallowReadonly, type App, type ShallowReadonly } from 'vue'

interface AnalyticsOptions {
  trackingId: string
  debug: boolean
  customDimensions: Record<string, string>
}

export function createAnalyticsPlugin(defaultOptions: AnalyticsOptions) {
  const options = reactive<AnalyticsOptions>({ ...defaultOptions })

  return {
    install(app: App): void {
      // ✅ 向应用提供只读配置
      app.provide<ShallowReadonly<AnalyticsOptions>>('analyticsOptions', shallowReadonly(options))

      // 提供内部方法来修改配置
      app.provide('updateAnalyticsOption', <K extends keyof AnalyticsOptions>(
        key: K,
        value: AnalyticsOptions[K]
      ): void => {
        options[key] = value
      })
    }
  }
}
```

#### 场景 4：表单初始值快照与重置

```vue
<script setup lang="ts">
import { reactive, shallowReadonly } from 'vue'

interface FormData {
  username: string
  email: string
  age: number
  preferences: {
    newsletter: boolean
    notifications: boolean
  }
}

const initialValues: FormData = {
  username: '',
  email: '',
  age: 0,
  preferences: {
    newsletter: true,
    notifications: true
  }
}

const form = reactive<FormData>({ ...initialValues })

// ✅ 保存初始值快照，根级属性不可修改，保证快照安全
const snapshot = shallowReadonly<FormData>({ ...initialValues })

function resetForm(): void {
  Object.assign(form, {
    ...snapshot,
    preferences: { ...snapshot.preferences }
  })
}

function isFormChanged(): boolean {
  return (
    form.username !== snapshot.username ||
    form.email !== snapshot.email ||
    form.age !== snapshot.age
  )
}

function handleSubmit(): void {
  console.log('提交数据:', { ...form })
  resetForm()
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.email" type="email" placeholder="邮箱" />
    <input v-model.number="form.age" type="number" placeholder="年龄" />
    <button type="button" @click="resetForm" :disabled="!isFormChanged()">
      重置
    </button>
    <button type="submit">提交</button>
  </form>
</template>
```

#### 场景 5：API 响应数据缓存

```ts
// src/composables/useApiCache.ts
import { ref, shallowReadonly, type Ref, type ShallowReadonly } from 'vue'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export function useApiCache() {
  const cache = ref<Record<string, CacheEntry<any>>>({})

  function setCache<T>(key: string, data: T, ttl: number = 60000): void {
    cache.value[key] = {
      data,
      timestamp: Date.now(),
      ttl
    }
  }

  // ✅ 返回只读版本，防止调用方修改缓存中的数据
  function getCache<T>(key: string): ShallowReadonly<CacheEntry<T>> | null {
    const entry = cache.value[key]
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      delete cache.value[key]
      return null
    }

    return shallowReadonly(entry)
  }

  function clearCache(key?: string): void {
    if (key) {
      delete cache.value[key]
    } else {
      cache.value = {}
    }
  }

  return { setCache, getCache, clearCache }
}
```

#### 场景 6：组件间共享常量配置

```ts
// src/composables/useConstants.ts
import { shallowReadonly } from 'vue'

interface PaginationConfig {
  pageSize: number
  pageSizes: number[]
  layout: string
  background: boolean
}

interface StatusMap {
  [key: string]: { label: string; color: string; icon: string }
}

// ✅ 定义常量配置，使用 shallowReadonly 保护根级属性
export const PAGINATION_CONFIG = shallowReadonly<PaginationConfig>({
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true
})

export const ORDER_STATUS_MAP = shallowReadonly<StatusMap>({
  pending: { label: '待处理', color: '#E6A23C', icon: 'clock' },
  processing: { label: '处理中', color: '#409EFF', icon: 'loading' },
  completed: { label: '已完成', color: '#67C23A', icon: 'success' },
  cancelled: { label: '已取消', color: '#F56C6C', icon: 'close' }
})

// ❌ 不允许修改
// PAGINATION_CONFIG.pageSize = 50 // 警告：target is readonly

// ✅ 可以读取
console.log(PAGINATION_CONFIG.pageSize) // 20
```

#### 场景 7：组件通信中的事件总线数据保护

```ts
// src/composables/useEventBus.ts
import { reactive, shallowReadonly, type ShallowReadonly } from 'vue'

type EventHandler<T = any> = (payload: ShallowReadonly<T>) => void

interface EventBusState {
  lastEvent: string | null
  eventCount: number
}

export function useEventBus() {
  const events = new Map<string, Set<EventHandler>>()
  const state = reactive<EventBusState>({
    lastEvent: null,
    eventCount: 0
  })

  function on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!events.has(event)) {
      events.set(event, new Set())
    }
    events.get(event)!.add(handler)

    // 返回取消订阅函数
    return () => events.get(event)?.delete(handler)
  }

  function emit<T extends object>(event: string, payload: T): void {
    state.lastEvent = event
    state.eventCount++

    // ✅ 将 payload 包装为只读，防止监听者修改原始数据
    const readonlyPayload = shallowReadonly(payload)
    events.get(event)?.forEach(handler => handler(readonlyPayload))
  }

  // ✅ 暴露只读状态
  return {
    state: shallowReadonly(state),
    on,
    emit
  }
}
```

#### 场景 8：权限与路由守卫中的配置冻结

```ts
// src/router/guards.ts
import { shallowReadonly } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

interface RouteMeta {
  title: string
  requiresAuth: boolean
  permissions: string[]
}

// ✅ 冻结路由元信息配置，防止在运行时被意外修改
const publicRoutes = shallowReadonly<RouteRecordRaw[]>([
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录', requiresAuth: false, permissions: [] },
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    meta: { title: '注册', requiresAuth: false, permissions: [] },
    component: () => import('@/views/Register.vue')
  }
])

const protectedRoutes = shallowReadonly<RouteRecordRaw[]>([
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { title: '仪表盘', requiresAuth: true, permissions: ['dashboard:view'] },
    component: () => import('@/views/Dashboard.vue')
  }
])

// ❌ 不允许修改根级路由配置
// publicRoutes[0] = { path: '/hack', ... } // 警告：target is readonly

export function getPublicRoutes(): typeof publicRoutes {
  return publicRoutes
}

export function getProtectedRoutes(): typeof protectedRoutes {
  return protectedRoutes
}
```

#### 场景 9：多语言国际化配置保护

```ts
// src/i18n/locales.ts
import { shallowReadonly } from 'vue'

interface LocaleMessages {
  [key: string]: string | LocaleMessages
}

const zhCN = shallowReadonly<LocaleMessages>({
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除'
  },
  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    minLength: '最少输入 {min} 个字符'
  }
})

const enUS = shallowReadonly<LocaleMessages>({
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete'
  },
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minLength: 'Minimum {min} characters required'
  }
})

// ✅ 配置安全，不会被意外修改
export const locales = { 'zh-CN': zhCN, 'en-US': enUS }

// ❌ 不允许修改
// zhCN.common.confirm = '确定' // 警告：target is readonly
```

#### 场景 10：性能敏感的大型数据展示

```ts
// src/composables/useLargeDataset.ts
import { shallowReadonly, ref, type ShallowReadonly } from 'vue'

interface DataItem {
  id: number
  name: string
  value: number
  metadata: Record<string, any>
}

export function useLargeDataset() {
  const dataset = ref<DataItem[]>([])

  async function loadData(): Promise<void> {
    const response = await fetch('/api/large-dataset')
    const data = await response.json()
    dataset.value = data
  }

  // ✅ 对外暴露浅层只读版本，避免深层递归代理的性能开销
  // 对于包含数千条数据的大型数据集，shallowReadonly 比 readonly 性能更好
  function getData(): ShallowReadonly<DataItem[]> {
    return shallowReadonly(dataset.value)
  }

  function getItemById(id: number): ShallowReadonly<DataItem> | undefined {
    const item = dataset.value.find(item => item.id === id)
    return item ? shallowReadonly(item) : undefined
  }

  return {
    loadData,
    getData,
    getItemById
  }
}
```

### 六、注意事项

#### 1. 嵌套对象不受保护

`shallowReadonly()` 只保护根级属性，嵌套对象仍然可以被修改。如果需要完全保护整个对象树，请使用 `readonly()`。

```ts
import { shallowReadonly } from 'vue'

const state = shallowReadonly({
  config: { theme: 'light' }
})

// ❌ 根级属性不可修改
// state.config = { theme: 'dark' } // 警告：target is readonly

// ✅ 但嵌套对象的属性可以修改！
state.config.theme = 'dark' // 修改成功，没有警告

// ✅ 如果需要完全保护，使用 readonly
// import { readonly } from 'vue'
// const fullyProtected = readonly({ config: { theme: 'light' } })
// fullyProtected.config.theme = 'dark' // 警告：target is readonly
```

#### 2. ref 类型的属性不会被自动解包

在 `shallowReadonly()` 创建的代理中，如果属性的值是 `ref`，它**不会**被自动解包，需要通过 `.value` 访问。

```ts
import { shallowReadonly, ref } from 'vue'

const count = ref(0)

const state = shallowReadonly({ count })

// ❌ 不会自动解包
console.log(state.count) // Ref<{ value: 0 }>，而不是 0

// ✅ 需要手动通过 .value 访问
console.log(state.count.value) // 0
```

#### 3. 开发环境与生产环境的行为差异

在开发环境下，修改根级属性会输出控制台警告；在生产环境下，修改操作静默失败，没有警告，也不会抛出错误。

```ts
import { shallowReadonly } from 'vue'

const state = shallowReadonly({ count: 0 })

state.count = 1

// 开发环境：[Vue warn]: Set operation on key "count" failed: target is readonly.
// 生产环境：静默失败，无任何提示
// 两种环境下，state.count 的值都保持为 0
```

#### 4. 不要将 shallowReadonly 嵌套在深层响应式对象中

将 `shallowReadonly` 创建的对象嵌套在深层的 `reactive` 对象中，会导致不一致的响应行为，增加调试难度。

```ts
import { reactive, shallowReadonly } from 'vue'

// ❌ 不推荐：不一致的响应行为
const root = reactive({
  nested: shallowReadonly({
    value: 1,
    deep: { count: 0 }
  })
})

// root.nested.value = 2 // 被阻止
// root.nested.deep.count = 1 // 允许修改，但行为不一致
```

#### 5. 原始对象的修改仍会反映到只读代理

`shallowReadonly()` 创建的是代理而非拷贝，修改原始对象会直接影响只读代理中对应的值（对于嵌套属性而言）。

```ts
import { reactive, shallowReadonly } from 'vue'

const original = reactive({ count: 0, nested: { value: 1 } })
const readonlyView = shallowReadonly(original)

// 修改原始对象
original.count = 10

// 只读代理的值也会变化
console.log(readonlyView.count) // 10

// 同样，嵌套对象的修改也会反映
original.nested.value = 100
console.log(readonlyView.nested.value) // 100
```

#### 6. 与 reactive 配合使用时类型检测的注意事项

当 `shallowReadonly()` 包装一个 `reactive` 对象时，`isReactive()` 和 `isReadonly()` 都会返回 `true`。

```ts
import { reactive, shallowReadonly, isReactive, isReadonly } from 'vue'

const original = reactive({ count: 0 })
const readonlyView = shallowReadonly(original)

console.log(isReactive(readonlyView)) // true —— 底层仍然是 reactive
console.log(isReadonly(readonlyView)) // true —— 被只读包裹
```

#### 7. 只接受对象类型参数

`shallowReadonly()` 的泛型约束为 `T extends object`，不能传入原始值类型（如 `number`、`string`、`boolean`）。

```ts
import { shallowReadonly } from 'vue'

// ❌ 不支持原始值
// const a = shallowReadonly(42)      // 类型错误
// const b = shallowReadonly('hello') // 类型错误
// const c = shallowReadonly(true)    // 类型错误

// ✅ 支持对象类型
const obj = shallowReadonly({ value: 42 })
const arr = shallowReadonly([1, 2, 3])
const map = shallowReadonly(new Map([['key', 'value']]))
```

#### 8. 浅层数据结构只应用于根级状态

Vue 官方建议，浅层数据结构应该只用于组件或组合式函数中的根级状态，避免嵌套使用导致行为不一致。

```ts
// ✅ 推荐：作为根级状态
const state = shallowReadonly({
  config: { ... },
  data: { ... }
})

// ❌ 不推荐：嵌套在其他响应式对象中
const app = reactive({
  moduleA: shallowReadonly({ ... }),
  moduleB: shallowReadonly({ ... })
})
```

#### 9. toRaw 可以获取原始对象

可以通过 `toRaw()` 获取 `shallowReadonly()` 代理的原始对象，但不建议保存对该原始对象的持久引用。

```ts
import { reactive, shallowReadonly, toRaw } from 'vue'

const original = reactive({ count: 0 })
const readonlyView = shallowReadonly(original)

const raw = toRaw(readonlyView)
console.log(raw === toRaw(original)) // true

// ⚠️ 通过 toRaw 获取的对象可以直接修改，绕过只读限制
// raw.count = 100 // 修改成功！
// 所以不建议保存对原始对象的持久引用
```

#### 10. 数组的索引访问也是根级属性

对于数组类型的对象，通过索引修改数组元素也属于根级属性的修改，会被阻止。

```ts
import { shallowReadonly } from 'vue'

const list = shallowReadonly([1, 2, 3])

// ❌ 通过索引修改 —— 被阻止
// list[0] = 100 // 警告：target is readonly

// ❌ 修改数组长度 —— 被阻止
// list.length = 0 // 警告：target is readonly

// ❌ push / pop / splice 等方法 —— 被阻止
// list.push(4) // 警告：target is readonly

console.log(list) // [1, 2, 3] —— 数组保持不变
```

### 七、相关 API 对比

| 特性 | `readonly()` | `shallowReadonly()` | `shallowReactive()` | `reactive()` |
|------|-------------|---------------------|---------------------|--------------|
| 根级属性 | 只读 | 只读 | 可变（响应式） | 可变（响应式） |
| 嵌套对象 | 深层只读 | 可变 | 可变（非响应式） | 深层响应式 |
| ref 自动解包 | 是 | 否 | 否 | 是 |
| 递归代理 | 是 | 否 | 否 | 是 |
| 性能开销 | 较高 | 较低 | 较低 | 较高 |
| 适用场景 | 完全不可变数据 | 保护顶层配置 | 大型对象的顶层响应式 | 通用响应式状态 |

```ts
import { reactive, shallowReactive, readonly, shallowReadonly, isReadonly, isReactive } from 'vue'

const obj = { nested: { count: 0 } }

const r1 = reactive(obj)
const r2 = shallowReactive(obj)
const r3 = readonly(obj)
const r4 = shallowReadonly(obj)

// reactive：深层响应式，可变
console.log(isReactive(r1))         // true
console.log(isReactive(r1.nested))  // true

// shallowReactive：浅层响应式，可变
console.log(isReactive(r2))         // true
console.log(isReactive(r2.nested))  // false

// readonly：深层只读
console.log(isReadonly(r3))         // true
console.log(isReadonly(r3.nested))  // true

// shallowReadonly：浅层只读
console.log(isReadonly(r4))         // true
console.log(isReadonly(r4.nested))  // false
```

> 💡 **提示：** 选择 API 时遵循以下原则——需要完全保护数据用 `readonly()`，只需保护顶层用 `shallowReadonly()`，需要完全响应式用 `reactive()`，只需顶层响应式用 `shallowReactive()`。

### 八、总结

`shallowReadonly()` 是 Vue 3 响应式系统中一个实用的工具 API，它的核心价值在于：

1. **性能优化**：只代理对象的第一层，避免深层递归转换的开销，特别适合大型数据结构。
2. **精细化控制**：只锁定根级属性，保持嵌套对象的可变性，适用于"外锁内松"的数据保护场景。
3. **对外安全接口**：在组合式函数或 store 中，对外暴露 `shallowReadonly` 版本，内部维护可变引用，实现安全的数据访问模式。

**使用口诀**：数据保护只一层，嵌套对象要当心；性能优化选浅层，完全保护用深 `readonly`。
