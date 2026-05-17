# watchEffect / watchPostEffect / watchSyncEffect

## 作用
这三个 API 都是用于自动追踪响应式依赖的副作用函数，区别在于回调执行的时机不同。

- **watchEffect**: 立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行
- **watchPostEffect**: `watchEffect` 的别名，使用 `flush: 'post'` 选项
- **watchSyncEffect**: `watchEffect` 的别名，使用 `flush: 'sync'` 选项

## watchEffect 用法

### 基本用法

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  console.log('count 的值是:', count.value)
})

// 立即输出: count 的值是: 0

count.value++ // 输出: count 的值是: 1
count.value++ // 输出: count 的值是: 2
```

### 自动追踪依赖

```javascript
const firstName = ref('Vue')
const lastName = ref('JS')

watchEffect(() => {
  console.log(`全名: ${firstName.value} ${lastName.value}`)
})

// 立即执行
firstName.value = 'React' // 触发重新执行
lastName.value = 'Native' // 触发重新执行
```

### 停止侦听器

```javascript
const stop = watchEffect(() => {
  console.log('执行中...')
})

// 调用返回的函数停止侦听
stop()
```

### 副作用清理

```javascript
const id = ref(1)

watchEffect((onCleanup) => {
  const controller = new AbortController()

  // 在重新执行或停止侦听时清理
  onCleanup(() => {
    controller.abort()
  })

  fetch(`/api/data/${id.value}`, {
    signal: controller.signal
  }).then(res => res.json())
    .then(data => console.log(data))
})
```

### DOM 更新后执行（post）

```javascript
import { watchPostEffect } from 'vue'

watchPostEffect(() => {
  // 在 DOM 更新后执行
  console.log('DOM 已更新，可以访问更新后的 DOM')
  console.log(elementRef.value.offsetHeight)
})
```

### 同步执行（sync）

```javascript
import { watchSyncEffect } from 'vue'

const count = ref(0)

watchSyncEffect(() => {
  // 在响应式数据变化时同步执行
  console.log('同步执行:', count.value)
})

count.value++ // 立即同步执行
```

### flush 选项详解

```javascript
import { watchEffect } from 'vue'

const count = ref(0)

// pre: 默认值，在组件更新前调用
watchEffect(() => {
  console.log('pre - 组件更新前')
}, { flush: 'pre' })

// sync: 响应式数据变化时立即同步调用
watchEffect(() => {
  console.log('sync - 同步执行')
}, { flush: 'sync' })

// post: 在组件更新后调用
watchEffect(() => {
  console.log('post - 组件更新后，可以访问 DOM')
}, { flush: 'post' })
```

### 在 <script setup> 中使用

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)
const doubled = ref(0)

watchEffect(() => {
  doubled.value = count.value * 2
})

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>count: {{ count }}</p>
    <p>doubled: {{ doubled }}</p>
    <button @click="increment">增加</button>
  </div>
</template>
```

### 调试 watchEffect

```javascript
const count = ref(0)

watchEffect(
  () => {
    console.log('count:', count.value)
  },
  {
    onTrack(e) {
      // 追踪到依赖时触发
      console.log('追踪依赖:', e.target, e.type)
    },
    onTrigger(e) {
      // 依赖变化触发重新执行时调用
      console.log('触发更新:', e)
    }
  }
)
```

## 注意事项

### 1. 立即执行

```javascript
const count = ref(0)

// watchEffect 会立即执行
watchEffect(() => {
  console.log(count.value) // 立即输出 0
})

// watch 需要指定依赖，默认不立即执行
watch(() => count.value, (val) => {
  console.log(val) // 只在变化时执行
})
```

### 2. 依赖收集问题

```javascript
const count = ref(0)

// ❌ 错误：条件语句中的依赖可能不会被正确收集
watchEffect(() => {
  if (false) {
    console.log(count.value) // 永远不会执行，依赖不收集
  }
})

// ✅ 正确
watchEffect(() => {
  if (someCondition.value) {
    console.log(count.value) // 条件为真时才会收集
  }
})
```

