# defineProps

## 作用
`defineProps()` 是 ``&lt;script setup&gt;`` 中用于声明 props 的编译器宏。它不需要显式导入，可以在 ``&lt;script setup&gt;`` 中直接使用。用于接收从父组件传递过来的数据。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
const props = defineProps({
  title: String,
  count: Number,
  isActive: Boolean
})

console.log(props.title)
console.log(props.count)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div :class="{ active: props.isActive }"&gt;
    &lt;h1&gt;{{ props.title }}&lt;/h1&gt;
    &lt;p&gt;Count: {{ props.count }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 数组语法

```text
`&lt;script setup&gt;`
const props = defineProps(['title', 'count', 'isActive'])

// 没有类型检查
`&lt;/script&gt;`
```

### 对象语法

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`
```

### TypeScript 类型声明

```text
&lt;script setup lang="ts"&gt;
interface Props {
  title: string
  count?: number
  isActive?: boolean
}

// withDefaults 提供默认值
const props = withDefaults(defineProps&lt;Props&gt;(), {
  count: 0,
  isActive: false
})
`&lt;/script&gt;`
```

### 泛型类型

```text
&lt;script setup lang="ts"&gt;
interface ListItem {
  id: number
  name: string
}

defineProps&lt;{
  items: ListItem[]
  selectedId: number
}&gt;()
`&lt;/script&gt;`
```

### 响应式 props

```text
`&lt;script setup&gt;`
const props = defineProps({
  modelValue: String
})

// props 本身是响应式的
watch(() =&gt; props.modelValue, (newVal) =&gt; {
  console.log('modelValue changed:', newVal)
})

// ✅ 可以直接在模板中使用
// ❌ 但不要解构 props
const { modelValue } = props // 会失去响应性
`&lt;/script&gt;`
```

### Prop 验证

```text
`&lt;script setup&gt;`
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
      return value &gt;= 0
    }
  }
})
`&lt;/script&gt;`
```

### 动态 Props

```text
`&lt;script setup&gt;`
const props = defineProps({
  attributeName: String,
  attributeValue: [String, Number]
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 动态绑定属性 --&gt;
  &lt;div :[props.attributeName]="props.attributeValue"&gt;
    Dynamic attribute
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 与 v-model 配合

```text
&lt;!-- 父组件 --&gt;
&lt;MyComponent v-model="count" /&gt;

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  /&gt;
`&lt;/template&gt;`
```

### 多个 v-model

```text
&lt;!-- 父组件 --&gt;
&lt;UserForm
  v-model:first-name="first"
  v-model:last-name="last"
/&gt;

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  firstName: String,
  lastName: String
})

const emit = defineEmits(['update:firstName', 'update:lastName'])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="props.firstName"
    @input="emit('update:firstName', $event.target.value)"
  /&gt;
  &lt;input
    :value="props.lastName"
    @input="emit('update:lastName', $event.target.value)"
  /&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. props 是只读的

```text
`&lt;script setup&gt;`
const props = defineProps({
  count: Number
})

// ❌ 不要修改 props
props.count = 10 // 警告

// ✅ 使用计算属性
const doubled = computed(() =&gt; props.count * 2)

// 或使用本地状态
const localCount = ref(props.count)
`&lt;/script&gt;`
```

### 2. 解构会失去响应性

```text
`&lt;script setup&gt;`
const props = defineProps({
  count: Number,
  message: String
})

// ❌ 解构会失去响应性
const { count, message } = props

// ✅ 使用 toRefs 保持响应性
import { toRefs } from 'vue'
const { count, message } = toRefs(props)
`&lt;/script&gt;`
```

### 3. 命名规范

```text
`&lt;script setup&gt;`
// ✅ 推荐：camelCase
defineProps({
  userName: String,
  isActive: Boolean
})

// 在 HTML 中使用 kebab-case
// &lt;MyComponent user-name="Vue" is-active /&gt;
`&lt;/script&gt;`
```

### 4. Boolean 类型转换

```text
`&lt;script setup&gt;`
defineProps({
  disabled: Boolean
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 以下写法都会传递 true --&gt;
  &lt;MyComponent disabled /&gt;
  &lt;MyComponent disabled="" /&gt;
  &lt;MyComponent disabled="disabled" /&gt;

  &lt;!-- 传递 false --&gt;
  &lt;MyComponent :disabled="false" /&gt;
`&lt;/template&gt;`
```

### 5. 对象和数组默认值

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`
```

### 6. Prop 验证时机

