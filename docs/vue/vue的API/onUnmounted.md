# onUnmounted

## 作用
`onUnmounted()` 是 Vue 3 的生命周期钩子，在组件实例被卸载之后调用。这是执行清理工作的理想位置，例如移除事件监听器、取消定时器等。

## 用法

### 基本用法

```vue
<script setup>
import { onUnmounted } from 'vue'

onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```

### 清理定时器

```vue
<script setup>
import { ref, onUnmounted } from 'vue'

const count = ref(0)
let timer = null

const startTimer = () => {
  timer = setInterval(() => {
    count.value++
  }, 1000)
}

// 组件挂载时启动
startTimer()

// 组件卸载时清理
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div>{{ count }}</div>
</template>
```

### 移除事件监听器

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

const handleResize = () => {
  console.log('Window resized:', window.innerWidth)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

### 清理 WebSocket 连接

```vue
<script setup>
import { onUnmounted } from 'vue'

const socket = new WebSocket('ws://localhost:8080')

socket.onopen = () => {
  console.log('WebSocket 已连接')
}

socket.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

onUnmounted(() => {
  socket.close()
  console.log('WebSocket 已关闭')
})
</script>
```

### 取消网络请求

```vue
<script setup>
import { onUnmounted, ref } from 'vue'

const abortController = new AbortController()
const data = ref(null)

async function fetchData() {
  try {
    const response = await fetch('/api/data', {
      signal: abortController.signal
    })
    data.value = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求已取消')
    }
  }
}

fetchData()

onUnmounted(() => {
  abortController.abort()
})
</script>
```

### 在选项式 API 中使用

```javascript
export default {
  data() {
    return {
      timer: null,
      count: 0
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.count++
    }, 1000)
  },
  unmounted() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
```

### 与 watchCleanupEffect 配合

```vue
<script setup>
import { watchEffect, onUnmounted } from 'vue'

const stop = watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })
})

// 组件卸载时自动停止 watchEffect
onUnmounted(() => {
  stop()
})
</script>
```

### 清理第三方库实例

```vue
<script setup>
import { onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

const canvasRef = ref(null)
let chartInstance = null

onMounted(() => {
  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: { /* ... */ }
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

### 清理订阅

```vue
<script setup>
import { onUnmounted } from 'vue'
import { eventBus } from './eventBus'

const handleEvent = (data) => {
  console.log('Event received:', data)
}

eventBus.on('custom-event', handleEvent)

onUnmounted(() => {
  eventBus.off('custom-event', handleEvent)
})
</script>
```

### 与 provide/inject 清理

```vue
<!-- 父组件 -->
<script setup>
import { provide, onUnmounted } from 'vue'

const cleanupCallbacks = []

provide('registerCleanup', (callback) => {
  cleanupCallbacks.push(callback)
})

onUnmounted(() => {
  cleanupCallbacks.forEach(cb => cb())
})
</script>

<!-- 子组件 -->
<script setup>
import { inject, onUnmounted } from 'vue'

const registerCleanup = inject('registerCleanup')

onMounted(() => {
  const cleanup = () => {
    // 清理逻辑
  }

  registerCleanup(cleanup)
})
</script>
```

## 注意事项

### 1. 执行时机

```javascript
// 组件卸载流程：
// 1. onBeforeUnmount 执行
// 2. 组件实例卸载
// 3. onUnmounted 执行
// 4. DOM 元素移除

onUnmounted(() => {
  // 此时组件已从 DOM 中移除
  // 不要访问组件的 DOM
})
```

### 2. 访问组件状态

```vue
<script setup>
import { ref, onUnmounted } from 'vue'

const count = ref(0)

onUnmounted(() => {
  // ⚠️ 可以访问响应式状态
  console.log(count.value) // 可以访问

  // ❌ 但状态更新不会触发任何响应
  count.value++ // 不会有效果
})
</script>
```

### 3. 与 watch 的自动清理

```vue
<script setup>
import { watch, onUnmounted } from 'vue'

const source = ref(0)

// watch 会在组件卸载时自动停止
watch(source, (value) => {
  console.log('Source changed:', value)
})

// 不需要手动停止 watch
onUnmounted(() => {
  // watch 已经自动停止
})
</script>
```

### 4. 清理函数的执行顺序

```vue
<script setup>
import { onUnmounted } from 'vue'

// 多个 onUnmounted 按注册顺序执行
onUnmounted(() => {
  console.log(1) // 先执行
})

onUnmounted(() => {
  console.log(2) // 后执行
})
</script>
```

### 5. 异步清理

```vue
<script setup>
import { onUnmounted } from 'vue'

onUnmounted(() => {
  // ⚠️ onUnmounted 不支持 async
  // 需要异步操作时，使用回调
})

// ✅ 正确的异步清理方式
onUnmounted(() => {
  cleanupAsync().catch(console.error)
})

async function cleanupAsync() {
  await saveData()
  await closeConnections()
}
</script>
```

### 6. 在 Suspense 中

```vue
<script setup>
import { onUnmounted } from 'vue'

onUnmounted(() => {
  // 在 Suspense 组件卸载时也会执行
  console.log('组件卸载（包括在 Suspense 中）')
})
</script>
```

### 7. 与 keep-alive

```vue
<!-- 使用 keep-alive 时 -->
<script setup>
import { onUnmounted, onDeactivated } from 'vue'

onUnmounted(() => {
  // 只在组件真正被销毁时执行
  // keep-alive 缓存的组件不会触发
  console.log('组件销毁（keep-alive 不触发）')
})

onDeactivated(() => {
  // keep-alive 组件停用时执行
  console.log('组件停用（keep-alive 触发）')
})
</script>
```

### 8. 错误处理

```vue
<script setup>
import { onUnmounted } from 'vue'

onUnmounted(() => {
  try {
    // 清理逻辑
    cleanup()
  } catch (error) {
    console.error('Cleanup error:', error)
    // 确保即使出错也继续执行其他清理
  }
})
</script>
```

## 使用场景

### 1. 定时器清理

```vue
<script setup>
import { ref, onUnmounted } from 'vue'

const currentTime = ref(new Date())
let timer = null

const updateTime = () => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}

