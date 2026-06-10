### onErrorCaptured

> 📖 [官方文档 - onErrorCaptured](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)

---

### 一、概述

`onErrorCaptured()` 是 Vue 3 组合式 API 中的一个生命周期钩子，专门用于**捕获来自后代组件抛出的错误**。它可以拦截子组件、孙组件乃至更深层次组件中发生的异常，让你有机会在父级组件中统一处理这些错误，而不是让错误一路冒泡到全局导致整个应用崩溃。

简单来说，它就像一个**安全网** —— 当你的组件树中某个深层组件出了问题，`onErrorCaptured` 能在你精心设置的位置接住这个错误，展示友好的降级 UI，而不是让整个页面白屏。

---

### 二、核心原理

`onErrorCaptured` 的工作机制可以类比为一个**向上冒泡的事件拦截器**：

1. **错误来源**：当后代组件在以下场景中抛出错误时，错误会沿着组件树向上传播：
   - 组件渲染期间（`setup` 函数、模板渲染）
   - 事件处理器中
   - 生命周期钩子中
   - `watch` / `watchEffect` 回调中
   - 自定义指令钩子中

2. **向上传播**：错误从发生位置沿着组件树逐层向上冒泡，类似于 DOM 事件冒泡机制。每一层使用了 `onErrorCaptured` 的组件都有机会拦截这个错误。

3. **传播控制**：回调函数的返回值决定了错误是否继续向上传播：
   - 返回 `false`：**阻止错误继续向上传播**（已处理）
   - 不返回或返回 `true`：错误继续向上冒泡

4. **触发顺序**：错误从最靠近出错组件的父级开始触发，逐层向上，直到被 `return false` 拦截或到达应用根组件。

> 💡 **提示：** `onErrorCaptured` 只能捕获**后代组件**的错误，无法捕获自身组件中发生的错误。

---

### 三、详细用法

#### 1. 基本用法

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('捕获到后代组件错误:', err)
  console.error('出错组件实例:', instance)
  console.error('错误来源信息:', info)
  return false // 阻止错误继续向上传播
})
</script>

<template>
  <ChildComponent />
</template>
```

#### 2. 进阶用法

**（1）构建错误边界组件**

```vue
<!-- ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')

onErrorCaptured((err: unknown) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  errorStack.value = err instanceof Error ? err.stack ?? '' : ''
  // 上报错误到监控系统
  reportError(err)
  return false // 阻止继续传播
})

const reset = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
}

// 模拟错误上报
function reportError(err: unknown) {
  console.error('[ErrorBoundary] 已捕获并上报错误:', err)
}
</script>

<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-fallback">
      <h3>⚠️ 组件渲染出错</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <details v-if="errorStack">
        <summary>查看错误详情</summary>
        <pre>{{ errorStack }}</pre>
      </details>
      <button @click="reset">重试</button>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped>
.error-boundary {
  width: 100%;
}
.error-fallback {
  padding: 20px;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  background-color: #fff2f0;
}
.error-message {
  color: #ff4d4f;
  margin: 8px 0;
}
</style>
```

使用错误边界组件：

```vue
<!-- App.vue -->
<script setup lang="ts">
import ErrorBoundary from './components/ErrorBoundary.vue'
import Dashboard from './components/Dashboard.vue'
</script>

<template>
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
</template>
```

**（2）多层错误边界嵌套**

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

// 外层错误边界：捕获所有未被子边界处理的错误
onErrorCaptured((err: unknown) => {
  console.error('[外层边界] 捕获到错误:', err)
  // 可以选择在这里进行全局性的错误处理
  return false
})
</script>

<template>
  <div>
    <header>
      <!-- 头部有自己的错误边界 -->
      <InnerErrorBoundary>
        <AppHeader />
      </InnerErrorBoundary>
    </header>
    <main>
      <!-- 内容区域有自己的错误边界 -->
      <InnerErrorBoundary>
        <RouterView />
      </InnerErrorBoundary>
    </main>
  </div>
</template>
```

**（3）结合异步组件使用**

```vue
<script setup lang="ts">
import { ref, onErrorCaptured, defineAsyncComponent } from 'vue'

const loadFailed = ref(false)

onErrorCaptured((err: unknown) => {
  loadFailed.value = true
  console.error('异步组件加载失败:', err)
  return false
})

// ✅ 异步组件加载错误也会被 onErrorCaptured 捕获
const AsyncChart = defineAsyncComponent(() =>
  import('./HeavyChart.vue')
)
</script>

<template>
  <div v-if="loadFailed" class="fallback">
    <p>图表组件加载失败，请刷新页面重试</p>
    <button @click="loadFailed = false">重新加载</button>
  </div>
  <AsyncChart v-else />
</template>
```

