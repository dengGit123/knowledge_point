# v-else

## 作用

`v-else` 必须紧跟在带 `v-if` 或 `v-else-if` 的元素之后，表示"否则"条件。

## 基本用法

```vue
<template>
  <div v-if="isLoggedIn">欢迎回来</div>
  <div v-else>请先登录</div>
</template>

<script setup>
import { ref } from 'vue'
const isLoggedIn = ref(true)
</script>
```

## 多条件分支

```vue
<template>
  <div v-if="status === 'loading'">加载中...</div>
  <div v-else-if="status === 'error'">加载失败</div>
  <div v-else-if="status === 'empty'">暂无数据</div>
  <div v-else>加载完成</div>
</template>

<script setup>
import { ref } from 'vue'
const status = ref('loading')
</script>
```

## 注意事项

```vue
<template>
  <!-- ❌ 错误：v-else 必须紧跟 v-if 或 v-else-if -->
  <div v-if="condition">A</div>
  <p>中间内容</p>
  <div v-else>B</div>
  
  <!-- ✅ 正确 -->
  <div v-if="condition">A</div>
  <div v-else>B</div>
</template>
```
