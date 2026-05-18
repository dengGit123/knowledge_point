# defineComponent

## 作用
`defineComponent()` 是 Vue 3 提供的一个类型辅助函数，用于定义具有类型推导功能的 Vue 组件。它主要在 TypeScript 中使用，帮助 IDE 和编译器正确推导组件选项的类型。

## 用法

### 基本用法（选项式 API）

```text
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

```text
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
      type: Array as PropType&lt;User[]&gt;,
      required: true
    }
  },

  emits: {
    select: (user: User) =&gt; true,
    delete: (userId: number) =&gt; true
  },

  setup(props) {
    // props.users 的类型被正确推导为 User[]
    console.log(props.users[0].name)

    const selectedUser = ref&lt;User | null&gt;(null)

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

```text
&lt;script setup lang="ts"&gt;
import { defineComponent, ref, computed } from 'vue'

// 在 `&lt;script setup&gt;` 中通常不需要显式使用 defineComponent
// 但可以用于添加组件选项

const count = ref(0)

const doubled = computed(() =&gt; count.value * 2)

function increment() {
  count.value++
}

// 可以定义 script setup 的选项
defineProps&lt;{
  message: string
}&gt;()

defineEmits&lt;{
  (e: 'update', value: number): void
}&gt;()

// 在 script setup 中很少需要显式使用 defineComponent
`&lt;/script&gt;`
```

### 在 .vue 文件中使用

```text
&lt;script&gt;
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;h1&gt;{{ displayTitle }}&lt;/h1&gt;
    &lt;p&gt;Count: {{ count }}&lt;/p&gt;
    &lt;button @click="increment"&gt;Increment&lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 渲染函数中使用

```text
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'ButtonComponent',

  props: {
    type: {
      type: String as PropType&lt;'primary' | 'secondary' | 'danger'&gt;,
      default: 'primary'
    },
    disabled: Boolean
  },

  emits: ['click'],

  setup(props, { emit }) {
    return () =&gt; h(
      'button',
      {
        class: [`btn btn-${props.type}`, { disabled: props.disabled }],
        disabled: props.disabled,
        onClick: () =&gt; emit('click')
      },
      'Click me'
    )
  }
})
```

### 组件继承

```text
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

```text
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

```text
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CardComponent',

  setup(_, { slots }) {
    // slots 的类型被正确推导
    return () =&gt; (
      &lt;div class="card"&gt;
        {slots.header?.()}
        {slots.default?.()}
        {slots.footer?.()}
      &lt;/div&gt;
    )
  }
})
```

## 注意事项

### 1. 不带参数使用

```text
// ✅ 正确：用于推导 setup 的返回类型
export default defineComponent({
  setup() {
    const count = ref(0)
    const doubled = computed(() =&gt; count.value * 2)

    return {
      count,
      doubled
    }
  }
})

