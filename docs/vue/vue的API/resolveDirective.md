# resolveDirective

> 📖 [官方文档 - resolveDirective](https://cn.vuejs.org/api/render-function#resolvedirective)

### 一、概述

`resolveDirective()` 是 Vue 3 提供的一个渲染函数辅助 API，用于在渲染函数中**按名称解析已注册的自定义指令**。

在模板中使用指令非常直观，只需写 `v-focus` 即可。但在渲染函数（`h()`）中，你无法使用模板语法，此时就需要 `resolveDirective()` 来根据指令名称获取指令对象，再配合 `withDirectives()` 将指令应用到 VNode 上。

简单理解：**`resolveDirective` 就是在渲染函数世界中替代模板中 `v-xxx` 语法的关键桥梁**。

### 二、核心原理

`resolveDirective` 的核心工作流程如下：

1. **注册阶段**：通过 `app.directive()` 全局注册或组件内 `directives` 选项局部注册指令
2. **解析阶段**：在 `setup()` 或渲染函数中调用 `resolveDirective(name)` 从当前应用上下文中查找已注册的指令
3. **应用阶段**：将解析到的指令对象通过 `withDirectives()` 绑定到 VNode 上
4. **挂载阶段**：Vue 在 VNode 挂载和更新时自动调用指令的对应钩子函数

```
注册指令 → resolveDirective 解析 → withDirectives 绑定到 VNode → Vue 调用指令钩子
```

`resolveDirective` 本质上是依赖当前组件实例的上下文来解析指令的，它会依次查找局部注册的指令和全局注册的指令。因此，它**必须在组件的 `setup()` 函数或渲染函数中使用**，脱离了组件上下文将无法正常工作。

### 三、详细用法

#### 1. 基本用法

最简单的场景：在渲染函数中解析一个全局注册的指令并应用。

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局注册 v-focus 指令
app.directive('focus', {
  mounted(el: HTMLInputElement) {
    el.focus()
  }
})

app.mount('#app')
```

```typescript
// RenderInput.ts
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      // 解析指令，注意：名称不含 v- 前缀
      const vFocus = resolveDirective('focus')

      // 将指令应用到 VNode 上
      return withDirectives(h('input', { type: 'text' }), [
        [vFocus]
      ])
    }
  }
})
```

#### 2. 进阶用法

##### 2.1 带绑定值的指令

```typescript
import { defineComponent, h, resolveDirective, withDirectives, ref } from 'vue'

export default defineComponent({
  setup() {
    const isLoading = ref(false)

    return () => {
      const vLoading = resolveDirective('loading')

      return withDirectives(
        h('div', { class: 'content' }, '内容区域'),
        [
          // [指令对象, 绑定值]
          [vLoading, isLoading.value]
        ]
      )
    }
  }
})
```

##### 2.2 带参数和修饰符的指令

```typescript
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
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
})
```

##### 2.3 多个指令同时应用

```typescript
import { defineComponent, h, resolveDirective, withDirectives, ref } from 'vue'

export default defineComponent({
  setup() {
    const isLoading = ref(false)

    return () => {
      const vFocus = resolveDirective('focus')
      const vLoading = resolveDirective('loading')
      const vPermission = resolveDirective('permission')

      return withDirectives(
        h('button', { type: 'submit' }, '提交'),
        [
          [vFocus],                      // 自动聚焦
          [vLoading, isLoading.value],   // 加载状态
          [vPermission, 'submit']        // 权限控制
        ]
      )
    }
  }
})
```

##### 2.4 动态指令解析

```typescript
import { defineComponent, h, resolveDirective, withDirectives, type PropType } from 'vue'

export default defineComponent({
  props: {
    directiveName: {
      type: String as PropType<string>,
      default: 'focus'
    }
  },
  setup(props) {
    return () => {
      // 根据 props 动态选择要应用的指令
      const directive = resolveDirective(props.directiveName)

      if (directive) {
        return withDirectives(h('input'), [[directive]])
      }

      // 指令未找到时的降级处理
      return h('input')
    }
  }
})
```

##### 2.5 条件性应用指令

```typescript
import { defineComponent, h, resolveDirective, withDirectives, ref } from 'vue'

