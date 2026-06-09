# resolveComponent

## 作用

`resolveComponent()` 用于在渲染函数中**按名称解析已注册的组件**。当你在 `setup()` 中使用渲染函数（`h()`）时，不能直接使用模板中的 `<ComponentName />`，需要用此函数来解析组件。

> [Vue 官方文档 - resolveComponent](https://cn.vuejs.org/api/render-function#resolvecomponent)

## 函数签名

```typescript
function resolveComponent(name: string): Component | string
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 组件的注册名称 |

**返回值：** 解析到的组件对象，如果未找到则返回传入的名称字符串。

## 基本用法

```javascript
import { h, resolveComponent } from 'vue'

export default {
  setup() {
    return () => {
      // 按名称解析全局注册的组件
      const MyButton = resolveComponent('MyButton')

      return h(MyButton, { onClick: () => console.log('clicked') }, '点击我')
    }
  }
}
```

## 使用场景

### 1. 解析全局注册的组件

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MyButton from './components/MyButton.vue'
import MyInput from './components/MyInput.vue'

const app = createApp(App)
app.component('MyButton', MyButton)
app.component('MyInput', MyInput)
app.mount('#app')

// 在渲染函数中使用
import { h, resolveComponent } from 'vue'

export default {
  setup() {
    return () => h('form', [
      h(resolveComponent('MyInput'), {
        modelValue: '',
        placeholder: '请输入'
      }),
      h(resolveComponent('MyButton'), {
        type: 'submit'
      }, '提交')
    ])
  }
}
```

### 2. 动态组件选择

```javascript
import { h, resolveComponent, ref, computed } from 'vue'

export default {
  setup() {
    const layout = ref('default')

    const layoutComponent = computed(() => {
      const name = `Layout${layout.value.charAt(0).toUpperCase() + layout.value.slice(1)}`
      return resolveComponent(name)
    })

    return () => h(layoutComponent.value)
  }
}
```

### 3. 条件渲染不同组件

```javascript
import { h, resolveComponent, ref } from 'vue'

export default {
  props: {
    type: {
      type: String,
      default: 'text'
    }
  },
  setup(props) {
    return () => {
      // 根据类型解析不同的输入组件
      const componentMap = {
        text: 'FormInput',
        select: 'FormSelect',
        checkbox: 'FormCheckbox',
        radio: 'FormRadio'
      }

      const componentName = componentMap[props.type] || 'FormInput'
      const Component = resolveComponent(componentName)

      return h(Component)
    }
  }
}
```

### 4. 解析内置组件

```javascript
import { h, resolveComponent } from 'vue'

export default {
  setup() {
    return () => {
      // 也可以解析 Vue 内置组件
      const Transition = resolveComponent('Transition')
      const KeepAlive = resolveComponent('KeepAlive')
      const Teleport = resolveComponent('Teleport')
      const Suspense = resolveComponent('Suspense')

      return h(Transition, { name: 'fade' }, () =>
        h('div', '带过渡的内容')
      )
    }
  }
}
```

### 5. 配合 provide/inject

```javascript
import { h, resolveComponent, provide, inject } from 'vue'

// 父组件提供组件名
export const ParentComponent = {
  setup() {
    provide('headerComponent', 'AppHeader')
    provide('footerComponent', 'AppFooter')

    return () => h('div', [
      h(resolveComponent('Layout')),
    ])
  }
}

// 子组件动态解析
export const ChildComponent = {
  setup() {
    const headerName = inject('headerComponent', 'DefaultHeader')
    const HeaderComponent = resolveComponent(headerName)

    return () => h('div', [
      h(HeaderComponent)
    ])
  }
}
```

### 6. 渲染函数中构建复杂表单

```javascript
import { h, resolveComponent, reactive } from 'vue'

export default {
  setup() {
    const form = reactive({
      username: '',
      email: '',
      role: ''
    })

    const fields = [
      { name: 'username', component: 'FormInput', props: { type: 'text', label: '用户名' } },
      { name: 'email', component: 'FormInput', props: { type: 'email', label: '邮箱' } },
      { name: 'role', component: 'FormSelect', props: { label: '角色', options: ['admin', 'user'] } }
    ]

    return () => h('form', { onSubmit: (e) => e.preventDefault() },
      fields.map(field => {
        const Component = resolveComponent(field.component)
        return h(Component, {
          ...field.props,
          modelValue: form[field.name],
          'onUpdate:modelValue': (val) => { form[field.name] = val }
        })
      })
    )
  }
}
```

## 注意事项

### 1. 只能在 setup 或 render 中调用

```javascript
import { resolveComponent } from 'vue'

// ❌ 错误：不能在组件外部调用
const Button = resolveComponent('MyButton') // 无法解析

// ✅ 正确：在 setup() 中调用
export default {
  setup() {
    return () => {
      const Button = resolveComponent('MyButton')
      return h(Button)
    }
  }
}
```

### 2. 组件必须已注册

```javascript
import { h, resolveComponent } from 'vue'

export default {
  setup() {
    return () => {
      // 如果 'UnregisteredComponent' 没有注册
      const Component = resolveComponent('UnregisteredComponent')
      // 返回字符串 'UnregisteredComponent'（而不是组件对象）
      console.log(typeof Component) // 'string'

      // h() 接收到字符串时，会将其当作 HTML 标签
      // 所以 h('UnregisteredComponent') 会创建一个自定义元素
      return h(Component)
    }
  }
}
```

### 3. 可以直接 import 组件（推荐）

```javascript
import { h } from 'vue'
import MyButton from './MyButton.vue'

// ✅ 推荐：直接 import，有完整的类型推断和编译优化
export default {
  setup() {
    return () => h(MyButton, { onClick: () => {} }, '点击')
  }
}

// ⚠️ resolveComponent：需要组件已全局注册，无类型推断
export default {
  setup() {
    return () => {
      const Button = resolveComponent('MyButton')
      return h(Button)
    }
  }
}
```

### 4. 解析顺序

```javascript
import { h, resolveComponent } from 'vue'

export default {
  // 局部注册的组件
  components: {
    MyButton: ImportedButton
  },
  setup() {
    return () => {
      // resolveComponent 按以下顺序查找：
      // 1. 局部注册的组件（components 选项）
      // 2. 全局注册的组件（app.component）
      const Button = resolveComponent('MyButton')
      return h(Button)
    }
  }
}
```

## 最佳实践

1. **优先直接 import**：如果组件在文件中已知，直接 `import` 比 `resolveComponent` 更好，有更好的类型推断和编译优化
2. **用于动态场景**：只在组件名在运行时才能确定时使用 `resolveComponent`
3. **确保已注册**：使用前确保组件已通过 `app.component()` 或 `components` 选项注册
4. **注意返回值**：如果组件未找到，返回的是字符串而非组件对象，需要处理这种情况
5. **在 setup 中调用**：只能在 `setup()` 或渲染函数的上下文中调用
