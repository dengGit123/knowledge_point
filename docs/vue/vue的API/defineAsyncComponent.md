# defineAsyncComponent

## 作用
`defineAsyncComponent()` 用于定义异步组件，使其只在需要时才加载。这对于代码分割、减少初始加载体积和提升应用性能非常有用。

## 用法

### 基本用法

```text
import { defineAsyncComponent } from 'vue'

// 简单用法
const AsyncComponent = defineAsyncComponent(() =&gt;
  import('./components/MyComponent.vue')
)

// 在模板中使用
// `&lt;template&gt;`
//   &lt;AsyncComponent /&gt;
// `&lt;/template&gt;`
```

### 带选项的异步组件

```text
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  // 加载组件的函数
  loader: () =&gt; import('./components/MyComponent.vue'),

  // 加载中显示的组件
  loadingComponent: LoadingComponent,

  // 加载失败的组件
  errorComponent: ErrorComponent,

  // 延迟显示 loading 组件的时间（默认 200ms）
  delay: 200,

  // 超时时间（默认 Infinity）
  timeout: 3000,

  // 组件可以被挂载前的延迟时间
  suspensible: false,

  // 错误重试的次数
  onError(error, retry, fail) {
    // error: 错误对象
    // retry: 重试函数
    // fail: 失败函数

    if (error.message.includes('fetch')) {
      retry() // 重试
    } else {
      fail() // 失败
    }
  }
})
```

### 在组件中使用

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

// 定义异步组件
const HeavyComponent = defineAsyncComponent(() =&gt;
  import('./HeavyComponent.vue')
)

