# toRefs

## 作用
`toRefs()` 将响应式对象转换为普通对象，其中每个属性都是指向原始对象相应属性的 ref。这样可以在解构响应式对象时保持响应性。

## 用法

### 基本用法

```text
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello',
  flag: true
})

// 转换为 refs 对象
const refs = toRefs(state)

console.log(refs.count.value) // 0
console.log(refs.message.value) // 'Hello'

// 修改 ref 会影响源对象
refs.count.value = 1
console.log(state.count) // 1
```

### 解构响应式对象

```text
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello',
  flag: true
})

// ✅ 使用 toRefs 解构，保持响应性
const { count, message, flag } = toRefs(state)

console.log(count.value) // 0
count.value++ // 会触发更新

// ❌ 直接解构会失去响应性
const { count: count2 } = state
count2++ // 不会触发更新
```

### 在 setup 函数中返回

```text
import { reactive, toRefs } from 'vue'

export default {
  setup() {
    const state = reactive({
      count: 0,
      message: 'Hello'
    })

    // 返回解构后的 refs
    return {
      ...toRefs(state),
      increment: () =&gt; state.count++
    }
  }
}
```

### 在组合函数中使用

```text
// useFeature.js
import { reactive, toRefs } from 'vue'

export function useFeature() {
  const state = reactive({
    count: 0,
    message: 'Hello',
    isLoading: false
  })

  function increment() {
    state.count++
  }

  function updateMessage(msg) {
    state.message = msg
  }

  // 返回解构后的 refs
  return {
    ...toRefs(state),
    increment,
    updateMessage
  }
}

// 在组件中使用
`&lt;script setup&gt;`
import { useFeature } from './useFeature'

const { count, message, isLoading, increment } = useFeature()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;{{ count }}&lt;/div&gt;
  &lt;div&gt;{{ message }}&lt;/div&gt;
  &lt;button @click="increment"&gt;{{ count }}&lt;/button&gt;
`&lt;/template&gt;`
```

### 在 `&lt;script setup&gt;` 中使用

```text
`&lt;script setup&gt;`
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello',
  user: {
    name: 'Vue',
    age: 3
  }
})

// 解构顶层属性
const { count, message, user } = toRefs(state)

// 访问嵌套属性
console.log(user.value.name) // 'Vue'
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;{{ count }} - {{ message }}&lt;/div&gt;
  &lt;div&gt;{{ user.name }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 选择性转换

```text
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello',
  flag: true,
  data: null
})

// 只转换需要的属性
const { count, message } = toRefs(state)

// flag 和 data 不会被转换
// 但仍然可以通过 state 访问
```

### TypeScript 类型支持

```text
import { reactive, toRefs } from 'vue'

interface State {
  count: number
  message: string
  flag: boolean
}

const state = reactive&lt;State&gt;({
  count: 0,
  message: 'Hello',
  flag: true
})

// 类型推导正确
const { count, message, flag } = toRefs(state)
// count: Ref&lt;number&gt;
// message: Ref&lt;string&gt;
// flag: Ref&lt;boolean&gt;
```

### 与 computed 配合

```text
import { reactive, toRefs, computed } from 'vue'

const state = reactive({
  firstName: 'Vue',
  lastName: 'JS'
})

const { firstName, lastName } = toRefs(state)

const fullName = computed(() =&gt; {
  return firstName.value + ' ' + lastName.value
})
```

### 与 watch 配合

```text
import { reactive, toRefs, watch } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

const { count, message } = toRefs(state)

watch([count, message], ([newCount, newMessage]) =&gt; {
  console.log('变化:', { newCount, newMessage })
})
```

## 注意事项

### 1. 只转换顶层属性

```text
const state = reactive({
  user: {
    name: 'Vue',
    age: 3
  }
})

const { user } = toRefs(state)

// user 是 ref，但 user.value 是普通对象
console.log(user.value.name) // 'Vue'

// 如果需要解构 user 的属性
const { name, age } = toRefs(state.user)
// ✅ 正确
```

### 2. 与直接解构的区别

```text
const state = reactive({
  count: 0,
  message: 'Hello'
})

// ❌ 直接解构失去响应性
const { count } = state
count++ // 不触发更新

// ✅ 使用 toRefs 保持响应性
const { count: countRef } = toRefs(state)
countRef.value++ // 触发更新
```

### 3. ref 需要使用 .value

```text
const { count, message } = toRefs(state)

// 在 JS 中需要 .value
console.log(count.value)
count.value++

// 在模板中自动解包
// `&lt;template&gt;`{{ count }}`&lt;/template&gt;`
```

### 4. 返回新对象

```text
const state = reactive({ count: 0 })

