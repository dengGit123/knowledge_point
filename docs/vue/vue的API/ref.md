# ref

## 作用
`ref()` 是 Vue 3 组合式 API 中用于创建响应式数据的基本方法。它接受一个内部值并返回一个响应式的、可变的 ref 对象，该对象只有一个指向其内部值的属性 `.value`。

## 用法

### 基本用法

```javascript
import { ref } from 'vue'

// 创建响应式数据
const count = ref(0)

// 访问和修改值（在 JS 中需要 .value）
console.log(count.value) // 0
count.value = 1

// 在模板中自动解包，无需 .value
// <template>{{ count }}</template>
```

### 不同数据类型

```javascript
// 基本类型
const message = ref('Hello')
const isActive = ref(true)
const price = ref(99.9)

// 对象类型
const user = ref({
  name: 'Vue',
  age: 3
})

// 数组类型
const items = ref([1, 2, 3])

// 修改对象/数组
user.value.name = 'Vue3'
items.value.push(4)
```

### 在 setup 中使用

```javascript
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    return {
      count,
      increment
    }
  }
}
```

### 在 <script setup> 中使用

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### DOM 元素引用

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  inputRef.value.focus()
})
</script>

<template>
  <input ref="inputRef" />
</template>
```

### 组件引用

```vue
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const child = ref(null)

function callChildMethod() {
  child.value.someMethod()
}
</script>

<template>
  <ChildComponent ref="child" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>
```

## 注意事项

### 1. .value 的使用

```javascript
// ✅ 正确：在 JS 中需要 .value
const count = ref(0)
count.value++

// ❌ 错误：忘记 .value
count++ // count 不会改变

// ✅ 正确：模板中自动解包
// <template>{{ count }}</template>
```

### 2. 嵌套响应式对象

```javascript
const state = ref({
  count: 0
})

// ✅ 正确：.value 是响应式的
state.value.count++

// ❌ 错误：直接替换整个对象会丢失响应性
state.value = { count: 1 } // 不推荐，需要特殊处理
```

### 3. 解构会丢失响应性

```javascript
const state = ref({ count: 0 })

// ❌ 错误：解构会丢失响应性
const { count } = state.value
count++ // 不会触发更新

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state.value)
```

### 4. ref 在 reactive 对象中自动解包

```javascript
import { ref, reactive } from 'vue'

const count = ref(0)
const state = reactive({ count })

// ✅ 自动解包，可以直接访问
state.count++
console.log(count.value) // 1

// ⚠️ 但新的 ref 不会自动解包
const newCount = ref(1)
state.newCount = newCount
state.newCount++ // ❌ 不会更新 newCount.value
```

### 5. 异步操作

```javascript
const data = ref(null)

// ✅ 在异步操作中正确使用
async function fetchData() {
  data.value = await api.getData()
}

// ❌ 错误：直接赋值 ref 对象
// data.value = promise // 不会自动解包
```

### 6. TypeScript 类型支持

```typescript
// 自动推导类型
const count = ref(0) // Ref<number>

// 显式指定类型
const count = Ref<number>(0)
const user = Ref<User>({ name: 'Vue' })

// 可能为 null 的 ref
const inputRef = ref<HTMLInputElement | null>(null)
```

## 使用场景

### 1. 定义基本类型的响应式数据

```javascript
const count = ref(0)
const message = ref('Hello')
const isLoading = ref(false)
```

### 2. 定义单一值的响应式状态

```javascript
// 适用于简单的计数器、开关等
const isActive = ref(false)
const counter = ref(0)

function toggle() {
  isActive.value = !isActive.value
}
```

### 3. 与 computed 配合使用

```javascript
const count = ref(0)
const doubled = computed(() => count.value * 2)
```

### 4. 模板中的动态绑定

```vue
<script setup>
const title = ref('动态标题')
const disabled = ref(false)
</script>

<template>
  <h1>{{ title }}</h1>
  <button :disabled="disabled">按钮</button>
</template>
```

### 5. 表单数据绑定

```vue
<script setup>
const username = ref('')
const password = ref('')
const agree = ref(false)
const gender = ref('male')
const hobbies = ref([])
</script>

<template>
  <input v-model="username" />
  <input v-model="password" type="password" />
  <input v-model="agree" type="checkbox" />
  <input v-model="gender" type="radio" value="male" />
  <select v-model="hobbies" multiple>
    <option value="reading">阅读</option>
    <option value="coding">编程</option>
  </select>
</template>
```

### 6. 列表渲染

```vue
<script setup>
const items = ref([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' }
])

function addItem(text) {
  items.value.push({ id: Date.now(), text })
}
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </ul>
</template>
```

### 7. 条件渲染控制

```vue
<script setup>
const showDetails = ref(false)
const currentTab = ref('home')
</script>

<template>
  <button @click="showDetails = !showDetails">切换详情</button>
  <div v-if="showDetails">详情内容</div>

  <button @click="currentTab = 'about'">关于</button>
  <component :is="currentTab" />
</template>
```

### 8. DOM 元素引用

```vue
<script setup>
const canvasRef = ref(null)

onMounted(() => {
  const ctx = canvasRef.value.getContext('2d')
  // 使用 canvas 上下文
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

### 9. 组件通信（父调子）

```vue
<!-- 父组件 -->
<script setup>
import ChildComponent from './ChildComponent.vue'
const childRef = ref(null)

function validateChild() {
  childRef.value.validate()
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="validateChild">验证子组件</button>
</template>
```

### 10. 性能优化（与 shallowRef 配合）

```javascript
// 对于大型数据，使用 shallowRef
const bigData = shallowRef({ /* 大量数据 */ })

// 需要更新时整体替换
bigData.value = { /* 新数据 */ }
```

## ref vs reactive 选择建议

| 使用 ref | 使用 reactive |
|---------|--------------|
| 基本类型值 | 对象和数组 |
| 需要替换整个值 | 需要保持对象引用 |
| 单一值状态 | 多个相关属性的状态 |
| 表单输入值 | 复杂的嵌套状态 |
| DOM/组件引用 | 需要解构多个响应式属性时 |

## 最佳实践

1. **命名约定**：通常使用 `xxxRef` 后缀表示 ref 对象（DOM 引用时）
2. **默认使用 ref**：对于简单场景，ref 更直观
3. **类型明确**：在 TypeScript 中显式指定类型
4. **避免过度嵌套**：深层嵌套考虑使用 reactive
5. **组合使用**：ref 和 reactive 可以互相配合使用
