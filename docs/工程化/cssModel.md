# CSS Modules 在项目中的使用

## 简介

**CSS Modules** 是一种 CSS 模块化方案，通过自动生成唯一的类名来解决 CSS 全局污染问题。

```
传统 CSS：
.btn { color: red; }     // 全局污染，可能覆盖其他样式

CSS Modules：
.btn { color: red; }     // 编译后：.Button_btn__abc { color: red; }
                          // 类名唯一，不会冲突
```

## 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                   CSS Modules 工作流程                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  源文件                    编译过程                      输出        │
│  ┌─────────────┐         ┌──────────────┐    ┌──────────────┐  │
│  │ Button.css  │ ──────> │ CSS Modules  │ ─> │ Button.css   │  │
│  │ .btn        │         │   处理器       │    │ .btn__abc12  │  │
│  │ .title      │         └──────────────┘    │ .title__def34│  │
│  └─────────────┘                          └──────────────┘  │
│                                                         │
│  ┌─────────────┐         ┌──────────────┐    ┌──────────────┐  │
│  │ Button.vue  │ ──────> │  映射生成     │ ─> │ $style.btn   │  │
│  │ $style.btn  │         │              │    │              │  │
│  └─────────────┘         └──────────────┘    └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 快速开始

### 1. 基本配置

#### Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  css: {
    modules: {
      // CSS Modules 配置
      scopeBehaviour: 'local',     // 'local' 或 'global'
      globalModulePaths: [],        // 全局模块路径
      generateScopedName: '[name]__[local]__[hash:base64:5]',
      hashPrefix: 'prefix',
      localsConvention: 'camelCase' // 转换为驼峰命名
    }
  }
});
```

#### Vue CLI 配置

```javascript
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      css: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]'
        }
      },
      scss: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]'
        }
      }
    }
  }
};
```

### 2. 命名规范

```
文件命名：
├── Button.module.css     ✅ 推荐：使用 .module.css 后缀
├── button.css            ❌ 不推荐：无法识别为 CSS Modules
└── styles.module.scss    ✅ 支持 Sass/SCSS

类命名：
.button        ✅ 推荐：小写，连字符
.btn-primary   ✅ 推荐：BEM 风格
.buttonText    ✅ 推荐：驼峰（配置 camelCase 后）
```

## Vue 中使用

### Vue 3 基础用法

```vue
<!-- Button.vue -->
<template>
  <button
    :class="[
      $style.button,
      variant === 'primary' && $style.primary,
      variant === 'secondary' && $style.secondary,
      size === 'large' && $style.large,
      size === 'small' && $style.small
    ]"
  >
    {{ text }}
  </button>
</template>

<style module>
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background: #2563eb;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background: #10b981;
}

.primary:hover {
  background: #059669;
}

.secondary {
  background: #6b7280;
}

.secondary:hover {
  background: #4b5563;
}

.large {
  padding: 15px 30px;
  font-size: 16px;
}

.small {
  padding: 5px 10px;
  font-size: 12px;
}
</style>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Button'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});
</script>
```

### 使用外部 CSS Module 文件

```vue
<!-- Card.vue -->
<template>
  <div :class="styles.card">
    <div :class="styles.header">
      <h3 :class="styles.title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>
    <div :class="styles.body">
      <slot></slot>
    </div>
    <div :class="styles.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import styles from './Card.module.css';

defineProps({
  title: String
});
</script>
```

```css
/* Card.module.css */
.card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 15px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.body {
  min-height: 50px;
}

.footer {
  padding: 10px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 15px;
}
```

### 使用 composes 组合样式

```css
/* Base.module.css - 基础样式 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-base {
  padding: 20px;
  border-radius: 8px;
  background: white;
}
```

```css
/* Card.module.css - 使用 composes 继承 */
.card {
  composes: card-base from './Base.module.css';
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cardHeader {
  composes: flex-between from './Base.module.css';
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}
```

### 使用计算属性优化类名

```vue
<template>
  <button :class="buttonClass">
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from 'vue';
import styles from './Button.module.css';

const props = defineProps({
  text: String,
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'medium'
  },
  disabled: Boolean
});

