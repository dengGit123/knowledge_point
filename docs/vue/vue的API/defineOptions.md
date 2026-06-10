### defineOptions

> 📖 [官方文档 - defineOptions](https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions)

### 一、概述

`defineOptions` 是 Vue 3.3 新增的一个**编译器宏**，专门用于在 `<script setup>` 语法中声明组件选项。在没有这个宏之前，如果开发者想在 `<script setup>` 中设置 `name`、`inheritAttrs` 等选项，就必须额外添加一个普通的 `<script>` 块，导致同一个组件中出现两个 `<script>` 标签，代码不够简洁。`defineOptions` 的出现彻底解决了这个问题，让开发者可以在 `<script setup>` 内部直接声明所有组件选项，保持代码的统一和简洁。

### 二、核心原理

`defineOptions` 是一个**编译器宏（Compiler Macro）**，这意味着它只在编译阶段存在，不会产生任何运行时代码。当 Vue 的 SFC 编译器解析到 `defineOptions()` 调用时，会将其中的选项提取出来，合并到最终生成的组件对象中。你可以把它理解为一种"语法糖"——在开发时你写的是 `defineOptions({ ... })`，编译后它会变成组件定义中的普通选项字段。

简单类比：就像在填写一份表格时，有些信息需要写在"附页"上（原来的双 `<script>` 方案），而 `defineOptions` 相当于在主表上增加了一栏，让你可以把所有信息都写在同一个地方。

**编译前后对比：**

```vue
<!-- 编译前：你写的代码 -->
<script setup lang="ts">
defineOptions({
  name: 'MyButton',
  inheritAttrs: false
})
</script>

<!-- 编译后（简化示意）：Vue 编译器生成的代码 -->
<script lang="ts">
export default {
  name: 'MyButton',
  inheritAttrs: false,
  setup() {
    // ...组合式 API 逻辑
  }
}
</script>
```

### 三、详细用法

#### 1. 基本用法

**设置组件名称：**

```vue
<script setup lang="ts">
// ✅ 设置组件名称，方便 DevTools 调试和 keep-alive 匹配
defineOptions({
  name: 'UserProfile'
})
</script>
```

**禁用属性继承：**

```vue
<script setup lang="ts">
// ✅ 禁用自动继承父组件传递的非 prop 属性（class、style 等）
defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <!-- 手动控制 $attrs 绑定到目标元素 -->
  <input v-bind="$attrs" />
</template>
```

**同时设置多个选项：**

```vue
<script setup lang="ts">
// ✅ 在一次调用中声明多个组件选项
defineOptions({
  name: 'SearchInput',
  inheritAttrs: false
})

const modelValue = defineModel<string>()
</script>

<template>
  <div class="search-input-wrapper">
    <input v-bind="$attrs" v-model="modelValue" />
  </div>
</template>
```

#### 2. 进阶用法

**配合自定义指令：**

```vue
<script setup lang="ts">
import { ref } from 'vue'

// ✅ 在 defineOptions 中注册局部自定义指令
defineOptions({
  name: 'EditableArea',
  directives: {
    focus: {
      mounted(el: HTMLElement) {
        el.focus()
      }
    }
  }
})

const content = ref('')
</script>

<template>
  <div v-focus contenteditable>{{ content }}</div>
</template>
```

**配合插件自定义选项：**

```vue
<script setup lang="ts">
// ✅ 声明插件所需的自定义选项
// 例如：路由元信息插件、i18n 插件等可能需要组件级别的配置
defineOptions({
  name: 'AdminPanel',
  inheritAttrs: false,
  // 某些插件可能会读取组件上的自定义选项
  customConfig: {
    permission: 'admin',
    keepAlive: true
  }
})
</script>
```

**配合递归组件：**

```vue
<script setup lang="ts">
import type { TreeNode } from './types'

// ✅ 递归组件必须通过 name 引用自身
defineOptions({
  name: 'TreeItem'
})

interface Props {
  node: TreeNode
}

const props = defineProps<Props>()
</script>

<template>
  <div class="tree-item">
    <span>{{ node.label }}</span>
    <template v-if="node.children?.length">
      <!-- 通过组件名称递归引用自身 -->
      <TreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </template>
  </div>
</template>
```

