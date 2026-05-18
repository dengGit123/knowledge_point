# customRef

## 作用

`customRef()` 用于创建一个自定义的 ref，可以显式控制其依赖追踪和触发响应。

## 基本用法

```javascript
import { customRef } from 'vue'

function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track() // 追踪依赖
        return value
      },
      set(newValue) {
        value = newValue
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          trigger() // 触发更新
        }, delay)
      }
    }
  })
}
```

## 防抖 Ref

```javascript
import { customRef } from 'vue'

export function useDebouncedRef(initialValue, delay = 200) {
  let timeout
  let cachedValue = initialValue
  
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return cachedValue
      },
      set(newValue) {
        cachedValue = newValue
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          trigger()
        }, delay)
      }
    }
  })
}

// 使用
import { useDebouncedRef } from './composables'

const searchQuery = useDebouncedRef('', 300)
```

## 节流 Ref

```javascript
import { customRef } from 'vue'

export function useThrottledRef(initialValue, delay = 200) {
  let lastCall = 0
  let cachedValue = initialValue
  
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return cachedValue
      },
      set(newValue) {
        const now = Date.now()
        if (now - lastCall >= delay) {
          cachedValue = newValue
          lastCall = now
          trigger()
        }
      }
    }
  })
}
```

## 本地存储同步

```javascript
import { customRef, watch } from 'vue'

export function useStorageRef(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  const value = storedValue ? JSON.parse(storedValue) : defaultValue
  
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        localStorage.setItem(key, JSON.stringify(newValue))
        trigger()
      }
    }
  })
}

// 使用
const settings = useStorageRef('settings', { theme: 'light' })
```

## 自动重置 Ref

```javascript
import { customRef } from 'vue'

export function useAutoResetRef(initialValue, delay = 3000) {
  let timeout
  let cachedValue = initialValue
  
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return cachedValue
      },
      set(newValue) {
        cachedValue = newValue
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          cachedValue = initialValue
          trigger()
        }, delay)
        trigger()
      }
    }
  })
}

// 使用：3秒后自动重置
const message = useAutoResetRef('Hello')
```
