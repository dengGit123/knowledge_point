# useId

用于生成每个应用实例唯一的 ID，主要用于无障碍访问和表单元素关联。

## 语法

```javascript
import { useId } from 'vue'

const id = useId()
```

## 参数

无

## 返回值

返回一个以应用作用域为前缀的唯一 ID 字符串

## 基础用法

```vue
<template>
  <div>
    <label :for="inputId">用户名：</label>
    <input :id="inputId" type="text" />
  </div>
</template>

<script setup>
import { useId } from 'vue'

const inputId = useId()
</script>
```

## 表单标签关联

```vue
<template>
  <div class="form-group">
    <label :for="nameId">姓名</label>
    <input :id="nameId" v-model="name" type="text" />

    <label :for="emailId">邮箱</label>
    <input :id="emailId" v-model="email" type="email" />
  </div>
</template>

<script setup>
import { useId, ref } from 'vue'

const name = ref('')
const email = ref('')

const nameId = useId()
const emailId = useId()
</script>
```

## 无障碍属性

```vue
<template>
  <div>
    <label :for="selectId">选择选项</label>
    <select :id="selectId" v-model="selected">
      <option value="1">选项 1</option>
      <option value="2">选项 2</option>
    </select>

    <span :id="helpId">请选择一个选项</span>
  </div>
</template>

<script setup>
import { useId, ref } from 'vue'

const selected = ref('')
const selectId = useId()
const helpId = useId()
</script>
```

## 复选框组

```vue
<template>
  <div class="checkbox-group">
    <legend>兴趣爱好</legend>
    <div v-for="item in items" :key="item.value">
      <input
        :id="`${checkboxId}-${item.value}`"
        type="checkbox"
        :value="item.value"
        v-model="checkedItems"
      />
      <label :for="`${checkboxId}-${item.value}`">
        {{ item.label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { useId, ref } from 'vue'

const checkboxId = useId()
const checkedItems = ref([])

const items = [
  { value: 'reading', label: '阅读' },
  { value: 'music', label: '音乐' },
  { value: 'sports', label: '运动' }
]
</script>
```

## 单选按钮组

```vue
<template>
  <div class="radio-group">
    <legend>性别</legend>
    <div v-for="option in options" :key="option.value">
      <input
        :id="`${radioId}-${option.value}`"
        type="radio"
        :value="option.value"
        v-model="selected"
        :name="radioId"
      />
      <label :for="`${radioId}-${option.value}`">
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { useId, ref } from 'vue'

const radioId = useId()
const selected = ref('male')

const options = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' }
]
</script>
```

## 错误消息关联

```vue
<template>
  <div class="form-field">
    <label :for="emailId">邮箱地址</label>
    <input
      :id="emailId"
      v-model="email"
      type="email"
      :aria-describedby="errorId"
      :aria-invalid="!!error"
    />
    <span v-if="error" :id="errorId" class="error-message">
      {{ error }}
    </span>
  </div>
</template>

<script setup>
import { useId, ref, computed } from 'vue'

const email = ref('')
const emailId = useId()
const errorId = useId()

const error = computed(() => {
  if (!email.value) return '邮箱不能为空'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return '邮箱格式不正确'
  }
  return ''
})
</script>
```

## ARIA 属性

```vue
<template>
  <div class="accordion-item">
    <button
      :id="headerId"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      @click="toggle"
    >
      {{ title }}
    </button>
    <div
      v-if="isOpen"
      :id="panelId"
      :aria-labelledby="headerId"
      role="region"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { useId, ref } from 'vue'

const props = defineProps({
  title: String
})

const isOpen = ref(false)
const headerId = useId()
const panelId = useId()

function toggle() {
  isOpen.value = !isOpen.value
}
</script>
```

## 模态框

```vue
<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click="close">
      <div
        class="modal"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
        @click.stop
      >
        <h2 :id="titleId">{{ title }}</h2>
        <p :id="descId">{{ description }}</p>
        <button @click="close">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useId } from 'vue'

const props = defineProps({
  open: Boolean,
  title: String,
  description: String
})

const emit = defineEmits(['close'])

const titleId = useId()
const descId = useId()

function close() {
  emit('close')
}
</script>
```

## 描述列表关联

```vue
<template>
  <div class="field">
    <label :for="inputId">密码</label>
    <input
      :id="inputId"
      v-model="password"
      type="password"
      :aria-describedby="hintId"
    />
    <p :id="hintId" class="hint">
      密码至少包含8个字符
    </p>
  </div>
</template>

<script setup>
import { useId, ref } from 'vue'

const password = ref('')
const inputId = useId()
const hintId = useId()
</script>
```

## 自定义组件中的使用

```vue
<template>
  <div class="custom-input">
    <label :for="inputId" v-if="label">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
    />
    <small v-if="hint" :id="hintId">
      {{ hint }}
    </small>
  </div>
</template>

<script setup>
import { useId } from 'vue'

const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  modelValue: String,
  placeholder: String,
  hint: String
})

const emit = defineEmits(['update:modelValue'])

const inputId = useId()
const hintId = useId()
</script>
```

## 动态表单字段

```vue
<template>
  <div v-for="(field, index) in fields" :key="index" class="form-field">
    <label :for="getFieldId(index)">{{ field.label }}</label>
    <input
      :id="getFieldId(index)"
      v-model="field.value"
      :type="field.type"
    />
  </div>
</template>

<script setup>
import { useId } from 'vue'

import { ref } from 'vue'

const fields = ref([
  { label: '姓名', type: 'text', value: '' },
  { label: '年龄', type: 'number', value: '' },
  { label: '邮箱', type: 'email', value: '' }
])

const baseId = useId()

function getFieldId(index) {
  return `${baseId}-${index}`
}
</script>
```

## 选项卡组件

```vue
<template>
  <div class="tabs">
    <div role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :id="getTabId(index)"
        role="tab"
        :aria-selected="activeIndex === index"
        :aria-controls="getPanelId(index)"
        @click="activeIndex = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="(tab, index) in tabs"
      v-show="activeIndex === index"
      :key="`panel-${index}`"
      :id="getPanelId(index)"
      role="tabpanel"
      :aria-labelledby="getTabId(index)"
    >
      <slot :name="`tab-${index}`">
        {{ tab.content }}
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tabs: Array
})

const activeIndex = ref(0)
const baseId = ref(Math.random().toString(36).substr(2, 9))

function getTabId(index) {
  return `${baseId.value}-tab-${index}`
}

function getPanelId(index) {
  return `${baseId.value}-panel-${index}`
}
</script>
```

## 注意事项

1. **唯一性**：每个 useId() 调用都会生成不同的 ID

2. **稳定性**：在同一组件实例中，ID 保持不变

3. **SSR 兼容**：在服务端渲染中也能正确工作，确保客户端和服务端 ID 一致

4. **作用域**：ID 在应用级别是唯一的

5. **可读性**：生成的 ID 可能类似 `:v0-0` 的格式，不需要人类可读

6. **无障碍**：主要用于 label、input 的关联和 ARIA 属性