**（4）结合全局错误处理器形成完整错误体系**

```ts
// main.ts — 全局错误处理器（最后一道防线）
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局错误处理器，处理所有未被 onErrorCaptured 拦截的错误
app.config.errorHandler = (err, instance, info) => {
  console.error('[全局错误处理器]', err)
  // 上报到 Sentry、LogRocket 等监控平台
}

app.mount('#app')
```

```vue
<!-- 组件内 — 局部错误拦截 -->
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const localError = ref<string | null>(null)

onErrorCaptured((err: unknown) => {
  localError.value = err instanceof Error ? err.message : String(err)
  // ✅ 返回 false，阻止错误冒泡到全局错误处理器
  return false
})
</script>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| **回调函数** | `(err: unknown, instance: ComponentPublicInstance \| null, info: string) => boolean \| void` | 错误捕获回调 |
| `err` | `unknown` | 抛出的错误对象 |
| `instance` | `ComponentPublicInstance \| null` | 触发错误的组件实例 |
| `info` | `string` | 描述错误来源的信息（如 `"render function"`、`"event handler for click"`） |
| **返回值** | `boolean \| void` | 回调返回 `false` 阻止错误继续向上传播；返回其他值或无返回值则继续传播 |

> 💡 **提示：** `info` 参数是一个字符串，告诉你错误是在什么上下文中产生的。例如：`"setup function"`、`"render function"`、`"event handler for click"`、`"watcher callback"` 等。

---

### 四、实现效果

以下示例演示了 `onErrorCaptured` 的完整工作流程：

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import BuggyChild from './BuggyChild.vue'

const capturedError = ref<string | null>(null)
const errorInfo = ref<string>('')

onErrorCaptured((err: unknown, _instance, info) => {
  capturedError.value = err instanceof Error ? err.message : String(err)
  errorInfo.value = info
  console.log('✅ 父组件已捕获子组件错误')
  console.log('   错误信息:', capturedError.value)
  console.log('   错误来源:', errorInfo.value)
  // 运行后控制台输出：
  // ✅ 父组件已捕获子组件错误
  //    错误信息: 模拟的渲染错误
  //    错误来源: render function
  return false // 阻止继续传播
})
</script>

<template>
  <div>
    <div v-if="capturedError" class="error-panel">
      <p>已捕获错误：{{ capturedError }}</p>
      <p>错误来源：{{ errorInfo }}</p>
      <button @click="capturedError = null">清除</button>
    </div>
    <!-- 子组件抛出错误时，不会导致整个页面崩溃 -->
    <BuggyChild v-else />
  </div>
</template>
```

```vue
<!-- BuggyChild.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const items = ref<string[] | null>(null)

function triggerError() {
  // ❌ 这行代码会抛出 TypeError: Cannot read properties of null
  items.value!.push('new item')
}
</script>

<template>
  <div>
    <button @click="triggerError">点击触发错误</button>
  </div>
</template>
```

**运行效果说明：**

1. 用户点击"点击触发错误"按钮
2. `BuggyChild` 组件中的 `triggerError` 抛出 `TypeError`
3. `Parent.vue` 中的 `onErrorCaptured` 回调被触发
4. 页面展示错误面板，显示错误信息和来源，而不是白屏崩溃
5. 由于返回了 `false`，错误不会继续向上传播到全局错误处理器

---

### 五、使用场景

#### 1. 通用错误边界组件

在大型应用中，使用错误边界包裹高风险组件，避免局部错误导致全局崩溃。

```vue
<!-- components/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

interface Props {
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '组件加载出错，请稍后重试'
})

const hasError = ref(false)

onErrorCaptured((err: unknown) => {
  console.error('[ErrorBoundary]', err)
  hasError.value = true
  return false
})

const retry = () => {
  hasError.value = false
}
</script>

<template>
  <div v-if="hasError" class="error-boundary-fallback">
    <p>{{ fallback }}</p>
    <button @click="retry">重试</button>
  </div>
  <slot v-else />
</template>
```

#### 2. 表单组件错误隔离

在复杂表单中，某个字段组件出错不应影响整个表单。

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import AddressSelector from './AddressSelector.vue'
import DatePicker from './DatePicker.vue'

