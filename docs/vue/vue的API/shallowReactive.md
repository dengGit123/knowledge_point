# shallowReactive

> 📖 [官方文档 - shallowReactive](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreactive)

### 一、概述

`shallowReactive()` 是 Vue 3 提供的一个**浅层响应式 API**。它只会对对象的**根级属性**建立响应式追踪，而不会像 `reactive()` 那样递归地将所有嵌套对象也转换为响应式代理。换句话说，嵌套的对象仍然保持为原始的普通对象（Plain Object），不会被 Vue 包裹成 Proxy。

**它能解决什么问题？**

在日常开发中，`reactive()` 会递归遍历对象的所有层级，为每个嵌套对象创建 Proxy 代理。当你处理的是一个小型对象时，这个开销可以忽略不计；但当你持有一个**包含大量嵌套数据的对象**（例如上万条用户数据、第三方库的复杂配置、大型 ECharts 图表实例等），递归代理会带来**明显的性能损耗**。`shallowReactive()` 正是为了解决这个问题而诞生的——它只代理第一层，让你在需要时手动控制更新，从而获得更好的性能。

> 💡 **提示：** 如果你只是需要一个简单的响应式值，用 `ref()` 或 `reactive()` 就够了。`shallowReactive()` 是一个**性能优化工具**，只在确实遇到性能瓶颈时才需要考虑使用。

---

### 二、核心原理

`shallowReactive()` 的核心机制可以用一句话概括：**只代理根级属性的读写操作，嵌套对象原样保留。**

具体来说：

1. **根级属性追踪**：当你读取或修改 `state.foo` 这样的根级属性时，Vue 会正常触发依赖收集（getter）和派发更新（setter），与 `reactive()` 行为一致。
2. **嵌套对象不追踪**：当你读取 `state.nested` 时，返回的是原始的普通对象，而不是一个 Proxy。因此对 `state.nested.bar` 的任何修改都不会触发响应式更新。
3. **替换嵌套对象可追踪**：当你将 `state.nested` 整体替换为一个新对象时（`state.nested = { bar: 3 }`），这个操作发生在根级属性的 setter 上，所以**会触发响应式更新**。

```
shallowReactive({ foo: 1, nested: { bar: 2 } })

结构示意：
┌─ Proxy 代理（响应式） ─────────────────┐
│  foo: 1          ← ✅ 可追踪           │
│  nested: { bar: 2 }  ← 普通对象（不追踪）│
└──────────────────────────────────────────┘
```

---

### 三、详细用法

#### 1. 基本用法

```typescript
import { shallowReactive } from 'vue'

interface State {
  foo: number
  nested: {
    bar: number
  }
}

const state: State = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// ✅ 修改根级属性 → 触发响应式更新
state.foo++

// ❌ 修改嵌套属性 → 不触发响应式更新
state.nested.bar++

// ✅ 替换整个嵌套对象 → 触发响应式更新（因为是根级属性的赋值）
state.nested = { bar: 3 }
```

#### 2. 进阶用法

##### 2.1 搭配 `ref` 实现选择性深层响应

当你希望大部分嵌套数据不需要响应式追踪，但某个特定属性又需要深层响应时，可以将该属性声明为 `ref`。

```typescript
import { shallowReactive, ref } from 'vue'

interface User {
  name: string
  age: number
}

const state = shallowReactive({
  // 根级属性中嵌入 ref → ref 内部具有完整的响应式能力
  currentUser: ref<User>({ name: '张三', age: 25 }),
  // 普通嵌套对象 → 不追踪
  config: { theme: 'light', lang: 'zh-CN' }
})

// ✅ 通过 .value 修改 ref 内部的属性 → 触发更新
state.currentUser.value.age = 26

// ✅ 替换整个 ref 的值 → 触发更新
state.currentUser.value = { name: '李四', age: 30 }

// ❌ 修改普通嵌套对象的属性 → 不触发更新
state.config.theme = 'dark'

// ✅ 替换整个 config → 触发更新
state.config = { ...state.config, theme: 'dark' }
```

##### 2.2 搭配 `markRaw` 避免意外代理

当 shallowReactive 中的嵌套对象通过赋值操作被替换时，新对象仍然可能被后续的 `reactive()` 处理。使用 `markRaw()` 可以标记对象，使其永远不会被转为响应式。

