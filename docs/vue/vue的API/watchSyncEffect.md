### watchSyncEffect

> 📖 [Vue 官方文档 - watchSyncEffect](https://cn.vuejs.org/api/reactivity-core.html#watchsynceffect)

---

### 一、概述

`watchSyncEffect` 是 Vue 3 提供的一个响应式侦听 API，它是 `watchEffect` 的同步版本。与 `watchEffect` 不同，`watchSyncEffect` 中的回调函数会在响应式数据发生变化时**立即同步执行**，而不是等到下一个 "tick" 或 DOM 更新之后。它等价于使用 `watchEffect` 并传入 `{ flush: 'sync' }` 选项。

简单来说：当你的响应式数据一变，`watchSyncEffect` 里的代码**马上就跑**，没有任何延迟排队。

---

### 二、核心原理

#### 2.1 侦听机制

Vue 3 的响应式系统基于 Proxy 实现。当你访问响应式数据的 `.value`（`ref`）或属性（`reactive`）时，Vue 会自动追踪这些依赖。当依赖发生变化时，侦听器会被触发。

#### 2.2 执行时机对比

可以类比为"外卖配送"：

- **`watchEffect`**（默认 flush: 'pre'）：像点了外卖，骑手会等到出餐后统一配送（在 DOM 更新前异步执行）
- **`watchPostEffect`**（flush: 'post'）：像外卖送到后你才收到通知（在 DOM 更新后异步执行）
- **`watchSyncEffect`**（flush: 'sync'）：像厨房刚出锅就直接端到你面前（同步、立即执行，不进入队列）

```
响应式数据变化
    │
    ├── watchEffect ──────► 放入队列，在 DOM 更新前异步执行
    ├── watchPostEffect ──► 放入队列，在 DOM 更新后异步执行
    └── watchSyncEffect ──► 立即同步执行（无队列、无等待）
```

#### 2.3 底层机制

`watchSyncEffect` 本质上是：

```ts
// 内部等价实现
watchEffect(callback, { flush: 'sync' })
```

它绕过了 Vue 的调度器（Scheduler），直接在响应式副作用触发时同步调用回调函数，不经过微任务队列排队。

---

### 三、详细用法

#### 1. 基本用法

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="count++">+1</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const count = ref<number>(0)

watchSyncEffect(() => {
  // 当 count 变化时，立即同步执行
  console.log('count 变化了:', count.value)
})
</script>
```

```ts
// 返回值：一个停止侦听的函数
const stop = watchSyncEffect(() => {
  console.log(count.value)
})

// 调用 stop() 即可停止侦听
stop()
```

#### 2. 进阶用法

##### 2.1 侦听多个响应式源

```vue
<script setup lang="ts">
import { ref, reactive, watchSyncEffect } from 'vue'

const firstName = ref<string>('张')
const lastName = ref<string>('三')
const user = reactive<{ age: number }>({ age: 25 })

watchSyncEffect(() => {
  // 自动追踪内部访问到的所有响应式数据
  console.log(`姓名: ${firstName.value}${lastName.value}, 年龄: ${user.age}`)
})

// 修改任何一个依赖，回调都会立即同步执行
firstName.value = '李'  // 立即输出: 姓名: 李三, 年龄: 25
lastName.value = '四'   // 立即输出: 姓名: 李四, 年龄: 25
user.age = 30           // 立即输出: 姓名: 李四, 年龄: 30
</script>
```

##### 2.2 配合 onCleanup 清理副作用

```vue
<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const taskId = ref<number>(1)

watchSyncEffect((onCleanup) => {
  const currentId = taskId.value
  console.log(`开始处理任务 #${currentId}`)

  onCleanup(() => {
    console.log(`清理任务 #${currentId} 的副作用`)
  })
})

// 快速连续修改时，前一次的清理函数会在下一次回调执行前被调用
taskId.value = 2
taskId.value = 3
</script>
```

##### 2.3 同步保持派生状态

```vue
<template>
  <div>
    <p>原价: {{ price }}</p>
    <p>折后价: {{ discountedPrice }}</p>
    <button @click="price += 10">涨价</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const price = ref<number>(100)
const discountedPrice = ref<number>(80)

watchSyncEffect(() => {
  // 确保 discountedPrice 始终是 price 的 80%
  discountedPrice.value = Math.round(price.value * 0.8)
})

// price 变化后，discountedPrice 立即同步更新，不会出现中间状态
</script>
```

##### 2.4 在组合式函数（Composable）中使用

```ts
// useSyncLocalStorage.ts
import { ref, watchSyncEffect, type Ref } from 'vue'

export function useSyncLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue) as Ref<T>

  watchSyncEffect(() => {
    // data 每次变化都立即同步写入 localStorage
    localStorage.setItem(key, JSON.stringify(data.value))
  })

  return data
}
```

```vue
<template>
  <input v-model="theme" placeholder="切换主题" />
