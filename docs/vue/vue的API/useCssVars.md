# useCssVars

为单文件组件中的 CSS 变量提供响应式支持。

> 官方文档：[useCssVars](https://cn.vuejs.org/api/sfc-css-features#usecssvars)

## 语法

```javascript
import { useCssVars } from 'vue'

useCssVars(props => ({
  // CSS 变量映射
}))
```

## 参数

- `propsToCssVars`: 一个函数，接收组件 props 并返回 CSS 变量对象

## 返回值

无

## 基础用法

```vue
<template>
  <div class="container">
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const message = ref('Hello')
const color = ref('#42b983')

// 将响应式数据绑定到 CSS 变量
useCssVars((ctx) => ({
  color: color.value,
  message: message.value
}))
</script>

<style>
.container {
  color: v-bind(color);
}
</style>
```

## 动态主题色

```vue
<template>
  <div class="themed-box">
    <h3>主题盒子</h3>
    <input v-model="primaryColor" type="color" />
    <input v-model="secondaryColor" type="color" />
  </div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const primaryColor = ref('#42b983')
const secondaryColor = ref('#35495e')

useCssVars(() => ({
  '--primary-color': primaryColor.value,
  '--secondary-color': secondaryColor.value
}))
</script>

<style scoped>
.themed-box {
  background: var(--secondary-color);
  color: var(--primary-color);
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s;
}
</style>
```

## 响应式布局

```vue
<template>
  <div class="responsive-layout" :style="layoutStyles">
    <div class="sidebar">侧边栏</div>
    <div class="main">主内容</div>
  </div>
  <button @click="toggleSidebar">切换侧边栏</button>
</template>

<script setup>
import { useCssVars, ref, computed } from 'vue'

const sidebarOpen = ref(true)

const sidebarWidth = computed(() => sidebarOpen.value ? '250px' : '0px')

useCssVars(() => ({
  '--sidebar-width': sidebarWidth.value
}))

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<style scoped>
.responsive-layout {
  display: flex;
}

.sidebar {
  width: var(--sidebar-width);
  transition: width 0.3s;
  background: #f0f0f0;
}

.main {
  flex: 1;
}
</style>
```

## 动画控制

```vue
<template>
  <div>
    <div class="animated-box"></div>
    <input v-model="duration" type="range" min="0.1" max="3" step="0.1" />
    <span>动画时长: {{ duration }}秒</span>
  </div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const duration = ref(1)

useCssVars(() => ({
  '--animation-duration': duration.value + 's'
}))
</script>

<style scoped>
.animated-box {
  width: 50px;
  height: 50px;
  background: #42b983;
  animation: slide var(--animation-duration) infinite alternate;
}

@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
</style>
```

## 字体大小控制

```vue
<template>
  <div class="text-container">
    <p class="dynamic-text">这是可调节大小的文本</p>
    <button @click="fontSize++">放大</button>
    <button @click="fontSize--">缩小</button>
  </div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const fontSize = ref(16)

useCssVars(() => ({
  '--font-size': fontSize.value + 'px'
}))
</script>

<style scoped>
.dynamic-text {
  font-size: var(--font-size);
  transition: font-size 0.2s;
}
</style>
```

## 动态间距

```vue
<template>
  <div class="grid">
    <div v-for="item in items" :key="item" class="grid-item">
      {{ item }}
    </div>
  </div>
  <input v-model="gap" type="range" min="0" max="50" />
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const items = [1, 2, 3, 4, 5, 6]
const gap = ref(16)

useCssVars(() => ({
  '--grid-gap': gap.value + 'px'
}))
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--grid-gap);
}

.grid-item {
  background: #42b983;
  color: white;
  padding: 20px;
  text-align: center;
}
</style>
```

## 与 v-bind() 的区别

```vue
<template>
  <div class="box">内容</div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const color = ref('red')

// 方法1: 使用 useCssVars
useCssVars(() => ({
  '--box-color': color.value
}))
</script>

<style scoped>
/* 方法1: 使用 useCssVars 定义的变量 */
.box {
  color: var(--box-color);
}

/* 方法2: 直接使用 v-bind() */
.box {
  color: v-bind(color);
}
</style>
```

## 进阶：多级变量

```vue
<template>
  <div class="theme-provider">
    <div class="card">
      <h3>卡片</h3>
      <p>内容</p>
    </div>
  </div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const theme = ref({
  primary: '#42b983',
  secondary: '#35495e',
  background: '#ffffff',
  text: '#333333'
})

useCssVars(() => ({
  '--theme-primary': theme.value.primary,
  '--theme-secondary': theme.value.secondary,
  '--theme-bg': theme.value.background,
  '--theme-text': theme.value.text
}))
</script>

<style scoped>
.card {
  background: var(--theme-bg);
  color: var(--theme-text);
  border: 2px solid var(--theme-primary);
}
.card h3 {
  color: var(--theme-primary);
}
</style>
```

## 响应式断点

```vue
<template>
  <div class="responsive-container">
    <p>当前容器宽度: {{ containerWidth }}px</p>
  </div>
</template>

<script setup>
import { useCssVars, ref, onMounted } from 'vue'

const containerWidth = ref(1000)

useCssVars(() => ({
  '--container-width': containerWidth.value + 'px'
}))

onMounted(() => {
  window.addEventListener('resize', () => {
    containerWidth.value = window.innerWidth
  })
})
</script>

<style scoped>
.responsive-container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 20px;
}
</style>
```

## 渐变控制

```vue
<template>
  <div class="gradient-box">
    <input v-model="colorStart" type="color" />
    <input v-model="colorEnd" type="color" />
  </div>
</template>

<script setup>
import { useCssVars, ref } from 'vue'

const colorStart = ref('#667eea')
const colorEnd = ref('#764ba2')

useCssVars(() => ({
  '--gradient-start': colorStart.value,
  '--gradient-end': colorEnd.value
}))
</script>

<style scoped>
.gradient-box {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  border-radius: 12px;
}
</style>
```

## 注意事项

1. **性能考虑**：频繁更新 CSS 变量可能影响性能

2. **scoped 样式**：在 scoped 样式中使用时，变量会自动添加作用域标识

3. **SFC 专用**：主要用于单文件组件

4. **与 v-bind() 的选择**：
   - 简单场景用 `v-bind()`
   - 需要复杂计算或转换时用 `useCssVars`

5. **浏览器支持**：确保目标浏览器支持 CSS 自定义属性
