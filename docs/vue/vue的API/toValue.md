# toValue

Vue 3.3+ 新增的 API，用于将值、getter 或 ref 标准化为值。

## 语法

```javascript
import { toValue } from 'vue'

const value = toValue(source)
```

## 参数

- `source`: 可以是普通值、ref、reactive 对象、getter 函数或返回上述类型的函数

## 返回值

返回标准化的值（非响应式）

## 基础用法

```javascript
import { toValue, ref } from 'vue'

// 普通值
console.log(toValue(1)) // 1
console.log(toValue('hello')) // 'hello'

// ref
const count = ref(0)
console.log(toValue(count)) // 0

// getter 函数
const getter = () => 42
console.log(toValue(getter)) // 42

// 函数返回 ref
const fn = () => ref(100)
console.log(toValue(fn)) // 100
```

## 与 unref 的区别

```javascript
import { toValue, unref, ref } from 'vue'

// unref 只处理 ref
const count = ref(1)
console.log(unref(count)) // 1
console.log(unref(() => 2)) // () => 2 (函数原样返回)

// toValue 处理 ref 和 getter
console.log(toValue(count)) // 1
console.log(toValue(() => 2)) // 2 (getter 被调用)
```

## 在计算属性中使用

```vue
<script setup>
import { toValue, ref, computed } from 'vue'

const count = ref(0)
const double = () => count.value * 2

// 使用 toValue 简化计算
const result = computed(() => {
  return toValue(double) + 10
})
</script>
```

## 动态参数处理

```vue
<script setup>
import { toValue, ref, computed } from 'vue'

// 接受可能是值、ref 或 getter 的参数
function useDouble(source) {
  return computed(() => toValue(source) * 2)
}

// 多种用法都可以
const count = ref(5)
const getter = () => 10

const doubled1 = useDouble(count) // 10
const doubled2 = useDouble(5) // 10
const doubled3 = useDouble(getter) // 20
</script>
```

## 工具函数示例

```javascript
// 接受多种类型的工具函数
function formatSource(source) {
  const value = toValue(source)
  return value.toFixed(2)
}

// 使用方式
formatSource(3.14159) // "3.14"
formatSource(ref(2.718)) // "2.72"
formatSource(() => 1.414) // "1.41"
```

## 可组合函数中使用

```javascript
import { toValue, ref, watch } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  async function fetchData() {
    // url 可以是 ref、getter 或字符串
    const resolvedUrl = toValue(url)

    try {
      const response = await fetch(resolvedUrl)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    }
  }

  // 如果 url 是响应式的，监听变化
  if (typeof url === 'function' || '__v_ref' in url) {
    watch(() => toValue(url), fetchData)
  }

  fetchData()

  return { data, error, refresh: fetchData }
}

// 使用
const staticUrl = '/api/users'
const dynamicUrl = ref('/api/posts')
const getUrl = () => '/api/comments'

useFetch(staticUrl)
useFetch(dynamicUrl)
useFetch(getUrl)
```

## 动态类名绑定

```vue
<template>
  <div :class="normalizedClasses">内容</div>
</template>

<script setup>
import { toValue, ref, computed } from 'vue'

const isActive = ref(true)
const getClass = () => 'dynamic-class'

// 可以接受多种类型
const classes = computed(() => {
  return toValue(isActive) ? 'active' : 'inactive'
})

function normalizeClass(value) {
  return toValue(value)?.split(' ') || []
}

const normalizedClasses = computed(() => {
  const baseClass = 'container'
  const activeClass = toValue(isActive) ? 'active' : ''
  const dynamicClass = toValue(getClass)

  return [baseClass, activeClass, dynamicClass].filter(Boolean)
})
</script>
```

## 条件渲染

```vue
<template>
  <div v-if="shouldShow">显示内容</div>
</template>

<script setup>
import { toValue, ref } from 'vue'

const show = ref(true)
const condition = () => true

function useShow(source) {
  return toValue(source)
}

const shouldShow = useShow(show)
// 或
const shouldShow2 = useShow(condition)
// 或
const shouldShow3 = useShow(true)
</script>
```

## 表单验证

```vue
<script setup>
import { toValue, ref, computed } from 'vue'

// 验证规则可以是值、ref 或 getter
const minLength = ref(5)
const getMaxLength = () => 20

function validateLength(value, min, max) {
  const len = value.length
  const minVal = toValue(min)
  const maxVal = toValue(max)

  return len >= minVal && len <= maxVal
}

const isValid = computed(() => {
  return validateLength('hello world', minLength, getMaxLength)
})
</script>
```

## 动态样式

```vue
<template>
  <div :style="normalizedStyle">样式</div>
</template>

<script setup>
import { toValue, ref, computed } from 'vue'

const color = ref('red')
const getSize = () => '16px'

function normalizeStyle(style) {
  return toValue(style) || {}
}

const normalizedStyle = computed(() => ({
  color: toValue(color),
  fontSize: toValue(getSize)
}))
</script>
```

## 侦听器中使用

```vue
<script setup>
import { toValue, ref, watch } from 'vue'

const source = ref('hello')
const getSource = () => 'world'

// watchEffect 自动解包，但 watch 需要手动处理
watch(
  () => toValue(source),
  (newVal) => {
    console.log('新值:', newVal)
  }
)

// 也可以接受 getter
watch(
  () => toValue(getSource),
  (newVal) => {
    console.log('新值:', newVal)
  }
)
</script>
```

## 注意事项

1. **Vue 3.3+ 专有**：此 API 仅在 Vue 3.3 及更高版本中可用

2. **非响应式**：返回的是普通值，不是响应式引用

3. **调用 getter**：如果参数是函数，会调用它获取值

4. **与 unref 的区别**：
   - `unref(ref)` → 返回 ref 的值
   - `unref(() => value)` → 返回函数本身
   - `toValue(ref)` → 返回 ref 的值
   - `toValue(() => value)` → 调用函数并返回结果

5. **适用场景**：当你需要处理可能是值、ref 或 getter 的参数时非常有用