### 3. 异步操作的依赖收集

```javascript
const count = ref(0)

// ⚠️ 异步操作中，只收集同步执行时的依赖
watchEffect(async () => {
  console.log(count.value) // 收集依赖

  await someAsync()

  // count.value 变化不会重新触发
  console.log(count.value)
})

// ✅ 正确做法：确保所有访问都在同步阶段
watchEffect(() => {
  const val = count.value

  Promise.resolve().then(() => {
    console.log(val)
  })
})
```

### 4. 在 watchEffect 中修改数据

```javascript
const count = ref(0)

// ⚠️ 小心无限循环
watchEffect(() => {
  count.value++ // 可能导致无限循环

  // ✅ 使用条件避免
  if (count.value < 10) {
    count.value++
  }
})
```

### 5. 副作用清理的时机

```javascript
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  onCleanup(() => {
    // 在以下情况调用：
    // 1. 副作用重新执行前
    // 2. 侦听器停止时
    // 3. 组件卸载时
    clearInterval(timer)
  })
})
```

### 6. watchEffect vs watch 的选择

```javascript
const count = ref(0)
const doubled = computed(() => count.value * 2)

// watchEffect: 自动追踪依赖，不需要指定
watchEffect(() => {
  console.log('总和:', count.value + doubled.value)
})

// watch: 明确指定依赖，更可控
watch([count, doubled], ([count, doubled]) => {
  console.log('总和:', count + doubled)
})
```

### 7. DOM 访问的时机

```vue
<script setup>
import { ref, watchEffect, watchPostEffect } from 'vue'

const elementRef = ref(null)
const content = ref('Hello')

// ❌ 可能 DOM 还未更新
watchEffect(() => {
  console.log(elementRef.value?.offsetHeight) // 可能是 null
})

// ✅ DOM 更新后执行
watchPostEffect(() => {
  console.log(elementRef.value?.offsetHeight) // 正确的值
})
</script>

<template>
  <div ref="elementRef">{{ content }}</div>
</template>
```

### 8. 性能考虑

```javascript
const bigList = ref([])

// ⚠️ 每次任何依赖变化都会执行
watchEffect(() => {
  const processed = bigList.value.filter(/* ... */).map(/* ... */)
  // 昂贵的操作...
})

// ✅ 使用 watch 明确控制
watch(bigList, (newList) => {
  // 只在 bigList 变化时执行
  const processed = newList.filter(/* ... */).map(/* ... */)
})
```

## 使用场景

### 1. 自动同步到 localStorage

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const userSettings = ref({
  theme: 'light',
  fontSize: 14
})

// 自动保存到 localStorage
watchEffect(() => {
  localStorage.setItem('settings', JSON.stringify(userSettings.value))
})
</script>
```

### 2. 依赖追踪的日志记录

```javascript
const user = ref({ name: 'Vue' })
const isLoggedIn = ref(false)

watchEffect(() => {
  if (isLoggedIn.value) {
    console.log(`用户 ${user.value.name} 已登录`)
  } else {
    console.log('用户已登出')
  }
})
```

### 3. 自动调整滚动位置

```vue
<script setup>
import { ref, watchPostEffect } from 'vue'

const messages = ref([])
const containerRef = ref(null)

watchPostEffect(() => {
  // DOM 更新后滚动到底部
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
})

function addMessage(msg) {
  messages.value.push(msg)
}
</script>

<template>
  <div ref="containerRef" class="message-container">
    <div v-for="(msg, index) in messages" :key="index">
      {{ msg }}
    </div>
  </div>
</template>
```

### 4. 动态修改文档标题

```javascript
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
```

### 5. 自动聚焦输入框

```vue
<script setup>
import { ref, watchPostEffect } from 'vue'

const isOpen = ref(false)
const inputRef = ref(null)

