# onRenderTriggered

> 📖 [官方文档：onRenderTriggered](https://cn.vuejs.org/api/composition-api-lifecycle#onrendertriggered)

### 一、概述

`onRenderTriggered()` 是 Vue 3 提供的一个**调试生命周期钩子**，当组件的渲染函数因为响应式依赖发生变化而被触发重新渲染时，该钩子会被调用。它可以精确地告诉你**是哪个响应式数据的变化导致了重新渲染**，以及变化前后的值是什么。这个 API 仅在开发模式下生效，生产环境中不会执行。

### 二、核心原理

Vue 3 的响应式系统会自动追踪渲染函数中使用的响应式依赖。当这些依赖的值发生变化时，组件会重新执行渲染函数以更新 DOM。`onRenderTriggered` 就是在这个重新渲染被**触发**的那一刻执行的钩子。

可以把它类比为一个"**监控摄像头**"：你在家（组件）里装了一个摄像头，每当有人动了家里的东西（响应式数据变化）导致你需要重新整理房间（重新渲染），摄像头就会拍下来并告诉你：

- 谁动了东西（`target` — 哪个响应式对象）
- 动了哪个位置（`key` — 哪个属性）
- 怎么动的（`type` — 操作类型：set / add / delete）
- 之前是什么样的（`oldValue`）
- 现在变成了什么样（`newValue`）

底层实现上，Vue 在响应式对象的 setter 中拦截变更操作，当检测到变更会触发组件重新调度渲染时，同步调用注册的 `onRenderTriggered` 回调，并传入一个包含详细变更信息的 `DebuggerEvent` 对象。

### 三、详细用法

#### 1. 基本用法

```vue
<script setup lang="ts">
import { onRenderTriggered, ref } from 'vue'

const count = ref(0)

onRenderTriggered((e) => {
  console.log('触发了重新渲染')
  console.log('变更的属性键:', e.key)
  console.log('目标对象:', e.target)
  console.log('操作类型:', e.type)
  console.log('旧值:', e.oldValue)
  console.log('新值:', e.newValue)
})

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

当点击按钮时，`count.value` 从 `0` 变为 `1`，控制台输出：

```
触发了重新渲染
变更的属性键: value
目标对象: RefImpl {value: 1, ...}
操作类型: set
旧值: 0
新值: 1
```

#### 2. 进阶用法

**（1）结合 reactive 对象使用**

```vue
<script setup lang="ts">
import { onRenderTriggered, reactive } from 'vue'

interface UserInfo {
  name: string
  age: number
  address: {
    city: string
    street: string
  }
}

const user = reactive<UserInfo>({
  name: '张三',
  age: 25,
  address: {
    city: '北京',
    street: '长安街'
  }
})

onRenderTriggered((e) => {
  console.table({
    key: e.key,
    target: e.target,
    type: e.type,
    oldValue: e.oldValue,
    newValue: e.newValue
  })
})

function updateAge() {
  user.age = 26
}

function updateCity() {
  user.address.city = '上海'
}
</script>

<template>
  <div>
    <p>姓名: {{ user.name }}</p>
    <p>年龄: {{ user.age }}</p>
    <p>城市: {{ user.address.city }}</p>
    <button @click="updateAge">修改年龄</button>
    <button @click="updateCity">修改城市</button>
  </div>
</template>
```

**（2）结合 computed 属性调试**

```vue
<script setup lang="ts">
import { onRenderTriggered, ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

const fullName = computed(() => `${firstName.value}${lastName.value}`)

onRenderTriggered((e) => {
  console.group('渲染触发详情')
  console.log('触发源:', e.key)
  console.log('目标对象类型:', typeof e.target)
  console.log('变更类型:', e.type)
  console.log('旧值 => 新值:', e.oldValue, '=>', e.newValue)
  console.groupEnd()
})

function changeFirstName() {
  firstName.value = '李'
}
</script>

<template>
  <div>
    <p>全名: {{ fullName }}</p>
    <button @click="changeFirstName">改姓</button>
  </div>
</template>
```

**（3）封装调试工具函数**

```ts
// utils/debug.ts
import type { DebuggerEvent, ComponentDebugInfo } from 'vue'

interface DebugOptions {
  /** 是否输出调用栈 */
  stack?: boolean
  /** 自定义日志前缀 */
  prefix?: string
  /** 是否使用 console.table 格式化输出 */
  table?: boolean
}

/**
 * 创建渲染触发调试器
 * @param options 调试配置项
 * @returns 可用于 onRenderTriggered 的回调函数
 */
export function createRenderTriggerDebugger(options: DebugOptions = {}) {
  const {
    stack = false,
    prefix = '[RenderTrigger]',
    table = false
  } = options

  return (e: DebuggerEvent) => {
    const timestamp = new Date().toISOString()

    if (table) {
      console.log(`${prefix} ${timestamp}`)
      console.table({
        key: String(e.key ?? 'N/A'),
        type: e.type,
        oldValue: formatValue(e.oldValue),
        newValue: formatValue(e.newValue)
      })
    } else {
      console.log(`${prefix} ${timestamp}`, {
        key: e.key,
        target: e.target,
        type: e.type,
        oldValue: e.oldValue,
        newValue: e.newValue
      })
    }

    if (stack) {
      console.trace('调用栈:')
    }
  }
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
```

在组件中使用：

```vue
<script setup lang="ts">
import { onRenderTriggered, ref } from 'vue'
import { createRenderTriggerDebugger } from '@/utils/debug'

const count = ref(0)

// 使用封装好的调试工具
onRenderTriggered(
  createRenderTriggerDebugger({
    stack: true,
    prefix: '[CounterComponent]',
    table: true
  })
)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

**（4）在 onMounted 中动态注册**

```vue
<script setup lang="ts">
import { onMounted, onRenderTriggered, ref } from 'vue'

const count = ref(0)
const debugEnabled = ref(false)

onMounted(() => {
  // ✅ 在 onMounted 内动态注册（需要在同步上下文中）
  if (import.meta.env.DEV) {
    onRenderTriggered((e) => {
      if (debugEnabled.value) {
        console.log('[动态调试] 渲染触发:', e.key, e.type)
      }
    })
  }
})
</script>
```

#### 3. API 参数说明

**函数签名：**

```ts
function onRenderTriggered(
  callback: (e: DebuggerEvent) => void
): void
```

**DebuggerEvent 类型定义：**

```ts
interface DebuggerEvent {
  /** 触发变更的响应式对象的引用 */
  target: object
  /** 被修改的属性键名 */
  key: string | symbol | undefined
  /** 操作类型 */
  type: TriggerOpTypes
  /** 变更前的值 */
  oldValue: any
  /** 变更后的值（仅 type 为 set 时存在） */
  newValue?: any
}

// TriggerOpTypes 的可选值
type TriggerOpTypes = 'set' | 'add' | 'delete'
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `target` | `object` | 触发变更的响应式对象本身（如 reactive 对象、ref 的 RefImpl） |
| `key` | `string \| symbol \| undefined` | 被修改的属性键名。对于 `ref` 通常是 `"value"`，对于 `reactive` 对象则是具体的属性名 |
| `type` | `'set' \| 'add' \| 'delete'` | 触发类型：`set`（修改已有属性）、`add`（添加新属性）、`delete`（删除属性） |
| `oldValue` | `any` | 变更前的旧值 |
| `newValue` | `any` | 变更后的新值（注意：`type` 为 `add` 或 `delete` 时可能为 `undefined`） |

**返回值：** `void`（无返回值）

### 四、实现效果

以下示例演示 `onRenderTriggered` 在各种响应式操作下的输出：

```vue
<script setup lang="ts">
import { onRenderTriggered, ref, reactive } from 'vue'

const count = ref(0)
const list = ref<string[]>(['苹果', '香蕉'])
const user = reactive({
  name: '张三',
  age: 25
})

onRenderTriggered((e) => {
  console.group(`[渲染触发] type: ${e.type}`)
  console.log('target:', e.target)
  console.log('key:', String(e.key))
  console.log('oldValue:', e.oldValue)
  console.log('newValue:', e.newValue)
  console.groupEnd()
})

// 操作 1：修改 ref 的值
// 输出: type: "set", key: "value", oldValue: 0, newValue: 1
function changeCount() {
  count.value++
}

// 操作 2：替换 ref 的整个值
// 输出: type: "set", key: "value", oldValue: ['苹果','香蕉'], newValue: ['苹果','香蕉','橘子']
function addFruit() {
  list.value = [...list.value, '橘子']
}

// 操作 3：修改 reactive 对象的属性
// 输出: type: "set", key: "age", oldValue: 25, newValue: 26
function growUp() {
  user.age++
}

// 操作 4：给 reactive 对象添加新属性
// 输出: type: "add", key: "email", oldValue: undefined, newValue: "zhangsan@example.com"
function addEmail() {
  user.email = 'zhangsan@example.com'
}
</script>

<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>水果列表: {{ list.join(', ') }}</p>
    <p>用户: {{ user.name }}, {{ user.age }} 岁</p>
    <button @click="changeCount">计数+1</button>
    <button @click="addFruit">添加水果</button>
    <button @click="growUp">长大一岁</button>
    <button @click="addEmail">添加邮箱</button>
  </div>
</template>
```

### 五、使用场景

#### 1. 定位不必要的重新渲染

当组件频繁重新渲染导致性能问题时，使用 `onRenderTriggered` 精确定位是哪个响应式数据的变化导致的。

```vue
<script setup lang="ts">
import { onRenderTriggered, ref, computed } from 'vue'

const props = defineProps<{
  items: Array<{ id: number; name: string; price: number }>
}>()

const searchText = ref('')
const selectedCategory = ref('all')

// 怀疑某些数据变化导致不必要的渲染
onRenderTriggered((e) => {
  console.warn(
    `[性能排查] 渲染触发源: key="${String(e.key)}", type="${e.type}"`,
    '\n旧值:', e.oldValue,
    '\n新值:', e.newValue
  )
})

const filteredItems = computed(() => {
  return props.items.filter(item =>
    item.name.includes(searchText.value)
  )
})
</script>
```

#### 2. 开发环境性能监控面板

构建一个开发环境下的渲染监控工具，记录所有渲染触发事件。

```vue
<script setup lang="ts">
import { onRenderTriggered, ref, reactive } from 'vue'

interface TriggerLog {
  timestamp: number
  key: string
  type: string
  oldValue: unknown
  newValue: unknown
}

const triggerLogs = ref<TriggerLog[]>([])
const showDebugPanel = ref(false)

if (import.meta.env.DEV) {
  onRenderTriggered((e) => {
    triggerLogs.value.push({
      timestamp: Date.now(),
      key: String(e.key ?? 'N/A'),
      type: e.type,
      oldValue: e.oldValue,
      newValue: e.newValue
    })

    // 最多保留 50 条记录
    if (triggerLogs.value.length > 50) {
      triggerLogs.value.shift()
    }
  })
}
</script>

<template>
  <div>
    <!-- 业务内容 -->
    <slot />

    <!-- 开发调试面板 -->
    <div
      v-if="showDebugPanel && import.meta.env.DEV"
      class="debug-panel"
    >
      <h3>渲染触发记录 ({{ triggerLogs.length }})</h3>
      <div
        v-for="(log, index) in triggerLogs"
        :key="index"
        class="log-item"
      >
        <span class="time">{{ new Date(log.timestamp).toLocaleTimeString() }}</span>
        <span class="key">{{ log.key }}</span>
        <span class="type">{{ log.type }}</span>
        <span class="values">{{ log.oldValue }} => {{ log.newValue }}</span>
      </div>
    </div>

    <button
      v-if="import.meta.env.DEV"
      @click="showDebugPanel = !showDebugPanel"
    >
      {{ showDebugPanel ? '隐藏' : '显示' }}调试面板
    </button>
  </div>
</template>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 500px;
  max-height: 300px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.85);
  color: #0f0;
  font-family: monospace;
  font-size: 12px;
  padding: 12px;
  border-radius: 8px 0 0 0;
  z-index: 9999;
}
.log-item {
  padding: 4px 0;
  border-bottom: 1px solid #333;
}
</style>
```

#### 3. 配合 watch 诊断数据流

当 watch 和渲染行为不一致时，使用 `onRenderTriggered` 辅助诊断数据流向。

```vue
<script setup lang="ts">
import { onRenderTriggered, ref, watch } from 'vue'

const sourceA = ref(0)
const sourceB = ref(0)
const derived = ref(0)

// watch 监听 sourceA
watch(sourceA, (newVal) => {
  console.log('[Watch] sourceA 变化:', newVal)
  derived.value = newVal * 2
})

// 同时用 onRenderTriggered 观察渲染触发源
onRenderTriggered((e) => {
  console.log('[Render] 渲染触发源:', String(e.key), '| 目标:', e.target)
})

// 点击修改 sourceA 时:
// 1. watch 先触发，输出 [Watch] sourceA 变化
// 2. watch 中修改 derived，触发渲染: key="value", target=derived
// 3. 如果模板也直接用了 sourceA，还会再触发一次渲染
</script>

<template>
  <div>
    <p>SourceA: {{ sourceA }}</p>
    <p>Derived: {{ derived }}</p>
    <button @click="sourceA++">修改 SourceA</button>
    <button @click="sourceB++">修改 SourceB</button>
  </div>
</template>
```

#### 4. 检测 computed 依赖变化链

追踪 computed 属性的依赖变化传播路径。

```vue
<script setup lang="ts">
import { onRenderTriggered, ref, computed } from 'vue'

const width = ref(100)
const height = ref(50)

const area = computed(() => width.value * height.value)

const description = computed(() => {
  return `面积: ${area.value}px²`
})

onRenderTriggered((e) => {
  console.log(
    `[依赖链追踪] 最终触发源: ${String(e.key)} | 值: ${e.oldValue} => ${e.newValue}`
  )
})

// 修改 width 时，依赖链: width -> area -> description -> 渲染
// 但 onRenderTriggered 只会报告最终导致渲染触发的那个依赖
</script>

<template>
  <div>
    <p>{{ description }}</p>
    <button @click="width += 10">宽度+10</button>
    <button @click="height += 10">高度+10</button>
  </div>
</template>
```

#### 5. 组件库开发中的变更日志

在组件库开发时，记录组件内部的响应式状态变更日志。

```ts
// composables/useRenderDebug.ts
import { onRenderTriggered } from 'vue'

interface RenderDebugOptions {
  /** 组件名称，用于日志前缀 */
  componentName: string
  /** 最大日志条数 */
  maxLogs?: number
  /** 是否自动打印到控制台 */
  autoLog?: boolean
}

interface RenderTriggerRecord {
  timestamp: number
  key: string
  type: string
  summary: string
}

/**
 * 组件渲染调试 composable
 * 仅在开发环境生效
 */
export function useRenderDebug(options: RenderDebugOptions) {
  const { componentName, maxLogs = 100, autoLog = true } = options

  const records: RenderTriggerRecord[] = []

  if (import.meta.env.DEV) {
    onRenderTriggered((e) => {
      const record: RenderTriggerRecord = {
        timestamp: Date.now(),
        key: String(e.key ?? 'N/A'),
        type: e.type,
        summary: `[${componentName}] key="${String(e.key)}" ${e.oldValue} => ${e.newValue}`
      }

      records.push(record)

      if (records.length > maxLogs) {
        records.shift()
      }

      if (autoLog) {
        console.log(record.summary)
      }
    })
  }

  return {
    records,
    getTriggerCount: () => records.length,
    clearRecords: () => records.length = 0
  }
}
```

在组件库组件中使用：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRenderDebug } from '@/composables/useRenderDebug'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 开发调试
useRenderDebug({
  componentName: 'MyInput',
  autoLog: true
})

const localValue = ref(props.modelValue)

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  localValue.value = value
  emit('update:modelValue', value)
}
</script>
```

#### 6. 检测 Pinia Store 状态变更导致的渲染

监控 Pinia Store 的哪些状态变化导致了组件重新渲染。

```vue
<script setup lang="ts">
import { onRenderTriggered } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

if (import.meta.env.DEV) {
  onRenderTriggered((e) => {
    // 检查是否是 store 中的数据导致的渲染
    const targetStr = String(e.target)
    if (targetStr.includes('Reactive') || targetStr.includes('pinia')) {
      console.warn(
        `[Pinia 渲染检测] Store 状态变化触发渲染:`,
        `key=${String(e.key)}, type=${e.type}`
      )
    }
  })
}
</script>

<template>
  <div>
    <p>用户名: {{ userStore.userInfo.name }}</p>
    <p>登录状态: {{ userStore.isLoggedIn ? '已登录' : '未登录' }}</p>
  </div>
</template>
```

#### 7. 检测 props 变化触发的子组件渲染

分析父组件传入的 props 哪些变化导致了子组件的重新渲染。

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
import { onRenderTriggered } from 'vue'

const props = defineProps<{
  title: string
  data: Array<{ id: number; value: string }>
  config: {
    theme: string
    pageSize: number
  }
}>()

if (import.meta.env.DEV) {
  onRenderTriggered((e) => {
    console.log(
      `[ChildComponent] 因 props 变化重新渲染`,
      `\n  key: ${String(e.key)}`,
      `\n  type: ${e.type}`,
      `\n  oldValue:`, e.oldValue,
      `\n  newValue:`, e.newValue
    )

    // 如果 config 对象引用每次都变，说明父组件没有做缓存
    if (String(e.key) === 'config') {
      console.warn(
        '[ChildComponent] config 每次都变化，建议父组件使用 computed 或 shallowRef 优化'
      )
    }
  })
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <ul>
      <li v-for="item in data" :key="item.id">{{ item.value }}</li>
    </ul>
  </div>
</template>
```

#### 8. 结合性能标记（Performance Mark）

将渲染触发事件与浏览器 Performance API 结合，量化渲染性能。

```vue
<script setup lang="ts">
import { onRenderTriggered, ref } from 'vue'

const count = ref(0)

onRenderTriggered((e) => {
  const markName = `render-trigger-${Date.now()}`

  // 使用 Performance API 打标记
  performance.mark(markName)

  console.log(
    `[Performance] 渲染触发: ${String(e.key)} |`,
    `oldValue=${e.oldValue}, newValue=${e.newValue}`
  )
})

function heavyUpdate() {
  const startMark = 'update-start'
  performance.mark(startMark)

  // 执行一系列更新
  count.value++

  requestAnimationFrame(() => {
    const endMark = 'update-end'
    performance.mark(endMark)
    performance.measure('更新到渲染完成', startMark, endMark)

    const measures = performance.getEntriesByName('更新到渲染完成')
    const latest = measures[measures.length - 1]
    if (latest) {
      console.log(`[Performance] 更新到渲染完成耗时: ${latest.duration.toFixed(2)}ms`)
    }
  })
}
</script>

<template>
  <button @click="heavyUpdate">触发更新</button>
  <p>{{ count }}</p>
</template>
```

#### 9. 检测 provide/inject 数据变更

追踪跨组件层级注入的数据变化是否触发了当前组件的渲染。

```vue
<!-- ChildDeepComponent.vue -->
<script setup lang="ts">
import { onRenderTriggered, inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

const themeKey: InjectionKey<Ref<string>> = Symbol('theme') as unknown as InjectionKey<Ref<string>>
const theme = inject(themeKey, ref('light'))

if (import.meta.env.DEV) {
  onRenderTriggered((e) => {
    console.log(
      `[深层子组件] 检测到渲染触发`,
      `\n  可能来自 provide/inject: key="${String(e.key)}"`,
      `\n  当前 theme 值: ${theme.value}`
    )
  })
}
</script>

<template>
  <div :class="`theme-${theme}`">
    当前主题: {{ theme }}
  </div>
</template>
```

#### 10. 全局调试插件集成

创建一个 Vite 插件或 Vue 插件，在所有组件中自动注入 `onRenderTriggered` 调试。

```ts
// plugins/renderDebug.ts
import type { App } from 'vue'

/**
 * Vue 全局渲染调试插件
 * 仅在开发环境注册
 */
export function installRenderDebugPlugin(app: App) {
  if (!import.meta.env.DEV) return

  app.mixin({
    setup() {
      // ❌ 注意：mixin 中的 onRenderTriggered 可以工作，
      // 但 mixin 方式在 Vue 3 中不推荐，仅作调试用途
      const { onRenderTriggered } = await import('vue')

      onRenderTriggered((e) => {
        console.log(
          `[全局调试] 渲染触发: key="${String(e.key)}", type="${e.type}"`
        )
      })
    }
  })
}
```

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { installRenderDebugPlugin } from './plugins/renderDebug'

const app = createApp(App)

if (import.meta.env.DEV) {
  installRenderDebugPlugin(app)
}

app.mount('#app')
```

### 六、注意事项

1. **仅开发模式生效**
   `onRenderTriggered` 只在开发环境（`import.meta.env.DEV` 为 `true`）下工作。生产构建时，Vue 会完全移除这些调试钩子的调用，不会产生任何性能开销。

   ```ts
   // ✅ 不需要手动判断环境，Vue 内部已处理
   onRenderTriggered((e) => {
     console.log(e) // 生产环境中这行不会执行
   })
   ```

2. **不要用于业务逻辑**
   该钩子专为调试设计，不应依赖它来执行任何业务逻辑。它的行为在开发和生产环境下不一致。

   ```ts
   // ❌ 错误：不要在回调中编写业务逻辑
   onRenderTriggered((e) => {
     if (e.key === 'status') {
       sendAnalytics(e.newValue) // 业务逻辑不应放在这里
     }
   })

   // ✅ 正确：使用 watch 处理业务逻辑
   watch(() => status.value, (newVal) => {
     sendAnalytics(newVal)
   })
   ```

3. **注册时机必须在 setup 同步上下文中**
   `onRenderTriggered` 必须在 `setup()` 函数或 `<script setup>` 的同步执行阶段注册。不能在 `setTimeout`、`Promise.then` 等异步回调中注册。

   ```ts
   // ❌ 错误：异步注册无效
   setTimeout(() => {
     onRenderTriggered(() => {
       console.log('永远不会被调用')
     })
   }, 100)

   // ✅ 正确：在 setup 同步上下文中注册
   onRenderTriggered((e) => {
     console.log('正确注册')
   })
   ```

4. **与 onRenderTracked 的区别**
   - `onRenderTriggered`：仅在**重新渲染被触发**时调用（响应式数据变化后）
   - `onRenderTracked`：在**首次渲染时收集依赖**时就会调用（每个依赖收集一次）
   - 如需追踪"谁导致了渲染"，用 `onRenderTriggered`；如需追踪"渲染依赖了谁"，用 `onRenderTracked`

5. **newValue 在某些情况下可能为 undefined**
   当 `type` 为 `'delete'`（删除属性）或 `'add'`（添加新属性）时，`newValue` 可能为 `undefined`。在使用时需要做安全检查。

   ```ts
   onRenderTriggered((e) => {
     // ✅ 安全地处理可能为 undefined 的值
     const displayNewValue = e.newValue !== undefined
       ? JSON.stringify(e.newValue)
       : '(undefined)'
     console.log(`变更: ${e.oldValue} => ${displayNewValue}`)
   })
   ```

6. **深层对象变化报告的是最终触发源**
   当嵌套对象的深层属性变化时，`target` 和 `key` 报告的是最终导致渲染触发的那个响应式对象和属性，而非中间的 computed 依赖。

7. **高频变更时注意控制台性能**
   如果组件有大量快速变化的响应式数据，`onRenderTriggered` 会频繁触发，大量 `console.log` 会拖慢浏览器。建议添加节流或条件过滤。

   ```ts
   // ✅ 添加条件过滤避免控制台刷屏
   onRenderTriggered((e) => {
     // 只关注特定 key 的变化
     if (String(e.key) === 'importantData') {
       console.log('重要数据变化:', e)
     }
   })
   ```

8. **与 Vue DevTools 的关系**
   `onRenderTriggered` 提供的信息与 Vue DevTools 中的组件事件面板互补。DevTools 可以可视化地展示渲染触发信息，而 `onRenderTriggered` 允许你以编程方式捕获和处理这些信息。在复杂调试场景中两者结合使用效果更佳。

9. **onRenderTriggered 不等于组件更新完成**
   回调触发时表示渲染**被触发**了，但不代表 DOM 更新已经完成。如果需要在 DOM 更新后执行操作，应该使用 `nextTick`。

   ```ts
   // ❌ 错误：此时 DOM 可能还未更新
   onRenderTriggered(() => {
     const el = document.getElementById('my-element')
     console.log(el?.textContent) // 可能是旧值
   })

   // ✅ 正确：在 nextTick 中访问更新后的 DOM
   onRenderTriggered(async () => {
     await nextTick()
     const el = document.getElementById('my-element')
     console.log(el?.textContent) // 确保是新值
   })
   ```

10. **一个组件可以注册多个 onRenderTriggered**
    可以在同一组件中多次调用 `onRenderTriggered`，所有回调都会按照注册顺序依次执行。

    ```ts
    // ✅ 多次注册，按顺序执行
    onRenderTriggered((e) => {
      console.log('第一个回调:', e.key)
    })

    onRenderTriggered((e) => {
      console.log('第二个回调:', e.type)
    })
    ```

### 七、相关 API 对比

| 特性 | `onRenderTriggered` | `onRenderTracked` | `watch` | `watchEffect` |
|------|---------------------|--------------------|---------|---------------|
| 触发时机 | 响应式依赖变化触发重新渲染时 | 渲染函数首次追踪到依赖时 | 被监听的源变化时 | 响应式依赖变化时 |
| 用途 | 调试：定位渲染触发原因 | 调试：查看渲染依赖了哪些数据 | 业务逻辑：响应数据变化 | 业务逻辑：自动追踪依赖 |
| 生产环境 | 不生效 | 不生效 | 正常生效 | 正常生效 |
| 适合场景 | 性能优化排查 | 依赖分析 | 数据同步、副作用 | 自动化副作用管理 |
| 回调参数 | `DebuggerEvent` | `DebuggerEvent` | `newValue, oldValue` | 无（通过 `onCleanup` 清理） |

```vue
<script setup lang="ts">
import {
  onRenderTriggered,
  onRenderTracked,
  watch,
  watchEffect,
  ref
} from 'vue'

const count = ref(0)

// onRenderTracked: 初次渲染时，每追踪到一个依赖就触发一次
onRenderTracked((e) => {
  console.log('[Tracked] 依赖被追踪:', e.key)
})

// onRenderTriggered: 后续依赖变化触发重新渲染时才调用
onRenderTriggered((e) => {
  console.log('[Triggered] 重新渲染触发:', e.key, e.oldValue, '=>', e.newValue)
})

// watch: 明确监听某个数据源
watch(count, (newVal, oldVal) => {
  console.log('[Watch] count 变化:', oldVal, '=>', newVal)
})

// watchEffect: 自动追踪内部使用的响应式依赖
watchEffect(() => {
  console.log('[WatchEffect] count 当前值:', count.value)
})
</script>
```

### 八、总结

`onRenderTriggered` 是 Vue 3 专为**调试和性能优化**设计的生命周期钩子。它的核心价值在于：

- **精确定位渲染原因**：告诉你哪个响应式数据的哪次变化导致了组件重新渲染
- **零生产成本**：仅在开发模式下生效，生产环境完全无开销
- **辅助性能优化**：帮助识别不必要的重新渲染，指导 `computed`、`shallowRef`、`v-memo` 等优化手段的使用
- **完善的变更信息**：提供 `target`、`key`、`type`、`oldValue`、`newValue` 等详细信息

> 💡 **提示：** 日常开发中，优先使用 Vue DevTools 进行可视化调试。当 DevTools 无法满足需求（如需要自定义日志格式、需要在 CI 环境中捕获信息、需要构建自定义调试面板）时，`onRenderTriggered` 是最佳选择。

> ⚠️ **注意：** 始终牢记 `onRenderTriggered` 是调试工具，不是业务工具。不要在任何生产环境的业务逻辑中依赖它。
