# onDeactivated

> 📖 [Vue 官方文档 - onDeactivated](https://cn.vuejs.org/api/composition-api-lifecycle#ondeactivated)

### 一、概述

`onDeactivated()` 是 Vue 3 提供的组合式 API 生命周期钩子，专门用于被 `<KeepAlive>` 缓存的组件。当一个被 `<KeepAlive>` 包裹的组件从 DOM 中被移除（即切换离开当前组件）时，`onDeactivated` 钩子会被触发。与 `onUnmounted` 不同，被 `<KeepAlive>` 缓存的组件并不会真正销毁，而是被"冻结"在后台，因此需要一个专门的钩子来处理组件被隐藏时的清理逻辑。

简单来说，`onDeactivated` 就是告诉组件："你虽然还在缓存中活着，但用户已经看不到了，是时候做一些暂停或保存的工作了。"

### 二、核心原理

#### 工作机制

`<KeepAlive>` 是 Vue 3 内置的抽象组件，它会在组件切换时将离开的组件实例缓存起来，而不是销毁它们。被缓存的组件会经历以下生命周期流程：

```
首次进入: setup → onMounted → onActivated
切换离开: onDeactivated（组件被缓存，不触发 onUnmounted）
再次进入: onActivated（组件被恢复，不触发 onMounted）
真正销毁: onDeactivated → onUnmounted（当 <KeepAlive> 自身被卸载时）
```

#### 底层类比

可以把 `<KeepAlive>` 想象成电视机的"待机模式"：

- **关掉电视（onDeactivated）**：屏幕不亮了，但电视内部的电路还在运行。你此时应该暂停视频播放、降低音量，节省资源。
- **打开电视（onActivated）**：瞬间恢复到你之前观看的画面和状态。
- **拔掉电源（onUnmounted）**：电视彻底关机，所有状态消失。

`onDeactivated` 就是在"待机"那一刻触发的钩子，让你有机会做"省电"操作。

### 三、详细用法

#### 1. 基本用法

```vue
<template>
  <KeepAlive>
    <Component :is="currentComponent" />
  </KeepAlive>
</template>

<script setup lang="ts">
import { ref, onDeactivated } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

const currentComponent = ref('TabA')
</script>
```

被缓存的子组件（如 `TabA.vue`）中使用：

```vue
<!-- TabA.vue -->
<script setup lang="ts">
import { onDeactivated } from 'vue'

// 组件被切换离开时触发
onDeactivated(() => {
  console.log('TabA 被停用，进入缓存状态')
})
</script>
```

#### 2. 进阶用法

##### 搭配 `onActivated` 配对使用

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const count = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 组件被激活时启动定时器
onActivated(() => {
  console.log('组件已激活，开始计时')
  timer = setInterval(() => {
    count.value++
  }, 1000)
})

// 组件被停用时清除定时器
onDeactivated(() => {
  console.log('组件已停用，暂停计时，当前 count:', count.value)
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
```

##### 在 `<script setup>` 中使用异步回调

```vue
<script setup lang="ts">
import { onDeactivated } from 'vue'

onDeactivated(async () => {
  // 停用时异步保存数据
  const response = await fetch('/api/save-draft', {
    method: 'POST',
    body: JSON.stringify({ content: 'draft content' })
  })
  console.log('草稿保存结果:', response.status)
})
</script>
```

##### 注册多个 `onDeactivated` 钩子

```vue
<script setup lang="ts">
import { onDeactivated } from 'vue'

// 可以注册多个钩子，按注册顺序依次执行
onDeactivated(() => {
  console.log('第一个清理任务：清除定时器')
})

onDeactivated(() => {
  console.log('第二个清理任务：保存表单数据')
})

onDeactivated(() => {
  console.log('第三个清理任务：暂停动画')
})
</script>
```

##### 在通用组合式函数（Composable）中封装

```ts
// useAutoSave.ts
import { onDeactivated, type Ref } from 'vue'

export function useAutoSave(data: Ref<string>, url: string) {
  onDeactivated(async () => {
    if (data.value) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.value })
        })
        console.log('自动保存成功')
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }
  })
}
```

```vue
<!-- EditPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAutoSave } from '@/composables/useAutoSave'

