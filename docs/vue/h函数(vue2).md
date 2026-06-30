# Vue 2 中 h 函数（createElement）完全指南

> 本文档**专注讲解 Vue 2** 的渲染函数，即 `createElement`（社区惯例将其别名简写为 `h`）。系统讲解它的作用、三参数签名、**data 数据对象的嵌套结构**、模板语法的等价实现、函数式组件与 JSX，并对比 Vue 3 的差异。
>
> 它是 [《Vue 3 中 h() 函数完全指南》](./h函数(vue3).md) 的姊妹篇。本文技术栈为 **Vue 2 + 选项式 API**。

> 📖 **官方文档**
> - [渲染函数 & JSX（Vue 2 指南）](https://v2.cn.vuejs.org/v2/guide/render-function.html)
> - [Vue 2 API · 实例 property（$slots / $scopedSlots / $createElement）](https://v2.cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B-property)

> ⚠️ **说明**：Vue 2 已于 2023 年底进入终止支持（EOL）。本文档面向仍在维护的 Vue 2 项目（尤其是 2.6/2.7），帮你正确使用渲染函数。新项目建议使用 Vue 3，详见姊妹篇。

## 目录

- [一、概述](#一概述)
- [二、核心原理：createElement 与虚拟 DOM](#二核心原理createelement-与虚拟-dom)
- [三、createElement 函数签名详解](#三createelement-函数签名详解)
- [四、深入 data 数据对象（嵌套结构，核心）](#四深入-data-数据对象嵌套结构核心)
- [五、声明渲染函数](#五声明渲染函数)
- [六、用 JavaScript 代替模板功能](#六用-javascript-代替模板功能)
- [七、JSX 支持](#七jsx-支持)
- [八、函数式组件（functional）](#八函数式组件functional)
- [九、Vue 2 与 Vue 3 的 h() 差异（对比）](#九vue-2-与-vue-3-的-h-差异对比)
- [十、常见问题与陷阱](#十常见问题与陷阱)
- [十一、常见应用场景](#十一常见应用场景)
- [十二、面试常见问题](#十二面试常见问题)
- [十三、总结](#十三总结)

---

## 一、概述

在 Vue 2 中，渲染函数通过 **`createElement`** 来创建虚拟 DOM 节点（VNode）。社区约定俗成地把 `createElement` 作为 `render` 函数的参数并简写为 **`h`**（hyperscript 的意思）：

```js
// Vue 2：render 函数接收 createElement 作为参数，习惯命名为 h
render(h) {
  return h('div', { class: 'box' }, 'hello')
}
```

> **通俗理解**：模板里写 `<div class="box">hello</div>`，Vue 2 编译器最终会把它编译成 `createElement('div', { class: 'box' }, 'hello')`。`createElement` 就是模板的"底层等价物"——你能手写它，就掌握了模板能做的一切，外加 JavaScript 全部的编程能力。

`createElement` 的核心价值：**当模板的表达能力不够时，用 JavaScript 完整、灵活地描述 UI**。

> 💡 **什么时候用渲染函数？**
> 官方建议：**绝大多数场景优先用模板**（更简洁、可读性好）。只有以下情况才考虑渲染函数：
> - 需要依据复杂逻辑动态拼装结构（如根据 `level` 动态生成 `h1`~`h6`）
> - 编写可配置的组件库（表格列、表单字段由配置驱动）
> - 高阶组件 / 包装组件（程序化地选择渲染哪个组件）
> - 偏好 JSX 的写法

---

## 二、核心原理：createElement 与虚拟 DOM

### 1. createElement 返回 VNode

`createElement` 不直接操作真实 DOM，它返回一个普通的 JS 对象——**虚拟节点（VNode）**，描述"这里应该有一个什么样的节点"。Vue 通过一整棵 VNode 树（虚拟 DOM）来追踪如何更新真实 DOM。

```js
render(h) {
  const vnode = h('h1', this.blogTitle)
  // vnode 是一个"节点描述对象"，不是真实 DOM
  return vnode
}
```

### 2. 渲染函数 vs 模板

无论你用模板还是渲染函数，Vue 都会自动保持页面与数据同步：

```
模板 <template> ──(编译器)──▶ render 函数 ──(执行)──▶ VNode 树 ──(patch)──▶ 真实 DOM
                                                  ▲
                                  手写 createElement 直接写在这里 ─┘
```

> 💡 **重要**：Vue 2 的模板最终会被**编译成渲染函数**。也就是说，渲染函数比模板"更接近编译器"——它是模板的底层实现。理解了渲染函数，你也就理解了模板的本质。

---

## 三、createElement 函数签名详解

```js
// @returns {VNode}
createElement(
  // ① {String | Object | Function}，必填
  //    一个 HTML 标签名、组件选项对象，
  //    或 resolve 了上述任一种的 async 函数（异步组件）
  'div',

  // ② {Object}，可选
  //    与模板中 attribute 对应的「数据对象」（见第四节）
  { /* ... */ },

  // ③ {String | Array}，可选
  //    子级虚拟节点（VNodes），由 createElement() 构建；
  //    也可以用字符串生成"文本虚拟节点"
  [
    '先写一些文字',
    createElement('h1', '一则头条'),
    createElement(MyComponent, { props: { someProp: 'foobar' } })
  ]
)
```

| 参数 | 是否必填 | 含义 |
|------|:--------:|------|
| `tag`（第 1 个） | ✅ 必填 | HTML 标签字符串、组件选项对象、或异步组件函数 |
| `data`（第 2 个） | 可选 | 数据对象（嵌套结构，见第四节） |
| `children`（第 3 个） | 可选 | 子节点：字符串（文本节点）或 VNode 数组 |

> 💡 **省略规则**：当不需要 `data` 时，可以直接把 `children` 作为第二参数：`createElement('div', 'hello')`。

---

## 四、深入 data 数据对象（嵌套结构，核心）

> 这是 Vue 2 渲染函数**最重要、也最和 Vue 3 不同**的部分：**data 是一个嵌套的对象**，class/style/属性/事件/指令各有自己的命名空间字段，而不是像 Vue 3 那样扁平地写在一起。

下面是 data 对象的**完整字段**（官方定义）：

```js
{
  // ① class：与 v-bind:class 相同，接受字符串、对象、数组
  class: { foo: true, bar: false },

  // ② style：与 v-bind:style 相同，接受字符串、对象、对象数组
  style: { color: 'red', fontSize: '14px' },

  // ③ attrs：普通 HTML attribute（如 id、href、data-*）
  attrs: { id: 'foo' },

  // ④ props：组件 prop（注意是给「组件」传的 prop，不是 DOM 属性）
  props: { myProp: 'bar' },

  // ⑤ domProps：DOM property（如 innerHTML，会覆盖 v-html）
  domProps: { innerHTML: 'baz' },

  // ⑥ on：事件监听器（{ 事件名: 处理函数 }）
  //    注意：不再支持 v-on:keyup.enter 这种修饰符，需手动检查 keyCode
  on: { click: this.clickHandler },

  // ⑦ nativeOn：仅用于组件，监听「根元素的原生事件」
  //    （等价于模板中的 @click.native）
  nativeOn: { click: this.nativeClickHandler },

  // ⑧ directives：自定义指令数组
  directives: [
    {
      name: 'my-custom-directive',
      value: '2',
      expression: '1 + 1',
      arg: 'foo',
      modifiers: { bar: true }
    }
  ],

  // ⑨ scopedSlots：作用域插槽，格式 { name: props => VNode | VNode[] }
  scopedSlots: {
    default: props => createElement('span', props.text)
  },

  // ⑩ slot：如果本组件是其它组件的子组件，指定插槽名
  slot: 'name-of-slot',

  // ⑪ 其它特殊顶层 property
  key: 'myKey',
  ref: 'myRef',
  refInFor: true  // 若在 v-for 中对多个元素用同一 ref，$refs.myRef 会变成数组
}
```

### 字段速查表

| 字段 | 对应模板语法 | 说明 |
|------|------------|------|
| `class` | `:class` | 类名，支持字符串/对象/数组 |
| `style` | `:style` | 样式，支持字符串/对象/数组 |
| `attrs` | 普通属性 `id="foo"` | 普通 HTML attribute |
| `props` | 组件 `:my-prop="x"` | **组件**的 prop |
| `domProps` | DOM 属性 / `v-html` | DOM property（如 `innerHTML`、`value`） |
| `on` | `@click` | 事件监听器 |
| `nativeOn` | `@click.native` | 组件根元素的**原生**事件 |
| `directives` | `v-xxx` | 自定义指令数组 |
| `scopedSlots` | 作用域插槽 | `{ name: props => VNode }` |
| `slot` | `slot="name"` | 指定插槽名 |
| `key` | `:key` | 节点唯一标识 |
| `ref` | `ref="x"` | 模板引用 |
| `refInFor` | （v-for 内 ref） | 多个同名 ref 是否合并为数组 |

> ⚠️ **最易混淆**：`attrs`、`props`、`domProps` 三者。
> - `attrs`：写到 HTML 标签上的**普通属性**（如 `id`、`href`）。
> - `props`：传给**组件**的 prop（与该组件的 `props` 选项对应）。
> - `domProps`：元素的 **DOM property**（如 `innerHTML`、`input` 的 `value`）。
>
> 例如原生 `<input>` 的值用 `domProps.value`，而组件 `<my-comp>` 的 prop 用 `props.myProp`。

---

## 五、声明渲染函数

### 方式 1：`render` 选项（接收 createElement 参数）

```js
export default {
  data() {
    return { msg: 'hello' }
  },
  // h 是 createElement 的别名，这是社区通用惯例
  render(h) {
    // 通过 this 访问组件实例
    return h('div', this.msg)
  }
}
```

### 方式 2：使用 `this.$createElement`

```js
export default {
  render() {
    // 等价写法：直接用 this.$createElement
    return this.$createElement('div', this.msg)
  }
}
```

> 💡 **`h` 从哪来？**
> - 在 `render(createElement)` 中，`createElement` 是 Vue 自动注入的参数，习惯命名为 `h`。
> - 在其它方法（非 render）里需要创建 VNode 时，用实例方法 **`this.$createElement`**。
> - JSX 会自动注入 `const h = this.$createElement`（见第七节）。

---

## 六、用 JavaScript 代替模板功能

### 1. v-if / v-for —— 用 `if/else` 和 `map`

```js
// 模板：
// <ul v-if="items.length">
//   <li v-for="item in items">{{ item.name }}</li>
// </ul>
// <p v-else>No items found.</p>

props: ['items'],
render(h) {
  if (this.items.length) {
    return h('ul', this.items.map(item =>
      h('li', { key: item.id }, item.name)   // ✅ v-for 记得加 key
    ))
  } else {
    return h('p', 'No items found.')
  }
}
```

### 2. v-model —— 必须手动实现

渲染函数中没有 `v-model` 的直接对应，你需要自己用 `domProps` + `on` 组合：

```js
// <input v-model="value" /> 的等价实现
props: ['value'],
render(h) {
  return h('input', {
    domProps: {
      value: this.value               // 当前值
    },
    on: {
      input: (event) => {
        this.$emit('input', event.target.value)  // 向父组件抛出更新
      }
    }
  })
}
```

> 💡 虽然繁琐，但手动实现 `v-model` 能让你对交互细节有完全的控制。

### 3. 事件 & 按键修饰符 ⭐

#### `.passive` / `.capture` / `.once` —— 用前缀

| 修饰符 | `on` 中的前缀 |
|------|:---:|
| `.passive` | `&` |
| `.capture` | `!` |
| `.once` | `~` |
| `.capture.once` 或 `.once.capture` | `~!` |

```js
on: {
  '!click': this.doThisInCapturingMode,      // @click.capture
  '~keyup': this.doThisOnce,                 // @keyup.once
  '~!mouseover': this.doThisOnceInCapturingMode  // @mouseover.once.capture
}
```

#### 其它修饰符 —— 在处理函数里手动实现

| 修饰符 | 处理函数中的等价操作 |
|------|------------|
| `.stop` | `event.stopPropagation()` |
| `.prevent` | `event.preventDefault()` |
| `.self` | `if (event.target !== event.currentTarget) return` |
| 按键 `.enter` / `.13` | `if (event.keyCode !== 13) return` |
| 修饰键 `.ctrl` / `.alt` / `.shift` / `.meta` | `if (!event.ctrlKey) return`（改用 `altKey`/`shiftKey`/`metaKey`） |

一个综合示例（`@keyup.shift.enter`）：

```js
on: {
  keyup(event) {
    // 不是绑定元素本身触发则跳过（.self）
    if (event.target !== event.currentTarget) return
    // 不是 shift + enter 则跳过
    if (!event.shiftKey || event.keyCode !== 13) return
    // 阻止冒泡与默认行为（.stop .prevent）
    event.stopPropagation()
    event.preventDefault()
    // ...业务逻辑
  }
}
```

### 4. 插槽

#### 读取插槽（在子组件内部）

- `this.$slots`：**静态插槽**，每个插槽是 VNode 数组。
- `this.$scopedSlots`：**作用域插槽**，每个插槽是返回 VNode 的函数。

```js
// 静态插槽：<div><slot /></div>
render(h) {
  return h('div', this.$slots.default)
}

// 作用域插槽：<div><slot :text="message" /></div>
props: ['message'],
render(h) {
  return h('div', [
    this.$scopedSlots.default({ text: this.message })
  ])
}
```

#### 传递作用域插槽（向子组件传递）

通过 data 对象的 `scopedSlots` 字段：

```js
render(h) {
  return h('div', [
    h('child', {
      scopedSlots: {
        default: (props) => h('span', props.text)
      }
    })
  ])
}
```

---

## 七、JSX 支持

层层嵌套的 `createElement` 写起来很痛苦，这时可以用 **JSX**——它是渲染函数的语法糖，编译后就是 `createElement` 调用：

```jsx
import AnchoredHeading from './AnchoredHeading.vue'

new Vue({
  el: '#demo',
  render(h) {
    return (
      <AnchoredHeading level={1}>
        <span>Hello</span> world!
      </AnchoredHeading>
    )
  }
})
```

> 💡 **`h` 作为 `createElement` 的别名，是 Vue 生态的通用惯例，也是 JSX 所要求的。**
> 从 Vue 的 Babel 插件 3.4.0 起，在以 ES2015 语法声明、含 JSX 的方法和 getter 中（注意：不是普通函数或箭头函数），会**自动注入** `const h = this.$createElement`，所以可以省略 `render(h)` 的 `(h)` 参数。

Vue 2 的 JSX 使用 `@vue/babel-preset-jsx`（或 `babel-plugin-transform-vue-jsx`）配置，Vue CLI 项目可直接集成。

> ⚠️ 注意：Vue 2 的 JSX 与 Vue 3、与其它框架的 JSX 转换方式都不同，配置时要用 Vue 2 专用的插件。

---

## 八、函数式组件（functional）

当一个组件**没有状态（无 data）、没有 `this` 上下文、没有生命周期**时，可以把它标记为**函数式组件**——它渲染开销更低（无实例），在 Vue 2 中常用于包装组件。

```js
Vue.component('my-component', {
  functional: true,        // ① 标记为函数式
  props: { /* 可选 */ },
  // ② 没有 this，改用第二个参数 context 接收一切
  render(createElement, context) {
    // ...
  }
})
```

### context 对象的字段

函数式组件没有实例，所有信息都通过 `context` 参数传入：

| 字段 | 说明 |
|------|------|
| `props` | 所有 prop 组成的对象 |
| `children` | VNode 子节点数组 |
| `slots()` | 返回所有插槽对象的函数 |
| `scopedSlots` | （2.6.0+）传入的作用域插槽对象 |
| `data` | 传给组件的整个数据对象 |
| `parent` | 父组件的引用 |
| `listeners` | （2.3.0+）父组件注册的事件监听器对象，是 `data.on` 的别名 |
| `injections` | （2.3.0+）`inject` 注入的 property |

### `slots()` 与 `children` 的区别

| | `children` | `slots().default` |
|---|---|---|
| 含义 | 所有子节点（VNode 数组） | 默认插槽的内容 |
| 区别 | 包含**全部**子节点 | 只包含**未具名**的子节点 |

```html
<my-functional-component>
  <p slot="foo">first</p>
  <p>second</p>
</my-functional-component>
```

- `children` → 两个 `<p>`
- `slots().default` → 只有 `second`
- `slots().foo` → `first`

> 💡 同时提供两者，让你能选择"是否感知插槽机制"，或简单地把 `children` 整体透传。

### 透传 attribute 和事件（关键技巧）

普通组件会自动把非 prop 的 attribute 加到根元素；但**函数式组件需要你显式处理**——最简单的做法是把 `context.data` 原样作为子节点的 data 传入：

```js
Vue.component('my-functional-button', {
  functional: true,
  render(createElement, context) {
    // 把所有 attribute、事件、children 都透传给 <button>
    return createElement('button', context.data, context.children)
  }
})
```

> 💡 这种透传非常"透明"，连 `.native` 修饰符都不需要。这是函数式组件做**包装组件**的常用技巧。

基于模板的函数式组件（2.5.0+）写法：

```html
<template functional>
  <button class="btn" v-bind="data.attrs" v-on="listeners">
    <slot />
  </button>
</template>
```

---

## 九、Vue 2 与 Vue 3 的 h() 差异（对比）

> 姊妹篇：[《Vue 3 中 h() 函数完全指南》](./h函数(vue3).md)

| 维度 | **Vue 2（`createElement` / `h`）** | Vue 3（`h`） |
|------|----------|----------|
| 函数来源 | `render(h)` 参数 或 `this.$createElement` | 从 `'vue'` 导入 `h` |
| data/props 结构 | **嵌套命名空间**（attrs/props/domProps/on/nativeOn） | **扁平对象**（属性/事件都写一层，事件用 `onXxx`） |
| 普通 attribute | `attrs: { id }` | `{ id }` |
| 组件 prop | `props: { myProp }` | `{ myProp }` |
| DOM 属性 | `domProps: { innerHTML }` | `{ innerHTML }` |
| 事件 | `on: { click: fn }` | `{ onClick: fn }` |
| 组件原生事件 | `nativeOn: { click: fn }` | 直接 `{ onClick: fn }`（移除了 `.native`） |
| 事件修饰符 `.capture/.once/.passive` | `on` 中用前缀 `!` / `~` / `&` | 驼峰后缀 `onClickCapture` |
| 事件修饰符 `.stop/.prevent/.self/按键` | **手动**在处理函数里实现 | `withModifiers(fn, [...])` |
| v-model | **手动** `domProps.value` + `on.input` | 手动 `modelValue` + `onUpdate:modelValue`（原生 input 仍手动） |
| 使用组件 | 需注册 / 字符串 / 组件选项对象 | 直接 import 传入即可 |
| 静态插槽 | `this.$slots.default`（VNode 数组） | `slots.default()`（函数） |
| 作用域插槽 | `this.$scopedSlots` / `scopedSlots` 字段 | 统一用插槽函数作 children |
| 函数式组件 | `functional: true` + `context` 参数（性能优势明显） | 普通函数即可（无实例），性能优势不明显 |
| 是否有 `this` | ✅ 渲染函数内有 `this`（指向实例） | setup 返回的渲染函数无 `this` |

对比示例（同一个 `<div>` 的 props）：

```js
// Vue 2：嵌套结构
h('div', {
  class: 'box',
  attrs: { id: 'foo' },          // 普通属性
  domProps: { innerHTML: 'hi' }, // DOM 属性
  on: { click: handler },        // 事件
  nativeOn: { click: nativeHandler } // 组件原生事件
}, [h('span', 'text')])

// Vue 3：扁平结构（同一个元素）
h('div', {
  class: 'box',
  id: 'foo',
  innerHTML: 'hi',
  onClick: handler
}, [h('span', 'text')])
```

> 💡 **记忆口诀**：Vue 2 的 data 像"分门别类的抽屉"（attrs/props/domProps/on/nativeOn 各放一格）；Vue 3 的 props 是"扁平口袋"，所有东西都直接塞进去，事件统一加 `on` 前缀。

---

## 十、常见问题与陷阱

### 陷阱 1：VNode 必须唯一

```js
render(h) {
  const myParagraphVNode = h('p', 'hi')
  // ❌ 错误：同一个 VNode 被复用，渲染异常
  return h('div', [myParagraphVNode, myParagraphVNode])
}

// ✅ 正确：用工厂函数每次创建新的 VNode
render(h) {
  return h('div', Array.apply(null, { length: 20 }).map(() => h('p', 'hi')))
}
```

### 陷阱 2：混淆 attrs / props / domProps

```js
// ❌ 把组件 prop 写进 attrs
h(MyComp, { attrs: { myProp: 'x' } })

// ✅ 组件 prop 用 props
h(MyComp, { props: { myProp: 'x' } })

// ❌ 把 input 的 value 写进 attrs
h('input', { attrs: { value: 'x' } })

// ✅ input 的 value 是 DOM property，用 domProps
h('input', { domProps: { value: 'x' } })
```

### 陷阱 3：v-for 忘记加 key

```js
// ❌ 没加 key
h('ul', this.items.map(item => h('li', item.name)))

// ✅ 手动加 key
h('ul', this.items.map(item => h('li', { key: item.id }, item.name)))
```

### 陷阱 4：以为有 v-model 语法糖

```js
// ❌ 渲染函数里没有 v-model 语法
h('input', { vModel: this.value })

// ✅ 手动实现双向绑定
h('input', {
  domProps: { value: this.value },
  on: { input: (e) => this.$emit('input', e.target.value) }
})
```

### 陷阱 5：事件修饰符用错（用 onXxx 或直接写修饰符）

```js
// ❌ Vue 2 的 on 里不能用 @click.stop 这种写法，也没有 onClick
h('button', { onClick: fn })          // ❌ Vue 2 不支持 onClick
h('button', { on: { 'click.stop': fn } })  // ❌ 不支持修饰符语法

// ✅ on 里用原生事件名，修饰符手动实现
h('button', { on: { click(e) { e.stopPropagation(); fn() } } })

// ✅ .capture/.once/.passive 用前缀
h('div', { on: { '!click': fn } })    // @click.capture
```

### 陷阱 6：函数式组件忘了透传 attribute

```js
// ❌ 函数式组件不会自动透传 attribute，下面会丢掉外部传入的 class/事件
Vue.component('my-btn', {
  functional: true,
  render(h, ctx) {
    return h('button', null, ctx.children)
  }
})

// ✅ 把 context.data 透传下去
render(h, ctx) {
  return h('button', ctx.data, ctx.children)
}
```

### 陷阱 7：在 render 外创建 VNode 却不用 $createElement

```js
// ❌ h / createElement 在 render 外部不可用
methods: {
  makeNode() {
    return h('div')   // ❌ h 未定义
  }
}

// ✅ 使用 this.$createElement
methods: {
  makeNode() {
    return this.$createElement('div')
  }
}
```

### 陷阱 8：函数式组件里用 this

```js
// ❌ 函数式组件没有 this 上下文
Vue.component('x', {
  functional: true,
  render(h, ctx) {
    return h('div', this.someData)   // ❌ this 是 undefined
  }
})

// ✅ 用 context.props / context.parent 等
render(h, ctx) {
  return h('div', ctx.props.someData)
}
```

---

## 十一、常见应用场景

### 场景 1：动态标签名（anchored-heading）

根据 `level` 动态渲染 `h1`~`h6`，模板要写 6 个分支，渲染函数一行搞定：

```js
Vue.component('anchored-heading', {
  props: { level: { type: Number, required: true } },
  render(h) {
    return h('h' + this.level, this.$slots.default)  // 动态标签 + 默认插槽
  }
})
```

### 场景 2：智能列表（smart-list，函数式包装组件）

根据数据类型，程序化地选择渲染哪个列表组件：

```js
var EmptyList = { /* ... */ }
var TableList = { /* ... */ }
var OrderedList = { /* ... */ }
var UnorderedList = { /* ... */ }

Vue.component('smart-list', {
  functional: true,
  props: {
    items: { type: Array, required: true },
    isOrdered: Boolean
  },
  render(h, context) {
    function appropriateListComponent() {
      const items = context.props.items
      if (items.length === 0) return EmptyList
      if (typeof items[0] === 'object') return TableList
      if (context.props.isOrdered) return OrderedList
      return UnorderedList
    }
    // 把 data 和 children 原样透传给选中的组件
    return h(appropriateListComponent(), context.data, context.children)
  }
})
```

### 场景 3：配置驱动的表格列

```js
render(h) {
  return h('table', [
    h('thead', h('tr', this.columns.map(col => h('th', col.title)))),
    h('tbody', this.data.map(row =>
      h('tr', { key: row.id }, this.columns.map(col =>
        h('td', col.render ? col.render(row) : row[col.field])
      ))
    ))
  ])
}
```

### 场景 4：函数式包装组件（透传 + 加料）

```js
// 给任意组件统一加主题 class，并透传所有 attribute 和事件
Vue.component('with-theme', {
  functional: true,
  props: ['component'],
  render(h, { props, data, children }) {
    // 合并额外的 class，其余原样透传
    return h(props.component, {
      ...data,
      class: ['theme-default', data.class]
    }, children)
  }
})
```

### 场景 5：JSX 复杂业务组件

```jsx
export default {
  render() {
    return (
      <div class="profile">
        {this.user.avatar ? <img src={this.user.avatar} /> : null}
        <h3>{this.user.name}</h3>
      </div>
    )
  }
}
```

---

## 十二、面试常见问题

### Q1：Vue 2 中 createElement（h）是什么？返回什么？

`createElement` 是 Vue 2 渲染函数用来创建**虚拟 DOM 节点（VNode）**的函数，社区惯例简写为 `h`（hyperscript）。它接收 `tag`、`data`、`children` 三个参数，返回一个描述节点的普通 JS 对象（VNode）。Vue 2 的模板最终会被编译成渲染函数（即 `createElement` 调用）。

### Q2：Vue 2 的 createElement 和 Vue 3 的 h 有什么区别？

最大区别是 **data/props 的结构**：Vue 2 是**嵌套命名空间**（`attrs`/`props`/`domProps`/`on`/`nativeOn` 各成一格），Vue 3 是**扁平对象**（属性和事件都写一层，事件用 `onXxx`）。此外 Vue 2 的 `h` 来自 `render(h)` 参数或 `this.$createElement`，Vue 3 从 `'vue'` 导入；Vue 2 用组件需注册，Vue 3 直接 import；Vue 2 事件修饰符 `.capture/.once/.passive` 用 `!`/`~`/`&` 前缀，其它手动实现，Vue 3 用驼峰后缀和 `withModifiers`。

### Q3：Vue 2 的 data 数据对象有哪些字段？

主要有：`class`、`style`（与 `v-bind:class/style` 相同）、`attrs`（普通 HTML 属性）、`props`（组件 prop）、`domProps`（DOM 属性如 innerHTML）、`on`（事件）、`nativeOn`（组件原生事件）、`directives`（指令）、`scopedSlots`（作用域插槽）、`slot`（插槽名）、`key`、`ref`、`refInFor`。

### Q4：attrs、props、domProps 有什么区别？

- `attrs`：写到 HTML 标签上的**普通属性**（如 `id`、`href`）。
- `props`：传给**组件**的 prop（与组件 `props` 选项对应）。
- `domProps`：元素的 **DOM property**（如 `innerHTML`、`input` 的 `value`）。

### Q5：渲染函数里如何实现 v-model？

手动实现：原生 `<input>` 用 `domProps.value` 绑定值，用 `on.input` 监听输入并向父组件 `$emit('input', e.target.value)`。渲染函数没有 `v-model` 的语法糖。

### Q6：渲染函数里如何实现事件修饰符？

- `.passive`/`.capture`/`.once`：在 `on` 里用前缀——`&`/`!`/`~`（组合用 `~!`）。
- `.stop`/`.prevent`/`.self`/按键/修饰键：没有语法糖，在事件处理函数里手动实现（`event.stopPropagation()`、`event.preventDefault()`、判断 `event.target`/`keyCode`/`ctrlKey` 等）。

### Q7：什么是函数式组件？context 参数有哪些字段？

函数式组件用 `functional: true` 标记，**无状态、无 `this`、无实例**，渲染开销低。因为没有实例，一切通过第二个参数 `context` 传入，其字段包括：`props`、`children`、`slots()`、`scopedSlots`、`data`、`parent`、`listeners`、`injections`。常用于包装组件，并把 `context.data` 原样透传以传递 attribute 和事件。

### Q8：$slots 和 $scopedSlots 有什么区别？

`this.$slots` 是**静态插槽**，每个插槽是 VNode **数组**；`this.$scopedSlots` 是**作用域插槽**，每个插槽是返回 VNode 的**函数**（可接收子组件回传的 props）。在 Vue 2.6+，`$scopedSlots` 也会以函数形式暴露普通插槽。

### Q9：为什么 VNode 必须唯一？怎么复用？

Vue 在 patch 时假设组件树中的 VNode 是唯一的，复用同一个 VNode 引用会导致渲染异常。要重复渲染相同结构，用**工厂函数**（如 `Array.apply(null, { length: 20 }).map(() => h('p'))`）每次产生新的 VNode。

### Q10：Vue 2 渲染函数里的 this 指向什么？

`render(h)` 函数里的 `this` 指向**当前组件实例**，可以访问 `this.xxx`（data/methods/computed/props）以及 `this.$slots`、`this.$scopedSlots`、`this.$emit`、`this.$createElement` 等。但**函数式组件**（`functional: true`）没有 `this`，需用 `context` 参数。

---

## 十三、总结

| 要点 | 核心结论 |
|------|---------|
| **createElement / h 是什么** | 创建 VNode 的函数，h 是 createElement 的别名惯例 |
| **来源** | `render(h)` 的参数，或 `this.$createElement`（非 vue 导入） |
| **签名** | `createElement(tag, data, children)` |
| **data 结构** | **嵌套命名空间**（Vue 2 的核心特征） |
| **data 主要字段** | class / style / attrs / props / domProps / on / nativeOn / directives / scopedSlots / slot / key / ref / refInFor |
| **事件** | `on: { click: fn }`；原生事件 `nativeOn` |
| **事件修饰符** | `.capture/.once/.passive` 用前缀 `!`/`~`/`&`；其余手动实现 |
| **v-model** | 手动实现（`domProps.value` + `on.input`） |
| **插槽** | `this.$slots`（数组）/ `this.$scopedSlots`（函数）/ data 的 `scopedSlots` 字段 |
| **函数式组件** | `functional: true` + `context` 参数，无 `this`、无实例，性能开销低 |
| **VNode 必须唯一** | 复用用工厂函数 |
| **Vue 3 vs 2** | 嵌套结构 → 扁平对象；组件免注册；事件用 `onXxx`；修饰符用 `withModifiers` |

**记住五句话**：

1. **Vue 2 的 `h`/`createElement` 返回 VNode，是模板编译后的底层等价物；优先用模板，需要完整 JS 编程能力时才用渲染函数。**
2. **Vue 2 的 data 是"嵌套命名空间"：class/style/attrs/props/domProps/on/nativeOn/directives/scopedSlots/slot/key/ref/refInFor 各成一格——这是它和 Vue 3 最大的区别。**
3. **attrs 是普通 HTML 属性、props 是组件 prop、domProps 是 DOM 属性（如 innerHTML/value），三者不要混用。**
4. **渲染函数里没有 v-model 和事件修饰符语法糖：v-model 手动用 `domProps.value`+`on.input`；`.capture/.once/.passive` 用 `!`/`~`/`&` 前缀，其余修饰符在处理函数里手动实现。**
5. **函数式组件（`functional: true`）无 `this`、无实例、开销低，用 `context` 参数接收 props/children/data/listeners，常作包装组件——把 `context.data` 原样透传即可传递 attribute 与事件。**
