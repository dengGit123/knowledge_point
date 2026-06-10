# useTemplateRef

> 📖 [官方文档 - useTemplateRef](https://cn.vuejs.org/api/composition-api-helpers#usetemplateref)

### 一、概述

`useTemplateRef` 是 Vue 3.5+ 新增的组合式 API，专门用于在 `<script setup>` 中通过**字符串键名**获取模板中的 DOM 元素或子组件实例的引用。

在 Vue 3.5 之前，获取模板引用的传统做法是声明一个 `ref()` 变量，并让模板中的 `ref` attribute 与之同名，Vue 会自动将 DOM 元素或组件实例绑定到该变量上。但这种方式存在一个语义上的**歧义问题**——`ref()` 既可以声明响应式数据，也可以声明模板引用，开发者无法从代码中直观区分两者的用途。`useTemplateRef` 的出现正是为了解决这一问题，它提供了**显式的、语义明确的**模板引用声明方式，同时带来了更好的 TypeScript 类型推断支持。

简单来说，`useTemplateRef` 就是告诉 Vue："请帮我找到模板中 `ref` 属性等于这个名字的那个元素"。

---

### 二、核心原理

`useTemplateRef` 的底层工作机制如下：

1. **字符串键绑定**：`useTemplateRef('myInput')` 接收一个字符串参数，这个字符串与模板中 `ref="myInput"` 的值一一对应
2. **ShallowRef 包装**：内部通过 `shallowRef()` 创建一个浅层响应式引用，初始值为 `null`
3. **自动同步**：Vue 在组件的模板渲染过程中，会自动将对应的 DOM 元素或组件实例赋值给这个 ref 的 `.value`
4. **生命周期绑定**：在 `onMounted` 之前，ref 的 `.value` 为 `null`；挂载完成后才可访问到真实的 DOM 元素或组件实例
5. **更新同步**：当模板重新渲染导致引用的元素发生变化时，ref 的 `.value` 会自动更新

```
模板中 ref="inputEl"  <------字符串匹配------>  useTemplateRef('inputEl')
          |                                              |
    DOM 元素 / 组件实例  --------自动赋值-------->  shallowRef.value
```

---

### 三、详细用法

#### 1. 基本用法

**获取原生 DOM 元素引用**

```vue
<template>
  <input ref="inputEl" type="text" placeholder="请输入内容" />
  <button @click="handleFocus">聚焦输入框</button>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

// 传入的字符串 'inputEl' 与模板中 ref="inputEl" 对应
const inputEl = useTemplateRef<HTMLInputElement>('inputEl')

function handleFocus() {
  // 挂载前 inputEl.value 为 null，使用可选链确保安全
  inputEl.value?.focus()
}
</script>
```

**等价的传统写法对比**

```vue
<!-- ❌ Vue 3.5 之前：使用 ref()，语义不明确 -->
<template>
  <input ref="inputEl" type="text" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ref(null) 既可能是响应式数据，也可能是模板引用，无法直观区分
const inputEl = ref<HTMLInputElement | null>(null)
</script>

<!-- ✅ Vue 3.5+：使用 useTemplateRef，语义清晰 -->
<template>
  <input ref="inputEl" type="text" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

// 一眼就能看出这是模板引用
const inputEl = useTemplateRef<HTMLInputElement>('inputEl')
</script>
```

**访问子组件实例**

```vue
<template>
  <ChildComponent ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 通过 InstanceType<typeof ChildComponent> 获取子组件实例类型
const childRef = useTemplateRef<InstanceType<typeof ChildComponent>>('childRef')

function callChildMethod() {
  // 可以访问子组件通过 defineExpose 暴露的属性和方法
  childRef.value?.someMethod()
  console.log(childRef.value?.someData)
}
</script>
```

#### 2. 进阶用法

**结合 `onMounted` 确保引用可用**

```vue
<template>
  <canvas ref="canvasEl" width="400" height="300"></canvas>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

const canvasEl = useTemplateRef<HTMLCanvasElement>('canvasEl')

onMounted(() => {
  // ✅ 在 onMounted 回调中，DOM 已经渲染完成，可以安全操作
  const ctx = canvasEl.value?.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#42b883'
    ctx.fillRect(10, 10, 100, 100)
  }
})

// ❌ 错误：在 setup 同步代码中访问，此时 DOM 尚未挂载
// console.log(canvasEl.value) // null
</script>
```

**结合 `watch` 监听引用变化**

```vue
<template>
  <div ref="containerEl" class="container"></div>
  <button @click="toggle">切换显示</button>
</template>

<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'

const containerEl = useTemplateRef<HTMLDivElement>('containerEl')

// 监听模板引用的变化（元素被创建或销毁时触发）
watch(containerEl, (newEl) => {
  if (newEl) {
    console.log('元素已挂载:', newEl)
    newEl.style.backgroundColor = '#42b883'
  } else {
    console.log('元素已卸载')
  }
})
</script>
```

**结合 `nextTick` 在数据更新后操作 DOM**

```vue
<template>
  <ul ref="listEl">
    <li v-for="item in items" :key="item.id">{{ item.text }}</li>
  </ul>
  <button @click="addItem">添加项</button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, nextTick } from 'vue'

const items = ref<{ id: number; text: string }[]>([
  { id: 1, text: '第一项' }
])
const listEl = useTemplateRef<HTMLUListElement>('listEl')

async function addItem() {
  items.value.push({ id: Date.now(), text: `新项 ${items.value.length + 1}` })

  // ✅ 等待 DOM 更新完成后再操作
  await nextTick()
  listEl.value?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
}
</script>
```

**结合函数 ref 处理 v-for 列表**

```vue
<template>
  <div v-for="item in items" :key="item.id" :ref="setItemRef">
    {{ item.name }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Item {
  id: number
  name: string
}

const items = ref<Item[]>([
  { id: 1, name: '项目一' },
  { id: 2, name: '项目二' },
  { id: 3, name: '项目三' }
])

// v-for 中使用函数 ref 收集所有元素引用
const itemRefs = ref<Map<number, HTMLDivElement>>(new Map())

function setItemRef(el: any) {
  if (el) {
    // 通过 DOM 操作或其他方式建立映射关系
    itemRefs.value.set(itemRefs.value.size, el)
  }
}

onMounted(() => {
  console.log('所有列表项元素:', itemRefs.value)
})
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 是 | 模板中 `ref` attribute 的名称，必须与模板中的值完全一致 |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| 返回值 | `ShallowRef<T | null>` | 返回一个只读的浅层 ref，其 `.value` 在挂载前为 `null`，挂载后为对应的 DOM 元素或组件实例 |

> 💡 **提示：** `useTemplateRef` 返回的 ref 是**只读的**（readonly），你不应该手动修改它的 `.value`，Vue 会在内部自动管理。

---

### 四、实现效果

使用 `useTemplateRef` 后可以实现以下效果：

```vue
<template>
  <div>
    <input ref="searchInput" type="text" placeholder="搜索..." />
    <button @click="focusInput">聚焦搜索框</button>
    <button @click="clearInput">清空内容</button>
    <button @click="getValue">获取值</button>
    <p>当前值：{{ inputValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from 'vue'

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const inputValue = ref('')

// ✅ 效果1：组件挂载后自动聚焦
onMounted(() => {
  searchInput.value?.focus()
  console.log('输入框元素:', searchInput.value) // <input> DOM 元素
})

// ✅ 效果2：聚焦输入框
function focusInput() {
  searchInput.value?.focus()
}

// ✅ 效果3：清空输入框内容
function clearInput() {
  if (searchInput.value) {
    searchInput.value.value = ''
    inputValue.value = ''
  }
}

// ✅ 效果4：获取输入框的值
function getValue() {
  if (searchInput.value) {
    inputValue.value = searchInput.value.value
    console.log('输入框的值:', searchInput.value.value)
  }
}
</script>
```

---

### 五、使用场景

#### 场景 1：表单输入框自动聚焦

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input ref="usernameInput" v-model="username" type="text" placeholder="用户名" />
    <input ref="passwordInput" v-model="password" type="password" placeholder="密码" />
    <button type="submit">登录</button>
  </form>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from 'vue'

const username = ref('')
const password = ref('')
const usernameInput = useTemplateRef<HTMLInputElement>('usernameInput')
const passwordInput = useTemplateRef<HTMLInputElement>('passwordInput')

// 页面加载后自动聚焦用户名输入框
onMounted(() => {
  usernameInput.value?.focus()
})

async function handleSubmit() {
  if (!username.value) {
    // 用户名为空时聚焦到用户名输入框
    usernameInput.value?.focus()
    return
  }
  if (!password.value) {
    // 密码为空时聚焦到密码输入框
    passwordInput.value?.focus()
    return
  }
  // 提交逻辑...
}
</script>
```

#### 场景 2：聊天窗口自动滚动到底部

```vue
<template>
  <div class="chat-window">
    <div class="messages" ref="messagesContainer">
      <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.type">
        {{ msg.content }}
      </div>
    </div>
    <div ref="bottomAnchor"></div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="输入消息..." />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, nextTick } from 'vue'

interface Message {
  id: number
  content: string
  type: 'sent' | 'received'
}

const messages = ref<Message[]>([])
const newMessage = ref('')
const bottomAnchor = useTemplateRef<HTMLDivElement>('bottomAnchor')

async function sendMessage() {
  if (!newMessage.value.trim()) return

  messages.value.push({
    id: Date.now(),
    content: newMessage.value,
    type: 'sent'
  })
  newMessage.value = ''

  // 等待 DOM 更新后滚动到底部
  await nextTick()
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
```

#### 场景 3：Canvas 画板绑定

```vue
<template>
  <div class="canvas-container">
    <canvas
      ref="canvasEl"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
    ></canvas>
    <div class="toolbar">
      <button @click="clearCanvas">清空画布</button>
      <button @click="changeColor('#42b883')">绿色</button>
      <button @click="changeColor('#35495e')">深色</button>
      <button @click="changeColor('#ff0000')">红色</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'

const canvasEl = useTemplateRef<HTMLCanvasElement>('canvasEl')
const isDrawing = ref(false)
const currentColor = ref('#42b883')

let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  if (!canvasEl.value) return
  ctx = canvasEl.value.getContext('2d')
  if (ctx) {
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = currentColor.value
  }
})

function startDrawing(e: MouseEvent) {
  isDrawing.value = true
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(e.offsetX, e.offsetY)
  }
}

function draw(e: MouseEvent) {
  if (!isDrawing.value || !ctx) return
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke()
}

function stopDrawing() {
  isDrawing.value = false
}

function clearCanvas() {
  if (canvasEl.value && ctx) {
    ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
  }
}

function changeColor(color: string) {
  currentColor.value = color
  if (ctx) {
    ctx.strokeStyle = color
  }
}
</script>
```

#### 场景 4：视频播放器控制

```vue
<template>
  <div class="video-player">
    <video ref="videoEl" :src="videoSrc" @timeupdate="onTimeUpdate"></video>
    <div class="controls">
      <button @click="togglePlay">{{ isPlaying ? '暂停' : '播放' }}</button>
      <button @click="restart">重新播放</button>
      <input
        type="range"
        :value="currentTime"
        :max="duration"
        @input="seek($event)"
      />
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const videoSrc = ref('/video.mp4')
const videoEl = useTemplateRef<HTMLVideoElement>('videoEl')
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

function togglePlay() {
  if (!videoEl.value) return
  if (isPlaying.value) {
    videoEl.value.pause()
  } else {
    videoEl.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function restart() {
  if (videoEl.value) {
    videoEl.value.currentTime = 0
    videoEl.value.play()
    isPlaying.value = true
  }
}

function onTimeUpdate() {
  if (videoEl.value) {
    currentTime.value = videoEl.value.currentTime
  }
}

function seek(e: Event) {
  const target = e.target as HTMLInputElement
  if (videoEl.value) {
    videoEl.value.currentTime = Number(target.value)
  }
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
</script>
```

#### 场景 5：弹窗组件外部点击关闭

```vue
<template>
  <div v-if="visible" ref="modalEl" class="modal" @click.self="handleOutsideClick">
    <div class="modal-content">
      <h3>弹窗标题</h3>
      <p>弹窗内容</p>
      <button @click="close">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const modalEl = useTemplateRef<HTMLDivElement>('modalEl')

function handleOutsideClick(e: MouseEvent) {
  // 点击遮罩层（非内容区域）时关闭
  if (e.target === modalEl.value) {
    close()
  }
}

function close() {
  emit('update:visible', false)
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>
```

#### 场景 6：拖拽排序

```vue
<template>
  <div class="drag-container">
    <div
      v-for="(item, index) in list"
      :key="item.id"
      :ref="(el) => setItemRef(el as HTMLDivElement, index)"
      class="drag-item"
      draggable="true"
      @dragstart="onDragStart(index, $event)"
      @dragover.prevent="onDragOver(index)"
      @drop="onDrop(index)"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DragItem {
  id: number
  text: string
}

const list = ref<DragItem[]>([
  { id: 1, text: '可拖拽项 A' },
  { id: 2, text: '可拖拽项 B' },
  { id: 3, text: '可拖拽项 C' }
])

const itemRefs = new Map<number, HTMLDivElement>()
let dragIndex = -1

function setItemRef(el: HTMLDivElement | null, index: number) {
  if (el) {
    itemRefs.set(index, el)
  }
}

function onDragStart(index: number, e: DragEvent) {
  dragIndex = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(index: number) {
  const el = itemRefs.get(index)
  if (el) {
    el.style.borderTop = '2px solid #42b883'
  }
}

function onDrop(index: number) {
  if (dragIndex === -1) return
  const item = list.value.splice(dragIndex, 1)[0]
  list.value.splice(index, 0, item)
  dragIndex = -1
}
</script>
```

#### 场景 7：获取元素尺寸实现自适应布局

```vue
<template>
  <div ref="containerEl" class="responsive-container">
    <p>容器宽度：{{ containerWidth }}px</p>
    <p>容器高度：{{ containerHeight }}px</p>
    <div :class="layoutClass">
      <div class="sidebar" v-if="containerWidth > 768">侧边栏</div>
      <div class="main">主内容区</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, onMounted, onUnmounted } from 'vue'

const containerEl = useTemplateRef<HTMLDivElement>('containerEl')
const containerWidth = ref(0)
const containerHeight = ref(0)

const layoutClass = computed(() => ({
  'layout-row': containerWidth.value > 768,
  'layout-column': containerWidth.value <= 768
}))

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!containerEl.value) return

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerWidth.value = entry.contentRect.width
      containerHeight.value = entry.contentRect.height
    }
  })
  resizeObserver.observe(containerEl.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.layout-row {
  display: flex;
  flex-direction: row;
}
.layout-column {
  display: flex;
  flex-direction: column;
}
</style>
```

#### 场景 8：集成第三方库（ECharts 图表）

```vue
<template>
  <div class="chart-wrapper">
    <div ref="chartEl" class="chart"></div>
    <button @click="refreshChart">刷新数据</button>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartEl = useTemplateRef<HTMLDivElement>('chartEl')
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  if (!chartEl.value) return

  // 初始化 ECharts 实例，需要传入真实的 DOM 元素
  chartInstance = echarts.init(chartEl.value)
  chartInstance.setOption({
    title: { text: '示例图表' },
    xAxis: { data: ['A', 'B', 'C', 'D'] },
    yAxis: {},
    series: [{ type: 'bar', data: [10, 22, 35, 18] }]
  })

  // 监听窗口变化，自适应图表尺寸
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  chartInstance?.resize()
}

function refreshChart() {
  chartInstance?.setOption({
    series: [{
      data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100))
    }]
  })
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
```

#### 场景 9：文件上传拖拽区域

```vue
<template>
  <div
    ref="dropZoneEl"
    class="drop-zone"
    :class="{ 'drag-over': isDragOver }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <p v-if="!isDragOver">将文件拖拽到此处上传</p>
    <p v-else>松开鼠标以上传文件</p>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const dropZoneEl = useTemplateRef<HTMLDivElement>('dropZoneEl')
const isDragOver = ref(false)
const files = ref<File[]>([])

function onDragEnter() {
  isDragOver.value = true
}

function onDragLeave(e: DragEvent) {
  // 检查是否真的离开了拖拽区域（避免子元素触发误判）
  if (e.relatedTarget && dropZoneEl.value?.contains(e.relatedTarget as Node)) {
    return
  }
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles) {
    files.value = Array.from(droppedFiles)
    console.log('上传的文件:', files.value.map(f => f.name))
  }
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
}
.drag-over {
  border-color: #42b883;
  background-color: rgba(66, 184, 131, 0.1);
}
</style>
```

#### 场景 10：IntersectionObserver 实现懒加载

```vue
<template>
  <div class="scroll-container">
    <div v-for="item in items" :key="item.id" class="card">
      <img
        :ref="(el) => setImgRef(el as HTMLImageElement, item.id)"
        :data-src="item.imageUrl"
        alt="懒加载图片"
        class="lazy-img"
      />
    </div>
    <div ref="sentinelEl" class="sentinel">加载更多...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'

interface ImageItem {
  id: number
  imageUrl: string
}

const items = ref<ImageItem[]>(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    imageUrl: `https://picsum.photos/300/200?random=${i + 1}`
  }))
)

