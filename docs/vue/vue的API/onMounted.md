# onMounted

## 作用
`onMounted()` 是 Vue 3 的生命周期钩子，用于在组件挂载完成后注册回调函数。此时组件已完成了以下工作：
- 创建响应式状态
- 编译模板
- 渲染 DOM 树
- 将 DOM 节点挂载到页面

可以安全地访问 DOM 元素和执行 DOM 操作。

## 用法

### 基本用法

```vue
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() => {
  console.log('组件已挂载')
  console.log('count 的值:', count.value)
})
</script>
```

### 访问 DOM 元素

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  // DOM 已渲染，可以访问
  inputRef.value.focus()
})
</script>

<template>
  <input ref="inputRef" placeholder="自动聚焦" />
</template>
```

### 发起 API 请求

```vue
<script setup>
import { ref, onMounted } from 'vue'

const data = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('https://api.example.com/data')
    data.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error }}</div>
  <div v-else>{{ data }}</div>
</template>
```

### 设置定时器

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')

let timer = null

onMounted(() => {
  // 每秒更新时间
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div>当前时间: {{ currentTime }}</div>
</template>
```

### 添加事件监听

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>窗口宽度: {{ windowWidth }}px</div>
</template>
```

### 初始化第三方库

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

const canvasRef = ref(null)
let chart = null

onMounted(() => {
  const ctx = canvasRef.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [{
        label: '投票结果',
        data: [12, 19, 3],
        backgroundColor: ['red', 'blue', 'yellow']
      }]
    }
  })
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

### 初始化地图

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const mapRef = ref(null)
let map = null

onMounted(() => {
  // 初始化地图（以 Leaflet 为例）
  map = L.map(mapRef.value).setView([39.9, 116.4], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
  }).addTo(map)
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <div ref="mapRef" style="height: 400px;"></div>
</template>
```

### 多次调用 onMounted

```vue
<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])

onMounted(() => {
  console.log('第一次挂载钩子')
  fetchData1()
})

onMounted(() => {
  console.log('第二次挂载钩子')
  fetchData2()
})

onMounted(() => {
  console.log('第三次挂载钩子')
  initCharts()
})
</script>
```

### 在选项式 API 中使用

```javascript
export default {
  mounted() {
    console.log('组件已挂载')
    this.$refs.input.focus()
  }
}
```

### TypeScript 支持

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([])

onMounted(async () => {
  const response = await fetch('/api/users')
  users.value = await response.json()
})
</script>
```

## 注意事项

### 1. 执行时机

```javascript
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() => {
  // ✅ 此时可以访问 DOM
  console.log(document.querySelector('.my-element'))

  // ✅ 响应式数据已初始化
  console.log(count.value) // 0
})

// ⚠️ 注意：setup 函数先于 onMounted 执行
console.log('setup 执行') // 先执行
onMounted(() => {
  console.log('onMounted 执行') // 后执行
})
```

### 2. 只在组件 setup 中调用

```javascript
// ✅ 正确：在组件 setup 中
import { onMounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('挂载')
    })
  }
}

// ❌ 错误：在普通函数中
function initApp() {
  onMounted(() => {
    // 不会有任何效果
  })
}
```

### 3. 必须同步调用

```javascript
import { onMounted } from 'vue'

// ✅ 正确：同步调用
onMounted(() => {
  console.log('挂载')
})

// ❌ 错误：异步调用
setTimeout(() => {
  onMounted(() => {
    // 不会执行
  })
}, 1000)

// ❌ 错误：条件语句中
if (someCondition) {
  onMounted(() => {
    // 不会执行
  })
}
```

### 4. 清理副作用

```javascript
// ✅ 正确：配对使用清理
onMounted(() => {
  const timer = setInterval(() => {}, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})

// ⚠️ 不要在 onMounted 中注册新的 onMounted
onMounted(() => {
  onMounted(() => {
    // 这是不正确的
  })
})
```

### 5. 与 watchEffect 的配合

```javascript
import { ref, onMounted, watchEffect } from 'vue'

const elementRef = ref(null)

// ✅ 正确：在 onMounted 中访问 DOM
onMounted(() => {
  console.log(elementRef.value.offsetHeight)
})

// ⚠️ watchEffect 默认在 DOM 更新前执行
watchEffect(() => {
  // 此时 elementRef.value 可能还是 null
  console.log(elementRef.value?.offsetHeight)
})

// ✅ 使用 watchPostEffect 在 DOM 更新后执行
import { watchPostEffect } from 'vue'

watchPostEffect(() => {
  // DOM 已更新
  console.log(elementRef.value?.offsetHeight)
})
```

### 6. SSR 注意事项

```javascript
// ⚠️ onMounted 只在客户端执行
onMounted(() => {
  // 这个代码不会在服务器端执行
  console.log('只在客户端执行')
})

// ✅ 如果需要服务端和客户端都执行，使用 onBeforeMount
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  // 服务端和客户端都会执行
})
```

### 7. 父子组件的挂载顺序

```vue
<!-- 父组件 -->
<script setup>
import { onMounted } from 'vue'
import Child from './Child.vue'

onMounted(() => {
  console.log('父组件挂载')
})
</script>

<template>
  <Child />
</template>

<!-- 子组件 Child.vue -->
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('子组件挂载')
})
</script>

