# useAttrs

## 作用

`useAttrs()` 用于在 `<script setup>` 中访问组件的 attrs（属性）。attrs 包含了父组件传递但未在 props 或 emits 中声明的所有属性和事件监听器。

📖 [useAttrs](https://cn.vuejs.org/api/composition-api-helpers.html#useattrs)

## 用法

### 基本用法

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs.class)    // 父组件传递的 class
console.log(attrs.style)    // 父组件传递的 style
console.log(attrs.id)       // 父组件传递的 id
console.log(attrs.onClick)  // 父组件传递的事件监听器
</script>

<template>
  <div v-bind="attrs">
    <!-- attrs 会被应用到这个 div 上 -->
  </div>
</template>
```

### 透传属性到子元素

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
  <!-- 将父组件的 attrs 透传到内部元素 -->
  <button v-bind="attrs">
    Click me
  </button>
</template>
```

```html
<!-- 使用 -->
<!-- <MyButton class="primary" type="submit" /> -->
<!-- 渲染为: <button class="primary" type="submit">Click me</button> -->
```

### 选择性透传属性

> ⚠️ **注意：** 不要直接解构 `attrs`（如 `const { class: _, ...restAttrs } = attrs`）。解构得到的是一次性的普通值快照，父组件后续更新 attrs 时不会跟着变化。如需剔除部分属性，用 `computed` 包裹（见下方「注意事项」）。

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 剔除 class，只透传其余属性
const restAttrs = computed(() => {
  const { class: _, ...rest } = attrs
  return rest
})
</script>

<template>
  <!-- 使用特定属性 -->
  <div :class="attrs.class" :style="attrs.style">
    <!-- 透传其他属性 -->
    <button v-bind="restAttrs">Button</button>
  </div>
</template>
```

### 与 props 结合使用

```vue
<script setup>
import { useAttrs } from 'vue'

const props = defineProps({
  // 声明的 props
  modelValue: String,
  disabled: Boolean
})

const attrs = useAttrs()

// attrs 中不包含 modelValue 和 disabled
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :disabled="disabled"
    v-bind="attrs"
  />
</template>
```

### 与 emits 结合使用

```vue
<script setup>
import { useAttrs } from 'vue'

const emit = defineEmits(['update', 'change'])

const attrs = useAttrs()

// attrs 中不包含 @update 和 @change（已被 emits 声明"消费"）
// 但未声明的事件（如父组件传的 @click）会以 attrs.onClick 的形式出现
console.log(attrs.onClick) // (e: Event) => void 或 undefined
</script>

<template>
  <!-- 通过 v-bind="attrs" 透传，事件监听器会一并应用 -->
  <div v-bind="attrs"></div>
</template>
```

### 继承属性控制

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
  <!-- inheritAttrs: false 时需要手动绑定 -->
  <div class="wrapper" v-bind="attrs">
    <div class="content">
      Content
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false  // 禁用自动属性继承
}
</script>
```

### TypeScript 类型支持

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

// attrs 的类型是 Record<string, unknown>
const attrs = useAttrs()

// 访问特定属性
const className = attrs.class as string | undefined
const onClick = attrs.onClick as ((event: Event) => void) | undefined
</script>
```

### 在 setup 函数中使用

```javascript
import { useAttrs } from 'vue'

export default {
  setup() {
    const attrs = useAttrs()

    console.log(attrs.id)

    return { attrs }
  }
}
```

### 与 ref 结合使用

```vue
<script setup>
import { ref, useAttrs, onMounted } from 'vue'

const inputRef = ref(null)
const attrs = useAttrs()

onMounted(() => {
  // 将 attrs 应用到 ref 元素
  if (inputRef.value && attrs.placeholder) {
    inputRef.value.placeholder = attrs.placeholder
  }
})
</script>

<template>
  <input ref="inputRef" />
</template>
```

## 注意事项

### 1. attrs 不是响应式对象，且不能被侦听

attrs 对象**总是反映最新的透传 attribute**（每次组件更新时更新），但它**不是响应式对象**（考虑到性能因素）。你不能用 `watch` / `watchEffect` 侦听它的变化，解构它得到的也只是一次性的快照。

```javascript
const attrs = useAttrs()

