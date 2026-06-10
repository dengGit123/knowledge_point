# cloneVNode

## 作用

`cloneVNode()` 用于克隆一个已有的 VNode（虚拟 DOM 节点），并可在克隆时合并额外的 props。

VNode 应被视为**不可变的**，不应直接修改已有 VNode 的 props，而应通过 `cloneVNode()` 创建带有不同属性的新副本。

📖 [Vue 官方文档 - cloneVNode](https://cn.vuejs.org/api/render-function#clonevnode)

## 函数签名

```typescript
function cloneVNode<T extends VNode>(
  vnode: T,
  extraProps?: object & VNodeProps,
  mergeRef?: boolean
): T
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `vnode` | `VNode` | 需要克隆的原始 VNode |
| `extraProps` | `object` | 可选，要合并到克隆 VNode 上的额外 props |
| `mergeRef` | `boolean` | 可选，是否合并 `ref`，默认为 `false`（新的 `ref` 会覆盖原始的） |

**返回值：** 一个新的 VNode，与原始 VNode 具有相同的类型和子节点，但合并了额外的 props。

## 基本用法

```javascript
import { cloneVNode, h } from 'vue'

const original = h('div', { class: 'foo' }, 'Content')

// 克隆并合并额外的 class
const cloned = cloneVNode(original, { class: 'bar' })

// cloned 的 class 会合并为 'foo bar'
```

## Props 合并规则

`cloneVNode` 在合并 props 时，会按照以下规则处理：

### 1. class 合并

```javascript
import { cloneVNode, h } from 'vue'

const vnode = h('div', { class: 'base' })

// class 会被合并，而不是覆盖
const cloned = cloneVNode(vnode, { class: 'extra' })
// 结果：class="base extra"
```

### 2. style 合并

```javascript
import { cloneVNode, h } from 'vue'

const vnode = h('div', { style: { color: 'red' } })

// style 对象会被合并
const cloned = cloneVNode(vnode, { style: { fontSize: '14px' } })
// 结果：style="color: red; font-size: 14px;"
```

### 3. 事件监听器合并

```javascript
import { cloneVNode, h } from 'vue'

const vnode = h('button', {
  onClick: () => console.log('原始点击')
})

// 事件监听器会被合并为一个数组，两个都会执行
const cloned = cloneVNode(vnode, {
  onClick: () => console.log('额外点击')
})
// 点击按钮时，两个回调都会执行
```

### 4. 其他属性覆盖

```javascript
import { cloneVNode, h } from 'vue'

const vnode = h('input', { id: 'old-id', placeholder: '旧提示' })

// 普通属性（非 class / style / 事件）会被覆盖
const cloned = cloneVNode(vnode, { id: 'new-id' })
// 结果：id="new-id"，placeholder="旧提示" 保持不变
```

### 5. ref 的处理

```javascript
import { cloneVNode, h, ref } from 'vue'

const ref1 = ref(null)
const ref2 = ref(null)

const vnode = h('div', { ref: ref1 })

// 默认情况下，新的 ref 会覆盖旧的
const cloned = cloneVNode(vnode, { ref: ref2 })

// 如果传入 mergeRef = true，ref 会被合并（都指向同一个 DOM 元素）
const mergedRef = cloneVNode(vnode, { ref: ref2 }, true)
```

## 使用场景

### 1. 为插槽内容添加额外属性

```javascript
import { h, cloneVNode } from 'vue'

export default {
  setup(props, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : []

      return h('div', children.map(child =>
        cloneVNode(child, { class: 'slot-item' })
      ))
    }
  }
}
```

### 2. 条件性地修改 VNode

```javascript
import { h, cloneVNode } from 'vue'

export default {
  props: {
    disabled: Boolean
  },
  setup(props, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : []

      if (props.disabled) {
        // 为所有子 VNode 添加 disabled 属性
        return h(
          'div',
          { class: 'disabled-wrapper' },
          children.map(child => cloneVNode(child, { disabled: true }))
        )
      }

      return h('div', children)
    }
  }
}
```

### 3. 包装组件时透传 props

```javascript
import { h, cloneVNode } from 'vue'
import BaseButton from './BaseButton.vue'

export default {
  props: {
    size: {
      type: String,
      default: 'medium'
    }
  },
  setup(props, { slots, attrs }) {
    return () => {
      const buttonVNode = h(BaseButton, {
        ...attrs,
        class: [`btn-${props.size}`]
      })

      // 克隆并追加额外样式
      return cloneVNode(buttonVNode, {
        class: 'enhanced-button'
      })
    }
  }
}
```

### 4. 列表渲染中添加唯一 key

```javascript
import { h, cloneVNode } from 'vue'

