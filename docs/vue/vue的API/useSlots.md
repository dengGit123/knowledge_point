# useSlots

## 作用
`useSlots()` 用于在 `<script setup>` 中访问组件的插槽内容。它返回一个 slots 对象，其中键是插槽名称，值是渲染函数。

## 用法

### 基本用法

```vue
<!-- MyComponent.vue -->
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

console.log(slots.default)   // 默认插槽
console.log(slots.header)    // 具名插槽
console.log(slots.footer)    // 具名插槽
</script>

<template>
  <div>
    <!-- 使用默认插槽 -->
    <slot />
  </div>
</template>
```

### 检查插槽是否存在

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
const hasDefault = computed(() => !!slots.default)
</script>

<template>
  <div class="card">
    <header v-if="hasHeader" class="card-header">
      <slot name="header" />
    </header>

    <div class="card-body">
      <slot />
    </div>

    <footer v-if="hasFooter" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

### 编程式使用插槽

```vue
<script setup>
import { useSlots, h } from 'vue'

const slots = useSlots()

// 渲染函数中使用
const render = () => {
  return h('div', [
    h('header', slots.header?.()),
    h('main', slots.default?.()),
    h('footer', slots.footer?.())
  ])
}
</script>
```

### 动态插槽名

```vue
<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  position: {
    type: String,
    default: 'left'
  }
})

const slots = useSlots()

const contentSlot = computed(() => {
  return slots[props.position] || slots.default
})
</script>

<template>
  <div class="layout">
    <div class="sidebar">
      <component :is="() => contentSlot()" />
    </div>
  </div>
</template>
```

### 插槽内容处理

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

// 获取插槽内容数量
const slotCount = computed(() => {
  return slots.default?.() || []
}).value.length

// 过滤插槽内容
const filteredSlots = computed(() => {
  const content = slots.default?.() || []
  return content.filter(vnode => {
    // 过滤逻辑
    return true
  })
})
</script>

<template>
  <div>
    <p>共有 {{ slotCount }} 个子元素</p>
    <component :is="() => filteredSlots()" />
  </div>
</template>
```

### 透传插槽

```vue
<!-- MyButton.vue -->
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <button class="my-button">
    <!-- 透传所有插槽 -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </button>
</template>

<!-- WrapperComponent.vue -->
<script setup>
import MyButton from './MyButton.vue'
</script>

<template>
  <MyButton>
    <template #icon>
      <svg>...</svg>
    </template>
    <template #default>
      Click me
    </template>
  </MyButton>
</template>
```

### 与作用域插槽结合

```vue
<!-- DataTable.vue -->
<script setup>
import { useSlots } from 'vue'

const props = defineProps({
  items: Array
})

const slots = useSlots()

// 检查是否有自定义渲染
const hasCustomRender = computed(() => {
  return slots.item || slots.default
})
</script>

<template>
  <table>
    <tbody>
      <tr v-for="(item, index) in items" :key="index">
        <!-- 如果有自定义插槽，使用它 -->
        <template v-if="hasCustomRender">
          <slot name="item" :item="item" :index="index" />
        </template>

        <!-- 否则使用默认渲染 -->
        <template v-else>
          <td>{{ item }}</td>
        </template>
      </tr>
    </tbody>
  </table>
</template>
```

### TypeScript 类型支持

```vue
<script setup lang="ts">
import { useSlots } from 'vue'

interface Slots {
  default?: () => VNode[]
  header?: (props: { title: string }) => VNode[]
  footer?: () => VNode[]
}

const slots = useSlots() as Slots

// 类型安全
if (slots.header) {
  const headerVNodes = slots.header({ title: 'Hello' })
}
</script>
```

### 在 setup 函数中使用

```javascript
import { useSlots, h } from 'vue'

export default {
  setup() {
    const slots = useSlots()

    return () => h('div', [
      slots.header?.(),
      slots.default?.(),
      slots.footer?.()
    ])
  }
}
```

### 条件插槽渲染

```vue
<script setup>
import { useSlots, computed } from 'vue'

const slots = useSlots()

// 检查多个插槽
const slotNames = computed(() => {
  return Object.keys(slots).filter(name => {
    return slots[name] && slots[name]().length > 0
  })
})

// 判断是否有任何插槽内容
const hasSlotContent = computed(() => {
  return slotNames.value.length > 0
})
</script>

