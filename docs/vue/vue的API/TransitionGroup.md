### TransitionGroup

> 📖 [官方文档：TransitionGroup](https://cn.vuejs.org/api/built-in-components#transitiongroup)

### 一、概述

`<TransitionGroup>` 是 Vue 3 内置组件，专门用于为**列表中的多个元素或组件**同时添加进入、离开和移动的过渡动画效果。与 `<Transition>` 只处理单个元素不同，`<TransitionGroup>` 能够感知列表项的增删和位置变化，并自动为这些变化应用流畅的过渡动画。

简单来说：当你有一个动态增删的列表（如待办事项、购物车商品、通知消息），想要让新增的项"淡入"、删除的项"淡出"、剩余的项"平滑移动到新位置"，就需要 `<TransitionGroup>`。

### 二、核心原理

#### 1. 工作机制

`<TransitionGroup>` 的核心原理基于 **FLIP 动画技术**（First, Last, Invert, Play）：

1. **First**：记录元素变化前的位置和尺寸
2. **Last**：记录元素变化后的位置和尺寸
3. **Invert**：计算差值，将元素从最终位置反转回原始位置
4. **Play**：从反转位置动画到最终位置

#### 2. 与 `<Transition>` 的区别

| 特性 | `<Transition>` | `<TransitionGroup>` |
|------|---------------|---------------------|
| 适用场景 | 单个元素的显隐切换 | 列表中多个元素的增删移动 |
| 子元素数量 | 最多 1 个 | 可以多个 |
| 移动动画 | 不支持 | 支持（`.v-move` 类） |
| 渲染 DOM | 不插入额外 DOM 元素 | 默认不插入，通过 `tag` 可指定容器 |
| `mode` 属性 | 支持（`out-in` / `in-out`） | 不支持 |
| `key` 要求 | 不需要 | **必须有唯一的 `key`** |

#### 3. CSS 类名规则

当设置 `name="list"` 时，会应用以下 CSS 类名：

| 阶段 | 类名 | 说明 |
|------|------|------|
| 进入开始 | `list-enter-from` | 元素插入时的初始状态 |
| 进入生效 | `list-enter-active` | 整个进入过渡期间 |
| 进入结束 | `list-enter-to` | 元素插入后的最终状态 |
| 离开开始 | `list-leave-from` | 元素删除时的初始状态 |
| 离开生效 | `list-leave-active` | 整个离开过渡期间 |
| 离开结束 | `list-leave-to` | 元素删除后的最终状态 |
| 移动 | `list-move` | 元素位置变化时的过渡 |

> 💡 **提示：** 如果不设置 `name` 属性，默认类名前缀为 `v-`，即 `v-enter-from`、`v-leave-active` 等。

### 三、详细用法

#### 1. 基本用法

最简单的列表过渡——添加和删除项目时的淡入淡出效果：

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, text: '学习 Vue 3' },
  { id: 2, text: '编写文档' },
  { id: 3, text: '完成项目' }
])

let nextId = 4

// ✅ 添加新项目
const addItem = () => {
  items.value.push({
    id: nextId++,
    text: `新任务 ${nextId - 1}`
  })
}

// ✅ 删除项目
const removeItem = (id) => {
  const index = items.value.findIndex(item => item.id === id)
  if (index > -1) {
    items.value.splice(index, 1)
  }
}
</script>

<template>
  <div>
    <button @click="addItem">添加任务</button>
    <TransitionGroup name="fade" tag="ul" class="task-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="task-item"
        @click="removeItem(item.id)"
      >
        {{ item.text }}
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* 列表样式 */
.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  background: #42b883;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

