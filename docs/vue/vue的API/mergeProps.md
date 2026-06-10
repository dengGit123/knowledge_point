# mergeProps

> 📖 [官方文档 - 渲染函数 API / mergeProps()](https://cn.vuejs.org/api/render-function.html#mergeprops)

### 一、概述

`mergeProps()` 是 Vue 3 提供的一个工具函数，用于将多个 props 对象**智能合并**为一个对象。与普通的对象展开（`Object.assign` 或 `{...spread}`）不同，`mergeProps()` 会对 `class`、`style`、`onXxx` 事件监听器等特殊属性进行**合并处理**而非简单覆盖。它主要用于渲染函数和 JSX 场景中，帮助开发者优雅地组合来自多个来源的属性。

### 二、核心原理

`mergeProps()` 的工作原理可以用一句话概括：**普通属性后覆盖，特殊属性做合并**。

具体来说，它遵循以下规则：

| 属性类型 | 合并策略 | 说明 |
|---------|---------|------|
| `class` | 合并 | 多个来源的 class 会被拼接在一起，如 `'foo' + 'bar'` → `'foo bar'` |
| `style` | 合并 | 多个来源的 style 会被合并，对象形式会展开，字符串形式会拼接 |
| `onXxx` 事件 | 合并为数组 | 多个同名事件监听器会被合并成数组，触发时按顺序全部执行 |
| 其他属性 | 后者覆盖前者 | 普通 props 遵循"后覆盖前"的策略 |

类比理解：想象你在填写一份表格，大部分字段（姓名、年龄）只能有一个值，后填的会覆盖先填的；但"兴趣爱好"（class）、"联系方式"（style）、"通知渠道"（事件监听器）这些字段可以同时拥有多个值，`mergeProps()` 就是帮你自动区分这两类字段的智能助手。

### 三、详细用法

#### 1. 基本用法

```ts
import { mergeProps } from 'vue'

// 最简单的合并 —— 两个 props 对象
const one = {
  class: 'foo',
  onClick: () => console.log('来自 one 的点击')
}

const two = {
  class: 'bar',
  onClick: () => console.log('来自 two 的点击')
}

const merged = mergeProps(one, two)

// 合并结果：
// {
//   class: 'foo bar',                    // class 被合并
//   onClick: [handlerA, handlerB]        // 事件被合并为数组，触发时两个都会执行
// }
```

在渲染函数中使用：

```ts
import { h, mergeProps, defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const baseProps = { class: 'btn', type: 'button' }
    const userProps = { class: 'primary', onClick: () => {} }

    return () => h('button', mergeProps(baseProps, userProps), 'Click me')
    // 渲染结果：<button class="btn primary" type="button">Click me</button>
  }
})
```

#### 2. 进阶用法

**合并多个 props 对象（三个及以上）：**

```ts
import { h, mergeProps, defineComponent } from 'vue'

export default defineComponent({
  props: {
    size: { type: String, default: 'medium' }
  },
  setup(props, { attrs }) {
    const baseStyle = { color: 'red', fontSize: '14px' }
    const themeStyle = { color: 'blue', fontWeight: 'bold' }
    const interactionProps = {
      onClick: () => console.log('clicked'),
      onMouseenter: () => console.log('hovered')
    }

    // ✅ 合并三个 props 对象
    // style 中的 color 会被后者覆盖（blue），fontSize 和 fontWeight 保留
    const merged = mergeProps(
      { style: baseStyle, class: 'base' },
      { style: themeStyle, class: 'theme' },
      interactionProps
    )

    return () => h('div', merged, 'Content')
  }
})
```

**与 `v-bind` 配合使用（JSX / TSX 场景）：**

```tsx
import { defineComponent, mergeProps } from 'vue'

interface ButtonProps {
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

export default defineComponent({
  props: {
    size: { type: String as () => ButtonProps['size'], default: 'medium' },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () => {
      // 将组件自身 props 与外部传入的 attrs 合并
      const mergedProps = mergeProps(
        {
          class: ['btn', `btn-${props.size}`],
          disabled: props.disabled
        },
        attrs
      )

      return (
        <button {...mergedProps}>
          {slots.default?.()}
        </button>
      )
    }
  }
})
```

**与 `computed` 配合动态合并：**

```ts
import { h, computed, mergeProps, defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    variant: { type: String, default: 'primary' }
  },
  setup(props, { attrs }) {
    const isLoading = ref(false)

    const dynamicProps = computed(() => ({
      class: [
        `btn-${props.variant}`,
        { 'is-loading': isLoading.value }
      ],
      disabled: isLoading.value
    }))

    // ✅ 动态 props 与静态 props 合并
    return () => h(
      'button',
      mergeProps(
        { type: 'button', class: 'btn' },
        dynamicProps.value,
        attrs
      ),
      'Submit'
    )
  }
})
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `...args` | `object[]` | 一个或多个 props 对象，按顺序合并 |
| **返回值** | `object` | 合并后的新 props 对象 |

**类型签名：**

```ts
function mergeProps(...args: object[]): object
```

**特殊属性合并行为详解：**

| 源 1 | 源 2 | 合并结果 | 说明 |
|------|------|---------|------|
| `{ class: 'a' }` | `{ class: 'b' }` | `{ class: 'a b' }` | 字符串 class 拼接 |
| `{ class: 'a' }` | `{ class: { b: true } }` | `{ class: 'a b' }` | 对象 class 智能合并 |
| `{ class: ['a'] }` | `{ class: 'b' }` | `{ class: 'a b' }` | 数组 class 智能合并 |
| `{ style: { color: 'red' } }` | `{ style: { fontSize: '14px' } }` | `{ style: { color: 'red', fontSize: '14px' } }` | 样式对象展开合并 |
| `{ onClick: fnA }` | `{ onClick: fnB }` | `{ onClick: [fnA, fnB] }` | 同名事件合并为数组 |
| `{ id: 'a' }` | `{ id: 'b' }` | `{ id: 'b' }` | 普通属性后者覆盖 |

### 四、实现效果

以下示例展示了 `mergeProps()` 合并后的实际输出效果：

```ts
import { mergeProps } from 'vue'

const props1 = {
  class: 'wrapper',
  style: { padding: '10px', backgroundColor: '#fff' },
  onClick: () => console.log('props1 click'),
  id: 'container'
}

const props2 = {
  class: { active: true, disabled: false },
  style: { color: '#333', borderRadius: '4px' },
  onClick: () => console.log('props2 click'),
  id: 'overridden'
}

const result = mergeProps(props1, props2)

console.log(result)
// 输出结果：
// {
//   class: 'wrapper active',                         // class 合并（disabled: false 不输出）
//   style: {                                         // style 对象展开合并
//     padding: '10px',
//     backgroundColor: '#fff',
//     color: '#333',
//     borderRadius: '4px'
//   },
//   onClick: [handlerA, handlerB],                   // 事件监听器合并为数组
//   id: 'overridden'                                 // 普通属性后覆盖
// }

// 点击元素时，两个事件处理器都会执行：
// 控制台依次输出：
// "props1 click"
// "props2 click"
```

### 五、使用场景

#### 1. 高阶组件中合并透传属性

在开发高阶组件（HOC）时，需要将基础组件的 props 与额外注入的 props 合并：

```ts
import { h, mergeProps, defineComponent, type Component } from 'vue'

export function withLoading(WrappedComponent: Component) {
  return defineComponent({
    props: {
      loading: { type: Boolean, default: false }
    },
    setup(props, { attrs, slots }) {
      return () => {
        const loadingProps = {
          class: { 'is-loading': props.loading },
          disabled: props.loading,
          'aria-busy': String(props.loading)
        }

        // ✅ 将 loading 相关属性与原始 attrs 合并
        return h(
          WrappedComponent,
          mergeProps(attrs, loadingProps),
          slots
        )
      }
    }
  })
}
```

#### 2. UI 组件库中合并默认 props 与用户自定义 props

组件库通常提供默认样式/行为，允许用户覆盖或扩展：

```ts
import { h, mergeProps, defineComponent } from 'vue'

export default defineComponent({
  name: 'MyButton',
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'medium' }
  },
  setup(props, { attrs, slots }) {
    return () => {
      // 组件内置的默认 props
      const defaultProps = {
        class: ['btn', `btn-${props.variant}`, `btn-${props.size}`],
        type: 'button'
      }

      // ✅ 用户传入的 attrs（如额外的 class、事件等）与默认 props 合并
      return h('button', mergeProps(defaultProps, attrs), slots)
    }
  }
})

