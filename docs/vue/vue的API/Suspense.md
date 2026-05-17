# Suspense

## 作用
`Suspense` 是一个用于处理异步组件的内置组件，它可以在等待异步组件加载时显示后备内容（fallback），提升用户体验。

## 用法

### 基本用法

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>

<template>
  <Suspense>
    <!-- 默认插槽：异步内容 -->
    <template #default>
      <AsyncComponent />
    </template>

    <!-- fallback 插槽：加载状态 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

### 多个异步组件

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const Header = defineAsyncComponent(() => import('./Header.vue'))
const Content = defineAsyncComponent(() => import('./Content.vue'))
const Footer = defineAsyncComponent(() => import('./Footer.vue'))
</script>

<template>
  <Suspense>
    <template #default>
      <Header />
      <Content />
      <Footer />
    </template>

    <template #fallback>
      <div>Loading page...</div>
    </template>
  </Suspense>
</template>
```

### 嵌套 Suspense

```vue
<template>
  <!-- 外层 Suspense -->
  <Suspense>
    <template #default>
      <div>
        <h1>Main Content</h1>

        <!-- 内层 Suspense -->
        <Suspense>
          <template #default>
            <AsyncComponent />
          </template>
          <template #fallback>
            <div>Loading inner component...</div>
          </template>
        </Suspense>
      </div>
    </template>

    <template #fallback>
      <div>Loading main content...</div>
    </template>
  </Suspense>
</template>
```

### 与 async setup() 配合

```vue
<!-- AsyncComponent.vue -->
<script setup>
import { ref } from 'vue'

// 使用 async setup
const posts = ref([])

// 这会使组件成为异步组件
posts.value = await fetch('/api/posts').then(r => r.json())
</script>

<template>
  <div>
    <h1>Posts</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>
```

### 错误处理

```vue
<script setup>
import { ref } from 'vue'

const error = ref(null)

async function loadData() {
  try {
    // 加载数据
  } catch (e) {
    error.value = e
  }
}
</script>

<template>
  <Suspense>
    <template #default>
      <AsyncComponent @error="error = $event" />
    </template>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>

  <!-- 错误显示 -->
  <div v-if="error" class="error">
    {{ error.message }}
  </div>
</template>
```

### 组件事件处理

```vue
<script setup>
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
</script>

<template>
  <Suspense
    @resolve="onResolve"
    @pending="onPending"
    @fallback="onFallback"
  >
    <template #default>
      <AsyncComponent :data="data" />
    </template>

    <template #fallback>
      <div v-if="isLoading">Loading...</div>
    </template>
  </Suspense>
</template>
```

### 动态组件

```vue
<script setup>
import { ref, defineAsyncComponent, computed } from 'vue'

const currentView = ref('home')

const views = {
  home: defineAsyncComponent(() => import('./Home.vue')),
  about: defineAsyncComponent(() => import('./About.vue')),
  contact: defineAsyncComponent(() => import('./Contact.vue'))
}

const currentComponent = computed(() => views[currentView.value])
</script>

<template>
  <nav>
    <button @click="currentView = 'home'">Home</button>
    <button @click="currentView = 'about'">About</button>
    <button @click="currentView = 'contact'">Contact</button>
  </nav>

  <Suspense>
    <template #default>
      <component :is="currentComponent" />
    </template>

    <template #fallback>
      <div>Loading {{ currentView }}...</div>
    </template>
  </Suspense>
</template>
```

### 超时处理

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const timeout = ref(false)
const error = ref(null)

let timeoutId = null

onErrorCaptured((err) => {
  error.value = err
  return true
})

function startTimeout() {
  timeoutId = setTimeout(() => {
    timeout.value = true
  }, 5000)
}

function clearTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}
</script>

<template>
  <Suspense @pending="startTimeout" @resolve="clearTimeout">
    <template #default>
      <AsyncComponent v-if="!timeout" />
      <div v-else class="timeout">Loading timeout</div>
    </template>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

## 注意事项

### 1. Suspense 是实验性的

```javascript
// Vue 3.0-3.2.x 中 Suspense 是实验性功能
// Vue 3.3+ 中仍然是实验性的
// 使用时需要注意 API 可能变化
```

### 2. 只能用于嵌套组件

```vue
<template>
  <!-- ✅ 正确：Suspense 包裹子组件 -->
  <Suspense>
    <ChildComponent />
  </Suspense>

  <!-- ❌ 错误：根组件不能是 Suspense -->
  <!-- 在 main.js 中 -->
  <!-- <Suspense>
    <App />
  </Suspense> -->
</template>
```

### 3. 与 v-if 的配合

```vue
<script setup>
import { ref } from 'vue'

const show = ref(true)
const AsyncComp = defineAsyncComponent(() => import('./AsyncComp.vue'))
</script>

<template>
  <Suspense>
    <!-- 条件渲染的异步组件 -->
    <template #default>
      <AsyncComp v-if="show" />
    </template>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

### 4. 多个异步依赖的解析

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 所有依赖都解析后才显示内容
const ComponentA = defineAsyncComponent(() => import('./A.vue'))
const ComponentB = defineAsyncComponent(() => import('./B.vue'))
const ComponentC = defineAsyncComponent(() => import('./C.vue'))
</script>

