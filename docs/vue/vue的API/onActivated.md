# onActivated

## 作用

`onActivated()` 是 Vue 3 的生命周期钩子，用于被 `<keep-alive>` 缓存的组件。当组件被激活时调用。

> 参考：[Vue 官方文档 - onActivated](https://cn.vuejs.org/api/composition-api-lifecycle#onactivated)

## 基本用法

```javascript
import { onActivated } from 'vue'

onActivated(() => {
  console.log('组件被激活')
})
```

## 与 keep-alive 配合

```vue
<template>
  <keep-alive>
    <MyComponent v-if="show" />
  </keep-alive>
  <button @click="show = !show">切换</button>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>
```

## 刷新数据

```javascript
import { ref, onActivated } from 'vue'

export default {
  setup() {
    const data = ref(null)
    
    onActivated(async () => {
      const response = await fetch('/api/data')
      data.value = await response.json()
    })
    
    return { data }
  }
}
```

## 恢复滚动位置

```javascript
import { ref, onActivated, onDeactivated } from 'vue'

export default {
  setup() {
    const listRef = ref(null)
    const scrollPosition = ref(0)
    
    onActivated(() => {
      if (listRef.value) {
        listRef.value.scrollTop = scrollPosition.value
      }
    })
    
    onDeactivated(() => {
      if (listRef.value) {
        scrollPosition.value = listRef.value.scrollTop
      }
    })
    
    return { listRef }
  }
}
```
