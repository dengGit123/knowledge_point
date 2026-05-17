# v-if

## 作用
`v-if` 是 Vue 的条件渲染指令，用于根据表达式的真假值来条件性地渲染元素或组件。当表达式为真时，元素会被渲染；为假时，元素会被销毁。

## 用法

### 基本用法

```vue
<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
</script>

<template>
  <div v-if="isVisible">
    只有当 isVisible 为 true 时才会显示
  </div>
</template>
```

### v-else 和 v-else-if

```vue
<script setup>
import { ref } from 'vue'

const type = ref('A')
</script>

<template>
  <div>
    <div v-if="type === 'A'">
      A
    </div>
    <div v-else-if="type === 'B'">
      B
    </div>
    <div v-else-if="type === 'C'">
      C
    </div>
    <div v-else>
      Not A/B/C
    </div>
  </div>
</template>
```

### 在 <template> 上使用

```vue
<template>
  <!-- 切换多个元素 -->
  <template v-if="isLoggedIn">
    <h1>欢迎回来!</h1>
    <p>用户信息...</p>
    <button>登出</button>
  </template>

  <template v-else>
    <h1>请登录</h1>
    <form>
      <!-- 登录表单 -->
    </form>
  </template>
</template>
```

### 与 v-show 的区别

```vue
<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
</script>

<template>
  <!-- v-if: 条件为假时，元素完全从 DOM 中移除 -->
  <div v-if="isVisible">
    使用 v-if
  </div>

  <!-- v-show: 元素始终保留在 DOM 中，只是切换 CSS display -->
  <div v-show="isVisible">
    使用 v-show
  </div>
</template>
```

## 注意事项

### 1. v-else/v-else-if 必须紧跟在 v-if 或 v-else-if 后面

```vue
<template>
  <!-- ✅ 正确 -->
  <div v-if="condition">A</div>
  <div v-else>B</div>

  <!-- ❌ 错误：中间有其他元素 -->
  <div v-if="condition">A</div>
  <span>Other element</span>
  <div v-else>B</div>
</template>
```

### 2. 销毁和重建

```vue
<script setup>
import { ref, onMounted } from 'vue'

const show = ref(true)

onMounted(() => {
  show.value = false
  show.value = true // 组件会被完全重新创建
})
</script>

<template>
  <ExpensiveComponent v-if="show" />
</template>
```

### 3. 不可见时子组件不会创建

```vue
<script setup>
import { ref } from 'vue'

const showChild = ref(false)
</script>

<template>
  <div>
    <button @click="showChild = true">显示子组件</button>
    <ChildComponent v-if="showChild" />
    <!-- showChild 为 false 时，ChildComponent 不会被创建 -->
  </div>
</template>
```

### 4. 在 key 上使用

```vue
<template>
  <!-- 使用 key 强制重新渲染 -->
  <component :is="currentComponent" :key="componentKey" />

  <!-- 或根据条件切换不同组件 -->
  <component :is="isLoggedIn ? UserPanel : LoginForm" />
</template>
```

### 5. 访问不存在元素的引用

```vue
<script setup>
import { ref, watch } from 'vue'

const show = ref(false)
const elementRef = ref(null)

watch(elementRef, (newVal) => {
  // v-if 为 false 时，elementRef.value 为 null
  console.log(newVal) // null 或 Element
})
</script>

<template>
  <div v-if="show" ref="elementRef">内容</div>
</template>
```

### 6. 多条件判断

```vue
<script setup>
import { ref } from 'vue'

const user = ref({
  role: 'admin',
  status: 'active'
})
</script>

<template>
  <!-- 复杂条件 -->
  <div v-if="user.role === 'admin' && user.status === 'active'">
    管理员控制面板
  </div>

  <!-- 使用计算属性更清晰 -->
  <div v-if="canAccessAdminPanel">
    管理员控制面板
  </div>
</template>
```

### 7. 与 v-for 优先级

```vue
<template>
  <!-- Vue 3 中 v-if 优先级高于 v-for -->
  <template v-for="item in items" :key="item.id">
    <div v-if="item.visible">{{ item.name }}</div>
  </template>

  <!-- 或者使用 template 包裹 -->
  <template v-for="item in items" :key="item.id">
    <div v-if="item.visible">{{ item.name }}</div>
  </template>
</template>
```

## 使用场景

### 1. 权限控制

```vue
<script setup>
import { ref, computed } from 'vue'

const user = ref({
  role: 'user',
  permissions: ['read']
})

const canEdit = computed(() => {
  return user.value.permissions.includes('edit')
})

const isAdmin = computed(() => {
  return user.value.role === 'admin'
})
</script>

<template>
  <div>
    <button v-if="canEdit">编辑</button>
    <button v-if="isAdmin">删除</button>

    <!-- 多级权限 -->
    <AdminPanel v-if="isAdmin && canEdit" />
    <UserPanel v-else-if="canEdit" />
    <GuestPanel v-else />
  </div>
</template>
```

### 2. 加载状态

```vue
<script setup>
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
</script>

<template>
  <div>
    <!-- 加载中 -->
    <div v-if="loading">加载中...</div>

    <!-- 错误 -->
    <div v-else-if="error">
      错误: {{ error.message }}
      <button @click="fetchData">重试</button>
    </div>

    <!-- 数据 -->
    <div v-else-if="data">
      {{ data }}
    </div>

    <!-- 空数据 -->
    <div v-else>暂无数据</div>
  </div>
</template>
```

