### 一、概述

`toValue()` 是 Vue 3.3 新增的响应式工具函数，用于将**值、ref 或 getter 函数**统一规范化为一个纯值。它的核心价值在于：让你在编写组合式函数（Composables）时，不必关心调用者传入的是普通值、`ref` 还是 getter 函数，只需一行代码就能拿到最终的值。

简单来说，`toValue()` 就像一个"万能解包器"——给它什么类型的输入，它都能帮你提取出里面的实际值。

> 📖 [官方文档 - toValue](https://cn.vuejs.org/api/reactivity-utilities#tovalue)
>
> 📖 [官方文档 - 组合式函数](https://cn.vuejs.org/guide/reusability/composables)

### 二、核心原理

`toValue()` 的处理逻辑非常简单，可以用以下伪代码理解：

```ts
function toValue<T>(source: T | Ref<T> | (() => T)): T {
  if (typeof source === 'function') {
    // 如果是 getter 函数，调用它并返回结果
    return source()
  }
  if (isRef(source)) {
    // 如果是 ref，返回 .value
    return source.value
  }
  // 普通值，原样返回
  return source
}
```

它的设计目标是配合组合式函数使用。在组合式函数中，参数可能是以下三种形式之一：

| 输入类型 | 示例 | `toValue()` 行为 |
| --- | --- | --- |
| 普通值 | `42`、`'hello'` | 原样返回 |
| `ref` | `ref(42)` | 返回 `ref.value`，即 `42` |
| getter 函数 | `() => 42` | 调用函数，返回 `42` |

> 💡 **提示：** `toValue()` 与 `unref()` 的关键区别在于对 getter 函数的处理——`unref()` 会将 getter 函数原样返回，而 `toValue()` 会调用 getter 并返回其结果。

### 三、详细用法

#### 1. 基本用法

```ts
import { toValue, ref } from 'vue'

// ✅ 普通值：原样返回
console.log(toValue(1))        // 1
console.log(toValue('hello'))  // 'hello'
console.log(toValue(null))     // null

// ✅ ref：自动解包 .value
const count = ref(0)
console.log(toValue(count))    // 0

// ✅ getter 函数：自动调用并返回结果
const getNumber = () => 42
console.log(toValue(getNumber))  // 42

// ✅ getter 返回 ref：会调用 getter，再解包 ref
const getRef = () => ref(100)
console.log(toValue(getRef))   // 100
```

#### 2. 进阶用法

**在组合式函数中接收灵活参数：**

```ts
// composables/useDouble.ts
import { toValue, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * 接收一个可能是值、ref 或 getter 的参数，返回其双倍值的计算属性
 * 参数类型声明为 MaybeRefOrGetter，表示可以接收多种形式
 */
function useDouble(source: number | Ref<number> | (() => number)): ComputedRef<number> {
  return computed(() => toValue(source) * 2)
}
```

```vue
<!-- UserComponent.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDouble } from './composables/useDouble'

// 三种方式都可以正常工作
const staticNum = useDouble(5)                // 传入普通值 → 10
const reactiveNum = useDouble(ref(10))        // 传入 ref → 20
const getterNum = useDouble(() => 15)         // 传入 getter → 30

console.log(staticNum.value)    // 10
console.log(reactiveNum.value)  // 20
console.log(getterNum.value)    // 30
</script>
```

**配合 `watchEffect` 实现响应式追踪：**

```ts
// composables/useFetch.ts
import { ref, watchEffect, toValue } from 'vue'
import type { Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
}

function useFetch<T = unknown>(url: string | Ref<string> | (() => string)): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)

  const fetchData = async () => {
    data.value = null
    error.value = null

    try {
      const resolvedUrl = toValue(url)  // 在 watchEffect 内部调用 toValue
      const response = await fetch(resolvedUrl)
      data.value = await response.json() as T
    } catch (err) {
      error.value = err as Error
    }
  }

  // ✅ toValue() 在 watchEffect 内部调用，响应式依赖会被自动追踪
  watchEffect(() => {
    fetchData()
  })

  return { data, error }
}
```

```vue
<!-- UserList.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from './composables/useFetch'

// 场景 1：静态 URL
const { data: staticData } = useFetch('/api/users')

// 场景 2：动态 ref URL —— 当 url 改变时，自动重新请求
const userId = ref(1)
const { data: userData } = useFetch(() => `/api/users/${userId.value}`)

// 场景 3：ref 作为 URL
const apiUrl = ref('/api/posts')
const { data: postsData } = useFetch(apiUrl)
</script>
```

**TypeScript 泛型类型声明：**

```ts
import type { Ref, ComputedRef } from 'vue'

// Vue 内部定义的 MaybeRefOrGetter 类型（可用于自己的组合式函数）
type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)

// 更完善的版本，支持只读 ref
type MaybeRefOrGetterStrict<T> = T | Ref<T> | Readonly<Ref<T>> | (() => T)

// 使用示例
function useClamp(source: MaybeRefOrGetter<number>, min: number, max: number): ComputedRef<number> {
  return computed(() => {
    const value = toValue(source)
    return Math.min(Math.max(value, min), max)
  })
}
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `source` | `T \| Ref<T> \| (() => T)` | 要规范化的值，可以是普通值、ref 或 getter 函数 |

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| 返回值 | `T` | 规范化后的纯值（非响应式） |

**参数处理规则：**

| 输入类型 | 处理方式 | 返回结果 |
| --- | --- | --- |
| 普通值（数字、字符串、对象等） | 原样返回 | 输入值本身 |
| `ref()` | 解包 `.value` | `ref.value` |
| `computed()` | 解包 `.value`（computed 也是 ref） | 计算属性的当前值 |
| getter 函数 `() => value` | 调用函数 | 函数的返回值 |
| `reactive()` 对象 | 原样返回 | reactive 对象本身 |

### 四、实现效果

**效果一：统一不同类型的输入**

```ts
import { toValue, ref } from 'vue'

// 三种不同形式的输入，toValue 都能正确提取值
const a = toValue(42)                    // 42（普通值）
const b = toValue(ref(42))              // 42（ref 解包）
const c = toValue(() => 42)             // 42（getter 调用）

console.log(a, b, c)  // 42, 42, 42
```

**效果二：在 watchEffect 中实现响应式追踪**

```vue
<script setup lang="ts">
import { ref, watchEffect, toValue } from 'vue'

const keyword = ref('Vue')

// ✅ toValue 在 watchEffect 回调内部调用
// 当 keyword 变化时，effect 会自动重新执行
watchEffect(() => {
  const value = toValue(keyword)
  console.log('当前搜索关键词:', value)  // 每次 keyword 变化都会打印新值
})

// 模拟用户输入
keyword.value = 'Vue 3'   // 控制台输出: 当前搜索关键词: Vue 3
keyword.value = 'Vite'    // 控制台输出: 当前搜索关键词: Vite
</script>
```

**效果三：组合式函数参数灵活性**

```ts
// ✅ 正确：组合式函数接收灵活参数
function useFormat(source: MaybeRefOrGetter<number>) {
  const formatted = computed(() => toValue(source).toFixed(2))
  return formatted
}

// 调用者可以自由选择传值方式
useFormat(3.14159)              // ✅ 传入普通值 → "3.14"
useFormat(ref(2.718))           // ✅ 传入 ref → "2.72"
useFormat(() => 1.414)          // ✅ 传入 getter → "1.41"
useFormat(computed(() => 1.5))  // ✅ 传入 computed → "1.50"
```

### 五、使用场景

#### 场景 1：组合式函数接收灵活参数（最常见场景）

```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted, toValue } from 'vue'
import type { Ref, MaybeRefOrGetter } from 'vue'

interface Position {
  x: Ref<number>
  y: Ref<number>
}

// target 可以是 DOM 元素、ref 包裹的元素、或返回元素的 getter
function useMouse(target?: MaybeRefOrGetter<HTMLElement | undefined>): Position {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    const el = toValue(target)
    if (el) {
      // 相对于目标元素的坐标
      const rect = el.getBoundingClientRect()
      x.value = event.clientX - rect.left
      y.value = event.clientY - rect.top
    } else {
      x.value = event.pageX
      y.value = event.pageY
    }
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

#### 场景 2：封装通用数据请求 Hook

```ts
// composables/useFetch.ts
import { ref, watchEffect, toValue, readonly } from 'vue'
import type { Ref, MaybeRefOrGetter } from 'vue'

interface UseFetchOptions {
  immediate?: boolean
}

interface UseFetchReturn<T> {
  data: Readonly<Ref<T | null>>
  error: Readonly<Ref<Error | null>>
  isLoading: Readonly<Ref<boolean>>
  refresh: () => Promise<void>
}

function useFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { immediate = true } = options
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const refresh = async () => {
    data.value = null
    error.value = null
    isLoading.value = true

    try {
      const resolvedUrl = toValue(url)
      const response = await fetch(resolvedUrl)
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)
      data.value = (await response.json()) as T
    } catch (err) {
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }

  if (immediate) {
    // ✅ toValue 在 watchEffect 内部调用，响应式依赖会被追踪
    watchEffect(() => {
      refresh()
    })
  }

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    refresh
  }
}
```

```vue
<!-- UserList.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from './composables/useFetch'

interface User { id: number; name: string }

// 传入 getter —— 当 userId 变化时自动重新请求
const userId = ref(1)
const { data, error, isLoading } = useFetch<User[]>(() => `/api/users/${userId.value}`)
</script>

<template>
  <div v-if="isLoading">加载中...</div>
  <div v-else-if="error">加载失败: {{ error.message }}</div>
  <ul v-else>
    <li v-for="user in data" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

#### 场景 3：动态表单验证

```ts
// composables/useValidation.ts
import { computed, toValue } from 'vue'
import type { Ref, MaybeRefOrGetter } from 'vue'

interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

function useValidation(
  value: MaybeRefOrGetter<string>,
  rules: MaybeRefOrGetter<ValidationRule[]>
) {
  const errors = computed(() => {
    const val = toValue(value)
    const ruleList = toValue(rules)
    return ruleList
      .filter(rule => !rule.test(val))
      .map(rule => rule.message)
  })

  const isValid = computed(() => errors.value.length === 0)

  return { errors, isValid }
}
```

```vue
<!-- RegisterForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useValidation } from './composables/useValidation'

const password = ref('')

// 验证规则也可以是响应式的
const rules = computed(() => [
  { test: (v: string) => v.length >= 8, message: '密码至少 8 个字符' },
  { test: (v: string) => /[A-Z]/.test(v), message: '需要包含大写字母' },
  { test: (v: string) => /[0-9]/.test(v), message: '需要包含数字' }
])

// ✅ 传入 ref 和 computed，toValue 自动处理
const { errors, isValid } = useValidation(password, rules)
</script>

<template>
  <input v-model="password" type="password" placeholder="请输入密码" />
  <ul>
    <li v-for="err in errors" :key="err" style="color: red">{{ err }}</li>
  </ul>
  <button :disabled="!isValid">注册</button>
</template>
```

#### 场景 4：响应式 CSS 类名与样式绑定

```ts
// composables/useActiveStyle.ts
import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

interface StyleConfig {
  color?: string
  fontSize?: string
  backgroundColor?: string
}

function useActiveStyle(
  isActive: MaybeRefOrGetter<boolean>,
  activeStyle: MaybeRefOrGetter<StyleConfig>,
  inactiveStyle: MaybeRefOrGetter<StyleConfig> = {}
) {
  const mergedStyle = computed(() => {
    const active = toValue(isActive)
    return active ? toValue(activeStyle) : toValue(inactiveStyle)
  })

  const className = computed(() => {
    return toValue(isActive) ? 'is-active' : 'is-inactive'
  })

  return { style: mergedStyle, className }
}
```

```vue
<!-- ButtonComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useActiveStyle } from './composables/useActiveStyle'

