# toRaw

## 作用

`toRaw()` 返回由 `reactive()`、`readonly()`、`shallowReactive()` 或 `shallowReadonly()` 创建的代理所对应的**原始对象**。

这是一个"转义口"（escape hatch），可用于：
- 临时读取而不引起代理的访问/追踪开销
- 写入而不触发响应式更新
- 与第三方库交互时避免 Proxy 兼容性问题

📖 [Vue 官方文档 - toRaw](https://cn.vuejs.org/api/reactivity-advanced.html#toraw)

## 函数签名

```typescript
function toRaw<T>(proxy: T): T
```

## 基本用法

```javascript
import { reactive, toRaw } from 'vue'

const original = { count: 0 }
const proxy = reactive(original)

console.log(proxy === original)        // false（proxy 是代理对象）
console.log(toRaw(proxy) === original) // true（toRaw 返回原始对象）
```

## 使用场景

### 1. 第三方库集成

```javascript
import { reactive, toRaw } from 'vue'
import _ from 'lodash'
import Chart from 'chart.js'

const state = reactive({
  items: [],
  chartConfig: { type: 'bar', data: {} }
})

// 某些第三方库不兼容 Proxy，需要传入原始对象
const rawItems = toRaw(state.items)
_.cloneDeep(rawItems)

// Chart.js 等库也需要原始对象
const rawConfig = toRaw(state.chartConfig)
new Chart(canvas, rawConfig)
```

### 2. 性能敏感的读取

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  largeArray: Array.from({ length: 100000 }, (_, i) => ({ id: i, value: i * 2 }))
})

// 大量读取操作时，绕过 Proxy 的开销
function findItem(id) {
  const rawArray = toRaw(state.largeArray)
  // 直接在原始数组上查找，避免每次访问都触发 Proxy 的 get 拦截
  return rawArray.find(item => item.id === id)
}
```

### 3. 不触发更新的写入

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  count: 0,
  internalFlag: false
})

// 批量修改而不触发响应式更新
const raw = toRaw(state)
raw.count = 10
raw.internalFlag = true

// ⚠️ 此时视图不会更新；如需更新视图，应改为通过代理写入，
// 或整体替换对应 ref 的 .value
```

### 4. 对象引用比较

```javascript
import { reactive, toRaw } from 'vue'

const originalMap = new Map()
originalMap.set('key', { value: 1 })

const state = reactive({
  data: originalMap
})

// 比较时需要获取原始对象
const rawData = toRaw(state.data)
console.log(rawData === originalMap) // true

// 从 reactive Map 中获取的值也是代理
const item = state.data.get('key')
console.log(toRaw(item)) // { value: 1 }（原始对象）
```

### 5. 序列化和反序列化

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  user: { name: '张三', age: 25 },
  settings: { theme: 'dark', lang: 'zh-CN' }
})

// JSON 序列化时脱去 Proxy
function serializeState() {
  return JSON.stringify(toRaw(state))
}

// 深层序列化
function deepSerialize(obj) {
  const raw = toRaw(obj)
  if (raw === null || typeof raw !== 'object') return raw

  if (Array.isArray(raw)) {
    return raw.map(item => deepSerialize(item))
  }

  const result = {}
  for (const [key, value] of Object.entries(raw)) {
    result[key] = deepSerialize(value)
  }
  return result
}
```

### 6. 调试和日志

```javascript
import { reactive, toRaw, isProxy } from 'vue'

function debugReactive(label, value) {
  if (isProxy(value)) {
    console.group(`${label}（响应式代理）`)
    console.log('代理对象:', value)
    console.log('原始对象:', toRaw(value))
    console.log('是否相同:', value === toRaw(value))
    console.groupEnd()
  } else {
    console.log(`${label}:`, value)
  }
}

const state = reactive({ count: 0 })
debugReactive('state', state)
```

### 7. 组合式函数中的数据传递

```javascript
import { reactive, toRaw } from 'vue'

export function useForm(initialValues) {
  const form = reactive({ ...initialValues })

  function getFormData() {
    // 返回原始对象给 API，避免 Proxy 问题
    return toRaw(form)
  }

  function reset() {
    Object.assign(form, toRaw(initialValues))
  }

  return { form, getFormData, reset }
}
```

## 与 markRaw 的对比

```javascript
import { reactive, toRaw, markRaw } from 'vue'

// toRaw：获取原始对象，但原始对象随时可以被 reactive() 再次代理
const state = reactive({ count: 0 })
const raw = toRaw(state)
const reReactive = reactive(raw)
console.log(reReactive === state) // true（Vue 按 target 缓存代理，返回的还是同一个代理）

// markRaw：永久标记对象不可被代理
const plainObj = markRaw({ count: 0 })
const state2 = reactive({ data: plainObj })
// state2.data 不是 Proxy，永远是原始对象
```

## 注意事项

### 1. 不触发响应式更新

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({ count: 0 })

const raw = toRaw(state)
raw.count = 100 // ⚠️ 不会触发任何更新！
```

### 2. 只对 Proxy 对象有效

```javascript
import { toRaw } from 'vue'

const plain = { count: 0 }
console.log(toRaw(plain)) // { count: 0 }（原样返回，不做处理）

// ref 不适用 toRaw
const count = ref(0)
console.log(toRaw(count)) // ref 对象本身（ref 不是 Proxy）
console.log(toRaw(count.value)) // 如果值是对象，可以获取原始值
```

### 3. 每次调用返回相同引用

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({ count: 0 })
const raw1 = toRaw(state)
const raw2 = toRaw(state)

console.log(raw1 === raw2) // true（始终是同一个原始对象）
```

### 4. 深层代理的处理

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  nested: { count: 0 }
})

// toRaw 只作用于传入的对象本身，不会处理它的嵌套属性
const raw = toRaw(state)
console.log(raw.nested === state.nested) // false
// raw.nested 是原始嵌套对象，而 state.nested 是它的代理

// 需要原始的嵌套对象时，对它再取一次
const rawNested = toRaw(state.nested)
```

## 最佳实践

1. **第三方库交互**：与不支持 Proxy 的库（如某些图表库、工具库）交互时使用
2. **序列化**：JSON 序列化前脱去 Proxy，避免潜在问题
3. **避免滥用**：不要用 `toRaw` 来绕过响应式系统，优先使用正常的响应式方式
4. **调试辅助**：在调试时查看原始对象的结构
5. **不要持久化引用**：官方不建议长期保留对原始对象的引用，用完即弃，谨慎使用
