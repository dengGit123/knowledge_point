# resolveComponent

## 作用

`resolveComponent()` 用于解析异步组件，需要在 `setup()` 中调用。

## 基本用法

```javascript
import { resolveComponent, h } from 'vue'

export default {
  setup() {
    const Button = resolveComponent('MyButton')
    
    return () => h(Button, 'Click me')
  }
}
```

## 使用场景

### 1. 动态组件

```javascript
import { resolveComponent, h, computed } from 'vue'

export default {
  setup() {
    const componentName = computed(() => {
      return someCondition ? 'ButtonA' : 'ButtonB'
    })
    
    return () => {
      const Component = resolveComponent(componentName.value)
      return h(Component)
    }
  }
}
```

### 2. 渲染函数中使用

```javascript
import { resolveComponent, h } from 'vue'

export default {
  setup() {
    return () => {
      const Table = resolveComponent('DataTable')
      return h(Table, {
        data: tableData,
        columns: columns
      })
    }
  }
}
```

### 3. 插槽解析

```javascript
import { resolveComponent, h } from 'vue'

export default {
  setup() {
    return () => {
      const slotContent = this.$slots.default?.()
      
      return slotContent?.map(child => {
        if (child.type.name) {
          const Component = resolveComponent(child.type.name)
          return h(Component, child.props || {})
        }
        return child
      })
    }
  }
}
```
