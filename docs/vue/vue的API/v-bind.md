# v-bind

## 作用
`v-bind` 用于动态绑定一个或多个属性到表达式。它可以绑定 HTML 属性、组件 props、样式、类等。简写形式为 `:`。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const imageUrl = ref('https://example.com/image.jpg')
const altText = ref('Description')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 完整语法 --&gt;
  &lt;img v-bind:src="imageUrl" v-bind:alt="altText" /&gt;

  &lt;!-- 简写语法（推荐） --&gt;
  &lt;img :src="imageUrl" :alt="altText" /&gt;
`&lt;/template&gt;`
```

### 绑定对象

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const attributes = ref({
  src: 'https://example.com/image.jpg',
  alt: 'Description',
  width: 300,
  height: 200
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 绑定整个对象 --&gt;
  &lt;img v-bind="attributes" /&gt;

  &lt;!-- 等同于 --&gt;
  &lt;img
    :src="attributes.src"
    :alt="attributes.alt"
    :width="attributes.width"
    :height="attributes.height"
  /&gt;
`&lt;/template&gt;`
```

### 绑定 class（对象语法）

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const isActive = ref(true)
const hasError = ref(false)

const classObject = computed(() =&gt; ({
  active: isActive.value,
  'text-danger': hasError.value
}))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 对象语法 --&gt;
  &lt;div :class="{ active: isActive, 'text-danger': hasError }"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 绑定计算属性 --&gt;
  &lt;div :class="classObject"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 返回对象的计算属性 --&gt;
  &lt;div :class="isActive ? 'active' : ''"&gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 绑定 class（数组语法）

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const activeClass = ref('active')
const errorClass = ref('text-danger')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 数组语法 --&gt;
  &lt;div :class="[activeClass, errorClass]"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 数组中的三元表达式 --&gt;
  &lt;div :class="[isActive ? activeClass : '', errorClass]"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 数组中的对象语法 --&gt;
  &lt;div :class="[{ active: isActive }, errorClass]"&gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 绑定 style（对象语法）

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const color = ref('red')
const fontSize = ref(16)

const styleObject = computed(() =&gt; ({
  color: color.value,
  fontSize: fontSize.value + 'px'
}))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 对象语法 --&gt;
  &lt;div :style="{ color: color, fontSize: fontSize + 'px' }"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 绑定样式对象 --&gt;
  &lt;div :style="styleObject"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 驼峰式或短横线分隔式 --&gt;
  &lt;div :style="{ backgroundColor: 'blue' }"&gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 绑定 style（数组语法）

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const baseStyles = ref({
  color: 'blue',
  fontSize: '16px'
})

