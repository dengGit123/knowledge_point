# defineSlots

> 📖 [官方文档 - defineSlots](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)

### 一、概述

`defineSlots()` 是 Vue 3.3+ 提供的一个编译器宏，用于在 `<script setup>` 中为插槽（Slots）提供**类型声明**和**类型检查**能力。它只接受类型参数，不接受运行时参数，主要作用是为 IDE 提供插槽名称和插槽 props 的类型提示。同时它还会返回一个 `slots` 对象，该对象等同于 `useSlots()` 或 `setup()` 上下文中的 `slots`。

简单来说：`defineSlots` 让你在 TypeScript + `<script setup>` 中，能像定义 props 一样严谨地定义插槽的名称和它所接收的参数类型，从而获得更好的开发体验和类型安全。

### 二、核心原理

#### 工作原理

`defineSlots` 是一个**编译器宏**，它在编译阶段会被处理，不会产生额外的运行时代码。其核心机制如下：

1. **类型声明阶段**：开发者通过泛型参数声明每个插槽的名称和该插槽期望接收的 props 类型
2. **编译阶段**：编译器解析类型信息，生成对应的类型提示数据，供 IDE 和语言服务使用
3. **运行时阶段**：返回的 `slots` 对象本质上是一个包含所有已传入插槽的函数集合，每个插槽名称对应一个渲染函数

#### 类比理解

可以把 `defineSlots` 想象成一个**插槽合同**：

- `defineProps` 是组件和父组件之间关于**属性**的合同
- `defineEmits` 是组件和父组件之间关于**事件**的合同
- `defineSlots` 是组件和父组件之间关于**插槽**的合同

它告诉父组件："我这个组件提供以下插槽，每个插槽可以传递这些参数"，让 IDE 能在你使用插槽时给出精准的提示。

#### 与 useSlots 的区别

| 特性 | `defineSlots()` | `useSlots()` |
|------|-----------------|--------------|
| 类型支持 | 支持泛型类型声明 | 无类型声明能力 |
| 编译器宏 | 是（编译时处理） | 否（运行时函数） |
| 需要导入 | 不需要（自动可用） | 需要从 `vue` 导入 |
| 返回值 | 带类型的 slots 对象 | 无类型的 slots 对象 |
| Vue 版本 | 3.3+ | 3.0+ |

### 三、详细用法

#### 1. 基本用法

最简单的用法是不传类型参数，直接获取 slots 对象：

```vue
<script setup lang="ts">
const slots = defineSlots()

// 检查某个插槽是否被传入
if (slots.header) {
  console.log('header 插槽已被使用')
}
</script>

<template>
  <div class="container">
    <div v-if="slots.header" class="header">
      <slot name="header" />
    </div>
    <div class="body">
      <slot />
    </div>
    <div v-if="slots.footer" class="footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

#### 2. 进阶用法

##### 带类型声明的插槽

通过泛型参数声明每个插槽的名称和 props 类型，获得完整的类型提示：

```vue
<script setup lang="ts">
const slots = defineSlots<{
  default(props: { message: string; count: number }): any
  header(props: { title: string }): any
  footer?(): any  // 可选插槽，用 ? 标记
}>()
</script>

<template>
  <div class="card">
    <div class="card-header">
      <!-- 向 header 插槽传递 props -->
      <slot name="header" :title="cardTitle" />
    </div>
    <div class="card-body">
      <!-- 向 default 插槽传递 props -->
      <slot :message="bodyMessage" :count="itemCount" />
    </div>
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

父组件使用时会获得类型提示：

```vue
<script setup lang="ts">
import Card from './Card.vue'

const cardTitle = ref('用户信息')
const bodyMessage = ref('欢迎使用')
const itemCount = ref(42)
</script>

<template>
  <Card>
    <!-- IDE 会提示 title 是 string 类型 -->
    <template #header="{ title }">
      <h2>{{ title }}</h2>
    </template>

    <!-- IDE 会提示 message 是 string，count 是 number -->
    <template #default="{ message, count }">
      <p>{{ message }} - 共 {{ count }} 项</p>
    </template>

    <template #footer>
      <span>底部内容</span>
    </template>
  </Card>
</template>
```

##### 使用 interface 定义插槽类型

当插槽类型较复杂时，推荐使用 interface 抽离类型定义：

