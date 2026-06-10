### onRenderTracked

> 📖 [Vue 官方文档 - onRenderTracked](https://cn.vuejs.org/api/composition-api-lifecycle#onrendertracked)

---

### 一、概述

`onRenderTracked()` 是 Vue 3 提供的一个**调试生命周期钩子**，用于在组件渲染过程中追踪到响应式依赖时触发回调。简单来说，当组件的渲染函数读取了某个响应式数据（如 `ref`、`reactive`），Vue 的响应式系统会将这个数据"记录"下来，这个记录的过程就会被 `onRenderTracked` 捕获。

它的核心价值在于：帮助开发者清楚地知道**组件渲染依赖了哪些响应式数据**，是排查响应式依赖问题、优化组件性能的利器。需要注意的是，这个钩子**仅在开发模式下生效**，生产环境中不会触发。

---

### 二、核心原理

要理解 `onRenderTracked`，需要先了解 Vue 3 响应式系统的**依赖收集**机制。

**简单类比：** 想象一个图书馆，每本书（响应式数据）都有自己的借阅记录（依赖列表）。当读者（渲染函数）来查阅某本书时，管理员（Vue 响应式系统）会在借阅记录上登记这位读者的名字。`onRenderTracked` 就像是管理员的广播通知——每当有一条新的借阅记录产生时，它就会播报："读者 XX 借阅了 YY 书"。

**底层机制：**

1. Vue 3 基于 `Proxy` 实现响应式系统，对对象的 `get`、`has`、`iterate` 等操作进行拦截
2. 当组件的渲染函数执行时，每读取一个响应式属性，就会触发 `track()` 操作，将该属性记录为当前渲染副作用（`ReactiveEffect`）的依赖
3. `onRenderTracked` 钩子就是在每次 `track()` 被调用时触发的
4. 首次渲染时会收集所有依赖，后续只有新增依赖时才会触发

```
渲染函数执行 → 读取响应式属性 → Proxy 拦截 get 操作 → track() 收集依赖 → 触发 onRenderTracked
```

---

### 三、详细用法

#### 1. 基本用法

```vue
<script setup lang="ts">
import { ref, onRenderTracked } from 'vue'

const count = ref(0)
const message = ref('Hello Vue 3')

onRenderTracked((event) => {
  console.log('追踪到响应式依赖：', event)
})
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ message }}</p>
  </div>
</template>
```

在组件首次渲染时，控制台会输出类似以下信息（每个被追踪的依赖触发一次）：

```
追踪到响应式依赖： { effect: ReactiveEffect, target: { value: 0 }, type: 'get', key: 'value' }
追踪到响应式依赖： { effect: ReactiveEffect, target: { value: 'Hello Vue 3' }, type: 'get', key: 'value' }
```

#### 2. 进阶用法

##### 2.1 解构 DebuggerEvent 参数

```vue
<script setup lang="ts">
import { ref, reactive, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const count = ref(0)
const user = reactive({ name: '张三', age: 25 })

onRenderTracked((event: DebuggerEvent) => {
  const { effect, target, type, key } = event

  console.groupCollapsed(`[依赖追踪] type: ${type}, key: ${String(key)}`)
  console.log('副作用对象：', effect)
  console.log('目标对象：', target)
  console.log('操作类型：', type) // 'get' | 'has' | 'iterate'
  console.log('属性键：', String(key))
  console.groupEnd()
})
</script>

<template>
  <div>
    <p>计数：{{ count }}</p>
    <p>姓名：{{ user.name }}</p>
  </div>
</template>
```

##### 2.2 配合 onRenderTriggered 完整调试

```vue
<script setup lang="ts">
import { ref, onRenderTracked, onRenderTriggered } from 'vue'
import type { DebuggerEvent } from 'vue'

const count = ref(0)

// 依赖追踪：渲染时读取了哪些响应式数据
onRenderTracked((event: DebuggerEvent) => {
  console.log('%c[追踪]', 'color: blue', {
    type: event.type,
    key: String(event.key),
    target: event.target,
  })
})

// 依赖触发：什么数据变化导致了重新渲染
onRenderTriggered((event: DebuggerEvent) => {
  console.log('%c[触发]', 'color: red', {
    type: event.type,
    key: String(event.key),
    newValue: (event as any).newValue,
    oldValue: (event as any).oldValue,
  })
})
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

##### 2.3 封装调试工具函数

```ts
// utils/debug.ts
import { onRenderTracked, onRenderTriggered } from 'vue'
import type { DebuggerEvent } from 'vue'

interface DebugOptions {
  componentName: string
  enableTracked?: boolean
  enableTriggered?: boolean
}

export function useRenderDebug(options: DebugOptions) {
  const { componentName, enableTracked = true, enableTriggered = true } = options

  if (import.meta.env.DEV) {
    if (enableTracked) {
      onRenderTracked((event: DebuggerEvent) => {
        console.log(
          `%c[${componentName}] 依赖追踪`,
          'color: #42b883; font-weight: bold',
          {
            type: event.type,
            key: String(event.key),
          }
        )
      })
    }

    if (enableTriggered) {
      onRenderTriggered((event: DebuggerEvent) => {
        console.log(
          `%c[${componentName}] 渲染触发`,
          'color: #e74c3c; font-weight: bold',
          {
            type: event.type,
            key: String(event.key),
            newValue: (event as any).newValue,
            oldValue: (event as any).oldValue,
          }
        )
      })
    }
  }
}
```

在组件中使用封装好的调试工具：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRenderDebug } from '@/utils/debug'

const count = ref(0)

// 仅在开发模式下生效，生产环境自动跳过
useRenderDebug({
  componentName: 'Counter',
  enableTracked: true,
  enableTriggered: true,
})
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

##### 2.4 过滤特定依赖的追踪

```vue
<script setup lang="ts">
import { ref, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const count = ref(0)
const name = ref('Vue')
const debugMode = ref(true)

onRenderTracked((event: DebuggerEvent) => {
  // 只追踪 ref 类型数据的 get 操作
  if (event.type === 'get' && String(event.key) === 'value') {
    console.log('追踪到 ref 依赖，目标值：', (event.target as any).value)
  }
})
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ name }}</p>
  </div>
