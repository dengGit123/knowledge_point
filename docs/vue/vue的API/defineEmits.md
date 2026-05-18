# defineEmits

## 作用
`defineEmits()` 是 ``&lt;script setup&gt;`` 中用于声明组件可以触发事件的编译器宏。它不需要显式导入，可以在 ``&lt;script setup&gt;`` 中直接使用。用于子组件向父组件通信。

## 用法

### 基本用法

```text
&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const emit = defineEmits(['click', 'submit', 'cancel'])

function handleClick() {
  emit('click')
}

function handleSubmit() {
  emit('submit', { data: 'some data' })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="handleClick"&gt;Click&lt;/button&gt;
    &lt;button @click="handleSubmit"&gt;Submit&lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`

&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import MyComponent from './MyComponent.vue'

function handleClick() {
  console.log('Button clicked')
}

function handleSubmit(payload) {
  console.log('Submitted with:', payload)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;MyComponent @click="handleClick" @submit="handleSubmit" /&gt;
`&lt;/template&gt;`
```

### 对象语法（带验证）

```text
`&lt;script setup&gt;`
const emit = defineEmits({
  // 无验证
  click: null,

  // 带验证
  submit: (payload) =&gt; {
    if (!payload.email) {
      console.warn('Email is required')
      return false
    }
    if (!payload.email.includes('@')) {
      console.warn('Invalid email')
      return false
    }
    return true
  },

  // 带类型验证
  'update:value': (value) =&gt; {
    return typeof value === 'number'
  }
})

function handleSubmit() {
  emit('submit', { email: 'user@example.com' })
}
`&lt;/script&gt;`
```

### TypeScript 类型声明

```text
&lt;script setup lang="ts"&gt;
const emit = defineEmits&lt;{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}&gt;()

// 使用
emit('change', 1)
emit('update', 'new value')
emit('delete', 1)
`&lt;/script&gt;`
```

### 与 v-model 配合

```text
&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function updateValue(newValue) {
  emit('update:modelValue', newValue)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="props.modelValue"
    @input="updateValue($event.target.value)"
  /&gt;
`&lt;/template&gt;`

&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
const text = ref('Hello')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;MyComponent v-model="text" /&gt;
  &lt;!-- 等同于 --&gt;
  &lt;MyComponent
    :model-value="text"
    @update:model-value="text = $event"
  /&gt;
`&lt;/template&gt;`
```

### 多个 v-model

```text
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

&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
const firstName = ref('')
const lastName = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;UserName
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  /&gt;
`&lt;/template&gt;`
```

### 自定义修饰符

```text
&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () =&gt; ({}) }
})

const emit = defineEmits(['update:modelValue'])

function emitValue(e) {
  let value = e.target.value

  // 处理修饰符
  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }

  if (props.modelModifiers.trim) {
    value = value.trim()
  }

  emit('update:modelValue', value)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input :value="props.modelValue" @input="emitValue" /&gt;
`&lt;/template&gt;`

&lt;!-- 父组件 --&gt;
&lt;MyComponent v-model.capitalize.trim="text" /&gt;
```

### 事件载荷

```text
`&lt;script setup&gt;`
const emit = defineEmits(['success', 'error'])

async function handleAction() {
  try {
    const result = await api.call()
    emit('success', { result, timestamp: Date.now() })
  } catch (error) {
    emit('error', { error, message: error.message })
  }
}
`&lt;/script&gt;`
```

### 条件触发

```text
`&lt;script setup&gt;`
const emit = defineEmits(['change'])

const props = defineProps({
  value: String
})

watch(() =&gt; props.value, (newVal, oldVal) =&gt; {
  if (newVal !== oldVal) {
    emit('change', { newVal, oldVal })
  }
})
`&lt;/script&gt;`
```

### 原生事件

```text
`&lt;script setup&gt;`
const emit = defineEmits(['click'])

