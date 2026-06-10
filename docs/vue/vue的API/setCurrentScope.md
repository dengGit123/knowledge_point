### setCurrentScope

> 📖 [Vue 3 响应式 API：进阶 — 官方文档](https://cn.vuejs.org/api/reactivity-advanced)
>
> ⚠️ **注意：** `setCurrentScope` 并非 Vue 3 官方公开文档中列出的公共 API，而是 Vue 响应式系统内部的底层函数。Vue 官方公开的 EffectScope 相关 API 为 `effectScope()`、`getCurrentScope()` 和 `onScopeDispose()`。`setCurrentScope` 可从 `vue` 中导入，但主要用于高级场景和库的开发。

### 一、概述

`setCurrentScope` 是 Vue 3 响应式系统中用于**手动设置当前激活的 effect 作用域**的内部函数。它的核心作用是：在不使用 `scope.run()` 的情况下，直接将某个 `EffectScope` 实例设为当前活跃作用域，使后续创建的响应式副作用（`computed`、`watch`、`watchEffect` 等）被该作用域捕获和管理。

**为什么需要它？**

在 Vue 3 的响应式系统中，每个组件实例都有一个关联的 `EffectScope`。当组件卸载时，该作用域内所有的响应式副作用会自动清理。但在以下场景中，我们需要更精细的作用域控制：

- 在组件外部创建响应式逻辑（如 composables 工具函数）
- 构建需要独立管理副作用的库或工具
- 需要在不同作用域之间灵活切换的高级场景
- 实现自定义的作用域管理策略

`setCurrentScope` 允许开发者手动接管作用域的切换逻辑，弥补了 `scope.run()` 只能在同步回调内激活作用域的局限性。

### 二、核心原理

#### 1. EffectScope 的作用域机制

Vue 3 的响应式系统维护了一个全局变量 `activeEffectScope`，它始终指向当前激活的作用域。当你在代码中创建 `computed`、`watch`、`watchEffect` 等响应式副作用时，它们会自动注册到 `activeEffectScope` 中。

```
┌──────────────────────────────────────────────────┐
│              全局 activeEffectScope                │
│                                                    │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐         │
│  │ watch   │   │computed │   │watchEffect│        │
│  └─────────┘   └─────────┘   └─────────┘         │
│                                                    │
│  scope.stop() → 所有副作用同时销毁                  │
└──────────────────────────────────────────────────┘
```

#### 2. setCurrentScope 的工作方式

`setCurrentScope` 本质上是对 `activeEffectScope` 这个全局变量的直接赋值操作：

- **传入一个 `EffectScope` 实例**：将其设为当前活跃作用域
- **传入 `null`**：清除当前作用域，后续创建的副作用不会被任何作用域捕获
- **返回值**：返回之前激活的 `EffectScope` 实例，用于后续恢复

#### 3. 与 scope.run() 的关系

`scope.run(fn)` 内部其实就是通过临时切换 `activeEffectScope` 来实现的：

```ts
// scope.run() 的简化实现原理
run<T>(fn: () => T): T | undefined {
  if (this._active) {
    const currentEffectScope = activeEffectScope
    try {
      activeEffectScope = this  // 等同于 setCurrentScope(this)
      return fn()
    } finally {
      activeEffectScope = currentEffectScope  // 自动恢复
    }
  }
}
```

`setCurrentScope` 提供了**不使用回调函数**的方式来切换作用域，适用于无法将代码包裹在 `run()` 回调中的场景。

### 三、详细用法

#### 1. 基本用法

##### 切换当前作用域

```ts
import { effectScope, setCurrentScope, ref, computed, watch } from 'vue'

// 创建两个独立的作用域
const scope1 = effectScope()
const scope2 = effectScope()

// ✅ 手动设置 scope1 为当前作用域
setCurrentScope(scope1)

// 此时创建的响应式数据会注册到 scope1
const count1 = ref(0)
const doubled1 = computed(() => count1.value * 2)

// ✅ 切换到 scope2
setCurrentScope(scope2)

// 此时创建的响应式数据会注册到 scope2
const count2 = ref(0)
const doubled2 = computed(() => count2.value * 2)

// 分别停止时互不影响
scope1.stop() // 只销毁 count1 和 doubled1 相关的副作用
scope2.stop() // 只销毁 count2 和 doubled2 相关的副作用
```

##### 保存并恢复作用域

```ts
import { effectScope, setCurrentScope, ref } from 'vue'

const mainScope = effectScope()
const tempScope = effectScope()

// ✅ 激活 mainScope
setCurrentScope(mainScope)
const mainData = ref('main data')

// ✅ 临时切换到 tempScope，保存前一个作用域
const previousScope = setCurrentScope(tempScope)
const tempData = ref('temp data')

// ✅ 恢复之前的作用域
setCurrentScope(previousScope)
const moreMainData = ref('more main data')
```

##### 清除当前作用域

```ts
import { setCurrentScope, ref } from 'vue'

// ✅ 传入 null 清除当前作用域
setCurrentScope(null)

// 此 ref 不属于任何作用域
const globalData = ref('不受任何 effectScope 管理')
```

#### 2. 进阶用法

##### 作用域栈管理

```ts
import { effectScope, setCurrentScope, ref } from 'vue'

class ScopeStack {
  private stack: Array<{ scope: EffectScope; previous: EffectScope | undefined }> = []

  push(scope: EffectScope): void {
    const previous = setCurrentScope(scope)
    this.stack.push({ scope, previous })
  }

  pop(): EffectScope | undefined {
    const entry = this.stack.pop()
    if (entry) {
      setCurrentScope(entry.previous)
      return entry.scope
    }
  }

  get current(): EffectScope | undefined {
    return this.stack.length > 0
      ? this.stack[this.stack.length - 1].scope
      : undefined
  }
}

// 使用作用域栈
const stack = new ScopeStack()
const scope1 = effectScope()
const scope2 = effectScope()

stack.push(scope1)
const data1 = ref('在 scope1 中')

stack.push(scope2)
const data2 = ref('在 scope2 中')

stack.pop() // 回到 scope1 上下文
stack.pop() // 回到初始状态
```

##### 配合 onScopeDispose 实现资源清理

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

function createResourcePool() {
  const scope = effectScope()
  setCurrentScope(scope)

  const resources = ref<Map<string, any>>(new Map())

  // 监听资源变化
  watch(resources, (newVal) => {
    console.log('资源池已更新，当前数量：', newVal.size)
  }, { deep: true })

  // 注册清理回调
  onScopeDispose(() => {
    console.log('资源池作用域已销毁，清理所有资源')
    resources.value.clear()
  })

  // ✅ 恢复之前的作用域
  setCurrentScope(undefined)

  return {
    scope,
    resources,
    addResource(key: string, value: any) {
      resources.value.set(key, value)
    },
    dispose() {
      scope.stop()
    }
  }
}
```

##### 动态条件作用域

```ts
import { effectScope, setCurrentScope, ref, computed } from 'vue'

interface ScopedDataServiceOptions {
  enableScoping: boolean
  scopeName: string
}

function createScopedDataService<T extends Record<string, any>>(
  initialValue: T,
  options: ScopedDataServiceOptions
) {
  if (options.enableScoping) {
    const scope = effectScope()
    const previousScope = setCurrentScope(scope)

    const data = ref(initialValue) as Ref<T>
    const version = computed(() => JSON.stringify(data.value))

    // ✅ 恢复之前的作用域
    setCurrentScope(previousScope)

    return {
      scope,
      data,
      version,
      dispose() {
        scope.stop()
      }
    }
  }

  // ❌ 不使用作用域时，副作用不会被自动管理
  const data = ref(initialValue) as Ref<T>
  return {
    scope: null,
    data,
    version: null,
    dispose: () => {}
  }
}
```

##### 嵌套作用域的精细控制

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

// 创建父作用域
const parentScope = effectScope()
const savedParent = setCurrentScope(parentScope)

const parentData = ref('parent')

// 注册父作用域的清理逻辑
onScopeDispose(() => {
  console.log('父作用域已销毁')
})

// 创建分离的子作用域
const childScope = effectScope(true) // detached = true
setCurrentScope(childScope)

const childData = ref('child')

onScopeDispose(() => {
  console.log('子作用域已销毁')
})

// ✅ 恢复父作用域
setCurrentScope(savedParent)

// parentScope.stop() 不会影响 childScope，因为它是 detached 的
// 只有手动调用 childScope.stop() 才会销毁子作用域
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `scope` | `EffectScope \| null \| undefined` | 是 | 要设置为当前激活的 `EffectScope` 实例。传入 `null` 或 `undefined` 可清除当前作用域 |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| 返回值 | `EffectScope \| undefined` | 返回之前激活的 `EffectScope` 实例，用于后续恢复 |

### 四、实现效果

#### 1. 副作用的分组管理

```ts
import { effectScope, setCurrentScope, ref, watchEffect } from 'vue'

const userScope = effectScope()
const logScope = effectScope()

// ✅ 在 userScope 中创建用户相关副作用
setCurrentScope(userScope)
const userName = ref('Alice')

watchEffect(() => {
  console.log('[用户模块] 当前用户：', userName.value)
})
// 输出：[用户模块] 当前用户：Alice

userName.value = 'Bob'
// 输出：[用户模块] 当前用户：Bob

// ✅ 在 logScope 中创建日志相关副作用
setCurrentScope(logScope)
const logLevel = ref('info')

watchEffect(() => {
  console.log('[日志模块] 日志级别：', logLevel.value)
})
// 输出：[日志模块] 日志级别：info

// ✅ 单独停止用户模块，日志模块不受影响
userScope.stop()
// userName 的 watchEffect 停止响应

logLevel.value = 'warn'
// 仍然输出：[日志模块] 日志级别：warn
```

#### 2. 与 scope.run() 的行为对比

```ts
import { effectScope, setCurrentScope, ref, computed } from 'vue'

const scope = effectScope()

// ✅ 使用 scope.run() — 自动管理作用域切换
scope.run(() => {
  const data = ref(1)
  const doubled = computed(() => data.value * 2)
  // 离开回调后，自动恢复之前的作用域
})

// ✅ 使用 setCurrentScope — 手动管理作用域切换
const previousScope = setCurrentScope(scope)
const data = ref(1)
const doubled = computed(() => data.value * 2)
// 需要手动恢复
setCurrentScope(previousScope)
```

### 五、使用场景

#### 1. Composable 函数的副作用隔离

在可组合函数中，需要确保不同调用实例的副作用互不干扰。

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose,
  type EffectScope
} from 'vue'

function useCounter(initialValue = 0) {
  const scope = effectScope()
  const previousScope = setCurrentScope(scope)

  const count = ref(initialValue)
  const history = ref<number[]>([])

  watch(count, (newVal, oldVal) => {
    history.value.push(oldVal)
    console.log(`计数器变化：${oldVal} → ${newVal}`)
  })

  onScopeDispose(() => {
    console.log('计数器实例已销毁，清理历史记录')
    history.value = []
  })

  setCurrentScope(previousScope)

  return {
    count,
    history,
    increment: () => count.value++,
    decrement: () => count.value--,
    dispose: () => scope.stop()
  }
}

// 使用
const counterA = useCounter(0)
const counterB = useCounter(10)

counterA.increment() // 输出：计数器变化：0 → 1
counterB.decrement() // 输出：计数器变化：10 → 9

counterA.dispose() // 只销毁 counterA 的副作用
counterB.count.value++ // counterB 仍然正常工作
```

#### 2. 插件系统中隔离各插件的副作用

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose,
  type EffectScope
} from 'vue'