const fieldErrors = ref<Record<string, string>>({})

onErrorCaptured((err: unknown, instance, info) => {
  const fieldName = (instance?.$props as { fieldName?: string })?.fieldName ?? 'unknown'
  fieldErrors.value[fieldName] = err instanceof Error ? err.message : String(err)
  console.warn(`表单字段 [${fieldName}] 出错:`, info)
  return false
})

const formData = ref({
  name: '',
  address: '',
  date: ''
})
</script>

<template>
  <form>
    <input v-model="formData.name" placeholder="姓名" />

    <div class="field-wrapper">
      <AddressSelector
        v-model="formData.address"
        field-name="address"
      />
      <p v-if="fieldErrors.address" class="field-error">
        地址组件异常: {{ fieldErrors.address }}
      </p>
    </div>

    <div class="field-wrapper">
      <DatePicker
        v-model="formData.date"
        field-name="date"
      />
      <p v-if="fieldErrors.date" class="field-error">
        日期组件异常: {{ fieldErrors.date }}
      </p>
    </div>

    <button type="submit">提交</button>
  </form>
</template>
```

#### 3. 第三方组件容错处理

使用第三方组件库时，第三方组件可能存在未知 bug，用错误边界进行隔离。

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
// 第三方图表组件可能不稳定
import ThirdPartyChart from 'some-chart-library'

const chartError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err: unknown) => {
  chartError.value = true
  errorMessage.value = err instanceof Error ? err.message : '图表加载失败'
  // 上报第三方组件错误
  trackThirdPartyError('ThirdPartyChart', err)
  return false
})

function trackThirdPartyError(component: string, err: unknown) {
  console.warn(`[第三方组件监控] ${component} 出错:`, err)
}
</script>

<template>
  <div class="chart-container">
    <div v-if="chartError" class="chart-fallback">
      <p>图表渲染失败: {{ errorMessage }}</p>
      <button @click="chartError = false">重新加载图表</button>
    </div>
    <ThirdPartyChart v-else :data="chartData" />
  </div>
</template>
```

#### 4. 路由视图级错误捕获

在 `RouterView` 外包裹错误边界，防止单个页面错误影响整个应用布局。

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'

const pageError = ref<string | null>(null)
const errorRoute = ref('')

onErrorCaptured((err: unknown, _instance, info) => {
  pageError.value = err instanceof Error ? err.message : String(err)
  errorRoute.value = info
  return false
})

const goBack = () => {
  pageError.value = null
  window.history.back()
}
</script>

<template>
  <div id="app">
    <AppHeader />
    <main>
      <div v-if="pageError" class="page-error">
        <h2>页面加载出错</h2>
        <p>{{ pageError }}</p>
        <p class="error-detail">错误来源：{{ errorRoute }}</p>
        <button @click="goBack">返回上一页</button>
      </div>
      <RouterView v-else />
    </main>
    <AppFooter />
  </div>
</template>
```

#### 5. 异步数据加载容错

结合 `Suspense` 使用，处理异步数据加载时的异常情况。

```vue
<script setup lang="ts">
import { ref, onErrorCaptured, Suspense } from 'vue'
import AsyncDataLoader from './AsyncDataLoader.vue'

const loadingError = ref<string | null>(null)

onErrorCaptured((err: unknown) => {
  loadingError.value = err instanceof Error ? err.message : String(err)
  return false
})

const retry = () => {
  loadingError.value = null
}
</script>

<template>
  <div class="data-panel">
    <div v-if="loadingError" class="error-state">
      <p>数据加载失败: {{ loadingError }}</p>
      <button @click="retry">重新加载</button>
    </div>
    <Suspense v-else>
      <template #default>
        <AsyncDataLoader />
      </template>
      <template #fallback>
        <div class="loading">加载中...</div>
      </template>
    </Suspense>
  </div>
</template>
```

#### 6. 动态组件切换容错

在动态组件（`<component :is="...">`）切换时，某个组件出错不应影响其他组件的切换。

```vue
<script setup lang="ts">
import { ref, onErrorCaptured, type Component } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'
import TabC from './TabC.vue'

const currentTab = ref<string>('TabA')
const tabError = ref<string | null>(null)

const tabComponents: Record<string, Component> = {
  TabA,
  TabB,
  TabC
}

onErrorCaptured((err: unknown) => {
  tabError.value = err instanceof Error ? err.message : String(err)
  return false
})

const switchTab = (tab: string) => {
  tabError.value = null
  currentTab.value = tab
}
</script>