</template>

<script setup lang="ts">
import { useSyncLocalStorage } from './useSyncLocalStorage'

const theme = useSyncLocalStorage<string>('app-theme', 'light')
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `effect` | `(onCleanup: (cleanupFn: () => void) => void) => void` | 副作用回调函数，自动追踪内部访问的响应式依赖。接收一个 `onCleanup` 函数用于注册清理回调 |
| **返回值** | `() => void` | 返回一个停止侦听函数，调用后将不再触发回调 |

| 特性 | 说明 |
|------|------|
| 执行时机 | 同步，响应式数据变化时立即执行 |
| 自动追踪依赖 | 是，自动追踪回调中访问的所有响应式数据 |
| 旧值访问 | 不支持（与 `watch` 不同，无法获取旧值） |
| 首次执行 | 是，创建后立即执行一次 |
| 清理回调 | 支持，通过 `onCleanup` 参数 |

---

### 四、实现效果

#### 示例：同步日志打印

```vue
<template>
  <div>
    <p>值: {{ value }}</p>
    <button @click="updateValue">连续更新</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect, watchEffect } from 'vue'

const value = ref<number>(0)

// ✅ watchSyncEffect: 每次变化都立即打印，共打印 4 次（含初始 1 次）
watchSyncEffect(() => {
  console.log('[sync]', value.value)
})

// 对比：watchEffect 只会在最后打印 2 次（初始 1 次 + 最终值 1 次）
watchEffect(() => {
  console.log('[async]', value.value)
})

const updateValue = (): void => {
  value.value = 1  // [sync] 立即打印 1
  value.value = 2  // [sync] 立即打印 2
  value.value = 3  // [sync] 立即打印 3
  // [async] 只会打印最终的 3
}
</script>
```

运行后控制台输出：

```
[sync] 0   ← 创建时立即执行
[async] 0  ← 创建时立即执行
--- 点击按钮后 ---
[sync] 1   ← 立即同步执行
[sync] 2   ← 立即同步执行
[sync] 3   ← 立即同步执行
[async] 3  ← 异步，只打印最终值
```

> 💡 **提示：** 可以看到 `watchSyncEffect` 捕获了每一次中间状态的变化，而 `watchEffect` 只捕获了最终状态。

---

### 五、使用场景

#### 1. 同步持久化状态到 localStorage

```vue
<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const settings = ref({
  theme: 'dark',
  fontSize: 14,
  language: 'zh-CN'
})

watchSyncEffect(() => {
  // 设置一变化就立即写入，确保不会因页面意外关闭而丢失数据
  localStorage.setItem('app-settings', JSON.stringify(settings.value))
})
</script>
```

#### 2. 精确的同步数据转换

```vue
<template>
  <canvas ref="canvasRef" width="400" height="400" />
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rotation = ref<number>(0)

watchSyncEffect(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // rotation 变化时立即同步重绘，确保 canvas 内容与状态始终一致
  ctx.clearRect(0, 0, 400, 400)
  ctx.save()
  ctx.translate(200, 200)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.fillStyle = '#42b883'
  ctx.fillRect(-50, -50, 100, 100)
  ctx.restore()
})
</script>
```

#### 3. 表单数据的同步校验

```vue
<template>
  <form>
    <input v-model="email" placeholder="邮箱" />
    <span v-if="emailError" class="error">{{ emailError }}</span>

    <input v-model="password" type="password" placeholder="密码" />
    <span v-if="passwordError" class="error">{{ passwordError }}</span>
  </form>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const email = ref<string>('')
const password = ref<string>('')
const emailError = ref<string>('')
const passwordError = ref<string>('')

watchSyncEffect(() => {
  // 同步校验，确保错误信息与输入值在同一渲染周期内保持一致
  if (!email.value) {
    emailError.value = '邮箱不能为空'
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    emailError.value = '邮箱格式不正确'
  } else {
    emailError.value = ''
  }

  if (!password.value) {
    passwordError.value = '密码不能为空'
  } else if (password.value.length < 6) {
    passwordError.value = '密码至少 6 位'
  } else {
    passwordError.value = ''
  }
})
</script>
```