```typescript
import { shallowReactive, markRaw } from 'vue'

// 模拟第三方类实例
class ChartInstance {
  private el: HTMLElement
  constructor(el: HTMLElement) {
    this.el = el
  }
  render() {
    console.log('render chart')
  }
}

const state = shallowReactive({
  // ✅ 使用 markRaw 标记，确保该实例不会被响应式系统处理
  chart: markRaw(new ChartInstance(document.getElementById('chart')!))
})

// chart 实例上的方法调用不会被 Proxy 拦截，保持原始性能
state.chart.render()
```

##### 2.3 搭配 `triggerRef` 的替代方案

`shallowRef` 可以通过 `triggerRef()` 手动触发更新，但 `shallowReactive` 没有对应的 `triggerReactive()` 方法。替代方案是**重新赋值根级属性**。

```typescript
import { shallowReactive, watch } from 'vue'

const state = shallowReactive({
  items: [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' }
  ]
})

watch(
  () => state.items,
  (newVal) => {
    console.log('items 更新了', newVal)
  }
)

// ❌ 修改嵌套属性不会触发 watch
state.items[0].name = 'Orange'

// ✅ 方案一：创建新数组替换引用
state.items = [...state.items]

// ✅ 方案二：使用 Object.assign 创建新对象
state.items = state.items.map((item) =>
  item.id === 1 ? { ...item, name: 'Orange' } : item
)
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `target` | `T extends object` | 需要创建浅层响应式的目标对象，必须是对象类型 |
| **返回值** | `T` | 返回与入参类型相同的对象代理，根级属性具有响应式能力 |

**函数签名：**

```typescript
function shallowReactive<T extends object>(target: T): T
```

> ⚠️ **注意：** 与 `reactive()` 相同，`shallowReactive()` 的入参必须是对象类型（包括数组、Map、Set 等），传入原始类型（如 `string`、`number`）不会被包装为响应式。

---

### 四、实现效果

```vue
<template>
  <div>
    <p>foo: {{ state.foo }}</p>
    <p>nested.bar: {{ state.nested.bar }}</p>

    <button @click="incrementFoo">修改根级属性 foo</button>
    <button @click="incrementNestedBar">修改嵌套属性 bar</button>
    <button @click="replaceNested">替换整个 nested</button>
  </div>
</template>

