# useModel

> 📖 [官方文档 - useModel()](https://cn.vuejs.org/api/composition-api-helpers.html#usemodel)

### 一、概述

`useModel()` 是 Vue 3.4 新增的组合式 API 辅助函数，它是 `defineModel()` 的**底层实现**。它的作用是：在组件中**简化 `v-model` 双向绑定的实现逻辑**，让你不再手动编写 `computed` 的 getter/setter 来处理 `props` 和 `emit` 的同步。

简单来说，当你需要在子组件中"读写"父组件通过 `v-model` 传进来的值时，`useModel()` 帮你一行代码搞定。

**为什么需要它？**

在没有 `useModel()` 之前，子组件要实现 `v-model` 支持，必须手写一个带 getter/setter 的 `computed`：

```ts
// ❌ 传统写法：冗长、容易出错
const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
```

有了 `useModel()`，一行代码就搞定：

```ts
// ✅ useModel 写法：简洁、直观
const modelValue = useModel(props, 'modelValue')
```

**适用场景：**

- 非 `<script setup>` 环境（如使用原始 `setup()` 函数）
- 需要更灵活地控制 model ref 的 getter/setter 行为
- 在 `<script setup>` 中，官方推荐优先使用 `defineModel()`，它更简洁且无需手动声明 `props` 和 `emits`

### 二、核心原理

`useModel()` 的核心原理可以用一句话概括：**它返回一个可写的 ref，读取时从 props 取值，写入时自动触发对应的 emit 事件**。

本质上，它等价于一个 `computed` + `ref` 的结合体：

```
┌──────────────────────────────────────────────────┐
│                    父组件                         │
│  const value = ref('hello')                       │
│  <Child v-model="value" />                        │
│       │                          ▲                │
│       │ 传递 props.modelValue    │ emit           │
│       │ = 'hello'                │ update:modelValue │
│       ▼                          │                │
│  ┌─────────────────────────────────────────────┐  │
│  │              子组件                          │  │
│  │  const model = useModel(props, 'modelValue')│  │
│  │                                             │  │
│  │  model.value          → 读取 props.modelValue│  │
│  │  model.value = 'new'  → emit('update:modelValue', 'new') │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**关键机制：**

1. **读取**：`model.value` 实际上读取的是 `props[key]`
2. **写入**：`model.value = newValue` 会自动调用 `emit('update:' + key, newValue)`
3. **响应式**：当父组件更新 props 时，model.value 也会同步更新
4. **类型安全**：返回值是一个 `ModelRef`，具备完整的 TypeScript 类型推导

### 三、详细用法

#### 1. 基本用法

最简单的场景：子组件支持 `v-model` 双向绑定。

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Child v-model="message" />
  <p>父组件收到的值：{{ message }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const message = ref('Hello Vue 3')
</script>
```

```vue
<!-- 子组件 Child.vue -->
<template>
  <div>
    <!-- 直接绑定 useModel 返回的 ref -->
    <input v-model="modelValue" />
    <p>子组件当前值：{{ modelValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

// ✅ 声明 props 和 emits
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// ✅ 使用 useModel，传入 props 和对应的 prop 名称
const modelValue = useModel(props, 'modelValue')

// 读取：modelValue.value → 得到 props.modelValue 的值
// 写入：modelValue.value = '新值' → 自动触发 emit('update:modelValue', '新值')
</script>
```

**等价的传统写法对比：**

```ts
// ❌ 传统写法：需要手写 computed 的 getter/setter
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = computed({
  get(): string {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  }
})
```

```ts
// ✅ useModel 写法：一行搞定，语义更清晰
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = useModel(props, 'modelValue')
```

#### 2. 进阶用法

##### 2.1 非 `<script setup>` 环境（原始 setup 函数）

`useModel()` 最典型的使用场景是非单文件组件或使用原始 `setup()` 函数的情况：

```ts
// MyComponent.ts
import { defineComponent, useModel } from 'vue'

export default defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // ✅ 在原始 setup 函数中使用 useModel
    const modelValue = useModel(props, 'modelValue')

    // 可以像普通 ref 一样使用
    function increment() {
      modelValue.value++
    }

    return {
      modelValue,
      increment
    }
  },
  template: `
    <div>
      <p>{{ modelValue }}</p>
      <button @click="increment">+1</button>
    </div>
  `
})
```

##### 2.2 自定义 v-model 参数名

当 `v-model` 使用自定义参数名时（如 `v-model:title`），`key` 需要传入对应的参数名：

```vue
<!-- 父组件 -->
<template>
  <Article v-model:title="articleTitle" v-model:content="articleContent" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Article from './Article.vue'

const articleTitle = ref('默认标题')
const articleContent = ref('默认内容')
</script>
```

```vue
<!-- 子组件 Article.vue -->
<template>
  <div>
    <input v-model="title" placeholder="标题" />
    <textarea v-model="content" placeholder="内容" />
  </div>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  title: string
  content: string
}>()
const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'update:content', value: string): void
}>()

// ✅ key 传入对应的 prop 名称
const title = useModel(props, 'title')
const content = useModel(props, 'content')
</script>
```

##### 2.3 自定义 getter/setter（转换器模式）

`options` 参数允许你自定义 getter 和 setter 的行为，实现值的转换：

```vue
<!-- 子组件 PriceInput.vue -->
<template>
  <input v-model="price" type="number" />
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// ✅ 自定义 getter/setter：分 ↔ 元 的转换
const price = useModel(props, 'modelValue', {
  // getter：将"分"转换为"元"用于显示
  get(value: number): number {
    return value / 100
  },
  // setter：将"元"转换回"分"传给父组件
  set(value: number): number {
    return Math.round(value * 100)
  }
})

// 当父组件传入 1000（分），子组件 input 显示 10（元）
// 当用户输入 20（元），父组件收到 2000（分）
</script>
```

##### 2.4 字符串大小写转换

```vue
<!-- 子组件 CapitalizeInput.vue -->
<template>
  <input v-model="text" placeholder="输入会自动转大写" />
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// ✅ setter 中做数据转换：首字母大写
const text = useModel(props, 'modelValue', {
  set(value: string): string {
    if (!value) return value
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
})
</script>
```

##### 2.4 搭配修饰符使用

当 `v-model` 带修饰符时（如 `v-model.trim`），需要声明对应的 `modelModifiers` prop：

```vue
<!-- 父组件 -->
<template>
  <MyInput v-model.trim="text" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyInput from './MyInput.vue'

const text = ref('')
</script>
```

```vue
<!-- 子组件 MyInput.vue -->
<template>
  <input
    :value="modelValue"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: string
  modelModifiers?: { trim?: boolean; capitalize?: boolean }
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = useModel(props, 'modelValue')

function handleInput(event: Event) {
  let value = (event.target as HTMLInputElement).value

  // ✅ 根据修饰符处理值
  if (props.modelModifiers?.trim) {
    value = value.trim()
  }
  if (props.modelModifiers?.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }

  modelValue.value = value
}
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `props` | `Record<string, any>` | 是 | 组件的 `props` 对象，必须包含对应的 prop |
| `key` | `string` | 是 | 要绑定的 prop 名称，如 `'modelValue'`、`'title'` 等 |
| `options` | `DefineModelOptions` | 否 | 配置对象，可自定义 getter/setter 转换逻辑 |

**DefineModelOptions 类型：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `get` | `(v: T) => any` | 自定义 getter，对 props 值进行转换后再返回 |
| `set` | `(v: T) => any` | 自定义 setter，对写入的值进行转换后再 emit |

**返回值：**

| 类型 | 说明 |
|------|------|
| `ModelRef<T>` | 一个可写的 ref，读取时返回 props 值，写入时自动触发 emit |

> 💡 **提示：** `ModelRef` 继承自 `Ref`，可以像普通 ref 一样在模板中直接使用，也可以通过 `.value` 在脚本中读写。

### 四、实现效果

```vue
<!-- 父组件 Demo.vue -->
<template>
  <div>
    <h3>useModel 演示</h3>
    <p>父组件 message：{{ message }}</p>
    <Child v-model="message" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const message = ref('Hello')
</script>
```

```vue
<!-- 子组件 Child.vue -->
<template>
  <input v-model="modelValue" />
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = useModel(props, 'modelValue')
</script>
```

**运行效果：**

```
1. 初始状态：
   父组件 message: 'Hello'
   子组件 input 显示: 'Hello'

2. 用户在子组件 input 中输入 'World'：
   子组件 modelValue.value 变为 'World'
   → 自动触发 emit('update:modelValue', 'World')
   → 父组件 message 变为 'World'
   → 页面显示 '父组件 message: World'

3. 父组件通过代码修改 message = 'Vue 3'：
   → props.modelValue 更新为 'Vue 3'
   → 子组件 modelValue.value 自动变为 'Vue 3'
   → input 显示 'Vue 3'
```

**自定义 getter/setter 的效果：**

```ts
// 价格输入：父组件用"分"存储，子组件以"元"展示
const price = useModel(props, 'modelValue', {
  get(v) { return v / 100 },      // 1000分 → 显示 10
  set(v) { return Math.round(v * 100) }  // 输入 10 → 传回 1000分
})

// 父组件 modelValue: 1000 → 子组件 input 显示: 10
// 用户输入 20 → 父组件 modelValue 变为: 2000
```

### 五、使用场景

#### 场景一：封装表单输入组件

最常见的场景——封装一个可复用的输入组件：

```vue
<!-- CustomInput.vue -->
<template>
  <div class="input-wrapper">
    <label v-if="label">{{ label }}</label>
    <input
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = useModel(props, 'modelValue')
</script>
```

```vue
<!-- 使用 -->
<template>
  <CustomInput
    v-model="formData.name"
    label="姓名"
    placeholder="请输入姓名"
  />
  <CustomInput
    v-model="formData.email"
    label="邮箱"
    type="email"
    :error="emailError"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import CustomInput from './CustomInput.vue'

const formData = reactive({
  name: '',
  email: ''
})
const emailError = ''
</script>
```

#### 场景二：封装弹窗/对话框组件

弹窗的显示/隐藏是最经典的双向绑定场景：

```vue
<!-- Modal.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div class="modal-footer">
            <slot name="footer">
              <button @click="close">关闭</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  closeOnClickOverlay?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = useModel(props, 'modelValue')

function close() {
  visible.value = false // 自动触发 emit('update:modelValue', false)
}

function handleOverlayClick() {
  if (props.closeOnClickOverlay !== false) {
    close()
  }
}
</script>
```

```vue
<!-- 使用 -->
<template>
  <button @click="showDialog = true">打开弹窗</button>
  <Modal v-model="showDialog" title="用户信息">
    <p>这是弹窗内容</p>
    <template #footer>
      <button @click="showDialog = false">确认</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'

const showDialog = ref(false)
</script>
```

#### 场景三：封装开关/切换组件

```vue
<!-- Switch.vue -->
<template>
  <button
    class="switch"
    :class="{ active: modelValue }"
    @click="toggle"
    :disabled="disabled"
  >
    <span class="switch-thumb" />
  </button>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const modelValue = useModel(props, 'modelValue')

function toggle() {
  if (!props.disabled) {
    modelValue.value = !modelValue.value
  }
}
</script>
```

```vue
<!-- 使用 -->
<template>
  <div>
    <label>深色模式</label>
    <Switch v-model="isDarkMode" />
    <label>通知推送</label>
    <Switch v-model="enableNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Switch from './Switch.vue'

const isDarkMode = ref(false)
const enableNotification = ref(true)
</script>
```

#### 场景四：封装下拉选择组件

```vue
<!-- Select.vue -->
<template>
  <div class="select-wrapper">
    <select v-model="selectedValue">
      <option disabled value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

interface Option {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue: string | number
  options: Option[]
  placeholder?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const selectedValue = useModel(props, 'modelValue')
</script>
```

```vue
<!-- 使用 -->
<template>
  <Select
    v-model="selectedCity"
    :options="cityOptions"
    placeholder="请选择城市"
  />
  <p>已选择：{{ selectedCity }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Select from './Select.vue'

const selectedCity = ref('')
const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' }
]
</script>
```

#### 场景五：封装标签输入组件（多个 v-model）

一个组件同时支持多个 `v-model`：

```vue
<!-- TagInput.vue -->
<template>
  <div class="tag-input">
    <div class="tags">
      <span v-for="tag in tags" :key="tag" class="tag">
        {{ tag }}
        <button @click="removeTag(tag)">&times;</button>
      </span>
    </div>
    <input
      v-model="newTag"
      :placeholder="placeholder"
      @keydown.enter="addTag"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useModel } from 'vue'

const props = defineProps<{
  tags: string[]
  maxCount: number
  placeholder?: string
}>()
const emit = defineEmits<{
  (e: 'update:tags', value: string[]): void
  (e: 'update:maxCount', value: number): void
}>()

const tags = useModel(props, 'tags')
const maxCount = useModel(props, 'maxCount')
const newTag = ref('')

function addTag() {
  const value = newTag.value.trim()
  if (value && !tags.value.includes(value) && tags.value.length < maxCount.value) {
    tags.value = [...tags.value, value]
    newTag.value = ''
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag)
}
</script>
```

```vue
<!-- 使用 -->
<template>
  <TagInput v-model:tags="userTags" v-model:max-count="maxTags" />
  <p>最多 {{ maxTags }} 个标签</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TagInput from './TagInput.vue'

const userTags = ref<string[]>(['Vue', 'TypeScript'])
const maxTags = ref(5)
</script>
```

#### 场景六：日期选择器组件（值转换）

使用自定义 getter/setter 处理日期格式转换：

```vue
<!-- DatePicker.vue -->
<template>
  <input
    type="date"
    :value="dateStr"
    @input="handleChange"
  />
</template>

<script setup lang="ts">
import { useModel, computed } from 'vue'

const props = defineProps<{
  modelValue: number // 时间戳
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// ✅ 使用 getter/setter 转换：时间戳 ↔ 日期字符串
const dateStr = useModel(props, 'modelValue', {
  // getter：时间戳 → 'YYYY-MM-DD' 格式字符串
  get(timestamp: number): string {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  // setter：'YYYY-MM-DD' 格式字符串 → 时间戳
  set(dateString: string): number {
    return new Date(dateString).getTime()
  }
})

function handleChange(event: Event) {
  dateStr.value = (event.target as HTMLInputElement).value
}
</script>
```

```vue
<!-- 使用 -->
<template>
  <DatePicker v-model="selectedDate" />
  <p>选中的时间戳：{{ selectedDate }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

// 存储为时间戳
const selectedDate = ref(Date.now())
</script>
```

#### 场景七：数值滑块组件（范围限制）

```vue
<!-- Slider.vue -->
<template>
  <div class="slider">
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      v-model.number="sliderValue"
    />
    <span class="value-display">{{ sliderValue }} {{ unit }}</span>
  </div>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  unit?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// ✅ setter 中限制值范围
const sliderValue = useModel(props, 'modelValue', {
  set(value: number): number {
    const minVal = props.min ?? 0
    const maxVal = props.max ?? 100
    return Math.min(Math.max(value, minVal), maxVal)
  }
})
</script>
```

```vue
<!-- 使用 -->
<template>
  <Slider v-model="volume" :min="0" :max="100" unit="%" />
  <Slider v-model="brightness" :min="0" :max="255" unit="亮度" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Slider from './Slider.vue'

const volume = ref(50)
const brightness = ref(128)
</script>
```

#### 场景八：非 SFC 组件（render 函数 / JSX）

这是 `useModel()` 相比 `defineModel()` 的独特优势场景——在非单文件组件中使用：

```ts
// Counter.ts — 不使用 .vue 单文件
import { defineComponent, useModel, h } from 'vue'

export default defineComponent({
  name: 'Counter',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:modelValue'],
  setup(props) {
    // ✅ 在非 SFC 的 setup 函数中使用
    const count = useModel(props, 'modelValue')

    const increment = () => {
      count.value += props.step
    }

    const decrement = () => {
      count.value -= props.step
    }

    return () => h('div', { class: 'counter' }, [
      h('button', { onClick: decrement }, '-'),
      h('span', { class: 'count' }, count.value),
      h('button', { onClick: increment }, '+')
    ])
  }
})
```

```vue
<!-- 使用 -->
<template>
  <Counter v-model="totalCount" :step="5" />
  <p>当前计数：{{ totalCount }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Counter from './Counter'

const totalCount = ref(0)
</script>
```

#### 场景九：抽屉组件（带动画）

```vue
<!-- Drawer.vue -->
<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="visible" class="drawer-overlay" @click="handleOverlayClick">
        <div class="drawer-panel" :style="{ width }" @click.stop>
          <div class="drawer-header">
            <h3>{{ title }}</h3>
            <button @click="close">&times;</button>
          </div>
          <div class="drawer-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  width?: string
  closeOnClickOverlay?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = useModel(props, 'modelValue')

function close() {
  visible.value = false
}

function handleOverlayClick() {
  if (props.closeOnClickOverlay !== false) {
    close()
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
```

#### 场景十：颜色选择器组件（格式转换）

```vue
<!-- ColorPicker.vue -->
<template>
  <div class="color-picker">
    <input
      type="color"
      :value="hexColor"
      @input="handleInput"
    />
    <span class="color-value">{{ hexColor }}</span>
  </div>
</template>

<script setup lang="ts">
import { useModel } from 'vue'

const props = defineProps<{
  modelValue: { r: number; g: number; b: number }
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: { r: number; g: number; b: number }): void
}>()

// ✅ getter/setter 实现 RGB 对象 ↔ HEX 字符串 转换
const hexColor = useModel(props, 'modelValue', {
  get(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
  },
  set(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 }
  }
})

function handleInput(event: Event) {
  hexColor.value = (event.target as HTMLInputElement).value
}
</script>
```

```vue
<!-- 使用 -->
<template>
  <ColorPicker v-model="themeColor" />
  <p>RGB：{{ themeColor }}</p>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ColorPicker from './ColorPicker.vue'

const themeColor = reactive({ r: 66, g: 185, b: 131 })
</script>
```

### 六、注意事项

#### 1. API 签名注意：第二参数是 key，不是 emit

`useModel()` 的签名是 `useModel(props, key, options?)`，**第二个参数是字符串 key（prop 名称）**，不是 `emit` 函数。`useModel` 内部会自动通过 Vue 的组件实例获取 emit。

```ts
// ❌ 错误：第二个参数不是 emit
const modelValue = useModel(props, emit)

// ✅ 正确：第二个参数是 prop 的 key 名称
const modelValue = useModel(props, 'modelValue')
```

#### 2. 必须手动声明对应的 props 和 emits

与 `defineModel()` 不同，`useModel()` **不会自动声明** props 和 emits，你需要自己声明：

```ts
// ❌ 错误：没有声明 props 和 emits
const props = defineProps({})
const modelValue = useModel(props, 'modelValue')

// ✅ 正确：必须声明对应的 prop 和 emit
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
const modelValue = useModel(props, 'modelValue')
```

#### 3. 仅支持 Vue 3.4 及以上版本

`useModel()` 是 Vue 3.4 新增的 API，在更低版本中不可用：

```bash
# 检查你的 Vue 版本
npm list vue

# 如果低于 3.4，需要升级
npm install vue@latest
```

#### 4. `<script setup>` 中优先使用 defineModel()

如果你使用的是 `<script setup>`，官方推荐优先使用 `defineModel()`，它更简洁：

```ts
// ✅ <script setup> 中推荐用 defineModel
const modelValue = defineModel<string>()

// ❌ <script setup> 中用 useModel 更繁琐（需要手动声明 props 和 emits）
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
const modelValue = useModel(props, 'modelValue')
```

#### 5. key 必须与 props 中声明的名称一致

`useModel()` 的第二个参数必须与你在 `defineProps` 中声明的 prop 名称完全一致：

```ts
const props = defineProps<{ title: string }>()

// ❌ 错误：key 与 prop 名称不匹配
const model = useModel(props, 'modelValue') // 找不到 'modelValue' prop

// ✅ 正确：key 必须与 prop 名称一致
const model = useModel(props, 'title') // 匹配 'title' prop
// 对应的 emit 是 'update:title'
```

#### 6. emit 事件名必须遵循 `update:` + key 的约定

Vue 的 `v-model` 机制要求 emit 事件名必须是 `update:` 加上 prop 名称：

```ts
const props = defineProps<{ title: string }>()

// ❌ 错误：emit 名称不匹配
const emit = defineEmits<{ (e: 'change', value: string): void }>()

// ✅ 正确：必须是 'update:' + prop 名称
const emit = defineEmits<{ (e: 'update:title', value: string): void }>()
```

#### 7. 自定义 getter/setter 的执行时机

- `get` 在**读取** `model.value` 时执行，用于将 props 值转换为子组件需要的格式
- `set` 在**写入** `model.value = newValue` 时执行，用于将新值转换后再 emit 给父组件

```ts
const value = useModel(props, 'modelValue', {
  get(v) {
    console.log('getter 被调用') // 每次 .value 读取时触发
    return v * 2
  },
  set(v) {
    console.log('setter 被调用') // 每次 .value = xxx 赋值时触发
    return v / 2
  }
})

// 读取时：value.value → 触发 get
// 写入时：value.value = 10 → 触发 set(10)，然后 emit('update:modelValue', set 返回值)
```

#### 8. 避免在 getter/setter 中产生副作用

getter 和 setter 应该是**纯函数**，不要在里面做异步操作、DOM 操作等：

```ts
// ❌ 错误：在 setter 中做异步操作
const value = useModel(props, 'modelValue', {
  async set(v) {
    await fetch('/api/save', { body: v }) // 不要这样做！
    return v
  }
})

// ✅ 正确：setter 只做同步的值转换
const value = useModel(props, 'modelValue', {
  set(v) {
    return v.trim().toLowerCase()
  }
})
```

#### 9. 响应式保持：不要解构 props 后再传给 useModel

`useModel()` 需要接收完整的 props 对象来保持响应式：

```ts
// ❌ 错误：解构后丢失响应式
const { modelValue } = props
const model = useModel({ modelValue }, 'modelValue')

// ✅ 正确：直接传递完整的 props 对象
const model = useModel(props, 'modelValue')
```

#### 10. TypeScript 类型推导

在使用 TypeScript 时，`useModel()` 返回的 ref 能自动推导出正确的类型：

```ts
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const count = useModel(props, 'modelValue')
// count.value 的类型自动推导为 number

// ❌ 类型错误：不能赋值 string
count.value = 'hello' // Type 'string' is not assignable to type 'number'

// ✅ 类型正确
count.value = 42
```

### 七、相关 API 对比

#### useModel vs defineModel vs computed getter/setter

| 特性 | `useModel()` | `defineModel()` | `computed` getter/setter |
|------|-------------|----------------|------------------------|
| 可用版本 | Vue 3.4+ | Vue 3.4+ | Vue 3.0+ |
| 适用环境 | `<script setup>` 和 非 SFC | 仅 `<script setup>` | 所有环境 |
| 自动声明 props/emits | 否，需手动声明 | 是，自动声明 | 否，需手动声明 |
| 自定义 getter/setter | 支持（options 参数） | 支持（第三个参数） | 天然支持 |
| 代码量 | 中等 | 最少 | 最多 |
| 底层关系 | 底层实现 | 基于 `useModel` 封装 | 手动实现 |

**选择建议：**

- 在 `<script setup>` 中 → 优先用 `defineModel()`（最简洁）
- 在非 SFC / 原始 `setup()` 中 → 用 `useModel()`
- Vue 3.4 以下版本 → 用 `computed` getter/setter

```ts
// 方式一：defineModel（推荐，最简洁）
const modelValue = defineModel<string>()

// 方式二：useModel（非 SFC 环境）
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
const modelValue = useModel(props, 'modelValue')

// 方式三：computed getter/setter（Vue 3.4 以下）
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
const modelValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
```

### 八、总结

`useModel()` 是 Vue 3.4 提供的底层辅助函数，用于简化组件中 `v-model` 双向绑定的实现。核心要点回顾：

1. **本质**：它是一个语法糖，底层等同于 `computed` getter/setter，读取 props、写入 emit
2. **签名**：`useModel(props, key, options?)` — 第二个参数是字符串 key，不是 emit
3. **适用场景**：非 `<script setup>` 环境（原始 setup 函数、render 函数、JSX）
4. **进阶能力**：通过 `options.get/set` 可以自定义值转换逻辑（如单位转换、格式转换）
5. **前提条件**：必须手动声明对应的 props 和 emits，且 emit 名必须是 `update:` + key
6. **优先级**：在 `<script setup>` 中优先使用 `defineModel()`，它更简洁

> 💡 **提示：** 记住一句话——`useModel()` 是 `defineModel()` 的底层实现，如果你用 `<script setup>`，直接用 `defineModel()` 就好；如果你在非 SFC 环境或需要更灵活的控制，就用 `useModel()`。
