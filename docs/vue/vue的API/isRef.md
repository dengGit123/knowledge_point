# isRef

## 作用
`isRef()` 用于检查一个值是否是 `ref` 对象。这对于需要区分普通值和 ref 的场景很有用。

## 用法

### 基本用法

```javascript
import { ref, isRef } from 'vue'

const count = ref(0)
const message = 'Hello'

console.log(isRef(count))    // true
console.log(isRef(message))  // false
```

### 在组合函数中使用

```javascript
import { isRef } from 'vue'

export function useValue(source) {
  // 处理可能是 ref 或普通值的情况
  if (isRef(source)) {
    return source.value
  }
  return source
}

// 使用
const count = ref(0)
console.log(useValue(count)) // 0

const num = 10
console.log(useValue(num)) // 10
```

### 条件响应式处理

```javascript
import { ref, isRef, reactive } from 'vue'

function normalizeValue(value) {
  // 如果是 ref，解包
  // 如果不是，直接返回
  return isRef(value) ? value.value : value
}

const count = ref(0)
const message = 'Hello'

console.log(normalizeValue(count))    // 0
console.log(normalizeValue(message)) // 'Hello'
```

### 与 toRef 配合

```javascript
import { reactive, toRef, isRef } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// toRef 返回的是 ref
const countRef = toRef(state, 'count')

console.log(isRef(countRef))  // true
console.log(isRef(state.count)) // false
```

### 在模板中使用

```vue
<script setup>
import { ref, isRef } from 'vue'

const count = ref(0)
const message = 'Hello'

function checkType(val) {
  return isRef(val) ? 'Ref' : 'Normal'
}
</script>

<template>
  <p>count 类型: {{ checkType(count) }}</p>
  <p>message 类型: {{ checkType(message) }}</p>
</template>
```

### TypeScript 类型守卫

```typescript
import { ref, isRef, type Ref } from 'vue'

function getValue(val: number | Ref<number>): number {
  // isRef 作为类型守卫
  if (isRef(val)) {
    // val 的类型被推导为 Ref<number>
    return val.value
  }
  // val 的类型是 number
  return val
}

const count = ref(0)
const num = 10

console.log(getValue(count)) // 0
console.log(getValue(num))   // 10
```

### 检查 shallowRef

```javascript
import { shallowRef, isRef } from 'vue'

const shallow = shallowRef({ count: 0 })

console.log(isRef(shallow))         // true
console.log(isRef(shallow.value))    // false
console.log(isRef(shallow.value.count)) // false
```

### 与 computed 配合

```javascript
import { ref, computed, isRef } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

console.log(isRef(count))    // true
console.log(isRef(doubled))  // true
```

## 注意事项

### 1. 只检查 ref 对象

```javascript
import { ref, reactive, isRef } from 'vue'

const count = ref(0)
const state = reactive({ count: 0 })

console.log(isRef(count))       // true
console.log(isRef(state))      // false
console.log(isRef(state.count)) // false
```

### 2. 与其他响应式类型的区别

```javascript
import { ref, reactive, computed, isRef, isReactive, isProxy } from 'vue'

const count = ref(0)
const state = reactive({ count: 0 })
const doubled = computed(() => count.value * 2)

console.log(isRef(count))     // true
console.log(isRef(state))     // false
console.log(isRef(doubled))   // true

console.log(isReactive(count))   // false
console.log(isReactive(state))   // true
console.log(isReactive(doubled)) // true

console.log(isProxy(count))   // true
console.log(isProxy(state))   // true
console.log(isProxy(doubled)) // true
```

### 3. shallowRef 的检查

```javascript
import { shallowRef, ref, isRef } from 'vue'

const shallow = shallowRef({ count: 0 })
const normal = ref({ count: 0 })

// 都是 ref
console.log(isRef(shallow)) // true
console.log(isRef(normal))  // true

// 但行为不同
shallow.value.count++ // 不会触发更新
normal.value.count++   // 会触发更新
```

### 4. readonly ref 的检查

```javascript
import { ref, readonly, isRef, isReadonly } from 'vue'

const count = ref(0)
const readonlyCount = readonly(count)

console.log(isRef(count))          // true
console.log(isRef(readonlyCount))  // true
console.log(isReadonly(count))     // false
console.log(isReadonly(readonlyCount)) // true
```

### 5. 与 toValue 的关系

```javascript
import { ref, isRef, toValue } from 'vue'

const count = ref(0)
const num = 10

// isRef 检查是否是 ref
console.log(isRef(count)) // true
console.log(isRef(num))   // false

// toValue 获取值（自动解包）
console.log(toValue(count)) // 0
console.log(toValue(num))   // 10
```

