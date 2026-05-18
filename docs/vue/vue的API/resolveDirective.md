# resolveDirective

## 作用

`resolveDirective()` 用于解析指令，需要在 `setup()` 中调用。

## 基本用法

```javascript
import { resolveDirective, h } from 'vue'

export default {
  setup() {
    const vFocus = resolveDirective('focus')
    
    return () => h('input', {
      directives: [[vFocus]]
    })
  }
}
```

## 使用场景

### 1. 动态指令

```javascript
import { resolveDirective, h, ref } from 'vue'

export default {
  setup() {
    const directiveName = ref('tooltip')
    
    return () => {
      const directive = resolveDirective(directiveName.value)
      return h('div', {
        directives: [[directive, { text: '提示' }]]
      })
    }
  }
}
```

### 2. 条件指令

```javascript
import { resolveDirective, h } from 'vue'

export default {
  setup() {
    return () => {
      const vLoading = resolveDirective('loading')
      
      return h('div', {
        directives: this.isLoading ? [[vLoading]] : []
      })
    }
  }
}
```
