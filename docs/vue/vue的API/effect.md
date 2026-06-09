# effect

## 作用

`effect()` 是 Vue 3 响应式系统的底层 API，用于创建一个响应式副作用函数。它会立即执行一次，并自动追踪其中使用的响应式依赖。当依赖发生变化时，副作用函数会自动重新执行。

> ⚠️ 这是一个**底层 API**，在应用代码中通常使用 `watchEffect()` 代替。`effect()` 主要用于库的作者或需要精细控制副作用的场景。

> [Vue 官方文档 - 响应式 API：进阶](https://cn.vuejs.org/api/reactivity-advanced)

## 函数签名

```typescript
function effect<T = any>(
  fn: () => T,
  options?: EffectOptions
): EffectRunner<T>

interface EffectOptions {
  lazy?: boolean           // 是否延迟执行（不立即运行）
  scheduler?: EffectScheduler  // 自定义调度器
  flush?: 'pre' | 'post' | 'sync'  // 执行时机
  onStop?: () => void      // 停止时的回调
  allowRecurse?: boolean   // 是否允许递归调用
}

interface EffectRunner<T> {
  (): T              // 调用时重新执行副作用
  effect: ReactiveEffect  // 内部 effect 实例
}
```

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

### 1. lazy - 延迟执行

```javascript
import { ref, effect } from 'vue'

const count = ref(0)

// lazy: true 不会立即执行，需要手动调用
const runner = effect(() => {
  console.log('count:', count.value)
  return count.value * 2
}, { lazy: true })

// 手动执行
const result = runner() // 输出: count: 0
console.log(result) // 0

count.value++
runner() // 输出: count: 1
```

### 2. scheduler - 自定义调度器

```javascript
import { ref, effect } from 'vue'

const count = ref(0)

effect(() => {
  console.log('副作用执行:', count.value)
}, {
  scheduler(fn) {
    // 自定义调度：不立即执行，而是放到下一个微任务
    Promise.resolve().then(fn)
  }
})

count.value++
console.log('同步代码') // 先执行
// 然后: 副作用执行: 1
```

### 3. flush - 执行时机

```javascript
import { ref, effect } from 'vue'

const count = ref(0)

// 默认 flush: 'pre' — 组件更新前执行
effect(() => {
  console.log('pre:', count.value)
}, { flush: 'pre' })

// flush: 'post' — 组件更新后执行（可访问更新后的 DOM）
effect(() => {
  console.log('post:', count.value)
}, { flush: 'post' })

// flush: 'sync' — 同步执行（依赖变化时立即触发）
effect(() => {
  console.log('sync:', count.value)
}, { flush: 'sync' })
```

### 4. onStop - 停止时的回调

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

effect(() => {
  const value = keyword.value
  console.log('追踪依赖:', value)
}, {
  scheduler(fn) {
    // 使用调度器实现 debounce
    let timer = null
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), 300)
    }
  }
})
```

### 2. 简单的 computed 实现

```javascript
import { reactive, effect } from 'vue'

const state = reactive({ count: 0 })

// 使用 lazy + 手动执行 实现类似 computed 的效果
const runner = effect(() => {
  return state.count * 2
}, { lazy: true })

// 手动获取计算结果
console.log(runner()) // 0
state.count++
console.log(runner()) // 2
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
| **调度器** | 支持自定义 scheduler | 不支持 |
| **lazy** | 支持 | 不支持 |
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

### 2. 避免无限循环

```javascript
import { reactive, effect } from 'vue'

const state = reactive({ count: 0 })

// ❌ 无限循环：在副作用中修改依赖的值
effect(() => {
  state.count++ // 触发自己重新执行 → 无限循环
})

// ✅ 避免在副作用中修改自己追踪的依赖
effect(() => {
  console.log(state.count) // 只读取，不修改
})
```

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

### 4. 只能在 setup 中使用

```javascript
import { effect } from 'vue'

// ❌ 不要在组件外部使用
effect(() => {
  console.log('这可能导致问题')
})

// ✅ 在 setup 中使用
export default {
  setup() {
    effect(() => {
      console.log('这是正确的')
    })
  }
}
```

## 最佳实践

1. **应用代码用 watchEffect**：`effect` 是底层 API，应用代码优先使用 `watchEffect`
2. **库开发使用 effect**：开发响应式库或工具时，`effect` 提供更精细的控制
3. **配合 effectScope**：使用 `effectScope` 统一管理多个 effect 的生命周期
4. **避免副作用循环**：不要在 effect 中修改自己追踪的响应式数据
5. **利用 scheduler**：通过自定义 scheduler 实现 debounce、throttle 等高级功能