<template>
  <div class="wrapper">
    <div v-if="!hasSlotContent" class="empty-state">
      No content provided
    </div>

    <template v-for="name in slotNames" :key="name">
      <slot :name="name" />
    </template>
  </div>
</template>
```

## 注意事项

### 1. slots 是响应式的

```javascript
const slots = useSlots()

// slots 对象本身是响应式的
watchEffect(() => {
  console.log(Object.keys(slots)) // 当插槽变化时重新执行
})
```

### 2. 插槽是函数

```javascript
const slots = useSlots()

// ✅ 正确：调用函数获取内容
const defaultContent = slots.default?.()

// ❌ 错误：直接使用 slots.default
// 它是一个函数，不是内容本身
```

### 3. 空插槽处理

```javascript
const slots = useSlots()

// 插槽可能不存在
if (slots.header) {
  // 存在
  const content = slots.header()
} else {
  // 不存在
}
```

### 4. 插槽作用域

```vue
<!-- 父组件 -->
<MyComponent>
  <template #default="slotProps">
    {{ slotProps.value }}
  </template>
</MyComponent>

<!-- 子组件 -->
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

// 访问插槽作用域
if (slots.default) {
  const vnodes = slots.default({ value: 'Hello' })
}
</script>
```

### 5. 插槽内容修改

```javascript
const slots = useSlots()

// 获取插槽内容
const content = slots.default?.()

// 修改 VNode（需要谨慎）
const modifiedContent = content?.map(vnode => {
  // 修改逻辑
  return vnode
})
```

### 6. 与模板 ref 的配合

```vue
<script setup>
import { useSlots, ref } from 'vue'

const slots = useSlots()
const slotContentRef = ref(null)

// 访问插槽中的元素
onMounted(() => {
  const content = slots.default?.()
  // 遍历 VNode 查找元素
})
</script>
```

### 7. 默认内容

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

// 提供默认内容
const content = computed(() => {
  if (slots.default && slots.default().length > 0) {
    return slots.default
  }
  return () => 'Default content'
})
</script>

<template>
  <div>
    <component :is="content" />
  </div>
</template>
```

### 8. 动态组件插槽

```vue
<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  layout: String
})

const slots = useSlots()

const layoutSlots = computed(() => {
  // 根据布局选择插槽
  return slots[props.layout] || slots.default
})
</script>

<template>
  <component :is="() => layoutSlots()" />
</template>
```

## 使用场景

### 1. 布局组件

```vue
<!-- Layout.vue -->
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

const hasHeader = computed(() => !!(slots.header && slots.header().length))
const hasSidebar = computed(() => !!(slots.sidebar && slots.sidebar().length))
const hasFooter = computed(() => !!(slots.footer && slots.footer().length))
</script>

<template>
  <div class="layout" :class="{ 'has-sidebar': hasSidebar }">
    <header v-if="hasHeader" class="layout-header">
      <slot name="header" />
    </header>

    <div class="layout-body">
      <aside v-if="hasSidebar" class="layout-sidebar">
        <slot name="sidebar" />
      </aside>

      <main class="layout-content">
        <slot />
      </main>
    </div>

    <footer v-if="hasFooter" class="layout-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

### 2. 表格组件

```vue
<!-- DataTable.vue -->
<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  data: Array,
  columns: Array
})

const slots = useSlots()