const isActive = ref(false)

const { style, className } = useActiveStyle(
  isActive,
  // ✅ 传入 getter，状态改变时自动响应
  () => ({
    color: '#ffffff',
    backgroundColor: '#409eff',
    fontSize: '14px'
  }),
  () => ({
    color: '#999999',
    backgroundColor: '#f5f5f5',
    fontSize: '14px'
  })
)
</script>

<template>
  <button :class="className" :style="style" @click="isActive = !isActive">
    {{ isActive ? '激活' : '未激活' }}
  </button>
</template>
```

#### 场景 5：国际化（i18n）中动态语言切换

```ts
// composables/useLocaleText.ts
import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

type LocaleKey = 'zh' | 'en'

const messages = {
  zh: { hello: '你好', goodbye: '再见' },
  en: { hello: 'Hello', goodbye: 'Goodbye' }
}

function useLocaleText(
  locale: MaybeRefOrGetter<LocaleKey>,
  key: MaybeRefOrGetter<keyof typeof messages.zh>
) {
  return computed(() => {
    const currentLocale = toValue(locale)
    const currentKey = toValue(key)
    return messages[currentLocale][currentKey]
  })
}
```

```vue
<!-- LanguageSwitcher.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useLocaleText } from './composables/useLocaleText'

const locale = ref<LocaleKey>('zh')

