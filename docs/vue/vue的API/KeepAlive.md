# KeepAlive

## 作用

`<KeepAlive>` 是一个内置组件，用于缓存组件实例，而不是在切换时销毁它们。

## 基本用法

```vue
<script setup>
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'
import { ref } from 'vue'

const currentTab = ref('A')
</script>

<template>
  <div>
    <button @click="currentTab = 'A'">A</button>
    <button @click="currentTab = 'B'">B</button>
    
    <KeepAlive>
      <ComponentA v-if="currentTab === 'A'" />
      <ComponentB v-else-if="currentTab === 'B'" />
    </KeepAlive>
  </div>
</template>
```

## include 和 exclude

```vue
<template>
  <!-- 只缓存 A 和 B 组件 -->
  <KeepAlive include="ComponentA,ComponentB">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- 不缓存 NoCache 组件 -->
  <KeepAlive exclude="NoCache">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- 使用正则 -->
  <KeepAlive include="/^Component/">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- 使用数组 -->
  <KeepAlive :include="['ComponentA', 'ComponentB']">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

## max 限制

```vue
<template>
  <!-- 最多缓存 10 个组件实例 -->
  <KeepAlive :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

## 生命周期钩子

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log('组件被激活')
})

onDeactivated(() => {
  console.log('组件被停用')
})
</script>
```
