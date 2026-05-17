# readonly

## 作用
`readonly()` 接收一个对象（响应式或普通）并返回一个只读的原始代理。这意味着任何对返回对象的修改尝试都会失败并发出警告。

## 用法

### 基本用法

```javascript
import { reactive, readonly } from 'vue'

const original = reactive({
  count: 0,
  message: 'Hello'
})

// 创建只读代理
const copy = readonly(original)

// ✅ 可以读取
console.log(copy.count) // 0

// ❌ 尝试修改会报警告
copy.count = 1 // 警告: Set operation on key "count" failed: target is readonly

// ✅ 原始对象仍然可以修改
original.count = 1
console.log(copy.count) // 1（同步更新）
```

### 对普通对象使用

```javascript
import { readonly } from 'vue'

const original = {
  count: 0,
  message: 'Hello'
}

const copy = readonly(original)

// 尝试修改会报警告
copy.count = 1 // 警告

// 原始对象仍然可以修改（但不是响应式的）
original.count = 1
```

### 对 ref 使用

```javascript
import { ref, readonly } from 'vue'

const count = ref(0)

// 创建只读 ref
const readonlyCount = readonly(count)

console.log(readonlyCount.value) // 0

// ❌ 无法修改
readonlyCount.value = 1 // 警告

// ✅ 原始 ref 可以修改
count.value = 1
console.log(readonlyCount.value) // 1
```

### 对 computed 使用

```javascript
import { computed, readonly } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

// computed 默认就是只读的
const readonlyDoubled = readonly(doubled)

// 尝试修改会报错
readonlyDoubled.value = 10 // 错误
```

### 嵌套对象

```javascript
import { reactive, readonly } from 'vue'

const original = reactive({
  user: {
    name: 'Vue',
    age: 3
  },
  settings: {
    theme: 'light'
  }
})

const copy = readonly(original)

// 所有嵌套属性都是只读的
copy.user.name = 'React' // 警告
copy.settings.theme = 'dark' // 警告
```

### 在 provide 中使用

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, reactive, readonly } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// 提供只读版本，防止后代组件修改
provide('state', readonly(state))

// 自己可以修改
function increment() {
  state.count++
}
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const state = inject('state')

// ✅ 可以读取
console.log(state.count)

// ❌ 尝试修改会报警告
state.count++ // 警告
</script>
```

### 返回类型检查

```javascript
import { reactive, readonly, isReadonly } from 'vue'

const original = reactive({ count: 0 })
const copy = readonly(original)

console.log(isReadonly(copy)) // true
console.log(isReadonly(original)) // false
```

### TypeScript 支持

```typescript
import { reactive, readonly } from 'vue'

interface User {
  name: string
  age: number
}

const original: User = reactive({
  name: 'Vue',
  age: 3
})

// 返回 Readonly<User>
const copy: Readonly<User> = readonly(original)

// 类型系统会阻止修改
copy.name = 'React' // TypeScript 错误
```

### 数组

```javascript
import { reactive, readonly } from 'vue'

const original = reactive([1, 2, 3])
const copy = readonly(original)

// ❌ 数组修改操作都会被阻止
copy.push(4) // 警告
copy.pop() // 警告
copy[0] = 10 // 警告
copy.splice(1, 1) // 警告

// ✅ 可以读取
console.log(copy[0]) // 1
console.log(copy.length) // 3
```

### Map 和 Set

```javascript
import { reactive, readonly } from 'vue'

const originalMap = reactive(new Map([
  ['key1', 'value1'],
  ['key2', 'value2']
]))

const readonlyMap = readonly(originalMap)

// ❌ 修改操作会被阻止
readonlyMap.set('key3', 'value3') // 警告
readonlyMap.delete('key1') // 警告
readonlyMap.clear() // 警告

// ✅ 可以读取
console.log(readonlyMap.get('key1')) // 'value1'
console.log(readonlyMap.has('key1')) // true
```

## 注意事项

### 1. 不是深度不可变

```javascript
const original = reactive({
  nested: {
    value: 1
  }
})

const copy = readonly(original)

// ⚠️ 如果嵌套对象被提取出来
const nested = copy.nested

// nested 对象本身仍然是只读的
nested.value = 2 // 警告

