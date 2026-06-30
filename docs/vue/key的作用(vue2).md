# Vue 2 中 key 的作用完全指南

> 本文档**专注讲解 Vue 2** 中 `key` 属性的作用、底层双端 Diff 原理、使用场景与最佳实践，并与 Vue 3 做系统对比。
>
> 它是 [《Vue 3 中 key 的作用完全指南》](./key的作用(vue3).md) 的姊妹篇。如果你在用 **Vue 2（选项式 API）**，请以本文为准；两份文档的最后一节都附有 Vue 2 / Vue 3 差异对比表。

> 📖 **官方文档（Vue 2）**
> - [列表渲染 · 用 key 维护状态](https://v2.cn.vuejs.org/v2/guide/list.html#%E7%BB%B4%E6%8C%A4%E7%8A%B6%E6%80%81)
> - [特殊的 key 属性（API）](https://v2.cn.vuejs.org/v2/api/#key)
> - [条件渲染 · 用 key 管理可复用的元素](https://v2.cn.vuejs.org/v2/guide/conditional.html#%E7%94%A8-key-%E7%AE%A1%E7%90%86%E5%8F%AF%E5%A4%8D%E7%94%A8%E7%9A%84%E5%85%83%E7%B4%A0)

## 目录

- [一、概述](#一概述)
- [二、key 的核心原理（Vue 2 视角）](#二key-的核心原理vue-2-视角)
- [三、Vue 2 中 key 的关键特性](#三vue-2-中-key-的关键特性)
- [四、key 的使用场景](#四key-的使用场景)
- [五、Vue 2 的 Diff 算法深入（双端比较）](#五vue-2-的-diff-算法深入双端比较)
- [六、为什么不能用 index 做 key（经典案例）](#六为什么不能用-index-做-key经典案例)
- [七、key 的取值规则](#七key-的取值规则)
- [八、Vue 2 与 Vue 3 的 key 差异（对比）](#八vue-2-与-vue-3-的-key-差异对比)
- [九、常见问题与陷阱](#九常见问题与陷阱)
- [十、面试常见问题](#十面试常见问题)
- [十一、总结](#十一总结)

---

## 一、概述

在 Vue 2 中，`key` 是一个**特殊的 attribute**，用于标识虚拟 DOM（VNode）节点的**唯一身份**。它最常见的用途是配合 `v-for` 列表渲染，也用于 `v-if`/`v-else` 控制节点复用、强制组件重渲染等。

```vue
<!-- key 最常见的用法：配合 v-for -->
<div v-for="item in list" :key="item.id">
  {{ item.name }}
</div>
```

> **通俗理解**：`key` 就像每个 DOM 节点的**身份证号**。当列表数据变化（新增、删除、排序）时，Vue 2 拿着"身份证号"去比对：哪些节点是老朋友（复用）、哪些是新来的（创建）、哪些走了（删除）。没有身份证号，Vue 只能"按位置瞎猜"，容易出错。

`key` 的核心价值是：**帮助 Vue 2 高效、正确地复用和更新 DOM 节点**。

> 💡 **一句话定位**：`key` 是 Vue 2 虚拟 DOM 算法（patch / Diff）用来"追踪节点身份"的提示（hint）。它本身不是普通 attribute，不会出现在真实 DOM 上，而是被 Vue 内部消费。

---

## 二、key 的核心原理（Vue 2 视角）

### 1. Vue 2 的渲染流程

Vue 2 更新视图的过程是：**数据变化 → 生成新的虚拟 DOM（VNode）→ 与旧 VNode 进行 patch 比对 → 只更新差异部分的真实 DOM**。

```
数据变化（响应式 setter 触发，进入调度队列）
   │
   ▼
重新执行渲染函数，生成新 VNode
   │
   ▼
patch 算法：新 VNode 与旧 VNode 比对（patchVnode / updateChildren）
   │
   ▼
找到差异 → 最小化 DOM 操作（插入/删除/打补丁/移动）
```

> ⚠️ **注意**：Vue 2 的响应式基于 `Object.defineProperty`（getter/setter + 依赖收集）。`key` 本身不参与响应式，但它是 patch 阶段判断"节点是否复用"的关键。

### 2. key 是 VNode 的"身份证"——`sameVnode` 判断

在 Vue 2 源码中，每个 VNode 对象都有 `key` 属性（即 `vnode.key`）。patch 时，Vue 2 用 `sameVnode(a, b)` 判断**新旧两个节点是不是"同一个节点"**：

```js
// Vue 2 源码（core/vdom/patch.js）简化版
function sameVnode(a, b) {
  return (
    a.key === b.key &&        // ① key 相同（严格相等 ===）
    a.asyncFactory === b.asyncFactory && (
      a.tag === b.tag &&       // ② 标签名相同
      a.isComment === b.isComment &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b)      // ③ input 的 type 相同
    )
  )
}
```

```
Vue 2 判断"同一个节点"（sameVnode）的核心条件：
┌──────────────────────────────────────────────────────────┐
│  1. key 相同（a.key === b.key，严格相等）                │
│  2. tag（标签）相同                                       │
│  3. input 的 type 相同（针对 <input> 的额外约束）        │
│                                                           │
│  → 都满足：Vue 复用该 DOM 节点（只 patchVnode 更新属性） │
│  → 任一不满足：Vue 销毁旧节点、创建新节点                │
└──────────────────────────────────────────────────────────┘
```

> 💡 **关键陷阱**：当 `key` 都没写时，新旧节点的 `key` 都是 `undefined`，而 `undefined === undefined` 为 `true`——于是 Vue 2 认为"key 相同"，只要 tag 相同就复用。这正是没有 key 时"就地复用"的根源。

### 3. 复用 vs 重建

| 情况 | Vue 2 的处理 | 结果 |
|------|-----------|------|
| 节点被识别为"同一个"（`sameVnode` 为 true） | **复用** DOM，`patchVnode` 只更新变化的属性 | 性能高，保留组件状态 |
| 节点无法匹配 | **销毁旧节点（触发 `destroyed`）、创建新节点（触发 `mounted`）** | 性能低，组件状态丢失 |

---

## 三、Vue 2 中 key 的关键特性

这一节是理解 Vue 2 中 `key` 的核心，其中"key 会被字符串化"是 Vue 2 区别于 Vue 3 的标志性细节。

### 特性 1：没有 key 时"就地复用"（in-place patch）

当 `v-for` 没有 `key` 时，所有节点 `key` 都是 `undefined`，`sameVnode` 仅靠 tag 判断命中——Vue 2 表现为**就地复用**：不管数据顺序怎么变，它都按位置逐个 patch、**不移动 DOM**。

> 官方文档原文（Vue 2）：默认模式下，Vue 会"就地复用"已有元素而非从头渲染。默认策略是高效的，但**只适用于列表渲染输出的结果不依赖子组件状态或临时 DOM 状态（如表单输入值）**。

### 特性 2：有 key 时走双端 Diff

写了 `key`，Vue 2 才会启用完整的双端 Diff（见第五节），根据 `key` 匹配新旧节点、最小化 DOM 移动，并保证组件状态正确跟随数据。

### 特性 3：Vue 2 的 key 会被"字符串化"（与 Vue 3 的核心差异）⭐

这是 Vue 2 最容易踩坑、面试常考的点。Vue 2 判断 key 分两层，其中**兜底查找层会把 key 字符串化**：

#### 第一层：双端比较（`sameVnode`）—— 用 `===` 严格比较

```js
a.key === b.key   // 严格相等；对象 key 在这里是引用比较
```

- 对象 key：按**引用**比较，两个不同的对象引用 → 不相等。
- 数字 `1` 与字符串 `"1"`：`1 === "1"` 为 `false` → 不相等。

#### 第二层：兜底查找（`createKeyToOldIdx`）—— key 作普通对象属性名，被 `toString`

当双端四种比较都没命中，Vue 2 会用**普通对象 `{}`** 建立一张"key → 旧索引"映射：

```js
// Vue 2 源码（core/vdom/patch.js）简化版
function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {}
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i].key
    if (isDef(key)) map[key] = i   // ⚠️ key 作为对象属性名，会被 toString 字符串化
  }
  return map
}
```

这里 `map[key] = i` 会把 key **字符串化**，于是：

| key 值 | 字符串化后 | 后果 |
|------|-----------|------|
| 对象 `{ id: 1 }` 和 `{ id: 2 }` | 都变 `"[object Object]"` | **全部碰撞**，映射互相覆盖 |
| 数字 `1` 与字符串 `"1"` | 都变 `"1"` | **碰撞** |
| 布尔 `true` | `"true"` | 与字符串 `"true"` 碰撞 |

> 💡 **结论**：
> - Vue 2 中**数字 `1` 和字符串 `"1"` 会碰撞**（都变 `"1"`），而 **Vue 3 用 `Map`（SameValueZero）不会碰撞**。
> - Vue 2 中**对象作 key 会全部变成 `[object Object]` 而碰撞**；Vue 3 中对象按引用比较、不字符串化（危害变成"列表替换后引用变化→失配重建"）。
> - 无论 Vue 2 还是 Vue 3，**都不要用对象做 key**——请用对象上的原始类型属性（如 `item.id`）。

```vue
<!-- ❌ Vue 2 中用对象做 key：兜底查找时全部变 "[object Object]"，映射错乱 -->
<div v-for="item in list" :key="item">{{ item.name }}</div>

<!-- ✅ 用原始类型（id）做 key -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

### 特性 4：key 必须是原始类型

Vue 2 官方建议 `key` 使用**字符串或数字**等原始类型。对象、数组等因引用比较 / 字符串化问题，会导致 diff 失效。

---

## 四、key 的使用场景

> 下文示例统一采用 Vue 2 的**选项式 API**（`data` / `methods` / `mounted` 等）。

### 1. `v-for` 列表渲染（最常见、最重要）

```vue
<template>
  <!-- ✅ 列表渲染时，为每个节点提供稳定、唯一的 key -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: '苹果' },
        { id: 2, name: '香蕉' }
      ]
    }
  }
}
</script>
```

> ⚠️ **缺少 key 的提示**：Vue 2 的模板编译器会对缺少 `:key` 的 `v-for` 给出编译警告（用运行时编译器时显示在浏览器控制台，用 vue-loader 预编译时显示在构建/IDE）：
> ```
> Elements in iteration expect to have 'v-bind:key' directives.
> ```
> 此外 ESLint 规则 [`vue/require-v-for-key`](https://eslint.vuejs.org/rules/require-v-for-key) 也会在开发时报错。运行时（patch）阶段则主要针对**重复 key** 给出警告 `Duplicate keys detected`。

### 2. `v-if` / `v-else` 用 key 控制复用（Vue 2 经典场景）⭐

> 这是 Vue 2 区别于 Vue 3 的重要用法。Vue 2 中切换**相同标签**的不同分支时，由于 tag 相同、key 都没写，`sameVnode` 为 true，Vue 会**复用同一个 DOM**，导致表单输入等内容残留——需要**手动加 key** 强制重建。

```vue
<template>
  <div>
    <button @click="toggle">切换登录方式</button>

    <!-- ❌ 不加 key：Vue 2 复用同一个 <input>，切换后输入内容残留 -->
    <div v-if="loginType === 'username'">
      <label>用户名</label>
      <input placeholder="输入用户名" />
    </div>
    <div v-else>
      <label>邮箱</label>
      <input placeholder="输入邮箱" />
    </div>

    <!-- ✅ 加 key：切换分支时 Vue 销毁旧的、创建新的，input 内容自动清空 -->
    <div v-if="loginType === 'username'">
      <label>用户名</label>
      <input placeholder="输入用户名" key="username-input" />
    </div>
    <div v-else>
      <label>邮箱</label>
      <input placeholder="输入邮箱" key="email-input" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { loginType: 'username' }
  },
  methods: {
    toggle() {
      this.loginType = this.loginType === 'username' ? 'email' : 'username'
    }
  }
}
</script>
```

> 💡 **对比 Vue 3**：Vue 3 会为 `v-if`/`v-else` 分支**自动生成唯一 key**，不再需要手动加。所以这个"手动加 key 控制 v-if/v-else 复用"的套路是 **Vue 2 专属**（详见第八节）。

### 3. `<template v-for>` 的 key 放在子元素上（Vue 2 写法）⭐

Vue 2 中 `<template>` 标签**不能**绑定 key，必须把 key 放在它的每个**子元素**上（这与 Vue 3 恰恰相反）：

```vue
<!-- ✅ Vue 2 写法：key 放在 <template> 的子元素上 -->
<template v-for="item in list">
  <div :key="'d-' + item.id">{{ item.name }}</div>
  <span :key="'s-' + item.id">{{ item.desc }}</span>
</template>

<!-- ❌ Vue 3 才会把 key 放在 <template> 上，Vue 2 这样写无效 -->
<template v-for="item in list" :key="item.id"> ... </template>
```

> 💡 这也是 Vue 2 → Vue 3 升级时**最容易踩的坑**之一（见第八节对比表）。

### 4. `<router-view>` 强制路由组件重新渲染

```vue
<!-- 路由切换时强制组件重新创建（触发完整生命周期 mounted） -->
<router-view :key="$route.fullPath" />
```

适用场景：从 `/user/1` 跳到 `/user/2`（同一组件、不同参数），希望组件重新初始化而不是复用。

### 5. `<transition-group>` 的子元素必须有唯一 key

`<transition-group>` 用于列表的进入/离开/移动过渡动画，它的**每个直接子元素都必须有唯一、稳定的 key**：

```vue
<template>
  <!-- ✅ Vue 2 transition-group：每个子元素有唯一稳定的 key -->
  <transition-group name="list" tag="ul">
    <li v-for="item in items" :key="item.id">{{ item.text }}</li>
  </transition-group>
</template>
```

> 💡 这里**绝不能用 `index` 做 key**：动画依赖 key 追踪"哪个元素是哪个"，用 index 会让移动动画完全错乱。

### 6. 强制重新渲染某个组件

改变组件的 `key` 会让 Vue 2 销毁并重建它（触发 `beforeDestroy`/`destroyed` → 重新 `created`/`mounted`）：

```vue
<template>
  <div>
    <!-- 改变 key 会销毁并重建组件 -->
    <MyComponent :key="componentKey" />
    <button @click="reload">重新加载组件</button>
  </div>
</template>

<script>
export default {
  data() {
    return { componentKey: 0 }
  },
  methods: {
    reload() {
      this.componentKey++   // 组件重新创建
    }
  }
}
</script>
```

---

## 五、Vue 2 的 Diff 算法深入（双端比较）

Vue 2 的列表 Diff 叫**双端比较（Double-Ended Diff）**，核心函数是 `updateChildren`。`key` 是它正确高效工作的前提。

### 1. 没有 key：就地复用

当新旧子节点**都没有 key** 时，由于 `key` 都是 `undefined`，`sameVnode` 仅靠 tag 命中，Vue 2 按位置逐个 `patchVnode`，能不移动 DOM 就不移动。代价是——列表顺序变化时，节点内部状态会"串位"。

```
旧数据：[A, B, C]        旧 DOM：[div-A, div-B, div-C]

在头部插入 X，新数据：[X, A, B, C]

【没有 key，就地复用】
Vue 2 认为位置还是原来的位置，只更新内容：
  位置 0: div-A 的内容改成 X   → div-X（复用了 A 的 DOM）
  位置 1: div-B 的内容改成 A   → div-A
  位置 2: div-C 的内容改成 B   → div-B
  位置 3: 新建 div-C
→ 结果：3 次 patch + 1 次新建（本来只需要 1 次新建！）
```

### 2. 有 key：`updateChildren` 双端 Diff 五步法⭐

有了 `key`，Vue 2 对新旧 children 各维护**两个指针**：`oldStartIdx`/`oldEndIdx`、`newStartIdx`/`newEndIdx`，每轮循环按优先级尝试 **4 种头尾命中 + 1 种 key map 兜底**：

```
旧: [oldStart → ... ← oldEnd]
新: [newStart → ... ← newEnd]

每轮循环依次尝试命中：
① sameVnode(旧头, 新头)  → 命中：patch + 指针后移
② sameVnode(旧尾, 新尾)  → 命中：patch + 指针前移
③ sameVnode(旧头, 新尾)  → 命中：patch + 旧头节点移到尾部
④ sameVnode(旧尾, 新头)  → 命中：patch + 旧尾节点移到头部
⑤ 以上都没命中           → 用 key map（createKeyToOldIdx）O(1) 查找
```

对应源码（简化）：

```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  if (isUndef(oldStartVnode)) { /* 该节点已移动走，跳过 */ }
  else if (sameVnode(oldStartVnode, newStartVnode)) {           // ① 新旧头
    patchVnode(oldStartVnode, newStartVnode)
    oldStartVnode = oldCh[++oldStartIdx]
    newStartVnode = newCh[++newStartIdx]
  } else if (sameVnode(oldEndVnode, newEndVnode)) {             // ② 新旧尾
    patchVnode(oldEndVnode, newEndVnode)
    oldEndVnode = oldCh[--oldEndIdx]
    newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldStartVnode, newEndVnode)) {           // ③ 旧头 vs 新尾
    patchVnode(oldStartVnode, newEndVnode)
    insertBefore(parent, oldStartVnode.elm, oldEndVnode.elm.nextSibling) // 移到尾后
    oldStartVnode = oldCh[++oldStartIdx]
    newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldEndVnode, newStartVnode)) {           // ④ 旧尾 vs 新头
    patchVnode(oldEndVnode, newStartVnode)
    insertBefore(parent, oldEndVnode.elm, oldStartVnode.elm)    // 移到头前
    oldEndVnode = oldCh[--oldEndIdx]
    newStartVnode = newCh[++newStartIdx]
  } else {                                                      // ⑤ key map 兜底
    if (isUndef(oldKeyToIdx)) {
      oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
    }
    idxInOld = oldKeyToIdx[newStartVnode.key]   // O(1) 查找（注意 key 此处被字符串化）
    if (isUndef(idxInOld)) {
      createElm(newStartVnode, ...)             // 旧中没有 → 新建
    } else {
      vnodeToMove = oldCh[idxInOld]
      if (sameVnode(vnodeToMove, newStartVnode)) {
        patchVnode(vnodeToMove, newStartVnode)
        oldCh[idxInOld] = undefined             // 标记已处理
        insertBefore(parent, vnodeToMove.elm, oldStartVnode.elm) // 移动
      } else {
        createElm(newStartVnode, ...)           // key 相同但节点不同 → 新建
      }
    }
    newStartVnode = newCh[++newStartIdx]
  }
}
// 循环结束：处理剩余
if (oldStartIdx > oldEndIdx) {
  addVnodes(...)    // 旧先耗尽 → 批量添加新节点
} else if (newStartIdx > newEndIdx) {
  removeVnodes(...) // 新先耗尽 → 批量删除旧节点
}
```

> 💡 第 ⑤ 步的 `oldKeyToIdx[newStartVnode.key]` 正是第三节所说的 **key 字符串化发生处**——这也是为什么 Vue 2 中对象 key、数字/字符串 key 会碰撞的根源。

### 3. 一个完整例子走一遍

```
旧：[A, B, C, D]   （key: a,b,c,d）
新：[D, A, B, C]   （key: d,a,b,c）  ← 把 D 移到了头部

① 旧头 a ≠ 新头 d → 不命中
② 旧尾 d ≠ 新尾 c → 不命中
③ 旧头 a ≠ 新尾 c → 不命中
④ 旧尾 d == 新头 d → ✅ 命中！把 D 移到头部，oldEnd 前移、newStart 后移
   现在旧:[A,B,C] 新:[A,B,C]
① 旧头 a == 新头 a → ✅ 命中，patch
① 旧头 b == 新头 b → ✅ 命中，patch
① 旧头 c == 新头 c → ✅ 命中，patch
→ 全程只移动 1 次 DOM（移动 D），其余原地 patch
```

> 若没有 key，同样的操作会被迫逐位置 patch（D 的内容覆盖 A、A 覆盖 B、B 覆盖 C、末尾新建），既低效又会串状态。

### 4. 双端 Diff 的优势

- 对**头尾反转、头部/尾部插入**这类常见操作命中率高，能直接用 `insertBefore` 完成移动，DOM 操作次数少。
- 配合第 ⑤ 步的 key map 兜底，整体复杂度 O(n)。

> 💡 **与 Vue 3 的差距**：双端 Diff 在"中间乱序"较多时移动次数不如 Vue 3 的快速 Diff（最长递增子序列 LIS）。详见第八节对比。

---

## 六、为什么不能用 index 做 key（经典案例）

这是最高频的 `key` 面试题。核心原因：**当列表顺序变化时，index 是稳定的，但它对应的数据却变了**——这违背了"key 应稳定标识同一条数据"的原则。

### 案例 1：列表头部插入，导致状态错乱

```vue
<template>
  <div>
    <button @click="addFirst">在头部插入赵六</button>

    <!-- ❌ 用 index 做 key -->
    <div v-for="(item, index) in list" :key="index">
      <input type="text" placeholder="输入内容" />
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' }
      ]
    }
  },
  methods: {
    addFirst() {
      this.list.unshift({ id: 4, name: '赵六' })   // 在头部插入新数据
    }
  }
}
</script>
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
- 用 `index` 做 key，插入后位置 0、1、2 的 key 还是 0、1、2，Vue 2 认为这些 DOM 节点是"同一个"，就地复用。
- 于是 input（非受控的 DOM 状态）留在了原 DOM 位置，而文字（张三→赵六）被更新。
- **导致输入内容与数据错位**。

