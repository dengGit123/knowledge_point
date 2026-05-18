# v-model

## 作用
`v-model` 是 Vue 的双向数据绑定指令，用于在表单控件或组件上创建双向数据绑定。它本质上是 `v-bind` 和 `v-on` 的语法糖。

## 用法

### 基本表单输入

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const text = ref('')
const number = ref(0)
const checked = ref(false)
const selected = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 文本输入 --&gt;
  &lt;input v-model="text" /&gt;
  &lt;p&gt;输入的文本: {{ text }}&lt;/p&gt;

  &lt;!-- 数字输入 --&gt;
  &lt;input v-model="number" type="number" /&gt;
  &lt;p&gt;数字: {{ number }}&lt;/p&gt;

  &lt;!-- 复选框 --&gt;
  &lt;input v-model="checked" type="checkbox" /&gt;
  &lt;p&gt;选中状态: {{ checked }}&lt;/p&gt;

  &lt;!-- 单选按钮 --&gt;
  &lt;input v-model="selected" type="radio" value="option1" /&gt;
  &lt;input v-model="selected" type="radio" value="option2" /&gt;

  &lt;!-- 选择框 --&gt;
  &lt;select v-model="selected"&gt;
    &lt;option value=""&gt;请选择&lt;/option&gt;
    &lt;option value="A"&gt;Option A&lt;/option&gt;
    &lt;option value="B"&gt;Option B&lt;/option&gt;
  &lt;/select&gt;
`&lt;/template&gt;`
```

### 修饰符

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const message = ref('')

// .lazy - 失去焦点时更新
// .number - 自动转为数字
// .trim - 自动去除首尾空格
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 失去焦点时更新，而不是每次输入 --&gt;
  &lt;input v-model.lazy="message" /&gt;

  &lt;!-- 自动转为数字类型 --&gt;
  &lt;input v-model.number="age" type="number" /&gt;

  &lt;!-- 自动去除首尾空格 --&gt;
  &lt;input v-model.trim="username" /&gt;
`&lt;/template&gt;`
```

### 组件 v-model

```text
&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  /&gt;
`&lt;/template&gt;`

&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import { ref } from 'vue'
import MyInput from './MyInput.vue'

const text = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;MyInput v-model="text" /&gt;
  &lt;!-- 等同于 --&gt;
  &lt;MyInput
    :model-value="text"
    @update:model-value="text = $event"
  /&gt;
`&lt;/template&gt;`
```

### 多个 v-model

```text
&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  firstName: String,
  lastName: String
})

const emit = defineEmits(['update:firstName', 'update:lastName'])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    :value="props.firstName"
    @input="emit('update:firstName', $event.target.value)"
  /&gt;
  &lt;input
    :value="props.lastName"
    @input="emit('update:lastName', $event.target.value)"
  /&gt;
`&lt;/template&gt;`

&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import { ref } from 'vue'

const firstName = ref('')
const lastName = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;UserName
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  /&gt;
`&lt;/template&gt;`
```

### 自定义修饰符

```text
&lt;!-- 子组件 --&gt;
`&lt;script setup&gt;`
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () =&gt; ({}) }
})

const emit = defineEmits(['update:modelValue'])

function emitValue(e) {
  let value = e.target.value

  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }

  emit('update:modelValue', value)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input :value="props.modelValue" @input="emitValue" /&gt;
`&lt;/template&gt;`

&lt;!-- 父组件 --&gt;
`&lt;template&gt;`
  &lt;MyInput v-model.capitalize="text" /&gt;
`&lt;/template&gt;`
```

### 复选框组

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const checkedNames = ref([])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="checkedNames" type="checkbox" value="Jack" /&gt;
  &lt;input v-model="checkedNames" type="checkbox" value="John" /&gt;
  &lt;input v-model="checkedNames" type="checkbox" value="Mike" /&gt;

  &lt;p&gt;选中的名字: {{ checkedNames }}&lt;/p&gt;
