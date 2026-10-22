# provide

## 作用

`provide()` 用于提供一个值，可以被后代组件注入。它是 Vue 3 依赖注入系统的一部分，用于跨层级组件通信，避免 props 逐层传递。注入端配套 API 是 `inject()`。

📖 [官方文档 - provide](https://cn.vuejs.org/api/composition-api-dependency-injection.html#provide)

> 💡 `provide()` 必须在 `setup()` 或 `<script setup>` 的**同步执行阶段**调用（与生命周期钩子同样的限制）。

## 用法

### 基本用法

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const message = ref('Hello from ancestor')

// 提供响应式数据
provide('message', message)

// 提供只读数据
provide('config', { theme: 'dark' })

// 提供方法
provide('updateMessage', (newMsg) => {
  message.value = newMsg
})
</script>
```

### 提供响应式数据

```vue
<script setup>
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
</script>
```

### 提供计算属性

```vue
<script setup>
import { provide, computed, ref } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

provide('double', double)
</script>
```

### 提供方法/函数

```vue
<script setup>
import { provide, ref } from 'vue'

const isVisible = ref(true)

provide('toggle', () => {
  isVisible.value = !isVisible.value
})

provide('show', () => {
  isVisible.value = true
})

provide('hide', () => {
  isVisible.value = false
})
</script>
```

### 提供 Symbol key

`<script setup>` 中不能写 `export` 语句，所以 Symbol key 要放在单独的文件里导出，提供方和注入方各自导入同一份：

```javascript
// keys.js —— key 的唯一定义处
export const ThemeKey = Symbol('theme')
export const LocaleKey = Symbol('locale')
```

```vue
<script setup>
import { provide } from 'vue'
import { ThemeKey, LocaleKey } from './keys'

provide(ThemeKey, 'dark')
provide(LocaleKey, 'zh-CN')
</script>
```

### 在 setup 函数中使用

```javascript
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

```javascript
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
      updateMessage: (newMsg) => {
        this.message = newMsg
      }
    }
  }
}
```

### TypeScript 支持

推荐用 `InjectionKey<T>` 类型的 Symbol 作为 key，把值的类型绑定在 key 上，注入方 `inject(UserKey)` 会自动获得正确类型：

```vue
<script setup lang="ts">
import { provide, ref, type InjectionKey, type Ref } from 'vue'

interface User {
  name: string
  age: number
}

// 定义带类型的 key（实际项目中放在 keys.ts 里导出）
const UserKey: InjectionKey<Ref<User>> = Symbol('user')

const user = ref<User>({ name: 'Vue', age: 3 })

// value 的类型必须与 key 声明的类型匹配，否则 TS 报错
provide(UserKey, user)
</script>
```

### 应用级别的 provide

```javascript
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

```javascript
// useTheme.js
import { provide, ref, readonly } from 'vue'

export function provideTheme() {
  const theme = ref('light')

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  const toggleTheme = () => {
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

```vue
<script setup>
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
</script>
```

## 注意事项

### 1. 默认不是响应式的

```javascript
// ❌ 错误：普通值不是响应式的
provide('message', 'Hello') // 不是响应式

// ✅ 正确：使用 ref 或 reactive
const message = ref('Hello')
provide('message', message)
```

### 2. 响应式链接

```javascript
const original = ref('Hello')

// 提供响应式数据
provide('message', original)

// 修改原始值会影响所有注入的地方
original.value = 'World' // 所有使用该值的地方都会更新
```

### 3. 避免命名冲突

多个祖先组件用字符串 key 提供同名数据时，后代注入到的是**距离最近**的那个祖先的值（就近原则）。若只想区分不同的数据，用不同的 Symbol：

```javascript
// ⚠️ 同名字符串 key：后代拿到的是最近祖先的值
provide('data', someData) // 祖先组件A
provide('data', otherData) // 更近的祖先组件B

// ✅ 使用 Symbol 区分不同的数据
const DataKeyA = Symbol('data-a')
const DataKeyB = Symbol('data-b')

provide(DataKeyA, someData)
provide(DataKeyB, otherData)
```

### 4. 提供的数据可被修改

```javascript
const user = ref({ name: 'Vue' })

provide('user', user)

// ⚠️ 后代组件可以直接修改
// inject('user').value.name = 'Modified' // 会修改原始数据

// ✅ 提供 readonly 防止修改
import { readonly } from 'vue'
provide('user', readonly(user))
```

### 5. 与 props 的区别

```javascript
// props: 父子组件通信
const props = defineProps(['data']) // 父组件通过 props 传递

// provide: 跨层级通信
provide('data', data) // 任何后代组件都可以注入
```

### 6. 提供方卸载后数据仍然存在

组件卸载并不会"回收"它 provide 过的值。如果注入方还持有引用（比如一个 `ref`），数据依然可访问、可修改。需要停止相关副作用时，要在提供方自己的卸载钩子里处理：

```javascript
const timer = ref(null)

provide('timer', timer)

// ⚠️ 提供方卸载时自己负责清理数据，注入方不会自动感知
onUnmounted(() => {
  timer.value = null
})
```

### 7. 与应用级 provide 的优先级

```javascript
// 应用级
app.provide('config', { theme: 'light' })

// 组件级（对后代组件优先级更高）
provide('config', { theme: 'dark' })

// 后代组件会使用组件级的值
```

## 使用场景

### 1. 主题系统

```vue
<!-- ThemeProvider.vue -->
<script setup>
import { provide, ref, computed } from 'vue'

const theme = ref('light')

const themeConfig = computed(() => ({
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
provide('setTheme', (newTheme) => {
  theme.value = newTheme
})
</script>

<template>
  <slot />
</template>
```

### 2. 用户认证

```vue
<!-- AuthProvider.vue -->
<script setup>
import { provide, ref, computed } from 'vue'
import { auth } from './firebase'

const user = ref(null)
const isLoading = ref(false)

provide('user', user)
provide('isLoading', isLoading)

provide('login', async (email, password) => {
  isLoading.value = true
  try {
    const result = await auth.signInWithEmailAndPassword(email, password)
    user.value = result.user
  } finally {
    isLoading.value = false
  }
})

provide('logout', async () => {
  await auth.signOut()
  user.value = null
})

provide('isAuthenticated', computed(() => !!user.value))
</script>

<template>
  <slot />
</template>
```

### 3. 国际化 (i18n)

```vue
<!-- I18nProvider.vue -->
<script setup>
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

const t = computed(() => (key) => {
  return messages[locale.value][key] || key
})

provide('locale', locale)
provide('t', t)
provide('setLocale', (newLocale) => {
  locale.value = newLocale
})
</script>

<template>
  <slot />
</template>
```

### 4. 表单验证上下文

```vue
<!-- FormProvider.vue -->
<script setup>
import { provide, reactive } from 'vue'

const formState = reactive({
  values: {},
  errors: {},
  touched: {}
})

provide('formState', formState)

provide('registerField', (name, initialValue) => {
  formState.values[name] = initialValue
})

provide('setFieldValue', (name, value) => {
  formState.values[name] = value
  validateField(name)
})

provide('setFieldError', (name, error) => {
  formState.errors[name] = error
})

provide('validateField', (name) => {
  // 验证逻辑
})

provide('validate', () => {
  // 验证所有字段
})
</script>

<template>
  <slot />
</template>
```

### 5. 路由/导航上下文

```vue
<!-- RouterProvider.vue -->
<script setup>
import { provide, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const routeHistory = ref([])

provide('router', router)

provide('navigate', (to) => {
  routeHistory.value.push(router.currentRoute.value)
  router.push(to)
})

provide('goBack', () => {
  const previous = routeHistory.value.pop()
  if (previous) {
    router.push(previous)
  } else {
    router.back()
  }
})
</script>

<template>
  <slot />
</template>
```

### 6. 模态框管理

```vue
<!-- ModalProvider.vue -->
<script setup>
import { provide, ref } from 'vue'

const activeModal = ref(null)
const modalStack = ref([])

provide('openModal', (modalId, props = {}) => {
  if (activeModal.value) {
    modalStack.value.push(activeModal.value)
  }
  activeModal.value = { id: modalId, props }
})

provide('closeModal', () => {
  if (modalStack.value.length > 0) {
    activeModal.value = modalStack.value.pop()
  } else {
    activeModal.value = null
  }
})

provide('activeModal', activeModal)
</script>

<template>
  <slot />
  <component
    v-if="activeModal"
    :is="activeModal.id"
    v-bind="activeModal.props"
    @close="closeModal"
  />
</template>
```

### 7. Toast 通知系统

```vue
<!-- ToastProvider.vue -->
<script setup>
import { provide, ref } from 'vue'

const toasts = ref([])

let id = 0

provide('showToast', (message, options = {}) => {
  const toast = {
    id: id++,
    message,
    type: options.type || 'info',
    duration: options.duration || 3000
  }

  toasts.value.push(toast)

  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }
})

provide('removeToast', removeToast)

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

provide('toasts', toasts)
</script>

<template>
  <slot />
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
```

### 8. 数据库/API 上下文

```vue
<!-- ApiProvider.vue -->
<script setup>
import { provide } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.example.com'
})

provide('api', api)

// 提供便捷方法
provide('fetchUser', (id) => api.get(`/users/${id}`))
provide('fetchPosts', () => api.get('/posts'))
provide('createPost', (data) => api.post('/posts', data))
</script>

<template>
  <slot />
</template>
```

### 9. 全局配置

```vue
<!-- ConfigProvider.vue -->
<script setup>
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
</script>

<template>
  <slot />
</template>
```

### 10. 布局上下文

```vue
<!-- LayoutProvider.vue -->
<script setup>
import { provide, ref } from 'vue'

const sidebarOpen = ref(true)
const sidebarCollapsed = ref(false)

provide('sidebarState', {
  open: sidebarOpen,
  collapsed: sidebarCollapsed
})

provide('toggleSidebar', () => {
  sidebarOpen.value = !sidebarOpen.value
})

provide('collapseSidebar', () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
})
</script>

<template>
  <div class="layout" :class="{ 'sidebar-closed': !sidebarOpen }">
    <slot />
  </div>
</template>
```

## 最佳实践

1. **使用 Symbol 作为 key**：避免命名冲突
2. **提供 readonly 数据**：防止后代组件意外修改
3. **创建组合函数**：封装 provide 逻辑
4. **文档化**：明确说明提供了哪些 key
5. **考虑使用 Pinia**：复杂状态管理使用 Pinia