```vue
<script setup lang="ts">
interface ListSlotProps {
  item: {
    id: number
    name: string
    avatar: string
    email: string
  }
  index: number
  isActive: boolean
}

interface HeaderSlotProps {
  title: string
  totalCount: number
}

const slots = defineSlots<{
  default(props: ListSlotProps): any
  header(props: HeaderSlotProps): any
  empty?(): any
}>()

const list = ref([
  { id: 1, name: '张三', avatar: '/a.png', email: 'zhangsan@mail.com' },
  { id: 2, name: '李四', avatar: '/b.png', email: 'lisi@mail.com' },
])
const activeIndex = ref(0)
</script>

<template>
  <div class="user-list">
    <div class="list-header">
      <slot name="header" title="用户列表" :total-count="list.length" />
    </div>

    <template v-if="list.length > 0">
      <div v-for="(item, index) in list" :key="item.id" class="list-item">
        <slot :item="item" :index="index" :is-active="index === activeIndex" />
      </div>
    </template>

    <div v-else class="list-empty">
      <slot name="empty" />
    </div>
  </div>
</template>
```

##### 结合 computed 实现条件插槽布局

```vue
<script setup lang="ts">
import { computed } from 'vue'

const slots = defineSlots<{
  default(): any
  sidebar?(): any
  header?(): any
  footer?(): any
}>()

const hasSidebar = computed(() => !!slots.sidebar)
const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)

const layoutClass = computed(() => ({
  'layout--with-sidebar': hasSidebar.value,
  'layout--with-header': hasHeader.value,
  'layout--with-footer': hasFooter.value,
}))
</script>

<template>
  <div class="layout" :class="layoutClass">
    <header v-if="hasHeader" class="layout-header">
      <slot name="header" />
    </header>
    <div class="layout-body">
      <main class="layout-content">
        <slot />
      </main>
      <aside v-if="hasSidebar" class="layout-sidebar">
        <slot name="sidebar" />
      </aside>
    </div>
    <footer v-if="hasFooter" class="layout-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

##### 泛型组件中的 defineSlots

```vue
<script setup lang="ts" generic="T extends { id: number }">
interface ItemSlotProps {
  item: T
  index: number
}

const slots = defineSlots<{
  default(props: ItemSlotProps): any
  header?(): any
}>()

const props = defineProps<{
  items: T[]
}>()
</script>

<template>
  <div>
    <slot name="header" />
    <div v-for="(item, index) in items" :key="item.id">
      <slot :item="item" :index="index" />
    </div>
  </div>
</template>
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 泛型参数 | `Record<string, SlotFunction>` | 否 | 类型字面量，属性键为插槽名称，值为插槽函数签名 |
| 运行时参数 | 无 | - | 不接受任何运行时参数 |
| 返回值 | `Slots` | - | 插槽对象，等同于 `useSlots()` 返回值 |

**插槽函数签名规范：**

```ts
// 插槽函数的第一个参数是插槽接收的 props 类型
// 返回类型目前被忽略，可以写 any
type SlotFunction = (props: { /* 插槽 props 类型 */ }) => any

// 可选插槽用 ? 标记
type SlotsType = {
  required(props: { msg: string }): any    // 必需插槽
  optional?(props: { title: string }): any // 可选插槽
}
```

### 四、实现效果

#### 类型提示效果

使用 `defineSlots` 后，父组件在使用插槽时会获得精准的类型提示：

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import ChildComponent from './ChildComponent.vue'
</script>

<template>
  <ChildComponent>
    <!-- ✅ IDE 自动提示解构出 msg（string 类型）和 count（number 类型） -->
    <template #default="{ msg, count }">
      <p>{{ msg }}</p>
      <span>{{ count }}</span>
    </template>

    <!-- ✅ IDE 自动提示解构出 title（string 类型） -->
    <template #header="{ title }">
      <h1>{{ title }}</h1>
    </template>

    <!-- ❌ 如果写成未声明的插槽名，IDE 会报错 -->
    <!-- <template #unknown>Unknown Slot</template> -->
  </ChildComponent>
