# defineEmits

## 作用
`defineEmits()` 是 `<script setup>` 中用于声明组件可以触发事件的编译器宏。它不需要显式导入，可以在 `<script setup>` 中直接使用。用于子组件向父组件通信。

## 用法

### 基本用法

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['click', 'submit', 'cancel'])

function handleClick() {
  emit('click')
}

function handleSubmit() {
  emit('submit', { data: 'some data' })
}
</script>

<template>
  <div>
    <button @click="handleClick">Click</button>
    <button @click="handleSubmit">Submit</button>
  </div>
</template>

<!-- 父组件 -->
<script setup>
import MyComponent from './MyComponent.vue'

function handleClick() {
  console.log('Button clicked')
}

function handleSubmit(payload) {
  console.log('Submitted with:', payload)
}
</script>

<template>
  <MyComponent @click="handleClick" @submit="handleSubmit" />
</template>
```

### 对象语法（带验证）

```vue
<script setup>
const emit = defineEmits({
  // 无验证
  click: null,

  // 带验证
  submit: (payload) => {
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
  'update:value': (value) => {
    return typeof value === 'number'
  }
})

function handleSubmit() {
  emit('submit', { email: 'user@example.com' })
}
</script>
```

### TypeScript 类型声明

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()

// 使用
emit('change', 1)
emit('update', 'new value')
emit('delete', 1)
</script>
```

### 与 v-model 配合

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function updateValue(newValue) {
  emit('update:modelValue', newValue)
}
</script>

<template>
  <input
    :value="props.modelValue"
    @input="updateValue($event.target.value)"
  />
</template>

<!-- 父组件 -->
<script setup>
const text = ref('Hello')
</script>

<template>
  <MyComponent v-model="text" />
  <!-- 等同于 -->
  <MyComponent
    :model-value="text"
    @update:model-value="text = $event"
  />
</template>
```

### 多个 v-model

```vue
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

<!-- 父组件 -->
<script setup>
const firstName = ref('')
const lastName = ref('')
</script>

<template>
  <UserName
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  />
</template>
```

### 自定义修饰符

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
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
</script>

<template>
  <input :value="props.modelValue" @input="emitValue" />
</template>

<!-- 父组件 -->
<MyComponent v-model.capitalize.trim="text" />
```

### 事件载荷

```vue
<script setup>
const emit = defineEmits(['success', 'error'])

async function handleAction() {
  try {
    const result = await api.call()
    emit('success', { result, timestamp: Date.now() })
  } catch (error) {
    emit('error', { error, message: error.message })
  }
}
</script>
```

### 条件触发

```vue
<script setup>
const emit = defineEmits(['change'])

const props = defineProps({
  value: String
})

watch(() => props.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('change', { newVal, oldVal })
  }
})
</script>
```

### 原生事件

```vue
<script setup>
const emit = defineEmits(['click'])

function handleClick(e) {
  // 转发原生事件
  emit('click', e)
}
</script>

<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>
```

### 在 setup 函数中使用

```javascript
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

```vue
<script setup>
const emit = defineEmits(['click', 'update:value'])

// ✅ 推荐：使用 kebab-case
emit('update:value')

// ✅ 也支持 camelCase
emit('update:value')

// 在父组件中监听
// <MyComponent @update-value="handler" />
// <MyComponent @update:value="handler" />
</script>
```

### 2. 事件验证

```vue
<script setup>
const emit = defineEmits({
  submit: (payload) => {
    // 返回 true 表示事件有效
    // 返回 false 或抛出错误表示事件无效

    if (!payload) {
      console.warn('Payload is required')
      return false
    }

    return true
  }
})
</script>
```

### 3. 大小写敏感

```vue
<script setup>
const emit = defineEmits(['myEvent'])

// emit('myevent') 不会触发
// emit('MyEvent') 不会触发
// emit('myEvent') 正确

// 父组件监听
// <MyComponent @my-event="handler" />
</script>
```

### 4. 与原生事件区别

```vue
<script setup>
const emit = defineEmits(['click'])

function handleClick(e) {
  // emit('click') 是自定义事件
  // e 是原生 DOM 事件对象
  emit('click', e)
}
</script>

<template>
  <!-- 监听自定义 click 事件 -->
  <button @click="handleClick">
    Click
  </button>
</template>
```

### 5. TypeScript 类型

```vue
<script setup lang="ts">
// ✅ 使用函数重载声明
const emit = defineEmits<{
  (e: 'change', value: number): void
  (e: 'update', value: string, id: number): void
}>()

// 正确使用
emit('change', 1)
emit('update', 'text', 1)

// ❌ 类型错误
emit('change', 'text') // 参数类型错误
emit('unknown') // 事件名不存在
</script>
```

### 6. 可选参数

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'save', data?: any): void
}>()

// 可以不传递参数
emit('save')

// 也可以传递参数
emit('save', { id: 1 })
</script>
```

### 7. 验证中的 this

```vue
<script setup>
// 在验证函数中无法访问 this
const emit = defineEmits({
  submit: (payload) => {
    // console.log(this) // undefined

    // 需要的数据通过参数传递
    return validate(payload)
  }
})

function validate(data) {
  // 验证逻辑
  return true
}
</script>
```

### 8. 事件冒泡

```vue
<script setup>
const emit = defineEmits(['row-click'])

function handleRowClick(row, e) {
  // 可以阻止原生事件冒泡
  e.stopPropagation()

  // 触发自定义事件
  emit('row-click', row)
}
</script>

<template>
  <table>
    <tr @click="handleRowClick(row, $event)">
      <td>{{ row.name }}</td>
    </tr>
  </table>
</template>
```

## 使用场景

### 1. 表单提交

```vue
<!-- FormComponent.vue -->
<script setup>
const emit = defineEmits({
  submit: (payload) => {
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
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.email" />
    <input v-model="formData.password" />
    <button type="submit">Submit</button>
  </form>
</template>
```

### 2. 对话框操作

```vue
<!-- Dialog.vue -->
<script setup>
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
</script>

<template>
  <div v-if="modelValue" class="dialog">
    <slot />
    <button @click="handleConfirm">确认</button>
    <button @click="handleCancel">取消</button>
  </div>
</template>
```

### 3. 列表操作

```vue
<!-- List.vue -->
<script setup>
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
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <span @click="handleItemClick(item)">{{ item.name }}</span>
      <button @click="handleItemDelete(item)">删除</button>
    </li>
  </ul>
</template>
```

### 4. 通知系统

```vue
<!-- Notification.vue -->
<script setup>
const props = defineProps({
  notification: Object
})

const emit = defineEmits(['close', 'action'])

let timer = null

onMounted(() => {
  if (props.notification.autoClose) {
    timer = setTimeout(() => {
      emit('close')
    }, props.notification.duration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

function handleAction(action) {
  emit('action', action)
  emit('close')
}
</script>
```

### 5. 拖拽事件

```vue
<!-- Draggable.vue -->
<script setup>
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
</script>

<template>
  <div
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <slot />
  </div>
</template>
```

### 6. 步骤器

```vue
<!-- Stepper.vue -->
<script setup>
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
  if (props.currentStep < props.totalSteps - 1) {
    emit('step-change', props.currentStep + 1)
    emit('next')
  }
}

function prevStep() {
  if (props.currentStep > 0) {
    emit('step-change', props.currentStep - 1)
    emit('prev')
  }
}
</script>

<template>
  <div class="stepper">
    <button @click="prevStep" :disabled="currentStep === 0">
      上一步
    </button>
    <span>步骤 {{ currentStep + 1 }} / {{ totalSteps }}</span>
    <button @click="nextStep" :disabled="currentStep === totalSteps - 1">
      下一步
    </button>
  </div>
</template>
```

### 7. 文件上传

```vue
<!-- FileUpload.vue -->
<script setup>
const emit = defineEmits(['file-selected', 'upload-progress', 'upload-complete'])

async function handleFileSelect(event) {
  const file = event.target.files[0]
  emit('file-selected', file)

  try {
    const result = await uploadFile(file, (progress) => {
      emit('upload-progress', progress)
    })
    emit('upload-complete', result)
  } catch (error) {
    // 错误处理
  }
}
</script>

<template>
  <input type="file" @change="handleFileSelect" />
</template>
```

### 8. 搜索组件

```vue
<!-- SearchInput.vue -->
<script setup>
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
  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, props.debounceTime)
}
</script>

<template>
  <input
    :value="props.modelValue"
    @input="onInput($event.target.value)"
    placeholder="搜索..."
  />
</template>
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
