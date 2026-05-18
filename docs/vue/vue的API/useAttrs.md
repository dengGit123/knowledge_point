# useAttrs

## 作用
`useAttrs()` 用于在 ``&lt;script setup&gt;`` 中访问组件的 attrs（属性）。attrs 包含了父组件传递但未在 props 或 emits 中声明的所有属性和事件监听器。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs.class)    // 父组件传递的 class
console.log(attrs.style)    // 父组件传递的 style
console.log(attrs.id)       // 父组件传递的 id
console.log(attrs.onClick)  // 父组件传递的事件监听器
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-bind="attrs"&gt;
    &lt;!-- attrs 会被应用到这个 div 上 --&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 透传属性到子元素

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 将父组件的 attrs 透传到内部元素 --&gt;
  &lt;button v-bind="attrs"&gt;
    Click me
  &lt;/button&gt;
`&lt;/template&gt;`

&lt;!-- 使用 --&gt;
&lt;!-- &lt;MyButton class="primary" type="submit" /&gt; --&gt;
&lt;!-- 渲染为: &lt;button class="primary" type="submit"&gt;Click me&lt;/button&gt; --&gt;
```

### 选择性透传属性

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()

// 提取特定属性
const className = attrs.class
const style = attrs.style

// 排除特定属性
const { class: _, ...restAttrs } = attrs
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 使用特定属性 --&gt;
  &lt;div :class="className" :style="style"&gt;
    &lt;!-- 透传其他属性 --&gt;
    &lt;button v-bind="restAttrs"&gt;Button&lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 与 props 结合使用

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const props = defineProps({
  // 声明的 props
  modelValue: String,
  disabled: Boolean
})

const attrs = useAttrs()

// attrs 中不包含 modelValue 和 disabled
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    v-model="modelValue"
    :disabled="disabled"
    v-bind="attrs"
  /&gt;
`&lt;/template&gt;`
```

### 与 emits 结合使用

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const emit = defineEmits(['update', 'change'])

const attrs = useAttrs()

// attrs 中不包含 @update 和 @change 事件
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-bind="attrs" @click="$emit('click', $event)"&gt;
    &lt;!-- click 事件会触发组件的 emit --&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 继承属性控制

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- inheritAttrs: false 时需要手动绑定 --&gt;
  &lt;div class="wrapper" v-bind="attrs"&gt;
    &lt;div class="content"&gt;
      Content
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`

&lt;script&gt;
export default {
  inheritAttrs: false  // 禁用自动属性继承
}
`&lt;/script&gt;`
```

### TypeScript 类型支持

```text
&lt;script setup lang="ts"&gt;
import { useAttrs } from 'vue'

// attrs 的类型是 Record&lt;string, unknown&gt;
const attrs = useAttrs()

// 访问特定属性
const className = attrs.class as string | undefined
const onClick = attrs.onClick as ((event: Event) =&gt; void) | undefined
`&lt;/script&gt;`
```

### 在 setup 函数中使用

```text
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

```text
`&lt;script setup&gt;`
import { ref, useAttrs, onMounted } from 'vue'

const inputRef = ref(null)
const attrs = useAttrs()

onMounted(() =&gt; {
  // 将 attrs 应用到 ref 元素
  if (inputRef.value && attrs.placeholder) {
    inputRef.value.placeholder = attrs.placeholder
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input ref="inputRef" /&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. attrs 是响应式的

```text
const attrs = useAttrs()

// attrs 是一个响应式对象
watchEffect(() =&gt; {
  console.log(attrs.class) // 当父组件传入的 class 变化时重新执行
})
```

### 2. 不包含 props 和 emits

```text
`&lt;script setup&gt;`
const props = defineProps(['value'])
const emit = defineEmits(['update'])

const attrs = useAttrs()

// 如果父组件传递：
// &lt;MyComponent value="test" @update="handleUpdate" class="my-class" /&gt;
// 
// props.value = 'test'
// attrs 中没有 value 和 @update
// attrs.class = 'my-class'
`&lt;/script&gt;`
```

### 3. 与 v-model 的交互

```text
&lt;!-- 父组件 --&gt;
&lt;MyComponent v-model="text" class="primary" /&gt;

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

// attrs 中没有 modelValue 和 update:modelValue
// 只有 class="primary"
`&lt;/script&gt;`
```

### 4. 特殊属性

```text
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

```text
const attrs = useAttrs()

// 事件监听器以 on 开头
attrs.onClick     // click 事件
attrs.onInput     // input 事件
attrs.onSubmit    // submit 事件
```

### 6. 与多根节点的配合

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 多根节点时需要明确绑定 --&gt;
  &lt;header v-bind="attrs"&gt;
    &lt;h1&gt;Title&lt;/h1&gt;
  &lt;/header&gt;
  &lt;main&gt;
    Content
  &lt;/main&gt;
  &lt;footer v-bind="attrs"&gt;
    Footer
  &lt;/footer&gt;
`&lt;/template&gt;`

&lt;script&gt;
export default {
  inheritAttrs: false  // 多根节点时通常禁用自动继承
}
`&lt;/script&gt;`
```

### 7. 动态属性名

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()

// attrs 中的属性名是动态的
Object.keys(attrs).forEach(key =&gt; {
  console.log(key, attrs[key])
})
`&lt;/script&gt;`
```

### 8. 与类型声明结合

```text
&lt;script setup lang="ts"&gt;
import { useAttrs } from 'vue'

interface MyAttrs {
  class?: string
  style?: string | Record&lt;string, any&gt;
  placeholder?: string
  [key: string]: any
}

const attrs = useAttrs() as MyAttrs

// 现在类型更明确
attrs.class?.toLowerCase()
`&lt;/script&gt;`
```

## 使用场景

### 1. 创建包装组件

```text
&lt;!-- BaseButton.vue --&gt;
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button
    class="base-button"
    v-bind="attrs"
  &gt;
    &lt;slot /&gt;
  &lt;/button&gt;
`&lt;/template&gt;`

&lt;!-- 使用 --&gt;
&lt;BaseButton class="primary" type="submit" @click="handleSubmit"&gt;
  提交
&lt;/BaseButton&gt;
```

### 2. 自定义输入组件

```text
&lt;!-- CustomInput.vue --&gt;
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String
})

const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

// 移除 label，因为它有特殊处理
const { label, ...inputAttrs } = attrs
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="custom-input"&gt;
    &lt;label v-if="label"&gt;{{ label }}&lt;/label&gt;
    &lt;input
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      v-bind="inputAttrs"
    /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 3. 卡片组件

```text
&lt;!-- Card.vue --&gt;
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="card" v-bind="attrs"&gt;
    &lt;div v-if="$slots.header" class="card-header"&gt;
      &lt;slot name="header" /&gt;
    &lt;/div&gt;
    &lt;div class="card-body"&gt;
      &lt;slot /&gt;
    &lt;/div&gt;
    &lt;div v-if="$slots.footer" class="card-footer"&gt;
      &lt;slot name="footer" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`

&lt;style scoped&gt;
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
}
&lt;/style&gt;