// 但如果原始对象中的嵌套对象被替换
// copy 会反映这个变化
```

### 2. 原始对象修改会同步

```javascript
const original = reactive({ count: 0 })
const copy = readonly(original)

original.count = 1
console.log(copy.count) // 1（同步反映变化）
```

### 3. 只阻止直接修改

```javascript
const original = reactive({
  data: [{ id: 1, name: 'Item 1' }]
})

const copy = readonly(original)

// ❌ 直接修改数组被阻止
copy.data.push({ id: 2, name: 'Item 2' }) // 警告

// ⚠️ 但如果数组元素被替换
const item = copy.data[0]
item.name = 'Modified' // 如果 item 是响应式的，可能不会警告

// ✅ 真正的深度不可变
import { markRaw } from 'vue'
const deepCopy = readonly(markRaw(JSON.parse(JSON.stringify(original))))
```

### 4. 与 Object.freeze 的区别

```javascript
// Object.freeze: 冻结对象，无法修改
const frozen = Object.freeze({ count: 0 })
frozen.count = 1 // 静默失败，无警告

// readonly: 响应式只读代理，有警告
const ro = readonly(reactive({ count: 0 }))
ro.count = 1 // 开发环境警告

// readonly 仍然是响应式的，Object.freeze 不是
```

### 5. 性能考虑

```javascript
// readonly 会创建代理，有一定开销
const largeObject = reactive({ /* 大量数据 */ })

// 对于大型数据，考虑其他方案
// 或确保在适当的时机使用
```

### 6. 与 shallowReadonly 的区别

```javascript
const original = reactive({
  nested: {
    value: 1
  }
})

// readonly: 深度只读
const deepRo = readonly(original)
deepRo.nested.value = 1 // 警告

// shallowReadonly: 浅层只读
import { shallowReadonly } from 'vue'
const shallowRo = shallowReadonly(original)
shallowRo.nested.value = 1 // 不警告（嵌套可修改）
shallowRo.nested = {} // 警告（顶层属性只读）
```

### 7. 解构行为

```javascript
const state = reactive({
  count: 0,
  message: 'Hello'
})

const readonlyState = readonly(state)

// 解构会失去响应性和只读保护
const { count } = readonlyState
count = 1 // 不警告（已脱离代理）

// ✅ 使用 toRefs 保持只读
import { toRefs } from 'vue'
const { count: roCount } = toRefs(readonlyState)
roCount.value = 1 // 警告
```

### 8. 组件 props 是只读的

```vue
<script setup>
const props = defineProps({
  count: Number,
  message: String
})

// ❌ props 自动是只读的
props.count = 1 // 警告

// ✅ 创建本地副本
const localCount = ref(props.count)
</script>
```

## 使用场景

### 1. 保护共享状态

```javascript
// store.js
import { reactive, readonly } from 'vue'

const state = reactive({
  user: null,
  isLoggedIn: false
})

// 导出只读版本
export const readonlyState = readonly(state)

// 导出修改方法
export function login(credentials) {
  // 登录逻辑
  state.user = userData
  state.isLoggedIn = true
}

export function logout() {
  state.user = null
  state.isLoggedIn = false
}

// 组件中使用
<script setup>
import { readonlyState } from './store'

// 只能读取，不能修改
console.log(readonlyState.user)
readonlyState.isLoggedIn = true // 警告
</script>
```

### 2. 保护传递的数据

```vue
<script setup>
import { readonly } from 'vue'

const props = defineProps({
  config: Object
})

// 将 props 转为只读后传递给子组件
const readonlyConfig = readonly(props.config)

// <Child :config="readonlyConfig" />
</script>
```

### 3. API 响应数据

```javascript
import { ref, readonly } from 'vue'

const apiData = ref(null)

async function fetchData() {
  const response = await fetch('/api/data')
  const data = await response.json()

  // 存储数据
  apiData.value = data

  // 返回只读版本
  return readonly(data)
}

// 使用
const data = await fetchData()
data.someProperty = 'value' // 警告
```

### 4. 配置对象保护

```javascript
import { reactive, readonly } from 'vue'

// 默认配置
const defaultConfig = reactive({
  theme: 'light',
  language: 'zh-CN',
  pageSize: 10
})

// 用户配置
const userConfig = reactive({
  theme: 'dark'
})

