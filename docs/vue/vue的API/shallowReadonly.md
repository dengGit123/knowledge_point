# shallowReadonly

## 作用

`shallowReadonly()` 创建一个浅层只读代理。只有**根级属性**是只读的（不可修改），嵌套对象仍然是可变的。

这是 `readonly()` 的浅层版本，适用于只需要保护顶层属性不被修改的场景。

> [Vue 官方文档 - shallowReadonly](https://cn.vuejs.org/api/reactivity-advanced#shallowreadonly)

## 函数签名

```typescript
function shallowReadonly<T extends object>(target: T): Readonly<T>
```

## 基本用法

```javascript
import { shallowReadonly } from 'vue'

const state = shallowReadonly({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 根级属性不可修改
state.foo = 2 // ❌ 警告：Set operation on key "foo" failed

// 嵌套对象可以修改
state.nested.bar = 3 // ✅ 可以修改，不会警告
```

## 与 readonly 的区别

```javascript
import { readonly, shallowReadonly } from 'vue'

// readonly：深层只读
const deep = readonly({
  nested: { count: 0 }
})
deep.nested.count++ // ❌ 警告：不允许修改

// shallowReadonly：浅层只读
const shallow = shallowReadonly({
  nested: { count: 0 }
})
shallow.nested.count++ // ✅ 可以修改（嵌套对象不受保护）
```

**对比表：**

| 特性 | readonly | shallowReadonly |
|------|----------|-----------------|
| 根级属性 | 只读 | 只读 |
| 嵌套对象 | 深层只读 | 可变 |
| 性能开销 | 较高（递归代理） | 较低（只代理根级） |
| 适用场景 | 完全不可变数据 | 保护配置、props |

## 使用场景

### 1. 保护组件配置

```javascript
import { shallowReadonly, reactive } from 'vue'

export function useAppConfig() {
  const config = reactive({
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    features: {
      darkMode: true,  // 这些可以内部修改
      i18n: true
    }
  })

  // 对外暴露：根级属性不可修改
  // 但 features 内部可以修改（由我们控制）
  return {
    config: shallowReadonly(config),
    updateFeatures(key, value) {
      config.features[key] = value
    }
  }
}
```

### 2. 组件 Props 的类型保护

```javascript
import { shallowReadonly } from 'vue'

export default {
  props: {
    settings: Object
  },
  setup(props) {
    // 确保不会意外修改 props 的根级属性
    const protectedSettings = shallowReadonly(props.settings)

    // protectedSettings.theme = 'dark' // ❌ 不允许
    // protectedSettings.nested.value = 'x' // ✅ 嵌套仍可修改

    return { protectedSettings }
  }
}
```

### 3. 共享状态的只读视图

```javascript
import { reactive, shallowReadonly } from 'vue'

// 全局状态
const internalState = reactive({
  user: null,
  token: null,
  preferences: {
    theme: 'light',
    lang: 'zh-CN'
  }
})

// 对外暴露只读版本
export const appState = shallowReadonly(internalState)

// 只允许通过方法修改
export function setUser(user) {
  internalState.user = user
}

export function setToken(token) {
  internalState.token = token
}

// preferences 可以由消费者直接修改（浅层只读不阻止）
export function updatePreference(key, value) {
  internalState.preferences[key] = value
}
```

### 4. API 响应缓存

```javascript
import { shallowReadonly, ref } from 'vue'

export function useApiCache() {
  const cache = ref({})

  function setCache(key, data) {
    cache.value[key] = data
  }

  function getCache(key) {
    // 返回只读版本，防止调用方修改缓存
    return shallowReadonly(cache.value[key])
  }

  return { setCache, getCache }
}
```

### 5. 插件配置

```javascript
import { shallowReadonly, reactive } from 'vue'

export function createPlugin(defaultOptions) {
  const options = reactive({ ...defaultOptions })

  return {
    install(app) {
      // 暴露只读配置给用户
      app.provide('pluginOptions', shallowReadonly(options))

      // 内部方法可以修改配置
      app.provide('updatePluginOption', (key, value) => {
        options[key] = value
      })
    }
  }
}
```

### 6. 表单初始值快照

```javascript
import { shallowReadonly, reactive } from 'vue'

export function useForm(initialValues) {
  const form = reactive({ ...initialValues })

  // 保存初始值快照（根级不可修改）
  const snapshot = shallowReadonly({ ...initialValues })

  function reset() {
    Object.assign(form, snapshot)
  }

  function changed() {
    return Object.keys(form).some(key => form[key] !== snapshot[key])
  }

  return { form, snapshot, reset, changed }
}
```

## 注意事项

### 1. 嵌套对象不受保护

```javascript
import { shallowReadonly } from 'vue'

const state = shallowReadonly({
  config: { theme: 'light' }
})

state.config.theme = 'dark' // ✅ 可以修改
// 如果需要完全保护，使用 readonly
```

### 2. 不会递归代理

```javascript
import { shallowReadonly, isReadonly } from 'vue'

const state = shallowReadonly({
  nested: { count: 0 }
})

console.log(isReadonly(state))        // true
console.log(isReadonly(state.nested)) // false
// 嵌套对象不是 readonly 的
```

### 3. 开发环境警告

```javascript
import { shallowReadonly } from 'vue'

const state = shallowReadonly({ count: 0 })

// 在开发环境下，修改根级属性会在控制台输出警告
state.count = 1 // ⚠️ [Vue warn]: Set operation on key "count" failed
// 生产环境不会有警告，但修改仍然无效
```

### 4. 与 reactive 配合

```javascript
import { reactive, shallowReadonly, isReactive, isReadonly } from 'vue'

const original = reactive({ count: 0 })
const readonlyView = shallowReadonly(original)

console.log(isReactive(readonlyView)) // true（底层是 reactive）
console.log(isReadonly(readonlyView)) // true（被 readonly 包裹）
```

## 最佳实践

1. **保护顶层配置**：将配置对象的根级属性设为只读，防止外部意外修改
2. **对外只读 API**：暴露 `shallowReadonly` 版本给消费者，内部保留可变引用
3. **配合 reactive 使用**：内部维护 `reactive` 数据，对外暴露 `shallowReadonly` 视图
4. **注意嵌套可变性**：如果嵌套数据也需要保护，使用 `readonly()` 而非 `shallowReadonly()`
5. **Props 保护**：Vue 的 `props` 默认就是 readonly 的，通常不需要手动使用 `shallowReadonly`