// ✅ locale 改变时，文本自动切换
const helloText = useLocaleText(locale, 'hello')
const goodbyeText = useLocaleText(locale, 'goodbye')
</script>

<template>
  <p>{{ helloText }}</p>
  <p>{{ goodbyeText }}</p>
  <button @click="locale = locale === 'zh' ? 'en' : 'zh'">切换语言</button>
</template>
```

#### 场景 6：动态主题系统

```ts
// composables/useTheme.ts
import { computed, toValue, ref } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
}

const themes: Record<string, ThemeColors> = {
  light: {
    primary: '#409eff',
    secondary: '#67c23a',
    background: '#ffffff',
    text: '#333333'
  },
  dark: {
    primary: '#66b1ff',
    secondary: '#85ce61',
    background: '#1a1a2e',
    text: '#e0e0e0'
  }
}

function useTheme(themeName: MaybeRefOrGetter<string>) {
  const colors = computed(() => {
    const name = toValue(themeName)
    return themes[name] || themes.light
  })

  const cssVars = computed(() => {
    const c = toValue(colors)
    return {
      '--color-primary': c.primary,
      '--color-secondary': c.secondary,
      '--color-background': c.background,
      '--color-text': c.text
    }
  })

  return { colors, cssVars }
}
```

```vue
<!-- ThemeProvider.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from './composables/useTheme'

