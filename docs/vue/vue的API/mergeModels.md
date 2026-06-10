# mergeModels

> 📖 [Vue 官方文档 - mergeModels](https://cn.vuejs.org/api/render-function#mergemodels)

Vue 3.4+ 新增的 API，用于合并多个 v-model 绑定。

## 语法

```javascript
import { mergeModels } from 'vue'

const merged = mergeModels(model1, model2)
```

## 参数

- 可以接受多个模型对象作为参数

## 返回值

返回合并后的模型对象

## 基础用法

```vue
<script setup>
import { mergeModels } from 'vue'

// 定义两个模型
const titleModel = defineModel('title')
const countModel = defineModel('count')

// 合并模型
const merged = mergeModels(titleModel, countModel)

// 使用合并后的模型
console.log(merged.title)
console.log(merged.count)
</script>
```

## 多模型管理

```vue
<template>
  <div>
    <input v-model="title" placeholder="标题" />
    <input v-model.number="count" type="number" />
    <input v-model="active" type="checkbox" />
  </div>
</template>

<script setup>
import { mergeModels } from 'vue'

const titleModel = defineModel('title')
const countModel = defineModel('count')
const activeModel = defineModel('active')

// 合并所有模型
const model = mergeModels(
  { title: titleModel },
  { count: countModel },
  { active: activeModel }
)

// 导出合并的模型供其他组件使用
defineExpose({
  model
})
</script>
```

## 表单数据合并

```vue
<template>
  <form @submit.prevent="submit">
    <input v-model="formData.name" placeholder="姓名" />
    <input v-model="formData.email" placeholder="邮箱" />
    <input v-model="formData.age" type="number" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { mergeModels, computed } from 'vue'

const nameModel = defineModel('name')
const emailModel = defineModel('email')
const ageModel = defineModel('age')

const formData = mergeModels(
  computed({
    get: () => ({ name: nameModel.value }),
    set: (val) => { nameModel.value = val.name }
  }),
  computed({
    get: () => ({ email: emailModel.value }),
    set: (val) => { emailModel.value = val.email }
  }),
  computed({
    get: () => ({ age: ageModel.value }),
    set: (val) => { ageModel.value = val.age }
  })
)

function submit() {
  console.log('表单数据:', formData)
}
</script>
```

## 条件模型合并

```vue
<script setup>
import { mergeModels, ref, computed } from 'vue'

const baseModel = defineModel('base')
const optionalModel = defineModel('optional')

const shouldUseOptional = ref(true)

const merged = computed(() => {
  if (shouldUseOptional.value) {
    return mergeModels(
      { base: baseModel },
      { optional: optionalModel }
    )
  }
  return { base: baseModel }
})
</script>
```

## 动态模型合并

```vue
<script setup>
import { mergeModels, ref, watchEffect } from 'vue'

const models = ref({})

// 动态添加模型
function addModel(name) {
  models.value[name] = defineModel(name)
}

// 监听并合并
const merged = computed(() => {
  return mergeModels(...Object.values(models.value))
})

addModel('field1')
addModel('field2')
</script>
```

## 与 useModel 结合

```vue
<script setup>
import { useModel, mergeModels } from 'vue'

const props = defineProps(['modelValue', 'title'])
const emit = defineEmits(['update:modelValue', 'update:title'])

const valueModel = useModel(props, emit)
const titleModel = useModel(props, emit, 'title')

const merged = mergeModels(
  { value: valueModel },
  { title: titleModel }
)
</script>
```

## 模型验证

```vue
<script setup>
import { mergeModels, computed } from 'vue'

const nameModel = defineModel('name')
const emailModel = defineModel('email')

const validatedModel = mergeModels(
  computed({
    get: () => nameModel.value,
    set: (val) => {
      if (val.length >= 2) {
        nameModel.value = val
      }
    }
  }),
  computed({
    get: () => emailModel.value,
    set: (val) => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        emailModel.value = val
      }
    }
  })
)
</script>
```

## 注意事项

1. **Vue 3.4+ 专有**：此 API 仅在 Vue 3.4 及更高版本中可用

2. **实验性**：这是一个相对较新的 API，使用时注意版本兼容性

3. **性能考虑**：频繁合并可能影响性能

4. **替代方案**：
   - 简单场景：直接使用多个 defineModel
   - 复杂场景：考虑使用 computed 或单独管理

5. **类型安全**：TypeScript 支持可能有限

6. **最佳实践**：
   - 只在真正需要合并时使用
   - 保持模型命名清晰
   - 考虑使用组合式函数替代
