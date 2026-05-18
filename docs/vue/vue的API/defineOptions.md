# defineOptions

## 作用

`defineOptions()` 用于在 `<script setup>` 中定义组件选项，如 `name`、`inheritAttrs`、`components`、`filters` 等。

## 基本用法

```vue
<script setup>
import { defineOptions } from 'vue'

defineOptions({
  name: 'MyComponent',
  inheritAttrs: false
})
</script>
```

## 组件名称

```vue
<script setup>
import { defineOptions } from 'vue'

defineOptions({
  name: 'UserProfile'
})
</script>
```

## 禁用属性继承

```vue
<script setup>
import { defineOptions } from 'vue'

defineOptions({
  inheritAttrs: false
})
</script>
```

## 定义组件选项

```vue
<script setup>
import { defineOptions } from 'vue'
import SubComponent from './SubComponent.vue'

defineOptions({
  name: 'ParentComponent',
  inheritAttrs: false,
  components: {
    SubComponent
  },
  // 其他选项
  // emits: [],
  // props: {}
})
</script>
```

## 使用场景

### 1. devtools 显示名称

```vue
<script setup>
import { defineOptions } from 'vue'

defineOptions({
  name: 'CustomButton'
})
</script>
```

### 2. 样式块作用域

```vue
<script setup>
import { defineOptions } from 'vue'

defineOptions({
  name: 'MyComponent'
})
</script>

<style>
/* 可以在 devtools 中看到组件名称 */
</style>
```
