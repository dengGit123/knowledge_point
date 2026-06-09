# withDirectives

## 作用

`withDirectives()` 用于在渲染函数中将**一个或多个指令**应用到 VNode 上。这是在 `h()` 渲染函数中使用指令的唯一方式（模板中可以直接用 `v-xxx`）。

> [Vue 官方文档 - withDirectives](https://cn.vuejs.org/api/render-function#withdirectives)

## 函数签名

```typescript
function withDirectives(
  vnode: VNode,
  directives: DirectiveBinding[]
): VNode

// DirectiveBinding 数组格式：
// [directive]                             - 无值
// [directive, value]                      - 有值
// [directive, value, argument]            - 有值 + 参数
// [directive, value, argument, modifiers] // 完整格式
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `vnode` | `VNode` | 要应用指令的 VNode |
| `directives` | `Array` | 指令绑定数组 |

**返回值：** 传入的 VNode（已附加指令信息）。

## 基本用法

```javascript
import { h, withDirectives, resolveDirective } from 'vue'

export default {
  setup() {
    return () => {
      // 解析指令
      const vFocus = resolveDirective('focus')

      // 创建 VNode 并应用指令
      return withDirectives(h('input'), [
        [vFocus]
      ])
    }
  }
}
```

## 指令绑定格式详解

```javascript
import { h, withDirectives } from 'vue'

// 假设有以下已定义的指令对象
const vFocus = { /* focus 指令 */ }
const vTooltip = { /* tooltip 指令 */ }
const vLoading = { /* loading 指令 */ }
const vPermission = { /* permission 指令 */ }

// 1. 无值指令
withDirectives(h('input'), [
  [vFocus]
])
// 等同于模板中: <input v-focus />

// 2. 带值的指令
withDirectives(h('button'), [
  [vLoading, true]
])
// 等同于模板中: <button v-loading="true"></button>

// 3. 带参数的指令
withDirectives(h('div'), [
  [vTooltip, '提示内容', 'top']
])
// 等同于模板中: <div v-tooltip:top="'提示内容'"></div>

// 4. 带修饰符的指令
withDirectives(h('div'), [
  [vTooltip, '提示内容', 'top', { delay: 500 }]
])
// 等同于模板中: <div v-tooltip:top.delay="500"></div>

// 5. 完整格式
withDirectives(h('button'), [
  [vPermission, 'edit', 'role', { exact: true }]
])
// 等同于模板中: <button v-permission:role.exact="'edit'"></button>
```

## 使用场景

### 1. 应用多个指令

```javascript
import { h, withDirectives, resolveDirective, ref } from 'vue'

export default {
  setup() {
    const isLoading = ref(false)

    return () => {
      const vFocus = resolveDirective('focus')
      const vLoading = resolveDirective('loading')

      return withDirectives(
        h('input', { type: 'text', placeholder: '搜索...' }),
        [
          [vFocus],                       // 自动聚焦
          [vLoading, isLoading.value]     // 加载状态
        ]
      )
    }
  }
}
```

### 2. 条件性应用指令

```javascript
import { h, withDirectives, resolveDirective, ref } from 'vue'

export default {
  props: {
    autofocus: Boolean,
    loading: Boolean,
    disabled: Boolean
  },
  setup(props) {
    return () => {
      const vFocus = resolveDirective('focus')
      const vLoading = resolveDirective('loading')
      const vDisabled = resolveDirective('disabled')

      // 动态构建指令列表
      const directives = []

      if (props.autofocus) {
        directives.push([vFocus])
      }

      if (props.loading) {
        directives.push([vLoading, true])
      }

      if (props.disabled) {
        directives.push([vDisabled])
      }

      const vnode = h('input', { type: 'text' })

      // 有指令时应用，无指令时直接返回
      return directives.length > 0
        ? withDirectives(vnode, directives)
        : vnode
    }
  }
}
```

### 3. 直接使用指令对象（无需 resolveDirective）

```javascript
import { h, withDirectives } from 'vue'

// 直接定义指令对象
const focus = {
  mounted(el) {
    el.focus()
  }
}

const highlight = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'
  }
}

export default {
  setup() {
    return () => withDirectives(
      h('input', { type: 'text' }),
      [
        [focus],
        [highlight, 'lightblue']
      ]
    )
  }
}
```

### 4. 动态指令值

```javascript
import { h, withDirectives, ref } from 'vue'

const tooltip = {
  mounted(el, binding) {
    el.title = binding.value
  },
  updated(el, binding) {
    el.title = binding.value
  }
}

export default {
  setup() {
    const tooltipText = ref('默认提示')
    const position = ref('top')

    return () => withDirectives(
      h('button', '悬浮查看提示'),
      [
        [tooltip, tooltipText.value, position.value]
      ]
    )
  }
}
```

### 5. 封装带指令的组件

```javascript
import { h, withDirectives, resolveDirective } from 'vue'

