### withDefaults

> 📖 [官方文档 - withDefaults](https://cn.vuejs.org/api/sfc-script-setup.html#default-props-values-using-type-declaration)

---

### 一、概述

`withDefaults` 是 Vue 3 提供的一个编译器宏，专门用于在使用**基于类型的 `defineProps` 声明**时，为可选 props 设置默认值。

在 Vue 3 的 `<script setup>` 中声明 props 有两种方式：

- **运行时声明**：使用对象语法，可以直接在属性上配置 `default`。
- **类型声明**：使用 TypeScript 接口（`interface`）定义 props 类型，但接口本身无法表达默认值。

`withDefaults` 正是为了弥补**类型声明方式下无法设置默认值**这一缺陷而诞生的。它让你在享受 TypeScript 类型推断的同时，也能为可选属性提供默认值。

> 💡 **提示：** `withDefaults` 是一个编译器宏，不需要手动 `import`，直接在 `<script setup>` 中使用即可。

---

### 二、核心原理

`withDefaults` 的工作机制可以理解为以下步骤：

1. **接收 `defineProps<Props>()` 的返回值**作为第一个参数。
2. **接收一个默认值对象**作为第二个参数，该对象的键对应接口中的可选属性。
3. **编译时转换**：Vue 编译器会将 `withDefaults` 的调用转换为等效的运行时 `defineProps` 声明，将默认值合并到 props 选项中。
4. **类型推断**：TypeScript 会自动推断出带有默认值的 props 的完整类型，确保默认值的类型与接口定义一致。

```
// 编译前（开发者写的）
withDefaults(defineProps<Props>(), { count: 0 })

// 编译后（Vue 编译器生成的）
defineProps({ count: { type: Number, default: 0 } })
```

核心要点：

- 只适用于**基于类型的 `defineProps`** 声明，不适用于运行时声明。
- 只需要为**可选属性（带 `?`）** 提供默认值，必选属性无需也不能设置默认值。
- 对于引用类型（对象、数组），默认值必须使用**工厂函数**（箭头函数）返回，避免多个组件实例共享同一个引用。

---

### 三、详细用法

#### 1. 基本用法

为简单的可选属性设置默认值，包括字符串、数字、布尔值等原始类型。

```vue
<script setup lang="ts">
interface Props {
  // 必选属性 — 不需要设置默认值
  title: string
  // 可选属性 — 通过 withDefaults 设置默认值
  count?: number
  isActive?: boolean
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  isActive: true,
  type: 'info'
})
</script>
```

使用该组件时：

```vue
<!-- 不传可选属性，将使用默认值 -->
<MyComponent title="标题" />
<!-- props.count === 0, props.isActive === true, props.type === 'info' -->

<!-- 传入可选属性，覆盖默认值 -->
<MyComponent title="标题" :count="10" :is-active="false" type="error" />
<!-- props.count === 10, props.isActive === false, props.type === 'error' -->
```

#### 2. 进阶用法

##### (1) 引用类型默认值（对象、数组）

对象和数组类型的默认值**必须使用工厂函数**返回，防止多个组件实例共享同一份引用数据。

```vue
<script setup lang="ts">
interface User {
  name: string
  age: number
  email?: string
}

interface Props {
  // ✅ 数组默认值 — 使用工厂函数
  items?: string[]
  // ✅ 对象默认值 — 使用工厂函数
  user?: User
}

const props = withDefaults(defineProps<Props>(), {
  items: () => ['默认项1', '默认项2'],
  user: () => ({ name: '访客', age: 0 })
})
</script>
```

> ⚠️ **注意：** 如果不使用工厂函数，多个组件实例将共享同一个对象/数组引用，修改其中一个会影响所有实例。

```typescript
// ❌ 错误：直接赋值对象
const props = withDefaults(defineProps<Props>(), {
  user: { name: '访客', age: 0 }  // 类型错误，且会导致共享引用
})

// ✅ 正确：使用工厂函数
const props = withDefaults(defineProps<Props>(), {
  user: () => ({ name: '访客', age: 0 })
})
```

##### (2) 函数类型默认值

函数类型的默认值也直接使用箭头函数即可，因为函数本身就是一种值。

```vue
<script setup lang="ts">
type Validator = (value: string) => boolean
type Formatter = (value: number) => string

interface Props {
  validator?: Validator
  formatter?: Formatter
}

const props = withDefaults(defineProps<Props>(), {
  validator: (value: string) => value.length > 0,
  formatter: (value: number) => value.toFixed(2)
})
</script>
```

##### (3) 联合类型默认值

```vue
<script setup lang="ts">
type Size = 'small' | 'medium' | 'large'
type Theme = 'light' | 'dark'

interface Props {
  size?: Size
  theme?: Theme
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  theme: 'light'
})
</script>
```

##### (4) 复杂嵌套对象默认值

```vue
<script setup lang="ts">
interface Pagination {
  page: number
  pageSize: number
  total: number
}

interface TableConfig {
  bordered: boolean
  striped: boolean
  pagination: Pagination
}

interface Props {
  config?: TableConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    bordered: true,
    striped: false,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  })
})
</script>
```

##### (5) 配合解构使用

Vue 3.5+ 支持直接解构 `defineProps` 返回值且保持响应性，配合 `withDefaults` 使用更加便捷。

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

// ✅ Vue 3.5+ 解构后仍保持响应式
const { title, count = 0 } = defineProps<Props>()
</script>
```

> 💡 **提示：** 在 Vue 3.5 之前，直接解构 props 会丢失响应性。`withDefaults` 本身返回的 props 对象是响应式的，应通过 `props.xxx` 访问。

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `props` | `DefinePropsReturn<T>` | 是 | `defineProps<T>()` 的返回值，基于类型声明的 props 对象 |
| `defaults` | `{ [K in optionalKeys]?: T[K] }` | 是 | 默认值对象，键名为可选属性名，值为对应的默认值 |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| 返回值 | `DefinePropsReturn<T>` | 带有默认值的 props 响应式对象，类型推断完整 |

**默认值写法规则：**

| 属性类型 | 默认值写法 | 示例 |
|----------|-----------|------|
| 原始类型（string / number / boolean） | 直接赋值 | `count: 0` |
| 数组（Array） | 工厂函数 | `items: () => [1, 2, 3]` |
| 对象（Object） | 工厂函数 | `user: () => ({ name: 'Guest' })` |
| 函数（Function） | 直接赋值函数 | `onClick: () => {}` |
| 联合类型 | 直接赋值有效值 | `size: 'medium'` |

---

### 四、实现效果

使用 `withDefaults` 后，组件在以下方面获得提升：

**1. 类型安全完整**

```typescript
// ✅ TypeScript 能够正确推断所有 props 的完整类型
interface Props {
  title: string
  count?: number   // 可选
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// props.title — 类型：string（必选）
// props.count  — 类型：number（有默认值，始终为 number，不会是 undefined）
```

**2. 调用方无需关心所有属性**

```vue
<!-- 父组件只需传入必选属性，其他使用默认值 -->
<Counter title="计数器" />

<!-- 等价于 -->
<Counter title="计数器" :count="0" />
```

**3. 组件行为一致且可预测**

```vue
<script setup lang="ts">
interface Props {
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  disabled: false,
  maxLength: 100
})
</script>

<template>
  <input
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxLength"
  />
</template>
```

无论父组件是否传入这些属性，组件始终有一个合理且确定的初始状态。

---

### 五、使用场景

#### 场景 1：通用按钮组件

```vue
<!-- Button.vue -->
<template>
  <button
    class="btn"
    :class="[`btn-${type}`, `btn-${size}`, { 'btn-block': block }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
type ButtonSize = 'small' | 'medium' | 'large'

interface Props {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>
```

```vue
<!-- 使用 -->
<Button>默认按钮</Button>
<Button type="danger" size="large">危险操作</Button>
<Button :disabled="true">禁用状态</Button>
```

#### 场景 2：分页组件

```vue
<!-- Pagination.vue -->
<template>
  <div class="pagination">
    <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
      上一页
    </button>
    <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
    <button :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
      下一页
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total?: number
  pageSize?: number
  currentPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  pageSize: 10,
  currentPage: 1
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}
</script>
```

#### 场景 3：表格列配置

```vue
<script setup lang="ts">
interface Column {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

interface Props {
  columns?: Column[]
  data?: Record<string, any>[]
  bordered?: boolean
  stripe?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => [],
  bordered: true,
  stripe: false
})
</script>
```

#### 场景 4：消息提示组件

```vue
<!-- Message.vue -->
<template>
  <Transition name="fade">
    <div v-if="visible" class="message" :class="`message-${type}`">
      <span class="message-icon">{{ iconMap[type] }}</span>
      <span class="message-text">{{ message }}</span>
      <span v-if="closable" class="message-close" @click="close">×</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type MessageType = 'success' | 'warning' | 'info' | 'error'

interface Props {
  message: string
  type?: MessageType
  duration?: number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  closable: true
})