</template>
```

其中 `ChildComponent.vue` 的定义：

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
const slots = defineSlots<{
  default(props: { msg: string; count: number }): any
  header(props: { title: string }): any
}>()

const message = 'Hello World'
const count = 100
const title = '页面标题'
</script>

<template>
  <div>
    <div class="header">
      <slot name="header" :title="title" />
    </div>
    <div class="content">
      <slot :msg="message" :count="count" />
    </div>
  </div>
</template>
```

#### 条件渲染效果

运行后，当父组件传入或未传入插槽时，组件会自动判断并渲染不同结构：

```vue
<!-- 使用场景 A：传入 header 插槽 -->
<Layout>
  <template #header>
    <nav>导航栏</nav>
  </template>
  <p>主内容</p>
</Layout>

<!-- 渲染结果：header 区域显示导航栏，body 显示主内容 -->

<!-- 使用场景 B：不传 header 插槽 -->
<Layout>
  <p>主内容</p>
</Layout>

<!-- 渲染结果：header 区域不渲染，只显示主内容 -->
```

### 五、使用场景

#### 场景 1：通用卡片组件

卡片组件需要支持自定义头部、内容和底部：

```vue
<!-- Card.vue -->
<script setup lang="ts">
const slots = defineSlots<{
  header?(props: { closeable: boolean }): any
  default(): any
  footer?(props: { actions: string[] }): any
}>()

const closeable = ref(true)
const actions = ref(['确认', '取消'])
</script>

<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" :closeable="closeable" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" :actions="actions" />
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
.card-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}
.card-body {
  padding: 16px;
}
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}
</style>
```

#### 场景 2：数据表格组件

表格组件支持自定义列渲染：

```vue
<!-- DataTable.vue -->
<script setup lang="ts">
interface Column {
  key: string
  label: string
  width?: number
}

interface CellSlotProps {
  row: Record<string, any>
  column: Column
  rowIndex: number
  value: any
}

const slots = defineSlots<{
  [key: `cell-${string}`](props: CellSlotProps): any
  header?(props: { columns: Column[] }): any
  empty?(): any
}>()

const props = defineProps<{
  columns: Column[]
  data: Record<string, any>[]
}>()
</script>

<template>
  <div class="data-table">
    <div v-if="$slots.header" class="table-header">
      <slot name="header" :columns="columns" />
    </div>
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ width: col.width + 'px' }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="data.length > 0">
          <tr v-for="(row, rowIndex) in data" :key="rowIndex">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row" :column="col" :row-index="rowIndex" :value="row[col.key]" />
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td :colspan="columns.length">
              <slot name="empty">
                <div class="empty-text">暂无数据</div>
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
```

#### 场景 3：标签页组件

标签页组件支持自定义每个标签页的内容：

```vue
<!-- Tabs.vue -->
<script setup lang="ts">
interface TabSlotProps {
  active: boolean
  index: number
}

const slots = defineSlots<{
  [key: string](props: TabSlotProps): any
}>()

const props = defineProps<{
  tabs: { key: string; label: string }[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="tabs">
    <div class="tabs-nav">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tabs-content">
      <template v-for="(tab, index) in tabs" :key="tab.key">
        <div v-show="activeTab === tab.key">
          <slot :name="tab.key" :active="activeTab === tab.key" :index="index" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tabs-nav button.active {
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
}
</style>
```

#### 场景 4：对话框/弹窗组件

弹窗组件支持自定义头部、内容、底部按钮区：

```vue
<!-- Dialog.vue -->
<script setup lang="ts">
interface DialogSlotProps {
  close: () => void
  confirm: () => void
}

const slots = defineSlots<{
  header?(props: DialogSlotProps): any
  default(props: DialogSlotProps): any
  footer?(props: DialogSlotProps): any
}>()

const props = defineProps<{
  visible: boolean
  title?: string
  width?: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
}>()

function close() {
  emit('update:visible', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="dialog-overlay" @click.self="close">
        <div class="dialog" :style="{ width: width + 'px' }">
          <div class="dialog-header">
            <slot name="header" :close="close" :confirm="confirm">
              <h3>{{ title }}</h3>
              <button class="close-btn" @click="close">&times;</button>
            </slot>
          </div>
          <div class="dialog-body">
            <slot :close="close" :confirm="confirm" />
          </div>
          <div v-if="$slots.footer" class="dialog-footer">
            <slot name="footer" :close="close" :confirm="confirm" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog {
  background: #fff;
  border-radius: 8px;
  min-width: 400px;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}
.dialog-body {
  padding: 20px;
}
.dialog-footer {
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}
</style>
```

