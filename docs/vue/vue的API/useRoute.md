# useRoute

> 📖 [官方文档 - useRoute](https://router.vuejs.org/zh/api/#useroute)

### 一、概述

`useRoute` 是 Vue Router 提供的一个组合式函数（Composable），用于在 **Vue 3 组合式 API** 中获取当前激活的路由信息对象。它返回一个响应式的路由对象，包含了当前 URL 解析后的所有信息，如路径、参数、查询字符串、哈希值、元信息等。

**解决什么问题？**

在没有 `useRoute` 之前（选项式 API），我们需要通过 `this.$route` 访问路由信息。而在组合式 API 的 `<script setup>` 中没有 `this`，因此 Vue Router 提供了 `useRoute` 函数，让我们能够在 `setup` 中获取当前路由的完整信息。

**为什么需要它？**

- 在组合式 API 中无法使用 `this.$route`
- 需要根据路由参数动态加载或处理数据
- 需要根据路由元信息控制页面行为（如权限、标题、布局）
- 需要监听路由变化来执行副作用逻辑
- 需要在组合式函数（Composable）中访问路由信息

### 二、核心原理

`useRoute` 的核心工作流程如下：

1. **依赖注入**：Vue Router 在安装时（`app.use(router)`）通过 `provide` 向整个应用注入路由器实例
2. **获取当前路由**：`useRoute` 内部通过 `inject` 获取路由器实例，并返回当前的 `currentRoute`（即 `router.currentRoute.value`）
3. **响应式代理**：返回的路由对象是一个 `ref`，当路由发生变化时，所有依赖该对象的组件会自动更新

```
app.use(router)
    ↓
router 通过 provide 注入 Router 实例
    ↓
useRoute() 通过 inject 获取 Router 实例
    ↓
返回 router.currentRoute（响应式路由对象）
    ↓
组件中可直接读取 route.path / route.params / route.query 等
```

### 三、详细用法

#### 1. 基本用法

`useRoute` 无需任何参数，直接调用即可返回当前路由对象。

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 路由对象的核心属性
console.log(route.path)            // 当前路径，如 '/user/123'
console.log(route.fullPath)        // 完整路径，如 '/user/123?tab=info#section1'
console.log(route.params)          // 路由参数对象，如 { id: '123' }
console.log(route.query)           // 查询参数对象，如 { tab: 'info' }
console.log(route.hash)            // 哈希值，如 '#section1'
console.log(route.name)            // 路由名称，如 'UserProfile'
console.log(route.meta)            // 路由元信息，如 { title: '用户信息', requiresAuth: true }
console.log(route.matched)         // 匹配的路由记录数组
console.log(route.redirectedFrom)  // 重定向来源路径（如有）
</script>
```

**在模板中直接使用：**

```vue
<template>
  <div>
    <p>当前路径：{{ route.path }}</p>
    <p>路由参数：{{ route.params }}</p>
    <p>查询参数：{{ route.query }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
```

#### 2. 进阶用法

**（1）配合 computed 获取派生路由数据**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// ✅ 使用 computed 创建响应式派生值
const userId = computed(() => route.params.userId as string)
const searchKeyword = computed(() => (route.query.q as string) || '')
const currentPage = computed(() => Number(route.query.page) || 1)
const isAuthenticated = computed(() => route.meta.requiresAuth as boolean)
</script>
```

**（2）配合 watch 监听路由变化**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'

const route = useRoute()
const articleData = ref(null)

// 监听路由参数变化，重新加载数据
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      articleData.value = await fetchArticle(newId as string)
    }
  },
  { immediate: true } // 立即执行一次
)

async function fetchArticle(id: string) {
  const res = await fetch(`/api/articles/${id}`)
  return res.json()
}
</script>
```

**（3）在组合式函数（Composable）中使用**

```ts
// composables/usePageMeta.ts
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import type { Ref } from 'vue'

interface PageMeta {
  title: string
  description: string
}

export function usePageMeta(customMeta?: Ref<PageMeta>) {
  const route = useRoute()

  const pageTitle = computed(() => {
    return customMeta?.value?.title || (route.meta.title as string) || '默认页面'
  })

  const pageDescription = computed(() => {
    return customMeta?.value?.description || (route.meta.description as string) || ''
  })

  // 路由变化时自动更新 document.title
  watch(
    pageTitle,
    (title) => {
      document.title = title
    },
    { immediate: true }
  )

  return { pageTitle, pageDescription }
}
```

**（4）结合路由守卫使用**

```vue
<script setup lang="ts">
import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const hasUnsavedChanges = ref(false)

// ✅ 路由离开守卫 — 防止未保存数据丢失
onBeforeRouteLeave((_to, _from) => {
  if (hasUnsavedChanges.value) {
    const confirmLeave = window.confirm('有未保存的更改，确定要离开吗？')
    if (!confirmLeave) return false
  }
})