const iconMap: Record<MessageType, string> = {
  success: '✓',
  warning: '⚠',
  info: 'ℹ',
  error: '✕'
}

const visible = ref(false)

const close = () => {
  visible.value = false
}

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(close, props.duration)
  }
})
</script>
```

#### 场景 5：表单输入组件

```vue
<!-- Input.vue -->
<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      class="input-field"
      @input="onInput"
    />
    <span v-if="showCount" class="input-count">
      {{ modelValue?.length || 0 }} / {{ maxLength }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  label?: string
  disabled?: boolean
  maxLength?: number
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '请输入',
  label: '',
  disabled: false,
  maxLength: 100,
  showCount: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
```

#### 场景 6：弹窗组件

```vue
<!-- Dialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="modelValue" class="dialog-overlay" @click="onOverlayClick">
        <div class="dialog-box" :style="{ width, top }">
          <div class="dialog-header">
            <span class="dialog-title">{{ title }}</span>
            <span v-if="showClose" class="dialog-close" @click="close">×</span>
          </div>
          <div class="dialog-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="dialog-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  width?: string
  top?: string
  showClose?: boolean
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  width: '50%',
  top: '15vh',
  showClose: true,
  closeOnClickOverlay: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}

const onOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    close()
  }
}
</script>
```

#### 场景 7：头像组件

```vue
<!-- Avatar.vue -->
<template>
  <div
    class="avatar"
    :class="`avatar-${shape}`"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img v-if="src" :src="src" :alt="alt" class="avatar-img" />
    <span v-else class="avatar-text">{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AvatarShape = 'circle' | 'square'

interface Props {
  src?: string
  alt?: string
  size?: number
  shape?: AvatarShape
  username?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '头像',
  size: 40,
  shape: 'circle',
  username: ''
})

