# v-cloak

> 📖 [Vue 官方文档 - v-cloak](https://cn.vuejs.org/api/built-in-directives#v-cloak)

---

### 一、概述

`v-cloak` 是 Vue 提供的一个内置指令，它会在关联的组件实例**编译完成之前**保留在 DOM 元素上，编译完成后**自动移除**。

它的核心作用是解决一个常见的前端体验问题 —— **模板闪烁（FOUC，Flash of Uncompiled Content）**。当页面加载时，用户可能会短暂地看到原始的 `{{ message }}` 模板语法，而不是渲染后的真实数据。`v-cloak` 配合 CSS 选择器 `[v-cloak] { display: none }`，可以在 Vue 完成编译之前隐藏未编译的模板，编译完成后自动显示渲染好的内容，从而避免用户看到闪烁过程。

简单来说，`v-cloak` 就像是给 Vue 应用加了一层"遮罩"，在准备工作做好之前不让用户看到未完成的页面。

---

### 二、核心原理

`v-cloak` 的工作流程可以概括为以下三个阶段：

```
阶段 1：页面加载
  → 浏览器解析 HTML，此时 {{ message }} 只是纯文本
  → v-cloak 属性存在于元素上
  → CSS [v-cloak] { display: none } 生效 → 元素被隐藏

阶段 2：Vue 编译
  → Vue 接管 DOM，解析模板语法
  → 将 {{ message }} 替换为真实的响应式数据
  → 绑定事件、处理指令

阶段 3：编译完成
  → Vue 自动移除 v-cloak 属性
  → CSS [v-cloak] 规则不再生效
  → 元素以编译后的正确内容显示出来
```

其本质是利用了 **CSS 属性选择器** `[v-cloak]` 和 Vue 的 **编译生命周期**之间的时间差来实现隐藏与显示的无缝切换。

> 💡 **提示：** `v-cloak` 不需要表达式，它是一个"无值指令"，直接写 `v-cloak` 即可。

---

### 三、详细用法

#### 1. 基本用法

最简单的用法是在根元素上添加 `v-cloak` 指令，并在 CSS 中定义 `[v-cloak]` 的隐藏样式。

```vue
<template>
  <!-- 在根元素上添加 v-cloak -->
  <div v-cloak>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>

<style>
/* 编译完成前隐藏所有带 v-cloak 的元素 */
[v-cloak] {
  display: none;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref<string>('欢迎使用 Vue 3')
const content = ref<string>('这是一段示例内容')
</script>
```

在非 SFC（单文件组件）场景下，通常在 `index.html` 中使用：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>v-cloak 示例</title>
  <!-- 关键：CSS 必须在 Vue 编译前加载 -->
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
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### 2. 进阶用法

**（1）配合加载动画**

不只是隐藏，还可以在编译前展示加载状态，提升用户体验。

```vue
<template>
  <div v-cloak id="app">
    <header>{{ siteName }}</header>
    <main>{{ pageContent }}</main>
  </div>
</template>

<style>
/* 编译前隐藏内容，同时通过伪元素显示加载提示 */
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

<script setup lang="ts">
import { ref } from 'vue'

const siteName = ref<string>('我的网站')
const pageContent = ref<string>('页面内容')
</script>
```

**（2）配合骨架屏**

在编译前展示骨架屏占位效果，编译完成后自动切换为真实内容。

```vue
<template>
  <div>
    <!-- 骨架屏容器：编译前可见，编译后隐藏 -->
    <div class="skeleton" v-cloak>
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>

    <!-- 真实内容：编译完成后显示 -->
    <div class="content" v-if="loaded">
      <h2>{{ data.title }}</h2>
      <p>{{ data.description }}</p>
    </div>
  </div>
</template>

<style>
[v-cloak] {
  visibility: hidden;
  position: relative;
}

/* 编译前通过伪元素展示骨架动画 */
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

.skeleton-title {
  width: 60%;
  height: 24px;
  margin-bottom: 12px;
  background: #e8e8e8;
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 12px;
  background: #e8e8e8;
  border-radius: 4px;
}

.skeleton-text.short {
  width: 40%;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ArticleData {
  title: string
  description: string
}

const loaded = ref<boolean>(false)
const data = ref<ArticleData>({ title: '', description: '' })

onMounted(async () => {
  // 模拟异步数据加载
  await new Promise(resolve => setTimeout(resolve, 1000))
  data.value = { title: '文章标题', description: '文章描述内容' }
  loaded.value = true
})
</script>
```

**（3）配合淡入过渡效果**

编译完成后加入淡入动画，让页面显示更加平滑。

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

/* 编译完成后触发淡入动画 */
.app-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const pageTitle = ref<string>('页面标题')
const pageContent = ref<string>('页面内容')
</script>
```

**（4）按组件粒度单独控制**

不同区域可以分别使用 `v-cloak`，让不需要等待的部分先显示。

```vue
<template>
  <div>
    <!-- 导航栏不需要 v-cloak，可以立即显示 -->
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>

    <!-- 需要异步数据的区域使用 v-cloak -->
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Article {
  title: string
  content: string
}

const article = ref<Article>({ title: '', content: '' })

onMounted(async () => {
  const res = await fetch('/api/article')
  article.value = await res.json()
})
</script>
```

#### 3. API 参数说明

| 属性 | 说明 |
|------|------|
| **指令名称** | `v-cloak` |
| **是否需要表达式** | 否，直接使用 `v-cloak`，不需要绑定任何值 |
| **作用范围** | 挂载该指令的元素及其所有子元素 |
| **移除时机** | 关联的组件实例编译完成后自动移除 |
| **配合 CSS** | 必须手动添加 `[v-cloak] { display: none }` 等 CSS 规则 |
| **Vue 3 变化** | 与 Vue 2 行为一致，无重大变更 |

---

### 四、实现效果

使用 `v-cloak` 前后的对比效果：

**未使用 v-cloak 时的时间线：**

```
0ms    → 页面加载，用户看到原始模板语法：{{ title }}、{{ content }}
50ms   → Vue 开始编译
100ms  → 编译完成，模板语法被替换为真实数据
```

用户体验：短暂看到了 `{{ title }}` 闪了一下然后变成真实文字，产生"闪烁"。

**使用 v-cloak 后的时间线：**

```
0ms    → 页面加载，v-cloak 属性存在，CSS 隐藏生效，用户看到空白（或加载动画）
50ms   → Vue 开始编译，用户仍然看不到未编译内容
100ms  → 编译完成，v-cloak 被移除，用户直接看到渲染好的页面
```

用户体验：页面从空白/加载状态直接切换为完整渲染后的内容，无闪烁。

```vue
<!-- ❌ 未使用 v-cloak：用户可能看到闪烁 -->
<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>

<!-- ✅ 使用 v-cloak：编译前隐藏，编译后平滑显示 -->
<template>
  <div v-cloak>
    <h1>{{ title }}</h1>
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}
</style>
```

---

### 五、使用场景

#### 1. SPA 应用根元素防闪烁

在单页应用的入口 HTML 中，对根元素使用 `v-cloak` 防止整个页面闪烁。

```html
<!-- index.html -->
<head>
  <style>
    [v-cloak] { display: none; }
  </style>
