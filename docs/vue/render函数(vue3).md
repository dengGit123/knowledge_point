# Vue 3 中 render 函数（渲染函数）完全指南

> 本文档**专注讲解 Vue 3 的 render 函数（渲染函数）**：它是什么、组件如何借助它工作、背后的渲染管线与编译优化、如何声明与缓存，以及它与 `h()`、模板的关系。
>
> 它是 [《Vue 3 中 h() 函数完全指南》](./h函数(vue3).md) 的姊妹篇：**`h()` 是"创建单个 vnode 的工具"，而 `render` 函数是"组件整体返回 vnode 树的函数"**——前者是后者的"零件"，后者是组件渲染的"发动机"。并与 [《Vue 2 中 render 函数完全指南》](./render函数(vue2).md) 对照（Vue 2 用 `Object.defineProperty` + 组件 Watcher 驱动渲染）。

> 📖 **官方文档**
> - [渲染机制（虚拟 DOM / 渲染管线 / 编译优化）](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)
> - [渲染函数 & JSX（如何编写渲染函数）](https://cn.vuejs.org/guide/extras/render-function.html)

## 目录

- [一、概述](#一概述)
- [二、核心概念：render 函数与渲染管线](#二核心概念render-函数与渲染管线)
- [三、声明 render 函数的三种方式](#三声明-render-函数的三种方式)
- [四、render 函数的返回值](#四render-函数的返回值)
- [五、组合式 vs 选项式 render 的差异](#五组合式-vs-选项式-render-的差异)
- [六、渲染机制与编译优化（手写 render 会失去什么）](#六渲染机制与编译优化手写-render-会失去什么)
- [七、渲染结果的缓存与性能优化](#七渲染结果的缓存与性能优化)
- [八、render 与 h() 的关系详解](#八render-与-h-的关系详解)
- [九、顶层 createApp 的 render](#九顶层-createapp-的-render)
- [十、JSX / TSX 作为 render 的语法糖](#十jsx--tsx-作为-render-的语法糖)
- [十一、常见问题与陷阱](#十一常见问题与陷阱)
- [十二、常见应用场景](#十二常见应用场景)
- [十三、面试常见问题](#十三面试常见问题)
- [十四、总结](#十四总结)

---

## 一、概述

在 Vue 3 中，**render 函数（渲染函数）是一个返回虚拟 DOM 树（vnode 树）的函数**。它是每个组件的"渲染入口"——组件挂载时执行它得到 vnode，再由渲染器把 vnode 变成真实 DOM。

```js
import { h } from 'vue'

// 一个最简单的渲染函数：返回一个 vnode 树
function render() {
  return h('div', 'hello world')
}
```

> **通俗理解**：你写的 `<template>` 模板，Vue 编译器最终会把它变成一个 `render` 函数。所以**模板 = 编译后的 render 函数**。当你手写 render 函数时，你就是在写"模板编译后的样子"——获得了 JavaScript 完整的编程能力，但也绕过了模板的编译期优化（见第六节）。

### render 函数 vs h() —— 一句话区分

| | `render` 函数 | `h()` 函数 |
|---|---|---|
| 是什么 | 组件的渲染入口，**返回整棵 vnode 树** | 在 render 内部**创建单个 vnode** 的工具 |
| 关系 | 包含并调用 `h()` | 被 render 函数调用 |
| 粒度 | 整棵树（宏观） | 单个节点（微观） |

```js
// render 函数内部，用 h() 一个个拼出 vnode 树
function render() {
  return h('div', [          // ← render 决定树的结构
    h('h1', '标题'),          // ← h() 创建单个 vnode
    h('p', '内容')
  ])
}
```

> 💡 **核心价值**：当模板的表达能力不够（高度动态、复杂逻辑拼装、组件库、JSX 偏好）时，用 render 函数获得完整的 JavaScript 编程能力来描述 UI。

---

## 二、核心概念：render 函数与渲染管线

### 1. 虚拟 DOM（Virtual DOM）

虚拟 DOM 是用**纯 JS 对象**描述目标 UI 的数据结构。一个 vnode 就是这样一个对象：

```js
const vnode = {
  type: 'div',          // 节点类型
  props: { id: 'hello' }, // 属性
  children: [/* 更多 vnode */] // 子节点
}
```

渲染器（renderer）会：
- **挂载（mount）**：遍历 vnode 树，创建真实 DOM。
- **更新（patch，又称 diff / 协调）**：拿新旧两棵 vnode 树比对，把差异应用到真实 DOM。

### 2. 渲染管线（render pipeline）—— render 函数的位置

从高层看，组件挂载/更新时发生三件事，**render 函数处于核心环节**：

```
① 编译（Compile）
   模板 <template> ──▶ 渲染函数 render()
   （可在构建时预编译，也可用运行时编译器即时完成）

② 挂载（Mount）
   渲染器「调用 render()」 ──▶ 得到 vnode 树 ──▶ 创建真实 DOM
   ▲
   └── 这一步作为「响应式副作用」执行，会追踪 render 内用到的所有响应式依赖

③ 更新（Patch / Update）
   依赖变化 ──▶ 副作用重新运行 ──▶ render() 再次执行 ──▶ 新 vnode 树
            ──▶ 与旧树 diff ──▶ 应用更新到真实 DOM
```

```
            ┌──────────────────────────────────┐
            │   render()  ← 渲染函数（核心）      │
            └──────────────────────────────────┘
              ▲ 依赖追踪            │ 返回 vnode 树
   响应式数据变化触发重新执行         ▼
            ┌──────────────────────────────────┐
            │   渲染器 patch：新旧 vnode diff      │
            └──────────────────────────────────┘
                         │ 最小化 DOM 操作
                         ▼
                    真实 DOM 更新
```

### 3. render 是一个"响应式副作用"

这是理解 render 函数最关键的一点：**render 函数在响应式 effect（组件 effect）中执行**。

- 执行过程中读取的任何响应式数据（`ref`/`reactive`）都会被自动追踪。
- 当这些数据变化时，effect 重新运行——**render 函数自动重新执行**，产生新 vnode，触发更新。

```js
import { ref, h } from 'vue'

export default {
  setup() {
    const count = ref(0)                    // 响应式数据
    const inc = () => count.value++

    // 返回的渲染函数：执行时读取 count.value，于是 count 被追踪
    return () => h('div', [
      h('p', `计数：${count.value}`),       // ← 这里访问 count.value，建立依赖
      h('button', { onClick: inc }, '+1')
    ])
  }
}
// 点击按钮 → count.value 变 → 触发 effect → render 重新执行 → 界面更新
```

> 💡 **这正是"响应式驱动视图"的底层机制**：render 函数是"声明 UI 长什么样"，响应式系统负责"数据变了就重新跑一遍 render"。

---

## 三、声明 render 函数的三种方式

### 方式 1：`setup()` 返回函数（组合式 API，推荐）

```js
import { ref, h } from 'vue'

export default {
  props: ['msg'],
  setup(props) {
    const count = ref(0)
    // ✅ 返回「函数」本身，这就是渲染函数
    return () => h('div', `${props.msg}: ${count.value}`)
  }
}
```

> ⚠️ **关键**：必须返回**函数**，而不是返回 `h(...)` 的结果（值）。原因见第十一节陷阱 1。

### 方式 2：`render` 选项（选项式 API）

```js
import { h } from 'vue'

export default {
  data() {
    return { msg: 'hello' }
  },
  render() {
    // 通过 this 访问组件实例（data / methods / computed / props）
    return h('div', this.msg)
  }
}
```

### 方式 3：函数式组件（无状态组件直接是渲染函数）

```js
// 一个普通函数，本身就是渲染函数 + 组件定义
function Hello() {
  return h('div', 'hello world')
}
```

> 💡 三种方式殊途同归：它们都给 Vue 提供了一个"返回 vnode 的函数"。Vue 内部会把它包进组件 effect 中执行。

---

## 四、render 函数的返回值

render 函数不仅可以返回 vnode，还能返回其它类型：

| 返回类型 | 含义 | 示例 |
|---------|------|------|
| **VNode** | 一个虚拟节点（最常见） | `return h('div', 'hi')` |
| **字符串 / 数字** | 文本节点 | `return 'hello'` |
| **数组** | 多根节点 / 片段（fragment） | `return [h('div'), h('div')]` |
| **null** | 不渲染（占位/注释） | `return null` |
| **布尔** | 不渲染 | `return false` |

```js
// 返回字符串
setup() {
  return () => 'hello world!'
}

// 返回数组（多根节点，等价于模板的 fragment）
import { h } from 'vue'
setup() {
  return () => [h('div'), h('div'), h('div')]
}

// 条件性返回 null
setup() {
  const show = ref(true)
  return () => (show.value ? h('div', '可见') : null)
}
```

---

## 五、组合式 vs 选项式 render 的差异

这两种写法最常被混淆，重点区别是 **`this`** 和**响应式数据的访问方式**：

| 维度 | `setup()` 返回函数（组合式） | `render` 选项（选项式） |
|------|--------------------------|----------------------|
| `this` | ❌ **没有 `this`**（setup 返回的箭头/普通函数都无组件实例 this） | ✅ 有 `this`，指向组件实例 |
| 访问 ref | 要 `.value`：`count.value` | 无 `.value`（模板里的 ref 在 render 中通过 `this` 自动解包） |
| 访问 props | `props.xxx`（setup 的参数） | `this.xxx` |
| 访问 data | 在 setup 中用 `ref`/`reactive` | `this.xxx` |
| 推荐度 | ✅ Vue 3 推荐 | 传统写法，仍受支持 |

```js
// 组合式：无 this，ref 要 .value
import { ref, h } from 'vue'
export default {
  setup() {
    const count = ref(0)
    return () => h('div', count.value)   // ✅ count.value
    // ❌ return () => h('div', this.count)  // setup 返回的函数没有 this
  }
}

// 选项式：有 this，直接 this.count
export default {
  data() { return { count: 0 } },
  render() {
    return h('div', this.count)          // ✅ this.count
  }
}
```

> 💡 **为什么 setup 的渲染函数没有 `this`？** 因为它只是 setup 内部定义的一个普通函数并返回出去，并不绑定组件实例。setup 内部的局部变量（ref 等）通过闭包直接访问，不需要 `this`。

---

## 六、渲染机制与编译优化（手写 render 会失去什么）

> 这一节是理解"为什么 Vue 默认推荐模板"的关键，也是手写 render 函数最重要的**权衡点**。

### 1. 模板 vs. 渲染函数

Vue 模板会被**预编译**成渲染函数。你也可以不写模板，直接手写渲染函数。那么为什么官方默认推荐模板？

1. **模板更贴近 HTML**：方便复用 HTML 代码、可访问性更好、利于设计师理解。
2. **模板可静态分析**：编译器能对模板做**编译时优化**，提升运行时性能；而手写的渲染函数（用 `h()`）是"纯运行时"的，拿不到这些优化。

> 💡 实践结论：**模板对绝大多数场景都够用且更快**；渲染函数一般只在需要高度动态渲染逻辑的可复用组件中使用。

### 2. 手写 render 失去的三大编译优化

Vue 3 的编译器会为模板生成的渲染函数注入大量"编译时信息"，称为**带编译时信息的虚拟 DOM**。手写 `h()` 时这些都**没有**：

#### ① 静态提升（Static Hoisting）

模板中纯静态的部分，编译器会把其 vnode 创建函数**提升到 render 函数之外**，每次渲染复用同一个 vnode，渲染器直接跳过它们的比对。

```html
<div>
  <div>foo</div>  <!-- 静态，被提升并复用 -->
  <div>bar</div>  <!-- 静态，被提升并复用 -->
  <div>{{ dynamic }}</div>
</div>
```

> 手写 `h('div', [h('div','foo'), h('div','bar'), ...])` 时，`foo`/`bar` 的 vnode 每次渲染都会重新创建——失去静态提升。

#### ② patch flag（更新类型标记）

对于有动态绑定的元素，编译器在 vnode 上编码"它具体哪部分会变"，运行时用**位运算**精确判断：

```js
// 模板 <div :class="{ active }"></div> 编译产物
createElementVNode('div', {
  class: _normalizeClass({ active: _ctx.active })
}, null, 2 /* CLASS */)   // ← 末尾的 2 就是 patch flag

// 运行时
if (vnode.patchFlag & PatchFlags.CLASS /* 2 */) {
  // 只更新 class，不比对其它属性
}
```

> 手写 `h('div', { class: { active } })` 没有这个 flag，运行时要**全量比对**所有 props。

#### ③ 树结构打平（Block Tree）

编译器会把模板转成"区块（block）"，每个 block 只追踪其**动态后代节点**（打平为一个数组）。重渲染时只遍历这个"动态节点数组"，而非整棵树。

```
div (block root)
- div 带有 :id 绑定       ← 只追踪动态节点
- div 带有 {{ bar }} 绑定  ← 只追踪动态节点
（静态节点全部跳过）
```

> `v-if` / `v-for` 会创建新的子 block。手写 `h()` 时没有 block，diff 要遍历更多节点。

### 3. 编译优化对比小结

| 优化 | 模板（编译产物） | 手写 render（h()） |
|------|:-----------:|:--------------:|
| 静态提升 | ✅ 有 | ❌ 无（静态 vnode 每次重建） |
| patch flag | ✅ 有（精确更新） | ❌ 无（全量比对 props） |
| 树结构打平（block） | ✅ 有（只遍历动态节点） | ❌ 无（遍历更多节点） |
| SSR 激活加速 | ✅ 有 | ❌ 无 |

> ⚠️ **结论**：手写 render 函数能获得**灵活性**，但会**失去编译期优化**，因此同等结构下通常比模板略慢。只有在你确实需要 `h()` 的灵活性、或愿意手动用 `createVNode` + patchFlag 进行底层优化时，才值得手写。

---

## 七、渲染结果的缓存与性能优化

render 函数每次更新都会重新执行，所以**避免在 render 中做昂贵计算**。

### 1. 用 `computed` 缓存昂贵计算

```js
import { ref, computed, h } from 'vue'

export default {
  setup() {
    const list = ref([...])
    // ✅ computed 只在 list 变化时重算，不会每次渲染都算
    const sorted = computed(() => expensiveSort(list.value))

    return () =>
      h('ul', sorted.value.map(item => h('li', { key: item.id }, item.name)))
  }
}
```

### 2. 缓存不变的 vnode / 大对象

对于完全不变的 vnode，最有效的做法是模拟编译器的**静态提升**——把它的创建提到 render 函数之外（模块级），每次渲染复用同一引用：

```js
import { ref, h } from 'vue'

// ✅ 不变的 vnode 提到模块级，只创建一次，每次 render 复用（模拟静态提升）
const staticHeader = h('h1', '不变的标题')

export default {
  setup() {
    const dynamic = ref(0)
    return () => h('div', [staticHeader, h('p', dynamic.value)])
  }
}
```

如果 vnode / 大对象必须存进**响应式状态**（`ref`/`reactive`），用 `markRaw` 标记它，避免被响应式系统代理而产生无谓开销（`shallowRef` 也能达到类似效果——只对 `.value` 响应、不深代理内部）：

```js
import { ref, markRaw } from 'vue'

// ✅ markRaw：标记对象永不响应式，存进 ref 时不会被代理
const current = ref(markRaw(h('div', '初始内容')))
```

### 3. VNode 必须唯一（工厂函数）

render 每次执行都要创建**新**的 vnode，不能复用同一个引用：

```js
export default {
  setup() {
    return () => {
      // ❌ 同一个 vnode 引用被复用两次，渲染异常
      // const p = h('p', 'hi')
      // return h('div', [p, p])

      // ✅ 工厂函数：每次创建新 vnode
      return h('div', Array.from({ length: 20 }, () => h('p', 'hi')))
    }
  }
}
```

> 💡 详见姊妹篇 [《Vue 3 中 h() 函数完全指南》](./h函数(vue3).md) 的"陷阱"章节。

---

## 八、render 与 h() 的关系详解

一句话：**render 是组件的渲染入口（返回树），h() 是 render 内部拼节点的工具（造单个 vnode）。**

```js
import { h } from 'vue'

// 模板：
// <div class="card">
//   <h1>{{ title }}</h1>
//   <p v-if="show">内容</p>
// </div>

export default {
  props: ['title', 'show'],
  setup(props) {
    // 渲染函数：决定整棵树的结构
    return () =>
      h('div', { class: 'card' }, [
        h('h1', props.title),                      // h() 造单个节点
        props.show ? h('p', '内容') : null         // v-if 用三元
      ])
  }
}
```

### 看一眼模板编译后的 render

模板 `<div>{{ msg }}</div>` 编译后大致是：

```js
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString } from 'vue'

export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock('div', null,
    _toDisplayString(_ctx.msg), 1 /* TEXT */   // ← 1 是 patch flag，表示只有文本会变
  ))
}
```

> 💡 对比可见：**模板编译出的 render 用的是 `createElementVNode` + patch flag + block（`_openBlock`/`_createElementBlock`）**，而手写 render 用的是更"朴素"的 `h()`。这正是第六节编译优化的来源。

---

## 九、顶层 createApp 的 render

除了组件级别的渲染函数，应用根级别也有一个 render 概念。最常见的是把根组件传给 `createApp`，该组件的 render 即整个应用的渲染入口：

```js
import { createApp, h } from 'vue'

const app = createApp({
  // 根组件直接用 render 选项
  data() {
    return { msg: 'hello app' }
  },
  render() {
    return h('div', this.msg)
  }
})

app.mount('#app')
```

也可以自定义全局渲染器（用于渲染到非 DOM 目标，如 Canvas、自定义平台），这是更底层的话题，一般业务用不到。

---

## 十、JSX / TSX 作为 render 的语法糖

层层 `h()` 写起来繁琐，**JSX 是渲染函数的语法糖**，编译后就是 `h()` 调用：

```jsx
// 用 JSX 写渲染函数，更接近模板的写法
export default {
  setup() {
    const count = ref(0)
    return () => (
      <div class="counter">
        <p>{count.value}</p>
        <button onClick={() => count.value++}>+1</button>
      </div>
    )
  }
}
```

> 💡 JSX 与 `h()` 等价，都是"渲染函数内部创建 vnode 的方式"。配置用 `@vitejs/plugin-vue-jsx`（Vite）或 `@vue/babel-plugin-jsx`。Vue 3.4+ 用 TSX 时需在 `tsconfig.json` 配 `"jsx": "preserve"` 和 `"jsxImportSource": "vue"`。

---

## 十一、常见问题与陷阱

### 陷阱 1：setup 返回了"值"而不是"函数"

```js
setup() {
  const count = ref(0)
  // ❌ 返回值：只在 setup 执行那次生成 vnode，count 变化不更新
  // return h('div', count.value)

  // ✅ 返回函数：每次更新都重新执行
  return () => h('div', count.value)
}
```

> 原因：`setup()` 每个实例只执行一次，而返回的渲染函数会被多次执行。

### 陷阱 2：组合式渲染函数里用了 this

```js
setup() {
  // ❌ setup 返回的渲染函数没有 this
  // return () => h('div', this.count)

  // ✅ 通过闭包访问 setup 内的局部变量
  const count = ref(0)
  return () => h('div', count.value)
}
```

### 陷阱 3：忘记 ref 要 .value

```js
setup() {
  const count = ref(0)
  // ❌ 渲染函数里 ref 不解包
  // return () => h('div', count)

  // ✅ 要 .value（响应式追踪才会生效）
  return () => h('div', count.value)
}
```

### 陷阱 4：复用同一个 vnode

```js
// ❌ 同一 vnode 用两次
const p = h('p', 'hi')
return () => h('div', [p, p])

// ✅ 工厂函数
return () => h('div', Array.from({ length: 2 }, () => h('p', 'hi')))
```

### 陷阱 5：在 render 中做昂贵计算且不缓存

```js
// ❌ 每次渲染都重新排序，性能差
return () => h('ul', expensiveSort(list.value).map(...))

// ✅ 用 computed 缓存
const sorted = computed(() => expensiveSort(list.value))
return () => h('ul', sorted.value.map(...))
```

### 陷阱 6：以为手写 render 一定比模板快

```js
// ❌ 手写 h() 没有 patchFlag / block tree，等价结构下通常比模板慢
//    不要为了"性能"盲目改用 render 函数
```

> 正确认知：render 函数是为**灵活性**，不是为性能。需要极致性能时，模板 + 编译优化通常更好。

### 陷阱 7：render 返回了非渲染类型

```js
// ❌ 返回 Promise、对象等非合法渲染结果，会报错或渲染异常
return () => ({ a: 1 })

// ✅ 返回 vnode / 字符串 / 数字 / 数组 / null / 布尔
return () => 'hello'
return () => h('div')
return () => null
```

---

## 十二、常见应用场景

### 场景 1：动态组件结构（如根据配置渲染不同布局）

```js
// 根据数据结构动态拼装 UI，模板难以表达
setup() {
  return () => h('div', schema.fields.map(f => h(FieldRenderer, { field: f, key: f.id })))
}
```

### 场景 2：可配置的组件库（表格/表单引擎）

```js
// 表格列由配置驱动，render 灵活地组合表头与自定义单元格
function renderTable(columns, data) {
  return h('table', [
    h('thead', h('tr', columns.map(col => h('th', col.title)))),
    h('tbody', data.map(row =>
      h('tr', { key: row.id },
        columns.map(col => h('td', col.render ? col.render(row) : row[col.field]))
      )
    ))
  ])
}
```

### 场景 3：动态标签名（anchored-heading）

```js
// 根据 level 渲染 h1~h6，模板要写 6 个分支
export default {
  props: { level: Number },
  render() {
    return h('h' + this.level, this.$slots.default())
  }
}
```

### 场景 4：高阶 / 包装组件

```js
import { h, mergeProps } from 'vue'
// 给任意组件统一加主题，并透传属性
export function withTheme(Wrapped) {
  return (props, { attrs, slots }) =>
    h(Wrapped, mergeProps({ class: 'theme' }, attrs), slots)
}
```

### 场景 5：JSX 复杂业务组件

```jsx
export default {
  setup() {
    const user = useUser()
    return () => (
      <div class="profile">
        {user.value ? <h3>{user.value.name}</h3> : <span>加载中</span>}
      </div>
    )
  }
}
```

---

## 十三、面试常见问题

### Q1：Vue 3 的 render 函数是什么？和模板什么关系？

render 函数（渲染函数）是**返回虚拟 DOM 树（vnode 树）的函数**，是组件的渲染入口。Vue 的模板最终会被**编译成 render 函数**——也就是说，模板是 render 函数的语法糖。手写 render 函数能获得 JavaScript 完整的编程能力，但会失去模板的编译期优化。

### Q2：render 函数和 h() 有什么区别和联系？

`h()` 是在 render 函数**内部**创建**单个 vnode** 的工具函数；render 函数是**组件整体**返回**整棵 vnode 树**的函数。联系是：render 函数通常在内部调用 `h()` 来组装 vnode 树。即 `render()` 决定树的结构，`h()` 制造每个节点。

### Q3：Vue 的渲染管线是怎样的？render 函数在哪一步？

三步：① **编译**——模板编译为 render 函数；② **挂载**——渲染器调用 render 函数得到 vnode 树，作为响应式副作用执行并创建真实 DOM（同时追踪依赖）；③ **更新**——依赖变化时副作用重新运行，render 再次执行产生新 vnode 树，与旧树 diff 后更新真实 DOM。**render 函数处于挂载和更新的核心环节**。

### Q4：为什么 render 函数能响应数据变化自动更新？

因为 render 函数在一个**响应式 effect（组件 effect）**中执行。执行过程中读取的响应式数据（ref/reactive）会被自动追踪为依赖；当这些数据变化时，effect 重新运行——render 函数自动重新执行，产生新 vnode，触发 patch 更新。

### Q5：setup 返回的渲染函数和 render 选项有什么区别？

最大区别是 **this**：setup 返回的渲染函数**没有 `this`**（通过闭包访问 setup 内的局部变量，ref 要 `.value`）；而 `render` 选项**有 `this`**（指向组件实例，直接 `this.xxx`，模板里的 ref 会自动解包）。此外前者是组合式、后者是选项式。

### Q6：为什么 setup 返回渲染函数时要返回"函数"而不是"值"？

因为 `setup()` 在每个组件实例只执行**一次**，而渲染函数会被**多次执行**（每次更新都执行）。若返回 `h(...)` 的结果（值），它只在 setup 那次生成 vnode，后续数据变化不会重新渲染；返回函数才能保证每次更新都重新执行。

### Q7：为什么 Vue 默认推荐模板而不是手写 render 函数？

两点：① 模板更贴近 HTML，可读性好、利于可访问性和设计师协作；② 模板能被编译器**静态分析**，应用编译期优化（静态提升、patch flag、block tree），运行时更快。手写 render 函数（用 `h()`）是纯运行时的，**失去这些优化**，通常比等价模板略慢，只在需要灵活性时才用。

### Q8：什么是 patch flag 和 block tree？

- **patch flag（更新类型标记）**：编译器在有动态绑定的元素的 vnode 上编码"它哪部分会变"（如 `2 /* CLASS */`），运行时用位运算精确判断，只更新变化的部分。
- **block tree（树结构打平）**：编译器把模板转成 block，每个 block 只追踪动态后代节点（打平为数组），重渲染时只遍历动态节点，跳过静态部分，大幅减少 diff 遍历量。

### Q9：render 函数能返回哪些类型？

VNode（最常见）、字符串/数字（文本节点）、数组（多根节点/fragment）、null/布尔（不渲染）。不能返回 Promise、普通对象等。

### Q10：如何在 render 函数中做性能优化？

- 用 `computed` 缓存昂贵计算，避免每次渲染重算。
- 用 `shallowRef`/`markRaw` 缓存不变的 vnode / 大对象，减少响应式开销。
- VNode 必须唯一，复用用工厂函数。
- 认清权衡：手写 render 失去编译优化，不要为"性能"盲目改用。

---

## 十四、总结

| 要点 | 核心结论 |
|------|---------|
| **render 函数是什么** | 返回 vnode 树的函数，组件的渲染入口 |
| **与模板关系** | 模板 = 编译后的 render 函数（语法糖） |
| **与 h() 关系** | render 决定树的结构，h() 在其内部制造单个 vnode |
| **渲染管线** | 编译 → 挂载（调 render 得 vnode + 追踪依赖）→ 更新（依赖变则重跑 render + diff） |
| **响应式机制** | render 在响应式 effect 中执行，自动追踪依赖、数据变化自动重新执行 |
| **声明方式** | setup 返回函数（组合式，无 this）/ render 选项（选项式，有 this）/ 函数式组件 |
| **返回值** | vnode / 字符串 / 数字 / 数组 / null / 布尔 |
| **组合式 vs 选项式** | setup 渲染函数无 this、ref 要 .value；render 选项有 this |
| **编译优化（模板独有）** | 静态提升、patch flag、block tree、SSR 激活——手写 render 会失去 |
| **性能优化** | computed 缓存、shallowRef/markRaw、VNode 唯一 |

**记住五句话**：

1. **render 函数是返回 vnode 树的函数，是组件的渲染入口；模板编译后就是它，`h()` 只是它内部造单个 vnode 的工具。**
2. **渲染管线：编译（模板→render）→ 挂载（调 render 得 vnode、追踪依赖）→ 更新（依赖变则重跑 render、diff 出最小 DOM 操作）。**
3. **render 在响应式 effect 中执行，读到的响应式数据被自动追踪，数据变化自动重新渲染——这是"响应式驱动视图"的底层机制。**
4. **setup 返回的渲染函数没有 `this`、ref 要 `.value`；render 选项有 `this`、直接 `this.xxx`。且 setup 一定要返回函数而非值。**
5. **手写 render 函数获得灵活性，但会失去模板的编译期优化（静态提升 / patch flag / block tree），等价结构下通常比模板略慢——所以默认推荐模板，render 函数只在需要灵活动态渲染时用。**