#### 4. 多个状态之间的同步约束

```vue
<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const startDate = ref<string>('2024-01-01')
const endDate = ref<string>('2024-12-31')

watchSyncEffect(() => {
  // 确保 endDate 始终 >= startDate
  if (endDate.value < startDate.value) {
    endDate.value = startDate.value
  }
})
</script>
```

#### 5. 调试与日志追踪

```ts
// useDebugTracker.ts
import { watchSyncEffect, type Ref } from 'vue'

export function useDebugTracker<T>(
  name: string,
  source: Ref<T>,
  enableLog: boolean = true
): void {
  if (!enableLog) return

  watchSyncEffect(() => {
    // 同步记录状态变化的完整调用栈，便于调试
    console.log(
      `%c[DEBUG] ${name} 变化为:`,
      'color: #42b883; font-weight: bold',
      source.value,
      '\n调用栈:',
      new Error().stack?.split('\n').slice(2, 5).join('\n')
    )
  })
}
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebugTracker } from './useDebugTracker'

const userId = ref<number>(0)
useDebugTracker('userId', userId)
</script>
```

#### 6. 同步维护缓存一致性

```ts
// useSyncCache.ts
import { reactive, watchSyncEffect } from 'vue'

interface CacheState {
  data: Map<string, unknown>
  timestamp: Map<string, number>
  version: Map<string, number>
}

export function useSyncCache() {
  const cache = reactive<CacheState>({
    data: new Map(),
    timestamp: new Map(),
    version: new Map()
  })

  watchSyncEffect(() => {
    // 当 version 变化时，同步更新 timestamp，保持缓存元数据一致性
    cache.version.forEach((ver, key) => {
      cache.timestamp.set(key, Date.now())
    })
  })

  return cache
}
```

#### 7. 响应式计算属性链（同步级联更新）

```vue
<template>
  <div>
    <p>原始数据: {{ rawData }}</p>
    <p>过滤数据: {{ filteredData }}</p>
    <p>排序数据: {{ sortedData }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const rawData = ref<number[]>([5, 3, 8, 1, 9, 2, 7])
const filteredData = ref<number[]>([])
const sortedData = ref<number[]>([])

watchSyncEffect(() => {
  // 第一步：过滤
  filteredData.value = rawData.value.filter(n => n > 3)
})

watchSyncEffect(() => {
  // 第二步：排序（依赖上一步的结果）
  // 因为 filteredData 是同步更新的，所以这里不会出现中间状态
  sortedData.value = [...filteredData.value].sort((a, b) => a - b)
})
</script>
```

#### 8. 性能监控埋点

```vue
<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const apiResponseTime = ref<number>(0)
const slowThreshold = 500

watchSyncEffect(() => {
  // 同步记录超过阈值的慢请求，确保不会遗漏任何一次
  if (apiResponseTime.value > slowThreshold) {
    console.warn(
      `[性能告警] 接口响应耗时 ${apiResponseTime.value}ms，超过阈值 ${slowThreshold}ms`
    )
  }
})

// 模拟接口响应
const simulateApiCall = async (): Promise<void> => {
  const start = Date.now()
  await new Promise(resolve => setTimeout(resolve, 600))
  apiResponseTime.value = Date.now() - start  // 同步触发告警
}
</script>
```

#### 9. 全局状态同步到多个组件实例

```ts
// useGlobalCounter.ts
import { ref, watchSyncEffect } from 'vue'

const globalCount = ref<number>(0)
const listeners: Array<(count: number) => void> = []

export function useGlobalCounter() {
  const localCount = ref<number>(globalCount.value)

  watchSyncEffect(() => {
    // 全局变化时同步更新本地副本，确保一致性
    localCount.value = globalCount.value
  })

  const increment = (): void => {
    globalCount.value++
  }

  return { globalCount, localCount, increment }
}
```

