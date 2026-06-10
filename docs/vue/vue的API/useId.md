# useId

> 📖 [官方文档 - useId](https://cn.vuejs.org/api/composition-api-helpers#useid)

### 一、概述

`useId()` 是 Vue 3.5 新增的组合式 API，用于生成**全局唯一且稳定**的 ID 字符串。它主要解决以下问题：

- **表单关联**：为 `<label>` 和 `<input>` 等表单元素生成唯一的 `id`，实现标签与输入控件的正确关联
- **无障碍访问（a11y）**：为 ARIA 属性（如 `aria-labelledby`、`aria-controls`、`aria-describedby`）提供唯一标识符
- **SSR 水合一致性**：在服务端渲染（SSR）场景下，保证服务端和客户端生成相同的 ID，避免水合（hydration）不匹配错误
- **多应用实例隔离**：当页面中存在多个 Vue 应用实例时，通过 `app.config.idPrefix` 配置前缀，避免 ID 冲突

> 💡 **提示：** 在 `useId()` 出现之前，开发者通常使用 `Math.random()`、`Date.now()` 或自增计数器来生成 ID，但这些方式在 SSR 场景下无法保证服务端和客户端的 ID 一致性，容易导致水合失败。

### 二、核心原理

`useId()` 的底层实现基于以下机制：

1. **应用级计数器**：每个 Vue 应用实例内部维护一个自增计数器，每次调用 `useId()` 时计数器递增，确保同一个应用内生成的 ID 唯一
2. **确定性生成**：ID 的生成不依赖随机数，而是基于调用顺序递增，因此是可预测且确定性的
3. **SSR 状态同步**：在 SSR 过程中，服务端渲染时生成的 ID 序列会被序列化传递到客户端，客户端在水合时使用相同的 ID 序列，从而保证一致性
4. **默认前缀**：生成的 ID 默认以 `v` 为前缀，格式类似 `v-0`、`v-1`、`v-2`，可通过 `app.config.idPrefix` 自定义

```
// ID 生成示意
应用实例 A:  v-0, v-1, v-2, ...
应用实例 B:  app-b-0, app-b-1, app-b-2, ...（配置了 idPrefix）
```

### 三、详细用法

#### 1. 基本用法

```vue
<template>
  <div>
    <label :for="inputId">用户名：</label>
    <input :id="inputId" type="text" v-model="username" />
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

const username = ref('')
const inputId = useId() // 生成类似 "v-0" 的唯一 ID
</script>
```

#### 2. 进阶用法

**（1）配合 `app.config.idPrefix` 自定义前缀**

当页面中存在多个 Vue 应用实例时，可以为每个应用配置不同的 ID 前缀以避免冲突：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 配置 ID 前缀，生成的 ID 格式为 "my-app-0"、"my-app-1" 等
app.config.idPrefix = 'my-app'

app.mount('#app')
```

**（2）在组合式函数（Composable）中使用**

```ts
// composables/useFormField.ts
import { useId, type Ref } from 'vue'

interface UseFormFieldOptions {
  label?: string
  hint?: string
}

interface UseFormFieldReturn {
  inputId: string
  hintId: string
  errorId: string
}

export function useFormField(_options?: UseFormFieldOptions): UseFormFieldReturn {
  const inputId = useId()
  const hintId = useId()
  const errorId = useId()

  return {
    inputId,
    hintId,
    errorId
  }
}
```

在组件中使用：

```vue
<template>
  <div class="form-field">
    <label :for="ids.inputId">{{ label }}</label>
    <input
      :id="ids.inputId"
      v-model="value"
      :aria-describedby="error ? ids.errorId : hint ? ids.hintId : undefined"
      :aria-invalid="!!error"
    />
    <span v-if="hint && !error" :id="ids.hintId" class="hint">
      {{ hint }}
    </span>
    <span v-if="error" :id="ids.errorId" class="error">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormField } from '@/composables/useFormField'

const props = defineProps<{
  label: string
  hint?: string
}>()

const value = ref('')
const ids = useFormField({ label: props.label, hint: props.hint })

const error = computed(() => {
  if (!value.value) return ''
  if (value.value.length < 6) return '至少输入 6 个字符'
  return ''
})
</script>
```

**（3）基于 `useId` 生成批量 ID**

```vue
<template>
  <div v-for="(item, index) in items" :key="item.id">
    <input
      :id="getItemId(index)"
      type="checkbox"
      :value="item.value"
      v-model="selected"
    />
    <label :for="getItemId(index)">{{ item.label }}</label>
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

