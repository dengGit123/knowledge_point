# useAttrs

## 作用
`useAttrs()` 用于在 `<script setup>` 中访问组件的 attrs（属性）。attrs 包含了父组件传递但未在 props 或 emits 中声明的所有属性和事件监听器。

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

<!-- 使用 -->
<!-- <MyButton class="primary" type="submit" /> -->
<!-- 渲染为: <button class="primary" type="submit">Click me</button> -->
```

### 选择性透传属性

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// 提取特定属性
const className = attrs.class
const style = attrs.style

// 排除特定属性
const { class: _, ...restAttrs } = attrs
</script>

<template>
  <!-- 使用特定属性 -->
  <div :class="className" :style="style">
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
    v-model="modelValue"
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

// attrs 中不包含 @update 和 @change 事件
</script>

<template>
  <div v-bind="attrs" @click="$emit('click', $event)">
    <!-- click 事件会触发组件的 emit -->
  </div>
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

### 1. attrs 是响应式的

```javascript
const attrs = useAttrs()

// attrs 是一个响应式对象
watchEffect(() => {
  console.log(attrs.class) // 当父组件传入的 class 变化时重新执行
})
```

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

<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

// attrs 中没有 modelValue 和 update:modelValue
// 只有 class="primary"
</script>
```

### 4. 特殊属性

```javascript
const attrs = useAttrs()

// 特殊属性也会出现在 attrs 中
attrs.key         // key（很少需要）
attrs.ref         // ref（通常不需要）
attrs.class       // class
attrs.style       // style
attrs.slot        // slot 名称
attrs.name        // name（对于 keep-alive 等）
```

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

<!-- 使用 -->
<BaseButton class="primary" type="submit" @click="handleSubmit">
  提交
</BaseButton>
```

### 2. 自定义输入组件

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

// 移除 label，因为它有特殊处理
const { label, ...inputAttrs } = attrs
</script>

<template>
  <div class="custom-input">
    <label v-if="label">{{ label }}</label>
    <input
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      v-bind="inputAttrs"
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

// 排除 class，单独处理
const { class: _, ...restAttrs } = attrs
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
const targetAttrs = computed(() => {
  const { title, ...rest } = attrs
  return rest
})

onMounted(() => {
  // 初始化工具提示库
  if (tooltipRef.value && attrs.title) {
    new Tooltip(tooltipRef.value, {
      title: attrs.title
    })
  }
})
</script>

<template>
  <span ref="tooltipRef" v-bind="targetAttrs">
    <slot />
  </span>
</template>
```

### 7. 表单控件包装

```vue
<!-- FormControl.vue -->
<script setup>
import { useAttrs } from 'vue'

const props = defineProps({
  label: String,
  error: String,
  hint: String
})

const attrs = useAttrs()

// 提取特定属性用于不同元素
const { class: className, ...inputAttrs } = attrs
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
| useContext (Vue 2) | Vue 3 中不再使用 |

## 最佳实践

1. **透传包装组件**：创建包装组件时使用 attrs 透传
2. **选择性绑定**：根据需要选择性绑定特定属性
3. **类型安全**：TypeScript 中明确声明 attrs 类型
4. **多根节点**：多根节点时使用 inheritAttrs: false
5. **属性过滤**：过滤不需要透传的属性
