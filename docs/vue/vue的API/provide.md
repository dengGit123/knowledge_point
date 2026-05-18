# provide

## 作用
`provide()` 用于提供一个值，可以被后代组件注入。它是 Vue 3 依赖注入系统的一部分，用于跨层级组件通信，避免 props 逐层传递。

## 用法

### 基本用法

```text
&lt;!-- 祖先组件 --&gt;
`&lt;script setup&gt;`
import { provide, ref } from 'vue'

const message = ref('Hello from ancestor')

// 提供响应式数据
provide('message', message)

// 提供只读数据
provide('config', { theme: 'dark' })

// 提供方法
provide('updateMessage', (newMsg) =&gt; {
  message.value = newMsg
})
`&lt;/script&gt;`
```

### 提供响应式数据

```text
`&lt;script setup&gt;`
import { provide, ref, reactive } from 'vue'

// 使用 ref
const count = ref(0)
provide('count', count)

// 使用 reactive
const user = reactive({
  name: 'Vue',
  age: 3
})
provide('user', user)

// 提供只读的响应式数据
import { readonly } from 'vue'
const config = reactive({ theme: 'dark' })
provide('config', readonly(config))
`&lt;/script&gt;`
```

### 提供计算属性

```text
`&lt;script setup&gt;`
import { provide, computed, ref } from 'vue'

const count = ref(0)
const double = computed(() =&gt; count.value * 2)

provide('double', double)
`&lt;/script&gt;`
```

### 提供方法/函数

```text
`&lt;script setup&gt;`
import { provide, ref } from 'vue'

const isVisible = ref(true)

provide('toggle', () =&gt; {
  isVisible.value = !isVisible.value
})

provide('show', () =&gt; {
  isVisible.value = true
})

provide('hide', () =&gt; {
  isVisible.value = false
})
`&lt;/script&gt;`
```

### 提供 Symbol key

```text
`&lt;script setup&gt;`
import { provide } from 'vue'

// 使用 Symbol 避免命名冲突
const ThemeKey = Symbol('theme')
const LocaleKey = Symbol('locale')

provide(ThemeKey, 'dark')
provide(LocaleKey, 'zh-CN')

// 可以导出 key 供后代组件使用
export { ThemeKey, LocaleKey }
`&lt;/script&gt;`
```

### 在 setup 函数中使用

```text
import { provide } from 'vue'

export default {
  setup() {
    const data = ref('some data')

    provide('dataKey', data)

    return {}
  }
}
```

### 在选项式 API 中使用

```text
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  provide() {
    return {
      // 提供实例属性
      message: this.message,

      // 提供方法
      updateMessage: (newMsg) =&gt; {
        this.message = newMsg
      }
    }
  }
}
```

### TypeScript 支持

```text
&lt;script setup lang="ts"&gt;
import { provide, ref } from 'vue'

interface User {
  name: string
  age: number
}

const user = ref&lt;User&gt;({
  name: 'Vue',
  age: 3
})

// 使用类型断言
provide&lt;User&gt;('user', user.value)

// 使用 Symbol 作为 key
const UserKey = Symbol('user')
provide(UserKey, user)

export { UserKey }
`&lt;/script&gt;`
```

### 应用级别的 provide

```text
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 在整个应用中提供
app.provide('globalConfig', {
  apiUrl: 'https://api.example.com',
  version: '1.0.0'
})

app.mount('#app')
```

### 创建可组合的 provide 函数

```text
// useTheme.js
import { provide, ref, readonly } from 'vue'

export function provideTheme() {
  const theme = ref('light')

  const setTheme = (newTheme) =&gt; {
    theme.value = newTheme
  }

  const toggleTheme = () =&gt; {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // 提供只读的主题值
  provide('theme', readonly(theme))
  provide('setTheme', setTheme)
  provide('toggleTheme', toggleTheme)

  return {
    theme,
    setTheme,
    toggleTheme
  }
}

// 在组件中使用
import { provideTheme } from './useTheme'

export default {
  setup() {
    provideTheme()
  }
}
```

### 提供多个相关值