interface Plugin {
  name: string
  scope: EffectScope
  install: () => void
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map()

  registerPlugin(name: string, setup: () => void): void {
    const scope = effectScope()
    const previousScope = setCurrentScope(scope)

    setup() // 插件在独立作用域中初始化

    setCurrentScope(previousScope)

    this.plugins.set(name, { name, scope, install: setup })
  }

  unregisterPlugin(name: string): void {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.scope.stop() // 销毁该插件的所有副作用
      this.plugins.delete(name)
      console.log(`插件 ${name} 已卸载`)
    }
  }

  disposeAll(): void {
    this.plugins.forEach((plugin) => plugin.scope.stop())
    this.plugins.clear()
  }
}

// 使用
const manager = new PluginManager()

manager.registerPlugin('analytics', () => {
  const pageViews = ref(0)
  watch(pageViews, (count) => {
    console.log(`页面浏览量：${count}`)
  })
  onScopeDispose(() => console.log('分析插件已清理'))
})

manager.registerPlugin('notifications', () => {
  const unread = ref(0)
  watch(unread, (count) => {
    console.log(`未读通知：${count}`)
  })
  onScopeDispose(() => console.log('通知插件已清理'))
})

// 单独卸载某个插件
manager.unregisterPlugin('analytics')
// 输出：分析插件已清理、插件 analytics 已卸载
```

#### 3. 自定义作用域上下文管理器

```ts
import {
  effectScope,
  getCurrentScope,
  setCurrentScope,
  ref,
  computed,
  type EffectScope
} from 'vue'