**配合 keep-alive 的 include/exclude：**

```vue
<script setup lang="ts">
import { ref } from 'vue'

// ✅ keep-alive 的 include/exclude 匹配的是组件名称
defineOptions({
  name: 'UserList'
})

const users = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
])
</script>

<!-- 在父组件中使用 -->
<!--
<KeepAlive include="UserList">
  <UserList />
</KeepAlive>
-->
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 否 | 组件名称。用于 DevTools 显示、递归组件自引用、`keep-alive` 缓存匹配 |
| `inheritAttrs` | `boolean` | 否 | 是否自动继承父组件的非 prop 属性（默认 `true`）。设为 `false` 后需手动通过 `$attrs` 绑定 |
| `components` | `Record<string, Component>` | 否 | 局部注册的子组件（在 `<script setup>` 中导入的组件会自动注册，通常不需要此选项） |
| `directives` | `Record<string, Directive>` | 否 | 局部注册的自定义指令 |
| `emits` | `(string \| symbol)[] \| Record<string, Function>` | 否 | 声明组件可触发的事件（推荐使用 `defineEmits` 代替） |
| `props` | `string[] \| Record<string, PropOptions>` | 否 | 声明组件的 props（推荐使用 `defineProps` 代替） |
| `customOptions` | `any` | 否 | 任何自定义选项，供第三方插件或库使用 |

> 💡 **提示：** `defineOptions` 没有返回值。它是一个编译器宏，在编译时处理，不会在运行时执行。

### 四、实现效果

**示例 1：DevTools 中显示组件名称**

```vue
<!-- UserCard.vue -->
<script setup lang="ts">
// 没有 defineOptions 时，DevTools 中显示的是文件名 "UserCard"
// 添加 defineOptions 后，DevTools 中显示 "UserCardPanel"
defineOptions({
  name: 'UserCardPanel'
})

interface Props {
  username: string
  avatar: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="user-card">
    <img :src="avatar" :alt="username" />
    <span>{{ username }}</span>
  </div>
</template>
```

运行后在 Vue DevTools 中，组件树里将显示 `UserCardPanel` 而非默认的文件名，便于快速定位和调试。

**示例 2：属性透传控制**

```vue
<!-- BaseInput.vue -->
<script setup lang="ts">
// 禁用自动继承，避免 class、placeholder 等属性被添加到根元素
defineOptions({
  name: 'BaseInput',
  inheritAttrs: false
})

interface Props {
  label?: string
  modelValue?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <!-- class、placeholder 等属性只会绑定到 input 上，不会出现在 div 上 -->
  <div class="input-wrapper">
    <label v-if="label">{{ label }}</label>
    <input
      v-bind="$attrs"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
```

```vue
<!-- 父组件使用 -->
<script setup lang="ts">
import BaseInput from './BaseInput.vue'
import { ref } from 'vue'

const email = ref('')
</script>

<template>
  <!-- placeholder 和 class 会被透传到 BaseInput 内部的 <input> 上 -->
  <BaseInput
    v-model="email"
    label="邮箱"
    placeholder="请输入邮箱地址"
    class="custom-input"
  />
</template>
```

最终渲染结果：

```html
<!-- class 和 placeholder 只出现在 input 上，div 上没有 -->
<div class="input-wrapper">
  <label>邮箱</label>
  <input placeholder="请输入邮箱地址" class="custom-input" value="">
</div>
```

### 五、使用场景

#### 1. DevTools 调试 - 设置有意义的组件名称

```vue
<script setup lang="ts">
// ✅ 在 DevTools 组件树中显示清晰的组件名
defineOptions({
  name: 'ShoppingCartItem'
})

interface Props {
  productId: string
  quantity: number
}

const props = defineProps<Props>()
</script>
```

#### 2. 封装 UI 基础组件 - 禁用属性继承

```vue
<!-- BaseButton.vue -->
<script setup lang="ts">
// ✅ 包装类组件：将属性透传到内部原生元素
defineOptions({
  name: 'BaseButton',
  inheritAttrs: false
})

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false
})
</script>