#### 场景 5：列表组件

列表组件支持自定义每一项的渲染方式：

```vue
<!-- VirtualList.vue -->
<script setup lang="ts">
interface ItemSlotProps<T> {
  item: T
  index: number
  isSelected: boolean
  toggleSelect: () => void
}

const slots = defineSlots<{
  default(props: { item: any; index: number; isSelected: boolean; toggleSelect: () => void }): any
  loading?(): any
  empty?(): any
}>()

const props = defineProps<{
  items: any[]
  loading?: boolean
}>()

const selectedIndices = ref<Set<number>>(new Set())

function toggleSelect(index: number) {
  if (selectedIndices.value.has(index)) {
    selectedIndices.value.delete(index)
  } else {
    selectedIndices.value.add(index)
  }
}
</script>

<template>
  <div class="virtual-list">
    <div v-if="loading" class="list-loading">
      <slot name="loading">
        <span>加载中...</span>
      </slot>
    </div>

    <template v-else-if="items.length > 0">
      <div v-for="(item, index) in items" :key="index" class="list-item">
        <slot
          :item="item"
          :index="index"
          :is-selected="selectedIndices.has(index)"
          :toggle-select="() => toggleSelect(index)"
        />
      </div>
    </template>

    <div v-else class="list-empty">
      <slot name="empty">
        <p>暂无数据</p>
      </slot>
    </div>
  </div>
</template>
```

#### 场景 6：表单组件

表单组件支持自定义标签、错误信息等区域：

```vue
<!-- FormItem.vue -->
<script setup lang="ts">
interface FormItemSlotProps {
  value: any
  setValue: (val: any) => void
  error: string
  touched: boolean
}

const slots = defineSlots<{
  default(props: FormItemSlotProps): any
  label?(): any
  error?(props: { error: string }): any
  extra?(): any
}>()

const props = defineProps<{
  label?: string
  modelValue: any
  error?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const touched = ref(false)

function setValue(val: any) {
  touched.value = true
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="form-item" :class="{ 'has-error': error && touched }">
    <label v-if="label || $slots.label" class="form-label">
      <slot name="label">
        {{ label }}
        <span v-if="required" class="required">*</span>
      </slot>
    </label>
    <div class="form-control">
      <slot :value="modelValue" :set-value="setValue" :error="error ?? ''" :touched="touched" />
    </div>
    <div v-if="error && touched" class="form-error">
      <slot name="error" :error="error">
        {{ error }}
      </slot>
    </div>
    <div v-if="$slots.extra" class="form-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.form-item {
  margin-bottom: 16px;
}
.form-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}
.required {
  color: #f5222d;
}
.form-error {
  color: #f5222d;
  font-size: 12px;
  margin-top: 4px;
}
</style>
```

#### 场景 7：面包屑导航组件

面包屑组件支持自定义分隔符和每一项的渲染：

```vue
<!-- Breadcrumb.vue -->
<script setup lang="ts">
interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

interface CrumbSlotProps {
  item: BreadcrumbItem
  index: number
  isLast: boolean
}

const slots = defineSlots<{
  default(props: CrumbSlotProps): any
  separator?(): any
}>()

const props = defineProps<{
  items: BreadcrumbItem[]
  separator?: string
}>()
</script>

<template>
  <nav class="breadcrumb" aria-label="面包屑导航">
    <template v-for="(item, index) in items" :key="index">
      <span class="breadcrumb-item">
        <slot :item="item" :index="index" :is-last="index === items.length - 1">
          <router-link v-if="item.path && index !== items.length - 1" :to="item.path">
            {{ item.title }}
          </router-link>
          <span v-else :class="{ current: index === items.length - 1 }">
            {{ item.title }}
          </span>
        </slot>
      </span>
      <span v-if="index !== items.length - 1" class="breadcrumb-separator">
        <slot name="separator">
          {{ separator || '/' }}
        </slot>
      </span>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.breadcrumb-separator {
  margin: 0 8px;
  color: #999;
}
.current {
  color: #333;
  font-weight: 500;
}
</style>
```

#### 场景 8：下拉菜单组件

