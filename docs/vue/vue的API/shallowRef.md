# shallowRef

## 作用
`shallowRef()` 创建一个 ref，但只有 `.value` 的访问是响应式的，而 `.value` 内部的深层对象不会被转换为响应式。这对于优化大型不可变数据结构的性能很有用。

## 用法

### 基本用法

```javascript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({
  count: 0,
  nested: {
    value: 'hello'
  }
})

// ✅ 替换整个 .value 会触发更新
state.value = {
  count: 1,
  nested: { value: 'world' }
}

// ❌ 修改内部属性不会触发更新
state.value.count++ // 不会触发更新
state.value.nested.value = 'changed' // 不会触发更新
```

### 触发更新

```javascript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({
  count: 0
})

// 修改内部属性
state.value.count = 1

// 手动触发更新
triggerRef(state) // 强制更新

// 或者替换整个对象
state.value = { ...state.value }
```

### 与 ref 的对比

```javascript
import { ref, shallowRef } from 'vue'

// ref: 深层响应式
const deep = ref({
  count: 0,
  nested: {
    value: 'hello'
  }
})

deep.value.count++ // ✅ 触发更新
deep.value.nested.value = 'changed' // ✅ 触发更新

// shallowRef: 只有 .value 访问是响应式的
const shallow = shallowRef({
  count: 0,
  nested: {
    value: 'hello'
  }
})

shallow.value.count++ // ❌ 不触发更新
shallow.value.nested.value = 'changed' // ❌ 不触发更新
```

### 大型数据结构

```javascript
import { shallowRef } from 'vue'

// 大型数据列表
const largeList = shallowRef([])

// 添加大量数据
const newData = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  data: /* 复杂对象 */
}))

// ✅ 只在替换时触发更新
largeList.value = newData

// ❌ 修改内部不会触发（性能优化）
largeList.value[0].data = 'changed'
```

### 不可变数据模式

```javascript
import { shallowRef } from 'vue'

const state = shallowRef({
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
})

// 更新用户（不可变方式）
function updateUser(id, newName) {
  state.value = {
    ...state.value,
    users: state.value.users.map(user =>
      user.id === id ? { ...user, name: newName } : user
    )
  }
}

// ✅ 替换整个对象会触发更新
updateUser(1, 'Alice Updated')
```

### 与 readonly 配合

```javascript
import { shallowRef, readonly } from 'vue'

const internalState = {
  count: 0,
  data: {}
}

const state = shallowRef(readonly(internalState))

// 可以替换整个值
state.value = readonly({ count: 1, data: {} })

// 但不能修改内部（readonly 保护）
```

### TypeScript 类型支持

```typescript
import { shallowRef } from 'vue'

interface User {
  id: number
  name: string
  profile: {
    age: number
    email: string
  }
}

const user = shallowRef<User>({
  id: 1,
  name: 'Vue',
  profile: {
    age: 3,
    email: 'vue@example.com'
  }
})

// 类型正确推导
user.value.name = 'React' // 类型正确
```

### 组件间传递

```vue
<!-- 父组件 -->
<script setup>
import { shallowRef } from 'vue'

const largeData = shallowRef(/* 大型数据 */)

function updateData() {
  // 整体替换
  largeData.value = getNewData()
}
</script>

<template>
  <Child :data="largeData" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps(['data'])

// props.data 是 shallowRef，修改内部不会触发父组件更新
props.data.someProperty = 'value' // 不会触发更新
</script>
```

### 在组合函数中使用

```javascript
// useLargeData.js
import { shallowRef } from 'vue'

export function useLargeData(initialData) {
  const data = shallowRef(initialData)

  function update(newData) {
    // 整体替换
    data.value = newData
  }

  function mutate(fn) {
    // 修改后手动触发
    fn(data.value)
    triggerRef(data)
  }

  return {
    data,
    update,
    mutate
  }
}
```

## 注意事项

### 1. 深层属性不响应式

```javascript
const state = shallowRef({
  nested: {
    value: 1
  }
})

// ❌ 不会触发更新
state.value.nested.value = 2

// ✅ 需要手动触发
triggerRef(state)

// 或替换整个对象
state.value = {
  nested: { value: 2 }
}
```

### 2. 解构问题

