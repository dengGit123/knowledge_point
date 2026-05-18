# isVNode

## 作用

`isVNode()` 检查一个值是否是 VNode（Vue 虚拟 DOM 节点）。

## 基本用法

```javascript
import { h, isVNode } from 'vue'

const vnode = h('div', 'Content')

console.log(isVNode(vnode)) // true
console.log(isVNode({})) // false
console.log(isVNode(null)) // false
```

## 使用场景

### 1. 类型检查

```javascript
import { isVNode } from 'vue'

function renderContent(content) {
  if (isVNode(content)) {
    return content
  }
  return h('span', content)
}
```

### 2. 插槽内容处理

```javascript
import { isVNode } from 'vue'

export default {
  render() {
    const slots = this.$slots.default()
    
    return slots.map(slot => {
      if (isVNode(slot)) {
        return slot
      }
      return h('span', String(slot))
    })
  }
}
```
