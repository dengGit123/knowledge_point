### 一、概述

`customRef()` 是 Vue 3 响应式系统中的一个高级 API，它允许开发者**完全自定义**一个 ref 的依赖追踪和触发更新行为。简单来说，普通的 `ref()` 是"全自动"的 —— 读取时自动追踪依赖，修改时自动触发视图更新；而 `customRef()` 则把这两个关键环节的控制权交给了你，让你可以精确地决定**何时追踪**、**何时更新**。

> 📖 [官方文档 - customRef](https://cn.vuejs.org/api/reactivity-advanced.html#customref)

它的核心价值在于：当你需要在数据变更和视图更新之间**插入自定义逻辑**（比如防抖、节流、数据转换、持久化存储等），`customRef()` 是最优雅、最原生的解决方案。

### 二、核心原理

`customRef()` 的底层工作机制可以类比为**快递的收发系统**：

- **track（追踪）**：相当于"登记收件人"。当你读取数据时，调用 `track()` 告诉 Vue："当前这个数据正在被使用，请记住它"。这样当数据变化时，Vue 才知道需要通知谁。
- **trigger（触发）**：相当于"通知取件"。当你修改数据后，调用 `trigger()` 告诉 Vue："数据已经变了，请通知所有依赖方更新"。

**与普通 ref 的对比**：

| 特性 | `ref()` | `customRef()` |
|------|---------|---------------|
| 依赖追踪 | 自动 | 手动调用 `track()` |
| 触发更新 | 自动 | 手动调用 `trigger()` |
| 自定义逻辑 | 不支持 | 完全支持 |
| 适用场景 | 简单响应式数据 | 需要精细控制的场景 |

> 💡 **提示：** `customRef()` 接收一个工厂函数，这个函数会在 `track` 和 `trigger` 两个回调函数作为参数的环境中被调用，返回一个包含 `get` 和 `set` 的对象。

### 三、详细用法

#### 1. 基本用法

```ts
import { customRef } from 'vue'

// 创建一个自定义 ref，带有延迟触发功能
function useDelayedRef<T>(initialValue: T, delay: number = 200) {
  let value: T = initialValue
  let timeout: ReturnType<typeof setTimeout> | null = null

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track() // 读取时追踪依赖
        return value
      },
      set(newValue: T) {
        value = newValue
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          trigger() // 延迟触发更新
        }, delay)
      }
    }
  })
}

// 使用
const searchText = useDelayedRef('', 300)
```

#### 2. 进阶用法

**带校验逻辑的 customRef**：

```vue
<script setup lang="ts">
import { customRef, computed } from 'vue'

// 带验证的自定义 ref
function useValidatedRef<T>(
  initialValue: T,
  validator: (value: T) => boolean,
  errorMessage: string = '验证失败'
) {
  let value: T = initialValue

  return customRef<{ value: T; isValid: boolean; error: string }>(
    (track, trigger) => {
      return {
        get() {
          track()
          return {
            value,
            isValid: validator(value),
            error: validator(value) ? '' : errorMessage
          }
        },
        set(newValue: T) {
          value = newValue
          trigger()
        }
      }
    }
  )
}

// 使用：邮箱验证
const email = useValidatedRef(
  '',
  (val: string) => {
    if (!val) return true // 允许空值
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  },
  '请输入有效的邮箱地址'
)
</script>

<template>
  <input v-model="(email as any).value" placeholder="请输入邮箱" />
  <p v-if="!(email as any).isValid" style="color: red">
    {{ (email as any).error }}
  </p>
</template>
```

**带历史记录的 customRef（撤销/重做）**：

```ts
import { customRef, type Ref } from 'vue'

interface UseHistoryRefOptions<T> {
  maxHistory?: number
}

function useHistoryRef<T>(
  initialValue: T,
  options: UseHistoryRefOptions<T> = {}
): {
  value: Ref<T>
  history: T[]
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  undo: () => void
  redo: () => void
} {
  const { maxHistory = 50 } = options
  const history: T[] = [initialValue]
  let pointer = 0

  // 这里仅演示思路，完整实现需要更多逻辑
  const value = customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return history[pointer]
      },
      set(newValue: T) {
        // 截断 pointer 之后的历史
        history.splice(pointer + 1)
        history.push(newValue)
        if (history.length > maxHistory) {
          history.shift()
        }
        pointer = history.length - 1
        trigger()
      }
    }
  })

  return {
    value,
    history,
    canUndo: computed(() => pointer > 0) as Ref<boolean>,
    canRedo: computed(() => pointer < history.length - 1) as Ref<boolean>,
    undo: () => {
      if (pointer > 0) {
        pointer--
        // 需要手动触发更新
      }
    },
    redo: () => {
      if (pointer < history.length - 1) {
        pointer++
      }
    }
  }
}
```

#### 3. API 参数说明

| 参数/返回值 | 类型 | 说明 |
|------------|------|------|
| `factory` | `(track: () => void, trigger: () => void) => { get: () => T, set: (value: T) => void }` | 工厂函数，接收 `track` 和 `trigger` 两个回调 |
| `track()` | `() => void` | 在 `get()` 中调用，标记当前值为活跃依赖 |
| `trigger()` | `() => void` | 在 `set()` 中调用，通知 Vue 重新计算依赖该值的所有副作用 |
| **返回值** | `Ref<T>` | 返回一个自定义的响应式引用 |

**函数签名**：

```ts
function customRef<T>(factory: (
  track: () => void,
  trigger: () => void
) => {
  get(): T
  set(value: T): void
}): Ref<T>
```

### 四、实现效果

以下是一个完整的防抖搜索示例，展示 `customRef` 的实际运行效果：

```vue
<!-- DebouncedSearch.vue -->
<script setup lang="ts">
import { customRef } from 'vue'

function useDebouncedRef<T>(value: T, delay: number = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue: T) {
        // ✅ 先更新内部值，但不立即触发视图更新
        value = newValue
        if (timeout) clearTimeout(timeout)
        // 延迟后触发视图更新
        timeout = setTimeout(() => {
          trigger() // 只有调用 trigger() 后，依赖此 ref 的模板才会重新渲染
        }, delay)
      }
    }
  })
}

const searchQuery = useDebouncedRef('', 300)
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索..." />
    <!--
      用户输入时：
      - 每次 keyup，set() 被调用
      - 内部 value 立即更新（下次 get 返回新值）
      - 但 trigger() 延迟 300ms 才调用
      - 所以模板中的搜索结果只会在用户停止输入 300ms 后才更新
    -->
    <p>搜索关键词：{{ searchQuery }}</p>
  </div>
</template>
```

**运行效果说明**：

1. 用户快速输入 "hello" 五个字符
2. `set()` 被调用 5 次，每次都会重置计时器
3. 只有最后一次输入后等待 300ms 无新输入，`trigger()` 才会执行
4. 模板此时才会重新渲染，显示最终的搜索关键词 "hello"

### 五、使用场景

#### 场景 1：防抖 Ref（搜索输入）

最常见的场景，用于搜索框输入防抖，避免频繁触发搜索请求。

```ts
import { customRef } from 'vue'

function useDebouncedRef<T>(initialValue: T, delay: number = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let value: T = initialValue

  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      value = newValue
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(trigger, delay)
    }
  }))
}

// ✅ 使用：搜索框输入防抖
const searchQuery = useDebouncedRef('', 500)
```

#### 场景 2：节流 Ref（滚动位置追踪）

限制数据更新频率，常用于滚动事件、窗口大小调整等高频场景。

```ts
import { customRef } from 'vue'

function useThrottledRef<T>(initialValue: T, interval: number = 200) {
  let value: T = initialValue
  let lastTriggerTime = 0
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null

  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      value = newValue
      const now = Date.now()
      if (now - lastTriggerTime >= interval) {
        lastTriggerTime = now
        trigger()
      } else if (!pendingTimeout) {
        // 保证最后一次变更一定会触发
        pendingTimeout = setTimeout(() => {
          lastTriggerTime = Date.now()
          pendingTimeout = null
          trigger()
        }, interval - (now - lastTriggerTime))
      }
    }
  }))
}

// ✅ 使用：追踪滚动位置（节流）
const scrollY = useThrottledRef(0, 100)

window.addEventListener('scroll', () => {
  scrollY.value = window.scrollY
})
```

#### 场景 3：本地存储同步（持久化数据）

自动将数据同步到 `localStorage`，页面刷新后数据不丢失。

```ts
import { customRef, watch } from 'vue'

function useLocalStorage<T>(key: string, defaultValue: T) {
  let storedValue: T = defaultValue

  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      storedValue = JSON.parse(raw) as T
    }
  } catch (e) {
    console.warn(`Failed to parse localStorage key "${key}":`, e)
  }

  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return storedValue
    },
    set(newValue: T) {
      storedValue = newValue
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (e) {
        console.warn(`Failed to save to localStorage key "${key}":`, e)
      }
      trigger()
    }
  }))
}

// ✅ 使用：持久化用户设置
const theme = useLocalStorage<'light' | 'dark'>('app-theme', 'light')
const settings = useLocalStorage('app-settings', {
  language: 'zh-CN',
  fontSize: 14,
  notifications: true
})
```

#### 场景 4：自动重置 Ref（临时提示消息）

设置值后自动恢复为初始值，适用于临时提示、通知消息等场景。

```ts
import { customRef } from 'vue'

function useAutoResetRef<T>(initialValue: T, resetDelay: number = 3000) {
  let value: T = initialValue
  let timeout: ReturnType<typeof setTimeout> | null = null

  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      value = newValue
      if (timeout) clearTimeout(timeout)
      trigger() // 立即触发以显示新值

      timeout = setTimeout(() => {
        value = initialValue
        trigger() // 延迟后触发以重置显示
      }, resetDelay)
    }
  }))
}

// ✅ 使用：Toast 通知自动消失
const toastMessage = useAutoResetRef('', 3000)

function showSuccess() {
  toastMessage.value = '操作成功！'
  // 3 秒后自动变回空字符串
}
```

#### 场景 5：带旧值比较的 Ref（仅值真正变化时触发）

避免相同值反复赋值导致不必要的视图更新，优化性能。

```ts
import { customRef } from 'vue'

function useShallowCompareRef<T extends object>(initialValue: T) {
  let value: T = initialValue

  function isEqual(a: T, b: T): boolean {
    if (a === b) return true
    const keysA = Object.keys(a) as (keyof T)[]
    const keysB = Object.keys(b) as (keyof T)[]
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => a[key] === b[key])
  }

  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      // ✅ 只有值真正变化时才触发更新
      if (!isEqual(value, newValue)) {
        value = newValue
        trigger()
      }
      // ❌ 如果值没变化，不做任何操作
    }
  }))
}

// 使用：表单数据优化
const formData = useShallowCompareRef({ name: '', age: 0 })
```

#### 场景 6：异步数据获取 Ref

封装异步数据获取逻辑，自动管理加载状态。

```ts
import { customRef, type Ref } from 'vue'

interface AsyncRefState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useAsyncRef<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  initialValue: T | null = null
) {
  const state: AsyncRefState<T> = {
    data: initialValue,
    loading: false,
    error: null
  }

  let abortController: AbortController | null = null

  return customRef<AsyncRefState<T>>((track, trigger) => ({
    get() {
      track()
      return state
    },
    set(_newValue: AsyncRefState<T>) {
      // 取消上一次请求
      if (abortController) {
        abortController.abort()
      }

      abortController = new AbortController()
      state.loading = true
      state.error = null
      trigger()

      fetcher(abortController.signal)
        .then((data) => {
          state.data = data
          state.loading = false
          trigger()
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            state.error = err as Error
            state.loading = false
            trigger()
          }
        })
    }
  }))
}

// ✅ 使用：异步获取用户数据
const userData = useAsyncRef(async (signal) => {
  const res = await fetch('/api/user', { signal })
  return res.json()
})

// 触发请求
userData.value = { data: null, loading: false, error: null }
```

#### 场景 7：带类型转换的 Ref（单位换算）

在 getter/setter 中自动进行数据转换，对外保持简洁的接口。

```ts
import { customRef } from 'vue'

function useConvertedRef<R, S>(
  initialValue: R,
  options: {
    toStorage: (raw: R) => S
    toRaw: (stored: S) => R
  }
) {
  let storedValue: S = options.toStorage(initialValue)

  return customRef<R>((track, trigger) => ({
    get() {
      track()
      return options.toRaw(storedValue)
    },
    set(newValue: R) {
      storedValue = options.toStorage(newValue)
      trigger()
    }
  }))
}

// ✅ 使用：温度单位换算（内部存储摄氏度，外部使用华氏度）
const temperature = useConvertedRef(25, {
  toStorage: (celsius: number) => celsius, // 内部存摄氏度
  toRaw: (celsius: number) => celsius * 9 / 5 + 32 // 对外返回华氏度
})

console.log(temperature.value) // 77 (华氏度)
temperature.value = 100 // 设置华氏度 100
// 内部自动转换为摄氏度 37.78 存储
```

#### 场景 8：带条件触发的 Ref（权限控制）

根据条件决定是否允许值变更和视图更新，适用于权限控制场景。

```ts
import { customRef } from 'vue'

function useGuardedRef<T>(
  initialValue: T,
  guard: (newValue: T, oldValue: T) => boolean
) {
  let value: T = initialValue

  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      // ✅ 通过 guard 函数判断是否允许更新
      if (guard(newValue, value)) {
        value = newValue
        trigger()
      }
      // ❌ guard 返回 false 时，静默忽略
    }
  }))
}

// 使用：只允许正数的计数器
const positiveCount = useGuardedRef(0, (newVal) => newVal >= 0)

// 使用：限制字符串长度
const limitedText = useGuardedRef('', (newVal) => newVal.length <= 100)

// 使用：基于权限的数据修改
const isAdmin = true
const config = useGuardedRef(
  { theme: 'light' },
  (_newVal, _oldVal) => isAdmin
)
```

#### 场景 9：双向映射 Ref（枚举值与标签互转）

在前端开发中经常需要将枚举值与可读标签之间互相转换。

```ts
import { customRef } from 'vue'

type StatusValue = 'active' | 'inactive' | 'pending'
type StatusLabel = '激活' | '未激活' | '待审核'

const statusMap: Record<StatusValue, StatusLabel> = {
  active: '激活',
  inactive: '未激活',
  pending: '待审核'
}

const reverseMap: Record<StatusLabel, StatusValue> = {
  '激活': 'active',
  '未激活': 'inactive',
  '待审核': 'pending'
}

function useMappedRef(
  initialValue: StatusValue
) {
  let internalValue: StatusValue = initialValue

  return customRef<StatusLabel>((track, trigger) => ({
    get() {
      track()
      return statusMap[internalValue]
    },
    set(newLabel: StatusLabel) {
      const mapped = reverseMap[newLabel]
      if (mapped) {
        internalValue = mapped
        trigger()
      }
    }
  }))
}

// ✅ 使用：下拉选择中显示中文标签，内部存储英文值
const statusLabel = useMappedRef('active')
// 读取 → '激活'
// 设置 statusLabel.value = '待审核' → 内部变为 'pending'
```

#### 场景 10：依赖外部状态的 Ref（实时汇率换算）

将外部数据源与响应式系统绑定。

```ts
import { customRef, ref } from 'vue'

function useCurrencyRef(
  initialValue: number,
  getRate: () => number
) {
  let baseValue: number = initialValue

  return customRef<number>((track, trigger) => ({
    get() {
      track()
      return baseValue * getRate()
    },
    set(newValue: number) {
      baseValue = newValue / getRate()
      trigger()
    }
  }))
}

// ✅ 使用：基于汇率的金额换算
const exchangeRate = ref(7.25) // USD → CNY

const usdAmount = useCurrencyRef(100, () => 1)
const cnyAmount = useCurrencyRef(100, () => exchangeRate.value)

// 当汇率变化时，需要手动触发更新
// 实际项目中可结合 watch 来自动 trigger
```

### 六、注意事项

1. **必须调用 `track()`**：在 `get()` 中忘记调用 `track()` 会导致该 ref 的值变化时模板不会更新。

   ```ts
   // ❌ 错误：缺少 track()
   return customRef((track, trigger) => ({
     get() {
       return value // 未追踪依赖，视图不会更新
     },
     // ...
   }))

   // ✅ 正确：在 get 中调用 track()
   return customRef((track, trigger) => ({
     get() {
       track()
       return value
     },
     // ...
   }))
   ```

2. **必须调用 `trigger()`**：在 `set()` 中忘记调用 `trigger()` 会导致值已改变但视图不刷新。

   ```ts
   // ❌ 错误：缺少 trigger()
   set(newValue) {
     value = newValue // 值更新了，但视图不会刷新
   }

   // ✅ 正确：在合适的时机调用 trigger()
   set(newValue) {
     value = newValue
     trigger() // 通知 Vue 重新渲染
   }
   ```

3. **`track()` 只能在 `get()` 中调用**：在 `set()` 或其他地方调用 `track()` 没有意义，依赖追踪的核心是"读取时建立关系"。

4. **闭包陷阱**：工厂函数中的变量通过闭包捕获，确保变量不会被意外修改或泄漏。

   ```ts
   // ❌ 错误：内部变量暴露到外部
   let internalValue = initialValue
   // 如果外部代码直接修改 internalValue，customRef 无法感知

   // ✅ 正确：将变量封装在工厂函数作用域内
   return customRef((track, trigger) => {
     let value = initialValue // 仅在闭包内可访问
     return {
       get() { track(); return value },
       set(newValue) { value = newValue; trigger() }
     }
   })
   ```

5. **内存泄漏风险**：如果在 `set()` 中使用了 `setTimeout`、`addEventListener` 等，务必在适当时机清理。

   ```ts
   // ✅ 正确：使用 clearTimeout 避免多个定时器叠加
   set(newValue) {
     value = newValue
     if (timeout) clearTimeout(timeout)
     timeout = setTimeout(trigger, delay)
   }
   ```

6. **TypeScript 类型标注**：务必使用泛型参数标注类型，否则返回值会被推断为 `Ref<unknown>`。

   ```ts
   // ❌ 缺少泛型，类型推断不准确
   const count = customRef((track, trigger) => { ... })

   // ✅ 明确指定泛型类型
   const count = customRef<number>((track, trigger) => { ... })
   ```

7. **不要在 `get()` 中执行耗时操作**：`get()` 可能被频繁调用（如模板渲染、computed 计算），在其中执行耗时逻辑会严重影响性能。

   ```ts
   // ❌ 错误：get 中执行耗时操作
   get() {
     track()
     const result = heavyComputation(value) // 每次读取都重新计算
     return result
   }

   // ✅ 正确：缓存计算结果
   get() {
     track()
     return cachedResult // 返回缓存值
   }
   ```

8. **`trigger()` 可以多次调用**：在某些场景中，`set()` 可能需要在不同时机多次触发更新（例如先触发一次显示新值，再延迟触发一次重置）。

9. **`customRef` 返回的是只读的 `Ref`**：返回的 ref 的 `.value` 属性是响应式的，但不要尝试解构它。

   ```ts
   // ❌ 错误：解构会丢失响应性
   const { value } = useDebouncedRef('')

   // ✅ 正确：通过 .value 访问
   const searchRef = useDebouncedRef('')
   console.log(searchRef.value)
   ```

10. **与 `toRef` / `toRefs` 的兼容性**：`customRef` 返回的对象是一个标准的 `Ref`，可以正常与 `toRef`、`toRefs`、`watch`、`computed` 等 API 配合使用。

    ```ts
    // ✅ 可以正常使用 watch 监听
    const debouncedValue = useDebouncedRef('')
    watch(debouncedValue, (newVal) => {
      console.log('值变化了:', newVal)
    })
    ```

### 七、相关 API 对比

| API | 用途 | 特点 |
|-----|------|------|
| `ref()` | 创建基础响应式引用 | 自动追踪和触发，适合简单场景 |
| `customRef()` | 创建自定义响应式引用 | 手动控制追踪和触发，适合需要自定义逻辑的场景 |
| `computed()` | 创建计算属性 | 只读（默认），自动追踪依赖，基于其他响应式数据派生 |
| `watchEffect()` | 副作用自动追踪 | 自动追踪回调中的依赖，适合执行副作用 |
| `shallowRef()` | 创建浅层响应式引用 | 只追踪 `.value` 本身的变化，不追踪内部属性 |

> 💡 **提示：** 如果你需要在 `get` 和 `set` 之间插入自定义逻辑，使用 `customRef()`；如果只是基于其他值进行派生计算，使用 `computed()`；如果只需要简单响应式数据，使用 `ref()`。

**`customRef` 与 `computed` 的 `get/set` 写法对比**：

```ts
// computed 的 get/set 写法 —— 无法控制触发时机
const fullName = computed({
  get: () => firstName.value + ' ' + lastName.value,
  set: (val) => {
    const parts = val.split(' ')
    firstName.value = parts[0]
    lastName.value = parts[1]
  }
})

// customRef —— 可以完全控制何时追踪、何时触发
const debouncedName = customRef<string>((track, trigger) => {
  let value = ''
  let timeout: ReturnType<typeof setTimeout> | null = null
  return {
    get() {
      track()
      return value
    },
    set(newValue: string) {
      value = newValue
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(trigger, 300) // 延迟触发
    }
  }
})
```

### 八、总结

`customRef()` 是 Vue 3 响应式系统中一把"手术刀"级别的工具，它将响应式的两个核心环节 —— **依赖追踪**（`track`）和 **触发更新**（`trigger`）—— 完全暴露给开发者，使开发者能够在数据读取和变更时插入任意自定义逻辑。

**核心记忆点**：

- `get()` 中调 `track()`，`set()` 中调 `trigger()`
- 适用于防抖、节流、持久化、验证、转换等需要"拦截"数据的场景
- 返回值是标准的 `Ref`，可与其他组合式 API 无缝配合
- 工厂函数内部通过闭包维护私有状态，确保封装性

**选择建议**：

- 简单数据 → `ref()`
- 派生计算 → `computed()`
- 需要自定义追踪/触发逻辑 → `customRef()`