<template>
  <div>
    <div class="tab-bar">
      <button
        v-for="(_, name) in tabComponents"
        :key="name"
        :class="{ active: currentTab === name }"
        @click="switchTab(name)"
      >
        {{ name }}
      </button>
    </div>
    <div class="tab-content">
      <div v-if="tabError" class="tab-error">
        <p>当前标签页加载出错: {{ tabError }}</p>
        <button @click="tabError = null">重试</button>
      </div>
      <component :is="tabComponents[currentTab]" v-else />
    </div>
  </div>
</template>
```

#### 7. 错误监控与上报

在关键页面组件中捕获错误并上报到监控平台。

```vue
<script setup lang="ts">
import { onErrorCaptured, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onErrorCaptured((err: unknown, instance, info) => {
  // 构建结构化的错误报告
  const errorReport = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack ?? '' : '',
    componentName: instance?.$options?.name ?? 'Anonymous',
    errorSource: info,
    route: route.fullPath,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  }

  // 上报到监控系统
  reportToMonitoring(errorReport)

  // 仍然返回 false 阻止错误传播
  return false
})

async function reportToMonitoring(report: Record<string, unknown>) {
  try {
    await fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
    console.log('✅ 错误已上报到监控系统')
  } catch {
    console.warn('❌ 错误上报失败')
  }
}
</script>

<template>
  <slot />
</template>
```

#### 8. 仪表盘小组件容错

在数据仪表盘中，每个卡片/小组件独立容错，一个组件崩溃不影响其他组件。

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import SalesChart from './widgets/SalesChart.vue'
import UserStats from './widgets/UserStats.vue'
import OrderList from './widgets/OrderList.vue'

interface WidgetError {
  widget: string
  message: string
}

const widgetErrors = ref<WidgetError[]>([])

onErrorCaptured((err: unknown, instance) => {
  const widgetName = (instance?.$options as { name?: string })?.name ?? '未知组件'
  widgetErrors.value.push({
    widget: widgetName,
    message: err instanceof Error ? err.message : String(err)
  })
  return false
})

const dismissError = (index: number) => {
  widgetErrors.value.splice(index, 1)
}
</script>

<template>
  <div class="dashboard">
    <div class="widget-grid">
      <!-- 每个小组件都有独立的错误处理 -->
      <div class="widget-card">
        <div v-if="widgetErrors.find(e => e.widget === 'SalesChart')" class="widget-error">
          <p>销售图表加载失败</p>
          <button @click="dismissError(0)">重试</button>
        </div>
        <SalesChart v-else />
      </div>

      <div class="widget-card">
        <div v-if="widgetErrors.find(e => e.widget === 'UserStats')" class="widget-error">
          <p>用户统计加载失败</p>
        </div>
        <UserStats v-else />
      </div>

      <div class="widget-card">
        <div v-if="widgetErrors.find(e => e.widget === 'OrderList')" class="widget-error">
          <p>订单列表加载失败</p>
        </div>
        <OrderList v-else />
      </div>
    </div>
  </div>
</template>
```

#### 9. 开发环境调试辅助

在开发环境下，利用 `onErrorCaptured` 收集详细的组件错误信息用于调试。

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'

onErrorCaptured((err: unknown, instance, info) => {
  if (import.meta.env.DEV) {
    // 开发环境下输出详细调试信息
    console.group('🔍 [Dev Error Captured]')
    console.error('错误对象:', err)
    console.info('组件实例:', instance)
    console.info('错误来源:', info)
    console.info('组件 Props:', instance?.$props)
    console.info('组件 Data:', instance?.$data)
    console.groupEnd()
  }
  // 开发环境不阻止传播，方便在控制台看到完整错误
  // 生产环境阻止传播，避免白屏
  return !import.meta.env.DEV
})
</script>

<template>
  <slot />
</template>
```

#### 10. 可插拔的模块化错误处理

利用 `onErrorCaptured` 在组件级别实现可配置的错误处理策略。

```vue
<!-- handlers/withErrorHandling.ts -->
<script setup lang="ts">
import { onErrorCaptured, type ComponentPublicInstance } from 'vue'

interface ErrorHandlingOptions {
  /** 是否阻止错误传播 */
  stopPropagation: boolean
  /** 错误回调 */
  onError?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void
  /** 降级 UI 内容 */
  fallback?: string
}