updateTime()

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div>{{ currentTime.toLocaleString() }}</div>
</template>
```

### 2. 地图实例清理

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let map = null

onMounted(() => {
  map = L.map('map-container').setView([39.9, 116.4], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div id="map-container" style="height: 400px;"></div>
</template>
```

### 3. 动画取消

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const elementRef = ref(null)
let animation = null

onMounted(() => {
  animation = gsap.to(elementRef.value, {
    x: 100,
    duration: 2,
    repeat: -1,
    yoyo: true
  })
})

onUnmounted(() => {
  if (animation) {
    animation.kill()
  }
})
</script>

<template>
  <div ref="elementRef">Animated</div>
</template>
```

### 4. 自定义事件清理

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

const handleCustomEvent = (event) => {
  console.log('Custom event:', event.detail)
}

onMounted(() => {
  window.addEventListener('custom-event', handleCustomEvent)
})

onUnmounted(() => {
  window.removeEventListener('custom-event', handleCustomEvent)
})
</script>
```

### 5. Intersection Observer 清理

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

const targetRef = ref(null)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log('Intersection:', entry.isIntersecting)
    })
  })

  if (targetRef.value) {
    observer.observe(targetRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div ref="targetRef">Target</div>
</template>
```

### 6. Mutation Observer 清理

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

const targetRef = ref(null)
let observer = null

onMounted(() => {
  observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      console.log('DOM changed:', mutation)
    })
  })

  if (targetRef.value) {
    observer.observe(targetRef.value, {
      childList: true,
      subtree: true
    })
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
```

### 7. 防抖/节流清理

```vue
<script setup>
import { onUnmounted } from 'vue'

let debounceTimer = null
let throttleTimer = null

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => fn(...args), delay)
  }
}

function throttle(fn, delay) {
  return (...args) => {
    if (throttleTimer) return
    throttleTimer = setTimeout(() => {
      fn(...args)
      throttleTimer = null
    }, delay)
  }
}

onUnmounted(() => {
  clearTimeout(debounceTimer)
  clearTimeout(throttleTimer)
})
</script>
```

### 8. 数据持久化

```vue
<script setup>
import { ref, onUnmounted } from 'vue'

const formData = ref({
  username: '',
  email: ''
})

onUnmounted(() => {
  // 组件卸载时保存草稿
  localStorage.setItem('form-draft', JSON.stringify(formData.value))
})
</script>
```

### 9. 音频/视频停止

```vue
<script setup>
import { ref, onUnmounted } from 'vue'

const audioRef = ref(null)

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
})
</script>

<template>
  <audio ref="audioRef" src="/music.mp3" controls />
</template>
```

### 10. 状态重置

```vue
<script setup>
import { onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onUnmounted(() => {
  // 重置状态
  userStore.$reset()
})
</script>
```

## 生命周期对比

| 钩子 | 执行时机 | 主要用途 |
|-----|----------|----------|
| onBeforeMount | 挂载前 | 很少使用 |
| onMounted | 挂载后 | DOM操作、初始化 |
| onBeforeUpdate | 更新前 | 访问更新前DOM |
| onUpdated | 更新后 | 访问更新后DOM |
| onBeforeUnmount | 卸载前 | 最后的清理机会 |
| **onUnmounted** | **卸载后** | **最终清理** |

## 最佳实践

1. **配对使用**：onMounted/onUnmounted 成对出现
2. **清理一切**：定时器、事件监听器、订阅等
3. **错误处理**：清理逻辑中添加错误处理
4. **避免异步**：不在 onUnmounted 中执行异步操作
5. **与 watch 配合**：利用 watch 的自动清理特性