## 使用场景

### 1. 通用组合函数

```javascript
// useValue.js
import { isRef, toValue, watch } from 'vue'

export function useValue(source, callback) {
  // 处理 ref 或普通值
  const getValue = () => isRef(source) ? source.value : source

  // 如果是 ref，监听变化
  if (isRef(source)) {
    watch(source, (newVal) => {
      callback(newVal)
    })
  }

  return {
    get value() {
      return getValue()
    }
  }
}
```

### 2. Props 处理

```javascript
// useFormValue.js
import { isRef, toRef } from 'vue'

export function useFormValue(props, key) {
  const prop = props[key]

  // 如果 prop 是 ref，直接使用
  if (isRef(prop)) {
    return prop
  }

  // 否则转换为 ref
  return toRef(props, key)
}
```

### 3. 响应式工具函数

```javascript
import { ref, isRef, unref } from 'vue'

function ensureRef(value) {
  // 确保返回一个 ref
  if (isRef(value)) {
    return value
  }
  return ref(value)
}

// 使用
const count = ref(0)
const ensured = ensureRef(count) // 返回原 ref

const num = 10
const ensuredNum = ensureRef(num) // 返回新 ref
```

### 4. 类型安全处理

```typescript
import { isRef, type Ref, type MaybeRef } from 'vue'

function processValue<T>(value: MaybeRef<T>): T {
  // MaybeRef 是 T | Ref<T>
  if (isRef(value)) {
    return value.value
  }
  return value
}

// 使用
const count = ref(0)
const num = 10

const result1 = processValue(count) // number
const result2 = processValue(num)   // number
```

### 5. 条件性包装

```javascript
import { ref, isRef, computed } from 'vue'

function makeReactive(value) {
  // 如果已经是 ref，直接返回
  if (isRef(value)) {
    return value
  }

  // 如果是函数，使用 computed
  if (typeof value === 'function') {
    return computed(value)
  }

  // 否则创建 ref
  return ref(value)
}
```

### 6. 解构时保持响应性

```javascript
import { reactive, toRef, isRef } from 'vue'

function safeDestructure(obj) {
  const result = {}

  for (const key in obj) {
    const value = obj[key]
    result[key] = isRef(value) ? value : toRef(obj, key)
  }

  return result
}

const state = reactive({
  count: 0,
  message: 'Hello'
})

const { count, message } = safeDestructure(state)
```

### 7. 插槽内容处理

```javascript
import { isRef } from 'vue'

function processSlotContent(slot) {
  const content = slot()

  return content.map(vnode => {
    // 检查 vnode 的 props 是否包含 ref
    if (vnode.props && isRef(vnode.props.ref)) {
      // 处理 ref
    }
    return vnode
  })
}
```

### 8. 事件处理器处理

```javascript
import { isRef } from 'vue'

function wrapEventHandler(handler) {
  // 如果 handler 是 ref，解包
  const fn = isRef(handler) ? handler.value : handler

  return (...args) => {
    fn(...args)
  }
}
```

### 9. 动态属性访问

```javascript
import { isRef } from 'vue'

function getPropertyValue(obj, key) {
  const value = obj[key]

  // 如果是 ref，返回 value
  if (isRef(value)) {
    return value.value
  }

  return value
}
```

### 10. 类型推断辅助

```typescript
import { isRef, type Ref } from 'vue'

function isRefOf<T>(val: unknown): val is Ref<T> {
  return isRef(val)
}

// 使用
const count = ref(0)
const num = 10

if (isRefOf<number>(count)) {
  count.value // TypeScript 知道是 number 类型
}

if (isRefOf<number>(num)) {
  // 不会进入这里，因为 num 不是 Ref<number>
}
```

## 相关 API 对比

| API | 检查内容 | 返回值 |
|-----|----------|--------|
| isRef | 是否是 ref | boolean |
| isReactive | 是否是 reactive 对象 | boolean |
| isReadonly | 是否是 readonly 对象 | boolean |
| isProxy | 是否是代理对象 | boolean |
| unref | 解包 ref（返回值） | 任意值 |
| toValue | 解包 ref 或获取 getter 值 | 任意值 |

## 最佳实践

1. **类型守卫**：在 TypeScript 中用作类型守卫
2. **通用函数**：编写处理 ref 和普通值的通用函数
3. **避免过度检查**：在确定类型的地方不需要检查
4. **与 toValue 配合**：需要解包时使用 toValue
5. **性能考虑**：isRef 是轻量级操作，可以放心使用