watchPostEffect(() => {
  if (isOpen.value && inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <div v-if="isOpen">
    <input ref="inputRef" />
  </div>
</template>
```

### 6. Canvas 自动重绘

```vue
<script setup>
import { ref, onMounted, watchPostEffect } from 'vue'

const canvasRef = ref(null)
const data = ref([])

onMounted(() => {
  watchPostEffect(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 根据 data 绘制
    data.value.forEach((point, index) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  })
})
</script>

<template>
  <canvas ref="canvasRef" width="500" height="500"></canvas>
</template>
```

### 7. 响应式事件监听器

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const targetElement = ref(null)
const isActive = ref(true)

watchEffect((onCleanup) => {
  const element = targetElement.value
  if (!element || !isActive.value) return

  const handler = (e) => {
    console.log('事件触发:', e)
  }

  element.addEventListener('click', handler)

  onCleanup(() => {
    element.removeEventListener('click', handler)
  })
})
</script>

<template>
  <div ref="targetElement" v-if="isActive">
    点击我
  </div>
</template>
```

### 8. 动态样式计算

```vue
<script setup>
import { ref, watchPostEffect } from 'vue'

const theme = ref('dark')
const fontSize = ref(16)
const rootRef = ref(null)

watchPostEffect(() => {
  if (rootRef.value) {
    Object.assign(rootRef.value.style, {
      backgroundColor: theme.value === 'dark' ? '#333' : '#fff',
      color: theme.value === 'dark' ? '#fff' : '#333',
      fontSize: `${fontSize.value}px`
    })
  }
})
</script>

<template>
  <div ref="rootRef">
    <p>动态样式容器</p>
  </div>
</template>
```

### 9. WebSocket 自动重连

```javascript
import { ref, watchEffect } from 'vue'

const url = ref('ws://localhost:8080')
const reconnectAttempts = ref(0)
const maxAttempts = 5

watchEffect((onCleanup) => {
  const socket = new WebSocket(url.value)

  socket.onopen = () => {
    console.log('WebSocket 已连接')
    reconnectAttempts.value = 0
  }

  socket.onclose = () => {
    if (reconnectAttempts.value < maxAttempts) {
      reconnectAttempts.value++
      console.log(`尝试重连 ${reconnectAttempts.value}/${maxAttempts}`)
    }
  }

  onCleanup(() => {
    socket.close()
  })
})
```

### 10. 表单字段的自动验证

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const username = ref('')
const email = ref('')
const errors = ref({})

watchEffect(() => {
  const newErrors = {}

  if (username.value.length < 3) {
    newErrors.username = '用户名至少3个字符'
  }

  if (!email.value.includes('@')) {
    newErrors.email = '请输入有效的邮箱'
  }

  errors.value = newErrors
})
</script>

<template>
  <form>
    <input v-model="username" />
    <span class="error">{{ errors.username }}</span>

    <input v-model="email" />
    <span class="error">{{ errors.email }}</span>
  </form>
</template>
```

## watchEffect vs watch 对比

| 特性 | watchEffect | watch |
|-----|-------------|-------|
| 依赖收集 | 自动追踪 | 手动指定 |
| 立即执行 | 是 | 否（除非 immediate: true）|
| 访问旧值 | 否 | 是 |
| 懒执行 | 否 | 是 |
| 使用场景 | 副作用追踪 | 明确侦听某个值 |

## flush 时机对比

| flush 值 | 执行时机 | 别名 | 使用场景 |
|----------|----------|------|----------|
| 'pre' | 组件更新前 | - | 默认行为 |
| 'sync' | 响应式变化时同步执行 | watchSyncEffect | 需要同步计算的场景 |
| 'post' | 组件更新后 | watchPostEffect | 需要 DOM 操作的场景 |

## 最佳实践

1. **使用 watchEffect 追踪副作用**：不需要访问旧值时优先使用
2. **需要访问旧值时使用 watch**：watch 无法获取变化前的值
3. **DOM 操作使用 watchPostEffect**：确保 DOM 已更新
4. **及时清理副作用**：使用 onCleanup 清理定时器、事件监听等
5. **避免无限循环**：不要在 watchEffect 中无修改修改其依赖