```javascript
const state = shallowRef({
  count: 0,
  message: 'Hello'
})

// 解构会失去与原 ref 的联系
const { count, message } = state.value

count++ // 不影响 state.value，也不触发更新
```

### 3. 与 computed 的交互

```javascript
const state = shallowRef({
  count: 0
})

const doubled = computed(() => state.value.count * 2)

// ❌ 修改内部属性不会更新 computed
state.value.count++

// ✅ 需要触发
triggerRef(state)
```

### 4. watch 的行为

```javascript
const state = shallowRef({
  count: 0
})

// ❌ 深层 watch 不会工作
watch(
  () => state.value.count,
  (val) => console.log('count changed:', val)
)

state.value.count++ // 不触发

// ✅ 需要替换整个值
state.value = { count: 1 } // 触发
```

### 5. 在模板中使用

```vue
<script setup>
import { shallowRef } from 'vue'

const state = shallowRef({
  count: 0
})
</script>

<template>
  <!-- ✅ 模板可以读取 -->
  <div>{{ state.count }}</div>

  <!-- ⚠️ 修改内部值不会触发重新渲染 -->
  <button @click="state.count++">
    增加（不会触发更新）
  </button>

  <!-- ✅ 替换整个对象会触发 -->
  <button @click="state = { count: state.count + 1 }">
    增加（会触发更新）
  </button>
</template>
```

### 6. 性能权衡

```javascript
// shallowRef: 适合大型不可变数据
const large = shallowRef(bigImmutableData)

// ref: 适合需要深层响应式的数据
const small = ref({
  count: 0,
  message: 'Hello'
})
```

### 7. v-model 的限制

```vue
<script setup>
import { shallowRef } from 'vue'

const user = shallowRef({
  name: 'Vue',
  email: 'vue@example.com'
})
</script>

<template>
  <!-- ⚠️ v-model 绑定深层属性可能不会按预期工作 -->
  <input v-model="user.name" />
  <!-- 修改可能不会触发更新 -->
</template>
```

### 8. 与 reactive 嵌套

```javascript
import { shallowRef, reactive } from 'vue'

const inner = reactive({ count: 0 })
const state = shallowRef({ inner })

// ✅ inner 本身是响应式的
state.value.inner.count++ // 触发更新

// 但 state.value 本身不是深层响应式的
state.value.someNewProperty = 'value' // 不触发更新
```

## 使用场景

### 1. 大型列表渲染

```vue
<script setup>
import { shallowRef } from 'vue'

// 大型数据列表（10000+ 项）
const items = shallowRef(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: 'Long description...',
    metadata: { /* 复杂对象 */ }
  }))
)

// 批量更新
function updateItems() {
  // ✅ 整体替换才触发更新
  items.value = items.value.map(item => ({
    ...item,
    name: `Updated ${item.name}`
  }))
}

// 添加项目
function addItem() {
  items.value = [...items.value, {
    id: items.value.length,
    name: 'New Item'
  }]
}
</script>

<template>
  <div>
    <button @click="updateItems">批量更新</button>
    <button @click="addItem">添加</button>
    <virtual-scroller :items="items">
      <!-- 列表渲染 -->
    </virtual-scroller>
  </div>
</template>
```

### 2. 不可变状态管理

```javascript
import { shallowRef } from 'vue'

// 创建不可变状态
const state = shallowRef({
  users: [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 }
  ]
})

// 不可变更新
function updateUser(id, updates) {
  state.value = {
    ...state.value,
    users: state.value.users.map(user =>
      user.id === id ? { ...user, ...updates } : user
    )
  }
}

function addUser(user) {
  state.value = {
    ...state.value,
    users: [...state.value.users, user]
  }
}

function deleteUser(id) {
  state.value = {
    ...state.value,
    users: state.value.users.filter(user => user.id !== id)
  }
}
```

### 3. 表单初始值

```vue
<script setup>
import { shallowRef } from 'vue'

// 初始值（不需要深层响应式）
const initialValues = shallowRef({
  username: '',
  email: '',
  profile: {
    firstName: '',
    lastName: '',
    bio: ''
  }
})

// 当前表单值（使用 ref）
const form = ref({
  username: '',
  email: '',
  profile: {
    firstName: '',
    lastName: '',
    bio: ''
  }
})

// 重置表单
function resetForm() {
  form.value = { ...initialValues.value }
}

// 加载初始值
onMounted(async () => {
  const data = await fetchInitialValues()
  initialValues.value = data
  resetForm()
})
</script>
```

