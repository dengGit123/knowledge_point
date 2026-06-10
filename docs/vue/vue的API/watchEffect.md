### 一、概述

> 📖 [官方文档 - watchEffect](https://cn.vuejs.org/api/reactivity-core#watcheffect)
>
> 📖 [官方文档 - watchPostEffect](https://cn.vuejs.org/api/reactivity-core#watchposteffect)
>
> 📖 [官方文档 - watchSyncEffect](https://cn.vuejs.org/api/reactivity-core#watchsynceffect)

`watchEffect` 是 Vue 3 组合式 API 中用于**自动追踪响应式依赖并执行副作用**的核心 API。它会立即运行一个回调函数，同时自动追踪其中用到的所有响应式数据，当这些数据发生变化时，回调函数会自动重新执行。

简单来说，`watchEffect` 解决了"**某些数据变了，我需要自动做点什么**"这个核心问题。你不需要手动声明侦听哪些数据 —— 只要在回调里用到了，Vue 就会自动帮你追踪。

Vue 还提供了两个变体：
- **watchPostEffect**：等 DOM 更新完成后再执行，适合需要操作 DOM 的场景
- **watchSyncEffect**：数据变化时同步立即执行，不经过队列调度

```ts
import { ref, watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

const count = ref(0)

// watchEffect：立即执行一次，之后依赖变化时重新执行
watchEffect(() => {
  console.log('count:', count.value)
})
// 立即输出: count: 0

count.value++ // 输出: count: 1
```

> 💡 **提示：** `watchEffect` 最大的优势是**自动依赖追踪** —— 你不需要像 `watch` 那样手动指定侦听的数据源，Vue 会根据回调函数中的代码自动判断。

---

### 二、核心原理

`watchEffect` 的底层机制基于 Vue 3 的响应式系统，核心流程如下：

1. **立即执行**：`watchEffect` 被调用时，回调函数会立即执行一次
2. **依赖收集**：执行过程中，Vue 通过 Proxy 的 `get` 拦截器，自动记录回调中访问的所有响应式数据（`ref`、`reactive`、`computed` 等）
3. **触发更新**：当被追踪的响应式数据发生变化时，Vue 的调度器会将回调重新执行加入任务队列
4. **副作用清理**：每次回调重新执行前，会先调用上一次注册的 `onCleanup` 清理函数，防止内存泄漏

```
watchEffect 调用
    │
    ▼
立即执行回调 ──→ 自动收集依赖（ref / reactive / computed）
    │
    ▼
依赖变化 ──→ 调度器判断执行时机（pre / post / sync）
    │
    ▼
执行 onCleanup（清理上一次的副作用）
    │
    ▼
重新执行回调 ──→ 重新收集依赖
```

> ⚠️ **注意：** 依赖收集只针对**同步代码阶段**访问的响应式数据。在 `await` 之后的代码中访问的响应式数据不会被追踪。

---

### 三、详细用法

#### 1. 基本用法

**定义与导入**

```ts
import { watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

// 函数签名
function watchEffect(
  effect: (onCleanup: (cleanupFn: () => void) => void) => void,
  options?: WatchEffectOptions
): () => void // 返回停止侦听器的函数

// watchPostEffect 和 watchSyncEffect 是简写形式
function watchPostEffect(effect: WatchEffect): () => void
function watchSyncEffect(effect: WatchEffect): () => void
```

**自动追踪依赖**

```ts
import { ref, reactive, computed, watchEffect } from 'vue'

const firstName = ref('张')
const lastName = ref('三')
const fullName = computed(() => `${firstName.value}${lastName.value}`)

// 自动追踪 firstName 和 lastName
watchEffect(() => {
  console.log(`姓名: ${firstName.value}${lastName.value}`)
})
// 立即输出: 姓名: 张三

firstName.value = '李'  // 输出: 姓名: 李三
lastName.value = '四'   // 输出: 李四
```

**停止侦听器**

```ts
import { ref, watchEffect } from 'vue'

const count = ref(0)

// watchEffect 返回一个停止函数
const stop = watchEffect(() => {
  console.log('count:', count.value)
})
// 输出: count: 0

count.value++ // 输出: count: 1

// 调用停止函数，不再追踪
stop()

count.value++ // 不再输出
```

> 💡 **提示：** 在 `<script setup>` 中定义的 `watchEffect` 会在组件卸载时自动停止，通常不需要手动调用 `stop()`。但如果是在异步回调或组合函数中创建的，建议手动停止。

**副作用清理（onCleanup）**

```ts
import { ref, watchEffect } from 'vue'

const userId = ref(1)

watchEffect((onCleanup) => {
  const controller = new AbortController()

  // 注册清理函数
  onCleanup(() => {
    controller.abort()
    console.log('清理上一次请求')
  })

  fetch(`/api/user/${userId.value}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      console.log('用户数据:', data)
    })
})
// 立即发起请求: /api/user/1

