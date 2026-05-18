# withDirectives

## 作用

`withDirectives()` 用于将自定义指令应用到 VNode 上。

## 基本用法

```javascript
import { h, withDirectives } from 'vue'

export default {
  setup() {
    return () => {
      const vnode = h('div', 'Content')
      
      return withDirectives(vnode, [
        [clickOutside, { handler: handleClick }]
      ])
    }
  }
}
```

## 使用场景

### 1. 应用多个指令

```javascript
import { h, withDirectives } from 'vue'

export default {
  setup() {
    return () => {
      const vnode = h('input')
      
      return withDirectives(vnode, [
        [focus],
        [tooltip, { text: '请输入用户名' }]
      ])
    }
  }
}
```

### 2. 条件指令

```javascript
import { h, withDirectives } from 'vue'

export default {
  setup() {
    const isLoading = ref(false)
    
    return () => {
      const vnode = h('button', 'Click me')
      
      const directives = []
      if (isLoading.value) {
        directives.push([loading])
      }
      
      return withDirectives(vnode, directives)
    }
  }
}
```

### 3. 动态指令值

```javascript
import { h, withDirectives } from 'vue'

export default {
  setup() {
    const tooltipText = ref('提示内容')
    
    return () => {
      const vnode = h('div', 'Hover me')
      
      return withDirectives(vnode, [
        [tooltip, { text: tooltipText.value }]
      ])
    }
  }
}
```
