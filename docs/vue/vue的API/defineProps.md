# defineProps

## 作用

`defineProps()` 是 `<script setup>` 中用于声明 props 的编译器宏。它不需要显式导入，可以在 `<script setup>` 中直接使用。用于接收从父组件传递过来的数据。

📖 [官方文档 - defineProps / defineEmits](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)

## 用法

### 基本用法

```vue
<script setup>
const props = defineProps({
  title: String,
  count: Number,
  isActive: Boolean
})

console.log(props.title)
console.log(props.count)
</script>

<template>
  <div :class="{ active: props.isActive }">
    <h1>{{ props.title }}</h1>
    <p>Count: {{ props.count }}</p>
  </div>
</template>
```

### 数组语法

```vue
<script setup>
const props = defineProps(['title', 'count', 'isActive'])

// 没有类型检查
</script>
```

### 对象语法

```vue
<script setup>
const props = defineProps({
  // 基础类型检查
  title: String,
  count: Number,
  isActive: Boolean,

  // 多个可能类型
  value: [String, Number],

  // 必填字段
  requiredProp: {
    type: String,
    required: true
  },

  // 带默认值
  optionalProp: {
    type: Number,
    default: 100
  },

  // 对象/数组默认值应当是函数
  objectProp: {
    type: Object,
    default() {
      return { message: 'hello' }
    }
  },

  arrayProp: {
    type: Array,
    default() {
      return []
    }
  },

  // 自定义验证函数
  validator: {
    validator(value) {
      return ['success', 'warning', 'danger'].includes(value)
    }
  }
})
</script>
```

### TypeScript 类型声明

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  isActive?: boolean
}

// withDefaults 提供默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  isActive: false
})
</script>
```

### 泛型类型

```vue
<script setup lang="ts">
interface ListItem {
  id: number
  name: string
}

defineProps<{
  items: ListItem[]
  selectedId: number
}>()
</script>
```

### 响应式 props

```vue
<script setup>
const props = defineProps({
  modelValue: String
})

// props 本身是响应式的
watch(() => props.modelValue, (newVal) => {
  console.log('modelValue changed:', newVal)
})

// ✅ 可以直接在模板中使用
// ❌ 二次解构 props 对象会失去响应性
const { modelValue } = props // 之后 props.modelValue 再变化，modelValue 不会更新
</script>
```

> 💡 **提示：** Vue 3.5+ 起，**直接**解构 `defineProps()` 的返回值是响应式的（编译器会把 `modelValue` 转换为 `props.modelValue` 的访问），还可以在解构时写默认值：

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

// ✅ Vue 3.5+：直接解构保持响应性，默认值写在解构里（可替代 withDefaults）
const { title, count = 0 } = defineProps<Props>()
</script>
```

### Prop 验证

```vue
<script setup>
const props = defineProps({
  // 基础类型检查
  propA: Number,

  // 多个类型
  propB: [String, Number],

  // 必填字符串
  propC: {
    type: String,
    required: true
  },

  // 带默认值的数字
  propD: {
    type: Number,
    default: 100
  },

  // 带默认值的对象
  propE: {
    type: Object,
    default() {
      return { message: 'hello' }
    }
  },

  // 自定义验证
  propF: {
    validator(value) {
      return value >= 0
    }
  }
})
</script>
```

### 动态 Props

```vue
<script setup>
const props = defineProps({
  attributeName: String,
  attributeValue: [String, Number]
})
</script>

<template>
  <!-- 动态绑定属性 -->
  <div :[props.attributeName]="props.attributeValue">
    Dynamic attribute
  </div>
</template>
```

### 与 v-model 配合

> 💡 **提示：** 下面是 v-model 的传统实现方式。Vue 3.4+ 可以用 `defineModel()` 一行代替（见 defineModel 的说明）。

```vue
<!-- 父组件 -->
<MyComponent v-model="count" />

<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

### 多个 v-model

```vue
<!-- 父组件 -->
<UserForm
  v-model:first-name="first"
  v-model:last-name="last"
/>

<!-- 子组件 -->
<script setup>
const props = defineProps({
  firstName: String,
  lastName: String
})

const emit = defineEmits(['update:firstName', 'update:lastName'])
</script>

<template>
  <input
    :value="props.firstName"
    @input="emit('update:firstName', $event.target.value)"
  />
  <input
    :value="props.lastName"
    @input="emit('update:lastName', $event.target.value)"
  />
</template>
```

## 注意事项

### 1. props 是只读的

```vue
<script setup>
const props = defineProps({
  count: Number
})

// ❌ 不要修改 props
props.count = 10 // 警告

// ✅ 使用计算属性
const doubled = computed(() => props.count * 2)

// 或使用本地状态
const localCount = ref(props.count)
</script>
```

### 2. 二次解构 props 对象会失去响应性

```vue
<script setup>
const props = defineProps({
  count: Number,
  message: String
})

// ❌ 二次解构 props 对象：count/message 是普通值，之后不再随 props 更新
const { count, message } = props

// ✅ 方式一：始终通过 props.xxx 访问
// ✅ 方式二：使用 toRefs 保持响应性
import { toRefs } from 'vue'
const { count, message } = toRefs(props)
// ✅ 方式三（Vue 3.5+）：直接解构 defineProps() 的返回值（见上文"响应式 props"）
</script>
```

### 3. 命名规范

```vue
<script setup>
// ✅ 推荐：camelCase
defineProps({
  userName: String,
  isActive: Boolean
})