```text
`&lt;script setup&gt;`
import { provide, ref, reactive } from 'vue'

// 方式1: 分别提供
const user = ref({ name: 'Vue' })
const isLoggedIn = ref(true)

provide('user', user)
provide('isLoggedIn', isLoggedIn)

// 方式2: 使用对象提供（推荐）
const auth = reactive({
  user: ref({ name: 'Vue' }),
  isLoggedIn: ref(true),
  login(credentials) { /* ... */ },
  logout() { /* ... */ }
})

provide('auth', auth)
`&lt;/script&gt;`
```

## 注意事项

### 1. 默认不是响应式的

```text
// ❌ 错误：普通值不是响应式的
provide('message', 'Hello') // 不是响应式

// ✅ 正确：使用 ref 或 reactive
const message = ref('Hello')
provide('message', message)
```

### 2. 响应式链接

```text
const original = ref('Hello')

// 提供响应式数据
provide('message', original)

// 修改原始值会影响所有注入的地方
original.value = 'World' // 所有使用该值的地方都会更新
```

### 3. 避免命名冲突

```text
// ⚠️ 可能冲突
provide('data', someData) // 祖先组件A
provide('data', otherData) // 祖先组件B - 会覆盖

// ✅ 使用 Symbol
const DataKeyA = Symbol('data-a')
const DataKeyB = Symbol('data-b')

provide(DataKeyA, someData)
provide(DataKeyB, otherData)
```

### 4. 提供的数据可被修改

```text
const user = ref({ name: 'Vue' })

provide('user', user)

// ⚠️ 后代组件可以直接修改
// inject('user').value.name = 'Modified' // 会修改原始数据

// ✅ 提供 readonly 防止修改
import { readonly } from 'vue'
provide('user', readonly(user))
```

### 5. 与 props 的区别

```text
// props: 父子组件通信
const props = defineProps(['data']) // 父组件通过 props 传递

// provide: 跨层级通信
provide('data', data) // 任何后代组件都可以注入
```

### 6. 组件卸载时的处理

```text
// ⚠️ 组件卸载后，provide 的值不再可用
const timer = ref(null)

provide('timer', timer)

// 组件卸载时，注入的组件仍然可能持有引用
// 需要手动清理
onUnmounted(() =&gt; {
  timer.value = null
})
```

### 7. 与应用级 provide 的优先级

```text
// 应用级
app.provide('config', { theme: 'light' })

// 组件级（优先级更高）
provide('config', { theme: 'dark' })

// 后代组件会使用组件级的值
```

### 8. provide 的值不是响应式代理

```text
const obj = { count: 0 }

// ❌ 不是响应式的
provide('obj', obj)

// ✅ 使用 reactive
const state = reactive({ count: 0 })
provide('state', state)
```

## 使用场景

### 1. 主题系统

```text
&lt;!-- ThemeProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref, computed } from 'vue'

const theme = ref('light')

const themeConfig = computed(() =&gt; ({
  isDark: theme.value === 'dark',
  colors: theme.value === 'dark' ? {
    background: '#333',
    text: '#fff'
  } : {
    background: '#fff',
    text: '#333'
  }
}))

provide('theme', theme)
provide('themeConfig', themeConfig)
provide('setTheme', (newTheme) =&gt; {
  theme.value = newTheme
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 2. 用户认证

```text
&lt;!-- AuthProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref, computed } from 'vue'
import { auth } from './firebase'

const user = ref(null)
const isLoading = ref(false)

provide('user', user)
provide('isLoading', isLoading)

provide('login', async (email, password) =&gt; {
  isLoading.value = true
  try {
    const result = await auth.signInWithEmailAndPassword(email, password)
    user.value = result.user
  } finally {
    isLoading.value = false
  }
})

provide('logout', async () =&gt; {
  await auth.signOut()
  user.value = null
})

provide('isAuthenticated', computed(() =&gt; !!user.value))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 3. 国际化 (i18n)

```text
&lt;!-- I18nProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref, computed } from 'vue'

const locale = ref('zh-CN')

const messages = {
  'zh-CN': {
    welcome: '欢迎',
    goodbye: '再见'
  },
  'en-US': {
    welcome: 'Welcome',
    goodbye: 'Goodbye'
  }
}

const t = computed(() =&gt; (key) =&gt; {
  return messages[locale.value][key] || key
})

provide('locale', locale)
provide('t', t)
provide('setLocale', (newLocale) =&gt; {
  locale.value = newLocale
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 4. 表单验证上下文

```text
&lt;!-- FormProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, reactive } from 'vue'

