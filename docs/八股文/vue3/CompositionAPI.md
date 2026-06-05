# Composition API

> 官方文档：[组合式 API](https://cn.vuejs.org/guide/reusability/composables.html)

> 官方文档：[组合式 API 常见问答](https://cn.vuejs.org/guide/extras/composition-api-faq.html)

---

## 一、核心概念

Composition API（组合式 API）是 Vue 3 中的一组 API，它允许开发者使用**函数**的方式来组织组件逻辑，而非按选项类型（data、methods、computed）分散组织。

```
Options API 的代码组织方式          Composition API 的代码组织方式
┌──────────────────────┐          ┌──────────────────────┐
│ data()               │          │ // ✅ 搜索功能        │
│   - searchQuery      │          │ const query = ref()   │
│   - filterType       │          │ const results = ...   │
│   - sortOrder        │          │ const search = ...    │
│                      │          │                       │
│ computed:            │          │ // ✅ 排序功能        │
│   - filteredList     │          │ const sortKey = ref() │
│   - sortedList       │          │ const sorted = ...    │
│                      │          │                       │
│ methods:             │          │ // ✅ 分页功能        │
│   - search()         │          │ const page = ref(1)   │
│   - sort()           │          │ const pageSize = ...  │
│   - changePage()     │          └──────────────────────┘
│                      │
│ watch:               │    ↑ 逻辑关注点聚合在一起
│   - searchQuery()    │    而非分散在各选项中
│   - filterType()     │
└──────────────────────┘
```

> **通俗理解**：Options API 像"按食材分类"（肉放一起、菜放一起），Composition API 像"按菜品分类"（宫保鸡丁的材料放一起、鱼香肉丝的材料放一起）。后者更利于复用和维护。

---

## 二、`<script setup>` 语法糖

`<script setup>` 是 Composition API 的**编译时语法糖**，是官方推荐的使用方式。

```vue
<script setup>
import { ref, computed } from 'vue'

// 声明响应式数据（自动暴露给模板，不需要 return）
const count = ref(0)

// 计算属性
const doubled = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}
</script>

<template>
  <p>{{ count }} × 2 = {{ doubled }}</p>
  <button @click="increment">+1</button>
</template>
```

**与普通 `<script setup>` 对比**：

| 特性 | `<script setup>` | 普通 `<script>` + `setup()` |
|------|------------------|----------------------------|
| 变量暴露 | 自动暴露 | 需要手动 return |
| 代码量 | 更少 | 更冗余 |
| props 声明 | `defineProps()` | 从参数解构 |
| emits 声明 | `defineEmits()` | 从参数解构 |
| 性能 | 更好（编译优化） | 一般 |
| 官方推荐 | ✅ 推荐 | 兼容方案 |

---

## 三、核心 API 详解

### 1. `setup()` 函数

`setup()` 是 Composition API 的入口函数，在组件创建之初、`beforeCreate` 之前执行。

```vue
<script>
import { ref, onMounted } from 'vue'

export default {
  props: {
    title: String
  },
  setup(props, context) {
    // props —— 响应式的 props 对象
    console.log(props.title)

    // context —— 上下文对象
    // context.attrs    —— 非 props 的属性（类似 $attrs）
    // context.slots    —— 插槽（类似 $slots）
    // context.emit     —— 触发事件（类似 $emit）
    // context.expose   —— 暴露公共属性（配合 ref 使用）

    const count = ref(0)

    onMounted(() => {
      console.log('组件已挂载')
    })

    // 必须返回模板需要的内容
    return { count }
  }
}
</script>
```

> **注意**：`<script setup>` 会自动处理 setup() 的返回值，不需要手动 return。

---

### 2. `computed()` — 计算属性

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 只读计算属性
const fullName = computed(() => firstName.value + lastName.value)

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return firstName.value + lastName.value
  },
  set(newValue) {
    firstName.value = newValue[0]
    lastName.value = newValue.slice(1)
  }
})