`&lt;/template&gt;`
```

### 选择框多选

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const selected = ref([])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;select v-model="selected" multiple&gt;
    &lt;option value="A"&gt;A&lt;/option&gt;
    &lt;option value="B"&gt;B&lt;/option&gt;
    &lt;option value="C"&gt;C&lt;/option&gt;
  &lt;/select&gt;

  &lt;p&gt;选中的: {{ selected }}&lt;/p&gt;
`&lt;/template&gt;`
```

### 绑定对象

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const selected = ref(null)

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;select v-model="selected"&gt;
    &lt;option v-for="user in users" :key="user.id" :value="user"&gt;
      {{ user.name }}
    &lt;/option&gt;
  &lt;/select&gt;

  &lt;p v-if="selected"&gt;
    选中的用户: {{ selected.name }}
  &lt;/p&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. v-model 的内部原理

```text
&lt;!-- v-model 的本质 --&gt;
&lt;input v-model="searchText" /&gt;

&lt;!-- 等同于 --&gt;
&lt;input
  :value="searchText"
  @input="searchText = $event.target.value"
/&gt;
```

### 2. 不同元素的绑定方式

```text
`&lt;template&gt;`
  &lt;!-- 文本/textarea --&gt;
  &lt;input v-model="message" /&gt;
  &lt;textarea v-model="message"&gt;&lt;/textarea&gt;

  &lt;!-- 复选框（单个） --&gt;
  &lt;input v-model="checked" type="checkbox" /&gt;

  &lt;!-- 复选框（多个） --&gt;
  &lt;input v-model="checkedNames" type="checkbox" value="A" /&gt;

  &lt;!-- 单选按钮 --&gt;
  &lt;input v-model="picked" type="radio" value="One" /&gt;
  &lt;input v-model="picked" type="radio" value="Two" /&gt;

  &lt;!-- 选择框 --&gt;
  &lt;select v-model="selected"&gt;
    &lt;option value="abc"&gt;ABC&lt;/option&gt;
  &lt;/select&gt;
`&lt;/template&gt;`
```

### 3. lazy 修饰符

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const text = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 默认情况下，v-model 在每次 input 事件后同步 --&gt;
  &lt;input v-model="text" /&gt;

  &lt;!-- 使用 lazy 后，改为在 change 事件后同步 --&gt;
  &lt;input v-model.lazy="text" /&gt;
`&lt;/template&gt;`
```

### 4. number 修饰符

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const age = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 自动将输入值转为数字 --&gt;
  &lt;input v-model.number="age" type="number" /&gt;

  &lt;!-- 如果转换失败，返回原始值 --&gt;
  &lt;p&gt;年龄: {{ age }}&lt;/p&gt;
`&lt;/template&gt;`
```

### 5. trim 修饰符

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const message = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 自动去除首尾空格 --&gt;
  &lt;input v-model.trim="message" /&gt;

  &lt;p&gt;内容长度: {{ message.length }}&lt;/p&gt;
`&lt;/template&gt;`
```

### 6. 组件 v-model 参数

```text
&lt;!-- Vue 2.x 语法 --&gt;
&lt;ChildComponent v-model="page" /&gt;

&lt;!-- Vue 3.x 语法（默认参数名改变） --&gt;
&lt;ChildComponent v-model="page" /&gt;
&lt;!-- 等同于 --&gt;
&lt;ChildComponent :model-value="page" @update:model-value="page = $event" /&gt;
```

### 7. 与 v-bind 的冲突

```text
`&lt;script setup&gt;`
const options = ref(['A', 'B', 'C'])
const selected = ref('A')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- ✅ 正确 --&gt;
  &lt;select v-model="selected"&gt;
    &lt;option v-for="opt in options" :key="opt" :value="opt"&gt;
      {{ opt }}
    &lt;/option&gt;
  &lt;/select&gt;

  &lt;!-- ❌ 错误：不要同时使用 v-bind 和 v-model --&gt;
  &lt;select :value="selected" v-model="selected"&gt;