/* 进入和离开过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

**实现效果：**
- 点击"添加任务"按钮，新任务从右侧 30px 处淡入滑出
- 点击某个任务，它会向右滑出并淡出消失

#### 2. 列表移动动画（Move Transition）

`<TransitionGroup>` 的核心优势——当列表项被删除时，剩余项自动平滑移动到新位置：

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: '苹果', price: 5 },
  { id: 2, name: '香蕉', price: 3 },
  { id: 3, name: '橙子', price: 4 },
  { id: 4, name: '草莓', price: 8 },
  { id: 5, name: '葡萄', price: 6 }
])

const removeItem = (id) => {
  items.value = items.value.filter(item => item.id !== id)
}
</script>

<template>
  <TransitionGroup name="list" tag="div" class="container">
    <div
      v-for="item in items"
      :key="item.id"
      class="item"
      @click="removeItem(item.id)"
    >
      {{ item.name }} - ¥{{ item.price }}
    </div>
  </TransitionGroup>
</template>

<style scoped>
.container {
  position: relative;
}

.item {
  padding: 10px 16px;
  margin-bottom: 4px;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  width: 200px;
}

/* ✅ 关键：进入、离开和移动都要有过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

/* ✅ 关键：移动过渡类 */
.list-move {
  transition: transform 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* ✅ 关键：离开的元素需要绝对定位，才能让移动动画生效 */
.list-leave-active {
  position: absolute;
}
</style>
```

**实现效果：**
- 点击某个水果，它向右滑出并消失
- 剩余的水果自动平滑上移到新位置（不是瞬间跳过去）

> ⚠️ **注意：** 要让移动动画生效，必须设置 `.v-leave-active { position: absolute }`，否则离开的元素仍然占据文档流，剩余元素不会产生位移效果。

#### 3. 自定义 CSS 类名

通过 `enter-active-class`、`leave-active-class` 等属性自定义类名，配合第三方动画库（如 Animate.css）：

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, text: 'Item A' },
  { id: 2, text: 'Item B' },
  { id: 3, text: 'Item C' }
])

const addItem = () => {
  items.value.push({ id: Date.now(), text: `Item ${items.value.length + 1}` })
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}
</script>

<template>
  <button @click="addItem">添加</button>
  <TransitionGroup
    tag="ul"
    enter-active-class="animate__animated animate__fadeInLeft"
    leave-active-class="animate__animated animate__fadeOutRight"
    move-class="animate__animated animate__fadeIn"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      @click="removeItem(index)"
    >
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>
```

#### 4. 使用 JavaScript 钩子

通过事件钩子实现更复杂的动画效果（如弹簧动画）：

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, text: '元素 1' },
  { id: 2, text: '元素 2' },
  { id: 3, text: '元素 3' }
])

// ✅ 进入动画 - 使用 Web Animations API
const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.height = 0
}

const onEnter = (el, done) => {
  // 获取元素的真实高度
  const height = el.scrollHeight
  el.animate([
    { opacity: 0, height: '0px', transform: 'translateY(-20px)' },
    { opacity: 1, height: `${height}px`, transform: 'translateY(0)' }
  ], {
    duration: 400,
    easing: 'ease-out'
  }).onfinish = done
}

// ✅ 离开动画
const onLeave = (el, done) => {
  el.animate([
    { opacity: 1, height: `${el.scrollHeight}px` },
    { opacity: 0, height: '0px', transform: 'translateX(50px)' }
  ], {
    duration: 300,
    easing: 'ease-in'
  }).onfinish = done
}

const addItem = () => {
  items.value.push({ id: Date.now(), text: `元素 ${items.value.length + 1}` })
}

const removeItem = (id) => {
  items.value = items.value.filter(item => item.id !== id)
}
</script>

<template>
  <button @click="addItem">添加元素</button>
  <TransitionGroup
    tag="div"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <div
      v-for="item in items"
      :key="item.id"
      class="item-box"
      @click="removeItem(item.id)"
    >
      {{ item.text }}
    </div>
  </TransitionGroup>
</template>

<style scoped>
.item-box {
  padding: 12px;
  margin-bottom: 8px;
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
  cursor: pointer;
  overflow: hidden;
}
</style>
```

#### 5. 指定渲染的容器标签

通过 `tag` 属性指定 `<TransitionGroup>` 渲染为的 HTML 标签：

```vue
<template>
  <!-- ✅ 渲染为 <ul>，适合列表场景 -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </TransitionGroup>

  <!-- ✅ 渲染为 <div> -->
  <TransitionGroup name="fade" tag="div" class="grid-container">
    <div v-for="item in items" :key="item.id" class="grid-item">
      {{ item.name }}
    </div>
  </TransitionGroup>

  <!-- ✅ 不设置 tag 则不渲染额外 DOM 元素（Vue 3 默认行为） -->
  <TransitionGroup name="fade">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </TransitionGroup>
