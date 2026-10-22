# onScopeDispose

## 作用

在当前作用域被销毁时注册一个回调函数。通常用于在可组合函数中清理副作用。

📖 [官方文档：onScopeDispose](https://cn.vuejs.org/api/reactivity-advanced.html#onscopedispose)

## 语法

```javascript
import { onScopeDispose } from 'vue'

onScopeDispose(() => {
  // 清理逻辑
})

// Vue 3.4+：在没有活跃作用域时静默跳过，不报警告
onScopeDispose(() => {}, true)
```

## 参数

- `callback`: 要在作用域销毁时执行的回调函数
- `failSilently` (可选，默认 `false`，Vue 3.4+): 默认情况下，在没有活跃 `effectScope` 的上下文中调用会触发开发环境警告；传 `true` 则静默跳过（不注册、不警告）

## 返回值

无

## 基础用法

```javascript
import { onScopeDispose, effectScope } from 'vue'

const scope = effectScope()

scope.run(() => {
  onScopeDispose(() => {
    console.log('作用域被销毁了')
  })
})

scope.stop() // 输出: "作用域被销毁了"
```

## 在可组合函数中使用

```javascript
// utils/useInterval.js
import { onScopeDispose, ref } from 'vue'

export function useInterval(callback, delay) {
  const timerId = ref(null)

  const start = () => {
    timerId.value = setInterval(callback, delay)
  }

  const stop = () => {
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }

  start()

  // 在作用域销毁时自动清理
  onScopeDispose(stop)

  return { start, stop }
}
```

## 事件监听器清理

```javascript
// utils/useResize.js
import { onScopeDispose } from 'vue'

export function useResize(element, callback) {
  const resizeObserver = new ResizeObserver(callback)

  resizeObserver.observe(element)

  onScopeDispose(() => {
    resizeObserver.disconnect()
  })
}
```

## WebSocket 连接清理

```javascript
// utils/useWebSocket.js
import { onScopeDispose, ref } from 'vue'

export function useWebSocket(url) {
  const ws = ref(null)
  const data = ref(null)
  const error = ref(null)

  function connect() {
    ws.value = new WebSocket(url)

    ws.value.onmessage = (event) => {
      data.value = JSON.parse(event.data)
    }

    ws.value.onerror = (err) => {
      error.value = err
    }
  }

  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  connect()

  onScopeDispose(disconnect)

  return { data, error, reconnect: connect }
}
```

## 第三方库集成

```javascript
// utils/useChart.js
import { onScopeDispose } from 'vue'
import * as echarts from 'echarts'

export function useChart(elRef, options) {
  let chartInstance = null

  function initChart() {
    if (elRef.value) {
      chartInstance = echarts.init(elRef.value)
      chartInstance.setOption(options)
    }
  }

  function updateOptions(newOptions) {
    chartInstance?.setOption(newOptions)
  }

  function resize() {
    chartInstance?.resize()
  }

  onScopeDispose(() => {
    chartInstance?.dispose()
    chartInstance = null
  })

  return { initChart, updateOptions, resize }
}
```

## 定时器清理

```javascript
// utils/useTimeout.js
import { onScopeDispose } from 'vue'

export function useTimeout(callback, delay) {
  let timerId = null

  const start = () => {
    timerId = setTimeout(() => {
      callback()
      timerId = null
    }, delay)
  }

  const clear = () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  onScopeDispose(clear)

  return { start, clear }
}
```

## 动画帧清理

```javascript
// utils/useAnimation.js
import { onScopeDispose } from 'vue'

export function useAnimation(callback) {
  let rafId = null

  function animate() {
    callback()
    rafId = requestAnimationFrame(animate)
  }

  function start() {
    if (!rafId) {
      animate()
    }
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  onScopeDispose(stop)

  return { start, stop }
}
```

## 多个清理操作

```javascript
// utils/useMediaQuery.js
import { onScopeDispose, ref } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(false)

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia(query)

    const update = () => {
      matches.value = mediaQuery.matches
    }

    mediaQuery.addEventListener('change', update)
    update()

    onScopeDispose(() => {
      mediaQuery.removeEventListener('change', update)
    })
  }

  return matches
}
```

## 与 effectScope 配合

```javascript
import { effectScope, onScopeDispose, computed, ref } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)

  onScopeDispose(() => {
    console.log('清理资源', count.value, doubled.value)
  })

  return { count, doubled }
})

// 当 scope.stop() 被调用时，onScopeDispose 的回调会执行
scope.stop()
```

## 错误处理

```javascript
import { onScopeDispose } from 'vue'

export function useResource() {
  let resource = null

  try {
    resource = acquireResource()

    onScopeDispose(() => {
      if (resource) {
        try {
          releaseResource(resource)
        } catch (err) {
          console.error('清理资源时出错:', err)
        }
        resource = null
      }
    })

    return resource
  } catch (err) {
    // 获取资源失败，不需要清理
    throw err
  }
}
```

## 注意事项

1. **必须在作用域内调用**：只能在 `effectScope().run()` 或组件的 `setup()` 中调用

2. **调用顺序**：回调按照**注册顺序**依次执行（先注册的先执行），不是相反顺序

3. **条件调用**：如果在条件语句中调用，确保逻辑正确

```javascript
// 不推荐
if (someCondition) {
  onScopeDispose(() => {
    // 清理逻辑
  })
}

// 推荐
onScopeDispose(() => {
  if (someCondition) {
    // 清理逻辑
  }
})
```

4. **与 onUnmounted 的区别**：
   - `onUnmounted` 只在组件中可用
   - `onScopeDispose` 可以在任何 effectScope 中使用

5. **重复调用**：可以在同一个作用域中多次调用

```javascript
onScopeDispose(() => console.log('清理1'))
onScopeDispose(() => console.log('清理2'))
onScopeDispose(() => console.log('清理3'))
// 输出顺序: 清理1, 清理2, 清理3（与注册顺序一致）
```
