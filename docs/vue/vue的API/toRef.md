# toRef

## 作用
`toRef()` 可以将响应式对象中的某个属性转换为一个独立的 ref。这个 ref 会与源属性保持同步：修改源属性会影响 ref，修改 ref 也会影响源属性。

## 用法

### 基本用法

```text
import { reactive, toRef } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// 将 state.count 转换为 ref
const countRef = toRef(state, 'count')

console.log(countRef.value) // 0

// 修改 ref 会影响源对象
countRef.value = 1
console.log(state.count) // 1

// 修改源对象也会影响 ref
state.count = 2
console.log(countRef.value) // 2
```

### 在组合函数中使用

```text
// useFeature.js
import { toRef } from 'vue'

export function useFeature(state) {
  // 将特定属性转为 ref
  const count = toRef(state, 'count')
  const message = toRef(state, 'message')

  function increment() {
    count.value++
  }

  return {
    count,
    message,
    increment
  }
}
```

### 传递 props 的单个属性

```text
`&lt;script setup&gt;`
import { toRef } from 'vue'

const props = defineProps({
  count: Number,
  message: String
})

// 将 props 的属性转为 ref
const countRef = toRef(props, 'count')

// 可以在组合函数中使用
const doubled = computed(() =&gt; countRef.value * 2)
`&lt;/script&gt;`
```

### 与 computed 配合

```text
import { reactive, toRef, computed } from 'vue'

const state = reactive({
  firstName: 'Vue',
  lastName: 'JS'
})

// 将属性转为 ref
const firstName = toRef(state, 'firstName')
const lastName = toRef(state, 'lastName')

// 创建计算属性
const fullName = computed(() =&gt; {
  return firstName.value + ' ' + lastName.value
})
```

### 解构响应式对象

```text
import { reactive, toRef } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello',
  flag: true
})

// 使用 toRef 解构，保持响应性
const count = toRef(state, 'count')
const message = toRef(state, 'message')
const flag = toRef(state, 'flag')

// 可以单独使用
count.value++
console.log(message.value)
```

### 在函数式组件中使用

```text
`&lt;script setup&gt;`
import { toRef } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// 将 props.user.name 转换为 ref
const userName = toRef(() =&gt; props.user.name)

// 或者直接使用 props 的属性
const userRef = toRef(props, 'user')
`&lt;/script&gt;`
```

### TypeScript 类型支持

```text
import { reactive, toRef } from 'vue'

interface State {
  count: number
  message: string
}

const state = reactive&lt;State&gt;({
  count: 0,
  message: 'Hello'
})

// 类型推导正确
const countRef = toRef(state, 'count') // ToRef&lt;number&gt;
```

## 注意事项

### 1. 与解构的区别

```text
const state = reactive({
  count: 0,
  message: 'Hello'
})

// ❌ 直接解构会失去响应性
const { count } = state
count++ // 不会触发更新

// ✅ 使用 toRef 保持响应性
const countRef = toRef(state, 'count')
countRef.value++ // 会触发更新
```

### 2. 与 toRefs 的区别

```text
const state = reactive({
  count: 0,
  message: 'Hello',
  flag: true
})

// toRef: 转换单个属性
const count = toRef(state, 'count')

// toRefs: 转换所有属性
const { count, message, flag } = toRefs(state)
```

### 3. 不存在的属性

```text
const state = reactive({
  count: 0
})

// ⚠️ 访问不存在的属性返回 undefined 的 ref
const missing = toRef(state, 'missing')
console.log(missing.value) // undefined

// 可以设置值
missing.value = 'new value'
// state.missing = 'new value' - 会添加到源对象
```

### 4. 与 ref 的区别

```text
const state = reactive({
  count: 0
})

// toRef: 与源对象保持同步
const countRef = toRef(state, 'count')

// ref: 创建新的独立 ref
const countRef2 = ref(state.count)

// 修改 countRef 会影响 state.count
// 修改 countRef2 不会影响 state.count
```

### 5. 嵌套属性

```text
const state = reactive({
  user: {
    name: 'Vue',
    age: 3
  }
})

// ✅ 可以访问嵌套属性
const userName = toRef(() =&gt; state.user.name)

// 或者直接引用
const user = toRef(state, 'user')
console.log(user.value.name)
```

### 6. 在模板中的使用

```text
`&lt;script setup&gt;`
import { reactive, toRef } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

const count = toRef(state, 'count')
const message = toRef(state, 'message')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 自动解包 --&gt;
  &lt;div&gt;{{ count }}&lt;/div&gt;
  &lt;div&gt;{{ message }}&lt;/div&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 在组合函数中传递响应式属性

```text
// useCounter.js
import { toRef, computed } from 'vue'