class ScopeContext {
  private scope: EffectScope
  private previousScope: EffectScope | undefined

  constructor() {
    this.scope = effectScope()
    this.previousScope = undefined
  }

  enter(): void {
    this.previousScope = setCurrentScope(this.scope)
  }

  exit(): void {
    setCurrentScope(this.previousScope)
  }

  runWithin<T>(fn: () => T): T {
    this.enter()
    try {
      return fn()
    } finally {
      this.exit()
    }
  }

  dispose(): void {
    this.scope.stop()
  }
}

// 使用
const ctx = new ScopeContext()

ctx.runWithin(() => {
  const data = ref(42)
  const doubled = computed(() => data.value * 2)
  console.log(doubled.value) // 输出：84
})

// 退出后，ctx 内的副作用被隔离
ctx.dispose()
```

#### 4. 单元测试中的作用域隔离

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

// 被测试的 composable
function useFeature() {
  const state = ref('active')
  watch(state, (val) => {
    console.log('状态变为：', val)
  })
  onScopeDispose(() => {
    console.log('feature 已清理')
  })
  return { state }
}

// 测试辅助函数
function withCleanScope(fn: () => void): void {
  const testScope = effectScope()
  const previousScope = setCurrentScope(testScope)

  fn()

  setCurrentScope(previousScope)
  testScope.stop() // 测试结束后自动清理所有副作用
}

// 每个测试用例独立的作用域
withCleanScope(() => {
  const { state } = useFeature()
  state.value = 'inactive'
  // 输出：状态变为：inactive
})
// 输出：feature 已清理

withCleanScope(() => {
  const { state } = useFeature()
  state.value = 'pending'
  // 输出：状态变为：pending
})
// 输出：feature 已清理
```