<template>
  <Suspense>
    <template #default>
      <!-- 所有组件加载完成后一起显示 -->
      <div>
        <ComponentA />
        <ComponentB />
        <ComponentC />
      </div>
    </template>

    <template #fallback>
      <div>Loading components...</div>
    </template>
  </Suspense>
</template>
```

### 5. 与 defineAsyncComponent 的配合

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
</script>

<template>
  <!-- Suspense 和 defineAsyncComponent 可以一起使用 -->
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

### 6. 事件触发顺序

```vue
<script setup>
import { ref } from 'vue'

const events = ref([])

function logEvent(event) {
  events.value.push(event)
}
</script>

<template>
  <Suspense
    @pending="logEvent('pending')"
    @resolve="logEvent('resolve')"
    @fallback="logEvent('fallback')"
  >
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>

  <div>Events: {{ events }}</div>
</template>
```

### 7. 与 provide/inject 的兼容性

```vue
<!-- 父组件 -->
<script setup>
import { provide } from 'vue'

provide('theme', 'dark')
</script>

<template>
  <Suspense>
    <template #default>
      <!-- 异步子组件可以注入父组件提供的数据 -->
      <AsyncChild />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

### 8. 模板引用访问

```vue
<script setup>
import { ref, onMounted } from 'vue'

const asyncComponentRef = ref(null)

onMounted(async () => {
  // 在 Suspense 解析后可以访问组件引用
  // 但需要等待异步操作完成
})
</script>

<template>
  <Suspense>
    <template #default>
      <AsyncComponent ref="asyncComponentRef" />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

## 使用场景

### 1. 路由级代码分割

```vue
<!-- router/index.js -->
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// App.vue
<template>
  <Suspense>
    <template #default>
      <router-view />
    </template>
    <template #fallback>
      <PageLoader />
    </template>
  </Suspense>
</template>
```

### 2. 数据预加载

```vue
<script setup>
import { ref } from 'vue'

const user = ref(null)
const posts = ref([])

// 在 setup 中异步加载数据
async function loadUserData() {
  const userData = await fetch('/api/user').then(r => r.json())
  user.value = userData
}

async function loadPosts() {
  const postsData = await fetch('/api/posts').then(r => r.json())
  posts.value = postsData
}

// 并行加载
await Promise.all([loadUserData(), loadPosts()])
</script>

<template>
  <Suspense>
    <template #default>
      <div>
        <h1>{{ user.name }}</h1>
        <ul>
          <li v-for="post in posts" :key="post.id">
            {{ post.title }}
          </li>
        </ul>
      </div>
    </template>

    <template #fallback>
      <div>Loading user data and posts...</div>
    </template>
  </Suspense>
</template>
```

### 3. 懒加载图片

```vue
<script setup>
import { ref } from 'vue'

const images = ref([])

// 异步加载图片列表
async function loadImages() {
  const data = await fetch('/api/images').then(r => r.json())
  images.value = data
}

await loadImages()
</script>

<template>
  <Suspense>
    <template #default>
      <div class="image-grid">
        <img
          v-for="img in images"
          :key="img.id"
          :src="img.url"
          :alt="img.alt"
        />
      </div>
    </template>

    <template #fallback>
      <div>Loading images...</div>
    </template>
  </Suspense>
</template>
```

### 4. 异步表单

```vue
<script setup>
import { ref } from 'vue'

const formSchema = ref(null)

// 异步加载表单配置
formSchema.value = await fetch('/api/form-schema').then(r => r.json())
</script>

<template>
  <Suspense>
    <template #default>
      <DynamicForm :schema="formSchema" />
    </template>

    <template #fallback>
      <div>Loading form...</div>
    </template>
  </Suspense>
</template>
```

### 5. 条件内容加载

```vue
<script setup>
import { ref, defineAsyncComponent } from 'vue'

const showDetails = ref(false)

const DetailsComponent = defineAsyncComponent(() =>
  import('./DetailsComponent.vue')
)
</script>

<template>
  <button @click="showDetails = true">显示详情</button>

  <Suspense v-if="showDetails">
    <template #default>
      <DetailsComponent />
    </template>

    <template #fallback>
      <div>Loading details...</div>
    </template>
  </Suspense>
</template>
```

### 6. 渐进式加载

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 首先加载关键内容
const CriticalContent = defineAsyncComponent(() =>
  import('./CriticalContent.vue')
)

// 然后加载辅助内容
const AuxiliaryContent = defineAsyncComponent(() =>
  import('./AuxiliaryContent.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <div>
        <CriticalContent />

        <!-- 内层 Suspense 实现渐进式加载 -->
        <Suspense>
          <template #default>
            <AuxiliaryContent />
          </template>
          <template #fallback>
            <div>Loading auxiliary content...</div>
          </template>
        </Suspense>
      </div>
    </template>

    <template #fallback>
      <div>Loading critical content...</div>
    </template>
  </Suspense>
</template>
```

## Suspense 生命周期

```
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
