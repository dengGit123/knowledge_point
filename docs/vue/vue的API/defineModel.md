# defineModel

Vue 3.4+ 新增的宏，用于简化组件实现 v-model 的逻辑。它是 `useModel` 的编译器宏版本，语法更简洁。

## 作用

用于在 `<script setup>` 中声明双向绑定的 v-model，让子组件可以方便地读取和更新父组件的数据。

📖 [defineModel](https://cn.vuejs.org/api/sfc-script-setup#definemodel)

## 语法

```javascript
const model = defineModel()
const model = defineModel('count')
```

## 参数

- `name` (可选): 模型名称，默认为 'modelValue'
- `options` (可选): 配置对象

## 返回值

返回一个可写的 ref，与 `useModel` 类似但语法更简洁

## 基础用法

```vue
<!-- 父组件 -->
<template>
  <Child v-model="count" />
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const count = ref(0)
</script>

<!-- 子组件 Child.vue -->
<template>
  <button @click="modelValue++">{{ modelValue }}</button>
</template>

<script setup>
const modelValue = defineModel()
</script>
```

## 等价写法对比

```vue
<!-- Vue 3.4 之前：传统写法 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<!-- Vue 3.4+：defineModel -->
<script setup>
const modelValue = defineModel()
</script>
```

## 自定义模型名称

```vue
<!-- 父组件 -->
<template>
  <User v-model:title="userTitle" />
</template>

<script setup>
import { ref } from 'vue'
import User from './User.vue'

const userTitle = ref('默认标题')
</script>

<!-- 子组件 User.vue -->
<template>
  <input v-model="title" />
</template>

<script setup>
const title = defineModel('title')
</script>
```

## 多个 v-model

```vue
<!-- 父组件 -->
<template>
  <UserForm
    v-model:name="userName"
    v-model:email="userEmail"
    v-model:age="userAge"
  />
</template>

<script setup>
import { ref } from 'vue'
import UserForm from './UserForm.vue'

const userName = ref('')
const userEmail = ref('')
const userAge = ref(18)
</script>

<!-- 子组件 UserForm.vue -->
<template>
  <form>
    <input v-model="name" placeholder="姓名" />
    <input v-model="email" placeholder="邮箱" />
    <input v-model.number="age" type="number" placeholder="年龄" />
  </form>
</template>

<script setup>
const name = defineModel('name')
const email = defineModel('email')
const age = defineModel('age')
</script>
```

## 类型支持

```vue
<script setup lang="ts">
// 指定类型
const count = defineModel<number>()

// 默认值
const message = defineModel<string>({ default: '' })

// 必需
const title = defineModel<string>({ required: true })
</script>
```

## 带默认值

```vue
<script setup>
// 默认值为 0
const count = defineModel({ default: 0 })

// 默认值为空字符串
const message = defineModel({ default: '' })

// 默认值为对象
const user = defineModel({
  default: () => ({ name: '', age: 0 })
})
</script>
```

## 带修饰符

```vue
<!-- 父组件 -->
<template>
  <TextInput v-model.capitalize="text" />
</template>

<script setup>
import { ref } from 'vue'
import TextInput from './TextInput.vue'

const text = ref('hello')
</script>

<!-- 子组件 TextInput.vue -->
<template>
  <input v-model="modelValue" type="text" />
</template>

<script setup>
const [modelValue, modifiers] = defineModel({
  set(v) {
    if (modifiers.capitalize) {
      return v.charAt(0).toUpperCase() + v.slice(1)
    }
    return v
  }
})
</script>
```

## 表单组件

```vue
<template>
  <div class="form-control">
    <label v-if="label">{{ label }}</label>
    <input
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  disabled: Boolean
})

const modelValue = defineModel()
</script>
```

## 自定义选择框

```vue
<template>
  <div class="custom-checkbox" @click="toggle">
    <span class="checkbox" :class="{ checked: modelValue }"></span>
    <slot></slot>
  </div>
</template>

<script setup>
const modelValue = defineModel({ type: Boolean, default: false })

function toggle() {
  modelValue.value = !modelValue.value
}
</script>

<style scoped>
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-radius: 3px;
  margin-right: 8px;
}

.checkbox.checked {
  background: #42b983;
  border-color: #42b983;
}
</style>
```

## 复杂表单控件

```vue
<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <input
      v-model.number="modelValue"
      type="number"
      :min="min"
      :max="max"
    />
    <button @click="increment">+</button>
  </div>
</template>

<script setup>
const props = defineProps({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  }
})

const count = defineModel({ type: Number, default: 0 })

function decrement() {
  count.value = Math.max(props.min, count.value - props.step)
}

function increment() {
  count.value = Math.min(props.max, count.value + props.step)
}
</script>
```

## 弹窗组件

```vue
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <slot name="header">
            <h3>{{ title }}</h3>
          </slot>
          <button @click="close">×</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button @click="close">关闭</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  title: String
})

const visible = defineModel({ type: Boolean, default: false })

function close() {
  visible.value = false
}
</script>
```

## 搜索框组件

```vue
<template>
  <div class="search-box">
    <input
      v-model="searchText"
      type="text"
      :placeholder="placeholder"
      @keyup.enter="handleSearch"
    />
    <button v-if="searchText" @click="clear" class="clear-btn">×</button>
    <button @click="handleSearch" class="search-btn">搜索</button>
  </div>
</template>

<script setup>
const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索...'
  }
})

const searchText = defineModel({ default: '' })

const emit = defineEmits(['search'])

function handleSearch() {
  emit('search', searchText.value)
}

function clear() {
  searchText.value = ''
  emit('search', '')
}
</script>
```

## 与 defineOptions 配合

```vue
<script setup>
// 定义模型和选项
defineOptions({
  name: 'MyInput',
  inheritAttrs: false
})

const modelValue = defineModel()
</script>
```

## 注意事项

1. **Vue 3.4+ 专有**：此 API 仅在 Vue 3.4 及更高版本中可用

2. **编译器宏**：defineModel 是编译器宏，不需要导入

3. **自动生成**：编译器会自动生成相应的 props 和 emits

4. **与 useModel 的选择**：
   - 语法简洁 → 用 `defineModel`
   - 需要更多控制 → 用 `useModel`

5. **命名约定**：自定义名称的模型会自动生成对应的 update 事件

6. **类型推断**：TypeScript 会自动推断类型，也可以显式指定

7. **只读模型**：可以创建只读模型

```javascript
const readOnlyModel = defineModel({ get() { /* ... */ } })
```