#### 5. 多模块应用的作用域分区

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

class ModuleScopeManager {
  private modules: Map<string, { scope: EffectScope; status: Ref<string> }> = new Map()

  registerModule(name: string): Ref<string> {
    const scope = effectScope()
    const previousScope = setCurrentScope(scope)

    const status = ref('initialized')

    watch(status, (newStatus) => {
      console.log(`[${name}] 模块状态：${newStatus}`)
    })

    onScopeDispose(() => {
      console.log(`[${name}] 模块已销毁`)
    })

    setCurrentScope(previousScope)

    this.modules.set(name, { scope, status })
    return status
  }

  destroyModule(name: string): void {
    const module = this.modules.get(name)
    if (module) {
      module.scope.stop()
      this.modules.delete(name)
    }
  }

  destroyAll(): void {
    this.modules.forEach(({ scope }) => scope.stop())
    this.modules.clear()
  }
}

// 使用
const manager = new ModuleScopeManager()
const userStatus = manager.registerModule('user')
const orderStatus = manager.registerModule('order')

userStatus.value = 'ready'    // 输出：[user] 模块状态：ready
orderStatus.value = 'loading' // 输出：[order] 模块状态：loading

manager.destroyModule('user') // 输出：[user] 模块已销毁
// order 模块不受影响
```

#### 6. 作用域暂停与恢复（配合 EffectScope 的 pause/resume）

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watchEffect
} from 'vue'

const scope = effectScope()
const previousScope = setCurrentScope(scope)

const data = ref(0)

watchEffect(() => {
  console.log('数据变化：', data.value)
})
// 输出：数据变化：0

setCurrentScope(previousScope)

// ✅ 暂停作用域内所有副作用
scope.pause()
data.value = 1  // 无输出，副作用已暂停

// ✅ 恢复作用域
scope.resume()
data.value = 2  // 输出：数据变化：2

scope.stop()    // 完全销毁
data.value = 3  // 无输出，作用域已停止
```

#### 7. 实现带超时的异步副作用管理

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

