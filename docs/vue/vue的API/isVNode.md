# isVNode

## 作用

`isVNode()` 检查一个值是否为 Vue 的 VNode（虚拟 DOM 节点）对象。主要用于在渲染函数或工具函数中进行类型判断。

> [Vue 官方文档 - 渲染函数 API](https://cn.vuejs.org/api/render-function)

## 函数签名

```typescript
function isVNode(value: unknown): boolean
```

## 基本用法

```javascript
import { h, isVNode } from 'vue'

const vnode = h('div', 'Content')

console.log(isVNode(vnode))  // true
console.log(isVNode({}))     // false
console.log(isVNode(null))   // false
console.log(isVNode('text')) // false
console.log(isVNode(123))    // false
```

## VNode 的结构

```javascript
import { h, isVNode } from 'vue'

const vnode = h('div', { class: 'container', id: 'app' }, [
  h('span', '子节点')
])

if (isVNode(vnode)) {
  console.log(vnode.type)       // 'div'（标签名或组件）
  console.log(vnode.props)      // { class: 'container', id: 'app' }
  console.log(vnode.children)   // [VNode]（子节点数组）
  console.log(vnode.key)        // null 或 key 值
  console.log(vnode.el)         // null（尚未挂载）或 DOM 元素
}
```

## 使用场景

### 1. 渲染函数中的内容处理

```javascript
import { h, isVNode, Text } from 'vue'

export default {
  props: {
    content: [String, Object, Array]
  },
  setup(props) {
    return () => {
      // 统一处理不同类型的内容
      if (isVNode(props.content)) {
        return props.content
      }

      if (typeof props.content === 'string') {
        return h('span', props.content)
      }

      if (Array.isArray(props.content)) {
        return h('div', props.content)
      }

      return null
    }
  }
}
```

### 2. 插槽内容过滤

```javascript
import { h, isVNode, Comment, Text, Fragment } from 'vue'

export default {
  setup(_, { slots }) {
    return () => {
      if (!slots.default) return null

      const children = slots.default()

      // 过滤出有效的 VNode（排除注释节点）
      const validChildren = children.filter(child => {
        return isVNode(child) && child.type !== Comment
      })

      return h('div', validChildren)
    }
  }
}
```

### 3. 条件渲染工具

```javascript
import { h, isVNode, Fragment } from 'vue'

// 安全包装内容为 VNode
function ensureVNode(content) {
  if (isVNode(content)) {
    return content
  }

  if (content === null || content === undefined) {
    return null
  }

  if (Array.isArray(content)) {
    return h(Fragment, content)
  }

  // 字符串或数字 → 文本 VNode
  return h(String(content))
}

export default {
  props: {
    title: [String, Object]
  },
  setup(props) {
    return () => h('div', [
      ensureVNode(props.title),
      h('p', '其他内容')
    ])
  }
}
```

### 4. 高阶组件中的类型判断

```javascript
import { h, isVNode, cloneVNode } from 'vue'

function withWrapper(WrappedComponent) {
  return {
    setup(props, { slots }) {
      return () => {
        const defaultSlot = slots.default?.()

        if (defaultSlot) {
          const children = defaultSlot
            .filter(isVNode)
            .map(child => cloneVNode(child, { class: 'wrapped-item' }))

          return h(WrappedComponent, props, () => children)
        }

        return h(WrappedComponent, props, slots)
      }
    }
  }
}
```

### 5. 调试渲染函数

```javascript
import { h, isVNode } from 'vue'

function debugVNode(vnode, depth = 0) {
  const indent = '  '.repeat(depth)

  if (!isVNode(vnode)) {
    console.log(`${indent}Not a VNode:`, vnode)
    return
  }

  const type = typeof vnode.type === 'string'
    ? vnode.type
    : vnode.type?.name || 'Component'

  console.log(`${indent}<${type}>`)

  if (vnode.children) {
    if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => debugVNode(child, depth + 1))
    } else if (isVNode(vnode.children)) {
      debugVNode(vnode.children, depth + 1)
    } else {
      console.log(`${indent}  text: "${vnode.children}"`)
    }
  }
}

// 使用
const vnode = h('div', [
  h('h1', '标题'),
  h('p', '内容')
])
debugVNode(vnode)
```

### 6. 消息/通知组件

```javascript
import { h, isVNode, createVNode, render } from 'vue'

const notificationContainer = document.getElementById('notifications')

function notify(message, options = {}) {
  let content

  if (isVNode(message)) {
    content = message
  } else if (typeof message === 'string') {
    content = h('p', message)
  } else {
    content = h('p', String(message))
  }

  const vnode = h(NotificationItem, {
    ...options,
    onClose() {
      render(null, container)
    }
  }, {
    default: () => content
  })

  const container = document.createElement('div')
  render(vnode, container)
  notificationContainer.appendChild(container)
}

// 使用
notify('操作成功')
notify(h('strong', { style: 'color: red' }, '警告信息'))
```

## 注意事项

### 1. 注释节点也是 VNode

```javascript
import { h, Comment, isVNode } from 'vue'

const comment = h(Comment, '这是一条注释')

console.log(isVNode(comment)) // true
// Comment 节点也是 VNode，需要注意过滤
```

### 2. 文本节点也是 VNode

```javascript
import { h, Text, isVNode } from 'vue'

const textNode = h(Text, '纯文本')

console.log(isVNode(textNode)) // true
```

### 3. Fragment 也是 VNode

```javascript
import { h, Fragment, isVNode } from 'vue'

const fragment = h(Fragment, [
  h('p', '段落一'),
  h('p', '段落二')
])

console.log(isVNode(fragment)) // true
```

### 4. 基本类型不是 VNode

```javascript
import { isVNode } from 'vue'

console.log(isVNode('文本'))    // false
console.log(isVNode(123))      // false
console.log(isVNode(true))     // false
console.log(isVNode(null))     // false
console.log(isVNode(undefined)) // false
```

## 最佳实践

1. **渲染函数中使用**：在渲染函数中判断内容类型，统一处理不同输入
2. **过滤插槽内容**：结合 `Comment` 类型过滤掉注释节点，只保留有效内容
3. **工具函数**：创建 `ensureVNode` 等工具函数，将各种类型安全转换为 VNode
4. **调试辅助**：递归遍历 VNode 树进行调试
5. **类型守卫**：在 TypeScript 中用作类型守卫，缩小类型范围
