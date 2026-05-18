# onDeactivated

## 作用

`onDeactivated()` 是 Vue 3 的生命周期钩子，用于被 `<keep-alive>` 缓存的组件。当组件被停用时调用。

## 基本用法

```javascript
import { onDeactivated } from 'vue'

onDeactivated(() => {
  console.log('组件被停用')
})
```

## 暂停定时器

```javascript
import { ref, onActivated, onDeactivated } from 'vue'

export default {
  setup() {
    const count = ref(0)
    let timer = null
    
    onActivated(() => {
      timer = setInterval(() => count.value++, 1000)
    })
    
    onDeactivated(() => {
      if (timer) {
        clearInterval(timer)
      }
    })
    
    return { count }
  }
}
```

## 保存滚动位置

```javascript
import { ref, onActivated, onDeactivated } from 'vue'

export default {
  setup() {
    const listRef = ref(null)
    const scrollPosition = ref(0)
    
    onDeactivated(() => {
      if (listRef.value) {
        scrollPosition.value = listRef.value.scrollTop
      }
    })
    
    onActivated(() => {
      if (listRef.value) {
        listRef.value.scrollTop = scrollPosition.value
      }
    })
    
    return { listRef }
  }
}
```