### 案例 2：性能问题

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

用 `index` 做 key 时，当列表顺序变化，Vue 2 会复用"位置相同"的组件实例，把新数据传给它——但组件的内部状态（如 `mounted` 时启动的定时器、组件 `data`）属于旧数据，导致状态与数据不匹配。

### 什么时候可以用 index？

只有在**列表永远不会改变顺序**（不新增、不删除、不排序）且**列表项是纯展示、无内部状态**时，用 `index` 才不会出问题。但这很难保证，所以**始终推荐用唯一稳定的 id**。

---

## 七、key 的取值规则

### 1. 唯一性

`key` 必须在**兄弟节点之间唯一**（不需要全局唯一，只要同一层级的兄弟节点间不重复即可）。

```vue
<!-- ❌ key 重复，Vue 运行时会警告 Duplicate keys detected -->
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

### 3. 用原始类型（字符串 / 数字）

Vue 2 中 `key` 应使用**字符串或数字**等原始类型。不要用对象、数组：

```vue
<!-- ❌ Vue 2 中：对象在兜底查找时会变 "[object Object]" 而碰撞 -->
<div v-for="item in list" :key="item">{{ item.name }}</div>

<!-- ✅ 用对象上的唯一原始类型属性 -->
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

---

## 八、Vue 2 与 Vue 3 的 key 差异（对比）