</head>
<body>
  <div id="app" v-cloak>
    <router-view />
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

#### 2. 异步数据加载区域

当某个区域依赖异步接口数据时，使用 `v-cloak` 避免数据加载前显示空模板。

```vue
<template>
  <div v-cloak>
    <div v-for="item in list" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<style>
[v-cloak] { display: none; }
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ListItem {
  id: number
  name: string
}

const list = ref<ListItem[]>([])

onMounted(async () => {
  const res = await fetch('/api/list')
  list.value = await res.json()
})
</script>
```

#### 3. SSR 客户端激活阶段

在 SSR（服务端渲染）的客户端激活阶段，避免重复渲染造成的闪烁。

```html
<!-- index.html -->
<div id="app" v-cloak>
  <!-- SSR 输出的内容 -->
</div>
```

```css
/* 全局样式 */
[v-cloak] {
  display: none;
}
```

#### 4. 多 Vue 实例页面

当一个页面中存在多个独立的 Vue 实例时，为每个实例单独添加 `v-cloak`。

```html
<head>
  <style>
    [v-cloak] { display: none; }
  </style>
</head>
<body>
  <header id="header-app" v-cloak>
    {{ headerTitle }}
  </header>

  <main id="main-app" v-cloak>
    {{ mainContent }}
  </main>

  <footer id="footer-app" v-cloak>
    {{ footerText }}
  </footer>

  <script type="module" src="/src/main.ts"></script>
</body>
```