const displayText = computed(() => {
  return props.username ? props.username.charAt(0).toUpperCase() : '?'
})
</script>
```

#### 场景 8：标签页组件

```vue
<!-- Tabs.vue -->
<template>
  <div class="tabs">
    <div class="tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ 'tab-active': modelValue === tab.key }"
        @click="emit('update:modelValue', tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tabs-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  key: string
  label: string
}

interface Props {
  modelValue: string
  tabs?: TabItem[]
  type?: 'line' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  type: 'line'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
```

#### 场景 9：进度条组件

```vue
<!-- Progress.vue -->
<template>
  <div class="progress">
    <div class="progress-bar" :class="`progress-${color}`">
      <div
        class="progress-inner"
        :style="{ width: `${percentage}%` }"
      >
        <span v-if="showText && !textInside" class="progress-text">
          {{ percentage }}%
        </span>
      </div>
      <span v-if="showText && textInside && percentage > 10" class="progress-text-inside">
        {{ percentage }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type ProgressColor = 'primary' | 'success' | 'warning' | 'danger'

interface Props {
  percentage: number
  color?: ProgressColor
  showText?: boolean
  textInside?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  showText: true,
  textInside: false
})
</script>
```

#### 场景 10：卡片组件

```vue
<!-- Card.vue -->
<template>
  <div class="card" :class="[`card-shadow-${shadow}`]">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <span class="card-title">{{ title }}</span>
      </slot>
    </div>
    <div class="card-body" :style="{ padding }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
type ShadowType = 'always' | 'hover' | 'never'

interface Props {
  title?: string
  shadow?: ShadowType
  padding?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  shadow: 'always',
  padding: '20px'
})
</script>
```

---

### 六、注意事项

#### 1. 对象和数组必须使用工厂函数

```typescript
// ❌ 错误：直接赋值对象或数组
withDefaults(defineProps<Props>(), {
  items: [] as string[],           // 会导致所有实例共享同一引用
  config: { bordered: true }       // 类型错误
})

// ✅ 正确：使用工厂函数
withDefaults(defineProps<Props>(), {
  items: () => [],
  config: () => ({ bordered: true })
})
```

#### 2. 只能配合基于类型的 defineProps 使用

```typescript
// ❌ 错误：运行时声明不能使用 withDefaults
const props = withDefaults(defineProps({
  count: { type: Number, default: 0 }
}), {
  // 编译错误
})

// ✅ 正确：类型声明 + withDefaults
interface Props { count?: number }
const props = withDefaults(defineProps<Props>(), { count: 0 })
```

#### 3. 必选属性不应设置默认值

```typescript
// ❌ 错误：为必选属性设置默认值没有意义，且可能导致混淆
interface Props {
  title: string  // 没有 ?，是必选的
}
withDefaults(defineProps<Props>(), {
  title: '默认标题'  // TypeScript 类型错误：title 不是可选属性
})

// ✅ 正确：只对可选属性（带 ?）设置默认值
interface Props {
  title: string    // 必选，由父组件传入
  count?: number   // 可选，可以设置默认值
}
withDefaults(defineProps<Props>(), {
  count: 0
})
```

#### 4. 默认值类型必须与接口定义一致

```typescript
// ❌ 错误：类型不匹配
interface Props {
  count?: number
  active?: boolean
}
withDefaults(defineProps<Props>(), {
  count: '0',       // 类型错误：string 不能赋值给 number
  active: 'true'    // 类型错误：string 不能赋值给 boolean
})