> 姊妹篇：[《Vue 3 中 key 的作用完全指南》](./key的作用(vue3).md)

| 维度 | **Vue 2** | Vue 3 |
|------|----------|------|
| key 存储结构（兜底查找） | 普通对象 `{}` | **`Map`**（`keyToNewIndexMap`） |
| key 是否字符串化 | **会**（`createKeyToOldIdx` 的 `map[key]=i`，key 作属性名 `toString`） | **不会** |
| 数字 `1` vs 字符串 `"1"` | **碰撞**（同为 `"1"`） | **不碰撞**（SameValueZero） |
| 对象作为 key | 变 `[object Object]` 全碰撞（兜底查找层）；sameVnode 层按引用比较 | 按**引用**比较，失配则重建 |
| 列表 Diff 算法 | **双端比较（双端 Diff）**：4 种头尾命中 + key map 兜底 | **快速 Diff + 最长递增子序列（LIS）** |
| `v-if`/`v-else` 分支 | **需手动加 key** 防止 DOM 复用（input 残留问题） | **自动生成唯一 key**，无需手动加 |
| 手动给分支加 key | 可用相同 key 强制复用 | **必须唯一**（破坏性变更） |
| `<template v-for>` 的 key | **放在子元素上** | **放在 `<template>` 标签上**（破坏性变更） |
| `v-for` 不写 key | 模板编译器警告 + ESLint `vue/require-v-for-key` | 不强制报错（官方"推荐"提供） |
| 响应式基础 | `Object.defineProperty` | `Proxy` |
| 组件生命周期 | `mounted`/`beforeDestroy`/`destroyed` | `onMounted`/`onBeforeUnmount`/`onUnmounted` |

