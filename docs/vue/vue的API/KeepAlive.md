### KeepAlive

> 📖 [官方文档 - KeepAlive](https://cn.vuejs.org/api/built-in-components#keepalive)

---

### 一、概述

`<KeepAlive>` 是 Vue 3 内置的抽象组件，它能够在组件切换时**缓存组件实例**，而不是销毁它们。当用户从一个组件切换到另一个组件再切回来时，被缓存的组件会保留之前的状态（如表单输入、滚动位置、异步数据等），避免重复渲染和重复请求，从而提升应用的性能和用户体验。

简单来说：**没有 `<KeepAlive>`，组件切换 = 销毁 + 重建；有了 `<KeepAlive>`，组件切换 = 停用 + 激活。**

---

### 二、核心原理

#### 工作机制

`<KeepAlive>` 的核心原理可以用一个类比来理解：

> 想象你在看一本小说，突然接到一个电话。如果**没有书签**（没有 KeepAlive），你合上书后下次打开需要从头翻找之前看到的位置；如果**有书签**（有 KeepAlive），你只需要翻开书签所在的那一页，立刻继续阅读。

底层机制如下：

1. **缓存容器**：`<KeepAlive>` 内部维护一个 `Map` 对象，以组件的 `key`（或 `vnode.type`）为键，以组件实例（`vnode.component`）为值进行缓存。
2. **不销毁策略**：当被包裹的组件从 DOM 中移除时，`<KeepAlive>` 会拦截 `unmount` 操作，将其转为 `deactivate`（停用），把组件实例存入缓存，而不是真正销毁。
3. **缓存恢复**：当组件再次被渲染时，`<KeepAlive>` 会从缓存中取出对应的组件实例，执行 `activate`（激活）操作，直接复用已有的实例和 DOM 节点。
4. **LRU 淘汰**：当设置了 `max` 属性时，内部使用**最近最少使用（LRU）算法**淘汰最久未访问的缓存实例，防止内存泄漏。
5. **生命周期映射**：缓存的组件不再触发 `mounted` / `unmounted`，而是触发 `onActivated` / `onDeactivated` 钩子。

```
组件首次渲染:  created → mounted → onActivated
组件切换离开:  onDeactivated（停用，但实例保留在内存中）
组件切换回来:  onActivated（激活，直接复用缓存的实例）
组件被 LRU 淘汰:  onDeactivated → unmounted（真正销毁）
```

---

### 三、详细用法

#### 1. 基本用法

最简单的使用方式是用 `<KeepAlive>` 包裹动态组件。

```vue
<!-- TabSwitch.vue -->
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import type { Component } from 'vue'
import UserProfile from './UserProfile.vue'
import UserSettings from './UserSettings.vue'
import UserMessages from './UserMessages.vue'

type TabKey = 'profile' | 'settings' | 'messages'

const currentTab = ref<TabKey>('profile')

const tabComponents: Record<TabKey, Component> = {
  profile: UserProfile,
  settings: UserSettings,
  messages: UserMessages
}
</script>

<template>
  <div class="tab-container">
    <nav class="tab-nav">
      <button
        v-for="(comp, key) in tabComponents"
        :key="key"
        :class="{ active: currentTab === key }"
        @click="currentTab = key"
      >
        {{ key }}
      </button>
    </nav>

    <!-- 使用 KeepAlive 包裹动态组件 -->
    <KeepAlive>
      <component :is="tabComponents[currentTab]" />
    </KeepAlive>
  </div>
</template>
```

配合 `v-if` / `v-else-if` 的写法：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import PageA from './PageA.vue'
import PageB from './PageB.vue'

const show = ref<'a' | 'b'>('a')
</script>

<template>
  <KeepAlive>
    <PageA v-if="show === 'a'" />
    <PageB v-else />
  </KeepAlive>
</template>
```

被缓存组件中的生命周期钩子使用：

```vue
<!-- CachedComponent.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const formData = ref({
  username: '',
  email: ''
})

// 只在首次挂载时执行一次
onMounted(() => {
  console.log('首次挂载：初始化数据')
})

// 每次激活时执行（包括首次和从缓存恢复时）
onActivated(() => {
  console.log('组件被激活：恢复滚动位置、重新订阅事件')
})

// 每次停用时执行
onDeactivated(() => {
  console.log('组件被停用：暂停定时器、取消事件订阅')
})

// 只在真正销毁时执行（被 LRU 淘汰或 KeepAlive 被移除时）
onUnmounted(() => {
  console.log('组件被销毁：清理所有资源')
})
</script>

<template>
  <form>
    <input v-model="formData.username" placeholder="用户名" />
    <input v-model="formData.email" placeholder="邮箱" />
  </form>
</template>
```

#### 2. 进阶用法

**（1）include / exclude 精确控制缓存范围**

```vue
<script setup lang="ts">
import { ref, type Component } from 'vue'
import NewsList from './NewsList.vue'
import ArticleDetail from './ArticleDetail.vue'
import SearchPage from './SearchPage.vue'

const current = ref<Component>(NewsList)
</script>

<template>
  <!-- 逗号分隔字符串：只缓存名称匹配的组件 -->
  <KeepAlive include="NewsList,ArticleDetail">
    <component :is="current" />
  </KeepAlive>

  <!-- 正则表达式：缓存所有以 "List" 结尾的组件 -->
  <!-- 注意：必须使用 v-bind 绑定（:include），否则会被当作字符串 -->
  <KeepAlive :include="/List$/">
    <component :is="current" />
  </KeepAlive>

  <!-- 数组形式：精确指定多个组件 -->
  <KeepAlive :include="['NewsList', 'ArticleDetail']">
    <component :is="current" />
  </KeepAlive>

  <!-- exclude：排除不需要缓存的组件 -->
  <KeepAlive exclude="SearchPage">
    <component :is="current" />
  </KeepAlive>
</template>
```

> 💡 **提示：** `include` 和 `exclude` 匹配的是组件的 **name 选项**。在 `<script setup>` 中，组件名默认取文件名。如果需要显式指定，可以使用 `defineOptions({ name: 'MyComponent' })`。

```vue
<!-- NewsList.vue -->
<script setup lang="ts">
// 显式定义组件名，供 KeepAlive 的 include/exclude 匹配
defineOptions({ name: 'NewsList' })
</script>
```

**（2）max 限制缓存数量**

```vue
<template>
  <!-- 最多缓存 5 个组件实例，超过时自动淘汰最久未访问的 -->
  <KeepAlive :max="5">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

**（3）配合 Vue Router 使用**

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <nav>
    <router-link to="/home">首页</router-link>
    <router-link to="/list">列表</router-link>
    <router-link to="/detail">详情</router-link>
  </nav>

  <!-- 缓存所有路由组件 -->
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

配合路由元信息 `meta` 按需缓存：

```vue
<!-- App.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 根据路由 meta.keepAlive 决定是否缓存
const includeList = computed(() => {
  return router.getRoutes()
    .filter(r => r.meta.keepAlive)
    .map(r => r.name as string)
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="includeList">
      <component :is="Component" :key="route.path" />
    </KeepAlive>
  </router-view>
</template>
```

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/list',
    name: 'ListPage',
    component: () => import('../views/ListPage.vue'),
    meta: { keepAlive: true } // 需要缓存
  },
  {
    path: '/detail/:id',
    name: 'DetailPage',
    component: () => import('../views/DetailPage.vue'),
    meta: { keepAlive: false } // 不需要缓存
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

**（4）动态控制缓存**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import Editor from './Editor.vue'
import Preview from './Preview.vue'

const enableCache = ref(true)
const currentView = ref<'editor' | 'preview'>('editor')
</script>

<template>
  <div>
    <label>
      <input v-model="enableCache" type="checkbox" />
      启用缓存
    </label>

    <!-- 动态决定是否使用 KeepAlive -->
    <KeepAlive v-if="enableCache">
      <component :is="currentView === 'editor' ? Editor : Preview" />
    </KeepAlive>
    <component
      v-else
      :is="currentView === 'editor' ? Editor : Preview"
    />
  </div>
</template>
```

#### 3. API 参数说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `include` | `string \| RegExp \| (string \| RegExp)[]` | `undefined` | 只有名称匹配的组件会被缓存。字符串用逗号分隔 |
| `exclude` | `string \| RegExp \| (string \| RegExp)[]` | `undefined` | 任何名称匹配的组件都不会被缓存 |
| `max` | `number` | `undefined` | 最大缓存实例数。超过时使用 LRU 算法淘汰最久未访问的实例 |

| 生命周期钩子 | 触发时机 | 说明 |
|-------------|---------|------|
| `onActivated()` | 组件被插入到 DOM 中 | 在 `mounted` 之后也会触发一次；之后每次从缓存恢复时触发 |
| `onDeactivated()` | 组件从 DOM 中移除 | 在 `unmounted` 之前触发；组件被停用（而非销毁）时触发 |

---

### 四、实现效果

以下示例完整演示了 `<KeepAlive>` 的缓存效果：

```vue
<!-- KeepAliveDemo.vue -->
<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const currentTab = ref<'form' | 'counter' | 'list'>('form')

// ---- 表单组件 ----
const FormTab = {
  name: 'FormTab',
  setup() {
    const inputText = ref('')
    const selectedOption = ref('option1')

    onActivated(() => {
      console.log('[FormTab] 已激活 —— 输入内容完好保留')
    })

    onDeactivated(() => {
      console.log('[FormTab] 已停用 —— 输入内容已缓存')
    })

    return () => (
      // 此处用模板替代，实际项目中使用 template
      null
    )
  }
}
</script>

<template>
  <div class="demo">
    <div class="tabs">
      <button @click="currentTab = 'form'">表单</button>
      <button @click="currentTab = 'counter'">计数器</button>
      <button @click="currentTab = 'list'">列表</button>
    </div>

    <KeepAlive>
      <component :is="currentTab === 'form' ? FormTab : currentTab === 'counter' ? CounterTab : ListTab" />
    </KeepAlive>
  </div>
</template>
```

使用前后对比：

```vue
<!-- ❌ 没有 KeepAlive：切换 tab 后输入内容丢失 -->
<component :is="currentComponent" />

<!-- ✅ 使用 KeepAlive：切换 tab 后输入内容保留 -->
<KeepAlive>
  <component :is="currentComponent" />
</KeepAlive>
```

运行效果说明：

```
// 1. 用户在"表单"tab 输入了 "Hello World"
// 2. 切换到"计数器"tab
//    控制台输出：[FormTab] 已停用 —— 输入内容已缓存
// 3. 切回"表单"tab
//    控制台输出：[FormTab] 已激活 —— 输入内容完好保留
//    页面上输入框中仍然显示 "Hello World" ✅
//
// 如果没有 KeepAlive：
//    切回"表单"tab 后输入框为空 ❌（组件被销毁后重新创建）
```

---

### 五、使用场景

#### 1. 多 Tab 页签切换保持状态

最常见的场景：后台管理系统的多 Tab 页签，切换时保持各页面状态。

```vue
<!-- MultiTabLayout.vue -->
<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'

interface TabItem {
  key: string
  label: string
  component: any
}

const activeTab = ref('dashboard')

const tabs: TabItem[] = [
  { key: 'dashboard', label: '仪表盘', component: defineAsyncComponent(() => import('./Dashboard.vue')) },
  { key: 'users', label: '用户管理', component: defineAsyncComponent(() => import('./UserManagement.vue')) },
  { key: 'orders', label: '订单管理', component: defineAsyncComponent(() => import('./OrderManagement.vue')) }
]

const currentComponent = computed(() => {
  return tabs.find(t => t.key === activeTab.value)?.component
})
</script>

<template>
  <div class="layout">
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <KeepAlive>
      <component :is="currentComponent" :key="activeTab" />
    </KeepAlive>
  </div>
</template>
```

#### 2. 表单草稿自动保留

用户填写复杂表单时切换到其他页面查看信息，回来后表单内容不丢失。

```vue
<!-- FormWithDraft.vue -->
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

interface SurveyData {
  name: string
  age: number
  feedback: string
  satisfaction: number
}

const formData = ref<SurveyData>({
  name: '',
  age: 0,
  feedback: '',
  satisfaction: 5
})

onDeactivated(() => {
  // 停用时自动保存草稿到 localStorage
  localStorage.setItem('survey-draft', JSON.stringify(formData.value))
  console.log('表单草稿已自动保存')
})

onActivated(() => {
  // 激活时尝试恢复草稿
  const saved = localStorage.getItem('survey-draft')
  if (saved) {
    formData.value = JSON.parse(saved)
    console.log('表单草稿已恢复')
  }
})
</script>

<template>
  <form class="survey-form">
    <input v-model="formData.name" placeholder="姓名" />
    <input v-model.number="formData.age" type="number" placeholder="年龄" />
    <textarea v-model="formData.feedback" placeholder="反馈内容" />
  </form>
</template>
```

#### 3. 列表页滚动位置记忆

列表页跳转到详情页再返回时，保持之前的滚动位置和已加载数据。

```vue
<!-- ProductList.vue -->
<script setup lang="ts">
import { ref, onActivated, onDeactivated, nextTick } from 'vue'

interface Product {
  id: number
  name: string
  price: number
}

const products = ref<Product[]>([])
const scrollPosition = ref(0)
const currentPage = ref(1)

// 模拟加载列表数据
async function loadProducts(page: number) {
  // ... 异步加载逻辑
}

onDeactivated(() => {
  // 记住当前滚动位置
  scrollPosition.value = document.querySelector('.product-list')?.scrollTop ?? 0
})

onActivated(() => {
  // 恢复滚动位置
  nextTick(() => {
    const container = document.querySelector('.product-list')
    if (container) {
      container.scrollTop = scrollPosition.value
    }
  })
})

onMounted(() => {
  loadProducts(currentPage.value)
})
</script>

<template>
  <div class="product-list" style="height: 600px; overflow-y: auto;">
    <div v-for="product in products" :key="product.id" class="product-item">
      <span>{{ product.name }}</span>
      <span>{{ product.price }}</span>
    </div>
  </div>
</template>
```

#### 4. 配合 Vue Router 按路由缓存页面

只缓存需要缓存的路由页面，其他页面正常销毁。

```ts
// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { keepAlive: false } // 个人中心不需要缓存
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { keepAlive: false }
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const cacheList = computed(() => {
  return router.getRoutes()
    .filter(r => r.meta.keepAlive && r.name)
    .map(r => r.name as string)
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="cacheList">
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </router-view>
</template>
```

#### 5. 视频 / 音频播放器状态保持

用户切换页面后保持视频的播放进度和播放状态。

```vue
<!-- VideoPlayer.vue -->
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const videoRef = ref<HTMLVideoElement>()
const wasPlaying = ref(false)
const currentTime = ref(0)

onDeactivated(() => {
  if (videoRef.value) {
    // 记住播放状态和时间
    wasPlaying.value = !videoRef.value.paused
    currentTime.value = videoRef.value.currentTime
    videoRef.value.pause() // 切走时暂停，节省资源
  }
})

onActivated(() => {
  if (videoRef.value && wasPlaying.value) {
    // 恢复播放进度和状态
    videoRef.value.currentTime = currentTime.value
    videoRef.value.play()
  }
})
</script>

<template>
  <video ref="videoRef" src="/video/tutorial.mp4" controls />
</template>
```

#### 6. 图表组件数据保留

图表组件加载完成后，切换 tab 不需要重新请求数据和重新渲染。

```vue
<!-- ChartPanel.vue -->
<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

interface ChartData {
  labels: string[]
  values: number[]
}

const chartData = ref<ChartData | null>(null)
const chartInstance = ref<any>(null)
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  // 只在首次加载时请求数据并渲染图表
  const response = await fetch('/api/chart-data')
  chartData.value = await response.json()
  renderChart()
})

onActivated(() => {
  // 激活时恢复图表自适应
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
  // 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    chartInstance.value?.resize()
  })
})

