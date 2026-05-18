# v-on

## 作用
`v-on` 用于绑定事件监听器。它可以监听 DOM 事件或自定义事件，并在触发时执行 JavaScript 表达式或函数。简写形式为 `@`。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 完整语法 --&gt;
  &lt;button v-on:click="increment"&gt;增加&lt;/button&gt;

  &lt;!-- 简写语法（推荐） --&gt;
  &lt;button @click="increment"&gt;增加&lt;/button&gt;

  &lt;!-- 内联表达式 --&gt;
  &lt;button @click="count++"&gt;增加&lt;/button&gt;
`&lt;/template&gt;`
```

### 带参数的事件处理

```text
`&lt;script setup&gt;`
function greet(name) {
  console.log('Hello, ' + name)
}

function say(message, event) {
  console.log(message)
  console.log(event) // 原生 DOM 事件
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="greet('Vue')"&gt;问候&lt;/button&gt;

  &lt;!-- 访问原生事件需要 $event --&gt;
  &lt;button @click="say('Hello', $event)"&gt;说你好&lt;/button&gt;
`&lt;/template&gt;`
```

### 多个事件处理

```text
`&lt;script setup&gt;`
function handleClick() {
  console.log('Clicked')
}

function trackClick() {
  console.log('Tracking...')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 多个处理函数 --&gt;
  &lt;button @click="handleClick(); trackClick()"&gt;
    Click
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 事件修饰符

```text
`&lt;script setup&gt;`
function onSubmit() {
  console.log('Form submitted')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 阻止默认行为 --&gt;
  &lt;form @submit.prevent="onSubmit"&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
  &lt;/form&gt;

  &lt;!-- 阻止事件冒泡 --&gt;
  &lt;div @click="handleParentClick"&gt;
    &lt;button @click.stop="handleChildClick"&gt;
      Child Button
    &lt;/button&gt;
  &lt;/div&gt;

  &lt;!-- 只触发一次 --&gt;
  &lt;button @click.once="handleClick"&gt;
    Click Once
  &lt;/button&gt;

  &lt;!-- 使用被动模式 --&gt;
  &lt;div @scroll.passive="onScroll"&gt;
    Long content...
  &lt;/div&gt;

  &lt;!-- 只有当事件是从元素本身触发时才触发 --&gt;
  &lt;div @click.self="handleDivClick"&gt;
    &lt;button&gt;Button&lt;/button&gt;
  &lt;/div&gt;

  &lt;!-- 按键修饰符 --&gt;
  &lt;input @keyup.enter="submit" /&gt;

  &lt;!-- 系统修饰键组合 --&gt;
  &lt;input @keyup.ctrl.enter="submit" /&gt;

  &lt;!-- 鼠标按钮修饰符 --&gt;
  &lt;div @mousedown.left="handleLeftClick"&gt;
    Left click only
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 按键修饰符

```text
`&lt;script setup&gt;`
function onEnter() {
  console.log('Enter pressed')
}

function onEscape() {
  console.log('Escape pressed')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 常用按键别名 --&gt;
  &lt;input @keyup.enter="onEnter" /&gt;
  &lt;input @keyup.tab="onTab" /&gt;
  &lt;input @keyup.delete="onDelete" /&gt;
  &lt;input @keyup.esc="onEscape" /&gt;
  &lt;input @keyup.space="onSpace" /&gt;
  &lt;input @keyup.up="onUp" /&gt;
  &lt;input @keyup.down="onDown" /&gt;
  &lt;input @keyup.left="onLeft" /&gt;
  &lt;input @keyup.right="onRight" /&gt;

  &lt;!-- 自定义按键修饰符 --&gt;
  &lt;input @keyup.page-down="onPageDown" /&gt;
  &lt;input @keyup.page-up="onPageUp" /&gt;

  &lt;!-- 任意按键 --&gt;
  &lt;input @keyup.q="onQPress" /&gt;
  &lt;input @keyup.arrow-down="onArrowDown" /&gt;
`&lt;/template&gt;`
```

### 系统修饰键

```text
`&lt;script setup&gt;`
function handleSave() {
  console.log('Saved!')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- Ctrl --&gt;
  &lt;button @click.ctrl="handleSave"&gt;Ctrl + Click&lt;/button&gt;

  &lt;!-- Alt --&gt;
  &lt;button @click.alt="handleSave"&gt;Alt + Click&lt;/button&gt;

  &lt;!-- Shift --&gt;
  &lt;button @click.shift="handleSave"&gt;Shift + Click&lt;/button&gt;

  &lt;!-- Meta (Windows键/Cmd键) --&gt;
  &lt;button @click.meta="handleSave"&gt;Meta + Click&lt;/button&gt;

  &lt;!-- 精确组合 --&gt;
  &lt;button @click.ctrl.shift="handleSave"&gt;
    Ctrl + Shift + Click
  &lt;/button&gt;

  &lt;!-- 排除某个修饰键 --&gt;
  &lt;button @click.ctrl.exact="handleSave"&gt;
    只有 Ctrl 被按下
  &lt;/button&gt;

  &lt;!-- 没有任何修饰键 --&gt;
  &lt;button @click.exact="handleClick"&gt;
    无修饰键点击
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 鼠标按钮修饰符

```text
`&lt;script setup&gt;`
function handleLeftClick() {
  console.log('Left clicked')
}

function handleRightClick(event) {
  event.preventDefault()
  console.log('Right clicked')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div @mousedown.left="handleLeftClick"&gt;
    Left click
  &lt;/div&gt;

  &lt;div @mousedown.right="handleRightClick"&gt;
    Right click
  &lt;/div&gt;

  &lt;div @mousedown.middle="handleMiddleClick"&gt;
    Middle click
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 动态事件

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const eventName = ref('click')
const handler = ref(() =&gt; console.log('Clicked'))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 动态事件名 --&gt;
  &lt;button @[eventName]="handler"&gt;
    Dynamic Event
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 对象语法

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const count = ref(0)

const eventHandlers = {
  click: () =&gt; count.value++,
  mouseover: () =&gt; console.log('Mouse over')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 对象语法 --&gt;
  &lt;button v-on="eventHandlers"&gt;
    Click
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 组件自定义事件

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

function handleCustomEvent(data) {
  console.log('Received:', data)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ChildComponent @custom-event="handleCustomEvent" /&gt;
`&lt;/template&gt;`

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const emit = defineEmits(['custom-event'])

function triggerEvent() {
  emit('custom-event', { message: 'Hello from child' })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="triggerEvent"&gt;触发事件&lt;/button&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. 内联表达式限制

```text
`&lt;script setup&gt;`
const count = ref(0)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- ✅ 简单表达式 --&gt;
  &lt;button @click="count++"&gt;增加&lt;/button&gt;

  &lt;!-- ❌ 复杂表达式应该使用方法 --&gt;
  &lt;button @click="if (count &gt; 10) count = 0"&gt;
    &lt;!-- 不推荐 --&gt;
  &lt;/button&gt;

  &lt;!-- ✅ 推荐 --&gt;
  &lt;button @click="resetIfOverLimit"&gt;
    重置
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 2. 修饰符链

```text
`&lt;template&gt;`
  &lt;!-- 多个修饰符可以链式调用 --&gt;
  &lt;form @submit.prevent.stop="handleSubmit"&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
  &lt;/form&gt;

  &lt;!-- 顺序很重要 --&gt;
  &lt;input @keyup.ctrl.enter="submit" /&gt;
  &lt;!-- Ctrl + Enter 才会触发 --&gt;

  &lt;input @keyup.enter.ctrl="submit" /&gt;
  &lt;!-- 先检查 Enter，再检查 Ctrl --&gt;
`&lt;/template&gt;`
```

### 3. 原生事件 vs 自定义事件

```text
`&lt;script setup&gt;`
function handleClick(event) {
  // 这里的 event 是原生 DOM 事件
  console.log(event.target)
  event.preventDefault()
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="handleClick"&gt;Click&lt;/button&gt;
`&lt;/template&gt;`
```

### 4. 事件对象

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input @input="handleInput" /&gt;
  &lt;input @keyup="handleKeyEvent" /&gt;
`&lt;/template&gt;`
```

### 5. 组件事件

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import ChildComponent from './ChildComponent.vue'

function handleEvent(data) {
  console.log(data)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 自定义事件不会触发原生事件 --&gt;
  &lt;ChildComponent @click="handleEvent" /&gt;
  &lt;!-- 这里监听的是子组件通过 emit 触发的 click 事件 --&gt;
`&lt;/template&gt;`
```

### 6. this 的指向

```text
&lt;script&gt;
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
`&lt;/script&gt;`
```

### 7. 事件冒泡和捕获

```text
`&lt;template&gt;`
  &lt;!-- 捕获阶段 --&gt;
  &lt;div @click.capture="handleParentClick"&gt;
    &lt;button @click="handleChildClick"&gt;Button&lt;/button&gt;
  &lt;/div&gt;

  &lt;!-- .preventDefault 阻止默认行为 --&gt;
  &lt;a href="https://example.com" @click.prevent&gt;
    不会跳转
  &lt;/a&gt;
`&lt;/template&gt;`
```

### 8. 被动事件监听器

```text
`&lt;script setup&gt;`
function onScroll() {
  // 滚动处理
  console.log('Scrolling...')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 被动模式可以提高滚动性能 --&gt;
  &lt;div @scroll.passive="onScroll" style="height: 100px; overflow: auto;"&gt;
    Long content...
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 表单处理

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form @submit.prevent="handleSubmit"&gt;
    &lt;input v-model="formData.username" /&gt;
    &lt;input v-model="formData.email" /&gt;
    &lt;button type="submit"&gt;提交&lt;/button&gt;
    &lt;button type="button" @click="handleReset"&gt;重置&lt;/button&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 2. 列表操作

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

function removeItem(id) {
  items.value = items.value.filter(item =&gt; item.id !== id)
}

function addItem() {
  items.value.push({
    id: Date.now(),
    name: `Item ${items.value.length + 1}`
  })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul&gt;
    &lt;li v-for="item in items" :key="item.id"&gt;
      {{ item.name }}
      &lt;button @click="removeItem(item.id)"&gt;删除&lt;/button&gt;
    &lt;/li&gt;
  &lt;/ul&gt;
  &lt;button @click="addItem"&gt;添加&lt;/button&gt;
`&lt;/template&gt;`
```

### 3. 快捷键支持

```text
`&lt;script setup&gt;`
function save() {
  console.log('Saving...')
}

function open() {
  console.log('Opening...')
}

function close() {
  console.log('Closing...')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 全局快捷键 --&gt;
  &lt;div
    @keydown.ctrl.s.prevent="save"
    @keydown.ctrl.o.prevent="open"
    @keydown.escape="close"
    tabindex="0"
  &gt;
    按 Ctrl+S 保存，Ctrl+O 打开，Esc 关闭
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 拖拽功能

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    :style="{
      position: 'absolute',
      left: position.x + 'px',
      top: position.y + 'px'
    }"
  &gt;
    拖拽我
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 输入验证

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const inputValue = ref('')
const error = ref('')

function validateInput(event) {
  const value = event.target.value

  if (value.length &lt; 3) {
    error.value = '至少需要3个字符'
  } else if (!/^[a-zA-Z]+$/.test(value)) {
    error.value = '只能包含字母'
  } else {
    error.value = ''
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;input
      v-model="inputValue"
      @input="validateInput"
      @blur="validateInput"
    /&gt;
    &lt;span v-if="error" class="error"&gt;{{ error }}&lt;/span&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 防抖和节流

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

let debounceTimer = null

function onInput(event) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() =&gt; {
    console.log('Debounced:', event.target.value)
  }, 300)
}

let throttleTimer = null
function onScroll(event) {
  if (throttleTimer) return
  throttleTimer = setTimeout(() =&gt; {
    console.log('Throttled scroll')
    throttleTimer = null
  }, 100)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input @input="onInput" /&gt;
  &lt;div @scroll="onScroll" style="height: 100px; overflow: auto;"&gt;
    Long content...
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 图片懒加载

```text
`&lt;script setup&gt;`
function handleImageLoad(event) {
  console.log('Image loaded:', event.target.src)
}

function handleImageError(event) {
  console.log('Image failed to load')
  event.target.src = '/placeholder.jpg'
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;img
    src="/image.jpg"
    @load="handleImageLoad"
    @error="handleImageError"
    loading="lazy"
  /&gt;
`&lt;/template&gt;`
```

### 8. 右键菜单

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div @contextmenu.prevent="showContextMenu" @click="hideContextMenu"&gt;
    右键点击显示菜单

    &lt;div
      v-if="contextMenu.visible"
      :style="{
        position: 'fixed',
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
    &gt;
      &lt;ul&gt;
        &lt;li&gt;复制&lt;/li&gt;
        &lt;li&gt;粘贴&lt;/li&gt;
        &lt;li&gt;删除&lt;/li&gt;
      &lt;/ul&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 9. 窗口事件

```text
`&lt;script setup&gt;`
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  console.log('Window resized:', window.innerWidth)
}

function handleScroll() {
  console.log('Window scrolled:', window.scrollY)
}

onMounted(() =&gt; {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() =&gt; {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    Content...
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 10. 事件委托

```text
`&lt;script setup&gt;`
function handleListClick(event) {
  // 检查点击的是否是列表项
  if (event.target.tagName === 'LI') {
    console.log('Clicked item:', event.target.textContent)
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul @click="handleListClick"&gt;
    &lt;li&gt;Item 1&lt;/li&gt;
    &lt;li&gt;Item 2&lt;/li&gt;
    &lt;li&gt;Item 3&lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
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