const ModalComponent = defineAsyncComponent(() =&gt;
  import('./ModalComponent.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="showModal = true"&gt;打开弹窗&lt;/button&gt;

    &lt;!-- 条件渲染异步组件 --&gt;
    &lt;ModalComponent v-if="showModal" @close="showModal = false" /&gt;

    &lt;!-- 使用 Suspense 包裹 --&gt;
    &lt;Suspense&gt;
      `&lt;template&gt;`
        &lt;HeavyComponent /&gt;
      `&lt;/template&gt;`

      `&lt;template&gt;`
        &lt;div&gt;加载中...&lt;/div&gt;
      `&lt;/template&gt;`
    &lt;/Suspense&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 与路由结合使用

```text
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () =&gt; import('@/views/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () =&gt; import('@/views/About.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      // 使用 defineAsyncComponent
      component: defineAsyncComponent(() =&gt;
        import('@/views/Admin.vue')
      ),
      meta: { requiresAuth: true }
    }
  ]
})
```

### 返回 Promise 的工厂函数

```text
// 基本用法
const AsyncComp = defineAsyncComponent(() =&gt;
  new Promise((resolve) =&gt; {
    setTimeout(() =&gt; {
      resolve({
        template: '&lt;div&gt;I am async!&lt;/div&gt;'
      })
    }, 1000)
  })
)

// 带错误处理
const AsyncWithError = defineAsyncComponent(() =&gt; {
  return new Promise((resolve, reject) =&gt; {
    setTimeout(() =&gt; {
      if (Math.random() &gt; 0.5) {
        resolve({
          template: '&lt;div&gt;Success!&lt;/div&gt;'
        })
      } else {
        reject(new Error('Random failure'))
      }
    }, 1000)
  })
})
```

### 配合 Suspense 使用

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =&gt;
  import('./AsyncComponent.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    `&lt;template&gt;`
      &lt;AsyncComponent /&gt;
    `&lt;/template&gt;`

    `&lt;template&gt;`
      &lt;div class="loading"&gt;
        &lt;span&gt;加载中...&lt;/span&gt;
      &lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`

&lt;style&gt;
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
&lt;/style&gt;
```

### 动态导入参数

```text
// 根据条件导入不同的组件
const AsyncComponent = defineAsyncComponent(() =&gt; {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (isMobile) {
    return import('./components/MobileLayout.vue')
  } else {
    return import('./components/DesktopLayout.vue')
  }
})

// 根据用户权限导入
const AdminPanel = defineAsyncComponent(async () =&gt; {
  const { isAdmin } = await import('./utils/auth.js')
  const module = isAdmin()
    ? await import('./components/AdminPanel.vue')
    : await import('./components/UserPanel.vue')
  return module
})
```

### TypeScript 支持

```text
import { defineAsyncComponent } from 'vue'

// 推导组件类型
const AsyncComponent = defineAsyncComponent&lt;
  ComponentType & {
    exposedMethod: () =&gt; void
  }&gt;(() =&gt; import('./MyComponent.vue'))

// 使用
// &lt;AsyncComponent ref="compRef" /&gt;
// compRef.exposedMethod()
```

### 全局注册异步组件

```text
import { createApp, defineAsyncComponent } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局注册异步组件
app.component('GlobalAsync', defineAsyncComponent(() =&gt;
  import('./components/GlobalAsync.vue')
))

// 任何地方都可以使用
// `&lt;template&gt;`
//   &lt;GlobalAsync /&gt;
// `&lt;/template&gt;`
```

### 嵌套异步组件

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

const ParentAsync = defineAsyncComponent(() =&gt;
  import('./ParentAsync.vue')
)

// ParentAsync.vue 内部也有异步组件
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Suspense&gt;
    &lt;ParentAsync /&gt;
    `&lt;template&gt;`
      &lt;div&gt;加载父组件中...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. 组件加载状态

```text
const AsyncComp = defineAsyncComponent({
  loader: () =&gt; import('./MyComponent.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200 // 延迟 200ms 后显示 loading
})

// 如果组件在 200ms 内加载完成，不会显示 loading 状态
```

### 2. 错误处理

```text
const AsyncComp = defineAsyncComponent({
  loader: () =&gt; import('./MyComponent.vue'),
  errorComponent: ErrorDisplay,
  timeout: 5000, // 5 秒超时
  onError(error, retry, fail) {
    if (error.message.includes('timeout')) {
      retry() // 超时重试
    } else {
      fail() // 其他错误直接失败
    }
  }
})
```

### 3. 与 v-if 的配合

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent } from 'vue'

const show = ref(false)
const AsyncComp = defineAsyncComponent(() =&gt;
  import('./AsyncComp.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="show = true"&gt;显示组件&lt;/button&gt;

  &lt;!-- 只有在 show 为 true 时才会加载组件 --&gt;
  &lt;AsyncComp v-if="show" /&gt;
`&lt;/template&gt;`
```

### 4. 避免重复加载

```text
// Vue 会缓存已加载的组件
const AsyncComp = defineAsyncComponent(() =&gt; import('./MyComponent.vue'))

// 多次使用不会重复加载
// &lt;AsyncComp /&gt;
// &lt;AsyncComp /&gt;
// &lt;AsyncComp /&gt;
```

### 5. 服务端渲染 (SSR)

```text
// SSR 中需要特殊处理
const AsyncComp = defineAsyncComponent({
  loader: () =&gt; import('./MyComponent.vue'),
  suspensible: false // 禁用 Suspense 支持
})

// 或使用 SSR 友好的加载方式
if (import.meta.env.SSR) {
  // 服务端：直接导入
  const AsyncComp = defineComponent(MyComponent)
} else {
  // 客户端：异步加载
  const AsyncComp = defineAsyncComponent(() =&gt; import('./MyComponent.vue'))
}
```

### 6. 与 Teleport 配合

```text
`&lt;script setup&gt;`
import { defineAsyncComponent } from 'vue'

const AsyncModal = defineAsyncComponent(() =&gt;
  import('./AsyncModal.vue')
)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;Teleport to="body"&gt;
    &lt;Suspense&gt;
      &lt;AsyncModal v-if="showModal" /&gt;
      `&lt;template&gt;`
        &lt;div class="modal-backdrop"&gt;
          &lt;div class="modal-loading"&gt;加载中...&lt;/div&gt;
        &lt;/div&gt;
      `&lt;/template&gt;`
    &lt;/Suspense&gt;
  &lt;/Teleport&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 条件加载的大型组件

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent } from 'vue'

const showChart = ref(false)

const HeavyChart = defineAsyncComponent({
  loader: () =&gt; import('./HeavyChart.vue'),
  loadingComponent: () =&gt; h('div', 'Loading chart...'),
  delay: 300
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="showChart = !showChart"&gt;
      {{ showChart ? '隐藏' : '显示' }}图表
    &lt;/button&gt;

    &lt;Suspense v-if="showChart"&gt;
      `&lt;template&gt;`
        &lt;HeavyChart :data="chartData" /&gt;
      `&lt;/template&gt;`
      `&lt;template&gt;`
        &lt;div class="chart-placeholder"&gt;
          &lt;span&gt;图表加载中...&lt;/span&gt;
        &lt;/div&gt;
      `&lt;/template&gt;`
    &lt;/Suspense&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 代码分割和路由懒加载

```text
// router/index.js
import { createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () =&gt; import('@/views/Home.vue')
  },
  {
    path: '/dashboard',
    component: () =&gt; import('@/views/Dashboard.vue')
  },
  {
    path: '/settings',
    component: () =&gt; import('@/views/Settings.vue')
  }
]

// 为每个路由创建单独的 chunk
// webpack 会自动分割代码
```

### 3. 功能模块按需加载

```text
// 根据用户权限加载不同的组件
const AdminPanel = defineAsyncComponent(async () =&gt; {
  const { hasPermission } = await import('@/utils/permissions')

  if (hasPermission('admin')) {
    return import('@/components/admin/AdminPanel.vue')
  } else {
    return import('@/components/user/UserPanel.vue')
  }
})
```

### 4. 图表库懒加载

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent } from 'vue'

const showChart = ref(false)

const ChartLibrary = defineAsyncComponent({
  loader: async () =&gt; {
    // 延迟加载图表库
    const module = await import('echarts')
    await import('echarts/lib/chart/bar')
    await import('echarts/lib/component/tooltip')
    return module
  },
  delay: 500
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="showChart = true"&gt;显示图表&lt;/button&gt;

  &lt;Suspense v-if="showChart"&gt;
    `&lt;template&gt;`
      &lt;ChartLibrary :option="chartOption" /&gt;
    `&lt;/template&gt;`
    `&lt;template&gt;`
      &lt;div&gt;图表库加载中...&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/Suspense&gt;
`&lt;/template&gt;`
```

### 5. 编辑器组件懒加载

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent } from 'vue'

const isEditing = ref(false)

const CodeEditor = defineAsyncComponent({
  loader: () =&gt; import('@/components/CodeEditor.vue'),
  loadingComponent: () =&gt; h('div', { class: 'editor-placeholder' }, '编辑器加载中...'),
  delay: 200,
  timeout: 10000
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="isEditing = !isEditing"&gt;
      {{ isEditing ? '完成' : '编辑' }}
    &lt;/button&gt;

    &lt;Suspense v-if="isEditing"&gt;
      `&lt;template&gt;`
        &lt;CodeEditor v-model="code" /&gt;
      `&lt;/template&gt;`
      `&lt;template&gt;`
        &lt;div class="editor-loading"&gt;
          &lt;span&gt;编辑器加载中...&lt;/span&gt;
        &lt;/div&gt;
      `&lt;/template&gt;`
    &lt;/Suspense&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 地图组件懒加载

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent } from 'vue'

const showMap = ref(false)

const MapComponent = defineAsyncComponent({
  loader: async () =&gt; {
    // 动态导入地图库
    await import('leaflet/dist/leaflet.css')
    return import('@/components/MapComponent.vue')
  },
  delay: 300,
  onError(error, retry, fail) {
    if (error.message.includes('network')) {
      console.log('网络错误，重试中...')
      setTimeout(() =&gt; retry(), 2000)
    } else {
      fail()
    }
  }
})
`&lt;/script&gt;`
```

### 7. 第三方组件库按需加载

```text
// 只在需要时加载特定的组件
const DatePicker = defineAsyncComponent(() =&gt;
  import('element-plus/lib/date-picker')
)

const Upload = defineAsyncComponent(() =&gt;
  import('element-plus/lib/upload')
)

// 而不是导入整个库
// import { ElDatePicker, ElUpload } from 'element-plus'
```

### 8. 虚拟滚动组件懒加载

```text
`&lt;script setup&gt;`
import { ref, defineAsyncComponent, computed } from 'vue'

const items = ref([])

const VirtualScroller = defineAsyncComponent({
  loader: () =&gt; import('vue-virtual-scroller/src/VirtualScroller.vue'),
  delay: 200
})

// 只有在列表很长时才加载虚拟滚动组件
const useVirtualScroll = computed(() =&gt; items.value.length &gt; 100)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;VirtualScroller v-if="useVirtualScroll" :items="items"&gt;
    `&lt;template&gt;`
      &lt;div&gt;{{ item.name }}&lt;/div&gt;
    `&lt;/template&gt;`
  &lt;/VirtualScroller&gt;

  &lt;div v-else&gt;
    &lt;div v-for="item in items" :key="item.id"&gt;
      {{ item.name }}
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 9. 带重试机制的组件加载

```text
const AsyncComponent = defineAsyncComponent({
  loader: () =&gt; import('./Component.vue'),
  onError(error, retry, fail) {
    if (error.message.match(/fetch/)) {
      // 处理 fetch 错误，重试
      retry()
    } else if (error.message.match(/timeout/)) {
      // 超时错误，延迟后重试
      setTimeout(() =&gt; retry(), 2000)
    } else {
      // 其他错误，直接失败
      fail()
    }
  }
})
```

### 10. 预加载组件

```text
// 鼠标悬停时预加载
const preloadComponent = () =&gt; {
  import('./HeavyComponent.vue')
}

// 或在路由导航时预加载
router.beforeEach((to, from, next) =&gt; {
  if (to.path === '/dashboard') {
    // 预加载 dashboard 组件
    import('@/views/Dashboard.vue')
  }
  next()
})
```

## defineAsyncComponent 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| loader | () => Promise&lt;Component> | - | 返回组件的函数 |
| loadingComponent | Component | - | 加载中显示的组件 |
| errorComponent | Component | - | 加载失败显示的组件 |
| delay | number | 200 | 延迟显示 loading 的时间 |
| timeout | number | Infinity | 超时时间 |
| suspensible | boolean | true | 是否可被 Suspense 控制 |
| onError | (error, retry, fail) => void | - | 错误处理函数 |

## 最佳实践

1. **大型组件**：对于大型组件使用异步加载
2. **路由懒加载**：所有路由组件都应异步加载
3. **错误处理**：提供 errorComponent 和 onError 处理
4. **用户体验**：设置合适的 delay 和 loadingComponent
5. **预加载**：对于重要组件考虑预加载