<script setup lang="ts">
import { shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// ✅ 点击按钮后，视图立即更新：foo 从 1 → 2
const incrementFoo = () => {
  state.foo++
}

// ❌ 点击按钮后，nested.bar 的值确实改变了（变为 3），但视图不会更新
// 因为 state.nested 是普通对象，修改它的属性不会触发 setter
const incrementNestedBar = () => {
  state.nested.bar++
}

// ✅ 点击按钮后，视图更新：nested 整体被替换为 { bar: 99 }
// 因为 state.nested = ... 是根级属性的赋值操作，触发了 setter
const replaceNested = () => {
  state.nested = { bar: 99 }
}
</script>
```

**运行效果说明：**

| 操作 | 值变化 | 视图更新 | 原因 |
|------|--------|----------|------|
| `state.foo++` | foo: 1 → 2 | ✅ 更新 | 根级属性 setter 触发 |
| `state.nested.bar++` | bar: 2 → 3 | ❌ 不更新 | nested 是普通对象，无 Proxy |
| `state.nested = { bar: 99 }` | nested 被替换 | ✅ 更新 | 根级属性 setter 触发 |

---

### 五、使用场景

#### 场景一：大型数据列表优化

当你在页面上渲染一个包含成千上万条数据的列表时，使用 `reactive()` 会递归代理每一条数据的每一个属性，造成严重的性能浪费。`shallowReactive()` 可以只追踪数组引用本身的变化。

```typescript
import { shallowReactive } from 'vue'

interface User {
  id: number
  name: string
  email: string
  profile: {
    avatar: string
    bio: string
  }
}

// ✅ 只追踪根级属性，不会递归代理上万条用户数据
const state = shallowReactive({
  users: Array.from({ length: 10000 }, (_, i): User => ({
    id: i,
    name: `用户 ${i}`,
    email: `user${i}@example.com`,
    profile: {
      avatar: `https://example.com/avatar/${i}.png`,
      bio: `这是用户 ${i} 的个人简介`
    }
  }))
})

// ✅ 替换整个数组 → 触发更新
const loadMore = (newUsers: User[]) => {
  state.users = [...state.users, ...newUsers]
}

// ✅ 过滤后替换 → 触发更新
const search = (keyword: string) => {
  state.users = state.users.filter((u) => u.name.includes(keyword))
}
```

#### 场景二：第三方图表库实例管理

ECharts、Three.js 等第三方库的实例是复杂的 JavaScript 对象，它们自身有内部状态管理机制。如果被 Vue 的 `reactive()` 递归代理，不仅浪费性能，还可能导致库内部行为异常。

```typescript
import { shallowReactive, markRaw } from 'vue'
import * as echarts from 'echarts'

interface ChartStore {
  instances: Map<string, echarts.ECharts>
  options: Record<string, echarts.EChartsOption>
}

const chartStore = shallowReactive<ChartStore>({
  instances: new Map(),
  options: {}
})

// ✅ 添加图表实例（使用 markRaw 确保 ECharts 实例不被响应式系统处理）
const initChart = (id: string, el: HTMLElement) => {
  const instance = markRaw(echarts.init(el))
  chartStore.instances.set(id, instance)
  // 触发更新：替换整个 Map 引用
  chartStore.instances = new Map(chartStore.instances)
}

// ✅ 更新配置时替换整个 options
const updateOptions = (id: string, option: echarts.EChartsOption) => {
  chartStore.options = { ...chartStore.options, [id]: option }
}
```

#### 场景三：全局应用配置

应用的配置项通常在初始化后很少变化，嵌套的配置细节不需要响应式追踪。只需要追踪根级属性的变化即可。

```typescript
import { shallowReactive } from 'vue'

interface AppConfig {
  apiUrl: string
  timeout: number
  retryCount: number
  features: {
    darkMode: boolean
    i18n: boolean
    analytics: {
      trackingId: string
      enabled: boolean
    }
  }
}

const appConfig = shallowReactive<AppConfig>({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3,
  features: {
    darkMode: true,
    i18n: true,
    analytics: {
      trackingId: 'UA-123456',
      enabled: true
    }
  }
})

// ✅ 修改根级属性 → 触发更新
const updateTimeout = (ms: number) => {
  appConfig.timeout = ms
}

// ✅ 替换整个 features 对象 → 触发更新
const toggleDarkMode = () => {
  appConfig.features = {
    ...appConfig.features,
    darkMode: !appConfig.features.darkMode
  }
}
```

#### 场景四：表单状态管理（批量更新模式）

在一些复杂的表单场景中，你可能需要一次性提交所有修改，而不是每次字段变化都触发响应式更新。`shallowReactive()` 配合整体替换的策略非常适合这种场景。

```typescript
import { shallowReactive } from 'vue'

interface FormData {
  username: string
  email: string
  address: {
    province: string
    city: string
    detail: string
  }
}

const formState = shallowReactive<{
  data: FormData
  isDirty: boolean
}>({
  data: {
    username: '',
    email: '',
    address: {
      province: '',
      city: '',
      detail: ''
    }
  },
  isDirty: false
})

// ✅ 批量更新：替换整个 data 对象，一次性触发更新
const updateForm = (partial: Partial<FormData>) => {
  formState.data = { ...formState.data, ...partial }
  formState.isDirty = true
}

// ✅ 重置表单
const resetForm = () => {
  formState.data = {
    username: '',
    email: '',
    address: { province: '', city: '', detail: '' }
  }
  formState.isDirty = false
}
```

#### 场景五：分页数据表格

数据表格通常包含行数据、列配置、分页信息等多个部分，其中行数据量可能非常大，但更新方式通常是整批替换（翻页、筛选等）。

```typescript
import { shallowReactive } from 'vue'

interface TableRow {
  id: number
  [key: string]: string | number | boolean
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

interface TableState {
  rows: TableRow[]
  columns: string[]
  pagination: Pagination
  loading: boolean
}

const tableState = shallowReactive<TableState>({
  rows: [],
  columns: ['id', 'name', 'email', 'status'],
  pagination: { page: 1, pageSize: 20, total: 0 },
  loading: false
})

// ✅ 翻页：整个 rows 被替换，触发视图更新
const fetchPage = async (page: number) => {
  tableState.loading = true
  const { data, total } = await fetch(`/api/users?page=${page}`).then((r) => r.json())
  tableState.rows = data
  tableState.pagination = { ...tableState.pagination, page, total }
  tableState.loading = false
}

// ✅ 单行更新：找到对应行并替换整行
const updateRow = (id: number, updates: Partial<TableRow>) => {
  tableState.rows = tableState.rows.map((row) =>
    row.id === id ? { ...row, ...updates } : row
  )
}
```

#### 场景六：WebSocket 实时数据存储

WebSocket 推送的实时数据通常以整体替换的方式更新，不需要对每条消息的内部属性进行响应式追踪。

```typescript
import { shallowReactive } from 'vue'

interface RealTimeData {
  timestamp: number
  value: number
  label: string
}

interface WebSocketStore {
  messages: RealTimeData[]
  status: 'connecting' | 'connected' | 'disconnected'
  lastUpdate: number
}

const wsStore = shallowReactive<WebSocketStore>({
  messages: [],
  status: 'disconnected',
  lastUpdate: 0
})

const ws = new WebSocket('wss://example.com/realtime')

ws.onmessage = (event) => {
  const data: RealTimeData = JSON.parse(event.data)

  // ✅ 每次收到消息，替换整个 messages 数组
  wsStore.messages = [...wsStore.messages.slice(-99), data]
  wsStore.lastUpdate = Date.now()
}

ws.onopen = () => {
  wsStore.status = 'connected'
}

ws.onclose = () => {
  wsStore.status = 'disconnected'
}
```

#### 场景七：缓存与不可变数据集合

搭配 Immutable.js 或 immer 等不可变数据库时，数据本身是不可变的，每次修改都会返回新对象。此时只需要追踪引用的变化。

```typescript
import { shallowReactive } from 'vue'
import { List, Map as ImmutableMap } from 'immutable'

interface CacheStore {
  data: ImmutableMap<string, List<{ id: number; name: string }>>
  version: number
}

const cacheStore = shallowReactive<CacheStore>({
  data: ImmutableMap({
    users: List<{ id: number; name: string }>()
  }),
  version: 0
})

// ✅ Immutable.js 每次操作返回新对象，替换 data 引用即可触发更新
const addUser = (name: string) => {
  const currentUsers = cacheStore.data.get('users', List())
  cacheStore.data = cacheStore.data.set('users', currentUsers.push({ id: Date.now(), name }))
  cacheStore.version++
}
```

#### 场景八：多标签页/多面板布局管理

在 IDE 风格的多面板布局中，面板配置包含大量嵌套信息，但通常只在拖拽、关闭等操作时才需要整体更新。

```typescript
import { shallowReactive } from 'vue'

interface Panel {
  id: string
  title: string
  component: string
  position: { x: number; y: number; w: number; h: number }
}

interface LayoutState {
  panels: Panel[]
  activePanelId: string | null
  layoutMode: 'grid' | 'tabs' | 'split'
}

const layoutState = shallowReactive<LayoutState>({
  panels: [
    { id: 'editor', title: '编辑器', component: 'CodeEditor', position: { x: 0, y: 0, w: 800, h: 600 } },
    { id: 'terminal', title: '终端', component: 'Terminal', position: { x: 800, y: 0, w: 400, h: 600 } }
  ],
  activePanelId: 'editor',
  layoutMode: 'split'
})

// ✅ 切换激活面板 → 根级属性更新
const setActive = (id: string) => {
  layoutState.activePanelId = id
}

// ✅ 关闭面板 → 替换整个 panels 数组
const closePanel = (id: string) => {
  layoutState.panels = layoutState.panels.filter((p) => p.id !== id)
  if (layoutState.activePanelId === id) {
    layoutState.activePanelId = layoutState.panels[0]?.id ?? null
  }
}

// ✅ 切换布局模式 → 根级属性更新
const switchLayout = (mode: LayoutState['layoutMode']) => {
  layoutState.layoutMode = mode
}
```

#### 场景九：国际化（i18n）消息存储

国际化消息通常是一个深度嵌套的大对象（包含所有语言的所有翻译文本），但更新方式是整体切换语言包。

```typescript
import { shallowReactive } from 'vue'

interface LocaleMessages {
  [key: string]: string | LocaleMessages
}

interface I18nState {
  locale: string
  fallbackLocale: string
  messages: Record<string, LocaleMessages>
}

const i18nState = shallowReactive<I18nState>({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      common: { hello: '你好', goodbye: '再见' },
      menu: { file: '文件', edit: '编辑' }
    },
    en: {
      common: { hello: 'Hello', goodbye: 'Goodbye' },
      menu: { file: 'File', edit: 'Edit' }
    }
  }
})