const currentTheme = ref('light')
const { cssVars } = useTheme(currentTheme)
</script>

<template>
  <div :style="cssVars" class="theme-container">
    <p>当前主题色: {{ cssVars['--color-primary'] }}</p>
    <button @click="currentTheme = currentTheme === 'light' ? 'dark' : 'light'">
      切换主题
    </button>
  </div>
</template>
```

#### 场景 7：权限控制与条件渲染

```ts
// composables/usePermission.ts
import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

type Permission = 'read' | 'write' | 'admin'

function usePermission(
  userPermissions: MaybeRefOrGetter<Permission[]>,
  requiredPermission: MaybeRefOrGetter<Permission>
) {
  const hasPermission = computed(() => {
    const perms = toValue(userPermissions)
    const required = toValue(requiredPermission)
    return perms.includes(required)
  })

  return { hasPermission }
}
```

```vue
<!-- AdminPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePermission } from './composables/usePermission'

const currentUser = ref({ permissions: ['read', 'write'] as Permission[] })

// ✅ 传入 ref 和 getter，灵活组合
const { hasPermission } = usePermission(
  () => currentUser.value.permissions,
  'admin'
)
</script>

<template>
  <div v-if="hasPermission">
    <h2>管理面板</h2>
    <p>仅管理员可见的内容</p>
  </div>
  <div v-else>
    <p>权限不足，无法访问管理面板</p>
  </div>