// 输出顺序：
// 1. 子组件挂载
// 2. 父组件挂载
```

### 8. 与 keep-alive 的关系

```vue
<!-- 使用 keep-alive 时 -->
<script setup>
import { onMounted, onActivated } from 'vue'

onMounted(() => {
  console.log('只在首次挂载时执行')
})

onActivated(() => {
  // 每次 keep-alive 组件激活时执行
  console.log('组件被激活')
})
</script>
```

## 使用场景

### 1. 数据初始化

```vue
<script setup>
import { ref, onMounted } from 'vue'

const todos = ref([])

onMounted(async () => {
  const response = await fetch('/api/todos')
  todos.value = await response.json()
})
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>
```

### 2. DOM 初始化操作

```vue
<script setup>
import { ref, onMounted } from 'vue'

const draggableRef = ref(null)

onMounted(() => {
  // 初始化拖拽
  new Draggable(draggableRef.value, {
    onDrag: (event) => {
      console.log('拖拽中', event)
    }
  })
})
</script>

<template>
  <div ref="draggableRef" class="draggable">
    可拖拽元素
  </div>
</template>
```

### 3. 滚动位置恢复

```vue
<script setup>
import { ref, onMounted } from 'vue'

const containerRef = ref(null)
const scrollPosition = sessionStorage.getItem('scrollPos') || 0

onMounted(() => {
  containerRef.value.scrollTop = scrollPosition
})

function saveScrollPosition() {
  sessionStorage.setItem('scrollPos', containerRef.value.scrollTop)
}
</script>

<template>
  <div ref="containerRef" @scroll="saveScrollPosition" class="scroll-container">
    <!-- 长内容 -->
  </div>
</template>
```

### 4. WebSocket 连接

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = ref([])
let socket = null

onMounted(() => {
  socket = new WebSocket('ws://localhost:8080')

  socket.onopen = () => {
    console.log('WebSocket 已连接')
  }

  socket.onmessage = (event) => {
    messages.value.push(JSON.parse(event.data))
  }

  socket.onerror = (error) => {
    console.error('WebSocket 错误:', error)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
})
</script>
```

### 5. 动画初始化

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const titleRef = ref(null)
const subtitleRef = ref(null)

onMounted(() => {
  // 入场动画
  gsap.from(titleRef.value, {
    y: -50,
    opacity: 0,
    duration: 1
  })

  gsap.from(subtitleRef.value, {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 0.3
  })
})
</script>

<template>
  <div>
    <h1 ref="titleRef">标题</h1>
    <p ref="subtitleRef">副标题</p>
  </div>
</template>
```

### 6. 路由参数获取

```vue
<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const post = ref(null)

onMounted(async () => {
  const postId = route.params.id
  const response = await fetch(`/api/posts/${postId}`)
  post.value = await response.json()
})
</script>
```

### 7. Canvas 绘图

```vue
<script setup>
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  // 绘制图形
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, 100, 100)

  ctx.beginPath()
  ctx.arc(150, 60, 50, 0, Math.PI * 2)
  ctx.fill()
})
</script>

<template>
  <canvas ref="canvasRef" width="500" height="300"></canvas>
</template>
```

### 8. 媒体元素控制

```vue
<script setup>
import { ref, onMounted } from 'vue'

const videoRef = ref(null)

onMounted(() => {
  const video = videoRef.value

  // 设置初始音量
  video.volume = 0.5

  // 监听事件
  video.addEventListener('ended', () => {
    console.log('视频播放结束')
  })
})
</script>

<template>
  <video ref="videoRef" src="/video.mp4" controls></video>
</template>
```

### 9. 表单自动填充

```vue
<script setup>
import { ref, onMounted } from 'vue'

const form = ref({
  username: '',
  email: '',
  phone: ''
})

onMounted(() => {
  // 从本地存储恢复表单
  const saved = localStorage.getItem('draftForm')
  if (saved) {
    form.value = JSON.parse(saved)
  }
})

function saveDraft() {
  localStorage.setItem('draftForm', JSON.stringify(form.value))
}
</script>

<template>
  <form @input="saveDraft">
    <input v-model="form.username" />
    <input v-model="form.email" />
    <input v-model="form.phone" />
  </form>
</template>
```

### 10. 权限检查和重定向

```vue
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/auth'

const router = useRouter()
const { isAuthenticated, hasPermission } = useAuth()

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  } else if (!hasPermission('admin')) {
    router.push('/unauthorized')
  }
})
</script>
```

## 生命周期顺序

```
创建阶段：
  setup()
  ↓
  onBeforeMount()
  ↓
  onMounted()  ← 当前钩子位置

更新阶段：
  数据变化
  ↓
  onBeforeUpdate()
  ↓
  DOM 更新
  ↓
  onUpdated()

卸载阶段：
  onBeforeUnmount()
  ↓
  onUnmounted()
```

## 最佳实践

1. **初始化数据获取**：组件挂载时获取初始数据
2. **DOM 操作**：在挂载后进行 DOM 操作
3. **配对清理**：在 onUnmounted 中清理 onMounted 中创建的资源
4. **避免耗时操作**：避免在 onMounted 中执行长时间的同步操作
5. **异步处理**：使用 async/await 处理异步操作