// ✅ 切换语言 → 根级属性更新，触发视图刷新
const setLocale = (locale: string) => {
  i18nState.locale = locale
}

// ✅ 加载新语言包 → 替换整个 messages 对象
const addLocale = (locale: string, messages: LocaleMessages) => {
  i18nState.messages = { ...i18nState.messages, [locale]: messages }
}
```

---

### 六、注意事项

#### 1. 嵌套对象的属性修改不会触发视图更新

这是 `shallowReactive()` 最核心的特性，也是最容易被忽略的陷阱。只有根级属性的 setter 才会触发更新。

```typescript
import { shallowReactive, watch } from 'vue'

const state = shallowReactive({
  nested: { count: 0 }
})

watch(() => state.nested.count, (val) => {
  console.log('count 变化了', val)
})

state.nested.count++ // ❌ watch 不会被触发
// state.nested 是普通对象，不是 Proxy，所以不会收集依赖
```

#### 2. 没有 `triggerReactive` 方法

`shallowRef()` 可以通过 `triggerRef()` 手动强制触发更新，但 `shallowReactive()` 没有对应的 API。如果需要手动触发更新，必须通过替换根级属性的引用来实现。

```typescript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  items: [{ name: 'A' }, { name: 'B' }]
})

state.items[0].name = 'C' // ❌ 不触发更新