export default defineComponent({
  setup() {
    const isLoading = ref(false)
    const hasPermission = ref(true)

    return () => {
      const vLoading = resolveDirective('loading')
      const vPermission = resolveDirective('permission')

      // 根据条件动态构建指令数组
      const directives: Array<[any]> = []

      if (isLoading.value && vLoading) {
        directives.push([vLoading, true])
      }

      if (!hasPermission.value && vPermission) {
        directives.push([vPermission, 'admin'])
      }

      const vnode = h('div', '内容')

      return directives.length > 0
        ? withDirectives(vnode, directives)
        : vnode
    }
  }
})
```

#### 3. API 参数说明

**函数签名：**

```typescript
function resolveDirective(name: string): Directive | undefined
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 是 | 指令的注册名称，**不含 `v-` 前缀** |

**返回值：**

| 返回类型 | 说明 |
|----------|------|
| `Directive` | 解析成功时返回指令对象 |
| `undefined` | 指令未注册或未找到时返回 `undefined` |

**`withDirectives` 指令绑定数组格式：**

| 格式 | 说明 |
|------|------|
| `[directive]` | 仅指令，无值、无参数、无修饰符 |
| `[directive, value]` | 指令 + 绑定值 |
| `[directive, value, argument]` | 指令 + 绑定值 + 参数（如 `v-loading:full` 中的 `full`） |
| `[directive, value, argument, modifiers]` | 完整格式：指令 + 绑定值 + 参数 + 修饰符对象 |

### 四、实现效果

使用 `resolveDirective` 后，指令的所有生命周期钩子都会被正确触发，行为与模板中使用 `v-xxx` 完全一致：

```typescript
// 指令定义
app.directive('highlight', {
  beforeMount(el: HTMLElement, binding) {
    // 在元素挂载前，根据绑定值设置高亮颜色
    el.style.backgroundColor = binding.value || 'yellow'
  },
  updated(el: HTMLElement, binding) {
    // 绑定值变化时更新高亮颜色
    el.style.backgroundColor = binding.value || 'yellow'
  },
  unmounted(el: HTMLElement) {
    // 元素卸载时清除样式
    el.style.backgroundColor = ''
  }
})
```

```typescript
// 在渲染函数中使用
import { defineComponent, h, resolveDirective, withDirectives, ref } from 'vue'

export default defineComponent({
  setup() {
    const color = ref('yellow')

    return () => {
      const vHighlight = resolveDirective('highlight')

      // ✅ 指令的 beforeMount、updated、unmounted 钩子均会被正常触发
      // 效果：div 的背景色会被设置为 'yellow'
      return withDirectives(
        h('div', '这段文字会被高亮'),
        [[vHighlight, color.value]]
      )
    }
  }
})
```

> 💡 **提示：** 使用 `resolveDirective` + `withDirectives` 应用指令与在模板中使用 `v-highlight="color"` 的效果完全一致，Vue 内部会以相同的方式处理指令的生命周期钩子。

### 五、使用场景

#### 1. 渲染函数中应用全局指令

最常见的场景：在 `setup()` 的渲染函数中使用全局注册的指令。

```typescript
// main.ts - 全局注册指令
import { createApp, type Directive } from 'vue'
import App from './App.vue'

const vLazyLoad: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    // 使用 IntersectionObserver 实现图片懒加载
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        el.src = binding.value
        observer.unobserve(el)
      }
    })
    observer.observe(el)
  }
}

const app = createApp(App)
app.directive('lazy-load', vLazyLoad)
app.mount('#app')
```

```typescript
// ImageGallery.ts - 渲染函数中使用
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  props: {
    images: {
      type: Array as { type: Array as () => string[] },
      default: () => []
    }
  },
  setup(props) {
    return () => {
      const vLazyLoad = resolveDirective('lazy-load')

      return h('div', { class: 'gallery' },
        props.images.map((src) =>
          withDirectives(
            h('img', { alt: '图片', class: 'gallery-item' }),
            [[vLazyLoad, src]]
          )
        )
      )
    }
  }
})
```

