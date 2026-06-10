# isProxy

## 作用

`isProxy()` 检查一个对象是否是由 Vue 的 `reactive()`、`readonly()`、`shallowReactive()` 或 `shallowReadonly()` 创建的代理对象。

它是 `isReactive()` 和 `isReadonly()` 的超集：只要 `isReactive()` 或 `isReadonly()` 返回 `true`，`isProxy()` 也会返回 `true`。

📖 [Vue 官方文档 - isProxy](https://cn.vuejs.org/api/reactivity-utilities#isproxy)

## 函数签名

```typescript
function isProxy(value: unknown): boolean
```

## 基本用法

```javascript
import {
  reactive,
  readonly,
  shallowReactive,
  shallowReadonly,
  isProxy
} from 'vue'

console.log(isProxy(reactive({})))          // true
console.log(isProxy(readonly({})))          // true
console.log(isProxy(shallowReactive({})))   // true
console.log(isProxy(shallowReadonly({})))   // true
console.log(isProxy({}))                    // false
console.log(isProxy(Object.freeze({})))     // false
```

## 与 isReactive / isReadonly 的关系

```javascript
import {
  reactive,
  readonly,
  ref,
  isProxy,
  isReactive,
  isReadonly
} from 'vue'

const reactiveObj = reactive({ count: 0 })
const readonlyObj = readonly({ count: 0 })
const refValue = ref(0)
const plainObj = { count: 0 }

// isProxy 是 isReactive 和 isReadonly 的超集
console.log(isProxy(reactiveObj))    // true  ← isReactive=true
console.log(isProxy(readonlyObj))    // true  ← isReadonly=true
console.log(isProxy(refValue))       // false ← ref 不是 Proxy
console.log(isProxy(plainObj))       // false

// 精确区分类型
console.log(isReactive(reactiveObj)) // true
console.log(isReadonly(readonlyObj)) // true
```

## 关系图

```
isProxy(obj) === true
├── isReactive(obj) === true
│   ├── reactive()
│   └── shallowReactive()
└── isReadonly(obj) === true
    ├── readonly()
    └── shallowReadonly()

特殊情况：
readonly(reactive({})) → isProxy=true, isReactive=true, isReadonly=true
```

## 使用场景

### 1. 工具函数中检查代理

```javascript
import { isProxy, toRaw } from 'vue'

// 安全获取原始对象
function ensureRaw(value) {
  return isProxy(value) ? toRaw(value) : value
}

// 在第三方库中使用时避免 Proxy 兼容性问题
const rawData = ensureRaw(reactiveData)
thirdPartyLib.process(rawData)
```

### 2. 第三方库集成

```javascript
import { isProxy, toRaw } from 'vue'
import _ from 'lodash'

// Lodash 某些方法可能不兼容 Proxy
function safeMerge(target, source) {
  const rawTarget = isProxy(target) ? toRaw(target) : target
  const rawSource = isProxy(source) ? toRaw(source) : source

  return _.merge(rawTarget, rawSource)
}
```

### 3. 序列化时脱代理

```javascript
import { isProxy, toRaw } from 'vue'

function deepSerialize(value) {
  // 脱去 Proxy 层
  const raw = isProxy(value) ? toRaw(value) : value

  if (raw === null || typeof raw !== 'object') {
    return raw
  }

  if (Array.isArray(raw)) {
    return raw.map(item => deepSerialize(item))
  }

  const result = {}
  for (const [key, val] of Object.entries(raw)) {
    result[key] = deepSerialize(val)
  }
  return result
}

// 用于 JSON 序列化或发送到 API
const state = reactive({
  user: reactive({ name: '张三' }),
  settings: reactive({ theme: 'dark' })
})

const serialized = JSON.stringify(deepSerialize(state))
```

### 4. 调试响应式状态

```javascript
import { isProxy, isReactive, isReadonly, isRef } from 'vue'

function diagnose(value, label = '') {
  const report = {
    label,
    valueType: value?.constructor?.name || typeof value,
    isProxy: isProxy(value),
    isReactive: isReactive(value),
    isReadonly: isReadonly(value),
    isRef: isRef(value)
  }

  if (isProxy(value)) {
    report.underlyingType = toRaw(value)?.constructor?.name
  }

  console.table(report)
  return report
}

// 调试各种响应式类型
diagnose(reactive({}), 'reactive')
diagnose(readonly({}), 'readonly')
diagnose(ref(0), 'ref')
diagnose({}, 'plain')
```

### 5. 防止重复包装

```javascript
import { reactive, isProxy } from 'vue'

function ensureReactive(value) {
  // 如果已经是代理，直接返回
  if (isProxy(value)) {
    return value
  }
  // 否则创建响应式代理
  return reactive(value)
}

const existing = reactive({ count: 0 })
const result1 = ensureReactive(existing) // 返回 existing，不重复包装
const result2 = ensureReactive({ count: 0 }) // 创建新的 reactive
```

## 注意事项

### 1. Object.freeze / Object.seal 不返回 true

```javascript
import { isProxy } from 'vue'

const frozen = Object.freeze({ count: 0 })
const sealed = Object.seal({ count: 0 })

console.log(isProxy(frozen)) // false
console.log(isProxy(sealed)) // false
// 这些是 JavaScript 原生方法，不是 Vue 的 Proxy
```

### 2. 原生 Proxy 不返回 true

```javascript
import { isProxy } from 'vue'

const nativeProxy = new Proxy({}, {
  get(target, key) {
    return target[key]
  }
})

console.log(isProxy(nativeProxy)) // false
// isProxy 只识别 Vue 创建的 Proxy，不识别原生 Proxy
```

### 3. ref 不返回 true

```javascript
import { ref, reactive, isProxy } from 'vue'

const refObj = ref({ count: 0 })
const reactiveObj = reactive({ count: 0 })

console.log(isProxy(refObj))        // false（ref 是 RefImpl 对象，不是 Proxy）
console.log(isProxy(refObj.value))  // true（ref 内部的对象会被 reactive 包装）
console.log(isProxy(reactiveObj))   // true
```

### 4. toRaw 获取原始对象

```javascript
import { reactive, isProxy, toRaw } from 'vue'

const state = reactive({ count: 0 })
const raw = toRaw(state)

console.log(isProxy(state)) // true
console.log(isProxy(raw))   // false
console.log(state === raw)  // false（一个是 Proxy，一个是原始对象）
```

## 最佳实践

1. **快速检查**：只关心"是否为 Vue 代理"时使用 `isProxy`，比同时调用 `isReactive` 和 `isReadonly` 更简洁
2. **配合 toRaw**：`isProxy` + `toRaw` 是常见组合，用于脱去代理层
3. **第三方库集成**：第三方库不兼容 Proxy 时，用 `isProxy` 检查并转换
4. **精确类型判断**：需要区分 reactive 和 readonly 时，分别使用 `isReactive` 和 `isReadonly`
5. **不要过度依赖**：大多数业务代码不需要手动检查代理类型，让 Vue 自动处理即可