<template>
  <button
    v-bind="$attrs"
    class="base-button"
    :class="[`base-button--${variant}`]"
    :disabled="loading"
  >
    <span v-if="loading" class="spinner" />
    <slot />
  </button>
</template>
```

#### 3. 递归组件 - 自引用

```vue
<!-- CommentThread.vue -->
<script setup lang="ts">
// ✅ 递归组件必须通过 name 才能在模板中引用自身
defineOptions({
  name: 'CommentThread'
})

interface Comment {
  id: number
  content: string
  children?: Comment[]
}

const props = defineProps<{
  comments: Comment[]
  depth?: number
}>()
</script>

<template>
  <div class="comment-thread" :style="{ paddingLeft: `${(depth || 0) * 20}px` }">
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <p>{{ comment.content }}</p>
      <CommentThread
        v-if="comment.children?.length"
        :comments="comment.children"
        :depth="(depth || 0) + 1"
      />
    </div>
  </div>
</template>
```

#### 4. 配合 keep-alive 缓存

```vue
<!-- TabPanel.vue -->
<script setup lang="ts">
// ✅ keep-alive 的 include/exclude 需要组件名称来匹配
defineOptions({
  name: 'TabPanel'
})

interface Props {
  activeTab: string
}

const props = defineProps<Props>()
</script>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import TabPanel from './TabPanel.vue'

const currentTab = ref('home')
// keep-alive 的 include 会匹配组件的 name 选项
const cachedTabs = ['TabPanel', 'UserList']
</script>

<template>
  <KeepAlive :include="cachedTabs">
    <TabPanel :active-tab="currentTab" />
  </KeepAlive>
</template>
```

#### 5. 封装第三方组件 - 属性转发

```vue
<!-- CustomDatePicker.vue -->
<script setup lang="ts">
// ✅ 将属性转发给第三方日期选择器组件
defineOptions({
  name: 'CustomDatePicker',
  inheritAttrs: false
})

const modelValue = defineModel<string>()

// 对第三方组件的 props 进行二次封装
interface Props {
  format?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD'
})
</script>

<template>
  <div class="date-picker-wrapper">
    <!-- $attrs 中的 class、style、事件监听器等全部转发给内部组件 -->
    <ThirdPartyDatePicker
      v-bind="$attrs"
      :value="modelValue"
      :format="format"
      :disabled="disabled"
      @update:value="modelValue = $event"
    />
  </div>
</template>
```

#### 6. 注册局部自定义指令

```vue
<script setup lang="ts">
import { ref } from 'vue'

// ✅ 在组件级别注册仅当前组件可用的自定义指令
defineOptions({
  name: 'AutoResizeTextarea',
  directives: {
    autoResize: {
      mounted(el: HTMLTextAreaElement) {
        const resize = () => {
          el.style.height = 'auto'
          el.style.height = el.scrollHeight + 'px'
        }
        el.addEventListener('input', resize)
        resize()
      }
    }
  }
})

const content = ref('')
</script>

<template>
  <textarea v-auto-resize v-model="content" placeholder="自动调整高度..." />
</template>
```

#### 7. 多根节点组件控制属性继承

```vue
<script setup lang="ts">
// ✅ 多根节点组件必须手动控制属性绑定
defineOptions({
  name: 'FormRow',
  inheritAttrs: false
})

interface Props {
  label: string
  required?: boolean
  error?: string
}

const props = defineProps<Props>()
</script>

<template>
  <!-- 多个根节点时，Vue 不知道该把属性绑到哪个元素上 -->
  <!-- 需要手动使用 $attrs 指定 -->
  <label :class="{ required }">{{ label }}</label>
  <div class="form-row-content" v-bind="$attrs">
    <slot />
  </div>
  <span v-if="error" class="error-msg">{{ error }}</span>
