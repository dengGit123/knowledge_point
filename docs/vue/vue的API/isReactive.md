# isReactive

## 作用

`isReactive()` 检查一个对象是否是由 `reactive()` 或 `shallowReactive()` 创建的响应式代理。

> [Vue 官方文档 - isReactive](https://cn.vuejs.org/api/reactivity-utilities#isreactive)

## 函数签名

```typescript
function isReactive(value: unknown): boolean
```

## 基本用法

```javascript
import { reactive, shallowReactive, isReactive } from 'vue'

const state = reactive({ count: 0 })
const shallow = shallowReactive({ count: 0 })
const plain = { count: 0 }

console.log(isReactive(state))   // true
console.log(isReactive(shallow)) // true
console.log(isReactive(plain))   // false
```

## 嵌套对象检查

```javascript
import { reactive, isReactive } from 'vue'

const state = reactive({
  user: {
    profile: {
      name: '张三'
    }
  }
})

console.log(isReactive(state))             // true
console.log(isReactive(state.user))        // true（嵌套对象也是响应式的）
console.log(isReactive(state.user.profile)) // true（深层嵌套也是响应式的）
```

## 与其他响应式类型的区别

```javascript
import {
  reactive,
  shallowReactive,
  readonly,
  shallowReadonly,
  ref,
  isReactive,
  isReadonly,
  isRef
} from 'vue'

const reactiveObj = reactive({ count: 0 })
const shallowObj = shallowReactive({ count: 0 })
const readonlyObj = readonly({ count: 0 })
const shallowReadonlyObj = shallowReadonly({ count: 0 })
const refValue = ref(0)
const plainObj = { count: 0 }

console.log(isReactive(reactiveObj))         // true
console.log(isReactive(shallowObj))          // true
console.log(isReactive(readonlyObj))         // false
console.log(isReactive(shallowReadonlyObj))  // false
console.log(isReactive(refValue))            // false
console.log(isReactive(plainObj))            // false
```

## readonly 包裹 reactive 的情况

```javascript
import { reactive, readonly, isReactive } from 'vue'

const original = reactive({ count: 0 })
const wrapped = readonly(original)

// readonly 包裹了 reactive 对象
console.log(isReactive(wrapped)) // true
// 因为底层仍然是 reactive 对象
```

## 使用场景

### 1. 工具函数中的类型判断

```javascript
import { reactive, isReactive, toRaw } from 'vue'

function safeGetRaw(value) {
  if (isReactive(value)) {
    return toRaw(value)
  }
  return value
}

const state = reactive({ items: [1, 2, 3] })
const plain = { items: [4, 5, 6] }

console.log(safeGetRaw(state)) // { items: [1, 2, 3] }（原始对象）
console.log(safeGetRaw(plain)) // { items: [4, 5, 6] }（原样返回）
```

### 2. 第三方库集成

```javascript
import { reactive, isReactive, toRaw } from 'vue'
import _ from 'lodash'

// 深拷贝时避免 Proxy 问题
function deepClone(value) {
  const raw = isReactive(value) ? toRaw(value) : value
  return _.cloneDeep(raw)
}

const state = reactive({
  user: { name: '张三' },
  settings: { theme: 'dark' }
})

const copy = deepClone(state)
console.log(copy) // 普通对象的深拷贝
```

### 3. 调试和日志

```javascript
import { isReactive, isRef, isReadonly } from 'vue'

function logReactiveInfo(label, value) {
  const info = {
    label,
    value,
    isReactive: isReactive(value),
    isRef: isRef(value),
    isReadonly: isReadonly(value),
    type: typeof value
  }

  console.table(info)
  return info
}

// 在调试时快速了解对象状态
const state = reactive({ count: 0 })
logReactiveInfo('state', state)
```

### 4. 组合式函数参数校验

```javascript
import { reactive, isReactive } from 'vue'

export function useForm(input) {
  // 确保传入的是 reactive 对象
  const form = isReactive(input) ? input : reactive(input)

  function reset() {
    Object.keys(toRaw(form)).forEach(key => {
      form[key] = ''
    })
  }

  return { form, reset }
}
```

### 5. 序列化时过滤响应式

```javascript
import { reactive, isReactive, toRaw } from 'vue'

function serializeState(state) {
  const result = {}

  for (const [key, value] of Object.entries(state)) {
    if (isReactive(value)) {
      result[key] = toRaw(value)
    } else {
      result[key] = value
    }
  }

  return JSON.stringify(result)
}

const state = reactive({
  user: reactive({ name: '张三' }),
  token: 'abc123'
})

console.log(serializeState(state))
```

## 注意事项

### 1. 对 ref 不返回 true

```javascript
import { ref, reactive, isReactive, isRef } from 'vue'

const refObj = ref({ count: 0 })
const reactiveObj = reactive({ count: 0 })

console.log(isReactive(refObj))        // false（ref 不是 reactive）
console.log(isReactive(refObj.value))  // true（ref 内部的对象是 reactive 的）

console.log(isRef(refObj))             // true
console.log(isRef(reactiveObj))        // false
```

### 2. 对 readonly(reactive(...)) 返回 true

```javascript
import { reactive, readonly, isReactive } from 'vue'

const original = reactive({ count: 0 })
const wrapped = readonly(original)

console.log(isReactive(wrapped)) // true
// readonly 只是代理层，底层仍然是 reactive
```

### 3. 对普通 readonly 不返回 true

```javascript
import { readonly, isReactive, isReadonly } from 'vue'

const plain = readonly({ count: 0 })

console.log(isReactive(plain))  // false（不是 reactive 创建的）
console.log(isReadonly(plain))  // true
```

## 最佳实践

1. **用于类型判断**：在工具函数中检查传入参数是否为 reactive 对象
2. **配合 toRaw**：需要获取原始对象时，先用 `isReactive` 判断再调用 `toRaw`
3. **调试辅助**：在调试时快速判断对象是否被响应式包裹
4. **序列化前检查**：在 JSON 序列化前检查并转换为原始对象
5. **区分使用场景**：`isReactive`、`isRef`、`isReadonly`、`isProxy` 各有用途，按需使用
