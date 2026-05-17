# v-model

## 作用
`v-model` 是 Vue 的双向数据绑定指令，用于在表单控件或组件上创建双向数据绑定。它本质上是 `v-bind` 和 `v-on` 的语法糖。

## 用法

### 基本表单输入

```vue
<script setup>
import { ref } from 'vue'

const text = ref('')
const number = ref(0)
const checked = ref(false)
const selected = ref('')
</script>

<template>
  <!-- 文本输入 -->
  <input v-model="text" />
  <p>输入的文本: {{ text }}</p>

  <!-- 数字输入 -->
  <input v-model="number" type="number" />
  <p>数字: {{ number }}</p>

  <!-- 复选框 -->
  <input v-model="checked" type="checkbox" />
  <p>选中状态: {{ checked }}</p>

  <!-- 单选按钮 -->
  <input v-model="selected" type="radio" value="option1" />
  <input v-model="selected" type="radio" value="option2" />

  <!-- 选择框 -->
  <select v-model="selected">
    <option value="">请选择</option>
    <option value="A">Option A</option>
    <option value="B">Option B</option>
  </select>
</template>
```

### 修饰符

```vue
<script setup>
import { ref } from 'vue'

const message = ref('')

// .lazy - 失去焦点时更新
// .number - 自动转为数字
// .trim - 自动去除首尾空格
</script>

<template>
  <!-- 失去焦点时更新，而不是每次输入 -->
  <input v-model.lazy="message" />

  <!-- 自动转为数字类型 -->
  <input v-model.number="age" type="number" />

  <!-- 自动去除首尾空格 -->
  <input v-model.trim="username" />
</template>
```

### 组件 v-model

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
import MyInput from './MyInput.vue'

const text = ref('')
</script>

<template>
  <MyInput v-model="text" />
  <!-- 等同于 -->
  <MyInput
    :model-value="text"
    @update:model-value="text = $event"
  />
</template>
```

### 多个 v-model

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps({
  firstName: String,
  lastName: String
})

const emit = defineEmits(['update:firstName', 'update:lastName'])
</script>

<template>
  <input
    :value="props.firstName"
    @input="emit('update:firstName', $event.target.value)"
  />
  <input
    :value="props.lastName"
    @input="emit('update:lastName', $event.target.value)"
  />
</template>

<!-- 父组件 -->
<script setup>
import { ref } from 'vue'

const firstName = ref('')
const lastName = ref('')
</script>

<template>
  <UserName
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  />
</template>
```

### 自定义修饰符

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

function emitValue(e) {
  let value = e.target.value

  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }

  emit('update:modelValue', value)
}
</script>

<template>
  <input :value="props.modelValue" @input="emitValue" />
</template>

<!-- 父组件 -->
<template>
  <MyInput v-model.capitalize="text" />
</template>
```

### 复选框组

```vue
<script setup>
import { ref } from 'vue'

const checkedNames = ref([])
</script>

<template>
  <input v-model="checkedNames" type="checkbox" value="Jack" />
  <input v-model="checkedNames" type="checkbox" value="John" />
  <input v-model="checkedNames" type="checkbox" value="Mike" />

  <p>选中的名字: {{ checkedNames }}</p>
</template>
```

### 选择框多选

```vue
<script setup>
import { ref } from 'vue'

const selected = ref([])
</script>

<template>
  <select v-model="selected" multiple>
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
  </select>

  <p>选中的: {{ selected }}</p>
</template>
```

### 绑定对象

```vue
<script setup>
import { ref } from 'vue'

const selected = ref(null)

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]
</script>

<template>
  <select v-model="selected">
    <option v-for="user in users" :key="user.id" :value="user">
      {{ user.name }}
    </option>
  </select>

  <p v-if="selected">
    选中的用户: {{ selected.name }}
  </p>
</template>
```

## 注意事项

### 1. v-model 的内部原理

```vue
<!-- v-model 的本质 -->
<input v-model="searchText" />

<!-- 等同于 -->
<input
  :value="searchText"
  @input="searchText = $event.target.value"
/>
```

### 2. 不同元素的绑定方式

```vue
<template>
  <!-- 文本/textarea -->
  <input v-model="message" />
  <textarea v-model="message"></textarea>

  <!-- 复选框（单个） -->
  <input v-model="checked" type="checkbox" />

  <!-- 复选框（多个） -->
  <input v-model="checkedNames" type="checkbox" value="A" />

  <!-- 单选按钮 -->
  <input v-model="picked" type="radio" value="One" />
  <input v-model="picked" type="radio" value="Two" />

  <!-- 选择框 -->
  <select v-model="selected">
    <option value="abc">ABC</option>
  </select>
</template>
```

### 3. lazy 修饰符

```vue
<script setup>
import { ref } from 'vue'

const text = ref('')
</script>

<template>
  <!-- 默认情况下，v-model 在每次 input 事件后同步 -->
  <input v-model="text" />

  <!-- 使用 lazy 后，改为在 change 事件后同步 -->
  <input v-model.lazy="text" />
</template>
```

### 4. number 修饰符

```vue
<script setup>
import { ref } from 'vue'

const age = ref('')
</script>

<template>
  <!-- 自动将输入值转为数字 -->
  <input v-model.number="age" type="number" />

  <!-- 如果转换失败，返回原始值 -->
  <p>年龄: {{ age }}</p>
</template>
```

### 5. trim 修饰符

```vue
<script setup>
import { ref } from 'vue'

const message = ref('')
</script>

<template>
  <!-- 自动去除首尾空格 -->
  <input v-model.trim="message" />

  <p>内容长度: {{ message.length }}</p>