// 提供只读的默认配置
export const getDefaultConfig = () => readonly(defaultConfig)

// 组件中使用
<script setup>
import { getDefaultConfig } from './config'

const config = getDefaultConfig()

config.theme = 'custom' // 警告
</script>
```

### 5. 状态切片保护

```javascript
import { reactive, readonly } from 'vue'

const appState = reactive({
  user: { name: 'Vue', age: 3 },
  settings: { theme: 'light' },
  ui: { sidebarOpen: true }
})

// 导出只读的状态切片
export const useUserState = () => readonly(appState.user)
export const useSettings = () => readonly(appState.settings)
export const useUIState = () => readonly(appState.ui)
```

### 6. 防止意外修改

```vue
<script setup>
import { reactive, readonly, provide } from 'vue'

const formState = reactive({
  username: '',
  email: '',
  errors: {}
})

// 提供只读版本给子组件
provide('formState', readonly(formState))

// 只有父组件可以修改
function updateField(field, value) {
  formState[field] = value
}
</script>
```

### 7. 不可变数据模式

```javascript
import { reactive, readonly } from 'vue'

function createState(initialState) {
  const state = reactive(initialState)

  return {
    // 只读状态
    get: () => readonly(state),

    // 更新方法
    set: (key, value) => {
      state[key] = value
    },

    // 批量更新
    update: (updates) => {
      Object.assign(state, updates)
    },

    // 重置
    reset: () => {
      Object.assign(state, initialState)
    }
  }
}

// 使用
const store = createState({ count: 0, message: 'Hello' })

const state = store.get()
state.count = 1 // 警告

store.set('count', 1) // ✅ 正确
```

### 8. 表单初始值保护

```vue
<script setup>
import { reactive, readonly, computed } from 'vue'

const initialValues = reactive({
  username: '',
  email: '',
  age: 0
})

const formValues = reactive({ ...initialValues })

// 只读的初始值
const readonlyInitials = readonly(initialValues)

// 检查是否有修改
const isDirty = computed(() => {
  return Object.keys(formValues).some(
    key => formValues[key] !== readonlyInitials[key]
  )
})

function resetForm() {
  Object.assign(formValues, initialValues)
}
</script>
```

### 9. 列表数据保护

```vue
<script setup>
import { ref, readonly, computed } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

// 提供只读列表
const readonlyItems = readonly(items)

// 通过方法修改，而不是直接修改
function addItem(name) {
  items.value.push({ id: Date.now(), name })
}

function removeItem(id) {
  items.value = items.value.filter(item => item.id !== id)
}

// 导出给子组件
defineExpose({
  items: readonlyItems,
  addItem,
  removeItem
})
</script>
```

### 10. 类型安全的只读接口

```typescript
// types.ts
export interface Config {
  theme: 'light' | 'dark'
  language: string
  pageSize: number
}

export interface ConfigStore {
  get(): Readonly<Config>
  set<K extends keyof Config>(key: K, value: Config[K]): void
}

// store.ts
import { reactive } from 'vue'

export function createConfigStore(initial: Config): ConfigStore {
  const config = reactive(initial)

  return {
    get: () => config as Readonly<Config>,
    set: (key, value) => {
      config[key] = value
    }
  }
}

// main.ts
const configStore = createConfigStore({
  theme: 'light',
  language: 'zh-CN',
  pageSize: 10
})

// 使用
const config = configStore.get()
config.theme = 'dark' // TypeScript 错误

configStore.set('theme', 'dark') // ✅ 正确
```

## readonly vs 其他只读方案

| 方案 | 响应式 | 警告 | 用途 |
|-----|--------|------|------|
| readonly | 是 | 是 | Vue 响应式只读 |
| Object.freeze | 否 | 否 | 普通对象冻结 |
| shallowReadonly | 是 | 是 | 浅层只读 |
| as Readonly | 是（类型） | 否 | TypeScript 级别 |

## 最佳实践

1. **保护共享状态**：导出 readonly 版本，只提供修改方法
2. **组件通信**：使用 readonly 保护 props 和 provide 的数据
3. **API 数据**：返回 readonly 版本的 API 响应
4. **类型安全**：配合 TypeScript 实现编译时检查
5. **文档化**：明确说明哪些是只读的，哪些可修改
