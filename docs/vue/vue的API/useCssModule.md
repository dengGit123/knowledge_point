# useCssModule

允许在 setup 中访问 CSS Modules。

## 语法

```javascript
import { useCssModule } from 'vue'

// 使用默认的 <style module>
const cssModule = useCssModule()

// 使用自定义的 module 名称
const cssModule = useCssModule('custom-class')
```

## 参数

- `module`: 可选，指定使用的 CSS Modules 名称，默认为 `$style`

## 返回值

返回一个包含 CSS Modules 类名的对象

## 基础用法

```vue
<template>
  <div :class="$style.container">
    <p :class="$style.title">标题</p>
  </div>
</template>

<script setup>
import { useCssModule } from 'vue'

// 获取默认的 CSS Modules
const style = useCssModule()
</script>

<style module>
.container {
  padding: 20px;
  background: #f5f5f5;
}

.title {
  font-size: 24px;
  color: #333;
}
</style>
```

## 命名 CSS Modules

```vue
<template>
  <div>
    <div :class="classes.container">默认样式</div>
    <div :class="customClasses.container">自定义样式</div>
  </div>
</template>

<script setup>
import { useCssModule } from 'vue'

// 获取默认的 CSS Modules
const classes = useCssModule()

// 获取名为 'custom' 的 CSS Modules
const customClasses = useCssModule('custom')
</script>

<style module>
.container {
  padding: 10px;
}
</style>

<style module="custom">
.container {
  padding: 20px;
  background: #eee;
}
</style>
```

## 动态类名绑定

```vue
<template>
  <div>
    <button
      v-for="btn in buttons"
      :key="btn.type"
      :class="[$style.button, $style[btn.type]]"
    >
      {{ btn.label }}
    </button>
  </div>
</template>

<script setup>
import { useCssModule } from 'vue'

const style = useCssModule()

const buttons = [
  { type: 'primary', label: '主要按钮' },
  { type: 'secondary', label: '次要按钮' },
  { type: 'danger', label: '危险按钮' }
]
</script>

<style module>
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.primary {
  background: #1890ff;
  color: white;
}

.secondary {
  background: #52c41a;
  color: white;
}

.danger {
  background: #f5222d;
  color: white;
}
</style>
```

## 与 Composition API 结合

```vue
<template>
  <div :class="$style.card">
    <h3 :class="$style.title">{{ title }}</h3>
    <p :class="$style.content">{{ content }}</p>
    <button :class="$style.button" @click="toggle">
      {{ isExpanded ? '收起' : '展开' }}
    </button>
    <div v-if="isExpanded" :class="$style.extra">
      {{ extraContent }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCssModule } from 'vue'

const props = defineProps({
  title: String,
  content: String,
  extraContent: String
})

const style = useCssModule()
const isExpanded = ref(false)

function toggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<style module>
.card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.button:hover {
  background: #40a9ff;
}

.extra {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  color: #999;
}
</style>
```

## 类型提示

```vue
<script setup lang="ts">
import { useCssModule } from 'vue'

interface CssModule {
  container: string
  title: string
  content: string
  button: string
}

const style = useCssModule<CssModule>()

// TypeScript 现在可以提供类型提示
console.log(style.container)
</script>

<style module>
.container {
  padding: 20px;
}

.title {
  font-size: 18px;
}

.content {
  color: #666;
}

.button {
  padding: 8px 16px;
}
</style>
```

## 注意事项

1. **仅在 setup 中使用**：useCssModule 只能在 `<script setup>` 或 `setup()` 函数中使用

2. **需要启用 CSS Modules**：确保 `<style>` 标签使用了 `module` 属性

3. **服务端渲染**：在 SSR 环境中也能正常工作

4. **作用域**：每个组件的 CSS Modules 是独立的，不会发生类名冲突
