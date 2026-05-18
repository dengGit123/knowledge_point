# onUnmounted

## 作用
`onUnmounted()` 是 Vue 3 的生命周期钩子，在组件实例被卸载之后调用。这是执行清理工作的理想位置，例如移除事件监听器、取消定时器等。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

onUnmounted(() =&gt; {
  console.log('组件已卸载')
})
`&lt;/script&gt;`
```

### 清理定时器

```text
`&lt;script setup&gt;`
import { ref, onUnmounted } from 'vue'

const count = ref(0)
let timer = null

const startTimer = () =&gt; {
  timer = setInterval(() =&gt; {
    count.value++
  }, 1000)
}

// 组件挂载时启动
startTimer()

// 组件卸载时清理
onUnmounted(() =&gt; {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;{{ count }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 移除事件监听器

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'

const handleResize = () =&gt; {
  console.log('Window resized:', window.innerWidth)
}

onMounted(() =&gt; {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() =&gt; {
  window.removeEventListener('resize', handleResize)
})
`&lt;/script&gt;`
```

### 清理 WebSocket 连接

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

const socket = new WebSocket('ws://localhost:8080')

socket.onopen = () =&gt; {
  console.log('WebSocket 已连接')
}

socket.onmessage = (event) =&gt; {
  console.log('收到消息:', event.data)
}

onUnmounted(() =&gt; {
  socket.close()
  console.log('WebSocket 已关闭')
})
`&lt;/script&gt;`
```

### 取消网络请求

```text
`&lt;script setup&gt;`
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

onUnmounted(() =&gt; {
  abortController.abort()
})
`&lt;/script&gt;`
```

### 在选项式 API 中使用

```text
export default {
  data() {
    return {
      timer: null,
      count: 0
    }
  },
  mounted() {
    this.timer = setInterval(() =&gt; {
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

```text
`&lt;script setup&gt;`
import { watchEffect, onUnmounted } from 'vue'

const stop = watchEffect((onCleanup) =&gt; {
  const timer = setInterval(() =&gt; {
    console.log('Tick')
  }, 1000)

  onCleanup(() =&gt; {
    clearInterval(timer)
  })
})

// 组件卸载时自动停止 watchEffect
onUnmounted(() =&gt; {
  stop()
})
`&lt;/script&gt;`
```

### 清理第三方库实例

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

const canvasRef = ref(null)
let chartInstance = null

onMounted(() =&gt; {
  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: { /* ... */ }
  })
})

onUnmounted(() =&gt; {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;canvas ref="canvasRef"&gt;&lt;/canvas&gt;
`&lt;/template&gt;`
```

### 清理订阅

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'
import { eventBus } from './eventBus'

const handleEvent = (data) =&gt; {
  console.log('Event received:', data)
}

eventBus.on('custom-event', handleEvent)

onUnmounted(() =&gt; {
  eventBus.off('custom-event', handleEvent)
})
`&lt;/script&gt;`
```

### 与 provide/inject 清理

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import { provide, onUnmounted } from 'vue'

const cleanupCallbacks = []

provide('registerCleanup', (callback) =&gt; {
  cleanupCallbacks.push(callback)
})

onUnmounted(() =&gt; {
  cleanupCallbacks.forEach(cb =&gt; cb())
})
`&lt;/script&gt;`

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
import { inject, onUnmounted } from 'vue'

const registerCleanup = inject('registerCleanup')

onMounted(() =&gt; {
  const cleanup = () =&gt; {
    // 清理逻辑
  }

  registerCleanup(cleanup)
})
`&lt;/script&gt;`
```

## 注意事项

### 1. 执行时机

```text
// 组件卸载流程：
// 1. onBeforeUnmount 执行
// 2. 组件实例卸载
// 3. onUnmounted 执行
// 4. DOM 元素移除

onUnmounted(() =&gt; {
  // 此时组件已从 DOM 中移除
  // 不要访问组件的 DOM
})
```

### 2. 访问组件状态

```text
`&lt;script setup&gt;`
import { ref, onUnmounted } from 'vue'

const count = ref(0)

onUnmounted(() =&gt; {
  // ⚠️ 可以访问响应式状态
  console.log(count.value) // 可以访问

  // ❌ 但状态更新不会触发任何响应
  count.value++ // 不会有效果
})
`&lt;/script&gt;`
```

### 3. 与 watch 的自动清理

```text
`&lt;script setup&gt;`
import { watch, onUnmounted } from 'vue'

const source = ref(0)

// watch 会在组件卸载时自动停止
watch(source, (value) =&gt; {
  console.log('Source changed:', value)
})

// 不需要手动停止 watch
onUnmounted(() =&gt; {
  // watch 已经自动停止
})
`&lt;/script&gt;`
```

### 4. 清理函数的执行顺序

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

// 多个 onUnmounted 按注册顺序执行
onUnmounted(() =&gt; {
  console.log(1) // 先执行
})

onUnmounted(() =&gt; {
  console.log(2) // 后执行
})
`&lt;/script&gt;`
```

### 5. 异步清理

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

onUnmounted(() =&gt; {
  // ⚠️ onUnmounted 不支持 async
  // 需要异步操作时，使用回调
})

// ✅ 正确的异步清理方式
onUnmounted(() =&gt; {
  cleanupAsync().catch(console.error)
})

async function cleanupAsync() {
  await saveData()
  await closeConnections()
}
`&lt;/script&gt;`
```

### 6. 在 Suspense 中

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

onUnmounted(() =&gt; {
  // 在 Suspense 组件卸载时也会执行
  console.log('组件卸载（包括在 Suspense 中）')
})
`&lt;/script&gt;`
```

### 7. 与 keep-alive

```text
&lt;!-- 使用 keep-alive 时 --&gt;
`&lt;script setup&gt;`
import { onUnmounted, onDeactivated } from 'vue'

onUnmounted(() =&gt; {
  // 只在组件真正被销毁时执行
  // keep-alive 缓存的组件不会触发
  console.log('组件销毁（keep-alive 不触发）')
})

onDeactivated(() =&gt; {
  // keep-alive 组件停用时执行
  console.log('组件停用（keep-alive 触发）')
})
`&lt;/script&gt;`
```

### 8. 错误处理

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

onUnmounted(() =&gt; {
  try {
    // 清理逻辑
    cleanup()
  } catch (error) {
    console.error('Cleanup error:', error)
    // 确保即使出错也继续执行其他清理
  }
})
`&lt;/script&gt;`
```

## 使用场景

### 1. 定时器清理

```text
`&lt;script setup&gt;`
import { ref, onUnmounted } from 'vue'

const currentTime = ref(new Date())
let timer = null

const updateTime = () =&gt; {
  timer = setInterval(() =&gt; {
    currentTime.value = new Date()
  }, 1000)
}

updateTime()

onUnmounted(() =&gt; {
  if (timer) {
    clearInterval(timer)
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;{{ currentTime.toLocaleString() }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 地图实例清理

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'

let map = null

onMounted(() =&gt; {
  map = L.map('map-container').setView([39.9, 116.4], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
})

onUnmounted(() =&gt; {
  if (map) {
    map.remove()
    map = null
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div id="map-container" style="height: 400px;"&gt;&lt;/div&gt;
`&lt;/template&gt;`
```

### 3. 动画取消

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const elementRef = ref(null)
let animation = null

onMounted(() =&gt; {
  animation = gsap.to(elementRef.value, {
    x: 100,
    duration: 2,
    repeat: -1,
    yoyo: true
  })
})

onUnmounted(() =&gt; {
  if (animation) {
    animation.kill()
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div ref="elementRef"&gt;Animated&lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 自定义事件清理

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'

const handleCustomEvent = (event) =&gt; {
  console.log('Custom event:', event.detail)
}

onMounted(() =&gt; {
  window.addEventListener('custom-event', handleCustomEvent)
})

onUnmounted(() =&gt; {
  window.removeEventListener('custom-event', handleCustomEvent)
})
`&lt;/script&gt;`
```

### 5. Intersection Observer 清理

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'

const targetRef = ref(null)
let observer = null

onMounted(() =&gt; {
  observer = new IntersectionObserver((entries) =&gt; {
    entries.forEach(entry =&gt; {
      console.log('Intersection:', entry.isIntersecting)
    })
  })

  if (targetRef.value) {
    observer.observe(targetRef.value)
  }
})

onUnmounted(() =&gt; {
  if (observer) {
    observer.disconnect()
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div ref="targetRef"&gt;Target&lt;/div&gt;
`&lt;/template&gt;`
```

### 6. Mutation Observer 清理

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'

const targetRef = ref(null)
let observer = null

onMounted(() =&gt; {
  observer = new MutationObserver((mutations) =&gt; {
    mutations.forEach(mutation =&gt; {
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

onUnmounted(() =&gt; {
  if (observer) {
    observer.disconnect()
  }
})
`&lt;/script&gt;`
```

### 7. 防抖/节流清理

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'

let debounceTimer = null
let throttleTimer = null

function debounce(fn, delay) {
  return (...args) =&gt; {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() =&gt; fn(...args), delay)
  }
}

function throttle(fn, delay) {
  return (...args) =&gt; {
    if (throttleTimer) return
    throttleTimer = setTimeout(() =&gt; {
      fn(...args)
      throttleTimer = null
    }, delay)
  }
}

onUnmounted(() =&gt; {
  clearTimeout(debounceTimer)
  clearTimeout(throttleTimer)
})
`&lt;/script&gt;`
```

### 8. 数据持久化

```text
`&lt;script setup&gt;`
import { ref, onUnmounted } from 'vue'

const formData = ref({
  username: '',
  email: ''
})

onUnmounted(() =&gt; {
  // 组件卸载时保存草稿
  localStorage.setItem('form-draft', JSON.stringify(formData.value))
})
`&lt;/script&gt;`
```

### 9. 音频/视频停止

```text
`&lt;script setup&gt;`
import { ref, onUnmounted } from 'vue'

const audioRef = ref(null)

onUnmounted(() =&gt; {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;audio ref="audioRef" src="/music.mp3" controls /&gt;
`&lt;/template&gt;`
```

### 10. 状态重置

```text
`&lt;script setup&gt;`
import { onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onUnmounted(() =&gt; {
  // 重置状态
  userStore.$reset()
})
`&lt;/script&gt;`
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
