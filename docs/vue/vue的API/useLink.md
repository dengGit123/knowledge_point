# useLink

Vue Router 提供的组合式函数，用于创建导航链接。

> 官方文档：[useLink](https://router.vuejs.org/zh/api/#uselink)

## 语法

```javascript
import { useLink } from 'vue-router'

const { link, href, isActive, isExactActive, navigate } = useLink(props)
```

## 参数

- `props`: 链接属性对象

## 返回值

返回包含链接相关方法和状态的对象

## 基础用法

```vue
<template>
  <a :href="href" @click="navigate">{{ link.label }}</a>
</template>

<script setup>
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  label: String
})

const { href, navigate } = useLink(props)
</script>
```

## 自定义 RouterLink

```vue
<template>
  <component
    :is="tag"
    :href="href"
    :class="{ active: isActive }"
    @click="navigate"
  >
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  tag: {
    type: String,
    default: 'a'
  },
  activeClass: String,
  exactActiveClass: String
})

const { href, navigate, isActive, isExactActive } = useLink(props)

const classes = computed(() => ({
  [props.activeClass]: isActive.value,
  [props.exactActiveClass]: isExactActive.value
}))
</script>
```

## 外部链接检测

```vue
<template>
  <a
    :href="href"
    :target="isExternal ? '_blank' : ''"
    :rel="isExternal ? 'noopener' : ''"
    @click="isExternal ? null : navigate"
  >
    <slot></slot>
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  }
})

const { href, navigate } = useLink(props)

const isExternal = computed(() => {
  if (typeof props.to !== 'string') return false
  return props.to.startsWith('http://') || props.to.startsWith('https://')
})
</script>
```

## 带确认的导航

```vue
<template>
  <a :href="href" @click="handleClick">
    <slot></slot>
  </a>
</template>

<script setup>
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  confirmMessage: {
    type: String,
    default: '确定要离开吗？'
  }
})

const { href, navigate } = useLink(props)

function handleClick(e) {
  if (props.confirmMessage && !confirm(props.confirmMessage)) {
    e.preventDefault()
    return
  }
  navigate(e)
}
</script>
```

## 延迟加载导航

```vue
<template>
  <a :href="href" @click="handleClick">
    <slot></slot>
  </a>
</template>

<script setup>
import { ref } from 'vue'
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  }
})

const { href, navigate } = useLink(props)
const isLoading = ref(false)

async function handleClick(e) {
  e.preventDefault()

  if (isLoading.value) return

  isLoading.value = true

  try {
    // 执行一些异步操作
    await saveCurrentWork()

    // 导航到新路由
    await navigate(e)
  } catch (error) {
    console.error('导航失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
```

## 带权限的链接

```vue
<template>
  <component
    :is="hasPermission ? 'a' : 'span'"
    :href="hasPermission ? href : undefined"
    @click="hasPermission ? navigate : undefined"
  >
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useLink } from 'vue-router'
import { usePermissions } from './usePermissions'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  permission: String
})

const { href, navigate } = useLink(props)
const { hasPermission } = usePermissions()
</script>
```

## 链接状态样式

```vue
<template>
  <component
    :is="tag"
    :href="href"
    :class="linkClasses"
    @click="navigate"
  >
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  tag: {
    type: String,
    default: 'a'
  },
  inactiveClass: String,
  activeClass: String
})

const { href, navigate, isActive } = useLink(props)

const linkClasses = computed(() => ({
  [props.inactiveClass || 'link']: !isActive.value,
  [props.activeClass || 'active']: isActive.value
}))
</script>
```

## 带加载状态的链接

```vue
<template>
  <component
    :is="tag"
    :href="href"
    :class="{ 'is-loading': isLoading }"
    @click="handleClick"
  >
    <span v-if="isLoading" class="spinner"></span>
    <slot></slot>
  </component>
</template>

<script setup>
import { ref } from 'vue'
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  tag: {
    type: String,
    default: 'a'
  }
})

const { href, navigate } = useLink(props)
const isLoading = ref(false)

async function handleClick(e) {
  if (isLoading.value) {
    e.preventDefault()
    return
  }

  isLoading.value = true

  try {
    await navigate(e)
  } finally {
    isLoading.value = false
  }
}
</script>
```

## 注意事项

1. **Vue Router 专用**：只在使用 Vue Router 时可用

2. **与 RouterLink 的关系**：RouterLink 内部使用 useLink

3. **自定义组件**：用于创建自定义的导航组件

4. **返回值**：
   - `href`: 解析后的 URL
   - `navigate`: 导航函数
   - `isActive`: 是否为激活状态
   - `isExactActive`: 是否为精确激活状态

5. **最佳实践**：
   - 简单场景使用 `<RouterLink>`
   - 需要自定义时使用 `useLink`

6. **类型安全**：TypeScript 支持良好
