# defineComponent

## 作用
`defineComponent()` 是 Vue 3 提供的一个类型辅助函数，用于定义具有类型推导功能的 Vue 组件。它主要在 TypeScript 中使用，帮助 IDE 和编译器正确推导组件选项的类型。

## 用法

### 基本用法（选项式 API）

```javascript
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyComponent',

  props: {
    message: String,
    count: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      localCount: 0
    }
  },

  computed: {
    doubled() {
      return this.localCount * 2
    }
  },

  methods: {
    increment() {
      this.localCount++
    }
  }
})
```

### TypeScript 中使用

```typescript
import { defineComponent } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export default defineComponent({
  name: 'UserList',

  props: {
    users: {
      type: Array as PropType<User[]>,
      required: true
    }
  },

  emits: {
    select: (user: User) => true,
    delete: (userId: number) => true
  },

  setup(props) {
    // props.users 的类型被正确推导为 User[]
    console.log(props.users[0].name)

    const selectedUser = ref<User | null>(null)

    function selectUser(user: User) {
      selectedUser.value = user
    }

    return {
      selectedUser,
      selectUser
    }
  }
})
```

### 组合式 API 使用

```vue
<script setup lang="ts">
import { defineComponent, ref, computed } from 'vue'

// 在 <script setup> 中通常不需要显式使用 defineComponent
// 但可以用于添加组件选项

const count = ref(0)

const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}

// 可以定义 script setup 的选项
defineProps<{
  message: string
}>()

defineEmits<{
  (e: 'update', value: number): void
}>()

// 在 script setup 中很少需要显式使用 defineComponent
</script>
```

### 在 .vue 文件中使用

```vue
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyComponent',

  props: {
    title: String,
    initialCount: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      count: this.initialCount
    }
  },

  computed: {
    displayTitle() {
      return this.title || 'Default Title'
    }
  },

  watch: {
    count(newVal) {
      console.log('Count changed:', newVal)
    }
  },

  mounted() {
    console.log('Component mounted')
  },

  methods: {
    increment() {
      this.count++
    }
  }
})
</script>

<template>
  <div>
    <h1>{{ displayTitle }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

### 渲染函数中使用

```typescript
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'ButtonComponent',

  props: {
    type: {
      type: String as PropType<'primary' | 'secondary' | 'danger'>,
      default: 'primary'
    },
    disabled: Boolean
  },

  emits: ['click'],

  setup(props, { emit }) {
    return () => h(
      'button',
      {
        class: [`btn btn-${props.type}`, { disabled: props.disabled }],
        disabled: props.disabled,
        onClick: () => emit('click')
      },
      'Click me'
    )
  }
})
```

### 组件继承

```typescript
import { defineComponent } from 'vue'

// 基础组件
const BaseComponent = defineComponent({
  name: 'BaseComponent',

  props: {
    id: String,
    data: Object
  },

  methods: {
    commonMethod() {
      console.log('Common method')
    }
  }
})

// 扩展组件
export default defineComponent({
  name: 'ExtendedComponent',
  extends: BaseComponent,

  props: {
    // 继承 BaseComponent 的 props
    extraProp: String
  },

  methods: {
    // 继承 commonMethod
    specificMethod() {
      this.commonMethod()
      console.log('Specific method')
    }
  }
})
```

### 混入使用

```typescript
import { defineComponent } from 'vue'

const loggingMixin = defineComponent({
  methods: {
    log(message: string) {
      console.log(`[${this.$options.name}]: ${message}`)
    }
  }
})

export default defineComponent({
  name: 'MyComponent',

  mixins: [loggingMixin],

  mounted() {
    this.log('Component mounted') // 类型安全
  }
})
```

### 插槽类型定义

```typescript
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CardComponent',

  setup(_, { slots }) {
    // slots 的类型被正确推导
    return () => (
      <div class="card">
        {slots.header?.()}
        {slots.default?.()}
        {slots.footer?.()}
      </div>
    )
  }
})
```

## 注意事项

### 1. 不带参数使用

```typescript
// ✅ 正确：用于推导 setup 的返回类型
export default defineComponent({
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    return {
      count,
      doubled
    }
  }
})