// 使用时：
// <MyButton class="extra-class" @click="handleClick" />
// 最终 button 会同时拥有 'btn btn-primary btn-medium extra-class' 这些 class
// 且 click 事件正常触发
```

#### 3. 渲染函数中动态样式与事件合并

在渲染函数中根据状态动态合并样式和事件：

```ts
import { h, mergeProps, defineComponent, ref, computed } from 'vue'

export default defineComponent({
  setup() {
    const isHovered = ref(false)
    const isPressed = ref(false)

    const baseProps = {
      class: 'card',
      style: {
        padding: '16px',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      }
    }

    const stateProps = computed(() => ({
      class: {
        'card--hovered': isHovered.value,
        'card--pressed': isPressed.value
      },
      style: {
        boxShadow: isHovered.value ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        transform: isPressed.value ? 'scale(0.98)' : 'scale(1)'
      },
      onMouseenter: () => { isHovered.value = true },
      onMouseleave: () => { isHovered.value = false; isPressed.value = false },
      onMousedown: () => { isPressed.value = true },
      onMouseup: () => { isPressed.value = false }
    }))

    return () => h(
      'div',
      mergeProps(baseProps, stateProps.value),
      'Interactive Card'
    )
  }
})
```

#### 4. 无障碍属性（A11y）注入

为组件自动添加无障碍相关属性：

```ts
import { h, mergeProps, defineComponent } from 'vue'