interface Item {
  id: number
  value: string
  label: string
}

const items: Item[] = [
  { id: 1, value: 'reading', label: '阅读' },
  { id: 2, value: 'music', label: '音乐' },
  { id: 3, value: 'sports', label: '运动' }
]

const selected = ref<string[]>([])
const baseId = useId() // 例如 "v-0"

// 基于 baseId 拼接索引，生成 "v-0-0"、"v-0-1"、"v-0-2"
function getItemId(index: number): string {
  return `${baseId}-${index}`
}
</script>
```

**（4）在 SSR / Nuxt 项目中使用**

```vue
<template>
  <div>
    <label :for="emailId">邮箱</label>
    <input :id="emailId" v-model="email" type="email" />
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

// 在 SSR 场景下，服务端和客户端生成的 emailId 完全一致
// 例如服务端渲染生成 "v-0"，客户端水合时也是 "v-0"
// 不会出现水合不匹配的错误
const emailId = useId()
const email = ref('')
</script>
```

#### 3. API 参数说明

| 属性 | 说明 |
|------|------|
| **函数签名** | `function useId(): string` |
| **参数** | 无 |
| **返回值** | 返回一个以应用作用域为前缀的唯一 ID 字符串，格式默认为 `v-0`、`v-1` 等 |
| **引入方式** | `import { useId } from 'vue'` |
| **最低版本** | Vue 3.5+ |
| **SSR 支持** | 完全支持，服务端和客户端生成的 ID 保持一致 |

**相关配置：**

| 配置项 | 说明 |
|--------|------|
| `app.config.idPrefix` | 配置此应用中通过 `useId()` 生成的所有 ID 的前缀，类型为 `string` |

### 四、实现效果

```vue
<template>
  <div>
    <label :for="nameId">姓名：</label>
    <input :id="nameId" type="text" v-model="name" />

    <label :for="emailId">邮箱：</label>
    <input :id="emailId" type="email" v-model="email" />
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

const name = ref('')
const email = ref('')

const nameId = useId()  // 输出: "v-0"
const emailId = useId() // 输出: "v-1"
</script>
```

渲染后的 HTML 结构：

```html
<div>
  <label for="v-0">姓名：</label>
  <input id="v-0" type="text" />

  <label for="v-1">邮箱：</label>
  <input id="v-1" type="email" />
</div>
```

> 💡 **提示：** 点击 `<label>` 文字时，对应的 `<input>` 会自动获得焦点，这就是 `id` 与 `for` 关联的效果。

### 五、使用场景

#### 1. 表单 label 与 input 关联

这是 `useId()` 最基础的使用场景，通过唯一 ID 将 `<label>` 与 `<input>` 关联起来。

```vue
<template>
  <form class="form">
    <div class="form-item">
      <label :for="usernameId">用户名</label>
      <input :id="usernameId" v-model="form.username" type="text" />
    </div>
    <div class="form-item">
      <label :for="passwordId">密码</label>
      <input :id="passwordId" v-model="form.password" type="password" />
    </div>
    <button type="submit">登录</button>
  </form>
</template>

<script setup lang="ts">
import { useId, reactive } from 'vue'

const usernameId = useId()
const passwordId = useId()

const form = reactive({
  username: '',
  password: ''
})
</script>
```

#### 2. 表单验证错误消息关联

通过 `aria-describedby` 将错误提示信息与输入框关联，屏幕阅读器可以朗读错误信息。

```vue
<template>
  <div class="form-field">
    <label :for="emailId">邮箱地址</label>
    <input
      :id="emailId"
      v-model="email"
      type="email"
      :aria-describedby="errorId"
      :aria-invalid="!!errorMessage"
    />
    <span v-if="errorMessage" :id="errorId" class="error-msg" role="alert">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useId, ref, computed } from 'vue'

const email = ref('')
const emailId = useId()
const errorId = useId()