const content = ref('')

// 组件被停用时自动保存内容
useAutoSave(content, '/api/save')
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `callback` | `() => void` \| `() => Promise<void>` | 组件被停用时执行的回调函数，支持异步函数 |

| **返回值** | **类型** | **说明** |
|------------|----------|----------|
| 返回值 | `() => void` | 返回一个函数，调用它可以停止该钩子的监听（卸载回调） |

```ts
// 停止监听示例
import { onDeactivated } from 'vue'

const stop = onDeactivated(() => {
  console.log('这个钩子可能被取消')
})

// 在某些条件下取消注册
if (someCondition) {
  stop() // 之后组件停用时不会再触发这个回调
}
```

### 四、实现效果

以下是一个完整的 Tab 切换示例，演示 `onDeactivated` 的触发时机和效果：

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <button @click="current = 'Dashboard'">仪表盘</button>
    <button @click="current = 'Settings'">设置</button>
    <KeepAlive>
      <component :is="currentComponent" :key="current" />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component as VueComponent } from 'vue'
import Dashboard from './Dashboard.vue'
import Settings from './Settings.vue'

const current = ref('Dashboard')

const componentMap: Record<string, VueComponent> = {
  Dashboard,
  Settings
}

const currentComponent = computed(() => componentMap[current.value])
</script>
```

```vue
<!-- Dashboard.vue -->
<template>
  <div>
    <h2>仪表盘</h2>
    <p>实时数据: {{ realtimeData }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const realtimeData = ref(0)
let ws: ReturnType<typeof setInterval> | null = null

onActivated(() => {
  console.log('[Dashboard] 组件激活 - 恢复实时数据推送')
  ws = setInterval(() => {
    realtimeData.value = Math.floor(Math.random() * 100)
  }, 1000)
})

onDeactivated(() => {
  console.log('[Dashboard] 组件停用 - 暂停实时数据推送，节省资源')
  if (ws) {
    clearInterval(ws)
    ws = null
  }
})
</script>
```

```
运行效果（控制台输出）：
1. 首次加载 Dashboard → [Dashboard] 组件激活 - 恢复实时数据推送
2. 切换到 Settings    → [Dashboard] 组件停用 - 暂停实时数据推送，节省资源
                       → [Settings] 组件激活 - ...
3. 切换回 Dashboard   → [Dashboard] 组件激活 - 恢复实时数据推送
                       （realtimeData 从上次停用时的值继续，不会重置）
```

### 五、使用场景

#### 1. 暂停定时器与轮询

组件被缓存时停止定时器，避免后台空跑浪费性能。

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const notifications = ref<string[]>([])
let pollTimer: ReturnType<typeof setInterval> | null = null

onActivated(() => {
  fetchNotifications()
  pollTimer = setInterval(fetchNotifications, 5000)
})

onDeactivated(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

async function fetchNotifications() {
  const res = await fetch('/api/notifications')
  notifications.value = await res.json()
}
</script>
```

#### 2. 保存表单草稿

用户填写表单时切换了 Tab，自动保存当前填写内容。

```vue
<script setup lang="ts">
import { ref, onDeactivated } from 'vue'

const form = ref({
  title: '',
  content: '',
  tags: [] as string[]
})

onDeactivated(async () => {
  if (form.value.title || form.value.content) {
    await fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    console.log('草稿已自动保存')
  }
})
</script>
```

#### 3. 保存与恢复滚动位置

长列表页面切换后，恢复到用户之前的滚动位置。

```vue
<template>
  <div ref="scrollContainer" class="scroll-container">
    <div v-for="item in list" :key="item.id" class="item">
      {{ item.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const scrollContainer = ref<HTMLElement | null>(null)
const savedScrollTop = ref(0)

const list = ref(Array.from({ length: 200 }, (_, i) => ({
  id: i,
  name: `项目 ${i + 1}`
})))

onDeactivated(() => {
  if (scrollContainer.value) {
    savedScrollTop.value = scrollContainer.value.scrollTop
    console.log('已保存滚动位置:', savedScrollTop.value)
  }
})

onActivated(() => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = savedScrollTop.value
    console.log('已恢复滚动位置:', savedScrollTop.value)
  }
})
</script>

<style scoped>
.scroll-container {
  height: 500px;
  overflow-y: auto;
}
</style>
```

#### 4. 暂停音视频播放

用户切换 Tab 时暂停视频，返回时恢复。

```vue
<template>
  <video ref="videoEl" src="/video/tutorial.mp4" controls />
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const videoEl = ref<HTMLVideoElement | null>(null)
const savedTime = ref(0)

onDeactivated(() => {
  if (videoEl.value) {
    savedTime.value = videoEl.value.currentTime
    videoEl.value.pause()
    console.log('视频已暂停，保存播放进度:', savedTime.value)
  }
})

onActivated(() => {
  if (videoEl.value) {
    videoEl.value.currentTime = savedTime.value
    videoEl.value.play()
    console.log('视频已恢复播放')
  }
})
</script>
```

#### 5. 断开 WebSocket 连接

组件不可见时断开 WebSocket，避免不必要的心跳和流量消耗。

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const messages = ref<string[]>([])
let ws: WebSocket | null = null

onActivated(() => {
  ws = new WebSocket('wss://example.com/chat')
  ws.onmessage = (event) => {
    messages.value.push(event.data)
  }
  ws.onopen = () => {
    console.log('WebSocket 已连接')
  }
})

onDeactivated(() => {
  if (ws) {
    ws.close()
    ws = null
    console.log('WebSocket 已断开')
  }
})
</script>
```

#### 6. 暂停 CSS 动画

组件被缓存时暂停复杂动画，减少 GPU 占用。

```vue
<template>
  <div ref="animatedBox" class="animated-box">动画内容</div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const animatedBox = ref<HTMLElement | null>(null)

onDeactivated(() => {
  if (animatedBox.value) {
    animatedBox.value.style.animationPlayState = 'paused'
    console.log('动画已暂停')
  }
})

onActivated(() => {
  if (animatedBox.value) {
    animatedBox.value.style.animationPlayState = 'running'
    console.log('动画已恢复')
  }
})
</script>

<style scoped>
.animated-box {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

#### 7. 页面可见性统计

记录用户在各 Tab 页面的停留时长。

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const pageName = 'Analytics'
let enterTime = 0
const totalDuration = ref(0)

onActivated(() => {
  enterTime = Date.now()
  console.log(`[${pageName}] 用户进入页面`)
})

onDeactivated(() => {
  if (enterTime) {
    const duration = Date.now() - enterTime
    totalDuration.value += duration
    console.log(`[${pageName}] 用户离开，本次停留 ${Math.round(duration / 1000)} 秒`)

    // 上报停留时长
    fetch('/api/analytics/duration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageName, duration })
    })
  }
})
</script>
```

#### 8. 清除全局事件监听

组件被缓存时移除 window 上的事件监听，避免内存泄漏和不必要的回调。

```vue
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const mouseX = ref(0)
const mouseY = ref(0)

function handleMouseMove(event: MouseEvent) {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

onActivated(() => {
  window.addEventListener('mousemove', handleMouseMove)
  console.log('已注册鼠标移动监听')
})

onDeactivated(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  console.log('已移除鼠标移动监听')
})
</script>
```

#### 9. 保存编辑器状态

富文本编辑器或代码编辑器在切换时保存光标位置和 undo 历史。

```vue
<template>
  <textarea ref="editorRef" v-model="content" class="editor" />
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

const editorRef = ref<HTMLTextAreaElement | null>(null)
const content = ref('')
const savedSelectionStart = ref(0)
const savedSelectionEnd = ref(0)

onDeactivated(() => {
  if (editorRef.value) {
    savedSelectionStart.value = editorRef.value.selectionStart
    savedSelectionEnd.value = editorRef.value.selectionEnd
    console.log('已保存编辑器光标位置:', savedSelectionStart.value)
  }
})

onActivated(() => {
  if (editorRef.value) {
    editorRef.value.focus()
    editorRef.value.setSelectionRange(
      savedSelectionStart.value,
      savedSelectionEnd.value
    )
    console.log('已恢复编辑器光标位置')
  }
})
</script>

<style scoped>
.editor {
  width: 100%;
  min-height: 300px;
}
</style>
```

#### 10. 暂停第三方 SDK 调用

地图、图表等第三方组件在不可见时暂停更新。

```vue
<template>
  <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import * as echarts from 'echarts'

const chartContainer = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
    chart.setOption({
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      yAxis: { type: 'value' },
      series: [{ data: [150, 230, 224, 218, 135], type: 'line' }]
    })
  }
})