function createTimedScope(timeoutMs: number) {
  const scope = effectScope()
  const previousScope = setCurrentScope(scope)

  let timerId: ReturnType<typeof setTimeout> | null = null

  onScopeDispose(() => {
    if (timerId) {
      clearTimeout(timerId)
      console.log('超时计时器已清除')
    }
  })

  setCurrentScope(previousScope)

  // 启动超时计时
  timerId = setTimeout(() => {
    console.log(`作用域已存活 ${timeoutMs}ms，自动销毁`)
    scope.stop()
  }, timeoutMs)

  return {
    scope,
    enter() {
      return setCurrentScope(scope)
    },
    exit(previous: ReturnType<typeof setCurrentScope>) {
      setCurrentScope(previous)
    }
  }
}

// 使用
const timedScope = createTimedScope(5000)

const prev = timedScope.enter()
const liveData = ref('实时数据')
watch(liveData, (val) => console.log('实时更新：', val))
timedScope.exit(prev)

// 5 秒后自动销毁作用域和所有副作用
```

#### 8. 在 Web Worker 中管理响应式副作用

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

// Worker 内的消息处理作用域管理
class WorkerScopeManager {
  private activeScopes: Map<string, EffectScope> = new Map()

  handleMessage(messageId: string, data: any): void {
    // 如果该消息已有作用域，先销毁
    this.cleanupMessage(messageId)

    const scope = effectScope()
    const previousScope = setCurrentScope(scope)

    const processedData = ref(data)

    watch(processedData, (newVal) => {
      // 处理数据变化，发送结果回主线程
      self.postMessage({
        type: 'update',
        messageId,
        data: newVal
      })
    })

    onScopeDispose(() => {
      self.postMessage({
        type: 'cleanup',
        messageId
      })
    })

    setCurrentScope(previousScope)
    this.activeScopes.set(messageId, scope)
  }

  cleanupMessage(messageId: string): void {
    const scope = this.activeScopes.get(messageId)
    if (scope) {
      scope.stop()
      this.activeScopes.delete(messageId)
    }
  }

  cleanupAll(): void {
    this.activeScopes.forEach((scope) => scope.stop())
    this.activeScopes.clear()
  }
}
```

#### 9. SSR 中的请求级作用域管理

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose
} from 'vue'

function createRequestScope(requestId: string) {
  const scope = effectScope()
  const previousScope = setCurrentScope(scope)

  const requestState = ref({
    id: requestId,
    status: 'pending' as 'pending' | 'resolved' | 'error',
    data: null as any
  })

  watch(() => requestState.value.status, (status) => {
    console.log(`[请求 ${requestId}] 状态：${status}`)
  })

  onScopeDispose(() => {
    console.log(`[请求 ${requestId}] 已清理`)
    requestState.value.data = null
  })

  setCurrentScope(previousScope)

  return {
    scope,
    requestState,
    resolve(data: any) {
      requestState.value.status = 'resolved'
      requestState.value.data = data
    },
    dispose() {
      scope.stop()
    }
  }
}

// 每个 SSR 请求创建独立作用域
function handleSSRRequest(requestId: string) {
  const { scope, requestState, resolve, dispose } = createRequestScope(requestId)

  // 模拟数据获取
  resolve({ title: 'Hello SSR' })

  // 请求结束后清理
  dispose()
}
```

#### 10. 动态加载模块的作用域管理

```ts
import {
  effectScope,
  setCurrentScope,
  ref,
  watch,
  onScopeDispose,
  type EffectScope
} from 'vue'

interface LazyModule {
  name: string
  scope: EffectScope
  loaded: Ref<boolean>
}

class ModuleLoader {
  private loadedModules: Map<string, LazyModule> = new Map()

  async loadModule(name: string, moduleFactory: () => Promise<void>): Promise<void> {
    // 如果模块已加载，先卸载
    if (this.loadedModules.has(name)) {
      this.unloadModule(name)
    }

    const scope = effectScope()
    const previousScope = setCurrentScope(scope)

    const loaded = ref(false)

    onScopeDispose(() => {
      console.log(`模块 ${name} 已卸载，释放资源`)
    })

    // 执行模块初始化
    await moduleFactory()

    loaded.value = true

    setCurrentScope(previousScope)

    this.loadedModules.set(name, { name, scope, loaded })
  }

