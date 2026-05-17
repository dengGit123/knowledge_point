# onUpdated

## 作用
`onUpdated()` 是 Vue 3 的生命周期钩子，在组件因响应式状态变化而更新其 DOM 树后调用。可以在此钩子中执行依赖于 DOM 更新后的操作。

## 用法

### 基本用法

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const count = ref(0)

onUpdated(() => {
  console.log('组件已更新，count:', count.value)
})

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### 访问更新后的 DOM

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const items = ref([])
const listRef = ref(null)

onUpdated(() => {
  // DOM 已更新，可以获取最新的 DOM 属性
  const listHeight = listRef.value.offsetHeight
  console.log('列表高度:', listHeight)
})

function addItem() {
  items.value.push(`Item ${items.value.length + 1}`)
}
</script>

<template>
  <div>
    <button @click="addItem">添加项目</button>
    <ul ref="listRef">
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
      </li>
    </ul>
  </div>
</template>
```

### 监听特定元素变化

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const content = ref('')

onUpdated(() => {
  // 检查特定元素是否更新
  const element = document.querySelector('.content-display')
  if (element) {
    console.log('内容高度:', element.scrollHeight)
  }
})
</script>

<template>
  <div>
    <input v-model="content" />
    <div class="content-display">{{ content }}</div>
  </div>
</template>
```

### 动态计算布局

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const containerRef = ref(null)
const columns = ref(1)

onUpdated(() => {
  // 根据容器宽度动态计算列数
  const width = containerRef.value.offsetWidth
  columns.value = Math.floor(width / 200) || 1
})
</script>

<template>
  <div ref="containerRef" class="container">
    <div class="grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
      <div v-for="i in 10" :key="i" class="item">
        Item {{ i }}
      </div>
    </div>
  </div>
</template>
```

### 与 nextTick 配合

```vue
<script setup>
import { ref, onUpdated, nextTick } from 'vue'

const items = ref([])

onUpdated(async () => {
  // onUpdated 已经在 DOM 更新后执行
  // 但如果需要等待所有子组件更新，可以使用 nextTick
  await nextTick()
  console.log('所有 DOM 更新已完成')
})

function addItem() {
  items.value.push(Date.now())
}
</script>
```

### 防抖的更新处理

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const data = ref('')

let updateTimer = null

onUpdated(() => {
  // 防抖处理
  clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    console.log('DOM 更新完成，执行操作')
    saveToLocalStorage()
  }, 300)
})

function saveToLocalStorage() {
  localStorage.setItem('data', data.value)
}
</script>

<template>
  <textarea v-model="data"></textarea>
</template>
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
    increment() {
      this.count++
    }
  },
  updated() {
    console.log('组件已更新')
    console.log('count 的值:', this.count)
  }
}
```

### TypeScript 支持

```vue
<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const elementRef = ref<HTMLElement | null>(null)

onUpdated(() => {
  if (elementRef.value) {
    const height = elementRef.value.offsetHeight
    console.log('元素高度:', height)
  }
})
</script>
```

## 注意事项

### 1. 执行时机

```javascript
import { ref, onUpdated, onBeforeUpdate } from 'vue'

const count = ref(0)

// 数据变化
count.value = 1
↓
// onBeforeUpdate 执行
onBeforeUpdate(() => {
  console.log('DOM 即将更新')
})
↓
// DOM 更新
↓
// onUpdated 执行
onUpdated(() => {
  console.log('DOM 已更新')
})
```

### 2. 不要在 onUpdated 中修改响应式状态

```javascript
// ❌ 错误：可能导致无限更新循环
const count = ref(0)

onUpdated(() => {
  count.value++ // 修改状态会再次触发更新
})

// ✅ 正确：使用条件避免
const count = ref(0)
const maxCount = 10

onUpdated(() => {
  if (count.value < maxCount) {
    count.value++
  }
})

// ✅ 或者使用 watch
watch(count, () => {
  // 处理逻辑
})
```

### 3. 与 watchEffect/watchPostEffect 的区别

```javascript
// onUpdated: 每次组件更新时都会执行
onUpdated(() => {
  console.log('组件更新了')
})

// watch: 只在侦听的数据变化时执行
watch(someData, () => {
  console.log('someData 变化了')
})

// watchPostEffect: 依赖变化时执行，且在 DOM 更新后
watchPostEffect(() => {
  console.log('依赖变化且 DOM 已更新')
})
```

### 4. 性能考虑

