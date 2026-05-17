# v-on

## 作用
`v-on` 用于绑定事件监听器。它可以监听 DOM 事件或自定义事件，并在触发时执行 JavaScript 表达式或函数。简写形式为 `@`。

## 用法

### 基本用法

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <!-- 完整语法 -->
  <button v-on:click="increment">增加</button>

  <!-- 简写语法（推荐） -->
  <button @click="increment">增加</button>

  <!-- 内联表达式 -->
  <button @click="count++">增加</button>
</template>
```

### 带参数的事件处理

```vue
<script setup>
function greet(name) {
  console.log('Hello, ' + name)
}

function say(message, event) {
  console.log(message)
  console.log(event) // 原生 DOM 事件
}
</script>

<template>
  <button @click="greet('Vue')">问候</button>

  <!-- 访问原生事件需要 $event -->
  <button @click="say('Hello', $event)">说你好</button>
</template>
```

### 多个事件处理

```vue
<script setup>
function handleClick() {
  console.log('Clicked')
}

function trackClick() {
  console.log('Tracking...')
}
</script>

<template>
  <!-- 多个处理函数 -->
  <button @click="handleClick(); trackClick()">
    Click
  </button>
</template>
```

### 事件修饰符

```vue
<script setup>
function onSubmit() {
  console.log('Form submitted')
}
</script>

<template>
  <!-- 阻止默认行为 -->
  <form @submit.prevent="onSubmit">
    <button type="submit">Submit</button>
  </form>

  <!-- 阻止事件冒泡 -->
  <div @click="handleParentClick">
    <button @click.stop="handleChildClick">
      Child Button
    </button>
  </div>

  <!-- 只触发一次 -->
  <button @click.once="handleClick">
    Click Once
  </button>

  <!-- 使用被动模式 -->
  <div @scroll.passive="onScroll">
    Long content...
  </div>

  <!-- 只有当事件是从元素本身触发时才触发 -->
  <div @click.self="handleDivClick">
    <button>Button</button>
  </div>

  <!-- 按键修饰符 -->
  <input @keyup.enter="submit" />

  <!-- 系统修饰键组合 -->
  <input @keyup.ctrl.enter="submit" />

  <!-- 鼠标按钮修饰符 -->
  <div @mousedown.left="handleLeftClick">
    Left click only
  </div>
</template>
```

### 按键修饰符

```vue
<script setup>
function onEnter() {
  console.log('Enter pressed')
}

function onEscape() {
  console.log('Escape pressed')
}
</script>

<template>
  <!-- 常用按键别名 -->
  <input @keyup.enter="onEnter" />
  <input @keyup.tab="onTab" />
  <input @keyup.delete="onDelete" />
  <input @keyup.esc="onEscape" />
  <input @keyup.space="onSpace" />
  <input @keyup.up="onUp" />
  <input @keyup.down="onDown" />
  <input @keyup.left="onLeft" />
  <input @keyup.right="onRight" />

  <!-- 自定义按键修饰符 -->
  <input @keyup.page-down="onPageDown" />
  <input @keyup.page-up="onPageUp" />

  <!-- 任意按键 -->
  <input @keyup.q="onQPress" />
  <input @keyup.arrow-down="onArrowDown" />
</template>
```

### 系统修饰键

```vue
<script setup>
function handleSave() {
  console.log('Saved!')
}
</script>

<template>
  <!-- Ctrl -->
  <button @click.ctrl="handleSave">Ctrl + Click</button>

  <!-- Alt -->
  <button @click.alt="handleSave">Alt + Click</button>

  <!-- Shift -->
  <button @click.shift="handleSave">Shift + Click</button>

  <!-- Meta (Windows键/Cmd键) -->
  <button @click.meta="handleSave">Meta + Click</button>

  <!-- 精确组合 -->
  <button @click.ctrl.shift="handleSave">
    Ctrl + Shift + Click
  </button>

  <!-- 排除某个修饰键 -->
  <button @click.ctrl.exact="handleSave">
    只有 Ctrl 被按下
  </button>

  <!-- 没有任何修饰键 -->
  <button @click.exact="handleClick">
    无修饰键点击
  </button>
</template>
```

### 鼠标按钮修饰符

```vue
<script setup>
function handleLeftClick() {
  console.log('Left clicked')
}

function handleRightClick(event) {
  event.preventDefault()
  console.log('Right clicked')
}
</script>

<template>
  <div @mousedown.left="handleLeftClick">
    Left click
  </div>

  <div @mousedown.right="handleRightClick">
    Right click
  </div>

  <div @mousedown.middle="handleMiddleClick">
    Middle click
  </div>
</template>
```

### 动态事件

```vue
<script setup>
import { ref } from 'vue'

const eventName = ref('click')
const handler = ref(() => console.log('Clicked'))
</script>

