# v-cloak

## 作用

`v-cloak` 保留在元素上直到关联的组件实例编译完成。编译完成后，`v-cloak` 属性会被自动移除。

通常配合 CSS 规则 `[v-cloak] { display: none }` 使用，用于在 Vue 编译完成前**隐藏未编译的模板**，防止页面出现闪烁（即用户短暂看到 `{{ }}` 模板语法的情况）。

> [Vue 官方文档 - v-cloak](https://cn.vuejs.org/api/built-in-directives#v-cloak)

## 基本用法

```vue
<template>
  <div v-cloak>
    <p>{{ message }}</p>
  </div>
</template>

<style>
/* 编译完成前隐藏 */
[v-cloak] {
  display: none;
}
</style>

<script setup>
import { ref } from 'vue'
const message = ref('Hello Vue!')
</script>
```

## 工作原理

```
1. 页面加载 → HTML 中的 {{ message }} 是原始文本
2. v-cloak 属性存在 → CSS [v-cloak] { display: none } 生效 → 元素隐藏
3. Vue 编译完成 → v-cloak 属性被移除 → 元素显示（此时已渲染为正确的值）
```

## 使用场景

### 1. 根元素防闪烁

```html
<!-- index.html -->
<head>
  <style>
    [v-cloak] {
      display: none;
    }
  </style>
</head>
<body>
  <div id="app" v-cloak>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
    <button @click="handleClick">{{ buttonText }}</button>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
```

### 2. 加载占位效果

```vue
<template>
  <div v-cloak id="app">
    <header>{{ siteName }}</header>
    <main>{{ pageContent }}</main>
  </div>
</template>

<style>
/* 编译前显示加载动画 */
[v-cloak] {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

[v-cloak]::after {
  content: '加载中...';
  font-size: 18px;
  color: #666;
}
</style>
```

### 3. 按组件单独控制

```vue
<template>
  <div>
    <!-- 正常渲染的导航栏（不使用 v-cloak） -->
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>

    <!-- 异步数据加载的组件使用 v-cloak -->
    <div v-cloak>
      <h2>{{ article.title }}</h2>
      <p>{{ article.content }}</p>
    </div>
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'

const article = ref({ title: '', content: '' })

onMounted(async () => {
  article.value = await fetchArticle()
})
</script>
```

### 4. 配合骨架屏

```vue
<template>
  <div>
    <!-- 骨架屏：编译前通过 CSS 显示 -->
    <div class="skeleton" v-cloak>
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>

    <!-- 真实内容：编译后显示 -->
    <div class="content" v-if="loaded">
      <h2>{{ data.title }}</h2>
      <p>{{ data.description }}</p>
    </div>
  </div>
</template>

<style>
/* 编译前隐藏，但骨架屏通过伪元素展示 */
[v-cloak] {
  visibility: hidden;
  position: relative;
}

[v-cloak]::before {
  content: '';
  visibility: visible;
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-title,
.skeleton-text {
  height: 16px;
  margin-bottom: 12px;
  background: #e8e8e8;
  border-radius: 4px;
}

.skeleton-title {
  width: 60%;
  height: 24px;
}

.skeleton-text.short {
  width: 40%;
}
</style>
```

### 5. 过渡效果

```vue
<template>
  <div v-cloak class="app-container">
    <h1>{{ pageTitle }}</h1>
    <p>{{ pageContent }}</p>
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}

/* 编译后淡入显示 */
.app-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
```

### 6. 多实例场景

```html
<head>
  <style>
    [v-cloak] { display: none; }
  </style>
</head>
<body>
  <!-- 页面中有多个 Vue 实例 -->
  <div id="header-app" v-cloak>
    {{ headerTitle }}
  </div>

  <div id="main-app" v-cloak>
    {{ mainContent }}
  </div>

  <div id="footer-app" v-cloak>
    {{ footerText }}
  </div>
</body>
```

## 注意事项

### 1. CSS 必须手动定义

```vue
<!-- ⚠️ 只添加 v-cloak 属性不会自动隐藏元素，必须配合 CSS -->
<template>
  <div v-cloak>
    {{ message }}
  </div>
</template>

<!-- ❌ 缺少 CSS 规则，编译前仍会闪烁 -->
<!-- ✅ 必须添加： -->
<style>
[v-cloak] {
  display: none;
}
</style>
```

### 2. Vite/Webpack 开发模式下通常不需要

```javascript
// Vite 使用 ES modules，Vue 编译非常快，通常不会出现闪烁
// 但在生产环境的慢网络下仍可能出现

// vite.config.js
export default {
  build: {
    // 确保内联 CSS 以获得更快的首屏渲染
    cssCodeSplit: false
  }
}
```

### 3. 与其他指令配合

```vue
<template>
  <!-- ✅ 可以和其他指令一起使用 -->
  <div v-cloak v-if="showContent">
    {{ content }}
  </div>

  <!-- v-cloak 在 v-if 为 true 且编译完成后才会移除 -->
</template>
```

### 4. CSS 选择器优先级

```vue
<template>
  <!-- ⚠️ 如果元素有内联 display 样式，v-cloak 可能不生效 -->
  <div v-cloak style="display: flex">
    <!-- [v-cloak] { display: none } 可能被内联样式覆盖 -->
  </div>
</template>

<style>
/* ✅ 使用 !important 确保隐藏生效 */
[v-cloak] {
  display: none !important;
}
</style>
```

## 最佳实践

1. **在根元素上使用**：在 Vue 应用的根元素上添加 `v-cloak`，配合全局 CSS 防止整个页面闪烁
2. **全局 CSS 定义**：将 `[v-cloak]` 样式放在全局 CSS 中，确保在 Vue 编译前就已加载
3. **使用 `!important`**：如果样式优先级有问题，添加 `!important` 确保隐藏生效
4. **开发环境可忽略**：Vite 等现代构建工具的开发模式下通常不需要，但生产环境建议保留
5. **配合加载动画**：可以使用 CSS 伪元素在 `v-cloak` 存在时显示加载状态