// 可复用的错误处理逻辑
function useErrorBoundary(options: ErrorHandlingOptions) {
  const hasError = ref(false)

  onErrorCaptured((err, instance, info) => {
    hasError.value = true
    options.onError?.(err, instance, info)
    return options.stopPropagation ? false : true
  })

  return { hasError }
}

// 使用时
const { hasError } = useErrorBoundary({
  stopPropagation: true,
  onError: (err, instance, info) => {
    console.error('[自定义处理]', err, info)
    reportToSentry(err)
  },
  fallback: '该模块暂时不可用'
})

import { ref } from 'vue'
function reportToSentry(err: unknown) {
  console.log('上报到 Sentry:', err)
}
</script>
```

---

### 六、注意事项

#### 1. 只捕获后代组件的错误

`onErrorCaptured` **无法捕获当前组件自身**的错误，只能捕获子组件、孙组件等后代组件的错误。

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'

onErrorCaptured((err) => {
  // ❌ 这里捕获不到当前组件 setup 中抛出的错误
  console.error(err)
  return false
})

// 这个错误不会被上面的 onErrorCaptured 捕获
throw new Error('当前组件自身的错误')
</script>
```

```vue
<!-- ✅ 正确：在父组件中捕获子组件的错误 -->
<!-- Parent.vue -->
<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import ChildComponent from './ChildComponent.vue'

onErrorCaptured((err) => {
  // ✅ 可以捕获 ChildComponent 中抛出的错误
  console.error('子组件出错:', err)
  return false
})
</script>

<template>
  <ChildComponent />
</template>
```

#### 2. 返回 `false` 才能阻止错误传播

回调函数必须显式返回 `false` 才能阻止错误继续向上传播。

```ts
// ❌ 错误：没有返回值，错误会继续向上传播
onErrorCaptured((err) => {
  console.error(err)
  // 缺少 return false
})

// ✅ 正确：显式返回 false 阻止传播
onErrorCaptured((err) => {
  console.error(err)
  return false
})
```

#### 3. 异步错误不会被捕获

`onErrorCaptured` 无法捕获 `setTimeout`、`Promise` 等异步回调中抛出的错误。

```vue
<script setup lang="ts">
import { onErrorCaptured, onMounted } from 'vue'

onErrorCaptured((err) => {
  // ❌ 捕获不到 setTimeout 中的错误
  console.error('捕获到:', err)
  return false
})

onMounted(() => {
  // ❌ 这个错误不会被 onErrorCaptured 捕获
  setTimeout(() => {
    throw new Error('异步错误')
  }, 1000)

  // ❌ Promise 中的错误也不会被捕获
  Promise.reject(new Error('Promise 错误'))
})
</script>
```

> ⚠️ **注意：** 对于异步操作中的错误，应使用 `try/catch`、`.catch()` 或 `window.addEventListener('error')` / `window.addEventListener('unhandledrejection')` 来处理。

#### 4. 注册时机必须在 `setup` 同步阶段

`onErrorCaptured` 必须在 `setup()` 函数的同步执行阶段调用，不能在异步回调中注册。

```ts
// ❌ 错误：在异步函数中注册无效
async function setup() {
  await someAsyncOperation()
  onErrorCaptured(() => { /* 无效 */ })
}

// ✅ 正确：在 setup 同步阶段注册
// <script setup> 中直接写就是同步阶段
onErrorCaptured((err) => {
  console.error(err)
  return false
})
```

#### 5. 与 `app.config.errorHandler` 的关系

`onErrorCaptured` 优先于全局 `errorHandler` 执行。如果 `onErrorCaptured` 返回 `false`，全局错误处理器不会收到该错误。

```ts
// 执行顺序：
// 1. 最靠近出错组件的 onErrorCaptured 先触发
// 2. 如果没有返回 false，继续向上冒泡
// 3. 所有 onErrorCaptured 都未拦截 → 触发 app.config.errorHandler
// 4. 如果 errorHandler 也没处理 → 控制台输出 Uncaught Error
```

#### 6. `info` 参数的含义

`info` 字符串可以帮助你定位错误发生的具体上下文：

| info 值 | 含义 |
|---------|------|
| `"render function"` | 渲染函数或模板中出错 |
| `"event handler for click"` | 点击事件处理器中出错 |
| `"setup function"` | setup 函数中出错 |
| `"watcher callback"` | watch 回调中出错 |
| `"mounted hook"` | mounted 生命周期中出错 |
| `"directive hook"` | 自定义指令钩子中出错 |

#### 7. 错误边界组件的 `key` 控制

