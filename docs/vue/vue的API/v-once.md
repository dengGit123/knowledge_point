# v-once

## 作用

`v-once` 只渲染元素和组件一次。随后的重新渲染，元素/组件及其所有子节点将被视为静态内容并跳过。

## 基本用法

```vue
<template>
  <!-- 只渲染一次，即使 data 改变也不会更新 -->
  <span v-once>{{ message }}</span>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello')
</script>
```

## 使用场景

### 1. 静态内容优化

```vue
<template>
  <div>
    <!-- 这些内容不会更新 -->
    <h1 v-once>{{ title }}</h1>
    <p v-once>{{ description }}</p>
    
    <!-- 这个会正常更新 -->
    <p>{{ currentTime }}</p>
  </div>
</template>
```

### 2. 大量列表优化

```vue
<template>
  <div>
    <h3 v-once>静态标题</h3>
    <ul>
      <li v-for="item in list" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
```

### 3. 组件只渲染一次

```vue
<template>
  <!-- MyComponent 只会渲染一次 -->
  <MyComponent v-once :data="initialData" />
  
  <!-- 这个会正常更新 -->
  <MyComponent :data="dynamicData" />
</template>
```