function handleClick(e) {
  // 转发原生事件
  emit('click', e)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="handleClick"&gt;
    &lt;slot /&gt;
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 在 setup 函数中使用

```text
import { defineEmits } from 'vue'

export default {
  emits: ['click', 'submit'],

  setup(props, { emit }) {
    // 使用 emit
    function handleClick() {
      emit('click')
    }

    return { handleClick }
  }
}
```

## 注意事项

### 1. emit 命名规范

```text
`&lt;script setup&gt;`
const emit = defineEmits(['click', 'update:value'])

// ✅ 推荐：使用 kebab-case
emit('update:value')

// ✅ 也支持 camelCase
emit('update:value')

// 在父组件中监听
// &lt;MyComponent @update-value="handler" /&gt;
// &lt;MyComponent @update:value="handler" /&gt;
`&lt;/script&gt;`
```

### 2. 事件验证

```text
`&lt;script setup&gt;`
const emit = defineEmits({
  submit: (payload) =&gt; {
    // 返回 true 表示事件有效
    // 返回 false 或抛出错误表示事件无效

    if (!payload) {
      console.warn('Payload is required')
      return false
    }

    return true
  }
})
`&lt;/script&gt;`
```

### 3. 大小写敏感

```text
`&lt;script setup&gt;`
const emit = defineEmits(['myEvent'])

// emit('myevent') 不会触发
// emit('MyEvent') 不会触发
// emit('myEvent') 正确

// 父组件监听
// &lt;MyComponent @my-event="handler" /&gt;
`&lt;/script&gt;`
```

### 4. 与原生事件区别

```text
`&lt;script setup&gt;`
const emit = defineEmits(['click'])

function handleClick(e) {
  // emit('click') 是自定义事件
  // e 是原生 DOM 事件对象
  emit('click', e)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 监听自定义 click 事件 --&gt;
  &lt;button @click="handleClick"&gt;
    Click
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 5. TypeScript 类型

```text
&lt;script setup lang="ts"&gt;
// ✅ 使用函数重载声明
const emit = defineEmits&lt;{
  (e: 'change', value: number): void
  (e: 'update', value: string, id: number): void
}&gt;()

// 正确使用
emit('change', 1)
emit('update', 'text', 1)

// ❌ 类型错误
emit('change', 'text') // 参数类型错误
emit('unknown') // 事件名不存在
`&lt;/script&gt;`
```

### 6. 可选参数

```text
&lt;script setup lang="ts"&gt;
const emit = defineEmits&lt;{
  (e: 'save', data?: any): void
}&gt;()

// 可以不传递参数
emit('save')

// 也可以传递参数
emit('save', { id: 1 })
`&lt;/script&gt;`
```

### 7. 验证中的 this

```text
`&lt;script setup&gt;`
// 在验证函数中无法访问 this
const emit = defineEmits({
  submit: (payload) =&gt; {
    // console.log(this) // undefined

    // 需要的数据通过参数传递
    return validate(payload)
  }
})

function validate(data) {
  // 验证逻辑
  return true
}
`&lt;/script&gt;`
```

### 8. 事件冒泡

```text
`&lt;script setup&gt;`
const emit = defineEmits(['row-click'])

function handleRowClick(row, e) {
  // 可以阻止原生事件冒泡
  e.stopPropagation()

  // 触发自定义事件
  emit('row-click', row)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;table&gt;
    &lt;tr @click="handleRowClick(row, $event)"&gt;
      &lt;td&gt;{{ row.name }}&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/table&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 表单提交

```text
&lt;!-- FormComponent.vue --&gt;
`&lt;script setup&gt;`
const emit = defineEmits({
  submit: (payload) =&gt; {
    return payload.email && payload.password
  }
})

const formData = reactive({
  email: '',
  password: ''
})

function handleSubmit() {
  emit('submit', { ...formData })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form @submit.prevent="handleSubmit"&gt;
    &lt;input v-model="formData.email" /&gt;
    &lt;input v-model="formData.password" /&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 2. 对话框操作

```text
&lt;!-- Dialog.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm')
  close()
}

function handleCancel() {
  emit('cancel')
  close()
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-if="modelValue" class="dialog"&gt;
    &lt;slot /&gt;
    &lt;button @click="handleConfirm"&gt;确认&lt;/button&gt;
    &lt;button @click="handleCancel"&gt;取消&lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 3. 列表操作

```text
&lt;!-- List.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  items: Array
})

const emit = defineEmits(['item-click', 'item-delete'])

function handleItemClick(item) {
  emit('item-click', item)
}

function handleItemDelete(item) {
  emit('item-delete', item.id)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul&gt;
    &lt;li v-for="item in items" :key="item.id"&gt;
      &lt;span @click="handleItemClick(item)"&gt;{{ item.name }}&lt;/span&gt;
      &lt;button @click="handleItemDelete(item)"&gt;删除&lt;/button&gt;
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 4. 通知系统

```text
&lt;!-- Notification.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  notification: Object
})