// 在 template 中，count 和 doubled 的类型会被正确推导
```

### 2. 组件名称

```typescript
export default defineComponent({
  name: 'MyComponent', // 用于调试和 DevTools

  // 或使用
  // name: Symbol('MyComponent'), // 唯一标识
})
```

### 3. props 类型定义

```typescript
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    // 简单类型
    basicProp: String,
    numberProp: Number,
    boolProp: Boolean,

    // 复杂类型
    objectProp: Object as PropType<{ id: number }>,
    arrayProp: Array as PropType<string[]>,
    functionProp: Function as PropType<(value: number) => void>,

    // 联合类型
    unionProp: String as PropType<'success' | 'warning' | 'error'>,

    // 自定义类
    classProp: Object as PropType<MyClass>
  }
})
```

### 4. emits 类型定义

```typescript
export default defineComponent({
  emits: {
    // 无载荷
    click: null,

    // 有载荷，带验证
    submit: (payload: { email: string; password: string }) => {
      return payload.email.includes('@')
    },

    // 函数签名形式
    update: (value: number) => true
  },

  setup(props, { emit }) {
    // emit 的类型被正确推导
    emit('click')
    emit('submit', { email: 'test@example.com', password: '123' })
    emit('update', 100)
  }
})
```

### 5. setup 上下文类型

```typescript
import { DefineComponent } from 'vue'

export default defineComponent({
  setup(props, context) {
    // context 的类型被正确推导
    context.attrs // attrs: Record<string, unknown>
    context.slots // slots: Slots
    context.emit // emit: (event: string, ...args: any[]) => void
    context.expose // expose: (exposed: Record<string, any>) => void

    // 解构使用
    const { attrs, slots, emit, expose } = context
  }
})
```

### 6. 与 <script setup> 的关系

```vue
<!-- 在 <script setup> 中通常不需要显式使用 defineComponent -->
<script setup lang="ts">
// 直接编写组合式 API
const count = ref(0)

// 定义 props
interface Props {
  message: string
  count?: number
}

defineProps<Props>()

// 定义 emits
interface Emits {
  (e: 'update', value: number): void
}

defineEmits<Emits>()
</script>
```

### 7. 暴露公共方法

```typescript
export default defineComponent({
  setup(props, { expose }) {
    const privateCount = ref(0)
    const publicCount = ref(0)

    function privateMethod() {
      // 私有方法
    }

    function publicMethod() {
      // 公共方法
      publicCount.value++
    }

    // 只暴露特定的方法和属性
    expose({
      publicCount,
      publicMethod
    })

    return {
      privateCount,
      publicCount
    }
  }
})
```

### 8. 组件选项类型推导

```typescript
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      message: 'Hello'
      // message 的类型被推导为 string
    }
  },

  computed: {
    reversed() {
      // this.message 的类型是 string
      return this.message.split('').reverse().join('')
    }
  },

  methods: {
    // 方法的 this 上下文被正确推导
    greet() {
      console.log(this.message)
    }
  }
})
```

## 使用场景

### 1. 完整的选项式组件

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserCard',

  props: {
    user: {
      type: Object as PropType<{
        id: number
        name: string
        email: string
      }>,
      required: true
    }
  },

  emits: ['edit', 'delete'],

  data() {
    return {
      isEditing: false,
      editForm: {
        name: '',
        email: ''
      }
    }
  },

  computed: {
    avatarUrl(): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.name}`
    }
  },

  watch: {
    'user.name': {
      immediate: true,
      handler(newName) {
        this.editForm.name = newName
      }
    }
  },

  mounted() {
    console.log('User card mounted for:', this.user.name)
  },

  methods: {
    startEdit() {
      this.isEditing = true
      this.editForm = {
        name: this.user.name,
        email: this.user.email
      }
    },

    saveEdit() {
      this.$emit('edit', {
        id: this.user.id,
        ...this.editForm
      })
      this.isEditing = false
    },

    cancelEdit() {
      this.isEditing = false
    },

    deleteUser() {
      this.$emit('delete', this.user.id)
    }
  }
})
</script>