const errorMessage = computed(() => {
  if (!email.value) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return '请输入有效的邮箱地址'
  }
  return ''
})
</script>
```

#### 3. 折叠面板 / 手风琴组件

使用 ARIA 属性将按钮（标题）与面板（内容）关联，实现无障碍的折叠面板。

```vue
<template>
  <div class="accordion">
    <div v-for="(item, index) in items" :key="index" class="accordion-item">
      <button
        :id="getHeaderId(index)"
        :aria-expanded="activeIndex === index"
        :aria-controls="getPanelId(index)"
        @click="toggle(index)"
      >
        {{ item.title }}
      </button>
      <div
        v-show="activeIndex === index"
        :id="getPanelId(index)"
        :aria-labelledby="getHeaderId(index)"
        role="region"
      >
        <p>{{ item.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

interface AccordionItem {
  title: string
  content: string
}

defineProps<{
  items: AccordionItem[]
}>()

const activeIndex = ref<number>(-1)
const baseId = useId()

function getHeaderId(index: number): string {
  return `${baseId}-header-${index}`
}

function getPanelId(index: number): string {
  return `${baseId}-panel-${index}`
}

function toggle(index: number): void {
  activeIndex.value = activeIndex.value === index ? -1 : index
}
</script>
```

#### 4. 模态框 / 对话框组件

为模态框提供完整的 ARIA 属性支持，确保屏幕阅读器能正确识别对话框标题和描述。

```vue
<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleClose">
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
        @click.stop
      >
        <header>
          <h2 :id="titleId">{{ title }}</h2>
          <button @click="handleClose" :aria-label="'关闭'">&times;</button>
        </header>
        <div :id="descId">
          <slot />
        </div>
        <footer>
          <button @click="handleConfirm">确认</button>
          <button @click="handleClose">取消</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  visible: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const titleId = useId()
const descId = useId()

function handleClose(): void {
  emit('close')
}

function handleConfirm(): void {
  emit('confirm')
}
</script>
```

#### 5. 选项卡组件

选项卡组件需要大量的 ARIA 属性来正确表达标签页与面板之间的关联关系。

```vue
<template>
  <div class="tabs">
    <div role="tablist" class="tab-list">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :id="getTabId(index)"
        role="tab"
        :aria-selected="activeIndex === index"
        :aria-controls="getPanelId(index)"
        :tabindex="activeIndex === index ? 0 : -1"
        @click="activeIndex = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="(tab, index) in tabs"
      v-show="activeIndex === index"
      :key="index"
      :id="getPanelId(index)"
      role="tabpanel"
      :aria-labelledby="getTabId(index)"
      :tabindex="0"
    >
      <slot :name="tab.slot ?? `tab-${index}`">
        {{ tab.content }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

interface Tab {
  label: string
  content?: string
  slot?: string
}

const props = defineProps<{
  tabs: Tab[]
}>()

const activeIndex = ref(0)
const baseId = useId()

function getTabId(index: number): string {
  return `${baseId}-tab-${index}`
}

function getPanelId(index: number): string {
  return `${baseId}-panel-${index}`
}
</script>
```

#### 6. 复选框 / 单选按钮组

为表单控件组中的每一项生成唯一 ID，确保 `<label>` 能正确关联。

```vue
<template>
  <fieldset>
    <legend>兴趣爱好</legend>
    <div v-for="(item, index) in options" :key="item.value" class="checkbox-item">
      <input
        :id="getItemId(index)"
        type="checkbox"
        :value="item.value"
        v-model="selected"
      />
      <label :for="getItemId(index)">{{ item.label }}</label>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

interface Option {
  value: string
  label: string
}

const options: Option[] = [
  { value: 'reading', label: '阅读' },
  { value: 'music', label: '音乐' },
  { value: 'sports', label: '运动' },
  { value: 'travel', label: '旅行' }
]

const selected = ref<string[]>([])
const baseId = useId()

function getItemId(index: number): string {
  return `${baseId}-item-${index}`
}
</script>
```

#### 7. 通用表单输入组件封装

封装一个通用的表单输入组件，内部使用 `useId()` 自动管理 ID。

```vue
<!-- components/FormInput.vue -->
<template>
  <div class="form-input" :class="{ 'has-error': !!errorMessage }">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-describedby="describedBy"
      :aria-invalid="!!errorMessage"
      :required="required"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="hint && !errorMessage" :id="hintId" class="form-hint">
      {{ hint }}
    </span>
    <span v-if="errorMessage" :id="errorId" class="form-error" role="alert">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useId, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  type?: string
  placeholder?: string
  hint?: string
  errorMessage?: string
  required?: boolean
}>(), {
  type: 'text',
  required: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
const hintId = useId()
const errorId = useId()

const describedBy = computed(() => {
  if (props.errorMessage) return errorId
  if (props.hint) return hintId
  return undefined
})
</script>
```

在父组件中使用：

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <FormInput
      v-model="form.name"
      label="姓名"
      hint="请输入真实姓名"
      required
    />
    <FormInput
      v-model="form.email"
      label="邮箱"
      type="email"
      :error-message="emailError"
    />
    <button type="submit">提交</button>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import FormInput from '@/components/FormInput.vue'

const form = reactive({
  name: '',
  email: ''
})

const emailError = computed(() => {
  if (!form.email) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return '邮箱格式不正确'
  }
  return ''
})

function handleSubmit(): void {
  console.log('提交表单', form)
}
</script>
```

#### 8. 下拉选择框关联提示信息

```vue
<template>
  <div class="select-field">
    <label :for="selectId">选择城市</label>
    <select :id="selectId" v-model="selected" :aria-describedby="helpId">
      <option value="">请选择</option>
      <option v-for="city in cities" :key="city.value" :value="city.value">
        {{ city.label }}
      </option>
    </select>
    <span :id="helpId" class="help-text">
      {{ selected ? `已选择: ${selected}` : '请选择您所在的城市' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

interface City {
  value: string
  label: string
}

const cities: City[] = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' }
]

const selected = ref('')
const selectId = useId()
const helpId = useId()
</script>
```

#### 9. Tooltip / 气泡提示组件

使用 `aria-describedby` 将触发元素与气泡提示内容关联。

```vue
<template>
  <div class="tooltip-wrapper">
    <button
      :id="triggerId"
      :aria-describedby="isVisible ? tooltipId : undefined"
      @mouseenter="isVisible = true"
      @mouseleave="isVisible = false"
      @focus="isVisible = true"
      @blur="isVisible = false"
    >
      <slot name="trigger">悬停查看提示</slot>
    </button>
    <div
      v-if="isVisible"
      :id="tooltipId"
      role="tooltip"
      class="tooltip-content"
    >
      <slot>{{ content }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

defineProps<{
  content?: string
}>()

const triggerId = useId()
const tooltipId = useId()
const isVisible = ref(false)
</script>
```

#### 10. SSR 多应用实例场景

在一个页面中挂载多个 Vue 应用实例，通过 `idPrefix` 避免 ID 冲突。

```ts
// main.ts
import { createApp } from 'vue'
import HeaderApp from './HeaderApp.vue'
import FooterApp from './FooterApp.vue'

// 头部应用实例
const headerApp = createApp(HeaderApp)
headerApp.config.idPrefix = 'header'
headerApp.mount('#header-app')
// headerApp 中 useId() 生成: "header-0", "header-1", ...

// 底部应用实例
const footerApp = createApp(FooterApp)
footerApp.config.idPrefix = 'footer'
footerApp.mount('#footer-app')
// footerApp 中 useId() 生成: "footer-0", "footer-1", ...
```

```vue
<!-- HeaderApp.vue -->
<template>
  <header>
    <label :for="searchId">搜索：</label>
    <input :id="searchId" type="search" v-model="keyword" />
    <!-- 渲染结果: id="header-0", for="header-0" -->
  </header>
</template>

<script setup lang="ts">
import { useId, ref } from 'vue'

const searchId = useId()
const keyword = ref('')
</script>
```

### 六、注意事项

1. **仅在 `setup()` 阶段调用**：`useId()` 必须在组件的 `setup()` 函数或 `<script setup>` 中同步调用，不能在异步回调、`setTimeout`、事件处理函数中调用。

```ts
// ✅ 正确：在 setup 中同步调用
const id = useId()

// ❌ 错误：在异步回调中调用
onMounted(async () => {
  const id = useId() // 会抛出警告或产生不一致的 ID
})
```

2. **不要用 `useId()` 作为列表的 `key`**：`useId()` 的设计目的是为 DOM 元素提供无障碍标识，不应作为 `v-for` 列表渲染的 `key` 使用。列表的 `key` 应使用数据本身的唯一标识（如 `item.id`）。

```vue
<!-- ❌ 错误 -->
<div v-for="item in list" :key="useId()">

<!-- ✅ 正确 -->
<div v-for="item in list" :key="item.id">
```

3. **每次调用返回不同值**：在同一个组件中多次调用 `useId()` 会返回不同的 ID，每次调用内部计数器都会递增。

```ts
const id1 = useId() // "v-0"
const id2 = useId() // "v-1"
const id3 = useId() // "v-2"
// id1、id2、id3 各不相同
```

4. **组件实例级别的稳定性**：在同一个组件实例中，`useId()` 返回的 ID 在组件的整个生命周期内保持不变。组件重新渲染时 ID 不会改变。

5. **SSR 水合安全**：`useId()` 是 SSR 安全的，服务端渲染和客户端水合时会生成相同的 ID 序列。不要在 SSR 场景中使用 `Math.random()` 或 `Date.now()` 来替代。

```ts
// ❌ SSR 场景下不要这样做
const id = `input-${Math.random()}`  // 服务端和客户端生成的值不同

// ✅ 使用 useId()
const id = useId()  // 服务端和客户端一致
```

6. **版本要求**：`useId()` 是 Vue 3.5 引入的 API，更低版本不可用。请确保项目 Vue 版本 >= 3.5.0。

7. **ID 不是人类可读的**：生成的 ID 格式为 `v-0`、`v-1` 等，不具有语义信息。如果需要语义化的 ID 用于 CSS 选择器或测试，应自行定义，而非依赖 `useId()`。

8. **多应用实例需配置前缀**：当同一个页面中存在多个 Vue 应用实例时，应通过 `app.config.idPrefix` 为每个实例配置不同的前缀，否则可能产生 ID 冲突。

```ts
// ❌ 多应用实例未配置前缀，可能产生冲突
const app1 = createApp(App1) // useId 生成: v-0, v-1, ...
const app2 = createApp(App2) // useId 也生成: v-0, v-1, ...（冲突！）

// ✅ 配置不同的前缀
const app1 = createApp(App1)
app1.config.idPrefix = 'app1'
const app2 = createApp(App2)
app2.config.idPrefix = 'app2'
```

9. **不要用于 CSS 选择器样式**：`useId()` 生成的 ID 格式包含冒号前缀（如 `:v-0`），在某些 CSS 选择器场景下可能需要转义。它的主要用途是无障碍属性和表单关联，不建议用于样式挂钩。

10. **在 Composable 中优先使用 `useId()`**：编写通用的 Composable 时，如果需要为 DOM 元素生成 ID，应优先使用 `useId()` 而不是让调用者手动传入 ID，这样能确保 SSR 场景下的一致性。

### 七、相关 API 对比

| 特性 | `useId()` | `Math.random()` | 自增计数器 | `Date.now()` |
|------|-----------|------------------|------------|--------------|
| **唯一性** | 应用级唯一 | 概率唯一 | 手动维护 | 可能重复 |
| **SSR 一致性** | 服务端与客户端一致 | 不一致 | 需手动同步 | 不一致 |
| **可预测性** | 确定性 | 随机 | 确定性 | 取决于时间 |
| **使用复杂度** | 直接调用 | 需拼接字符串 | 需维护状态 | 需拼接字符串 |
| **多应用隔离** | 支持（idPrefix） | 不支持 | 手动实现 | 不支持 |
| **Vue 版本** | 3.5+ | 全版本 | 全版本 | 全版本 |

> ⚠️ **注意：** 如果你的项目 Vue 版本低于 3.5，可以使用自定义 Composable 实现类似功能，但无法保证 SSR 的一致性。

### 八、总结

`useId()` 是 Vue 3.5 提供的一个轻量但重要的组合式 API，它专注于解决一个看似简单但实际影响深远的问题 —— **生成唯一且 SSR 稳定的 DOM ID**。

核心价值：
- 为表单元素关联和无障碍访问提供标准化的 ID 生成方案
- 在 SSR 场景下保证服务端与客户端 ID 的一致性，避免水合错误
- 支持多应用实例场景下的 ID 隔离

最佳实践：
- 所有需要 DOM ID 的地方优先使用 `useId()`
- 封装通用组件时在内部调用 `useId()`，而非要求调用者传入 ID
- 多应用实例场景务必配置 `app.config.idPrefix`
