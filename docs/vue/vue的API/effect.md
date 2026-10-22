# effect

## 作用

`effect()` 是 Vue 3 响应式系统的底层 API，用于创建一个响应式副作用函数。它会立即执行一次，并自动追踪其中使用的响应式依赖。当依赖发生变化时，副作用函数会自动重新执行。

> ⚠️ 这是一个**底层 API**，Vue 官方文档并未把它列为公开 API（进阶文档只列出 `effectScope()`、`getCurrentScope()`、`onScopeDispose()`）。在应用代码中通常使用 `watchEffect()` 代替；`effect()` 主要用于库作者或需要精细控制副作用的场景。

📖 [Vue 官方文档 - 响应式 API：进阶](https://cn.vuejs.org/api/reactivity-advanced.html)

## 函数签名

```typescript
function effect<T = any>(
  fn: () => T,
  options?: EffectOptions
): EffectRunner<T>

interface EffectOptions {
  scheduler?: EffectScheduler  // 自定义调度器：依赖变化时不直接重跑 fn，而是调用 scheduler
  allowRecurse?: boolean   // 是否允许 effect 触发自身的重新执行（默认 false）
  onStop?: () => void      // 停止时的回调
  onTrack?: (e: DebuggerEvent) => void   // 调试用：依赖被追踪时触发
  onTrigger?: (e: DebuggerEvent) => void // 调试用：依赖变化触发更新时触发
}

interface EffectRunner<T> {
  (): T              // 调用时重新执行副作用
  effect: ReactiveEffect  // 内部 effect 实例，可通过 runner.effect.stop() 停止
}
```

> 💡 `effect()` 会在创建时**立即执行一次**。Vue 3.5 起已不支持 `lazy` 选项（3.4 及之前支持）；`flush` 也不是 `effect()` 的选项，它属于 `watch` / `watchEffect`。停止副作用还可以直接调用导出的 `stop(runner)`。

## 基本用法

```javascript
import { reactive, effect } from 'vue'

const state = reactive({ count: 0 })

// 创建副作用，立即执行一次
effect(() => {
  console.log('count 变化了:', state.count)
})
// 立即输出: count 变化了: 0

state.count++
// 输出: count 变化了: 1
```

## 停止副作用

```javascript
import { ref, effect } from 'vue'

const count = ref(0)

// effect 返回一个 runner 函数
const runner = effect(() => {
  console.log('count:', count.value)
})
// 立即输出: count: 0

count.value++
// 输出: count: 1

// 停止副作用追踪
runner.effect.stop()

count.value++
// 不再输出，副作用已停止
```

## effect 的选项

### 1. scheduler - 自定义调度器

```javascript
import { ref, effect } from 'vue'

const count = ref(0)

effect(() => {
  console.log('副作用执行:', count.value)
}, {
  scheduler(fn) {
    // 依赖变化时不立即重跑 fn，而是交给 scheduler 调度
    // 注意：scheduler 必须自行调用 fn 才会让副作用重新执行
    Promise.resolve().then(fn)
  }
})

count.value++
console.log('同步代码') // 先执行
// 然后: 副作用执行: 1
```

### 2. flush - 不是 effect 的选项

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

// ❌ effect() 不支持 flush，传了也不会生效
// effect(fn, { flush: 'post' })

// ✅ flush 是 watch / watchEffect 的选项
// 'pre'（默认，组件更新前）、'post'（组件更新后，可访问更新后的 DOM）、'sync'（同步触发）
watchEffect(() => {
  console.log('watchEffect:', count.value)
}, { flush: 'post' })
```

### 3. onStop - 停止时的回调

```javascript
import { ref, effect } from 'vue'

const count = ref(0)

const runner = effect(() => {
  console.log('count:', count.value)
}, {
  onStop() {
    console.log('副作用已停止，执行清理工作')
  }
})

// 停止时会触发 onStop 回调
runner.effect.stop()
// 输出: 副作用已停止，执行清理工作
```

## 使用场景

### 1. 实现 debounce 效果

```javascript
import { ref, effect } from 'vue'

const keyword = ref('')
let timer = null

effect(() => {
  console.log('追踪依赖:', keyword.value)
}, {
  scheduler(fn) {
    // 依赖变化时不立即执行，而是防抖 300ms 后再调用 fn
    clearTimeout(timer)
    timer = setTimeout(fn, 300)
  }
})
```

### 2. 惰性求值请用 computed

```javascript
// ⚠️ Vue 3.5 起 effect() 不再支持 lazy，创建时总会立即执行一次
// 需要惰性求值 + 缓存的场景请使用 computed
import { reactive, computed } from 'vue'

const state = reactive({ count: 0 })

const doubled = computed(() => state.count * 2)

console.log(doubled.value) // 0，此时才真正计算
state.count++
console.log(doubled.value) // 2
```

### 3. 自定义响应式存储

```javascript
import { reactive, effect } from 'vue'

function createStore(initialState) {
  const state = reactive({ ...initialState })
  const listeners = new Set()

  // 追踪状态变化
  effect(() => {
    // 深度追踪所有属性
    const snapshot = JSON.stringify(state)
    listeners.forEach(fn => fn(snapshot))
  })

  return {
    state,
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    }
  }
}