// ✅ 路由更新守卫 — 同一组件复用时重新加载数据
onBeforeRouteUpdate(async (to) => {
  const newId = to.params.id as string
  await loadData(newId)
})

async function loadData(id: string) {
  // 根据 id 加载数据
}
</script>
```

**（5）TypeScript 类型增强**

```ts
// router/types.ts — 扩展路由元信息类型
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    permissions?: string[]
    keepAlive?: boolean
    layout?: 'default' | 'blank' | 'admin'
  }
}
```

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// ✅ 现在 route.meta 具有完整的类型提示
const title = route.meta.title           // string | undefined
const requiresAuth = route.meta.requiresAuth // boolean | undefined
const permissions = route.meta.permissions  // string[] | undefined
</script>
```

#### 3. API 参数说明

| 属性 / 方法 | 类型 | 说明 |
|---|---|---|
| `useRoute()` | `() => RouteLocationNormalizedLoaded` | 返回当前路由对象（无参数） |
| **route.path** | `string` | 当前路由路径，如 `/user/123` |
| **route.fullPath** | `string` | 完整路径，包含 query 和 hash，如 `/user/123?tab=info#top` |
| **route.params** | `Record<string, string \| string[]>` | 路由动态参数对象 |
| **route.query** | `LocationQuery` | 查询参数对象，值为 `string \| string[] \| null` |
| **route.hash** | `string` | 当前 URL 的哈希值，以 `#` 开头 |
| **route.name** | `RouteRecordNameGeneric \| undefined` | 匹配的路由名称 |
| **route.meta** | `RouteMeta` | 路由元信息，可在路由配置中自定义 |
| **route.matched** | `RouteRecordNormalized[]` | 匹配的路由记录数组（含嵌套路由） |
| **route.redirectedFrom** | `RouteLocation \| undefined` | 如果是通过重定向到达的，记录重定向来源 |
| **route.fullPath** | `string` | URL 编码后的完整路径 |

### 四、实现效果

使用 `useRoute` 后，你可以在任何组合式 API 环境中获取并响应当前路由的状态变化：

```vue
<template>
  <div class="page">
    <!-- 根据 route 信息动态渲染页面内容 -->
    <h1>{{ pageTitle }}</h1>
    <nav>
      <span v-if="route.query.tab === 'info'" class="active">信息</span>
      <span v-if="route.query.tab === 'posts'" class="active">文章</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'

const route = useRoute()

// 效果 1：自动获取当前路由的元信息作为页面标题
const pageTitle = computed(() => (route.meta.title as string) || '未命名页面')

// 效果 2：监听路由参数变化时自动加载数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      console.log(`路由参数变化，新 ID：${newId}`) // 输出：路由参数变化，新 ID：42
    }
  },
  { immediate: true }
)

// 效果 3：访问查询参数控制页面状态
console.log(route.query.tab)   // 访问 URL: /user/1?tab=info  →  输出: "info"
console.log(route.query.page)  // 访问 URL: /user/1?page=2    →  输出: "2"
console.log(route.hash)        // 访问 URL: /user/1#section1  →  输出: "#section1"
</script>
```

### 五、使用场景

#### 场景 1：根据路由参数加载详情页数据

```vue
<template>
  <div v-if="article">
    <h1>{{ article.title }}</h1>
    <p>{{ article.content }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

interface Article {
  title: string
  content: string
}

const route = useRoute()
const article = ref<Article | null>(null)

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      const res = await fetch(`/api/articles/${id}`)
      article.value = await res.json()
    }
  },
  { immediate: true }
)
</script>
```

#### 场景 2：搜索页面 — 读取查询参数

```vue
<template>
  <div class="search-page">
    <input v-model="keyword" placeholder="搜索..." @keyup.enter="doSearch" />
    <p>当前搜索：{{ currentKeyword }}，第 {{ currentPage }} 页</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const keyword = ref('')

// 从 URL 查询参数中恢复搜索状态
const currentKeyword = computed(() => (route.query.q as string) || '')
const currentPage = computed(() => Number(route.query.page) || 1)

onMounted(() => {
  // 页面加载时，从 URL 中恢复关键词
  keyword.value = currentKeyword.value
})

function doSearch() {
  router.push({ path: '/search', query: { q: keyword.value, page: '1' } })
}
</script>
```

#### 场景 3：基于路由元信息的权限控制

```vue
<template>
  <div v-if="hasPermission">
    <slot />
  </div>
  <div v-else class="no-permission">
    <p>您没有访问该页面的权限</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const hasPermission = computed(() => {
  const required = route.meta.permissions as string[] | undefined
  if (!required || required.length === 0) return true
  return required.every((perm) => userStore.permissions.includes(perm))
})
</script>
```

