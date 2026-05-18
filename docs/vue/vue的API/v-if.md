# v-if

## 作用
`v-if` 是 Vue 的条件渲染指令，用于根据表达式的真假值来条件性地渲染元素或组件。当表达式为真时，元素会被渲染；为假时，元素会被销毁。

## 用法

### 基本用法

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const isVisible = ref(true)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-if="isVisible"&gt;
    只有当 isVisible 为 true 时才会显示
  &lt;/div&gt;
`&lt;/template&gt;`
```

### v-else 和 v-else-if

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const type = ref('A')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;div v-if="type === 'A'"&gt;
      A
    &lt;/div&gt;
    &lt;div v-else-if="type === 'B'"&gt;
      B
    &lt;/div&gt;
    &lt;div v-else-if="type === 'C'"&gt;
      C
    &lt;/div&gt;
    &lt;div v-else&gt;
      Not A/B/C
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 在 `&lt;template&gt;` 上使用

```text
`&lt;template&gt;`
  &lt;!-- 切换多个元素 --&gt;
  `&lt;template&gt;`
    &lt;h1&gt;欢迎回来!&lt;/h1&gt;
    &lt;p&gt;用户信息...&lt;/p&gt;
    &lt;button&gt;登出&lt;/button&gt;
  `&lt;/template&gt;`

  `&lt;template&gt;`
    &lt;h1&gt;请登录&lt;/h1&gt;
    &lt;form&gt;
      &lt;!-- 登录表单 --&gt;
    &lt;/form&gt;
  `&lt;/template&gt;`
`&lt;/template&gt;`
```

### 与 v-show 的区别

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const isVisible = ref(true)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- v-if: 条件为假时，元素完全从 DOM 中移除 --&gt;
  &lt;div v-if="isVisible"&gt;
    使用 v-if
  &lt;/div&gt;

  &lt;!-- v-show: 元素始终保留在 DOM 中，只是切换 CSS display --&gt;
  &lt;div v-show="isVisible"&gt;
    使用 v-show
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. v-else/v-else-if 必须紧跟在 v-if 或 v-else-if 后面

```text
`&lt;template&gt;`
  &lt;!-- ✅ 正确 --&gt;
  &lt;div v-if="condition"&gt;A&lt;/div&gt;
  &lt;div v-else&gt;B&lt;/div&gt;

  &lt;!-- ❌ 错误：中间有其他元素 --&gt;
  &lt;div v-if="condition"&gt;A&lt;/div&gt;
  &lt;span&gt;Other element&lt;/span&gt;
  &lt;div v-else&gt;B&lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 销毁和重建

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const show = ref(true)

