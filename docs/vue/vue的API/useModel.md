# useModel

Vue 3.4+ 新增的 API，用于简化组件实现 v-model 的逻辑。

> 官方文档：[useModel](https://cn.vuejs.org/api/composition-api-helpers#usemodel)

## 语法

```javascript
import { useModel } from 'vue'

const model = useModel(props, emit)
```

## 参数

- `props`: 组件的 props 对象
- `emit`: 组件的 emit 函数
- `options` (可选): 配置对象，可以指定 `local` 选项

## 返回值

返回一个可写的 ref，当修改该 ref 的值时会触发相应的 emit 事件

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
import { useModel } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// 使用 useModel
const modelValue = useModel(props, emit)
</script>
```

## 等价写法对比

```vue
<!-- 传统写法 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// 需要手动计算属性和 getter/setter
const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<!-- 使用 useModel -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// 简洁多了
const modelValue = useModel(props, emit)
</script>
```

## 自定义 v-model 名称

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
import { useModel } from 'vue'

const props = defineProps(['title'])
const emit = defineEmits(['update:title'])

const title = useModel(props, emit, 'title')
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
import { useModel } from 'vue'

const props = defineProps(['name', 'email', 'age'])
const emit = defineEmits(['update:name', 'update:email', 'update:age'])

const name = useModel(props, emit, 'name')
const email = useModel(props, emit, 'email')
const age = useModel(props, emit, 'age')
</script>
```

## 带修饰符的 v-model

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
  <input v-model="modelValue" />
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

const modelValue = useModel(props, emit)

// 监听变化应用修饰符
watchEffect(() => {
  if (props.modelModifiers.capitalize) {
    modelValue.value = modelValue.value.charAt(0).toUpperCase() +
                      modelValue.value.slice(1)
  }
})
</script>
```

## 复杂表单组件

```vue
<!-- 父组件 -->
<template>
  <Select
    v-model="selectedValue"
    :options="options"
    placeholder="请选择"
  />
</template>

<script setup>
import { ref } from 'vue'
import Select from './Select.vue'

const selectedValue = ref('')
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' }
]
</script>

<!-- 子组件 Select.vue -->
<template>
  <select v-model="value">
    <option value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  options: Array,
  placeholder: String
})
const emit = defineEmits(['update:modelValue'])

const value = useModel(props, emit)
</script>
```

## 本地可变状态

```vue
<template>
  <input v-model="internalValue" @blur="onBlur" />
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// 使用 local 选项，本地修改不会立即同步
const internalValue = useModel(props, emit, { local: true })

function onBlur() {
  // 失去焦点时才同步到父组件
  internalValue.value = props.modelValue
}
</script>
```

## 弹窗组件

```vue
<!-- 父组件 -->
<template>
  <div>
    <button @click="showModal = true">打开弹窗</button>
    <Modal v-model="showModal" title="提示">
      <p>这是一个弹窗</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'

const showModal = ref(false)
</script>

<!-- 子组件 Modal.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button @click="close">×</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button @click="close">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String
})
const emit = defineEmits(['update:modelValue'])

const visible = useModel(props, emit)

function close() {
  visible.value = false
}
</script>
```

## 搜索框组件

```vue
<!-- 父组件 -->
<template>
  <SearchInput v-model="searchQuery" placeholder="搜索..." />
  <p>搜索: {{ searchQuery }}</p>
</template>

<script setup>
import { ref } from 'vue'
import SearchInput from './SearchInput.vue'

const searchQuery = ref('')
</script>

<!-- 子组件 SearchInput.vue -->
<template>
  <div class="search-input">
    <input
      v-model="searchText"
      :placeholder="placeholder"
      @keyup.enter="handleSearch"
    />
    <button @click="handleSearch">搜索</button>
    <button v-if="searchText" @click="clear">清除</button>
  </div>
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: String
})
const emit = defineEmits(['update:modelValue'])

const searchText = useModel(props, emit)

function handleSearch() {
  emit('search', searchText.value)
}

function clear() {
  searchText.value = ''
}
</script>
```

## 注意事项

1. **Vue 3.4+ 专有**：此 API 仅在 Vue 3.4 及更高版本中可用

2. **需要 emit**：必须定义对应的 emit 事件

3. **双向绑定**：修改返回的 ref 会触发 emit，保持双向同步

4. **性能**：与传统写法性能相同，只是语法糖
