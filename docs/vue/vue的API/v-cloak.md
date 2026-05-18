# v-cloak

## 作用

`v-cloak` 保留在元素上直到关联组件实例编译完成。常用于配合 CSS 规则隐藏未编译的 Mustache 标签。

## 基本用法

```vue
<template>
  <div v-cloak>{{ message }}</div>
</template>

<style>
[v-cloak] {
  display: none;
}
</style>
```

## 使用场景

### 1. 防止页面闪烁

```vue
<!-- 在 index.html 中 -->
<style>
[v-cloak] {
  display: none;
}
</style>

<div id="app" v-cloak>
  {{ message }}
</div>
```

### 2. 加载状态

```vue
<template>
  <div v-cloak v-if="!isReady">加载中...</div>
  <div v-else>{{ content }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const isReady = ref(false)
const content = ref('')

onMounted(async () => {
  content.value = await fetchData()
  isReady.value = true
})
</script>
```