// 当 userId 变化时，先清理上一次请求（abort），再发起新请求
userId.value = 2
// 输出: 清理上一次请求
// 发起新请求: /api/user/2
```

#### 2. 进阶用法

**DOM 更新后执行（watchPostEffect）**

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const list = ref<string[]>([])
const containerRef = ref<HTMLDivElement | null>(null)

// ✅ 使用 watchPostEffect 确保 DOM 已更新
watchPostEffect(() => {
  // 访问 list.value 触发依赖追踪
  const count = list.value.length
  // 此时 DOM 已经更新完成，可以安全访问
  if (containerRef.value) {
    console.log('列表项数量:', count)
    console.log('容器高度:', containerRef.value.scrollHeight)
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
})

function addItem() {
  list.value.push(`项目 ${list.value.length + 1}`)
}
</script>

<template>
  <div ref="containerRef" class="list-container">
    <div v-for="item in list" :key="item">{{ item }}</div>
  </div>
  <button @click="addItem">添加项目</button>
</template>
```

**同步执行（watchSyncEffect）**

```ts
import { ref, watchSyncEffect } from 'vue'

const count = ref(0)
const log: string[] = []

watchSyncEffect(() => {
  log.push(`sync: ${count.value}`)
})

// 每次变化都同步立即执行，不经过队列调度
count.value = 1  // log: ['sync: 0', 'sync: 1']
count.value = 2  // log: ['sync: 0', 'sync: 1', 'sync: 2']
console.log(log) // ['sync: 0', 'sync: 1', 'sync: 2']
```

> ⚠️ **注意：** `watchSyncEffect` 会在每次响应式数据变化时同步执行。如果同一事件循环中多次修改数据，会触发多次执行，可能导致性能问题。谨慎使用。

**flush 选项详解**

```ts
import { ref, watchEffect } from 'vue'

const count = ref(0)

// flush: 'pre'（默认值）—— 组件更新前执行
watchEffect(() => {
  console.log('[pre] count:', count.value)
}, { flush: 'pre' })

// flush: 'post' —— 组件更新后执行，等同于 watchPostEffect
watchEffect(() => {
  console.log('[post] count:', count.value)
}, { flush: 'post' })

// flush: 'sync' —— 响应式数据变化时同步执行，等同于 watchSyncEffect
watchEffect(() => {
  console.log('[sync] count:', count.value)
}, { flush: 'sync' })
```

**调试 watchEffect（onTrack / onTrigger）**

```ts
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(
  () => {
    console.log('count:', count.value)
  },
  {
    // 依赖被追踪时触发
    onTrack(event) {
      console.log('追踪依赖:', {
        target: event.target,    // 被追踪的响应式对象
        type: event.type,        // 追踪类型（'get' / 'has' / 'iterate'）
        key: event.key           // 访问的属性名
      })
    },
    // 依赖变化触发回调重新执行时调用
    onTrigger(event) {
      console.log('触发更新:', {
        target: event.target,    // 发生变化的响应式对象
        type: event.type,        // 触发类型（'set' / 'add' / 'delete'）
        key: event.key,          // 变化的属性名
        newValue: event.newValue,// 新值
        oldValue: event.oldValue // 旧值
      })
    }
  }
)

count.value++
// onTrigger 输出: { target: count对象, type: 'set', key: 'value', newValue: 1, oldValue: 0 }
```

> 💡 **提示：** `onTrack` 和 `onTrigger` 仅在开发模式下生效，生产环境不会调用。它们非常适合调试响应式依赖链，帮助理解哪些数据被追踪、何时触发更新。

**在组合函数中使用 watchEffect**

```ts
// composables/useMousePosition.ts
import { ref, watchEffect, onScopeDispose } from 'vue'

export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 在组合函数中使用 watchEffect，并在作用域销毁时自动清理
  watchEffect((onCleanup) => {
    window.addEventListener('mousemove', update)
    onCleanup(() => {
      window.removeEventListener('mousemove', update)
    })
  })

  return { x, y }
}
```