// ❌ 无效：attrs 不是响应式对象，watchEffect 不会在父组件更新时重新执行
watchEffect(() => {
  console.log(attrs.class)
})

// ❌ 无效：解构出的 restAttrs 是快照，父组件后续更新不会反映进来
const { class: _, ...restAttrs } = attrs
```

> 💡 **提示：** 官方建议——如果需要响应性，可以使用 prop；或者在 `onUpdated()` 钩子中结合最新的 attrs 执行副作用。大多数场景下直接在模板里 `v-bind="attrs"` 即可，无需在脚本中处理。

### 2. 不包含 props 和 emits

```vue
<script setup>
const props = defineProps(['value'])
const emit = defineEmits(['update'])

const attrs = useAttrs()

// 如果父组件传递：
// <MyComponent value="test" @update="handleUpdate" class="my-class" />
//
// props.value = 'test'
// attrs 中没有 value 和 @update
// attrs.class = 'my-class'
</script>
```

### 3. 与 v-model 的交互

```vue
<!-- 父组件 -->
<MyComponent v-model="text" class="primary" />
```

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

// attrs 中没有 modelValue 和 update:modelValue
// 只有 class="primary"
</script>
```

### 4. attrs 里有什么

`class`、`style`、`id`、`data-*`、`aria-*` 等未声明为 props 的 attribute，以及未声明为 emits 的事件监听器（以 `on` 开头）都会出现在 attrs 中。

```javascript
const attrs = useAttrs()

attrs.class       // class
attrs.style       // style
attrs['data-id']  // data-* 属性保留原始大小写和连字符，需用方括号访问
attrs.onClick     // 未声明的 @click 监听器
```

> ⚠️ **注意：** `key`、`ref` 不属于 attrs，它们由 Vue 的虚拟 DOM 层单独处理，不会出现在 `useAttrs()` 的返回值中。

### 5. 事件监听器

```javascript
const attrs = useAttrs()

// 事件监听器以 on 开头
attrs.onClick     // click 事件
attrs.onInput     // input 事件
attrs.onSubmit    // submit 事件
```

### 6. 与多根节点的配合

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
  <!-- 多根节点时需要明确绑定 -->
  <header v-bind="attrs">
    <h1>Title</h1>
  </header>
  <main>
    Content
  </main>
  <footer v-bind="attrs">
    Footer
  </footer>
</template>

<script>
export default {
  inheritAttrs: false  // 多根节点时通常禁用自动继承
}
</script>
```

### 7. 动态属性名

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// attrs 中的属性名是动态的
Object.keys(attrs).forEach(key => {
  console.log(key, attrs[key])
})
</script>
```

### 8. 与类型声明结合

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

interface MyAttrs {
  class?: string
  style?: string | Record<string, any>
  placeholder?: string
  [key: string]: any
}

const attrs = useAttrs() as MyAttrs

// 现在类型更明确
attrs.class?.toLowerCase()
</script>
```

## 使用场景

### 1. 创建包装组件

```vue
<!-- BaseButton.vue -->
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
  <button
    class="base-button"
    v-bind="attrs"
  >
    <slot />
  </button>
</template>
```

```html
<!-- 使用 -->
<BaseButton class="primary" type="submit" @click="handleSubmit">
  提交
</BaseButton>
```

### 2. 自定义输入组件

`label` 已声明为 prop，因此不会出现在 attrs 中，其余属性（如 `placeholder`、`maxlength`）通过 `v-bind="attrs"` 透传给原生 `<input>`：

```vue
<!-- CustomInput.vue -->
<script setup>
import { useAttrs } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String
})

const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()
</script>

<template>
  <div class="custom-input">
    <label v-if="label">{{ label }}</label>
    <input
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      v-bind="attrs"
    />
  </div>
</template>
```

### 3. 卡片组件

```vue
<!-- Card.vue -->
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
  <div class="card" v-bind="attrs">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

```html
<!-- 使用 -->
<Card class="shadow" @click="handleClick">
  Content
</Card>
```

### 4. 带样式的组件

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 合并样式
const mergedStyle = computed(() => {
  const baseStyle = {
    transition: 'all 0.3s ease'
  }

  const attrsStyle = attrs.style || {}

  return {
    ...baseStyle,
    ...(typeof attrsStyle === 'string' ? parseStyle(attrsStyle) : attrsStyle)
  }
})