const sentinelEl = useTemplateRef<HTMLDivElement>('sentinelEl')
const imgRefs = new Map<number, HTMLImageElement>()

function setImgRef(el: HTMLImageElement | null, id: number) {
  if (el) imgRefs.set(id, el)
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  // 监听哨兵元素实现无限滚动
  if (sentinelEl.value) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // 哨兵进入视口，加载更多数据
        loadMore()
      }
    })
    observer.observe(sentinelEl.value)
  }

  // 图片懒加载
  imgRefs.forEach((img) => {
    const imgObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const src = img.dataset.src
        if (src) img.src = src
        imgObserver.unobserve(img)
      }
    })
    imgObserver.observe(img)
  })
})

function loadMore() {
  const newItems = Array.from({ length: 10 }, (_, i) => ({
    id: items.value.length + i + 1,
    imageUrl: `https://picsum.photos/300/200?random=${items.value.length + i + 1}`
  }))
  items.value.push(...newItems)
}

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.lazy-img {
  width: 300px;
  height: 200px;
  background-color: #f0f0f0;
}
.sentinel {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
```

---

### 六、注意事项

#### 1. 版本要求

`useTemplateRef` 仅在 **Vue 3.5 及以上版本**中可用。如果项目使用的是 Vue 3.4 或更低版本，需要继续使用传统的 `ref()` 方式获取模板引用。

```ts
// ❌ Vue 3.4 及以下版本无法使用
import { useTemplateRef } from 'vue' // 报错：useTemplateRef is not exported

// ✅ 传统方式仍然可用
import { ref } from 'vue'
const el = ref<HTMLInputElement | null>(null)
```

#### 2. 挂载前值为 null

在组件挂载完成（`onMounted` 触发）之前，`useTemplateRef` 返回的 ref 的 `.value` 始终为 `null`，不能在 `setup()` 的同步代码中直接访问 DOM。

```ts
const inputEl = useTemplateRef<HTMLInputElement>('inputEl')

// ❌ 此时 DOM 还未渲染，value 为 null
console.log(inputEl.value) // null

onMounted(() => {
  // ✅ 此时 DOM 已渲染，可以安全访问
  console.log(inputEl.value) // <input> 元素
})
```

#### 3. 字符串键名必须完全匹配

`useTemplateRef('xxx')` 的参数必须与模板中 `ref="xxx"` 的值**完全一致**，包括大小写。

```vue
<!-- ❌ 名称不匹配 -->
<template>
  <input ref="myInput" type="text" />
</template>
<script setup>
const inputEl = useTemplateRef('myinput') // 大小写不一致，无法匹配
</script>

<!-- ✅ 名称完全匹配 -->
<template>
  <input ref="myInput" type="text" />
</template>
<script setup>
const inputEl = useTemplateRef('myInput') // 完全一致
</script>
```

#### 4. 始终使用可选链操作符

由于 `useTemplateRef` 返回的值可能为 `null`，在访问属性或方法时应始终使用可选链操作符 `?.`，避免运行时错误。

```ts
const inputEl = useTemplateRef<HTMLInputElement>('inputEl')

// ❌ 未做空值检查，可能报错
inputEl.value.focus() // TypeError: Cannot read properties of null

// ✅ 使用可选链
inputEl.value?.focus()
```

#### 5. 返回的 ref 是只读的

`useTemplateRef` 返回的 ref 对象是**只读的**，不应该手动修改 `.value` 的值。Vue 内部会自动管理 ref 的赋值和更新。

```ts
const inputEl = useTemplateRef<HTMLInputElement>('inputEl')

// ❌ 不要手动赋值
inputEl.value = document.createElement('input')

// ✅ 让 Vue 自动管理
// 在模板渲染时，Vue 会自动将 DOM 元素赋值给 inputEl.value
```

#### 6. v-for 中需要使用函数 ref

当在 `v-for` 中获取多个元素引用时，不能直接使用 `useTemplateRef`，需要使用**函数 ref** 的方式手动收集。

```vue
<!-- ❌ v-for 中直接使用 ref 字符串只能获取最后一个元素 -->
<template>
  <div v-for="item in items" :key="item.id" ref="itemRef">{{ item.name }}</div>
</template>

<!-- ✅ 使用函数 ref 收集所有元素 -->
<template>
  <div v-for="item in items" :key="item.id" :ref="(el) => collectRef(el, item.id)">
    {{ item.name }}
  </div>
</template>
```

#### 7. 子组件需要 defineExpose 暴露接口

通过 `useTemplateRef` 获取子组件实例后，只能访问子组件通过 `defineExpose` 显式暴露的属性和方法，模板和 setup 中定义的其他内容对外不可见。

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
// ✅ 暴露给父组件的方法和数据
defineExpose({
  publicMethod() {
    console.log('父组件可以调用')
  },
  publicData: '父组件可以访问'
})

// ❌ 未暴露的内容，父组件无法访问
const privateData = '父组件无法访问'
</script>
```

#### 8. 条件渲染时注意 ref 的更新

当使用 `v-if` 条件渲染时，元素被移除后 ref 的 `.value` 会变为 `null`，重新创建后会重新赋值。使用 `watch` 可以监听这种变化。

```vue
<template>
  <div v-if="show" ref="targetEl">条件渲染的内容</div>
  <button @click="show = !show">切换</button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'

const show = ref(true)
const targetEl = useTemplateRef<HTMLDivElement>('targetEl')

// ✅ 使用 watch 监听条件渲染导致的 ref 变化
watch(targetEl, (el) => {
  if (el) {
    console.log('元素已挂载')
  } else {
    console.log('元素已卸载')
  }
})
</script>
```

#### 9. 组件卸载时清理资源

如果在 `useTemplateRef` 获取的 DOM 元素上注册了事件监听器或创建了第三方库实例，务必在 `onUnmounted` 中进行清理，避免内存泄漏。

```ts
const canvasEl = useTemplateRef<HTMLCanvasElement>('canvasEl')
let chartInstance: any = null

onMounted(() => {
  if (canvasEl.value) {
    chartInstance = createChart(canvasEl.value)
  }
})

// ✅ 在组件卸载时销毁实例
onUnmounted(() => {
  chartInstance?.destroy()
  chartInstance = null
})
```

#### 10. 动态组件切换时 ref 会变化

使用 `<component :is="...">` 动态组件时，`useTemplateRef` 获取的引用会在组件切换时自动更新为当前渲染的组件实例。

```vue
<template>
  <component :is="currentComponent" ref="dynamicRef" />
  <button @click="switchComponent">切换组件</button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import CompA from './CompA.vue'
import CompB from './CompB.vue'

const currentComponent = ref(CompA)
const dynamicRef = useTemplateRef('dynamicRef')

// ✅ 监听动态组件切换导致的 ref 变化
watch(dynamicRef, (instance) => {
  console.log('当前组件实例:', instance)
})

function switchComponent() {
  currentComponent.value = currentComponent.value === CompA ? CompB : CompA
}
</script>
```

> ⚠️ **注意：** `useTemplateRef` 只能在 `<script setup>` 或 `setup()` 函数中使用，不能在普通的生命周期钩子外部或其他非组件上下文中调用。

---

### 七、相关 API 对比

| 特性 | `useTemplateRef()` | `ref()`（传统模板引用） |
|------|---------------------|------------------------|
| **引入版本** | Vue 3.5+ | Vue 3.0+ |
| **语义清晰度** | ✅ 明确表示模板引用 | ❌ 与响应式数据混淆 |
| **声明方式** | `useTemplateRef('name')` | `ref(null)` |
| **键名匹配** | 需要字符串参数与模板 `ref` 匹配 | 变量名与模板 `ref` 匹配 |
| **TypeScript 支持** | ✅ 泛型参数直接推断 | ⚠️ 需要手动标注 `null` 联合类型 |
| **初始值** | 自动为 `null` | 手动设置 `ref(null)` |
| **可写性** | 只读 | 可写 |
| **适用场景** | 获取模板中的 DOM/组件引用 | 响应式数据 + 模板引用（通用） |

```ts
// 传统方式
const inputEl = ref<HTMLInputElement | null>(null) // 需要手动标注 null

// useTemplateRef 方式
const inputEl = useTemplateRef<HTMLInputElement>('inputEl') // 更简洁的类型标注
```

> 💡 **提示：** 对于新项目（Vue 3.5+），推荐优先使用 `useTemplateRef` 来获取模板引用，以获得更好的语义化和类型支持。`ref()` 则专注于声明响应式数据。

---

### 八、总结

`useTemplateRef` 是 Vue 3.5 引入的模板引用获取 API，具有以下核心优势：

1. **语义清晰**：函数名直接表达"获取模板引用"的意图，与响应式数据的 `ref()` 明确区分
2. **类型安全**：通过泛型参数可以精确标注 DOM 元素或组件实例类型，获得完整的 TypeScript 智能提示
3. **使用简单**：只需传入与模板 `ref` attribute 一致的字符串即可，无需手动初始化 `null`
4. **响应式更新**：当元素因条件渲染、动态组件等原因变化时，ref 会自动同步更新

在实际开发中，`useTemplateRef` 适用于需要直接操作 DOM 元素的场景（如聚焦、滚动、Canvas 绑定）以及需要访问子组件实例的场景（如调用子组件方法）。结合 `onMounted`、`nextTick`、`watch` 等API 使用，可以安全高效地管理模板引用的整个生命周期。