#### 3. API 参数说明

**watchEffect 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `effect` | `(onCleanup: (fn: () => void) => void) => void` | 是 | 副作用回调函数，接收一个 `onCleanup` 注册清理函数 |
| `options.flush` | `'pre' \| 'post' \| 'sync'` | 否 | 回调执行时机，默认 `'pre'` |
| `options.onTrack` | `(event: DebuggerEvent) => void` | 否 | 依赖被追踪时的调试回调（仅开发模式） |
| `options.onTrigger` | `(event: DebuggerEvent) => void` | 否 | 依赖变化触发更新时的调试回调（仅开发模式） |

**返回值**

| 类型 | 说明 |
|------|------|
| `() => void` | 停止侦听器函数，调用后不再追踪依赖和执行回调 |

**flush 时机对比**

| flush 值 | 执行时机 | 对应别名 | 典型场景 |
|----------|----------|----------|----------|
| `'pre'`（默认） | 组件更新**前**执行 | - | 修改需要在渲染中使用的数据 |
| `'post'` | 组件更新**后**执行 | `watchPostEffect` | 访问更新后的 DOM 元素 |
| `'sync'` | 数据变化时**同步**执行 | `watchSyncEffect` | 需要同步读取最新值的特殊场景 |

---

### 四、实现效果

**基本执行效果**

```ts
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  console.log(`当前 count 值: ${count.value}`)
})
// 立即输出: 当前 count 值: 0

count.value = 5
// 输出: 当前 count 值: 5（在下一个微任务中执行）

count.value = 10
// 输出: 当前 count 值: 10（合并更新，只触发一次）
```

**副作用清理效果**

```ts
import { ref, watchEffect } from 'vue'

const keyword = ref('vue')

watchEffect((onCleanup) => {
  const timer = setTimeout(() => {
    console.log(`搜索: ${keyword.value}`)
  }, 300)

  onCleanup(() => {
    clearTimeout(timer)
    console.log(`清理上一次搜索: ${keyword.value}`)
  })
})
// 立即执行，注册 setTimeout

// 快速连续修改时，只有最后一次会实际发起搜索
keyword.value = 'vue3' // 清理上一次，重新注册
keyword.value = 'vue3 watchEffect' // 清理上一次，重新注册
// 300ms 后输出: 搜索: vue3 watchEffect
```

**watchPostEffect DOM 操作效果**

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const showText = ref(false)
const textRef = ref<HTMLSpanElement | null>(null)

watchPostEffect(() => {
  if (showText.value && textRef.value) {
    // 此时 DOM 已经更新，可以安全获取尺寸信息
    console.log('文本宽度:', textRef.value.offsetWidth)
    console.log('文本内容:', textRef.value.textContent)
  }
})
</script>

<template>
  <button @click="showText = !showText">切换显示</button>
  <span v-if="showText" ref="textRef">Hello Vue 3</span>
</template>
```

---

### 五、使用场景

#### 1. 自动同步数据到 localStorage

```vue
<script setup lang="ts">
import { reactive, watchEffect } from 'vue'

interface Settings {
  theme: 'light' | 'dark'
  fontSize: number
  language: string
}

const settings = reactive<Settings>({
  theme: 'light',
  fontSize: 14,
  language: 'zh-CN'
})

// 任意设置项变化，自动保存到 localStorage
watchEffect(() => {
  // 访问 reactive 对象的属性来触发依赖追踪
  localStorage.setItem('app-settings', JSON.stringify({
    theme: settings.theme,
    fontSize: settings.fontSize,
    language: settings.language
  }))
})

function toggleTheme() {
  settings.theme = settings.theme === 'light' ? 'dark' : 'light'
}
</script>
```

#### 2. 动态修改页面标题

```ts
import { ref, watchEffect } from 'vue'

const pageTitle = ref('首页')
const unreadCount = ref(0)

watchEffect(() => {
  if (unreadCount.value > 0) {
    document.title = `(${unreadCount.value}) ${pageTitle.value}`
  } else {
    document.title = pageTitle.value
  }
})

