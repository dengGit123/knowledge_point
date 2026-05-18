# v-memo

## 作用

`v-memo` 是 Vue 3.2+ 新增的指令，用于跳过大型子树或 `v-for` 列表的更新。

## 基本用法

```vue
<template>
  <div v-memo="[valueA, valueB]">
    <!-- 只有当 valueA 或 valueB 改变时才更新 -->
    <p>{{ valueA }}</p>
    <p>{{ valueB }}</p>
    <p>{{ valueC }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const valueA = ref(1)
const valueB = ref(2)
const valueC = ref(3)
</script>
```

## 与 v-for 配合

```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <p>ID: {{ item.id }}</p>
    <p>名称: {{ item.name }}</p>
    <p>选中: {{ item.selected }}</p>
    <!-- 只有当 item.id 或 item.selected 改变时才更新 -->
  </div>
</template>
```

## 性能优化

```vue
<template>
  <!-- 复杂组件只在依赖变化时更新 -->
  <ExpensiveComponent 
    v-memo="[valueA, valueB]"
    :data="data"
    :config="config"
  />
</template>

<script setup>
import { ref } from 'vue'
const valueA = ref(1)
const valueB = ref(2)
const data = ref({})
const config = ref({})
</script>
```

## 注意事项

```vue
<template>
  <!-- ⚠️ 正确使用需要配合 v-for -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.name]">
    {{ item.content }}
  </div>
  
  <!-- 不推荐用于单个元素 -->
  <div v-memo="[value]">{{ value }}</div>
</template>
```