</template>
```

#### 场景 8：防抖搜索

```ts
// composables/useDebounceSearch.ts
import { ref, watch, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

function useDebounceSearch(
  keyword: MaybeRefOrGetter<string>,
  delay: MaybeRefOrGetter<number> = 300
) {
  const results = ref<string[]>([])
  const isSearching = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    () => toValue(keyword),
    (newKeyword) => {
      if (timer) clearTimeout(timer)

      const currentDelay = toValue(delay)
      timer = setTimeout(async () => {
        isSearching.value = true
        try {
          // 模拟 API 请求
          const response = await fetch(`/api/search?q=${newKeyword}`)
          results.value = await response.json()
        } catch {
          results.value = []
        } finally {
          isSearching.value = false
        }
      }, currentDelay)
    },
    { immediate: true }
  )

  return { results, isSearching }
}
```

```vue
<!-- SearchBox.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceSearch } from './composables/useDebounceSearch'

const keyword = ref('')
const debounceDelay = ref(300)

// ✅ keyword 和 delay 都支持响应式
const { results, isSearching } = useDebounceSearch(keyword, debounceDelay)
</script>

<template>
  <input v-model="keyword" placeholder="搜索..." />
  <div v-if="isSearching">搜索中...</div>
  <ul v-else>
    <li v-for="item in results" :key="item">{{ item }}</li>
  </ul>
</template>
```

#### 场景 9：窗口尺寸自适应

```ts
// composables/useBreakpoint.ts
import { ref, computed, onMounted, onUnmounted, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
}

function useBreakpoint(config?: MaybeRefOrGetter<Partial<BreakpointConfig>>) {
  const defaultConfig: BreakpointConfig = { sm: 640, md: 768, lg: 1024, xl: 1280 }

  const width = ref(window.innerWidth)

  const onResize = () => { width.value = window.innerWidth }
  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  const mergedConfig = computed(() => ({
    ...defaultConfig,
    ...toValue(config)  // ✅ 用户传入的断点配置可以是 ref 或 getter
  }))

  const isSm = computed(() => width.value < mergedConfig.value.sm)
  const isMd = computed(() => width.value >= mergedConfig.value.md)
  const isLg = computed(() => width.value >= mergedConfig.value.lg)
  const isXl = computed(() => width.value >= mergedConfig.value.xl)

  return { width, isSm, isMd, isLg, isXl }
}
```

```vue
<!-- ResponsiveLayout.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBreakpoint } from './composables/useBreakpoint'

// ✅ 断点配置可以是响应式的
const customBreakpoints = ref({ md: 900 })
const { isSm, isMd, isLg } = useBreakpoint(customBreakpoints)
</script>

<template>
  <div v-if="isSm">移动端布局</div>
  <div v-else-if="isMd">平板布局</div>
  <div v-else-if="isLg">桌面端布局</div>
</template>
```

#### 场景 10：分页器

```ts
// composables/usePagination.ts
import { computed, toValue, watch, ref } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

interface PaginationOptions {
  pageSize?: MaybeRefOrGetter<number>
}

function usePagination(
  totalItems: MaybeRefOrGetter<number>,
  options: PaginationOptions = {}
) {
  const currentPage = ref(1)
  const pageSize = computed(() => toValue(options.pageSize) ?? 10)
  const total = computed(() => toValue(totalItems))

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  const offset = computed(() => (currentPage.value - 1) * pageSize.value)

  // ✅ 当 pageSize 变化时，重置到第一页
  watch(pageSize, () => { currentPage.value = 1 })

  function goToPage(page: number) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  function nextPage() { goToPage(currentPage.value + 1) }
  function prevPage() { goToPage(currentPage.value - 1) }

  return {
    currentPage: currentPage as Readonly<Ref<number>>,
    pageSize,
    totalPages,
    offset,
    goToPage,
    nextPage,
    prevPage
  }
}
```

```vue
<!-- Paginator.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { usePagination } from './composables/usePagination'

const totalCount = ref(100)
const pageSize = ref(10)

// ✅ total 和 pageSize 都支持响应式更新
const { currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
  totalCount,
  { pageSize }
)
</script>