export default defineComponent({
  props: {
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const a11yProps = {
        role: 'button',
        'aria-label': props.label,
        'aria-disabled': String(props.disabled),
        tabindex: props.disabled ? -1 : 0,
        class: { 'is-disabled': props.disabled }
      }

      // ✅ 将无障碍属性与用户传入的属性合并，用户可覆盖默认 role
      return h('div', mergeProps(a11yProps, attrs), slots)
    }
  }
})
```

#### 5. 递归组件中 props 逐层合并

树形组件或菜单组件等递归场景中，每一层可能需要注入不同的 props：

```ts
import { h, mergeProps, defineComponent, type PropType } from 'vue'

interface TreeNode {
  label: string
  children?: TreeNode[]
}

export default defineComponent({
  name: 'TreeNode',
  props: {
    node: { type: Object as PropType<TreeNode>, required: true },
    level: { type: Number, default: 0 }
  },
  setup(props, { attrs }) {
    return () => {
      // 每一层增加缩进样式
      const levelProps = {
        class: `tree-node--level-${props.level}`,
        style: { paddingLeft: `${props.level * 20}px` }
      }

      return h('div', mergeProps(attrs, levelProps), [
        h('span', props.node.label),
        props.node.children?.map(child =>
          h(TreeNode, {
            node: child,
            level: props.level + 1
          })
        )
      ])
    }
  }
})
```

#### 6. 表单组件中合并校验与原生属性

自定义表单输入组件需要同时处理原生 input 属性和自定义校验逻辑：

```ts
import { h, mergeProps, defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'MyInput',
  props: {
    modelValue: { type: String, default: '' },
    error: { type: String, default: '' },
    placeholder: { type: String, default: '请输入' }
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const inputProps = computed(() => ({
      class: [
        'my-input',
        { 'my-input--error': !!props.error }
      ],
      value: props.modelValue,
      placeholder: props.placeholder,
      onInput: (e: Event) => {
        emit('update:modelValue', (e.target as HTMLInputElement).value)
      }
    }))

    return () => h('input', mergeProps(inputProps.value, attrs))
  }
})

// 使用：
// <MyInput
//   v-model="name"
//   class="custom-input"
//   maxlength="20"
//   @focus="handleFocus"
// />
// 最终 input 同时拥有 'my-input custom-input' class
// 以及 maxlength、onFocus、onInput 等所有属性和事件
```

#### 7. 插槽内容包装器中合并 props

在 Layout 组件中，为插槽内容注入统一的样式和行为：

```ts
import { h, mergeProps, defineComponent } from 'vue'

export default defineComponent({
  name: 'CardSection',
  props: {
    title: { type: String, default: '' },
    variant: { type: String, default: 'default' }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const sectionProps = {
        class: ['card-section', `card-section--${props.variant}`]
      }

      // ✅ 合并组件默认 class 与外部传入的 class / style / 事件
      return h('section', mergeProps(sectionProps, attrs), [
        props.title && h('h3', { class: 'card-section__title' }, props.title),
        slots.default?.()
      ])
    }
  }
})
```

#### 8. 动态组件切换时保留公共属性

在多个动态组件间切换时，需要保持某些公共属性不变：

```ts
import { h, mergeProps, defineComponent, shallowRef, type Component } from 'vue'

import TextComponent from './TextComponent.vue'
import ImageComponent from './ImageComponent.vue'
import VideoComponent from './VideoComponent.vue'

const componentMap: Record<string, Component> = {
  text: TextComponent,
  image: ImageComponent,
  video: VideoComponent
}