// ❌ triggerRef 不适用于 shallowReactive
// triggerRef(state) // 类型错误

// ✅ 正确方式：替换引用
state.items = [...state.items]
```

#### 3. 避免在模板中直接依赖嵌套属性

如果模板中使用了 `shallowReactive` 对象的嵌套属性，该属性的变化不会引起视图更新，可能导致 UI 与数据不一致。

```vue
<template>
  <!-- ❌ nested.count 变化时不会触发视图更新 -->
  <p>{{ state.nested.count }}</p>

  <!-- ✅ 根级属性变化会触发视图更新 -->
  <p>{{ state.foo }}</p>
</template>

<script setup lang="ts">
import { shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: { count: 0 }
})
</script>
```

#### 4. 不要在 `shallowReactive` 中嵌套 `reactive` 对象

将 `reactive()` 创建的对象作为 `shallowReactive()` 的嵌套属性，会导致行为混乱，且 `reactive` 对象在赋值给 `shallowReactive` 时会被自动解包。

```typescript
import { shallowReactive, reactive } from 'vue'

// ❌ 不推荐：行为不可预测
const state = shallowReactive({
  nested: reactive({ count: 0 })
})

// ✅ 方案一：统一使用 reactive（需要深层响应时）
const state1 = reactive({ nested: { count: 0 } })

// ✅ 方案二：统一使用 shallowReactive + 替换引用
const state2 = shallowReactive({ nested: { count: 0 } })
state2.nested = { count: 1 }

// ✅ 方案三：shallowReactive + ref（需要特定属性深层响应时）
import { ref } from 'vue'
const state3 = shallowReactive({
  nested: ref({ count: 0 })
})
state3.nested.value.count = 1
```

#### 5. 数组的 `push`/`splice` 等方法不会触发更新

当根级属性是一个数组时，调用数组的变异方法（如 `push`、`pop`、`splice`、`sort`）**不会触发更新**，因为这些方法操作的是数组的内部元素，而非替换数组引用。

```typescript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  items: [1, 2, 3]
})

state.items.push(4)  // ❌ 不触发更新
state.items.splice(0, 1) // ❌ 不触发更新
state.items.sort()   // ❌ 不触发更新

// ✅ 替换整个数组引用
state.items = [...state.items, 4]
state.items = state.items.slice(1)
state.items = [...state.items].sort()
```

#### 6. ES6 集合类型（Map、Set）同理

如果根级属性是 `Map` 或 `Set`，对其调用 `set`、`add`、`delete` 等方法同样不会触发更新，因为操作的仍是同一个对象引用。

```typescript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  userMap: new Map<string, string>([['1', 'Alice']]),
  tagSet: new Set<string>(['vue', 'typescript'])
})

state.userMap.set('2', 'Bob')  // ❌ 不触发更新
state.tagSet.add('vite')       // ❌ 不触发更新

// ✅ 替换整个 Map / Set
state.userMap = new Map([...state.userMap, ['2', 'Bob']])
state.tagSet = new Set([...state.tagSet, 'vite'])
```

#### 7. `toRaw` 获取原始对象的行为

`toRaw()` 对 `shallowReactive` 返回的对象获取的是 Proxy 的原始对象，但注意嵌套对象本身就是原始对象，不需要 `toRaw`。

```typescript
import { shallowReactive, toRaw, isReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: { bar: 2 }
})

toRaw(state)        // 获取 Proxy 的原始对象
toRaw(state.nested) // 返回的就是 state.nested 本身（它已经是原始对象）

