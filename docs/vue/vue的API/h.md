# h - 渲染函数

## 作用
`h()` 是 Vue 3 的渲染函数，用于创建虚拟 DOM 节点（VNode）。它是 `hyperscript` 的缩写，主要用于编程式地创建模板结构。

## 用法

### 基本用法

```javascript
import { h } from 'vue'

export default {
  render() {
    return h('div', 'Hello World')
  }
}

// 或者
export default {
  setup() {
    return () => h('div', 'Hello World')
  }
}
```

### 创建带有属性的元素

```javascript
import { h } from 'vue'

export default {
  render() {
    return h('div', {
      class: 'container',
      id: 'app',
      onClick: () => console.log('clicked')
    }, 'Content')
  }
}
```

### 创建带有子元素的元素

```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => h('div', { class: 'container' }, [
      h('h1', 'Title'),
      h('p', 'Paragraph'),
      h('button', { onClick: () => console.log('clicked') }, 'Click')
    ])
  }
}
```

### 创建组件

```javascript
import { h } from 'vue'
import MyComponent from './MyComponent.vue'

export default {
  setup() {
    return () => h(MyComponent, {
      message: 'Hello',
      count: 0
    })
  }
}
```

### VNode 数据对象

```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => h('div', {
      // 属性
      id: 'unique-id',
      class: ['static-class', { 'dynamic-class': true }],
      style: { color: 'red', fontSize: '14px' },

      // Props
      customProp: 'value',

      // 事件
      onClick: (event) => console.log('clicked', event),
      onKeyup: (event) => console.log('key up', event.key),

      // 特殊属性
      key: 'unique-key',
      ref: 'element-ref'
    }, 'Content')
  }
}
```

### 插槽处理

```javascript
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => h('div', [
      // 默认插槽
      slots.default ? slots.default() : 'Default content',

      // 具名插槽
      slots.header ? slots.header() : h('h2', 'Default Header'),

      // 作用域插槽
      slots.item ? slots.item({ item: { id: 1, name: 'Item' } }) : null
    ])
  }
}
```

### 函数式组件

```javascript
import { h } from 'vue'

const FunctionalComponent = (props, { slots, emit, attrs }) => {
  return h('div', {
    ...attrs,
    onClick: () => emit('click')
  }, slots.default ? slots.default() : 'Content')
}

FunctionalComponent.props = {
  message: String
}

FunctionalComponent.emits = ['click']
```

### 动态组件

```javascript
import { h, ref } from 'vue'

const components = {
  home: () => h('div', 'Home'),
  about: () => h('div', 'About'),
  contact: () => h('div', 'Contact')
}

export default {
  setup() {
    const currentView = ref('home')

    return () => h('div', [
      h('button', { onClick: () => currentView.value = 'home' }, 'Home'),
      h('button', { onClick: () => currentView.value = 'about' }, 'About'),
      h(components[currentView.value])
    ])
  }
}
```

### Fragment（多个根节点）

```javascript
import { h, Fragment } from 'vue'

export default {
  setup() {
    return () => h(Fragment, [
      h('h1', 'Title'),
      h('p', 'Paragraph')
    ])
  }
}
```

### Comment（注释节点）

```javascript
import { h, Comment } from 'vue'

export default {
  setup() {
    const showComment = true

    return () => showComment
      ? h(Comment, 'This is a comment')
      : h('div', 'Content')
  }
}
```

### Text（文本节点）

```javascript
import { h, Text } from 'vue'

export default {
  setup() {
    return () => h('div', [
      h('p', 'Text content'),
      h(Text, 'Plain text node')
    ])
  }
}
```

### teleport

```javascript
import { h, Teleport } from 'vue'

export default {
  setup() {
    return () => h(Teleport, { to: 'body' }, [
      h('div', { class: 'modal' }, 'Modal content')
    ])
  }
}
```

### Suspense