export default defineComponent({
  props: {
    type: { type: String, default: 'text' },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { attrs }) {
    const currentComponent = shallowRef(componentMap[props.type])

    const commonProps = computed(() => ({
      class: ['content-block', { 'content-block--disabled': props.disabled }],
      disabled: props.disabled
    }))

    return () => h(
      currentComponent.value,
      mergeProps(commonProps.value, attrs)
    )
  }
})
```

#### 9. Tooltip / Popover 等浮层组件的触发器属性合并

浮层组件通常需要在触发元素上注入额外的事件监听器：

```ts
import { h, mergeProps, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Tooltip',
  props: {
    content: { type: String, required: true },
    placement: { type: String, default: 'top' }
  },
  setup(props, { attrs, slots }) {
    const isVisible = ref(false)

    const triggerProps = {
      onMouseenter: () => { isVisible.value = true },
      onMouseleave: () => { isVisible.value = false },
      onFocus: () => { isVisible.value = true },
      onBlur: () => { isVisible.value = false },
      'aria-describedby': 'tooltip-content'
    }

    return () => [
      // ✅ 触发元素同时保留用户传入的事件和浮层注入的事件
      h('span', mergeProps(attrs, triggerProps), slots.default?.()),
      isVisible.value && h(
        'div',
        {
          id: 'tooltip-content',
          class: ['tooltip', `tooltip--${props.placement}`],
          role: 'tooltip'
        },
        props.content
      )
    ]
  }
})
```

#### 10. 指令包装组件中合并指令相关属性

将指令的行为封装为组件时，需要将指令相关的 props 与原始 props 合并：

```ts
import { h, mergeProps, defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'

export default defineComponent({
  name: 'ClickOutside',
  props: {
    handler: { type: Function, required: true }
  },
  setup(props, { attrs, slots }) {
    const containerRef = ref<HTMLElement | null>(null)

    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        props.handler(e)
      }
    }

    onMounted(() => document.addEventListener('click', onClickOutside))
    onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

    const wrapperProps = {
      ref: containerRef,
      class: 'click-outside-wrapper'
    }

    // ✅ 合并 ref、class 等与外部传入的属性
    return () => h('div', mergeProps(wrapperProps, attrs), slots.default?.())
  }
})
```

### 六、注意事项

#### 1. `mergeProps()` 不等于 `Object.assign()`

```ts
// ❌ Object.assign 会覆盖同名事件，只有 handlerB 生效
const result1 = Object.assign(
  { onClick: handlerA },
  { onClick: handlerB }
)
// result1: { onClick: handlerB }   ← handlerA 丢失了！

// ✅ mergeProps 会合并同名事件，两个都生效
const result2 = mergeProps(
  { onClick: handlerA },
  { onClick: handlerB }
)
// result2: { onClick: [handlerA, handlerB] }   ← 两个都保留
```

#### 2. 不需要合并时可以用展开运算符

如果确认不需要合并 `class`、`style`、事件等特殊属性，直接用展开运算符即可：

```ts
// ✅ 简单覆盖场景，不需要 mergeProps
const merged = { ...props1, ...props2 }

// ✅ 需要合并 class/style/事件时才用 mergeProps
const merged = mergeProps(props1, props2)
```

> 💡 **提示：** 官方文档明确指出，如果你不需要合并行为而是简单覆盖，可以使用原生 object spread 语法来代替。

#### 3. 合并顺序影响最终结果

对于普通属性，后面的对象会覆盖前面的；对于 `class` 和 `style`，后面对象的同名属性值会覆盖前面的：

```ts
const merged = mergeProps(
  { id: 'first', style: { color: 'red' } },
  { id: 'second', style: { color: 'blue' } }
)
// 结果：{ id: 'second', style: { color: 'blue' } }
// id 被覆盖，style 中 color 被覆盖
```

#### 4. `class` 支持多种格式混合合并

`mergeProps()` 可以处理字符串、对象、数组等多种 class 格式的混合：

```ts
const merged = mergeProps(
  { class: 'a' },            // 字符串
  { class: { b: true } },    // 对象
  { class: ['c', { d: true }] } // 数组
)
// 结果：class 为合并后的统一格式，如 'a b c d'
```

#### 5. 事件监听器合并后按顺序执行

多个同名事件监听器合并为数组后，触发时会按照合并时的顺序依次执行：

```ts
const merged = mergeProps(
  { onClick: () => console.log('first') },
  { onClick: () => console.log('second') },
  { onClick: () => console.log('third') }
)
// 点击时依次输出：first → second → third
```

#### 6. 主要用于渲染函数和 JSX/TSX 场景

在模板（`<template>`）中，Vue 编译器会自动处理 `class`、`style`、事件的合并，不需要手动使用 `mergeProps()`：

```vue
<!-- ✅ 模板中 Vue 自动处理合并，不需要 mergeProps -->
<template>
  <button
    class="btn"
    :class="{ active: isActive }"
    @click="handleClick"
  >
    Click
  </button>
