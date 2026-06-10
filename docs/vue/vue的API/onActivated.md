### onActivated

> 📖 [Vue 官方文档 - onActivated](https://cn.vuejs.org/api/composition-api-lifecycle#onactivated)

---

### 一、概述

`onActivated()` 是 Vue 3 组合式 API 中的一个生命周期钩子，专门用于配合 `<keep-alive>` 组件使用。当被 `<keep-alive>` 缓存的组件从隐藏状态重新变为可见（即"激活"）时，`onActivated` 回调会被触发。

简单来说：当用户从一个页面切走再切回来时，缓存的组件并没有被销毁，而是被"冻结"了。`onActivated` 就是告诉组件"你又回来了"的那个信号，让你可以在这个时刻做数据刷新、恢复状态等操作。

---

### 二、核心原理

#### 工作机制

`<keep-alive>` 是 Vue 提供的一个内置组件，它会在组件切换时将组件实例缓存起来，而不是销毁。被缓存的组件会经历两种状态：

- **激活（Activated）**：组件从缓存中恢复显示，触发 `onActivated`
- **停用（Deactivated）**：组件被隐藏但保留在缓存中，触发 `onDeactivated`

#### 生命周期对比

| 状态 | 非 keep-alive | keep-alive 缓存组件 |
|------|--------------|-------------------|
| 首次渲染 | `onMounted` | `onMounted` + `onActivated` |
| 切走（隐藏） | `onUnmounted`（销毁） | `onDeactivated`（缓存） |
| 切回（显示） | 重新创建 + `onMounted` | `onActivated`（恢复） |
| 彻底销毁 | `onUnmounted` | `onUnmounted` |

#### 类比理解

可以把 `<keep-alive>` 想象成手机的"后台应用管理"：

- 没有 `<keep-alive>`：每次切换 App 都会完全关闭再重新打开（耗时、丢失状态）
- 有 `<keep-alive>`：切换 App 只是把它放到后台，再切回来时从后台恢复（快速、保留状态）
- `onActivated`：就是 App 从后台回到前台时收到的那个通知，让你可以刷新数据、更新界面

---

### 三、详细用法

#### 1. 基本用法

```vue
<script setup lang="ts">
import { onActivated } from 'vue'

// 注册激活回调，组件每次从缓存中激活时都会执行
onActivated(() => {
  console.log('组件被激活了')
})
</script>
```

#### 2. 进阶用法

##### 2.1 配合路由使用

```vue
<template>
  <div class="app">
    <nav>
      <RouterLink to="/home">首页</RouterLink>
      <RouterLink to="/list">列表</RouterLink>
      <RouterLink to="/detail">详情</RouterLink>
    </nav>
    <!-- 使用 keep-alive 缓存路由组件 -->
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>
```

```vue
<!-- ListPage.vue -->
<script setup lang="ts">
import { ref, onActivated } from 'vue'

interface ListItem {
  id: number
  name: string
}

const list = ref<ListItem[]>([])

// 每次从其他页面切回来时，刷新列表数据
onActivated(async () => {
  const res = await fetch('/api/list')
  list.value = await res.json()
})
</script>
```

##### 2.2 恢复滚动位置

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const scrollContainer = ref<HTMLElement | null>(null)
const savedScrollTop = ref(0)

// 激活时：恢复之前保存的滚动位置
onActivated(() => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = savedScrollTop.value
  }
})

// 停用时：保存当前滚动位置
onDeactivated(() => {
  if (scrollContainer.value) {
    savedScrollTop.value = scrollContainer.value.scrollTop
  }
})
</script>

<template>
  <div ref="scrollContainer" class="scroll-container">
    <!-- 长列表内容 -->
  </div>
</template>
```

##### 2.3 配合 include / exclude 精准控制

```vue
<template>
  <!-- 仅缓存名称为 Home 和 List 的组件 -->
  <RouterView v-slot="{ Component }">
    <KeepAlive :include="['Home', 'List']">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>
```

```vue
<!-- Home.vue -->
<script setup lang="ts">
import { onActivated } from 'vue'