// 模拟收到消息
unreadCount.value = 3   // 标题变为: (3) 首页
pageTitle.value = '收件箱' // 标题变为: (3) 收件箱
unreadCount.value = 0   // 标题变为: 收件箱
```

#### 3. 聊天窗口自动滚动到底部

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

interface Message {
  id: number
  text: string
  time: Date
}

const messages = ref<Message[]>([])
const containerRef = ref<HTMLDivElement | null>(null)

// 使用 watchPostEffect 确保 DOM 更新后再滚动
watchPostEffect(() => {
  // 访问 messages.value 触发依赖追踪
  const count = messages.value.length
  if (containerRef.value && count > 0) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
})

function sendMessage(text: string) {
  messages.value.push({
    id: Date.now(),
    text,
    time: new Date()
  })
}
</script>

<template>
  <div ref="containerRef" class="chat-container">
    <div v-for="msg in messages" :key="msg.id" class="message">
      {{ msg.text }}
    </div>
  </div>
</template>
```

#### 4. 模态框自动聚焦

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const isModalOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// 模态框打开后自动聚焦输入框
watchPostEffect(() => {
  if (isModalOpen.value && inputRef.value) {
    inputRef.value.focus()
  }
})

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}
</script>

<template>
  <button @click="openModal">打开模态框</button>
  <div v-if="isModalOpen" class="modal">
    <input ref="inputRef" placeholder="请输入..." />
    <button @click="closeModal">关闭</button>
  </div>
</template>
```

#### 5. 响应式事件监听器的自动绑定与清理

```vue
<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'

const containerRef = ref<HTMLDivElement | null>(null)
const isTracking = ref(true)
const position = ref({ x: 0, y: 0 })

watchEffect((onCleanup) => {
  const el = containerRef.value
  if (!el || !isTracking.value) return

  const handleMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    position.value = {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    }
  }

  el.addEventListener('mousemove', handleMouseMove)

  // 自动清理：依赖变化或组件卸载时移除事件监听
  onCleanup(() => {
    el.removeEventListener('mousemove', handleMouseMove)
  })
})
</script>

<template>
  <div>
    <label>
      <input v-model="isTracking" type="checkbox" /> 启用追踪
    </label>
    <p>鼠标位置: {{ position.x }}, {{ position.y }}</p>
    <div ref="containerRef" class="tracking-area">移动鼠标</div>
  </div>
</template>
```

#### 6. 封装带自动取消的请求组合函数

```ts
// composables/useFetch.ts
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

interface UseFetchResult<T> {
  data: ref<T | null>
  error: ref<Error | null>
  isLoading: ref<boolean>
}