下拉菜单支持自定义触发器和菜单项：

```vue
<!-- Dropdown.vue -->
<script setup lang="ts">
interface MenuItem {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  divided?: boolean
}

interface MenuItemSlotProps {
  item: MenuItem
  index: number
  active: boolean
}

const slots = defineSlots<{
  trigger(): any
  default(props: MenuItemSlotProps): any
}>()

const props = defineProps<{
  items: MenuItem[]
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const isOpen = ref(false)
const activeIndex = ref(-1)
const triggerRef = ref<HTMLElement>()

function toggle() {
  isOpen.value = !isOpen.value
}

function handleSelect(item: MenuItem) {
  if (item.disabled) return
  emit('select', item.key)
  isOpen.value = false
}

// 点击外部关闭
onClickOutside(triggerRef, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="triggerRef" class="dropdown" :class="{ open: isOpen }">
    <div class="dropdown-trigger" @click="toggle">
      <slot name="trigger" />
    </div>
    <Transition name="slide">
      <div v-if="isOpen" class="dropdown-menu">
        <template v-for="(item, index) in items" :key="item.key">
          <div
            v-if="item.divided && index > 0"
            class="dropdown-divider"
          />
          <div
            class="dropdown-item"
            :class="{
              disabled: item.disabled,
              active: activeIndex === index,
            }"
            @click="handleSelect(item)"
            @mouseenter="activeIndex = index"
            @mouseleave="activeIndex = -1"
          >
            <slot :item="item" :index="index" :active="activeIndex === index">
              {{ item.label }}
            </slot>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 120px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}
.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}
.dropdown-item:hover,
.dropdown-item.active {
  background: #f5f5f5;
}
.dropdown-item.disabled {
  color: #ccc;
  cursor: not-allowed;
}
.dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}
</style>
```

#### 场景 9：步骤条组件

步骤条组件支持自定义每一步的图标和内容：

```vue
<!-- Steps.vue -->
<script setup lang="ts">
interface StepItem {
  title: string
  description?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
}

interface StepSlotProps {
  step: StepItem
  index: number
  current: number
  isLast: boolean
  status: 'wait' | 'process' | 'finish' | 'error'
}

interface IconSlotProps {
  index: number
  status: 'wait' | 'process' | 'finish' | 'error'
}

const slots = defineSlots<{
  default(props: StepSlotProps): any
  icon?(props: IconSlotProps): any
}>()

const props = defineProps<{
  steps: StepItem[]
  current: number
}>()

function getStepStatus(index: number): 'wait' | 'process' | 'finish' | 'error' {
  const step = props.steps[index]
  if (step.status) return step.status
  if (index < props.current) return 'finish'
  if (index === props.current) return 'process'
  return 'wait'
}
</script>

<template>
  <div class="steps">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step"
      :class="getStepStatus(index)"
    >
      <div class="step-head">
        <div class="step-icon">
          <slot name="icon" :index="index" :status="getStepStatus(index)">
            <span class="icon-number">{{ index + 1 }}</span>
          </slot>
        </div>
        <div v-if="index !== steps.length - 1" class="step-line" />
      </div>
      <div class="step-main">
        <div class="step-title">{{ step.title }}</div>
        <div v-if="step.description" class="step-description">
          {{ step.description }}
        </div>
        <slot
          :step="step"
          :index="index"
          :current="current"
          :is-last="index === steps.length - 1"
          :status="getStepStatus(index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.steps {
  display: flex;
}
.step {
  flex: 1;
  position: relative;
}
.step-head {
  display: flex;
  align-items: center;
}
.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #999;
  font-size: 14px;
}
.step.process .step-icon {
  background: #1890ff;
  color: #fff;
}
.step.finish .step-icon {
  background: #52c41a;
  color: #fff;
}
.step.error .step-icon {
  background: #f5222d;
  color: #fff;
}
.step-line {
  flex: 1;
  height: 2px;
  background: #e0e0e0;
  margin: 0 8px;
}
.step.finish .step-line {
  background: #52c41a;
}
.step-title {
  margin-top: 8px;
  font-weight: 500;
}
.step-description {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>
```

#### 场景 10：可组合的布局组件

页面布局组件支持多个插槽区域灵活组合：