// 检查是否有单元格插槽
const hasCellSlot = (field) => {
  return !!slots[`cell-${field}`]
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.field">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
        <td v-for="col in columns" :key="col.field">
          <!-- 使用自定义插槽渲染 -->
          <slot
            v-if="hasCellSlot(col.field)"
            :name="`cell-${col.field}`"
            :row="row"
            :value="row[col.field]"
          />
          <!-- 默认渲染 -->
          <span v-else>{{ row[col.field] }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 3. 卡片组件

```vue
<!-- Card.vue -->
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

const hasCover = computed(() => !!(slots.cover && slots.cover().length))
const hasActions = computed(() => !!(slots.actions && slots.actions().length))
const hasHeader = computed(() => !!(slots.header && slots.header().length))
</script>

<template>
  <div class="card">
    <div v-if="hasCover" class="card-cover">
      <slot name="cover" />
    </div>

    <div v-if="hasHeader" class="card-header">
      <slot name="header" />
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="hasActions" class="card-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
```

### 4. 弹窗组件

```vue
<!-- Modal.vue -->
<script setup>
import { useSlots } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const slots = useSlots()

const hasHeader = computed(() => !!(slots.header && slots.header().length))
const hasFooter = computed(() => !!(slots.footer && slots.footer().length))
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal">
      <div class="modal-content">
        <div v-if="hasHeader" class="modal-header">
          <slot name="header" />
          <button @click="emit('update:modelValue', false)">×</button>
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="hasFooter" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
```

### 5. 标签页组件

```vue
<!-- Tabs.vue -->
<script setup>
import { useSlots, ref, computed } from 'vue'

const slots = useSlots()

const activeTab = ref(0)

// 从插槽中提取标签
const tabs = computed(() => {
  const content = slots.default?.() || []
  return content
    .filter(vnode => vnode.type && vnode.type.name === 'TabPanel')
    .map((vnode, index) => ({
      index,
      title: vnode.props?.title || `Tab ${index + 1}`,
      vnode
    }))
})

const activePanel = computed(() => {
  return tabs.value[activeTab.value]?.vnode
})
</script>

<template>
  <div class="tabs">
    <div class="tab-headers">
      <button
        v-for="tab in tabs"
        :key="tab.index"
        :class="{ active: activeTab === tab.index }"
        @click="activeTab = tab.index"
      >
        {{ tab.title }}
      </button>
    </div>

    <div class="tab-content">
      <component :is="activePanel" />
    </div>
  </div>
</template>
```

### 6. 表单组件

```vue
<!-- FormItem.vue -->
<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  label: String,
  error: String
})

const slots = useSlots()

const hasLabel = computed(() => {
  return !!(props.label || (slots.label && slots.label().length))
})

const hasExtra = computed(() => {
  return !!(slots.extra && slots.extra().length)
})
</script>

<template>
  <div class="form-item" :class="{ 'has-error': error }">
    <label v-if="hasLabel" class="form-label">
      <slot name="label">{{ label }}</slot>
    </label>

    <div class="form-content">
      <slot />
    </div>

    <div v-if="hasExtra" class="form-extra">
      <slot name="extra" />
    </div>

    <div v-if="error" class="form-error">
      {{ error }}
    </div>
  </div>
</template>
```

### 7. 列表组件

```vue
<!-- List.vue -->
<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  items: Array
})

const slots = useSlots()

const hasItemSlot = computed(() => !!slots.item)
</script>

<template>
  <ul class="list">
    <li v-for="(item, index) in items" :key="index" class="list-item">
      <!-- 自定义渲染 -->
      <slot v-if="hasItemSlot" name="item" :item="item" :index="index" />
      <!-- 默认渲染 -->
      <template v-else>{{ item }}</template>
    </li>
  </ul>

  <!-- 空状态 -->
  <div v-if="items.length === 0" class="empty-state">
    <slot name="empty">
      No items
    </slot>
  </div>

  <!-- 加载状态 -->
  <div v-if="$attrs.loading" class="loading-state">
    <slot name="loading">
      Loading...
    </slot>
  </div>
</template>
```

### 8. 树形组件

```vue
<!-- Tree.vue -->
<script setup>
import { useSlots, computed } from 'vue'

const props = defineProps({
  data: Array
})

const slots = useSlots()

const hasNodeSlot = computed(() => !!slots.node)
const hasIconSlot = computed(() => !!slots.icon)
</script>

<template>
  <div class="tree">
    <TreeNode
      v-for="node in data"
      :key="node.id"
      :node="node"
    >
      <template #node="{ node, expanded }">
        <slot v-if="hasNodeSlot" name="node" :node="node" :expanded="expanded" />
        <template v-else>{{ node.label }}</template>
      </template>

      <template #icon="{ node, expanded }">
        <slot v-if="hasIconSlot" name="icon" :node="node" :expanded="expanded" />
        <template v-else>{{ expanded ? '▼' : '▶' }}</template>
      </template>
    </TreeNode>
  </div>
</template>
```

## useSlots 与其他 API 的区别

| API | 用途 |
|-----|------|
| useSlots | 在 <script setup> 中访问插槽 |
| useAttrs | 访问未声明的 attrs |
| $slots | 选项式 API 中访问插槽 |
| <slot> | 在模板中渲染插槽 |

## 最佳实践

1. **检查插槽存在**：使用可选链和长度检查
2. **提供默认内容**：为插槽提供有意义的默认内容
3. **命名规范**：使用清晰的插槽命名
4. **作用域插槽**：提供有用的上下文数据
5. **透传插槽**：包装组件时正确透传插槽