// 在 HTML 中使用 kebab-case
// <MyComponent user-name="Vue" is-active />
</script>
```

### 4. Boolean 类型转换

```vue
<script setup>
defineProps({
  disabled: Boolean
})
</script>

<template>
  <!-- 以下写法都会传递 true -->
  <MyComponent disabled />
  <MyComponent disabled="" />
  <MyComponent disabled="disabled" />

  <!-- 传递 false -->
  <MyComponent :disabled="false" />
</template>
```

### 5. 对象和数组默认值

```vue
<script setup>
defineProps({
  // ✅ 对象默认值必须是函数
  config: {
    type: Object,
    default() {
      return { theme: 'light' }
    }
  },

  // ✅ 数组默认值必须是函数
  items: {
    type: Array,
    default() {
      return []
    }
  }
})
</script>
```

### 6. Prop 验证时机

```vue
<script setup>
defineProps({
  // 验证函数在组件创建前执行
  // 这时无法访问组件实例（this）
  value: {
    validator(val) {
      console.log(this) // undefined
      return val > 0
    }
  }
})
</script>
```

### 7. 两种声明方式二选一

`defineProps` 要么传**运行时声明**（对象/数组），要么传**类型参数**，不能同时使用：

```vue
<script setup lang="ts">
// ✅ 方式一：运行时声明
const props = defineProps({
  title: String,
  count: Number
})

// ✅ 方式二：类型声明（编译时推导出运行时 props）
const props2 = defineProps<{
  title: string
  count: number
}>()

// ❌ 错误：类型参数和运行时参数不能同时传
</script>
```

> 💡 **提示：** 类型声明由编译器静态分析，因此支持的字面量类型有限。Vue 3.3+ 起支持从其他文件**导入**的类型、接口 `extends` 以及有限的复杂类型（如索引访问）；依赖完整类型求值的高级类型（如条件类型）无法解析，会报 `Unresolvable type reference` 错误。此时应改用运行时声明配合 `PropType`。

### 8. 使用 PropType

```vue
<script setup lang="ts">
import { PropType } from 'vue'

interface User {
  id: number
  name: string
}

defineProps({
  user: {
    type: Object as PropType<User>,
    required: true
  },

  users: {
    type: Array as PropType<User[]>,
    default: () => []
  }
})
</script>
```

## 使用场景

### 1. 基础数据传递

```vue
<!-- 父组件 -->
<UserCard
  name="Vue"
  :age="3"
  :is-active="true"
/>

<!-- 子组件 UserCard.vue -->
<script setup>
const props = defineProps({
  name: String,
  age: Number,
  isActive: Boolean
})
</script>

<template>
  <div :class="{ active: props.isActive }">
    <h2>{{ props.name }}</h2>
    <p>Age: {{ props.age }}</p>
  </div>
</template>
```

### 2. 函数 Prop

```vue
<!-- 父组件 -->
<MyComponent :on-click="handleClick" />

<!-- 子组件 -->
<script setup>
const props = defineProps({
  onClick: Function
})

function handleClick() {
  props.onClick?.('data from child')
}
</script>

<template>
  <button @click="handleClick">Click</button>
</template>
```

### 3. 配置对象

```vue
<!-- 父组件 -->
<DataTable
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' }
  ]"
  :data="tableData"
/>

<!-- 子组件 -->
<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  }
})
</script>
```

### 4. 条件渲染

```vue
<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
  }
})

const buttonClass = computed(() => `btn btn-${props.type}`)
</script>

<template>
  <button :class="buttonClass">
    <slot />
  </button>
</template>
```

### 5. 响应式更新

```vue
<script setup>
const props = defineProps({
  items: Array
})

// 监听 props 变化
watch(() => props.items, (newItems) => {
  console.log('Items updated:', newItems)
}, { deep: true })

// 计算属性
const itemCount = computed(() => props.items?.length || 0)
</script>
```

### 6. 默认值合并

```vue
<script setup>
const props = withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
  theme?: 'light' | 'dark'
}>(), {
  size: 'medium',
  theme: 'light'
})
</script>
```

### 7. 传递复杂对象

```vue
<!-- 父组件 -->
<script setup>
const config = reactive({
  pagination: {
    pageSize: 10,
    currentPage: 1
  },
  filters: {
    status: 'active'
  }
})
</script>

<template>
  <DataTable :config="config" />
</template>
```

```vue
<!-- 子组件 -->
<script setup lang="ts">
defineProps<{
  config: {
    pagination: {
      pageSize: number
      currentPage: number
    }
    filters: Record<string, any>
  }
}>()
</script>
```

### 8. Prop 验证

```vue
<script setup>
defineProps({
  email: {
    type: String,
    required: true,
    validator: (value) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    }
  },

  age: {
    type: Number,
    validator: (value) => {
      return value >= 0 && value <= 150
    }
  },

  password: {
    type: String,
    validator: (value) => {
      return value.length >= 8
    }
  }
})
</script>
```

## defineProps 最佳实践

1. **明确类型**：始终声明 props 类型
2. **提供默认值**：为非必填 props 提供默认值
3. **验证输入**：使用 validator 验证复杂规则
4. **保持只读**：不要在子组件中修改 props
5. **命名规范**：使用 camelCase，模板中使用 kebab-case
6. **文档化**：为复杂 props 添加注释说明
7. **避免过度**：合理拆分组件，避免 props 过多