const store = createStore({ count: 0, name: 'Vue' })
store.subscribe((snapshot) => {
  console.log('状态变化:', snapshot)
})
store.state.count++ // 触发订阅
```

### 4. DOM 操作副作用

```javascript
import { ref, effect } from 'vue'

const title = ref('Hello')

effect(() => {
  document.title = title.value
})

// 修改 ref 会自动更新页面标题
title.value = 'New Title'
```

### 5. 配合 effectScope 管理副作用

```javascript
import { ref, effect, effectScope, onScopeDispose } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)

  effect(() => {
    console.log('effect 1:', count.value)
  })

  effect(() => {
    console.log('effect 2:', count.value * 2)
  })

  onScopeDispose(() => {
    console.log('作用域被销毁')
  })
})

// 停止作用域内的所有 effect
scope.stop()
```

## 与 watchEffect 的对比

| 特性 | effect | watchEffect |
|------|--------|-------------|
| **级别** | 底层 API | 高层 API |
| **返回值** | runner 函数（含 .effect 属性） | 停止函数 |
| **推荐度** | 库作者使用 | 应用代码推荐 |
| **调度器** | 支持自定义 scheduler | 不支持（只有 `flush` 选项） |
| **lazy** | 3.4 及之前支持，3.5 已移除 | 不支持 |
| **调试** | 较难 | 更友好 |
| **稳定性** | 可能随版本变化 | 稳定 API |

```javascript
import { ref, effect, watchEffect } from 'vue'

const count = ref(0)

// watchEffect：推荐在应用代码中使用
const stop = watchEffect(() => {
  console.log('watchEffect:', count.value)
})
stop() // 停止

// effect：底层 API，用于需要精细控制的场景
const runner = effect(() => {
  console.log('effect:', count.value)
}, {
  scheduler(fn) {
    // 自定义调度逻辑
    requestAnimationFrame(fn)
  }
})
runner.effect.stop() // 停止
```

## 注意事项

### 1. 避免在应用代码中直接使用

```javascript
// ❌ 应用代码中优先使用 watchEffect
effect(() => {
  console.log(state.count)
})

// ✅ 推荐使用 watchEffect
watchEffect(() => {
  console.log(state.count)
})
```

### 2. 在副作用中修改自己追踪的依赖

```javascript
import { reactive, effect } from 'vue'

const state = reactive({ count: 0 })

effect(() => {
  state.count++ // ⚠️ 不推荐：在副作用中修改自己追踪的依赖
})
```

> 💡 与直觉不同，这**不会**导致无限循环：effect 默认不允许递归（`allowRecurse: false`），Vue 会忽略它在自身运行期间触发的更新。但这种写法语义混乱、难以维护，应当避免。

### 3. effect 是同步追踪依赖的

```javascript
import { ref, effect } from 'vue'

const a = ref(1)
const b = ref(2)

effect(() => {
  // 只追踪同步代码中访问的响应式数据
  console.log(a.value)

  // 异步代码中的依赖不会被追踪
  setTimeout(() => {
    console.log(b.value) // b 的变化不会触发此 effect
  }, 0)
})
```

### 4. 不依赖组件，但要自己负责停止

`effect()` 是独立的响应式 API，与生命周期钩子不同，它**可以在任何地方使用**（组件 `setup` 内、组件外均可）。但正因如此，在组件外创建的 effect 不会随组件卸载自动停止，需要自己管理生命周期。

```javascript
import { ref, effect } from 'vue'

// ✅ 在组件外部也可以创建 effect
const count = ref(0)
const runner = effect(() => {
  console.log('count:', count.value)
})

// ⚠️ 它不会自动停止，不用时必须手动停止，否则内存泄漏
runner.effect.stop()
```

> 💡 推荐配合 `effectScope()` 统一管理：`scope.run()` 内创建的 effect 会在 `scope.stop()` 时一并停止。

## 最佳实践

1. **应用代码用 watchEffect**：`effect` 是底层 API，应用代码优先使用 `watchEffect`
2. **库开发使用 effect**：开发响应式库或工具时，`effect` 提供更精细的控制
3. **配合 effectScope**：使用 `effectScope` 统一管理多个 effect 的生命周期
4. **避免副作用循环**：不要在 effect 中修改自己追踪的响应式数据
5. **利用 scheduler**：通过自定义 scheduler 实现 debounce、throttle 等高级功能
