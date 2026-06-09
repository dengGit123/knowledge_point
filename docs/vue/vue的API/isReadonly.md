# isReadonly

## 作用

`isReadonly()` 检查一个对象是否是由 `readonly()` 或 `shallowReadonly()` 创建的只读代理。

> [Vue 官方文档 - isReadonly](https://cn.vuejs.org/api/reactivity-utilities#isreadonly)

## 函数签名

```typescript
function isReadonly(value: unknown): boolean
```

## 基本用法

```javascript
import { readonly, shallowReadonly, isReadonly } from 'vue'

const state = readonly({ count: 0 })
const shallow = shallowReadonly({ count: 0 })
const plain = { count: 0 }

console.log(isReadonly(state))   // true
console.log(isReadonly(shallow)) // true
console.log(isReadonly(plain))   // false
```

## 与其他响应式类型的区别

```javascript
import {
  reactive,
  readonly,
  shallowReadonly,
  ref,
  isReadonly,
  isReactive,
  isRef
} from 'vue'

const reactiveObj = reactive({ count: 0 })
const readonlyObj = readonly({ count: 0 })
const shallowReadonlyObj = shallowReadonly({ count: 0 })
const refValue = ref(0)
const plainObj = { count: 0 }

console.log(isReadonly(reactiveObj))         // false
console.log(isReadonly(readonlyObj))         // true
console.log(isReadonly(shallowReadonlyObj))  // true
console.log(isReadonly(refValue))            // false
console.log(isReadonly(plainObj))            // false
```

## 嵌套对象检查

```javascript
import { readonly, isReadonly } from 'vue'

const state = readonly({
  user: {
    profile: {
      name: '张三'
    }
  }
})

console.log(isReadonly(state))             // true
console.log(isReadonly(state.user))        // true（深层对象也是只读的）
console.log(isReadonly(state.user.profile)) // true
```

## readonly 包裹 reactive 的情况

```javascript
import { reactive, readonly, isReadonly, isReactive } from 'vue'

const original = reactive({ count: 0 })
const wrapped = readonly(original)

// 同时具有 readonly 和 reactive 特性
console.log(isReadonly(wrapped))  // true
console.log(isReactive(wrapped))  // true（底层是 reactive）
```

## 使用场景

### 1. 保护 props 不被修改

```vue
<script setup>
import { isReadonly, readonly } from 'vue'

const props = defineProps({
  data: Object
})

// 在子组件中检查 props 是否只读
if (isReadonly(props)) {
  console.log('props 是只读的，不应被修改')
}
</script>
```

### 2. 组合式函数中保护配置

```javascript
import { readonly, isReadonly, reactive } from 'vue'

export function useConfig(config) {
  const defaultConfig = {
    theme: 'light',
    lang: 'zh-CN',
    pageSize: 10
  }

  const merged = reactive({ ...defaultConfig, ...config })

  // 对外暴露只读版本
  return {
    config: readonly(merged),
    updateConfig(key, value) {
      merged[key] = value
    }
  }
}

// 使用方
const { config, updateConfig } = useConfig({ theme: 'dark' })

console.log(isReadonly(config)) // true
updateConfig('theme', 'light')  // 通过方法修改
```

### 3. 防止误修改数据

```javascript
import { readonly, isReadonly, watch } from 'vue'

export function createStore(initialState) {
  const state = reactive({ ...initialState })

  // 开发环境下检查是否尝试修改只读数据
  const readonlyState = readonly(state)

  if (import.meta.env.DEV) {
    watch(
      () => readonlyState,
      () => {
        console.warn('只读状态不应被修改')
      },
      { deep: true }
    )
  }

  return {
    state: readonlyState,
    commit(key, value) {
      state[key] = value
    }
  }
}
```

### 4. 调试工具

```javascript
import {
  isReadonly,
  isReactive,
  isRef,
  isProxy,
  toRaw
} from 'vue'

function inspectReactivity(value, label = '') {
  const info = {
    label,
    isReadonly: isReadonly(value),
    isReactive: isReactive(value),
    isRef: isRef(value),
    isProxy: isProxy(value),
    rawType: toRaw(value)?.constructor?.name || typeof value
  }

  console.table(info)
  return info
}

// 调试各种响应式类型
inspectReactivity(readonly({ count: 0 }), 'readonly')
inspectReactivity(reactive({ count: 0 }), 'reactive')
inspectReactivity(ref(0), 'ref')
```

### 5. 库的 API 设计

```javascript
import { readonly, isReadonly, reactive } from 'vue'

export class Store {
  #state

  constructor(initialState) {
    this.#state = reactive(initialState)
  }

  // 对外暴露只读状态
  getState() {
    return readonly(this.#state)
  }

  // 只允许通过 mutation 修改
  commit(mutation, payload) {
    mutation(this.#state, payload)
  }
}

// 使用
const store = new Store({ count: 0 })
const state = store.getState()

console.log(isReadonly(state)) // true
store.commit((state, { delta }) => {
  state.count += delta
}, { delta: 1 })
```

## 注意事项

### 1. 对 reactive 不返回 true

```javascript
import { reactive, readonly, isReadonly } from 'vue'

const reactiveObj = reactive({ count: 0 })
const readonlyObj = readonly({ count: 0 })

console.log(isReadonly(reactiveObj)) // false
console.log(isReadonly(readonlyObj)) // true
```

### 2. Object.freeze 不返回 true

```javascript
import { isReadonly } from 'vue'

const frozen = Object.freeze({ count: 0 })

console.log(isReadonly(frozen)) // false
// Object.freeze 不是 Vue 的 readonly，isReadonly 只识别 Vue 的代理
```

### 3. shallowReadonly 的嵌套对象

```javascript
import { shallowReadonly, isReadonly } from 'vue'

const state = shallowReadonly({
  nested: { count: 0 }
})

console.log(isReadonly(state))        // true
console.log(isReadonly(state.nested)) // false
// shallowReadonly 只保护根层级，嵌套对象不是 readonly
```

## 最佳实践

1. **检查 props**：Vue 的 `props` 默认是 readonly 的，可在工具函数中验证
2. **API 设计**：对外暴露 readonly 版本，内部维护可变版本
3. **配合 isReactive**：两者结合使用可以精确判断对象类型
4. **开发环境校验**：在开发环境使用 `isReadonly` 检查数据是否被意外修改
5. **不替代 TypeScript**：`isReadonly` 是运行时检查，TypeScript 的 `Readonly<T>` 是编译时检查，两者互补