</template>
```

#### 3. API 参数说明

**函数签名：**

```ts
function onRenderTracked(callback: DebuggerHook): void

type DebuggerHook = (e: DebuggerEvent) => void

type DebuggerEvent = {
  effect: ReactiveEffect
  target: object
  type: TrackOpTypes  // 'get' | 'has' | 'iterate'
  key: any
}
```

**DebuggerEvent 属性说明：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `effect` | `ReactiveEffect` | 当前正在执行的副作用（通常是渲染函数），可用来判断是哪个副作用触发了依赖追踪 |
| `target` | `object` | 被追踪的响应式对象本身。如果是 `ref`，则是 ref 内部对象 `{ value: ... }`；如果是 `reactive` 对象，则是对应的 Proxy 目标对象 |
| `type` | `TrackOpTypes` | 追踪的操作类型：`'get'`（读取属性）、`'has'`（检查属性是否存在，如 `key in obj`）、`'iterate'`（遍历操作，如 `Object.keys()`、`for...of`） |
| `key` | `any` | 被追踪的属性键名。对于 `ref` 通常是 `'value'`；对于 `reactive` 对象则是具体的属性名（如 `'name'`、`'age'`）；遍历操作时为 `undefined` |

**TrackOpTypes 类型值含义：**

| 类型值 | 触发场景 | 示例 |
|--------|----------|------|
| `'get'` | 读取响应式对象的某个属性 | `obj.name`、`refValue.value` |
| `'has'` | 检查属性是否存在于响应式对象中 | `'name' in obj` |
| `'iterate'` | 遍历响应式对象的键或值 | `Object.keys(obj)`、`for...of`、`forEach` |

---

### 四、实现效果

以下是一个完整的示例，展示 `onRenderTracked` 在不同场景下的输出效果：

```vue
<script setup lang="ts">
import { ref, reactive, computed, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const count = ref(0)
const user = reactive({
  name: '张三',
  age: 25,
  hobbies: ['阅读', '编程'],
})

const doubleCount = computed(() => count.value * 2)

// 记录追踪日志
const trackedLogs: Array<{
  type: string
  key: string
  value: any
}> = []

onRenderTracked((event: DebuggerEvent) => {
  const log = {
    type: event.type,
    key: String(event.key),
    value: event.key === 'value'
      ? (event.target as any).value
      : (event.target as any)[event.key],
  }
  trackedLogs.push(log)
  console.table([log])
})

function increment() {
  count.value++
}

function addHobby() {
  user.hobbies.push('游泳')
}
</script>

<template>
  <div>
    <p>计数：{{ count }}</p>
    <!-- 触发 count 的 get 追踪 -->
    <p>双倍：{{ doubleCount }}</p>
    <!-- 触发 computed 内部 count 的 get 追踪 -->
    <p>姓名：{{ user.name }}</p>
    <!-- 触发 user.name 的 get 追踪 -->
    <p>年龄：{{ user.age }}</p>
    <!-- 触发 user.age 的 get 追踪 -->
    <button @click="increment">+1</button>
    <button @click="addHobby">添加爱好</button>
  </div>
</template>
```

**首次渲染时控制台输出（逐条追踪）：**

```
[表格形式输出]
┌─────────┬───────────┬──────────┬──────────────────────┐
│ (index) │   type    │   key    │        value         │
├─────────┼───────────┼──────────┼──────────────────────┤
│    0    │   'get'   │ 'value'  │          0           │  ← count.value 被读取
│    1    │   'get'   │ 'value'  │          0           │  ← computed 读取 count.value
│    2    │   'get'   │ 'name'   │        '张三'         │  ← user.name 被读取
│    3    │   'get'   │  'age'   │          25          │  ← user.age 被读取
└─────────┴───────────┴──────────┴──────────────────────┘
```

> 💡 **提示：** 首次渲染完成后，如果没有新的响应式依赖被读取，`onRenderTracked` 不会再次触发。它只在**新的依赖被追踪**时才会被调用。

---

### 五、使用场景

#### 1. 调试组件响应式依赖

排查"为什么我的组件没有按预期更新"或"为什么组件频繁渲染"的问题时，查看组件到底追踪了哪些依赖。

```vue
<script setup lang="ts">
import { ref, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const count = ref(0)
const name = ref('Vue')

onRenderTracked((event: DebuggerEvent) => {
  console.log(`[依赖追踪] 操作: ${event.type}, 键: ${String(event.key)}`)
  // 输出:
  // [依赖追踪] 操作: get, 键: value   (模板中使用了 count)
  // [依赖追踪] 操作: get, 键: value   (模板中使用了 name)
})
</script>

<template>
  <p>{{ count }} - {{ name }}</p>
</template>
```

#### 2. 性能优化——识别不必要的依赖

当组件频繁重新渲染时，用 `onRenderTracked` 检查是否追踪了不必要的响应式数据。

```vue
<script setup lang="ts">
import { ref, reactive, onRenderTracked, onRenderTriggered } from 'vue'
import type { DebuggerEvent } from 'vue'

// 场景：一个大对象中只用了部分字段，但追踪了整个对象
const formData = reactive({
  username: '',
  password: '',
  email: '',
  address: '',
  phone: '',
})

// ❌ 问题：模板中只用到了 username，但可能追踪了其他字段
onRenderTracked((event: DebuggerEvent) => {
  console.warn(
    '组件追踪了新的依赖！检查是否需要此依赖：',
    String(event.key)
  )
})

// ✅ 解决方案：配合 onRenderTriggered 定位导致重渲染的字段
onRenderTriggered((event: DebuggerEvent) => {
  console.error('重渲染由以下变化触发：', {
    key: String(event.key),
    newValue: (event as any).newValue,
  })
})
</script>

<template>
  <!-- 只使用 username，其他字段的变化不应触发重渲染 -->
  <input v-model="formData.username" />
  <p>当前用户：{{ formData.username }}</p>
</template>
```

#### 3. 开发环境响应式依赖日志系统

在开发环境中统一记录所有组件的响应式依赖追踪情况。

```ts
// plugins/debugLogger.ts
import type { App, Component } from 'vue'

// ✅ 全局 mixin 方式注册调试钩子（仅开发环境）
export function setupDebugLogger(app: App) {
  if (import.meta.env.DEV) {
    app.mixin({
      beforeCreate() {
        // 注意：mixin 方式属于选项式 API，这里仅为工具演示
      },
    })
  }
}

// ✅ 推荐方式：封装为 composable 供组件按需使用
export function useDependencyLogger(componentName: string) {
  if (!import.meta.env.DEV) return

  const { onRenderTracked, onRenderTriggered } = await import('vue')

  const dependencies = new Set<string>()

  onRenderTracked((event) => {
    const depId = `${String(event.key)}(${event.type})`
    dependencies.add(depId)
    console.log(`[${componentName}] 新增依赖: ${depId}`)
  })

  onRenderTriggered((event) => {
    console.warn(
      `[${componentName}] 重渲染触发: ${String(event.key)}`,
      `旧值: ${(event as any).oldValue}`,
      `新值: ${(event as any).newValue}`
    )
  })

  return { dependencies }
}
```

#### 4. 组件库开发中的依赖分析

在组件库开发中，分析组件的依赖收集情况，确保组件的响应式行为正确。

```vue
<script setup lang="ts">
import { ref, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

// 模拟一个表格组件的 props 解构
const props = defineProps<{
  data: Array<Record<string, any>>
  columns: string[]
  loading: boolean
}>()

const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 在组件库开发中，追踪所有依赖以验证组件行为
if (import.meta.env.DEV) {
  onRenderTracked((event: DebuggerEvent) => {
    console.info(
      '[DataTable] 追踪依赖:',
      `type=${event.type}, key=${String(event.key)}`
    )
    // 确保只有 data、columns、sortKey、sortOrder 被追踪
    // 而不是整个 props 对象被追踪导致不必要的重渲染
  })
}
</script>
```

#### 5. 教学演示——理解响应式系统工作原理

用于教学场景，帮助学生直观理解 Vue 响应式系统的依赖收集过程。

```vue
<script setup lang="ts">
import { ref, reactive, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const state = reactive({
  items: ['苹果', '香蕉', '橙子'],
  selectedIndex: 0,
})

const searchQuery = ref('')

// 教学演示：展示 Vue 的依赖收集过程
onRenderTracked((event: DebuggerEvent) => {
  const log = document.createElement('div')
  log.style.cssText = 'padding: 4px 8px; margin: 2px 0; background: #e8f5e9; border-radius: 4px; font-size: 12px;'
  log.textContent = `[追踪] Vue 发现渲染函数使用了: ${String(event.key)} (操作: ${event.type})`

  const panel = document.getElementById('debug-panel')
  if (panel) {
    panel.appendChild(log)
  }
})
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索..." />
    <ul>
      <li v-for="(item, index) in state.items" :key="index">
        {{ item }}
      </li>
    </ul>
    <p>选中索引：{{ state.selectedIndex }}</p>

    <!-- 调试面板，仅在开发环境显示 -->
    <div v-if="true" style="margin-top: 20px;">
      <h4>依赖追踪面板：</h4>
      <div id="debug-panel" />
    </div>
  </div>
</template>
```

#### 6. 检测 computed 属性的依赖来源

分析 `computed` 内部实际依赖了哪些响应式数据。

```vue
<script setup lang="ts">
import { ref, computed, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const firstName = ref('张')
const lastName = ref('三')
const age = ref(25)

// computed 依赖了 firstName 和 lastName
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 追踪渲染时的依赖，可以验证 computed 的依赖是否正确传播
onRenderTracked((event: DebuggerEvent) => {
  if (event.type === 'get') {
    console.log(
      '[computed 依赖追踪]',
      `渲染函数通过 computed 间接追踪了: key=${String(event.key)}`
    )
  }
})
</script>

<template>
  <div>
    <p>全名：{{ fullName }}</p>
    <!-- age 的变化不会触发重渲染，因为 fullName 不依赖 age -->
    <p>年龄：{{ age }}</p>
  </div>
</template>
```

#### 7. 配合 Vite 环境变量做条件调试

利用 Vite 的环境变量，仅在特定调试模式下启用依赖追踪。

```ts
// composables/useDebug.ts
import { onRenderTracked, onRenderTriggered } from 'vue'
import type { DebuggerEvent } from 'vue'

export function useReactiveDebug(name: string) {
  // Vite 环境变量控制，可在 .env.local 中设置 VITE_DEBUG_REACTIVE=true
  const isDebug = import.meta.env.VITE_DEBUG_REACTIVE === 'true'

  if (!isDebug) return

  onRenderTracked((event: DebuggerEvent) => {
    console.log(
      `%c[${name}] Tracked`,
      'background: #42b883; color: white; padding: 2px 6px; border-radius: 3px;',
      {
        type: event.type,
        key: String(event.key),
      }
    )
  })

  onRenderTriggered((event: DebuggerEvent) => {
    console.log(
      `%c[${name}] Triggered`,
      'background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px;',
      {
        type: event.type,
        key: String(event.key),
        newValue: (event as any).newValue,
        oldValue: (event as any).oldValue,
      }
    )
  })
}
```

```env
# .env.local
VITE_DEBUG_REACTIVE=true
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useReactiveDebug } from '@/composables/useDebug'

useReactiveDebug('UserCard')

const userName = ref('李四')
</script>

<template>
  <p>{{ userName }}</p>
</template>
```

#### 8. 追踪深层嵌套对象的依赖

分析深层嵌套的 `reactive` 对象在渲染时到底追踪了哪一层的哪个属性。

```vue
<script setup lang="ts">
import { reactive, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const config = reactive({
  theme: {
    color: {
      primary: '#42b883',
      secondary: '#35495e',
    },
    fontSize: 14,
  },
  layout: {
    sidebar: true,
    header: true,
  },
})

onRenderTracked((event: DebuggerEvent) => {
  // 可以观察到嵌套对象的每一层 get 操作
  console.log('[深层依赖追踪]', {
    type: event.type,
    key: String(event.key),
    // 对于嵌套对象，target 会指向不同层级的对象
  })
})
</script>

<template>
  <div :style="{ color: config.theme.color.primary }">
    <!-- 追踪链: config → theme → color → primary -->
    <p>主色调：{{ config.theme.color.primary }}</p>
    <p>字号：{{ config.theme.fontSize }}</p>
  </div>
</template>
```

#### 9. 排查 Computed 缓存失效问题

当 `computed` 的值似乎没有正确缓存时，用 `onRenderTracked` 分析依赖链。

```vue
<script setup lang="ts">
import { ref, reactive, computed, onRenderTracked } from 'vue'
import type { DebuggerEvent } from 'vue'

const state = reactive({
  list: [1, 2, 3] as number[],
  filter: '' as string,
})

// ❌ 问题：每次渲染都会重新计算吗？
const filteredList = computed(() => {
  if (!state.filter) return state.list
  return state.list.filter((item) => String(item).includes(state.filter))
})

const count = ref(0)

onRenderTracked((event: DebuggerEvent) => {
  console.log('[追踪]', event.type, String(event.key))
  // 如果 count 变化时也追踪了 state.list 和 state.filter
  // 说明组件渲染函数依赖了 filteredList，这是正确的
  // 如果追踪了多余的字段，说明模板中有不需要的依赖
})
</script>

<template>
  <div>
    <button @click="count++">{{ count }}</button>
    <input v-model="state.filter" />
    <ul>
      <li v-for="item in filteredList" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
```

#### 10. 分析 Watch 和 WatchEffect 的依赖来源

结合 `watchEffect` 和 `onRenderTracked`，全面了解依赖关系。

```vue
<script setup lang="ts">
import {
  ref,
  watchEffect,
  onRenderTracked,
  onRenderTriggered,
} from 'vue'
import type { DebuggerEvent } from 'vue'

const x = ref(0)
const y = ref(0)

// watchEffect 自动追踪内部使用的响应式数据
watchEffect(() => {
  console.log(`坐标变化: (${x.value}, ${y.value})`)
  // 此 effect 会追踪 x.value 和 y.value
})

// 追踪组件渲染的依赖
onRenderTracked((event: DebuggerEvent) => {
  console.log('[组件依赖追踪]', event.type, String(event.key))
})

// 追踪触发重渲染的变化
onRenderTriggered((event: DebuggerEvent) => {
  console.log('[组件重渲染触发]', event.type, String(event.key))
})
</script>

<template>
  <div>
    <p>X: {{ x }}, Y: {{ y }}</p>
    <button @click="x++">X + 1</button>
    <button @click="y++">Y + 1</button>
  </div>
</template>
```

---

### 六、注意事项

1. **仅开发模式可用**：`onRenderTracked` 只在开发环境（`import.meta.env.DEV === true`）下生效。生产构建中所有相关代码都会被移除，不会产生任何性能开销。

2. **SSR 中不会被调用**：在服务器端渲染（SSR）期间，此钩子不会被触发。如果需要在 SSR 中调试，需使用其他方式。

3. **不要在生产代码中使用**：此钩子专为调试设计，不应依赖其回调来执行业务逻辑。所有相关代码都应包裹在 `import.meta.env.DEV` 条件判断中。

4. **必须同步调用**：与所有生命周期钩子一样，`onRenderTracked` 必须在 `setup()` 阶段同步调用，不能放在 `setTimeout`、`Promise.then` 等异步回调中。

```ts
// ❌ 错误：异步调用
import { onRenderTracked } from 'vue'

setTimeout(() => {
  onRenderTracked(() => { /* ... */ }) // 不会生效！
}, 0)

// ✅ 正确：在 setup 中同步调用
import { onRenderTracked } from 'vue'

onRenderTracked(() => { /* ... */ }) // 正确
```

5. **触发频率可能很高**：首次渲染时，每个被追踪的依赖都会触发一次回调。如果组件依赖很多响应式数据，控制台输出会非常密集。建议配合过滤条件或分组输出使用。

6. **与 onRenderTriggered 的区别**：`onRenderTracked` 是在**依赖被追踪（收集）时**触发，关注的是"读取了什么"；`onRenderTriggered` 是在**依赖变化触发重渲染时**触发，关注的是"什么导致了更新"。两者配合使用才能全面调试。

7. **ref 和 reactive 的 event.target 不同**：
   - 对于 `ref`：`event.target` 是 ref 的内部对象 `{ value: ... }`，`event.key` 通常是 `'value'`
   - 对于 `reactive`：`event.target` 是响应式 Proxy 的目标对象，`event.key` 是具体的属性名

8. **多次注册会覆盖**：如果在同一个组件中多次调用 `onRenderTracked`，后面的注册会覆盖前面的，不会叠加执行。如果需要多个回调，需要在一个注册函数中处理。

```ts
// ❌ 只有第二个会生效
onRenderTracked(() => console.log('第一个'))  // 被覆盖
onRenderTracked(() => console.log('第二个'))  // 生效

// ✅ 合并到一个回调中
onRenderTracked((event) => {
  console.log('第一个', event)
  console.log('第二个', event)
})
```

9. **Computed 属性的依赖传播**：当模板使用 `computed` 时，追踪到的是 computed 内部的依赖，而不是 computed 本身。这有助于理解 computed 的依赖链。

10. **不影响响应式系统行为**：`onRenderTracked` 只是一个观察者，不会影响 Vue 响应式系统的正常运行。在回调中修改响应式数据是安全的（但通常没有意义）。

---

### 七、相关 API 对比

#### onRenderTracked vs onRenderTriggered

| 对比维度 | `onRenderTracked` | `onRenderTriggered` |
|----------|-------------------|----------------------|
| **触发时机** | 依赖被追踪（收集）时 | 依赖变化触发重渲染时 |
| **核心问题** | "渲染时读取了什么数据？" | "什么数据变化导致了更新？" |
| **触发阶段** | 依赖收集阶段（`track`） | 派发更新阶段（`trigger`） |
| **event.type 值** | `'get'`、`'has'`、`'iterate'` | `'set'`、`'add'`、`'delete'`、`'clear'` |
| **包含新/旧值** | ❌ 不包含 | ✅ 包含 `newValue` 和 `oldValue` |
| **使用场景** | 了解组件依赖了哪些数据 | 定位导致重渲染的数据源 |
| **触发频率** | 首次渲染时每个依赖触发一次 | 每次响应式数据变化触发渲染时调用 |

#### 调试钩子 vs 常规生命周期钩子

| 对比维度 | 调试钩子（`onRenderTracked` 等） | 常规钩子（`onMounted` 等） |
|----------|----------------------------------|----------------------------|
| **主要用途** | 开发调试 | 业务逻辑 |
| **生产环境** | ❌ 不触发 | ✅ 正常触发 |
| **SSR 支持** | ❌ 不调用 | ✅ 部分支持 |
| **参数** | `DebuggerEvent` 对象 | 无参数或简单回调 |

#### 配合使用的调试策略

```ts
// 推荐的调试策略：两个钩子配合使用
import { onRenderTracked, onRenderTriggered } from 'vue'

// 第一步：用 onRenderTracked 了解"组件依赖了什么"
onRenderTracked((event) => {
  console.log('📋 追踪到依赖:', String(event.key))
})

// 第二步：用 onRenderTriggered 了解"什么触发了更新"
onRenderTriggered((event) => {
  console.log('⚡ 触发更新:', String(event.key),
    `${(event as any).oldValue} → ${(event as any).newValue}`)
})
```

---

### 八、总结

`onRenderTracked` 是 Vue 3 专为开发调试设计的生命周期钩子，它的核心价值在于：

- **可视化依赖收集**：让开发者清晰地看到组件渲染函数读取了哪些响应式数据
- **性能排查利器**：配合 `onRenderTriggered`，可以精准定位不必要的重渲染
- **零生产开销**：仅开发模式生效，生产构建中完全移除
- **教学价值**：帮助理解 Vue 响应式系统的依赖追踪机制

> ⚠️ **注意：** `onRenderTracked` 是只读的调试工具，不要用它来执行业务逻辑。所有使用此钩子的代码都应严格限制在开发环境中。

> 💡 **提示：** 对于大多数性能优化场景，建议优先使用 Vue DevTools 浏览器扩展进行可视化调试，`onRenderTracked` 适合更细粒度或自动化的调试需求。
