### useCssVars

> 📖 [官方文档 - useCssVars](https://cn.vuejs.org/api/sfc-css-features.html#usecssvars)

### 一、概述

`useCssVars` 是 Vue 3 提供的一个组合式 API，用于在**非单文件组件（non-SFC）**场景下，将响应式数据绑定到 CSS 自定义属性（CSS Variables）。它的作用与 `<style>` 中的 `v-bind()` CSS 函数等价，但适用于 `render` 函数或 JSX 等非 SFC 环境。

简单来说：当你不在 `.vue` 单文件组件中写模板和样式，而是使用 `setup` 函数 + `render` 函数（或 `.tsx` 文件）来构建组件时，你无法使用 `<style>` 块中的 `v-bind()` 语法。此时 `useCssVars` 就是你的最佳选择——它将响应式 JavaScript 变量与 CSS 变量桥接起来，使得 CSS 可以消费 Vue 的响应式状态。

> 💡 **提示：** 如果你使用的是 `.vue` 单文件组件，通常更推荐直接在 `<style>` 中使用 `v-bind(color)`，写法更简洁。`useCssVars` 主要面向非 SFC 场景。

### 二、核心原理

`useCssVars` 的工作机制可以概括为以下步骤：

1. **创建响应式绑定**：接收一个函数，该函数返回一个键值对对象，键为 CSS 变量名（会自动加上 `--` 前缀），值为对应的响应式数据
2. **挂载时注入**：在组件挂载时，通过 `watchEffect` 监听依赖变化，将 CSS 变量以内联样式 `style` 的形式注入到组件的根元素上
3. **响应式更新**：当响应式数据变化时，自动更新对应根元素上的 CSS 变量值，从而驱动 UI 更新
4. **卸载时清理**：组件卸载时自动停止监听，清理副作用

底层实现核心逻辑（简化版）：

```ts
// 伪代码，展示 useCssVars 的核心思路
function useCssVars(getter: (ctx: any) => Record<string, string>) {
  const instance = getCurrentInstance()
  if (!instance) return

  const setVars = () => {
    const el = instance.subTree.el
    const vars = getter(instance.proxy)
    // 将变量设置到根元素的 style 上
    for (const key in vars) {
      el.style.setProperty(`--${key}`, vars[key])
    }
  }

  // 使用 watchPostEffect 在 DOM 更新后执行
  watchPostEffect(setVars)
}
```

### 三、详细用法

#### 1. 基本用法

在非 SFC 组件中，使用 `useCssVars` 将响应式数据绑定到 CSS 变量。

```ts
// MyComponent.ts
import { defineComponent, ref, useCssVars } from 'vue'

export default defineComponent({
  setup() {
    const themeColor = ref<string>('#42b983')
    const fontSize = ref<number>(16)

    // ✅ 基本用法：传入一个函数，返回 CSS 变量映射对象
    useCssVars(() => ({
      'theme-color': themeColor.value,
      'font-size': fontSize.value + 'px'
    }))

    return {
      themeColor,
      fontSize
    }
  },
  // 在 render 函数或 JSX 中，CSS 变量会自动注入到根元素
  render() {
    return (
      <div class="my-component">
        <p>Hello useCssVars</p>
      </div>
    )
  }
})
```

对应的 CSS 中就可以使用这些变量：

```css
.my-component {
  color: var(--theme-color);
  font-size: var(--font-size);
}
```

#### 2. 进阶用法

##### 2.1 使用计算属性动态计算 CSS 变量

```vue
<template>
  <div class="progress-bar">
    <div class="progress-fill"></div>
    <span>{{ progress }}%</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssVars } from 'vue'

const progress = ref<number>(60)

// ✅ 使用 computed 派生 CSS 变量值
const fillColor = computed(() => {
  if (progress.value >= 80) return '#42b983'
  if (progress.value >= 50) return '#f0ad4e'
  return '#d9534f'
})

const fillWidth = computed(() => `${progress.value}%`)

useCssVars(() => ({
  'fill-color': fillColor.value,
  'fill-width': fillWidth.value
}))
</script>

<style scoped>
.progress-bar {
  width: 300px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  width: var(--fill-width);
  height: 100%;
  background: var(--fill-color);
  transition: width 0.3s ease, background 0.3s ease;
  border-radius: 10px;
}
</style>
```

##### 2.2 多主题切换方案

```ts
// ThemeComponent.tsx
import { defineComponent, ref, reactive, useCssVars } from 'vue'

interface ThemeConfig {
  primary: string
  secondary: string
  background: string
  text: string
  border: string
}

const themes: Record<string, ThemeConfig> = {
  light: {
    primary: '#42b983',
    secondary: '#35495e',
    background: '#ffffff',
    text: '#333333',
    border: '#e0e0e0'
  },
  dark: {
    primary: '#42d392',
    secondary: '#8bd1c8',
    background: '#1a1a2e',
    text: '#e0e0e0',
    border: '#333355'
  }
}

export default defineComponent({
  setup() {
    const currentTheme = ref<string>('light')
    const theme = reactive<ThemeConfig>({ ...themes.light })

    // ✅ 响应式主题对象映射为 CSS 变量
    useCssVars(() => ({
      'theme-primary': theme.primary,
      'theme-secondary': theme.secondary,
      'theme-bg': theme.background,
      'theme-text': theme.text,
      'theme-border': theme.border
    }))

    function switchTheme(name: string) {
      currentTheme.value = name
      Object.assign(theme, themes[name])
    }

    return { currentTheme, switchTheme }
  },
  render() {
    return (
      <div class="theme-container">
        <button onClick={() => this.switchTheme('light')}>浅色主题</button>
        <button onClick={() => this.switchTheme('dark')}>深色主题</button>
        <div class="card">
          <h3>主题切换示例</h3>
          <p>当前主题：{this.currentTheme}</p>
        </div>
      </div>
    )
  }
})
```

##### 2.3 使用 scoped 选项控制作用域

```ts
import { defineComponent, ref, useCssVars } from 'vue'

export default defineComponent({
  setup() {
    const color = ref<string>('#42b983')

    // ✅ scoped: true（默认值）—— 变量仅注入到当前组件根元素
    useCssVars(() => ({
      'main-color': color.value
    }), { scoped: true })

    return { color }
  },
  render() {
    return <div class="box">Hello</div>
  }
})
```

```ts
import { defineComponent, ref, useCssVars } from 'vue'

export default defineComponent({
  setup() {
    const color = ref<string>('#42b983')

    // ✅ scoped: false —— 变量注入到 document.documentElement（全局生效）
    useCssVars(() => ({
      'global-color': color.value
    }), { scoped: false })

    return { color }
  },
  render() {
    return <div class="box">Hello</div>
  }
})
```

##### 2.4 在 JSX / TSX 组件中使用

```tsx
// SliderComponent.tsx
import { defineComponent, ref, useCssVars } from 'vue'

export default defineComponent({
  setup() {
    const sliderValue = ref<number>(50)
    const trackColor = ref<string>('#42b983')

    useCssVars(() => ({
      'slider-value': `${sliderValue.value}%`,
      'track-color': trackColor.value
    }))

    return () => (
      <div class="slider-wrapper">
        <div class="slider-track">
          <div class="slider-thumb" />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          v-model={sliderValue.value}
        />
      </div>
    )
  }
})
```

```css
/* 全局样式或外部 CSS 文件 */
.slider-track {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  position: relative;
}

.slider-track::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: var(--slider-value);
  height: 100%;
  background: var(--track-color);
  border-radius: 3px;
  transition: width 0.1s ease;
}
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `getter` | `(ctx: ComponentPublicInstance) => Record<string, string \| number>` | 是 | 一个函数，接收组件实例 `ctx`（即 `setup` 中 `this` 的代理），返回一个对象，其键名为 CSS 变量名（不需要加 `--` 前缀），键值为对应的响应式值 |
| `options` | `{ scoped?: boolean }` | 否 | 配置选项。`scoped` 默认为 `true`，表示变量仅作用于当前组件根元素；设为 `false` 时，变量注入到 `document.documentElement`，全局生效 |

**返回值**：`void`（无返回值）

### 四、实现效果

使用 `useCssVars` 后，当响应式数据发生变化时，组件根元素上的内联 `style` 属性会自动更新对应的 CSS 变量值。

```ts
// 组件代码
const color = ref('#42b983')

useCssVars(() => ({
  'text-color': color.value
}))
```

组件挂载后，根元素的 DOM 结构效果：

```html
<!-- 颜色为 #42b983 时 -->
<div style="--text-color: #42b983;" class="my-component">
  内容
</div>

<!-- 当 color 变为 '#ff6b6b' 时，DOM 自动更新 -->
<div style="--text-color: #ff6b6b;" class="my-component">
  内容
</div>
```

```css
/* CSS 中直接消费变量 */
.my-component {
  color: var(--text-color);
  /* 当 JS 中 color 从 #42b983 变为 #ff6b6b 时， */
  /* 文字颜色自动从绿色变为红色，无需手动操作 DOM */
}
```

### 五、使用场景

#### 场景 1：非 SFC 组件（render 函数）中使用 CSS 变量

这是 `useCssVars` 最核心的使用场景——在不使用 `.vue` 文件的情况下，实现响应式 CSS 变量绑定。

```ts
// Button.ts
import { defineComponent, ref, useCssVars } from 'vue'

export default defineComponent({
  props: {
    type: {
      type: String as () => 'primary' | 'danger' | 'warning',
      default: 'primary'
    }
  },
  setup(props) {
    // ✅ 根据 props 动态设置 CSS 变量
    useCssVars(() => ({
      'btn-bg': props.type === 'primary' ? '#42b983'
        : props.type === 'danger' ? '#d9534f'
        : '#f0ad4e'
    }))

    return { props }
  },
  render() {
    return (
      <button class="custom-btn">
        {this.$slots.default?.()}
      </button>
    )
  }
})
```

```css
.custom-btn {
  background: var(--btn-bg);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

#### 场景 2：动态主题配色系统

在主题切换场景中，通过 `useCssVars` 批量注入主题变量。

```ts
// useTheme.ts
import { ref, reactive, useCssVars, type Ref } from 'vue'

interface ThemeTokens {
  primary: string
  'bg-color': string
  'text-color': string
  'border-color': string
  'shadow-color': string
}

export function useTheme(initialTheme: Ref<string>) {
  const presets: Record<string, ThemeTokens> = {
    ocean: {
      primary: '#0066cc',
      'bg-color': '#f0f8ff',
      'text-color': '#1a365d',
      'border-color': '#bee3f8',
      'shadow-color': 'rgba(0, 102, 204, 0.15)'
    },
    forest: {
      primary: '#22863a',
      'bg-color': '#f0fff4',
      'text-color': '#22543d',
      'border-color': '#c6f6d5',
      'shadow-color': 'rgba(34, 134, 58, 0.15)'
    }
  }

  const tokens = reactive<ThemeTokens>({ ...presets.ocean })

  // ✅ 将整个主题 tokens 映射为 CSS 变量
  useCssVars(() => ({ ...tokens }))

  function applyTheme(name: string) {
    initialTheme.value = name
    Object.assign(tokens, presets[name])
  }

  return { tokens, applyTheme }
}
```

#### 场景 3：可配置的间距系统

在布局组件中，允许动态调整间距、圆角等布局参数。

```vue
<template>
  <div class="layout">
    <header class="header">Header</header>
    <main class="content">
      <slot />
    </main>
    <footer class="footer">Footer</footer>
  </div>
  <div class="controls">
    <label>间距：<input v-model.number="spacing" type="range" min="0" max="32" /></label>
    <label>圆角：<input v-model.number="radius" type="range" min="0" max="24" /></label>
  </div>
</template>

<script setup lang="ts">
import { ref, useCssVars } from 'vue'

const spacing = ref<number>(16)
const radius = ref<number>(8)

// ✅ 将间距和圆角参数映射为 CSS 变量
useCssVars(() => ({
  'layout-spacing': spacing.value + 'px',
  'layout-radius': radius.value + 'px'
}))
</script>

<style scoped>
.layout {
  padding: var(--layout-spacing);
}

.header, .footer {
  padding: var(--layout-spacing);
  border-radius: var(--layout-radius);
  background: #f5f5f5;
  margin-bottom: var(--layout-spacing);
}

.content {
  padding: var(--layout-spacing);
  border-radius: var(--layout-radius);
}
</style>
```

#### 场景 4：动态渐变背景

根据用户输入动态调整渐变方向、颜色和透明度。

```vue
<template>
  <div class="gradient-container">
    <div class="gradient-preview"></div>
    <div class="controls">
      <input v-model="color1" type="color" />
      <input v-model="color2" type="color" />
      <input v-model.number="angle" type="range" min="0" max="360" />
      <span>{{ angle }}°</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssVars } from 'vue'

const color1 = ref<string>('#667eea')
const color2 = ref<string>('#764ba2')
const angle = ref<number>(135)

// ✅ 动态计算渐变值并绑定到 CSS 变量
useCssVars(() => ({
  'gradient-bg': `linear-gradient(${angle.value}deg, ${color1.value}, ${color2.value})`
}))
</script>

<style scoped>
.gradient-preview {
  width: 100%;
  height: 200px;
  background: var(--gradient-bg);
  border-radius: 12px;
  transition: background 0.3s ease;
}
</style>
```

#### 场景 5：响应式字体大小

实现用户可调节的字体大小功能，常用于无障碍（a11y）场景。

```vue
<template>
  <div class="article-container">
    <div class="font-controls">
      <button @click="decrease">A-</button>
      <span>字体大小：{{ fontSize }}px</span>
      <button @click="increase">A+</button>
    </div>
    <article class="article-content">
      <h1>文章标题</h1>
      <p>这是一段示例文章内容，字体大小可以动态调节。</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, useCssVars } from 'vue'

const MIN_SIZE = 12
const MAX_SIZE = 32
const fontSize = ref<number>(16)

useCssVars(() => ({
  'article-font-size': fontSize.value + 'px',
  'heading-font-size': (fontSize.value * 1.5) + 'px'
}))

function increase() {
  if (fontSize.value < MAX_SIZE) fontSize.value += 2
}

function decrease() {
  if (fontSize.value > MIN_SIZE) fontSize.value -= 2
}
</script>

<style scoped>
.article-content h1 {
  font-size: var(--heading-font-size);
  transition: font-size 0.2s ease;
}

.article-content p {
  font-size: var(--article-font-size);
  line-height: 1.6;
  transition: font-size 0.2s ease;
}
</style>
```

#### 场景 6：动画参数动态控制

允许用户实时调整动画的时长、延迟等参数。

```vue
<template>
  <div class="animation-demo">
    <div class="bounce-ball"></div>
    <div class="controls">
      <label>
        时长：{{ duration }}s
        <input v-model.number="duration" type="range" min="0.1" max="3" step="0.1" />
      </label>
      <label>
        延迟：{{ delay }}s
        <input v-model.number="delay" type="range" min="0" max="2" step="0.1" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useCssVars } from 'vue'

const duration = ref<number>(1)
const delay = ref<number>(0)

// ✅ 将动画参数映射为 CSS 变量，配合 transition 使用
useCssVars(() => ({
  'anim-duration': duration.value + 's',
  'anim-delay': delay.value + 's'
}))
</script>

<style scoped>
.bounce-ball {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #42b983;
  animation: bounce var(--anim-duration) var(--anim-delay) infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-80px); }
}
</style>
```

#### 场景 7：可折叠侧边栏布局

根据侧边栏展开/收起状态，动态控制布局宽度。

```vue
<template>
  <div class="app-layout">
    <aside class="sidebar">
      <nav>侧边栏导航</nav>
    </aside>
    <main class="main-content">
      <button @click="toggle">{{ collapsed ? '展开' : '收起' }}</button>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssVars } from 'vue'

const collapsed = ref<boolean>(false)
const sidebarWidth = computed(() => collapsed.value ? '0px' : '240px')
const contentMargin = computed(() => collapsed.value ? '0px' : '240px')

useCssVars(() => ({
  'sidebar-w': sidebarWidth.value,
  'content-offset': contentMargin.value
}))

function toggle() {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-w);
  transition: width 0.3s ease;
  background: #1a1a2e;
  color: white;
  overflow: hidden;
}

.main-content {
  margin-left: var(--content-offset);
  transition: margin-left 0.3s ease;
  flex: 1;
  padding: 20px;
}
</style>
```

#### 场景 8：组件库全局 Design Token 注入

在组件库中，通过 `scoped: false` 将设计令牌注入全局，实现统一的视觉规范。

```ts
// DesignTokenProvider.tsx
import { defineComponent, reactive, useCssVars } from 'vue'

interface DesignTokens {
  'color-primary': string
  'color-success': string
  'color-warning': string
  'color-danger': string
  'color-info': string
  'radius-sm': string
  'radius-md': string
  'radius-lg': string
  'shadow-sm': string
  'shadow-md': string
  'font-family': string
}

export default defineComponent({
  setup() {
    const tokens = reactive<DesignTokens>({
      'color-primary': '#42b983',
      'color-success': '#52c41a',
      'color-warning': '#faad14',
      'color-danger': '#f5222d',
      'color-info': '#1890ff',
      'radius-sm': '4px',
      'radius-md': '8px',
      'radius-lg': '12px',
      'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      'font-family': "'Inter', sans-serif"
    })

    // ✅ scoped: false 使变量全局生效
    useCssVars(() => ({ ...tokens }), { scoped: false })

    return { tokens }
  },
  render() {
    return this.$slots.default?.()
  }
})
```

```css
/* 任何组件都可以使用这些全局 Design Token */
.my-button {
  background: var(--color-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  box-shadow: var(--shadow-sm);
}
```

#### 场景 9：暗色模式适配

结合 `matchMedia` 监听系统暗色模式偏好，动态切换 CSS 变量。

```ts
// useDarkMode.ts
import { ref, watch, useCssVars } from 'vue'

export function useDarkMode() {
  const isDark = ref<boolean>(false)

  // 监听系统暗色模式偏好
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mediaQuery.matches
    mediaQuery.addEventListener('change', (e) => {
      isDark.value = e.matches
    })
  }

  // ✅ 根据暗色模式状态动态设置 CSS 变量
  useCssVars(() => ({
    'bg-color': isDark.value ? '#1a1a2e' : '#ffffff',
    'text-color': isDark.value ? '#e0e0e0' : '#333333',
    'card-bg': isDark.value ? '#16213e' : '#f5f5f5',
    'border-color': isDark.value ? '#333355' : '#e0e0e0',
    'shadow-opacity': isDark.value ? '0.3' : '0.1'
  }), { scoped: false })

  function toggleDark() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleDark }
}
```

#### 场景 10：数据可视化中的动态图表样式

在图表组件中，根据数据范围动态调整颜色、尺寸等视觉属性。

```vue
<template>
  <div class="chart-container">
    <div
      v-for="bar in bars"
      :key="bar.label"
      class="bar"
      :style="{ '--bar-height': bar.height + '%', '--bar-color': bar.color }"
    >
      <span class="bar-label">{{ bar.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssVars } from 'vue'

interface BarData {
  label: string
  value: number
  color: string
  height: number
}

const data = ref<BarData[]>([
  { label: '一月', value: 120, color: '#42b983', height: 60 },
  { label: '二月', value: 200, color: '#35495e', height: 100 },
  { label: '三月', value: 80, color: '#ff6b6b', height: 40 }
])

const bars = computed(() => data.value)

// ✅ 设置图表容器的全局 CSS 变量
useCssVars(() => ({
  'chart-max-height': '300px',
  'chart-gap': '12px',
  'chart-bar-radius': '4px'
}))
</script>

<style scoped>
.chart-container {
  display: flex;
  align-items: flex-end;
  gap: var(--chart-gap);
  height: var(--chart-max-height);
  padding: 20px;
}

.bar {
  width: 60px;
  height: var(--bar-height);
  background: var(--bar-color);
  border-radius: var(--chart-bar-radius) var(--chart-bar-radius) 0 0;
  position: relative;
  transition: height 0.3s ease;
}

.bar-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  white-space: nowrap;
}
</style>
```

### 六、注意事项

#### 1. 变量名自动加 `--` 前缀

`useCssVars` 返回对象的键名会自动加上 `--` 前缀，因此你**不需要**手动添加。

```ts
// ✅ 正确：不需要加 -- 前缀
useCssVars(() => ({
  'main-color': '#42b983'  // 实际 CSS 变量为 --main-color
}))

// ❌ 错误：加了 -- 前缀会导致实际变量名变成 ----main-color
useCssVars(() => ({
  '--main-color': '#42b983'
}))
```

#### 2. 仅在 `setup()` 中调用

`useCssVars` 内部依赖 `getCurrentInstance()` 获取当前组件实例，因此只能在 `setup()` 函数中同步调用。

```ts
// ✅ 正确：在 setup 中同步调用
export default defineComponent({
  setup() {
    useCssVars(() => ({ color: '#42b983' }))
  }
})

// ❌ 错误：在异步回调中调用，getCurrentInstance() 返回 null
export default defineComponent({
  async setup() {
    await someAsyncOperation()
    useCssVars(() => ({ color: '#42b983' })) // 无法获取组件实例
  }
})
```

#### 3. 变量注入到根元素

`useCssVars` 默认（`scoped: true`）将 CSS 变量注入到组件的**根元素**上。如果组件有多个根节点（Fragment），变量只会注入到第一个根节点。

```ts
// ⚠️ 多根节点时，变量只注入到第一个根元素
render() {
  return (
    <>
      <div class="first">变量会注入到这里</div>
      <div class="second">这里没有变量</div>
    </>
  )
}
```

#### 4. 与 SFC `v-bind()` 的选择

两者功能等价，选择依据是组件的编写方式：

| 对比项 | `useCssVars` | SFC `v-bind()` |
|--------|-------------|-----------------|
| 适用场景 | 非 SFC（render / JSX / TSX） | `.vue` 单文件组件 |
| 写法位置 | `<script setup>` 中调用 | `<style>` 块中使用 |
| 作用域控制 | 通过 `scoped` 选项 | 自动跟随 `<style scoped>` |
| 推荐度（SFC 中） | 不推荐（冗余） | 推荐 |

```vue
<!-- 在 .vue 文件中，推荐直接用 v-bind() -->
<style scoped>
.box {
  /* ✅ SFC 中推荐用法 */
  color: v-bind(color);
}
</style>
```

#### 5. 性能考量

`useCssVars` 内部使用 `watchPostEffect` 监听变化，每次响应式数据变更都会触发 DOM 更新。对于高频变化的值（如鼠标位置、滚动偏移等），需要注意性能影响。

```ts
// ❌ 避免高频更新
const mouseX = ref(0)
window.addEventListener('mousemove', (e) => {
  mouseX.value = e.clientX // 每次鼠标移动都会更新 DOM
})

useCssVars(() => ({
  'mouse-x': mouseX.value + 'px'
}))

// ✅ 使用节流或仅限低频场景
const throttledX = ref(0)
let lastTime = 0
window.addEventListener('mousemove', (e) => {
  const now = Date.now()
  if (now - lastTime > 100) { // 每 100ms 最多更新一次
    throttledX.value = e.clientX
    lastTime = now
  }
})
```

#### 6. SSR 兼容性

在服务端渲染（SSR）环境中，`useCssVars` 可以正常工作，但需要注意：CSS 变量是通过内联 `style` 注入的，在 SSR 输出的 HTML 中会包含这些内联样式。

```ts
// SSR 场景下，输出的 HTML 会包含内联 style
// <div style="--main-color: #42b983;" class="box">
// 这确保了客户端水合前样式即可正确渲染
```

#### 7. 不支持 CSS Modules 的 hash

`useCssVars` 设置的 CSS 变量名是固定的，不会经过 CSS Modules 的 hash 处理。如果你同时使用了 CSS Modules，需要确保 CSS 变量名不发生冲突。

#### 8. 避免在循环中调用

`useCssVars` 应该只调用一次，而不是在循环或条件语句中多次调用。

```ts
// ❌ 错误：不要在循环中调用
const colors = ['red', 'green', 'blue']
colors.forEach((color, i) => {
  useCssVars(() => ({ [`color-${i}`]: color })) // 多次注册 watcher
})

// ✅ 正确：一次性设置所有变量
useCssVars(() => ({
  'color-0': colors[0],
  'color-1': colors[1],
  'color-2': colors[2]
}))
```

#### 9. TypeScript 类型安全

为 `getter` 函数的返回值添加类型注解，确保 CSS 变量值的类型正确。

```ts
// ✅ 使用类型注解确保值类型正确
useCssVars((): Record<string, string> => ({
  'main-color': theme.primary,      // ✅ string
  'font-size': size.value + 'px'    // ✅ string
}))

// ❌ 返回非字符串/数字类型值可能导致问题
useCssVars(() => ({
  'main-color': { r: 255, g: 0, b: 0 },  // ❌ 对象无法直接作为 CSS 变量值
  'flag': true                            // ❌ 布尔值会被转为字符串 'true'
}))
```

#### 10. 与第三方 CSS 框架配合

当与 Tailwind CSS、UnoCSS 等工具配合使用时，`useCssVars` 注入的变量可以直接在工具类中使用。

```html
<!-- ✅ 配合 Tailwind CSS 使用 -->
<div style="--custom-bg: #42b983" class="bg-[var(--custom-bg)]">
  内容
</div>
```

```ts
// 通过 useCssVars 动态改变 Tailwind 类引用的值
useCssVars(() => ({
  'custom-bg': themeColor.value
}))
```

### 七、相关 API 对比

| 特性 | `useCssVars` | SFC `v-bind()` | 内联 `:style` |
|------|-------------|-----------------|---------------|
| 使用场景 | 非 SFC 组件 | `.vue` 单文件组件 | 任何场景 |
| 语法形式 | 函数调用 | CSS 函数 `v-bind(expr)` | 模板绑定 `:style="{ ... }"` |
| 作用域 | 可选 `scoped` 或全局 | 跟随 `<style scoped>` | 仅当前元素 |
| CSS 中使用 | `var(--name)` | 直接 `v-bind(expr)` | 不适用 |
| 多元素共享 | 支持（多个元素用同一变量） | 支持 | 需要逐元素绑定 |
| 媒体查询可用 | 支持（`@media` 中可用） | 支持 | 不支持 |
| 伪元素/伪类 | 支持 | 支持 | 不支持 |
| 推荐场景 | JSX/TSX、render 函数 | 标准 SFC 开发 | 简单样式绑定 |

```vue
<!-- 三种方式对比 -->

<!-- 方式 1：useCssVars（非 SFC 或需要复杂计算时） -->
<script setup>
import { ref, useCssVars } from 'vue'
const color = ref('#42b983')
useCssVars(() => ({ 'text-color': color.value }))
</script>
<style>
.text { color: var(--text-color); }
</style>

<!-- 方式 2：SFC v-bind()（标准 .vue 文件推荐） -->
<style>
.text { color: v-bind(color); }
</style>

<!-- 方式 3：内联 style（最简单但最局限） -->
<template>
  <div class="text" :style="{ color: color }">文本</div>
</template>
```

### 八、总结

`useCssVars` 是 Vue 3 生态中连接 JavaScript 响应式数据与 CSS 变量的桥梁工具，主要解决以下问题：

1. **非 SFC 场景**：在 JSX / TSX / render 函数中无法使用 `v-bind()` CSS 函数时，`useCssVars` 提供了等价的响应式 CSS 变量绑定能力
2. **响应式样式**：让 CSS 变量的值能够跟随 Vue 的响应式系统自动更新，无需手动操作 DOM
3. **作用域控制**：通过 `scoped` 选项灵活控制变量作用范围（组件级或全局）
4. **设计系统支持**：非常适合实现主题切换、Design Token 注入等需要批量管理 CSS 变量的场景

**核心记忆点**：
- 在 `.vue` 单文件组件中优先使用 `v-bind()`，简洁直观
- 在 JSX / TSX / render 函数中使用 `useCssVars`
- 变量名不需要手动加 `--` 前缀
- 只能在 `setup()` 中同步调用
- 注意高频更新的性能影响，必要时使用节流