```ts
// main.ts
import { createApp, ref } from 'vue'

// 创建多个独立实例
createApp({ setup() { return { headerTitle: ref('网站标题') } } }).mount('#header-app')
createApp({ setup() { return { mainContent: ref('主要内容') } } }).mount('#main-app')
createApp({ setup() { return { footerText: ref('页脚信息') } } }).mount('#footer-app')
```

#### 5. 加载中提示效果

利用 CSS 伪元素在编译前显示加载提示文字或动画。

```vue
<template>
  <div v-cloak class="app-wrapper">
    <h1>{{ pageTitle }}</h1>
    <p>{{ pageContent }}</p>
  </div>
</template>

<style>
[v-cloak] {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

[v-cloak]::after {
  content: '正在加载，请稍候...';
  font-size: 16px;
  color: #999;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const pageTitle = ref<string>('页面标题')
const pageContent = ref<string>('页面内容')
</script>
```

#### 6. 表单页面防闪烁

表单中的默认值或动态选项在编译前可能显示为模板语法，使用 `v-cloak` 避免闪烁。

```vue
<template>
  <form v-cloak @submit.prevent="handleSubmit">
    <label>用户名：{{ defaultName }}</label>
    <select v-model="selectedOption">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <button type="submit">提交</button>
  </form>
</template>

<style>
[v-cloak] { display: none; }
</style>

<script setup lang="ts">
import { ref } from 'vue'

interface Option {
  value: string
  label: string
}

const defaultName = ref<string>('请输入用户名')
const selectedOption = ref<string>('')
const options = ref<Option[]>([
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
])

const handleSubmit = (): void => {
  console.log('提交表单', selectedOption.value)
}
</script>
```

#### 7. 配合 CSS 过渡动画

编译完成后添加淡入、滑入等过渡动画效果，提升视觉体验。

```vue
<template>
  <div v-cloak class="fade-in">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}

.fade-in {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref<string>('欢迎')
const description = ref<string>('这是一个带淡入效果的应用')
</script>
```

#### 8. CDN 引入 Vue 的场景

通过 CDN 直接在 HTML 中使用 Vue 时，网络延迟可能导致 Vue 加载较慢，此时 `v-cloak` 尤为重要。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>CDN 引入 Vue</title>
  <style>
    [v-cloak] {
      display: none;
    }
  </style>