#### 10. 数学公式实时同步计算

```vue
<template>
  <div>
    <label>半径: <input v-model.number="radius" type="number" /></label>
    <p>面积: {{ area }}</p>
    <p>周长: {{ circumference }}</p>
    <p>体积 (球): {{ volume }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const radius = ref<number>(1)
const area = ref<number>(0)
const circumference = ref<number>(0)
const volume = ref<number>(0)

watchSyncEffect(() => {
  const r = radius.value
  area.value = +(Math.PI * r * r).toFixed(4)
  circumference.value = +(2 * Math.PI * r).toFixed(4)
  volume.value = +((4 / 3) * Math.PI * r * r * r).toFixed(4)
})
</script>
```

---

### 六、注意事项

#### 1. 避免在回调中修改被侦听的响应式数据

```ts
// ❌ 错误：可能导致无限递归
const count = ref(0)
watchSyncEffect(() => {
  count.value++  // 修改了自己正在侦听的数据，无限循环
})

// ✅ 正确：避免在回调中修改被追踪的源数据
const multiplier = ref(2)
const base = ref(10)
const result = ref(20)

watchSyncEffect(() => {
  result.value = base.value * multiplier.value  // result 不是被追踪的源
})
```

> ⚠️ **注意：** 由于 `watchSyncEffect` 是同步执行的，无限递归会导致栈溢出（RangeError: Maximum call stack size exceeded），而不是像异步版本那样可以被 Vue 的调度器去重。

#### 2. 性能开销较大

```ts
// ❌ 高频操作中慎用
const mouseX = ref(0)
const mouseY = ref(0)

// 鼠标移动事件每秒可能触发数十次
watchSyncEffect(() => {
  // 每次鼠标移动都同步执行，可能造成性能问题
  console.log(`鼠标位置: ${mouseX.value}, ${mouseY.value}`)
})

// ✅ 对高频场景使用 watchEffect（异步），让调度器合并多次更新
watchEffect(() => {
  console.log(`鼠标位置: ${mouseX.value}, ${mouseY.value}`)
})
```

#### 3. 无法访问旧值

```ts
const count = ref(0)

// ❌ watchSyncEffect 无法获取旧值
watchSyncEffect(() => {
  // 没有参数可以获取 count 变化前的值
  console.log(count.value)
})

// ✅ 如果需要旧值，使用 watch
watch(count, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`)
})
```

#### 4. 不要在回调中访问 DOM

```vue
<template>
  <div ref="divRef">{{ message }}</div>
</template>

<script setup lang="ts">
import { ref, watchSyncEffect } from 'vue'

const message = ref('hello')
const divRef = ref<HTMLDivElement | null>(null)

// ❌ 回调同步执行时 DOM 尚未更新
watchSyncEffect(() => {
  console.log(divRef.value?.textContent) // 可能还是旧值
})

// ✅ 如果需要访问更新后的 DOM，使用 watchPostEffect
import { watchPostEffect } from 'vue'
watchPostEffect(() => {
  console.log(divRef.value?.textContent) // DOM 已更新
})
</script>
```

#### 5. 注意与 watch 的区别

```ts
// watchSyncEffect: 自动追踪依赖，不支持旧值，同步执行
watchSyncEffect(() => {
  console.log(count.value, user.name)  // 自动追踪 count 和 user.name
})

// watch: 精确指定数据源，支持旧值，可配置执行时机
watch(
  () => count.value,
  (newVal, oldVal) => {
    console.log(newVal, oldVal)  // 可以获取新旧值
  },
  { flush: 'sync' }
)
```

#### 6. 回调中避免异步操作

```ts
// ❌ 不推荐：在同步侦听器中使用异步操作
watchSyncEffect(async () => {
  const data = await fetchData()  // 异步操作放在同步侦听器中不合理
  console.log(data)
})

// ✅ 正确：如果需要异步操作，使用 watchEffect 或 watch
watchEffect(async () => {
  const data = await fetchData()
  console.log(data)
})
```

#### 7. 生命周期中及时停止侦听

```vue
<script setup lang="ts">
import { ref, watchSyncEffect, onBeforeUnmount } from 'vue'

const count = ref(0)

// 在 setup 中创建的 watchSyncEffect 会在组件卸载时自动停止
watchSyncEffect(() => {
  console.log(count.value)
})

