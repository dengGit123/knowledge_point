# onRenderTracked

## 作用

`onRenderTracked()` 是一个调试钩子，在渲染函数追踪依赖时调用。仅在开发模式下工作。

> 参考：[Vue 官方文档 - onRenderTracked](https://cn.vuejs.org/api/composition-api-lifecycle#onrendertracked)

## 基本用法

```javascript
import { onRenderTracked, ref } from 'vue'

export default {
  setup() {
    onRenderTracked((e) => {
      console.log('追踪的依赖:', e.target)
      console.log('依赖类型:', e.type)
    })
    
    const count = ref(0)
    return { count }
  }
}
```

## 调试信息

```javascript
import { onRenderTracked } from 'vue'

export default {
  setup() {
    onRenderTracked(({ key, target, type }) => {
      console.log({
        key: key,
        target: target,
        type: type // 'get' 或 'set'
      })
    })
  }
}
```
