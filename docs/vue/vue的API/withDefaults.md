# withDefaults

为 defineProps 定义的 props 设置默认值。

## 作用

在使用基于类型的 `defineProps` 声明时，通过 `withDefaults` 为可选 props 提供默认值，是 TypeScript + `<script setup>` 场景下的标准做法。

> 官方文档：[withDefaults](https://cn.vuejs.org/api/sfc-script-setup#withdefaults)

## 语法

```javascript
import { withDefaults } from 'vue'

withDefaults(defineProps<Props>(), {
  // 默认值
})
```

## 参数

- `props`: defineProps 的返回值
- `defaults`: 包含默认值的对象

## 返回值

返回带有默认值的 props 对象

## 基础用法

```vue
<script setup lang="ts">
import { withDefaults } from 'vue'

interface Props {
  title: string
  count?: number
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  isActive: true
})
</script>
```

## 字符串默认值

```vue
<script setup lang="ts">
interface Props {
  message: string
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Hello',
  type: 'info'
})
</script>
```

## 数字默认值

```vue
<script setup lang="ts">
interface Props {
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1
})
</script>
```

## 数组默认值

```vue
<script setup lang="ts">
interface Props {
  items?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => ['default1', 'default2']
})
</script>
```

## 对象默认值

```vue
<script setup lang="ts">
interface User {
  name: string
  age: number
}

interface Props {
  user?: User
}

const props = withDefaults(defineProps<Props>(), {
  user: () => ({ name: 'Guest', age: 0 })
})
</script>
```

## 函数默认值

```vue
<script setup lang="ts">
type Validator = (value: string) => boolean

interface Props {
  validator?: Validator
}

const props = withDefaults(defineProps<Props>(), {
  validator: (value: string) => value.length > 0
})
</script>
```

## 复杂对象默认值

```vue
<script setup lang="ts">
interface Theme {
  primary: string
  secondary: string
  background: string
}

interface Props {
  theme?: Theme
}

const props = withDefaults(defineProps<Props>(), {
  theme: () => ({
    primary: '#42b983',
    secondary: '#35495e',
    background: '#ffffff'
  })
})
</script>
```

## 联合类型默认值

```vue
<script setup lang="ts">
type Size = 'small' | 'medium' | 'large'

interface Props {
  size?: Size
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})
</script>
```

## 可选属性默认值

```vue
<script setup lang="ts">
interface Props {
  // 必需属性
  title: string

  // 可选属性带默认值
  subtitle?: string
  showIcon?: boolean
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  showIcon: false,
  iconSize: 16
})
</script>
```

## 完整组件示例

```vue
<template>
  <div class="card" :class="[`card-${size}`, { 'card-active': active }]">
    <div v-if="showIcon" class="card-icon">
      <slot name="icon">
        <span :style="{ fontSize: `${iconSize}px` }">📄</span>
      </slot>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      <p class="card-body">{{ text }}</p>
    </div>
    <div v-if="actions" class="card-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'

type CardSize = 'small' | 'medium' | 'large'

interface Props {
  title: string
  subtitle?: string
  text?: string
  size?: CardSize
  active?: boolean
  showIcon?: boolean
  iconSize?: number
  actions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  text: '',
  size: 'medium',
  active: false,
  showIcon: false,
  iconSize: 24,
  actions: false
})
</script>
```

## 与运行时声明的对比

```vue
<!-- 不使用 TypeScript -->
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: false
  }
})
</script>

<!-- 使用 TypeScript + withDefaults -->
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

## 响应式默认值

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count?: number
  multiplier?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  multiplier: 1
})

const doubled = computed(() => props.count * props.multiplier)
</script>
```

## 嵌套对象默认值

```vue
<script setup lang="ts">
interface Address {
  street: string
  city: string
  country: string
}

interface Person {
  name: string
  age?: number
  address?: Address
}

interface Props {
  person: Person
}

const props = withDefaults(defineProps<Props>(), {
  person: () => ({
    name: 'Anonymous',
    age: 0,
    address: () => ({
      street: 'Unknown Street',
      city: 'Unknown City',
      country: 'Unknown Country'
    })
  })
})
</script>
```

## 注意事项

1. **对象/数组必须是函数**：对于对象和数组类型的默认值，必须使用工厂函数

```typescript
// 错误
items: { default: [] }

// 正确
items: () => []
```

2. **与编译器宏配合**：必须与 defineProps 一起使用

3. **类型安全**：默认值的类型必须与接口中定义的类型匹配

4. **可选属性**：带默认值的属性在接口中应该是可选的（使用 `?`）

5. **只读**：props 是只读的，不应该在组件内部修改

6. **响应式**：默认值是响应式的，当父组件传入新值时会更新
