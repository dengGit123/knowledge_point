# Teleport

## 作用
`Teleport` 是一个内置组件，用于将模板内容"传送"到 DOM 的其他位置。它允许你控制组件内容在 DOM 中的渲染位置，而不影响组件层级结构。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const show = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="show = !show"&gt;切换弹窗&lt;/button&gt;

    &lt;!-- Teleport 将内容传送到 body --&gt;
    &lt;Teleport to="body"&gt;
      &lt;div v-if="show" class="modal"&gt;
        &lt;p&gt;这是一个传送的弹窗&lt;/p&gt;
        &lt;button @click="show = false"&gt;关闭&lt;/button&gt;
      &lt;/div&gt;
    &lt;/Teleport&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 传送到指定元素

```text
`&lt;script setup&gt;`
const containerId = 'modal-container'
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 传送到指定 ID 的元素 --&gt;
  &lt;Teleport :to="`#${containerId}`"&gt;
    &lt;div class="modal"&gt;
      Modal content
    &lt;/div&gt;
  &lt;/Teleport&gt;

  &lt;!-- 目标容器 --&gt;
  &lt;div id="modal-container"&gt;&lt;/div&gt;
`&lt;/template&gt;`
```

### 禁用 Teleport

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const disabled = ref(false)
const show = ref(true)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 当 disabled 为 true 时，内容在原地渲染 --&gt;
  &lt;Teleport to="body" :disabled="disabled"&gt;
    &lt;div v-if="show" class="modal"&gt;
      Modal content
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 多个 Teleport 到同一目标

```text
`&lt;template&gt;`
  &lt;!-- 多个 Teleport 可以传送到同一个目标 --&gt;
  &lt;Teleport to="body"&gt;
    &lt;div class="modal-a"&gt;Modal A&lt;/div&gt;
  &lt;/Teleport&gt;

  &lt;Teleport to="body"&gt;
    &lt;div class="modal-b"&gt;Modal B&lt;/div&gt;
  &lt;/Teleport&gt;

  &lt;!-- 按照组件中的顺序渲染 --&gt;
`&lt;/template&gt;`
```

### 与 Transition 配合

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const show = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="show = true"&gt;显示弹窗&lt;/button&gt;

  &lt;Teleport to="body"&gt;
    &lt;Transition name="modal"&gt;
      &lt;div v-if="show" class="modal"&gt;
        &lt;div class="modal-content"&gt;
          &lt;p&gt;弹窗内容&lt;/p&gt;
          &lt;button @click="show = false"&gt;关闭&lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`

&lt;style&gt;
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
&lt;/style&gt;
```

### 在组件中使用

```text
&lt;!-- Modal.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  show: Boolean,
  title: String
})

const emit = defineEmits(['close'])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;Transition name="modal"&gt;
      &lt;div v-if="show" class="modal-overlay" @click.self="emit('close')"&gt;
        &lt;div class="modal-content"&gt;
          &lt;h2&gt;{{ title }}&lt;/h2&gt;
          &lt;slot /&gt;
          &lt;button @click="emit('close')"&gt;关闭&lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 动态目标

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const showModal = ref(false)
const target = ref('body')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="showModal = true"&gt;显示弹窗&lt;/button&gt;

  &lt;!-- 动态切换目标 --&gt;
  &lt;Teleport :to="target"&gt;
    &lt;div v-if="showModal" class="modal"&gt;
      &lt;button @click="target = target === 'body' ? '#container' : 'body'"&gt;
        切换位置
      &lt;/button&gt;
    &lt;/div&gt;
  &lt;/Teleport&gt;

  &lt;div id="container"&gt;&lt;/div&gt;
`&lt;/template&gt;`
```

### 传送多个插槽内容

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const show = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;Transition&gt;
      &lt;div v-if="show" class="modal"&gt;
        &lt;slot name="header"&gt;
          &lt;h2&gt;默认标题&lt;/h2&gt;
        &lt;/slot&gt;
        &lt;slot /&gt;
        &lt;slot name="footer"&gt;
          &lt;button @click="show = false"&gt;关闭&lt;/button&gt;
        &lt;/slot&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. Teleport 只改变渲染位置

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const count = ref(0)
const show = ref(true)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;p&gt;Count: {{ count }}&lt;/p&gt;
    &lt;button @click="count++"&gt;增加&lt;/button&gt;

    &lt;!-- Teleport 的内容仍然可以访问组件的状态 --&gt;
    &lt;Teleport to="body"&gt;
      &lt;div v-if="show"&gt;
        &lt;p&gt;传送的内容: {{ count }}&lt;/p&gt;
      &lt;/div&gt;
    &lt;/Teleport&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 生命周期钩子的执行

```text
`&lt;script setup&gt;`
import { onMounted } from 'vue'

