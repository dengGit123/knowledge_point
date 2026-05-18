# watchSyncEffect

## 作用

`watchSyncEffect()` 是 `watchEffect()` 的别名，使用 `flush: 'sync'` 选项，强制效果始终同步触发。

## 基本用法

```javascript
import { watchSyncEffect, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    watchSyncEffect(() => {
      // 同步执行，不等待 DOM 更新
      console.log('count:', count.value)
    })
    
    return { count }
  }
}
```

## 使用场景

### 1. 计算属性同步更新

```javascript
import { watchSyncEffect, ref } from 'vue'

export default {
  setup() {
    const source = ref(0)
    const result = ref(0)
    
    watchSyncEffect(() => {
      result.value = source.value * 2
    })
    
    return { source, result }
  }
}
```

### 2. 状态同步

```javascript
import { watchSyncEffect } from 'vue'

export default {
  setup() {
    const localState = ref({})
    
    watchSyncEffect(() => {
      // 同步到 localStorage
      localStorage.setItem('state', JSON.stringify(localState.value))
    })
    
    return { localState }
  }
}
```