export function useFetch<T = unknown>(
  url: MaybeRefOrGetter<string>
): UseFetchResult<T> {
  const data = ref<T | null>(null) as ref<T | null>
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  watchEffect(async (onCleanup) => {
    const requestUrl = toValue(url)
    if (!requestUrl) return

    const controller = new AbortController()
    isLoading.value = true
    error.value = null

    // 注册清理函数，下一次 effect 执行或停止时自动取消请求
    onCleanup(() => {
      controller.abort()
    })

    try {
      const response = await fetch(requestUrl, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data.value = await response.json()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  })

  return { data, error, isLoading }
}
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from './composables/useFetch'

const userId = ref(1)
const { data, error, isLoading } = useFetch(() => `/api/user/${userId.value}`)

function nextUser() {
  userId.value++
}
</script>

<template>
  <div>
    <button @click="nextUser">下一个用户</button>
    <div v-if="isLoading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="data">{{ data }}</div>
  </div>
</template>
```

#### 7. 表单实时校验

```vue
<script setup lang="ts">
import { ref, reactive, watchEffect, computed } from 'vue'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const form = reactive<FormData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive<FormErrors>({})

// 任意字段变化时自动重新校验
watchEffect(() => {
  const newErrors: FormErrors = {}

  if (form.username.length > 0 && form.username.length < 3) {
    newErrors.username = '用户名至少 3 个字符'
  }

  if (form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = '请输入有效的邮箱地址'
  }

  if (form.password.length > 0 && form.password.length < 6) {
    newErrors.password = '密码至少 6 个字符'
  }

  if (form.confirmPassword.length > 0 && form.confirmPassword !== form.password) {
    newErrors.confirmPassword = '两次输入的密码不一致'
  }

  // 通过赋值触发更新
  Object.keys(newErrors).forEach(key => {
    errors[key as keyof FormErrors] = newErrors[key as keyof FormErrors]
  })
  Object.keys(errors).forEach(key => {
    if (!(key in newErrors)) {
      delete errors[key as keyof FormErrors]
    }
  })
})

const isValid = computed(() => Object.keys(errors).length === 0)
</script>

<template>
  <form @submit.prevent>
    <div>
      <input v-model="form.username" placeholder="用户名" />
      <span class="error" v-if="errors.username">{{ errors.username }}</span>
    </div>
    <div>
      <input v-model="form.email" placeholder="邮箱" />
      <span class="error" v-if="errors.email">{{ errors.email }}</span>
    </div>
    <div>
      <input v-model="form.password" type="password" placeholder="密码" />
      <span class="error" v-if="errors.password">{{ errors.password }}</span>
    </div>
    <div>
      <input v-model="form.confirmPassword" type="password" placeholder="确认密码" />
      <span class="error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
    </div>
    <button :disabled="!isValid" type="submit">提交</button>
  </form>
</template>
```

#### 8. Canvas 自动重绘

```vue
<script setup lang="ts">
import { ref, onMounted, watchPostEffect } from 'vue'

interface DataPoint {
  x: number
  y: number
  color: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const data = ref<DataPoint[]>([])
const scale = ref(1)

onMounted(() => {
  // 初始化数据
  data.value = Array.from({ length: 20 }, () => ({
    x: Math.random() * 500,
    y: Math.random() * 300,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  }))
})

// 数据或缩放变化时自动重绘
watchPostEffect(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 触发依赖追踪
  const points = data.value
  const s = scale.value

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  points.forEach(point => {
    ctx.beginPath()
    ctx.arc(point.x * s, point.y * s, 5 * s, 0, Math.PI * 2)
    ctx.fillStyle = point.color
    ctx.fill()
  })
})

function changeScale(delta: number) {
  scale.value = Math.max(0.5, Math.min(2, scale.value + delta))
}
</script>

<template>
  <div>
    <button @click="changeScale(0.1)">放大</button>
    <button @click="changeScale(-0.1)">缩小</button>
    <canvas ref="canvasRef" width="500" height="300"></canvas>
  </div>
</template>
```

#### 9. WebSocket 自动连接管理

```ts
import { ref, watchEffect } from 'vue'

export function useWebSocket(url: ref<string> | string) {
  const status = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const messages = ref<string[]>([])

  watchEffect((onCleanup) => {
    const ws = new WebSocket(toValue(url))

    status.value = 'connecting'

    ws.onopen = () => {
      status.value = 'connected'
      console.log('WebSocket 已连接')
    }

    ws.onmessage = (event) => {
      messages.value.push(event.data)
    }

    ws.onclose = () => {
      status.value = 'disconnected'
    }

    // 组件卸载或 url 变化时自动关闭连接
    onCleanup(() => {
      ws.close()
      status.value = 'disconnected'
    })
  })

  return { status, messages }
}
```

#### 10. 响应式主题样式

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

type Theme = 'light' | 'dark' | 'auto'

const theme = ref<Theme>('light')
const rootRef = ref<HTMLDivElement | null>(null)

const themeColors: Record<string, { bg: string; text: string; border: string }> = {
  light: { bg: '#ffffff', text: '#333333', border: '#e0e0e0' },
  dark: { bg: '#1a1a1a', text: '#ffffff', border: '#333333' },
  auto: { bg: '#f5f5f5', text: '#222222', border: '#d0d0d0' }
}

watchPostEffect(() => {
  const el = rootRef.value
  if (!el) return

  const colors = themeColors[theme.value]
  el.style.backgroundColor = colors.bg
  el.style.color = colors.text
  el.style.borderColor = colors.border
})
</script>

<template>
  <div>
    <select v-model="theme">
      <option value="light">浅色</option>
      <option value="dark">深色</option>
      <option value="auto">自动</option>
    </select>
    <div ref="rootRef" class="theme-container">
      <p>当前主题: {{ theme }}</p>
    </div>
  </div>
</template>
```

---

### 六、注意事项

#### 1. 立即执行特性

`watchEffect` 创建时会立即执行一次回调，这与 `watch` 默认的懒执行不同。

```ts
const count = ref(0)

// watchEffect 立即执行
watchEffect(() => {
  console.log(count.value) // 立即输出 0
})

// watch 默认不立即执行
watch(() => count.value, (val) => {
  console.log(val) // 只在变化时执行
})
```

#### 2. 异步代码中的依赖收集

`watchEffect` 只收集**同步阶段**访问的响应式依赖。`await` 之后的代码访问的响应式数据不会被追踪。

```ts
const a = ref(1)
const b = ref(2)

// ❌ b 的变化不会触发重新执行
watchEffect(async () => {
  console.log(a.value)   // ✅ 同步阶段，被追踪
  await someAsyncFunc()
  console.log(b.value)   // ❌ 异步阶段，不被追踪
})

// ✅ 正确做法：在同步阶段提前读取需要的值
watchEffect(async () => {
  const valA = a.value  // ✅ 同步阶段读取
  const valB = b.value  // ✅ 同步阶段读取
  await someAsyncFunc(valA, valB)
})
```

#### 3. 条件分支中的动态依赖

`watchEffect` 的依赖是**动态的**，每次执行时只收集当前代码路径上访问的响应式数据。

```ts
const showDetails = ref(false)
const name = ref('Vue')
const details = ref('details')

watchEffect(() => {
  console.log(name.value) // 总是被追踪
  if (showDetails.value) {
    console.log(details.value) // 仅 showDetails 为 true 时被追踪
  }
})

// showDetails 为 false 时，修改 details 不会触发回调
// showDetails 变为 true 后，details 变化才会触发回调
```

#### 4. 避免在回调中修改被追踪的依赖

在 `watchEffect` 回调中修改它所依赖的响应式数据，可能导致无限循环。

```ts
const count = ref(0)

// ❌ 无限循环
watchEffect(() => {
  count.value++  // 修改依赖，触发重新执行，又修改，又触发...
})

// ✅ 使用条件限制
watchEffect(() => {
  if (count.value < 10) {
    count.value++
  }
})

// ✅ 更好的做法：使用 watch 并明确控制
watch(count, (newVal) => {
  if (newVal < 10) {
    count.value++
  }
})
```

#### 5. DOM 访问必须使用 watchPostEffect

在 `watchEffect`（flush: 'pre'）中访问 DOM 可能得到更新前的结果。

```vue
<script setup lang="ts">
import { ref, watchEffect, watchPostEffect } from 'vue'

const list = ref<string[]>([])
const listRef = ref<HTMLUListElement | null>(null)

// ❌ DOM 可能还未更新
watchEffect(() => {
  console.log(listRef.value?.children.length) // 可能是旧值
})

// ✅ DOM 已更新，可以安全访问
watchPostEffect(() => {
  console.log(listRef.value?.children.length) // 正确的值
})

function addItem() {
  list.value.push(`item-${list.value.length}`)
}
</script>

<template>
  <ul ref="listRef">
    <li v-for="item in list" :key="item">{{ item }}</li>
  </ul>
  <button @click="addItem">添加</button>
</template>
```

#### 6. 组件卸载时自动停止

在 `<script setup>` 中使用的 `watchEffect` 会在组件卸载时自动停止。但在以下场景需要手动处理：

```ts
// ❌ 异步回调中创建的 watchEffect 不会自动绑定组件生命周期
setTimeout(() => {
  watchEffect(() => {
    console.log(someRef.value) // 组件卸载后仍在执行
  })
}, 1000)

// ✅ 手动停止或使用组件作用域
import { onUnmounted } from 'vue'

let stop: (() => void) | null = null

setTimeout(() => {
  stop = watchEffect(() => {
    console.log(someRef.value)
  })
}, 1000)

onUnmounted(() => {
  stop?.()
})
```

#### 7. 副作用清理的重要性

始终使用 `onCleanup` 清理副作用（定时器、事件监听、网络请求等），防止内存泄漏。

```ts
// ❌ 没有清理定时器
watchEffect(() => {
  setInterval(() => {
    console.log(someRef.value)
  }, 1000)
})

// ✅ 正确清理
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(someRef.value)
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })
})
```

#### 8. 多个依赖同时变化的合并执行

在同一同步代码块中修改多个依赖，`watchEffect` 只会执行一次（flush: 'pre' / 'post'），而不是每个依赖变化都执行一次。

```ts
const firstName = ref('张')
const lastName = ref('三')

watchEffect(() => {
  console.log(`全名: ${firstName.value}${lastName.value}`)
})
// 输出: 全名: 张三

// 同时修改多个依赖
firstName.value = '李'
lastName.value = '四'
// 只输出一次: 全名: 李四（而不是先输出 李三 再输出 李四）
```

#### 9. watchSyncEffect 的性能风险

`watchSyncEffect` 不会进行队列合并，每次依赖变化都会同步执行回调。

```ts
const a = ref(1)
const b = ref(2)

// 如果在同一个同步流程中修改多次，会触发多次执行
watchSyncEffect(() => {
  console.log(`${a.value} + ${b.value} = ${a.value + b.value}`)
})

a.value = 10 // 同步执行一次: 10 + 2 = 12
a.value = 20 // 同步执行一次: 20 + 2 = 22
b.value = 30 // 同步执行一次: 20 + 30 = 50
// 共执行 4 次（初始 1 次 + 3 次变化）

// ✅ 通常使用 watchEffect 或 watch 即可，watchSyncEffect 仅在特殊场景使用
```

#### 10. 与 watch 的选择策略

根据场景选择合适的 API：

```ts
// ✅ 使用 watchEffect 的场景：
// - 不需要访问旧值
// - 需要自动追踪多个依赖
// - 执行副作用（网络请求、事件绑定等）

watchEffect(() => {
  document.title = `${pageTitle.value} - ${appName.value}`
})

// ✅ 使用 watch 的场景：
// - 需要访问旧值和新值
// - 需要明确控制侦听的数据源
// - 需要懒执行（不立即执行）

watch(userId, (newId, oldId) => {
  console.log(`用户从 ${oldId} 变为 ${newId}`)
  fetchUserProfile(newId)
})
```

---

### 七、相关 API 对比

#### watchEffect vs watch

| 特性 | watchEffect | watch |
|------|-------------|-------|
| 依赖收集 | **自动追踪**，无需手动指定 | **手动指定**数据源 |
| 首次执行 | **立即执行** | **懒执行**（除非 `immediate: true`） |
| 访问旧值 | **不支持** | **支持**，回调参数 `(newVal, oldVal)` |
| 访问新值 | 通过直接读取响应式数据获取 | 回调参数提供 |
| 精确控制 | 依赖由代码路径决定 | 依赖由手动指定的数据源决定 |
| 适用场景 | 副作用追踪、自动同步 | 精确侦听特定数据变化 |

```ts
const count = ref(0)

// watchEffect：自动追踪，立即执行，无法获取旧值
watchEffect(() => {
  console.log('effect:', count.value)
})

// watch：手动指定，懒执行，可获取新旧值
watch(count, (newVal, oldVal) => {
  console.log(`watch: ${oldVal} → ${newVal}`)
})

// watch + immediate：手动指定，立即执行，可获取新旧值
watch(count, (newVal, oldVal) => {
  console.log(`watch immediate: ${oldVal} → ${newVal}`)
}, { immediate: true })
```

#### watchEffect vs watchPostEffect vs watchSyncEffect

| 特性 | watchEffect | watchPostEffect | watchSyncEffect |
|------|-------------|-----------------|-----------------|
| flush 值 | `'pre'` | `'post'` | `'sync'` |
| 执行时机 | 组件更新**前** | 组件更新**后** | 数据变化时**同步** |
| DOM 状态 | 未更新 | 已更新 | 未更新 |
| 队列合并 | 是 | 是 | **否**（每次变化都执行） |
| 典型场景 | 通用副作用 | DOM 操作 | 同步读取最新值 |

---

### 八、总结

`watchEffect` 是 Vue 3 响应式系统中用于处理副作用的核心工具，它的核心价值在于**自动依赖追踪** —— 开发者无需手动声明要侦听哪些数据，Vue 会根据回调中的代码自动判断。

**关键要点回顾：**

- `watchEffect` 创建时立即执行，自动追踪同步阶段访问的所有响应式依赖
- 使用 `onCleanup` 注册清理函数，确保副作用（定时器、事件监听、网络请求等）被正确清理
- 需要操作 DOM 时使用 `watchPostEffect`，它会在 DOM 更新完成后执行
- `watchSyncEffect` 提供同步执行能力，但要注意性能影响
- 与 `watch` 互补使用：需要旧值或精确控制时用 `watch`，需要自动追踪时用 `watchEffect`
- 避免在回调中修改自身依赖的响应式数据，防止无限循环
- 异步代码中，`await` 之后的响应式数据访问不会被自动追踪