<template>
  <!-- 动态事件名 -->
  <button @[eventName]="handler">
    Dynamic Event
  </button>
</template>
```

### 对象语法

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

const eventHandlers = {
  click: () => count.value++,
  mouseover: () => console.log('Mouse over')
}
</script>

<template>
  <!-- 对象语法 -->
  <button v-on="eventHandlers">
    Click
  </button>
</template>
```

### 组件自定义事件

```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

function handleCustomEvent(data) {
  console.log('Received:', data)
}
</script>

<template>
  <ChildComponent @custom-event="handleCustomEvent" />
</template>

<!-- 子组件 -->
<script setup>
const emit = defineEmits(['custom-event'])

function triggerEvent() {
  emit('custom-event', { message: 'Hello from child' })
}
</script>

<template>
  <button @click="triggerEvent">触发事件</button>
</template>
```

## 注意事项

### 1. 内联表达式限制

```vue
<script setup>
const count = ref(0)
</script>

<template>
  <!-- ✅ 简单表达式 -->
  <button @click="count++">增加</button>

  <!-- ❌ 复杂表达式应该使用方法 -->
  <button @click="if (count > 10) count = 0">
    <!-- 不推荐 -->
  </button>

  <!-- ✅ 推荐 -->
  <button @click="resetIfOverLimit">
    重置
  </button>
</template>
```

### 2. 修饰符链

```vue
<template>
  <!-- 多个修饰符可以链式调用 -->
  <form @submit.prevent.stop="handleSubmit">
    <button type="submit">Submit</button>
  </form>

  <!-- 顺序很重要 -->
  <input @keyup.ctrl.enter="submit" />
  <!-- Ctrl + Enter 才会触发 -->

  <input @keyup.enter.ctrl="submit" />
  <!-- 先检查 Enter，再检查 Ctrl -->
</template>
```

### 3. 原生事件 vs 自定义事件

```vue
<script setup>
function handleClick(event) {
  // 这里的 event 是原生 DOM 事件
  console.log(event.target)
  event.preventDefault()
}
</script>

<template>
  <button @click="handleClick">Click</button>
</template>
```

### 4. 事件对象

```vue
<script setup>
function handleInput(event) {
  // 访问事件目标
  const value = event.target.value
  console.log(value)
}

function handleKeyEvent(event) {
  // 访问按键信息
  console.log(event.key)
  console.log(event.code)
  console.log(event.ctrlKey)
}
</script>

<template>
  <input @input="handleInput" />
  <input @keyup="handleKeyEvent" />
</template>
```

### 5. 组件事件

```vue
<!-- 父组件 -->
<script setup>
import ChildComponent from './ChildComponent.vue'

function handleEvent(data) {
  console.log(data)
}
</script>

<template>
  <!-- 自定义事件不会触发原生事件 -->
  <ChildComponent @click="handleEvent" />
  <!-- 这里监听的是子组件通过 emit 触发的 click 事件 -->
</template>
```

### 6. this 的指向

```vue
<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  methods: {
    // 在方法中 this 指向组件实例
    handleClick() {
      console.log(this.message)
    }
  }
}
</script>
```

### 7. 事件冒泡和捕获

```vue
<template>
  <!-- 捕获阶段 -->
  <div @click.capture="handleParentClick">
    <button @click="handleChildClick">Button</button>
  </div>

  <!-- .preventDefault 阻止默认行为 -->
  <a href="https://example.com" @click.prevent>
    不会跳转
  </a>
</template>
```

### 8. 被动事件监听器

```vue
<script setup>
function onScroll() {
  // 滚动处理
  console.log('Scrolling...')
}
</script>

<template>
  <!-- 被动模式可以提高滚动性能 -->
  <div @scroll.passive="onScroll" style="height: 100px; overflow: auto;">
    Long content...
  </div>
</template>
```

## 使用场景

### 1. 表单处理

```vue
<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  email: ''
})

function handleSubmit() {
  console.log('Form submitted:', formData.value)
}

function handleReset() {
  formData.value = {
    username: '',
    email: ''
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.username" />
    <input v-model="formData.email" />
    <button type="submit">提交</button>
    <button type="button" @click="handleReset">重置</button>
  </form>
</template>
```

### 2. 列表操作

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

function removeItem(id) {
  items.value = items.value.filter(item => item.id !== id)
}

function addItem() {
  items.value.push({
    id: Date.now(),
    name: `Item ${items.value.length + 1}`
  })
}
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
      <button @click="removeItem(item.id)">删除</button>
    </li>
  </ul>
  <button @click="addItem">添加</button>
</template>
```

### 3. 快捷键支持

```vue
<script setup>
function save() {
  console.log('Saving...')
}

function open() {
  console.log('Opening...')
}

