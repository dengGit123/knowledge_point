# v-pre

## 作用

`v-pre` 跳过这个元素及其所有子元素的编译过程，用于显示原始 Mustache 标签。

## 基本用法

```vue
<template>
  <!-- 直接显示 {{ message }} 而不编译 -->
  <span v-pre>{{ 这将被显示为原始内容 }}</span>
</template>
```

## 使用场景

### 1. 展示代码示例

```vue
<template>
  <div>
    <p>正常内容：{{ message }}</p>
    <pre v-if><code>{{ message }}</code></pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello Vue')
</script>
```

### 2. 文档示例

```vue
<template>
  <div class="doc-example">
    <h3>代码示例：</h3>
    <pre v-pre><code>&lt;div&gt;{{ message }}&lt;/div&gt;</code></pre>
  </div>
</template>
```