### 4. 图表数据

```vue
<script setup>
import { shallowRef } from 'vue'

const chartData = shallowRef({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    label: 'Sales',
    data: [12, 19, 3, 5, 2],
    backgroundColor: 'rgba(75, 192, 192, 0.2)'
  }]
})

function updateChart(newData) {
  // 整体替换数据
  chartData.value = {
    ...chartData.value,
    datasets: [{
      ...chartData.value.datasets[0],
      data: newData
    }]
  }
}
</script>

<template>
  <Chart :data="chartData" />
</template>
```

### 5. 配置对象

```javascript
import { shallowRef } from 'vue'

// 配置不需要深层响应式
const config = shallowRef({
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  },
  features: {
    darkMode: true,
    notifications: true
  },
  limits: {
    maxItems: 100,
    maxSize: 1024 * 1024
  }
})

// 更新配置
function updateConfig(path, value) {
  const newConfig = { ...config.value }
  // 深度克隆并更新路径
  set(newConfig, path, value)
  config.value = newConfig
}
```

### 6. 缓存数据

```javascript
import { shallowRef } from 'vue'

const cache = shallowRef(new Map())

function getCached(key) {
  return cache.value.get(key)
}

function setCache(key, value) {
  // 创建新 Map 实例触发更新
  const newCache = new Map(cache.value)
  newCache.set(key, value)
  cache.value = newCache
}

function clearCache() {
  cache.value = new Map()
}
```

### 7. 历史记录

```javascript
import { shallowRef } from 'vue'

const history = shallowRef([])

function pushState(state) {
  history.value = [...history.value, state]
}

function undo() {
  if (history.value.length > 1) {
    history.value = history.value.slice(0, -1)
    return history.value[history.value.length - 1]
  }
}

function redo(state) {
  history.value = [...history.value, state]
}
```

### 8. 树形数据结构

```vue
<script setup>
import { shallowRef } from 'vue'

const tree = shallowRef({
  id: 'root',
  name: 'Root',
  children: [
    {
      id: '1',
      name: 'Node 1',
      children: [
        { id: '1-1', name: 'Node 1-1', children: [] }
      ]
    },
    {
      id: '2',
      name: 'Node 2',
      children: []
    }
  ]
})

function addNode(parentId, node) {
  function traverse(nodes) {
    return nodes.map(n => {
      if (n.id === parentId) {
        return {
          ...n,
          children: [...n.children, node]
        }
      }
      if (n.children.length > 0) {
        return {
          ...n,
          children: traverse(n.children)
        }
      }
      return n
    })
  }

  tree.value = {
    ...tree.value,
    children: traverse(tree.value.children)
  }
}
</script>
```

### 9. 性能优化的渲染

```vue
<script setup>
import { shallowRef, watchEffect } from 'vue'

const renderer = shallowRef(null)

watchEffect(() => {
  // 只在 renderer 替换时重新初始化
  if (renderer.value) {
    renderer.value.init()
  }
})

function switchRenderer(newRenderer) {
  // 替换整个渲染器
  renderer.value = newRenderer
}
</script>
```

### 10. DOM 引用

```vue
<script setup>
import { shallowRef } from 'vue'

// 对于 DOM 引用，shallowRef 比 ref 更高效
const canvasRef = shallowRef(null)

onMounted(() => {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    // 初始化 canvas
  }
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

## shallowRef vs ref

| 特性 | shallowRef | ref |
|-----|-----------|-----|
| 深层响应式 | 否 | 是 |
| 性能 | 更好 | 较差（大型数据）|
| 适用场景 | 大型不可变数据 | 一般响应式数据 |
| 更新触发 | 替换 .value | 任何属性修改 |
| 使用复杂度 | 需要手动触发 | 自动 |

## 最佳实践

1. **大型数据**：对于大型数据结构使用 shallowRef
2. **不可变数据**：配合不可变更新模式使用
3. **性能优化**：在性能敏感的场景使用
4. **DOM 引用**：DOM 元素引用可使用 shallowRef
5. **明确使用**：在使用处添加注释说明原因
