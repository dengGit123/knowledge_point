# cloneVNode

## 作用

`cloneVNode()` 克隆一个 VNode，允许在克隆时添加额外的 props 或覆盖现有的 props。

## 基本用法

```javascript
import { cloneVNode, h } from 'vue'

const original = h('div', { class: 'foo' }, 'Content')

const cloned = cloneVNode(original, { class: 'bar' })

// class 会合并为 'foo bar'
```

## 使用场景

### 1. 修改 VNode props

```javascript
import { h, cloneVNode } from 'vue'

export default {
  render() {
    const vnode = h('div', { class: 'base' }, this.$slots.default())
    
    // 克隆并添加额外 class
    return cloneVNode(vnode, { class: 'modified' })
  }
}
```

### 2. 条件属性

```javascript
import { cloneVNode } from 'vue'

export default {
  render() {
    const slot = this.$slots.default()
    
    if (this.disabled) {
      return cloneVNode(slot[0], { disabled: true })
    }
    
    return slot
  }
}
```

### 3. 批量修改

```javascript
import { cloneVNode } from 'vue'

export default {
  methods: {
    cloneAndModify(vnode, newProps) {
      return cloneVNode(vnode, newProps)
    }
  }
}
```
