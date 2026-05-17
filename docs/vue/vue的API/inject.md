# inject

## 作用
`inject()` 用于注入由祖先组件提供的数据或方法。它是 Vue 3 依赖注入系统的接收端，配合 `provide()` 使用，实现跨层级组件通信。

## 用法

### 基本用法

```vue
<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

// 注入数据
const message = inject('message')
console.log(message.value) // 'Hello from ancestor'
</script>
```

### 注入响应式数据

```vue
<script setup>
import { inject } from 'vue'

// 注入 ref
const count = inject('count')
console.log(count.value) // 0

count.value++ // 修改会同步到提供者

// 注入 reactive 对象
const user = inject('user')
console.log(user.name) // 'Vue'
user.name = 'Modified' // 修改会同步
</script>
```

### 设置默认值

```vue
<script setup>
import { inject } from 'vue'

// 当没有提供该 key 时使用默认值
const theme = inject('theme', 'light')

// 默认值也可以是函数
const getConfig = inject('config', () => ({
  apiUrl: '/api',
  timeout: 5000
}))
</script>
```

### TypeScript 类型注解

```vue
<script setup lang="ts">
import { inject } from 'vue'

// 使用类型注解
interface User {
  name: string
  age: number
}

const user = inject<User>('user')
const theme = inject<string>('theme', 'light')

// 使用 Symbol key
const ThemeKey = Symbol('theme')
const currentTheme = inject<string>(ThemeKey, 'light')
</script>
```

### 注入并保持响应性

```vue
<script setup>
import { inject } from 'vue'

// ✅ 直接使用注入的 ref
const count = inject('count')

// 在模板中使用
// <template>{{ count }}</template>

// ❌ 如果解构会失去响应性
const { value } = inject('count') // 不要这样做
</script>
```

### 注入方法

```vue
<script setup>
import { inject } from 'vue'

const toggle = inject('toggle')
const show = inject('show')
const hide = inject('hide')

function handleClick() {
  toggle() // 调用提供的方法
}
</script>

<template>
  <button @click="handleClick">切换</button>
</template>
```

### 可选注入

```vue
<script setup>
import { inject } from 'vue'

// 使用可选链
const optionalValue = inject('optionalKey')

if (optionalValue) {
  // 使用值
}

// 或使用默认值
const value = inject('optionalKey', 'default')
</script>
```

### 在 setup 函数中使用

```javascript
import { inject } from 'vue'

export default {
  setup() {
    const data = inject('dataKey')

    return {
      data
    }
  }
}
```

### 在选项式 API 中使用

```javascript
export default {
  inject: {
    // 简写形式
    message: 'message',

    // 对象形式（带默认值）
    theme: {
      from: 'theme',
      default: 'light'
    },

    // 使用函数默认值
    config: {
      from: 'config',
      default: () => ({ apiUrl: '/api' })
    }
  },

  mounted() {
    console.log(this.message)
    console.log(this.theme)
  }
}
```

### 注入 Symbol key

```vue
<script setup>
import { inject } from 'vue'
import { ThemeKey, LocaleKey } from './ancestor'

const theme = inject(ThemeKey, 'light')
const locale = inject(LocaleKey, 'en-US')
</script>
```

### 注入多个相关值

```vue
<script setup>
import { inject } from 'vue'

// 方式1: 分别注入
const user = inject('user')
const isLoggedIn = inject('isLoggedIn')

// 方式2: 注入对象（推荐）
const auth = inject('auth')
// auth.user, auth.isLoggedIn, auth.login 等
</script>
```

### 只读注入

```vue
<script setup>
import { inject, readonly } from 'vue'

// 注入并设为只读
const config = inject('config')
const readonlyConfig = readonly(config)

// 尝试修改会报警告
readonlyConfig.theme = 'dark' // 警告
</script>
```

## 注意事项

### 1. 与 provide 配对使用

```javascript
// 祖先组件
provide('key', value)

// 后代组件
const injected = inject('key') // 获取 value

// ⚠️ 如果没有 provide，inject 会返回 undefined
```

### 2. 响应式数据保持响应性

```vue
<script setup>
import { inject } from 'vue'

const count = inject('count')

// ✅ 保持响应性
function increment() {
  count.value++
}

// ❌ 解构会失去响应性
const { value } = count // 不要这样做
</script>
```

### 3. 默认值只在未提供时使用