```javascript
import { h, Suspense } from 'vue'

export default {
  setup() {
    return () => h(Suspense, {}, {
      default: () => h(AsyncComponent),
      fallback: () => h('div', 'Loading...')
    })
  }
}
```

### Transition

```javascript
import { h, Transition } from 'vue'

export default {
  setup() {
    const show = ref(true)

    return () => h('div', [
      h('button', { onClick: () => show.value = !show.value }, 'Toggle'),
      h(Transition, { name: 'fade' }, () =>
        show.value ? h('div', 'Content') : null
      )
    ])
  }
}
```

## 注意事项

### 1. 第二个参数规范

```javascript
import { h } from 'vue'

// ✅ 正确：第二个参数是对象或数组
h('div', { class: 'container' }, 'Content')
h('div', ['Item 1', 'Item 2'])

// ❌ 错误：第二个参数是字符串（会被当作子内容）
h('div', 'Content') // 这里的 'Content' 是子内容，不是属性
```

### 2. class 和 style 的处理

```javascript
import { h } from 'vue'

// class 可以是字符串、数组、对象
h('div', { class: 'container' })
h('div', { class: ['container', 'active'] })
h('div', { class: { container: true, active: false } })

// style 可以是对象或数组
h('div', { style: { color: 'red' } })
h('div', { style: [{ color: 'red' }, { fontSize: '14px' }] })
```

### 3. 事件命名规范

```javascript
import { h } from 'vue'

// ✅ 使用 camelCase
h('button', {
  onClick: () => console.log('clicked'),
  onKeyup: (e) => console.log(e.key)
})

// ✅ 也支持 kebab-case
h('button', {
  'click': () => console.log('clicked')
})
```

### 4. Props 传递

```javascript
import { h } from 'vue'
import MyComponent from './MyComponent.vue'

// 传递 props
h(MyComponent, {
  message: 'Hello',
  count: 0,
  isActive: true
})

// 使用 kebab-case 的 props
h(MyComponent, {
  'message': 'Hello',
  'is-active': true
})
```

### 5. 插槽与 children 的优先级

```javascript
import { h } from 'vue'

// 当第三个参数是对象时，作为 props
h('div', { class: 'active' })

// 当第三个参数不是对象时，作为子内容
h('div', null, 'Content')
h('div', 'Content') // 省略 props

// 子内容可以是数组
h('ul', null, [
  h('li', 'Item 1'),
  h('li', 'Item 2')
])
```

### 6. 组件与元素的区别

```javascript
import { h } from 'vue'
import Component from './Component.vue'

// 组件：需要传递 props
h(Component, { message: 'Hello' })

// 元素：传递属性
h('div', { id: 'app' })
```

### 7. 指令不能使用

```javascript
import { h } from 'vue'

// ❌ 渲染函数中不能使用指令
// h('div', { 'v-if': true }, 'Content')

// ✅ 需要使用条件逻辑
const show = true
show ? h('div', 'Content') : null
```

### 8. ref 的处理

```javascript
import { h, ref } from 'vue'

const elementRef = ref(null)

// 字符串形式的 ref（选项式 API）
h('div', { ref: 'myRef' })

// 函数形式的 ref（组合式 API）
h('div', {
  ref: (el) => {
    elementRef.value = el
  }
})
```

### 9. key 的使用

```javascript
import { h } from 'vue'

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
]

// 列表渲染时需要 key
h('ul', null, items.map(item =>
  h('li', { key: item.id }, item.name)
))
```

### 10. TypeScript 类型

```typescript
import { h, type VNode, type FunctionalComponent } from 'vue'

// 定义 VNode 类型
const vnode: VNode = h('div', 'Content')

// 函数式组件类型
const MyComponent: FunctionalComponent<{ message: string }> = (props) => {
  return h('div', props.message)
}
```

## 使用场景

### 1. JSX 转换