```vue
<!-- PageLayout.vue -->
<script setup lang="ts">
const slots = defineSlots<{
  default(): any
  header?(): any
  sidebar?(): any
  footer?(): any
  breadcrumb?(): any
  extra?(): any
}>()

const hasSidebar = computed(() => !!slots.sidebar)
const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
const hasBreadcrumb = computed(() => !!slots.breadcrumb)
const hasExtra = computed(() => !!slots.extra)
</script>

<template>
  <div class="page-layout">
    <!-- 顶部导航栏 -->
    <header v-if="hasHeader" class="page-header">
      <slot name="header" />
    </header>

    <div class="page-body">
      <!-- 侧边栏 -->
      <aside v-if="hasSidebar" class="page-sidebar">
        <slot name="sidebar" />
      </aside>

      <!-- 主内容区 -->
      <main class="page-main">
        <!-- 面包屑 -->
        <div v-if="hasBreadcrumb" class="page-breadcrumb">
          <slot name="breadcrumb" />
        </div>

        <!-- 额外操作区 -->
        <div v-if="hasExtra" class="page-extra">
          <slot name="extra" />
        </div>

        <!-- 主内容 -->
        <div class="page-content">
          <slot />
        </div>
      </main>
    </div>

    <!-- 底部 -->
    <footer v-if="hasFooter" class="page-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.page-body {
  display: flex;
  flex: 1;
}
.page-sidebar {
  width: 220px;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
}
.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.page-breadcrumb {
  margin-bottom: 12px;
}
.page-extra {
  margin-bottom: 16px;
}
.page-content {
  flex: 1;
}
.page-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  color: #999;
}
</style>
```

### 六、注意事项

1. **仅在 `<script setup>` 中可用**

   `defineSlots` 是编译器宏，只能在 `<script setup>` 中使用，不能在普通的 `<script>` 块或独立的 `.ts` 文件中使用。

   ```vue
   <!-- ❌ 错误：不能在普通 script 中使用 -->
   <script lang="ts">
   const slots = defineSlots() // 编译报错
   </script>

   <!-- ✅ 正确：在 script setup 中使用 -->
   <script setup lang="ts">
   const slots = defineSlots()
   </script>
   ```

2. **仅支持 Vue 3.3+**

   `defineSlots` 是 Vue 3.3 新增的编译器宏，低于 3.3 的版本不支持。在旧版本中应使用 `useSlots()` 替代。

3. **不需要显式导入**

   `defineSlots` 是编译器宏，和 `defineProps`、`defineEmits` 一样，不需要从 `vue` 中导入，会自动在 `<script setup>` 中可用。

   ```vue
   <!-- ❌ 不需要导入 -->
   <script setup lang="ts">
   import { defineSlots } from 'vue' // 多余，不需要
   const slots = defineSlots()
   </script>

   <!-- ✅ 直接使用 -->
   <script setup lang="ts">
   const slots = defineSlots()
   </script>
   ```

4. **只接受类型参数，不接受运行时参数**

   `defineSlots` 的括号内不传入任何运行时参数，所有配置都通过泛型类型参数完成。

   ```ts
   // ❌ 错误：不能传运行时参数
   defineSlots({
     header: { ... }
   })

   // ✅ 正确：通过泛型传类型参数
   defineSlots<{
     header(props: { title: string }): any
   }>()
   ```

5. **返回值类型目前被忽略**

   插槽函数的返回类型目前不被使用，统一写 `any` 即可。未来 Vue 可能会利用它来检查插槽内容。

   ```ts
   // ✅ 返回值写 any
   defineSlots<{
     default(props: { msg: string }): any
   }>()
   ```

6. **可选插槽用 `?` 标记**

   使用 `?` 标记的插槽表示该插槽是可选的，父组件可以不传入。未标记的插槽建议父组件传入。

   ```ts
   defineSlots<{
     default(): any         // 建议传入
     header?(): any         // 可选，可以不传
     footer?(props: { copyright: string }): any // 可选带 props
   }>()
   ```

