# v-once

> 📖 [Vue 官方文档 - v-once](https://cn.vuejs.org/api/built-in-directives.html#v-once)

### 一、概述

`v-once` 是 Vue 3 内置的一个指令，用于将元素及其所有子节点标记为**只渲染一次**的静态内容。首次渲染完成后，该元素及其整个子树将被视为静态内容，后续的任何响应式数据变化都不会触发该部分的重新渲染。

简单来说，`v-once` 的作用就是**"渲染一次，终身不变"**。它解决的核心问题是：

- **性能优化**：对于确定不会变化的内容，跳过虚拟 DOM 的 diff 比对过程，减少不必要的更新开销
- **初始值快照**：在需要"冻结"首次渲染结果的场景中，保留数据的初始状态
- **静态内容标记**：明确告诉 Vue 某部分内容是静态的，帮助编译器生成更高效的渲染代码

> 💡 **提示：** 在 Vue 3.2+ 中，`v-once` 会被编译器进一步优化。带有 `v-once` 的节点会被提升为常量，在补丁算法中直接跳过，性能收益比 Vue 2 时期更加显著。

### 二、核心原理

`v-once` 的工作原理可以从编译阶段和运行时两个层面来理解：

**编译阶段**：当 Vue 模板编译器遇到带有 `v-once` 的节点时，会生成特殊的渲染函数代码。该节点的内容会被缓存为一个常量，后续渲染时直接复用缓存结果，不再重新执行渲染逻辑。

**运行时行为**：
1. 首次渲染时，`v-once` 节点正常执行渲染，生成真实的 DOM 节点
2. 渲染完成后，该节点的 VNode（虚拟 DOM 节点）被缓存
3. 后续每次父组件重新渲染时，`v-once` 节点直接返回缓存的 VNode，跳过整个 diff 比对过程
4. 该节点及其所有子节点的内容保持首次渲染时的状态，不再响应任何数据变化

```
┌─────────────────────────────────────────────┐
│            v-once 生命周期示意               │
├─────────────────────────────────────────────┤
│  首次渲染 → 正常生成 VNode 和 DOM            │
│      ↓                                      │
│  缓存 VNode → 后续渲染直接复用               │
│      ↓                                      │
│  跳过 Diff → 不参与 Patch 比对              │
│      ↓                                      │
│  DOM 不变 → 内容永远保持首次渲染结果         │
└─────────────────────────────────────────────┘
```

> ⚠️ **注意：** `v-once` 只影响视图更新，不会影响事件监听器。被 `v-once` 标记的元素上的事件绑定依然可以正常触发和执行，只是事件中修改的响应式数据不会反映到该元素的视图上。

### 三、详细用法

#### 1. 基本用法

**最简单的用法**：在单个元素上使用 `v-once`，使其内容在首次渲染后不再更新。

```vue
<template>
  <!-- ✅ span 的内容只在首次渲染时显示 message 的值，后续 message 变化不会更新 -->
  <span v-once>{{ message }}</span>

  <button @click="updateMessage">改变内容</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref<string>('初始内容')

function updateMessage(): void {
  message.value = '新内容'
  // 点击按钮后，span 中的文本仍然是 "初始内容"
}
</script>
```

**在包含多个子节点的父元素上使用**：`v-once` 会作用于整个子树。

```vue
<template>
  <!-- ✅ 整个 div 及其所有子节点都只渲染一次 -->
  <div v-once>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <ul>
      <li v-for="item in list" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ListItem {
  id: number
  name: string
}

const title = ref<string>('功能介绍')
const description = ref<string>('这是描述文本')
const list = ref<ListItem[]>([
  { id: 1, name: '功能一' },
  { id: 2, name: '功能二' }
])
</script>
```

#### 2. 进阶用法

**(1) 在组件上使用 v-once**

```vue
<template>
  <div>
    <!-- ✅ 组件只渲染一次，后续 props 变化不会触发组件更新 -->
    <StaticBanner v-once :title="bannerTitle" :config="bannerConfig" />

    <!-- 这个组件会正常响应 props 变化 -->
    <DynamicContent :data="currentData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import StaticBanner from './StaticBanner.vue'
import DynamicContent from './DynamicContent.vue'

const bannerTitle = ref<string>('欢迎光临')
const bannerConfig = reactive({ color: '#42b883', size: 'large' })
const currentData = ref<string>('动态数据')
</script>
```

**(2) 配合 v-for 使用**

```vue
<template>
  <ul>
    <!-- ✅ 每个列表项独立地只渲染一次 -->
    <li v-for="item in items" :key="item.id" v-once>
      {{ item.name }} - {{ item.price }} 元
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  name: string
  price: number
}

const items = ref<Item[]>([
  { id: 1, name: '商品 A', price: 99 },
  { id: 2, name: '商品 B', price: 199 }
])
// ⚠️ 即使后续修改 items 的值，列表也不会重新渲染
</script>
```

**(3) 配合 v-if / v-else 使用**

```vue
<template>
  <!-- ✅ v-once 与 v-if 配合：条件首次判断后，结果被"冻结" -->
  <div v-if="isAdmin" v-once>
    <p>管理员面板</p>
    <p>欢迎，{{ userName }}</p>
  </div>
  <div v-else v-once>
    <p>普通用户页面</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isAdmin = ref<boolean>(true)
const userName = ref<string>('张三')
// 即使后续 isAdmin 变为 false，显示内容也不会改变
</script>
```

**(4) 事件监听器仍然有效**

```vue
<template>
  <!-- ✅ v-once 只跳过渲染更新，事件绑定不受影响 -->
  <button v-once @click="handleClick">
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const buttonText = ref<string>('点击我')
const clickCount = ref<number>(0)

function handleClick(): void {
  clickCount.value++
  console.log(`按钮被点击了 ${clickCount.value} 次`)
  // ⚠️ 注意：修改 buttonText 不会更新按钮文本，因为按钮被 v-once 标记了
  // 但 clickCount 的变化可以在其他非 v-once 的元素中正常显示
}
</script>
```

**(5) 在 `<template>` 标签上使用**

```vue
<template>
  <div>
    <!-- ✅ v-once 作用于 template 内的所有根节点 -->
    <template v-once>
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDescription }}</p>
    </template>

    <!-- 以下内容正常响应式更新 -->
    <p>{{ dynamicContent }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const pageTitle = ref<string>('页面标题')
const pageDescription = ref<string>('页面描述')
const dynamicContent = ref<string>('可变内容')
</script>
```

#### 3. API 参数说明

| 属性 | 说明 |
|------|------|
| **指令名称** | `v-once` |
| **参数** | 无，不需要传入任何值 |
| **修饰符** | 无 |
| **作用范围** | 当前元素及其所有子节点（整个子树） |
| **首次渲染** | 正常渲染，与没有 `v-once` 时行为一致 |
| **后续更新** | 完全跳过，直接复用首次渲染的 DOM |
| **事件影响** | 不影响，事件监听器依然正常绑定和触发 |
| **响应式影响** | 子树内所有响应式绑定失效，不再追踪依赖 |
| **最低版本** | Vue 2.x 引入，Vue 3.x 持续优化 |
| **编译优化** | Vue 3.2+ 中节点被提升为常量，PatchFlag 设为 HOISTED |

### 四、实现效果

使用 `v-once` 后的渲染行为对比：

```vue
<template>
  <div>
    <!-- 没有使用 v-once：每次 count 变化都会更新 -->
    <p>动态计数：{{ count }}</p>

    <!-- 使用 v-once：永远显示首次渲染的值 -->
    <p v-once>冻结计数：{{ count }}</p>

    <button @click="count++">增加计数</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
</script>
```

**行为说明**：

| 操作 | 动态计数显示 | 冻结计数显示 |
|------|-------------|-------------|
| 首次渲染 | 0 | 0 |
| 点击按钮 1 次 | 1 | 0（不变） |
| 点击按钮 2 次 | 2 | 0（不变） |
| 点击按钮 3 次 | 3 | 0（不变） |

**编译产物差异（简化示意）**：

```ts
// 不使用 v-once：每次渲染都创建新的 VNode
_renderCache = [
  createElementVNode('p', null, '动态计数：' + _ctx.count, 1 /* TEXT */)
]

// 使用 v-once：缓存首次的 VNode，后续直接复用
_setBlockTracking(-1)
const _hoisted = createElementVNode('p', null, '冻结计数：0', -1 /* HOISTED */)
_setBlockTracking()
// 后续渲染直接使用 _hoisted，不再重新创建
```

### 五、使用场景

#### 1. 静态页面头部/底部内容

网站页面的顶部导航、Logo、底部版权信息等内容在整个应用生命周期内不会改变，使用 `v-once` 可以避免不必要的 diff 开销。

```vue
<template>
  <div>
    <!-- ✅ 页面头部内容确定不变 -->
    <header v-once>
      <nav>
        <div class="logo">MyApp</div>
        <ul>
          <li><a href="/home">首页</a></li>
          <li><a href="/about">关于</a></li>
          <li><a href="/contact">联系</a></li>
        </ul>
      </nav>
    </header>

    <!-- ✅ 页面底部版权信息不会变化 -->
    <footer v-once>
      <p>&copy; 2026 MyApp Inc. All rights reserved.</p>
      <p>Version: {{ appVersion }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const appVersion: string = '2.1.0'
</script>
```

#### 2. 初始值快照 / 时间戳冻结

在需要记录"首次加载时"的状态，如页面打开时间、首次获取的数据快照等。

```vue
<template>
  <div>
    <p>当前服务器时间：{{ currentTime }}</p>
    <!-- ✅ 冻结页面加载时的时间，不随 currentTime 变化 -->
    <p v-once>页面加载于：{{ loadTime }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loadTime = ref<string>('')
const currentTime = ref<string>('')

onMounted(() => {
  const now = new Date().toLocaleString('zh-CN')
  loadTime.value = now
  currentTime.value = now
})

// 每秒更新当前时间，但 loadTime 的显示不会变
const timer = setInterval(() => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}, 1000)

onMounted(() => {
  // 组件卸载时清除定时器
  return () => clearInterval(timer)
})
</script>
```

#### 3. 静态配置信息展示

对于应用配置、环境信息等在运行时不会变化的内容，使用 `v-once` 标记。

```vue
<template>
  <div v-once class="config-panel">
    <h3>应用配置</h3>
    <ul>
      <li>运行环境：{{ config.env }}</li>
      <li>API 地址：{{ config.apiBaseUrl }}</li>
      <li>构建版本：{{ config.buildVersion }}</li>
      <li>启用调试：{{ config.debug ? '是' : '否' }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface AppConfig {
  env: string
  apiBaseUrl: string
  buildVersion: string
  debug: boolean
}

const config: AppConfig = reactive({
  env: import.meta.env.MODE,
  apiBaseUrl: import.meta.env.VITE_API_URL,
  buildVersion: import.meta.env.VITE_APP_VERSION,
  debug: import.meta.env.DEV
})
</script>
```

#### 4. 大型静态表格或列表

当渲染大量不需要更新的数据时，`v-once` 可以显著减少后续渲染的 diff 开销。

```vue
<template>
  <div>
    <!-- ✅ 历史数据不会再变化，使用 v-once 避免后续 diff -->
    <table v-once>
      <thead>
        <tr>
          <th>日期</th>
          <th>事件</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in historicalRecords" :key="record.id">
          <td>{{ record.date }}</td>
          <td>{{ record.event }}</td>
          <td>{{ record.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface HistoryRecord {
  id: number
  date: string
  event: string
  status: string
}

const historicalRecords = ref<HistoryRecord[]>([
  { id: 1, date: '2026-01-15', event: '系统上线', status: '已完成' },
  { id: 2, date: '2026-03-20', event: '版本升级', status: '已完成' },
  { id: 3, date: '2026-05-10', event: '数据迁移', status: '已完成' }
])
</script>
```

#### 5. 表单初始值回显与编辑分离

在表单场景中，需要同时展示初始值和当前编辑值时，初始值部分可以用 `v-once` 冻结。

```vue
<template>
  <div>
    <h3>用户信息编辑</h3>

    <!-- ✅ 初始值快照，始终显示原始数据 -->
    <div v-once class="original-info">
      <p>原始用户名：{{ form.originalName }}</p>
      <p>原始邮箱：{{ form.originalEmail }}</p>
    </div>

    <!-- 编辑区域正常响应式 -->
    <div class="edit-form">
      <label>
        用户名：
        <input v-model="form.name" type="text" />
      </label>
      <label>
        邮箱：
        <input v-model="form.email" type="text" />
      </label>
    </div>

    <button @click="handleSave">保存</button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface UserForm {
  originalName: string
  originalEmail: string
  name: string
  email: string
}

const form = reactive<UserForm>({
  originalName: '张三',
  originalEmail: 'zhangsan@example.com',
  name: '张三',
  email: 'zhangsan@example.com'
})

function handleSave(): void {
  console.log('保存修改：', { name: form.name, email: form.email })
}
</script>
```

#### 6. 条件渲染中的首次结果缓存

某些条件渲染只需要判断一次，后续即使条件变化也不需要重新渲染。

```vue
<template>
  <div>
    <!-- ✅ 根据初始权限判断结果渲染，后续权限变化不重新渲染 -->
    <div v-if="hasPermission" v-once>
      <h3>管理员面板</h3>
      <p>当前管理员：{{ adminName }}</p>
    </div>
    <div v-else v-once>
      <h3>访客模式</h3>
      <p>请联系管理员获取权限</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hasPermission = ref<boolean>(checkInitialPermission())
const adminName = ref<string>('超级管理员')

function checkInitialPermission(): boolean {
  // 根据初始状态判断权限
  return true
}
</script>
```

#### 7. 只展示一次的引导/公告组件

新手引导、系统公告等只需要在页面加载时展示一次的内容，可以使用 `v-once` 确保不会因为父组件重渲染而重复触发动画或状态。

```vue
<template>
  <div>
    <!-- ✅ 引导提示只渲染一次，即使父组件重渲染也不会重新显示 -->
    <div v-if="showGuide" v-once class="guide-overlay">
      <div class="guide-content">
        <h3>欢迎使用本系统</h3>
        <p>{{ guideContent }}</p>
        <button @click="dismissGuide">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showGuide = ref<boolean>(true)
const guideContent = ref<string>('这是系统的使用指南内容...')

function dismissGuide(): void {
  // ⚠️ 由于 v-once，这里的 DOM 不会被移除
  // 如需隐藏，应使用 v-show 或不加 v-once
  showGuide.value = false
  console.log('引导已关闭')
}
</script>
```

#### 8. 静态 SVG 图标或装饰元素

SVG 图标、装饰性元素等在渲染后不会改变，使用 `v-once` 减少不必要的追踪。

```vue
<template>
  <div>
    <!-- ✅ SVG 图标内容不会变化，使用 v-once -->
    <div v-once class="icon-wrapper">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" fill="none" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" fill="none" />
      </svg>
    </div>

    <!-- 动态内容正常更新 -->
    <p>{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const status = ref<string>('加载完成')
</script>
```

#### 9. 第三方嵌入内容的隔离

嵌入第三方内容（如地图、视频播放器）时，这些内容一旦加载就不再需要 Vue 的响应式更新，用 `v-once` 将其隔离。

```vue
<template>
  <div>
    <!-- ✅ 第三方地图组件只初始化一次，后续不参与 diff -->
    <div v-once class="map-container">
      <div ref="mapRef" class="map"></div>
    </div>

    <!-- 其他动态内容正常更新 -->
    <div class="controls">
      <p>当前位置：{{ location }}</p>
      <button @click="refreshLocation">刷新位置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const mapRef = ref<HTMLElement | null>(null)
const location = ref<string>('北京市朝阳区')

onMounted(() => {
  // 初始化第三方地图实例
  if (mapRef.value) {
    initMap(mapRef.value)
  }
})

function initMap(container: HTMLElement): void {
  // 第三方地图初始化逻辑
  console.log('地图初始化完成')
}

function refreshLocation(): void {
  location.value = '上海市浦东新区'
}
</script>
```

#### 10. 游染性能敏感的大型组件

在性能要求极高的场景中，对确定不会更新的复杂子树使用 `v-once`，避免大型组件树参与 diff。

```vue
<template>
  <div>
    <!-- ✅ 大型复杂组件只渲染一次，避免参与后续 diff -->
    <HeavyReportRenderer v-once :report-data="initialReport" />

    <!-- 交互控制区域正常响应式 -->
    <div class="controls">
      <button @click="exportReport">导出报告</button>
      <p>导出状态：{{ exportStatus }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeavyReportRenderer from './HeavyReportRenderer.vue'

interface ReportData {
  id: string
  title: string
  sections: Array<{ heading: string; content: string }>
}

const initialReport = ref<ReportData>({
  id: 'report-001',
  title: '年度报告',
  sections: Array.from({ length: 50 }, (_, i) => ({
    heading: `第 ${i + 1} 章`,
    content: `这是第 ${i + 1} 章的内容...`
  }))
})

const exportStatus = ref<string>('就绪')

function exportReport(): void {
  exportStatus.value = '导出中...'
  setTimeout(() => {
    exportStatus.value = '导出完成'
  }, 2000)
}
</script>
```

### 六、注意事项

#### 1. v-once 会作用于整个子树

`v-once` 不仅影响当前元素，还会递归作用于所有子节点和子组件。如果子树中包含需要动态更新的内容，会导致数据变化后视图不更新。

```vue
<template>
  <!-- ❌ 错误：整个子树都不会更新，包括需要动态变化的 message -->
  <div v-once>
    <h1>静态标题</h1>
    <p>{{ message }}</p>
    <ChildComponent :data="dynamicData" />
  </div>

  <!-- ✅ 正确：只对确实不需要更新的部分使用 v-once -->
  <div>
    <h1 v-once>静态标题</h1>
    <p>{{ message }}</p>
    <ChildComponent :data="dynamicData" />
  </div>
</template>
```

#### 2. 事件监听器不受影响，但视图不会更新

`v-once` 节点上的事件监听器可以正常触发，但事件中修改的响应式数据不会反映到该节点的视图上。

```vue
<template>
  <button v-once @click="count++">
    点击次数：{{ count }}
    <!-- ❌ 点击按钮后，显示的数字不会变化，但 count 的值确实在增加 -->
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref<number>(0)
</script>
```

#### 3. 组件的 props 变化不会触发更新

在组件上使用 `v-once` 后，即使传入的 props 发生变化，组件也不会重新渲染。

```vue
<template>
  <!-- ❌ 错误：如果 count 需要实时展示，不应使用 v-once -->
  <CounterDisplay v-once :count="count" />
  <button @click="count++">增加</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CounterDisplay from './CounterDisplay.vue'
const count = ref<number>(0)
</script>
```

#### 4. 不要对频繁变化的内容使用

`v-once` 的设计目的是优化不需要更新的内容，对需要响应式更新的内容使用会导致 bug。

```vue
<template>
  <!-- ❌ 错误：实时时间需要持续更新 -->
  <span v-once>{{ currentTime }}</span>

  <!-- ✅ 正确：需要更新的内容不加 v-once -->
  <span>{{ currentTime }}</span>
</template>
```

#### 5. v-if 与 v-once 配合时的行为

当 `v-if` 和 `v-once` 同时使用时，条件只在首次渲染时判断一次，后续条件变化不会切换显示/隐藏。

```vue
<template>
  <!-- ⚠️ 首次渲染时 show 为 true，后续即使 show 变为 false，内容仍然显示 -->
  <div v-if="show" v-once>显示内容</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const show = ref<boolean>(true)
// 如果需要条件动态切换，不要加 v-once
</script>
```

#### 6. v-for 与 v-once 配合时的作用范围

当 `v-for` 和 `v-once` 在同一元素上使用时，`v-once` 作用于每个列表项独立生效，而不是整个列表。

```vue
<template>
  <ul>
    <!-- ✅ 每个列表项独立地只渲染一次，新增的项目在首次出现后也不再更新 -->
    <li v-for="item in items" :key="item.id" v-once>{{ item.name }}</li>
  </ul>
</template>
```

#### 7. v-once 不影响 ref 引用

被 `v-once` 标记的元素上的 `ref` 仍然可以正常获取 DOM 引用，但通过 ref 直接操作 DOM 不会触发 Vue 的响应式更新。

```vue
<template>
  <!-- ✅ ref 仍然有效 -->
  <div v-once ref="staticRef">{{ content }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const staticRef = ref<HTMLElement | null>(null)
const content = ref<string>('静态内容')

onMounted(() => {
  // ref 可以正常获取到 DOM 元素
  console.log(staticRef.value?.textContent) // "静态内容"
})
</script>
```

#### 8. v-once 与 SSR 的兼容性

在服务端渲染（SSR）场景中，`v-once` 标记的内容在服务端渲染后，客户端水合（hydration）时也会正确处理，不会导致水合不匹配的警告。

> 💡 **提示：** 在 SSR 中使用 `v-once` 实际上是安全的，因为内容本身就是静态的，不存在服务端和客户端渲染结果不一致的问题。

#### 9. 现代 Vue 中性能收益有限

Vue 3 的编译器已经对静态内容做了大量自动优化（静态提升、PatchFlag 标记等），对于简单的静态内容，编译器会自动处理。`v-once` 的主要价值在于包含动态绑定但确定不会更新的场景。

```vue
<template>
  <!-- Vue 3 编译器已经会自动将这种纯静态内容提升 -->
  <h1>Hello World</h1>

  <!-- v-once 更适合这种有动态绑定但不需要更新的场景 -->
  <h2 v-once>{{ config.title }}</h2>
</template>
```

#### 10. 优先考虑 v-memo 的灵活性

如果内容并非永远不更新，而是在特定条件下不更新，应该使用 `v-memo` 代替 `v-once`，它提供了更精细的控制。

```vue
<template>
  <!-- v-once：永远不更新 -->
  <div v-once>{{ message }}</div>

  <!-- ✅ v-memo：只在 selectedId 变化时才更新，比 v-once 更灵活 -->
  <div v-memo="[selectedId]">
    <p>{{ item.name }}</p>
    <p>{{ item.description }}</p>
  </div>
</template>
```

### 七、相关 API 对比

| 对比维度 | `v-once` | `v-memo` | `v-cloak` |
|---------|----------|----------|-----------|
| **版本** | Vue 2.x+ | Vue 3.2+ | Vue 2.x+ |
| **作用** | 只渲染一次 | 条件性跳过更新 | 隐藏未编译模板 |
| **参数** | 无 | 接受依赖数组 | 无 |
| **更新策略** | 永远不更新 | 依赖变化时更新 | 编译完成后移除 |
| **灵活性** | 低 | 高 | - |
| **适用场景** | 纯静态内容 | 部分条件不变的内容 | 防止模板闪烁 |
| **性能影响** | 跳过整个 diff | 跳过不必要的 diff | 无 |
| **编译优化** | 节点提升为常量 | 条件性缓存 | CSS 属性控制 |

```vue
<template>
  <!-- v-once：永远不更新，适合确定不变的内容 -->
  <div v-once>{{ initialValue }}</div>

  <!-- v-memo：只在 valueA 变化时更新，valueB 变化不触发更新 -->
  <div v-memo="[valueA]">
    <p>{{ valueA }}</p>
    <p>{{ valueB }}</p>
  </div>

  <!-- v-cloak：在 Vue 实例编译完成前隐藏元素 -->
  <div v-cloak>{{ message }}</div>
</template>
```

### 八、总结

`v-once` 是一个简单但实用的 Vue 内置指令，核心要点如下：

- **作用**：将元素及其子树标记为只渲染一次，后续跳过所有更新
- **原理**：首次渲染后缓存 VNode，后续渲染直接复用，跳过 diff 比对
- **事件**：不影响事件监听器的绑定和触发，只影响视图更新
- **场景**：适用于版权信息、静态标题、初始值快照、大型静态数据展示等确定不变的内容
- **注意**：作用于整个子树，不要对需要更新的内容使用
- **替代**：如需更灵活的条件性缓存，优先考虑 `v-memo`
- **性能**：Vue 3 编译器已对纯静态内容自动优化，`v-once` 更适合包含动态绑定但确定不更新的场景

> 💡 **提示：** `v-once` 是一个"谨慎使用"的指令。在大多数场景下，Vue 3 的编译器优化已经足够好。只在明确知道内容不会变化且需要极致性能优化时，才考虑使用 `v-once`。当需求是"条件性跳过更新"而非"永远不更新"时，应选择 `v-memo`。
