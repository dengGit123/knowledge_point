# reactive

## 作用
`reactive()` 返回一个响应式的对象代理。它将对象转换为响应式状态，使对象的所有嵌套属性也都是响应式的。

## 用法

### 基本用法

```text
import { reactive } from 'vue'

// 创建响应式对象
const state = reactive({
  count: 0,
  message: 'Hello'
})

// 访问和修改
console.log(state.count) // 0
state.count++
state.message = 'World'
```

### 嵌套对象

```text
const user = reactive({
  name: 'Vue',
  info: {
    age: 3,
    address: {
      city: 'Beijing'
    }
  }
})

// 所有嵌套属性都是响应式的
user.info.age++
user.info.address.city = 'Shanghai'
```

### 数组

```text
const list = reactive([1, 2, 3])

// 数组操作都是响应式的
list.push(4)
list.pop()
list[0] = 10
list.splice(1, 1, 99)
```

### 在 setup 中使用

```text
import { reactive } from 'vue'

export default {
  setup() {
    const state = reactive({
      count: 0,
      message: 'Hello Vue3'
    })

    function increment() {
      state.count++
    }

    return {
      state,
      increment
    }
  }
}
```

### 在 `&lt;script setup&gt;` 中使用

```text
`&lt;script setup&gt;`
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  users: []
})

function increment() {
  state.count++
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;{{ state.count }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 与 toRefs 配合解构

```text
`&lt;script setup&gt;`
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// 解构时保持响应性
const { count, message } = toRefs(state)

function increment() {
  count.value++ // 注意：解构后需要 .value
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;{{ count }} - {{ message }}&lt;/div&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. 不能解构 reactive 对象（会丢失响应性）

```text
const state = reactive({
  count: 0,
  message: 'Hello'
})

// ❌ 错误：解构会丢失响应性
const { count } = state
count++ // 不会触发更新

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state)
count.value++ // 正确触发更新
```

### 2. 不能替换整个对象

```text
const state = reactive({ count: 0 })

// ❌ 错误：替换整个对象会丢失响应性
state = reactive({ count: 1 })

// ✅ 正确：修改属性
Object.assign(state, { count: 1 })

// ✅ 或者单独更新属性
state.count = 1
```

### 3. 不能用于基本类型

```text
// ❌ 错误：reactive 只接受对象
const count = reactive(0)

// ✅ 正确：使用 ref
const count = ref(0)
```

### 4. 返回的是原始对象的代理

```text
const original = { count: 0 }
const proxy = reactive(original)

// proxy !== original
console.log(proxy === original) // false

// 但两者操作会同步
proxy.count = 1
console.log(original.count) // 1
```

### 5. 与 ref 嵌套时的行为

```text
const count = ref(0)
const state = reactive({ count })

// ✅ ref 在 reactive 中自动解包
state.count++ // 自动访问 count.value
console.log(count.value) // 1

// ⚠️ 但新赋值的 ref 不会自动解包
const newCount = ref(10)
state.newCount = newCount
state.newCount++ // 不会更新 newCount.value
```

### 6. 作为 props 传递时

```text
// 父组件
const state = reactive({ count: 0 })
// 传递给子组件
// &lt;Child :state="state" /&gt;

// 子组件
// ⚠️ 需要注意 props 是只读的
// props.state.count++ // 开发环境会有警告
```

### 7. 本地响应式状态 vs Props

```text
export default {
  setup(props) {
    // ❌ 错误：props 是只读的
    props.count++

    // ✅ 正确：创建本地响应式状态
    const localState = reactive({
      count: props.count
    })

    // ✅ 或者使用 computed
    const doubledCount = computed(() =&gt; props.count * 2)
  }
}
```

### 8. TypeScript 类型支持

```text
interface User {
  name: string
  age: number
}

// 推导类型
const user = reactive&lt;User&gt;({
  name: 'Vue',
  age: 3
})

// 类型会保持不变
user.age // number
```

## 使用场景

### 1. 复杂状态管理

```text
`&lt;script setup&gt;`
import { reactive } from 'vue'

const formState = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  errors: {
    username: '',
    email: ''
  }
})

async function submitForm() {
  // 表单提交逻辑
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form @submit.prevent="submitForm"&gt;
    &lt;input v-model="formState.username" /&gt;
    &lt;span class="error"&gt;{{ formState.errors.username }}&lt;/span&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 2. 购物车状态

```text
const cart = reactive({
  items: [],
  total: 0,
  discount: 0,

  addItem(product) {
    this.items.push(product)
    this.calculateTotal()
  },

  removeItem(id) {
    this.items = this.items.filter(item =&gt; item.id !== id)
    this.calculateTotal()
  },

  calculateTotal() {
    this.total = this.items.reduce((sum, item) =&gt; sum + item.price, 0)
  }
})
```

### 3. 表格数据管理

```text
`&lt;script setup&gt;`
const tableState = reactive({
  data: [],
  loading: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  filters: {
    keyword: '',
    status: ''
  }
})

async function fetchData() {
  tableState.loading = true
  const res = await api.getList(tableState.pagination, tableState.filters)
  tableState.data = res.list
  tableState.pagination.total = res.total
  tableState.loading = false
}
`&lt;/script&gt;`
```

### 4. 游戏状态

```text
const gameState = reactive({
  player: {
    x: 0,
    y: 0,
    health: 100,
    score: 0
  },
  enemies: [],
  bullets: [],
  powerUps: [],
  level: 1,
  isGameOver: false,
  isPaused: false
})

function updateGame() {
  if (gameState.isGameOver || gameState.isPaused) return

  gameState.player.x += gameState.player.velocity
  // 游戏逻辑...
}
```

### 5. 可视化图表数据

```text
const chartData = reactive({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    label: 'Sales',
    data: [12, 19, 3, 5, 2],
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)'
  }],
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
})