</template>
```

### 四、API 参数

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tag` | `string` | `undefined` | 渲染为的容器标签，不设置则不渲染额外 DOM |
| `name` | `string` | `'v'` | 过渡类名前缀 |
| `css` | `boolean` | `true` | 是否使用 CSS 过渡类 |
| `duration` | `number \| { enter: number, leave: number }` | — | 显式指定过渡持续时间（毫秒） |
| `type` | `'transition' \| 'animation'` | — | 指定检测的过渡类型 |
| `mode` | — | — | **不支持**（与 `<Transition>` 的区别） |
| `appear` | `boolean` | `false` | 是否在初始渲染时应用过渡 |
| `persisted` | `boolean` | `false` | 是否通过 `v-show` 控制显隐 |

**事件钩子：**

| 事件 | 参数 | 说明 |
|------|------|------|
| `@before-enter` | `(el: Element)` | 进入动画开始前 |
| `@enter` | `(el: Element, done: Function)` | 进入动画开始 |
| `@after-enter` | `(el: Element)` | 进入动画结束后 |
| `@enter-cancelled` | `(el: Element)` | 进入动画被取消 |
| `@before-leave` | `(el: Element)` | 离开动画开始前 |
| `@leave` | `(el: Element, done: Function)` | 离开动画开始 |
| `@after-leave` | `(el: Element)` | 离开动画结束后 |
| `@leave-cancelled` | `(el: Element)` | 离开动画被取消 |
| `@before-move` | `(el: Element)` | 移动动画开始前 |
| `@move` | `(el: Element)` | 移动动画开始 |
| `@after-move` | `(el: Element)` | 移动动画结束后 |

### 五、实现效果

#### 效果一：淡入淡出列表

```vue
<script setup>
import { ref } from 'vue'

const notifications = ref([])

const addNotification = (type) => {
  const id = Date.now()
  notifications.value.push({
    id,
    message: `${type} 通知 #${id}`,
    type
  })
  // 3 秒后自动移除
  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }, 3000)
}
</script>