</head>
<body>
  <div id="app" v-cloak>
    <h1>{{ message }}</h1>
    <button @click="count++">点击了 {{ count }} 次</button>
  </div>

  <!-- CDN 引入 Vue，可能存在网络延迟 -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script>
    const { createApp, ref } = Vue
    createApp({
      setup() {
        const message = ref('Hello Vue 3')
        const count = ref(0)
        return { message, count }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

#### 9. 电商商品详情页

商品详情页通常包含大量动态数据（价格、库存、评价等），使用 `v-cloak` 避免数据加载前显示空白或模板语法。

```vue
<template>
  <div v-cloak class="product-detail">
    <h1>{{ product.name }}</h1>
    <p class="price">¥{{ product.price }}</p>
    <p class="stock">库存：{{ product.stock }} 件</p>
    <p class="rating">评分：{{ product.rating }} / 5</p>
    <button @click="addToCart" :disabled="product.stock === 0">
      {{ product.stock > 0 ? '加入购物车' : '已售罄' }}
    </button>
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  name: string
  price: number
  stock: number
  rating: number
}

const product = ref<Product>({ name: '', price: 0, stock: 0, rating: 0 })

onMounted(async () => {
  const res = await fetch('/api/product/123')
  product.value = await res.json()
})

const addToCart = (): void => {
  console.log('添加到购物车', product.value.name)
}
</script>
```

---

### 六、注意事项

#### 1. CSS 规则必须手动定义

`v-cloak` 指令本身不会隐藏元素，它只是在编译完成后移除属性。隐藏效果完全依赖 CSS。

```vue
<!-- ❌ 只加了 v-cloak 但没有 CSS，编译前仍会闪烁 -->
<template>
  <div v-cloak>
    {{ message }}
  </div>
</template>

<!-- ✅ 必须配合 CSS 规则 -->
<template>
  <div v-cloak>
    {{ message }}
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}
</style>
```

#### 2. CSS 必须在 Vue 编译前加载

`[v-cloak]` 的 CSS 规则必须在 Vue 接管 DOM 之前就已经生效，否则仍然会出现短暂的闪烁。

```html
<!-- ❌ CSS 写在 Vue 脚本之后，可能来不及生效 -->
<head>
  <script type="module" src="/src/main.ts"></script>
</head>
<body>
  <div id="app" v-cloak>{{ msg }}</div>
  <style>
    [v-cloak] { display: none; }
  </style>
</body>

<!-- ✅ CSS 写在 <head> 中，确保最先加载 -->
<head>
  <style>
    [v-cloak] { display: none; }
  </style>
</head>
<body>
  <div id="app" v-cloak>{{ msg }}</div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

#### 3. 注意内联样式的优先级问题

如果元素有内联 `display` 样式，`[v-cloak] { display: none }` 可能被覆盖。

```vue
<!-- ❌ 内联 style 优先级高于属性选择器，隐藏可能不生效 -->
<template>
  <div v-cloak style="display: flex">
    {{ content }}
  </div>
</template>

<!-- ✅ 使用 !important 确保隐藏优先级最高 -->
<style>
[v-cloak] {
  display: none !important;
}
</style>
```

#### 4. Vite 开发模式下通常感知不明显

在 Vite 开发模式下，由于使用 ES Modules 和 HMR，Vue 编译速度非常快，闪烁通常不明显。但在**生产环境的慢网络**下，用户可能会经历较长的加载时间，此时 `v-cloak` 就非常重要。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // 关闭 CSS 代码分割，确保首屏 CSS 更快加载
    cssCodeSplit: false,
  },
})
```

#### 5. 可以与其他指令同时使用

`v-cloak` 不影响其他指令的功能，可以与 `v-if`、`v-for`、`v-model` 等自由组合。

```vue
<template>
  <!-- ✅ v-cloak 与 v-if 同时使用 -->
  <div v-cloak v-if="isLoaded">
    <p v-for="item in items" :key="item.id">{{ item.name }}</p>
  </div>
</template>
```

#### 6. 不需要表达式

`v-cloak` 是一个无值指令，不需要也不能绑定表达式。

```vue
<!-- ❌ 错误：v-cloak 不需要赋值 -->
<div v-cloak="true"></div>
<div v-cloak="isLoaded"></div>

<!-- ✅ 正确：直接使用即可 -->
<div v-cloak></div>
```

#### 7. 在 SFC 中建议放在根元素上

在单文件组件中，建议将 `v-cloak` 放在模板的根元素上，而不是每个子元素上，以简化管理。

```vue
<!-- ❌ 不推荐：每个子元素都加 v-cloak -->
<template>
  <div>
    <h1 v-cloak>{{ title }}</h1>
    <p v-cloak>{{ content }}</p>
  </div>
</template>

<!-- ✅ 推荐：在根元素上加一次即可 -->
<template>
  <div v-cloak>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>
```

#### 8. 全局 CSS 和局部 CSS 的区别

`[v-cloak]` 规则建议放在**全局 CSS** 中（如 `index.html` 的 `<style>` 或 `src/style.css`），因为如果在 `<style scoped>` 中定义，可能由于作用域限制导致选择器不匹配。

```vue
<!-- ❌ scoped 样式中定义可能不生效 -->
<style scoped>
[v-cloak] {
  display: none;
}
</style>

<!-- ✅ 在全局样式中定义 -->
<style>
[v-cloak] {
  display: none;
}
</style>
```

#### 9. CDN 引入场景下尤其重要

当通过 CDN 引入 Vue 时，Vue 脚本的下载和执行可能存在明显延迟，用户在此期间会看到原始模板语法。此时 `v-cloak` 是必要的。

```html
<!-- CDN 场景下必须使用 v-cloak -->
<head>
  <style>
    [v-cloak] { display: none; }
  </style>
</head>
<body>
  <div id="app" v-cloak>
    {{ message }}
  </div>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</body>
```

#### 10. 不适用于已编译的模板

在 Vue 单文件组件（SFC）经过 Vite/Webpack 构建后，模板会被预编译为渲染函数，不存在运行时编译的过程，因此 `v-cloak` 在纯 SFC 场景中的作用有限。但在 `index.html` 中使用、或者通过 CDN 引入时，`v-cloak` 依然有意义。

> ⚠️ **注意：** 如果你的应用完全由 SFC 构成，且不需要在 `index.html` 中写模板语法，那么 `v-cloak` 可能并非必需。但对于包含动态内容的入口 HTML，仍然建议保留。

---

### 七、相关 API 对比

| 特性 | `v-cloak` | `v-if` | `v-show` |
|------|-----------|--------|----------|
| **作用** | 编译前隐藏未编译模板 | 条件渲染（销毁/重建 DOM） | 条件显示（切换 display） |
| **是否需要表达式** | 否 | 是 | 是 |
| **隐藏方式** | CSS 属性选择器 | 不渲染 DOM | `display: none` |
| **移除时机** | 编译完成后自动移除 | 条件为 true 时渲染 | 条件为 true 时显示 |
| **适用场景** | 防止模板闪烁 | 条件展示/隐藏 | 频繁切换显示/隐藏 |
| **需要配合 CSS** | 是 | 否 | 否 |

> 💡 **提示：** `v-cloak` 和 `v-show` 虽然都能控制显示隐藏，但本质不同。`v-cloak` 是编译前的临时隐藏策略，`v-show` 是运行时的条件显示控制，两者适用于完全不同的场景。

---

### 八、总结

`v-cloak` 是 Vue 提供的一个简单但实用的内置指令，它的核心价值在于解决**模板闪烁**问题，提升用户的首屏体验。使用要点如下：

1. **始终配合 CSS**：`[v-cloak] { display: none }` 是必须的，没有 CSS 规则 `v-cloak` 无法发挥作用
2. **放在合适的位置**：通常放在 Vue 应用的根元素上
3. **CSS 提前加载**：确保 `[v-cloak]` 的 CSS 在 Vue 编译之前就已生效
4. **注意优先级**：遇到内联样式冲突时使用 `!important`
5. **CDN 场景必备**：通过 CDN 引入 Vue 时，`v-cloak` 是防止闪烁的关键手段
6. **现代构建工具下仍有价值**：虽然 Vite 开发模式下闪烁不明显，但在生产环境慢网络下仍然有效

掌握 `v-cloak` 的正确使用方式，可以确保你的 Vue 应用在任何网络条件下都能给用户呈现干净、无闪烁的页面体验。