<template>
  <div>
    <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
    <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      :style="{ fontWeight: page === currentPage ? 'bold' : 'normal' }"
    >
      {{ page }}
    </button>
    <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
  </div>
</template>
```

### 六、注意事项

#### 1. 版本要求

`toValue()` 是 Vue 3.3 新增的 API，在 Vue 3.2 及更早版本中不可用。升级前请确认项目 Vue 版本。

```bash
# 检查当前 Vue 版本
npm list vue
```

#### 2. 返回值非响应式

`toValue()` 返回的是**纯值快照**，不会保持响应式连接。

```ts
const count = ref(0)
const value = toValue(count)  // value = 0，是一个普通数字

count.value = 1
console.log(value)  // 仍然是 0，不会随 ref 更新
```

> 💡 **提示：** 如果需要保持响应式，应将 `toValue()` 放在 `computed()` 或 `watchEffect()` 的回调中使用。

#### 3. getter 函数会被立即调用

`toValue()` 会对函数参数立即执行调用，如果函数有副作用需特别注意。

```ts
// ❌ 有副作用的函数不适合传给 toValue
const badGetter = () => {
  console.log('被调用了')  // 每次 toValue 都会执行
  fetch('/api/data')        // 每次都会发送请求！
  return 42
}

// ✅ 纯函数适合传给 toValue
const goodGetter = () => someRef.value * 2
```

#### 4. 在 watchEffect 内部调用以追踪依赖

如果希望 `toValue()` 解包的 ref 或 getter 能被响应式系统追踪，必须在 `watchEffect()` 回调**内部**调用 `toValue()`。

```ts
// ❌ 在 watchEffect 外部调用，无法追踪依赖
const url = toValue(urlRef)  // 此时已经拿到值，失去响应式连接
watchEffect(() => {
  fetch(url)  // url 是固定值，不会随 urlRef 变化
})

// ✅ 在 watchEffect 内部调用，依赖被正确追踪
watchEffect(() => {
  const url = toValue(urlRef)  // 每次执行都重新取值
  fetch(url)                    // urlRef 变化时自动重新执行
})
```

#### 5. 与 unref 的区别不要混淆

`unref()` 不会调用 getter 函数，而 `toValue()` 会。这是两者最本质的区别。

```ts
const getter = () => 42

unref(getter)    // 返回 () => 42（函数本身）
toValue(getter)  // 返回 42（函数被调用后的结果）
```

#### 6. 不要对 reactive 对象使用 toValue 解包

`toValue()` 只处理 ref 和 getter 函数。`reactive()` 对象传入 `toValue()` 会被原样返回，不会做任何解包。

```ts
import { reactive, toValue } from 'vue'

const state = reactive({ count: 0 })

// toValue 不会对 reactive 对象做特殊处理
console.log(toValue(state))  // { count: 0 }（原样返回，与 reactive 包装的对象相同）
```

#### 7. 注意 getter 函数中的性能开销

由于 `toValue()` 会立即调用 getter 函数，如果 getter 中包含大量计算或 DOM 操作，频繁调用可能造成性能问题。

```ts
// ❌ 避免在 getter 中进行重计算
const expensiveGetter = () => {
  return hugeArray.map(item => heavyTransform(item))  // 每次 toValue 都会执行
}

// ✅ 使用 computed 缓存计算结果
const computedValue = computed(() => {
  return hugeArray.map(item => heavyTransform(item))
})
// computed 也是 ref，toValue 会直接取 .value，且结果会被缓存
```

#### 8. 组合式函数中的最佳实践

编写组合式函数时，推荐使用 `MaybeRefOrGetter` 类型来声明参数，配合 `toValue()` 处理输入。

```ts
import type { MaybeRefOrGetter } from 'vue'

// ✅ 参数类型声明为 MaybeRefOrGetter，明确告诉调用者可以传多种形式
function useFeature(param: MaybeRefOrGetter<string>) {
  const value = toValue(param)
  // ...
}
```

#### 9. watch 中使用 toValue 的正确方式

在 `watch()` 中直接使用 `toValue()` 作为 source 不会追踪响应式依赖，需要用 getter 函数包裹。

```ts
const countRef = ref(0)