  unloadModule(name: string): void {
    const module = this.loadedModules.get(name)
    if (module) {
      module.scope.stop()
      this.loadedModules.delete(name)
    }
  }
}

// 使用
const loader = new ModuleLoader()

await loader.loadModule('chart', async () => {
  const chartData = ref<number[]>([])
  watch(chartData, (data) => {
    console.log('图表数据更新：', data)
  })
})

// 需要时卸载模块，释放所有副作用
loader.unloadModule('chart')
```

### 六、注意事项

#### 1. 高级内部 API，谨慎使用

> ⚠️ **注意：** `setCurrentScope` 不是 Vue 官方文档中公开的公共 API。它属于内部实现细节，在未来的 Vue 版本中可能会发生变化。在大多数应用开发场景中，应优先使用 `scope.run()` 代替。

```ts
// ❌ 不必要的直接使用
const scope = effectScope()
setCurrentScope(scope)
const data = ref(0)
setCurrentScope(undefined)

// ✅ 优先使用 scope.run()
const scope = effectScope()
scope.run(() => {
  const data = ref(0)
})
```

#### 2. 必须手动恢复之前的作用域

`setCurrentScope` 不会自动恢复之前的作用域。忘记恢复会导致后续代码的副作用被错误地归类到当前作用域中。

```ts
// ❌ 忘记恢复
const scope = effectScope()
setCurrentScope(scope)
const data1 = ref(0)
// 后续所有代码都在 scope 的上下文中，可能导致意外的副作用归属

// ✅ 始终保存并恢复
const scope = effectScope()
const previousScope = setCurrentScope(scope)
try {
  const data = ref(0)
  // ...
} finally {
  setCurrentScope(previousScope)
}
```

#### 3. 不在异步回调中保证作用域状态

`setCurrentScope` 的设置是同步的。在 `await` 或 `setTimeout` 等异步操作之后，作用域可能已被其他代码修改。

```ts
// ❌ 异步回调中的作用域可能不正确
const scope = effectScope()
const prev = setCurrentScope(scope)

await someAsyncOperation()
// 此时 activeEffectScope 可能已被其他代码改变
const data = ref(0) // 可能不属于 scope

setCurrentScope(prev)

// ✅ 在异步操作后再设置作用域
const scope = effectScope()
let prev: EffectScope | undefined

await someAsyncOperation()

prev = setCurrentScope(scope)
const data = ref(0) // 确保在 scope 中
setCurrentScope(prev)
```

#### 4. 传入已停止的作用域会导致问题

对一个已经调用过 `stop()` 的作用域调用 `setCurrentScope`，后续创建的副作用虽然会被注册，但不会被正确追踪和管理。

```ts
const scope = effectScope()
scope.stop()

// ❌ 在已停止的作用域中创建副作用
setCurrentScope(scope)
const data = ref(0) // 这个副作用不会被正确管理

// ✅ 始终使用活跃的作用域
const activeScope = effectScope()
const prev = setCurrentScope(activeScope)
const data = ref(0)
setCurrentScope(prev)
```

#### 5. 与 scope.run() 的选择

> 💡 **提示：** 如果可以将代码包裹在一个同步函数中，优先使用 `scope.run()`，它会自动处理作用域的保存与恢复，避免遗漏。

```ts
// ✅ scope.run() 自动恢复，更安全
scope.run(() => {
  // 所有副作用自动注册到 scope
  const data = ref(0)
}) // 离开后自动恢复之前的作用域

// setCurrentScope 适用于无法使用 run() 的场景
// 例如：跨多个函数调用的作用域管理
```

#### 6. detached 作用域的父子关系

使用 `effectScope(true)` 创建的分离作用域不会与父作用域建立关联。当父作用域停止时，分离作用域不会被自动停止。

```ts
const parentScope = effectScope()
setCurrentScope(parentScope)

// detached = true，不会被父作用域自动管理
const childScope = effectScope(true)

parentScope.stop() // childScope 不会被停止

// ✅ 需要手动管理分离作用域的生命周期
childScope.stop()
```

#### 7. 并发场景下的作用域安全性

在多个模块或组件并发操作时，全局的 `activeEffectScope` 是共享的，需要注意竞态条件。

```ts
// ❌ 多个模块同时操作可能导致作用域混乱
// 模块 A
setCurrentScope(scopeA)
// 模块 B（在模块 A 还未恢复时）
setCurrentScope(scopeB)
// 模块 A 的后续代码会在 scopeB 中执行