const emit = defineEmits(['close', 'action'])

let timer = null

onMounted(() =&gt; {
  if (props.notification.autoClose) {
    timer = setTimeout(() =&gt; {
      emit('close')
    }, props.notification.duration)
  }
})

onUnmounted(() =&gt; {
  if (timer) clearTimeout(timer)
})

function handleAction(action) {
  emit('action', action)
  emit('close')
}
`&lt;/script&gt;`
```

### 5. 拖拽事件

```text
&lt;!-- Draggable.vue --&gt;
`&lt;script setup&gt;`
const emit = defineEmits(['dragstart', 'dragend', 'drop'])

function handleDragStart(e) {
  emit('dragstart', {
    data: e.dataTransfer,
    position: { x: e.clientX, y: e.clientY }
  })
}

function handleDragEnd(e) {
  emit('dragend', {
    position: { x: e.clientX, y: e.clientY }
  })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  &gt;
    &lt;slot /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 步骤器

```text
&lt;!-- Stepper.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  currentStep: {
    type: Number,
    default: 0
  },
  totalSteps: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['next', 'prev', 'step-change'])

function nextStep() {
  if (props.currentStep &lt; props.totalSteps - 1) {
    emit('step-change', props.currentStep + 1)
    emit('next')
  }
}

function prevStep() {
  if (props.currentStep &gt; 0) {
    emit('step-change', props.currentStep - 1)
    emit('prev')
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="stepper"&gt;
    &lt;button @click="prevStep" :disabled="currentStep === 0"&gt;
      上一步
    &lt;/button&gt;
    &lt;span&gt;步骤 {{ currentStep + 1 }} / {{ totalSteps }}&lt;/span&gt;
    &lt;button @click="nextStep" :disabled="currentStep === totalSteps - 1"&gt;
      下一步
    &lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 文件上传

```text
&lt;!-- FileUpload.vue --&gt;
`&lt;script setup&gt;`
const emit = defineEmits(['file-selected', 'upload-progress', 'upload-complete'])

async function handleFileSelect(event) {
  const file = event.target.files[0]
  emit('file-selected', file)

  try {
    const result = await uploadFile(file, (progress) =&gt; {
      emit('upload-progress', progress)
    })
    emit('upload-complete', result)
  } catch (error) {
    // 错误处理
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input type="file" @change="handleFileSelect" /&gt;
`&lt;/template&gt;`
```

### 8. 搜索组件

```text
&lt;!-- SearchInput.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  modelValue: String,
  debounceTime: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

let debounceTimer = null

function onInput(value) {
  emit('update:modelValue', value)

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() =&gt; {
    emit('search', value)
  }, props.debounceTime)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="props.modelValue"
    @input="onInput($event.target.value)"
    placeholder="搜索..."
  /&gt;
`&lt;/template&gt;`
```

## defineEmits 与其他 API 的区别

| API | 用途 | 方向 |
|-----|------|------|
| defineProps | 接收父组件数据 | 父 → 子 |
| defineEmits | 向父组件发送事件 | 子 → 父 |
| provide/inject | 跨层级传递 | 任意方向 |
| expose | 暴露公共方法 | 子 → 父（通过 ref） |

## 最佳实践

1. **声明所有事件**：始终声明组件会触发的事件
2. **事件载荷**：合理设计事件载荷结构
3. **验证输入**：使用验证函数确保数据有效性
4. **命名清晰**：使用有语义的事件名
5. **TypeScript 支持**：提供类型声明增强类型安全
6. **文档化**：为事件添加注释说明
