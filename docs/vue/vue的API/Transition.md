### Transition

> 📖 [官方文档 - Transition](https://cn.vuejs.org/api/built-in-components#transition)

---

### 一、概述

`<Transition>` 是 Vue 3 提供的一个**内置组件**，用于为**单个元素或组件**添加进入（enter）和离开（leave）的过渡动画效果。它不需要额外安装任何依赖，开箱即用。

简单来说，当你希望一个元素在**显示/隐藏**时不是"瞬间出现或消失"，而是有一个平滑的动画过程（比如淡入淡出、滑动、缩放等），就需要用到 `<Transition>`。它在底层通过在 DOM 元素插入、更新或移除时，动态添加/移除 CSS 类名或调用 JavaScript 钩子来实现动画控制。

> 💡 **提示：** `<Transition>` 只能包裹**单个直接子元素**。如果你需要同时为多个元素添加过渡效果，请使用 `<TransitionGroup>`。

---

### 二、核心原理

#### 2.1 过渡的六个阶段

`<Transition>` 的动画分为**进入**和**离开**两大阶段，每段各包含三个子阶段，共 **6 个 CSS 类名**：

```
进入阶段：v-enter-from → v-enter-active → v-enter-to
离开阶段：v-leave-from → v-leave-active → v-leave-to
```

可以把它想象成一出舞台剧：

| 阶段 | 类名 | 类比 | 说明 |
|------|------|------|------|
| 进入起始 | `v-enter-from` | 演员在幕后准备 | 元素刚被插入 DOM 时的初始状态 |
| 进入过程 | `v-enter-active` | 演员走上舞台 | 元素从起始状态过渡到目标状态的整个过程 |
| 进入结束 | `v-enter-to` | 演员站定 | 元素进入完成后的最终状态（默认就是元素的正常状态） |
| 离开起始 | `v-leave-from` | 演员准备退场 | 元素即将离开时的初始状态（默认就是元素的正常状态） |
| 离开过程 | `v-leave-active` | 演员走下舞台 | 元素从正常状态过渡到离开状态的整个过程 |
| 离开结束 | `v-leave-to` | 演员已退场 | 元素离开完成后的最终状态 |

#### 2.2 工作流程

```
v-if / v-show 切换
       ↓
┌─── 显示 ───┐     ┌─── 隐藏 ───┐
│ 添加 enter  │     │ 添加 leave  │
│   类名组    │     │   类名组    │
│      ↓      │     │      ↓      │
│ 下一帧移除  │     │ 下一帧移除  │
│  -from 类   │     │  -from 类   │
│      ↓      │     │      ↓      │
│ 过渡结束    │     │ 过渡结束    │
│ 移除所有    │     │ 移除所有    │
│  enter 类   │     │  leave 类   │
└─────────────┘     │      ↓      │
                    │ 移除 DOM    │
                    └─────────────┘
```

> 💡 **提示：** `v-enter-to` 和 `v-leave-from` 在大多数情况下就是元素的默认样式，所以通常不需要显式定义这两个类。你只需要定义"从什么状态开始"和"过渡方式"即可。

#### 2.3 触发条件

`<Transition>` 的过渡会在以下条件切换时触发：

- `v-if` — 条件渲染
- `v-show` — 条件显示（通过 `display` 切换）
- 动态组件 — `<component :is="...">` 切换
- 改变特殊的 `key` 属性

---

### 三、详细用法

#### 1. 基本用法

##### 1.1 最简单的淡入淡出

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <button @click="show = !show">切换显示</button>

  <Transition>
    <p v-if="show" class="content">我会淡入淡出</p>
  </Transition>
</template>

<style>
/* 默认 name 为 "v"，所以类名以 "v-" 开头 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
```

##### 1.2 命名过渡

当页面中有多个 `<Transition>` 时，通过 `name` 属性来区分不同的过渡效果：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showFade = ref(true)
const showSlide = ref(true)
</script>

<template>
  <button @click="showFade = !showFade">淡入淡出</button>
  <button @click="showSlide = !showSlide">滑动</button>

  <!-- name="fade" → 类名前缀变为 "fade-" -->
  <Transition name="fade">
    <p v-if="showFade">淡入淡出效果</p>
  </Transition>

  <!-- name="slide" → 类名前缀变为 "slide-" -->
  <Transition name="slide">
    <p v-if="showSlide">滑动效果</p>
  </Transition>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
```

##### 1.3 配合 v-show 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <button @click="visible = !visible">切换</button>

  <Transition name="fade">
    <div v-show="visible" class="panel">
      我用 v-show 控制显示隐藏
    </div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

#### 2. 进阶用法

##### 2.1 CSS 动画（animation）

除了 `transition`，还可以使用 CSS `@keyframes` 动画：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <button @click="show = !show">切换</button>

  <Transition name="bounce">
    <div v-if="show" class="box">弹跳效果</div>
  </Transition>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s ease;
}

.bounce-leave-active {
  animation: bounce-in 0.5s ease reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
```

##### 2.2 自定义过渡类名

可以通过以下属性覆盖默认的 CSS 类名，方便与第三方动画库（如 Animate.css）配合使用：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <button @click="show = !show">切换</button>

  <!-- 自定义各个阶段的类名 -->
  <Transition
    name="custom"
    enter-active-class="animate__animated animate__tada"
    leave-active-class="animate__animated animate__bounceOut"
  >
    <p v-if="show">配合 Animate.css</p>
  </Transition>
</template>
```

可用的自定义类名属性：

| 属性 | 说明 |
|------|------|
| `enter-from-class` | 覆盖 `v-enter-from` |
| `enter-active-class` | 覆盖 `v-enter-active` |
| `enter-to-class` | 覆盖 `v-enter-to` |
| `leave-from-class` | 覆盖 `v-leave-from` |
| `leave-active-class` | 覆盖 `v-leave-active` |
| `leave-to-class` | 覆盖 `v-leave-to` |

##### 2.3 JavaScript 钩子（完全用 JS 控制动画）

当 CSS 过渡无法满足需求时（如需要根据元素尺寸动态计算动画），可以使用 JavaScript 钩子：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)

// 进入动画钩子
const onBeforeEnter = (el: Element): void => {
  // 在元素被插入 DOM 前设置初始状态
  ;(el as HTMLElement).style.opacity = '0'
  ;(el as HTMLElement).style.transform = 'translateY(30px)'
}

const onEnter = (el: Element, done: () => void): void => {
  // el 已插入 DOM，在此执行动画
  // done 回调必须在动画结束后调用，告知 Vue 动画已完成
  const element = el as HTMLElement
  const animation = element.animate(
    [
      { opacity: 0, transform: 'translateY(30px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      duration: 500,
      easing: 'ease-out',
    }
  )
  animation.onfinish = done
}

const onAfterEnter = (el: Element): void => {
  // 进入动画结束后的清理工作
  console.log('进入动画已完成')
}

// 离开动画钩子
const onBeforeLeave = (el: Element): void => {
  ;(el as HTMLElement).style.opacity = '1'
}

const onLeave = (el: Element, done: () => void): void => {
  const element = el as HTMLElement
  const animation = element.animate(
    [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(30px)' },
    ],
    {
      duration: 500,
      easing: 'ease-in',
    }
  )
  animation.onfinish = done
}

const onAfterLeave = (): void => {
  console.log('离开动画已完成')
}
</script>

<template>
  <button @click="show = !show">切换</button>

  <Transition
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <div v-if="show" class="box">JS 动画控制</div>
  </Transition>
</template>
```

> 💡 **提示：** 添加 `:css="false"` 可以明确告诉 Vue 跳过 CSS 过渡检测，仅使用 JavaScript 钩子。这样做可以避免 CSS 规则意外干扰，也能略微提升性能。

##### 2.4 初始渲染过渡（appear）

默认情况下，`<Transition>` 只在元素**后续的显示/隐藏切换**时触发动画，首次渲染不会触发。通过 `appear` 属性可以让首次渲染也有动画：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <!-- 页面首次加载时也会执行进入动画 -->
  <Transition name="fade" appear>
    <div class="hero-section">首次加载我也会淡入</div>
  </Transition>

  <!-- 也可以自定义 appear 阶段的类名 -->
  <Transition
    name="fade"
    appear
    appear-from-class="fade-enter-from"
    appear-to-class="fade-enter-to"
    appear-active-class="fade-enter-active"
  >
    <div class="hero-section">自定义首次加载动画</div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

##### 2.5 元素间过渡（mode）

当在两个元素之间切换时，默认是**同时执行**进入和离开动画。可以通过 `mode` 属性控制执行顺序：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isDoc = ref(true)
</script>

<template>
  <button @click="isDoc = !isDoc">切换状态</button>

  <!-- out-in：先执行离开动画，完成后再执行进入动画 -->
  <Transition name="fade" mode="out-in">
    <div v-if="isDoc" key="doc" class="tab-content">文档内容</div>
    <div v-else key="setting" class="tab-content">设置内容</div>
  </Transition>

  <!-- in-out：先执行进入动画，完成后再执行离开动画（较少使用） -->
  <Transition name="fade" mode="in-out">
    <span :key="isDoc ? 'A' : 'B'" class="tag">
      {{ isDoc ? '文档' : '设置' }}
    </span>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

##### 2.6 动态过渡

过渡的 name、mode 等属性都可以是动态的，根据状态切换不同的动画效果：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref<'home' | 'profile' | 'settings'>('home')

const transitionName = computed(() => {
  return `tab-${currentTab.value}`
})
</script>

<template>
  <nav>
    <button
      v-for="tab in (['home', 'profile', 'settings'] as const)"
      :key="tab"
      :class="{ active: currentTab === tab }"
      @click="currentTab = tab"
    >
      {{ tab }}
    </button>
  </nav>

  <Transition :name="transitionName" mode="out-in">
    <div :key="currentTab" class="tab-panel">
      {{ currentTab }} 内容区域
    </div>
  </Transition>
</template>

<style>
.tab-home-enter-active,
.tab-home-leave-active,
.tab-profile-enter-active,
.tab-profile-leave-active,
.tab-settings-enter-active,
.tab-settings-leave-active {
  transition: all 0.3s ease;
}

.tab-home-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.tab-home-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.tab-profile-enter-from {
  transform: translateY(-30px);
  opacity: 0;
}

.tab-profile-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

.tab-settings-enter-from {
  transform: scale(0.8);
  opacity: 0;
}

.tab-settings-leave-to {
  transform: scale(1.2);
  opacity: 0;
}
</style>
```

##### 2.7 嵌套过渡

`<Transition>` 可以嵌套使用，配合 `duration` 属性精确控制总过渡时间：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <button @click="show = !show">切换</button>

  <!-- duration 指定总过渡时长（毫秒），避免嵌套过渡提前结束 -->
  <Transition name="nested" :duration="550">
    <div v-if="show" class="outer">
      <div class="inner">嵌套内容</div>
    </div>
  </Transition>
</template>

<style>
/* 外层过渡 */
.nested-enter-active,
.nested-leave-active {
  transition: all 0.3s ease-in-out;
}

.nested-enter-from,
.nested-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 内层过渡 - 延迟 0.15s 开始 */
.inner {
  transition: all 0.3s ease-in-out 0.15s;
}

.nested-enter-from .inner {
  transform: translateX(50px);
}

.nested-leave-to .inner {
  transform: translateX(-50px);
}
</style>
```

`duration` 属性支持以下格式：

```vue
<!-- 毫秒数：进入和离开均为 500ms -->
<Transition :duration="500">

<!-- 对象形式：分别指定进入和离开时长 -->
<Transition :duration="{ enter: 500, leave: 300 }">
```

##### 2.8 组件过渡

`<Transition>` 也可以包裹动态组件：

```vue
<script setup lang="ts">
import { ref, type Component } from 'vue'
import HomeView from './HomeView.vue'
import AboutView from './AboutView.vue'

type TabComponent = 'HomeView' | 'AboutView'

const currentTab = ref<TabComponent>('HomeView')

const tabComponents: Record<TabComponent, Component> = {
  HomeView,
  AboutView,
}
</script>

<template>
  <button
    v-for="(_, tab) in tabComponents"
    :key="tab"
    @click="currentTab = tab as TabComponent"
  >
    {{ tab }}
  </button>

  <Transition name="fade" mode="out-in">
    <component :is="tabComponents[currentTab]" :key="currentTab" />
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

#### 3. API 参数说明

##### 3.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `'v'` | 过渡类名的前缀，用于自动生成 CSS 类名 |
| `appear` | `boolean` | `false` | 是否在首次渲染时应用过渡动画 |
| `mode` | `'in-out' \| 'out-in'` | `undefined` | 控制离开和进入动画的执行顺序 |
| `css` | `boolean` | `true` | 是否使用 CSS 过渡类。设为 `false` 时仅触发 JS 钩子 |
| `duration` | `number \| { enter: number; leave: number }` | `undefined` | 显式指定过渡持续时间（毫秒） |
| `type` | `'transition' \| 'animation'` | `undefined` | 指定监听的过渡类型，用于确定动画结束时机 |
| `enter-from-class` | `string` | — | 自定义进入起始状态类名 |
| `enter-active-class` | `string` | — | 自定义进入过程类名 |
| `enter-to-class` | `string` | — | 自定义进入结束状态类名 |
| `leave-from-class` | `string` | — | 自定义离开起始状态类名 |
| `leave-active-class` | `string` | — | 自定义离开过程类名 |
| `leave-to-class` | `string` | — | 自定义离开结束状态类名 |
| `appear-from-class` | `string` | — | 自定义首次渲染起始状态类名 |
| `appear-active-class` | `string` | — | 自定义首次渲染过程类名 |
| `appear-to-class` | `string` | — | 自定义首次渲染结束状态类名 |

##### 3.2 Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `@before-enter` | `(el: Element)` | 进入动画开始前调用，`el` 是即将进入的 DOM 元素 |
| `@enter` | `(el: Element, done: () => void)` | 进入动画开始时调用，`done` 必须在动画完成后调用 |
| `@after-enter` | `(el: Element)` | 进入动画结束后调用 |
| `@enter-cancelled` | `(el: Element)` | 进入动画被取消时调用 |
| `@before-leave` | `(el: Element)` | 离开动画开始前调用 |
| `@leave` | `(el: Element, done: () => void)` | 离开动画开始时调用，`done` 必须在动画完成后调用 |
| `@after-leave` | `(el: Element)` | 离开动画结束后调用 |
| `@leave-cancelled` | `(el: Element)` | 离开动画被取消时调用（仅在 v-show 时触发） |
| `@before-appear` | `(el: Element)` | 首次渲染动画开始前调用 |
| `@appear` | `(el: Element, done: () => void)` | 首次渲染动画开始时调用 |
| `@after-appear` | `(el: Element)` | 首次渲染动画结束后调用 |
| `@appear-cancelled` | `(el: Element)` | 首次渲染动画被取消时调用 |

---

### 四、实现效果

以下是一个综合示例，展示 `<Transition>` 各种特性组合使用后的效果：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const show = ref(true)
const currentTab = ref<'home' | 'about' | 'contact'>('home')

// 记录过渡状态
const transitionState = ref<string>('空闲')

const handleBeforeEnter = (): void => {
  transitionState.value = '进入中...'
}

const handleAfterEnter = (): void => {
  transitionState.value = '进入完成'
}

const handleBeforeLeave = (): void => {
  transitionState.value = '离开中...'
}

const handleAfterLeave = (): void => {
  transitionState.value = '离开完成'
}
</script>

<template>
  <div class="demo-container">
    <!-- 状态提示 -->
    <p class="status">当前过渡状态：{{ transitionState }}</p>

    <!-- 切换按钮 -->
    <button @click="show = !show">
      {{ show ? '隐藏' : '显示' }}
    </button>

    <!-- 过渡组件：使用 out-in 模式，淡入淡出 + 缩放 -->
    <Transition
      name="scale-fade"
      mode="out-in"
      @before-enter="handleBeforeEnter"
      @after-enter="handleAfterEnter"
      @before-leave="handleBeforeLeave"
      @after-leave="handleAfterLeave"
    >
      <div v-if="show" class="card" key="visible">
        <h3>卡片标题</h3>
        <p>我会以缩放 + 淡入淡出的方式显示和隐藏</p>
      </div>
      <div v-else class="card placeholder" key="hidden">
        <p>内容已隐藏，点击按钮重新显示</p>
      </div>
    </Transition>
  </div>
</template>

<style>
.demo-container {
  max-width: 500px;
  margin: 0 auto;
}

.status {
  color: #666;
  font-size: 14px;
}

/* 进入动画：先缩小+透明，然后放大+显示 */
.scale-fade-enter-active {
  transition: all 0.3s ease-out;
}

/* 离开动画：先缩小+透明，然后移除 DOM */
.scale-fade-leave-active {
  transition: all 0.2s ease-in;
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.card {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.placeholder {
  background: #f5f5f5;
  color: #999;
}
</style>
```

**运行效果说明：**

1. 点击"隐藏"按钮后：
   - `transitionState` 显示"离开中..."
   - 卡片以 0.2s 的速度缩小并淡出
   - 离开动画完成后，DOM 元素被移除
   - 占位内容以 0.3s 的速度放大并淡入
   - `transitionState` 显示"进入完成"

2. 点击"显示"按钮后：过程相反

3. 由于使用了 `mode="out-in"`，离开和进入动画**不会同时发生**，视觉上更加平滑

---

### 五、使用场景

#### 场景 1：弹窗 / 模态框

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const openModal = (): void => {
  isOpen.value = true
}

const closeModal = (): void => {
  isOpen.value = false
}
</script>

<template>
  <button @click="openModal">打开弹窗</button>

  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>弹窗标题</h2>
        <p>这是一个带过渡动画的弹窗</p>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </Transition>
</template>

<style>
/* 遮罩层淡入淡出 + 内容缩放 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: scale(0.8) translateY(20px);
}

.modal-leave-to .modal-content {
  transform: scale(0.8) translateY(20px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}
</style>
```

#### 场景 2：消息提示 / Toast 通知

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (message: string, type: Toast['type'] = 'info'): void => {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 3000)
}
</script>

<template>
  <button @click="showToast('操作成功', 'success')">成功提示</button>
  <button @click="showToast('出错了', 'error')">错误提示</button>

  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  padding: 12px 20px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  min-width: 200px;
}

.toast-success { background: #52c41a; }
.toast-error { background: #ff4d4f; }
.toast-info { background: #1890ff; }

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
```

> 💡 **提示：** 当需要对**列表**进行过渡时，应使用 `<TransitionGroup>` 而非 `<Transition>`。

#### 场景 3：手风琴折叠面板

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Panel {
  id: string
  title: string
  content: string
}

const panels: Panel[] = [
  { id: 'a', title: '第一章', content: '第一章的详细内容...' },
  { id: 'b', title: '第二章', content: '第二章的详细内容...' },
  { id: 'c', title: '第三章', content: '第三章的详细内容...' },
]

const activeId = ref<string | null>(null)

const toggle = (id: string): void => {
  activeId.value = activeId.value === id ? null : id
}
</script>

<template>
  <div class="accordion">
    <div v-for="panel in panels" :key="panel.id" class="accordion-item">
      <button class="accordion-header" @click="toggle(panel.id)">
        {{ panel.title }}
        <span>{{ activeId === panel.id ? '▲' : '▼' }}</span>
      </button>

      <Transition name="collapse">
        <div v-show="activeId === panel.id" class="accordion-body">
          <p>{{ panel.content }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 200px;
  opacity: 1;
}

.accordion-item {
  border: 1px solid #e0e0e0;
  margin-bottom: -1px;
}

.accordion-header {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: #fafafa;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.accordion-body {
  padding: 12px 16px;
}
</style>
```

#### 场景 4：侧边栏抽屉

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isDrawerOpen = ref(false)
</script>

<template>
  <button @click="isDrawerOpen = true">打开侧边栏</button>

  <!-- 遮罩层 -->
  <Transition name="fade">
    <div
      v-if="isDrawerOpen"
      class="drawer-overlay"
      @click="isDrawerOpen = false"
    />
  </Transition>

  <!-- 侧边栏主体 -->
  <Transition name="drawer">
    <aside v-if="isDrawerOpen" class="drawer">
      <nav>
        <a href="#">首页</a>
        <a href="#">关于</a>
        <a href="#">联系</a>
      </nav>
      <button @click="isDrawerOpen = false">关闭</button>
    </aside>
  </Transition>
</template>

<style>
/* 遮罩层 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 侧边栏从左侧滑入 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: #fff;
  z-index: 101;
  padding: 20px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}
</style>
```

#### 场景 5：页面路由切换

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

watch(
  () => route.path,
  (to, from) => {
    // 根据路由层级决定动画方向
    const toDepth = to.split('/').length
    const fromDepth = from?.split('/').length ?? 0
    transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  }
)
</script>

<template>
  <Transition :name="transitionName" mode="out-in">
    <router-view />
  </Transition>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 向左滑入 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* 向右滑入（返回） */
.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
```

#### 场景 6：下拉菜单

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  label: string
  value: string
}

const menuItems: MenuItem[] = [
  { label: '编辑', value: 'edit' },
  { label: '复制', value: 'copy' },
  { label: '删除', value: 'delete' },
]

const isOpen = ref(false)

const handleSelect = (value: string): void => {
  console.log('选中：', value)
  isOpen.value = false
}
</script>

<template>
  <div class="dropdown">
    <button @click="isOpen = !isOpen">更多操作 ▾</button>

    <Transition name="dropdown">
      <ul v-if="isOpen" class="dropdown-menu">
        <li
          v-for="item in menuItems"
          :key="item.value"
          @click="handleSelect(item.value)"
        >
          {{ item.label }}
        </li>
      </ul>
    </Transition>
  </div>

  <!-- 点击外部关闭 -->
  <div v-if="isOpen" class="backdrop" @click="isOpen = false" />
</template>

<style>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 4px 0;
  min-width: 120px;
  list-style: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-menu li {
  padding: 8px 16px;
  cursor: pointer;
}

.dropdown-menu li:hover {
  background: #f5f5f5;
}

/* 下拉展开动画 */
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.95);
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
}
</style>
```

#### 场景 7：加载骨架屏过渡

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Article {
  id: number
  title: string
  body: string
}

const article = ref<Article | null>(null)
const loading = ref(true)

onMounted(async () => {
  // 模拟接口请求
  await new Promise((resolve) => setTimeout(resolve, 1500))
  article.value = {
    id: 1,
    title: '深入理解 Vue 3 Transition',
    body: '这是一篇关于 Vue 3 Transition 组件的详细文章...',
  }
  loading.value = false
})
</script>

<template>
  <div class="article-container">
    <Transition name="fade" mode="out-in">
      <!-- 骨架屏 -->
      <div v-if="loading" key="skeleton" class="skeleton">
        <div class="skeleton-title" />
        <div class="skeleton-text" />
        <div class="skeleton-text short" />
      </div>

      <!-- 实际内容 -->
      <div v-else key="content" class="article">
        <h2>{{ article!.title }}</h2>
        <p>{{ article!.body }}</p>
      </div>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.skeleton-title {
  width: 60%;
  height: 24px;
  background: #e8e8e8;
  border-radius: 4px;
  margin-bottom: 16px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text {
  width: 100%;
  height: 16px;
  background: #e8e8e8;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text.short {
  width: 40%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
```

#### 场景 8：标签页切换

```vue
<script setup lang="ts">
import { ref } from 'vue'

type TabKey = 'overview' | 'detail' | 'review'

const activeTab = ref<TabKey>('overview')

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '概览' },
  { key: 'detail', label: '详情' },
  { key: 'review', label: '评价' },
]
</script>

<template>
  <div class="tabs">
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-body">
      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab" class="tab-panel">
          <p v-if="activeTab === 'overview'">概览内容</p>
          <p v-else-if="activeTab === 'detail'">详情内容</p>
          <p v-else>评价内容</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style>
.tab-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  gap: 4px;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.tab-body {
  padding: 16px 0;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
```

#### 场景 9：表单步骤切换

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const currentStep = ref(0)
const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
})

const totalSteps = 3

const direction = computed(() =>
  'forward'
)

const next = (): void => {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++
  }
}

const prev = (): void => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}
</script>

<template>
  <div class="step-form">
    <!-- 步骤指示器 -->
    <div class="steps">
      <div
        v-for="i in totalSteps"
        :key="i"
        :class="['step-dot', { active: currentStep >= i - 1 }]"
      >
        {{ i }}
      </div>
    </div>

    <!-- 步骤内容过渡 -->
    <Transition name="step" mode="out-in">
      <div :key="currentStep" class="step-content">
        <template v-if="currentStep === 0">
          <h3>基本信息</h3>
          <input v-model="formData.name" placeholder="姓名" />
          <input v-model="formData.email" placeholder="邮箱" />
        </template>
        <template v-else-if="currentStep === 1">
          <h3>联系方式</h3>
          <input v-model="formData.phone" placeholder="手机号" />
        </template>
        <template v-else>
          <h3>确认信息</h3>
          <p>姓名：{{ formData.name }}</p>
          <p>邮箱：{{ formData.email }}</p>
          <p>手机：{{ formData.phone }}</p>
        </template>
      </div>
    </Transition>

    <!-- 操作按钮 -->
    <div class="actions">
      <button v-if="currentStep > 0" @click="prev">上一步</button>
      <button v-if="currentStep < totalSteps - 1" @click="next">下一步</button>
      <button v-else @click="console.log('提交', formData)">提交</button>
    </div>
  </div>
</template>

<style>
.step-enter-active {
  transition: all 0.3s ease-out;
}

.step-leave-active {
  transition: all 0.2s ease-in;
}

.step-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.step-form {
  max-width: 500px;
  margin: 0 auto;
}

.steps {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.step-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.3s;
}

.step-dot.active {
  background: #1890ff;
  color: #fff;
}

.step-content {
  min-height: 200px;
}

.step-content input {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
```

#### 场景 10：图片预览灯箱

```vue
<script setup lang="ts">
import { ref } from 'vue'

const images = [
  'https://picsum.photos/id/1/400/300',
  'https://picsum.photos/id/2/400/300',
  'https://picsum.photos/id/3/400/300',
]

const currentIndex = ref(0)
const isLightboxOpen = ref(false)

const openLightbox = (index: number): void => {
  currentIndex.value = index
  isLightboxOpen.value = true
}

const closeLightbox = (): void => {
  isLightboxOpen.value = false
}

const prevImage = (): void => {
  currentIndex.value =
    (currentIndex.value - 1 + images.length) % images.length
}

const nextImage = (): void => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}
</script>

<template>
  <div class="gallery">
    <img
      v-for="(img, index) in images"
      :key="index"
      :src="img"
      class="thumbnail"
      @click="openLightbox(index)"
    />
  </div>

  <Transition name="lightbox">
    <div v-if="isLightboxOpen" class="lightbox" @click.self="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox">✕</button>
      <button class="lightbox-prev" @click="prevImage">‹</button>

      <Transition name="lightbox-img" mode="out-in">
        <img
          :key="currentIndex"
          :src="images[currentIndex]"
          class="lightbox-image"
        />
      </Transition>

      <button class="lightbox-next" @click="nextImage">›</button>
    </div>
  </Transition>
</template>

<style>
.gallery {
  display: flex;
  gap: 8px;
}

.thumbnail {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.thumbnail:hover {
  transform: scale(1.05);
}

/* 灯箱容器 */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lightbox-image {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 4px;
}

/* 灯箱淡入淡出 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* 图片切换过渡 */
.lightbox-img-enter-active,
.lightbox-img-leave-active {
  transition: all 0.3s ease;
}

.lightbox-img-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.lightbox-img-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 16px;
}

.lightbox-close { top: 20px; right: 20px; }
.lightbox-prev { left: 20px; top: 50%; transform: translateY(-50%); }
.lightbox-next { right: 20px; top: 50%; transform: translateY(-50%); }
</style>
```

---

### 六、注意事项

#### 1. 只能包裹单个根子元素

`<Transition>` 要求其直接子元素**有且只有一个**。多个子元素会导致过渡无法正确触发。

```vue
<!-- ❌ 错误：多个根子元素 -->
<Transition>
  <div v-if="show">内容 A</div>
  <div v-if="show">内容 B</div>
</Transition>

<!-- ✅ 正确：单个根子元素 -->
<Transition>
  <div v-if="show">内容 A</div>
</Transition>

<!-- ✅ 正确：用 mode 切换两个互斥元素 -->
<Transition mode="out-in">
  <div v-if="show" key="a">内容 A</div>
  <div v-else key="b">内容 B</div>
</Transition>
```

#### 2. 子元素必须有条件渲染指令

`<Transition>` 的子元素必须使用 `v-if`、`v-show`、动态组件或动态 `key`，否则过渡不会触发：

```vue
<!-- ❌ 错误：无条件渲染指令，过渡永远不会触发 -->
<Transition>
  <div>我是静态内容</div>
</Transition>

<!-- ✅ 正确：使用 v-if 控制条件渲染 -->
<Transition>
  <div v-if="show">条件内容</div>
</Transition>
```

#### 3. v-if 和 v-show 的行为差异

- **`v-if`**：会真正地**添加和移除 DOM 元素**。离开动画结束后，元素从 DOM 中移除。
- **`v-show`**：元素始终存在于 DOM 中，只切换 `display` 属性。离开动画结束后，元素设置 `display: none`。

```vue
<!-- v-if：离开后 DOM 元素被移除 -->
<Transition>
  <div v-if="show">内容</div>
</Transition>

<!-- v-show：离开后 DOM 元素保留，只是 display: none -->
<Transition>
  <div v-show="show">内容</div>
</Transition>
```

> 💡 **提示：** 使用 `v-show` 时，`@leave-cancelled` 事件会被触发（因为元素不会被销毁），而使用 `v-if` 时不会。

#### 4. key 属性的重要性

当在两个元素之间切换时，必须为每个元素设置唯一的 `key`，否则 Vue 会复用元素而不是触发过渡：

```vue
<!-- ❌ 错误：没有 key，Vue 会就地复用元素，不触发过渡 -->
<Transition mode="out-in">
  <div v-if="isA">内容 A</div>
  <div v-else>内容 B</div>
</Transition>

<!-- ✅ 正确：添加唯一 key，确保过渡正常触发 -->
<Transition mode="out-in">
  <div v-if="isA" key="a">内容 A</div>
  <div v-else key="b">内容 B</div>
</Transition>
```

#### 5. JavaScript 钩子中必须调用 done 回调

在 `@enter` 和 `@leave` 钩子中，如果使用了 JavaScript 控制动画，**必须调用 `done` 回调**，否则过渡会卡住，元素无法正确显示或移除：

```vue
<script setup lang="ts">
// ❌ 错误：忘记调用 done，动画永远不会结束
const onEnter = (el: Element, done: () => void): void => {
  el.animate(
    [
      { opacity: 0 },
      { opacity: 1 },
    ],
    { duration: 500 }
  )
  // 缺少 done() 调用！
}

// ✅ 正确：动画结束后调用 done
const onEnterFixed = (el: Element, done: () => void): void => {
  const animation = el.animate(
    [
      { opacity: 0 },
      { opacity: 1 },
    ],
    { duration: 500 }
  )
  animation.onfinish = done
}
</script>
```

#### 6. 过渡类名与 Scoped 样式

使用 `<style scoped>` 时，过渡类名需要使用 `:deep()` 选择器，因为过渡类是添加到子元素上的：

```vue
<!-- ❌ 错误：scoped 样式无法匹配 Transition 添加的类名 -->
<template>
  <Transition name="fade">
    <div v-if="show">内容</div>
  </Transition>
</template>

<style scoped>
/* 无法生效！因为 .fade-* 类名由 Transition 动态添加到子元素上 */
.fade-enter-active {
  transition: opacity 0.3s;
}
</style>

<!-- ✅ 正确方案 1：使用非 scoped 样式 -->
<style>
.fade-enter-active {
  transition: opacity 0.3s;
}
</style>

<!-- ✅ 正确方案 2：在子元素上直接设置过渡，通过类名切换触发 -->
```

> ⚠️ **注意：** 推荐将过渡样式放在非 scoped 的 `<style>` 块中，或者直接在子组件内部定义过渡样式。

#### 7. 过渡结束检测 —— type 属性

当同时定义了 `transition` 和 `animation` 时，Vue 需要知道以哪个为准来判断"过渡结束"。默认 Vue 会等待较长的那个结束，使用 `type` 属性可以明确指定：

```vue
<!-- 仅以 transition 结束为准 -->
<Transition type="transition">
  <div v-if="show">内容</div>
</Transition>

<!-- 仅以 animation 结束为准 -->
<Transition type="animation">
  <div v-if="show">内容</div>
</Transition>
```

#### 8. 首次渲染默认不触发过渡

`<Transition>` 默认只在后续的切换中触发动画，首次渲染不会触发。如果需要首次渲染也有动画效果，需要添加 `appear` 属性：

```vue
<!-- ❌ 首次渲染没有动画 -->
<Transition name="fade">
  <div>首次渲染没有动画</div>
</Transition>

<!-- ✅ 首次渲染也有动画 -->
<Transition name="fade" appear>
  <div>首次渲染有淡入动画</div>
</Transition>
```

#### 9. 过渡与 FLIP 动画不兼容

`<Transition>` 主要处理元素的进入/离开，不适合用来做列表排序动画（FLIP）。对于列表项的位置移动动画，应该使用 `<TransitionGroup>`。

#### 10. 性能优化建议

- 对于只涉及 `opacity` 和 `transform` 的过渡，浏览器可以使用 GPU 加速，性能最好
- 避免在过渡中动画化 `width`、`height`、`top`、`left` 等会触发重排（reflow）的属性
- 使用 `will-change` 属性提示浏览器预先优化

```css
/* ✅ 推荐：使用 transform 和 opacity，GPU 加速 */
.fade-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}

/* ❌ 不推荐：动画化会触发重排的属性 */
.slide-enter-active {
  transition: height 0.3s, margin-top 0.3s;
}

/* ✅ 提示浏览器优化 */
.slide-enter-active {
  will-change: transform, opacity;
  transition: transform 0.3s, opacity 0.3s;
}
```

---

### 七、相关 API 对比

| 特性 | `<Transition>` | `<TransitionGroup>` |
|------|----------------|---------------------|
| 包裹元素数量 | **单个**元素或组件 | **多个**元素（列表） |
| 支持列表排序动画 | 不支持 | 支持（FLIP 动画） |
| 是否渲染额外 DOM | 否（不渲染额外包裹元素） | 默认渲染一个包裹元素（可自定义 tag） |
| 过渡触发方式 | 进入 / 离开 | 进入 / 离开 / **移动** |
| 典型场景 | 弹窗、抽屉、路由切换 | 列表增删、排序、筛选 |
| mode 属性 | 支持（`out-in` / `in-out`） | **不支持** |

```vue
<!-- Transition：单个元素过渡 -->
<Transition name="fade">
  <div v-if="show">单个元素</div>
</Transition>

<!-- TransitionGroup：列表过渡 -->
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.text }}</li>
</TransitionGroup>
```

---

### 八、总结

`<Transition>` 是 Vue 3 内置的过渡动画组件，核心要点如下：

1. **用途**：为单个元素的显示/隐藏添加进入和离开过渡动画
2. **原理**：通过在元素插入/移除时动态添加 6 个 CSS 类名（enter-from/active/to、leave-from/active/to）来控制动画
3. **触发方式**：`v-if`、`v-show`、动态组件、动态 `key`
4. **动画方式**：支持 CSS `transition`、CSS `@keyframes`、JavaScript 钩子三种方式
5. **关键属性**：
   - `name` — 自定义类名前缀
   - `mode` — 控制进入/离开的执行顺序
   - `appear` — 首次渲染也触发动画
   - `:css="false"` — 禁用 CSS 过渡，仅用 JS 控制
   - `duration` — 显式指定过渡时长
6. **最佳实践**：优先使用 `transform` 和 `opacity` 做动画以获得最佳性能；多用 `mode="out-in"` 避免进入和离开动画同时进行造成布局抖动
