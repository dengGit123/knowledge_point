# onErrorCaptured

## 作用

`onErrorCaptured()` 用于捕获来自后代组件的错误。

## 基本用法

```javascript
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.log('捕获到错误:', err)
  return false // 阻止错误继续传播
})
```

## 捕获子组件错误

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('错误:', err.message)
  console.error('来源:', info)
  return false
})
</script>

<template>
  <ChildComponent />
</template>
```

## 错误边界组件

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err.message
  return false
})

const reset = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div>
    <div v-if="hasError" class="error-boundary">
      <h3>出错了</h3>
      <p>{{ errorMessage }}</p>
      <button @click="reset">重试</button>
    </div>
    <slot v-else />
  </div>
</template>
```