// ✅ 使用栈式管理或 try/finally 确保安全
class SafeScopeSwitcher {
  private stack: (EffectScope | undefined)[] = []

  enter(scope: EffectScope): void {
    this.stack.push(getCurrentScope())
    setCurrentScope(scope)
  }

  exit(): void {
    const previous = this.stack.pop()
    setCurrentScope(previous)
  }
}
```

#### 8. getCurrentScope() 的配合使用

在需要检查当前作用域状态时，配合 `getCurrentScope()` 进行验证。

```ts
import { effectScope, getCurrentScope, setCurrentScope, ref } from 'vue'

const scope = effectScope()

// ✅ 检查当前作用域
console.log(getCurrentScope()) // undefined 或之前的作用域

const prev = setCurrentScope(scope)
console.log(getCurrentScope() === scope) // true

setCurrentScope(prev)
```

#### 9. 与 onScopeDispose 的配合

`onScopeDispose()` 注册的回调只会在当前激活的作用域被停止时触发。确保在正确的作用域上下文中调用 `onScopeDispose`。

```ts
const scope = effectScope()
const prev = setCurrentScope(scope)

// ✅ 在正确的作用域中注册清理回调
onScopeDispose(() => {
  console.log('作用域已清理')
})

setCurrentScope(prev)

// 当 scope.stop() 被调用时，上面的回调会执行
scope.stop() // 输出：作用域已清理
```

#### 10. TypeScript 类型提示

`setCurrentScope` 从 `vue` 中导出时可能没有完整的类型声明，建议自行补充类型。

```ts
import {
  effectScope,
  getCurrentScope,
  type EffectScope
} from 'vue'

// 当前版本 setCurrentScope 可能需要额外的类型声明
declare module 'vue' {
  export function setCurrentScope(
    scope: EffectScope | null | undefined
  ): EffectScope | undefined
}
```

### 七、相关 API 对比

| API | 说明 | 自动恢复 | 适用场景 |
|-----|------|----------|----------|
| `setCurrentScope(scope)` | 手动设置当前活跃作用域 | 否，需手动恢复 | 跨函数的作用域管理、库开发 |
| `scope.run(fn)` | 在回调函数中激活作用域 | 是，离开回调自动恢复 | 大多数同步代码场景 |
| `scope.on()` | 激活作用域（内部 API） | 否，需配合 `off()` | Vue 内部组件实例管理 |
| `scope.off()` | 停用作用域（内部 API） | — | 与 `on()` 配对使用 |
| `getCurrentScope()` | 获取当前活跃作用域 | — | 检查当前作用域状态 |
| `onScopeDispose(fn)` | 注册作用域销毁回调 | — | 资源清理 |
| `effectScope(detached)` | 创建作用域实例 | — | 所有场景的基础 |

```ts
// scope.run() — 最常用的作用域激活方式
const scope = effectScope()
scope.run(() => {
  const data = ref(0) // 自动注册到 scope
}) // 自动恢复

// setCurrentScope — 需要跨函数管理时使用
const scope = effectScope()
const prev = setCurrentScope(scope)
// ... 可以跨多个函数调用
setCurrentScope(prev)

// scope.on() / scope.off() — 内部使用，类似于引用计数
scope.on()  // 激活，引用计数 +1
// ...
scope.off() // 停用，引用计数 -1
```

### 八、总结

`setCurrentScope` 是 Vue 3 响应式系统中的一个**底层内部函数**，用于手动切换当前活跃的 `EffectScope`。它的核心价值在于：

1. **精细的作用域控制**：允许在不使用回调函数的情况下切换作用域上下文
2. **跨函数的作用域管理**：适用于无法将代码包裹在 `scope.run()` 回调中的复杂场景
3. **库和工具开发**：为构建更高级的响应式管理工具提供基础能力

> 💡 **提示：** 在日常应用开发中，99% 的场景应该使用 `scope.run()` 而非 `setCurrentScope`。只有在构建库、实现自定义作用域管理策略、或需要在复杂流程中灵活切换作用域时，才需要考虑使用 `setCurrentScope`。使用时务必记住保存和恢复之前的作用域，避免副作用归属错误。
