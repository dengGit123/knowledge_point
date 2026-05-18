# onRenderTriggered

## 作用

`onRenderTriggered()` 是一个调试钩子，在渲染函数因依赖变化而触发重新渲染时调用。仅在开发模式下工作。

## 基本用法

```javascript
import { onRenderTriggered, ref } from 'vue'

export default {
  setup() {
    onRenderTriggered((e) => {
      console.log('触发重新渲染:', e.target)
      console.log('旧值:', e.oldValue)
      console.log('新值:', e.newValue)
    })
    
    const count = ref(0)
    return { count }
  }
}
```

## 调试信息

```javascript
import { onRenderTriggered } from 'vue'

export default {
  setup() {
    onRenderTriggered(({ key, target, type, oldValue, newValue }) => {
      console.table({
        key,
        target,
        type,
        oldValue,
        newValue
      })
    })
  }
}
```