#### 2. 封装高阶组件时复用指令逻辑

在封装高阶组件或通用容器组件时，可能需要在渲染函数中动态应用指令。

```typescript
// LoadingContainer.ts
import { defineComponent, h, resolveDirective, withDirectives, ref, type Slot } from 'vue'

export default defineComponent({
  name: 'LoadingContainer',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    return () => {
      const vLoading = resolveDirective('loading')

      const container = h('div', { class: 'loading-container' }, [
        slots.default?.()
      ])

      // 根据 loading 状态应用 v-loading 指令
      return withDirectives(container, [
        [vLoading, props.loading]
      ])
    }
  }
})
```

#### 3. 动态表单渲染引擎

在动态表单渲染引擎中，不同表单项可能需要应用不同的验证或格式化指令。

```typescript
// DynamicFormRenderer.ts
import { defineComponent, h, resolveDirective, withDirectives, type PropType } from 'vue'

interface FormField {
  type: string
  model: string
  directives?: Array<{
    name: string
    value?: any
    arg?: string
    modifiers?: Record<string, boolean>
  }>
}

export default defineComponent({
  props: {
    fields: {
      type: Array as PropType<FormField[]>,
      required: true
    }
  },
  setup(props) {
    return () => {
      return h('form', {}, 
        props.fields.map((field) => {
          let vnode = h('input', {
            type: field.type,
            name: field.model,
            class: 'form-input'
          })

          // 为每个字段动态应用指令
          if (field.directives?.length) {
            const directiveBindings = field.directives.map((d) => {
              const directive = resolveDirective(d.name)
              if (!directive) return null
              return [directive, d.value, d.arg, d.modifiers]
            }).filter(Boolean) as any[]

            vnode = withDirectives(vnode, directiveBindings)
          }

          return vnode
        })
      )
    }
  }
})
```

#### 4. 权限控制指令在渲染函数中的应用

```typescript
// 权限指令
import { type Directive } from 'vue'

const vPermission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const userPermissions = ['read', 'write'] // 模拟从 store 获取
    const requiredPermission = binding.value

    if (!userPermissions.includes(requiredPermission)) {
      el.parentNode?.removeChild(el)
    }
  }
}

app.directive('permission', vPermission)
```

```typescript
// 在渲染函数中使用权限指令
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  props: {
    requiredPermission: {
      type: String,
      default: 'read'
    }
  },
  setup(props, { slots }) {
    return () => {
      const vPermission = resolveDirective('permission')

      return withDirectives(
        h('div', { class: 'protected-content' }, slots.default?.()),
        [[vPermission, props.requiredPermission]]
      )
    }
  }
})
```

#### 5. 工具提示（Tooltip）指令在渲染函数中使用

```typescript
// TooltipButton.ts
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  props: {
    tooltipText: {
      type: String,
      default: ''
    },
    placement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'top'
    }
  },
  setup(props, { slots }) {
    return () => {
      const vTooltip = resolveDirective('tooltip')

      return withDirectives(
        h('button', { class: 'tooltip-btn' }, slots.default?.()),
        [
          // [directive, value, argument, modifiers]
          [vTooltip, props.tooltipText, props.placement, { delay: 300 }]
        ]
      )
    }
  }
})
```

#### 6. 结合 JSX 使用指令

在 Vue 3 中使用 JSX 编写渲染逻辑时，同样需要 `resolveDirective` 来应用指令。

```tsx
// ButtonWithLoading.tsx
import { defineComponent, ref, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  setup() {
    const loading = ref(false)

    const handleClick = async () => {
      loading.value = true
      // 模拟异步请求
      await new Promise((resolve) => setTimeout(resolve, 2000))
      loading.value = false
    }

    return () => {
      const vLoading = resolveDirective('loading')

      // 在 JSX 中无法直接使用 v-loading 语法，需要借助 withDirectives
      const button = <button onClick={handleClick}>提交</button>

      return withDirectives(button, [[vLoading, loading.value]])
    }
  }
})
```

