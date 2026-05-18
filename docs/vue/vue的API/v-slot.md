# v-slot

## 作用

`v-slot` 用于具名插槽和作用域插槽，是 `slot` 属性的缩写。

## 基本用法

```vue
<!-- 子组件 -->
<template>
  <div>
    <slot name="header">默认头部</slot>
    <slot name="footer">默认底部</slot>
  </div>
</template>

<!-- 父组件使用 -->
<template>
  <MyComponent>
    <template v-slot:header>
      <h1>自定义头部</h1>
    </template>
    
    <template v-slot:footer>
      <p>自定义底部</p>
    </template>
  </MyComponent>
</template>
```

## 缩写形式

```vue
<!-- # 是 v-slot: 的缩写 -->
<MyComponent>
  <template #header>
    <h1>头部</h1>
  </template>
  
  <template #default>
    <p>默认内容</p>
  </template>
</MyComponent>
```

## 作用域插槽

```vue
<!-- 子组件 -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="item.id">
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>

<!-- 父组件使用 -->
<template>
  <MyList :items="list">
    <template #default="{ item, index }">
      <strong>{{ index }}: {{ item.name }}</strong>
    </template>
  </MyList>
</template>
```

## 动态插槽

```vue
<template>
  <MyComponent>
    <template v-slot:[dynamicSlot]>
      动态插槽内容
    </template>
  </MyComponent>
</template>

<script setup>
import { ref } from 'vue'
const dynamicSlot = ref('header')
</script>
```
