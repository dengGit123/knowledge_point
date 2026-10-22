# Teleport

## 作用

`Teleport` 是一个内置组件，用于将模板内容"传送"到 DOM 的其他位置。它允许你控制组件内容在 DOM 中的渲染位置，而不影响组件层级结构。

📖 [官方文档：Teleport](https://cn.vuejs.org/api/built-in-components.html#teleport)

## 用法

### 基本用法

```vue
<script setup>
import { ref } from 'vue'

const show = ref(false)
</script>

<template>
  <div>
    <button @click="show = !show">切换弹窗</button>

    <!-- Teleport 将内容传送到 body -->
    <Teleport to="body">
      <div v-if="show" class="modal">
        <p>这是一个传送的弹窗</p>
        <button @click="show = false">关闭</button>
      </div>
    </Teleport>
  </div>
</template>
```

### 传送到指定元素

```vue
<script setup>
const containerId = 'modal-container'
</script>

<template>
  <!-- 传送到指定 ID 的元素 -->
  <Teleport :to="`#${containerId}`">
    <div class="modal">
      Modal content
    </div>
  </Teleport>

  <!-- 目标容器 -->
  <div id="modal-container"></div>
</template>
```

### 禁用 Teleport

```vue
<script setup>
import { ref } from 'vue'

const disabled = ref(false)
const show = ref(true)
</script>

<template>
  <!-- 当 disabled 为 true 时，内容在原地渲染 -->
  <Teleport to="body" :disabled="disabled">
    <div v-if="show" class="modal">
      Modal content
    </div>
  </Teleport>
</template>
```

### 多个 Teleport 到同一目标

```vue
<template>
  <!-- 多个 Teleport 可以传送到同一个目标 -->
  <Teleport to="body">
    <div class="modal-a">Modal A</div>
  </Teleport>

  <Teleport to="body">
    <div class="modal-b">Modal B</div>
  </Teleport>

  <!-- 按照组件中的顺序渲染 -->
</template>
```

### 与 Transition 配合

```vue
<script setup>
import { ref } from 'vue'

const show = ref(false)
</script>

<template>
  <button @click="show = true">显示弹窗</button>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal">
        <div class="modal-content">
          <p>弹窗内容</p>
          <button @click="show = false">关闭</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
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
</style>
```

### 在组件中使用

```vue
<!-- Modal.vue -->
<script setup>
const props = defineProps({
  show: Boolean,
  title: String
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
          <h2>{{ title }}</h2>
          <slot />
          <button @click="emit('close')">关闭</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

### 动态目标

```vue
<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const target = ref('body')
</script>

<template>
  <button @click="showModal = true">显示弹窗</button>

  <!-- 动态切换目标 -->
  <Teleport :to="target">
    <div v-if="showModal" class="modal">
      <button @click="target = target === 'body' ? '#container' : 'body'">
        切换位置
      </button>
    </div>
  </Teleport>

  <div id="container"></div>
</template>
```

### 延迟挂载目标（defer，3.5+）

如果目标元素在模板中位于 `Teleport` 之后（挂载时还不存在），默认会解析失败。加上 `defer` 属性后，Vue 会推迟到组件挂载完成后再解析目标，这样同一段模板里后渲染的目标也能找到：

```vue
<template>
  <Teleport defer to="#late-target">
    <div class="modal">内容</div>
  </Teleport>

  <!-- 目标在 Teleport 之后才渲染，必须配合 defer -->
  <div id="late-target"></div>
</template>
```

> ⚠️ **注意：** `defer` 只解决"同一渲染流程中目标还没挂载"的问题。如果目标由 `v-if` 等条件控制、渲染时机完全不确定，还是应该保证目标先于内容出现。

### 传送多个插槽内容

```vue
<script setup>
import { ref } from 'vue'

const show = ref(false)
</script>

<template>
  <Teleport to="body">
    <Transition>
      <div v-if="show" class="modal">
        <slot name="header">
          <h2>默认标题</h2>
        </slot>
        <slot />
        <slot name="footer">
          <button @click="show = false">关闭</button>
        </slot>
      </div>
    </Transition>
  </Teleport>
</template>
```

## 注意事项

### 1. Teleport 只改变渲染位置

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const show = ref(true)
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="count++">增加</button>

    <!-- Teleport 的内容仍然可以访问组件的状态 -->
    <Teleport to="body">
      <div v-if="show">
        <p>传送的内容: {{ count }}</p>
      </div>
    </Teleport>
  </div>
</template>
```

### 2. 生命周期钩子照常执行

`Teleport` 只是把 DOM 移到了目标容器，内容的挂载、更新、卸载流程不受影响，`onMounted` 等钩子照常触发：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const show = ref(true)

onMounted(() => {
  console.log('组件挂载完成，Teleport 内容也已渲染到目标位置')
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal">内容</div>
  </Teleport>
</template>
```

### 3. 事件冒泡遵循真实 DOM 位置

传送后的 DOM 挂在目标容器（如 body）下，原生事件只沿真实 DOM 结构冒泡，**不会**冒泡到组件里原来的父级元素。父子组件间的事件通信用 `emits`，不受传送影响：

```vue
<template>
  <!-- ❌ 点击按钮时 outer 的 @click 不会触发（DOM 已经在 body 下） -->
  <div class="outer" @click="handleOuter">
    <Teleport to="body">
      <button @click="handleClick">Click</button>
    </Teleport>
  </div>
</template>
```

### 4. 插槽内容也会被传送

`Teleport` 内的默认插槽、具名插槽、作用域插槽内容都会被传送到目标位置，且插槽的作用域仍属于定义它的父组件：

```vue
<!-- Modal.vue：把调用方传入的插槽内容整体传送到 body -->
<template>
  <Teleport to="body">
    <div class="modal">
      <slot name="header">默认标题</slot>
      <slot />
    </div>
  </Teleport>
</template>
```

### 5. 目标元素必须存在

`to` 接收 CSS 选择器字符串或真实的 DOM 元素。挂载时目标还不存在，开发环境会给出 `Invalid Teleport target on mount` 警告，内容不会渲染到目标位置：

```vue
<template>
  <!-- ✅ 目标元素存在 -->
  <Teleport to="body">
    <div>Content</div>
  </Teleport>

  <!-- ✅ 目标元素存在 -->
  <div id="app"></div>
  <Teleport to="#app">
    <div>Content</div>
  </Teleport>

  <!-- ⚠️ 挂载时目标不存在：开发环境警告，内容不渲染 -->
  <Teleport to="#non-existent">
    <div>Content</div>
  </Teleport>
</template>
```

> 💡 **提示：** 如果目标元素和 `Teleport` 在同一段模板中且写在后面，使用 `defer` 属性（见上文）延迟解析目标。

### 6. 作用域插槽

```vue
<script setup>
import { ref } from 'vue'

const userData = ref({
  name: 'Vue',
  role: 'admin'
})
</script>

<template>
  <Teleport to="body">
    <div class="modal">
      <!-- 作用域插槽在 Teleport 中正常工作 -->
      <slot name="content" :user="userData">
        <p>默认内容</p>
      </slot>
    </div>
  </Teleport>
</template>
```

### 7. 组合式 API 支持

```vue
<script setup>
import { useModal } from './composables/useModal'

const { show, open, close } = useModal()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal">
      <slot :close="close" />
    </div>
  </Teleport>
</template>
```

### 8. ref 访问

```vue
<script setup>
import { ref, onMounted } from 'vue'

const modalRef = ref(null)

onMounted(() => {
  console.log(modalRef.value) // 可以访问 Teleport 内部的元素
})
</script>

<template>
  <Teleport to="body">
    <div ref="modalRef" class="modal">
      Modal content
    </div>
  </Teleport>
</template>
```

## 使用场景

### 1. 模态框

```vue
<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const modalContent = ref('')
</script>

<template>
  <button @click="showModal = true">打开模态框</button>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content" @click.stop>
          <h2>模态框</h2>
          <p>{{ modalContent }}</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
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
</style>
```

### 2. 通知/Toast

```vue
<script setup>
import { ref } from 'vue'

const toasts = ref([])

function showToast(message, type = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}
</script>

<template>
  <button @click="showToast('操作成功!', 'success')">
    显示通知
  </button>

  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', toast.type]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
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
</style>
```

### 3. 下拉菜单

```vue
<script setup>
import { ref, onClickOutside } from '@vueuse/core'

const showMenu = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () => {
  showMenu.value = false
})
</script>

<template>
  <div class="dropdown" ref="menuRef">
    <button @click="showMenu = !showMenu">
      菜单
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="showMenu" class="dropdown-menu">
          <a href="#">选项 1</a>
          <a href="#">选项 2</a>
          <a href="#">选项 3</a>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
```

### 4. 加载遮罩

```vue
<script setup>
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
</script>

<template>
  <button @click="loadData">加载数据</button>

  <Teleport to="body">
    <Transition name="loading">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
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
</style>
```

### 5. 弹出层（Popover/Tooltip）

```vue
<script setup>
import { ref } from 'vue'

const showPopover = ref(false)
const position = ref({ x: 0, y: 0 })

function show(event) {
  position.value = { x: event.clientX, y: event.clientY }
  showPopover.value = true
}
</script>

<template>
  <div>
    <button @click="show">点击显示</button>

    <Teleport to="body">
      <div
        v-if="showPopover"
        class="popover"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
      >
        这是一个弹出层
        <button @click="showPopover = false" class="close-btn">×</button>
      </div>
    </Teleport>
  </div>
</template>

<style>
.popover {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
</style>
```

### 6. 图片预览

```vue
<script setup>
import { ref } from 'vue'

const previewImage = ref(null)
const previewVisible = ref(false)

function showPreview(src) {
  previewImage.value = src
  previewVisible.value = true
}
</script>

<template>
  <div class="image-grid">
    <img
      v-for="img in images"
      :key="img.src"
      :src="img.src"
      @click="showPreview(img.src)"
    />
  </div>

  <Teleport to="body">
    <Transition name="preview">
      <div v-if="previewVisible" class="preview-overlay" @click="previewVisible = false">
        <img :src="previewImage" class="preview-image" />
      </div>
    </Transition>
  </Teleport>
</template>
```

### 7. 右键菜单

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
  <div @contextmenu.prevent="showContextMenu" class="context-area">
    右键点击此区域
  </div>

  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <div @click="hideContextMenu">复制</div>
        <div @click="hideContextMenu">粘贴</div>
        <div @click="hideContextMenu">删除</div>
      </div>
    </Transition>
  </Teleport>
</template>
```

### 8. 全屏组件

```vue
<script setup>
import { ref } from 'vue'

const isFullscreen = ref(false)
</script>

<template>
  <button @click="isFullscreen = !isFullscreen">
    {{ isFullscreen ? '退出' : '进入' }}全屏
  </button>

  <Teleport to="body">
    <Transition name="fullscreen">
      <div v-if="isFullscreen" class="fullscreen-content">
        <div class="fullscreen-header">
          <h2>全屏内容</h2>
          <button @click="isFullscreen = false">关闭</button>
        </div>
        <div class="fullscreen-body">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
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
</style>
```

## Teleport 特性总结

| 特性 | 说明 |
|-----|------|
| to | 目标位置（CSS 选择器或实际元素），必填 |
| disabled | 是否禁用传送（为 true 时内容在原地渲染）|
| defer | 延迟到挂载后再解析目标（3.5+）|
| 保留层级 | 组件层级结构不变，逻辑关系（props/emits/inject）不受影响 |
| 生命周期 | 正常执行 |
| 事件冒泡 | 原生事件按真实 DOM 位置（目标容器）冒泡 |

## 最佳实践

1. **body 目标**：模态框、通知等通常传送到 body
2. **条件渲染**：使用 v-if 或 v-show 控制显示
3. **清理工作**：组件卸载时自动清理
4. **z-index 管理**：注意堆叠上下文
5. **过渡动画**：与 Transition 配合使用