const formState = reactive({
  values: {},
  errors: {},
  touched: {}
})

provide('formState', formState)

provide('registerField', (name, initialValue) =&gt; {
  formState.values[name] = initialValue
})

provide('setFieldValue', (name, value) =&gt; {
  formState.values[name] = value
  validateField(name)
})

provide('setFieldError', (name, error) =&gt; {
  formState.errors[name] = error
})

provide('validateField', (name) =&gt; {
  // 验证逻辑
})

provide('validate', () =&gt; {
  // 验证所有字段
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 5. 路由/导航上下文

```text
&lt;!-- RouterProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const routeHistory = ref([])

provide('router', router)

provide('navigate', (to) =&gt; {
  routeHistory.value.push(router.currentRoute.value)
  router.push(to)
})

provide('goBack', () =&gt; {
  const previous = routeHistory.value.pop()
  if (previous) {
    router.push(previous)
  } else {
    router.back()
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 6. 模态框管理

```text
&lt;!-- ModalProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref } from 'vue'

const activeModal = ref(null)
const modalStack = ref([])

provide('openModal', (modalId, props = {}) =&gt; {
  if (activeModal.value) {
    modalStack.value.push(activeModal.value)
  }
  activeModal.value = { id: modalId, props }
})

provide('closeModal', () =&gt; {
  if (modalStack.value.length &gt; 0) {
    activeModal.value = modalStack.value.pop()
  } else {
    activeModal.value = null
  }
})

provide('activeModal', activeModal)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
  &lt;component
    v-if="activeModal"
    :is="activeModal.id"
    v-bind="activeModal.props"
    @close="closeModal"
  /&gt;
`&lt;/template&gt;`
```

### 7. Toast 通知系统

```text
&lt;!-- ToastProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref } from 'vue'

const toasts = ref([])

let id = 0

provide('showToast', (message, options = {}) =&gt; {
  const toast = {
    id: id++,
    message,
    type: options.type || 'info',
    duration: options.duration || 3000
  }

  toasts.value.push(toast)

  if (toast.duration &gt; 0) {
    setTimeout(() =&gt; {
      removeToast(toast.id)
    }, toast.duration)
  }
})

provide('removeToast', removeToast)

function removeToast(id) {
  const index = toasts.value.findIndex(t =&gt; t.id === id)
  if (index &gt; -1) {
    toasts.value.splice(index, 1)
  }
}

provide('toasts', toasts)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
  &lt;div class="toast-container"&gt;
    &lt;div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
    &gt;
      {{ toast.message }}
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 数据库/API 上下文

```text
&lt;!-- ApiProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.example.com'
})

provide('api', api)

// 提供便捷方法
provide('fetchUser', (id) =&gt; api.get(`/users/${id}`))
provide('fetchPosts', () =&gt; api.get('/posts'))
provide('createPost', (data) =&gt; api.post('/posts', data))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 9. 全局配置

```text
&lt;!-- ConfigProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, reactive } from 'vue'

const config = reactive({
  apiUrl: import.meta.env.VITE_API_URL,
  appName: 'My App',
  version: '1.0.0',
  features: {
    darkMode: true,
    notifications: true
  }
})

provide('config', config)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;slot /&gt;
`&lt;/template&gt;`
```

### 10. 布局上下文

```text
&lt;!-- LayoutProvider.vue --&gt;
`&lt;script setup&gt;`
import { provide, ref } from 'vue'

const sidebarOpen = ref(true)
const sidebarCollapsed = ref(false)

provide('sidebarState', {
  open: sidebarOpen,
  collapsed: sidebarCollapsed
})

provide('toggleSidebar', () =&gt; {
  sidebarOpen.value = !sidebarOpen.value
})

provide('collapseSidebar', () =&gt; {
  sidebarCollapsed.value = !sidebarCollapsed.value
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="layout" :class="{ 'sidebar-closed': !sidebarOpen }"&gt;
    &lt;slot /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 最佳实践

1. **使用 Symbol 作为 key**：避免命名冲突
2. **提供 readonly 数据**：防止后代组件意外修改
3. **创建组合函数**：封装 provide 逻辑
4. **文档化**：明确说明提供了哪些 key
5. **考虑使用 Pinia**：复杂状态管理使用 Pinia