#### 7. 可复用的指令应用 Composable

将 `resolveDirective` 封装为可复用的组合式函数，简化在渲染函数中使用指令的流程。

```typescript
// useDirective.ts
import { resolveDirective, type Directive } from 'vue'

/**
 * 封装指令解析逻辑，提供类型安全的指令获取
 * @param name 指令名称（不含 v- 前缀）
 * @returns 指令对象，未找到时返回 undefined 并给出警告
 */
export function useDirective<T = any>(name: string): Directive<T> | undefined {
  const directive = resolveDirective(name)

  if (!directive) {
    console.warn(`[useDirective] 指令 "${name}" 未注册，请检查是否已全局或局部注册`)
  }

  return directive
}
```

```typescript
// 使用 composable
import { defineComponent, h, withDirectives, ref } from 'vue'
import { useDirective } from './useDirective'

export default defineComponent({
  setup() {
    const isLoading = ref(false)

    return () => {
      const vLoading = useDirective('loading')
      if (!vLoading) return h('div', '加载状态未知')

      return withDirectives(
        h('div', { class: 'content' }, '数据内容'),
        [[vLoading, isLoading.value]]
      )
    }
  }
})
```

#### 8. 组件库内部实现中使用

在开发组件库时，某些组件的内部实现可能使用渲染函数，此时需要用 `resolveDirective` 来应用指令。

```typescript
// DataTable.ts - 组件库内部实现
import { defineComponent, h, resolveDirective, withDirectives, ref, type PropType } from 'vue'

export default defineComponent({
  name: 'DataTable',
  props: {
    data: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    dragSortable: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const selectedRow = ref<number | null>(null)

    return () => {
      const vLoading = resolveDirective('loading')
      const vDraggable = resolveDirective('draggable')

      const tableVNode = h('table', { class: 'data-table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', {}, '名称'),
            h('th', {}, '值')
          ])
        ]),
        h('tbody', {}, 
          props.data.map((row, index) =>
            h('tr', {
              key: index,
              onClick: () => { selectedRow.value = index }
            }, [
              h('td', {}, row.name),
              h('td', {}, row.value)
            ])
          )
        )
      ])

      const directives: any[] = []

      // 应用 loading 指令
      if (vLoading) {
        directives.push([vLoading, props.loading])
      }

      // 应用拖拽排序指令
      if (vDraggable && props.dragSortable) {
        directives.push([vDraggable, true])
      }

      return directives.length > 0
        ? withDirectives(tableVNode, directives)
        : tableVNode
    }
  }
})
```

#### 9. 低代码平台渲染器

在低代码平台中，页面配置是动态的，需要根据 JSON 配置动态解析并应用指令。

```typescript
// LowCodeRenderer.ts
import { defineComponent, h, resolveDirective, withDirectives, type PropType } from 'vue'

interface DirectiveConfig {
  name: string
  value?: any
  arg?: string
  modifiers?: Record<string, boolean>
}

interface ElementConfig {
  tag: string
  props?: Record<string, any>
  children?: string
  directives?: DirectiveConfig[]
}

export default defineComponent({
  name: 'LowCodeRenderer',
  props: {
    schema: {
      type: Object as PropType<ElementConfig>,
      required: true
    }
  },
  setup(props) {
    return () => {
      const { tag, props: elProps, children, directives } = props.schema

      let vnode = h(tag, elProps || {}, children || '')

      // 根据 schema 中的指令配置，动态解析并应用指令
      if (directives?.length) {
        const bindings = directives
          .map((config) => {
            const directive = resolveDirective(config.name)
            if (!directive) return null
            return [directive, config.value, config.arg, config.modifiers] as const
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)

        if (bindings.length > 0) {
          vnode = withDirectives(vnode, bindings as any[])
        }
      }

      return vnode
    }
  }
})
```

#### 10. 测试中的指令模拟

在单元测试中，可以使用 `resolveDirective` 验证指令是否正确注册。