export function useCounter(state) {
  // 将特定属性转为 ref
  const count = toRef(state, 'count')

  const doubled = computed(() =&gt; count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return {
    count,
    doubled,
    increment,
    decrement
  }
}

// 在组件中使用
`&lt;script setup&gt;`
import { reactive } from 'vue'
import { useCounter } from './useCounter'

const state = reactive({
  count: 0
})

const { count, doubled, increment, decrement } = useCounter(state)
`&lt;/script&gt;`
```

### 2. 传递 props 的属性

```text
`&lt;script setup&gt;`
import { toRef, computed } from 'vue'

const props = defineProps({
  modelValue: String,
  disabled: Boolean
})

// 将 props 属性转为 ref
const modelValue = toRef(props, 'modelValue')
const disabled = toRef(props, 'disabled')

// 在组合函数中使用
const isValid = computed(() =&gt; {
  return modelValue.value && modelValue.value.length &gt; 0
})
`&lt;/script&gt;`
```

### 3. 部分共享状态

```text
// store.js
import { reactive } from 'vue'

const store = reactive({
  user: null,
  isLoading: false,
  error: null
})

// 在特定模块中只关注部分状态
export function useUserStore() {
  return {
    user: toRef(store, 'user')
  }
}

export function useLoadingState() {
  return {
    isLoading: toRef(store, 'isLoading'),
    error: toRef(store, 'error')
  }
}
```

### 4. 表单字段处理

```text
`&lt;script setup&gt;`
import { reactive, toRef } from 'vue'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

// 为每个字段创建 ref
const username = toRef(form, 'username')
const email = toRef(form, 'email')
const password = toRef(form, 'password')

// 验证单个字段
const usernameError = computed(() =&gt; {
  if (username.value.length &lt; 3) {
    return '用户名至少3个字符'
  }
  return ''
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form&gt;
    &lt;input v-model="username" /&gt;
    &lt;span v-if="usernameError"&gt;{{ usernameError }}&lt;/span&gt;

    &lt;input v-model="email" /&gt;
    &lt;input v-model="password" /&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 5. 可重用的逻辑提取

```text
// useValidation.js
import { toRef, computed } from 'vue'

export function useValidation(state, field, rules) {
  const fieldValue = toRef(state, field)

  const error = computed(() =&gt; {
    for (const rule of rules) {
      const result = rule(fieldValue.value)
      if (result) return result
    }
    return ''
  })

  const isValid = computed(() =&gt; !error.value)

  return {
    error,
    isValid,
    value: fieldValue
  }
}

// 使用
`&lt;script setup&gt;`
import { reactive } from 'vue'
import { useValidation } from './useValidation'

const form = reactive({
  username: '',
  email: ''
})

const usernameValidation = useValidation(form, 'username', [
  (v) =&gt; v.length &lt; 3 && '用户名至少3个字符',
  (v) =&gt; !v && '用户名不能为空'
])
`&lt;/script&gt;`
```

### 6. 条件响应式

```text
import { reactive, toRef, computed } from 'vue'

const state = reactive({
  condition: true,
  value: 'initial'
})

const condition = toRef(state, 'condition')

// 根据条件决定是否响应
const displayValue = computed(() =&gt; {
  return condition.value ? state.value : 'hidden'
})
```

### 7. 与 v-model 的配合

```text
`&lt;script setup&gt;`
import { reactive, toRef } from 'vue'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

// 将 props.modelValue 转为 ref
const modelValue = toRef(props, 'modelValue')

// 自定义 v-model 处理
function updateValue(value) {
  emit('update:modelValue', value)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="modelValue"
    @input="updateValue($event.target.value)"
  /&gt;
`&lt;/template&gt;`
```

### 8. 状态切片

```text
// 大型状态对象
const appState = reactive({
  user: { name: 'Vue', age: 3 },
  settings: { theme: 'light', language: 'zh' },
  ui: { sidebarOpen: true, loading: false },
  data: { items: [], selected: null }
})

// 为不同模块创建状态切片
export function useUserState() {
  return {
    user: toRef(appState, 'user')
  }
}

export function useSettings() {
  return {
    theme: toRef(() =&gt; appState.settings.theme),
    language: toRef(() =&gt; appState.settings.language)
  }
}
```

### 9. 响应式属性别名

```text
const state = reactive({
  firstName: 'Vue',
  lastName: 'JS'
})

// 创建别名
const fname = toRef(state, 'firstName')
const lname = toRef(state, 'lastName')

console.log(fname.value) // 'Vue'
fname.value = 'React'
console.log(state.firstName) // 'React'
```

### 10. 与第三方库集成

```text
`&lt;script setup&gt;`
import { reactive, toRef, watchEffect } from 'vue'
import { useMotion } from '@vueuse/motion'

const state = reactive({
  x: 0,
  y: 0,
  rotation: 0
})

// 提取特定属性传递给第三方库
const { motion } = useMotion({
  x: toRef(state, 'x'),
  y: toRef(state, 'y'),
  rotate: toRef(state, 'rotation')
})
`&lt;/script&gt;`
```

## API 签名

```text
// 对象属性版本
function toRef&lt;T extends object, K extends keyof T&gt;(
  object: T,
  key: K
): ToRef&lt;T[K]&gt;

// getter 版本
function toRef&lt;T&gt;(
  getter: () =&gt; T
): Readonly&lt;Ref&lt;T&gt;&gt;

// 类型别名
type ToRef&lt;T&gt; = T extends Ref ? T : Ref&lt;NonNullable&lt;T&gt;&gt;
```

## toRef vs 其他响应式 API

| API | 用途 | 是否保持同步 |
|-----|------|-------------|
| toRef | 转换单个属性为 ref | 是，与源对象同步 |
| toRefs | 转换所有属性为 refs | 是，与源对象同步 |
| ref | 创建新的独立 ref | 否，独立状态 |
| computed | 创建计算属性 | 否，派生状态 |

## 最佳实践

1. **需要保持同步时使用**：需要与源对象保持同步时使用 toRef
2. **传递单个属性时使用**：向组合函数传递单个属性时
3. **解构时使用**：解构响应式对象时使用 toRef 保持响应性
4. **props 处理**：处理 props 单个属性时使用
5. **考虑 toRefs**：需要多个属性时考虑使用 toRefs
