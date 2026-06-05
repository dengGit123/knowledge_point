# Vue 3 新特性概述

> 官方文档：[Vue.js 3 介绍](https://cn.vuejs.org/guide/introduction.html)

> 迁移指南：[Vue 3 迁移指南](https://v3-migration.vuejs.org/zh/)

---

## 一、Vue 3 的核心设计目标

| 目标 | 说明 |
|------|------|
| **更快的渲染速度** | 重写虚拟 DOM 实现，编译模板优化，更高效的组件初始化 |
| **更小的包体积** | 基于 Tree-shaking 的全局 API，核心运行时仅 ~13KB（gzip） |
| **更好的 TypeScript 支持** | 源码使用 TypeScript 重写，提供完善的类型推导 |
| **更灵活的代码组织** | Composition API 解决 Options API 在复杂组件中的逻辑复用难题 |
| **更好的可维护性** | Monorepo 架构管理，模块化设计 |

---

## 二、核心新特性一览

### 1. Composition API（组合式 API）

Vue 3 最大的变化，提供了一种**基于函数的 API**，让逻辑复用和代码组织更加灵活。

```vue
<!-- Options API（Vue 2 风格） -->
<script>
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  },
  mounted() {
    console.log('mounted')
  }
}
</script>

<!-- Composition API（Vue 3 风格） -->
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const increment = () => count.value++

onMounted(() => {
  console.log('mounted')
})
</script>
```

> **核心优势**：将同一逻辑关注点的代码聚合在一起，而非分散在 `data`、`methods`、`computed` 等不同选项中。

---

### 2. 响应式系统重写

Vue 3 使用 `Proxy` 替代 `Object.defineProperty` 实现响应式：

| 对比项 | Vue 2（defineProperty） | Vue 3（Proxy） |
|--------|------------------------|----------------|
| 属性新增/删除 | 需要 `$set` / `$delete` | 自动追踪 ✅ |
| 数组索引修改 | 无法监听 | 自动追踪 ✅ |
| Map / Set 集合 | 不支持 | 支持 ✅ |
| 嵌套对象 | 递归劫持（性能损耗） | 惰性代理（按需） |
| 性能 | 初始化时全部递归 | 访问时才代理 |

```vue
<script setup>
import { reactive, ref } from 'vue'

// reactive —— 适用于对象/数组
const state = reactive({
  list: [],
  nested: { a: { b: 1 } }
})
state.list[0] = 'new'       // ✅ 自动响应式
state.newProp = 'value'     // ✅ 自动响应式

// ref —— 适用于基本类型
const count = ref(0)
count.value++               // ✅ 触发更新
</script>
```

---

### 3. Fragment（片段）

Vue 3 组件模板支持**多个根节点**，不再需要唯一的包裹元素：

```vue
<!-- Vue 2：必须有一个根元素 -->
<template>
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
</template>

<!-- Vue 3：支持多根节点 -->
<template>
  <h1>标题</h1>
  <p>内容</p>
</template>
```

---

### 4. Teleport（传送门）

将组件内容渲染到 DOM 中的**任意位置**，常用于弹窗、消息提示等场景：

```vue
<template>
  <!-- 将弹窗渲染到 body 下，避免被父元素的 overflow:hidden 裁切 -->
  <Teleport to="body">
    <div class="modal">这是一个弹窗</div>
  </Teleport>
</template>
```

---

### 5. Suspense（悬念）

协调异步依赖，在异步组件加载时显示 fallback 内容：

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    <!-- 加载中显示 -->
    <template #fallback>
      <p>加载中...</p>
    </template>
  </Suspense>
</template>
```

---

### 6. 更好的 TypeScript 支持

```vue
<script setup lang="ts">
import { ref, computed, PropType } from 'vue'

// 完善的类型推导
const count = ref(0)                    // Ref<number>
const message = ref<string>('hello')    // 显式泛型

interface User {
  name: string
  age: number
}

const user = ref<User>({ name: 'Tom', age: 18 })
</script>
```

---

## 三、性能提升

| 优化点 | 说明 |
|--------|------|
| **静态提升** | 模板中的静态节点只创建一次，后续复用 |
| **PatchFlag** | 编译时标记动态内容，diff 时只比较动态部分 |
| **Block Tree** | 基于动态节点追踪的靶向更新 |
| **Tree-shaking** | 未使用的 API 不会打包进最终产物 |
| **SSR 优化** | 静态部分直接字符串拼接，跳过虚拟 DOM |

---

## 四、架构变化

```
Vue 2 架构                    Vue 3 架构（Monorepo）
┌──────────┐                 ┌──────────────────────┐
│  vue.js  │                 │  packages/           │
│ (全量打包)│                 │  ├── reactivity      │ ← 响应式（独立可用）
│          │                 │  ├── runtime-core     │ ← 运行时核心
│          │                 │  ├── runtime-dom      │ ← DOM 运行时
│          │                 │  ├── compiler-core    │ ← 编译器核心
│          │                 │  ├── compiler-dom     │ ← DOM 编译器
│          │                 │  ├── compiler-sfc     │ ← SFC 编译器
│          │                 │  └── vue              │ ← 完整版
└──────────┘                 └──────────────────────┘
```

> **关键意义**：`@vue/reactivity` 可以独立于 Vue 使用，也能构建自定义渲染器（如 `@vue/runtime-native`）。

---

## 五、面试常见问题

### Q1：Vue 3 为什么要重写？

**核心原因**：
1. **响应式局限**：`Object.defineProperty` 无法追踪属性的新增/删除、数组索引变化
2. **逻辑复用困难**：Options API 的 Mixins 存在命名冲突、来源不清晰等问题
3. **TypeScript 支持弱**：Vue 2 的类型推导依赖 `Vue.extend` 的 class 风格，体验不佳
4. **性能瓶颈**：全量递归响应式、全量 diff 无法进一步优化
5. **维护困难**：代码耦合严重，难以独立使用部分功能

### Q2：Composition API 和 Options API 怎么选？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 简单组件 / 快速原型 | Options API | 简单直观，上手快 |
| 复杂业务逻辑 | Composition API | 逻辑按功能聚合，复用性强 |
| 需要类型推导 | Composition API | 对 TypeScript 更友好 |
| 提取复用逻辑 | Composition API | 自定义 Hook（Composable）替代 Mixins |

> 两种风格可以混用，Options API 内部也会被转换为 Composition API 的形式。

### Q3：Vue 3 的 Tree-shaking 是怎么实现的？

Vue 3 将全局 API 改为**具名导出**，使得打包工具（如 Webpack / Rollup / Vite）可以在编译阶段分析并移除未使用的代码：

```javascript
// Vue 2 —— 全局挂载，无法 tree-shake
import Vue from 'vue'
Vue.nextTick(() => {})

// Vue 3 —— 具名导出，未使用则不打包
import { nextTick } from 'vue'
nextTick(() => {})
```