const refs1 = toRefs(state)
const refs2 = toRefs(state)

// refs1 !== refs2，但它们的属性指向同一个 ref
console.log(refs1.count === refs2.count) // true
```

### 5. 对 null/undefined 的处理

```text
const state = reactive({
  value: null,
  missing: undefined
})

const { value, missing } = toRefs(state)

console.log(value.value) // null
console.log(missing.value) // undefined

// 可以设置新值
value.value = 'new value'
```

### 6. 与 props 一起使用

```text
`&lt;script setup&gt;`
import { toRefs } from 'vue'

const props = defineProps({
  count: Number,
  message: String,
  disabled: Boolean
})

// 解构 props 保持响应性
const { count, message, disabled } = toRefs(props)

// 使用
const doubled = computed(() =&gt; count.value * 2)
`&lt;/script&gt;`
```

### 7. 不适用于数组

```text
const list = reactive([1, 2, 3])

// ❌ 不要对数组使用 toRefs
// const { 0: first, 1: second } = toRefs(list) // 不推荐

// ✅ 直接使用数组索引
console.log(list[0])

// 或使用特定方法
const items = toRef(list, 'value') // 如果需要
```

## 使用场景

### 1. 组合函数返回状态

```text
// useCounter.js
import { reactive, toRefs, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const state = reactive({
    count: initialValue,
    doubled: computed(() =&gt; state.count * 2)
  })

  function increment() {
    state.count++
  }

  function decrement() {
    state.count--
  }

  function reset() {
    state.count = initialValue
  }

  return {
    ...toRefs(state),
    increment,
    decrement,
    reset
  }
}

// 使用
`&lt;script setup&gt;`
import { useCounter } from './useCounter'

const { count, doubled, increment } = useCounter(10)
`&lt;/script&gt;`
```

### 2. 表单状态管理

```text
// useForm.js
import { reactive, toRefs, computed } from 'vue'

export function useForm(initialValues) {
  const state = reactive({
    values: { ...initialValues },
    errors: {},
    touched: {}
  })

  const setValue = (field, value) =&gt; {
    state.values[field] = value
    state.touched[field] = true
    validateField(field)
  }

  const validateField = (field) =&gt; {
    // 验证逻辑
    state.errors[field] = null
  }

  const isValid = computed(() =&gt; {
    return Object.keys(state.errors).every(key =&gt; !state.errors[key])
  })

  return {
    ...toRefs(state),
    setValue,
    isValid
  }
}

// 使用
`&lt;script setup&gt;`
import { useForm } from './useForm'

const { values, errors, isValid, setValue } = useForm({
  username: '',
  email: '',
  password: ''
})
`&lt;/script&gt;`
```

### 3. 加载状态管理

```text
// useAsync.js
import { reactive, toRefs } from 'vue'

export function useAsync() {
  const state = reactive({
    data: null,
    isLoading: false,
    error: null
  })

  async function execute(asyncFn) {
    state.isLoading = true
    state.error = null

    try {
      state.data = await asyncFn()
    } catch (err) {
      state.error = err
    } finally {
      state.isLoading = false
    }
  }

  return {
    ...toRefs(state),
    execute
  }
}

// 使用
`&lt;script setup&gt;`
import { useAsync } from './useAsync'

const { data, isLoading, error, execute } = useAsync()

onMounted(() =&gt; {
  execute(fetch('/api/data'))
})
`&lt;/script&gt;`
```

### 4. 分页状态

```text
// usePagination.js
import { reactive, toRefs, computed } from 'vue'

export function usePagination(totalItems, itemsPerPage = 10) {
  const state = reactive({
    currentPage: 1,
    itemsPerPage,
    totalItems
  })

  const totalPages = computed(() =&gt; {
    return Math.ceil(state.totalItems / state.itemsPerPage)
  })

  const hasNextPage = computed(() =&gt; state.currentPage &lt; totalPages.value)
  const hasPrevPage = computed(() =&gt; state.currentPage &gt; 1)

  function nextPage() {
    if (hasNextPage.value) state.currentPage++
  }

  function prevPage() {
    if (hasPrevPage.value) state.currentPage--
  }

  function goToPage(page) {
    if (page &gt;= 1 && page &lt;= totalPages.value) {
      state.currentPage = page
    }
  }

  return {
    ...toRefs(state),
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage
  }
}
```

### 5. 模态框状态

```text
// useModal.js
import { reactive, toRefs } from 'vue'