// 创建带自动聚焦的输入框
function createAutoFocusInput(props = {}) {
  const vFocus = resolveDirective('focus')

  return withDirectives(
    h('input', {
      type: props.type || 'text',
      placeholder: props.placeholder || '',
      value: props.modelValue,
      onInput: (e) => props['onUpdate:modelValue']?.(e.target.value)
    }),
    [
      [vFocus]
    ]
  )
}

export default {
  setup() {
    const value = ref('')

    return () => h('div', [
      createAutoFocusInput({
        modelValue: value.value,
        'onUpdate:modelValue': (val) => { value.value = val },
        placeholder: '自动聚焦的输入框'
      })
    ])
  }
}
```

### 6. 高阶组件中透传指令

```javascript
import { h, withDirectives, resolveDirective, cloneVNode } from 'vue'

function withAutoFocus(WrappedComponent) {
  return {
    setup(props, { slots }) {
      return () => {
        const vFocus = resolveDirective('focus')
        const defaultSlot = slots.default?.()

        if (defaultSlot && defaultSlot.length > 0) {
          // 克隆插槽 VNode 并添加 focus 指令
          return withDirectives(
            cloneVNode(defaultSlot[0]),
            [[vFocus]]
          )
        }

        return h(WrappedComponent, props)
      }
    }
  }
}
```

### 7. 表单验证指令

```javascript
import { h, withDirectives, ref } from 'vue'

// 验证指令
const validate = {
  mounted(el, binding) {
    el.addEventListener('input', () => {
      const rules = binding.value
      const value = el.value
      let error = ''

      if (rules.required && !value) {
        error = rules.requiredMsg || '此字段必填'
      }

      el.setCustomValidity(error)
    })
  }
}

export default {
  setup() {
    const email = ref('')

    return () => withDirectives(
      h('input', {
        type: 'email',
        value: email.value,
        onInput: (e) => { email.value = e.target.value }
      }),
      [
        [validate, {
          required: true,
          requiredMsg: '请输入邮箱地址'
        }]
      ]
    )
  }
}
```

## 模板与渲染函数对照

```vue
<!-- 模板写法 -->
<template>
  <input
    v-focus
    v-loading="isLoading"
    v-tooltip:top.delay="500"
    v-permission:role.exact="'admin'"
  />
</template>
```

```javascript
// 等价的渲染函数写法
import { h, withDirectives, resolveDirective } from 'vue'

export default {
  setup() {
    const isLoading = ref(false)

    return () => {
      const vFocus = resolveDirective('focus')
      const vLoading = resolveDirective('loading')
      const vTooltip = resolveDirective('tooltip')
      const vPermission = resolveDirective('permission')

      return withDirectives(h('input'), [
        [vFocus],
        [vLoading, isLoading.value],
        [vTooltip, '500', 'top', { delay: true }],
        [vPermission, 'admin', 'role', { exact: true }]
      ])
    }
  }
}
```

## 注意事项

### 1. 只能用于 VNode

```javascript
import { withDirectives } from 'vue'

// ❌ 错误：不能用于 DOM 元素
// withDirectives(document.createElement('div'), [...])

// ✅ 正确：只能用于 h() 创建的 VNode
withDirectives(h('div'), [...])
```

### 2. 指令必须是对象或通过 resolveDirective 获取

```javascript
import { h, withDirectives, resolveDirective } from 'vue'

// ❌ 错误：不能传字符串
// withDirectives(h('div'), [['focus']])

// ✅ 正确方式一：通过 resolveDirective 解析
const vFocus = resolveDirective('focus')
withDirectives(h('input'), [[vFocus]])

// ✅ 正确方式二：直接传指令对象
const focusDirective = {
  mounted(el) { el.focus() }
}
withDirectives(h('input'), [[focusDirective]])
```

### 3. 会修改原始 VNode

```javascript
import { h, withDirectives } from 'vue'

const vnode = h('div', 'Content')

// withDirectives 会直接修改传入的 VNode 并返回它
const result = withDirectives(vnode, [...])
console.log(result === vnode) // true（同一个引用）
```

### 4. 在 setup 中使用

```javascript
import { h, withDirectives, resolveDirective } from 'vue'

// ❌ 不能在 setup 外部调用 resolveDirective
// const vFocus = resolveDirective('focus') // 无效

// ✅ 在 setup 的渲染函数中使用
export default {
  setup() {
    return () => {
      const vFocus = resolveDirective('focus')
      return withDirectives(h('input'), [[vFocus]])
    }
  }
}
```

## 最佳实践

1. **模板优先**：能用模板就用模板，模板中可以直接使用 `v-xxx`，更简洁
2. **配合 resolveDirective**：在渲染函数中使用 `resolveDirective` 解析已注册的指令
3. **动态构建指令列表**：根据条件动态构建指令数组，实现条件性指令
4. **直接定义指令对象**：局部使用的指令可以直接定义对象，不需要全局注册
5. **注意返回值**：`withDirectives` 返回的是同一个 VNode 引用（原地修改）
