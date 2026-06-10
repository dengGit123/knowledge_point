### markRaw

> 📖 [官方文档 - markRaw](https://cn.vuejs.org/api/reactivity-advanced#markraw)

---

### 一、概述

`markRaw()` 是 Vue 3 提供的一个响应式高级 API，用于**标记一个对象，使其永远不会被转换为响应式代理对象**。被标记后的对象即使传入 `reactive()`、`ref()` 或作为响应式对象的属性，也依然保持原始状态，Vue 不会对其做任何响应式包装。

简单来说：**给对象贴上一张"禁止响应式"的标签，Vue 遇到它就跳过，不再拦截和代理。**

### 二、核心原理

Vue 3 的响应式系统基于 `Proxy` 代理实现。当你把一个普通对象传给 `reactive()` 时，Vue 会递归地遍历对象的所有嵌套属性，将它们全部包装成响应式代理。这个过程会带来两方面的代价：

1. **性能开销**：深层嵌套的对象需要递归代理，大量数据时会产生明显的性能损耗
2. **功能冲突**：某些对象（如 DOM 元素、第三方库实例）本身不适合被代理，代理后可能导致功能异常

`markRaw()` 的工作原理非常简单：它在对象上添加一个不可枚举的 `__v_skip` 属性，值为 `true`。Vue 的响应式系统在处理对象时，会先检查这个标记，如果发现 `__v_skip === true`，就直接跳过，不做任何代理处理。

```ts
// markRaw 的简化实现原理
function markRaw<T extends object>(value: T): T {
  // 在对象上设置不可枚举的标记属性
  Object.defineProperty(value, '__v_skip', {
    configurable: true,
    enumerable: false, // 不可枚举，不影响对象正常使用
    value: true        // Vue 检测到此标记则跳过响应式转换
  })
  return value
}
```

> 💡 **提示：** 可以把 `markRaw()` 类比为给包裹贴上"免检"标签。快递站（Vue 响应式系统）看到这个标签后，就不再拆箱检查，直接放行。

### 三、详细用法

#### 1. 基本用法

```ts
import { reactive, markRaw } from 'vue'

// 标记对象，使其永远不会被转为响应式
const rawObj = markRaw({ count: 0, name: 'hello' })

// 即使放入 reactive 中，rawObj 也不会被代理
const state = reactive({
  data: rawObj
})

// rawObj 和 state.data 指向同一个引用，没有被代理
console.log(state.data === rawObj) // true
console.log(state.data) // { count: 0, name: 'hello' } （原始对象，非 Proxy）

// ✅ 修改 rawObj 的属性不会触发视图更新
rawObj.count++
// 模板中使用 state.data.count 不会自动更新
```

#### 2. 进阶用法

##### 2.1 标记第三方类实例

```vue
<script setup lang="ts">
import { reactive, markRaw, onMounted, ref } from 'vue'

// 定义图表实例的类型
interface ChartInstance {
  destroy: () => void
  update: (data: unknown) => void
  resize: () => void
}

const chartRef = ref<HTMLCanvasElement | null>(null)

const state = reactive<{
  chart: ChartInstance | null
  theme: string
}>({
  chart: null,
  theme: 'light'
})

onMounted(() => {
  if (!chartRef.value) return

  // ✅ 使用 markRaw 标记第三方库实例，避免被 Vue 代理导致内部功能异常
  state.chart = markRaw(
    new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: ['Vue', 'Angular', 'Svelte'],
        datasets: [{ label: '满意度', data: [95, 72, 88] }]
      }
    }) as unknown as ChartInstance
  )
})
</script>
```

##### 2.2 在组件选项上使用

```vue
<script setup lang="ts">
import { markRaw, ref } from 'vue'
import type { Component } from 'vue'
import UserList from './UserList.vue'
import RoleList from './RoleList.vue'
import PermissionList from './PermissionList.vue'

// ✅ 动态组件场景：将组件对象标记为 raw，避免不必要的代理开销
interface TabItem {
  name: string
  component: Component
}

const tabs: TabItem[] = [
  { name: '用户管理', component: markRaw(UserList) },
  { name: '角色管理', component: markRaw(RoleList) },
  { name: '权限管理', component: markRaw(PermissionList) }
]

const activeTab = ref(tabs[0])
</script>

<template>
  <div class="tab-container">
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: activeTab.name === tab.name }"
        @click="activeTab = tab"
      >
        {{ tab.name }}
      </button>
    </div>
    <component :is="activeTab.component" />
  </div>
</template>
```

##### 2.3 搭配 shallowRef 使用

```ts
import { shallowRef, markRaw, triggerRef } from 'vue'

interface Config {
  mapInstance: unknown
  version: string
}

// ✅ shallowRef + markRaw 双重保障
const config = shallowRef<Config>({
  mapInstance: markRaw(new MapLibreGLMap()),
  version: '1.0.0'
})

// 更新非 raw 属性后手动触发更新
function updateVersion(newVersion: string) {
  if (config.value) {
    config.value.version = newVersion
    triggerRef(config) // 手动通知 shallowRef 更新
  }
}
```

##### 2.4 标记大型静态数据集

```vue
<script setup lang="ts">
import { reactive, markRaw, ref, computed } from 'vue'

// ✅ 万级数据不需要响应式，标记后可大幅降低初始化时间
interface CityData {
  id: number
  name: string
  province: string
  population: number
}

const allCities = markRaw<CityData[]>(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `城市${i}`,
    province: `省份${Math.floor(i / 100)}`,
    population: Math.floor(Math.random() * 10000000)
  }))
)

const state = reactive({
  cities: allCities, // 不会被递归代理
  keyword: ''
})

// 通过 computed 实现搜索（computed 本身是响应式的）
const filteredCities = computed(() =>
  state.cities.filter(city => city.name.includes(state.keyword))
)
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `value` | `T extends object` | 需要标记的对象，必须是引用类型（对象、数组、函数、类实例等） |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| 返回值 | `T` | 与传入的对象完全相同的引用（不会创建新对象） |

> 💡 **提示：** `markRaw()` 接收任何对象类型，但**原始类型**（`string`、`number`、`boolean` 等）传入后会被原样返回，因为原始类型本身就不会被 Vue 做响应式代理。

### 四、实现效果

```ts
import { reactive, ref, markRaw, isReactive, toRaw } from 'vue'

// --- 效果一：阻止响应式转换 ---
const plainObj = { name: '张三', age: 25 }
const markedObj = markRaw({ name: '李四', age: 30 })

const state = reactive({
  user1: plainObj,   // 会被转为响应式
  user2: markedObj   // 不会被转为响应式
})

console.log(isReactive(state.user1)) // true  — 被 Proxy 包装了
console.log(isReactive(state.user2)) // false — 保持了原始对象

// --- 效果二：保持引用相等 ---
console.log(state.user2 === markedObj) // true  — 同一个引用
console.log(state.user1 === plainObj)  // false — state.user1 是代理对象

// --- 效果三：嵌套传递也不会被代理 ---
const wrapper = reactive({
  nested: {
    inner: markedObj // 嵌套到深层也不会被代理
  }
})

console.log(isReactive(wrapper))              // true
console.log(isReactive(wrapper.nested))        // true
console.log(isReactive(wrapper.nested.inner))  // false — 被 markRaw 保护

// --- 效果四：ref 中同样生效 ---
const rawArr = markRaw([1, 2, 3])
const countRef = ref(rawArr)

console.log(isReactive(countRef.value))  // false — 数组没有被代理
console.log(countRef.value === rawArr)   // true  — 引用不变
```

### 五、使用场景

#### 1. 第三方库实例

第三方库（如图表库、地图库、编辑器）内部维护了自己的状态和原型链，被 Vue 代理后可能破坏其内部逻辑。

```vue
<script setup lang="ts">
import { reactive, markRaw, onMounted, onBeforeUnmount, ref } from 'vue'
import Editor from 'wangeditor'

const editorRef = ref<HTMLElement | null>(null)

const state = reactive<{
  editor: InstanceType<typeof Editor> | null
  content: string
}>({
  editor: null,
  content: ''
})

onMounted(() => {
  if (!editorRef.value) return

  // ✅ 编辑器实例必须 markRaw，否则内部事件系统会被破坏
  state.editor = markRaw(new Editor(editorRef.value))
  state.editor.create()
})

onBeforeUnmount(() => {
  state.editor?.destroy()
})
</script>

<template>
  <div ref="editorRef"></div>
</template>
```

#### 2. 动态组件映射

在动态组件切换场景中，组件定义对象不需要响应式追踪。

```vue
<script setup lang="ts">
import { markRaw, ref, type Component } from 'vue'
import HomeView from './HomeView.vue'
import AboutView from './AboutView.vue'
import ContactView from './ContactView.vue'

interface RouteConfig {
  path: string
  name: string
  component: Component
}

// ✅ 组件定义是静态的，不需要响应式
const routes: RouteConfig[] = [
  { path: '/', name: '首页', component: markRaw(HomeView) },
  { path: '/about', name: '关于', component: markRaw(AboutView) },
  { path: '/contact', name: '联系', component: markRaw(ContactView) }
]

const currentPath = ref('/')

const currentComponent = ref(
  routes.find(r => r.path === currentPath.value)?.component
)

function navigate(path: string) {
  currentPath.value = path
  currentComponent.value = routes.find(r => r.path === path)?.component
}
</script>

<template>
  <nav>
    <a
      v-for="route in routes"
      :key="route.path"
      :class="{ active: currentPath === route.path }"
      @click.prevent="navigate(route.path)"
    >
      {{ route.name }}
    </a>
  </nav>
  <component :is="currentComponent" />
</template>
```

#### 3. 大型静态数据

省略不必要的深层响应式代理，减少内存和 CPU 开销。

```vue
<script setup lang="ts">
import { reactive, markRaw, computed } from 'vue'

interface TreeNode {
  id: string
  label: string
  children: TreeNode[]
}

// ✅ 从后端获取的大型树形数据，不需要响应式追踪每一层
const staticTreeData = markRaw<TreeNode>({
  id: 'root',
  label: '根节点',
  children: [
    { id: '1', label: '节点1', children: [] },
    { id: '2', label: '节点2', children: [
      { id: '2-1', label: '节点2-1', children: [] }
    ]}
  ]
})

const state = reactive({
  tree: staticTreeData,
  expandedKeys: new Set<string>(['root'])
})

const nodeCount = computed(() => {
  let count = 0
  const traverse = (node: TreeNode) => {
    count++
    node.children.forEach(traverse)
  }
  traverse(state.tree)
  return count
})
</script>
```

#### 4. WebSocket / EventSource 实例

通信类实例有自己的事件循环和状态管理，不应被 Vue 代理。

```ts
import { reactive, markRaw, onUnmounted } from 'vue'

interface WebSocketState {
  ws: WebSocket | null
  status: 'connecting' | 'connected' | 'disconnected'
  messages: string[]
}

export function useWebSocket(url: string) {
  const state = reactive<WebSocketState>({
    ws: null,
    status: 'disconnected',
    messages: []
  })

  function connect() {
    // ✅ WebSocket 实例使用 markRaw 保护
    state.ws = markRaw(new WebSocket(url))

    state.ws.onopen = () => {
      state.status = 'connected'
    }

    state.ws.onmessage = (event) => {
      state.messages.push(event.data) // messages 是响应式的
    }

    state.ws.onclose = () => {
      state.status = 'disconnected'
    }

    state.status = 'connecting'
  }

  function disconnect() {
    state.ws?.close()
  }

  onUnmounted(disconnect)

  return { state, connect, disconnect }
}
```

#### 5. 函数引用存储

工具函数或回调函数存储在响应式对象中时，不需要对函数做响应式代理。

```ts
import { reactive, markRaw } from 'vue'

interface ValidatorFn {
  (value: unknown): boolean
}

interface FormField {
  value: string
  validators: ValidatorFn[]
  errors: string[]
}

// ✅ 验证函数不需要响应式追踪
const createField = (
  defaultValue: string,
  validators: ValidatorFn[]
): FormField => ({
  value: defaultValue,
  validators: markRaw(validators),
  errors: []
})

const form = reactive({
  username: createField('', [
    (v: unknown) => typeof v === 'string' && v.length >= 3,
    (v: unknown) => typeof v === 'string' && /^[a-zA-Z]+$/.test(v)
  ]),
  email: createField('', [
    (v: unknown) => typeof v === 'string' && v.includes('@')
  ])
})

// 验证函数可以正常调用
form.username.validators.forEach(fn => {
  if (!fn(form.username.value)) {
    form.username.errors.push('校验失败')
  }
})
```

#### 6. 定时器与动画实例

```vue
<script setup lang="ts">
import { reactive, markRaw, onMounted, onBeforeUnmount } from 'vue'

interface AnimationState {
  animator: Animation | null
  isPlaying: boolean
  progress: number
}

const state = reactive<AnimationState>({
  animator: null,
  isPlaying: false,
  progress: 0
})

onMounted(() => {
  const element = document.querySelector('.box') as HTMLElement

  // ✅ Web Animation API 实例用 markRaw 保护
  const animation = element.animate(
    [
      { transform: 'translateX(0px)' },
      { transform: 'translateX(300px)' }
    ],
    { duration: 2000, iterations: Infinity }
  )

  state.animator = markRaw(animation)
  animation.pause()

  animation.onfinish = () => {
    state.isPlaying = false
  }
})

function togglePlay() {
  if (!state.animator) return
  if (state.isPlaying) {
    state.animator.pause()
  } else {
    state.animator.play()
  }
  state.isPlaying = !state.isPlaying
}

onBeforeUnmount(() => {
  state.animator?.cancel()
})
</script>
```

#### 7. DOM 元素引用集合

```vue
<script setup lang="ts">
import { reactive, markRaw, onMounted } from 'vue'

interface FocusableItem {
  el: HTMLElement
  name: string
}

const state = reactive<{
  focusableElements: FocusableItem[]
  currentIndex: number
}>({
  focusableElements: [],
  currentIndex: -1
})

onMounted(() => {
  const container = document.querySelector('.form-container')
  if (!container) return

  const inputs = container.querySelectorAll<HTMLElement>(
    'input, button, select, textarea'
  )

  // ✅ DOM 元素本身就是原生对象，不应被代理
  state.focusableElements = markRaw(
    Array.from(inputs).map((el, index) => ({
      el,
      name: el.getAttribute('name') || `field-${index}`
    }))
  )
})

function focusNext() {
  state.currentIndex =
    (state.currentIndex + 1) % state.focusableElements.length
  state.focusableElements[state.currentIndex].el.focus()
}
</script>
```

#### 8. 配置常量对象

```ts
import { reactive, markRaw } from 'vue'

// ✅ 全局配置对象不会变化，无需响应式
interface ChartConfig {
  colors: string[]
  fontFamily: string
  animation: { duration: number; easing: string }
}

const CHART_CONFIG = markRaw<ChartConfig>({
  colors: ['#42b883', '#35495e', '#ff6b6b', '#feca57'],
  fontFamily: 'Inter, sans-serif',
  animation: { duration: 750, easing: 'easeInOutQuart' }
})

const state = reactive({
  config: CHART_CONFIG,
  selectedChartType: 'bar'
})

// config 不会被代理，selectedChartType 是响应式的
```

#### 9. 不可变历史记录快照

```ts
import { reactive, markRaw } from 'vue'

interface Snapshot {
  timestamp: number
  data: Record<string, unknown>
}

interface HistoryState {
  snapshots: Snapshot[]
  currentIndex: number
}

// ✅ 历史快照一旦生成就不应该被修改，用 markRaw 保护
const history = reactive<HistoryState>({
  snapshots: [],
  currentIndex: -1
})

function takeSnapshot(data: Record<string, unknown>) {
  // 裁剪掉 redo 部分
  history.snapshots = history.snapshots.slice(0, history.currentIndex + 1)

  // 快照数据用 markRaw 标记，防止被响应式代理
  const snapshot = markRaw<Snapshot>({
    timestamp: Date.now(),
    data: { ...data } // 浅拷贝数据
  })

  history.snapshots.push(snapshot)
  history.currentIndex = history.snapshots.length - 1
}

function undo() {
  if (history.currentIndex > 0) {
    history.currentIndex--
    return history.snapshots[history.currentIndex].data
  }
  return null
}

function redo() {
  if (history.currentIndex < history.snapshots.length - 1) {
    history.currentIndex++
    return history.snapshots[history.currentIndex].data
  }
  return null
}
```

#### 10. Worker 实例管理

```ts
import { reactive, markRaw, onUnmounted } from 'vue'

interface WorkerState {
  worker: Worker | null
  status: 'idle' | 'running' | 'error'
  result: unknown
}

export function useWorker(workerUrl: string) {
  const state = reactive<WorkerState>({
    worker: null,
    status: 'idle',
    result: null
  })

  function init() {
    // ✅ Worker 实例有自身的消息机制，不能被 Vue 代理
    state.worker = markRaw(new Worker(workerUrl))

    state.worker.onmessage = (e: MessageEvent) => {
      state.result = e.data   // result 是响应式的
      state.status = 'idle'
    }

    state.worker.onerror = () => {
      state.status = 'error'
    }
  }

  function execute(data: unknown) {
    if (!state.worker) init()
    state.status = 'running'
    state.worker!.postMessage(data)
  }

  onUnmounted(() => {
    state.worker?.terminate()
  })

  return { state, execute }
}
```

### 六、注意事项

1. **标记不可撤销**

> ⚠️ **注意：** 一旦对象被 `markRaw()` 标记，这个标记就是**永久性的、不可撤销的**。没有任何 API 可以移除这个标记。如果后续需要该对象变为响应式，只能重新创建一个新的对象。

```ts
import { reactive, markRaw } from 'vue'

const obj = markRaw({ count: 0 })
const state = reactive({ obj })

// ❌ 无法再让 obj 变为响应式
state.obj.count++ // 不会触发视图更新

// ✅ 如果需要响应式，必须创建新对象
const newObj = { ...obj }
const state2 = reactive({ obj: newObj }) // newObj 是响应式的
```

2. **标记仅影响对象本身**

> ⚠️ **注意：** `markRaw()` 只标记传入的那个对象引用，**不会递归标记其内部嵌套的对象**。

```ts
import { reactive, markRaw } from 'vue'

const outer = markRaw({
  inner: { count: 0 }
})

const state = reactive({ data: outer })

// outer 没有被代理
console.log(state.data === outer) // true

// ❌ 但 inner 会被代理！
state.data.inner.count++ // 会触发响应式更新
```

3. **不要在响应式对象内部调用 markRaw**

> ⚠️ **注意：** 如果在 `reactive()` 返回的对象上直接调用 `markRaw()`，它会静默失效。这是因为 `markRaw` 应该作用于原始对象，而非已经被代理的对象。

```ts
import { reactive, markRaw } from 'vue'

const state = reactive({ count: 0 })

// ❌ 在代理对象上调用 markRaw 无实际意义
// state 已经是 Proxy，markRaw 标记的是 Proxy 而非原始对象
markRaw(state) // 不推荐，效果不可靠
```

4. **只适用于引用类型**

> ⚠️ **注意：** `markRaw()` 只接收对象类型参数。传入原始值（`string`、`number`、`boolean`、`null`、`undefined`）虽然不会报错，但没有实际意义。

```ts
import { markRaw } from 'vue'

// ❌ 原始值不需要 markRaw，它们本身就不参与响应式代理
markRaw(42)         // 无意义
markRaw('hello')    // 无意义
markRaw(true)       // 无意义

// ✅ 正确用法：对象、数组、函数、类实例
markRaw({ a: 1 })
markRaw([1, 2, 3])
markRaw(() => {})
markRaw(new Map())
```

5. **与 readonly 的区别**

> ⚠️ **注意：** `markRaw` 和 `readonly` 是不同的概念。`markRaw` 是让对象**不参与响应式系统**，而 `readonly` 是创建一个**只读的响应式代理**。

```ts
import { reactive, markRaw, readonly } from 'vue'

// markRaw：完全脱离响应式系统，修改不会触发更新
const raw = markRaw({ count: 0 })

// readonly：仍在响应式系统内，但不能修改
const ro = readonly({ count: 0 })
```

6. **配合 shallowRef 使用更安全**

> 💡 **提示：** 当需要混合使用响应式和非响应式数据时，推荐 `shallowRef` + `markRaw` 组合，语义更清晰。

```ts
import { shallowRef, markRaw } from 'vue'

// ✅ shallowRef 只追踪 .value 的引用变化，内部不做深层代理
// markRaw 进一步保证 value 内部的特定对象不被意外代理
const chartInstance = shallowRef(markRaw(new Chart(ctx, config)))
```

7. **对模板渲染的影响**

> ⚠️ **注意：** 被 `markRaw` 标记的对象内部属性变化**不会触发模板重新渲染**。如果需要基于某个计算结果更新视图，应使用 `computed` 而非直接修改 raw 对象。

```ts
import { reactive, markRaw, computed } from 'vue'

const staticData = markRaw({ factor: 2 })

const state = reactive({
  multiplier: 3
})

// ❌ 直接读取 staticData.factor 并修改它不会更新视图
// ✅ 用 computed 派生响应式数据
const result = computed(() => staticData.factor * state.multiplier)
```

8. **JSON 序列化不受影响**

> 💡 **提示：** `markRaw` 添加的 `__v_skip` 属性是不可枚举的，所以 `JSON.stringify()` 不会包含它，不影响序列化和反序列化。

```ts
import { markRaw } from 'vue'

const obj = markRaw({ name: 'Vue', version: 3 })

// ✅ 序列化正常，不会包含 __v_skip
console.log(JSON.stringify(obj)) // '{"name":"Vue","version":3}'
```

9. **性能提升不应滥用**

> ⚠️ **注意：** 不要为了"优化性能"而给所有对象都加上 `markRaw`。Vue 3 的响应式系统（基于 Proxy）本身性能已经很好，大部分场景下不需要手动优化。只有在确实遇到性能瓶颈或与第三方库冲突时才使用。

10. **TypeScript 类型安全**

> 💡 **提示：** `markRaw` 的返回类型与输入类型相同（`T`），这意味着它不会改变对象的类型签名，TypeScript 类型推导完全正常。

```ts
import { markRaw } from 'vue'

interface User {
  name: string
  age: number
}

const user: User = markRaw({ name: '张三', age: 25 })
// TypeScript 正确推导 user 的类型为 User
console.log(user.name.toUpperCase()) // 类型安全
```

### 七、相关 API 对比

| API | 作用 | 是否响应式 | 是否可修改 |
|-----|------|-----------|-----------|
| `markRaw(obj)` | 标记对象永不转为响应式 | 否 | 是 |
| `readonly(obj)` | 创建只读响应式代理 | 是（只读） | 否 |
| `shallowReactive(obj)` | 只有根级属性是响应式的 | 部分 | 是 |
| `shallowRef(val)` | 只有 `.value` 是响应式的 | 部分 | 是 |
| `toRaw(proxy)` | 获取响应式对象的原始版本 | — | 是 |
| `isReactive(obj)` | 检查对象是否为响应式 | — | — |

```ts
import {
  reactive,
  readonly,
  shallowReactive,
  shallowRef,
  markRaw,
  toRaw,
  isReactive
} from 'vue'

const obj = { a: 1, b: { c: 2 } }

// 不同 API 的行为对比
const reactiveObj = reactive(obj)           // 深层响应式
const readonlyObj = readonly(obj)           // 深层只读响应式
const shallowObj = shallowReactive(obj)     // 只有 a 属性是响应式的
const refObj = shallowRef(obj)              // 只有 .value 替换才触发更新
const rawObj = markRaw(obj)                 // 完全不响应式

console.log(isReactive(reactiveObj))  // true
console.log(isReactive(readonlyObj))  // true
console.log(isReactive(shallowObj))   // true
console.log(isReactive(rawObj))       // false
```

### 八、总结

`markRaw()` 是 Vue 3 响应式系统中的一个"逃生舱"API，核心用途是：

- **保护不应被代理的对象**：第三方库实例（Chart.js、MapLibre、WangEditor 等）、DOM 元素、Worker、WebSocket 等原生对象
- **提升性能**：对大型静态数据集跳过深层响应式代理，减少初始化和运行时的性能开销
- **语义化声明**：明确告诉开发者和 Vue，某些数据不需要响应式追踪

使用时牢记：**标记不可撤销、不递归嵌套、不滥用**。合理使用 `markRaw` 可以让你的 Vue 3 应用更高效、更稳定。