错误边界组件捕获错误后，内部状态可能已不一致。通过改变 `key` 强制重新创建子组件是更安全的重试方式。

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const retryKey = ref(0)

onErrorCaptured((err) => {
  hasError.value = true
  return false
})

const handleRetry = () => {
  hasError.value = false
  retryKey.value++ // ✅ 通过改变 key 强制重建子组件
}
</script>

<template>
  <div>
    <div v-if="hasError" class="error-fallback">
      <p>组件出错</p>
      <button @click="handleRetry">重试</button>
    </div>
    <!-- key 变化会销毁旧实例，创建新实例 -->
    <div v-else :key="retryKey">
      <slot />
    </div>
  </div>
</template>
```

#### 8. 不要在 `onErrorCaptured` 中抛出错误

在 `onErrorCaptured` 回调中抛出新的错误会导致无限循环或不可预期的行为。

```ts
// ❌ 危险：在错误处理中再次抛出错误
onErrorCaptured((err) => {
  throw new Error('处理错误时又出错了') // 会导致无限循环
})

// ✅ 正确：使用 try/catch 包裹可能出错的处理逻辑
onErrorCaptured((err) => {
  try {
    reportError(err)
  } catch (reportErr) {
    console.warn('错误上报失败:', reportErr)
  }
  return false
})
```

#### 9. `instance` 可能为 `null`

在某些边缘场景下（如函数式组件或异步组件），`instance` 参数可能为 `null`，使用前需要判空。

```ts
onErrorCaptured((err, instance, info) => {
  // ✅ 安全：先检查 instance 是否存在
  const componentName = instance?.$options?.name ?? '未知组件'
  const componentProps = instance?.$props ?? {}

  console.error(`组件 [${componentName}] 出错:`, err)
  return false
})
```

#### 10. 生产环境与开发环境的行为差异

在开发环境下，Vue 会对错误进行更详细的提示；在生产环境中，错误信息会被简化。建议在 `onErrorCaptured` 中根据环境采取不同策略。

```ts
onErrorCaptured((err, instance, info) => {
  if (import.meta.env.DEV) {
    // 开发环境：输出详细调试信息
    console.group('🐛 开发环境错误捕获')
    console.error('错误:', err)
    console.info('组件:', instance)
    console.info('来源:', info)
    console.groupEnd()
  } else {
    // 生产环境：静默上报
    reportToSentry({
      error: err,
      info,
      component: instance?.$options?.name
    })
  }
  return false
})
```

---

### 七、相关 API 对比

| 特性 | `onErrorCaptured` | `app.config.errorHandler` | `errorCaptured`（选项式） |
|------|-------------------|--------------------------|--------------------------|
| **使用方式** | 组合式 API 钩子 | 全局配置 | 选项式 API 生命周期 |
| **作用范围** | 当前组件的后代组件 | 整个应用的所有组件 | 当前组件的后代组件 |
| **能否阻止传播** | 返回 `false` 阻止 | 不能阻止 | 返回 `false` 阻止 |
| **执行优先级** | 先于 `errorHandler` | 后于 `onErrorCaptured` | 先于 `errorHandler` |
| **注册位置** | `setup()` 中 | `main.ts` 中 | 组件选项对象中 |
| **能否捕获自身错误** | 不能 | 能 | 不能 |

```ts
// onErrorCaptured（组合式 API）
onErrorCaptured((err, instance, info) => {
  console.error(err)
  return false
})

// errorHandler（全局）
app.config.errorHandler = (err, instance, info) => {
  console.error(err)
}

// errorCaptured（选项式 API）
export default {
  errorCaptured(err, instance, info) {
    console.error(err)
    return false
  }
}
```

---

### 八、总结

`onErrorCaptured` 是 Vue 3 中构建**健壮应用**的重要工具，其核心价值在于：

1. **局部错误隔离**：通过在组件树的关键位置设置错误边界，防止单个组件的异常导致整个应用崩溃。
2. **优雅降级**：捕获错误后可以展示友好的降级 UI，而非白屏或堆栈信息。
3. **错误监控**：在捕获点统一上报错误信息到监控系统，便于排查线上问题。
4. **灵活控制**：通过返回值控制错误传播链路，支持多层嵌套的错误边界策略。

最佳实践建议：在应用中将 `onErrorCaptured`（局部拦截）和 `app.config.errorHandler`（全局兜底）配合使用，构建一个**分层级的错误处理体系**，既能优雅地处理局部错误，又能兜住所有未被捕获的全局异常。
