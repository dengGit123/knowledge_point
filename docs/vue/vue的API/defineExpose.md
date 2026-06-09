# defineExpose

## 作用

> [Vue 官方文档 - defineExpose](https://cn.vuejs.org/api/sfc-script-setup#defineexpose)

`defineExpose()` 用于显式暴露组件的公共 API，当父组件通过模板引用访问子组件时可用。

## 基本用法

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// 默认情况下，<script setup> 中的组件是私有的
// 使用 defineExpose 显式暴露
defineExpose({
  count,
  increment
})
</script>

<!-- 父组件 -->
<script setup>
import ChildComponent from './ChildComponent.vue'
import { ref } from 'vue'

const childRef = ref(null)

function accessChild() {
  console.log(childRef.value.count)
  childRef.value.increment()
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="accessChild">访问子组件</button>
</template>
```

## 暴露方法

```vue
<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

// 暴露方法供父组件调用
defineExpose({
  open,
  close,
  isOpen
})
</script>
```

## 暴露计算属性

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('')
const lastName = ref('')

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

defineExpose({
  fullName
})
</script>
```

## 类型声明

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface ExposedMethods {
  validate: () => boolean
  reset: () => void
}

const formData = ref({})

const validate = () => {
  return Object.keys(formData.value).length > 0
}

const reset = () => {
  formData.value = {}
}

defineExpose<ExposedMethods>({
  validate,
  reset
})
</script>
```

## 使用场景

### 1. 表单验证

```vue
<!-- FormComponent.vue -->
<script setup>
import { ref } from 'vue'

const form = ref({
  username: '',
  email: ''
})

const validate = () => {
  return form.value.username.length > 0 && form.value.email.includes('@')
}

const reset = () => {
  form.value = { username: '', email: '' }
}

defineExpose({ validate, reset })
</script>

<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
import FormComponent from './FormComponent.vue'

const formRef = ref(null)

const handleSubmit = () => {
  if (formRef.value.validate()) {
    console.log('表单有效')
  }
}
</script>

<template>
  <FormComponent ref="formRef" />
  <button @click="handleSubmit">提交</button>
</template>
```

### 2. 对话框控制

```vue
<!-- Dialog.vue -->
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

const open = () => {
  isVisible.value = true
}

const close = () => {
  isVisible.value = false
}

defineExpose({ open, close })
</script>

<template>
  <div v-if="isVisible" class="dialog">
    <slot />
    <button @click="close">关闭</button>
  </div>
</template>
```