const overridingStyles = ref({
  color: 'red',
  fontWeight: 'bold'
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 数组语法 --&gt;
  &lt;div :style="[baseStyles, overridingStyles]"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 后面的样式会覆盖前面的 --&gt;
`&lt;/template&gt;`
```

### 绑定组件 props

```text
`&lt;script setup&gt;`
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

const props = ref({
  title: 'Hello',
  count: 42,
  active: true
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 单个 prop --&gt;
  &lt;MyComponent :title="props.title" /&gt;

  &lt;!-- 多个 props --&gt;
  &lt;MyComponent
    :title="props.title"
    :count="props.count"
    :active="props.active"
  /&gt;

  &lt;!-- 绑定整个对象 --&gt;
  &lt;MyComponent v-bind="props" /&gt;
`&lt;/template&gt;`
```

### 绑定 attribute

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const dataId = ref('item-1')
const dataRole = ref('button')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 绑定 data attributes --&gt;
  &lt;div :data-id="dataId" :data-role="dataRole"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 绑定 aria attributes --&gt;
  &lt;button :aria-label="buttonLabel" :aria-disabled="disabled"&gt;
    Click
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 动态 attribute 名

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const attributeName = ref('src')
const attributeValue = ref('image.jpg')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 动态 attribute 名 --&gt;
  &lt;img :[attributeName]="attributeValue" /&gt;

  &lt;!-- 等同于 --&gt;
  &lt;img :src="attributeValue" /&gt;
`&lt;/template&gt;`
```

### 绑定多个值

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const attrs = ref({
  id: 'my-id',
  class: 'my-class',
  style: { color: 'red' }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-bind="attrs"&gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

### JavaScript 表达式

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const count = ref(0)
const items = ref(['a', 'b', 'c'])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 使用表达式 --&gt;
  &lt;div :id="'item-' + count"&gt;
    Content
  &lt;/div&gt;

  &lt;div :class="`item-${count}`"&gt;
    Content
  &lt;/div&gt;

  &lt;!-- 计算属性更清晰 --&gt;
  &lt;div :id="itemId"&gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. class 和 style 的特殊处理

```text
`&lt;script setup&gt;`
const classValue = 'my-class'
const styleValue = 'color: red;'
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- class 和 style 会被合并，不会覆盖 --&gt;
  &lt;div class="static" :class="classValue" style="color: blue;" :style="styleValue"&gt;
    Content
  &lt;/div&gt;
  &lt;!-- 结果: class="static my-class" style="color: blue; color: red;" --&gt;
`&lt;/template&gt;`
```

### 2. null 和 undefined

```text
`&lt;script setup&gt;`
const nullValue = null
const undefinedValue = undefined
const falseValue = false
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 这些值会使 attribute 被移除 --&gt;
  &lt;input :placeholder="nullValue" /&gt;      &lt;!-- 没有 placeholder --&gt;
  &lt;input :placeholder="undefinedValue" /&gt; &lt;!-- 没有 placeholder --&gt;
  &lt;input :disabled="falseValue" /&gt;        &lt;!-- disabled 属性被移除 --&gt;

  &lt;!-- 除了字符串外的其他值 --&gt;
  &lt;input :value="0" /&gt;          &lt;!-- value="0" --&gt;
  &lt;input :value="false" /&gt;      &lt;!-- value="false" --&gt;
  &lt;input :value="true" /&gt;       &lt;!-- value="true" --&gt;
`&lt;/template&gt;`
```

### 3. 布尔 attribute

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const isDisabled = ref(true)
const isReadonly = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 布尔 attribute --&gt;
  &lt;button :disabled="isDisabled"&gt;Disabled&lt;/button&gt;

  &lt;!-- 等同于 --&gt;
  &lt;button v-bind:disabled="isDisabled"&gt;Disabled&lt;/button&gt;

  &lt;!-- isDisabled 为 false 时，disabled 属性被移除 --&gt;
  &lt;button :disabled="isDisabled"&gt;Button&lt;/button&gt;
`&lt;/template&gt;`
```

### 4. 动态绑定时的类型

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const numberValue = ref(42)
const objectValue = ref({ key: 'value' })
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 数字会被转为字符串 --&gt;
  &lt;div :data-id="numberValue"&gt;      &lt;!-- data-id="42" --&gt;

  &lt;!-- 对象会被转为 [object Object] --&gt;
  &lt;div :data-value="objectValue"&gt;  &lt;!-- data-value="[object Object]" --&gt;

  &lt;!-- 使用 JSON.stringify 处理对象 --&gt;
  &lt;div :data-value="JSON.stringify(objectValue)"&gt;
`&lt;/template&gt;`
```

### 5. camelCase vs kebab-case

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const viewBox = ref('0 0 100 100')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 在绑定中使用 camelCase --&gt;
  &lt;svg :viewBox="viewBox"&gt;
    &lt;!-- HTML 属性中自动转为 kebab-case --&gt;
  &lt;/svg&gt;

  &lt;!-- 也可以使用字符串形式 --&gt;
  &lt;svg :view-box="viewBox"&gt;
`&lt;/template&gt;`
```

### 6. 保留 attribute

```text
`&lt;script setup&gt;`
const condition = true
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- .prop 修饰符用于绑定 DOM property --&gt;
  &lt;div :innerHTML.prop="htmlContent"&gt;

  &lt;!-- .attr 修饰符用于绑定 attribute（默认） --&gt;
  &lt;div :value="someValue" :value.attr="someValue"&gt;
`&lt;/template&gt;`
```

### 7. 组件继承

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const buttonAttrs = ref({
  type: 'button',
  class: 'btn',
  disabled: false
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 组件会自动继承 attrs --&gt;
  &lt;MyButton v-bind="buttonAttrs"&gt;

  &lt;!-- 在组件中使用 attrs --&gt;
  &lt;!-- `&lt;script setup&gt;`
    const attrs = useAttrs()
  `&lt;/script&gt;`
  --&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 动态图片源

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const images = ref({
  small: 'image-small.jpg',
  medium: 'image-medium.jpg',
  large: 'image-large.jpg'
})

const currentSize = ref('medium')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;img :src="images[currentSize]" :alt="`Image size ${currentSize}`" /&gt;
`&lt;/template&gt;`
```

### 2. 响应式样式

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div :style="themeStyles[theme]"&gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 3. 表单绑定

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    v-model="formData.username"
    :placeholder="placeholders.username"
  /&gt;
  &lt;input
    v-model="formData.email"
    :placeholder="placeholders.email"
  /&gt;
  &lt;input
    v-model="formData.password"
    type="password"
    :placeholder="placeholders.password"
  /&gt;
`&lt;/template&gt;`
```

### 4. 条件类名

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const status = ref('success')

const statusClasses = computed(() =&gt; ({
  'status-success': status.value === 'success',
  'status-warning': status.value === 'warning',
  'status-error': status.value === 'error'
}))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div :class="['status', statusClasses]"&gt;
    Status: {{ status }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 动态属性

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const linkTarget = ref('_blank')
const linkRel = ref('noopener noreferrer')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;a
    href="https://example.com"
    :target="linkTarget"
    :rel="linkRel"
  &gt;
    External Link
  &lt;/a&gt;
`&lt;/template&gt;`
```

### 6. SVG 绑定

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const viewBox = ref('0 0 100 100')
const pathData = ref('M10 10 L90 90')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;svg :viewBox="viewBox" width="100" height="100"&gt;
    &lt;path :d="pathData" stroke="black" /&gt;
  &lt;/svg&gt;
`&lt;/template&gt;`
```

### 7. 组件 props 批量传递

```text
`&lt;script setup&gt;`
import { ref } from 'vue'
import DataTable from './DataTable.vue'

const tableConfig = ref({
  data: [],
  columns: [],
  sortable: true,
  filterable: true,
  pageSize: 10
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;DataTable v-bind="tableConfig" /&gt;
`&lt;/template&gt;`
```

### 8. 无障碍属性

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const isPressed = ref(false)
const isExpanded = ref(false)
const ariaLabel = computed(() =&gt;
  isExpanded.value ? 'Collapse menu' : 'Expand menu'
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button
    :aria-pressed="isPressed"
    :aria-expanded="isExpanded"
    :aria-label="ariaLabel"
  &gt;
    Toggle
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 9. 响应式宽高

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const containerSize = ref({ width: 0, height: 0 })
const containerRef = ref(null)

onMounted(() =&gt; {
  containerSize.value = {
    width: containerRef.value.offsetWidth,
    height: containerRef.value.offsetHeight
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div
    ref="containerRef"
    :style="{
      width: containerSize.width + 'px',
      height: containerSize.height + 'px'
    }"
  &gt;
    Content
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 10. 动画过渡

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;transition
    :css="false"
    @before-enter="el =&gt; Object.assign(el.style, transitionStyles.enter)"
    @enter="(el, done) =&gt; {
      el.offsetHeight // trigger reflow
      Object.assign(el.style, transitionStyles['enter-to'])
      setTimeout(done, 300)
    }"
  &gt;
    &lt;div v-if="show"&gt;Animated Content&lt;/div&gt;
  &lt;/transition&gt;
`&lt;/template&gt;`
```

## v-bind 修饰符

| 修饰符 | 说明 |
|------|------|
| .prop | 作为 DOM property 绑定而不是 attribute |
| .attr | 作为 attribute 绑定（默认） |
| .camel | 将 kebab-case attribute 名转换为 camelCase |

## 最佳实践

1. **优先使用简写**：使用 `:` 代替 `v-bind`
2. **使用计算属性**：复杂逻辑使用计算属性
3. **合并 class/style**：使用数组或对象语法
4. **key 命名**：使用 kebab-case 或 camelCase
5. **类型明确**：确保绑定值的类型正确
