# useCssModule

用于在 `setup()` 或 `<script setup>` 中访问 CSS Modules 注入的 class 对象。不传参数时返回 `<style module>`（即 `$style`）的内容；传入与 `module` attribute 一致的名称时，返回对应的具名 CSS Modules。

📖 [useCssModule（官方文档 - CSS Modules）](https://cn.vuejs.org/api/sfc-css-features.html#css-modules)

## 语法

```javascript
import { useCssModule } from 'vue'

const cssModule = useCssModule()
const namedModule = useCssModule('custom-name')
```

官方类型签名：

```ts
function useCssModule(name?: string): Record<string, string>
```

## 参数

- `name`（可选）：`<style module="xxx">` 的 `module` attribute 值，用于访问具名 CSS Modules

## 返回值

返回 `Record<string, string>`：键为 `<style module>` 中写的类名，值为编译后的哈希类名（如 `"container"` → `"container_xfpAb2"`）

## 基础用法

```vue
<template>
  <div :class="$style.container">
    <p :class="$style.title">标题</p>
  </div>
</template>

<script setup>
import { useCssModule } from 'vue'

// 访问默认的 CSS Modules
const style = useCssModule()
console.log(style.container) // "container_xxx"
console.log(style.title) // "title_xxx"
</script>

<style module>
.container {
  padding: 20px;
}
.title {
  font-size: 24px;
}
</style>
```

## 命名 CSS Modules

```vue
<template>
  <div>
    <div :class="defaultClasses.container">默认样式</div>
    <div :class="customClasses.container">自定义样式</div>
  </div>
</template>

<script setup>
import { useCssModule } from 'vue'

const defaultClasses = useCssModule()
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

## 动态类名

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
  cursor: pointer;
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

## 组合类名

```vue
<template>
  <div :class="combinedClasses">内容</div>
</template>

<script setup>
import { useCssModule, computed } from 'vue'

const style = useCssModule()

const combinedClasses = computed(() => [
  style.container,
  style.active,
  style.large
])
</script>

<style module>
.container { /* ... */ }
.active { /* ... */ }
.large { /* ... */ }
</style>
```

## 条件类名

```vue
<template>
  <div :class="cardClasses">卡片</div>
</template>

<script setup>
import { useCssModule, computed, ref } from 'vue'

const style = useCssModule()
const isActive = ref(true)
const isLoading = ref(false)

const cardClasses = computed(() => ({
  [style.card]: true,
  [style.active]: isActive.value,
  [style.loading]: isLoading.value
}))
</script>

<style module>
.card { /* ... */ }
.active { /* ... */ }
.loading { /* ... */ }
</style>
```

## 与组件结合

```vue
<template>
  <button :class="buttonClasses" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup>
import { useCssModule, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'primary', 'danger'].includes(val)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val) => ['small', 'medium', 'large'].includes(val)
  }
})

const style = useCssModule()

const buttonClasses = computed(() => [
  style.button,
  style[props.type],
  style[props.size]
])
</script>

<style module>
.button { /* 基础样式 */ }
.primary { /* 主要样式 */ }
.danger { /* 危险样式 */ }
.small { /* 小尺寸 */ }
.medium { /* 中尺寸 */ }
.large { /* 大尺寸 */ }
</style>
```

## TypeScript 支持

`useCssModule` 的签名是 `useCssModule(name?: string): Record<string, string>`，不接受泛型参数。要获得更精确的类型，用类型断言：

```vue
<script setup lang="ts">
import { useCssModule } from 'vue'

interface CssModules {
  container: string
  title: string
  content: string
  button: string
}

// ✅ 用 as 断言收窄类型
const style = useCssModule() as CssModules

// TypeScript 现在知道这些属性存在
console.log(style.container)
</script>

<style module>
.container { /* ... */ }
.title { /* ... */ }
.content { /* ... */ }
.button { /* ... */ }
</style>
```

```ts
// ❌ 错误：useCssModule 没有泛型参数，传类型参数会编译报错
const style = useCssModule<CssModules>()
```

## 在可组合函数中使用

```javascript
// utils/useTheme.js
import { useCssModule } from 'vue'

export function useTheme() {
  const style = useCssModule()

  function getThemeClass(theme) {
    return style[theme] || style.default
  }

  return {
    getThemeClass
  }
}
```

## 动态样式

```vue
<template>
  <div :class="style.container" :style="dynamicStyle">
    内容
  </div>
</template>

<script setup>
import { useCssModule, computed, ref } from 'vue'

const style = useCssModule()
const color = ref('#42b983')

const dynamicStyle = computed(() => ({
  '--theme-color': color.value
}))
</script>

<style module>
.container {
  color: var(--theme-color);
}
</style>
```

## 多个 CSS Modules

```vue
<template>
  <div :class="[layout.container, theme.content]">
    <h1 :class="[layout.title, theme.heading]">标题</h1>
  </div>
</template>

<script setup>
import { useCssModule } from 'vue'

const layout = useCssModule('layout')
const theme = useCssModule('theme')
</script>

<style module="layout">
.container { /* 布局样式 */ }
.title { /* 标题布局 */ }
</style>

<style module="theme">
.content { /* 主题样式 */ }
.heading { /* 标题主题 */ }
</style>
```

## 注意事项

1. **仅在 setup 上下文中使用**：只能在 `setup()` 或 `<script setup>` 中同步调用

2. **需要 module 属性**：`<style>` 标签必须有 `module` 属性，否则没有可访问的 CSS Modules

3. **$style 变量**：不调用 `useCssModule` 时，模板中也可以直接使用 `$style`（默认注入名称）

4. **作用域隔离**：每个组件的 CSS Modules 是独立的，class 会被哈希化以避免冲突

5. **服务端渲染**：SSR 中也能正常工作

6. **与 scoped 的区别**：
   - CSS Modules：生成唯一类名
   - scoped：添加属性选择器

7. **命名规则**：连字符形式的类名（如 `long-class-name`）需要用方括号访问 `style['long-class-name']`；推荐直接在 CSS 中使用驼峰命名（`.longClassName`）

8. **性能**：编译时生成哈希类名，运行时无额外开销