onDeactivated(() => {
  // 停止图表的 resize 监听，避免不必要的重绘
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  console.log('图表已暂停更新')
})

onActivated(() => {
  // 恢复 resize 监听
  if (chartContainer.value && chart) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(chartContainer.value)
    chart.resize()
  }
  console.log('图表已恢复更新')
})
</script>
```

### 六、注意事项

1. **仅在 `<KeepAlive>` 内生效**
   `onDeactivated` 只在被 `<KeepAlive>` 组件包裹的组件中才会触发。如果组件没有被 `<KeepAlive>` 缓存，`onDeactivated` 永远不会被调用。

   ```vue
   <!-- ❌ 没有 KeepAlive，onDeactivated 不会触发 -->
   <Component :is="currentTab" />

   <!-- ✅ 正确：使用 KeepAlive 包裹 -->
   <KeepAlive>
     <Component :is="currentTab" />
   </KeepAlive>
   ```

2. **`onDeactivated` 与 `onUnmounted` 的区别**
   `onUnmounted` 在组件真正销毁时触发，`onDeactivated` 在组件被缓存（隐藏）时触发。被 `<KeepAlive>` 缓存的组件切换离开时**只触发 `onDeactivated`，不触发 `onUnmounted`**。只有当 `<KeepAlive>` 本身被卸载时，缓存组件才会触发 `onUnmounted`。

3. **必须在 `setup()` 同步阶段调用**
   `onDeactivated` 必须在 `setup()` 函数或 `<script setup>` 的同步执行阶段调用。不能在异步回调、`setTimeout` 或 `Promise.then` 中注册。

   ```ts
   // ❌ 错误：在异步回调中注册
   setTimeout(() => {
     onDeactivated(() => { /* ... */ })
   }, 1000)

   // ✅ 正确：在 setup 同步阶段注册
   onDeactivated(() => {
     console.log('组件停用')
   })
   ```

4. **可以注册多个钩子**
   `onDeactivated` 可以被多次调用以注册多个回调，它们会按照注册顺序依次执行。这在将逻辑拆分到不同的组合式函数（Composable）中时非常有用。

5. **务必清理副作用**
   如果在 `onActivated` 中启动了定时器、事件监听、WebSocket 连接等，**必须**在 `onDeactivated` 中进行对应的清理，否则会导致内存泄漏和性能问题。

   ```ts
   // ❌ 错误：没有清理定时器
   onActivated(() => {
     setInterval(() => { /* ... */ }, 1000)
   })

   // ✅ 正确：配对清理
   let timer: ReturnType<typeof setInterval> | null = null
   onActivated(() => {
     timer = setInterval(() => { /* ... */ }, 1000)
   })
   onDeactivated(() => {
     if (timer) { clearInterval(timer); timer = null }
   })
   ```

6. **异步回调中的错误需要自行捕获**
   如果 `onDeactivated` 的回调是异步函数，其中的 Promise 错误不会被 Vue 自动捕获，需要自行 `try/catch`。

   ```ts
   // ❌ 错误未捕获
   onDeactivated(async () => {
     await fetchData() // 如果失败，错误会变成 unhandled rejection
   })

   // ✅ 正确：自行捕获错误
   onDeactivated(async () => {
     try {
       await fetchData()
     } catch (error) {
       console.error('停用回调执行失败:', error)
     }
   })
   ```

7. **注意 `include` / `exclude` / `max` 的影响**
   `<KeepAlive>` 的 `include`、`exclude` 属性决定了哪些组件会被缓存，`max` 属性限制了最大缓存数量。当缓存组件因 `max` 限制被驱逐时，会触发 `onDeactivated` **然后**触发 `onUnmounted`。

   ```vue
   <!-- 最多缓存 5 个组件，超出时 LRU 淘汰 -->
   <KeepAlive :max="5">
     <Component :is="current" />
   </KeepAlive>
   ```

8. **与 Vue Router 的 `<KeepAlive>` 配合**
   在 Vue Router 中使用 `<KeepAlive>` 时，需要使用 `<router-view>` 的 `v-slot` 写法：

   ```vue
   <!-- ✅ 正确写法 -->
   <router-view v-slot="{ Component }">
     <KeepAlive>
       <component :is="Component" />
     </KeepAlive>
   </router-view>
   ```

9. **服务端渲染（SSR）中不会触发**
   `onDeactivated` 钩子在服务端渲染期间不会被调用，因为 SSR 环境中不存在组件的"激活/停用"概念。只在客户端的水降（hydration）完成后的切换操作中才会触发。

10. **不要依赖 DOM 操作的时机**
    `onDeactivated` 触发时，组件的 DOM 可能已被移除或正在被移除。如果需要在 DOM 移除之前进行操作，建议在回调中进行判断，避免操作已不存在的 DOM 元素。

    ```ts
    onDeactivated(() => {
      // ✅ 先判断元素是否存在
      if (scrollContainer.value) {
        savedScrollTop.value = scrollContainer.value.scrollTop
      }
    })
    ```

### 七、相关 API 对比

| 特性 | `onDeactivated` | `onUnmounted` | `onActivated` |
|------|-----------------|---------------|---------------|
| **触发时机** | 组件被 `<KeepAlive>` 隐藏时 | 组件被真正销毁时 | 组件被 `<KeepAlive>` 恢复显示时 |
| **是否需要 `<KeepAlive>`** | 是 | 否 | 是 |
| **组件实例是否保留** | 是 | 否（实例被销毁） | 是 |
| **响应式状态是否保留** | 是 | 否 | 是 |
| **适用场景** | 暂停轮询、保存状态 | 彻底清理资源 | 恢复轮询、还原状态 |
| **配对关系** | 与 `onActivated` 配对 | 与 `onMounted` 配对 | 与 `onDeactivated` 配对 |

> 💡 **提示：** 一个被 `<KeepAlive>` 缓存的组件，其完整生命周期为：`setup` → `onMounted` → `onActivated`（首次渲染）→ `onDeactivated`（切换离开）→ `onActivated`（再次切换回来）→ ... → `onDeactivated` → `onUnmounted`（最终销毁）。

### 八、总结

`onDeactivated` 是 Vue 3 中专门为 `<KeepAlive>` 缓存组件设计的生命周期钩子，它在组件被隐藏/切换离开时触发。它的核心价值在于：

- **资源管理**：在组件不可见时暂停定时器、网络请求、WebSocket 连接等，避免浪费性能和带宽。
- **状态保存**：保存滚动位置、表单数据、播放进度等用户状态，配合 `onActivated` 恢复使用。
- **副作用清理**：移除全局事件监听、暂停动画等，防止内存泄漏。

> ⚠️ **注意：** `onDeactivated` 必须与 `onActivated` 配对使用，确保在 `onActivated` 中启动的副作用都能在 `onDeactivated` 中被正确清理。这是使用 `<KeepAlive>` 缓存组件时最重要的最佳实践。