```javascript
// 祖先组件
provide('message', null)

// 后代组件
const message = inject('message', 'default')

// message 是 null，不是 'default'
// 因为提供了值（即使是 null）
```

### 4. 注入的顺序

```javascript
// 多层 provide
// 祖先 A: provide('key', 'value-a')
// 祖先 B: provide('key', 'value-b')

// 后代组件会使用最近的（层级最浅的）祖先提供的值
// 就近原则
```

### 5. Symbol key 的使用

```javascript
// 导出 Symbol
export const ThemeKey = Symbol('theme')

// 祖先组件
import { ThemeKey } from './keys'
provide(ThemeKey, 'dark')

// 后代组件
import { ThemeKey } from './keys'
const theme = inject(ThemeKey)
```

### 6. 与 props 的优先级

```javascript
// props 优先级更高
// 如果组件既有 props 又 inject 了同名的 key
// props 的值会覆盖 inject 的值
```

### 7. 应用级 inject

```javascript
// main.js
app.provide('global', 'value')

// 任何组件都可以注入
const global = inject('global')
```

### 8. TypeScript 类型安全

```typescript
// ✅ 明确类型
const user = inject<User>('user')

// ⚠️ 可能需要类型断言
const config = inject('config') as Config

// ✅ 使用 Symbol 提供更好的类型
const ThemeKey = Symbol('theme')
const theme = inject<string>(ThemeKey)
```

### 9. 处理未提供的情况

```vue
<script setup>
import { inject } from 'vue'

// 方式1: 默认值
const value = inject('maybeMissing', defaultValue)

// 方式2: 检查是否存在
const value = inject('maybeMissing')
if (!value) {
  // 处理缺失情况
}

// 方式3: 使用可选链
const result = value?.method?.()
</script>
```

## 使用场景

### 1. 使用主题系统

```vue
<script setup>
import { inject } from 'vue'
import { useTheme } from './composables/useTheme'

const theme = inject('theme')
const themeConfig = inject('themeConfig')
const setTheme = inject('setTheme')

function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <div :class="themeConfig.isDark && 'dark-theme'">
    <button @click="toggleTheme">
      切换到 {{ theme === 'light' ? '暗' : '亮' }}色模式
    </button>
  </div>
</template>
```

### 2. 用户认证状态

```vue
<script setup>
import { inject } from 'vue'

const user = inject('user')
const login = inject('login')
const logout = inject('logout')
const isAuthenticated = inject('isAuthenticated')
</script>

<template>
  <div>
    <div v-if="isAuthenticated">
      <p>欢迎, {{ user.name }}</p>
      <button @click="logout">登出</button>
    </div>
    <form v-else @submit.prevent="login(email, password)">
      <input v-model="email" type="email" />
      <input v-model="password" type="password" />
      <button>登录</button>
    </form>
  </div>
</template>
```

### 3. 国际化

```vue
<script setup>
import { inject } from 'vue'

const t = inject('t')
const locale = inject('locale')
const setLocale = inject('setLocale')
</script>

<template>
  <div>
    <h1>{{ t('welcome') }}</h1>
    <button @click="setLocale('zh-CN')">中文</button>
    <button @click="setLocale('en-US')">English</button>
  </div>
</template>
```

### 4. 表单字段

```vue
<script setup>
import { inject, computed, onMounted } from 'vue'

const props = defineProps(['name'])
const formState = inject('formState')
const setFieldValue = inject('setFieldValue')
const setFieldError = inject('setFieldError')
const registerField = inject('registerField')

const value = computed({
  get: () => formState.values[props.name],
  set: (val) => setFieldValue(props.name, val)
})

const error = computed(() => formState.errors[props.name])

onMounted(() => {
  registerField(props.name, props.defaultValue || '')
})
</script>

<template>
  <div class="form-field">
    <label :for="name">{{ label }}</label>
    <input
      :id="name"
      v-model="value"
      @blur="validate"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

### 5. 使用导航上下文

```vue
<script setup>
import { inject } from 'vue'

const navigate = inject('navigate')
const goBack = inject('goBack')
</script>

<template>
  <nav>
    <button @click="goBack">返回</button>
    <button @click="navigate('/home')">首页</button>
    <button @click="navigate('/about')">关于</button>
  </nav>
</template>
```

### 6. 显示模态框

```vue
<script setup>
import { inject } from 'vue'

const openModal = inject('openModal')

function showLoginModal() {
  openModal('LoginModal', {
    title: '登录',
    onSuccess: () => {
      console.log('登录成功')
    }
  })
}

