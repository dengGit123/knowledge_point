# effectScope

> 📖 [官方文档 - effectScope](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)
>
> 📖 [官方文档 - onScopeDispose](https://cn.vuejs.org/api/reactivity-advanced.html#onscopedispose)
>
> 📖 [官方文档 - getCurrentScope](https://cn.vuejs.org/api/reactivity-advanced.html#getcurrentscope)

### 一、概述

`effectScope` 是 Vue 3 响应式系统中的一个高级 API，用于创建一个**副作用作用域**，能够自动收集在其中创建的所有响应式副作用（如 `watch`、`computed`、`watchEffect` 等），并通过一次调用统一停止它们。它解决的核心问题是：**当需要在组件之外管理大量响应式副作用时，避免手动逐个清理的繁琐操作，防止内存泄漏。**

简单来说，`effectScope` 就像一个"垃圾桶"，你在里面扔进去了多少个副作用（`watch`、`computed` 等），调用 `scope.stop()` 时就能一次性全部"倒掉"，不用一个个手动清理。

### 二、核心原理

#### 工作原理

`effectScope` 的底层机制基于 Vue 3 响应式系统的**副作用收集与销毁**模型：

1. **副作用收集**：当调用 `scope.run(fn)` 时，`fn` 内部创建的所有响应式副作用（`watch`、`computed`、`watchEffect` 等）都会被自动记录到当前 `scope` 中
2. **统一销毁**：调用 `scope.stop()` 时，Vue 会遍历该作用域收集到的所有副作用，逐个触发它们的清理逻辑
3. **嵌套管理**：作用域支持嵌套，父作用域停止时会自动停止所有子作用域，形成树状的生命周期管理
4. **分离机制**：通过 `scope.detach()` 可以将子作用域从父作用域中分离，使父作用域停止时不再影响子作用域

#### 类比理解

可以把 `effectScope` 想象成一个**电源插排**：

- 你在插排上接了多个电器（`watch`、`computed` 等）
- 不用的时候只需要按一下总开关（`scope.stop()`），所有电器同时断电
- 不需要一个一个去拔插头（手动清理每个副作用）
- 还可以把小插排接到大插排上（嵌套作用域），大插排断电时小插排也断电

### 三、详细用法

#### 1. 基本用法

```ts
import { effectScope, ref, watch, computed } from 'vue'

const scope = effectScope()

const count = ref(0)

// 在作用域内运行，所有副作用被自动收集
scope.run(() => {
  // 这个 watch 会被 scope 收集
  watch(count, (newVal) => {
    console.log('count 变化了:', newVal)
  })

  // 这个 computed 也会被 scope 收集
  const doubled = computed(() => count.value * 2)
  console.log(doubled.value) // 0
})

// 一次性停止作用域内的所有副作用
scope.stop()
// 此后修改 count 不会再触发 watch，computed 也不再追踪依赖
count.value++
// watch 回调不再执行
```

#### 2. 进阶用法

##### 2.1 在组合式函数中使用 effectScope

```ts
import { effectScope, onScopeDispose, ref, watch } from 'vue'

// ❌ 错误示例：不使用 effectScope，副作用无法统一清理
function useCounter() {
  const count = ref(0)
  
  watch(count, (val) => {
    console.log('count:', val)
  })
  
  // 无法在外部清理这个 watch
  return { count }
}

// ✅ 正确示例：使用 effectScope，副作用可统一清理
function useCounterWithScope() {
  const scope = effectScope()
  
  scope.run(() => {
    const count = ref(0)
    
    watch(count, (val) => {
      console.log('count:', val)
    })
    
    // 在作用域销毁时执行清理逻辑
    onScopeDispose(() => {
      console.log('counter scope 已销毁，执行清理')
    })
  })
  
  return {
    scope,
    stop: () => scope.stop()
  }
}

// 使用
const { stop } = useCounterWithScope()
stop() // 统一清理所有副作用
```

##### 2.2 嵌套作用域

```ts
import { effectScope, ref, watch } from 'vue'

const parentScope = effectScope()

parentScope.run(() => {
  const parentCount = ref(0)
  watch(parentCount, (val) => {
    console.log('parent watch:', val)
  })

  // 创建嵌套的子作用域
  const childScope = effectScope()
  childScope.run(() => {
    const childCount = ref(0)
    watch(childCount, (val) => {
      console.log('child watch:', val)
    })
  })
})

// 停止父作用域，子作用域也会被自动停止
parentScope.stop()
// parent watch 和 child watch 都不再工作
```

##### 2.3 分离作用域（detached scope）

```ts
import { effectScope, ref, watch } from 'vue'

const parentScope = effectScope()

parentScope.run(() => {
  const parentCount = ref(0)
  watch(parentCount, (val) => {
    console.log('parent watch:', val)
  })

  // 创建分离的子作用域，不会随父作用域销毁
  const detachedScope = effectScope(true) // 传入 true 表示 detached
  detachedScope.run(() => {
    const detachedCount = ref(0)
    watch(detachedCount, (val) => {
      console.log('detached watch:', val)
    })
  })
})

// 停止父作用域
parentScope.stop()
// parent watch 停止工作
// detached watch 仍然正常工作！需要手动调用 detachedScope.stop() 才会停止
```

##### 2.4 onScopeDispose 注册清理回调

```ts
import { effectScope, onScopeDispose, ref, watch } from 'vue'

const scope = effectScope()

scope.run(() => {
  const timer = ref(0)
  const intervalId = setInterval(() => {
    timer.value++
  }, 1000)

  watch(timer, (val) => {
    console.log('timer:', val)
  })

  // 注册清理回调，在 scope.stop() 时自动执行
  onScopeDispose(() => {
    clearInterval(intervalId)
    console.log('定时器已清理')
  })

  // 支持注册多个清理回调
  onScopeDispose(() => {
    console.log('第二个清理回调')
  })
})

// 调用 stop 时，两个 onScopeDispose 回调都会执行
scope.stop()
// 输出：timer 已清理
// 输出：第二个清理回调
```

##### 2.5 getCurrentScope 获取当前作用域

```ts
import { effectScope, getCurrentScope, onScopeDispose, watch, ref } from 'vue'

const scope = effectScope()

scope.run(() => {
  // getCurrentScope 返回当前正在运行的 effectScope
  const currentScope = getCurrentScope()
  console.log(currentScope === scope) // true

  const count = ref(0)
  watch(count, (val) => {
    console.log('count:', val)
  })
})

// 在 scope.run() 之外调用，返回 undefined
console.log(getCurrentScope()) // undefined
```

##### 2.6 在 Vue 组件外创建独立的状态管理

```ts
import { effectScope, ref, computed, watch } from 'vue'

function createStore() {
  const scope = effectScope()

  const state = scope.run(() => {
    const users = ref<Array<{ id: number; name: string }>>([])
    const keyword = ref('')

    const filteredUsers = computed(() => {
      return users.value.filter(user =>
        user.name.includes(keyword.value)
      )
    })

    watch(filteredUsers, (val) => {
      console.log('过滤后的用户列表已更新:', val.length, '条')
    })

    return { users, keyword, filteredUsers }
  })!

  return {
    ...state!,
    destroy: () => scope.stop()
  }
}

// 在任何地方使用，不依赖组件生命周期
const store = createStore()
store.users.value = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]
store.keyword.value = '张'
// 输出：过滤后的用户列表已更新: 1 条

// 不再需要时统一清理
store.destroy()
```

#### 3. API 参数说明

| API | 参数 | 返回值 | 说明 |
|-----|------|--------|------|
| `effectScope(detached?)` | `detached: boolean`（默认 `false`） | `EffectScope` | 创建一个副作用作用域。`detached` 为 `true` 时，创建的作用域不会与父作用域关联 |
| `scope.run(fn)` | `fn: () => T` | `T \| undefined` | 在作用域中执行函数，收集其中创建的所有副作用。如果作用域已被停止则返回 `undefined` |
| `scope.stop()` | 无 | `void` | 停止作用域内所有副作用，并递归停止所有子作用域 |
| `scope.active` | 无 | `boolean`（只读） | 作用域是否仍然活跃 |
| `scope.detach()` | 无 | `void` | 将当前作用域从父作用域中分离 |
| `onScopeDispose(fn)` | `fn: () => void` | `void` | 在当前作用域销毁时注册一个清理回调。如果当前没有活跃的 `effectScope` 则在开发环境下报警告 |
| `getCurrentScope()` | 无 | `EffectScope \| undefined` | 返回当前正在运行的 `effectScope`，如果没有则返回 `undefined` |

> 💡 **提示：** `EffectScope` 实例上的 `active` 属性是一个只读的布尔值，可用于判断作用域是否仍然有效，避免在已停止的作用域上重复操作。

### 四、实现效果

#### 基础效果演示

```ts
import { effectScope, ref, watch, computed, onScopeDispose } from 'vue'

// 创建作用域
const scope = effectScope()

console.log(scope.active) // true，作用域是活跃的

scope.run(() => {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)

  // 创建多个 watch
  watch(count, (val) => {
    console.log('watch1 - count:', val)
  })

  watch(doubled, (val) => {
    console.log('watch2 - doubled:', val)
  })

  // 注册清理回调
  onScopeDispose(() => {
    console.log('作用域正在被销毁...')
  })

  // 触发副作用
  count.value = 1
  // 输出：watch1 - count: 1
  // 输出：watch2 - doubled: 2

  count.value = 2
  // 输出：watch1 - count: 2
  // 输出：watch2 - doubled: 4
})

// 一次性停止所有副作用
scope.stop()
// 输出：作用域正在被销毁...

console.log(scope.active) // false，作用域已停止

// 此后修改值不再触发 watch
// count.value = 3 不会有任何输出
```

#### 嵌套作用域的销毁顺序

```ts
import { effectScope, onScopeDispose, ref, watch } from 'vue'

const parentScope = effectScope()

parentScope.run(() => {
  onScopeDispose(() => {
    console.log('1. 父作用域清理')
  })

  const childScope1 = effectScope()
  childScope1.run(() => {
    onScopeDispose(() => {
      console.log('2. 子作用域 1 清理')
    })

    const grandchildScope = effectScope()
    grandchildScope.run(() => {
      onScopeDispose(() => {
        console.log('3. 孙作用域清理')
      })
    })
  })

  const childScope2 = effectScope()
  childScope2.run(() => {
    onScopeDispose(() => {
      console.log('4. 子作用域 2 清理')
    })
  })
})

parentScope.stop()
// 按照子作用域优先的顺序执行清理
// 输出顺序可能是：3 -> 2 -> 4 -> 1（从内到外）
```

### 五、使用场景

#### 1. 组合式函数（Composable）的副作用管理

```ts
import { effectScope, ref, watch, onScopeDispose } from 'vue'

function useMousePosition() {
  const scope = effectScope()
  
  const position = scope.run(() => {
    const x = ref(0)
    const y = ref(0)

    const handleMouseMove = (event: MouseEvent) => {
      x.value = event.clientX
      y.value = event.clientY
    }

    watch([x, y], ([newX, newY]) => {
      console.log('鼠标位置:', newX, newY)
    })

    window.addEventListener('mousemove', handleMouseMove)

    onScopeDispose(() => {
      window.removeEventListener('mousemove', handleMouseMove)
      console.log('鼠标事件监听已移除')
    })

    return { x, y }
  })!

  return {
    ...position!,
    stop: () => scope.stop()
  }
}

// 使用
const mouse = useMousePosition()
// 使用完毕后清理
mouse.stop()
```

#### 2. 全局状态管理（简易 Store）

```ts
import { effectScope, ref, computed, watch } from 'vue'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

function createCartStore() {
  const scope = effectScope()

  return scope.run(() => {
    const items = ref<CartItem[]>([])

    const total = computed(() =>
      items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    const itemCount = computed(() =>
      items.value.reduce((sum, item) => sum + item.quantity, 0)
    )

    watch(itemCount, (count) => {
      console.log('购物车商品数量变化:', count)
    })

    function addItem(item: CartItem) {
      const existing = items.value.find(i => i.id === item.id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        items.value.push(item)
      }
    }

    function removeItem(id: number) {
      items.value = items.value.filter(i => i.id !== id)
    }

    return { items, total, itemCount, addItem, removeItem }
  })!
}

// 全局单例，不依赖任何组件
const cartStore = createCartStore()
```

#### 3. 组件外部的 WebSocket 连接管理

```ts
import { effectScope, ref, watch, onScopeDispose } from 'vue'

function useWebSocket(url: string) {
  const scope = effectScope()

  return scope.run(() => {
    const connected = ref(false)
    const messages = ref<string[]>([])
    const lastMessage = ref<string>('')
    let ws: WebSocket | null = null

    function connect() {
      ws = new WebSocket(url)

      ws.onopen = () => {
        connected.value = true
        console.log('WebSocket 已连接')
      }

      ws.onmessage = (event) => {
        lastMessage.value = event.data
        messages.value.push(event.data)
      }

      ws.onclose = () => {
        connected.value = false
        console.log('WebSocket 已断开')
      }
    }

    watch(connected, (isConnected) => {
      if (!isConnected) {
        console.log('连接已断开，可以在这里触发重连逻辑')
      }
    })

    function send(data: string) {
      ws?.send(data)
    }

    connect()

    onScopeDispose(() => {
      ws?.close()
      ws = null
      console.log('WebSocket 资源已释放')
    })

    return { connected, messages, lastMessage, send }
  })!
}

// 使用
const ws = useWebSocket('wss://example.com/ws')
// 需要清理时
// scope.stop() 即可关闭连接并清理所有副作用
```

#### 4. 定时器和轮询管理

```ts
import { effectScope, ref, watch, onScopeDispose } from 'vue'

function usePolling(fetchFn: () => Promise<void>, interval: number = 5000) {
  const scope = effectScope()

  return scope.run(() => {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pollingCount = ref(0)
    let timerId: ReturnType<typeof setInterval> | null = null

    async function poll() {
      try {
        loading.value = true
        error.value = null
        await fetchFn()
        pollingCount.value++
      } catch (e) {
        error.value = (e as Error).message
      } finally {
        loading.value = false
      }
    }

    function start() {
      if (timerId) return
      poll()
      timerId = setInterval(poll, interval)
    }

    function stop() {
      if (timerId) {
        clearInterval(timerId)
        timerId = null
      }
    }

    watch(pollingCount, (count) => {
      console.log('已完成第', count, '次轮询')
    })

    onScopeDispose(() => {
      stop()
      console.log('轮询已停止并清理')
    })

    start()

    return { loading, error, pollingCount, start, stop }
  })!
}

// 使用
const poll = usePolling(async () => {
  const res = await fetch('/api/data')
  return res.json()
}, 3000)
```

#### 5. 自定义指令中的副作用管理

```ts
import { effectScope, ref, watch, onScopeDispose, type Directive } from 'vue'

const vDebounceClick: Directive<HTMLElement, () => void> = {
  mounted(el, binding) {
    const scope = effectScope()
    const delay = ref(300)

    scope.run(() => {
      let timer: ReturnType<typeof setTimeout> | null = null

      const handleClick = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          binding.value()
        }, delay.value)
      }

      watch(delay, (newDelay) => {
        console.log('防抖延迟更新为:', newDelay)
      })

      el.addEventListener('click', handleClick)

      onScopeDispose(() => {
        el.removeEventListener('click', handleClick)
        if (timer) clearTimeout(timer)
        console.log('防抖指令副作用已清理')
      })
    })

    // 将 scope 绑定到元素上，方便卸载时清理
    ;(el as any).__debounceScope__ = scope
  },

  unmounted(el) {
    const scope = (el as any).__debounceScope__
    if (scope) {
      scope.stop()
      delete (el as any).__debounceScope__
    }
  }
}
```

#### 6. 多实例独立管理

```ts
import { effectScope, ref, computed, watch } from 'vue'

interface TabInstance {
  id: string
  label: string
  data: Ref<string>
}

import type { Ref } from 'vue'

function createTabManager() {
  const scopes = new Map<string, ReturnType<typeof effectScope>>()
  const tabs = new Map<string, { data: Ref<string>; filtered: Ref<string> }>()

  function createTab(id: string, label: string) {
    const scope = effectScope()
    const result = scope.run(() => {
      const data = ref('')
      const keyword = ref('')
      const filtered = computed(() => {
        return data.value.includes(keyword.value) ? data.value : ''
      })

      watch(data, (val) => {
        console.log(`Tab [${label}] 数据更新:`, val)
      })

      return { data, filtered }
    })!

    scopes.set(id, scope)
    tabs.set(id, result!)

    return result!
  }

  function destroyTab(id: string) {
    const scope = scopes.get(id)
    if (scope) {
      scope.stop()
      scopes.delete(id)
      tabs.delete(id)
      console.log(`Tab [${id}] 已销毁`)
    }
  }

  function destroyAll() {
    scopes.forEach((scope, id) => {
      scope.stop()
      console.log(`Tab [${id}] 已销毁`)
    })
    scopes.clear()
    tabs.clear()
  }

  return { createTab, destroyTab, destroyAll }
}

// 使用
const manager = createTabManager()
const tab1 = manager.createTab('tab1', '标签页 1')
tab1.data.value = 'hello'
manager.destroyTab('tab1') // 只销毁 tab1 的副作用
```

#### 7. 动态表单验证器

```ts
import { effectScope, ref, computed, watch, onScopeDispose } from 'vue'

interface ValidationRule {
  pattern: RegExp
  message: string
}

function useFormValidator(rules: Record<string, ValidationRule[]>) {
  const scope = effectScope()

  return scope.run(() => {
    const formData = ref<Record<string, string>>({})
    const errors = ref<Record<string, string[]>>({})
    const isValid = computed(() => {
      return Object.values(errors.value).every(
        errArr => errArr.length === 0
      )
    })

    // 为每个字段创建 watch
    Object.keys(rules).forEach(field => {
      watch(
        () => formData.value[field],
        (value) => {
          const fieldRules = rules[field]
          const fieldErrors: string[] = []

          fieldRules.forEach(rule => {
            if (!rule.pattern.test(value || '')) {
              fieldErrors.push(rule.message)
            }
          })

          errors.value = { ...errors.value, [field]: fieldErrors }
          console.log(`字段 [${field}] 验证${fieldErrors.length === 0 ? '通过' : '失败'}`)
        }
      )
    })

    onScopeDispose(() => {
      console.log('表单验证器已销毁')
    })

    return { formData, errors, isValid }
  })!
}

// 使用
const validator = useFormValidator({
  username: [
    { pattern: /^[a-zA-Z]{3,}$/, message: '用户名至少 3 个英文字母' }
  ],
  email: [
    { pattern: /^[\w.-]+@[\w.-]+\.\w+$/, message: '请输入有效的邮箱' }
  ]
})
```

#### 8. 共享组合式函数（Shared Composable）模式

```ts
import { effectScope, ref, computed, watch, onScopeDispose } from 'vue'

// 用于在多个组件之间共享同一个 effectScope
let sharedScope: ReturnType<typeof effectScope> | null = null
let internalData: {
  theme: Ref<string>
  fontSize: Ref<number>
} | null = null

import type { Ref } from 'vue'

function useSharedTheme() {
  // 如果已经创建过，直接复用
  if (sharedScope && sharedScope.active) {
    return internalData!
  }

  // 首次创建
  sharedScope = effectScope()

  internalData = sharedScope.run(() => {
    const theme = ref<'light' | 'dark'>('light')
    const fontSize = ref(14)

    const displayInfo = computed(() => {
      return `主题: ${theme.value}, 字号: ${fontSize.value}px`
    })

    watch(theme, (newTheme) => {
      document.documentElement.setAttribute('data-theme', newTheme)
      console.log('主题已切换为:', newTheme)
    })

    watch(fontSize, (size) => {
      document.documentElement.style.fontSize = `${size}px`
      console.log('字号已调整为:', size)
    })

    onScopeDispose(() => {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.style.fontSize = ''
      console.log('共享主题作用域已销毁')
    })

    return { theme, fontSize, displayInfo }
  })!

  return internalData!
}

// 在多个组件中使用，共享同一份副作用
// 组件 A 和组件 B 都会得到同一个 theme 和 fontSize
```

#### 9. 插件开发中的副作用管理

```ts
import { effectScope, ref, watch, onScopeDispose, type App } from 'vue'

function createAnalyticsPlugin(options: { trackingId: string }) {
  const scope = effectScope()

  const eventQueue = scope.run(() => {
    const queue = ref<Array<{ event: string; data: any; timestamp: number }>>([])
    const isOnline = ref(navigator.onLine)

    // 监听网络状态
    const handleOnline = () => { isOnline.value = true }
    const handleOffline = () => { isOnline.value = false }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 网络恢复时自动发送队列中的事件
    watch(isOnline, async (online) => {
      if (online && queue.value.length > 0) {
        console.log('网络恢复，发送队列中的', queue.value.length, '个事件')
        // 模拟发送
        queue.value = []
      }
    })

    watch(queue, (q) => {
      if (q.length > 10) {
        console.warn('事件队列超过 10 条，请检查网络连接')
      }
    })

    onScopeDispose(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      queue.value = []
      console.log('分析插件副作用已清理')
    })

    return { queue, isOnline }
  })!

  return {
    scope,
    track(event: string, data?: any) {
      eventQueue!.queue.value.push({
        event,
        data,
        timestamp: Date.now()
      })
    },
    install(app: App) {
      app.provide('analytics', {
        track: this.track
      })
    }
  }
}

// 使用
const plugin = createAnalyticsPlugin({ trackingId: 'UA-123456' })
// plugin.track('page_view', { page: '/home' })
// 清理：plugin.scope.stop()
```

#### 10. 测试中的副作用隔离

```ts
import { effectScope, ref, watch, computed, onScopeDispose } from 'vue'

// 每个测试用例使用独立的 scope，互不干扰
function testEffectScope() {
  const scope = effectScope()

  const result = scope.run(() => {
    const input = ref('')
    const output = computed(() => input.value.toUpperCase())

    watch(output, (val) => {
      console.log('输出变化:', val)
    })

    onScopeDispose(() => {
      console.log('测试作用域已清理')
    })

    return { input, output }
  })!

  // 模拟测试操作
  result!.input.value = 'hello'
  console.log(result!.output.value) // 'HELLO'

  // 测试结束，清理所有副作用，不会影响其他测试
  scope.stop()
}

// 可以安全地多次运行
testEffectScope()
testEffectScope()
testEffectScope()
// 每次运行都是完全独立的，不会有副作用残留
```

### 六、注意事项

1. **`scope.run()` 执行时机**：`scope.run(fn)` 会立即执行 `fn`，如果作用域已经被停止（`scope.active === false`），则 `fn` 不会执行，`run()` 返回 `undefined`。

```ts
const scope = effectScope()
scope.stop()
const result = scope.run(() => 42)
console.log(result) // undefined，因为作用域已停止
```

2. **`onScopeDispose` 必须在活跃的 `effectScope` 中调用**：如果在没有活跃 `effectScope` 的上下文中调用 `onScopeDispose`，在开发环境下会产生警告。

```ts
// ❌ 错误：不在任何 effectScope 内
onScopeDispose(() => {
  console.log('这会产生警告')
})

// ✅ 正确：在 scope.run 内调用
const scope = effectScope()
scope.run(() => {
  onScopeDispose(() => {
    console.log('正确用法')
  })
})
```

3. **`getCurrentScope()` 在 `scope.run()` 之外返回 `undefined`**：它只能获取当前正在执行的 `effectScope`，不能跨作用域访问。

```ts
const scope = effectScope()
console.log(getCurrentScope()) // undefined
scope.run(() => {
  console.log(getCurrentScope() === scope) // true
})
```

4. **组件内的 `setup` 本身运行在一个 `effectScope` 中**：Vue 组件的 `setup()` 函数内部自动运行在一个由框架创建的 `effectScope` 中，因此组件卸载时会自动清理 `setup` 中的副作用。在组件的 `setup` 中通常不需要手动创建 `effectScope`。

```ts
// 在 setup 中，Vue 已经自动创建了 effectScope
import { defineComponent, onScopeDispose } from 'vue'

export default defineComponent({
  setup() {
    // 这里的 onScopeDispose 会在组件卸载时自动执行
    onScopeDispose(() => {
      console.log('组件卸载，作用域清理')
    })
  }
})
```

5. **`detached` 参数的默认值是 `false`**：不传参数时创建的作用域会自动成为当前活跃作用域的子作用域，随父作用域一起销毁。如果需要独立管理生命周期，显式传入 `true`。

```ts
const parentScope = effectScope()
parentScope.run(() => {
  // 默认不分离，跟随父作用域
  const childScope = effectScope()
  
  // 分离子作用域，独立管理
  const independentScope = effectScope(true)
})

parentScope.stop() // childScope 会被停止，independentScope 不会
```

6. **`scope.stop()` 不可逆**：一旦停止就无法恢复，后续调用 `scope.run()` 也不会执行任何代码。如果需要重新开始，需要创建一个新的 `effectScope` 实例。

```ts
const scope = effectScope()
scope.run(() => { /* ... */ })
scope.stop()
// ❌ 无法恢复
// scope.run(() => { /* 这不会执行 */ })

// ✅ 需要创建新的 scope
const newScope = effectScope()
newScope.run(() => { /* 新的作用域 */ })
```

7. **嵌套作用域的销毁顺序**：当父作用域被停止时，子作用域会先于父作用域被销毁（从内到外），类似于 DOM 事件的冒泡机制，子元素先被移除。

8. **避免在 `onScopeDispose` 回调中创建新的副作用**：`onScopeDispose` 的回调应该在清理时只做资源释放操作，不要再创建新的响应式副作用，否则可能导致不可预期的行为。

```ts
// ❌ 错误：在清理回调中创建副作用
onScopeDispose(() => {
  watch(someRef, () => { /* 不要这样做 */ })
})

// ✅ 正确：只做清理操作
onScopeDispose(() => {
  clearInterval(timerId)
  removeEventListener('click', handler)
})
```

9. **`computed` 在 `effectScope` 中的行为**：`computed` 本身也是一种副作用，会被 `effectScope` 收集。当 `scope.stop()` 后，`computed` 不再追踪依赖变化，缓存的值将不再更新。

10. **在组合式函数（Composable）中推荐使用**：如果一个 Composable 创建了 `watch`、`computed` 等副作用，并且需要在组件外部使用或需要手动控制生命周期，应该使用 `effectScope` 包装，提供统一的 `stop` 方法。

> ⚠️ **注意：** `effectScope` 是一个低级 API。如果你只是在组件的 `setup` 函数中使用响应式 API，Vue 已经自动为你管理了副作用的生命周期，通常不需要手动使用 `effectScope`。它主要服务于**组件外部**的复用逻辑和高级场景。

### 七、相关 API 对比

| 特性 | `effectScope` | `onUnmounted` | `watch` 的 `return` |
|------|--------------|---------------|-------------------|
| 管理粒度 | 批量管理多个副作用 | 单个组件级别 | 单个 watcher |
| 适用范围 | 组件内外均可 | 仅组件内 | 组件内外均可 |
| 清理方式 | `scope.stop()` 一次性清理 | 组件卸载时自动触发 | 调用返回的函数 |
| 嵌套支持 | 支持嵌套作用域 | 不支持嵌套 | 无嵌套概念 |
| 典型场景 | Composable、Store、插件 | 组件生命周期 | 单个副作用清理 |

```ts
// 方式一：手动逐个清理（繁琐）
const stop1 = watch(a, () => {})
const stop2 = watch(b, () => {})
const stop3 = computed(() => /* ... */)

function cleanup() {
  stop1()
  stop2()
  // computed 没有直接 stop 方法，难以清理
}

// 方式二：使用 effectScope 统一管理（推荐）
const scope = effectScope()
scope.run(() => {
  watch(a, () => {})
  watch(b, () => {})
  computed(() => /* ... */)
})

function cleanup() {
  scope.stop() // 一次性全部清理
}
```

### 八、总结

`effectScope` 是 Vue 3 响应式系统中一个强大的副作用管理工具：

- **核心价值**：批量收集和统一清理响应式副作用，避免手动逐个管理的繁琐
- **适用场景**：Composable 函数、全局 Store、WebSocket 连接、定时器轮询、插件开发、测试隔离等组件外部的响应式逻辑
- **关键方法**：`scope.run()` 收集副作用，`scope.stop()` 统一清理，`onScopeDispose()` 注册清理回调
- **嵌套机制**：支持作用域嵌套和分离（detached），灵活控制作用域的生命周期关系
- **使用原则**：组件内通常不需要手动使用（Vue 已自动管理），组件外部需要统一管理副作用生命周期时才使用