onMounted(() =&gt; {
  show.value = false
  show.value = true // 组件会被完全重新创建
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ExpensiveComponent v-if="show" /&gt;
`&lt;/template&gt;`
```

### 3. 不可见时子组件不会创建

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const showChild = ref(false)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="showChild = true"&gt;显示子组件&lt;/button&gt;
    &lt;ChildComponent v-if="showChild" /&gt;
    &lt;!-- showChild 为 false 时，ChildComponent 不会被创建 --&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 在 key 上使用

```text
`&lt;template&gt;`
  &lt;!-- 使用 key 强制重新渲染 --&gt;
  &lt;component :is="currentComponent" :key="componentKey" /&gt;

  &lt;!-- 或根据条件切换不同组件 --&gt;
  &lt;component :is="isLoggedIn ? UserPanel : LoginForm" /&gt;
`&lt;/template&gt;`
```

### 5. 访问不存在元素的引用

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const show = ref(false)
const elementRef = ref(null)

watch(elementRef, (newVal) =&gt; {
  // v-if 为 false 时，elementRef.value 为 null
  console.log(newVal) // null 或 Element
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-if="show" ref="elementRef"&gt;内容&lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 多条件判断

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const user = ref({
  role: 'admin',
  status: 'active'
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 复杂条件 --&gt;
  &lt;div v-if="user.role === 'admin' && user.status === 'active'"&gt;
    管理员控制面板
  &lt;/div&gt;

  &lt;!-- 使用计算属性更清晰 --&gt;
  &lt;div v-if="canAccessAdminPanel"&gt;
    管理员控制面板
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 与 v-for 优先级

```text
`&lt;template&gt;`
  &lt;!-- Vue 3 中 v-if 优先级高于 v-for --&gt;
  `&lt;template&gt;`
    &lt;div v-if="item.visible"&gt;{{ item.name }}&lt;/div&gt;
  `&lt;/template&gt;`

  &lt;!-- 或者使用 template 包裹 --&gt;
  `&lt;template&gt;`
    &lt;div v-if="item.visible"&gt;{{ item.name }}&lt;/div&gt;
  `&lt;/template&gt;`
`&lt;/template&gt;`
```

## 使用场景

### 1. 权限控制

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const user = ref({
  role: 'user',
  permissions: ['read']
})

const canEdit = computed(() =&gt; {
  return user.value.permissions.includes('edit')
})

const isAdmin = computed(() =&gt; {
  return user.value.role === 'admin'
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button v-if="canEdit"&gt;编辑&lt;/button&gt;
    &lt;button v-if="isAdmin"&gt;删除&lt;/button&gt;

    &lt;!-- 多级权限 --&gt;
    &lt;AdminPanel v-if="isAdmin && canEdit" /&gt;
    &lt;UserPanel v-else-if="canEdit" /&gt;
    &lt;GuestPanel v-else /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 加载状态

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const loading = ref(true)
const error = ref(null)
const data = ref(null)

async function fetchData() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/data')
    data.value = await response.json()
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;!-- 加载中 --&gt;
    &lt;div v-if="loading"&gt;加载中...&lt;/div&gt;

    &lt;!-- 错误 --&gt;
    &lt;div v-else-if="error"&gt;
      错误: {{ error.message }}
      &lt;button @click="fetchData"&gt;重试&lt;/button&gt;
    &lt;/div&gt;

    &lt;!-- 数据 --&gt;
    &lt;div v-else-if="data"&gt;
      {{ data }}
    &lt;/div&gt;

    &lt;!-- 空数据 --&gt;
    &lt;div v-else&gt;暂无数据&lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 3. 步骤表单

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const currentStep = ref(1)
const totalSteps = 3
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="wizard"&gt;
    &lt;!-- 步骤 1 --&gt;
    &lt;div v-if="currentStep === 1"&gt;
      &lt;h2&gt;步骤 1: 基本信息&lt;/h2&gt;
      &lt;input v-model="form.name" placeholder="姓名" /&gt;
      &lt;button @click="currentStep = 2"&gt;下一步&lt;/button&gt;
    &lt;/div&gt;

    &lt;!-- 步骤 2 --&gt;
    &lt;div v-else-if="currentStep === 2"&gt;
      &lt;h2&gt;步骤 2: 详细信息&lt;/h2&gt;
      &lt;input v-model="form.email" placeholder="邮箱" /&gt;
      &lt;button @click="currentStep = 1"&gt;上一步&lt;/button&gt;
      &lt;button @click="currentStep = 3"&gt;下一步&lt;/button&gt;
    &lt;/div&gt;

    &lt;!-- 步骤 3 --&gt;
    &lt;div v-else-if="currentStep === 3"&gt;
      &lt;h2&gt;步骤 3: 确认信息&lt;/h2&gt;
      &lt;p&gt;姓名: {{ form.name }}&lt;/p&gt;
      &lt;p&gt;邮箱: {{ form.email }}&lt;/p&gt;
      &lt;button @click="currentStep = 2"&gt;上一步&lt;/button&gt;
      &lt;button @click="submit"&gt;提交&lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 标签页切换

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const activeTab = ref('home')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="tabs"&gt;
    &lt;div class="tab-headers"&gt;
      &lt;button
        v-for="tab in ['home', 'profile', 'settings']"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      &gt;
        {{ tab }}
      &lt;/button&gt;
    &lt;/div&gt;

    &lt;div class="tab-content"&gt;
      &lt;div v-if="activeTab === 'home'"&gt;首页内容&lt;/div&gt;
      &lt;div v-else-if="activeTab === 'profile'"&gt;个人资料&lt;/div&gt;
      &lt;div v-else-if="activeTab === 'settings'"&gt;设置&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 响应式显示

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const windowWidth = ref(window.innerWidth)

const isMobile = computed(() =&gt; windowWidth.value &lt; 768)
const isTablet = computed(() =&gt;
  windowWidth.value &gt;= 768 && windowWidth.value &lt; 1024
)
const isDesktop = computed(() =&gt; windowWidth.value &gt;= 1024)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;!-- 移动端布局 --&gt;
    &lt;MobileLayout v-if="isMobile" /&gt;

    &lt;!-- 平板布局 --&gt;
    &lt;TabletLayout v-else-if="isTablet" /&gt;

    &lt;!-- 桌面端布局 --&gt;
    &lt;DesktopLayout v-else /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 条件性特性

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const user = ref({
  avatar: null,
  coverImage: null
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="profile"&gt;
    &lt;!-- 有封面图时显示 --&gt;
    &lt;div v-if="user.coverImage" class="cover"&gt;
      &lt;img :src="user.coverImage" /&gt;
    &lt;/div&gt;

    &lt;!-- 有头像时显示，否则显示默认头像 --&gt;
    &lt;div class="avatar"&gt;
      &lt;img
        v-if="user.avatar"
        :src="user.avatar"
      /&gt;
      &lt;div v-else class="default-avatar"&gt;
        {{ user.name.charAt(0) }}
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 表单验证

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const form = ref({
  username: '',
  email: '',
  password: ''
})

const errors = computed(() =&gt; {
  const errs = {}

  if (!form.value.username) {
    errs.username = '用户名不能为空'
  } else if (form.value.username.length &lt; 3) {
    errs.username = '用户名至少3个字符'
  }

  if (!form.value.email) {
    errs.email = '邮箱不能为空'
  }

  if (!form.value.password) {
    errs.password = '密码不能为空'
  }

  return errs
})

const isValid = computed(() =&gt; {
  return Object.keys(errors.value).length === 0
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form @submit.prevent="submit"&gt;
    &lt;input v-model="form.username" /&gt;
    &lt;span v-if="errors.username" class="error"&gt;
      {{ errors.username }}
    &lt;/span&gt;

    &lt;input v-model="form.email" /&gt;
    &lt;span v-if="errors.email" class="error"&gt;
      {{ errors.email }}
    &lt;/span&gt;

    &lt;button :disabled="!isValid"&gt;提交&lt;/button&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 8. 数据过滤

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1', status: 'active' },
  { id: 2, name: 'Item 2', status: 'inactive' },
  { id: 3, name: 'Item 3', status: 'active' }
])

const filter = ref('all')

const filteredItems = computed(() =&gt; {
  if (filter.value === 'all') return items.value
  return items.value.filter(item =&gt; item.status === filter.value)
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button @click="filter = 'all'"&gt;全部&lt;/button&gt;
    &lt;button @click="filter = 'active'"&gt;激活&lt;/button&gt;
    &lt;button @click="filter = 'inactive'"&gt;未激活&lt;/button&gt;

    &lt;div v-for="item in filteredItems" :key="item.id"&gt;
      {{ item.name }}
    &lt;/div&gt;

    &lt;!-- 空状态 --&gt;
    &lt;div v-if="filteredItems.length === 0"&gt;
      没有找到符合条件的项
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 9. 特殊情况处理

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const data = ref(null)
const error = ref(null)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 正常数据 --&gt;
  &lt;DataList v-if="data && data.length &gt; 0" :items="data" /&gt;

  &lt;!-- 空数据 --&gt;
  &lt;EmptyState v-else-if="data && data.length === 0" /&gt;

  &lt;!-- 加载中 --&gt;
  &lt;LoadingState v-else-if="!data && !error" /&gt;

  &lt;!-- 错误 --&gt;
  &lt;ErrorState v-else :error="error" /&gt;
`&lt;/template&gt;`
```

### 10. 功能开关

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const features = ref({
  darkMode: false,
  notifications: true,
  betaFeatures: false
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;!-- 基础功能始终可用 --&gt;
    &lt;BasicFeatures /&gt;

    &lt;!-- 通知功能 --&gt;
    &lt;NotificationCenter v-if="features.notifications" /&gt;

    &lt;!-- 暗黑模式 --&gt;
    &lt;ThemeToggle v-if="features.darkMode" /&gt;

    &lt;!-- Beta 功能 --&gt;
    &lt;BetaFeatures v-if="features.betaFeatures" /&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

## v-if vs v-show

| 特性 | v-if | v-show |
|-----|------|--------|
| 初始渲染开销 | 较高（需要编译） | 较低（只切换 CSS） |
| 切换开销 | 高（销毁/重建） | 低（只切换 display） |
| 条件为假时 | 完全从 DOM 移除 | 仍保留在 DOM 中 |
| 生命周期 | 会触发组件生命周期 | 不会触发 |
| 适用场景 | 条件很少改变 | 频繁切换 |

## 最佳实践

1. **频繁切换用 v-show**：对于需要频繁切换可见性的元素
2. **条件很少改变用 v-if**：对于运行时很少改变的条件
3. **使用计算属性**：复杂条件使用计算属性
4. **key 的使用**：需要强制重新渲染时使用 key
5. **避免混用 v-if 和 v-for**：使用 template 或计算属性
