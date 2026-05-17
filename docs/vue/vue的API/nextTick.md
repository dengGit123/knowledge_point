# nextTick

## 作用
`nextTick()` 是一个实例方法，用于在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

## 用法

### 基本用法

```javascript
import { nextTick } from 'vue'

const count = ref(0)

count.value++

// 等待 DOM 更新
await nextTick()
console.log('DOM 已更新')

// 或者使用 Promise
nextTick(() => {
  console.log('DOM 已更新')
})
```

### 在 <script setup> 中使用

```vue
<script setup>
import { ref, nextTick } from 'vue'

const message = ref('Hello')
const inputRef = ref(null)

async function updateAndFocus() {
  message.value = 'Updated'

  // 等待 DOM 更新
  await nextTick()

  // 现在 DOM 已经更新，可以安全操作
  inputRef.value.focus()
}
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <input ref="inputRef" />
    <button @click="updateAndFocus">更新并聚焦</button>
  </div>
</template>
```

### Promise 方式

```javascript
import { nextTick } from 'vue'

async function updateData() {
  data.value = 'new value'

  await nextTick()

  // DOM 已更新
  console.log('DOM updated')
}
```

### 回调方式

```javascript
import { nextTick } from 'vue'

data.value = 'new value'

nextTick(() => {
  // DOM 已更新
  console.log('DOM updated')
})
```

### 多次更新后执行

```javascript
import { nextTick } from 'vue'

// 多次修改数据
count.value++
message.value = 'Updated'
items.value.push(newItem)

// 只需要一次 nextTick
await nextTick()
console.log('所有更新已应用到 DOM')
```

### 在选项式 API 中使用

```javascript
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    async increment() {
      this.count++

      // 等待 DOM 更新
      await this.$nextTick()

      console.log('DOM updated')
    },

    incrementWithCallback() {
      this.count++

      this.$nextTick(() => {
        console.log('DOM updated')
      })
    }
  }
}
```

### 获取元素尺寸

```vue
<script setup>
import { ref, nextTick } from 'vue'

const list = ref([])
const containerRef = ref(null)

async function addItem() {
  list.value.push({ id: Date.now() })

  // 等待 DOM 更新后获取高度
  await nextTick()

  const height = containerRef.value.offsetHeight
  console.log('Container height:', height)
}
</script>

<template>
  <div ref="containerRef" class="container">
    <div v-for="item in list" :key="item.id">
      {{ item.id }}
    </div>
  </div>
</template>
```

### 滚动到指定位置

```vue
<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const messagesContainer = ref(null)

async function addMessage(message) {
  messages.value.push(message)

  // 等待新消息渲染后滚动
  await nextTick()

  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>
```

### 与第三方库集成

```vue
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const canvasRef = ref(null)
let chart = null

onMounted(async () => {
  await nextTick()

  // 确保 canvas 已渲染
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Data',
          data: [1, 2, 3]
        }]
      }
    })
  }
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

## 注意事项

### 1. nextTick 的执行时机

```javascript
import { nextTick, watchEffect } from 'vue'

data.value = 'new value'

// watchEffect 比 nextTick 更早执行
watchEffect(() => {
  console.log('watchEffect') // 1
})

nextTick(() => {
  console.log('nextTick') // 2
})

// DOM 更新后
console.log('sync') // 0
```

### 2. 多次调用合并

```javascript
// 多次调用 nextTick 会被合并为一次
nextTick(() => console.log(1))
nextTick(() => console.log(2))
nextTick(() => console.log(3))

// 输出顺序: 1, 2, 3（在同一个微任务中）
```

### 3. 与 setTimeout 的区别

```javascript
// nextTick: 微任务，在 DOM 更新后立即执行
nextTick(() => {
  console.log('nextTick')
})

// setTimeout: 宏任务，在事件循环的下一轮执行
setTimeout(() => {
  console.log('setTimeout')
}, 0)