</template>
```

### 6. 组件 v-model 参数

```vue
<!-- Vue 2.x 语法 -->
<ChildComponent v-model="page" />

<!-- Vue 3.x 语法（默认参数名改变） -->
<ChildComponent v-model="page" />
<!-- 等同于 -->
<ChildComponent :model-value="page" @update:model-value="page = $event" />
```

### 7. 与 v-bind 的冲突

```vue
<script setup>
const options = ref(['A', 'B', 'C'])
const selected = ref('A')
</script>

<template>
  <!-- ✅ 正确 -->
  <select v-model="selected">
    <option v-for="opt in options" :key="opt" :value="opt">
      {{ opt }}
    </option>
  </select>

  <!-- ❌ 错误：不要同时使用 v-bind 和 v-model -->
  <select :value="selected" v-model="selected">
</template>
```

### 8. 动态绑定

```vue
<script setup>
import { ref } from 'vue'

const fields = ref({
  username: '',
  email: '',
  age: null
})
</script>

<template>
  <!-- 动态绑定多个字段 -->
  <input v-model="fields.username" />
  <input v-model="fields.email" />
  <input v-model.number="fields.age" type="number" />
</template>
```

## 使用场景

### 1. 登录表单

```vue
<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

function handleSubmit() {
  console.log('Login:', form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <label>
      <input v-model="form.rememberMe" type="checkbox" />
      记住我
    </label>
    <button type="submit">登录</button>
  </form>
</template>
```

### 2. 搜索框

```vue
<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')

watch(searchQuery, (newQuery) => {
  // 防抖搜索
  console.log('Searching for:', newQuery)
})
</script>

<template>
  <input v-model.trim="searchQuery" placeholder="搜索..." />
  <p>搜索: {{ searchQuery }}</p>
</template>
```

### 3. 计数器

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(1)

const total = computed(() => count.value * 100)
</script>

<template>
  <div>
    <button @click="count--">-</button>
    <input v-model.number="count" type="number" min="1" />
    <button @click="count++">+</button>
    <p>总计: ¥{{ total }}</p>
  </div>
</template>
```

### 4. 富文本编辑器

```vue
<script setup>
import { ref } from 'vue'
import RichTextEditor from './RichTextEditor.vue'

const content = ref('')
</script>

<template>
  <RichTextEditor v-model="content" />
  <div>内容预览:</div>
  <div v-html="content"></div>
</template>
```

### 5. 日期选择器

```vue
<script setup>
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

const date = ref(null)
const dateRange = ref([])
</script>

<template>
  <!-- 单日期 -->
  <DatePicker v-model="date" />

  <!-- 日期范围 -->
  <DatePicker v-model="dateRange" is-range />
</template>
```

### 6. 标签输入

```vue
<script setup>
import { ref } from 'vue'

const tags = ref(['Vue', 'React'])
const newTag = ref('')

function addTag() {
  if (newTag.value && !tags.value.includes(newTag.value)) {
    tags.value.push(newTag.value)
    newTag.value = ''
  }
}

function removeTag(index) {
  tags.value.splice(index, 1)
}
</script>

<template>
  <div>
    <input
      v-model.trim="newTag"
      @keyup.enter="addTag"
      placeholder="输入标签后按回车"
    />
    <div>
      <span v-for="(tag, index) in tags" :key="index">
        {{ tag }}
        <button @click="removeTag(index)">×</button>
      </span>
    </div>
  </div>
</template>
```

### 7. 颜色选择器

```vue
<script setup>
import { ref } from 'vue'

const color = ref('#ff0000')
</script>

<template>
  <input v-model="color" type="color" />
  <div :style="{ backgroundColor: color }">
    预览: {{ color }}
  </div>
</template>
```

### 8. 滑块

```vue
<script setup>
import { ref } from 'vue'

const volume = ref(50)
const range = ref([20, 80])
</script>

<template>
  <div>
    <label>音量: {{ volume }}</label>
    <input v-model="volume" type="range" min="0" max="100" />

    <label>范围: {{ range[0] }} - {{ range[1] }}</label>
    <input v-model="range" type="range" multiple min="0" max="100" />
  </div>
</template>
```

### 9. 文件上传

```vue
<script setup>
import { ref } from 'vue'

const files = ref([])

function handleFileUpload(event) {
  files.value = Array.from(event.target.files)
}
</script>

<template>
  <input type="file" @change="handleFileUpload" multiple />
  <div v-for="(file, index) in files" :key="index">
    {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
  </div>
</template>
```

### 10. 自定义开关

```vue
<!-- ToggleSwitch.vue -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    :class="{ active: props.modelValue }"
    @click="toggle"
  >
    <span class="slider"></span>
  </button>
</template>

<style scoped>
button {
  width: 50px;
  height: 26px;
  border-radius: 13px;
  background: #ccc;
  position: relative;
  transition: background 0.3s;
}

button.active {
  background: #42b983;
}

.slider {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 11px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
}

.active .slider {
  left: 26px;
}
</style>
```

## v-model 修饰符总结

| 修饰符 | 作用 | 适用元素 |
|------|------|----------|
| .lazy | 失去焦点时更新 | input, textarea |
| .number | 自动转为数字 | input[type=number] |
| .trim | 去除首尾空格 | input, textarea |
| .capitalize | 首字母大写（自定义） | 组件 |

## 最佳实践

1. **明确数据类型**：使用 .number 修饰符确保数字类型
2. **清理输入**：使用 .trim 修饰符去除空格
3. **性能优化**：对于复杂计算使用 .lazy 延迟更新
4. **组件封装**：正确实现组件的 v-model
5. **多个绑定**：合理使用多个 v-model 绑定