function updateChart(newData) {
  chartData.datasets[0].data = newData
}
```

### 6. 多步骤表单向导

```text
const wizard = reactive({
  currentStep: 1,
  totalSteps: 3,
  steps: [
    { id: 1, title: '基本信息', completed: false },
    { id: 2, title: '详细资料', completed: false },
    { id: 3, title: '确认信息', completed: false }
  ],
  data: {
    // 各步骤数据
  }
})

function nextStep() {
  if (wizard.currentStep &lt; wizard.totalSteps) {
    wizard.steps[wizard.currentStep - 1].completed = true
    wizard.currentStep++
  }
}

function prevStep() {
  if (wizard.currentStep &gt; 1) {
    wizard.currentStep--
  }
}
```

### 7. 实时编辑器状态

```text
const editorState = reactive({
  content: '',
  selection: {
    start: 0,
    end: 0
  },
  history: [],
  historyIndex: -1,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  settings: {
    theme: 'dark',
    fontSize: 14,
    lineNumbers: true,
    autoComplete: true
  }
})
```

### 8. 响应式布局状态

```text
const layout = reactive({
  sidebarOpen: true,
  sidebarWidth: 250,
  mainContentWidth: 0,
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440
  },
  currentBreakpoint: 'desktop'
})

function handleResize() {
  layout.mainContentWidth = window.innerWidth - (layout.sidebarOpen ? layout.sidebarWidth : 0)

  if (window.innerWidth &lt; layout.breakpoints.mobile) {
    layout.currentBreakpoint = 'mobile'
    layout.sidebarOpen = false
  }
}
```

### 9. 通知/消息队列

```text
const notificationState = reactive({
  items: [],
  maxItems: 5,
  defaultDuration: 3000
})

function showNotification(message, type = 'info') {
  const id = Date.now()
  notificationState.items.push({
    id,
    message,
    type,
    timestamp: Date.now()
  })

  if (notificationState.items.length &gt; notificationState.maxItems) {
    notificationState.items.shift()
  }

  setTimeout(() =&gt; {
    removeNotification(id)
  }, notificationState.defaultDuration)
}

function removeNotification(id) {
  const index = notificationState.items.findIndex(item =&gt; item.id === id)
  if (index &gt; -1) {
    notificationState.items.splice(index, 1)
  }
}
```

### 10. 与 Pinia Store 类似的状态管理模式

```text
// 简单的 store 模式
const userStore = reactive({
  user: null,
  isAuthenticated: false,
  permissions: [],

  login(credentials) {
    // 登录逻辑
    this.user = userData
    this.isAuthenticated = true
  },

  logout() {
    this.user = null
    this.isAuthenticated = false
    this.permissions = []
  },

  hasPermission(permission) {
    return this.permissions.includes(permission)
  }
})

// 使用
export function useUserStore() {
  return userStore
}
```

## reactive vs ref 选择指南

```text
// ✅ 使用 reactive 的场景
const form = reactive({ username: '', password: '' })
const user = reactive({ name: 'Vue', info: { age: 3 } })
const list = reactive([1, 2, 3])

// ✅ 使用 ref 的场景
const count = ref(0)
const message = ref('Hello')
const loading = ref(false)
```

| 特性 | reactive | ref |
|-----|----------|-----|
| 数据类型 | 仅对象/数组 | 任何类型 |
| 解构 | 需要 toRefs | 直接解构，保留 .value |
| 模板访问 | 直接访问属性 | 自动解包，直接使用 |
| 替换整个值 | 不支持 | 支持 |
| 使用复杂度 | 稍复杂 | 简单直观 |

## 最佳实践

1. **复杂对象用 reactive**：有多个相关属性时优先使用
2. **基本类型用 ref**：单一值使用 ref
3. **解构用 toRefs**：需要解构时使用 toRefs 保持响应性
4. **统一风格**：一个组件内尽量保持一致的响应式 API 选择
5. **与 Pinia 配合**：大型状态管理考虑使用 Pinia