> 来源：[Vue 3 迁移指南 · key Attribute 的变更](https://v3-migration.vuejs.org/breaking-changes/key-attribute.html)

---

## 九、常见问题与陷阱

### 陷阱 1：忘记写 key

```vue
<!-- ❌ 没写 key：走就地复用，列表顺序变化时可能出现状态错乱 -->
<div v-for="item in list">{{ item.name }}</div>
```

**修正**：始终为 `v-for` 项加上稳定、唯一的 `key`。

### 陷阱 2：key 重复

```vue
<!-- ❌ 如果 list 里有重复的 id，key 就重复 -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>

<!-- [Vue warn] Duplicate keys detected: '1'. This may cause an update error. -->
```

**修正**：确保数据源的唯一性，或用复合 key。

### 陷阱 3：用对象本身做 key（会字符串化）

```vue
<!-- ❌ Vue 2 中：对象在兜底查找时变 "[object Object]"，映射全部碰撞 -->
<div v-for="item in list" :key="item">{{ item.name }}</div>
```

**修正**：用对象的某个唯一原始类型属性，如 `item.id`。

### 陷阱 4：`<template v-for>` 的 key 放错位置

```vue
<!-- ❌ Vue 2 中：把 key 放在 <template> 上是无效的（那是 Vue 3 写法） -->
<template v-for="item in list" :key="item.id">
  <div>{{ item.name }}</div>
</template>

<!-- ✅ Vue 2：key 放在 <template> 的子元素上 -->
<template v-for="item in list">
  <div :key="'d-' + item.id">{{ item.name }}</div>
</template>
```

### 陷阱 5：v-if / v-else 切换相同标签不加 key，导致输入残留

```vue
<!-- ❌ Vue 2：相同标签 <input> 切换时复用，旧输入内容残留 -->
<input v-if="type === 'name'" placeholder="用户名" />
<input v-else placeholder="邮箱" />

<!-- ✅ Vue 2：加 key 强制重建 -->
<input v-if="type === 'name'" key="name" placeholder="用户名" />
<input v-else key="email" placeholder="邮箱" />
```

### 陷阱 6：`<transition-group>` 子元素没写 key

```vue
<!-- ❌ 列表动画错乱，且 Vue 会提示需要 key -->
<transition-group tag="ul">
  <li v-for="item in items">{{ item }}</li>
</transition-group>

<!-- ✅ 每个直接子元素有唯一稳定的 key -->
<transition-group tag="ul">
  <li v-for="item in items" :key="item.id">{{ item }}</li>
</transition-group>
```

### 陷阱 7：把 key 当成普通 prop 传递

`key` 是**特殊属性**，不会被当作普通 attribute 传给子组件的 props，而是被 Vue 内部消费。子组件**无法**通过 props 接收到 `key`。

```vue
<!-- Child 组件的 props 里拿不到 key -->
<MyComponent :key="item.id" />

<!-- Child.vue -->
<script>
export default {
  props: {
    /* 这里没有 key */
  }
}
</script>
```

### 陷阱 8：滥用 key 强制重渲染

```vue
<!-- ❌ 不要为了"刷新"而频繁改变整个列表的 key -->
<List :key="Date.now()" />
```

这会让整个列表每次都销毁重建（触发大量 `destroyed`/`mounted`），性能极差。只在确实需要重置时才用。

---

## 十、面试常见问题

### Q1：Vue 2 中 key 的作用是什么？

`key` 是 Vue 2 虚拟 DOM 节点（VNode）的**唯一身份标识**，作为 patch/Diff 算法追踪节点身份的"提示"。它的核心作用是帮助 Vue 2 在 Diff 过程中**正确、高效地复用和更新 DOM**：通过 `sameVnode` 判断新旧节点是否"同一个"（`key` 相同 + `tag` 相同等），从而决定是复用（`patchVnode` 只更新属性）还是销毁重建。在 `v-for` 中，`key` 能保证列表项的 DOM 和状态正确跟踪数据，避免顺序变化时的状态错乱和性能浪费。

### Q2：为什么 v-for 中不能用 index 做 key？

因为当列表顺序变化（插入、删除、排序）时，`index` 虽然稳定，但它对应的**数据变了**。这会导致两个问题：① **状态错乱**——如 input 输入内容、子组件内部状态会跟着 DOM 位置走，而不是跟着数据走；② **性能浪费**——本来只需移动少量节点，却退化为更新大量节点内容。应使用数据**唯一且稳定**的标识（如 `id`）。

### Q3：Vue 2 的 Diff 算法是怎样的？key 怎么影响它？

Vue 2 列表 Diff 是**双端比较**（`updateChildren`），对新旧 children 各维护首尾两个指针，每轮循环尝试 4 种头尾命中（新旧头、新旧尾、旧头新尾、旧尾新头），都不命中时用 `createKeyToOldIdx` 的 key map 兜底 O(1) 查找。**没有 key** 时，节点 key 都是 `undefined`，`sameVnode` 仅靠 tag 命中，退化为就地复用，容易出错且低效；**有 key** 时才能正确匹配、最小化 DOM 移动。`key` 是双端 Diff 正确工作的前提。

### Q4：Vue 2 中对象做 key 会发生什么？

Vue 2 判断 key 分两层：`sameVnode` 用 `===` 严格比较（对象按引用比较，不同引用 → 不同）；兜底查找 `createKeyToOldIdx` 用普通对象 `map[key]=i`，**key 作属性名会被 `toString`**，对象变成 `"[object Object]"` 导致**全部碰撞**、映射互相覆盖。所以对象作 key 会让 diff 失效、状态错乱。**结论：不要用对象做 key，用它的原始类型属性（如 `item.id`）。**

### Q5：Vue 2 中数字 key 和字符串 key 会冲突吗？

会。在兜底查找 `createKeyToOldIdx` 中，`map[key] = i` 会把 key 字符串化，数字 `1` 和字符串 `"1"` 都变成属性名 `"1"`，从而**碰撞**、互相覆盖。（Vue 3 用 `Map` 则不会碰撞。）

### Q6：key 应该用什么值？

用**唯一且稳定**的**原始类型**（字符串 / 数字）：优先使用后端数据的 `id`（数据库主键）；没有 id 时在数据创建时生成唯一 id。要求是：兄弟节点间唯一、同一条数据多次渲染 key 不变。不能用 `Math.random()`、`Date.now()`（每次都变），也不能用对象本身（会字符串化碰撞）。

### Q7：没有 key 时 Vue 2 会怎样？

Vue 2 采用**就地复用**（in-place patch）策略——按索引复用 DOM 节点，只更新内容、不移动 DOM。这会导致：① 列表顺序变化时组件内部状态（输入框内容、子组件状态）错乱；② 频繁的 DOM 更新，性能差。此外，模板编译器会对缺少 `:key` 的 `v-for` 给出 `Elements in iteration expect to have 'v-bind:key' directives` 警告，ESLint 规则 `vue/require-v-for-key` 也会报错。

### Q8：Vue 2 和 Vue 3 的 key 有哪些差异？

- **存储/字符串化**：Vue 2 用普通对象存 key、会 `toString`（数字与字符串碰撞、对象变 `[object Object]`）；Vue 3 用 `Map`、不字符串化。
- **Diff**：Vue 2 双端比较；Vue 3 快速 Diff + 最长递增子序列（LIS）。
- **`v-if`/`v-else`**：Vue 2 需手动加 key 控制复用；Vue 3 自动生成 key。
- **`<template v-for>`**：Vue 2 的 key 放子元素上；Vue 3 放 `<template>` 上。

### Q9：key 重复会怎样？

Vue 运行时警告 `Duplicate keys detected`，并可能导致更新错误（Vue 无法正确判断哪个节点该复用，行为不可预期）。应保证兄弟节点间 key 唯一。

### Q10：什么时候可以用 index 做 key？

只有当列表**永不改变顺序**（不增、不删、不排序）且列表项**纯展示、无内部状态**时，用 index 才安全。但实践中很难保证，所以推荐始终用唯一稳定的 id。

---

## 十一、总结

| 要点 | 核心结论 |
|------|---------|
| **key 的本质** | Vue 2 VNode 的唯一身份标识，patch/Diff 的"提示" |
| **判断"同一个节点"** | `sameVnode`：key 相同（`===`）+ tag 相同 + input 类型相同 |
| **没有 key** | 就地复用（in-place patch），易错且低效 |
| **有 key** | 走双端 Diff，最小化 DOM 操作 |
| **Vue 2 Diff 核心** | 双端比较（4 种头尾命中 + key map 兜底） |
| **key 字符串化** | 发生在 `createKeyToOldIdx` 的 `map[key]=i`，key 作属性名被 `toString` |
| **key 的要求** | 唯一（兄弟间）+ 稳定（不随渲染变）+ 原始类型 |
| **最佳取值** | 数据的 id（数据库主键） |
| **不能用** | index（顺序变化时出问题）、`Math.random()`、对象、数组 |
| **Vue 2 特有用法** | v-if/v-else 需手动加 key；`<template v-for>` 的 key 放子元素上 |
| **使用场景** | v-for、v-if/v-else 切换、`<router-view>`、`<transition-group>`、强制重渲染 |

**记住五句话**：

1. **`key` 是 Vue 2 节点的身份证号，帮双端 Diff 算法区分"哪个是哪个"，正确高效地复用和更新 DOM。**
2. **`key` 必须唯一且稳定，用原始类型（字符串/number）——优先数据的 `id`，绝不用 `index`（顺序变化时会状态错乱 + 性能浪费）。**
3. **没有 `key` 时 Vue 2 就地复用，容易出错；有 `key` 时走双端 Diff（头尾比较 + key map 兜底），最少 DOM 操作。**
4. **Vue 2 的 key 在兜底查找 `map[key]=i` 时会被字符串化——对象变 `[object Object]`、数字 `1` 与字符串 `"1"` 碰撞；所以 key 只能用原始类型，绝不能用对象。**
5. **Vue 2 升级 Vue 3 要注意：双端 Diff 换成快速 Diff（LIS）；`v-if`/`v-else` 改为自动生成 key；`<template v-for>` 的 key 从子元素移到 `<template>` 上。**
