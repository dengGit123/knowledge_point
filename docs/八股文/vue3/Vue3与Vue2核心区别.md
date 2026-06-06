# Vue 3 与 Vue 2 核心区别

> 官方文档：[Vue 3 迁移指南](https://v3-migration.vuejs.org/zh/)

> 官方文档：[Vue 3 介绍](https://cn.vuejs.org/guide/introduction.html)

---

## 一、架构层面

### 源码架构

```
Vue 2                       Vue 3（Monorepo）
┌────────────┐             ┌──────────────────────────┐
│            │             │ packages/                │
│  单一代码库 │             │  ├── reactivity          │ ← 响应式
│            │             │  ├── runtime-core         │ ← 运行时核心
│  耦合度高   │             │  ├── runtime-dom          │ ← DOM 渲染器
│            │             │  ├── runtime-test          │ ← 测试渲染器
│            │             │  ├── compiler-core         │ ← 编译器核心
│            │             │  ├── compiler-dom          │ ← DOM 编译器
│            │             │  ├── compiler-sfc          │ ← SFC 编译器
│            │             │  ├── compiler-ssr           │ ← SSR 编译器
│            │             │  └── vue                   │ ← 完整包
└────────────┘             └──────────────────────────┘
```

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| 源码组织 | 单一仓库，模块耦合 | Monorepo，模块独立 |
| 语言 | JavaScript + Flow | TypeScript |
| 响应式 | `@vue/reactivity` 不可独立使用 | 可独立使用 |
| 渲染器 | 绑定 DOM | 可自定义渲染目标 |
| Tree-shaking | 不支持 | 完全支持 |

---

## 二、响应式系统

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | `Object.defineProperty` | `Proxy` |
| 属性新增/删除 | 需要 `Vue.set()` / `Vue.delete()` | 自动追踪 ✅ |
| 数组索引修改 | 无法监听 | 自动追踪 ✅ |
| Map / Set | 不支持 | 支持 ✅ |
| 深层对象 | 初始化时全量递归 | 惰性代理（按需） |
| 响应式 API | `data()` 返回对象 | `ref()` / `reactive()` |

```javascript
// Vue 2
data() {
  return { list: [] }
},
methods: {
  addItem() {
    // ❌ this.list[0] = 'new'  不生效
    // ❌ this.list.length = 0  不生效
    this.$set(this.list, 0, 'new')  // 需要 $set
    this.list.splice(0)              // 需要 splice
  }
}

// Vue 3
setup() {
  const list = ref([])
  function addItem() {
    list.value[0] = 'new'    // ✅ 直接操作
    list.value.length = 0    // ✅ 直接操作
  }
  return { list, addItem }
}
```

---

## 三、API 风格

### Options API vs Composition API

```vue
<!-- Vue 2 Options API -->
<script>
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() { return this.count * 2 }
  },
  methods: {
    increment() { this.count++ }
  },
  mounted() {
    console.log('mounted')
  }
}
</script>

<!-- Vue 3 Composition API -->
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
const increment = () => count.value++

onMounted(() => {
  console.log('mounted')
})
</script>
```

| 维度 | Options API | Composition API |
|------|-------------|-----------------|
| 代码组织 | 按选项类型分散 | 按逻辑关注点聚合 |
| 逻辑复用 | Mixins（命名冲突） | Composable（清晰可控） |
| TypeScript | 支持较弱 | 原生支持 |
| `this` | 需要 `this` | 无 `this` |
| 学习曲线 | 低 | 稍高 |

---

## 四、模板变化

### 多根节点（Fragment）

```vue
<!-- Vue 2：必须单根节点 -->
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

### v-model 变化

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| 默认 prop | `value` | `modelValue` |
| 默认事件 | `@input` | `@update:modelValue` |
| 多个 v-model | `.sync` 修饰符 | `v-model:xxx` |
| 修饰符 | 有限内置 | 支持自定义 |

```vue
<!-- Vue 2 -->
<Child :value="text" @input="text = $event" />
<!-- 简写 -->
<Child v-model="text" />
<!-- 多个绑定 -->
<Child :title.sync="title" :content.sync="content" />

<!-- Vue 3 -->
<Child :modelValue="text" @update:modelValue="text = $event" />
<!-- 简写 -->
<Child v-model="text" />
<!-- 多个绑定 -->
<Child v-model:title="title" v-model:content="content" />
```

### v-if 和 v-for 优先级

| 版本 | 优先级 | 建议 |
|------|--------|------|
| Vue 2 | `v-for` > `v-if` | 避免同时使用 |
| Vue 3 | `v-if` > `v-for` | 避免同时使用 |

> 两个版本都**不建议**在同一个元素上同时使用 `v-if` 和 `v-for`。应该用计算属性先过滤。

### 移除的特性

| 移除 | Vue 2 用法 | Vue 3 替代 |
|------|-----------|-----------|
| `$on` / `$off` / `$once` | 事件总线 | mitt / Pinia |
| `filters` | <code v-pre>{{ msg \| capitalize }}</code> | computed / 方法 |
| `$children` | 访问子组件 | `ref` + `defineExpose` |
| `$destroy` | 手动销毁 | 不再需要（由框架管理） |
| `inline-template` | 内联模板 | 插槽 |
| `$listeners` | 监听器 | 合并到 `$attrs` |

---

## 五、全局 API 变化

```javascript
// Vue 2：全局操作修改 Vue 构造函数
import Vue from 'vue'
Vue.component('MyButton', Button)
Vue.directive('focus', { /* ... */ })
Vue.mixin({ /* ... */ })
Vue.use(plugin)
new Vue({ render: h => h(App) }).$mount('#app')

// Vue 3：通过应用实例操作
import { createApp } from 'vue'
const app = createApp(App)
app.component('MyButton', Button)
app.directive('focus', { /* ... */ })
app.mixin({ /* ... */ })        // 仍可用但不推荐
app.use(plugin)
app.mount('#app')
```

**意义**：每个 `createApp` 创建独立的应用实例，全局配置互不影响，支持**多实例共存**。

---

## 六、生命周期变化

| Vue 2 | Vue 3（Options API） | Vue 3（Composition API） |
|-------|---------------------|------------------------|
| `beforeCreate` | `beforeCreate` | `setup()` |
| `created` | `created` | `setup()` |
| `beforeMount` | `beforeMount` | `onBeforeMount()` |
| `mounted` | `mounted` | `onMounted()` |
| `beforeUpdate` | `beforeUpdate` | `onBeforeUpdate()` |
| `updated` | `updated` | `onUpdated()` |
| `beforeDestroy` | `beforeUnmount` | `onBeforeUnmount()` |
| `destroyed` | `unmounted` | `onUnmounted()` |
| — | — | `onErrorCaptured()` |
| — | — | `onRenderTracked()` |
| — | — | `onRenderTriggered()` |

---

## 七、性能对比

| 指标 | Vue 2 | Vue 3 | 提升 |
|------|-------|-------|------|
| 包体积（gzip） | ~23KB | ~13KB（按需） | ~43% ↓ |
| 初始渲染速度 | 基准 | 快 ~55% | 55% ↑ |
| 更新速度 | 基准 | 快 ~133% | 133% ↑ |
| 内存占用 | 基准 | 少 ~54% | 54% ↓ |
| SSR 速度 | 基准 | 快 2~3 倍 | 200%+ ↑ |

### 性能优化手段

| 优化 | 说明 |
|------|------|
| 静态提升 | 静态节点只创建一次 |
| PatchFlag | 精确标记动态部分 |
| Block Tree | 靶向更新，只遍历动态节点 |
| Tree-shaking | 未使用的 API 不打包 |
| 静态字符串化 | 大量静态内容序列化为 HTML 字符串 |
| 惰性响应式 | 按需代理嵌套对象 |

---

## 八、TypeScript 支持

```vue
<!-- Vue 3 完善的 TypeScript 支持 -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

// 自动类型推导
const count = ref(0)                    // Ref<number>
const user = ref<User>({                 // 显式泛型
  id: 1,
  name: 'Tom',
  email: 'tom@example.com'
})

// props 类型声明
const props = defineProps<{
  title: string
  count?: number
}>()

// emits 类型声明
const emit = defineEmits<{
  change: [value: string]
  update: [id: number]
}>()

// 模板 ref 类型
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>
```

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| 源码语言 | JavaScript + Flow | TypeScript |
| 类型推导 | 依赖 `Vue.extend`，体验差 | 原生支持，体验好 |
| Props 类型 | 运行时声明 | ✅ TypeScript 类型声明 |
| 组件类型 | 需要装饰器（vue-class-component） | ✅ `<script setup lang="ts">` |
| 模板类型检查 | 无 | ✅ `vue-tsc` 支持 |

---

## 九、新内置组件

| 组件 | Vue 2 | Vue 3 | 说明 |
|------|-------|-------|------|
| `Transition` | ✅ | ✅ 增强 | 过渡动画（新增 CSS `@keyframes` 支持） |
| `TransitionGroup` | ✅ | ✅ | 列表过渡 |
| `KeepAlive` | ✅ | ✅ 增强 | 组件缓存（新增 `include/exclude` 匹配） |
| `Teleport` | ❌ | ✅ 新增 | 传送门（原 Portal） |
| `Suspense` | ❌ | ✅ 新增（实验性） | 异步协调 |

---

## 十、生态系统变化

| 工具/库 | Vue 2 | Vue 3 |
|---------|-------|-------|
| 状态管理 | Vuex | **Pinia**（官方推荐） |
| 路由 | Vue Router 3.x | **Vue Router 4.x** |
| 构建工具 | Webpack（Vue CLI） | **Vite**（官方推荐） |
| IDE 支持 | Vetur | **Vue - Official**（原 Volar） |
| DevTools | Vue DevTools | **Vue DevTools**（统一版） |
| SSR | vue-server-renderer | **@vue/server-renderer** |
| 测试 | @vue/test-utils | @vue/test-utils（兼容） |

---

## 十一、迁移要点

### 兼容构建版本

Vue 3 提供了 `@vue/compat` 兼容构建版本，可以逐步迁移：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  }
}
```

### 主要破坏性变更

| 变更 | 说明 |
|------|------|
| 全局 API 挂载到应用实例 | `Vue.xxx` → `app.xxx` |
| `v-model` 参数名变化 | `value` → `modelValue` |
| 生命周期重命名 | `destroyed` → `unmounted` |
| 移除 `filters` | 使用 computed 或方法替代 |
| 移除 `$on/$off/$once` | 使用 mitt 或 Pinia |
| 移除 `$children` | 使用 `ref` |
| `$listeners` 合并到 `$attrs` | 不再单独存在 |
| `data` 必须是函数 | 组件中 `data` 必须返回函数 |
| `v-bind` 排序变化 | `class` 和 `style` 不再覆盖 |

---

## 十二、面试常见问题

### Q1：Vue 3 相比 Vue 2 最大的改进是什么？

从三个维度回答：
1. **开发体验**：Composition API + `<script setup>` + 完善的 TypeScript 支持
2. **性能**：Proxy 响应式 + 编译优化（静态提升、PatchFlag、Block Tree）+ Tree-shaking
3. **架构**：Monorepo 模块化 + 自定义渲染器 + 独立的响应式系统

### Q2：Vue 2 项目如何迁移到 Vue 3？

1. 使用 `@vue/compat` 兼容版本运行项目
2. 根据 DevTools 中的兼容性警告逐一修复
3. 升级 Vue Router 到 4.x、Vuex 迁移到 Pinia
4. 将 Webpack + Vue CLI 替换为 Vite
5. 逐步将 Options API 改写为 Composition API
6. 移除兼容构建，完成迁移

### Q3：Vue 3 为什么推荐 Pinia 而不是 Vuex？

1. **更简洁**：去除了 mutations，直接修改 state
2. **更好的 TypeScript**：完整的类型推导
3. **更轻量**：无嵌套模块，天然 Tree-shakeable
4. **Composition API 风格**：使用 `setup()` 函数定义 store
5. **DevTools 集成**：完善的时间旅行调试

### Q4：Vue 3 的 `<script setup>` 有什么优势？

1. **更少的代码**：不需要 `return`，变量自动暴露
2. **更好的性能**：编译为更高效的渲染函数
3. **更好的 TypeScript**：完善的 IDE 支持
4. **编译时宏**：`defineProps`、`defineEmits`、`defineExpose` 无需导入
5. **更清晰的 API**：`withDefaults` 提供类型安全的默认值