fullNameWritable.value = '李四'  // firstName='李', lastName='四'
</script>
```

**计算属性的特性**：

| 特性 | 说明 |
|------|------|
| **惰性求值** | 只有在依赖变化且被读取时才重新计算 |
| **缓存** | 依赖不变时直接返回缓存结果 |
| **自动追踪依赖** | 运行时自动收集内部使用的响应式数据 |

---

### 3. `watch()` — 侦听器

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)
const user = ref({ name: '张三', age: 18 })

// ① 侦听单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})

// ② 侦听多个源
watch([count, user], ([newCount, newUser], [oldCount, oldUser]) => {
  console.log('count 或 user 变化了')
})

// ③ 侦听 reactive 对象的属性（使用 getter 函数）
const state = reactive({ nested: { count: 0 } })
watch(
  () => state.nested.count,
  (newVal, oldVal) => {
    console.log('嵌套属性变化了')
  }
)

// ④ 深层侦听
watch(
  user,
  (newVal, oldVal) => {
    // 注意：newVal 和 oldVal 是同一个对象的引用
    console.log('user 内部变化了')
  },
  { deep: true }
)
</script>
```

**watch 配置选项**：

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `deep` | 深层侦听嵌套属性变化 | `false` |
| `immediate` | 创建时立即执行一次回调 | `false` |
| `flush` | 回调的执行时机（`'pre'`/`'post'`/`'sync'`） | `'pre'` |
| `once` | 只触发一次 | `false` |

```vue
<script setup>
import { ref, watch } from 'vue'

const keyword = ref('')

// 防抖搜索示例
watch(
  keyword,
  (newVal) => {
    fetchSearchResults(newVal)
  },
  {
    immediate: true,   // 初始化就搜索一次
    flush: 'post'      // DOM 更新后执行
  }
)
</script>
```

### 4. `watchEffect()` — 自动追踪侦听器

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Tom')

// 自动追踪回调内部使用的所有响应式依赖
watchEffect(() => {
  // 自动追踪 count 和 name
  console.log(`count: ${count.value}, name: ${name.value}`)
})
// 立即执行一次
// 输出: count: 0, name: Tom

count.value++
// 自动输出: count: 1, name: Tom
</script>
```

### `watch()` vs `watchEffect()`

| 维度 | `watch()` | `watchEffect()` |
|------|-----------|-----------------|
| 依赖声明 | **显式**指定侦听源 | **自动追踪**回调中的依赖 |
| 旧值访问 | ✅ 回调接收 `newVal, oldVal` | ❌ 无法访问旧值 |
| 执行时机 | 依赖变化时执行 | **立即执行**一次 + 依赖变化时 |
| 懒执行 | ✅ 默认懒执行 | ❌ 总是立即执行一次 |
| 精确控制 | 可以精确侦听某个属性 | 自动追踪所有使用的响应式数据 |
| 使用场景 | 需要精确控制、需要旧值 | 副作用逻辑、不关心旧值 |

---

### 5. `watchPostEffect()` 和 `watchSyncEffect()`

```vue
<script setup>
import { ref, watchPostEffect, watchSyncEffect } from 'vue'

const count = ref(0)

// 在 DOM 更新之后执行
watchPostEffect(() => {
  // 可以安全地访问更新后的 DOM
  document.title = `Count: ${count.value}`
})

// 在响应式数据变化时同步执行（谨慎使用）
watchSyncEffect(() => {
  console.log('同步执行:', count.value)
})
</script>
```

---

## 四、自定义 Composable（组合函数）

Composable 是利用 Composition API 封装的**可复用逻辑函数**，替代了 Vue 2 中的 Mixins。

```javascript
// composables/useMousePosition.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { useMousePosition } from '@/composables/useMousePosition'

const { x, y } = useMousePosition()
</script>

<template>
  <p>鼠标位置：{{ x }}, {{ y }}</p>
