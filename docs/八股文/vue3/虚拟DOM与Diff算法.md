# 虚拟 DOM 与 Diff 算法

> 官方文档：[渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)

> 官方文档：[渲染函数](https://cn.vuejs.org/guide/extras/render-function.html)

---

## 一、虚拟 DOM 是什么

虚拟 DOM（Virtual DOM）是用 JavaScript 对象来描述真实 DOM 结构的一种技术。

```javascript
// 真实 DOM
// <div id="app" class="container">
//   <h1>标题</h1>
//   <p>内容</p>
// </div>

// 对应的虚拟 DOM（VNode）
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      type: 'h1',
      props: null,
      children: '标题'
    },
    {
      type: 'p',
      props: null,
      children: '内容'
    }
  ]
}
```

### 为什么需要虚拟 DOM？

| 原因 | 说明 |
|------|------|
| **跨平台** | VNode 是 JS 对象，可以渲染到不同平台（DOM、Canvas、Native） |
| **批量更新** | 收集所有变化后一次性更新 DOM，减少回流和重绘 |
| **Diff 算法** | 通过对比新旧 VNode 树，找出最小变化量 |
| **组件化** | VNode 可以描述组件，实现组件的抽象和复用 |

> **通俗理解**：虚拟 DOM 就像"设计图纸"，你在图纸上修改设计，系统对比新旧图纸找出差异，最后只把变化的部分应用到真实建筑上。

---

## 二、VNode 的结构

Vue 3 的 VNode 结构（简化版）：

```javascript
{
  type,          // 节点类型：'div' | Component | Text | Comment
  props,         // 节点属性：{ class, style, onClick, ... }
  key,           // 用于 diff 时的节点标识（v-for 的 key）
  children,      // 子节点：VNode[] | string
  shapeFlag,     // 节点类型标记（位运算）
  patchFlag,     // 补丁标记（编译优化）
  dynamicProps,  // 动态属性列表
  // ...其他内部属性
}
```

### ShapeFlag（节点类型标记）

```javascript
// 使用位运算标识节点类型
export const enum ShapeFlags {
  ELEMENT           = 1,       // 普通 HTML 元素
  STATEFUL_COMPONENT = 1 << 1, // 有状态组件
  FUNCTIONAL_COMPONENT = 1 << 2, // 函数式组件
  TEXT_CHILDREN     = 1 << 3,  // 文本子节点
  ARRAY_CHILDREN    = 1 << 4,  // 数组子节点
  SLOTS_CHILDREN    = 1 << 5,  // 插槽子节点
}
```

---

## 三、Diff 算法

### 核心策略：同层对比

```
  旧 VNode 树              新 VNode 树
     A ──── 对比 ──── A'
    / \                  / \
   B   C ── 对比 ── B'  C'
  /   / \             /   / \
 D    E   F 对比    D'  E'  F'

 → 只对比同一层级的节点，不跨层级对比
```

### Diff 的三个阶段

```
┌─────────────────────────────────────────────────────┐
│              Vue 3 Diff 流程                         │
│                                                      │
│  1. 同层级从头对比（头头对比）                         │
│     A B C D E F                                      │
│     A B C D E F  ← 相同则继续，不同则停止             │
│                                                      │
│  2. 同层级从尾对比（尾尾对比）                         │
│     ... D E F                                        │
│     ... D E F  ← 相同则继续，不同则停止               │
│                                                      │
│  3. 中间未处理部分                                    │
│     ┌─ 新节点多 → 挂载新节点                          │
│     ├─ 旧节点多 → 卸载多余节点                        │
│     └─ 都有 → 使用"最长递增子序列"最小化移动           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 详细流程

#### 第一步：从头对比

```javascript
// 从头部开始，逐个比较节点
let i = 0
while (i <= e1 && i <= e2 && isSameVNodeType(c1[i], c2[i])) {
  patch(c1[i], c2[i])  // 递归对比
  i++
}
```

```
旧: [A, B, C, D, E, F]
新: [A, B, C, D, G, H]
     ↑  ↑  ↑  ↑
     相同，继续对比...
```

#### 第二步：从尾对比

```javascript
// 从尾部开始，逐个比较节点
while (i <= e1 && i <= e2 && isSameVNodeType(c1[e1], c2[e2])) {
  patch(c1[e1], c2[e2])
  e1--
  e2--
}
```

```
旧: [A, B, C, D, E, F]
新: [A, B, C, D, G, H]
                   ↑  ← 不同，停止
```

#### 第三步：处理中间部分

```javascript
// 情况 1：只有新增节点
if (i > e1) {
  while (i <= e2) {
    mount(c2[i])
    i++
  }
}

// 情况 2：只有删除节点
else if (i > e2) {
  while (i <= e1) {
    unmount(c1[i])
    i++
  }
}

// 情况 3：需要移动和复用（最复杂的情况）
else {
  // 使用最长递增子序列算法
  // ...
}
```

---

## 四、最长递增子序列（LIS）

当中间部分新旧都有节点时，Vue 3 使用**最长递增子序列**来最小化 DOM 移动操作。

### 算法思路

1. 为新节点中的中间部分建立**索引映射**
2. 找到旧节点在新节点中的位置序列
3. 求这个序列的**最长递增子序列**（不需要移动的节点）
4. 只移动不在子序列中的节点

```
旧节点: [A, B, C, D, E, F, G, H]
新节点: [A, B, E, C, D, F, G, H]

中间部分:
旧: C  D  E  F
新: E  C  D  F

E 在旧中的位置: 4 (index 2)
C 在旧中的位置: 2 (index 0)
D 在旧中的位置: 3 (index 1)
F 在旧中的位置: 5 (index 3)

位置序列: [4, 2, 3, 5]

最长递增子序列: [2, 3, 5]（对应 C, D, F）
→ 这些节点不需要移动

只需移动 E（从位置 2 移到位置 0 之后）
```

### LIS 算法实现（简化版）

```javascript
function getSequence(arr) {
  const result = [0]      // 存储最长递增子序列的索引
  const prevIndex = []    // 前驱索引数组

  for (let i = 1; i < arr.length; i++) {
    const lastIdx = result[result.length - 1]
    if (arr[i] > arr[lastIdx]) {
      result.push(i)
      prevIndex[i] = lastIdx
    } else {
      // 二分查找替换位置
      let left = 0, right = result.length - 1
      while (left < right) {
        const mid = (left + right) >> 1
        if (arr[result[mid]] < arr[i]) {
          left = mid + 1
        } else {
          right = mid
        }
      }
      result[left] = i
      if (left > 0) prevIndex[i] = result[left - 1]
    }
  }

  // 回溯得到完整序列
  let len = result.length
  let idx = result[len - 1]
  while (len-- > 0) {
    result[len] = idx
    idx = prevIndex[idx]
  }

  return result
}
```

---

## 五、key 的作用

### 为什么需要 key？

`key` 是 VNode 的**唯一标识**，帮助 Diff 算法精确判断哪些节点可以复用。

```vue
<!-- ❌ 没有 key：使用"就地复用"策略 -->
<div v-for="item in list">{{ item.name }}</div>

<!-- ✅ 使用 key：精确追踪每个节点 -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

### 有无 key 的对比

```
场景：列表 [A, B, C, D] → 删除 B → [A, C, D]

无 key（就地复用策略）：
  A → A ✅ 复用
  B → C ⚠️ 复用 B 节点，修改内容为 C
  C → D ⚠️ 复用 C 节点，修改内容为 D
  D → ❌ 删除 D 节点
  → 3 次更新 + 1 次删除

有 key（精确追踪）：
  A(key=A) → A(key=A) ✅ 复用
  B(key=B) → ❌ 删除 B
  C(key=C) → C(key=C) ✅ 复用
  D(key=D) → D(key=D) ✅ 复用
  → 1 次删除（最高效）
```

### key 的注意事项

| 规则 | 说明 |
|------|------|
| ✅ 使用唯一 ID | `:key="item.id"` |
| ✅ 使用稳定值 | key 不应随渲染变化 |
| ❌ 不要用 index | 列表变化时 index 会变，导致错误复用 |
| ❌ 不要用随机数 | 每次渲染 key 都不同，所有节点重新创建 |

---

## 六、Vue 3 Diff 算法 vs Vue 2 Diff 算法

| 维度 | Vue 2（双端 Diff） | Vue 3（快速 Diff + LIS） |
|------|-------------------|-------------------------|
| 策略 | 双端对比（头头、尾尾、头尾、尾头） | 头头 + 尾尾 + 最长递增子序列 |
| 移动次数 | 可能有多余移动 | 最少移动（LIS 优化） |
| 性能 | 一般 | 更优（减少 DOM 操作） |
| 复杂度 | O(n²) 最坏情况 | O(n log n)（LIS 部分） |

> **Vue 3 优化点**：借助编译时的 PatchFlag 信息，Vue 3 的 Diff 可以跳过不需要比较的静态节点，直接定位到动态节点进行对比。

---

## 七、面试常见问题

### Q1：虚拟 DOM 一定比直接操作 DOM 快吗？

**不是**。虚拟 DOM 的优势在于：
- 提供了一种**合理的性能下限**，不需要手动优化
- 支持跨平台渲染
- 声明式编程体验更好

对于极致性能场景（如大量节点的表格），手动操作 DOM 可能更快。但虚拟 DOM 在大多数场景下提供了性能和开发体验的良好平衡。

### Q2：为什么不能用 index 作为 key？

当列表发生变化（增删、排序）时，index 会重新分配：
1. **错误复用**：不同数据绑定了相同的 index，Vue 认为是"同一个节点"而复用，导致数据错乱
2. **不必要的更新**：所有节点的 key 都变了，Diff 算法无法正确识别已存在的节点
3. **组件状态错乱**：如果列表项是组件，复用错误会导致内部状态混乱

### Q3：Vue 3 的 Diff 为什么要用最长递增子序列？

最长递增子序列（LIS）可以找到**不需要移动的节点子集**，只移动不在 LIS 中的节点。这样可以保证 DOM 移动操作**最少化**，是数学上的最优解。

### Q4：PatchFlag 是怎么优化 Diff 的？

编译器在编译模板时，会为动态节点标记 PatchFlag，标识哪些属性是动态的：

```javascript
// <div :class="active" id="static">{{ message }}</div>
// 编译结果（简化）
_createVNode("div",
  { class: active, id: "static" },
  message,
  PatchFlags.TEXT | PatchFlags.CLASS  // 标记只有 class 和文本是动态的
)
```

Diff 时只需检查被标记的属性，跳过所有静态属性，大幅减少比较开销。