```javascript
// JSX
const App = () => (
  <div class="container">
    <h1>Title</h1>
    <p>Content</p>
  </div>
)

// 等价的 h 函数
const App = () => h('div', { class: 'container' }, [
  h('h1', 'Title'),
  h('p', 'Content')
])
```

### 2. 动态标签名

```javascript
import { h } from 'vue'

const tag = 'button'
const label = 'Click me'

// 动态创建元素
h(tag, { onClick: () => console.log('clicked') }, label)
```

### 3. 包装组件

```javascript
import { h } from 'vue'
import OriginalButton from './Button.vue'

const WrappedButton = (props, { slots }) => {
  return h('div', { class: 'wrapper' }, [
    h(OriginalButton, props, slots)
  ])
}
```

### 4. 高阶组件

```javascript
import { h } from 'vue'

function withLoading(WrappedComponent) {
  return (props, { slots }) => {
    if (props.loading) {
      return h('div', 'Loading...')
    }
    return h(WrappedComponent, props, slots)
  }
}

const LoadingComponent = withLoading(MyComponent)
```

### 5. 列表渲染

```javascript
import { h } from 'vue'

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
]

export default {
  setup() {
    return () => h('ul', null, items.map(item =>
      h('li', { key: item.id }, item.name)
    ))
  }
}
```

### 6. 条件渲染

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const show = ref(true)
    const error = ref(null)

    return () => {
      if (error.value) {
        return h('div', { class: 'error' }, error.value.message)
      }

      if (show.value) {
        return h('div', 'Content')
      }

      return h('div', 'No content')
    }
  }
}
```

### 7. 插槽传递

```javascript
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => h('div', [
      // 传递插槽给子组件
      h(ChildComponent, null, {
        default: slots.default,
        header: slots.header,
        footer: () => h('div', 'Default Footer')
      })
    ])
  }
}
```

### 8. 响应式数据渲染

```javascript
import { h, ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    return () => h('div', [
      h('p', `Count: ${count.value}`),
      h('p', `Doubled: ${doubled.value}`),
      h('button', { onClick: () => count.value++ }, 'Increment')
    ])
  }
}
```

### 9. 可复用的渲染函数

```javascript
import { h } from 'vue'

function createButton(label, onClick, variant = 'primary') {
  return h('button', {
    class: ['btn', `btn-${variant}`],
    onClick
  }, label)
}

export default {
  setup() {
    return () => h('div', [
      createButton('Primary', () => console.log('primary'), 'primary'),
      createButton('Secondary', () => console.log('secondary'), 'secondary')
    ])
  }
}
```

### 10. 表单元素

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const form = ref({
      username: '',
      password: ''
    })

    return () => h('form', { onSubmit: (e) => e.preventDefault() }, [
      h('input', {
        type: 'text',
        value: form.value.username,
        onInput: (e) => form.value.username = e.target.value,
        placeholder: 'Username'
      }),
      h('input', {
        type: 'password',
        value: form.value.password,
        onInput: (e) => form.value.password = e.target.value,
        placeholder: 'Password'
      }),
      h('button', { type: 'submit' }, 'Submit')
    ])
  }
}
```

## h 函数签名

```typescript
// 1. 标签 + 子内容
h('div', 'Content')

// 2. 标签 + 属性 + 子内容
h('div', { class: 'container' }, 'Content')

// 3. 组件 + props
h(Component, { message: 'Hello' })

// 4. 组件 + props + 插槽
h(Component, { message: 'Hello' }, {
  default: () => 'Default slot',
  header: () => 'Header'
})
```

## 最佳实践

1. **优先使用模板**：模板更易读和维护
2. **TypeScript**：使用 TypeScript 获得类型检查
3. **拆分逻辑**：复杂的渲染逻辑拆分成多个函数
4. **JSX**：考虑使用 JSX 代替 h 函数
5. **性能优化**：合理使用 key 和 diff 算法
