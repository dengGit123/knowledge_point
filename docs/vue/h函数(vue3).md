# Vue 3 中 h() 函数完全指南

> 本文档**专注讲解 Vue 3** 中的 `h()` 函数（渲染函数 API 的核心），系统讲解它的作用、完整签名、三个参数、模板语法的等价实现、配套工具函数、函数式组件与 JSX/TSX，并对比 Vue 2 的差异，帮助你在模板力有不逮时用 JavaScript 完整地描述 UI。
>
> 它是 [《Vue 3 中 render 函数完全指南》](./render函数(vue3).md) 的姊妹篇（`h()` 负责创建单个 vnode，`render` 负责返回整棵 vnode 树），并与 [《Vue 2 中 h 函数完全指南》](./h函数(vue2).md) 互为对照，同属本 Vue 系列。

> 📖 **官方文档**
> - [渲染函数 & JSX（指南）](https://cn.vuejs.org/guide/extras/render-function.html)
> - [渲染函数 API（h / mergeProps / cloneVNode 等）](https://cn.vuejs.org/api/render-function.html)

## 目录

- [一、概述](#一概述)
- [二、核心原理：h() 与虚拟 DOM](#二核心原理h-与虚拟-dom)
- [三、h() 函数签名详解](#三h-函数签名详解)
- [四、三个参数详解](#四三个参数详解)
- [五、声明渲染函数的三种方式](#五声明渲染函数的三种方式)
- [六、模板语法的渲染函数等价实现](#六模板语法的渲染函数等价实现)
- [七、渲染函数工具箱（相关 API）](#七渲染函数工具箱相关-api)
- [八、函数式组件](#八函数式组件)
- [九、JSX / TSX 支持](#九jsx--tsx-支持)
- [十、Vue 2 与 Vue 3 的 h() 差异（对比）](#十vue-2-与-vue-3-的-h-差异对比)
- [十一、常见问题与陷阱](#十一常见问题与陷阱)
- [十二、常见应用场景](#十二常见应用场景)
- [十三、面试常见问题](#十三面试常见问题)
- [十四、总结](#十四总结)

---

## 一、概述

在 Vue 3 中，`h()` 是一个用于**创建虚拟 DOM 节点（VNode）**的函数。它是"渲染函数（render function）"写法的核心工具——当你不想（或不能）用模板（`<template>`）来描述 UI 时，就用 `h()` 在 JavaScript 里手写界面结构。

```js
import { h } from 'vue'

// 创建一个 <div id="foo" class="bar">hello</div>
const vnode = h('div', { id: 'foo', class: 'bar' }, 'hello')
```

> **通俗理解**：模板里写 `<div>hello</div>`，Vue 编译器最终会把它编译成 `h('div', 'hello')`。`h()` 就是模板的"底层等价物"——你能手写 `h()`，就等于掌握了模板能做的一切，外加 JavaScript 全部的编程能力（循环、判断、高阶函数、动态拼装……）。

`h()` 名字来自 **hyperscript**（"能生成 HTML 的 JavaScript"）。它更准确的叫法是 `createVnode()`，但渲染函数里往往要反复调用，所以用一个字母 `h` 更省力。

`h()` 的核心价值：**当模板的表达能力不够时，用 JavaScript 完整、灵活地描述 UI**。

> 💡 **什么时候用 `h()` / 渲染函数？**
> 官方建议：**绝大多数场景优先用模板**（更简洁、编译优化更好）。只有以下情况才考虑渲染函数：
> - 需要依据复杂逻辑动态拼装结构（大量 `v-if`/`v-for` 嵌套难以维护）
> - 编写可配置的组件库（如表格、表单引擎，列/字段由配置驱动）
> - 高阶组件 / 包装组件 / renderless 组件
> - 偏好 JSX/TSX 的写法

---

## 二、核心原理：h() 与虚拟 DOM

### 1. h() 返回一个 vnode

`h()` 不直接操作真实 DOM，它返回一个普通的 JS 对象——**虚拟节点（VNode）**，描述"这里应该有一个什么样的 DOM/组件"。

```js
import { h } from 'vue'

const vnode = h('div', { id: 'foo' }, [])

// vnode 的几个主要（公开）属性：
vnode.type     // 'div'    —— 节点类型（标签字符串 或 组件定义）
vnode.props    // { id: 'foo' }  —— 属性对象
vnode.children // []       —— 子节点
vnode.key      // null     —— key（未设置时为 null）
```

> ⚠️ **注意**：完整的 `VNode` 接口还包含很多内部属性，官方**强烈建议不要**直接读写这些内部属性，否则可能在版本升级时出现不兼容。

### 2. 渲染函数如何工作

Vue 3 组件的渲染，本质是"执行一个返回 vnode 的函数"。模板只是这种函数的语法糖：

```
模板 <template> ──(编译器)──▶ 渲染函数 () => vnode ──(执行)──▶ vnode ──(patch)──▶ 真实 DOM
                                                    ▲
                                  手写 h() 直接写在这里 ─┘
```

当你用 `h()` 手写渲染函数时，它会在**响应式 effect** 中执行，因此函数内部用到的任何响应式数据（`ref`/`reactive`）都会被自动追踪——数据变了，渲染函数自动重新执行、产生新 vnode、更新 DOM。

---

## 三、h() 函数签名详解

`h()` 有两个重载（来自官方 API）：

```ts
// 完整参数签名
function h(
  type: string | Component,
  props?: object | null,
  children?: Children | Slot | Slots
): VNode

// 省略 props（当子节点不是插槽对象时，可省略第二参数）
function h(type: string | Component, children?: Children | Slot): VNode

// 三个关键类型
type Children = string | number | boolean | VNode | null | Children[]
type Slot = () => Children
type Slots = { [name: string]: Slot }
```

| 参数 | 是否必填 | 含义 |
|------|:--------:|------|
| `type` | ✅ 必填 | 标签字符串（如 `'div'`）或组件定义（导入的 `.vue`/组件对象） |
| `props` | 可选 | 属性对象，可为 `null` |
| `children` | 可选 | 子节点：文本 / 数组 / 插槽函数 / 插槽对象 |

**省略 props 的规则**：当 `children` 不是插槽对象（即不是 `{ default: fn, foo: fn }` 这种）时，第二参数可以省略，直接写 children。否则必须用 `null` 占位（见第六节"传递插槽"）。

---

## 四、三个参数详解

### 1. type（节点类型）

```js
// ① 原生 HTML 元素：用字符串
h('div')
h('input')
h('my-web-component')   // 也可写自定义元素 / Web Components

// ② 组件：直接传入导入的组件定义（无需注册）
import MyComponent from './MyComponent.vue'
import Another from './Another.jsx'   // .jsx 组件也行
h(MyComponent)
h('div', [h(MyComponent), h(Another)])

// ③ 内置组件：从 vue 导入
import { h, KeepAlive, Transition, Teleport, Suspense } from 'vue'
h(Transition, { mode: 'out-in' }, () => h('div'))
```

> 💡 **关键区别于模板**：模板里用组件要先注册或用 `<script setup>`；而在渲染函数里，**直接 `import` 组件传给 `h()` 即可**，不需要注册。如果组件是用名字全局注册、无法直接导入的（比如某个库全局注册的组件），才用 `resolveComponent('Name')`。

### 2. props（属性对象）—— 扁平化结构

Vue 3 的 props 是**一个扁平对象**，所有 class、style、普通属性、DOM 属性、事件都写在同一层：

```js
// attribute 和 property 都能写，Vue 会自动分配到正确位置
h('div', { class: 'bar', innerHTML: 'hello' })

// class / style 可用数组或对象，和模板里一样
h('div', { class: [foo, { bar: isActive }], style: { color: 'red' } })

// .prop 与 .attr 修饰符：用 `.` 和 `^` 前缀
h('div', { '.name': 'some-name', '^width': '100' })

// 事件监听器：以 onXxx 形式（onClick 等价于 @click）
h('div', { onClick: () => {} })

// 事件修饰符 .passive / .capture / .once：用驼峰拼接到事件名后
h('input', {
  onClickCapture() { /* 相当于 @click.capture */ },
  onKeyupOnce() { /* 相当于 @keyup.once */ },
  onMouseoverOnceCapture() { /* 单次 + 捕获 */ }
})

// 其它事件/按键修饰符（.stop/.prevent/.self/按键）用 withModifiers
import { withModifiers } from 'vue'
h('button', { onClick: withModifiers(handler, ['stop', 'prevent']) })

// key / ref 也在 props 里
h('li', { key: item.id, ref: itemRef }, text)
```

| 场景 | 写法 | 等价模板 |
|------|------|---------|
| 普通 attribute | `{ id: 'foo' }` | `id="foo"` |
| DOM 属性 | `{ innerHTML: 'x' }` | `:innerHTML="x"` / `v-html` |
| 类名 | `{ class: ['a', { b: ok }] }` | `:class="['a', { b: ok }]"` |
| 样式 | `{ style: { color: 'red' } }` | `:style="{ color: 'red' }"` |
| 事件 | `{ onClick: fn }` | `@click="fn"` |
| `.capture`/`.once`/`.passive` | `{ onClickCapture: fn }` | `@click.capture="fn"` |
| `.stop`/`.prevent`/`.self`/按键 | `withModifiers(fn, ['stop'])` | `@click.stop="fn"` |
| `.prop` 修饰符 | `{ '.name': 'x' }` | `:name.prop="x"` |
| `.attr` 修饰符 | `{ '^width': '100' }` | `:width.attr="100"` |
| key | `{ key: id }` | `:key="id"` |
| 组件 prop | `{ someProp: 'x' }` | `:some-prop="x"` |

#### 深入：普通 attribute 与 DOM 属性（property）的区别

速查表里的"普通 attribute"和"DOM 属性"是两类不同的东西，理解它们的区别能帮你写出正确的 props。

**① HTML attribute（特性）**：写在 HTML 标签上的键值对，描述"声明 / 初始"状态，值**总是字符串**。

```html
<input id="foo" value="hello" disabled />
<!--      ↑↑↑↑↑  ↑↑↑↑↑↑↑↑↑↑  ↑↑↑↑↑↑↑↑  这些都是 attribute -->
```

- 用 `el.getAttribute('value')` / `el.setAttribute('value', 'x')` 访问。
- 有些只有 attribute、没有对应 property，如 `colspan`、`aria-label`、`data-*`、自定义 attribute。

**② DOM property（属性）**：DOM 节点对象上的 JS 属性，描述"当前实时"状态，**可以是任意类型**（字符串、布尔、数字、对象）。

```js
input.id        // 'foo'   —— 字符串
input.value     // 'hello' —— 字符串
input.disabled  // true    —— 布尔
```

- 直接 `el.value = 'x'` 读写，无需 `setAttribute`。

**③ 两者的关系与经典陷阱**

标准 attribute 大多有同名 property：`id`→`id`、`class`→`className`、`title`→`title`。但关键在于：**attribute 是"初始值"，property 是"当前值"，二者不一定同步**。

经典案例：用户在输入框里把 `hello` 改成了 `world`：

```js
const input = document.querySelector('input')

input.getAttribute('value') // 'hello'  ← attribute 不变（仍是初始值）
input.value                 // 'world'  ← property 变了（当前值）
```

> ⚠️ 这就是为什么表单的"当前值"要读 property（`el.value`）而非 attribute——这也是 `v-model` 绑定的是 property 而非 attribute 的根本原因。

**④ Vue 3 的 h() 如何自动分配**

官方原文：*"attribute 和 property 都能在 prop 中书写，Vue 会自动将它们分配到正确的位置"*。Vue 会智能判断每个 prop 该设为 attribute（`setAttribute`）还是 property（直接赋值）：

| 写法 | Vue 分配为 | 原因 |
|------|:---------:|------|
| `{ id: 'foo' }` | attribute | `id` 是标准 attribute |
| `{ innerHTML: 'x' }` | **property** | `innerHTML` 是 DOM property |
| `{ value: 'x' }`（input 上） | **property** | `input.value` 是 property |
| `{ checked: true }` | **property** | `checked` 是布尔 property |
| `{ colspan: 2 }` | attribute | `colspan` 只有 attribute，无对应 property |
| `{ '.name': 'x' }` | property（强制） | `.prop` 修饰符 |
| `{ '^width': '100' }` | attribute（强制） | `.attr` 修饰符 |

> 💡 **给组件的 prop 是 property 语义**：`h(MyComp, { foo: 'x' })` 里的 `foo` 会作为 prop 传给组件（对应其 `props` 选项），而不是 DOM attribute。

> 💡 **需要强制时**用前缀：`.prop`（写成 `{ '.xxx': v }`）强制设为 property，`.attr`（`{ '^xxx': v }`）强制设为 attribute——用于 Vue 判断不准或你想明确控制的场景。

### 3. children（子节点）—— 多种形式

```js
import { h } from 'vue'

// ① 文本子节点（字符串 / 数字）
h('div', 'hello')
h('div', { id: 'foo' }, 'hello')

// ② 子节点数组：可同时包含字符串与 vnode
h('div', ['hello', h('span', 'world')])

// ③ 嵌套
h('ul', [
  h('li', '苹果'),
  h('li', '香蕉')
])
```

> ⚠️ **组件的 children 与元素不同**：给**组件**传子节点（即插槽内容）时，必须用**插槽函数**，不能用数组（见第六节"传递插槽"）。

---

## 五、声明渲染函数的三种方式

### 方式 1：`setup()` 返回函数（组合式 API，推荐）

```js
import { ref, h } from 'vue'

export default {
  props: ['msg'],
  setup(props) {
    const count = ref(0)
    const inc = () => count.value++

    // ✅ 返回的是一个「函数」，不是值
    return () => h('div', [
      h('p', props.msg + ' ' + count.value),
      h('button', { onClick: inc }, '+1')
    ])
  }
}
```

> ⚠️ **关键陷阱**：`setup()` 在每个组件实例中**只执行一次**，而返回的渲染函数会被**多次执行**。所以一定要返回**函数**，而不是直接返回一个 `h(...)` 的结果。

```js
export default {
  setup() {
    // ❌ 错误：返回的是值，count 变化时不会重新渲染
    // return h('div', count.value)

    // ✅ 正确：返回函数
    return () => h('div', count.value)
  }
}
```

> 渲染函数还能直接返回**字符串**或**数组**（多根节点）：
> ```js
> return () => 'hello world!'              // 返回字符串
> return () => [h('div'), h('div')]        // 返回数组（多根节点）
> ```

### 方式 2：`render` 选项（选项式 API）

```js
import { h } from 'vue'

export default {
  data() {
    return { msg: 'hello' }
  },
  render() {
    // 通过 this 访问组件实例
    return h('div', this.msg)
  }
}
```

### 方式 3：函数式组件（无状态组件）

当一个组件不需要任何实例状态时，可以直接写成一个函数：

```js
// 这就是一个合法的 Vue 组件
function Hello() {
  return 'hello world!'
}
```

详见第八节。

---

## 六、模板语法的渲染函数等价实现

这是 `h()` 最实用的部分：把模板里熟悉的语法"翻译"成渲染函数。

### 1. v-if / v-else —— 三元运算符

```js
// 模板：
// <div>
//   <div v-if="ok">yes</div>
//   <span v-else>no</span>
// </div>

// 组合式 API
h('div', [ok.value ? h('div', 'yes') : h('span', 'no')])
```

> 💡 没有 `v-else-if` 的特殊语法，直接用 `if/else` 或三元/逻辑运算符即可，这正是渲染函数的灵活之处。

### 2. v-for —— 数组的 `map()`

```js
// 模板：
// <ul>
//   <li v-for="{ id, text } in items" :key="id">{{ text }}</li>
// </ul>

h(
  'ul',
  items.value.map(({ id, text }) => h('li', { key: id }, text))
)
```

> ⚠️ 渲染函数里 **`v-for` 不会自动加 key**，必须像模板一样手动在 props 里写 `{ key: id }`。

### 3. v-on 与事件修饰符

```js
// @click
h('button', { onClick(event) { /* ... */ } }, 'Click Me')

// @click.stop.prevent —— 用 withModifiers
h('button', {
  onClick: withModifiers(() => { /* ... */ }, ['stop', 'prevent'])
}, 'Click Me')

// @click.capture —— 用驼峰后缀
h('div', { onClickCapture() { /* ... */ } })
```

### 4. v-model —— 手动展开

`v-model` 在模板编译时会展开为 `modelValue` + `onUpdate:modelValue`。渲染函数里必须自己提供这两个：

```js
// 组件上的 v-model
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(SomeComponent, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (value) => emit('update:modelValue', value)
      })
  }
}
```

原生 `<input>` 上的双向绑定，手动用 `value` + `onInput`：

```js
import { ref, h } from 'vue'

const val = ref('')
h('input', {
  value: val.value,
  onInput: (e) => (val.value = e.target.value)
})
```

> 💡 多个 `v-model`（如 `v-model:title`）则用 `title` + `onUpdate:title`。

### 5. 自定义指令 —— `withDirectives`

```js
import { h, withDirectives } from 'vue'

// 自定义指令
const pin = {
  mounted() { /* ... */ },
  updated() { /* ... */ }
}

// <div v-pin:top.animate="200"></div>
const vnode = withDirectives(h('div'), [
  // [指令, value, argument, modifiers]
  [pin, 200, 'top', { animate: true }]
])
```

> 如果指令是用名字注册、无法直接导入的，用 `resolveDirective('pin')` 取到再传入。

### 6. 内置组件 —— 必须 import

```js
import { h, KeepAlive, Teleport, Transition, TransitionGroup } from 'vue'

export default {
  setup() {
    return () => h(Transition, { mode: 'out-in' }, () => h('div'))
  }
}
```

### 7. 模板引用 ref —— 组合式传对象，选项式传字符串

```js
// 组合式：传入 ref() 创建的对象
import { h, ref } from 'vue'
export default {
  setup() {
    const divEl = ref()
    return () => h('div', { ref: divEl })   // <div ref="divEl">
  }
}

// 选项式：传入字符串名字
export default {
  render() {
    return h('div', { ref: 'divEl' })
  }
}
```

### 8. 插槽（重点）

#### 渲染插槽（在子组件内部使用插槽）

`slots` 对象里每个插槽都是**返回 vnode 数组的函数**：

```js
// 组合式
export default {
  props: ['message'],
  setup(props, { slots }) {
    return () => [
      // 默认插槽：<div><slot /></div>
      h('div', slots.default()),

      // 具名插槽 + 作用域：<div><slot name="footer" :text="message" /></div>
      h('div', slots.footer({ text: props.message }))
    ]
  }
}
```

#### 传递插槽（在父组件给子组件传插槽内容）

给组件传子节点要用**插槽函数**（而非数组）：

```js
// 单个默认插槽
h(MyComponent, () => 'hello')

// 具名插槽：注意 null 是必须的，避免插槽对象被当成 prop
h(MyComponent, null, {
  default: () => 'default slot',
  foo: () => h('div', 'foo'),
  bar: () => [h('span', 'one'), h('span', 'two')]
})
```

#### 作用域插槽（子组件向父组件回传数据）

```js
// 父组件
export default {
  setup() {
    return () =>
      h(MyComp, null, {
        default: ({ text }) => h('p', text)   // 接收子组件回传的 text
      })
  }
}

// 子组件
export default {
  setup(props, { slots }) {
    const text = ref('hi')
    return () => h('div', null, slots.default({ text: text.value }))
  }
}
```

> 💡 插槽以**函数**形式传递，是为了让子组件**懒调用**它——这样插槽里的响应式依赖会被正确注册到子组件，而非父组件，更新更精准高效。

---

## 七、渲染函数工具箱（相关 API）

| API | 作用 | 典型场景 |
|------|------|---------|
| `h()` | 创建 vnode | 渲染函数核心 |
| `mergeProps(...args)` | 合并多个 props 对象（自动合并 class / style / `onXxx`） | 高阶组件合并透传属性 |
| `cloneVNode(vnode, extraProps)` | 克隆 vnode 并附加额外 props | 复用 + 改造 vnode |
| `isVNode(value)` | 判断一个值是否是 vnode | 类型守卫 |
| `resolveComponent(name)` | 按名字解析已注册组件 | 用到无法 import 的全局组件 |
| `resolveDirective(name)` | 按名字解析已注册指令 | 用到无法 import 的全局指令 |
| `withDirectives(vnode, dirs)` | 给 vnode 添加自定义指令 | 渲染函数中使用 `v-xxx` |
| `withModifiers(fn, mods)` | 给事件处理函数加内置修饰符 | `@click.stop` 等 |

### mergeProps：合并 class / style / 事件

```js
import { mergeProps } from 'vue'

const one = { class: 'foo', onClick: handlerA }
const two = { class: { bar: true }, onClick: handlerB }

const merged = mergeProps(one, two)
// {
//   class: 'foo bar',           // class 自动合并
//   onClick: [handlerA, handlerB] // 同名事件合并成数组
// }
```

> 💡 如果你**不想要**合并行为、只是想覆盖，用对象展开 `{ ...one, ...two }` 即可，不必用 `mergeProps`。

### cloneVNode：vnode 是不可变的

```js
import { h, cloneVNode } from 'vue'

const original = h('div')
// ❌ 不要直接改已创建的 vnode
// original.props = { id: 'foo' }

// ✅ 用 cloneVNode 附加额外 props
const cloned = cloneVNode(original, { id: 'foo' })
```

> ⚠️ vnode 创建后**不可变**。cloneVNode 处理了 vnode 的内部属性，比单纯 `{ ...vnode }` 更安全。

### resolveComponent / resolveDirective

```js
import { h, resolveComponent, resolveDirective } from 'vue'

export default {
  setup() {
    // 必须在 setup() 或渲染函数内调用
    const ButtonCounter = resolveComponent('ButtonCounter')

    return () => h(ButtonCounter)
  }
}
```

> 💡 **能直接 `import` 就不要用这两个**。它们主要用于解析全局注册、无法直接导入的组件/指令；找不到时会警告并返回组件名字符串 / `undefined`。

---

## 八、函数式组件

函数式组件（Functional Component）是一种**没有自身状态**的组件，像纯函数：接收 props，返回 vnode。它**不会创建组件实例**（没有 `this`），也**不触发生命周期钩子**——选项式的 `mounted` 等不触发，组合式的 `onMounted` 等同样**不可用**（它们依赖"当前活动组件实例"，而函数式组件没有实例，强行调用会得到 `onMounted is called when there is no active component instance` 警告）。

```js
// 签名和 setup() 相同
function MyComponent(props, { slots, emit, attrs }) {
  // 直接返回 vnode，没有 setup 的"返回函数"那一层
  return h('button', { onClick: () => emit('click') }, props.label)
}

// 声明 props / emits（与普通组件选项不同，用属性挂载）
MyComponent.props = ['label']
MyComponent.emits = ['click']

// 可禁用 attrs 继承
MyComponent.inheritAttrs = false
```

| 特性 | 普通组件 | 函数式组件 |
|------|---------|-----------|
| 是否创建实例 | ✅ 是 | ❌ 否 |
| `this` | ✅ 有 | ❌ 无 |
| 生命周期钩子 | ✅ 有 | ❌ 无（无组件实例：选项式钩子不触发，组合式 `onMounted` 等也不可用） |
| 响应式状态 | ✅ data/setup | ❌ 无自身状态 |
| 适用场景 | 通用 | 纯展示 / 无状态包装 |

> 💡 在 Vue 3 中，函数式组件的性能优势已不如 Vue 2 明显（Vue 3 的普通组件本身已经很轻量），所以**不要为了"性能"盲目用函数式组件**；它在"纯展示 / 无状态"语义清晰时才更合适。

---

## 九、JSX / TSX 支持

如果你嫌 `h()` 嵌套写起来繁琐，可以用 **JSX/TSX**——它是 `h()` 的语法糖，编译后就是 `h()` 调用。

```jsx
// JSX 写法（等价于 h('div', { id }, `hello, ${userName}`)）
const vnode = <div id={dynamicId}>hello, {userName}</div>
```

`create-vue` 和 Vue CLI 都**预置了 JSX 支持**。手动配置可参考 `@vue/babel-plugin-jsx`，Vite 项目通常用 `@vitejs/plugin-vue-jsx`。

### Vue 的 JSX 与其它框架不同

> ⚠️ **重要**：Vue 的 JSX 转换与 React 不同，**不能混用**。主要差异：
> - 直接用 HTML 属性名 `class` / `for`，不需要 `className` / `htmlFor`
> - 给组件传子元素（插槽）的方式不同

### TSX 类型推断

Vue 3.4 起，不再隐式注册全局 `JSX` 命名空间。使用 TSX 时在 `tsconfig.json` 配置：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

也可在文件顶部加 `/* @jsxImportSource vue */` 单独开启。

---

## 十、Vue 2 与 Vue 3 的 h() 差异（对比）

这是 Vue 2 升级 Vue 3、或从 Vue 2 心智迁移时**最需要重新理解**的点：**props 从"嵌套命名空间"变成了"扁平对象"**。

| 维度 | Vue 2（`createElement` / `this.$createElement`） | **Vue 3（`h`）** |
|------|----------|----------|
| 函数来源 | `render(h)` 或 `this.$createElement` | 从 `'vue'` 导入 `h` |
| props 结构 | **嵌套命名空间** | **扁平对象** |
| class / style | `{ class, style }` | `{ class, style }`（同样支持数组/对象） |
| 普通 attribute | `{ attrs: { id } }` | `{ id }`（直接写） |
| 组件 prop | `{ props: { foo } }` | `{ foo }`（直接写） |
| DOM 属性 | `{ domProps: { value } }` | `{ value }` / `{ innerHTML }`（直接写） |
| 事件 | `{ on: { click } }` | `{ onClick }`（`onXxx`） |
| 组件根元素原生事件 | `{ nativeOn: { click } }` | 直接 `onClick`（Vue 3 移除了 `.native`） |
| 是否需要注册组件 | 需注册 / `resolveComponent` | **直接 import 传入即可** |
| v-model | 框架半自动 | **完全手动**展开为 `modelValue` + `onUpdate:modelValue` |
| 插槽 | `{ scopedSlots }` / `slot` | 以**插槽函数 / 插槽对象**作 children |

对比示例：

```js
// Vue 2：嵌套结构
h('div', {
  class: 'box',
  attrs: { id: 'foo' },
  props: { value: 'x' },          // 组件 prop
  domProps: { innerHTML: 'hi' },  // DOM 属性
  on: { click: handler },         // 事件
  nativeOn: { click: nativeHandler }
}, [h('span', 'text')])

// Vue 3：扁平结构
h('div', {
  class: 'box',
  id: 'foo',
  value: 'x',
  innerHTML: 'hi',
  onClick: handler
}, [h('span', 'text')])
```

> 💡 **记忆口诀**：Vue 3 的 props 就像"模板里所有属性的扁平集合"——别再分 `attrs`/`props`/`domProps`/`on`，统统写在同一层，事件统一加 `on` 前缀。

---

## 十一、常见问题与陷阱

### 陷阱 1：复用同一个 vnode（VNode 必须唯一）

```js
function render() {
  const p = h('p', 'hi')
  // ❌ 错误：同一个 vnode 被用两次，渲染异常
  return h('div', [p, p])
}
```

```js
// ✅ 正确：用工厂函数每次创建新的 vnode
function render() {
  return h('div', Array.from({ length: 20 }).map(() => h('p', 'hi')))
}
```

### 陷阱 2：`setup()` 返回了值而不是函数

```js
export default {
  setup() {
    const count = ref(0)
    // ❌ 返回值：只渲染一次，count 变化不更新
    // return h('div', count.value)

    // ✅ 返回函数：响应式变化时重新执行
    return () => h('div', count.value)
  }
}
```

### 陷阱 3：给组件传子节点用了数组（应为插槽函数）

```js
// ❌ 错误：组件的子节点不能用数组
h(MyComponent, [h('span', 'hi')])

// ✅ 正确：单个默认插槽用函数
h(MyComponent, () => h('span', 'hi'))

// ✅ 正确：具名插槽用对象（注意 null 占位）
h(MyComponent, null, {
  default: () => h('span', 'hi')
})
```

### 陷阱 4：具名插槽对象被当成 props（漏写 `null`）

```js
// ❌ 错误：第二个参数直接是插槽对象，会被当成 props
h(MyComponent, { default: () => 'hi' })

// ✅ 正确：props 用 null 占位，插槽放第三参数
h(MyComponent, null, { default: () => 'hi' })
```

### 陷阱 5：v-for 忘记手动加 key

```js
// ❌ 没加 key
h('ul', items.value.map(item => h('li', item.text)))

// ✅ 手动加 key
h('ul', items.value.map(item => h('li', { key: item.id }, item.text)))
```

### 陷阱 6：修改已创建的 vnode

```js
const vnode = h('div')
// ❌ vnode 不可变，直接改 props 有隐患
vnode.props = { id: 'foo' }

// ✅ 用 cloneVNode
const cloned = cloneVNode(vnode, { id: 'foo' })
```

### 陷阱 7：事件名格式错误

```js
// ❌ 用 onclick / on-click 都不对
h('button', { onclick: fn })
h('button', { 'on-click': fn })

// ✅ 用 on + 大驼峰：onClick
h('button', { onClick: fn })
```

### 陷阱 8：在 setup/render 之外调用 resolveComponent

```js
// ❌ 在模块顶层调用，拿不到组件上下文
const Btn = resolveComponent('Btn')

export default {
  setup() {
    // ✅ 必须在 setup() 或渲染函数内调用
    const Btn = resolveComponent('Btn')
    return () => h(Btn)
  }
}
```

---

## 十二、常见应用场景

### 场景 1：配置驱动的动态渲染（如表格列）

```js
// 根据列配置动态渲染表头与单元格
function renderTable(columns, data) {
  return h('table', [
    h('thead', h('tr', columns.map(col => h('th', col.title)))),
    h('tbody', data.map(row =>
      h('tr', { key: row.id }, columns.map(col =>
        h('td', col.render ? col.render(row) : row[col.field])
      ))
    ))
  ])
}
```

### 场景 2：函数式展示组件

```js
// 一个无状态的水平分割线组件
function Divider(props) {
  return h('hr', { class: ['divider', `divider--${props.size}`] })
}
Divider.props = ['size']
```

### 场景 3：高阶 / 包装组件（合并透传属性）

```js
import { h, mergeProps } from 'vue'

// 给任意组件包一层额外 class 与事件
export function withTheme(Wrapped) {
  return (props, { attrs, slots }) =>
    h(Wrapped, mergeProps({ class: 'theme-default' }, attrs), slots)
}
```

### 场景 4：带复杂条件的标题渲染

```js
// 当 v-if/v-else 嵌套过多、模板难维护时，渲染函数更清晰
function renderHeading(level, text, icon) {
  const Tag = `h${level}`            // h1 ~ h6 动态标签
  return h(Tag, [
    icon ? h(Icon, { name: icon }) : null,  // 条件渲染图标
    text
  ])
}
```

### 场景 5：用 JSX 写复杂业务组件

```jsx
// 用 JSX 替代层层 h()，更易读
const UserProfile = ({ user }) => (
  <div class="profile">
    <Avatar src={user.avatar} />
    <div>
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  </div>
)
```

---

## 十三、面试常见问题

### Q1：Vue 3 中 h() 函数是什么？返回什么？

`h()` 是 Vue 3 渲染函数 API 的核心，用于创建**虚拟 DOM 节点（VNode）**。它接收 `type`（标签字符串或组件）、`props`、`children`，返回一个描述 UI 的普通 JS 对象（vnode）。`h` 是 hyperscript 的简称，更准确的叫法是 `createVnode()`。Vue 的模板在编译后其实就是 `h()` 调用。

### Q2：h() 和模板有什么关系？什么时候用 h()？

模板是渲染函数的语法糖，编译后就是返回 vnode 的渲染函数。**绝大多数场景优先用模板**（更简洁、编译期有静态/补丁标记优化）；当需要复杂逻辑动态拼装结构、写配置驱动的组件库、高阶/renderless 组件，或偏好 JSX 时，才用 `h()` / 渲染函数。

### Q3：h() 的三个参数分别是什么？

- `type`：必填，标签字符串（`'div'`）或组件定义（导入的 `.vue`/组件对象/内置组件）。
- `props`：可选，扁平的属性对象，class/style/普通属性/DOM 属性/事件（`onXxx`）/`key`/`ref` 都写在这一层；可为 `null`。
- `children`：可选，子节点。元素用文本/数组；**组件必须用插槽函数（单个）或插槽对象（具名）**。

### Q4：Vue 3 渲染函数里如何实现 v-if / v-for / v-model？

- `v-if`：三元运算符或 `if/else`，例如 `ok.value ? h('div','yes') : h('span','no')`。
- `v-for`：用 `array.map()`，并**手动加 `key`**：`items.value.map(i => h('li', { key: i.id }, i.text))`。
- `v-model`：手动展开为 `modelValue` + `onUpdate:modelValue`（原生 input 用 `value` + `onInput`）。

### Q5：Vue 3 和 Vue 2 的 h() 有什么区别？

最大区别是 **props 从嵌套命名空间变成扁平对象**：Vue 2 要分 `attrs`/`props`/`domProps`/`on`/`nativeOn`，Vue 3 统统写在同一层，事件用 `onXxx`。此外 Vue 3 用组件可直接 `import` 传入（无需注册）、移除了 `nativeOn`、v-model 需手动展开。

### Q6：为什么 setup() 返回渲染函数时要返回"函数"而不是"值"？

因为 `setup()` 在每个组件实例只执行**一次**，而渲染函数会被**多次执行**。若返回 `h(...)` 的结果（值），它只会在 setup 执行那一次生成 vnode，后续响应式数据变化不会重新渲染；返回函数才能保证数据变化时重新执行、产生新 vnode。

### Q7：组件的 children 和元素的 children 有什么不同？

元素的 children 可以是文本或 vnode 数组；但**组件的 children 必须以插槽函数传递**——单个默认插槽用一个函数，多个具名插槽用 `{ default: fn, name: fn }` 对象（此时 props 要用 `null` 占位）。插槽用函数是为了让子组件懒调用、把依赖正确注册到子组件。

### Q8：渲染函数里如何处理事件修饰符（.stop / .capture / .once）？

`.passive`/`.capture`/`.once` 用驼峰拼接到事件名后，如 `onClickCapture`、`onKeyupOnce`；`.stop`/`.prevent`/`.self`/按键修饰符用 `withModifiers(fn, ['stop'])` 包装。

### Q9：VNode 为什么必须唯一？怎么复用？

Vue 在 patch 时假设组件树中的 vnode 是唯一的，重复使用同一个 vnode 引用会导致渲染异常。要复用相同结构，用**工厂函数**（如 `Array.from(...).map(() => h('p'))`）每次产生新 vnode，而非引用同一个。

### Q10：mergeProps / cloneVNode / withDirectives / resolveComponent 分别做什么？

- `mergeProps`：合并多个 props，自动合并 `class`/`style`/`onXxx`（同名事件合并成数组）。
- `cloneVNode`：克隆 vnode 并附加额外 props（vnode 创建后不可变，不能直接改）。
- `withDirectives`：给 vnode 添加自定义指令。
- `resolveComponent`：按名字解析已注册、无法直接 import 的组件（必须能在 setup/渲染函数内调用）。

---

## 十四、总结

| 要点 | 核心结论 |
|------|---------|
| **h() 是什么** | 创建虚拟 DOM 节点（VNode）的函数，hyperscript 简称 |
| **返回值** | 一个 vnode 对象（含 type / props / children / key） |
| **签名** | `h(type, props?, children?)`，可省略 props |
| **type** | 标签字符串 或 组件定义（直接 import，无需注册） |
| **props** | 扁平对象：class/style/属性/DOM 属性/`onXxx` 事件/key/ref 都在一层 |
| **children** | 元素：文本/数组；组件：插槽函数 / 插槽对象 |
| **声明方式** | setup 返回函数（组合式）/ render 选项（选项式）/ 函数式组件 |
| **模板等价** | v-if→三元、v-for→map+key、v-model→手动展开、事件修饰符→`onXxx`/withModifiers |
| **关键原则** | vnode 必须唯一、不可变；setup 返回函数而非值 |
| **Vue 3 vs 2** | props 扁平化、组件免注册、移除 nativeOn、v-model 手动展开 |
| **工具箱** | mergeProps / cloneVNode / isVNode / resolveComponent / withDirectives / withModifiers |
| **使用场景** | 配置驱动渲染、函数式组件、高阶组件、JSX 业务组件 |

**记住五句话**：

1. **`h()` 返回 vnode，是模板编译后的"底层等价物"，数据驱动 UI 时优先用模板，需要完整 JS 编程能力时再用 `h()`。**
2. **`h(type, props, children)`：type 必填；props 是扁平对象，class/style/属性/`onXxx` 事件/key 都在一层；元素 children 用文本或数组，组件 children 必须用插槽函数。**
3. **`setup()` 要返回渲染函数（而非值），函数内的响应式数据会被自动追踪，数据变化即重新渲染。**
4. **模板语法在渲染函数里都"翻译"成 JS：v-if 用三元、v-for 用 `map()`（记得加 key）、v-model 手动展开为 `modelValue`+`onUpdate:modelValue`。**
5. **vnode 必须唯一且不可变——复用用工厂函数、改造用 `cloneVNode`；这是渲染函数最常见的两个坑。**