<template>
  <div class="user-card">
    <img :src="avatarUrl" :alt="user.name" />
    <div v-if="!isEditing">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button @click="startEdit">编辑</button>
      <button @click="deleteUser">删除</button>
    </div>
    <div v-else>
      <input v-model="editForm.name" />
      <input v-model="editForm.email" />
      <button @click="saveEdit">保存</button>
      <button @click="cancelEdit">取消</button>
    </div>
  </div>
</template>
```

### 2. 渲染函数组件

```typescript
import { defineComponent, h, Fragment } from 'vue'

export default defineComponent({
  name: 'TableComponent',

  props: {
    columns: {
      type: Array as PropType<{
        key: string
        label: string
        render?: (value: any) => any
      }[]>,
      required: true
    },
    data: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => []
    }
  },

  setup(props) {
    return () => h(
      'table',
      { class: 'data-table' },
      [
        // 表头
        h('thead', [
          h('tr', props.columns.map(col =>
            h('th', { key: col.key }, col.label)
          ))
        ]),

        // 表体
        h('tbody', props.data.map((row, rowIndex) =>
          h('tr', { key: rowIndex }, props.columns.map(col =>
            h('td', { key: col.key },
              col.render ? col.render(row[col.key]) : row[col.key]
            )
          ))
        ))
      ]
    )
  }
})
```

### 3. 函数式组件

```typescript
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'FunctionalButton',

  functional: true,

  props: {
    type: {
      type: String as PropType<'primary' | 'secondary'>,
      default: 'primary'
    },
    disabled: Boolean
  },

  setup(props, { slots, emit }) {
    return () => h(
      'button',
      {
        class: ['btn', `btn-${props.type}`, { disabled: props.disabled }],
        disabled: props.disabled,
        onClick: () => emit('click')
      },
      slots.default ? slots.default() : 'Button'
    )
  }
})
```

### 4. 可复用的逻辑组合

```typescript
import { defineComponent } from 'vue'

// 可复用的组合函数
function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const doubled = computed(() => count.value * 2)
  const tripled = computed(() => count.value * 3)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count,
    doubled,
    tripled,
    increment,
    decrement,
    reset
  }
}

// 在组件中使用
export default defineComponent({
  name: 'CounterComponent',

  props: {
    initialValue: {
      type: Number,
      default: 0
    }
  },

  setup(props) {
    // 使用组合函数
    const {
      count,
      doubled,
      tripled,
      increment,
      decrement,
      reset
    } = useCounter(props.initialValue)

    return {
      count,
      doubled,
      tripled,
      increment,
      decrement,
      reset
    }
  }
})
```

### 5. 带泛型的组件

```typescript
import { defineComponent, PropType } from 'vue'

type SelectOption<T> = {
  label: string
  value: T
}

export default defineComponent({
  name: 'SelectComponent',

  props: {
    options: {
      type: Array as PropType<SelectOption<string>[]>,
      required: true
    },
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      required: true
    }
  },

  emits: {
    'update:modelValue': (value: string | number) => true
  },

  setup(props, { emit }) {
    const selectedValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    return { selectedValue }
  }
})
```

## defineComponent 的好处

1. **类型推导**：提供完整的 TypeScript 类型推导
2. **IDE 支持**：更好的自动完成和类型检查
3. **编译器优化**：帮助编译器更好地处理模板
4. **文档化**：使组件结构更清晰
5. **一致性**：统一的组件定义方式

## 最佳实践

1. **TypeScript 项目**：始终使用 defineComponent
2. **组件命名**：提供有意义的 name 选项
3. **props 类型**：使用 PropType 定义复杂类型
4. **emits 验证**：为 emits 提供验证函数
5. **暴露 API**：使用 expose 明确组件公共 API