```typescript
// directive.spec.ts
import { mount } from '@vue/test-utils'
import { createApp, resolveDirective, h, withDirectives } from 'vue'
import TestComponent from './TestComponent.vue'

describe('指令注册测试', () => {
  it('应该正确解析全局注册的指令', () => {
    const app = createApp(TestComponent)

    app.directive('test-directive', {
      mounted(el) {
        el.setAttribute('data-test', 'mounted')
      }
    })

    // 验证指令已注册
    // 注意：在测试环境中需要在组件上下文中调用 resolveDirective
    const wrapper = mount(TestComponent, {
      global: {
        directives: {
          'test-directive': {
            mounted(el: HTMLElement) {
              el.setAttribute('data-test', 'mounted')
            }
          }
        }
      }
    })

    expect(wrapper.find('[data-test="mounted"]').exists()).toBe(true)
  })
})
```

### 六、注意事项

#### 1. 只能在 `setup()` 或渲染函数中调用

`resolveDirective` 依赖当前组件实例的上下文，不能在组件外部调用。

```typescript
import { resolveDirective } from 'vue'

// ❌ 错误：在组件外部调用，没有组件上下文
const vFocus = resolveDirective('focus') // 返回 undefined

// ✅ 正确：在 setup() 或渲染函数中调用
export default defineComponent({
  setup() {
    const vFocus = resolveDirective('focus') // 正确解析
    return () => withDirectives(h('input'), [[vFocus]])
  }
})
```

> ⚠️ **注意：** `resolveDirective` 必须在同步的 `setup()` 调用期间或渲染函数中同步调用。不能在 `setTimeout`、`Promise.then` 等异步回调中调用，因为此时组件实例上下文可能已经丢失。

#### 2. 指令名称不含 `v-` 前缀

```typescript
// ✅ 正确：不带 v- 前缀
resolveDirective('focus')
resolveDirective('loading')
resolveDirective('my-custom-directive')

// ❌ 错误：带 v- 前缀会导致找不到指令
resolveDirective('v-focus')       // 返回 undefined
resolveDirective('v-loading')     // 返回 undefined
```

#### 3. 必须配合 `withDirectives` 使用

`resolveDirective` 返回的是指令对象，不能直接传给 `h()` 函数，必须通过 `withDirectives` 包装。

```typescript
import { h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  setup() {
    const vFocus = resolveDirective('focus')

    return () => {
      // ❌ 错误：h() 没有 directives 选项，不能直接使用
      // h('input', { directives: [[vFocus]] })

      // ✅ 正确：通过 withDirectives 将指令应用到 VNode
      return withDirectives(h('input'), [[vFocus]])
    }
  }
})
```

#### 4. 解析失败时返回 `undefined`

如果指定的指令名称未注册，`resolveDirective` 会返回 `undefined`，将其传给 `withDirectives` 不会报错但也不会生效。

```typescript
import { h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      const vUnknown = resolveDirective('unknown-directive')

      // ✅ 推荐做法：先检查再使用
      if (!vUnknown) {
        console.warn('指令 unknown-directive 未注册')
        return h('div', '降级内容')
      }

      return withDirectives(h('div'), [[vUnknown]])
    }
  }
})
```

#### 5. 解析顺序：局部指令优先于全局指令

`resolveDirective` 会先查找当前组件局部注册的指令，再查找全局注册的指令。局部指令会覆盖同名的全局指令。

```typescript
// 全局注册
app.directive('theme', globalThemeDirective)

// 局部注册（会覆盖全局）
export default defineComponent({
  directives: {
    theme: localThemeDirective
  },
  setup() {
    // 解析到的是 localThemeDirective（局部优先）
    const vTheme = resolveDirective('theme')
    // ...
  }
})
```

#### 6. 不能在异步函数中调用

```typescript
import { resolveDirective } from 'vue'

export default defineComponent({
  async setup() {
    // ❌ 错误：async setup 中在 await 之后调用，上下文已丢失
    await someAsyncOperation()
    const vFocus = resolveDirective('focus') // 返回 undefined

    // ✅ 正确：在 await 之前同步调用
    const vFocus = resolveDirective('focus')
    await someAsyncOperation()
    return () => withDirectives(h('input'), [[vFocus]])
  }
})
```