// 输出顺序: nextTick -> setTimeout
```

### 4. 在 async 函数中使用

```javascript
async function update() {
  data.value = 'new'

  // 等待 DOM 更新
  await nextTick()

  // 继续执行
  doSomething()
}
```

### 5. 错误处理

```javascript
try {
  await nextTick()
  // DOM 已更新
} catch (error) {
  console.error('Error during nextTick:', error)
}
```

### 6. 与 watch 的区别

```javascript
const data = ref(0)

// watch: 监听特定数据变化
watch(data, () => {
  console.log('data changed')
})

// nextTick: DOM 更新后执行
data.value++
await nextTick()
console.log('DOM updated')
```

### 7. 在 beforeUnmount 中的使用

```javascript
import { onBeforeUnmount, nextTick } from 'vue'

onBeforeUnmount(async () => {
  // 清理前最后的 DOM 操作
  await nextTick()
  saveScrollPosition()
})
```

### 8. 服务端渲染

```javascript
// SSR 中 nextTick 立即执行
if (import.meta.env.SSR) {
  await nextTick() // 立即解决，没有 DOM
} else {
  await nextTick() // 等待 DOM 更新
}
```

## 使用场景

### 1. 自动聚焦输入框

```vue
<script setup>
import { ref, nextTick } from 'vue'

const showInput = ref(false)
const inputRef = ref(null)

async function showAndFocus() {
  showInput.value = true

  // 等待 input 元素渲染
  await nextTick()

  inputRef.value?.focus()
}
</script>

<template>
  <div>
    <button @click="showAndFocus">显示输入框</button>
    <input v-if="showInput" ref="inputRef" />
  </div>
</template>
```

### 2. 聊天窗口滚动

```vue
<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const containerRef = ref(null)

async function sendMessage(text) {
  messages.value.push({
    id: Date.now(),
    text,
    sender: 'me'
  })

  // 等待新消息渲染
  await nextTick()

  // 滚动到底部
  if (containerRef.value) {
    containerRef.value.scrollTo({
      top: containerRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
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

### 3. 动态高度计算

```vue
<script setup>
import { ref, nextTick } from 'vue'

const content = ref('')
const containerRef = ref(null)
const height = ref(0)

async function updateContent() {
  content.value = 'Long content...'

  // 等待内容渲染
  await nextTick()

  // 计算高度
  height.value = containerRef.value?.offsetHeight || 0
}
</script>

<template>
  <div>
    <button @click="updateContent">更新内容</button>
    <div ref="containerRef">{{ content }}</div>
    <p>高度: {{ height }}px</p>
  </div>
</template>
```

### 4. 第三方组件初始化

```vue
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Calendar } from '@fullcalendar/core'

const calendarRef = ref(null)

onMounted(async () => {
  await nextTick()

  // 初始化日历
  const calendar = new Calendar(calendarRef.value, {
    initialView: 'dayGridMonth',
    events: []
  })

  calendar.render()
})
</script>

<template>
  <div ref="calendarRef"></div>
</template>
```

### 5. 拖拽后获取位置

```vue
<script setup>
import { ref, nextTick } from 'vue'

const items = ref([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' }
])

async function reorderItems() {
  // 改变顺序
  items.value = items.value.reverse()

  // 等待 DOM 更新
  await nextTick()

  // 获取新位置
  const positions = items.value.map(item => {
    const el = document.getElementById(`item-${item.id}`)
    return {
      id: item.id,
      rect: el.getBoundingClientRect()
    }
  })

  console.log('New positions:', positions)
}
</script>

<template>
  <div>
    <button @click="reorderItems">重排序</button>
    <div
      v-for="item in items"
      :key="item.id"
      :id="`item-${item.id}`"
    >
      {{ item.text }}
    </div>
  </div>
</template>
```

### 6. Canvas 绘图

```vue
<script setup>
import { ref, watch, nextTick } from 'vue'

const canvasRef = ref(null)
const data = ref([])

watch(data, async () => {
  await nextTick()

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制图表
  data.value.forEach((point, i) => {
    ctx.beginPath()
    ctx.arc(i * 50, point, 5, 0, Math.PI * 2)
    ctx.fill()
  })
})
</script>

<template>
  <canvas ref="canvasRef" width="500" height="300"></canvas>
</template>
```

### 7. 表单验证

```vue
<script setup>
import { ref, nextTick } from 'vue'

const form = ref({
  username: '',
  email: ''
})

const errors = ref({})

async function validate() {
  // 清空错误
  errors.value = {}

  // 验证逻辑
  if (!form.value.username) {
    errors.value.username = 'Username is required'
  }

  // 等待错误信息渲染
  await nextTick()

  // 聚焦第一个错误字段
  const firstError = document.querySelector('.error')
  firstError?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <form @submit.prevent="validate">
    <div>
      <input v-model="form.username" />
      <span v-if="errors.username" class="error">
        {{ errors.username }}
      </span>
    </div>
    <button type="submit">Submit</button>
  </form>
</template>
```

### 8. 列表动画

```vue
<script setup>
import { ref, nextTick } from 'vue'

const items = ref([1, 2, 3])

async function addItem() {
  items.value.push(items.value.length + 1)

  // 等待新元素渲染
  await nextTick()

  // 添加动画类
  const newItem = document.querySelectorAll('.item')[items.value.length - 1]
  newItem.classList.add('animate-in')
}
</script>

<template>
  <div>
    <button @click="addItem">添加</button>
    <div
      v-for="item in items"
      :key="item"
      class="item"
    >
      {{ item }}
    </div>
  </div>
</template>
```

### 9. 图片懒加载

```vue
<script setup>
import { ref, onMounted, nextTick } from 'vue'

const images = ref([])

onMounted(async () => {
  images.value = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    src: `https://picsum.photos/300/200?random=${i}`,
    loaded: false
  }))

  await nextTick()

  // 初始化懒加载
  observeImages()
})

