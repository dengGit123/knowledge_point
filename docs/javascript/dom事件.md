# DOM 事件（事件的绑定与移除）

## 一、概述

DOM 事件是指用户或浏览器执行的交互动作（点击、输入、滚动、加载等）。要在这些动作发生时执行代码，首先得**把处理函数"绑定"到事件上**；不再需要时，又要能把它**"移除"**。本文聚焦两件事：

- **定义/绑定事件的几种方式**（HTML 内联、DOM0 `onclick`、DOM2 `addEventListener`、IE `attachEvent`）
- **移除事件的几种方式**（赋 `null`、`removeEventListener`、`cloneNode`、`AbortController`、`once`）

> 事件**触发后如何传播**（捕获 → 目标 → 冒泡）属于「事件流」范畴，详见 [事件流.md](./事件流.md)。本文专注"如何把函数挂上去、如何取下来"。

> 📖 [MDN — addEventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
>
> 📖 [MDN — removeEventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/removeEventListener)
>
> 📖 [MDN — AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)

---

## 二、绑定事件的几种方式

### 方式 1：HTML 内联属性（onXxx）

直接在 HTML 标签上用 `on` 开头的属性，属性值是 JS 代码。

```html
<!-- 属性值是要执行的 JS 代码（注意这里调用时带括号） -->
<button onclick="handleClick()">点我</button>

<script>
  function handleClick() {
    console.log('被点击了')
  }
</script>
```

| 优点 | 缺点 |
|------|------|
| 写法简单、直观 | HTML 与 JS 强耦合，难以维护 |
| —— | 同一元素同一事件**只能写一个** |
| —— | 存在 **XSS（跨站脚本）风险**，内容若含用户输入易被注入 |
| —— | 函数必须暴露在全局作用域才能被调用 |

> ⚠️ **注意：** 现代 Web 开发**不推荐**使用内联事件，仅在做 Demo 或老项目维护时可见。

---

### 方式 2：DOM0 级 —— 元素属性赋值（el.onclick）

通过给元素的 `onXxx` **属性**赋一个函数来绑定事件。

```js
const btn = document.getElementById('btn')

// 绑定：把函数赋给 onclick 属性
btn.onclick = function () {
  console.log('点击了 A')
}

// ⚠️ 后赋值会覆盖前面的（一个事件类型只能绑一个）
btn.onclick = function () {
  console.log('点击了 B')     // 点击时只输出 B，A 被覆盖
}
```

**特点：**

- ✅ 写法简单，**所有浏览器**都支持（包括 IE）。
- ✅ 移除方便：`btn.onclick = null`。
- ⚠️ 同一元素的同一事件**只能绑定一个**处理函数（后写的覆盖先写的）。
- ⚠️ 只能在**冒泡阶段**触发，无法选择捕获阶段。

> 💡 **提示：** 之所以叫 "DOM0"，是因为它属于 DOM 标准化之前（Netscape 时代）就存在的事件模型，是最古老、兼容性最好的写法。

---

### 方式 3：DOM2 级 —— addEventListener（标准，推荐 ✅）

W3C 标准提供的方法，是**现代开发的首选**。

```js
const btn = document.getElementById('btn')

function handler() {
  console.log('点击了')
}

// 绑定
btn.addEventListener('click', handler)
```

#### 完整语法

```js
target.addEventListener(type, listener, useCapture)
```

| 参数 | 说明 |
|------|------|
| `type` | 事件类型字符串，**不带 `on` 前缀**（如 `'click'`、`'input'`） |
| `listener` | 处理函数（或实现 `handleEvent` 的对象） |
| `useCapture` | 可选。`true` 表示**捕获阶段**触发，`false`（默认）表示**冒泡阶段**；也可以传 options 对象 |

#### 核心优势

```js
const btn = document.getElementById('btn')

// ① 同一事件可以绑定多个处理函数（按绑定顺序执行）
btn.addEventListener('click', () => console.log('A'))
btn.addEventListener('click', () => console.log('B'))
btn.addEventListener('click', () => console.log('C'))
// 点击输出：A → B → C

// ② 可以控制捕获/冒泡阶段（DOM0 做不到）
btn.addEventListener('click', fnCapture, true)   // 捕获阶段触发
btn.addEventListener('click', fnBubble, false)   // 冒泡阶段触发（默认）
```

#### options 配置对象（现代用法）

第三个参数也可以传一个配置对象：

```js
btn.addEventListener('click', handler, {
  capture: false,   // 是否在捕获阶段触发
  once: true,       // 触发一次后自动移除
  passive: true     // 声明永不调用 preventDefault（优化滚动性能）
})
```

| 选项 | 作用 |
|------|------|
| `capture` | 在捕获阶段触发 |
| `once` | 执行一次后**自动移除**，等价于"用完即删" |
| `passive` | 承诺不阻止默认行为，提升 `touchmove`/`wheel` 滚动流畅度 |

---

### 方式 4：attachEvent / detachEvent（IE8 及以下，已废弃）

老版本 IE（IE8 及以下）不支持 `addEventListener`，提供了专属的 `attachEvent`。

```js
// ⚠️ 注意事件名要带 'on' 前缀（与 addEventListener 不同！）
btn.attachEvent('onclick', function () {
  console.log('IE 老式绑定')
})
```

**特点：**

- ❌ 仅 IE（及早期 Opera）支持，现代浏览器**已废弃**。
- 事件名带 `on` 前缀（`'onclick'`，而标准是 `'click'`）。
- `this` 指向 `window`（而非触发元素）—— 这是 IE 的一个 bug。
- 以**冒泡**方式触发，无法选择捕获。

> 💡 **提示：** 现代项目无需考虑 IE，了解即可。早期兼容写法是检测方法存在性来分别调用：

```js
// 历史上的跨浏览器事件绑定封装（现在已不需要）
function addEvent(el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, fn)          // 标准浏览器
  } else if (el.attachEvent) {
    el.attachEvent('on' + type, fn)        // IE 老版本
  } else {
    el['on' + type] = fn                   // DOM0 兜底
  }
}
```

---

### 四种绑定方式对比总表

| 对比维度 | HTML 内联 | DOM0 (`onclick`) | DOM2 (`addEventListener`) | IE (`attachEvent`) |
|------|:---:|:---:|:---:|:---:|
| **写法** | `onclick="..."` | `el.onclick = fn` | `el.addEventListener(...)` | `el.attachEvent(...)` |
| **绑定多个** | ❌ | ❌ | ✅ | ✅ |
| **选择捕获/冒泡** | ❌ | ❌ | ✅ | ❌（仅冒泡） |
| **`this` 指向** | 元素 | 元素 | 元素 | ⚠️ `window` |
| **事件名前缀** | `on` | `on`（属性） | 无 `on` | `on` |
| **现代推荐** | ❌ | 一般 | ✅ 首选 | ❌ 已废弃 |

---

## 三、移除事件的几种方式

### 方式 1：DOM0 —— `el.onclick = null`

DOM0 绑定的事件，直接把属性置空即可移除。

```js
btn.onclick = function () { console.log('hi') }

// 移除
btn.onclick = null

// 也可以"覆盖"成新函数（旧的自然失效）
btn.onclick = function () { console.log('new') }
```

---

### 方式 2：DOM2 —— removeEventListener（标准，对应 addEventListener）

```js
function handler() {
  console.log('点击')
}

// 绑定
btn.addEventListener('click', handler)

// 移除：必须传入"同一个函数引用"
btn.removeEventListener('click', handler)
```

> ⚠️ **注意（最常见坑）：** `removeEventListener` 要生效，必须满足两点：
> 1. 传入**同一个函数引用**（匿名函数无法移除）。
> 2. `useCapture` 必须和 `addEventListener` 时**一致**。

#### ❌ 常见错误：匿名函数移除不掉

```js
// ❌ 绑定时用了匿名函数
btn.addEventListener('click', () => { console.log('hi') })
// ❌ 移除时又写了一个新匿名函数 —— 引用不同，移除失败！
btn.removeEventListener('click', () => { console.log('hi') })
```

```js
// ✅ 正确：用具名函数，保证引用一致
function handler() { console.log('hi') }
btn.addEventListener('click', handler)
btn.removeEventListener('click', handler)   // ✅ 引用相同，移除成功
```

#### ❌ 常见错误：useCapture 不匹配

```js
function handler() {}

btn.addEventListener('click', handler, true)     // 捕获阶段绑定
btn.removeEventListener('click', handler, false) // ❌ useCapture 不匹配，移除失败
btn.removeEventListener('click', handler, true)  // ✅ 匹配，移除成功
```

---

### 方式 3：cloneNode 替换节点（清除该节点所有 DOM2 事件）

如果想**一次性清掉某元素上所有用 `addEventListener` 绑定的事件**，没有直接的 API。一个"暴力"技巧是：克隆节点再替换——因为 `cloneNode` **不会复制** `addEventListener` 注册的事件监听器。

```js
const oldBtn = document.getElementById('btn')
const newBtn = oldBtn.cloneNode(true)              // 深克隆（连子节点一起）
oldBtn.parentNode.replaceChild(newBtn, oldBtn)     // 用无事件的新节点替换旧节点
// 现在 newBtn 上没有之前 addEventListener 绑定的事件了
```

> ⚠️ **注意：** `cloneNode` **会复制** DOM0 方式（`el.onclick = fn`）绑定的事件（因为那是元素属性），但**不会复制** DOM2 方式（`addEventListener`）绑定的事件。所以这个技巧只对 DOM2 事件有效。

---

### 方式 4：AbortController（批量移除，现代优雅 ✅）

这是**现代推荐的批量移除方式**。给一组事件监听器传入同一个 `AbortSignal`，调用一次 `controller.abort()` 就能全部移除——非常适合"路由切换 / 组件卸载时清理"的场景。

```js
const controller = new AbortController()

// 多个监听器共享同一个 signal
btn.addEventListener('click', handler1, { signal: controller.signal })
btn.addEventListener('click', handler2, { signal: controller.signal })
window.addEventListener('scroll', handler3, { signal: controller.signal })

// 一次性移除上面所有事件（一行搞定！）
controller.abort()
```

> 💡 **提示：** 相比逐个 `removeEventListener`，`AbortController` 不要求你记着每个函数引用，**一次 `abort()` 清理全部**，是处理"成组事件生命周期"的最佳实践。`abort()` 之后，`controller.signal.aborted` 变为 `true`。

---

### 方式 5：`once: true` 选项（执行后自动移除）

如果某个事件**只想处理一次**（如新手引导的首次点击），用 `once` 选项最省事，触发后自动移除，无需手动清理。

```js
btn.addEventListener('click', () => {
  console.log('只触发一次')
}, { once: true })   // 点击一次后自动移除
```

---

## 四、移除方式对比总表

| 移除方式 | 适用绑定 | 特点 |
|------|:---:|------|
| `el.onclick = null` | DOM0 | 简单直接，只对 DOM0 有效 |
| `removeEventListener` | DOM2 | 标准，需**同函数引用** + **同 useCapture** |
| `cloneNode` + `replaceChild` | DOM2 | 暴力清空该节点所有 DOM2 事件（不复制 DOM0 之外的事件） |
| `controller.abort()` | DOM2 | **批量移除**成组事件，现代推荐 |
| `once: true` | DOM2 | 执行一次后自动移除 |

---

## 五、事件处理函数中的 `this` 与 `event`

### 1. `this` 指向

| 绑定方式 | 处理函数中 `this` |
|------|------|
| DOM0 (`onclick`) | 绑定该事件的**元素** |
| DOM2 (`addEventListener`) | 绑定该事件的**元素** |
| IE (`attachEvent`) | ⚠️ `window`（IE 的 bug） |
| 箭头函数 | ⚠️ 无自己的 `this`，指向定义时外层 |

```js
const btn = document.getElementById('btn')

// ✅ 普通函数：this 是 btn
btn.addEventListener('click', function () {
  console.log(this)   // <button>
})

// ⚠️ 箭头函数：this 是外层（不是 btn）
btn.addEventListener('click', () => {
  console.log(this)   // window（或外层作用域）
})
```

> 💡 **提示：** 需要"当前是哪个元素触发"时，优先用事件对象 `event.currentTarget`，比依赖 `this` 更可靠（尤其在使用箭头函数时）。

### 2. `event` 事件对象

处理函数会收到一个事件对象参数，包含事件相关信息。

```js
btn.addEventListener('click', (e) => {
  console.log(e.type)             // 'click'（事件类型）
  console.log(e.target)           // 真正触发事件的元素
  console.log(e.currentTarget)    // 绑定监听器的元素
  // e.preventDefault()           // 阻止默认行为
  // e.stopPropagation()          // 阻止事件传播
})
```

> ⚠️ **注意：** 老 IE 中事件对象不在参数里，而在全局 `window.event`，且没有 `preventDefault`/`stopPropagation`，对应的是 `returnValue = false` / `cancelBubble = true`。现代浏览器已统一，无需处理。

---

## 六、实际应用场景

### 场景 1：绑定多个处理函数（DOM2 独有）

```js
const btn = document.getElementById('save')
btn.addEventListener('click', validate)   // 先校验
btn.addEventListener('click', submit)     // 再提交
btn.addEventListener('click', logEvent)   // 再记录日志
// 一次点击，三个函数按顺序执行
```

### 场景 2：用 AbortController 在组件/页面卸载时统一清理

```js
// 页面或组件初始化时，创建一个 abort controller
const controller = new AbortController()
const { signal } = controller

window.addEventListener('scroll', onScroll, { signal })
window.addEventListener('resize', onResize, { signal })
document.addEventListener('keydown', onKey, { signal })

// 离开页面 / 组件卸载：一行清理所有事件
window.addEventListener('beforeunload', () => controller.abort())
```

### 场景 3：引导提示只触发一次（once）

```js
// 首次点击展示引导，之后不再展示
document.getElementById('guide').addEventListener('click', showTip, { once: true })
```

### 场景 4：用 once + 被动监听优化移动端滚动

```js
document.addEventListener('touchstart', initAudio, {
  once: true,        // 只执行一次（用户首次触摸就初始化音频上下文）
  passive: true      // 不阻止默认行为，保证滚动流畅
})
```

---

## 七、Vue 3 中的事件绑定（对比）

Vue 通过模板指令 `@事件名` 绑定事件，**框架自动管理绑定与移除**，开发者无需手动 `addEventListener`/`removeEventListener`，也不存在匿名函数移除不掉的问题。

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

// 直接在模板用 @click 绑定，Vue 负责挂载/卸载
function handleClick() {
  count.value++
}
</script>

<template>
  <!-- @click 是 v-on:click 的简写 -->
  <button @click="handleClick">点击 {{ count }}</button>

  <!-- 支持修饰符，等价于原生事件流控制 -->
  <a href="/x" @click.prevent="onNav">阻止默认跳转</a>   <!-- .prevent → preventDefault -->
  <div @click.stop="onClick">阻止冒泡</div>             <!-- .stop → stopPropagation -->
  <button @click.once="onFirst">只触发一次</button>      <!-- .once → once: true -->
</template>
```

| 原生方式 | Vue 模板对应 |
|------|------|
| `addEventListener` | `@click` / `v-on:click` |
| `removeEventListener` | 自动管理，组件卸载时自动移除 |
| `e.preventDefault()` | `@click.prevent` |
| `e.stopPropagation()` | `@click.stop` |
| `{ once: true }` | `@click.once` |
| `{ capture: true }` | `@click.capture` |
| `{ passive: true }` | `@wheel.passive` |

> 💡 **提示：** 这是使用框架的一大好处——事件的生命周期由框架托管，避免了原生开发中"忘记移除导致内存泄漏"的经典问题。

---

## 八、常见问题与注意事项

### 1. 匿名函数无法用 `removeEventListener` 移除

`removeEventListener` 靠**函数引用相等**来匹配。每次写匿名函数都是**新引用**，因此移除不掉。需要移除时，**必须用具名函数**。

```js
// ❌ 移除不掉
el.addEventListener('click', () => {})
el.removeEventListener('click', () => {})

// ✅ 能移除
function handler() {}
el.addEventListener('click', handler)
el.removeEventListener('click', handler)
```

### 2. `removeEventListener` 的 `useCapture` 必须匹配

捕获阶段绑的（`true`），必须用 `true` 移除；冒泡阶段绑的（`false`），用 `false` 移除。默认值都是 `false`，省略时一般没问题，但混用时要当心。

### 3. 同函数 + 同 `useCapture` 的重复绑定会自动去重

```js
function handler() { console.log('hi') }
btn.addEventListener('click', handler)
btn.addEventListener('click', handler)   // 被忽略，不会绑两次！
// 点击只输出一次 'hi'
```

> ⚠️ **注意：** 但如果 `useCapture` 不同，则视为**两个**监听器（捕获一个、冒泡一个），不会去重。

### 4. 没有移除事件会导致内存泄漏

如果一个 DOM 节点已经从页面移除，但仍有事件监听器引用着它（或它的回调引用着大对象），该节点及其相关内存就**无法被垃圾回收**。在 SPA / 组件化开发中尤其要注意组件卸载时清理事件。

```js
// ✅ 组件卸载/节点移除时，务必 removeEventListener
oldBtn.removeEventListener('click', handler)
oldBtn.remove()
```

### 5. 不要在循环里重复绑定同一个监听器

由于 DOM2 会自动去重，重复绑定同引用虽不会叠加，但仍是多余操作；若是匿名函数则**每次循环都新增一个监听器**，造成泄漏。

### 6. DOM0 和 DOM2 可以共存

同一个元素上，`onclick` 属性绑定（DOM0）和 `addEventListener` 绑定（DOM2）互不影响，触发时**都会执行**（DOM0 的通常在冒泡阶段按位置触发）。

---

## 九、总结

| 知识点 | 一句话记忆 |
|------|------|
| **绑定方式** | 内联 `onXxx`、DOM0 `el.onclick`、DOM2 `addEventListener`（推荐）、IE `attachEvent`（废弃） |
| **绑定多个** | 只有 DOM2（`addEventListener`）支持；DOM0 后写覆盖先写 |
| **移除 DOM0** | `el.onclick = null` |
| **移除 DOM2** | `removeEventListener`，需**同函数引用** + **同 useCapture** |
| **批量移除** | `AbortController` + `signal`（现代推荐） |
| **自动移除** | `{ once: true }` 或 Vue 的 `@click.once` |
| **清空全部 DOM2 事件** | `cloneNode` + `replaceChild` |
| **this 指向** | DOM0/DOM2 指向元素；箭头函数指向外层；IE 指向 window |
| **生产首选** | 框架用 `@事件名`；原生用 `addEventListener` |

**核心理解**：DOM 事件绑定有四种历史方案，现代开发**统一用 `addEventListener`**（DOM2）——它支持绑定多个、可选捕获/冒泡、可配置 `once`/`passive`。移除事件的关键在于"**对得上**"：DOM0 赋 `null`、DOM2 用同函数引用 + 同 `useCapture` 的 `removeEventListener`，需要批量清理就用 `AbortController`。理解了"绑定要存引用、移除要凭引用"，就掌握了 DOM 事件管理的全部要点。

> 📖 延伸阅读：[MDN — 事件参考](https://developer.mozilla.org/zh-CN/docs/Web/Events)、[事件流详解](./事件流.md)