</template>
```

### Composable vs Mixins

| 维度 | Mixins | Composable |
|------|--------|-----------|
| 来源追踪 | ❌ 不清楚属性来自哪个 mixin | ✅ 明确来自哪个函数 |
| 命名冲突 | ❌ 可能冲突 | ✅ 可以解构重命名 |
| 类型推导 | ❌ 差 | ✅ 完善的 TypeScript 支持 |
| 数据传递 | ❌ 隐式共享 | ✅ 参数显式传递 |
| 灵活性 | 低（合并策略固定） | 高（函数组合） |

### 常用 Composable 模式

```javascript
// 1. 异步数据获取
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)

  async function fetchData() {
    loading.value = true
    try {
      const response = await fetch(url.value || url)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  if (isRef(url)) {
    watch(url, fetchData)
  }

  fetchData()

  return { data, error, loading, refresh: fetchData }
}

// 2. 表单验证
export function useForm(initialValues, rules) {
  const values = reactive({ ...initialValues })
  const errors = reactive({})

  function validate() {
    let valid = true
    for (const [field, rule] of Object.entries(rules)) {
      const result = rule(values[field])
      errors[field] = result === true ? '' : result
      if (result !== true) valid = false
    }
    return valid
  }

  return { values, errors, validate }
}
```

---

## 五、`defineProps` 和 `defineEmits`

```vue
<script setup>
// 声明 props（编译器宏，不需要导入）
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

// 使用 TypeScript 类型声明（推荐）
// const props = defineProps<{
//   title: string
//   count?: number
// }>()

// 带默认值的 TypeScript 声明
// const props = withDefaults(defineProps<{
//   title: string
//   count?: number
// }>(), {
//   count: 0
// })

// 声明 emits
const emit = defineEmits<{
  change: [value: string]
  update: [id: number]
}>()

function handleClick() {
  emit('change', 'new value')
}
</script>
```

---

## 六、`defineExpose`

默认情况下，`<script setup>` 组件是**封闭的**，通过模板 ref 访问不到内部数据。`defineExpose` 用于显式暴露：

```vue
<!-- Child.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const secret = ref('hidden')
const reset = () => { count.value = 0 }

// 只暴露 count 和 reset，secret 不暴露
defineExpose({ count, reset })
</script>

<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref(null)

function handleReset() {
  childRef.value.reset()   // ✅ 可以访问
  childRef.value.secret    // ❌ undefined，未暴露
}
</script>

<template>
  <Child ref="childRef" />
  <button @click="handleReset">重置子组件</button>
</template>
```

---

## 七、面试常见问题

### Q1：Composition API 的优势是什么？

1. **更好的逻辑复用**：通过 Composable 函数替代 Mixins，无命名冲突
2. **更灵活的代码组织**：相关逻辑聚合在一起，而非分散在各个选项
3. **更好的类型推导**：函数调用天然支持 TypeScript 类型
4. **更小的生产代码**：`<script setup>` 编译后的代码更高效
5. **无 `this`**：避免了 `this` 指向问题

### Q2：`setup` 函数中为什么不能用 `this`？

`setup()` 在 `beforeCreate` 之前执行，此时组件实例尚未创建完成，`this` 指向不完整。Composition API 通过**闭包引用**（ref / reactive）来管理状态，不需要 `this`。

### Q3：watch 和 watchEffect 怎么选？

- 需要知道旧值 → `watch`
- 需要精确控制侦听源 → `watch`
- 只关心副作用逻辑 → `watchEffect`
- 希望自动追踪所有依赖 → `watchEffect`

### Q4：`<script setup>` 和普通 `setup()` 可以共存吗？

可以。同时存在时，`<script setup>` 的内容会被编译为 `setup()` 的返回值。普通 `<script>` 用于声明不会在 `setup()` 中使用的选项，如 `inheritAttrs`、自定义选项、`name` 等。
