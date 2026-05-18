# ref

## 作用
`ref()` 是 Vue 3 组合式 API 中用于创建响应式数据的基本方法。它接受一个内部值并返回一个响应式的、可变的 ref 对象，该对象只有一个指向其内部值的属性 `.value`。

## 用法

### 基本用法

```text
import { ref } from 'vue'

// 创建响应式数据
const count = ref(0)

// 访问和修改值（在 JS 中需要 .value）
console.log(count.value) // 0
count.value = 1

// 在模板中自动解包，无需 .value
// `&lt;template&gt;`{{ count }}`&lt;/template&gt;`
```

### 不同数据类型

```text
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

```text
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

### 在 `&lt;script setup&gt;` 中使用

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="increment"&gt;{{ count }}&lt;/button&gt;
`&lt;/template&gt;`
```

### DOM 元素引用

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() =&gt; {
  inputRef.value.focus()
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input ref="inputRef" /&gt;
`&lt;/template&gt;`
```

### 组件引用

```text
`&lt;script setup&gt;`
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const child = ref(null)

function callChildMethod() {
  child.value.someMethod()
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ChildComponent ref="child" /&gt;
  &lt;button @click="callChildMethod"&gt;调用子组件方法&lt;/button&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. .value 的使用

```text
// ✅ 正确：在 JS 中需要 .value
const count = ref(0)
count.value++

// ❌ 错误：忘记 .value
count++ // count 不会改变

// ✅ 正确：模板中自动解包
// `&lt;template&gt;`{{ count }}`&lt;/template&gt;`
```

### 2. 嵌套响应式对象

```text
const state = ref({
  count: 0
})

// ✅ 正确：.value 是响应式的
state.value.count++

// ❌ 错误：直接替换整个对象会丢失响应性
state.value = { count: 1 } // 不推荐，需要特殊处理
```

### 3. 解构会丢失响应性

```text
const state = ref({ count: 0 })

// ❌ 错误：解构会丢失响应性
const { count } = state.value
count++ // 不会触发更新

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state.value)
```

### 4. ref 在 reactive 对象中自动解包

```text
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

```text
const data = ref(null)

// ✅ 在异步操作中正确使用
async function fetchData() {
  data.value = await api.getData()
}

// ❌ 错误：直接赋值 ref 对象
// data.value = promise // 不会自动解包
```

### 6. TypeScript 类型支持

```text
// 自动推导类型
const count = ref(0) // Ref&lt;number&gt;

// 显式指定类型
const count = Ref&lt;number&gt;(0)
const user = Ref&lt;User&gt;({ name: 'Vue' })

// 可能为 null 的 ref
const inputRef = ref&lt;HTMLInputElement | null&gt;(null)
```

## 使用场景

### 1. 定义基本类型的响应式数据

```text
const count = ref(0)
const message = ref('Hello')
const isLoading = ref(false)
```

### 2. 定义单一值的响应式状态

```text
// 适用于简单的计数器、开关等
const isActive = ref(false)
const counter = ref(0)

function toggle() {
  isActive.value = !isActive.value
}
```

### 3. 与 computed 配合使用

```text
const count = ref(0)
const doubled = computed(() =&gt; count.value * 2)
```

### 4. 模板中的动态绑定

```text
`&lt;script setup&gt;`
const title = ref('动态标题')
const disabled = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;h1&gt;{{ title }}&lt;/h1&gt;
  &lt;button :disabled="disabled"&gt;按钮&lt;/button&gt;
`&lt;/template&gt;`
```

### 5. 表单数据绑定

```text
`&lt;script setup&gt;`
const username = ref('')
const password = ref('')
const agree = ref(false)
const gender = ref('male')
const hobbies = ref([])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="username" /&gt;
  &lt;input v-model="password" type="password" /&gt;
  &lt;input v-model="agree" type="checkbox" /&gt;
  &lt;input v-model="gender" type="radio" value="male" /&gt;
  &lt;select v-model="hobbies" multiple&gt;
    &lt;option value="reading"&gt;阅读&lt;/option&gt;
    &lt;option value="coding"&gt;编程&lt;/option&gt;
  &lt;/select&gt;
`&lt;/template&gt;`
```

### 6. 列表渲染

```text
`&lt;script setup&gt;`
const items = ref([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' }
])

function addItem(text) {
  items.value.push({ id: Date.now(), text })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul&gt;
    &lt;li v-for="item in items" :key="item.id"&gt;
      {{ item.text }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 7. 条件渲染控制

```text
`&lt;script setup&gt;`
const showDetails = ref(false)
const currentTab = ref('home')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="showDetails = !showDetails"&gt;切换详情&lt;/button&gt;
  &lt;div v-if="showDetails"&gt;详情内容&lt;/div&gt;

  &lt;button @click="currentTab = 'about'"&gt;关于&lt;/button&gt;
  &lt;component :is="currentTab" /&gt;
`&lt;/template&gt;`
```

### 8. DOM 元素引用

```text
`&lt;script setup&gt;`
const canvasRef = ref(null)

onMounted(() =&gt; {
  const ctx = canvasRef.value.getContext('2d')
  // 使用 canvas 上下文
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;canvas ref="canvasRef"&gt;&lt;/canvas&gt;
`&lt;/template&gt;`
```

### 9. 组件通信（父调子）

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import ChildComponent from './ChildComponent.vue'
const childRef = ref(null)

function validateChild() {
  childRef.value.validate()
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ChildComponent ref="childRef" /&gt;
  &lt;button @click="validateChild"&gt;验证子组件&lt;/button&gt;
`&lt;/template&gt;`
```

### 10. 性能优化（与 shallowRef 配合）

```text
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