#### 场景 4：动态设置页面标题

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

watch(
  () => route.meta.title,
  (title) => {
    document.title = title ? `${title} - 我的网站` : '我的网站'
  },
  { immediate: true }
)
</script>
```

#### 场景 5：面包屑导航

```vue
<template>
  <nav class="breadcrumb">
    <span
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      class="breadcrumb-item"
    >
      <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.path">
        {{ crumb.title }}
      </router-link>
      <span v-else>{{ crumb.title }}</span>
    </span>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

interface Breadcrumb {
  title: string
  path: string
}

const route = useRoute()

// ✅ 利用 route.matched 获取所有匹配的路由记录生成面包屑
const breadcrumbs = computed<Breadcrumb[]>(() => {
  return route.matched
    .filter((record) => record.meta.title)
    .map((record) => ({
      title: record.meta.title as string,
      path: record.path
    }))
})
</script>
```

#### 场景 6：条件渲染不同布局

```vue
<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, type Component } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()

const layoutMap: Record<string, Component> = {
  default: DefaultLayout,
  blank: BlankLayout,
  admin: AdminLayout
}

const layoutComponent = computed(() => {
  const layout = (route.meta.layout as string) || 'default'
  return layoutMap[layout] || DefaultLayout
})
</script>
```

#### 场景 7：页面缓存控制（KeepAlive 配合路由元信息）

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// ✅ 根据路由 meta.keepAlive 决定是否缓存
const cachedViews = computed(() => {
  return route.matched
    .filter((record) => record.meta.keepAlive)
    .map((record) => record.name as string)
})
</script>
```

#### 场景 8：监听路由变化做数据埋点

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

watch(
  () => route.fullPath,
  (fullPath) => {
    // 每次路由变化时上报页面访问数据
    trackPageView({
      path: fullPath,
      title: route.meta.title as string,
      timestamp: Date.now()
    })
  }
)

function trackPageView(data: { path: string; title: string; timestamp: number }) {
  // 发送埋点数据到分析服务
  navigator.sendBeacon('/api/analytics', JSON.stringify(data))
}
</script>
```

#### 场景 9：多标签页（Tab）管理

```vue
<template>
  <div class="tabs">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab', { active: tab.key === activeTab }]"
      @click="switchTab(tab.key)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'info', label: '基本信息' },
  { key: 'orders', label: '订单记录' },
  { key: 'settings', label: '账户设置' }
]

// ✅ 从路由 query 中读取当前激活的 tab
const activeTab = computed(() => (route.query.tab as string) || 'info')

function switchTab(key: string) {
  router.replace({ query: { ...route.query, tab: key } })
}
</script>
```

#### 场景 10：404 页面捕获与重定向来源追踪

```vue
<template>
  <div class="not-found">
    <h1>404 - 页面不存在</h1>
    <p v-if="route.redirectedFrom">
      您尝试访问的路径：<code>{{ route.redirectedFrom.fullPath }}</code> 不存在
    </p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// ✅ 通过 redirectedFrom 追踪用户最初请求的路径