#### 7. 优先使用模板语法

> 💡 **提示：** 如果你的组件使用的是模板（`<template>`）而非渲染函数，则**不需要** `resolveDirective`，直接在模板中使用 `v-xxx` 即可。`resolveDirective` 主要服务于渲染函数场景。

```vue
<!-- ✅ 模板中直接使用指令，简洁明了 -->
<template>
  <input v-focus />
  <div v-loading="isLoading">内容</div>
</template>
```

#### 8. 局部注册指令也可被解析

`resolveDirective` 不仅能解析全局注册的指令，也能解析当前组件通过 `directives` 选项局部注册的指令。

```typescript
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'

export default defineComponent({
  // 局部注册指令
  directives: {
    highlight: {
      mounted(el: HTMLElement) {
        el.style.color = 'red'
      }
    }
  },
  setup() {
    return () => {
      // ✅ 可以解析局部注册的指令
      const vHighlight = resolveDirective('highlight')
      return withDirectives(h('span', '高亮文本'), [[vHighlight]])
    }
  }
})
```

#### 9. TypeScript 类型安全

建议为指令定义明确的类型，以提高代码的可维护性。

```typescript
import { type Directive } from 'vue'

// ✅ 为指令定义明确的泛型类型
const vLoading: Directive<HTMLElement, boolean> = {
  mounted(el, binding) {
    // el 自动推断为 HTMLElement
    // binding.value 自动推断为 boolean
    el.classList.toggle('is-loading', binding.value)
  },
  updated(el, binding) {
    el.classList.toggle('is-loading', binding.value)
  }
}

app.directive('loading', vLoading)
```

#### 10. 与 `resolveComponent` 的区别

`resolveDirective` 和 `resolveComponent` 是两个不同的 API，虽然使用模式相似，但用途完全不同：

| API | 用途 | 返回值 |
|-----|------|--------|
| `resolveDirective` | 解析已注册的**指令** | `Directive \| undefined` |
| `resolveComponent` | 解析已注册的**组件** | `Component \| string` |

```typescript
import { h, resolveDirective, resolveComponent, withDirectives } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      // resolveComponent 用于解析组件
      const MyButton = resolveComponent('MyButton')

      // resolveDirective 用于解析指令
      const vLoading = resolveDirective('loading')

      // 同时使用：组件 + 指令
      return withDirectives(
        h(MyButton, { type: 'submit' }, '提交'),
        [[vLoading, true]]
      )
    }
  }
})
```

### 七、相关 API 对比

| API | 说明 | 典型场景 |
|-----|------|----------|
| `resolveDirective` | 按名称解析已注册的指令 | 渲染函数中需要使用指令 |
| `withDirectives` | 将指令应用到 VNode | 配合 `resolveDirective` 使用 |
| `resolveComponent` | 按名称解析已注册的组件 | 渲染函数中使用注册的组件 |
| `resolveDynamicComponent` | 解析动态组件 | 渲染函数中动态组件切换 |
| `h()` | 创建 VNode | 渲染函数的基础，`resolveDirective` 的配合对象 |
| `app.directive()` | 全局注册指令 | `resolveDirective` 解析的前提 |

### 八、总结

`resolveDirective` 是 Vue 3 渲染函数体系中不可或缺的一环，它解决了在非模板环境下使用自定义指令的问题。核心要点如下：

- **核心作用**：在渲染函数中按名称解析已注册的指令，是模板中 `v-xxx` 语法的编程式替代方案
- **使用模式**：`resolveDirective(name)` + `withDirectives(vnode, directives)` 的组合
- **调用时机**：必须在 `setup()` 或渲染函数中同步调用
- **命名规则**：传入名称不含 `v-` 前缀，使用 `'focus'` 而非 `'v-focus'`
- **安全使用**：始终检查返回值是否为 `undefined`，做好降级处理
- **适用场景**：渲染函数、JSX、组件库内部实现、低代码渲染引擎等非模板环境