<template>
  <div>
    <button @click="addNotification('成功')">成功通知</button>
    <button @click="addNotification('警告')">警告通知</button>
    <button @click="addNotification('错误')">错误通知</button>

    <TransitionGroup name="notify" tag="div" class="notification-container">
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['notification', n.type]"
      >
        {{ n.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
}

.notification {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
}

.notification.成功 { background: #4caf50; }
.notification.警告 { background: #ff9800; }
.notification.错误 { background: #f44336; }

.notify-enter-active { transition: all 0.5s ease-out; }
.notify-leave-active { transition: all 0.3s ease-in; }
.notify-enter-from { opacity: 0; transform: translateX(100px); }
.notify-leave-to { opacity: 0; transform: translateX(100px); }
.notify-move { transition: transform 0.3s ease; }
.notify-leave-active { position: absolute; }
</style>
```

**实现效果：**
- 点击按钮后，通知从右侧滑入淡入，3 秒后自动向右滑出消失
- 上方的通知消失后，下方的通知平滑上移填补空位

#### 效果二：拖拽排序列表

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, text: '可拖拽项目 A' },
  { id: 2, text: '可拖拽项目 B' },
  { id: 3, text: '可拖拽项目 C' },
  { id: 4, text: '可拖拽项目 D' }
])

const dragIndex = ref(null)

const onDragStart = (index) => {
  dragIndex.value = index
}

const onDrop = (dropIndex) => {
  const dragIdx = dragIndex.value
  if (dragIdx === null || dragIdx === dropIndex) return

  const item = items.value.splice(dragIdx, 1)[0]
  items.value.splice(dropIndex, 0, item)
  dragIndex.value = null
}
</script>

<template>
  <TransitionGroup name="flip-list" tag="ul" class="drag-list">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="drag-item"
      draggable="true"
      @dragstart="onDragStart(index)"
      @dragover.prevent
      @drop="onDrop(index)"
    >
      ☰ {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<style scoped>
.drag-list { list-style: none; padding: 0; }

.drag-item {
  padding: 12px 16px;
  margin-bottom: 4px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
}

.drag-item:active { cursor: grabbing; }

/* FLIP 动画 */
.flip-list-move { transition: transform 0.4s ease; }
.flip-list-enter-active { transition: all 0.4s ease; }
.flip-list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}
.flip-list-enter-from,
.flip-list-leave-to {
  opacity: 0;
  background: #bbdefb;
}
</style>
```

**实现效果：**
- 拖拽列表项到新位置后，所有项通过平滑动画重新排列
- 使用了 HTML5 原生拖拽 API 配合 `<TransitionGroup>` 的移动动画

### 六、使用场景

#### 1. 待办事项列表

```vue
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: '学习 Vue 3 基础', done: false },
  { id: 2, text: '学习组合式 API', done: false },
  { id: 3, text: '学习 Pinia', done: true }
])

const newText = ref('')

const addTodo = () => {
  if (!newText.value.trim()) return
  todos.value.push({
    id: Date.now(),
    text: newText.value.trim(),
    done: false
  })
  newText.value = ''
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="todo-app">
    <div class="input-group">
      <input v-model="newText" @keyup.enter="addTodo" placeholder="输入待办事项..." />
      <button @click="addTodo">添加</button>
    </div>
    <TransitionGroup name="todo" tag="ul" class="todo-list">
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="{ done: todo.done }"
      >
        <input type="checkbox" v-model="todo.done" />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">×</button>
      </li>
    </TransitionGroup>
  </div>
</template>
```

#### 2. 购物车商品列表

```vue
<script setup>
import { ref, computed } from 'vue'

const cart = ref([
  { id: 1, name: 'Vue.js 实战', price: 89, quantity: 1 },
  { id: 2, name: 'TypeScript 入门', price: 69, quantity: 2 },
  { id: 3, name: 'Vite 构建工具', price: 59, quantity: 1 }
])

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const removeItem = (id) => {
  cart.value = cart.value.filter(item => item.id !== id)
}
</script>

<template>
  <div class="cart">
    <h3>购物车</h3>
    <TransitionGroup name="cart" tag="div" class="cart-list">
      <div v-for="item in cart" :key="item.id" class="cart-item">
        <span class="name">{{ item.name }}</span>
        <span class="price">¥{{ item.price }} × {{ item.quantity }}</span>
        <button @click="removeItem(item.id)">移除</button>
      </div>
    </TransitionGroup>
    <div class="total">合计：¥{{ totalPrice }}</div>
  </div>
</template>
```

#### 3. 通知消息系统

```vue
<script setup>
import { ref } from 'vue'

const messages = ref([])
let msgId = 0

const showMessage = (text, type = 'info') => {
  const id = ++msgId
  messages.value.push({ id, text, type })
  setTimeout(() => {
    messages.value = messages.value.filter(m => m.id !== id)
  }, 3000)
}
</script>

<template>
  <TransitionGroup name="msg" tag="div" class="msg-container">
    <div v-for="msg in messages" :key="msg.id" :class="['msg', msg.type]">
      {{ msg.text }}
    </div>
  </TransitionGroup>
</template>
```

#### 4. 图片/卡片画廊

```vue
<script setup>
import { ref } from 'vue'

const images = ref([
  { id: 1, url: '/img/a.jpg', title: '风景 A' },
  { id: 2, url: '/img/b.jpg', title: '风景 B' },
  { id: 3, url: '/img/c.jpg', title: '风景 C' },
  { id: 4, url: '/img/d.jpg', title: '风景 D' }
])

const filterByCategory = (category) => {
  // 过滤后列表自动产生移动动画
  images.value = images.value.filter(img => img.category !== category)
}
</script>

<template>
  <TransitionGroup name="gallery" tag="div" class="gallery-grid">
    <div v-for="img in images" :key="img.id" class="gallery-card">
      <img :src="img.url" :alt="img.title" />
      <p>{{ img.title }}</p>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.gallery-move { transition: transform 0.6s ease; }
.gallery-enter-active, .gallery-leave-active { transition: all 0.4s ease; }
.gallery-enter-from, .gallery-leave-to { opacity: 0; scale: 0.8; }
.gallery-leave-active { position: absolute; }
</style>
```

#### 5. 数据表格排序动画

```vue
<script setup>
import { ref, computed } from 'vue'

const sortKey = ref('id')
const sortOrder = ref('asc')

const data = ref([
  { id: 3, name: 'Charlie', score: 85 },
  { id: 1, name: 'Alice', score: 92 },
  { id: 2, name: 'Bob', score: 78 }
])

const sortedData = computed(() => {
  return [...data.value].sort((a, b) => {
    const modifier = sortOrder.value === 'asc' ? 1 : -1
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th @click="toggleSort('id')">ID {{ sortKey === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
        <th>姓名</th>
        <th @click="toggleSort('score')">分数 {{ sortKey === 'score' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
      </tr>
    </thead>
    <TransitionGroup name="table-row" tag="tbody">
      <tr v-for="row in sortedData" :key="row.id">
        <td>{{ row.id }}</td>
        <td>{{ row.name }}</td>
        <td>{{ row.score }}</td>
      </tr>
    </TransitionGroup>
  </table>
</template>

<style scoped>
.table-row-move { transition: transform 0.4s ease; }
</style>
```

#### 6. 标签页/标签管理器

```vue
<script setup>
import { ref } from 'vue'

const tags = ref(['Vue', 'React', 'Angular'])

const newTag = ref('')

const addTag = () => {
  const text = newTag.value.trim()
  if (text && !tags.value.includes(text)) {
    tags.value.push(text)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  tags.value = tags.value.filter(t => t !== tag)
}
</script>

<template>
  <div class="tag-manager">
    <TransitionGroup name="tag" tag="div" class="tag-list">
      <span v-for="tag in tags" :key="tag" class="tag">
        {{ tag }}
        <button class="remove-btn" @click="removeTag(tag)">×</button>
      </span>
    </TransitionGroup>
    <input v-model="newTag" @keyup.enter="addTag" placeholder="添加标签..." />
  </div>
</template>

<style scoped>
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #42b883;
  color: white;
  border-radius: 16px;
  font-size: 14px;
}
.remove-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0 2px;
}
.tag-enter-active, .tag-leave-active { transition: all 0.3s ease; }
.tag-enter-from, .tag-leave-to { opacity: 0; transform: scale(0.5); }
.tag-move { transition: transform 0.3s ease; }
.tag-leave-active { position: absolute; }
</style>
```

#### 7. 步骤/流程指示器

```vue
<script setup>
import { ref } from 'vue'

const steps = ref([
  { id: 1, label: '填写信息', status: 'done' },
  { id: 2, label: '验证邮箱', status: 'active' },
  { id: 3, label: '设置密码', status: 'pending' },
  { id: 4, label: '完成注册', status: 'pending' }
])

const addStep = () => {
  steps.value.push({
    id: Date.now(),
    label: `步骤 ${steps.value.length + 1}`,
    status: 'pending'
  })
}
</script>

<template>
  <TransitionGroup name="step" tag="div" class="steps">
    <div v-for="step in steps" :key="step.id" :class="['step', step.status]">
      <div class="step-dot"></div>
      <span>{{ step.label }}</span>
    </div>
  </TransitionGroup>
</template>
```

#### 8. 搜索结果过滤动画

```vue
<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const allItems = ref([
  { id: 1, name: 'JavaScript 高级编程' },
  { id: 2, name: 'Vue.js 设计与实现' },
  { id: 3, name: 'CSS 权威指南' },
  { id: 4, name: 'TypeScript 编程' },
  { id: 5, name: 'Node.js 实战' }
])

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return allItems.value
  return allItems.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索..." />
    <TransitionGroup name="search" tag="ul" class="search-results">
      <li v-for="item in filteredItems" :key="item.id">
        {{ item.name }}
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.search-move { transition: transform 0.4s ease; }
.search-enter-active, .search-leave-active { transition: all 0.3s ease; }
.search-enter-from, .search-leave-to { opacity: 0; }
.search-leave-active { position: absolute; }
</style>
```

### 七、注意事项

1. **必须设置唯一的 `key`**：`<TransitionGroup>` 内的每个子元素必须有唯一的 `key`，Vue 通过 `key` 追踪元素的身份。如果不设置或 `key` 不唯一，过渡动画将无法正确工作。
   ```vue
   <!-- ❌ 错误：使用 index 作为 key，删除中间项时动画异常 -->
   <TransitionGroup name="list" tag="ul">
     <li v-for="(item, index) in items" :key="index">{{ item }}</li>
   </TransitionGroup>

   <!-- ✅ 正确：使用唯一 id 作为 key -->
   <TransitionGroup name="list" tag="ul">
     <li v-for="item in items" :key="item.id">{{ item.name }}</li>
   </TransitionGroup>
   ```

2. **移动动画需要 `position: absolute`**：要让 `.v-move` 生效，离开的元素必须设置绝对定位，否则它会一直占据空间，其他元素不会移动。
   ```css
   .list-leave-active {
     position: absolute; /* ✅ 关键 */
   }
   ```

3. **不支持 `mode` 属性**：与 `<Transition>` 不同，`<TransitionGroup>` 没有 `mode` 属性，因为列表中可能同时有多个元素在进入和离开。

4. **默认不渲染容器元素**：在 Vue 3 中，如果不设置 `tag` 属性，`<TransitionGroup>` 不会渲染任何额外的 DOM 包裹元素（Vue 2 默认渲染 `<span>`）。

5. **`appear` 属性实现初始渲染动画**：默认情况下，`<TransitionGroup>` 不会在首次渲染时应用动画。如果需要初始渲染动画，设置 `appear` 属性：
   ```vue
   <TransitionGroup name="fade" tag="ul" appear>
     <li v-for="item in items" :key="item.id">{{ item }}</li>
   </TransitionGroup>
   ```

6. **性能考虑**：`<TransitionGroup>` 使用 FLIP 动画，会对每个子元素进行 DOM 读写的强制回流（reflow）。对于大型列表（>100 项），可能影响性能，建议使用虚拟滚动。

7. **子元素类型限制**：`<TransitionGroup>` 的直接子元素应该是普通的 HTML 元素或组件，不能是 `<template>` 标签（因为需要真实 DOM 来执行动画）。

8. **CSS 过渡类需要正确匹配**：类名前缀由 `name` 属性决定。设置 `name="list"` 时，类名为 `list-enter-from`、`list-leave-to`、`list-move` 等，不是 `v-enter-from`。

9. **与 `<Transition>` 配合使用**：如果需要在 `<TransitionGroup>` 的子元素上同时使用 `<Transition>`（如列表项自身的显隐动画），需要确保不冲突。

10. **`duration` 属性用于复杂动画**：当过渡效果涉及多个嵌套元素或 JavaScript 钩子时，Vue 可能无法自动检测过渡结束时间，此时可以通过 `duration` 显式指定：
    ```vue
    <TransitionGroup :duration="{ enter: 500, leave: 300 }" name="list" tag="ul">
      ...
    </TransitionGroup>
    ```

### 八、相关 API 对比

| 特性 | `<Transition>` | `<TransitionGroup>` |
|------|---------------|---------------------|
| 用途 | 单个元素/组件的显隐过渡 | 列表多项的增删移动过渡 |
| 子元素 | 最多 1 个 | 多个 |
| 移动动画 | ❌ 不支持 | ✅ 通过 FLIP 实现 |
| `mode` 属性 | ✅ `out-in` / `in-out` | ❌ 不支持 |
| `tag` 属性 | ❌ 不需要 | ✅ 可指定容器标签 |
| `key` 要求 | 不强制 | **必须有唯一 key** |
| 典型场景 | 弹窗显隐、路由切换 | 待办列表、购物车、通知 |

### 九、总结

- `<TransitionGroup>` 是 Vue 内置的列表过渡组件，专为多个元素的增删和移动场景设计
- 核心基于 FLIP 动画技术，自动计算元素位置变化并应用平滑过渡
- 每个子元素**必须**有唯一的 `key`
- 移动动画生效的关键：`.v-leave-active { position: absolute }` + `.v-move` 过渡类
- 不支持 `mode` 属性（与 `<Transition>` 的重要区别）
- 适用于待办列表、购物车、通知系统、标签管理、搜索过滤等动态列表场景