export function useModal(initialOpen = false) {
  const state = reactive({
    isOpen: initialOpen,
    title: '',
    content: null
  })

  function open(options = {}) {
    state.isOpen = true
    state.title = options.title || ''
    state.content = options.content || null
  }

  function close() {
    state.isOpen = false
    state.content = null
  }

  function toggle() {
    state.isOpen = !state.isOpen
  }

  return {
    ...toRefs(state),
    open,
    close,
    toggle
  }
}
```

### 6. 通知系统

```text
// useNotification.js
import { reactive, toRefs } from 'vue'

export function useNotification() {
  const state = reactive({
    notifications: [],
    maxNotifications: 5
  })

  function show(message, options = {}) {
    const notification = {
      id: Date.now(),
      message,
      type: options.type || 'info',
      duration: options.duration || 3000
    }

    state.notifications.push(notification)

    if (state.notifications.length &gt; state.maxNotifications) {
      state.notifications.shift()
    }

    if (notification.duration &gt; 0) {
      setTimeout(() =&gt; remove(notification.id), notification.duration)
    }
  }

  function remove(id) {
    const index = state.notifications.findIndex(n =&gt; n.id === id)
    if (index &gt; -1) {
      state.notifications.splice(index, 1)
    }
  }

  function success(message, options) {
    show(message, { ...options, type: 'success' })
  }

  function error(message, options) {
    show(message, { ...options, type: 'error' })
  }

  return {
    ...toRefs(state),
    show,
    remove,
    success,
    error
  }
}
```

### 7. 窗口大小

```text
// useWindowSize.js
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
  const state = reactive({
    width: window.innerWidth,
    height: window.innerHeight
  })

  function update() {
    state.width = window.innerWidth
    state.height = window.innerHeight
  }

  onMounted(() =&gt; {
    window.addEventListener('resize', update)
  })

  onUnmounted(() =&gt; {
    window.removeEventListener('resize', update)
  })

  // 额外的计算属性
  const isMobile = computed(() =&gt; state.width &lt; 768)
  const isTablet = computed(() =&gt; state.width &gt;= 768 && state.width &lt; 1024)
  const isDesktop = computed(() =&gt; state.width &gt;= 1024)

  return {
    ...toRefs(state),
    isMobile,
    isTablet,
    isDesktop
  }
}
```

### 8. 本地存储同步

```text
// useStorage.js
import { reactive, toRefs, watch } from 'vue'

export function useStorage(key, initialValue) {
  const stored = localStorage.getItem(key)
  const state = reactive({
    value: stored ? JSON.parse(stored) : initialValue
  })

  // 监听变化并保存
  watch(
    () =&gt; state.value,
    (newValue) =&gt; {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return {
    ...toRefs(state)
  }
}

// 使用
`&lt;script setup&gt;`
import { useStorage } from './useStorage'

const { value } = useStorage('user-preferences', {
  theme: 'light',
  language: 'zh-CN'
})
`&lt;/script&gt;`
```

### 9. 鼠标位置追踪

```text
// useMouse.js
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const state = reactive({
    x: 0,
    y: 0
  })

  function update(event) {
    state.x = event.clientX
    state.y = event.clientY
  }

  onMounted(() =&gt; {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() =&gt; {
    window.removeEventListener('mousemove', update)
  })

  return {
    ...toRefs(state)
  }
}

// 使用
`&lt;script setup&gt;`
import { useMouse } from './useMouse'

const { x, y } = useMouse()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;鼠标位置: {{ x }}, {{ y }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 10. 网络请求状态

```text
// useFetch.js
import { reactive, toRefs } from 'vue'

export function useFetch(url) {
  const state = reactive({
    data: null,
    isLoading: true,
    error: null
  })

  async function fetch() {
    state.isLoading = true
    state.error = null

    try {
      const response = await fetch(url)
      state.data = await response.json()
    } catch (err) {
      state.error = err
    } finally {
      state.isLoading = false
    }
  }

  // 自动执行
  fetch()

  return {
    ...toRefs(state),
    refresh: fetch
  }
}
```

## toRefs vs toRef

```text
const state = reactive({
  count: 0,
  message: 'Hello',
  flag: true
})

// toRefs: 转换所有属性
const allRefs = toRefs(state)
// { count: Ref, message: Ref, flag: Ref }

// toRef: 转换单个属性
const countRef = toRef(state, 'count')
// Ref&lt;number&gt;
```

## 最佳实践

1. **组合函数中使用**：在组合函数中返回状态时使用
2. **解构响应式对象**：需要解构时使用 toRefs 保持响应性
3. **保持响应性**：确保解构后的属性仍然是响应式的
4. **选择性使用**：只转换需要的属性
5. **与 computed 配合**：配合 computed 使用创建派生状态