// ❌ 直接 toValue 作为 watch source，不会追踪变化
watch(toValue(countRef), (val) => {
  console.log(val)  // 只会执行一次，countRef 变化不会触发
})

// ✅ 用 getter 函数包裹，或者直接 watch ref
watch(() => toValue(countRef), (val) => {
  console.log(val)  // countRef 变化时会触发
})

// ✅ 更推荐：直接 watch ref
watch(countRef, (val) => {
  console.log(val)
})
```

#### 10. 避免在 toValue 中传入异步函数

`toValue()` 不会对异步函数（返回 Promise 的函数）做特殊处理，它只会同步调用函数并返回 Promise 对象。

```ts
// ❌ 异步函数传入 toValue 得到的是 Promise，不是最终值
const asyncGetter = async () => {
  const res = await fetch('/api/data')
  return res.json()
}

const result = toValue(asyncGetter)
console.log(result)  // Promise { <pending> }，不是实际数据

// ✅ 如果需要处理异步，使用 async/await
watchEffect(async () => {
  const promise = toValue(asyncGetter)
  const data = await promise
  console.log(data)  // 实际数据
})
```

### 七、相关 API 对比

#### toValue vs unref

| 特性 | `unref()` | `toValue()` |
| --- | --- | --- |
| 最低版本 | Vue 3.0 | Vue 3.3 |
| 普通值 | 原样返回 | 原样返回 |
| `ref` | 解包 `.value` | 解包 `.value` |
| `computed` | 解包 `.value` | 解包 `.value` |
| getter 函数 | **原样返回**（不调用） | **调用并返回结果** |
| 适用场景 | 简单的 ref 解包 | 组合式函数中灵活参数处理 |

```ts
import { toValue, unref, ref } from 'vue'

const count = ref(1)
const getter = () => 2

unref(count)    // 1
unref(getter)   // () => 2（函数本身）

toValue(count)  // 1
toValue(getter) // 2（函数被调用后的结果）
```

> 💡 **提示：** `toValue()` 可以看作 `unref()` 的增强版。如果你的输入可能包含 getter 函数，优先使用 `toValue()`。

#### toValue vs toRef

| 特性 | `toValue()` | `toRef()` |
| --- | --- | --- |
| 功能 | 将值/ref/getter **解包**为纯值 | 为 reactive 对象的某个属性**创建** ref |
| 方向 | 多种类型 → 纯值 | reactive 属性 → ref |
| 返回值 | 普通值（非响应式） | ref（保持响应式连接） |

```ts
import { reactive, toRef, toValue, ref } from 'vue'

const state = reactive({ count: 0 })

// toRef：从 reactive 中提取属性为 ref
const countRef = toRef(state, 'count')
countRef.value = 1
console.log(state.count)  // 1（保持连接）

// toValue：将 ref/getter 解包为纯值
const val = toValue(countRef)
console.log(val)  // 1（纯数字，无响应式连接）
```

### 八、总结

`toValue()` 是 Vue 3.3 为组合式函数设计的重要工具函数，核心要点如下：

1. **统一解包**：将普通值、`ref`、getter 函数统一规范化为纯值
2. **核心场景**：编写组合式函数时，让参数能灵活接收多种类型
3. **与 unref 的区别**：`toValue()` 会调用 getter 函数，`unref()` 不会
4. **响应式追踪**：在 `watchEffect()` 或 `computed()` 内部调用 `toValue()` 才能正确追踪依赖
5. **返回非响应式值**：`toValue()` 返回的是纯值快照，不会保持响应式连接
6. **推荐类型**：配合 `MaybeRefOrGetter<T>` 类型声明组合式函数的参数

> ⚠️ **注意：** `toValue()` 需要 Vue 3.3+ 版本支持。如果项目使用 Vue 3.2 或更早版本，可以使用 `unref()` 作为替代，但需要注意 getter 函数不会被自动调用。
