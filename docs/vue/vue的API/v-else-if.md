# v-else-if

## 作用

`v-else-if` 表示 `v-if` 的"else if" 块，可以链式调用。

## 基本用法

```vue
<template>
  <div v-if="score >= 90">优秀</div>
  <div v-else-if="score >= 80">良好</div>
  <div v-else-if="score >= 60">及格</div>
  <div v-else>不及格</div>
</template>

<script setup>
import { ref } from 'vue'
const score = ref(85)
</script>
```

## 多条件分支

```vue
<template>
  <div v-if="userType === 'admin'">管理员</div>
  <div v-else-if="userType === 'moderator'">版主</div>
  <div v-else-if="userType === 'user'">普通用户</div>
  <div v-else>访客</div>
</template>

<script setup>
import { ref } from 'vue'
const userType = ref('admin')
</script>
```

## 与计算属性配合

```vue
<template>
  <div v-if="status === 'loading'">加载中...</div>
  <div v-else-if="status === 'error'">{{ error }}</div>
  <div v-else>{{ data }}</div>
</template>

<script setup>
import { ref } from 'vue'
const status = ref('loading')
const error = ref(null)
const data = ref(null)
</script>
```