</template>
```

#### 8. 配合第三方插件的自定义选项

```vue
<script setup lang="ts">
// ✅ 某些 Vue 插件会读取组件上的自定义选项
// 例如：权限控制插件、页面过渡动画插件等
defineOptions({
  name: 'AdminDashboard',
  inheritAttrs: false,
  // 路由过渡动画名称（配合 vue-router 过渡插件使用）
  transition: 'fade-slide',
  // 页面标题（配合文档标题管理插件）
  pageTitle: '管理后台',
  // 权限标识（配合权限管理插件）
  requiredAuth: 'admin:dashboard'
})
</script>
```

#### 9. 动态组件配合 name 匹配

```vue
<!-- StepOne.vue -->
<script setup lang="ts">
defineOptions({ name: 'StepOne' })
</script>

<!-- StepTwo.vue -->
<script setup lang="ts">
defineOptions({ name: 'StepTwo' })
</script>

<!-- StepThree.vue -->
<script setup lang="ts">
defineOptions({ name: 'StepThree' })
</script>

<!-- WizardContainer.vue - 父组件 -->
<script setup lang="ts">
import { ref, type Component } from 'vue'
import { markRaw } from 'vue'
import StepOne from './StepOne.vue'
import StepTwo from './StepTwo.vue'
import StepThree from './StepThree.vue'

// ✅ 通过组件名称映射来管理步骤切换
const stepMap: Record<string, Component> = {
  StepOne: markRaw(StepOne),
  StepTwo: markRaw(StepTwo),
  StepThree: markRaw(StepThree)
}

const currentStepName = ref<string>('StepOne')

const nextStep = () => {
  const steps = ['StepOne', 'StepTwo', 'StepThree']
  const currentIndex = steps.indexOf(currentStepName.value)
  if (currentIndex < steps.length - 1) {
    currentStepName.value = steps[currentIndex + 1]
  }
}
</script>

<template>
  <div class="wizard">
    <KeepAlive>
      <component :is="stepMap[currentStepName]" @next="nextStep" />
    </KeepAlive>
  </div>
</template>
```

#### 10. 代替双 script 块的旧写法

```vue
<!-- ❌ 旧写法：需要两个 script 块 -->
<script lang="ts">
export default {
  name: 'DataTable',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
const columns = ref([])
const data = ref([])
</script>

<!-- ✅ 新写法：使用 defineOptions 合并为一个 script 块 -->
<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'DataTable',
  inheritAttrs: false
})

const columns = ref([])
const data = ref([])
</script>
```

### 六、注意事项

1. **版本要求**：`defineOptions` 仅在 **Vue 3.3+** 中可用。如果你使用的是 Vue 3.2 或更早版本，需要通过社区库 `unplugin-vue-define-options` 来实现相同功能。

```vue
<!-- ❌ Vue 3.2 及以下版本无法使用 -->
<script setup lang="ts">
defineOptions({ name: 'MyComponent' }) // 报错：defineOptions is not defined
</script>
```

2. **不需要导入**：`defineOptions` 是编译器宏，不需要（也不应该）从 `vue` 中导入。编译器会自动识别并处理它。

```vue
<script setup lang="ts">
// ❌ 不要导入 defineOptions
import { defineOptions } from 'vue'

// ✅ 直接使用，无需导入
defineOptions({ name: 'MyComponent' })
</script>
```

3. **只能在 `<script setup>` 中使用**：`defineOptions` 只能用在 `<script setup>` 块内，不能在普通的 `<script>` 块或非 SFC 文件中使用。

```ts
// ❌ 不能在普通 .ts 文件中使用
// utils.ts
defineOptions({ name: 'MyComponent' }) // 报错
```

4. **不能定义 props 和 emits**：虽然 `defineOptions` 的参数类型上允许传入 `props` 和 `emits`，但应该分别使用 `defineProps` 和 `defineEmits` 宏来声明，因为它们有更好的类型推断支持。

```vue
<script setup lang="ts">
// ❌ 不推荐：通过 defineOptions 定义 props
defineOptions({
  props: { count: Number }
})

// ✅ 推荐：使用 defineProps
const props = defineProps<{ count: number }>()
</script>
```

5. **没有返回值**：`defineOptions` 是一个编译器宏，没有返回值，不能将其结果赋值给变量。

```vue
<script setup lang="ts">
// ❌ 不能赋值给变量
const options = defineOptions({ name: 'MyComponent' })