// ✅ 正确：类型严格匹配
withDefaults(defineProps<Props>(), {
  count: 0,
  active: true
})
```

#### 5. withDefaults 是编译器宏，不能在非 setup 上下文使用

```typescript
// ❌ 错误：不能在普通函数或 setup() 选项中使用
import { withDefaults } from 'vue'  // 不需要导入

export default {
  setup() {
    // withDefaults 在这里无法正常工作
  }
}

// ✅ 正确：在 <script setup> 中直接使用
<script setup lang="ts">
const props = withDefaults(defineProps<Props>(), { /* ... */ })
</script>
```

#### 6. props 是只读的，不要在组件内修改

```typescript
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// ❌ 错误：直接修改 props
props.count = 10  // Vue 警告：不能直接修改 props

// ✅ 正确：通过 emit 通知父组件修改，或使用局部变量
const localCount = ref(props.count)
localCount.value = 10
```

#### 7. 默认值不是响应式数据源

```typescript
// 默认值在编译时确定，不是响应式的
// 如果需要根据其他条件动态计算默认值，应使用 computed
interface Props {
  width?: number
}
const props = withDefaults(defineProps<Props>(), {
  width: 100  // 这是一个静态值，不会动态变化
})

// ✅ 如果需要动态值，使用 computed
const effectiveWidth = computed(() => props.width ?? containerWidth.value)
```

#### 8. 使用泛型组件时，withDefaults 的默认值仍然有效

```vue
<!-- GenericComponent.vue -->
<script setup lang="ts" generic="T extends { id: number }">
interface Props {
  items?: T[]
  selectedId?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  selectedId: -1
})
</script>
```

#### 9. 默认值会被父组件传入的值覆盖，包括 falsy 值

```typescript
// 当父组件传入 :count="0" 或 :active="false" 时
// 这些值会覆盖默认值，不会被默认值替换
// 这是正确的行为，因为 0 和 false 是显式传入的有效值

// ✅ 如果需要区分"未传入"和"传入了 falsy 值"，使用 undefined
interface Props {
  count?: number | undefined  // 明确允许 undefined
}
```

#### 10. 与 defineModel 配合时的注意事项

```typescript
// Vue 3.4+ 的 defineModel 也可以设置默认值，与 withDefaults 不冲突
// 但同一个属性不应同时出现在 defineModel 和 withDefaults 中

// ✅ 正确：使用 defineModel 的默认值
const modelValue = defineModel<string>({ default: '' })

// ✅ 正确：使用 withDefaults 设置非 model 相关的默认值
interface Props {
  size?: 'small' | 'large'
}
const props = withDefaults(defineProps<Props>(), {
  size: 'small'
})
```

---

### 七、相关 API 对比

| 对比维度 | `withDefaults` + 类型声明 | 运行时声明（对象语法） |
|---------|--------------------------|----------------------|
| 语法 | `withDefaults(defineProps<Props>(), { ... })` | `defineProps({ prop: { type, default } })` |
| TypeScript 支持 | 完整类型推断，类型即文档 | 类型推断有限，需要额外声明 |
| 默认值设置 | 在第二个参数对象中设置 | 在属性的 `default` 字段中设置 |
| IDE 提示 | 优秀（类型推断完整） | 一般（缺少精确的类型提示） |
| 学习成本 | 需要 TypeScript 基础 | 更直观，适合 JS 项目 |
| 适用场景 | TypeScript + `<script setup>` 项目 | JavaScript 或简单项目 |
| 生产包体积 | 无运行时开销（编译时移除） | 无运行时开销 |

```vue
<!-- 方式一：运行时声明 -->
<script setup>
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  active: { type: Boolean, default: false }
})
</script>

<!-- 方式二：类型声明 + withDefaults -->
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  active: false
})
</script>
```

> 💡 **提示：** 在 TypeScript 项目中，推荐使用**类型声明 + `withDefaults`** 的方式，可以获得更好的类型安全和开发体验。

---

### 八、总结

`withDefaults` 是 Vue 3 在 `<script setup>` + TypeScript 场景下为可选 props 设置默认值的标准方案。掌握以下核心要点即可熟练使用：

1. **适用范围**：仅用于基于类型的 `defineProps` 声明，是编译器宏，不需要导入。
2. **基本用法**：第一个参数是 `defineProps<Props>()`，第二个参数是默认值对象。
3. **引用类型**：对象、数组必须使用工厂函数（`() => ({})`）。
4. **只对可选属性**：只给带 `?` 的可选属性设置默认值，必选属性不需要。
5. **类型安全**：默认值的类型必须与接口中声明的类型严格匹配。

合理使用 `withDefaults` 可以让组件接口更加友好、默认行为更加明确，同时保持完整的 TypeScript 类型推断能力，是构建高质量 Vue 3 组件库的基础。