`&lt;/template&gt;`
```

### 8. 动态绑定

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const fields = ref({
  username: '',
  email: '',
  age: null
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 动态绑定多个字段 --&gt;
  &lt;input v-model="fields.username" /&gt;
  &lt;input v-model="fields.email" /&gt;
  &lt;input v-model.number="fields.age" type="number" /&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 登录表单

```text
`&lt;script setup&gt;`
import { ref, reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

function handleSubmit() {
  console.log('Login:', form)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form @submit.prevent="handleSubmit"&gt;
    &lt;input v-model="form.username" placeholder="用户名" /&gt;
    &lt;input v-model="form.password" type="password" placeholder="密码" /&gt;
    &lt;label&gt;
      &lt;input v-model="form.rememberMe" type="checkbox" /&gt;
      记住我
    &lt;/label&gt;
    &lt;button type="submit"&gt;登录&lt;/button&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 2. 搜索框

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const searchQuery = ref('')

watch(searchQuery, (newQuery) =&gt; {
  // 防抖搜索
  console.log('Searching for:', newQuery)
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model.trim="searchQuery" placeholder="搜索..." /&gt;
  &lt;p&gt;搜索: {{ searchQuery }}&lt;/p&gt;
`&lt;/template&gt;`
```

### 3. 计数器

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const count = ref(1)

const total = computed(() =&gt; count.value * 100)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="count--"&gt;-&lt;/button&gt;
    &lt;input v-model.number="count" type="number" min="1" /&gt;
    &lt;button @click="count++"&gt;+&lt;/button&gt;
    &lt;p&gt;总计: ¥{{ total }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 富文本编辑器

```text
`&lt;script setup&gt;`
import { ref } from 'vue'
import RichTextEditor from './RichTextEditor.vue'

const content = ref('')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;RichTextEditor v-model="content" /&gt;
  &lt;div&gt;内容预览:&lt;/div&gt;
  &lt;div v-html="content"&gt;&lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 日期选择器

```text
`&lt;script setup&gt;`
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

const date = ref(null)
const dateRange = ref([])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 单日期 --&gt;
  &lt;DatePicker v-model="date" /&gt;

  &lt;!-- 日期范围 --&gt;
  &lt;DatePicker v-model="dateRange" is-range /&gt;
`&lt;/template&gt;`
```

### 6. 标签输入

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;input
      v-model.trim="newTag"
      @keyup.enter="addTag"
      placeholder="输入标签后按回车"
    /&gt;
    &lt;div&gt;
      &lt;span v-for="(tag, index) in tags" :key="index"&gt;
        {{ tag }}
        &lt;button @click="removeTag(index)"&gt;×&lt;/button&gt;
      &lt;/span&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 颜色选择器

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const color = ref('#ff0000')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="color" type="color" /&gt;
  &lt;div :style="{ backgroundColor: color }"&gt;
    预览: {{ color }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 滑块

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const volume = ref(50)
const range = ref([20, 80])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;label&gt;音量: {{ volume }}&lt;/label&gt;
    &lt;input v-model="volume" type="range" min="0" max="100" /&gt;

    &lt;label&gt;范围: {{ range[0] }} - {{ range[1] }}&lt;/label&gt;
    &lt;input v-model="range" type="range" multiple min="0" max="100" /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 9. 文件上传

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const files = ref([])

function handleFileUpload(event) {
  files.value = Array.from(event.target.files)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input type="file" @change="handleFileUpload" multiple /&gt;
  &lt;div v-for="(file, index) in files" :key="index"&gt;
    {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 10. 自定义开关

```text
&lt;!-- ToggleSwitch.vue --&gt;
`&lt;script setup&gt;`
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button
    :class="{ active: props.modelValue }"
    @click="toggle"
  &gt;
    &lt;span class="slider"&gt;&lt;/span&gt;
  &lt;/button&gt;
`&lt;/template&gt;`

&lt;style scoped&gt;
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
&lt;/style&gt;
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