// 但在非组件上下文中使用时，需要手动停止
const stop = watchSyncEffect(() => {
  console.log(count.value)
})

// ✅ 手动管理时记得在合适的时机停止
onBeforeUnmount(() => {
  stop()
})
</script>
```

> 💡 **提示：** 在 `setup` 或 `<script setup>` 中创建的 `watchSyncEffect` 会自动绑定到当前组件实例，组件卸载时自动停止。但在独立函数或组合式函数中如果使用了组件外的生命周期，需要手动管理。

#### 8. 组件更新期间避免使用

```ts
// ❌ 不要在 created/mounted 等生命周期中同步修改被侦听的源
import { onMounted } from 'vue'

onMounted(() => {
  watchSyncEffect(() => {
    // 如果这里修改了父组件传递的 props，可能触发连锁更新
    props.data.value = computed.value
  })
})

// ✅ 使用 computed 或 watch 代替
const derived = computed(() => transform(props.data))
```

#### 9. 慎用于批量操作场景

```ts
// ❌ 批量更新时每次都会同步触发
const items = ref<number[]>([])

watchSyncEffect(() => {
  console.log('items 变化:', items.value.length)
})

// 每次 push 都会同步触发一次回调
items.value.push(1)  // 触发
items.value.push(2)  // 触发
items.value.push(3)  // 触发

// ✅ 如果只需要最终结果，使用一次性赋值
items.value = [1, 2, 3]  // 只触发一次
```

#### 10. 与响应式解构的配合

```ts
import { reactive, toRefs, watchSyncEffect } from 'vue'

const state = reactive({ x: 0, y: 0 })

// ✅ toRefs 保持响应性
const { x, y } = toRefs(state)

watchSyncEffect(() => {
  console.log(x.value, y.value)  // 正确追踪
})

// ❌ 直接解构丢失响应性
const { x: rawX, y: rawY } = state

watchSyncEffect(() => {
  console.log(rawX, rawY)  // 不会触发更新，rawX/rawY 是普通值
})
```

---

### 七、相关 API 对比

| 特性 | `watchSyncEffect` | `watchEffect` | `watchPostEffect` | `watch` |
|------|--------------------|---------------|--------------------|---------|
| 执行时机 | 同步（立即） | 组件更新前（异步） | 组件更新后（异步） | 可配置 |
| flush 选项 | `'sync'` | `'pre'`（默认） | `'post'` | 可配置 |
| 自动追踪依赖 | 是 | 是 | 是 | 否（显式指定） |
| 获取旧值 | 否 | 否 | 否 | 是 |
| 首次执行 | 立即执行 | 立即执行 | 立即执行 | 默认否（可配置 `immediate`） |
| 性能影响 | 较高 | 中等 | 中等 | 较低 |
| 适用场景 | 需要同步一致性 | 通用副作用 | DOM 依赖操作 | 精确侦听 |

```ts
import { ref, watchSyncEffect, watchEffect, watchPostEffect, watch } from 'vue'

const count = ref(0)

// 同步执行
watchSyncEffect(() => {
  console.log('sync:', count.value)
})

// 异步，DOM 更新前
watchEffect(() => {
  console.log('pre:', count.value)
})

// 异步，DOM 更新后
watchPostEffect(() => {
  console.log('post:', count.value)
})

// 精确控制，可获取旧值
watch(count, (newVal, oldVal) => {
  console.log('watch:', oldVal, '->', newVal)
})
```

---

### 八、总结

`watchSyncEffect` 是一个强大但需要谨慎使用的 API。它的核心价值在于**同步一致性**，确保响应式数据变化后回调立即执行，不存在中间状态。主要适用于：

- 需要数据同步一致性的场景（如缓存、派生状态）
- 实时数据转换和同步校验
- 调试和性能监控
- 状态持久化（防止数据丢失）

但要注意其性能开销和无限递归风险。在大多数场景下，优先使用 `watchEffect` 或 `watch`，只在确实需要同步执行时才选择 `watchSyncEffect`。

> 💡 **提示：** 经验法则 —— 如果你的逻辑可以用 `computed` 解决，优先用 `computed`；如果需要副作用但不需要同步，优先用 `watchEffect`；只有当你确实需要"数据一变就立即执行"时，才使用 `watchSyncEffect`。
