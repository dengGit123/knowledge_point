# resolveDirective

## 作用

`resolveDirective()` 用于在渲染函数中**按名称解析已注册的指令**。配合 `withDirectives()` 使用，将指令应用到 `h()` 创建的 VNode 上。

> [Vue 官方文档 - resolveDirective](https://cn.vuejs.org/api/render-function#resolvedirective)

## 函数签名

```typescript
function resolveDirective(name: string): Directive | undefined
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 指令的注册名称（不含 `v-` 前缀） |

**返回值：** 解析到的指令对象，如果未找到则返回 `undefined`。

## 基本用法

```javascript
import { h, resolveDirective, withDirectives } from 'vue'

export default {
  setup() {
    return () => {
      // 解析指令（注意：不含 v- 前缀）
      const vFocus = resolveDirective('focus')

      // 使用 withDirectives 将指令应用到 VNode
      return withDirectives(h('input'), [
        [vFocus, true]
      ])
    }
  }
}
```

## 使用场景

### 1. 解析全局注册的指令

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局注册自定义指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.directive('loading', {
  mounted(el, binding) {
    if (binding.value) {
      el.classList.add('is-loading')
    }
  },
  updated(el, binding) {
    el.classList.toggle('is-loading', binding.value)
  }
})

app.mount('#app')

// 在渲染函数中使用
import { h, resolveDirective, withDirectives } from 'vue'

export default {
  setup() {
    return () => {
      const vFocus = resolveDirective('focus')

      return withDirectives(h('input', { type: 'text' }), [
        [vFocus]
      ])
    }
  }
}
```

### 2. 带值的指令

```javascript
import { h, resolveDirective, withDirectives, ref } from 'vue'

export default {
  setup() {
    const isLoading = ref(false)

    return () => {
      const vLoading = resolveDirective('loading')

      return withDirectives(
        h('div', { class: 'content' }, '内容区域'),
        [
          [vLoading, isLoading.value]
        ]
      )
    }
  }
}
```

### 3. 带参数和修饰符的指令

```javascript
import { h, resolveDirective, withDirectives } from 'vue'

export default {
  setup() {
    return () => {
      const vTooltip = resolveDirective('tooltip')

      // withDirectives 数组格式：[directive, value, argument, modifiers]
      return withDirectives(
        h('button', '悬浮提示'),
        [
          [vTooltip, '点击提交', 'top', { delay: 500 }]
        ]
      )
    }
  }
}
```

### 4. 多个指令同时使用

```javascript
import { h, resolveDirective, withDirectives, ref } from 'vue'

export default {
  setup() {
    const isLoading = ref(false)

    return () => {
      const vFocus = resolveDirective('focus')
      const vLoading = resolveDirective('loading')
      const vPermission = resolveDirective('permission')

      return withDirectives(
        h('button', { type: 'submit' }, '提交'),
        [
          [vFocus],                        // 自动聚焦
          [vLoading, isLoading.value],     // 加载状态
          [vPermission, 'submit']          // 权限控制
        ]
      )
    }
  }
}
```

### 5. 动态指令选择

```javascript
import { h, resolveDirective, withDirectives, ref } from 'vue'

export default {
  props: {
    directiveName: {
      type: String,
      default: 'focus'
    }
  },
  setup(props) {
    return () => {
      // 根据名称动态解析指令
      const directive = resolveDirective(props.directiveName)

      if (directive) {
        return withDirectives(h('input'), [[directive]])
      }

      return h('input')
    }
  }
}
```

### 6. 条件性应用指令

```javascript
import { h, resolveDirective, withDirectives, ref } from 'vue'

export default {
  setup() {
    const isLoading = ref(false)
    const hasPermission = ref(true)

    return () => {
      const vLoading = resolveDirective('loading')
      const vPermission = resolveDirective('permission')

      // 构建指令数组
      const directives = []

      if (isLoading.value) {
        directives.push([vLoading, true])
      }

      if (!hasPermission.value) {
        directives.push([vPermission, 'admin'])
      }

      const vnode = h('div', '内容')

      return directives.length > 0
        ? withDirectives(vnode, directives)
        : vnode
    }
  }
}
```

## 与 withDirectives 配合的数组格式

```javascript
import { h, resolveDirective, withDirectives } from 'vue'

// withDirectives 的第二个参数是数组，每个元素是一个指令绑定
// 单个指令绑定格式：
// [directive]                 - 无值、无参数
// [directive, value]          - 有值
// [directive, value, arg]     - 有值、有参数
// [directive, value, arg, modifiers]  - 完整格式

const vnode = h('div', '内容')
const vMyDir = resolveDirective('my-directive')

withDirectives(vnode, [
  [vMyDir],                              // 无值
  [vMyDir, 'hello'],                     // 值: 'hello'
  [vMyDir, 'hello', 'top'],              // 值: 'hello', 参数: 'top'
  [vMyDir, 'hello', 'top', { delay: 500 }] // 完整格式
])
```

## 注意事项

### 1. 只能在 setup 或 render 中调用

```javascript
import { resolveDirective } from 'vue'

// ❌ 错误：不能在组件外部调用
const vFocus = resolveDirective('focus') // undefined

// ✅ 正确：在 setup() 中调用
export default {
  setup() {
    const vFocus = resolveDirective('focus')
    return () => withDirectives(h('input'), [[vFocus]])
  }
}
```

### 2. 名称不含 v- 前缀

```javascript
import { resolveDirective } from 'vue'

// ✅ 正确：不含 v- 前缀
resolveDirective('focus')
resolveDirective('loading')
resolveDirective('permission')

// ❌ 错误：不要加 v- 前缀
resolveDirective('v-focus') // 会找不到
```

### 3. 需要配合 withDirectives 使用

```javascript
import { h, resolveDirective, withDirectives } from 'vue'

export default {
  setup() {
    const vFocus = resolveDirective('focus')

    // ❌ 错误：不能直接传给 h()
    // h('input', { directives: [[vFocus]] })

    // ✅ 正确：通过 withDirectives 应用
    return () => withDirectives(h('input'), [[vFocus]])
  }
}
```

### 4. 解析失败返回 undefined

```javascript
import { h, resolveDirective, withDirectives } from 'vue'

export default {
  setup() {
    return () => {
      const vUnknown = resolveDirective('unknown-directive')

      // 如果指令未注册，返回 undefined
      if (!vUnknown) {
        console.warn('指令未找到')
        return h('div', '无指令')
      }

      return withDirectives(h('div'), [[vUnknown]])
    }
  }
}
```

## 最佳实践

1. **优先在模板中使用**：模板中可以直接使用 `v-focus` 等指令，比渲染函数更简洁
2. **只在渲染函数中使用**：`resolveDirective` 主要用于 `h()` 渲染函数中，模板中不需要
3. **检查返回值**：解析可能失败，使用前检查是否为 `undefined`
4. **名称不带前缀**：使用 `'focus'` 而非 `'v-focus'`
5. **与 withDirectives 配合**：`resolveDirective` 必须配合 `withDirectives` 才能将指令应用到 VNode