const buttonClass = computed(() => {
  return [
    styles.button,
    styles[`variant-${props.variant}`],
    styles[`size-${props.size}`],
    props.disabled && styles.disabled
  ].filter(Boolean).join(' ');
});
</script>
```

```css
/* Button.module.css */
.button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }

.variant-default { background: #3b82f6; color: white; }
.variant-primary { background: #10b981; color: white; }
.variant-danger { background: #ef4444; color: white; }

.size-small { padding: 5px 10px; font-size: 12px; }
.size-medium { padding: 10px 20px; font-size: 14px; }
.size-large { padding: 15px 30px; font-size: 16px; }

.disabled { opacity: 0.5; cursor: not-allowed; }
```

### 使用 clsx 或 classnames

```bash
npm install clsx
```

```vue
<template>
  <button :class="buttonClass">
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from 'vue';
import clsx from 'clsx';
import styles from './Button.module.css';

const props = defineProps({
  text: String,
  variant: String,
  size: String,
  block: Boolean,
  loading: Boolean
});

const buttonClass = computed(() => {
  return clsx(
    styles.button,
    styles[`variant-${props.variant}`],
    styles[`size-${props.size}`],
    props.block && styles.block,
    props.loading && styles.loading
  );
});
</script>
```

## 高级用法

### 1. 自定义类名生成

```javascript
// vite.config.js
export default defineConfig({
  css: {
    modules: {
      generateScopedName(name, filename, css) {
        if (process.env.NODE_ENV === 'development') {
          // 开发环境：保留文件名和类名，便于调试
          return `${name}__${local}__${hash.substring(0, 5)}`;
        }
        // 生产环境：更短的哈希
        return `${hash.substring(0, 8)}`;
      }
    }
  }
});
```

### 2. 全局样式 :global()

```css
/* Button.module.css */

/* 定义全局样式 */
:global {
  .reset-btn {
    padding: 0;
    border: none;
    background: none;
  }
}

/* 特定选择器使用全局 */
.container :global(.third-party-btn) {
  width: 100%;
}

/* :local() 强制局部（默认行为） */
:local(.localButton) {
  color: red;
}
```

### 3. Sass/SCSS 支持

```scss
/* Button.module.scss */
$primary-color: #3b82f6;
$hover-color: #2563eb;
$danger-color: #ef4444;

$spacing: (
  small: 5px 10px,
  medium: 10px 20px,
  large: 15px 30px
);

.button {
  padding: map-get($spacing, medium);
  border: none;
  border-radius: 4px;
  background: $primary-color;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: $hover-color;
  }

  &:active {
    transform: scale(0.98);
  }

  &.primary {
    background: #10b981;

    &:hover {
      background: #059669;
    }
  }

  &.danger {
    background: $danger-color;

    &:hover {
      background: #dc2626;
    }
  }

  &.large {
    padding: map-get($spacing, large);
    font-size: 16px;
  }

  &.small {
    padding: map-get($spacing, small);
    font-size: 12px;
  }
}
```

### 4. CSS 变量配合

```css
/* variables.module.css */
:root {
  /* 颜色 */
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --success-color: #10b981;
  --danger-color: #ef4444;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

```css
/* Button.module.css */
@import './variables.module.css';

.button {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.button:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-md);
}
```

### 5. 主题切换

```vue
<!-- ThemedButton.vue -->
<template>
  <button :class="themeStyles.button">
    {{ text }}
  </button>
</template>

<script setup>
import { computed, inject } from 'vue';
import lightStyles from './Button.light.module.css';
import darkStyles from './Button.dark.module.css';

const props = defineProps({
  text: String
});

const theme = inject('theme', 'light');

const themeStyles = computed(() => {
  return theme.value === 'dark' ? darkStyles : lightStyles;
});
</script>
```

```css
/* Button.light.module.css */
.button {
  background: #3b82f6;
  color: white;
}
```

```css
/* Button.dark.module.css */
.button {
  background: #1f2937;
  color: #f9fafb;
}
```

```javascript
// main.js - 提供主题
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.provide('theme', 'light'); // 或从 localStorage 读取
app.mount('#app');
```

### 6. 动态导入

```vue
<script setup>
import { ref, onMounted } from 'vue';

const styles = ref(null);
const loading = ref(true);

onMounted(async () => {
  // 动态加载样式
  const stylesModule = await import('./HeavyComponent.module.css');
  styles.value = stylesModule.default;
  loading.value = false;
});
</script>

<template>
  <div v-if="!loading" :class="styles.container">
    <!-- 内容 -->
  </div>
</template>
```

## 实际项目结构

```
src/
├── assets/
│   ├── styles/
│   │   ├── variables.module.css    # CSS 变量
│   │   ├── mixins.module.scss      # Sass mixins
│   │   ├── global.css              # 全局样式（非 module）
│   │   └── reset.css               # CSS 重置
│   └── images/
├── components/
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.module.scss
│   │   └── index.js
│   ├── Card/
│   │   ├── Card.vue
│   │   ├── Card.module.css
│   │   └── index.js
│   ├── Form/
│   │   ├── Input/
│   │   │   ├── Input.vue
│   │   │   └── Input.module.css
│   │   └── Select/
│   │       ├── Select.vue
│   │       └── Select.module.css
│   └── layout/
│       ├── Header/
│       │   ├── Header.vue
│       │   └── Header.module.css
│       └── Footer/
│           ├── Footer.vue
│           └── Footer.module.css
└── views/
    ├── Home/
    │   ├── Home.vue
    │   └── Home.module.css
    └── About/
        ├── About.vue
        └── About.module.css
```

## 最佳实践

### 1. 组件样式隔离

```vue
<!-- ✅ 推荐：每个组件有自己的样式文件 -->
<!-- Button.vue -->
<style module src="./Button.module.css"></style>

<!-- ❌ 不推荐：多个组件共享一个样式文件 -->
<!-- components/common.module.css -->
```

### 2. BEM 命名结合

```css
/* Card.module.css */
.card {           /* Block */
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.card__header {   /* Element */
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.card__title {    /* Element */
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.card__body {     /* Element */
  padding: 15px 0;
}

.card__footer {   /* Element */
  padding: 10px 0;
  border-top: 1px solid #e5e7eb;
}

.card--large {    /* Modifier */
  padding: 30px;
}

.card--dark {     /* Modifier */
  background: #1f2937;
  color: white;
}

.card--bordered { /* Modifier */
  border: 1px solid #e5e7eb;
}
```

```vue
<template>
  <div :class="[
    styles.card,
    size === 'large' && styles['card--large'],
    theme === 'dark' && styles['card--dark']
  ]">
    <div :class="styles.card__header">
      <h3 :class="styles.card__title">{{ title }}</h3>
    </div>
    <div :class="styles.card__body">
      <slot></slot>
    </div>
  </div>
</template>
```

### 3. 响应式设计

```css
/* Grid.module.css */
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 移动优先的容器 */
.container {
  width: 100%;
  padding: 0 16px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}
```

### 4. 可复用基础样式

```css
/* Base.module.css - 基础工具样式 */
/* 布局 */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }

/* Flex 对齐 */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

/* 文本 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* 间距 */
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 16px; }
.mt-4 { margin-top: 24px; }

.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 16px; }
.mb-4 { margin-bottom: 24px; }

.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-3 { padding: 16px; }
.p-4 { padding: 24px; }

/* 显示/隐藏 */
.hidden { display: none; }
.visible { visibility: visible; }
.invisible { visibility: hidden; }
```

```css
/* Component.module.css */
.container {
  composes: flex-center from './Base.module.css';
  height: 100vh;
}
```

### 5. TypeScript 类型支持

```typescript
// src/shims-css-modules.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}
```

```vue
<!-- Button.vue -->
<script setup lang="ts">
import styles from './Button.module.css';

interface ButtonProps {
  text: string;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'medium'
});

// IDE 会提示可用的类名
const buttonClass = styles.button;
</script>
```

## 调试技巧

### 1. 查看生成的类名

```vue
<script setup>
import styles from './Button.module.css';

// 开发环境打印样式映射
if (import.meta.env.DEV) {
  console.log('CSS Modules mapping:', styles);
  // { button: 'Button_button__abc', primary: 'Button_primary__def' }
}
</script>
```

### 2. 可读的类名（开发环境）

```javascript
// vite.config.js
export default defineConfig({
  css: {
    modules: {
      generateScopedName: 'development' === process.env.NODE_ENV
        ? '[name]__[local]__[hash:base64:5]'
        : '[hash:base64:8]'
    }
  }
});
```

### 3. Source Map 支持

```javascript
// vite.config.js
export default defineConfig({
  css: {
    devSourcemap: true
  }
});
```

## 与其他方案对比

| 特性 | CSS Modules | Scoped CSS | Tailwind CSS |
|------|-------------|------------|--------------|
| 学习曲线 | 低 | 低 | 中 |
| 运行时开销 | 无 | 有（data 属性） | 无 |
| 类型支持 | 需配置 | 需配置 | 原生 |
| 样式隔离 | 是 | 是 | 否 |
| 动态样式 | 中 | 弱 | 强 |
| 构建大小 | 小 | 小 | 小 |
| 适用场景 | 中大型项目 | Vue 项目 | 任意项目 |

## 常见问题

### 1. 类名无法覆盖子组件

```css
/* 使用 :global() 或深度选择器 */
/* Vue 3 */
:deep(.child-class) {
  color: red;
}

/* 或使用 :global() */
.parent :global(.child-class) {
  color: red;
}
```

### 2. 第三方库样式覆盖

```vue
<!-- 方式一：全局样式覆盖 -->
<!-- main.js -->
import './styles/overrides.css';
```

```css
/* styles/overrides.css */
.third-party-component .btn {
  background: #3b82f6 !important;
}
```

```vue
<!-- 方式二：使用 :global() -->
<style module>
.container :global(.third-party-btn) {
  background: #3b82f6;
}
</style>
```

### 3. 动态类名处理

```vue
<template>
  <!-- ❌ 不推荐：字符串拼接 -->
  <div :class="$style.container + ' ' + (isActive ? $style.active : '')">

  <!-- ✅ 推荐：数组语法 -->
  <div :class="[$style.container, isActive && $style.active]">

  <!-- ✅ 推荐：对象语法 -->
  <div :class="{ [$style.container]: true, [$style.active]: isActive }">

  <!-- ✅ 推荐：使用工具函数 -->
  <div :class="classNames($style.container, isActive && $style.active)">
</template>

<script setup>
import { classNames } from '@/utils/classNames';
</script>
```

### 4. vite 中 .vue 文件的 module 样式

```vue
<!-- 单文件组件中使用 module -->
<style module>
.local {
  color: red;
}
</style>

<!-- 使用自定义名称 -->
<style module="custom">
.local {
  color: blue;
}
</style>

<template>
  <div :class="$style.local">      <!-- 第一个 -->
  <div :class="custom.local">     <!-- 第二个 -->
</template>
```

## 参考链接

- [CSS Modules 官方规范](https://github.com/css-modules/css-modules)
- [Vite CSS Modules 配置](https://vitejs.dev/guide/features.html#css-modules)
- [Vue Scoped CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css)
- [PostCSS Modules](https://github.com/css-modules/postcss-modules)
