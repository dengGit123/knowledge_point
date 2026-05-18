# watchPostEffect

## 作用

`watchPostEffect()` 是 `watchEffect()` 的别名，使用 `flush: 'post'` 选项，在组件更新后执行副作用。

## 基本用法

```javascript
import { watchPostEffect, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    watchPostEffect(() => {
      // 在 DOM 更新后执行
      console.log('count:', count.value)
      console.log('DOM 已更新，可以访问更新后的 DOM')
    })
    
    return { count }
  }
}
```

## 使用场景

### 1. DOM 操作

```javascript
import { watchPostEffect, ref } from 'vue'

export default {
  setup() {
    const elementRef = ref(null)
    
    watchPostEffect(() => {
      // 在 DOM 更新后操作
      if (elementRef.value) {
        elementRef.value.focus()
      }
    })
    
    return { elementRef }
  }
}
```

### 2. 测量 DOM 尺寸

```javascript
import { watchPostEffect, ref } from 'vue'

export default {
  setup() {
    const containerRef = ref(null)
    const height = ref(0)
    
    watchPostEffect(() => {
      if (containerRef.value) {
        height.value = containerRef.value.offsetHeight
      }
    })
    
    return { containerRef, height }
  }
}
```