&lt;!-- 使用 --&gt;
&lt;Card class="shadow" @click="handleClick"&gt;
  Content
&lt;/Card&gt;
```

### 4. 带样式的组件

```text
`&lt;script setup&gt;`
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 合并样式
const mergedStyle = computed(() =&gt; {
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div :style="mergedStyle" v-bind="attrs"&gt;
    &lt;slot /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 条件性属性传递

```text
`&lt;script setup&gt;`
import { useAttrs, computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  }
})

const attrs = useAttrs()

const buttonClass = computed(() =&gt; {
  return `btn btn-${props.variant}`
})

// 排除 class，单独处理
const { class: _, ...restAttrs } = attrs
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button :class="buttonClass" v-bind="restAttrs"&gt;
    &lt;slot /&gt;
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 6. 工具提示组件

```text
&lt;!-- Tooltip.vue --&gt;
`&lt;script setup&gt;`
import { useAttrs, ref, onMounted } from 'vue'

const attrs = useAttrs()
const tooltipRef = ref(null)
const targetAttrs = computed(() =&gt; {
  const { title, ...rest } = attrs
  return rest
})

onMounted(() =&gt; {
  // 初始化工具提示库
  if (tooltipRef.value && attrs.title) {
    new Tooltip(tooltipRef.value, {
      title: attrs.title
    })
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;span ref="tooltipRef" v-bind="targetAttrs"&gt;
    &lt;slot /&gt;
  &lt;/span&gt;
`&lt;/template&gt;`
```

### 7. 表单控件包装

```text
&lt;!-- FormControl.vue --&gt;
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const props = defineProps({
  label: String,
  error: String,
  hint: String
})

const attrs = useAttrs()

// 提取特定属性用于不同元素
const { class: className, ...inputAttrs } = attrs
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="form-control"&gt;
    &lt;label v-if="label"&gt;{{ label }}&lt;/label&gt;
    &lt;slot v-bind="{ attrs: inputAttrs }" /&gt;
    &lt;p v-if="hint" class="hint"&gt;{{ hint }}&lt;/p&gt;
    &lt;p v-if="error" class="error"&gt;{{ error }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 响应式组件

```text
`&lt;script setup&gt;`
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

const responsiveAttrs = computed(() =&gt; {
  const newAttrs = { ...attrs }

  // 根据屏幕大小调整属性
  if (window.innerWidth &lt; 768) {
    newAttrs.size = 'small'
  } else {
    newAttrs.size = 'large'
  }

  return newAttrs
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;component :is="tag" v-bind="responsiveAttrs"&gt;
    &lt;slot /&gt;
  &lt;/component&gt;
`&lt;/template&gt;`
```

### 9. 属性验证和转换

```text
`&lt;script setup&gt;`
import { useAttrs } from 'vue'

const attrs = useAttrs()

// 验证和转换属性
const validatedAttrs = (() =&gt; {
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-bind="validatedAttrs"&gt;
    &lt;slot /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 10. 带前缀的属性

```text
`&lt;script setup&gt;`
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 提取特定前缀的属性
const dataAttrs = computed(() =&gt; {
  const result = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('data-')) {
      result[key] = value
    }
  }
  return result
})

const ariaAttrs = computed(() =&gt; {
  const result = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('aria-')) {
      result[key] = value
    }
  }
  return result
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-bind="dataAttrs"&gt;
    &lt;button v-bind="ariaAttrs"&gt;
      &lt;slot /&gt;
    &lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
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