onDeactivated(() => {
  // 停用时取消监听，节省性能
  resizeObserver?.disconnect()
  resizeObserver = null
})

function renderChart() {
  // 渲染图表逻辑
}
</script>

<template>
  <div class="chart-container" ref="containerRef">
    <!-- 图表渲染区域 -->
  </div>
</template>
```

#### 7. 实时数据面板定时刷新控制

实时数据面板在激活时自动刷新，停用时暂停刷新以节省资源。

```vue
<!-- RealtimeDashboard.vue -->
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

interface DashboardData {
  onlineUsers: number
  totalSales: number
  errorRate: number
}

const dashboardData = ref<DashboardData>({
  onlineUsers: 0,
  totalSales: 0,
  errorRate: 0
})

let timer: ReturnType<typeof setInterval> | null = null

async function refreshData() {
  const res = await fetch('/api/dashboard/realtime')
  dashboardData.value = await res.json()
}

onActivated(() => {
  // 激活时立即刷新一次，然后每 5 秒刷新
  refreshData()
  timer = setInterval(refreshData, 5000)
})

onDeactivated(() => {
  // 停用时清除定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="dashboard">
    <div class="stat-card">
      <h3>在线用户</h3>
      <p>{{ dashboardData.onlineUsers }}</p>
    </div>
    <div class="stat-card">
      <h3>总销售额</h3>
      <p>{{ dashboardData.totalSales }}</p>
    </div>
    <div class="stat-card">
      <h3>错误率</h3>
      <p>{{ dashboardData.errorRate }}%</p>
    </div>
  </div>
</template>
```

#### 8. 富文本编辑器内容保持

富文本编辑器切换到预览模式或查看其他页面后，编辑内容不丢失。

```vue
<!-- RichTextEditor.vue -->
<script setup lang="ts">
import { ref, onActivated, onDeactivated, onMounted, onBeforeUnmount } from 'vue'

const content = ref('<p>开始编辑...</p>')
const editorInstance = ref<any>(null)

onMounted(() => {
  // 初始化富文本编辑器（假设使用某种编辑器库）
  // editorInstance.value = createEditor(...)
})

onActivated(() => {
  // 激活时恢复焦点到编辑区
  editorInstance.value?.focus()
  console.log('编辑器已激活，内容保留')
})

onDeactivated(() => {
  // 停用时保存草稿
  const draft = {
    content: content.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem('editor-draft', JSON.stringify(draft))
})
</script>

<template>
  <div class="editor-wrapper">
    <div class="toolbar">
      <button @click="/* 加粗 */">B</button>
      <button @click="/* 斜体 */">I</button>
    </div>
    <div contenteditable v-html="content" @input="content = ($event.target as HTMLElement).innerHTML" />
  </div>
</template>
```

#### 9. 地图组件状态保持

地图缩放级别、中心点位置、已添加的标注等状态在切换后保持不变。

```vue
<!-- MapView.vue -->
<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

interface MapState {
  center: [number, number]
  zoom: number
  markers: Array<{ id: string; lat: number; lng: number }>
}

const mapState = ref<MapState>({
  center: [116.397, 39.908],
  zoom: 12,
  markers: []
})

const mapInstance = ref<any>(null)

onMounted(() => {
  // 初始化地图
  // mapInstance.value = new MapSDK.Map(...)
})

onActivated(() => {
  if (mapInstance.value) {
    // 恢复地图视角
    mapInstance.value.setCenter(mapState.value.center)
    mapInstance.value.setZoom(mapState.value.zoom)
  }
})

onDeactivated(() => {
  if (mapInstance.value) {
    // 保存当前地图状态
    mapState.value.center = mapInstance.value.getCenter()
    mapState.value.zoom = mapInstance.value.getZoom()
  }
})
</script>

<template>
  <div id="map-container" style="width: 100%; height: 500px;" />
</template>
```

#### 10. 步骤表单向导

多步骤表单中，用户在步骤间来回切换时，之前步骤的填写内容保持不变。

```vue
<!-- StepWizard.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import StepBasicInfo from './StepBasicInfo.vue'
import StepContactInfo from './StepContactInfo.vue'
import StepConfirm from './StepConfirm.vue'

const currentStep = ref(0)

const steps = [
  { label: '基本信息', component: StepBasicInfo },
  { label: '联系方式', component: StepContactInfo },
  { label: '确认提交', component: StepConfirm }
]

const currentComponent = computed(() => steps[currentStep.value].component)

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}
</script>

<template>
  <div class="wizard">
    <div class="step-indicators">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="{ active: currentStep === index, completed: currentStep > index }"
        class="step-item"
      >
        {{ step.label }}
      </div>
    </div>

    <!-- 缓存所有步骤，来回切换不会丢失已填写的数据 -->
    <KeepAlive>
      <component :is="currentComponent" :key="currentStep" />
    </KeepAlive>

    <div class="actions">
      <button v-if="currentStep > 0" @click="prevStep">上一步</button>
      <button v-if="currentStep < steps.length - 1" @click="nextStep">下一步</button>
    </div>
  </div>
</template>
```

---

### 六、注意事项

#### 1. KeepAlive 只能有一个直接子组件

```vue
<!-- ❌ 错误：多个子组件 -->
<KeepAlive>
  <ComponentA />
  <ComponentB />
</KeepAlive>

<!-- ✅ 正确：使用条件渲染确保只有一个子组件 -->
<KeepAlive>
  <ComponentA v-if="showA" />
  <ComponentB v-else />
</KeepAlive>

<!-- ✅ 正确：使用动态组件 -->
<KeepAlive>
  <component :is="currentComponent" />
</KeepAlive>
```

#### 2. include / exclude 匹配的是组件 name，不是文件名

```vue
<!-- ❌ 错误：include 写了文件名，但组件 name 不同 -->
<!-- 组件文件名是 MyForm.vue，但组件内 name 是 'UserForm' -->
<KeepAlive include="MyForm">
  <component :is="current" />
</KeepAlive>

<!-- ✅ 正确：使用组件内定义的 name -->
<KeepAlive include="UserForm">
  <component :is="current" />
</KeepAlive>
```

```vue
<!-- UserForm.vue -->
<script setup lang="ts">
// 使用 defineOptions 显式定义组件名
defineOptions({ name: 'UserForm' })
</script>
```

#### 3. 字符串形式的 include/exclude 需要逗号分隔且不加空格

```vue
<!-- ❌ 错误：带空格 -->
<KeepAlive include="CompA, CompB">
  <component :is="current" />
</KeepAlive>

<!-- ✅ 正确：逗号后不加空格 -->
<KeepAlive include="CompA,CompB">
  <component :is="current" />
</KeepAlive>

<!-- ✅ 推荐：使用数组形式，更清晰 -->
<KeepAlive :include="['CompA', 'CompB']">
  <component :is="current" />
</KeepAlive>
```

#### 4. 缓存组件不会重新触发 setup / onMounted

```vue
<!-- CachedComponent.vue -->
<script setup lang="ts">
import { onMounted, onActivated } from 'vue'

// 只在第一次创建时执行
onMounted(() => {
  console.log('mounted —— 只执行一次')
})

// 每次激活（包括第一次）都会执行
onActivated(() => {
  console.log('activated —— 每次显示都执行')
  // 将需要每次执行的逻辑放在这里
})
</script>
```

> ⚠️ **注意：** 不要把只需要执行一次的初始化逻辑（如绑定全局事件）放在 `onActivated` 中，也不要把每次显示都需要更新的逻辑（如刷新数据）只放在 `onMounted` 中。

#### 5. 及时清理定时器和事件监听，防止内存泄漏

```vue
<script setup lang="ts">
import { onActivated, onDeactivated, onUnmounted } from 'vue'

let timer: ReturnType<typeof setInterval> | null = null

onActivated(() => {
  timer = setInterval(() => {
    console.log('轮询中...')
  }, 3000)
})

onDeactivated(() => {
  // ✅ 停用时清除定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

onUnmounted(() => {
  // ✅ 销毁时也清除，双重保险
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
```

#### 6. 合理设置 max，防止内存占用过高

```vue
<!-- ❌ 危险：不设上限，缓存无限增长 -->
<KeepAlive>
  <component :is="current" />
</KeepAlive>

<!-- ✅ 安全：设置合理的上限 -->
<KeepAlive :max="10">
  <component :is="current" />
</KeepAlive>
```

> ⚠️ **注意：** 每个被缓存的组件实例都会保留其完整的响应式数据、DOM 节点引用、事件监听等。如果组件很大或缓存数量过多，会导致明显的内存占用。建议根据实际业务场景设置合理的 `max` 值。

#### 7. KeepAlive 与 Transition 配合使用

```vue
<!-- ✅ 正确的嵌套顺序：Transition 在外，KeepAlive 在内 -->
<Transition name="fade" mode="out-in">
  <KeepAlive>
    <component :is="currentComponent" />
  </KeepAlive>
</Transition>

<!-- ❌ 错误：KeepAlive 在外会导致动画失效 -->
<KeepAlive>
  <Transition name="fade" mode="out-in">
    <component :is="currentComponent" />
  </Transition>
</KeepAlive>
```

#### 8. 动态组件必须设置 key 以保证缓存正确

```vue
<!-- ❌ 可能导致缓存混乱：相同组件不同参数时不会区分 -->
<KeepAlive>
  <component :is="DetailPage" :id="currentId" />
</KeepAlive>

<!-- ✅ 使用 key 区分不同参数的组件实例 -->
<KeepAlive>
  <component :is="DetailPage" :id="currentId" :key="'detail-' + currentId" />
</KeepAlive>
```

> ⚠️ **注意：** 使用 `key` 会创建多个缓存实例。如果 `key` 值变化频繁（如列表页中每条记录都对应不同的 key），需要配合 `max` 限制缓存数量，否则会导致内存泄漏。

#### 9. 异步组件与 KeepAlive 的兼容性

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => import('./HeavyComponent.vue'))
</script>

<template>
  <!-- ✅ 异步组件可以正常使用 KeepAlive -->
  <KeepAlive>
    <component :is="AsyncComp" />
  </KeepAlive>
</template>
```

> 💡 **提示：** 异步组件首次加载时会显示 loading/suspense 状态，加载完成后才会被缓存。后续切换走再切回来时，会直接从缓存恢复，不再经过异步加载过程。

#### 10. SSR 场景下的注意事项

> ⚠️ **注意：** 在 SSR（服务端渲染）场景中，`<KeepAlive>` 只在客户端生效。服务端渲染时，组件始终是"首次渲染"，不涉及缓存激活/停用的逻辑。`onActivated` 和 `onDeactivated` 钩子不会在服务端执行。

---

### 七、相关 API 对比

| 特性 | `<KeepAlive>` | `v-show` | `v-if` |
|------|--------------|-----------|---------|
| **DOM 状态** | 保留（从 DOM 移除但缓存在内存中） | 保留（仅 `display: none`） | 不保留（完全销毁） |
| **组件实例** | 保留 | 保留 | 销毁 |
| **触发钩子** | `onActivated` / `onDeactivated` | 无特殊钩子 | `onMounted` / `onUnmounted` |
| **适用场景** | 动态组件 / 路由切换 | 同一组件的条件显示 | 条件渲染 |
| **性能开销** | 中等（内存换时间） | 低（仅 CSS 切换） | 每次都完整创建/销毁 |
| **响应式数据** | 保留 | 保留 | 重置 |
| **切换成本** | 低（复用实例） | 极低（CSS 切换） | 高（重建实例） |

```
选择建议：
├── 需要在多个不同组件之间切换且保留状态 → KeepAlive
├── 同一个组件频繁显示/隐藏 → v-show
└── 条件为 true 时才需要渲染，且不需要保留状态 → v-if
```

---

### 八、总结

`<KeepAlive>` 是 Vue 3 中用于**组件级别缓存**的核心方案，它的核心价值在于：

1. **状态保留**：组件切换时保留表单数据、滚动位置、选中状态等
2. **性能优化**：避免重复创建和销毁组件，减少不必要的 DOM 操作和数据请求
3. **用户体验**：页面切换更加流畅，无需等待重新加载

**核心使用模式：**

- 用 `<KeepAlive>` 包裹动态组件或条件渲染组件
- 用 `include` / `exclude` 控制缓存范围
- 用 `max` 限制缓存数量，防止内存泄漏
- 在缓存组件中使用 `onActivated` / `onDeactivated` 处理激活/停用逻辑
- 配合 Vue Router 的 `v-slot` 实现路由级别的页面缓存

**最佳实践口诀：**

> 合理缓存提性能，`max` 上限要设清。
> `name` 匹配 `include` 规，定时器在 `deactivated` 清。
> 激活停用分清楚，`key` 值设置要分明。
> `Transition` 在外层，嵌套顺序别搞混。