// 仅在 Home 组件被缓存并激活时触发
defineOptions({ name: 'Home' })

onActivated(() => {
  console.log('Home 组件被激活')
})
</script>
```

##### 2.4 注册多个 onActivated 回调

```vue
<script setup lang="ts">
import { onActivated } from 'vue'

// 可以注册多个回调，它们会按照注册顺序依次执行
onActivated(() => {
  console.log('第一个回调：刷新用户信息')
})

onActivated(() => {
  console.log('第二个回调：刷新通知数据')
})

onActivated(() => {
  console.log('第三个回调：恢复页面状态')
})
</script>
```

##### 2.5 在组合式函数（Composable）中使用

```typescript
// useAutoRefresh.ts
import { onActivated, onDeactivated } from 'vue'

interface UseAutoRefreshOptions {
  interval?: number
  immediate?: boolean
}

export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 30000, immediate = true } = options
  let timer: ReturnType<typeof setInterval> | null = null

  const startRefresh = () => {
    stopRefresh()
    timer = setInterval(fetchFn, interval)
  }

  const stopRefresh = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 激活时开始定时刷新
  onActivated(() => {
    if (immediate) fetchFn()
    startRefresh()
  })

  // 停用时停止刷新，节省资源
  onDeactivated(() => {
    stopRefresh()
  })

  return { startRefresh, stopRefresh }
}
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAutoRefresh } from '@/composables/useAutoRefresh'

const notifications = ref<string[]>([])

const fetchNotifications = async () => {
  const res = await fetch('/api/notifications')
  notifications.value = await res.json()
}

// 组件激活时自动开始轮询，停用时自动停止
useAutoRefresh(fetchNotifications, { interval: 15000 })
</script>
```

##### 2.6 动态组件切换

```vue
<template>
  <div>
    <button
      v-for="tab in tabs"
      :key="tab.name"
      @click="currentTab = tab.name"
    >
      {{ tab.label }}
    </button>

    <KeepAlive>
      <component :is="currentComponent" />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import TabProfile from './TabProfile.vue'
import TabSettings from './TabSettings.vue'
import TabMessages from './TabMessages.vue'

const tabs = [
  { name: 'profile', label: '个人资料', component: TabProfile },
  { name: 'settings', label: '设置', component: TabSettings },
  { name: 'messages', label: '消息', component: TabMessages },
] as const

const currentTab = ref('profile')

const currentComponent = computed(() => {
  return tabs.find(t => t.name === currentTab.value)?.component ?? TabProfile
})
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `callback` | `() => void` | 组件被激活时执行的回调函数 |
| **返回值** | `() => void` | 返回一个清理函数，调用后会注销该回调 |

> 💡 **提示：** `onActivated` 必须在 `setup()` 函数或 `<script setup>` 中**同步调用**，不能放在 `setTimeout`、`Promise.then` 等异步操作中。

```typescript
// 函数签名
function onActivated(callback: () => void): () => void
```

---

### 四、实现效果

#### 示例：带有缓存的路由页面

```vue
<template>
  <div class="user-list">
    <p>当前用户列表（最后刷新时间：{{ lastRefreshTime }}）</p>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
    <button @click="$router.push('/detail')">跳转详情</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([])
const lastRefreshTime = ref('')

const fetchUsers = async () => {
  const res = await fetch('/api/users')
  users.value = await res.json()
  lastRefreshTime.value = new Date().toLocaleTimeString()
}

// 首次挂载：请求数据
onMounted(() => {
  console.log('UserList: onMounted - 仅首次执行')
  fetchUsers()
})

// 每次激活：刷新数据
onActivated(() => {
  console.log('UserList: onActivated - 每次切回都执行')
  fetchUsers()
})
</script>
```

**运行效果说明：**

1. **首次进入页面**：控制台依次输出 `onMounted` 和 `onActivated`，数据加载完成
2. **跳转到详情页**：控制台输出 `onDeactivated`，组件被缓存（不触发 `onUnmounted`）
3. **从详情页返回**：控制台输出 `onActivated`，数据自动刷新，`lastRefreshTime` 更新
4. **离开并彻底销毁**（如不在 `keep-alive` 范围内）：才会触发 `onUnmounted`

