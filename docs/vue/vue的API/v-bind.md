# v-bind

## 作用
`v-bind` 用于动态绑定一个或多个属性到表达式。它可以绑定 HTML 属性、组件 props、样式、类等。简写形式为 `:`。

📖  [v-bind](https://cn.vuejs.org/api/built-in-directives#v-bind)

## 用法

### 基本用法

```vue
<script setup>
import { ref } from 'vue'

const imageUrl = ref('https://example.com/image.jpg')
const altText = ref('Description')
</script>

<template>
  <!-- 完整语法 -->
  <img v-bind:src="imageUrl" v-bind:alt="altText" />

  <!-- 简写语法（推荐） -->
  <img :src="imageUrl" :alt="altText" />
</template>
```

### 绑定对象

```vue
<script setup>
import { ref } from 'vue'

const attributes = ref({
  src: 'https://example.com/image.jpg',
  alt: 'Description',
  width: 300,
  height: 200
})
</script>

<template>
  <!-- 绑定整个对象 -->
  <img v-bind="attributes" />

  <!-- 等同于 -->
  <img
    :src="attributes.src"
    :alt="attributes.alt"
    :width="attributes.width"
    :height="attributes.height"
  />
</template>
```

### 绑定 class（对象语法）

```vue
<script setup>
import { ref, computed } from 'vue'

const isActive = ref(true)
const hasError = ref(false)

const classObject = computed(() => ({
  active: isActive.value,
  'text-danger': hasError.value
}))
</script>

<template>
  <!-- 对象语法 -->
  <div :class="{ active: isActive, 'text-danger': hasError }">
    Content
  </div>

  <!-- 绑定计算属性 -->
  <div :class="classObject">
    Content
  </div>

  <!-- 返回对象的计算属性 -->
  <div :class="isActive ? 'active' : ''">
    Content
  </div>
</template>
```

### 绑定 class（数组语法）

```vue
<script setup>
import { ref } from 'vue'

const activeClass = ref('active')
const errorClass = ref('text-danger')
</script>

<template>
  <!-- 数组语法 -->
  <div :class="[activeClass, errorClass]">
    Content
  </div>

  <!-- 数组中的三元表达式 -->
  <div :class="[isActive ? activeClass : '', errorClass]">
    Content
  </div>

  <!-- 数组中的对象语法 -->
  <div :class="[{ active: isActive }, errorClass]">
    Content
  </div>
</template>
```

### 绑定 style（对象语法）

```vue
<script setup>
import { ref, computed } from 'vue'

const color = ref('red')
const fontSize = ref(16)

const styleObject = computed(() => ({
  color: color.value,
  fontSize: fontSize.value + 'px'
}))
</script>

<template>
  <!-- 对象语法 -->
  <div :style="{ color: color, fontSize: fontSize + 'px' }">
    Content
  </div>

  <!-- 绑定样式对象 -->
  <div :style="styleObject">
    Content
  </div>

  <!-- 驼峰式或短横线分隔式 -->
  <div :style="{ backgroundColor: 'blue' }">
    Content
  </div>
</template>
```

### 绑定 style（数组语法）

```vue
<script setup>
import { ref } from 'vue'

const baseStyles = ref({
  color: 'blue',
  fontSize: '16px'
})

const overridingStyles = ref({
  color: 'red',
  fontWeight: 'bold'
})
</script>

<template>
  <!-- 数组语法 -->
  <div :style="[baseStyles, overridingStyles]">
    Content
  </div>

  <!-- 后面的样式会覆盖前面的 -->
</template>
```

### 绑定组件 props

```vue
<script setup>
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

const props = ref({
  title: 'Hello',
  count: 42,
  active: true
})
</script>

<template>
  <!-- 单个 prop -->
  <MyComponent :title="props.title" />

  <!-- 多个 props -->
  <MyComponent
    :title="props.title"
    :count="props.count"
    :active="props.active"
  />

  <!-- 绑定整个对象 -->
  <MyComponent v-bind="props" />
</template>
```

### 绑定 attribute

```vue
<script setup>
import { ref } from 'vue'

const dataId = ref('item-1')
const dataRole = ref('button')
</script>

<template>
  <!-- 绑定 data attributes -->
  <div :data-id="dataId" :data-role="dataRole">
    Content
  </div>

  <!-- 绑定 aria attributes -->
  <button :aria-label="buttonLabel" :aria-disabled="disabled">
    Click
  </button>
</template>
```

### 动态 attribute 名

```vue
<script setup>
import { ref } from 'vue'

const attributeName = ref('src')
const attributeValue = ref('image.jpg')
</script>

<template>
  <!-- 动态 attribute 名 -->
  <img :[attributeName]="attributeValue" />

  <!-- 等同于 -->
  <img :src="attributeValue" />
</template>
```

### 绑定多个值

```vue
<script setup>
import { ref } from 'vue'

const attrs = ref({
  id: 'my-id',
  class: 'my-class',
  style: { color: 'red' }
})
</script>

<template>
  <div v-bind="attrs">
    Content
  </div>
</template>
```

### JavaScript 表达式

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const items = ref(['a', 'b', 'c'])
</script>

<template>
  <!-- 使用表达式 -->
  <div :id="'item-' + count">
    Content
  </div>

  <div :class="`item-${count}`">
    Content
  </div>

  <!-- 计算属性更清晰 -->
  <div :id="itemId">
    Content
  </div>
</template>
```

## 注意事项

### 1. class 和 style 的特殊处理

```vue
<script setup>
const classValue = 'my-class'
const styleValue = 'color: red;'
</script>

<template>
  <!-- class 和 style 会被合并，不会覆盖 -->
  <div class="static" :class="classValue" style="color: blue;" :style="styleValue">
    Content
  </div>
  <!-- 结果: class="static my-class" style="color: blue; color: red;" -->
</template>
```

### 2. null 和 undefined

```vue
<script setup>
const nullValue = null
const undefinedValue = undefined
const falseValue = false
</script>

<template>
  <!-- 这些值会使 attribute 被移除 -->
  <input :placeholder="nullValue" />      <!-- 没有 placeholder -->
  <input :placeholder="undefinedValue" /> <!-- 没有 placeholder -->
  <input :disabled="falseValue" />        <!-- disabled 属性被移除 -->

  <!-- 除了字符串外的其他值 -->
  <input :value="0" />          <!-- value="0" -->
  <input :value="false" />      <!-- value="false" -->
  <input :value="true" />       <!-- value="true" -->
</template>
```

### 3. 布尔 attribute

```vue
<script setup>
import { ref } from 'vue'

const isDisabled = ref(true)
const isReadonly = ref(false)
</script>

<template>
  <!-- 布尔 attribute -->
  <button :disabled="isDisabled">Disabled</button>

  <!-- 等同于 -->
  <button v-bind:disabled="isDisabled">Disabled</button>

  <!-- isDisabled 为 false 时，disabled 属性被移除 -->
  <button :disabled="isDisabled">Button</button>
</template>
```

### 4. 动态绑定时的类型

```vue
<script setup>
import { ref } from 'vue'

const numberValue = ref(42)
const objectValue = ref({ key: 'value' })
</script>

<template>
  <!-- 数字会被转为字符串 -->
  <div :data-id="numberValue"></div>      <!-- data-id="42" -->

  <!-- 对象会被转为 [object Object] -->
  <div :data-value="objectValue"></div>   <!-- data-value="[object Object]" -->

  <!-- 使用 JSON.stringify 处理对象 -->
  <div :data-value="JSON.stringify(objectValue)"></div>
</template>
```

### 5. camelCase vs kebab-case

HTML attribute 名不区分大小写，浏览器会把大写字母统一解析为小写，因此 camelCase 的 attribute（如 SVG 的 `viewBox`）在**直接写在 HTML 里的 DOM 模板**中会丢失大小写，需要用 `.camel` 修饰符：

```vue
<script setup>
import { ref } from 'vue'

const viewBox = ref('0 0 100 100')
</script>

<template>
  <!-- ✅ SFC（经构建工具预编译）中可以直接用 camelCase -->
  <svg :viewBox="viewBox"></svg>

  <!-- ✅ DOM 模板中需要用 .camel 修饰符 -->
  <svg :view-box.camel="viewBox"></svg>
</template>
```

> 💡 **提示：** `.camel` 主要用于 DOM 模板（直接写在 HTML 文件中的模板）。使用 SFC 等带构建步骤的方式时模板会预先编译，基本用不到它。

### 6. .prop 与 .attr 修饰符

```vue
<script setup>
import { ref } from 'vue'

const htmlContent = ref('<strong>hello</strong>')
const someValue = ref('text')
</script>

<template>
  <!-- .prop：绑定到 DOM property 而不是 attribute -->
  <div :innerHTML.prop="htmlContent"></div>
  <!-- 3.2+ 起可用 . 前缀简写 -->
  <div .innerHTML="htmlContent"></div>

  <!-- .attr：强制作为 attribute 绑定（默认行为，一般无需显式写出） -->
  <div :value.attr="someValue"></div>
</template>
```

### 7. 组件继承

组件上未声明为 props 的 attribute（如 class、id、type 等）会自动「透传」到组件的根元素上；在子组件中可以通过 `useAttrs()` 访问：

```vue
<script setup>
import { ref } from 'vue'
import MyButton from './MyButton.vue'

const buttonAttrs = ref({
  type: 'button',
  class: 'btn',
  disabled: false
})
</script>

<template>
  <!-- type、class、disabled 未声明为 props 时，会透传到 MyButton 的根元素 -->
  <MyButton v-bind="buttonAttrs" />
</template>
```

```vue
<!-- 子组件中访问透传的 attrs -->
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

## 使用场景

### 1. 动态图片源

```vue
<script setup>
import { ref } from 'vue'

const images = ref({
  small: 'image-small.jpg',
  medium: 'image-medium.jpg',
  large: 'image-large.jpg'
})

const currentSize = ref('medium')
</script>

<template>
  <img :src="images[currentSize]" :alt="`Image size ${currentSize}`" />
</template>
```

### 2. 响应式样式

```vue
<script setup>
import { ref } from 'vue'

const theme = ref('dark')

const themeStyles = {
  dark: {
    background: '#333',
    color: '#fff'
  },
  light: {
    background: '#fff',
    color: '#333'
  }
}
</script>

<template>
  <div :style="themeStyles[theme]">
    Content
  </div>
</template>
```

### 3. 表单绑定

```vue
<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  email: '',
  password: ''
})

const placeholders = {
  username: '请输入用户名',
  email: '请输入邮箱',
  password: '请输入密码'
}
</script>

<template>
  <input
    v-model="formData.username"
    :placeholder="placeholders.username"
  />
  <input
    v-model="formData.email"
    :placeholder="placeholders.email"
  />
  <input
    v-model="formData.password"
    type="password"
    :placeholder="placeholders.password"
  />
</template>
```

### 4. 条件类名

```vue
<script setup>
import { ref, computed } from 'vue'

const status = ref('success')

const statusClasses = computed(() => ({
  'status-success': status.value === 'success',
  'status-warning': status.value === 'warning',
  'status-error': status.value === 'error'
}))
</script>

<template>
  <div :class="['status', statusClasses]">
    Status: {{ status }}
  </div>
</template>
```

### 5. 动态属性

```vue
<script setup>
import { ref } from 'vue'

const linkTarget = ref('_blank')
const linkRel = ref('noopener noreferrer')
</script>

<template>
  <a
    href="https://example.com"
    :target="linkTarget"
    :rel="linkRel"
  >
    External Link
  </a>
</template>
```

### 6. SVG 绑定

```vue
<script setup>
import { ref } from 'vue'

const viewBox = ref('0 0 100 100')
const pathData = ref('M10 10 L90 90')
</script>

<template>
  <svg :viewBox="viewBox" width="100" height="100">
    <path :d="pathData" stroke="black" />
  </svg>
</template>
```

### 7. 组件 props 批量传递

```vue
<script setup>
import { ref } from 'vue'
import DataTable from './DataTable.vue'

const tableConfig = ref({
  data: [],
  columns: [],
  sortable: true,
  filterable: true,
  pageSize: 10
})
</script>

<template>
  <DataTable v-bind="tableConfig" />
</template>
```

### 8. 无障碍属性

```vue
<script setup>
import { ref, computed } from 'vue'

const isPressed = ref(false)
const isExpanded = ref(false)
const ariaLabel = computed(() =>
  isExpanded.value ? 'Collapse menu' : 'Expand menu'
)
</script>

<template>
  <button
    :aria-pressed="isPressed"
    :aria-expanded="isExpanded"
    :aria-label="ariaLabel"
  >
    Toggle
  </button>
</template>
```

### 9. 响应式宽高

```vue
<script setup>
import { ref, onMounted } from 'vue'

const containerSize = ref({ width: 0, height: 0 })
const containerRef = ref(null)

onMounted(() => {
  containerSize.value = {
    width: containerRef.value.offsetWidth,
    height: containerRef.value.offsetHeight
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :style="{
      width: containerSize.width + 'px',
      height: containerSize.height + 'px'
    }"
  >
    Content
  </div>
</template>
```

### 10. 动画过渡

```vue
<script setup>
import { ref } from 'vue'

const show = ref(true)
const isAnimating = ref(false)
const transitionStyles = {
  enter: {
    opacity: 0,
    transform: 'translateY(-20px)'
  },
  'enter-to': {
    opacity: 1,
    transform: 'translateY(0)'
  }
}
</script>

<template>
  <transition
    :css="false"
    @before-enter="el => Object.assign(el.style, transitionStyles.enter)"
    @enter="(el, done) => {
      el.offsetHeight // trigger reflow
      Object.assign(el.style, transitionStyles['enter-to'])
      setTimeout(done, 300)
    }"
  >
    <div v-if="show">Animated Content</div>
  </transition>
</template>
```

## v-bind 修饰符

| 修饰符 | 说明 | 简写 |
|------|------|------|
| .prop | 作为 DOM property 绑定而不是 attribute（3.2+） | `.` |
| .attr | 作为 attribute 绑定（默认行为，可用于显式声明，3.2+） | `^` |
| .camel | 将 kebab-case attribute 名转换为 camelCase（主要用于 DOM 模板） | — |

## 最佳实践

1. **优先使用简写**：使用 `:` 代替 `v-bind`
2. **使用计算属性**：复杂逻辑使用计算属性
3. **合并 class/style**：使用数组或对象语法
4. **key 命名**：使用 kebab-case 或 camelCase
5. **类型明确**：确保绑定值的类型正确