### 3. 步骤表单

```vue
<script setup>
import { ref } from 'vue'

const currentStep = ref(1)
const totalSteps = 3
</script>

<template>
  <div class="wizard">
    <!-- 步骤 1 -->
    <div v-if="currentStep === 1">
      <h2>步骤 1: 基本信息</h2>
      <input v-model="form.name" placeholder="姓名" />
      <button @click="currentStep = 2">下一步</button>
    </div>

    <!-- 步骤 2 -->
    <div v-else-if="currentStep === 2">
      <h2>步骤 2: 详细信息</h2>
      <input v-model="form.email" placeholder="邮箱" />
      <button @click="currentStep = 1">上一步</button>
      <button @click="currentStep = 3">下一步</button>
    </div>

    <!-- 步骤 3 -->
    <div v-else-if="currentStep === 3">
      <h2>步骤 3: 确认信息</h2>
      <p>姓名: {{ form.name }}</p>
      <p>邮箱: {{ form.email }}</p>
      <button @click="currentStep = 2">上一步</button>
      <button @click="submit">提交</button>
    </div>
  </div>
</template>
```

### 4. 标签页切换

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('home')
</script>

<template>
  <div class="tabs">
    <div class="tab-headers">
      <button
        v-for="tab in ['home', 'profile', 'settings']"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'home'">首页内容</div>
      <div v-else-if="activeTab === 'profile'">个人资料</div>
      <div v-else-if="activeTab === 'settings'">设置</div>
    </div>
  </div>
</template>
```

### 5. 响应式显示

```vue
<script setup>
import { ref, computed } from 'vue'

const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(() =>
  windowWidth.value >= 768 && windowWidth.value < 1024
)
const isDesktop = computed(() => windowWidth.value >= 1024)
</script>

<template>
  <div>
    <!-- 移动端布局 -->
    <MobileLayout v-if="isMobile" />

    <!-- 平板布局 -->
    <TabletLayout v-else-if="isTablet" />

    <!-- 桌面端布局 -->
    <DesktopLayout v-else />
  </div>
</template>
```

### 6. 条件性特性

```vue
<script setup>
import { ref } from 'vue'

const user = ref({
  avatar: null,
  coverImage: null
})
</script>

<template>
  <div class="profile">
    <!-- 有封面图时显示 -->
    <div v-if="user.coverImage" class="cover">
      <img :src="user.coverImage" />
    </div>

    <!-- 有头像时显示，否则显示默认头像 -->
    <div class="avatar">
      <img
        v-if="user.avatar"
        :src="user.avatar"
      />
      <div v-else class="default-avatar">
        {{ user.name.charAt(0) }}
      </div>
    </div>
  </div>
</template>
```

### 7. 表单验证

```vue
<script setup>
import { ref, computed } from 'vue'

const form = ref({
  username: '',
  email: '',
  password: ''
})

const errors = computed(() => {
  const errs = {}

  if (!form.value.username) {
    errs.username = '用户名不能为空'
  } else if (form.value.username.length < 3) {
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

const isValid = computed(() => {
  return Object.keys(errors.value).length === 0
})
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="form.username" />
    <span v-if="errors.username" class="error">
      {{ errors.username }}
    </span>

    <input v-model="form.email" />
    <span v-if="errors.email" class="error">
      {{ errors.email }}
    </span>

    <button :disabled="!isValid">提交</button>
  </form>
</template>
```

### 8. 数据过滤

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1', status: 'active' },
  { id: 2, name: 'Item 2', status: 'inactive' },
  { id: 3, name: 'Item 3', status: 'active' }
])

const filter = ref('all')

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  return items.value.filter(item => item.status === filter.value)
})
</script>

<template>
  <div>
    <button @click="filter = 'all'">全部</button>
    <button @click="filter = 'active'">激活</button>
    <button @click="filter = 'inactive'">未激活</button>

    <div v-for="item in filteredItems" :key="item.id">
      {{ item.name }}
    </div>

    <!-- 空状态 -->
    <div v-if="filteredItems.length === 0">
      没有找到符合条件的项
    </div>
  </div>
</template>
```

### 9. 特殊情况处理

```vue
<script setup>
import { ref } from 'vue'

const data = ref(null)
const error = ref(null)
</script>

<template>
  <!-- 正常数据 -->
  <DataList v-if="data && data.length > 0" :items="data" />

  <!-- 空数据 -->
  <EmptyState v-else-if="data && data.length === 0" />

  <!-- 加载中 -->
  <LoadingState v-else-if="!data && !error" />

  <!-- 错误 -->
  <ErrorState v-else :error="error" />
</template>
```

### 10. 功能开关

```vue
<script setup>
import { ref } from 'vue'

const features = ref({
  darkMode: false,
  notifications: true,
  betaFeatures: false
})
</script>

<template>
  <div>
    <!-- 基础功能始终可用 -->
    <BasicFeatures />

    <!-- 通知功能 -->
    <NotificationCenter v-if="features.notifications" />

    <!-- 暗黑模式 -->
    <ThemeToggle v-if="features.darkMode" />

    <!-- Beta 功能 -->
    <BetaFeatures v-if="features.betaFeatures" />
  </div>
</template>
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