isReactive(state)          // true
isReactive(state.nested)   // false
```

#### 8. 解构会丢失响应式

与 `reactive()` 一样，直接解构 `shallowReactive()` 返回的对象会丢失响应式。需要使用 `toRefs()` 来保持响应式连接。

```typescript
import { shallowReactive, toRefs } from 'vue'

const state = shallowReactive({
  foo: 1,
  bar: 2
})

// ❌ 解构后失去响应式
const { foo, bar } = state

// ✅ 使用 toRefs 保持响应式
const { foo: fooRef, bar: barRef } = toRefs(state)
```

#### 9. 默认优先使用 `reactive`，而非 `shallowReactive`

`shallowReactive()` 是一个**性能优化手段**，不是日常首选。大多数场景下 `reactive()` 的性能完全够用，过早使用 `shallowReactive()` 会增加代码复杂度和出错概率。

```typescript
import { reactive, shallowReactive } from 'vue'

// ✅ 大多数场景：直接用 reactive
const normalState = reactive({
  name: '张三',
  address: { city: '北京' }
})

// ✅ 仅在数据量极大或有明确性能需求时用 shallowReactive
const largeDataState = shallowReactive({
  records: Array.from({ length: 50000 }, (_, i) => ({ id: i, value: i }))
})
```

#### 10. `watch` 监听嵌套属性需要特别注意

使用 `watch` 监听 `shallowReactive` 对象的嵌套属性时，回调不会被触发。如果需要监听，应该监听整个根级属性，并使用 `deep: true` 选项（但这样会失去 shallow 的性能优势）。

```typescript
import { shallowReactive, watch } from 'vue'

const state = shallowReactive({
  nested: { count: 0 }
})

// ❌ 监听嵌套属性 → 永远不会触发
watch(() => state.nested.count, (val) => {
  console.log('count:', val)
})

// ✅ 方案一：监听整个根级属性 + deep: true
watch(() => state.nested, (val) => {
  console.log('nested changed:', val)
}, { deep: true })

// ✅ 方案二：直接替换引用来触发 watch
watch(() => state.nested, (val) => {
  console.log('nested changed:', val)
})
state.nested = { ...state.nested, count: 1 } // 触发
```

---

### 七、相关 API 对比

| 特性 | `reactive` | `shallowReactive` | `shallowRef` | `ref` |
|------|-----------|-------------------|-------------|-------|
| 根级属性响应式 | ✅ | ✅ | ✅（通过 .value） | ✅（通过 .value） |
| 嵌套对象响应式 | ✅ 递归代理 | ❌ 原始对象 | ❌ 原始对象 | ✅ 递归代理 |
| 性能开销 | 较高 | 较低 | 最低 | 中等 |
| 手动触发更新 | 不需要 | 需替换引用 | `triggerRef()` | 不需要 |
| 适用数据类型 | 对象 | 对象 | 任意类型 | 任意类型 |
| 解构丢失响应式 | ✅ 会丢失 | ✅ 会丢失 | ✅ 会丢失 | ✅ 会丢失 |
| 典型场景 | 通用响应式 | 大型数据性能优化 | 大型数据性能优化 | 基础响应式值 |

**选择指南：**

- 需要一个简单的响应式值 → `ref()`
- 需要一个完整的响应式对象 → `reactive()`
- 持有大型数据但只需要追踪引用变化 → `shallowRef()` 或 `shallowReactive()`
- 需要手动控制更新时机 → `shallowRef()` + `triggerRef()`

---

### 八、总结

`shallowReactive()` 是 Vue 3 响应式系统中的性能优化利器，它的核心思想是**只代理对象的第一层，将深层响应式的控制权交还给开发者**。

**关键要点回顾：**

1. 只有根级属性具有响应式能力，嵌套对象保持为普通对象
2. 修改嵌套属性不会触发更新，替换根级属性会触发更新
3. 没有 `triggerReactive` 方法，需通过替换引用手动触发
4. 数组的变异方法（push、splice 等）和 Map/Set 的操作方法不会触发更新
5. 默认使用 `reactive()`，只在有明确性能需求时才考虑 `shallowReactive()`
6. 可以搭配 `ref()` 实现选择性深层响应，搭配 `markRaw()` 避免意外代理

> 💡 **提示：** 在实际开发中，建议先用 `reactive()` 或 `ref()` 完成功能开发，当发现存在性能瓶颈时，再考虑使用 `shallowReactive()` 进行针对性优化。过早优化往往会增加代码复杂度，得不偿失。
