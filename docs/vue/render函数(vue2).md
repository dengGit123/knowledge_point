# Vue 2 中 render 函数（渲染函数）完全指南

> 本文档**专注讲解 Vue 2 的 render 函数（渲染函数）**：它是什么、组件如何借助它工作、背后的渲染机制（`Object.defineProperty` 响应式 + 组件 Watcher + 双端 Diff）、如何声明与缓存，以及它与模板、`createElement`、Vue 3 的关系。
>
> 它是 [《Vue 3 中 render 函数完全指南》](./render函数(vue3).md) 的姊妹篇，也与 [《Vue 2 中 h 函数完全指南》](./h函数(vue2).md) 呼应：**`createElement`（别名 `h`）是"创建单个 vnode 的工具"，而 `render` 函数是"组件整体返回 vnode 树的函数"**。技术栈为 **Vue 2 + 选项式 API**。

> 📖 **官方文档（Vue 2）**
> - [渲染函数 & JSX](https://v2.cn.vuejs.org/v2/guide/render-function.html)
> - [深入响应式原理](https://v2.cn.vuejs.org/v2/guide/reactivity.html)

> ⚠️ **说明**：Vue 2 已终止支持（EOL）。本文档面向仍在维护的 Vue 2 项目，帮你正确理解渲染函数与渲染机制。新项目建议使用 Vue 3，详见姊妹篇。

## 目录

- [一、概述](#一概述)
- [二、核心概念：render 函数与 Vue 2 渲染机制](#二核心概念render-函数与-vue-2-渲染机制)
- [三、声明 render 函数](#三声明-render-函数)
- [四、render 函数中的 this](#四render-函数中的-this)
- [五、render 的返回值](#五render-的返回值)
- [六、render 与 createElement / h 的关系](#六render-与-createelement--h-的关系)
- [七、Vue 2 的编译优化：staticRenderFns（静态子树）](#七vue-2-的编译优化staticrenderfns静态子树)
- [八、JSX 支持](#八jsx-支持)
- [九、模板 vs. 渲染函数](#九模板-vs-渲染函数)
- [十、Vue 2 与 Vue 3 的 render 差异（对比）](#十vue-2-与-vue-3-的-render-差异对比)
- [十一、常见问题与陷阱](#十一常见问题与陷阱)
- [十二、常见应用场景](#十二常见应用场景)
- [十三、面试常见问题](#十三面试常见问题)
- [十四、总结](#十四总结)

---

## 一、概述

在 Vue 2 中，**render 函数（渲染函数）是一个返回虚拟 DOM 节点（VNode）的函数**。它是每个组件的"渲染入口"——组件挂载时执行它得到 vnode，再由渲染器（patch）把 vnode 变成真实 DOM。

```js
// Vue 2：render 函数接收 createElement 作为参数（社区惯例简写为 h）
new Vue({
  data: { msg: 'hello' },
  render(h) {
    return h('div', this.msg)   // 返回一个 vnode
  }
})
```

> **通俗理解**：你写的 `<template>` 模板，Vue 2 编译器最终会把它变成一个 `render` 函数（外加 `staticRenderFns`，见第七节）。所以**模板 = 编译后的 render 函数**。手写 render 函数时，你就是在写"模板编译后的样子"——获得 JavaScript 完整的编程能力。

### render 函数 vs createElement(h) —— 一句话区分

| | `render` 函数 | `createElement`（别名 `h`） |
|---|---|---|
| 是什么 | 组件的渲染入口，**返回整棵 vnode 树** | 在 render 内部**创建单个 vnode** 的工具 |
| 关系 | 接收并调用 `createElement` | 被 render 函数调用 |
| 粒度 | 整棵树（宏观） | 单个节点（微观） |

```js
// render 函数内部，用 h() 一个个拼出 vnode 树
render(h) {
  return h('div', [            // ← render 决定树的结构
    h('h1', this.title),        // ← h() 创建单个 vnode
    h('p', this.desc)
  ])
}
```

> 💡 **核心价值**：当模板的表达能力不够（高度动态、复杂逻辑拼装、组件库、JSX 偏好）时，用 render 函数获得完整的 JavaScript 编程能力来描述 UI。

---

## 二、核心概念：render 函数与 Vue 2 渲染机制

### 1. 虚拟 DOM、mount、patch

Vue 2 通过**虚拟 DOM（VNode）**追踪如何更新真实 DOM：

- **挂载（mount）**：遍历 vnode 树，创建真实 DOM。
- **更新（patch，又称 diff / 协调）**：拿新旧 vnode 比对，把差异应用到真实 DOM。Vue 2 的列表比对用**双端 Diff**（`updateChildren`，详见 [h函数(vue2)](./h函数(vue2).md) 第五节）。

### 2. Vue 2 的渲染管线（render 函数的位置）

```
① 编译（Compile）
   模板 <template> ──▶ render 函数 + staticRenderFns（静态子树）
   （可在构建时预编译，也可用运行时编译器即时完成）

② 挂载（Mount）
   创建组件实例 ──▶ 创建「组件 Watcher」──▶ Watcher 执行 render ──▶ vnode ──▶ patch 成 DOM
   ▲
   └── render 执行过程中「接触」过的 data，会被记录为依赖

③ 更新（Patch）
   data 变化 ──▶ setter 触发 ──▶ 通知 Watcher ──▶（异步队列，nextTick）重新执行 render
            ──▶ 新 vnode ──▶ 与旧 vnode diff ──▶ 应用更新到真实 DOM
```

### 3. 响应式原理：Object.defineProperty + 组件 Watcher ⭐

这是 Vue 2 渲染机制的核心，也是它与 Vue 3 的本质区别：

**① 数据劫持**：把 `data` 的每个 property 用 `Object.defineProperty` 转为 **getter/setter**。

**② 组件 Watcher**：官方原文——*"每个组件实例都对应一个 **watcher** 实例，它会在组件渲染的过程中把'接触'过的数据 property 记录为依赖。之后当依赖项的 setter 触发时，会通知 watcher，从而使它关联的组件重新渲染。"*

```
render 执行时访问 this.count
        │ 触发 count 的 getter
        ▼
getter 把当前 Watcher 收集进 count 的 Dep（依赖）
        │
this.count = 99（数据变化）
        │ 触发 count 的 setter
        ▼
setter 调用 dep.notify() ──▶ 通知 Watcher ──▶ 重新 render ──▶ patch 更新 DOM
```

> 💡 **一句话**：Vue 2 的 render 函数之所以能响应数据变化，是因为它在"组件 Watcher"的上下文里执行，访问 `data` 时自动建立依赖；`data` 变了，setter 通知 Watcher，render 重新跑一遍。

### 4. 异步更新队列（nextTick）

Vue 2 的 DOM 更新是**异步**的：

- 侦听到数据变化后，Vue 开启一个队列，缓冲同一事件循环中的所有数据变更；同一个 Watcher 多次触发只会入队**一次**（去重）。
- 在下一个事件循环的"tick"中，Vue 刷新队列执行实际更新。
- 因此 `this.msg = 'x'` 后立刻读 DOM 拿到的还是旧值，要用 `this.$nextTick(() => {...})` 等待 DOM 更新完成。

```js
methods: {
  update() {
    this.msg = '已更新'
    console.log(this.$el.textContent) // '未更新'（DOM 还没更新）
    this.$nextTick(() => {
      console.log(this.$el.textContent) // '已更新'（DOM 已更新）
    })
  }
}
```

---

## 三、声明 render 函数

### 方式 1：`render(createElement)` 选项（最常见）

```js
export default {
  data() {
    return { msg: 'hello' }
  },
  // createElement 作为参数，社区惯例简写为 h
  render(h) {
    return h('div', this.msg)
  }
}
```

### 方式 2：使用 `this.$createElement`

```js
export default {
  render() {
    // 等价写法：直接用实例方法 this.$createElement
    return this.$createElement('div', this.msg)
  }
}
```

> 💡 **`createElement` 从哪来？**
> - 在 `render(createElement)` 中，它是 Vue 自动注入的参数（别名 `h`）。
> - 在非 render 方法（如 methods）里需要创建 vnode 时，用实例方法 **`this.$createElement`**。

### 方式 3：函数式组件（`functional: true`）

```js
Vue.component('my-heading', {
  functional: true,
  props: ['level'],
  // 没有 this，改用第二个参数 context
  render(createElement, context) {
    return createElement('h' + context.props.level, context.children)
  }
})
```

> 详见 [h函数(vue2) 第八节](./h函数(vue2).md) 的函数式组件。函数式组件无实例、开销低，但 render 函数没有 `this`。

---

## 四、render 函数中的 this

> 这是 Vue 2 与 Vue 3 render 函数的一个**重要区别**：**Vue 2 的 render 函数有 `this`，指向当前组件实例**（Vue 3 用 setup 返回的渲染函数则没有 `this`）。

```js
export default {
  data() {
    return { count: 0 }
  },
  props: ['title'],
  computed: {
    double() { return this.count * 2 }
  },
  methods: {
    inc() { this.count++ }
  },
  render(h) {
    return h('div', [
      h('h1', this.title),              // ✅ 访问 props
      h('p', `计数：${this.count}`),    // ✅ 访问 data（建立依赖）
      h('p', `两倍：${this.double}`),   // ✅ 访问 computed
      h('button', { on: { click: this.inc } }, '+1')  // ✅ 访问 methods
    ])
  }
}
```

| 在 render 中通过 this 访问 | 示例 |
|------|------|
| data | `this.count` |
| props | `this.title` |
| computed | `this.double` |
| methods | `this.inc` |
| 插槽 | `this.$slots.default` / `this.$scopedSlots` |
| 发射事件 | `this.$emit(...)` |
| 创建 vnode | `this.$createElement(...)` |
| 根 DOM | `this.$el` |

---

## 五、render 的返回值

Vue 2 的 render 函数**返回一个 VNode**（与 Vue 3 可返回字符串/数组不同）。

```js
render(h) {
  return h('div', 'hello')   // ✅ 返回单个 vnode
}

// ❌ Vue 2 的 render 不能直接返回字符串或数组（与 Vue 3 不同）
// render(h) { return 'hello' }   // 不行
// render(h) { return [h('div'), h('div')] }  // 多根节点需用 fragment 包裹
```

> ⚠️ **注意**：Vue 2 组件模板通常只允许**单个根节点**。若要返回多个节点，需用一个外层元素（或渲染函数中的片段）包裹。这与 Vue 3 支持多根节点 / 返回数组不同。

---

## 六、render 与 createElement / h 的关系

一句话：**render 是组件的渲染入口（返回树），createElement（h）是 render 内部拼节点的工具（造单个 vnode）。**

```js
// 模板：
// <div class="card">
//   <h1>{{ title }}</h1>
//   <p v-if="show">内容</p>
// </div>

export default {
  props: ['title', 'show'],
  render(h) {
    // 渲染函数：决定整棵树的结构
    return h('div', { class: 'card' }, [
      h('h1', this.title),                    // h() 造单个节点
      this.show ? h('p', '内容') : null       // v-if 用三元
    ])
  }
}
```

> 💡 `h` 内部的 **data 对象是嵌套结构**（`attrs`/`props`/`domProps`/`on`/`nativeOn` 等），详见 [《Vue 2 中 h 函数完全指南》](./h函数(vue2).md) 第四节。

### 看一眼模板编译后的 render

模板 `<div>{{ msg }}</div>` 编译后大致是：

```js
// 编译产物（简化）
function render() {
  with (this) {
    return _c('div', [_v(_s(msg))])
  }
}
// _c 即 createElement，_v 创建文本节点，_s 是 toString
```

> 💡 Vue 2 编译产物用 `with(this)` 让模板里的变量直接对应实例 property——这正是 render 函数里 `this` 能访问 data/props 的原因。

---

## 七、Vue 2 的编译优化：staticRenderFns（静态子树）

> Vue 2 没有 Vue 3 那套 patchFlag / block tree 优化，但它有一项重要的编译优化：**静态子树提取（staticRenderFns）**。

### 工作原理

Vue 2 编译器会识别模板中的**静态根节点**（内容完全不变、无动态绑定的子树），把它们提取成独立的 `staticRenderFns` 数组：

```html
<div>
  <div class="static-box">  <!-- 静态根节点：被提取 -->
    <p>这部分永远不变</p>
  </div>
  <span>{{ dynamic }}</span>
</div>
```

编译产物大致是：

```js
// 主 render 函数
function render() {
  return _c('div', [
    _m(0),                       // _m 是 staticRenderFns 的缓存取用
    _c('span', [_v(_s(dynamic))])
  ])
}
// 静态子树单独放这里，只渲染一次并缓存，后续 patch 直接跳过
var staticRenderFns = [
  function () {
    return _c('div', { staticClass: 'static-box' }, [_c('p', [_v('这部分永远不变')])])
  }
]
```

### 收益

- 静态子树**只渲染一次**，结果被缓存（`vnode.isStatic` / 缓存到 `staticTrees`）。
- 后续重新渲染时，patch 会**跳过**静态子树的比对，减少 diff 开销。

### 与 Vue 3 优化的对比

| 优化 | Vue 2 | Vue 3 |
|------|:-----:|:-----:|
| 静态子树提取（staticRenderFns） | ✅ | —（用静态提升 + patchFlag 替代） |
| 静态提升（hoist static） | ❌ | ✅ |
| patch flag（更新类型标记） | ❌ | ✅ |
| 树结构打平（block tree） | ❌ | ✅ |

> 💡 **结论**：Vue 2 的编译优化相对"粗粒度"（整棵静态子树跳过）；Vue 3 更"细粒度"（精确到单个动态节点的更新类型）。所以**等价结构下，Vue 3 的运行时更新通常比 Vue 2 更快**。

---

## 八、JSX 支持

层层 `createElement` 写起来痛苦，**JSX 是渲染函数的语法糖**，编译后就是 `createElement` 调用：

```jsx
export default {
  data() {
    return { msg: 'hello' }
  },
  render() {
    return (
      <div class="box">
        <span>{this.msg}</span>
      </div>
    )
  }
}
```

> 💡 Vue 2 的 JSX 用 `@vue/babel-preset-jsx`（或 `babel-plugin-transform-vue-jsx`）。从 Vue 的 Babel 插件 3.4.0 起，会在含 JSX 的方法/getter 中**自动注入** `const h = this.$createElement`，可省略 `render(h)` 的 `(h)` 参数。详见 [h函数(vue2) 第七节](./h函数(vue2).md)。

---

## 九、模板 vs. 渲染函数

官方建议：**绝大多数场景优先用模板**（更简洁、可读性好，还能享受编译优化如 staticRenderFns）。渲染函数一般只在以下情况使用：

- 需要依据复杂逻辑动态拼装结构（大量 `v-if`/`v-for` 嵌套难以维护）
- 编写可配置的组件库（表格、表单引擎，列/字段由配置驱动）
- 高阶组件 / 包装组件（程序化地选择渲染哪个组件）
- 偏好 JSX 的写法

| 维度 | 模板 | 渲染函数 |
|------|------|---------|
| 可读性 | ✅ 贴近 HTML，好读 | ❌ 嵌套调用，较繁琐 |
| 灵活性 | 受限（受指令语法约束） | ✅ 完整 JS 编程能力 |
| 编译优化 | ✅ 享受 staticRenderFns 等 | ❌ 手写无优化 |
| 适用 | 通用业务组件 | 高度动态 / 组件库 / JSX |

---

## 十、Vue 2 与 Vue 3 的 render 差异（对比）

> 姊妹篇：[《Vue 3 中 render 函数完全指南》](./render函数(vue3).md)

| 维度 | **Vue 2** | Vue 3 |
|------|----------|------|
| 声明方式 | `render(createElement)` 选项 | setup 返回函数（组合式）/ render 选项 / 函数式组件 |
| 渲染函数内的 `this` | ✅ **有 this**，指向组件实例 | setup 返回的渲染函数**无 this** |
| 创建 vnode 的工具 | `createElement`（别名 `h`），来自参数或 `this.$createElement` | `h` 从 `'vue'` 导入 |
| data/props 结构 | **嵌套**（attrs/props/domProps/on/nativeOn） | **扁平**（事件用 `onXxx`） |
| 响应式基础 | `Object.defineProperty` + 组件 **Watcher** | `Proxy` + **effect** |
| 返回值 | 仅 VNode | VNode / 字符串 / 数字 / 数组（多根）/ null / 布尔 |
| 多根节点 | ❌ 需包裹（单根） | ✅ 支持（fragment / 数组） |
| 编译优化 | staticRenderFns（静态子树） | 静态提升 + patchFlag + block tree |
| 异步更新 | nextTick（微任务队列） | nextTick（微任务队列，原理类似） |
| 生命周期 | `mounted` / `destroyed` 等 | `onMounted` / `onUnmounted` |

对比示例：

```js
// Vue 2：render(h)，有 this，data 嵌套
export default {
  data() { return { count: 0 } },
  render(h) {
    return h('div', { class: 'box', on: { click: () => this.count++ } }, this.count)
  }
}

// Vue 3：setup 返回函数，无 this，data 扁平
import { ref, h } from 'vue'
export default {
  setup() {
    const count = ref(0)
    return () => h('div', { class: 'box', onClick: () => count.value++ }, count.value)
  }
}
```

> 💡 **记忆口诀**：Vue 2 的 render"自带 this、参数是 h、data 分抽屉"；Vue 3 的 render（setup 版）"没有 this、h 要 import、data 扁平化"。

---

## 十一、常见问题与陷阱

### 陷阱 1：VNode 必须唯一

```js
render(h) {
  const p = h('p', 'hi')
  // ❌ 同一个 vnode 引用被复用两次，渲染异常
  return h('div', [p, p])
}

// ✅ 工厂函数：每次创建新 vnode
render(h) {
  return h('div', Array.apply(null, { length: 20 }).map(() => h('p', 'hi')))
}
```

### 陷阱 2：渲染函数里用了箭头函数导致 this 丢失

```js
export default {
  data() { return { msg: 'hi' } },
  // ❌ 箭头函数没有自己的 this，拿不到组件实例
  render: (h) => h('div', this.msg),

  // ✅ 用普通方法，this 指向实例
  render(h) {
    return h('div', this.msg)
  }
}
```

### 陷阱 3：新增对象属性 / 修改数组索引不响应

```js
data() { return { obj: { a: 1 }, list: [1, 2, 3] } },
methods: {
  bad() {
    this.obj.b = 2        // ❌ 新增属性，非响应式
    this.list[0] = 99     // ❌ 索引赋值，非响应式
    this.list.length = 1  // ❌ 改长度，非响应式
  },
  good() {
    this.$set(this.obj, 'b', 2)         // ✅ Vue.set / $set
    this.$set(this.list, 0, 99)         // ✅ 或 this.list.splice(0, 1, 99)
    this.list.splice(1)                 // ✅ 用 splice 改长度
  }
}
```

> 💡 这是 `Object.defineProperty` 的固有限制（无法监听属性新增/数组索引），是 Vue 2 → Vue 3 改用 `Proxy` 的主要原因之一。

### 陷阱 4：以为修改数据后 DOM 立刻更新

```js
this.msg = 'new'
console.log(this.$el.textContent)  // ❌ 还是旧值（DOM 更新是异步的）

this.$nextTick(() => {
  console.log(this.$el.textContent) // ✅ 新值
})
```

### 陷阱 5：render 忘了 return

```js
render(h) {
  // ❌ 忘记 return，组件渲染为空
  h('div', this.msg)
}

// ✅ 必须返回 vnode
render(h) {
  return h('div', this.msg)
}
```

### 陷阱 6：在 render 中做昂贵计算且不缓存

```js
// ❌ 每次重新渲染都重新排序
render(h) {
  return h('ul', expensiveSort(this.list).map(i => h('li', i)))
}

// ✅ 用 computed 缓存
computed: {
  sorted() { return expensiveSort(this.list) }
},
render(h) {
  return h('ul', this.sorted.map(i => h('li', i)))
}
```

### 陷阱 7：返回多个根节点

```js
// ❌ Vue 2 不支持直接返回多根节点数组
render(h) {
  return [h('div'), h('div')]
}

// ✅ 用一个外层元素包裹
render(h) {
  return h('div', [h('div'), h('div')])
}
```

---

## 十二、常见应用场景

### 场景 1：动态标签名（anchored-heading）

```js
// 根据 level 渲染 h1~h6，模板要写 6 个分支
Vue.component('anchored-heading', {
  props: { level: { type: Number, required: true } },
  render(h) {
    return h('h' + this.level, this.$slots.default)   // 动态标签 + 默认插槽
  }
})
```

### 场景 2：智能列表（smart-list，函数式包装组件）

```js
var EmptyList = { /* ... */ }
var TableList = { /* ... */ }
var OrderedList = { /* ... */ }
var UnorderedList = { /* ... */ }

Vue.component('smart-list', {
  functional: true,
  props: { items: { type: Array, required: true }, isOrdered: Boolean },
  render(h, ctx) {
    function pick() {
      const items = ctx.props.items
      if (items.length === 0) return EmptyList
      if (typeof items[0] === 'object') return TableList
      if (ctx.props.isOrdered) return OrderedList
      return UnorderedList
    }
    return h(pick(), ctx.data, ctx.children)   // 透传 data 与 children
  }
})
```

### 场景 3：可配置的表格（render 拼装）

```js
render(h) {
  return h('table', [
    h('thead', h('tr', this.columns.map(col => h('th', col.title)))),
    h('tbody', this.data.map(row =>
      h('tr', { key: row.id },
        this.columns.map(col => h('td', col.render ? col.render(row) : row[col.field]))
      )
    ))
  ])
}
```

### 场景 4：JSX 复杂业务组件

```jsx
export default {
  data() { return { user: { name: 'Tom' } } },
  render() {
    return (
      <div class="profile">
        <h3>{this.user.name}</h3>
      </div>
    )
  }
}
```

---

## 十三、面试常见问题

### Q1：Vue 2 的 render 函数是什么？和模板什么关系？

render 函数（渲染函数）是**返回 VNode 的函数**，是组件的渲染入口。Vue 2 的模板最终会被**编译成 render 函数**（外加 staticRenderFns）。所以模板是 render 函数的语法糖。手写 render 函数能获得 JavaScript 完整的编程能力。

### Q2：render 函数和 createElement（h）有什么区别和联系？

`createElement`（别名 `h`）是在 render 函数**内部**创建**单个 VNode** 的工具；render 函数是**组件整体**返回 **vnode 树**的函数。联系是 render 函数在内部调用 `createElement` 来组装 vnode 树。render 决定树的结构，createElement 制造每个节点。

### Q3：Vue 2 的 render 函数为什么能响应数据变化自动更新？

因为 Vue 2 用 `Object.defineProperty` 把 `data` 转为 getter/setter，且**每个组件实例对应一个 Watcher**。render 函数在 Watcher 的上下文里执行，访问 `data` 时通过 getter 建立依赖；当 `data` 变化，setter 通知 Watcher，render 重新执行，产生新 vnode，patch 更新 DOM。

### Q4：Vue 2 和 Vue 3 的 render 函数有什么区别？

- **this**：Vue 2 的 render 函数**有 this**（指向实例）；Vue 3 用 setup 返回的渲染函数**无 this**。
- **声明**：Vue 2 是 `render(createElement)` 选项；Vue 3 是 setup 返回函数（组合式）或 render 选项。
- **data 结构**：Vue 2 的 createElement 用**嵌套** data（attrs/props/domProps/on/nativeOn）；Vue 3 的 h 用**扁平** props（事件 `onXxx`）。
- **响应式**：Vue 2 是 `Object.defineProperty` + Watcher；Vue 3 是 `Proxy` + effect。
- **编译优化**：Vue 2 是 staticRenderFns；Vue 3 是静态提升 + patchFlag + block tree。

### Q5：什么是组件 Watcher？

Vue 2 中每个组件实例都有一个 Watcher 实例。组件渲染（执行 render）时，Watcher 会把 render 过程中"接触"过的 data property 记录为依赖；当这些依赖的 setter 被触发时，会通知该 Watcher，使组件重新渲染。这是 Vue 2 响应式驱动视图的核心机制。

### Q6：为什么修改数据后不能立刻读到更新后的 DOM？

因为 Vue 2 的 DOM 更新是**异步**的：数据变化后，Vue 把变更缓冲到一个队列（同一 Watcher 多次触发只入队一次），在下一个事件循环的 tick 才刷新队列执行真实更新。所以要用 `this.$nextTick(() => {...})` 等待 DOM 更新完成。

### Q7：Vue 2 的 staticRenderFns 是什么？

Vue 2 编译器会识别模板中的**静态根节点**（无动态绑定的子树），把它们提取成独立的 `staticRenderFns`。这些静态子树只渲染一次并缓存，后续 patch 时直接跳过比对，减少 diff 开销。这是 Vue 2 的主要编译优化（但不如 Vue 3 的 patchFlag/block tree 细粒度）。

### Q8：Vue 2 的 render 函数能返回字符串或数组吗？

不能直接返回字符串。render 必须返回**单个 VNode**。返回多个节点需要用外层元素包裹（Vue 2 组件要求单根节点）。这与 Vue 3 不同——Vue 3 的渲染函数可直接返回字符串、数字、数组（多根 fragment）、null、布尔。

### Q9：Vue 2 渲染函数里为什么不能用箭头函数？

因为箭头函数没有自己的 `this`，会绑定到外层（通常是 undefined 或模块作用域），拿不到组件实例。Vue 2 的渲染函数依赖 `this` 访问 data/props/methods，所以必须用普通方法（`render(h) {...}`）。

### Q10：render 函数中 this.$createElement 和参数 createElement 有什么区别？

没有本质区别，都是创建 VNode 的函数。`createElement` 是 render 函数的**参数**（自动注入，别名 h）；`this.$createElement` 是**实例方法**。在 render 内部用参数即可；在 methods 等其它地方需要创建 vnode 时，用 `this.$createElement`。

---

## 十四、总结

| 要点 | 核心结论 |
|------|---------|
| **render 函数是什么** | 返回 VNode 的函数，组件的渲染入口 |
| **与模板关系** | 模板 = 编译后的 render 函数（+ staticRenderFns） |
| **与 createElement 关系** | render 决定树的结构，createElement(h) 在其内部制造单个 vnode |
| **声明方式** | render(createElement) 选项 / this.$createElement / 函数式组件 |
| **this** | ✅ 有 this，指向组件实例（区别于 Vue 3 setup 渲染函数） |
| **返回值** | 单个 VNode（不能直接返回字符串/数组/多根） |
| **渲染管线** | 编译 → 挂载（创建 Watcher、执行 render、收集依赖、patch）→ 更新（setter 通知 Watcher、异步重跑 render、diff） |
| **响应式基础** | Object.defineProperty + 组件 Watcher（getter 收集依赖、setter 通知） |
| **异步更新** | nextTick（数据变后下一个 tick 才更新 DOM） |
| **编译优化** | staticRenderFns（静态子树提取，跳过比对） |
| **Vue 3 vs 2** | this 有无、data 嵌套 vs 扁平、Watcher vs effect、staticRenderFns vs patchFlag/block tree |

**记住五句话**：

1. **Vue 2 的 render 函数是返回 VNode 的函数，是组件的渲染入口；模板编译后就是它，`createElement`(h) 只是它内部造单个 vnode 的工具。**
2. **Vue 2 的 render 函数有 `this`（指向实例），可直接访问 data/props/methods——这是它与 Vue 3 setup 渲染函数（无 this）的关键区别。**
3. **render 能响应数据变化，是因为它在"组件 Watcher"里执行：Object.defineProperty 的 getter 收集依赖，setter 通知 Watcher 重新渲染。**
4. **Vue 2 的 DOM 更新是异步的（nextTick）；且新增对象属性、数组索引/长度赋值不响应，需 `Vue.set`/`$set`/`splice`——这是 Object.defineProperty 的固有限制。**
5. **Vue 2 的编译优化是 staticRenderFns（静态子树提取），不如 Vue 3 的 patchFlag/block tree 细粒度；render 必须返回单个 VNode、VNode 必须唯一。**