---

### 五、使用场景

#### 1. 列表页返回时保持分页状态

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const list = ref<any[]>([])

const fetchList = async () => {
  const res = await fetch(
    `/api/list?page=${currentPage.value}&size=${pageSize.value}`
  )
  const data = await res.json()
  list.value = data.list
  total.value = data.total
}

// 激活时：用保存的分页参数重新请求数据
onActivated(() => {
  fetchList()
})

// 停用时：分页参数已经保存在 ref 中，无需额外处理
</script>
```

#### 2. 实时数据面板自动恢复刷新

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const dashboardData = ref<Record<string, number>>({})
let ws: WebSocket | null = null

const connectWebSocket = () => {
  ws = new WebSocket('wss://api.example.com/realtime')
  ws.onmessage = (event) => {
    dashboardData.value = JSON.parse(event.data)
  }
}

const disconnectWebSocket = () => {
  ws?.close()
  ws = null
}

// 激活时重新建立 WebSocket 连接
onActivated(() => {
  connectWebSocket()
})

// 停用时断开连接，释放资源
onDeactivated(() => {
  disconnectWebSocket()
})
</script>
```

#### 3. 表单编辑页缓存草稿

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

interface FormData {
  title: string
  content: string
  category: string
}

const form = ref<FormData>({
  title: '',
  content: '',
  category: '',
})

const savedDraft = ref<FormData | null>(null)

// 激活时恢复草稿
onActivated(() => {
  if (savedDraft.value) {
    form.value = { ...savedDraft.value }
    console.log('已恢复草稿内容')
  }
})

// 停用时保存草稿到内存
onDeactivated(() => {
  savedDraft.value = { ...form.value }
  console.log('草稿已暂存')
})
</script>
```

#### 4. 地图组件恢复视图状态

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const mapCenter = ref({ lat: 39.9042, lng: 116.4074 })
const zoom = ref(12)
const mapInstance = ref<any>(null)

// 激活时恢复地图位置和缩放级别
onActivated(() => {
  if (mapInstance.value) {
    mapInstance.value.setCenter([mapCenter.value.lng, mapCenter.value.lat])
    mapInstance.value.setZoom(zoom.value)
  }
})

// 停用时保存当前地图状态
onDeactivated(() => {
  if (mapInstance.value) {
    const center = mapInstance.value.getCenter()
    mapCenter.value = { lat: center.lat, lng: center.lng }
    zoom.value = mapInstance.value.getZoom()
  }
})
</script>
```

#### 5. 音视频播放器恢复播放状态

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)
const wasPlaying = ref(false)
const currentTime = ref(0)

// 激活时恢复播放
onActivated(() => {
  if (videoRef.value && wasPlaying.value) {
    videoRef.value.currentTime = currentTime.value
    videoRef.value.play()
  }
})

// 停用时暂停并保存进度
onDeactivated(() => {
  if (videoRef.value) {
    wasPlaying.value = !videoRef.value.paused
    currentTime.value = videoRef.value.currentTime
    videoRef.value.pause()
  }
})
</script>

<template>
  <video ref="videoRef" src="/video/tutorial.mp4" controls />
</template>
```

#### 6. 搜索页面保留搜索条件和结果

```vue
<script setup lang="ts">
import { ref, onActivated } from 'vue'

const keyword = ref('')
const searchResults = ref<any[]>([])
const hasSearched = ref(false)

const doSearch = async () => {
  if (!keyword.value.trim()) return
  const res = await fetch(`/api/search?q=${keyword.value}`)
  searchResults.value = await res.json()
  hasSearched.value = true
}

// 激活时：搜索条件和结果都还保留在 ref 中，无需重新搜索
// 如果需要最新结果，也可以重新请求
onActivated(() => {
  if (hasSearched.value && keyword.value) {
    // 可选：自动刷新搜索结果以获取最新数据
    console.log('搜索页面激活，保留搜索条件：', keyword.value)
  }
})
</script>
```

#### 7. 数据统计图表组件刷新

```vue
<script setup lang="ts">
import { ref, onActivated } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const updateChart = async () => {
  const res = await fetch('/api/statistics')
  const data = await res.json()

  if (chartInstance) {
    chartInstance.setOption({
      xAxis: { data: data.labels },
      series: [{ data: data.values }],
    })
  }
}

