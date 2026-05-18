# useSlots

## 作用
`useSlots()` 用于在 ``&lt;script setup&gt;`` 中访问组件的插槽内容。它返回一个 slots 对象，其中键是插槽名称，值是渲染函数。

## 用法

### 基本用法

```text
&lt;!-- MyComponent.vue --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

console.log(slots.default)   // 默认插槽
console.log(slots.header)    // 具名插槽
console.log(slots.footer)    // 具名插槽
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;!-- 使用默认插槽 --&gt;
    &lt;slot /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 检查插槽是否存在

```text
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

const hasHeader = computed(() =&gt; !!slots.header)
const hasFooter = computed(() =&gt; !!slots.footer)
const hasDefault = computed(() =&gt; !!slots.default)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="card"&gt;
    &lt;header v-if="hasHeader" class="card-header"&gt;
      &lt;slot name="header" /&gt;
    &lt;/header&gt;

    &lt;div class="card-body"&gt;
      &lt;slot /&gt;
    &lt;/div&gt;

    &lt;footer v-if="hasFooter" class="card-footer"&gt;
      &lt;slot name="footer" /&gt;
    &lt;/footer&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 编程式使用插槽

```text
`&lt;script setup&gt;`
import { useSlots, h } from 'vue'

const slots = useSlots()

// 渲染函数中使用
const render = () =&gt; {
  return h('div', [
    h('header', slots.header?.()),
    h('main', slots.default?.()),
    h('footer', slots.footer?.())
  ])
}
`&lt;/script&gt;`
```

### 动态插槽名

```text
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const props = defineProps({
  position: {
    type: String,
    default: 'left'
  }
})

const slots = useSlots()

const contentSlot = computed(() =&gt; {
  return slots[props.position] || slots.default
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="layout"&gt;
    &lt;div class="sidebar"&gt;
      &lt;component :is="() =&gt; contentSlot()" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 插槽内容处理

```text
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

// 获取插槽内容数量
const slotCount = computed(() =&gt; {
  return slots.default?.() || []
}).value.length