function close() {
  console.log('Closing...')
}
</script>

<template>
  <!-- 全局快捷键 -->
  <div
    @keydown.ctrl.s.prevent="save"
    @keydown.ctrl.o.prevent="open"
    @keydown.escape="close"
    tabindex="0"
  >
    按 Ctrl+S 保存，Ctrl+O 打开，Esc 关闭
  </div>
</template>
```

### 4. 拖拽功能

```vue
<script setup>
import { ref } from 'vue'

const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const offset = ref({ x: 0, y: 0 })

function startDrag(event) {
  isDragging.value = true
  offset.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y
  }
}

function onDrag(event) {
  if (!isDragging.value) return
  position.value = {
    x: event.clientX - offset.value.x,
    y: event.clientY - offset.value.y
  }
}

function stopDrag() {
  isDragging.value = false
}
</script>

<template>
  <div
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    :style="{
      position: 'absolute',
      left: position.x + 'px',
      top: position.y + 'px'
    }"
  >
    拖拽我
  </div>
</template>
```

### 5. 输入验证

```vue
<script setup>
import { ref } from 'vue'

const inputValue = ref('')
const error = ref('')

function validateInput(event) {
  const value = event.target.value

  if (value.length < 3) {
    error.value = '至少需要3个字符'
  } else if (!/^[a-zA-Z]+$/.test(value)) {
    error.value = '只能包含字母'
  } else {
    error.value = ''
  }
}
</script>

<template>
  <div>
    <input
      v-model="inputValue"
      @input="validateInput"
      @blur="validateInput"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

### 6. 防抖和节流

```vue
<script setup>
import { ref } from 'vue'

let debounceTimer = null

function onInput(event) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    console.log('Debounced:', event.target.value)
  }, 300)
}

let throttleTimer = null
function onScroll(event) {
  if (throttleTimer) return
  throttleTimer = setTimeout(() => {
    console.log('Throttled scroll')
    throttleTimer = null
  }, 100)
}
</script>

<template>
  <input @input="onInput" />
  <div @scroll="onScroll" style="height: 100px; overflow: auto;">
    Long content...
  </div>
</template>
```

### 7. 图片懒加载

```vue
<script setup>
function handleImageLoad(event) {
  console.log('Image loaded:', event.target.src)
}

function handleImageError(event) {
  console.log('Image failed to load')
  event.target.src = '/placeholder.jpg'
}
</script>

<template>
  <img
    src="/image.jpg"
    @load="handleImageLoad"
    @error="handleImageError"
    loading="lazy"
  />
</template>
```

### 8. 右键菜单

```vue
<script setup>
import { ref } from 'vue'

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0
})

function showContextMenu(event) {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY
  }
}

function hideContextMenu() {
  contextMenu.value.visible = false
}
</script>

<template>
  <div @contextmenu.prevent="showContextMenu" @click="hideContextMenu">
    右键点击显示菜单

    <div
      v-if="contextMenu.visible"
      :style="{
        position: 'fixed',
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
    >
      <ul>
        <li>复制</li>
        <li>粘贴</li>
        <li>删除</li>
      </ul>
    </div>
  </div>
</template>
```

### 9. 窗口事件

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  console.log('Window resized:', window.innerWidth)
}

function handleScroll() {
  console.log('Window scrolled:', window.scrollY)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    Content...
  </div>
</template>
```

### 10. 事件委托

```vue
<script setup>
function handleListClick(event) {
  // 检查点击的是否是列表项
  if (event.target.tagName === 'LI') {
    console.log('Clicked item:', event.target.textContent)
  }
}
</script>

<template>
  <ul @click="handleListClick">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</template>
```

## v-on 修饰符总结

| 修饰符 | 说明 |
|------|------|
| .stop | 阻止事件冒泡 |
| .prevent | 阻止默认行为 |
| .capture | 添加事件捕获 |
| .self | 只当事件从元素本身触发时触发 |
| .once | 只触发一次 |
| .passive | 滚动事件的默认行为立即发生 |
| .native | 监听原生事件（Vue 2）|
| .left | 只触发左键事件 |
| .right | 只触发右键事件 |
| .middle | 只触发中键事件 |
| .passive | 提升滚动性能 |
| .ctrl | Ctrl 键按下时触发 |
| .alt | Alt 键按下时触发 |
| .shift | Shift 键按下时触发 |
| .meta | Meta 键按下时触发 |
| .exact | 精确匹配修饰键 |
| .keyCode | 指定按键码 |

## 最佳实践

1. **使用简写**：优先使用 `@` 代替 `v-on`
2. **方法优于表达式**：复杂逻辑使用方法
3. **使用修饰符**：利用修饰符简化代码
4. **事件命名规范**：使用 kebab-case 或 camelCase
5. **注意性能**：大量事件监听考虑事件委托