function parseStyle(styleString) {
  // 简单的样式字符串解析
  return {}
}
</script>

<template>
  <div :style="mergedStyle" v-bind="attrs">
    <slot />
  </div>
</template>
```

### 5. 条件性属性传递

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  }
})

const attrs = useAttrs()

const buttonClass = computed(() => {
  return `btn btn-${props.variant}`
})

// 排除 class，单独处理（computed 包裹，避免一次性解构快照）
const restAttrs = computed(() => {
  const { class: _, ...rest } = attrs
  return rest
})
</script>

<template>
  <button :class="buttonClass" v-bind="restAttrs">
    <slot />
  </button>
</template>
```

### 6. 工具提示组件

```vue
<!-- Tooltip.vue -->
<script setup>
import { useAttrs, ref, onMounted } from 'vue'

const attrs = useAttrs()
const tooltipRef = ref(null)

onMounted(() => {
  // 初始化工具提示库（读取一次性快照即可，无响应式需求）
  if (tooltipRef.value && attrs.title) {
    new Tooltip(tooltipRef.value, {
      title: attrs.title
    })
  }
})
</script>

<template>
  <!-- title 留给 tooltip 库使用，其余属性透传 -->
  <span ref="tooltipRef" v-bind="attrs">
    <slot />
  </span>
</template>
```

### 7. 表单控件包装

```vue
<!-- FormControl.vue -->
<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  label: String,
  error: String,
  hint: String
})

const attrs = useAttrs()

// 提取特定属性用于不同元素（computed 包裹，避免解构快照不更新）
const inputAttrs = computed(() => {
  const { class: className, ...rest } = attrs
  return rest
})
</script>

<template>
  <div class="form-control">
    <label v-if="label">{{ label }}</label>
    <slot v-bind="{ attrs: inputAttrs }" />
    <p v-if="hint" class="hint">{{ hint }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>
```

### 8. 响应式组件

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

const responsiveAttrs = computed(() => {
  const newAttrs = { ...attrs }

  // 根据屏幕大小调整属性
  if (window.innerWidth < 768) {
    newAttrs.size = 'small'
  } else {
    newAttrs.size = 'large'
  }

  return newAttrs
})
</script>

<template>
  <component :is="tag" v-bind="responsiveAttrs">
    <slot />
  </component>
</template>
```

### 9. 属性验证和转换

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// 验证和转换属性
const validatedAttrs = (() => {
  const result = {}

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') {
      // 转换 class
      result[key] = normalizeClass(value)
    } else if (key.startsWith('data-')) {
      // 保留 data 属性
      result[key] = value
    } else if (typeof value === 'boolean') {
      // 处理布尔属性
      if (value) result[key] = ''
    } else {
      result[key] = value
    }
  }

  return result
})()
</script>

<template>
  <div v-bind="validatedAttrs">
    <slot />
  </div>
</template>
```

### 10. 带前缀的属性

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 提取特定前缀的属性
const dataAttrs = computed(() => {
  const result = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('data-')) {
      result[key] = value
    }
  }
  return result
})

const ariaAttrs = computed(() => {
  const result = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('aria-')) {
      result[key] = value
    }
  }
  return result
})
</script>

<template>
  <div v-bind="dataAttrs">
    <button v-bind="ariaAttrs">
      <slot />
    </button>
  </div>
</template>
```

## useAttrs 与其他 API 的区别

| API | 用途 |
|-----|------|
| useAttrs | 访问未声明的 attrs（属性和事件） |
| useSlots | 访问插槽内容 |
| defineProps | 声明并访问 props |
| defineEmits | 声明并访问 emits |
| setup(props, { attrs }) | 非 `<script setup>` 写法中通过上下文访问 attrs |

## 最佳实践

1. **透传包装组件**：创建包装组件时使用 attrs 透传
2. **选择性绑定**：根据需要选择性绑定特定属性
3. **类型安全**：TypeScript 中明确声明 attrs 类型
4. **多根节点**：多根节点时使用 inheritAttrs: false
5. **属性过滤**：过滤不需要透传的属性