</template>
```

```ts
// ✅ 渲染函数 / JSX 中需要手动使用 mergeProps
export default defineComponent({
  setup() {
    return () => h('button', mergeProps(
      { class: 'btn', onClick: handleClick },
      { class: { active: isActive.value } }
    ), 'Click')
  }
})
```

#### 7. 返回值是一个全新对象

`mergeProps()` 不会修改传入的原始对象，而是返回一个全新的合并后对象：

```ts
const a = { class: 'a', id: 'foo' }
const b = { class: 'b', id: 'bar' }
const merged = mergeProps(a, b)

// ✅ a 和 b 都未被修改
console.log(a) // { class: 'a', id: 'foo' }
console.log(b) // { class: 'b', id: 'bar' }
console.log(merged) // { class: 'a b', id: 'bar' }
```

#### 8. `ref` 等特殊属性的处理

`ref` 属于普通属性，如果多个对象都包含 `ref`，后者会覆盖前者。如果需要在合并中保留 `ref`，需要注意传入顺序：

```ts
// ❌ ref 会被覆盖
const merged = mergeProps(
  { ref: refA },
  { ref: refB }
)
// 结果：{ ref: refB }  ← refA 丢失

// ✅ 只在一个对象中传入 ref
const merged = mergeProps(
  { class: 'base' },
  { ref: myRef }
)
```

#### 9. `style` 字符串格式也能正确合并

当 `style` 为字符串格式时，`mergeProps()` 也会进行合并处理：

```ts
const merged = mergeProps(
  { style: 'color: red' },
  { style: 'font-size: 14px' }
)
// 结果：{ style: { color: 'red', fontSize: '14px' } }
```

> ⚠️ **注意：** 字符串 style 会被解析为对象再合并。建议统一使用对象格式以获得更好的类型推导。

#### 10. 与 `attrs` 配合时的注意事项

在组件中使用 `$attrs` 或 `attrs` 与 `mergeProps()` 合并时，注意 `attrs` 已经包含了父组件透传的 `class`、`style` 和事件：

```ts
export default defineComponent({
  inheritAttrs: false, // ✅ 禁用自动透传，手动控制合并
  setup(props, { attrs }) {
    return () => h(
      'div',
      mergeProps(
        { class: 'wrapper' },
        attrs // 包含父组件传入的 class、style、事件等
      )
    )
  }
})
```

### 七、相关 API 对比

| API | 用途 | class/style 合并 | 事件合并 | 适用场景 |
|-----|------|-----------------|---------|---------|
| `mergeProps()` | 智能合并多个 props 对象 | ✅ 合并 | ✅ 合并为数组 | 渲染函数 / JSX |
| `Object.assign()` / `{...spread}` | 浅拷贝合并对象 | ❌ 覆盖 | ❌ 覆盖 | 简单属性覆盖 |
| `cloneVNode()` | 克隆 vnode 并附加额外 props | ✅ 合并 | ✅ 合并为数组 | 复制已存在的 vnode |
| `h()` | 创建 vnode | N/A | N/A | 直接创建节点 |

**`mergeProps()` vs `cloneVNode()`：**

```ts
import { h, mergeProps, cloneVNode } from 'vue'

// mergeProps：合并 props 对象（原始数据）
const mergedProps = mergeProps({ class: 'a' }, { class: 'b' })
const vnode1 = h('div', mergedProps)

// cloneVNode：在已有 vnode 上追加 props
const original = h('div', { class: 'a' })
const cloned = cloneVNode(original, { class: 'b' })
// 两者最终的 vnode 都会拥有 class="a b"
```

> 💡 **提示：** 如果你已经有了 vnode，用 `cloneVNode()`；如果只有 props 对象，用 `mergeProps()`。

### 八、总结

`mergeProps()` 是 Vue 3 渲染函数开发中的核心工具之一。它的核心价值在于：

1. **智能合并**：自动识别 `class`、`style`、`onXxx` 事件等特殊属性并进行合并而非覆盖
2. **简化开发**：避免手动编写复杂的合并逻辑，一行代码即可完成属性组合
3. **类型安全**：配合 TypeScript 使用时，能保持良好的类型推导
4. **组件封装利器**：在开发高阶组件、UI 组件库、包装器组件时尤为实用

记住它的适用范围：**主要用在渲染函数和 JSX/TSX 中**。在 Vue 模板中，编译器已经自动帮你完成了这些合并工作，不需要手动调用。
