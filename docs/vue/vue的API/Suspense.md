# Suspense

## 作用
`Suspense` 是一个用于处理异步组件的内置组件，它可以在等待异步组件加载时显示后备内容（fallback），提升用户体验。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

// 异步组件
const AsyncComponent = defineAsyncComponent(() =&gt;
  import('./AsyncComponent.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    &lt;!-- 默认插槽：异步内容 --&gt;
    `&lt;template&gt;`
      &lt;AsyncComponent /&gt;
    `&lt;/template&gt;`

    &lt;!-- fallback 插槽：加载状态 --&gt;
    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 多个异步组件

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

const Header = defineAsyncComponent(() =&gt; import('./Header.vue'))
const Content = defineAsyncComponent(() =&gt; import('./Content.vue'))
const Footer = defineAsyncComponent(() =&gt; import('./Footer.vue'))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;Header /&gt;
      &lt;Content /&gt;
      &lt;Footer /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading page...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 嵌套 Suspense

```text
`&lt;template&gt;`
  &lt;!-- 外层 Suspense --&gt;
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;div&gt;
        &lt;h1&gt;Main Content&lt;/h1&gt;

        &lt;!-- 内层 Suspense --&gt;
        &lt;Suspense&gt;
          `&lt;template&gt;`
            &lt;AsyncComponent /&gt;
          `&lt;/template&gt;`
          `&lt;template&gt;`
            &lt;div&gt;Loading inner component...&lt;/div&gt;
          `&lt;/template&gt;`
        &lt;/Suspense&gt;
      &lt;/div&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading main content...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 与 async setup() 配合

```text
&lt;!-- AsyncComponent.vue --&gt;
`&lt;script setup&gt;`
import { ref } from 'vue'

// 使用 async setup
const posts = ref([])

// 这会使组件成为异步组件
posts.value = await fetch('/api/posts').then(r =&gt; r.json())
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;h1&gt;Posts&lt;/h1&gt;
    &lt;ul&gt;
      &lt;li v-for="post in posts" :key="post.id"&gt;
        {{ post.title }}
      &lt;/li&gt;
    &lt;/ul&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 错误处理

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const error = ref(null)

async function loadData() {
  try {
    // 加载数据
  } catch (e) {
    error.value = e
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;AsyncComponent @error="error = $event" /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;

  &lt;!-- 错误显示 --&gt;
  &lt;div v-if="error" class="error"&gt;
    {{ error.message }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 组件事件处理

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const isLoading = ref(true)
const data = ref(null)

function onResolve() {
  console.log('Async component resolved')
  isLoading.value = false
}

function onPending() {
  console.log('Async component pending')
  isLoading.value = true
}

function onFallback() {
  console.log('Showing fallback')
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense
    @resolve="onResolve"
    @pending="onPending"
    @fallback="onFallback"
  &gt;
    `&lt;template&gt;`
      &lt;AsyncComponent :data="data" /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div v-if="isLoading"&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 动态组件

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent, computed } from 'vue'

const currentView = ref('home')

const views = {
  home: defineAsyncComponent(() =&gt; import('./Home.vue')),
  about: defineAsyncComponent(() =&gt; import('./About.vue')),
  contact: defineAsyncComponent(() =&gt; import('./Contact.vue'))
}

const currentComponent = computed(() =&gt; views[currentView.value])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;nav&gt;
    &lt;button @click="currentView = 'home'"&gt;Home&lt;/button&gt;
    &lt;button @click="currentView = 'about'"&gt;About&lt;/button&gt;
    &lt;button @click="currentView = 'contact'"&gt;Contact&lt;/button&gt;
  &lt;/nav&gt;

  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;component :is="currentComponent" /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading {{ currentView }}...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 超时处理

```text
`&lt;script setup&gt;`
import { ref, onErrorCaptured } from 'vue'

const timeout = ref(false)
const error = ref(null)

let timeoutId = null

onErrorCaptured((err) =&gt; {
  error.value = err
  return true
})

function startTimeout() {
  timeoutId = setTimeout(() =&gt; {
    timeout.value = true
  }, 5000)
}

function clearTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense @pending="startTimeout" @resolve="clearTimeout"&gt;
    `&lt;template&gt;`
      &lt;AsyncComponent v-if="!timeout" /&gt;
      &lt;div v-else class="timeout"&gt;Loading timeout&lt;/div&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. Suspense 是实验性的

```text
// Vue 3.0-3.2.x 中 Suspense 是实验性功能
// Vue 3.3+ 中仍然是实验性的
// 使用时需要注意 API 可能变化
```

### 2. 只能用于嵌套组件

```text
`&lt;template&gt;`
  &lt;!-- ✅ 正确：Suspense 包裹子组件 --&gt;
  &lt;Suspense&gt;
    &lt;ChildComponent /&gt;
  &lt;/Suspense&gt;

  &lt;!-- ❌ 错误：根组件不能是 Suspense --&gt;
  &lt;!-- 在 main.js 中 --&gt;
  &lt;!-- &lt;Suspense&gt;
    &lt;App /&gt;
  &lt;/Suspense&gt; --&gt;
`&lt;/template&gt;`
```

### 3. 与 v-if 的配合

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const show = ref(true)
const AsyncComp = defineAsyncComponent(() =&gt; import('./AsyncComp.vue'))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    &lt;!-- 条件渲染的异步组件 --&gt;
    `&lt;template&gt;`
      &lt;AsyncComp v-if="show" /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 4. 多个异步依赖的解析

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

// 所有依赖都解析后才显示内容
const ComponentA = defineAsyncComponent(() =&gt; import('./A.vue'))
const ComponentB = defineAsyncComponent(() =&gt; import('./B.vue'))
const ComponentC = defineAsyncComponent(() =&gt; import('./C.vue'))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;!-- 所有组件加载完成后一起显示 --&gt;
      &lt;div&gt;
        &lt;ComponentA /&gt;
        &lt;ComponentB /&gt;
        &lt;ComponentC /&gt;
      &lt;/div&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading components...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 5. 与 defineAsyncComponent 的配合

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () =&gt; import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- Suspense 和 defineAsyncComponent 可以一起使用 --&gt;
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;AsyncComponent /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 6. 事件触发顺序

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const events = ref([])

function logEvent(event) {
  events.value.push(event)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense
    @pending="logEvent('pending')"
    @resolve="logEvent('resolve')"
    @fallback="logEvent('fallback')"
  &gt;
    `&lt;template&gt;`
      &lt;AsyncComponent /&gt;
    `&lt;/template&gt;`
    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;

  &lt;div&gt;Events: {{ events }}&lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 与 provide/inject 的兼容性

```text
&lt;!-- 父组件 --&gt;
`&lt;script setup&gt;`
import { provide } from 'vue'

provide('theme', 'dark')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;!-- 异步子组件可以注入父组件提供的数据 --&gt;
      &lt;AsyncChild /&gt;
    `&lt;/template&gt;`
    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 8. 模板引用访问

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const asyncComponentRef = ref(null)

onMounted(async () =&gt; {
  // 在 Suspense 解析后可以访问组件引用
  // 但需要等待异步操作完成
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;AsyncComponent ref="asyncComponentRef" /&gt;
    `&lt;/template&gt;`
    `&lt;template&gt;`
      &lt;div&gt;Loading...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 路由级代码分割

```text
&lt;!-- router/index.js --&gt;
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () =&gt; import('@/views/Home.vue')
  },
  {
    path: '/about',
    component: () =&gt; import('@/views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// App.vue
`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;router-view /&gt;
    `&lt;/template&gt;`
    `&lt;template&gt;`
      &lt;PageLoader /&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 2. 数据预加载

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const user = ref(null)
const posts = ref([])

// 在 setup 中异步加载数据
async function loadUserData() {
  const userData = await fetch('/api/user').then(r =&gt; r.json())
  user.value = userData
}

async function loadPosts() {
  const postsData = await fetch('/api/posts').then(r =&gt; r.json())
  posts.value = postsData
}

// 并行加载
await Promise.all([loadUserData(), loadPosts()])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;div&gt;
        &lt;h1&gt;{{ user.name }}&lt;/h1&gt;
        &lt;ul&gt;
          &lt;li v-for="post in posts" :key="post.id"&gt;
            {{ post.title }}
          &lt;/li&gt;
        &lt;/ul&gt;
      &lt;/div&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading user data and posts...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 3. 懒加载图片

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const images = ref([])

// 异步加载图片列表
async function loadImages() {
  const data = await fetch('/api/images').then(r =&gt; r.json())
  images.value = data
}

await loadImages()
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;div class="image-grid"&gt;
        &lt;img
          v-for="img in images"
          :key="img.id"
          :src="img.url"
          :alt="img.alt"
        /&gt;
      &lt;/div&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading images...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 4. 异步表单

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const formSchema = ref(null)

// 异步加载表单配置
formSchema.value = await fetch('/api/form-schema').then(r =&gt; r.json())
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;DynamicForm :schema="formSchema" /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading form...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 5. 条件内容加载

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent } from 'vue'

const showDetails = ref(false)

const DetailsComponent = defineAsyncComponent(() =&gt;
  import('./DetailsComponent.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="showDetails = true"&gt;显示详情&lt;/button&gt;

  &lt;Suspense v-if="showDetails"&gt;
    `&lt;template&gt;`
      &lt;DetailsComponent /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading details...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 6. 渐进式加载

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

// 首先加载关键内容
const CriticalContent = defineAsyncComponent(() =&gt;
  import('./CriticalContent.vue')
)

// 然后加载辅助内容
const AuxiliaryContent = defineAsyncComponent(() =&gt;
  import('./AuxiliaryContent.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;div&gt;
        &lt;CriticalContent /&gt;

        &lt;!-- 内层 Suspense 实现渐进式加载 --&gt;
        &lt;Suspense&gt;
          `&lt;template&gt;`
            &lt;AuxiliaryContent /&gt;
          `&lt;/template&gt;`
          `&lt;template&gt;`
            &lt;div&gt;Loading auxiliary content...&lt;/div&gt;
          `&lt;/template&gt;`
        &lt;/Suspense&gt;
      &lt;/div&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div&gt;Loading critical content...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

## Suspense 生命周期

```text
pending (异步操作进行中)
    ↓
fallback (显示后备内容)
    ↓
resolve (异步操作完成)
    ↓
default (显示实际内容)
```

## 最佳实践

1. **提供有意义的 fallback**：给用户明确的加载状态
2. **错误处理**：配合错误边界处理加载失败
3. **超时处理**：设置合理的超时时间
4. **渐进式加载**：使用嵌套 Suspense 实现渐进式加载
5. **性能优化**：对大型组件进行代码分割