```javascript
// ⚠️ 频繁更新时 onUpdated 会频繁调用
const list = ref([])

onUpdated(() => {
  // 每次 list 变化都会执行
  // 如果有大量数据可能导致性能问题
  list.value.forEach(/* 昂贵的操作 */)
})

// ✅ 考虑使用 watch 进行防抖或节流
watch(list, debounce((newList) => {
  newList.forEach(/* 操作 */)
}, 300))
```

### 5. 父子组件更新顺序

```vue
<!-- 父组件 -->
<script setup>
import { onUpdated } from 'vue'
import Child from './Child.vue'

onUpdated(() => {
  console.log('父组件更新')
})
</script>

<template>
  <Child />
</template>

<!-- 子组件 Child.vue -->
<script setup>
import { onUpdated } from 'vue'

onUpdated(() => {
  console.log('子组件更新')
})
</script>

// 输出顺序：
// 1. 子组件更新
// 2. 父组件更新
```

### 6. 与 keep-alive 的关系

```vue
<!-- 使用 keep-alive 时 -->
<script setup>
import { ref, onUpdated, onActivated } from 'vue'

const data = ref('')

// onUpdated 在组件更新时执行
onUpdated(() => {
  console.log('组件内容更新')
})

// onActivated 在组件激活时执行
onActivated(() => {
  console.log('组件被激活')
})
</script>
```

### 7. SSR 注意事项

```javascript
// ⚠️ onUpdated 只在客户端执行
onUpdated(() => {
  // 这个代码不会在服务器端执行
})

// 服务端渲染时不会调用 onUpdated
```

### 8. 访问 DOM 的正确方式

```vue
<script setup>
import { ref, onUpdated, watchPostEffect } from 'vue'

const elementRef = ref(null)

// ✅ 方式1: 使用 onUpdated
onUpdated(() => {
  console.log(elementRef.value?.offsetHeight)
})

// ✅ 方式2: 使用 watchPostEffect（更推荐）
watchPostEffect(() => {
  console.log(elementRef.value?.offsetHeight)
})
</script>
```

### 9. 更新次数追踪

```javascript
import { ref, onUpdated } from 'vue'

const updateCount = ref(0)

onUpdated(() => {
  updateCount.value++
  console.log('更新次数:', updateCount.value)
})
```

### 10. 条件渲染的处理

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const show = ref(true)
const content = ref('')

onUpdated(() => {
  // 注意：如果 v-if="false"，元素不在 DOM 中
  const element = document.querySelector('.conditional')
  console.log('元素存在:', !!element)
})
</script>

<template>
  <div>
    <button @click="show = !show">切换显示</button>
    <div v-if="show" class="conditional">
      {{ content }}
    </div>
  </div>
</template>
```

## 使用场景

### 1. 自动滚动到底部

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const messages = ref([])
const containerRef = ref(null)

onUpdated(() => {
  // 每次消息更新后自动滚动到底部
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
  <button @click="addMessage('新消息')">添加消息</button>
</template>

<style>
.message-container {
  height: 300px;
  overflow-y: auto;
}
</style>
```

### 2. 动态高度调整

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const items = ref([])
const wrapperRef = ref(null)

onUpdated(() => {
  // 根据内容动态调整高度
  if (wrapperRef.value) {
    const contentHeight = wrapperRef.value.scrollHeight
    if (contentHeight > 300) {
      wrapperRef.value.style.height = '300px'
      wrapperRef.value.style.overflowY = 'auto'
    }
  }
})
</script>

<template>
  <div ref="wrapperRef" class="dynamic-wrapper">
    <div v-for="(item, index) in items" :key="index">
      {{ item }}
    </div>
  </div>
</template>
```

### 3. 图片懒加载检测

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const images = ref([])

onUpdated(() => {
  // 检查图片是否进入视口
  const imageElements = document.querySelectorAll('.lazy-image')

  imageElements.forEach(img => {
    const rect = img.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      img.src = img.dataset.src
      img.classList.remove('lazy-image')
    }
  })
})

function loadMoreImages() {
  images.value.push(/* 更多图片 */)
}
</script>

<template>
  <div>
    <button @click="loadMoreImages">加载更多</button>
    <img
      v-for="(img, index) in images"
      :key="index"
      :data-src="img.url"
      class="lazy-image"
    />
  </div>
</template>
```

### 4. 自定义滚动条更新

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const content = ref('')

onUpdated(() => {
  // 更新自定义滚动条
  updateCustomScrollbar()
})

function updateCustomScrollbar() {
  const container = document.querySelector('.scroll-container')
  if (container) {
    const percentage = container.scrollTop /
                      (container.scrollHeight - container.clientHeight)
    updateScrollbarThumb(percentage)
  }
}
</script>

