# useTemplateRef

Vue 3.5+ 新增的 API，用于获取模板引用的实用函数。

## 语法

```javascript
import { useTemplateRef } from 'vue'

const inputRef = useTemplateRef('input')
```

## 参数

- `key`: 字符串，模板中 ref 的名称

## 返回值

返回一个与模板 ref 同步的 ref 对象

## 基础用法

```vue
<template>
  <input ref="inputRef" type="text" />
  <button @click="focus">聚焦</button>
</template>

<script setup>
import { useTemplateRef } from 'vue'

const inputRef = useTemplateRef('inputRef')

function focus() {
  inputRef.value?.focus()
}
</script>
```

## 等价于传统的 ref 写法

```vue
<!-- Vue 3.5 之前 -->
<template>
  <input ref="input" type="text" />
</template>

<script setup>
import { ref } from 'vue'

const input = ref(null)
</script>

<!-- Vue 3.5+ -->
<template>
  <input ref="inputRef" type="text" />
</template>

<script setup>
import { useTemplateRef } from 'vue'

const inputRef = useTemplateRef('inputRef')
</script>
```

## 多个模板引用

```vue
<template>
  <div>
    <input ref="usernameInput" type="text" placeholder="用户名" />
    <input ref="passwordInput" type="password" placeholder="密码" />
    <button @click="focusUsername">聚焦用户名</button>
    <button @click="focusPassword">聚焦密码</button>
  </div>
</template>

<script setup>
import { useTemplateRef } from 'vue'

const usernameInput = useTemplateRef('usernameInput')
const passwordInput = useTemplateRef('passwordInput')

function focusUsername() {
  usernameInput.value?.focus()
}

function focusPassword() {
  passwordInput.value?.focus()
}
</script>
```

## 访问组件实例

```vue
<template>
  <div>
    <ChildComponent ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>
  </div>
</template>

<script setup>
import { useTemplateRef } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = useTemplateRef('childRef')

function callChildMethod() {
  childRef.value?.childMethod()
  console.log(childRef.value?.childData)
}
</script>
```

## 与 v-for 结合使用

```vue
<template>
  <div>
    <div v-for="item in items" :key="item.id" :ref="el => setItemRef(el, item.id)">
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
])

const itemRefs = ref(new Map())

function setItemRef(el, id) {
  if (el) {
    itemRefs.value.set(id, el)
  } else {
    itemRefs.value.delete(id)
  }
}

onMounted(() => {
  console.log(itemRefs.value)
})
</script>
```

## TypeScript 支持

```vue
<template>
  <input ref="inputRef" type="text" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

// 指定 DOM 元素类型
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

// 指定组件类型
import MyComponent from './MyComponent.vue'
const componentRef = useTemplateRef<InstanceType<typeof MyComponent>>('componentRef')
</script>
```

## 实际应用场景

### 自动滚动到元素

```vue
<template>
  <div class="container">
    <button @click="scrollToBottom">滚动到底部</button>
    <div v-for="msg in messages" :key="msg.id" class="message">
      {{ msg.text }}
    </div>
    <div ref="bottomRef" class="bottom-marker"></div>
  </div>
</template>

<script setup>
import { useTemplateRef, nextTick } from 'vue'

const bottomRef = useTemplateRef('bottomRef')

async function scrollToBottom() {
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
```

### 视频播放器控制

```vue
<template>
  <div class="video-player">
    <video ref="videoRef" src="video.mp4"></video>
    <div class="controls">
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
      <button @click="restart">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { useTemplateRef } from 'vue'

const videoRef = useTemplateRef('videoRef')

function play() {
  videoRef.value?.play()
}

function pause() {
  videoRef.value?.pause()
}

function restart() {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
  }
}
</script>
```

### 动态创建的元素焦点管理

```vue
<template>
  <div>
    <button @click="addInput">添加输入框</button>
    <button @click="focusLast">聚焦最后一个</button>
    <div v-for="(input, index) in inputs" :key="input.id">
      <input
        :ref="el => setInputRef(el, input.id)"
        type="text"
        :placeholder="`输入框 ${index + 1}`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, useTemplateRef } from 'vue'

const inputs = ref([])
let idCounter = 0

const inputRefs = new Map()

function addInput() {
  inputs.value.push({ id: idCounter++ })
}

function setInputRef(el, id) {
  if (el) {
    inputRefs.set(id, el)
  }
}

function focusLast() {
  const lastInput = inputs.value[inputs.value.length - 1]
  if (lastInput) {
    inputRefs.get(lastInput.id)?.focus()
  }
}
</script>
```

## 注意事项

1. **Vue 3.5+ 专有**：此 API 仅在 Vue 3.5 及更高版本中可用

2. **初始值**：在组件挂载前，ref 的值为 null

3. **可选链**：使用 `?.` 操作符避免访问 null 时的错误

4. **仅限 setup**：只能在 `<script setup>` 或 `setup()` 函数中使用