function showSettingsModal() {
  openModal('SettingsModal')
}
</script>

<template>
  <button @click="showLoginModal">登录</button>
  <button @click="showSettingsModal">设置</button>
</template>
```

### 7. 显示通知

```vue
<script setup>
import { inject } from 'vue'

const showToast = inject('showToast')

function handleSuccess() {
  showToast('操作成功！', {
    type: 'success',
    duration: 3000
  })
}

function handleError() {
  showToast('操作失败，请重试', {
    type: 'error',
    duration: 5000
  })
}
</script>

<template>
  <button @click="handleSuccess">成功操作</button>
  <button @click="handleError">失败操作</button>
</template>
```

### 8. 使用 API

```vue
<script setup>
import { inject, onMounted, ref } from 'vue'

const api = inject('api')
const fetchUser = inject('fetchUser')

const user = ref(null)
const posts = ref([])

onMounted(async () => {
  // 方式1: 使用注入的 api 实例
  const response = await api.get('/user')
  user.value = response.data

  // 方式2: 使用便捷方法
  const userData = await fetchUser(1)
  user.value = userData
})
</script>
```

### 9. 使用全局配置

```vue
<script setup>
import { inject } from 'vue'

const config = inject('config')

console.log(config.appName)
console.log(config.apiUrl)
console.log(config.features.darkMode)
</script>

<template>
  <footer>
    {{ config.appName }} v{{ config.version }}
  </footer>
</template>
```

### 10. 布局控制

```vue
<script setup>
import { inject } from 'vue'

const sidebarState = inject('sidebarState')
const toggleSidebar = inject('toggleSidebar')
const collapseSidebar = inject('collapseSidebar')
</script>

<template>
  <aside :class="{ 'collapsed': sidebarState.collapsed }">
    <button @click="toggleSidebar">
      {{ sidebarState.open ? '关闭' : '打开' }}
    </button>
    <button @click="collapseSidebar">
      {{ sidebarState.collapsed ? '展开' : '折叠' }}
    </button>
  </aside>
</template>
```

### 11. 组合函数中使用 inject

```javascript
// useNotification.js
import { inject } from 'vue'

export function useNotification() {
  const showToast = inject('showToast')
  const showError = inject('showError')

  const notify = {
    success: (message) => showToast(message, { type: 'success' }),
    error: (message) => showToast(message, { type: 'error' }),
    warning: (message) => showToast(message, { type: 'warning' })
  }

  return notify
}

// 在组件中使用
<script setup>
import { useNotification } from './useNotification'

const notify = useNotification()

function handleAction() {
  notify.success('操作成功！')
}
</script>
```

### 12. 条件注入

```vue
<script setup>
import { inject, computed } from 'vue'

// 注入可选的值
const optionalFeature = inject('optionalFeature', null)

// 检查是否可用
const hasFeature = computed(() => optionalFeature !== null)

function useFeature() {
  if (hasFeature.value && optionalFeature.use) {
    return optionalFeature.use()
  }
  return null
}
</script>

<template>
  <div>
    <button v-if="hasFeature" @click="useFeature">
      使用功能
    </button>
    <p v-else>功能不可用</p>
  </div>
</template>
```

## provide/inject 组合示例

```vue
<!-- 祖先组件 App.vue -->
<script setup>
import { provide, ref } from 'vue'
import Child from './Child.vue'

const theme = ref('light')
const user = ref({ name: 'Vue' })

provide('theme', theme)
provide('user', user)
provide('setUser', (newUser) => {
  user.value = newUser
})
</script>

<template>
  <Child />
</template>

<!-- 中间层组件 Child.vue -->
<template>
  <GrandChild />
</template>

<!-- 后代组件 GrandChild.vue -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const user = inject('user')
const setUser = inject('setUser')
</script>

<template>
  <div :class="theme">
    <p>用户: {{ user.name }}</p>
    <button @click="setUser({ name: 'React' })">修改用户</button>
  </div>
</template>
```

## 最佳实践

1. **使用 Symbol 作为 key**：避免命名冲突，提供更好的类型支持
2. **提供默认值**：使组件更加独立和可测试
3. **创建组合函数**：封装 inject 逻辑
4. **文档化**：明确说明需要注入哪些 key
5. **考虑替代方案**：复杂状态考虑使用 Pinia
6. **保持只读**：使用 readonly 防止意外修改