// ✅ 直接调用
defineOptions({ name: 'MyComponent' })
</script>
```

6. **只能调用一次**：每个 `<script setup>` 块中只能调用一次 `defineOptions`。如果多次调用，编译器会报错。

```vue
<script setup lang="ts">
// ❌ 不能调用两次
defineOptions({ name: 'MyComponent' })
defineOptions({ inheritAttrs: false }) // 编译错误
</script>
```

7. **避免与普通 `<script>` 块冲突**：如果同一个组件中已经存在一个普通的 `<script>` 块来声明 `name` 或 `inheritAttrs`，不要再使用 `defineOptions` 重复声明，否则会导致编译错误或行为异常。

```vue
<!-- ❌ 不要同时使用两种方式 -->
<script lang="ts">
export default { name: 'MyComponent' }
</script>

<script setup lang="ts">
defineOptions({ name: 'MyComponent' }) // 冲突
</script>
```

8. **`inheritAttrs: false` 与 `v-bind="$attrs"` 配合使用**：设置了 `inheritAttrs: false` 后，一定要在模板中手动使用 `v-bind="$attrs"` 将属性绑定到目标元素上，否则属性会丢失。

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <!-- ❌ 属性丢失：没有手动绑定 $attrs -->
  <div class="wrapper">
    <input />
  </div>

  <!-- ✅ 正确：手动绑定 $attrs 到目标元素 -->
  <div class="wrapper">
    <input v-bind="$attrs" />
  </div>
</template>
```

9. **组件 name 与 keep-alive 匹配**：`<KeepAlive>` 的 `include` 和 `exclude` 属性匹配的是组件的 `name` 选项，而不是文件名。如果不设置 `name`，`keep-alive` 的匹配可能失效。

10. **自定义选项不会触发响应式**：通过 `defineOptions` 设置的自定义选项是静态的，它们在编译时确定，不会触发 Vue 的响应式系统。不要期望在运行时动态修改这些选项。

### 七、相关 API 对比

| 特性 | `defineOptions` | 双 `<script>` 块 | `defineComponent` |
|------|-----------------|-------------------|-------------------|
| **使用位置** | `<script setup>` 内 | 需要两个 `<script>` 标签 | 普通 `<script>` 中 |
| **Vue 版本** | 3.3+ | 2.x / 3.x 均可 | 2.x / 3.x 均可 |
| **代码简洁度** | 高，一个 `<script>` 块搞定 | 低，需要两个 `<script>` 块 | 中等 |
| **类型推断** | 优秀 | 良好 | 优秀 |
| **适用场景** | 设置 `name`、`inheritAttrs` 等选项 | 需要在 `<script setup>` 中设置选项（Vue 3.2 及以下） | 选项式 API 或非 SFC 组件 |
| **是否编译器宏** | 是 | 否 | 否 |

```vue
<!-- 方式一：defineOptions（推荐，Vue 3.3+） -->
<script setup lang="ts">
defineOptions({ name: 'MyComponent', inheritAttrs: false })
</script>

<!-- 方式二：双 script 块（Vue 3.2 及以下兼容方案） -->
<script lang="ts">
export default { name: 'MyComponent', inheritAttrs: false }
</script>

<script setup lang="ts">
// 组件逻辑
</script>

<!-- 方式三：defineComponent（选项式 API 写法） -->
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyComponent',
  inheritAttrs: false,
  setup() {
    // 组件逻辑
  }
})
</script>
```

### 八、总结

`defineOptions` 是 Vue 3.3 为 `<script setup>` 语法补齐的最后一个关键拼图。它的核心价值在于：

- **消除双 `<script>` 块**：不再需要为了设置 `name` 或 `inheritAttrs` 而添加额外的 `<script>` 标签
- **统一代码风格**：所有组件定义都集中在 `<script setup>` 中，代码更整洁
- **零运行时开销**：作为编译器宏，编译后不产生任何额外代码
- **完善的 TypeScript 支持**：提供完整的参数类型提示

在日常开发中，`defineOptions` 最常用的场景是设置 `name`（便于调试和 `keep-alive` 匹配）和 `inheritAttrs: false`（封装基础组件时控制属性继承）。掌握这个宏，可以让你的 `<script setup>` 代码更加规范和完整。
