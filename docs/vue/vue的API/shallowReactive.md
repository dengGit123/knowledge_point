# shallowReactive

## 作用

`shallowReactive()` 创建一个浅层响应式代理。只有**根级属性**是响应式的，嵌套对象不会被转换为响应式——它们保持为原始的普通对象。

适用于性能优化场景，特别是包含大型嵌套数据结构的对象。

> [Vue 官方文档 - shallowReactive](https://cn.vuejs.org/api/reactivity-advanced#shallowreactive)

## 函数签名

```typescript
function shallowReactive<T extends object>(target: T): T
```

## 基本用法

```javascript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 根级属性是响应式的
state.foo++ // ✅ 触发更新

// 嵌套对象不是响应式的
state.nested.bar++ // ❌ 不触发更新

// 替换整个嵌套对象是响应式的
state.nested = { bar: 3 } // ✅ 触发更新
```

## 与 reactive 的区别

```javascript
import { reactive, shallowReactive, watch } from 'vue'

// reactive：深层响应式
const deep = reactive({
  nested: { count: 0 }
})
watch(() => deep.nested.count, (val) => {
  console.log('deep changed:', val) // 会触发
})
deep.nested.count++ // ✅ 触发 watch

// shallowReactive：浅层响应式
const shallow = shallowReactive({
  nested: { count: 0 }
})
watch(() => shallow.nested.count, (val) => {
  console.log('shallow changed:', val) // 不会触发
})
shallow.nested.count++ // ❌ 不触发 watch
```

**对比表：**

| 特性 | reactive | shallowReactive |
|------|----------|-----------------|
| 根级属性 | 响应式 | 响应式 |
| 嵌套对象 | 深层响应式 | 原始对象（非响应式） |
| 性能开销 | 较高（递归代理） | 较低（只代理根级） |
| 适用场景 | 需要深层响应 | 大型数据、性能敏感 |

## 使用场景

### 1. 大型数据结构优化

```javascript
import { shallowReactive } from 'vue'

// 大型嵌套数据，不需要深层响应式
const state = shallowReactive({
  users: Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    profile: {
      avatar: `https://picsum.photos/${i}`,
      bio: `这是用户 ${i} 的简介`
    }
  }))
})

// 替换整个数组 → 响应式
state.users = [] // ✅ 触发更新

// 修改单个元素 → 需要手动触发
state.users[0].name = 'Updated' // ❌ 不触发更新
// 解决：替换整个数组
state.users = [...state.users] // ✅ 触发更新
```

### 2. 第三方库数据存储

```javascript
import { shallowReactive } from 'vue'
import * as echarts from 'echarts'

const chartStore = shallowReactive({
  instances: new Map(), // Map 对象不需要深层响应式
  options: {}           // ECharts 配置通常是大型对象
})

// 添加图表实例（不需要深层追踪）
chartStore.instances.set('main', echarts.init(dom))

// 触发更新：替换整个 Map
chartStore.instances = new Map(chartStore.instances)
```

### 3. 不需要深层追踪的配置

```javascript
import { shallowReactive } from 'vue'

const appConfig = shallowReactive({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: {
    darkMode: true,
    i18n: true,
    analytics: {
      trackingId: 'UA-123456'
    }
  }
})

// 修改根级属性 → 响应式
appConfig.timeout = 10000 // ✅ 触发更新

// 修改嵌套属性 → 不触发
appConfig.features.darkMode = false // ❌

// 替换整个 features → 响应式
appConfig.features = { ...appConfig.features, darkMode: false } // ✅
```

### 4. 不可变数据集合

```javascript
import { shallowReactive, markRaw } from 'vue'
import { List, Map as ImmutableMap } from 'immutable'

const store = shallowReactive({
  data: ImmutableMap({
    users: List([])
  })
})

// Immutable.js 数据结构不需要 Vue 的深层响应式
// 只需要追踪 data 属性的替换
store.data = store.data.set('users', List([{ name: '张三' }])) // ✅
```

### 5. 组件间共享的大型状态

```javascript
// store.js
import { shallowReactive } from 'vue'

export const dataTableStore = shallowReactive({
  rows: [],
  columns: [],
  filters: {},
  pagination: { page: 1, pageSize: 20 }
})

// 更新数据时替换整个引用
export function updateRows(newRows) {
  dataTableStore.rows = newRows // ✅ 触发更新
}

export function updatePagination(partial) {
  dataTableStore.pagination = { ...dataTableStore.pagination, ...partial } // ✅
}
```

### 6. 与 ref 配合实现深层响应

```javascript
import { shallowReactive, ref } from 'vue'

const state = shallowReactive({
  // 根级属性是 ref → 可以实现深层响应
  users: ref([]),
  settings: ref({})
})

// 通过 ref 的 .value 修改 → 触发更新
state.users.value.push({ name: '张三' }) // ✅ 触发更新
state.settings.value.theme = 'dark' // ✅ 触发更新
```

## 注意事项

### 1. 嵌套对象不是响应式的

```javascript
import { shallowReactive, watch } from 'vue'

const state = shallowReactive({
  nested: { count: 0 }
})

watch(() => state.nested.count, (val) => {
  console.log('changed')
})

state.nested.count++ // ❌ watch 不会触发
// 因为 state.nested 是普通对象，不是 Proxy
```

### 2. 避免在模板中直接依赖嵌套属性

```vue
<template>
  <!-- ⚠️ count 变化时不会触发视图更新 -->
  <p>{{ state.nested.count }}</p>

  <!-- ✅ 替换整个嵌套对象会更新 -->
  <p>{{ state.foo }}</p>
</template>

<script setup>
import { shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: { count: 0 }
})
</script>
```

### 3. 与 reactive 混用的问题

```javascript
import { reactive, shallowReactive } from 'vue'

const shallow = shallowReactive({
  // ❌ 不要在 shallowReactive 中使用 reactive
  // reactive 创建的对象会被自动解包，失去深层响应
  nested: reactive({ count: 0 })
})

// 建议统一使用策略
// 方案一：全部使用 reactive
const deep = reactive({ nested: { count: 0 } })

// 方案二：shallowReactive + 替换引用
const shallow2 = shallowReactive({ nested: { count: 0 } })
shallow2.nested = { count: 1 } // 替换整个对象
```

### 4. triggerRef 不适用于 shallowReactive

```javascript
import { shallowReactive, triggerRef } from 'vue'

const state = shallowReactive({
  items: [{ name: 'A' }]
})

state.items[0].name = 'B' // ❌ 不触发更新

// ⚠️ triggerRef 只适用于 shallowRef，不适用于 shallowReactive
// triggerRef(state) // 不生效

// ✅ 正确方式：替换引用
state.items = [...state.items]
```

## 最佳实践

1. **明确使用场景**：只在确实不需要深层响应式时使用，如大型数据、第三方库数据
2. **替换而非修改**：更新嵌套数据时，替换整个对象的引用而不是修改属性
3. **配合 ref**：需要某个嵌套属性响应式时，可以将该属性声明为 `ref`
4. **避免混用**：不要在 `shallowReactive` 中嵌套 `reactive` 对象
5. **默认用 reactive**：大多数情况下使用 `reactive` 即可，只在有明确性能需求时使用 `shallowReactive`