<template>
  <div class="scroll-container" @scroll="onUpdated">
    {{ content }}
  </div>
</template>
```

### 5. 文本区域自适应高度

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const text = ref('')
const textareaRef = ref(null)

onUpdated(() => {
  if (textareaRef.value) {
    // 自动调整高度
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
})
</script>

<template>
  <textarea
    ref="textareaRef"
    v-model="text"
    placeholder="输入内容..."
    class="auto-resize"
  ></textarea>
</template>

<style>
.auto-resize {
  min-height: 50px;
  overflow: hidden;
}
</style>
```

### 6. 拖拽后更新位置

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const position = ref({ x: 0, y: 0 })
const elementRef = ref(null)

onUpdated(() => {
  // 确保位置正确应用
  if (elementRef.value) {
    elementRef.value.style.transform = `translate(${position.value.x}px, ${position.value.y}px)`
  }
})

function onDrag(newX, newY) {
  position.value = { x: newX, y: newY }
}
</script>

<template>
  <div ref="elementRef" class="draggable" @mousedown="startDrag">
    拖拽我
  </div>
</template>
```

### 7. 高亮代码更新

```vue
<script setup>
import { ref, onUpdated, nextTick } from 'vue'
import hljs from 'highlight.js'

const code = ref('')

onUpdated(async () => {
  await nextTick()
  // 重新高亮代码
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block)
  })
})
</script>

<template>
  <div>
    <textarea v-model="code"></textarea>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>
```

### 8. 数据变化后重新计算布局

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const nodes = ref([
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 100, y: 50 }
])

onUpdated(() => {
  // 重新计算节点连接线
  drawConnections()
})

function drawConnections() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < nodes.value.length - 1; i++) {
    const from = nodes.value[i]
    const to = nodes.value[i + 1]
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }
}
</script>

<template>
  <div>
    <canvas></canvas>
    <div v-for="node in nodes" :key="node.id" :style="{ left: node.x + 'px', top: node.y + 'px' }">
      节点 {{ node.id }}
    </div>
  </div>
</template>
```

### 9. 表格列宽自动调整

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const columns = ref(['Name', 'Age', 'Email'])
const data = ref([
  { name: 'Alice', age: 25, email: 'alice@example.com' },
  { name: 'Bob', age: 30, email: 'bob@example.com' }
])

onUpdated(() => {
  // 自动调整列宽以适应内容
  autoResizeColumns()
})

function autoResizeColumns() {
  const headers = document.querySelectorAll('th')
  headers.forEach((th, index) => {
    const maxWidth = Math.max(
      th.offsetWidth,
      ...document.querySelectorAll(`td:nth-child(${index + 1})`)
        .map(td => td.offsetWidth)
    )
    th.style.width = maxWidth + 'px'
  })
}
</script>
```

### 10. 虚拟滚动更新

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const items = ref(Array.from({ length: 1000 }, (_, i) => i))
const scrollTop = ref(0)
const itemHeight = 50
const visibleCount = 10

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  return items.value.slice(start, start + visibleCount)
})

onUpdated(() => {
  // 更新滚动位置
  const container = document.querySelector('.virtual-scroll')
  if (container) {
    scrollTop.value = container.scrollTop
  }
})
</script>

<template>
  <div class="virtual-scroll" @scroll="scrollTop = $event.target.scrollTop">
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item"
        :style="{ transform: `translateY(${items.indexOf(item) * itemHeight}px)` }"
      >
        Item {{ item }}
      </div>
    </div>
  </div>
</template>
```

## 生命周期对比

| 钩子 | 执行时机 | 使用场景 |
|-----|----------|----------|
| onBeforeMount | 组件挂载前 | 很少使用 |
| onMounted | 组件挂载后 | 初始化、DOM 操作 |
| onBeforeUpdate | DOM 更新前 | 保存更新前状态 |
| onUpdated | DOM 更新后 | 依赖新 DOM 的操作 |
| onBeforeUnmount | 组件卸载前 | 清理工作 |
| onUnmounted | 组件卸载后 | 最后的清理 |

## 最佳实践

1. **谨慎使用**：大多数情况下 watch 或 computed 更合适
2. **避免副作用**：不要在 onUpdated 中修改响应式状态
3. **性能考虑**：频繁更新的组件要小心性能问题
4. **使用 nextTick**：需要确保所有子组件都更新时使用 nextTick
5. **考虑 watchPostEffect**：更精确的依赖追踪