onMounted(() =&gt; {
  console.log('组件已挂载')
  // Teleport 内容的 onMounted 也会执行
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;div @mounted="console.log('Teleport content mounted')"&gt;
      Content
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 3. 事件冒泡

```text
`&lt;script setup&gt;`
function handleClick() {
  console.log('Clicked')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- Teleport 会保留事件冒泡行为 --&gt;
  &lt;div @click="handleClick"&gt;
    &lt;Teleport to="body"&gt;
      &lt;button @click="handleClick"&gt;Click&lt;/button&gt;
    &lt;/Teleport&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 插槽内容

```text
`&lt;script setup&gt;`
const show = ref(true)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 默认插槽内容会被传送 --&gt;
  &lt;Teleport to="body"&gt;
    `&lt;template&gt;`
      &lt;div&gt;传送的内容&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 5. 目标元素必须存在

```text
`&lt;template&gt;`
  &lt;!-- ✅ 目标元素存在 --&gt;
  &lt;Teleport to="body"&gt;
    &lt;div&gt;Content&lt;/div&gt;
  &lt;/Teleport&gt;

  &lt;!-- ✅ 目标元素存在 --&gt;
  &lt;div id="app"&gt;&lt;/div&gt;
  &lt;Teleport to="#app"&gt;
    &lt;div&gt;Content&lt;/div&gt;
  &lt;/Teleport&gt;

  &lt;!-- ❌ 目标元素不存在时会报错 --&gt;
  &lt;Teleport to="#non-existent"&gt;
    &lt;div&gt;Content&lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 6. 作用域插槽

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const userData = ref({
  name: 'Vue',
  role: 'admin'
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;div class="modal"&gt;
      &lt;!-- 作用域插槽在 Teleport 中正常工作 --&gt;
      &lt;slot name="content" :user="userData"&gt;
        &lt;p&gt;默认内容&lt;/p&gt;
      &lt;/slot&gt;
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 7. 组合式 API 支持

```text
`&lt;script setup&gt;`
import { useModal } from './composables/useModal'

const { show, open, close } = useModal()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;div v-if="show" class="modal"&gt;
      &lt;slot :close="close" /&gt;
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 8. ref 访问

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const modalRef = ref(null)

onMounted(() =&gt; {
  console.log(modalRef.value) // 可以访问 Teleport 内部的元素
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;div ref="modalRef" class="modal"&gt;
      Modal content
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 模态框

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const showModal = ref(false)
const modalContent = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="showModal = true"&gt;打开模态框&lt;/button&gt;

  &lt;Teleport to="body"&gt;
    &lt;Transition name="modal"&gt;
      &lt;div v-if="showModal" class="modal-overlay" @click.self="showModal = false"&gt;
        &lt;div class="modal-content" @click.stop&gt;
          &lt;h2&gt;模态框&lt;/h2&gt;
          &lt;p&gt;{{ modalContent }}&lt;/p&gt;
          &lt;button @click="showModal = false"&gt;关闭&lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`

&lt;style&gt;
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}
&lt;/style&gt;
```

### 2. 通知/Toast

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const toasts = ref([])

function showToast(message, type = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() =&gt; {
    toasts.value = toasts.value.filter(t =&gt; t.id !== id)
  }, 3000)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="showToast('操作成功!', 'success')"&gt;
    显示通知
  &lt;/button&gt;

  &lt;Teleport to="body"&gt;
    &lt;div class="toast-container"&gt;
      &lt;TransitionGroup name="toast"&gt;
        &lt;div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', toast.type]"
        &gt;
          {{ toast.message }}
        &lt;/div&gt;
      &lt;/TransitionGroup&gt;
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`

&lt;style&gt;
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
}

.toast {
  padding: 12px 20px;
  margin-bottom: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.toast.success {
  border-left: 4px solid #52c41a;
}
&lt;/style&gt;
```

### 3. 下拉菜单

```text
`&lt;script setup&gt;`
import { ref, onClickOutside } from '@vueuse/core'

const showMenu = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () =&gt; {
  showMenu.value = false
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="dropdown" ref="menuRef"&gt;
    &lt;button @click="showMenu = !showMenu"&gt;
      菜单
    &lt;/button&gt;

    &lt;Teleport to="body"&gt;
      &lt;Transition name="dropdown"&gt;
        &lt;div v-if="showMenu" class="dropdown-menu"&gt;
          &lt;a href="#"&gt;选项 1&lt;/a&gt;
          &lt;a href="#"&gt;选项 2&lt;/a&gt;
          &lt;a href="#"&gt;选项 3&lt;/a&gt;
        &lt;/div&gt;
      &lt;/Transition&gt;
    &lt;/Teleport&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 加载遮罩

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const isLoading = ref(false)

async function loadData() {
  isLoading.value = true
  try {
    await fetch('/api/data')
  } finally {
    isLoading.value = false
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="loadData"&gt;加载数据&lt;/button&gt;

  &lt;Teleport to="body"&gt;
    &lt;Transition name="loading"&gt;
      &lt;div v-if="isLoading" class="loading-overlay"&gt;
        &lt;div class="spinner"&gt;&lt;/div&gt;
        &lt;p&gt;加载中...&lt;/p&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`

&lt;style&gt;
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
&lt;/style&gt;
```

### 5. 弹出层（Popover/Tooltip）

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const showPopover = ref(false)
const position = ref({ x: 0, y: 0 })

function show(event) {
  position.value = { x: event.clientX, y: event.clientY }
  showPopover.value = true
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="show"&gt;点击显示&lt;/button&gt;

    &lt;Teleport to="body"&gt;
      &lt;div
        v-if="showPopover"
        class="popover"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
      &gt;
        这是一个弹出层
        &lt;button @click="showPopover = false" class="close-btn"&gt;×&lt;/button&gt;
      &lt;/div&gt;
    &lt;/Teleport&gt;
  &lt;/div&gt;
`&lt;/template&gt;`

&lt;style&gt;
.popover {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
&lt;/style&gt;
```

### 6. 图片预览

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const previewImage = ref(null)
const previewVisible = ref(false)

function showPreview(src) {
  previewImage.value = src
  previewVisible.value = true
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="image-grid"&gt;
    &lt;img
      v-for="img in images"
      :key="img.src"
      :src="img.src"
      @click="showPreview(img.src)"
    /&gt;
  &lt;/div&gt;

  &lt;Teleport to="body"&gt;
    &lt;Transition name="preview"&gt;
      &lt;div v-if="previewVisible" class="preview-overlay" @click="previewVisible = false"&gt;
        &lt;img :src="previewImage" class="preview-image" /&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 7. 右键菜单

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
  &lt;div @contextmenu.prevent="showContextMenu" class="context-area"&gt;
    右键点击此区域
  &lt;/div&gt;

  &lt;Teleport to="body"&gt;
    &lt;Transition name="context-menu"&gt;
      &lt;div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      &gt;
        &lt;div @click="hideContextMenu"&gt;复制&lt;/div&gt;
        &lt;div @click="hideContextMenu"&gt;粘贴&lt;/div&gt;
        &lt;div @click="hideContextMenu"&gt;删除&lt;/div&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 8. 全屏组件

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const isFullscreen = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="isFullscreen = !isFullscreen"&gt;
    {{ isFullscreen ? '退出' : '进入' }}全屏
  &lt;/button&gt;

  &lt;Teleport to="body"&gt;
    &lt;Transition name="fullscreen"&gt;
      &lt;div v-if="isFullscreen" class="fullscreen-content"&gt;
        &lt;div class="fullscreen-header"&gt;
          &lt;h2&gt;全屏内容&lt;/h2&gt;
          &lt;button @click="isFullscreen = false"&gt;关闭&lt;/button&gt;
        &lt;/div&gt;
        &lt;div class="fullscreen-body"&gt;
          &lt;slot /&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/Transition&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`

&lt;style&gt;
.fullscreen-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}
&lt;/style&gt;
```

## Teleport 特性总结

| 特性 | 说明 |
|-----|------|
| to | 目标位置（CSS 选择器或实际元素）|
| disabled | 是否禁用传送 |
| 保留层级 | 组件层级结构不变 |
| 生命周期 | 正常执行 |
| 事件冒泡 | 保留原有行为 |

## 最佳实践

1. **body 目标**：模态框、通知等通常传送到 body
2. **条件渲染**：使用 v-if 或 v-show 控制显示
3. **清理工作**：组件卸载时自动清理
4. **z-index 管理**：注意堆叠上下文
5. **过渡动画**：与 Transition 配合使用
