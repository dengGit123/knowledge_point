# Vue 3 中 key 的作用完全指南

> 本文档**专注讲解 Vue 3** 中 `key` 属性的作用、底层 Diff 原理、使用场景与最佳实践，并系统对比 Vue 3 与 Vue 2 的差异，重点剖析"为什么不能用 index 做 key"这一经典面试题，帮助你正确、高效地使用 `key`。
>
> 如果你还在用 Vue 2，请注意：Vue 3 对 `key` 有几处**破坏性变更**（下文会逐一点出），本文以 Vue 3 为准。

> 📖 **官方文档**
> - [列表渲染 · 用 key 管理状态](https://cn.vuejs.org/guide/essentials/list.html#maintaining-state-with-key)
> - [特殊的 key 属性（API）](https://cn.vuejs.org/api/built-in-special-attributes.html#key)
> - [Vue 3 迁移指南 · key Attribute 的变更](https://v3-migration.vuejs.org/breaking-changes/key-attribute.html)

## 目录

- [一、概述](#一概述)
- [二、key 的核心原理（Vue 3 视角）](#二key-的核心原理vue-3-视角)
- [三、Vue 3 中 key 的三大关键特性](#三vue-3-中-key-的三大关键特性)
- [四、key 的使用场景](#四key-的使用场景)
- [五、Vue 3 的 Diff 算法深入（key 的舞台）](#五vue-3-的-diff-算法深入key-的舞台)
- [六、为什么不能用 index 做 key（经典案例）](#六为什么不能用-index-做-key经典案例)
- [七、key 的取值规则](#七key-的取值规则)
- [八、Vue 2 与 Vue 3 的 key 差异（对比）](#八vue-2-与-vue-3-的-key-差异对比)
- [九、常见问题与陷阱](#九常见问题与陷阱)
- [十、面试常见问题](#十面试常见问题)
- [十一、总结](#十一总结)

---

## 一、概述

在 Vue 3 中，`key` 是一个**特殊的 attribute**，用于标识虚拟 DOM（VNode）节点的**唯一身份**。它最常见的用途是配合 `v-for` 列表渲染，但它的作用远不止于此。

```vue
<!-- key 最常见的用法：配合 v-for -->
<div v-for="item in list" :key="item.id">
  {{ item.name }}
</div>
```

> **通俗理解**：`key` 就像每个 DOM 节点的**身份证号**。当列表数据变化（新增、删除、排序）时，Vue 3 拿着"身份证号"去比对：哪些节点是老朋友（复用）、哪些是新来的（创建）、哪些走了（删除）。没有身份证号，Vue 只能"按位置瞎猜"，容易出错。

`key` 的核心价值是：**帮助 Vue 3 高效、正确地复用和更新 DOM 节点**。

> 💡 **一句话定位**：`key` 是 Vue 3 虚拟 DOM 算法（Diff）用来"追踪节点身份"的提示（hint）。它本身不是普通的 attribute，不会出现在真实 DOM 上，而是被 Vue 编译器/运行时内部消费。

---

## 二、key 的核心原理（Vue 3 视角）

### 1. Vue 3 的渲染流程

Vue 3 更新视图的过程是：**数据变化 → 生成新的虚拟 DOM（VNode）→ 与旧 VNode 进行 Diff 比对 → 只更新差异部分的真实 DOM**。

```
数据变化（响应式触发）
   │
   ▼
重新执行渲染函数，生成新 VNode
   │
   ▼
Diff 算法：新 VNode 与旧 VNode 比对
   │
   ▼
找到差异 → 最小化 DOM 操作（挂载/卸载/打补丁/移动）
```

> ⚠️ **注意**：Vue 3 的 VNode 与 Vue 2 不同——Vue 3 引入了**区块树（Block Tree）**和**动态节点收集**优化，能跳过大量静态节点。但 `key` 的作用依然不可替代：当列表项需要**移动、复用、销毁重建**时，`key` 是判断依据。

### 2. key 是 VNode 的"身份证"

在 Vue 3 中，每个 VNode 对象都有一个 `key` 属性（即 `vnode.key`）。Diff 过程中，Vue 需要判断**新旧两个节点是不是"同一个节点"**，判断依据是 `key`：

```
Vue 3 判断"同一个节点"（isSameVNodeType）的条件：
┌──────────────────────────────────────────────────────┐
│  1. 节点类型 type 相同（如都是 'div'，或同一组件）    │
│  2. key 相同                                          │
│                                                       │
│  → 两者都满足：Vue 复用该 DOM 节点（只 patch 属性）   │
│  → 任一不满足：Vue 销毁旧节点、创建新节点             │
└──────────────────────────────────────────────────────┘
```

对应 Vue 3 源码（`@vue/runtime-core`）中的判断逻辑：

```js
// 简化示意：判断两个 VNode 是否"同一类型、可复用"
export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
```

> 💡 **关键**：没有 `key` 时，`vnode.key` 为 `undefined`，Vue 3 默认采用**就地更新**（in-place patch / 按索引 patch）策略——只要位置相同就认为是"同一个节点"，直接复用并更新内容。这看似高效，却埋下了**状态错乱**和**性能浪费**的隐患。

### 3. 复用 vs 重建

| 情况 | Vue 3 的处理 | 结果 |
|------|-----------|------|
| 节点被识别为"同一个"（type + key 相同） | **复用** DOM，只 patch 变化的属性 | 性能高，保留组件状态 |
| 节点无法匹配 | **卸载旧节点、挂载新节点** | 性能低，组件状态丢失（重新走 `onMounted`） |

---

## 三、Vue 3 中 key 的三大关键特性

这一节是理解 Vue 3 中 `key` 的核心，也是 Vue 3 与 Vue 2 行为分化的地方。

### 特性 1：默认"就地更新"策略（没有 key 时）

Vue 官方文档原文：

> Vue 默认按照"就地更新"的策略来更新通过 `v-for` 渲染的元素列表。当数据项的顺序改变时，Vue 不会随之移动 DOM 元素的顺序，而是就地更新每个元素，确保它们在原本指定的索引位置上渲染。
>
> 默认模式是高效的，但**只适用于列表渲染输出的结果不依赖子组件状态或者临时 DOM 状态（例如表单输入值）的情况**。

也就是说：**不写 `key`，Vue 3 就按位置（索引）逐个 patch**，能不移动 DOM 就不移动。代价是——当列表顺序变化时，节点的内部状态会"串位"。

### 特性 2：有 key 时走 keyed Diff

写了 `key`，Vue 3 才会启用专门的"keyed children diff"（见第五节），根据 `key` 匹配新旧节点、最小化 DOM 移动，并保证组件状态正确跟随数据。

> 官方建议：**推荐在任何可行的时候为 `v-for` 提供一个 `key`**，除非所迭代的内容非常简单（不含组件或有状态 DOM 元素），或者你刻意想用默认的"就地更新"来换取性能。

### 特性 3：key 用 Map 存储，不会被字符串化（与 Vue 2 的重大区别）⭐

这是 Vue 3 相对 Vue 2 一个**容易踩坑、面试常考**的细节：

| | Vue 2 | **Vue 3** |
|---|------|----------|
| key 存储结构 | 普通对象 `{}` | **`Map`**（`keyToNewIndexMap = new Map()`） |
| key 是否字符串化 | **会**（被 `toString`） | **不会**（原样存） |
| 数字 `1` 与字符串 `"1"` | **会碰撞**（都变 `"1"`） | **不会碰撞**（Map 用 SameValueZero 比较，类型不同即不同） |
| 对象作为 key | 变成 `"[object Object]"` 导致全碰撞 | 按**引用**比较，不同对象实例视为不同 key |

> 💡 **结论**：
> - Vue 3 中 `1` 和 `"1"` 是**两个不同的 key**，不会相互覆盖。
> - 但官方仍**强烈建议 key 用基础类型（字符串 / number）**，不要用对象。原因是对象按**引用**比较——一旦列表数据被替换成新对象（新引用），所有 key 全部失配，导致整列表重建。

```vue
<!-- ❌ Vue 3 中用对象做 key：当 list 被替换为新数组时，每项都是新引用，
        Map.get() 全部查不到，Vue 认为全是新节点，整列表销毁重建，性能极差 -->
<div v-for="item in list" :key="item">{{ item.name }}</div>

<!-- ✅ 用基础类型（id）做 key -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

---

## 四、key 的使用场景

### 1. `v-for` 列表渲染（最常见、最重要）

```vue
<!-- ✅ 列表渲染时，为每个节点提供稳定、唯一的 key -->
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>
```

> ⚠️ **注意**：Vue 3 **不会**因为 `v-for` 没写 `key` 而强制报错（这与 Vue 2 的运行时警告不同）。但不写 `key` 会走"就地更新"策略，在列表顺序变化时极易产生状态错乱，所以实践中**始终建议提供 `key`**。

### 2. `<template v-for>` 的 key 位置（Vue 3 破坏性变更）⭐

这是 Vue 2 升级 Vue 3 **最容易踩的坑**之一：

```vue
<!-- ❌ Vue 2 的写法：key 放在 <template> 的每个子元素上 -->
<template v-for="item in list">
  <div :key="'d-' + item.id">{{ item.name }}</div>
  <span :key="'s-' + item.id">{{ item.desc }}</span>
</template>

<!-- ✅ Vue 3 的写法：key 必须放在 <template> 标签上 -->
<template v-for="item in list" :key="item.id">
  <div>{{ item.name }}</div>
  <span>{{ item.desc }}</span>
</template>
```

> 来源：[Vue 3 迁移指南 · key Attribute](https://v3-migration.vuejs.org/breaking-changes/key-attribute.html)。Vue 3 中 `<template>` 不能再把 `key` 散落在子元素上，必须绑定到 `<template>` 自身。

### 3. `v-if` / `v-else` —— Vue 3 自动生成 key（重要变化）⭐

> ⚠️ 这是 Vue 3 相对 Vue 2 的一处重要变化，原"用 key 控制 v-if/v-else 复用"的 Vue 2 老套路在 Vue 3 中**已不再需要**。

在 **Vue 2** 中，切换相同标签（如 `<input>`）的不同分支时，Vue 会复用同一个 DOM，导致输入内容残留，需要手动加 `key` 强制重建：

```vue
<!-- Vue 2 的老套路（Vue 3 不再需要这样写） -->
<input v-if="type === 'name'" key="name" placeholder="用户名" />
<input v-else key="email" placeholder="邮箱" />
```

在 **Vue 3** 中，`v-if` / `v-else-if` / `v-else` 的分支会**自动生成唯一的 key**，因此分支之间天然不会互相复用 DOM，上面的输入残留问题不存在了：

```vue
<!-- ✅ Vue 3：无需手动加 key，切换分支会自动重建，输入框自动清空 -->
<template v-if="type === 'name'">
  <label>用户名</label>
  <input placeholder="输入用户名" />
</template>
<template v-else>
  <label>邮箱</label>
  <input placeholder="输入邮箱" />
</template>
```

> ⚠️ **注意**：Vue 3 中如果你**手动**给 `v-if`/`v-else` 分支加了 `key`，那么**每个分支的 key 必须唯一**——不能再像 Vue 2 那样故意用相同 `key` 来强制分支复用（这属于破坏性变更）。

```vue
<!-- ❌ Vue 3 中不能再故意用相同 key 强制复用分支（会冲突） -->
<div v-if="ok" key="same">A</div>
<div v-else key="same">B</div>

<!-- ✅ 要么不加 key（推荐），要么保证唯一 -->
<div v-if="ok" key="a">A</div>
<div v-else key="b">B</div>
```

### 4. `<router-view>` 强制路由组件重新渲染

```vue
<!-- 路由切换时强制组件重新创建（触发完整生命周期） -->
<router-view :key="$route.fullPath" />
```

适用场景：从 `/user/1` 跳到 `/user/2`（同一组件、不同参数），希望组件重新初始化而不是复用。

### 5. `<TransitionGroup>` 的子元素必须有唯一 key ⭐

`<TransitionGroup>` 用于列表的进入/离开/移动过渡动画。它的**每个直接子元素都必须有唯一、稳定的 `key`**，否则会报错：

```
[TransitionGroup] <TransitionGroup> children must be keyed.
```

```vue
<!-- ❌ 没有 key：会报错，且无法正确应用进入/离开/移动动画 -->
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items">{{ item.text }}</li>
</TransitionGroup>

<!-- ✅ 每个子元素有唯一稳定的 key -->
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.text }}</li>
</TransitionGroup>
```

> 💡 这里**更不能用 `index` 做 key**：动画依赖 key 来追踪"哪个元素是哪个"，用 index 会让移动动画完全错乱。

### 6. 强制重新渲染某个组件

改变组件的 `key` 会让 Vue 销毁并重建它（触发 `onUnmounted` → 重新 `onMounted`）：

```vue
<!-- 改变 key 会销毁并重建组件 -->
<MyComponent :key="componentKey" />

<script setup>
import { ref } from 'vue'
const componentKey = ref(0)
function reload() {
  componentKey.value++  // 组件重新创建
}
</script>
```

---

## 五、Vue 3 的 Diff 算法深入（key 的舞台）

`key` 是 Vue 3 列表 Diff 的核心。下面深入看 Vue 3 源码层面的真实流程（位于 `@vue/runtime-core` 的 `renderer.ts`）。

### 1. 没有 key：`patchUnkeyedChildren`（就地更新）

当新旧子节点**都没有 key** 时，Vue 3 走 `patchUnkeyedChildren`：取新旧列表长度的较小值，逐索引 `patch`；多余的新节点挂载、多余的旧节点卸载。**不移动 DOM，只按位置更新**。

```
旧数据：[A, B, C]        旧 DOM：[div-A, div-B, div-C]

在头部插入 X，新数据：[X, A, B, C]

【没有 key，就地更新】
Vue 认为位置还是原来的位置，只更新内容：
  位置 0: div-A 的内容改成 X   → div-X（复用了 A 的 DOM）
  位置 1: div-B 的内容改成 A   → div-A
  位置 2: div-C 的内容改成 B   → div-B
  位置 3: 新建 div-C
→ 结果：3 次 patch + 1 次挂载（本来只需要 1 次挂载！）
```

**问题**：
- **性能差**：本来只需新建 1 个节点，却更新了 3 个 + 新建 1 个。
- **状态错乱**：如果每个 div 里有 `<input>` 或子组件，其内部状态（输入内容、组件 data）会跟着 DOM 位置走，而不是跟着数据走。

### 2. 有 key：`patchKeyedChildren`（Vue 3 快速 Diff 五步法）⭐

有了 `key`，Vue 3 走 `patchKeyedChildren`，采用**快速 Diff 算法**（借鉴自 Inferno），核心是借助**最长递增子序列（LIS）**最小化 DOM 移动。完整分五步：

```
Vue 3 快速 Diff 五步：
1️⃣ 从头部同步：新旧从头比较，type+key 相同就 patch，i++，直到不同
2️⃣ 从尾部同步：新旧从尾比较，type+key 相同就 patch，尾部索引前移
3️⃣ 仅新增 / 仅删除（公共前缀/后缀处理后的特殊情况）
4️⃣ 中间未知序列：为新节点建立 Map（keyToNewIndexMap），用 key 查找匹配
5️⃣ 求最长递增子序列（LIS），LIS 中的节点不动，其余节点才移动/挂载
```

其中第 4 步用到的就是前文提到的 `Map`：

```js
// 简化示意：Vue 3 为新节点建立 key → 新索引 的映射
const keyToNewIndexMap = new Map()
for (j = s2; j <= e2; j++) {
  keyToNewIndexMap.set(newChildren[j].key, j)  // key 原样存入 Map，不字符串化
}
// 再遍历旧节点，用旧节点的 key 去 Map 里查，查到则复用，查不到则卸载
```

### 3. 一个完整例子走一遍

```
旧：[A, B, C, D, E, F, G]   （key: a,b,c,d,e,f,g）
新：[A, B, E, C, D, H, F, G] （key: a,b,e,c,d,h,f,g）

1️⃣ 头部同步：A、B 相同 → patch（复用）
2️⃣ 尾部同步：G、F 相同 → patch（复用）
3️⃣ 中间剩余：旧 [C,D,E] 对 新 [E,C,D,H]
   → 建立新节点 Map：{ e, c, d, h }
   → 旧 C/D/E 在 Map 中都能查到（可复用），H 是新增（需挂载）
4️⃣ 求最长递增子序列：找出"相对顺序保持不变、无需移动"的节点
   → LIS = [C, D]（它们在新旧中的相对顺序没变，不用动）
5️⃣ 只移动不在 LIS 中的节点（E），并挂载新节点（H）
→ DOM 移动次数被压到最少
```

> 💡 **关键思想**：最长递增子序列代表"已经按正确相对顺序排列的节点集合"，这些节点**根本不需要移动**；只需移动剩下的少量节点即可达到目标顺序——这正是 Vue 3 比 Vue 2 移动次数更少的原因。

### 4. Vue 2 双端 Diff vs Vue 3 快速 Diff

| 版本 | Diff 算法 | 核心思想 | 节点移动效率 |
|------|----------|---------|------------|
| **Vue 2** | 双端比较（双端 Diff） | 从新旧列表的**头尾四个方向**同时比较，减少移动 | 较好 |
| **Vue 3** | 快速 Diff（借鉴 Inferno） | 先处理**头尾公共前缀/后缀**，中间用**最长递增子序列（LIS）**找出无需移动的节点 | **更优**（移动次数最少） |

> 💡 **结论**：`key` 是 Diff 算法正确高效工作的**前提**。没有 `key`，算法无法识别节点的真实身份，只能退化成低效且易错的就地更新；有了 `key`，Vue 3 才能通过 LIS 把 DOM 移动压到最小。

---

## 六、为什么不能用 index 做 key（经典案例）

这是最高频的 `key` 面试题。核心原因：**当列表顺序变化时，index 是稳定的，但它对应的数据却变了**——这违背了"key 应稳定标识同一条数据"的原则。

### 案例 1：列表头部插入，导致状态错乱

```vue
<script setup>
import { ref } from 'vue'

const list = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

// 在头部插入新数据
function addFirst() {
  list.value.unshift({ id: 4, name: '赵六' })
}
</script>

<template>
  <button @click="addFirst">在头部插入赵六</button>

  <!-- ❌ 用 index 做 key -->
  <div v-for="(item, index) in list" :key="index">
    <input type="text" placeholder="输入内容" />
    <span>{{ item.name }}</span>
  </div>
</template>
```

**运行现象**（先在三个 input 中分别输入 a、b、c，然后点击"插入赵六"）：

```
插入前：                       插入后（用 index 做 key）：
┌─────────────────────┐       ┌─────────────────────┐
│ [a]  张三  (key=0)   │       │ [a]  赵六  (key=0)   │ ← input 还是 a！
│ [b]  李四  (key=1)   │  →    │ [b]  张三  (key=1)   │ ← input 还是 b！
│ [c]  王五  (key=2)   │       │ [c]  李四  (key=2)   │ ← input 还是 c！
└─────────────────────┘       │ []   王五  (key=3)   │ ← 新建的空 input
                              └─────────────────────┘
```

**问题分析**：
- 用 `index` 做 key，插入后位置 0、1、2 的 key 还是 0、1、2，Vue 认为这些 DOM 节点是"同一个"，就地复用。
- 于是 input（非受控的 DOM 状态）留在了原 DOM 位置，而文字（张三→赵六）被更新。
- **导致输入内容与数据错位**。

### 案例 2：性能问题

用 `index` 做 key，在头部插入一个元素时，Vue 会**更新几乎所有节点的内容**（因为每个位置的 key 没变，但数据变了），而用 `id` 做 key 只需挂载 1 个 + 移动若干个。

| 操作 | 用 index | 用 id |
|------|---------|-------|
| 头部插入 1 个元素 | 更新 N 个节点内容 | 新建 1 个 + 移动 |
| 列表反转 | 更新所有节点 | 仅移动，不更新内容 |
| 大列表排序 | 全部重新渲染 | 最小化移动 |

### 案例 3：组件状态/生命周期异常

```vue
<!-- 每个子组件有内部状态（如定时器、动画进度） -->
<MyItem
  v-for="(item, index) in list"
  :key="index"
  :data="item"
/>
```

用 `index` 做 key 时，当列表顺序变化，Vue 会复用"位置相同"的组件实例，把新数据传给它——但组件的内部状态（如 `onMounted` 时启动的定时器、子组件的 data）属于旧数据，导致状态与数据不匹配。

### 什么时候可以用 index？

只有在**列表永远不会改变顺序**（不新增、不删除、不排序）且**列表项是纯展示、无内部状态**时，用 `index` 才不会出问题。但这很难保证，所以**始终推荐用唯一稳定的 id**。

---

## 七、key 的取值规则

### 1. 唯一性

`key` 必须在**兄弟节点之间唯一**（不需要全局唯一，只要同一层级的兄弟节点间不重复即可）。

```vue
<!-- ❌ key 重复，Vue 会警告 -->
<div v-for="item in list" :key="1">...</div>

<!-- ✅ 兄弟节点间 key 唯一 -->
<div v-for="item in list" :key="item.id">...</div>
```

### 2. 稳定性

`key` 必须**稳定**——同一个数据项在多次渲染中应保持相同的 `key`，不能每次渲染都变。

```vue
<!-- ❌ 用随机数：每次渲染 key 都变，Vue 认为全是新节点，全部销毁重建，性能极差 -->
<div v-for="item in list" :key="Math.random()">...</div>

<!-- ❌ 用时间戳：同上问题 -->
<div v-for="item in list" :key="Date.now()">...</div>

<!-- ✅ 用数据的唯一且稳定的标识 -->
<div v-for="item in list" :key="item.id">...</div>
```

### 3. 用基础类型（不要用对象）

Vue 官方明确：**`key` 绑定的值期望是一个基础类型的值，例如字符串或 number 类型。不要用对象作为 `v-for` 的 key。**

> ⚠️ **纠正一个 Vue 2 时代的误区**：旧说法"对象做 key 会变成 `[object Object]`"只对 **Vue 2** 成立（Vue 2 会把 key 字符串化）。**Vue 3 用 `Map` 存 key，不会字符串化**——对象 key 改为按**引用**比较。危害因此变成了：一旦列表数据替换为新引用，key 全部失配、整列表重建。所以结论不变——**别用对象做 key**，用它的 `id`。

```vue
<!-- ❌ Vue 3 中：对象按引用比较，列表替换后全部失配重建 -->
<div v-for="item in list" :key="item">{{ item.name }}</div>

<!-- ✅ 用对象上的唯一基础类型属性 -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

### 4. 复合 key

如果单个字段不唯一，可用多个字段组合成唯一 key：

```vue
<!-- 用 type + id 组合，避免不同类型数据 id 冲突 -->
<div v-for="item in mixedList" :key="`${item.type}_${item.id}`">
  {{ item.name }}
</div>
```

> 💡 注意：复合 key 最终是**字符串拼接**（基础类型），符合 Vue 3 的要求。

---

## 八、Vue 2 与 Vue 3 的 key 差异（对比）

| 维度 | Vue 2 | **Vue 3** |
|------|------|----------|
| key 存储结构 | 普通对象 `{}` | **`Map`**（`keyToNewIndexMap`） |
| key 是否字符串化 | 会（`toString`） | **不会** |
| 数字 `1` vs 字符串 `"1"` | 碰撞（同为 `"1"`） | **不碰撞**（不同 key） |
| 对象作为 key | 变 `[object Object]` 全碰撞 | 按引用比较，失配则重建 |
| 列表 Diff 算法 | 双端比较（双端 Diff） | **快速 Diff + 最长递增子序列（LIS）** |
| `v-if`/`v-else` 分支 | 需手动加 key 防止复用 | **自动生成唯一 key**，无需手动加 |
| 手动给分支加 key | 可用相同 key 强制复用 | **必须唯一**（破坏性变更） |
| `<template v-for>` 的 key | 放在子元素上 | **放在 `<template>` 标签上**（破坏性变更） |
| `v-for` 不写 key | 运行时会警告 | 不强制报错（官方"推荐"提供） |
| 组件生命周期钩子 | `mounted`/`destroyed` 等 | `onMounted`/`onUnmounted`（重建即重新触发） |

> 来源：[Vue 3 迁移指南 · key Attribute](https://v3-migration.vuejs.org/breaking-changes/key-attribute.html)

---

## 九、常见问题与陷阱

### 陷阱 1：忘记写 key

```vue
<!-- ❌ 没写 key：走"就地更新"，列表顺序变化时可能出现状态错乱 -->
<div v-for="item in list">{{ item.name }}</div>
```

**修正**：始终为 `v-for` 项加上稳定、唯一的 `key`（除非刻意追求就地更新的性能）。

### 陷阱 2：key 重复

```vue
<!-- ❌ 如果 list 里有重复的 id，key 就重复，Vue 警告 -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>

<!-- [Vue warn] Duplicate keys detected: '1'. This may cause an update error. -->
```

**修正**：确保数据源的唯一性，或用复合 key。

### 陷阱 3：用对象本身做 key（Vue 3 行为已变）

```vue
<!-- ❌ Vue 3 中：对象按引用比较，列表数据替换后全部失配、整列表重建 -->
<div v-for="item in list" :key="item">{{ item.name }}</div>
```

**修正**：用对象的某个唯一基础类型属性，如 `item.id`。

### 陷阱 4：`<template v-for>` 的 key 放错位置

```vue
<!-- ❌ Vue 3 中：把 key 放在子元素上是错的（这是 Vue 2 写法） -->
<template v-for="item in list">
  <div :key="item.id">{{ item.name }}</div>
</template>

<!-- ✅ Vue 3：key 放在 <template> 上 -->
<template v-for="item in list" :key="item.id">
  <div>{{ item.name }}</div>
</template>
```

### 陷阱 5：还在用 Vue 2 的套路给 `v-if`/`v-else` 加 key

```vue
<!-- ❌ Vue 3 中：分支会自动生成 key，手动加 key 不仅多余，
        若多个分支用了相同 key 还会冲突 -->
<div v-if="ok" key="same">A</div>
<div v-else key="same">B</div>

<!-- ✅ Vue 3：要么不加 key，要么保证每个分支唯一 -->
<div v-if="ok">A</div>
<div v-else>B</div>
```

### 陷阱 6：`<TransitionGroup>` 子元素没写 key

```vue
<!-- ❌ 会报错 [TransitionGroup] children must be keyed -->
<TransitionGroup tag="ul">
  <li v-for="item in items">{{ item }}</li>
</TransitionGroup>

<!-- ✅ 每个直接子元素有唯一稳定的 key -->
<TransitionGroup tag="ul">
  <li v-for="item in items" :key="item.id">{{ item }}</li>
</TransitionGroup>
```

### 陷阱 7：把 key 当成普通 prop 传递

`key` 是**特殊属性**，不会被当作普通 attribute 传给组件的 props，而是被 Vue 内部消费。子组件**无法**通过 props 接收到 `key`。

```vue
<!-- Child 组件里 defineProps 拿不到 key -->
<MyComponent :key="item.id" />

<!-- Child.vue -->
<script setup>
const props = defineProps<{ /* 这里没有 key */ }>()
</script>
```

### 陷阱 8：滥用 key 强制重渲染

```vue
<!-- ❌ 不要为了"刷新"而频繁改变整个列表的 key -->
<List :key="Date.now()" />
```

这会让整个列表每次都销毁重建，性能极差。只在确实需要重置时才用。

---

## 十、面试常见问题

### Q1：Vue 3 中 key 的作用是什么？

`key` 是 Vue 3 虚拟 DOM 节点（VNode）的**唯一身份标识**，作为 Diff 算法追踪节点身份的"提示"。它的核心作用是帮助 Vue 3 在 Diff 过程中**正确、高效地复用和更新 DOM**：通过 `key` 判断新旧节点是否"同一个"（`isSameVNodeType`：`type` 相同 + `key` 相同），从而决定是复用（只 patch 属性）还是销毁重建。在 `v-for` 中，`key` 能保证列表项的 DOM 和状态正确跟踪数据，避免顺序变化时的状态错乱和性能浪费。

### Q2：为什么 v-for 中不能用 index 做 key？

因为当列表顺序变化（插入、删除、排序）时，`index` 虽然稳定，但它对应的**数据变了**。这会导致两个问题：① **状态错乱**——如 input 输入内容、子组件内部状态会跟着 DOM 位置走，而不是跟着数据走；② **性能浪费**——本来只需移动少量节点，却退化为更新大量节点内容。应使用数据**唯一且稳定**的标识（如 `id`）。

### Q3：key 是怎么影响 Vue 3 的 Diff 算法的？

没有 `key` 时，Vue 3 走 `patchUnkeyedChildren`（就地更新 / 按索引 patch），不移动 DOM，容易出错且低效。有 `key` 时，走 `patchKeyedChildren` 快速 Diff：先同步头尾公共前缀/后缀，中间未知部分用 `Map`（`keyToNewIndexMap`）按 `key` 匹配，再借助**最长递增子序列（LIS）**找出无需移动的节点，**最小化 DOM 操作**。`key` 是 Diff 算法正确高效工作的前提。

### Q4：key 应该用什么值？

用**唯一且稳定**的**基础类型**（字符串 / number）：优先使用后端数据的 `id`（数据库主键）；没有 id 时在数据创建时生成唯一 id（如 `crypto.randomUUID()`）。要求是：兄弟节点间唯一、同一条数据多次渲染 key 不变。不能用 `Math.random()`、`Date.now()`（每次都变），也不能用对象本身（Vue 3 中按引用比较，列表替换后会全部失配重建）。

### Q5：Vue 3 中对象做 key 会变成 "[object Object]" 吗？

**不会**。这是 Vue 2 的行为（Vue 2 用普通对象存 key，会 `toString`）。**Vue 3 用 `Map`（SameValueZero 相等）存 key，不会字符串化**——对象 key 按引用比较。所以 Vue 3 中对象做 key 的危害不是"全部碰撞成同一个字符串"，而是"一旦数据替换为新引用，key 全部失配、整列表重建"。结论仍然是：**不要用对象做 key**，用它的 `id`。

### Q6：没有 key 时 Vue 3 会怎样？

Vue 3 采用**就地更新**（in-place patch）策略——按索引复用 DOM 节点，只更新内容、不移动 DOM。这会导致：① 列表顺序变化时组件内部状态（输入框内容、子组件状态）错乱；② 频繁的 DOM 更新，性能差。与 Vue 2 不同，Vue 3 不会因为没写 key 而强制运行时报错，但官方强烈推荐提供 key。

### Q7：Vue 3 与 Vue 2 的 key 有哪些差异？

- **存储**：Vue 3 用 `Map`（不字符串化），Vue 2 用普通对象（会字符串化）；故 Vue 3 中数字 `1` 与字符串 `"1"` 不再碰撞。
- **Diff**：Vue 3 是快速 Diff + 最长递增子序列（LIS）；Vue 2 是双端比较。
- **`v-if`/`v-else`**：Vue 3 自动生成 key（无需手动加），手动加则必须唯一；Vue 2 需手动加 key 控制复用。
- **`<template v-for>`**：Vue 3 的 key 放在 `<template>` 上；Vue 2 放在子元素上。

### Q8：key 重复会怎样？

Vue 会警告 `Duplicate keys detected`，并可能导致更新错误（Vue 无法正确判断哪个节点该复用，行为不可预期）。应保证兄弟节点间 key 唯一。

### Q9：Vue 3 的 `<TransitionGroup>` 对 key 有什么要求？

`<TransitionGroup>` 的**每个直接子元素都必须有唯一、稳定的 key**，否则会报 `[TransitionGroup] children must be keyed`。动画依赖 key 追踪元素的进入/离开/移动，所以这里**绝不能用 index 做 key**。

### Q10：什么时候可以用 index 做 key？

只有当列表**永不改变顺序**（不增、不删、不排序）且列表项**纯展示、无内部状态**时，用 index 才安全。但实践中很难保证，所以推荐始终用唯一稳定的 id。

---

## 十一、总结

| 要点 | 核心结论 |
|------|---------|
| **key 的本质** | Vue 3 VNode 的唯一身份标识，Diff 算法的"提示" |
| **判断"同一个节点"** | `isSameVNodeType`：type 相同 + key 相同 |
| **没有 key** | 走 `patchUnkeyedChildren`，就地更新，易错且低效 |
| **有 key** | 走 `patchKeyedChildren`，基于 key 匹配，最小化 DOM 操作 |
| **Vue 3 存储 key** | 用 `Map`，**不字符串化**（区别于 Vue 2） |
| **Vue 3 Diff 核心** | 最长递增子序列（LIS），DOM 移动次数最少 |
| **key 的要求** | 唯一（兄弟间）+ 稳定（不随渲染变）+ 基础类型 |
| **最佳取值** | 数据的 id（数据库主键）、`crypto.randomUUID()` |
| **不能用** | index（顺序变化时出问题）、`Math.random()`、对象 |
| **Vue 3 变更** | `<template v-for>` 的 key 放 template 上；`v-if`/`v-else` 自动生成 key；`TransitionGroup` 子元素必须 key |
| **使用场景** | v-for、`<template v-for>`、`<router-view>`、`<TransitionGroup>`、强制重渲染 |

**记住五句话**：

1. **`key` 是 Vue 3 节点的身份证号，帮 Diff 算法区分"哪个是哪个"，正确高效地复用和更新 DOM。**
2. **`key` 必须唯一且稳定，用基础类型（字符串/number）——优先数据的 `id`，绝不用 `index`（顺序变化时会状态错乱 + 性能浪费）。**
3. **没有 `key` 时 Vue 3 就地更新，容易出错；有 `key` 时走快速 Diff（最长递增子序列），最少 DOM 操作。**
4. **Vue 3 用 `Map` 存 key、不字符串化——数字 `1` 与字符串 `"1"` 不再碰撞；对象 key 按引用比较，故不要用对象做 key。**
5. **Vue 3 有破坏性变更：`<template v-for>` 的 key 放在 `<template>` 上；`v-if`/`v-else` 自动生成 key 无需手动加；`<TransitionGroup>` 子元素必须有 key。**