console.log('用户原本想访问：', route.redirectedFrom?.fullPath)
</script>
```

### 六、注意事项

1. **只能在 setup 函数或组合式函数中调用**

   `useRoute` 依赖 Vue 的依赖注入系统（provide/inject），因此只能在 `setup` 函数、`<script setup>` 内部或由其直接调用的组合式函数中使用。

   ```ts
   // ❌ 错误：在组件外部调用 useRoute
   // utils/route.ts
   import { useRoute } from 'vue-router'
   const route = useRoute() // 报错：没有活跃的组件实例

   // ✅ 正确：在组合式函数中调用
   export function useCurrentId() {
     const route = useRoute()
     return computed(() => route.params.id as string)
   }
   ```

2. **返回的路由对象是只读的**

   `useRoute()` 返回的路由对象是只读的（`readonly`），不能直接修改其中的属性。要改变路由，必须使用 `useRouter` 的导航方法。

   ```ts
   const route = useRoute()

   // ❌ 错误：不能直接修改路由对象
   route.params.id = '456'

   // ✅ 正确：通过 router 进行导航
   const router = useRouter()
   router.push({ params: { id: '456' } })
   ```

3. **params 的值可能是 string 或 string[]**

   当路由配置了可重复参数（如 `/file/:path+`）时，`params` 对应的值会是数组。使用时务必注意类型判断。

   ```ts
   // 路由配置：/docs/:segments+
   // URL: /docs/a/b/c
   const segments = route.params.segments // 类型为 string | string[]

   // ✅ 安全处理
   const pathSegments = Array.isArray(segments) ? segments : [segments]
   ```

4. **query 参数始终是 string 类型**

   URL 查询参数在解析后始终是字符串类型（或字符串数组、null），使用前需要手动转换类型。

   ```ts
   // URL: /list?page=2&size=10
   // ❌ 错误：直接当数字使用
   const page = route.query.page // 实际是字符串 "2"

   // ✅ 正确：手动转换类型
   const page = Number(route.query.page) || 1
   const size = parseInt(route.query.size as string) || 10
   ```

5. **相同路由组件复用时不会重新创建组件**

   当路由参数变化但使用的是同一个组件时（如 `/user/1` → `/user/2`），Vue 会复用该组件而不是销毁重建，`setup` 不会重新执行。此时需要用 `watch` 监听参数变化。

   ```ts
   const route = useRoute()

   // ❌ 错误：setup 只执行一次，后续参数变化不会重新获取
   const userData = await fetchUser(route.params.id)

   // ✅ 正确：监听参数变化
   watch(
     () => route.params.id,
     async (newId) => {
       if (newId) userData.value = await fetchUser(newId)
     },
     { immediate: true }
   )
   ```

6. **不要解构 route 对象**

   解构会丢失响应性，导致后续路由变化时视图不更新。

   ```ts
   const route = useRoute()

   // ❌ 错误：解构后失去响应性
   const { params, query } = route

   // ✅ 正确：直接通过 route 访问或用 computed 包装
   const userId = computed(() => route.params.userId)
   ```

7. **SSR 中使用需注意**

   在服务端渲染（SSR）环境中，`useRoute` 可以正常使用，但要注意服务端和客户端的路由状态一致性。确保在服务端渲染时正确传递初始路由状态。

8. **与 useRouter 的区别要区分清楚**

   - `useRoute`：读取当前路由信息（路径、参数、查询等），是"只读"操作
   - `useRouter`：获取路由器实例，用于编程式导航（`push`、`replace`、`back` 等），是"动作"操作

   ```ts
   import { useRoute, useRouter } from 'vue-router'

   const route = useRoute()   // 读取信息
   const router = useRouter() // 执行导航

   // 读取当前路由参数
   const id = route.params.id

   // 导航到新页面
   router.push('/home')
   ```

9. **route.matched 的顺序是从父到子**

   `route.matched` 数组中的路由记录按照从父到子的顺序排列，这对于面包屑导航和权限判断非常有用。数组中的最后一个元素就是当前最深层匹配的路由记录。

10. **使用 TypeScript 增强类型安全**

    建议通过 `declare module 'vue-router'` 扩展 `RouteMeta` 接口，为 `route.meta` 添加类型声明，避免到处使用 `as` 类型断言。

    ```ts
    // ✅ 在 env.d.ts 或 router/types.ts 中集中声明
    declare module 'vue-router' {
      interface RouteMeta {
        title?: string
        requiresAuth?: boolean
        permissions?: string[]
        keepAlive?: boolean
      }
    }
    ```

### 七、相关 API 对比

| API | 功能 | 使用场景 | 是否可写 |
|---|---|---|---|
| **useRoute** | 获取当前路由信息对象 | 读取路径、参数、查询、元信息 | 只读 |
| **useRouter** | 获取路由器实例 | 编程式导航（push、replace、back） | 可执行导航 |
| **onBeforeRouteLeave** | 组件内路由离开守卫 | 防止未保存数据丢失、离开确认 | 可拦截导航 |
| **onBeforeRouteUpdate** | 组件内路由更新守卫 | 同组件不同参数时重新加载数据 | 可拦截导航 |
| **this.$route** | 选项式 API 中获取路由信息 | 仅在选项式 API 中使用 | 只读 |
| **useLink** | 自定义 RouterLink 行为 | 创建自定义导航组件 | — |

```ts
// useRoute 与 useRouter 的典型配合使用
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 读取当前信息
console.log(route.params.id)

// 执行导航操作
router.push({ name: 'UserDetail', params: { id: '123' } })
router.back()
router.replace('/login')
```

### 八、总结

`useRoute` 是 Vue 3 组合式 API 中访问路由信息的标准方式，它的核心特点：

- **无参数调用**：直接 `const route = useRoute()` 即可获取完整的路由信息
- **完全响应式**：路由变化时自动触发依赖更新，配合 `computed` 和 `watch` 使用
- **只读对象**：不能直接修改，需要通过 `useRouter` 进行导航
- **组合式友好**：可以在任何组合式函数（Composable）中使用，方便逻辑复用
- **TypeScript 支持**：可通过 `declare module` 扩展类型，获得完整的类型推断

> 💡 **提示：** 在日常开发中，`useRoute` 和 `useRouter` 几乎总是成对出现。记住一个简单的原则：**读信息用 `useRoute`，做导航用 `useRouter`**。

> ⚠️ **注意：** 永远不要在组件的 `setup` 之外（如普通的工具函数、全局作用域）调用 `useRoute`，它会因找不到注入的依赖而抛出运行时错误。