7. **检查插槽是否存在时的正确方式**

   检查插槽是否存在应该使用 `!!slots.xxx` 或 `!!$slots.xxx`，而不是直接判断插槽函数的返回值。

   ```vue
   <script setup lang="ts">
   const slots = defineSlots()

   // ✅ 正确：通过存在性检查
   const hasHeader = computed(() => !!slots.header)

   // ❌ 错误：不要试图调用 slots 来检查是否存在
   // slots.header?.() 这样做会在每次渲染时执行
   </script>

   <template>
     <!-- ✅ 正确：使用 $slots 检查 -->
     <div v-if="$slots.header">
       <slot name="header" />
     </div>

     <!-- ✅ 正确：使用 computed 变量检查 -->
     <div v-if="hasHeader">
       <slot name="header" />
     </div>
   </template>
   ```

8. **插槽 props 类型必须与模板中传递的一致**

   `defineSlots` 中声明的 props 类型应该与模板中 `<slot>` 标签实际传递的 props 保持一致，否则类型提示会不准确。

   ```vue
   <script setup lang="ts">
   // ✅ 正确：声明的 props 和模板传递的匹配
   const slots = defineSlots<{
     default(props: { msg: string; count: number }): any
   }>()

   const message = 'Hello'
   const num = 42
   </script>

   <template>
     <!-- 传递的 props 要和声明的一致 -->
     <slot :msg="message" :count="num" />
   </template>
   ```

9. **在泛型组件中使用时需结合 `generic` 属性**

   当组件需要泛型支持时，应在 `<script setup>` 标签上添加 `generic` 属性，并在 `defineSlots` 的类型中引用泛型参数。

   ```vue
   <!-- ✅ 正确用法 -->
   <script setup lang="ts" generic="T">
   const slots = defineSlots<{
     default(props: { item: T; index: number }): any
   }>()

   defineProps<{ items: T[] }>()
   </script>
   ```

10. **`defineSlots` 与动态插槽名的结合限制**

    `defineSlots` 的类型参数中的键名必须是静态的字符串字面量，不能用于完全动态的插槽名。如果需要动态插槽名，只能使用 `Record<string, ...>` 或不做类型声明。

    ```ts
    // ❌ 不支持动态插槽名的类型声明
    defineSlots<{
      [dynamicName: string](props: any): any // 不支持
    }>()

    // ✅ 如果插槽名是固定的模式，可以用模板字面量类型（TypeScript 4.4+）
    defineSlots<{
      [key: `cell-${string}`](props: { row: any; column: any }): any
    }>()
    ```

> 💡 **提示：** `defineSlots` 的核心价值在于类型安全。如果你的项目没有使用 TypeScript，或者不需要插槽的类型提示，可以直接使用 `useSlots()` 或模板中的 `$slots`，不必强制使用 `defineSlots`。

### 七、相关 API 对比

| API | 版本要求 | 类型支持 | 用途 | 是否需要导入 |
|-----|---------|---------|------|------------|
| `defineSlots()` | Vue 3.3+ | 完整类型声明 + 返回 slots | 声明插槽类型 + 获取 slots 对象 | 否（编译器宏） |
| `useSlots()` | Vue 3.0+ | 无类型声明 | 获取 slots 对象 | 是（从 `vue` 导入） |
| `$slots` | Vue 2/3 | 无类型声明 | 在模板中直接访问 slots | 否（模板内置） |
| `slots`（setup 参数） | Vue 3.0+ | 无类型声明 | setup() 函数中获取 slots | 否（setup 参数） |

**选择建议：**

- **Vue 3.3+ 且使用 TypeScript**：优先使用 `defineSlots()`，获得最佳类型提示
- **Vue 3.0~3.2 或不用 TypeScript**：使用 `useSlots()` 或模板中的 `$slots`
- **选项式 API**：使用 `this.$slots`

### 八、总结

`defineSlots` 是 Vue 3.3+ 为 `<script setup>` + TypeScript 场景量身定制的插槽类型声明工具。它的核心价值在于：

1. **类型安全**：让插槽的名称和 props 获得完整的 TypeScript 类型提示，减少运行时错误
2. **开发体验**：IDE 能在父组件使用插槽时提供精准的自动补全和类型检查
3. **文档即代码**：插槽的类型声明本身就是最好的组件文档，让使用者一目了然

它返回的 slots 对象同时也具备运行时能力，可以用来条件判断插槽是否存在、动态渲染插槽等。在日常开发中，当你构建可复用的组件库或需要精确控制插槽行为时，`defineSlots` 是不可或缺的工具。