```text
`&lt;script setup&gt;`
defineProps({
  // 验证函数在组件创建前执行
  // 这时无法访问组件实例（this）
  value: {
    validator(val) {
      console.log(this) // undefined
      return val &gt; 0
    }
  }
})
`&lt;/script&gt;`
```

### 7. TypeScript 类型限制

```text
&lt;script setup lang="ts"&gt;
// ✅ 只能使用类型或构造函数
defineProps&lt;{
  title: string
  count: number
}&gt;()

// ❌ 不能混合使用运行时声明
defineProps&lt;{
  title: string
  count: number
} & {
  // 类型声明和运行时声明不能混用
  count: Number
}&gt;()
`&lt;/script&gt;`
```

### 8. 使用 PropType

```text
&lt;script setup lang="ts"&gt;
import { PropType } from 'vue'

interface User {
  id: number
  name: string
}

defineProps({
  user: {
    type: Object as PropType&lt;User&gt;,
    required: true
  },

  users: {
    type: Array as PropType&lt;User[]&gt;,
    default: () =&gt; []
  }
})
`&lt;/script&gt;`
```

## 使用场景

### 1. 基础数据传递

```text
&lt;!-- 父组件 --&gt;
&lt;UserCard
  name="Vue"
  :age="3"
  :is-active="true"
/&gt;

&lt;!-- 子组件 UserCard.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  name: String,
  age: Number,
  isActive: Boolean
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div :class="{ active: props.isActive }"&gt;
    &lt;h2&gt;{{ props.name }}&lt;/h2&gt;
    &lt;p&gt;Age: {{ props.age }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 函数 Prop

```text
&lt;!-- 父组件 --&gt;
&lt;MyComponent :on-click="handleClick" /&gt;

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  onClick: Function
})

function handleClick() {
  props.onClick?.('data from child')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="handleClick"&gt;Click&lt;/button&gt;
`&lt;/template&gt;`
```

### 3. 配置对象

```text
&lt;!-- 父组件 --&gt;
&lt;DataTable
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' }
  ]"
  :data="tableData"
/&gt;

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
defineProps({
  columns: {
    type: Array,
    default: () =&gt; []
  },
  data: {
    type: Array,
    default: () =&gt; []
  }
})
`&lt;/script&gt;`
```

### 4. 条件渲染

```text
`&lt;script setup&gt;`
const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) =&gt; ['primary', 'success', 'warning', 'danger'].includes(value)
  }
})

const buttonClass = computed(() =&gt; `btn btn-${props.type}`)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button :class="buttonClass"&gt;
    &lt;slot /&gt;
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 5. 响应式更新

```text
`&lt;script setup&gt;`
const props = defineProps({
  items: Array
})

// 监听 props 变化
watch(() =&gt; props.items, (newItems) =&gt; {
  console.log('Items updated:', newItems)
}, { deep: true })

// 计算属性
const itemCount = computed(() =&gt; props.items?.length || 0)
`&lt;/script&gt;`
```

### 6. 默认值合并

```text
`&lt;script setup&gt;`
const props = withDefaults(defineProps&lt;{
  size?: 'small' | 'medium' | 'large'
  theme?: 'light' | 'dark'
}&gt;(), {
  size: 'medium',
  theme: 'light'
})
`&lt;/script&gt;`
```

### 7. 传递复杂对象

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
const config = reactive({
  pagination: {
    pageSize: 10,
    currentPage: 1
  },
  filters: {
    status: 'active'
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;DataTable :config="config" /&gt;
`&lt;/template&gt;`

&lt;!-- 子组件 --&gt;
&lt;script setup lang="ts"&gt;
defineProps&lt;{
  config: {
    pagination: {
      pageSize: number
      currentPage: number
    }
    filters: Record&lt;string, any&gt;
  }
}&gt;()
`&lt;/script&gt;`
```

### 8. Prop 验证

```text
`&lt;script setup&gt;`
defineProps({
  email: {
    type: String,
    required: true,
    validator: (value) =&gt; {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    }
  },

  age: {
    type: Number,
    validator: (value) =&gt; {
      return value &gt;= 0 && value &lt;= 150
    }
  },

  password: {
    type: String,
    validator: (value) =&gt; {
      return value.length &gt;= 8
    }
  }
})
`&lt;/script&gt;`
```

## defineProps 最佳实践

1. **明确类型**：始终声明 props 类型
2. **提供默认值**：为非必填 props 提供默认值
3. **验证输入**：使用 validator 验证复杂规则
4. **保持只读**：不要在子组件中修改 props
5. **命名规范**：使用 camelCase，模板中使用 kebab-case
6. **文档化**：为复杂 props 添加注释说明
7. **避免过度**：合理拆分组件，避免 props 过多