function observeImages() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        observer.unobserve(img)
      }
    })
  })

  document.querySelectorAll('.lazy-image').forEach(img => {
    observer.observe(img)
  })
}
</script>

<template>
  <div>
    <img
      v-for="image in images"
      :key="image.id"
      :data-src="image.src"
      class="lazy-image"
    />
  </div>
</template>
```

### 10. 条件渲染后的操作

```vue
<script setup>
import { ref, nextTick } from 'vue'

const showDialog = ref(false)
const dialogRef = ref(null)

async function openDialog() {
  showDialog.value = true

  // 等待对话框渲染
  await nextTick()

  // 获取对话框尺寸
  const { width, height } = dialogRef.value.getBoundingClientRect()

  // 居中显示
  dialogRef.value.style.left = `calc(50% - ${width / 2}px)`
  dialogRef.value.style.top = `calc(50% - ${height / 2}px)`
}
</script>

<template>
  <div>
    <button @click="openDialog">打开对话框</button>
    <div v-if="showDialog" ref="dialogRef" class="dialog">
      Dialog content
    </div>
  </div>
</template>
```

## nextTick 与其他 API 的对比

| API | 时机 | 用途 |
|-----|------|------|
| nextTick | DOM 更新后 | 需要访问更新后的 DOM |
| watchEffect | 副作用函数中 | 自动追踪依赖 |
| watch | 指定数据变化 | 监听特定数据 |
| setTimeout | 事件循环下一轮 | 延迟执行 |

## 最佳实践

1. **DOM 操作前使用**：修改数据后访问 DOM 前使用
2. **Promise 方式**：优先使用 await 语法
3. **避免过度使用**：不是所有情况都需要 nextTick
4. **组合使用**：可以配合 watch 等其他 API
5. **性能考虑**：大量操作考虑批量处理
