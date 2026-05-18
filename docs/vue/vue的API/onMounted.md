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

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() =&gt; {
  console.log('组件已挂载')
  console.log('count 的值:', count.value)
})
`&lt;/script&gt;`
```

### 访问 DOM 元素

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() =&gt; {
  // DOM 已渲染，可以访问
  inputRef.value.focus()
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input ref="inputRef" placeholder="自动聚焦" /&gt;
`&lt;/template&gt;`
```

### 发起 API 请求

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const data = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () =&gt; {
  try {
    const response = await fetch('https://api.example.com/data')
    data.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-if="loading"&gt;加载中...&lt;/div&gt;
  &lt;div v-else-if="error"&gt;错误: {{ error }}&lt;/div&gt;
  &lt;div v-else&gt;{{ data }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 设置定时器

```text
`&lt;script setup&gt;`
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')

let timer = null

onMounted(() =&gt; {
  // 每秒更新时间
  timer = setInterval(() =&gt; {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() =&gt; {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;当前时间: {{ currentTime }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 添加事件监听

```text
`&lt;script setup&gt;`
import { ref, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(window.innerWidth)

const handleResize = () =&gt; {
  windowWidth.value = window.innerWidth
}

onMounted(() =&gt; {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() =&gt; {
  window.removeEventListener('resize', handleResize)
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;窗口宽度: {{ windowWidth }}px&lt;/div&gt;
`&lt;/template&gt;`
```

### 初始化第三方库

```text
`&lt;script setup&gt;`
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

const canvasRef = ref(null)
let chart = null

onMounted(() =&gt; {
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

onUnmounted(() =&gt; {
  if (chart) {
    chart.destroy()
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;canvas ref="canvasRef"&gt;&lt;/canvas&gt;
`&lt;/template&gt;`
```

### 初始化地图

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted, ref } from 'vue'

const mapRef = ref(null)
let map = null

onMounted(() =&gt; {
  // 初始化地图（以 Leaflet 为例）
  map = L.map(mapRef.value).setView([39.9, 116.4], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
  }).addTo(map)
})

onUnmounted(() =&gt; {
  if (map) {
    map.remove()
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div ref="mapRef" style="height: 400px;"&gt;&lt;/div&gt;
`&lt;/template&gt;`
```

### 多次调用 onMounted

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const data = ref([])

onMounted(() =&gt; {
  console.log('第一次挂载钩子')
  fetchData1()
})

onMounted(() =&gt; {
  console.log('第二次挂载钩子')
  fetchData2()
})

onMounted(() =&gt; {
  console.log('第三次挂载钩子')
  initCharts()
})
`&lt;/script&gt;`
```

### 在选项式 API 中使用

```text
export default {
  mounted() {
    console.log('组件已挂载')
    this.$refs.input.focus()
  }
}
```

### TypeScript 支持

```text
&lt;script setup lang="ts"&gt;
import { ref, onMounted } from 'vue'

interface User {
  id: number
  name: string
}

const users = ref&lt;User[]&gt;([])

onMounted(async () =&gt; {
  const response = await fetch('/api/users')
  users.value = await response.json()
})
`&lt;/script&gt;`
```

## 注意事项

### 1. 执行时机

```text
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() =&gt; {
  // ✅ 此时可以访问 DOM
  console.log(document.querySelector('.my-element'))

  // ✅ 响应式数据已初始化
  console.log(count.value) // 0
})

// ⚠️ 注意：setup 函数先于 onMounted 执行
console.log('setup 执行') // 先执行
onMounted(() =&gt; {
  console.log('onMounted 执行') // 后执行
})
```

### 2. 只在组件 setup 中调用

```text
// ✅ 正确：在组件 setup 中
import { onMounted } from 'vue'

export default {
  setup() {
    onMounted(() =&gt; {
      console.log('挂载')
    })
  }
}

// ❌ 错误：在普通函数中
function initApp() {
  onMounted(() =&gt; {
    // 不会有任何效果
  })
}
```

### 3. 必须同步调用

```text
import { onMounted } from 'vue'

// ✅ 正确：同步调用
onMounted(() =&gt; {
  console.log('挂载')
})

// ❌ 错误：异步调用
setTimeout(() =&gt; {
  onMounted(() =&gt; {
    // 不会执行
  })
}, 1000)

// ❌ 错误：条件语句中
if (someCondition) {
  onMounted(() =&gt; {
    // 不会执行
  })
}
```

### 4. 清理副作用

```text
// ✅ 正确：配对使用清理
onMounted(() =&gt; {
  const timer = setInterval(() =&gt; {}, 1000)

  onUnmounted(() =&gt; {
    clearInterval(timer)
  })
})

// ⚠️ 不要在 onMounted 中注册新的 onMounted
onMounted(() =&gt; {
  onMounted(() =&gt; {
    // 这是不正确的
  })
})
```

### 5. 与 watchEffect 的配合

```text
import { ref, onMounted, watchEffect } from 'vue'

const elementRef = ref(null)

// ✅ 正确：在 onMounted 中访问 DOM
onMounted(() =&gt; {
  console.log(elementRef.value.offsetHeight)
})

// ⚠️ watchEffect 默认在 DOM 更新前执行
watchEffect(() =&gt; {
  // 此时 elementRef.value 可能还是 null
  console.log(elementRef.value?.offsetHeight)
})

// ✅ 使用 watchPostEffect 在 DOM 更新后执行
import { watchPostEffect } from 'vue'

watchPostEffect(() =&gt; {
  // DOM 已更新
  console.log(elementRef.value?.offsetHeight)
})
```

### 6. SSR 注意事项

```text
// ⚠️ onMounted 只在客户端执行
onMounted(() =&gt; {
  // 这个代码不会在服务器端执行
  console.log('只在客户端执行')
})

// ✅ 如果需要服务端和客户端都执行，使用 onBeforeMount
import { onBeforeMount } from 'vue'

onBeforeMount(() =&gt; {
  // 服务端和客户端都会执行
})
```

### 7. 父子组件的挂载顺序

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import { onMounted } from 'vue'
import Child from './Child.vue'

onMounted(() =&gt; {
  console.log('父组件挂载')
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Child /&gt;
`&lt;/template&gt;`

&lt;!-- 子组件 Child.vue --&gt;
`&lt;script setup&gt;`
import { onMounted } from 'vue'

onMounted(() =&gt; {
  console.log('子组件挂载')
})
`&lt;/script&gt;`

// 输出顺序：
// 1. 子组件挂载
// 2. 父组件挂载
```

### 8. 与 keep-alive 的关系

```text
&lt;!-- 使用 keep-alive 时 --&gt;
`&lt;script setup&gt;`
import { onMounted, onActivated } from 'vue'

onMounted(() =&gt; {
  console.log('只在首次挂载时执行')
})

onActivated(() =&gt; {
  // 每次 keep-alive 组件激活时执行
  console.log('组件被激活')
})
`&lt;/script&gt;`
```

## 使用场景

### 1. 数据初始化

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const todos = ref([])

onMounted(async () =&gt; {
  const response = await fetch('/api/todos')
  todos.value = await response.json()
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul&gt;
    &lt;li v-for="todo in todos" :key="todo.id"&gt;
      {{ todo.text }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 2. DOM 初始化操作

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const draggableRef = ref(null)

onMounted(() =&gt; {
  // 初始化拖拽
  new Draggable(draggableRef.value, {
    onDrag: (event) =&gt; {
      console.log('拖拽中', event)
    }
  })
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div ref="draggableRef" class="draggable"&gt;
    可拖拽元素
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 3. 滚动位置恢复

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const containerRef = ref(null)
const scrollPosition = sessionStorage.getItem('scrollPos') || 0

onMounted(() =&gt; {
  containerRef.value.scrollTop = scrollPosition
})

function saveScrollPosition() {
  sessionStorage.setItem('scrollPos', containerRef.value.scrollTop)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div ref="containerRef" @scroll="saveScrollPosition" class="scroll-container"&gt;
    &lt;!-- 长内容 --&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. WebSocket 连接

```text
`&lt;script setup&gt;`
import { ref, onMounted, onUnmounted } from 'vue'

const messages = ref([])
let socket = null

onMounted(() =&gt; {
  socket = new WebSocket('ws://localhost:8080')

  socket.onopen = () =&gt; {
    console.log('WebSocket 已连接')
  }

  socket.onmessage = (event) =&gt; {
    messages.value.push(JSON.parse(event.data))
  }

  socket.onerror = (error) =&gt; {
    console.error('WebSocket 错误:', error)
  }
})

onUnmounted(() =&gt; {
  if (socket) {
    socket.close()
  }
})
`&lt;/script&gt;`
```

### 5. 动画初始化

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const titleRef = ref(null)
const subtitleRef = ref(null)

onMounted(() =&gt; {
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;h1 ref="titleRef"&gt;标题&lt;/h1&gt;
    &lt;p ref="subtitleRef"&gt;副标题&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 路由参数获取

```text
`&lt;script setup&gt;`
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const post = ref(null)

onMounted(async () =&gt; {
  const postId = route.params.id
  const response = await fetch(`/api/posts/${postId}`)
  post.value = await response.json()
})
`&lt;/script&gt;`
```

### 7. Canvas 绘图

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)

onMounted(() =&gt; {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  // 绘制图形
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, 100, 100)

  ctx.beginPath()
  ctx.arc(150, 60, 50, 0, Math.PI * 2)
  ctx.fill()
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;canvas ref="canvasRef" width="500" height="300"&gt;&lt;/canvas&gt;
`&lt;/template&gt;`
```

### 8. 媒体元素控制

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const videoRef = ref(null)

onMounted(() =&gt; {
  const video = videoRef.value

  // 设置初始音量
  video.volume = 0.5

  // 监听事件
  video.addEventListener('ended', () =&gt; {
    console.log('视频播放结束')
  })
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;video ref="videoRef" src="/video.mp4" controls&gt;&lt;/video&gt;
`&lt;/template&gt;`
```

### 9. 表单自动填充

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const form = ref({
  username: '',
  email: '',
  phone: ''
})

onMounted(() =&gt; {
  // 从本地存储恢复表单
  const saved = localStorage.getItem('draftForm')
  if (saved) {
    form.value = JSON.parse(saved)
  }
})

function saveDraft() {
  localStorage.setItem('draftForm', JSON.stringify(form.value))
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form @input="saveDraft"&gt;
    &lt;input v-model="form.username" /&gt;
    &lt;input v-model="form.email" /&gt;
    &lt;input v-model="form.phone" /&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 10. 权限检查和重定向

```text
`&lt;script setup&gt;`
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/auth'

const router = useRouter()
const { isAuthenticated, hasPermission } = useAuth()

onMounted(() =&gt; {
  if (!isAuthenticated.value) {
    router.push('/login')
  } else if (!hasPermission('admin')) {
    router.push('/unauthorized')
  }
})
`&lt;/script&gt;`
```

## 生命周期顺序

```text
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