// 激活时刷新图表数据，确保展示最新统计
onActivated(() => {
  updateChart()
  // 同时处理窗口大小变化导致的图表变形
  chartInstance?.resize()
})
</script>
```

#### 8. 多标签页（Tab）编辑器状态恢复

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

interface EditorState {
  cursorPosition: { line: number; column: number }
  scrollOffset: number
  content: string
}

const editorState = ref<EditorState>({
  cursorPosition: { line: 1, column: 1 },
  scrollOffset: 0,
  content: '',
})

// 激活时恢复光标位置和滚动偏移
onActivated(() => {
  console.log('恢复编辑器状态：', editorState.value)
  // 调用编辑器 API 恢复状态
})

// 停用时保存编辑器状态
onDeactivated(() => {
  console.log('保存编辑器状态')
})
</script>
```

#### 9. 权限变化的实时检测

```vue
<script setup lang="ts">
import { ref, onActivated } from 'vue'

const permissions = ref<string[]>([])
const hasAdminAccess = ref(false)

const refreshPermissions = async () => {
  const res = await fetch('/api/permissions')
  permissions.value = await res.json()
  hasAdminAccess.value = permissions.value.includes('admin')
}

// 每次激活时重新检查权限，确保 UI 与最新权限一致
onActivated(() => {
  refreshPermissions()
})
</script>

<template>
  <div v-if="hasAdminAccess">
    <button>管理员操作</button>
  </div>
</template>
```

#### 10. 长列表虚拟滚动位置恢复

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const scrollTop = ref(0)
const containerRef = ref<HTMLElement | null>(null)

// 激活时恢复滚动位置
onActivated(() => {
  requestAnimationFrame(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = scrollTop.value
    }
  })
})

// 停用时记录滚动位置
onDeactivated(() => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
})
</script>
```

---

### 六、注意事项

#### 1. 必须配合 `<keep-alive>` 使用

`onActivated` 只在被 `<keep-alive>` 包裹的组件中才有意义。如果组件没有被缓存，`onActivated` 不会触发。

```vue
<!-- ❌ 错误：没有使用 keep-alive，onActivated 永远不会触发 -->
<template>
  <MyComponent v-if="show" />
</template>

<!-- ✅ 正确：配合 keep-alive 使用 -->
<template>
  <KeepAlive>
    <MyComponent v-if="show" />
  </KeepAlive>
</template>
```

#### 2. 必须在 setup 中同步调用

`onActivated` 必须在 `setup()` 或 `<script setup>` 的同步执行阶段调用，不能放在异步回调中。

```typescript
// ❌ 错误：异步调用，无法注册成功
import { onActivated } from 'vue'

setTimeout(() => {
  onActivated(() => {
    console.log('不会生效')
  })
}, 1000)

// ✅ 正确：同步调用
onActivated(() => {
  console.log('组件被激活')
})
```

#### 3. 首次渲染时也会触发

`onActivated` 在组件首次挂载时**也会触发**一次（与 `onMounted` 同时），并非只在"恢复"时才触发。

```typescript
// 首次挂载时的生命周期顺序：
// 1. onMounted
// 2. onActivated（首次也会触发）
```

#### 4. 与 `onMounted` 的执行顺序

`onMounted` 先于 `onActivated` 执行。如果两者都发起了数据请求，需要注意避免重复请求。

```typescript
// ✅ 推荐做法：用标记区分首次和恢复
const isFirstLoad = ref(true)

onMounted(async () => {
  await fetchData()
  isFirstLoad.value = false
})

onActivated(async () => {
  if (!isFirstLoad.value) {
    await fetchData() // 仅在恢复时刷新
  }
})
```

#### 5. 使用返回函数注销回调

`onActivated` 返回一个清理函数，可以用来注销已注册的回调，防止内存泄漏。

```typescript
// ✅ 在不需要时注销回调
const stop = onActivated(() => {
  console.log('激活')
})