// 过滤插槽内容
const filteredSlots = computed(() =&gt; {
  const content = slots.default?.() || []
  return content.filter(vnode =&gt; {
    // 过滤逻辑
    return true
  })
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;p&gt;共有 {{ slotCount }} 个子元素&lt;/p&gt;
    &lt;component :is="() =&gt; filteredSlots()" /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 透传插槽

```text
&lt;!-- MyButton.vue --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button class="my-button"&gt;
    &lt;!-- 透传所有插槽 --&gt;
    `&lt;template&gt;`
      &lt;slot :name="name" v-bind="slotProps || {}" /&gt;
    `&lt;/template&gt;`
  &lt;/button&gt;
`&lt;/template&gt;`

&lt;!-- WrapperComponent.vue --&gt;
`&lt;script setup&gt;`
import MyButton from './MyButton.vue'
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;MyButton&gt;
    `&lt;template&gt;`
      &lt;svg&gt;...&lt;/svg&gt;
    `&lt;/template&gt;`
    `&lt;template&gt;`
      Click me
    `&lt;/template&gt;`
  &lt;/MyButton&gt;
`&lt;/template&gt;`
```

### 与作用域插槽结合

```text
&lt;!-- DataTable.vue --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const props = defineProps({
  items: Array
})

const slots = useSlots()

// 检查是否有自定义渲染
const hasCustomRender = computed(() =&gt; {
  return slots.item || slots.default
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;table&gt;
    &lt;tbody&gt;
      &lt;tr v-for="(item, index) in items" :key="index"&gt;
        &lt;!-- 如果有自定义插槽，使用它 --&gt;
        `&lt;template&gt;`
          &lt;slot name="item" :item="item" :index="index" /&gt;
        `&lt;/template&gt;`

        &lt;!-- 否则使用默认渲染 --&gt;
        `&lt;template&gt;`
          &lt;td&gt;{{ item }}&lt;/td&gt;
        `&lt;/template&gt;`
      &lt;/tr&gt;
    &lt;/tbody&gt;
  &lt;/table&gt;
`&lt;/template&gt;`
```

### TypeScript 类型支持

```text
&lt;script setup lang="ts"&gt;
import { useSlots } from 'vue'

interface Slots {
  default?: () =&gt; VNode[]
  header?: (props: { title: string }) =&gt; VNode[]
  footer?: () =&gt; VNode[]
}

const slots = useSlots() as Slots

// 类型安全
if (slots.header) {
  const headerVNodes = slots.header({ title: 'Hello' })
}
`&lt;/script&gt;`
```

### 在 setup 函数中使用

```text
import { useSlots, h } from 'vue'

export default {
  setup() {
    const slots = useSlots()

    return () =&gt; h('div', [
      slots.header?.(),
      slots.default?.(),
      slots.footer?.()
    ])
  }
}
```

### 条件插槽渲染

```text
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const slots = useSlots()

// 检查多个插槽
const slotNames = computed(() =&gt; {
  return Object.keys(slots).filter(name =&gt; {
    return slots[name] && slots[name]().length &gt; 0
  })
})

// 判断是否有任何插槽内容
const hasSlotContent = computed(() =&gt; {
  return slotNames.value.length &gt; 0
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="wrapper"&gt;
    &lt;div v-if="!hasSlotContent" class="empty-state"&gt;
      No content provided
    &lt;/div&gt;

    `&lt;template&gt;`
      &lt;slot :name="name" /&gt;
    `&lt;/template&gt;`
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. slots 是响应式的

```text
const slots = useSlots()

// slots 对象本身是响应式的
watchEffect(() =&gt; {
  console.log(Object.keys(slots)) // 当插槽变化时重新执行
})
```

### 2. 插槽是函数

```text
const slots = useSlots()

// ✅ 正确：调用函数获取内容
const defaultContent = slots.default?.()

// ❌ 错误：直接使用 slots.default
// 它是一个函数，不是内容本身
```

### 3. 空插槽处理

```text
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

```text
&lt;!-- 父组件 --&gt;
&lt;MyComponent&gt;
  `&lt;template&gt;`
    {{ slotProps.value }}
  `&lt;/template&gt;`
&lt;/MyComponent&gt;

&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

// 访问插槽作用域
if (slots.default) {
  const vnodes = slots.default({ value: 'Hello' })
}
`&lt;/script&gt;`
```

### 5. 插槽内容修改

```text
const slots = useSlots()

// 获取插槽内容
const content = slots.default?.()

// 修改 VNode（需要谨慎）
const modifiedContent = content?.map(vnode =&gt; {
  // 修改逻辑
  return vnode
})
```

### 6. 与模板 ref 的配合

```text
`&lt;script setup&gt;`
import { useSlots, ref } from 'vue'

const slots = useSlots()
const slotContentRef = ref(null)

// 访问插槽中的元素
onMounted(() =&gt; {
  const content = slots.default?.()
  // 遍历 VNode 查找元素
})
`&lt;/script&gt;`
```

### 7. 默认内容

```text
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

// 提供默认内容
const content = computed(() =&gt; {
  if (slots.default && slots.default().length &gt; 0) {
    return slots.default
  }
  return () =&gt; 'Default content'
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;component :is="content" /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 动态组件插槽

```text
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const props = defineProps({
  layout: String
})

const slots = useSlots()

const layoutSlots = computed(() =&gt; {
  // 根据布局选择插槽
  return slots[props.layout] || slots.default
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;component :is="() =&gt; layoutSlots()" /&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 布局组件

```text
&lt;!-- Layout.vue --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

const hasHeader = computed(() =&gt; !!(slots.header && slots.header().length))
const hasSidebar = computed(() =&gt; !!(slots.sidebar && slots.sidebar().length))
const hasFooter = computed(() =&gt; !!(slots.footer && slots.footer().length))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="layout" :class="{ 'has-sidebar': hasSidebar }"&gt;
    &lt;header v-if="hasHeader" class="layout-header"&gt;
      &lt;slot name="header" /&gt;
    &lt;/header&gt;

    &lt;div class="layout-body"&gt;
      &lt;aside v-if="hasSidebar" class="layout-sidebar"&gt;
        &lt;slot name="sidebar" /&gt;
      &lt;/aside&gt;

      &lt;main class="layout-content"&gt;
        &lt;slot /&gt;
      &lt;/main&gt;
    &lt;/div&gt;

    &lt;footer v-if="hasFooter" class="layout-footer"&gt;
      &lt;slot name="footer" /&gt;
    &lt;/footer&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 表格组件

```text
&lt;!-- DataTable.vue --&gt;
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const props = defineProps({
  data: Array,
  columns: Array
})

const slots = useSlots()

// 检查是否有单元格插槽
const hasCellSlot = (field) =&gt; {
  return !!slots[`cell-${field}`]
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;table&gt;
    &lt;thead&gt;
      &lt;tr&gt;
        &lt;th v-for="col in columns" :key="col.field"&gt;
          {{ col.label }}
        &lt;/th&gt;
      &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
      &lt;tr v-for="(row, rowIndex) in data" :key="rowIndex"&gt;
        &lt;td v-for="col in columns" :key="col.field"&gt;
          &lt;!-- 使用自定义插槽渲染 --&gt;
          &lt;slot
            v-if="hasCellSlot(col.field)"
            :name="`cell-${col.field}`"
            :row="row"
            :value="row[col.field]"
          /&gt;
          &lt;!-- 默认渲染 --&gt;
          &lt;span v-else&gt;{{ row[col.field] }}&lt;/span&gt;
        &lt;/td&gt;
      &lt;/tr&gt;
    &lt;/tbody&gt;
  &lt;/table&gt;
`&lt;/template&gt;`
```

### 3. 卡片组件

```text
&lt;!-- Card.vue --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const slots = useSlots()

const hasCover = computed(() =&gt; !!(slots.cover && slots.cover().length))
const hasActions = computed(() =&gt; !!(slots.actions && slots.actions().length))
const hasHeader = computed(() =&gt; !!(slots.header && slots.header().length))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="card"&gt;
    &lt;div v-if="hasCover" class="card-cover"&gt;
      &lt;slot name="cover" /&gt;
    &lt;/div&gt;

    &lt;div v-if="hasHeader" class="card-header"&gt;
      &lt;slot name="header" /&gt;
    &lt;/div&gt;

    &lt;div class="card-body"&gt;
      &lt;slot /&gt;
    &lt;/div&gt;

    &lt;div v-if="hasActions" class="card-actions"&gt;
      &lt;slot name="actions" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 弹窗组件

```text
&lt;!-- Modal.vue --&gt;
`&lt;script setup&gt;`
import { useSlots } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const slots = useSlots()

const hasHeader = computed(() =&gt; !!(slots.header && slots.header().length))
const hasFooter = computed(() =&gt; !!(slots.footer && slots.footer().length))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;div v-if="modelValue" class="modal"&gt;
      &lt;div class="modal-content"&gt;
        &lt;div v-if="hasHeader" class="modal-header"&gt;
          &lt;slot name="header" /&gt;
          &lt;button @click="emit('update:modelValue', false)"&gt;×&lt;/button&gt;
        &lt;/div&gt;

        &lt;div class="modal-body"&gt;
          &lt;slot /&gt;
        &lt;/div&gt;

        &lt;div v-if="hasFooter" class="modal-footer"&gt;
          &lt;slot name="footer" /&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

### 5. 标签页组件

```text
&lt;!-- Tabs.vue --&gt;
`&lt;script setup&gt;`
import { useSlots, ref, computed } from 'vue'

const slots = useSlots()

const activeTab = ref(0)

// 从插槽中提取标签
const tabs = computed(() =&gt; {
  const content = slots.default?.() || []
  return content
    .filter(vnode =&gt; vnode.type && vnode.type.name === 'TabPanel')
    .map((vnode, index) =&gt; ({
      index,
      title: vnode.props?.title || `Tab ${index + 1}`,
      vnode
    }))
})

const activePanel = computed(() =&gt; {
  return tabs.value[activeTab.value]?.vnode
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="tabs"&gt;
    &lt;div class="tab-headers"&gt;
      &lt;button
        v-for="tab in tabs"
        :key="tab.index"
        :class="{ active: activeTab === tab.index }"
        @click="activeTab = tab.index"
      &gt;
        {{ tab.title }}
      &lt;/button&gt;
    &lt;/div&gt;

    &lt;div class="tab-content"&gt;
      &lt;component :is="activePanel" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 表单组件

```text
&lt;!-- FormItem.vue --&gt;
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const props = defineProps({
  label: String,
  error: String
})

const slots = useSlots()

const hasLabel = computed(() =&gt; {
  return !!(props.label || (slots.label && slots.label().length))
})

const hasExtra = computed(() =&gt; {
  return !!(slots.extra && slots.extra().length)
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="form-item" :class="{ 'has-error': error }"&gt;
    &lt;label v-if="hasLabel" class="form-label"&gt;
      &lt;slot name="label"&gt;{{ label }}&lt;/slot&gt;
    &lt;/label&gt;

    &lt;div class="form-content"&gt;
      &lt;slot /&gt;
    &lt;/div&gt;

    &lt;div v-if="hasExtra" class="form-extra"&gt;
      &lt;slot name="extra" /&gt;
    &lt;/div&gt;

    &lt;div v-if="error" class="form-error"&gt;
      {{ error }}
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 列表组件

```text
&lt;!-- List.vue --&gt;
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const props = defineProps({
  items: Array
})

const slots = useSlots()

const hasItemSlot = computed(() =&gt; !!slots.item)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul class="list"&gt;
    &lt;li v-for="(item, index) in items" :key="index" class="list-item"&gt;
      &lt;!-- 自定义渲染 --&gt;
      &lt;slot v-if="hasItemSlot" name="item" :item="item" :index="index" /&gt;
      &lt;!-- 默认渲染 --&gt;
      `&lt;template&gt;`{{ item }}`&lt;/template&gt;`
    &lt;/li&gt;
  &lt;/ul&gt;

  &lt;!-- 空状态 --&gt;
  &lt;div v-if="items.length === 0" class="empty-state"&gt;
    &lt;slot name="empty"&gt;
      No items
    &lt;/slot&gt;
  &lt;/div&gt;

  &lt;!-- 加载状态 --&gt;
  &lt;div v-if="$attrs.loading" class="loading-state"&gt;
    &lt;slot name="loading"&gt;
      Loading...
    &lt;/slot&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 树形组件

```text
&lt;!-- Tree.vue --&gt;
`&lt;script setup&gt;`
import { useSlots, computed } from 'vue'

const props = defineProps({
  data: Array
})

const slots = useSlots()

const hasNodeSlot = computed(() =&gt; !!slots.node)
const hasIconSlot = computed(() =&gt; !!slots.icon)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="tree"&gt;
    &lt;TreeNode
      v-for="node in data"
      :key="node.id"
      :node="node"
    &gt;
      `&lt;template&gt;`
        &lt;slot v-if="hasNodeSlot" name="node" :node="node" :expanded="expanded" /&gt;
        `&lt;template&gt;`{{ node.label }}`&lt;/template&gt;`
      `&lt;/template&gt;`

      `&lt;template&gt;`
        &lt;slot v-if="hasIconSlot" name="icon" :node="node" :expanded="expanded" /&gt;
        `&lt;template&gt;`{{ expanded ? '▼' : '▶' }}`&lt;/template&gt;`
      `&lt;/template&gt;`
    &lt;/TreeNode&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

## useSlots 与其他 API 的区别

| API | 用途 |
|-----|------|
| useSlots | 在 `&lt;script setup&gt;` 中访问插槽 |
| useAttrs | 访问未声明的 attrs |
| $slots | 选项式 API 中访问插槽 |
| &lt;slot> | 在模板中渲染插槽 |

## 最佳实践

1. **检查插槽存在**：使用可选链和长度检查
2. **提供默认内容**：为插槽提供有意义的默认内容
3. **命名规范**：使用清晰的插槽命名
4. **作用域插槽**：提供有用的上下文数据
5. **透传插槽**：包装组件时正确透传插槽