// 在 template 中，count 和 doubled 的类型会被正确推导
```

### 2. 组件名称

```text
export default defineComponent({
  name: 'MyComponent', // 用于调试和 DevTools

  // 或使用
  // name: Symbol('MyComponent'), // 唯一标识
})
```

### 3. props 类型定义

```text
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    // 简单类型
    basicProp: String,
    numberProp: Number,
    boolProp: Boolean,

    // 复杂类型
    objectProp: Object as PropType&lt;{ id: number }&gt;,
    arrayProp: Array as PropType&lt;string[]&gt;,
    functionProp: Function as PropType&lt;(value: number) =&gt; void&gt;,

    // 联合类型
    unionProp: String as PropType&lt;'success' | 'warning' | 'error'&gt;,

    // 自定义类
    classProp: Object as PropType&lt;MyClass&gt;
  }
})
```

### 4. emits 类型定义

```text
export default defineComponent({
  emits: {
    // 无载荷
    click: null,

    // 有载荷，带验证
    submit: (payload: { email: string; password: string }) =&gt; {
      return payload.email.includes('@')
    },

    // 函数签名形式
    update: (value: number) =&gt; true
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

```text
import { DefineComponent } from 'vue'

export default defineComponent({
  setup(props, context) {
    // context 的类型被正确推导
    context.attrs // attrs: Record&lt;string, unknown&gt;
    context.slots // slots: Slots
    context.emit // emit: (event: string, ...args: any[]) =&gt; void
    context.expose // expose: (exposed: Record&lt;string, any&gt;) =&gt; void

    // 解构使用
    const { attrs, slots, emit, expose } = context
  }
})
```

### 6. 与 `&lt;script setup&gt;` 的关系

```text
&lt;!-- 在 `&lt;script setup&gt;` 中通常不需要显式使用 defineComponent --&gt;
&lt;script setup lang="ts"&gt;
// 直接编写组合式 API
const count = ref(0)

// 定义 props
interface Props {
  message: string
  count?: number
}

defineProps&lt;Props&gt;()

// 定义 emits
interface Emits {
  (e: 'update', value: number): void
}

defineEmits&lt;Emits&gt;()
`&lt;/script&gt;`
```

### 7. 暴露公共方法

```text
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

```text
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

```text
&lt;script lang="ts"&gt;
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserCard',

  props: {
    user: {
      type: Object as PropType&lt;{
        id: number
        name: string
        email: string
      }&gt;,
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="user-card"&gt;
    &lt;img :src="avatarUrl" :alt="user.name" /&gt;
    &lt;div v-if="!isEditing"&gt;
      &lt;h3&gt;{{ user.name }}&lt;/h3&gt;
      &lt;p&gt;{{ user.email }}&lt;/p&gt;
      &lt;button @click="startEdit"&gt;编辑&lt;/button&gt;
      &lt;button @click="deleteUser"&gt;删除&lt;/button&gt;
    &lt;/div&gt;
    &lt;div v-else&gt;
      &lt;input v-model="editForm.name" /&gt;
      &lt;input v-model="editForm.email" /&gt;
      &lt;button @click="saveEdit"&gt;保存&lt;/button&gt;
      &lt;button @click="cancelEdit"&gt;取消&lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 渲染函数组件

```text
import { defineComponent, h, Fragment } from 'vue'

export default defineComponent({
  name: 'TableComponent',

  props: {
    columns: {
      type: Array as PropType&lt;{
        key: string
        label: string
        render?: (value: any) =&gt; any
      }[]&gt;,
      required: true
    },
    data: {
      type: Array as PropType&lt;Record&lt;string, any&gt;[]&gt;,
      default: () =&gt; []
    }
  },

  setup(props) {
    return () =&gt; h(
      'table',
      { class: 'data-table' },
      [
        // 表头
        h('thead', [
          h('tr', props.columns.map(col =&gt;
            h('th', { key: col.key }, col.label)
          ))
        ]),

        // 表体
        h('tbody', props.data.map((row, rowIndex) =&gt;
          h('tr', { key: rowIndex }, props.columns.map(col =&gt;
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

```text
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'FunctionalButton',

  functional: true,

  props: {
    type: {
      type: String as PropType&lt;'primary' | 'secondary'&gt;,
      default: 'primary'
    },
    disabled: Boolean
  },

  setup(props, { slots, emit }) {
    return () =&gt; h(
      'button',
      {
        class: ['btn', `btn-${props.type}`, { disabled: props.disabled }],
        disabled: props.disabled,
        onClick: () =&gt; emit('click')
      },
      slots.default ? slots.default() : 'Button'
    )
  }
})
```

### 4. 可复用的逻辑组合

```text
import { defineComponent } from 'vue'

// 可复用的组合函数
function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const doubled = computed(() =&gt; count.value * 2)
  const tripled = computed(() =&gt; count.value * 3)

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

```text
import { defineComponent, PropType } from 'vue'

type SelectOption&lt;T&gt; = {
  label: string
  value: T
}

export default defineComponent({
  name: 'SelectComponent',

  props: {
    options: {
      type: Array as PropType&lt;SelectOption&lt;string&gt;[]&gt;,
      required: true
    },
    modelValue: {
      type: [String, Number] as PropType&lt;string | number&gt;,
      required: true
    }
  },

  emits: {
    'update:modelValue': (value: string | number) =&gt; true
  },

  setup(props, { emit }) {
    const selectedValue = computed({
      get: () =&gt; props.modelValue,
      set: (value) =&gt; emit('update:modelValue', value)
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