// 条件满足后注销
if (shouldRemove) {
  stop()
}
```

#### 6. 多个回调按注册顺序执行

可以注册多个 `onActivated` 回调，它们会按照注册顺序依次执行。

```typescript
onActivated(() => console.log('第 1 个'))
onActivated(() => console.log('第 2 个'))
onActivated(() => console.log('第 3 个'))
// 输出顺序：第 1 个 → 第 2 个 → 第 3 个
```

#### 7. 注意内存泄漏

在 `onActivated` 中启动的定时器、事件监听器、WebSocket 连接等，务必在 `onDeactivated` 或 `onUnmounted` 中清理。

```typescript
// ❌ 错误：只创建不清理，导致内存泄漏
onActivated(() => {
  setInterval(() => {
    console.log('轮询中...')
  }, 5000)
})

// ✅ 正确：在停用时清理
let timer: ReturnType<typeof setInterval> | null = null

onActivated(() => {
  timer = setInterval(() => {
    console.log('轮询中...')
  }, 5000)
})

onDeactivated(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
```

#### 8. `<keep-alive>` 的 `include` / `exclude` 限制

如果组件没有被 `<keep-alive>` 的 `include` 匹配或被 `exclude` 排除，则组件不会被缓存，`onActivated` 也不会触发。此时需要检查组件的 `name` 是否正确配置。

```vue
<!-- 仅缓存 Home 和 List -->
<KeepAlive :include="['Home', 'List']">
  <component :is="currentComponent" />
</KeepAlive>
```

```vue
<!-- 被缓存的组件必须声明 name -->
<script setup lang="ts">
// ✅ 使用 defineOptions 设置组件名称（Vue 3.3+）
defineOptions({ name: 'Home' })

// 或者使用单独的 <script> 块
</script>
```

#### 9. 服务端渲染（SSR）中的行为

在 SSR 期间，`onActivated` **不会被调用**。它只在客户端组件激活后才生效。如果需要在 SSR 中执行逻辑，应使用 `onMounted`。

#### 10. 异步组件的注意事项

使用 `defineAsyncComponent` 定义的异步组件配合 `<keep-alive>` 时，要确保异步组件加载完成后才能正确触发 `onActivated`。

```typescript
// ✅ 正确：异步组件配合 keep-alive 使用
const AsyncComp = defineAsyncComponent(() => import('./HeavyComponent.vue'))
```

> ⚠️ **注意：** 异步组件在加载失败时不会触发 `onActivated`，建议配合 `onError` 配置项处理加载异常。

---

### 七、相关 API 对比

| 特性 | `onActivated` | `onDeactivated` | `onMounted` | `onUnmounted` |
|------|--------------|-----------------|-------------|---------------|
| 触发时机 | 缓存组件激活时 | 缓存组件停用时 | 组件首次挂载时 | 组件销毁时 |
| 是否需要 `keep-alive` | 是 | 是 | 否 | 否 |
| 首次渲染是否触发 | 是 | 否 | 是 | 否 |
| 可触发次数 | 多次 | 多次 | 仅一次 | 仅一次 |

> 💡 **提示：** `onActivated` 和 `onDeactivated` 是一对配合使用的钩子。通常在 `onActivated` 中恢复状态、在 `onDeactivated` 中保存状态，两者配合使用效果最佳。

---

### 八、总结

`onActivated` 是 Vue 3 中处理缓存组件激活逻辑的核心 API，与 `<keep-alive>` 紧密配合，主要解决以下问题：

1. **避免重复请求**：缓存组件后，在激活时按需刷新数据，而非每次都重新创建组件
2. **保持用户状态**：如表单填写内容、滚动位置、搜索条件等
3. **资源管理**：在组件停用时释放定时器、WebSocket 等资源，激活时重新建立
4. **提升用户体验**：页面切换更快，不丢失操作进度

核心使用模式：
- 在 `onActivated` 中恢复状态、刷新数据
- 在 `onDeactivated` 中保存状态、释放资源
- 在 `onMounted` 中做首次初始化，利用标记避免与 `onActivated` 重复执行