export default {
  setup(props, { slots }) {
    return () => {
      const items = [1, 2, 3]
      const children = slots.default ? slots.default() : []

      return h('ul', items.map((item, index) =>
        cloneVNode(children[0] || h('li'), { key: item })
      ))
    }
  }
}
```

### 5. 动态添加事件处理

```javascript
import { h, cloneVNode, ref } from 'vue'

export default {
  setup(props, { slots }) {
    const isHovered = ref(false)

    return () => {
      const children = slots.default ? slots.default() : []

      return children.map(child =>
        cloneVNode(child, {
          onMouseenter: () => { isHovered.value = true },
          onMouseleave: () => { isHovered.value = false }
        })
      )
    }
  }
}
```

### 6. 高阶组件中增强 VNode

```javascript
import { h, cloneVNode } from 'vue'

function withAccessibility(WrappedComponent) {
  return {
    setup(props, { slots, attrs }) {
      return () => {
        const vnode = h(WrappedComponent, { ...attrs, ...props })

        return cloneVNode(vnode, {
          role: 'button',
          tabindex: '0',
          'aria-label': props.label || '可交互元素',
          onKeydown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              // 触发点击
              attrs.onClick?.()
            }
          }
        })
      }
    }
  }
}
```

### 7. 批量修改插槽 VNode

```javascript
import { h, cloneVNode } from 'vue'

export default {
  props: {
    gap: {
      type: String,
      default: '8px'
    }
  },
  setup(props, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : []

      return h(
        'div',
        { style: { display: 'flex', gap: props.gap } },
        children.map(child =>
          cloneVNode(child, { class: 'flex-item' })
        )
      )
    }
  }
}
```

## 注意事项

### 1. VNode 是不可变的

```javascript
import { h, cloneVNode } from 'vue'

const vnode = h('div', { class: 'original' })

// ❌ 不要直接修改 VNode 的 props
// vnode.props.class = 'modified' // 不推荐

// ✅ 使用 cloneVNode 创建新副本
const newVnode = cloneVNode(vnode, { class: 'modified' })
```

### 2. 克隆是浅拷贝

```javascript
import { h, cloneVNode } from 'vue'

const vnode = h('div', { class: 'container' }, [
  h('span', '子节点1'),
  h('span', '子节点2')
])

// 克隆后的 VNode 与原始 VNode 共享相同的子节点引用
const cloned = cloneVNode(vnode, { class: 'extra' })
// cloned.children 和 vnode.children 指向同一个数组
```

### 3. 子节点不会被合并

```javascript
import { h, cloneVNode } from 'vue'

const vnode = h('div', { class: 'wrapper' }, '原始内容')

// extraProps 只合并 props，不会替换子节点
const cloned = cloneVNode(vnode, { class: 'extra' })
// cloned 的子节点仍然是 '原始内容'
```

### 4. 与 mergeProps 的关系

```javascript
import { h, cloneVNode, mergeProps } from 'vue'

const vnode = h('div', { class: 'base', onClick: () => {} })

// cloneVNode 内部使用 mergeProps 来合并 props
// 以下两种方式效果相同：

// 方式一：cloneVNode（推荐）
const cloned = cloneVNode(vnode, { class: 'extra' })

// 方式二：手动合并后创建新 VNode（不推荐，更繁琐）
const mergedProps = mergeProps(vnode.props || {}, { class: 'extra' })
```

### 5. 保留原始 VNode 的类型信息

```javascript
import { h, cloneVNode } from 'vue'
import MyComponent from './MyComponent.vue'

// 克隆组件 VNode 时，会保留组件类型
const componentVNode = h(MyComponent, { msg: 'hello' })
const cloned = cloneVNode(componentVNode, { extra: 'value' })

// cloned.type 仍然是 MyComponent
```

### 6. 不要克隆同一个 VNode 多次产生相同 key

```javascript
import { h, cloneVNode } from 'vue'

const vnode = h('div', { key: 'unique' })

// ❌ 克隆后可能产生重复 key（在列表中使用时）
const list = [
  cloneVNode(vnode),
  cloneVNode(vnode) // key 重复
]

// ✅ 为每个克隆设置不同的 key
const list = [
  cloneVNode(vnode, { key: 'a' }),
  cloneVNode(vnode, { key: 'b' })
]
```

## 最佳实践

1. **优先使用 cloneVNode 而非直接修改**：VNode 是不可变的，始终通过 `cloneVNode` 创建修改后的副本
2. **利用合并特性**：`class`、`style`、事件监听器会智能合并，无需手动处理
3. **列表渲染注意 key**：在循环中克隆同一个 VNode 时，务必为每个副本指定唯一的 `key`
4. **与渲染函数配合**：`cloneVNode` 通常在自定义渲染函数或高阶组件中使用
5. **配合 TypeScript**：`cloneVNode` 保留了原始 VNode 的类型信息，可以安全地用于泛型场景
