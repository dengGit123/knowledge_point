### 一、概述

> 📖 [Vue 官方文档 - v-if / v-else](https://cn.vuejs.org/api/built-in-directives#v-if)

`v-else` 是 Vue 提供的一个条件渲染指令，用于为 `v-if` 或 `v-else-if` 添加一个"else 块"。当前面的 `v-if` / `v-else-if` 条件均为 `false` 时，`v-else` 所在的元素会被渲染。

**为什么需要 `v-else`？**

在实际开发中，我们经常需要根据条件展示不同的内容：用户已登录显示欢迎信息，未登录则显示登录按钮；数据加载完成显示列表，没有数据则显示空状态提示。`v-else` 让我们能够以声明式的方式表达这种"非此即彼"的逻辑，使模板代码更加直观、语义更加清晰，而不需要编写重复的条件判断表达式。

**核心特点：**

- 必须紧跟在 `v-if` 或 `v-else-if` 后面，中间不能有任何其他元素
- 不能单独使用，必须作为条件链的最后一个分支
- 真正的条件渲染 —— 条件为 `false` 时元素不会出现在 DOM 中
- 可以作用在 `<template>` 元素上，实现多元素的条件分组

---

### 二、核心原理

`v-else` 的底层实现基于 Vue 的虚拟 DOM diff 算法和条件渲染机制：

1. **编译阶段**：Vue 模板编译器会将 `v-if` / `v-else-if` / `v-else` 条件链编译为一个条件表达式节点（`ConditionalExpression`），所有分支共享同一个条件逻辑。
2. **运行时渲染**：Vue 在渲染时会评估条件链中每个分支的表达式，只有一个分支的元素会被创建并插入 DOM。其余分支的元素不会被创建，也不存在于 DOM 树中。
3. **切换策略**：当条件变化时，Vue 会销毁旧分支的元素（触发 `unmounted` 等生命周期），然后创建并挂载新分支的元素（触发 `mounted` 等生命周期）。这意味着分支切换是有销毁和重建成本的。
4. **元素复用**：默认情况下，Vue 会尽量复用相同标签的元素，以提升性能。如果不希望复用，可以使用 `key` 属性强制替换。

> 💡 **提示：** `v-if` / `v-else` 是真正的条件渲染（DOM 的创建与销毁），而 `v-show` 只是切换 CSS 的 `display` 属性。频繁切换的场景建议用 `v-show`，条件很少改变的场景建议用 `v-if` / `v-else`。

---

### 三、详细用法

#### 1. 基本用法

`v-else` 最基本的用法是与 `v-if` 配合，形成互斥的两个渲染分支。

```vue
<template>
  <!-- 当 isLoggedIn 为 true 时显示欢迎信息，否则显示登录提示 -->
  <div v-if="isLoggedIn">
    <span>欢迎回来，{{ username }}！</span>
    <button @click="handleLogout">退出登录</button>
  </div>
  <div v-else>
    <span>您还未登录</span>
    <button @click="handleLogin">去登录</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoggedIn = ref<boolean>(false)
const username = ref<string>('')

function handleLogin(): void {
  isLoggedIn.value = true
  username.value = '张三'
}

function handleLogout(): void {
  isLoggedIn.value = false
  username.value = ''
}
</script>
```

#### 2. 进阶用法

##### 2.1 多条件分支链（v-if + v-else-if + v-else）

当条件判断不止两个分支时，可以在 `v-if` 和 `v-else` 之间插入 `v-else-if` 实现多分支逻辑。

```vue
<template>
  <div class="status-container">
    <div v-if="status === 'loading'" class="loading">
      <LoadingSpinner />
      <p>数据加载中，请稍候...</p>
    </div>
    <div v-else-if="status === 'error'" class="error">
      <p>加载失败：{{ errorMessage }}</p>
      <button @click="retry">重新加载</button>
    </div>
    <div v-else-if="status === 'empty'" class="empty">
      <EmptyState message="暂无数据" @add="handleAdd" />
    </div>
    <div v-else class="success">
      <DataList :items="dataList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import EmptyState from './EmptyState.vue'
import DataList from './DataList.vue'

type Status = 'loading' | 'error' | 'empty' | 'success'

const status = ref<Status>('loading')
const errorMessage = ref<string>('')
const dataList = ref<Array<{ id: number; name: string }>>([])

function retry(): void {
  status.value = 'loading'
  // 重新请求数据...
}

function handleAdd(): void {
  // 处理新增操作...
}
</script>
```

##### 2.2 配合 `<template>` 包裹多个元素

当某个分支需要渲染多个元素，但又不想额外增加一层 DOM 节点时，可以使用 `<template>` 作为 `v-else` 的容器。

```vue
<template>
  <div class="dashboard">
    <!-- 管理员视图：多个组件，不产生额外 DOM 节点 -->
    <template v-if="isAdmin">
      <AdminHeader />
      <AdminSidebar />
      <AdminStats />
      <AdminUserManagement />
    </template>
    <!-- 普通用户视图 -->
    <template v-else>
      <UserHeader />
      <UserContent />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminStats from './AdminStats.vue'
import AdminUserManagement from './AdminUserManagement.vue'
import UserHeader from './UserHeader.vue'
import UserContent from './UserContent.vue'

interface Props {
  role: 'admin' | 'user'
}

const props = defineProps<Props>()
const isAdmin = computed(() => props.role === 'admin')
</script>
```

##### 2.3 配合 `key` 控制元素复用

默认情况下，Vue 会复用相同标签的元素（输入框的值不会清空）。通过添加不同的 `key`，可以强制 Vue 销毁并重建元素。

```vue
<template>
  <div class="auth-form">
    <template v-if="mode === 'login'">
      <h2>用户登录</h2>
      <input key="login-email" v-model="loginEmail" placeholder="邮箱" />
      <input key="login-password" v-model="loginPassword" type="password" placeholder="密码" />
      <button @click="handleLogin">登录</button>
    </template>
    <template v-else>
      <h2>用户注册</h2>
      <input key="register-email" v-model="registerEmail" placeholder="邮箱" />
      <input key="register-name" v-model="registerName" placeholder="用户名" />
      <input key="register-password" v-model="registerPassword" type="password" placeholder="密码" />
      <button @click="handleRegister">注册</button>
    </template>
    <p @click="toggleMode">
      {{ mode === 'login' ? '还没有账号？去注册' : '已有账号？去登录' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type AuthMode = 'login' | 'register'

const mode = ref<AuthMode>('login')
const loginEmail = ref('')
const loginPassword = ref('')
const registerEmail = ref('')
const registerName = ref('')
const registerPassword = ref('')

function toggleMode(): void {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}

function handleLogin(): void {
  console.log('登录:', loginEmail.value)
}

function handleRegister(): void {
  console.log('注册:', registerEmail.value, registerName.value)
}
</script>
```

##### 2.4 配合组件动态渲染

`v-else` 也可以直接作用在组件标签上，根据条件渲染不同的子组件。

```vue
<template>
  <div class="page">
    <!-- 根据异步状态渲染不同组件 -->
    <SkeletonLoader v-if="loading" />
    <ErrorFallback v-else-if="error" :message="error" @retry="fetchData" />
    <DataTable v-else :columns="columns" :data="tableData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorFallback from './ErrorFallback.vue'
import DataTable from './DataTable.vue'

interface Column {
  key: string
  title: string
}

interface TableRow {
  id: number
  [key: string]: string | number
}

const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const columns = ref<Column[]>([
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'email', title: '邮箱' }
])
const tableData = ref<TableRow[]>([])

async function fetchData(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('/api/users')
    tableData.value = await response.json()
  } catch (e) {
    error.value = '数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

#### 3. API 参数说明

| 属性 | 说明 | 类型 | 是否必须 | 默认值 |
| --- | --- | --- | --- | --- |
| `v-else` | 条件渲染指令，无参数 | `-` | - | `-` |
| 位置要求 | 必须紧跟在 `v-if` 或 `v-else-if` 元素之后 | `-` | 是 | - |
| 可作用元素 | HTML 元素、`<template>`、组件 | `-` | - | - |
| `key`（可选） | 用于控制元素复用，不同 `key` 的元素不会复用 | `string \| number` | 否 | 自动生成 |

> 💡 **提示：** `v-else` 不接受任何表达式参数，它始终作为条件链的兜底分支，无需也不能写 `v-else="condition"`。

---

### 四、实现效果

使用 `v-else` 后，当条件链前面的条件均为 `false` 时，`v-else` 所在的元素会被渲染到 DOM 中；否则该元素完全不存在于 DOM 树中。

```vue
<template>
  <!-- 场景：根据评分显示不同的等级标签 -->
  <span v-if="score >= 90" class="badge badge-a">优秀</span>
  <span v-else-if="score >= 80" class="badge badge-b">良好</span>
  <span v-else-if="score >= 60" class="badge badge-c">及格</span>
  <span v-else class="badge badge-d">不及格</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const score = ref<number>(85)

// 当 score = 85 时：
// DOM 中只存在 <span class="badge badge-b">良好</span>
// 其余三个 span 不会被创建，也不存在于 DOM 中
</script>
```

**渲染行为说明：**

- `score = 95` → DOM 中只有 `<span class="badge badge-a">优秀</span>`
- `score = 85` → DOM 中只有 `<span class="badge badge-b">良好</span>`
- `score = 70` → DOM 中只有 `<span class="badge badge-c">及格</span>`
- `score = 45` → DOM 中只有 `<span class="badge badge-d">不及格</span>`

---

### 五、使用场景

#### 场景 1：登录 / 未登录状态展示

```vue
<template>
  <div class="header">
    <div v-if="user" class="user-info">
      <img :src="user.avatar" :alt="user.name" class="avatar" />
      <span>{{ user.name }}</span>
      <button @click="handleLogout">退出</button>
    </div>
    <div v-else class="auth-buttons">
      <button @click="showLogin = true">登录</button>
      <button @click="showRegister = true">注册</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UserInfo {
  name: string
  avatar: string
}

const user = ref<UserInfo | null>(null)
const showLogin = ref<boolean>(false)
const showRegister = ref<boolean>(false)

function handleLogout(): void {
  user.value = null
}
</script>
```

#### 场景 2：数据列表与空状态

```vue
<template>
  <div class="list-wrapper">
    <ul v-if="items.length > 0" class="data-list">
      <li v-for="item in items" :key="item.id" class="list-item">
        <span>{{ item.title }}</span>
        <span>{{ item.createdAt }}</span>
      </li>
    </ul>
    <div v-else class="empty-state">
      <img src="/images/empty.svg" alt="暂无数据" />
      <p>暂无数据</p>
      <button @click="$emit('add')">添加第一条</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ListItem {
  id: number
  title: string
  createdAt: string
}

defineProps<{
  items: ListItem[]
}>()

defineEmits<{
  add: []
}>()
</script>
```

#### 场景 3：表单验证反馈

```vue
<template>
  <div class="form-field">
    <label for="email">邮箱</label>
    <input id="email" v-model="email" type="text" placeholder="请输入邮箱" />

    <!-- 三种状态：错误提示 / 成功提示 / 默认提示 -->
    <p v-if="emailError" class="error-msg">{{ emailError }}</p>
    <p v-else-if="isEmailValid" class="success-msg">邮箱格式正确</p>
    <p v-else class="hint-msg">请输入有效的邮箱地址</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const email = ref<string>('')

const emailError = computed<string>(() => {
  if (!email.value) return ''
  if (!email.value.includes('@')) return '邮箱必须包含 @ 符号'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return '邮箱格式不正确'
  return ''
})

const isEmailValid = computed<boolean>(() => {
  return email.value.length > 0 && emailError.value === ''
})
</script>
```

#### 场景 4：权限控制

```vue
<template>
  <div class="article-actions">
    <template v-if="canEdit">
      <button @click="handleEdit">编辑文章</button>
      <button @click="handleDelete" class="danger">删除文章</button>
    </template>
    <template v-else>
      <button @click="handleReport">举报</button>
      <button @click="handleShare">分享</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentUserId: number
  authorId: number
  role: 'admin' | 'editor' | 'user'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: []
  delete: []
  report: []
  share: []
}>()

const canEdit = computed<boolean>(() => {
  return props.currentUserId === props.authorId || props.role === 'admin' || props.role === 'editor'
})

function handleEdit(): void { emit('edit') }
function handleDelete(): void { emit('delete') }
function handleReport(): void { emit('report') }
function handleShare(): void { emit('share') }
</script>
```

#### 场景 5：异步请求状态管理

```vue
<template>
  <div class="async-component">
    <div v-if="loading" class="loading-wrapper">
      <Skeleton :rows="5" />
    </div>
    <div v-else-if="error" class="error-wrapper">
      <p>{{ error }}</p>
      <button @click="fetchData">重新加载</button>
    </div>
    <div v-else class="content-wrapper">
      <slot :data="data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Skeleton from './Skeleton.vue'

const props = defineProps<{
  url: string
}>()

const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const data = ref<unknown>(null)

async function fetchData(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(props.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '请求失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

#### 场景 6：深色 / 浅色主题切换

```vue
<template>
  <div class="theme-container">
    <!-- 根据当前主题显示不同的图标和文案 -->
    <button v-if="isDark" @click="toggleTheme" class="theme-btn">
      <SunIcon />
      <span>切换到浅色模式</span>
    </button>
    <button v-else @click="toggleTheme" class="theme-btn">
      <MoonIcon />
      <span>切换到深色模式</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SunIcon from './icons/SunIcon.vue'
import MoonIcon from './icons/MoonIcon.vue'

const isDark = ref<boolean>(false)

function toggleTheme(): void {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>
```

#### 场景 7：Tab 选项卡切换

```vue
<template>
  <div class="tabs">
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <!-- 使用 v-if / v-else-if / v-else 控制面板显示 -->
      <ProfilePanel v-if="activeTab === 'profile'" :user="user" />
      <SettingsPanel v-else-if="activeTab === 'settings'" :user="user" />
      <SecurityPanel v-else :user="user" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProfilePanel from './ProfilePanel.vue'
import SettingsPanel from './SettingsPanel.vue'
import SecurityPanel from './SecurityPanel.vue'

interface Tab {
  key: string
  label: string
}

interface User {
  name: string
  email: string
}

const tabs: Tab[] = [
  { key: 'profile', label: '个人资料' },
  { key: 'settings', label: '系统设置' },
  { key: 'security', label: '安全设置' }
]

const activeTab = ref<string>('profile')

defineProps<{
  user: User
}>()
</script>
```

#### 场景 8：消息通知计数

```vue
<template>
  <div class="notification-badge">
    <!-- 根据未读消息数量显示不同文案 -->
    <span v-if="unreadCount === 0" class="no-unread">没有新消息</span>
    <span v-else-if="unreadCount === 1" class="has-unread">1 条未读消息</span>
    <span v-else class="has-unread">{{ unreadCount }} 条未读消息</span>

    <button v-if="unreadCount > 0" @click="markAllRead" class="mark-btn">
      全部已读
    </button>
    <span v-else class="all-read">消息已全部查阅</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const unreadCount = ref<number>(5)

function markAllRead(): void {
  unreadCount.value = 0
}
</script>
```

#### 场景 9：购物车状态

```vue
<template>
  <div class="cart-panel">
    <template v-if="cartItems.length > 0">
      <div class="cart-list">
        <div v-for="item in cartItems" :key="item.productId" class="cart-item">
          <img :src="item.image" :alt="item.name" />
          <div class="item-info">
            <p class="name">{{ item.name }}</p>
            <p class="price">¥{{ item.price.toFixed(2) }} x {{ item.quantity }}</p>
          </div>
          <button @click="removeItem(item.productId)">移除</button>
        </div>
      </div>
      <div class="cart-footer">
        <span>合计：¥{{ totalPrice.toFixed(2) }}</span>
        <button @click="checkout">去结算</button>
      </div>
    </template>
    <div v-else class="cart-empty">
      <img src="/images/empty-cart.svg" alt="购物车为空" />
      <p>购物车还是空的</p>
      <button @click="$router.push('/')">去逛逛</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string
}

const cartItems = ref<CartItem[]>([])

const totalPrice = computed<number>(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

function removeItem(productId: number): void {
  cartItems.value = cartItems.value.filter(item => item.productId !== productId)
}

function checkout(): void {
  // 结算逻辑...
}
</script>
```

#### 场景 10：响应式布局模式切换

```vue
<template>
  <div class="layout">
    <!-- 桌面端显示侧边栏 + 内容区 -->
    <template v-if="!isMobile">
      <Sidebar class="sidebar" :menus="menus" />
      <main class="main-content">
        <slot />
      </main>
    </template>
    <!-- 移动端显示底部导航 + 内容区 -->
    <template v-else>
      <main class="main-content-mobile">
        <slot />
      </main>
      <BottomNav class="bottom-nav" :menus="menus" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import BottomNav from './BottomNav.vue'

interface MenuItem {
  key: string
  label: string
  icon: string
}

defineProps<{
  menus: MenuItem[]
}>()

const isMobile = ref<boolean>(false)

function handleResize(): void {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

---

### 六、注意事项

#### 1. 必须紧跟在 `v-if` 或 `v-else-if` 后面

`v-else` 和前面的 `v-if` / `v-else-if` 之间不能有任何其他元素（包括注释节点），否则 Vue 无法识别它们属于同一个条件链。

```vue
<template>
  <!-- ❌ 错误：v-else 和 v-if 之间有其他元素 -->
  <div v-if="show">内容 A</div>
  <p>中间有其他元素</p>
  <div v-else>内容 B</div>

  <!-- ✅ 正确：v-else 紧跟 v-if -->
  <div v-if="show">内容 A</div>
  <div v-else>内容 B</div>
</template>
```

#### 2. 不能单独使用

`v-else` 没有条件表达式，它必须作为条件链的兜底分支，前面必须有 `v-if` 或 `v-else-if`。

```vue
<template>
  <!-- ❌ 错误：v-else 不能单独出现 -->
  <div v-else>兜底内容</div>
</template>
```

#### 3. 不能与 `v-show` 配合使用

`v-show` 不是条件链的一部分，`v-else` 无法识别 `v-show` 作为前置条件。

```vue
<template>
  <!-- ❌ 错误：v-show 不支持 v-else -->
  <div v-show="visible">显示内容</div>
  <div v-else>隐藏内容</div>

  <!-- ✅ 正确方案一：改用 v-if -->
  <div v-if="visible">显示内容</div>
  <div v-else>隐藏内容</div>

  <!-- ✅ 正确方案二：使用两个独立的 v-show -->
  <div v-show="visible">显示内容</div>
  <div v-show="!visible">隐藏内容</div>
</template>
```

#### 4. 注意元素复用带来的副作用

Vue 默认会复用相同标签的元素，这可能导致输入框内容残留等不符合预期的行为。

```vue
<template>
  <!-- ⚠️ 切换时输入框的值不会被清空，因为 Vue 复用了 input 元素 -->
  <div v-if="type === 'email'">
    <input v-model="value" placeholder="请输入邮箱" />
  </div>
  <div v-else>
    <input v-model="value" placeholder="请输入手机号" />
  </div>

  <!-- ✅ 使用不同的 key 强制不复用 -->
  <div v-if="type === 'email'">
    <input key="email-input" v-model="emailValue" placeholder="请输入邮箱" />
  </div>
  <div v-else>
    <input key="phone-input" v-model="phoneValue" placeholder="请输入手机号" />
  </div>
</template>
```

#### 5. 条件分支不宜过多

当条件分支超过 4-5 个时，模板会变得难以维护。应考虑使用计算属性或策略模式来简化。

```vue
<template>
  <!-- ❌ 分支过多，模板臃肿 -->
  <span v-if="status === 'pending'">待审核</span>
  <span v-else-if="status === 'approved'">已通过</span>
  <span v-else-if="status === 'rejected'">已驳回</span>
  <span v-else-if="status === 'cancelled'">已取消</span>
  <span v-else-if="status === 'expired'">已过期</span>
  <span v-else-if="status === 'draft'">草稿</span>
  <span v-else>未知状态</span>

  <!-- ✅ 使用计算属性或映射对象简化 -->
  <span :class="statusConfig.class">{{ statusConfig.text }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Status = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'draft'

const props = defineProps<{ status: Status }>()

const statusMap: Record<Status, { text: string; class: string }> = {
  pending: { text: '待审核', class: 'status-pending' },
  approved: { text: '已通过', class: 'status-approved' },
  rejected: { text: '已驳回', class: 'status-rejected' },
  cancelled: { text: '已取消', class: 'status-cancelled' },
  expired: { text: '已过期', class: 'status-expired' },
  draft: { text: '草稿', class: 'status-draft' }
}

const statusConfig = computed(() => {
  return statusMap[props.status] ?? { text: '未知状态', class: 'status-unknown' }
})
</script>
```

#### 6. 频繁切换时优先使用 `v-show`

`v-if` / `v-else` 涉及 DOM 的销毁和重建，频繁切换会带来性能开销。如果需要频繁切换可见性，优先使用 `v-show`。

```vue
<template>
  <!-- ❌ 频繁切换（如每秒一次），v-if 性能较差 -->
  <div v-if="showTooltip" class="tooltip">{{ text }}</div>
  <div v-else class="tooltip-placeholder">&nbsp;</div>

  <!-- ✅ 频繁切换场景优先用 v-show -->
  <div v-show="showTooltip" class="tooltip">{{ text }}</div>
</template>
```

#### 7. 切换时组件生命周期会重新执行

由于 `v-if` / `v-else` 是真实的条件渲染，切换分支时组件会被销毁和重建，`onMounted`、`onUnmounted` 等生命周期钩子会重新执行。

```vue
<template>
  <ChartA v-if="type === 'a'" :data="chartData" />
  <ChartB v-else :data="chartData" />
</template>

<script setup lang="ts">
// 当 type 从 'a' 变为其他值时：
// ChartA 会触发 onUnmounted → 被销毁
// ChartB 会触发 onMounted → 被创建
// 如果 ChartA 内部有定时器或事件监听，需要在 onUnmounted 中清理
</script>
```

#### 8. `v-else` 不能与 `v-for` 在同一元素上使用

`v-if` 的优先级高于 `v-for`，但不建议在同一元素上混用。同理，`v-else` 也不应与 `v-for` 同时出现在一个元素上。

```vue
<template>
  <!-- ❌ 避免在同一元素上使用 v-else 和 v-for -->
  <div v-for="item in list" :key="item.id">
    <span v-if="item.active">{{ item.name }}</span>
    <span v-else class="disabled">{{ item.name }}</span>
  </div>
</template>
```

#### 9. 使用 `<template>` 包裹多元素时不会产生额外 DOM 节点

这是一个优势而非陷阱，但需要注意 `<template>` 上不能添加 `class`、`style` 等属性（除了指令），因为它不会渲染为真实的 DOM 元素。

```vue
<template>
  <!-- ✅ template 上的指令会正确工作 -->
  <template v-if="showAll">
    <Header />
    <MainContent />
    <Footer />
  </template>
  <template v-else>
    <SimpleView />
  </template>

  <!-- ❌ template 上不能添加 class，不会被渲染 -->
  <template v-if="show" class="wrapper">
    <p>内容</p>
  </template>
</template>
```

#### 10. 条件表达式应保持简单明了

条件表达式应该简洁、语义清晰。如果条件逻辑复杂，应抽离到计算属性中。

```vue
<template>
  <!-- ❌ 条件表达式过于复杂 -->
  <div v-if="user && user.role === 'admin' && user.permissions.includes('edit') && !isLocked">
    编辑按钮
  </div>
  <div v-else>无权编辑</div>

  <!-- ✅ 将复杂逻辑抽离为计算属性 -->
  <div v-if="canEdit">编辑按钮</div>
  <div v-else>无权编辑</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const canEdit = computed(() => {
  return (
    user.value?.role === 'admin' &&
    user.value?.permissions.includes('edit') &&
    !isLocked.value
  )
})
</script>
```

---

### 七、相关 API 对比

| 特性 | `v-if` / `v-else` | `v-show` |
| --- | --- | --- |
| **渲染方式** | 条件为 `false` 时元素不存在于 DOM 中 | 元素始终存在于 DOM 中，通过 `display: none` 隐藏 |
| **切换开销** | 高（销毁和重建 DOM） | 低（仅切换 CSS） |
| **初始渲染开销** | 低（条件为 `false` 时不渲染） | 高（始终渲染） |
| **生命周期** | 切换时会触发 `mounted` / `unmounted` | 不会触发 |
| **适用场景** | 条件很少改变时 | 需要频繁切换时 |
| **配合 `v-else`** | 支持 | 不支持 |
| **配合 `<template>`** | 支持 | 不支持 |

> ⚠️ **注意：** 一般来说，`v-if` / `v-else` 具有更高的切换开销，而 `v-show` 具有更高的初始渲染开销。因此，如果需要频繁切换，用 `v-show` 较好；如果在运行时条件很少改变，用 `v-if` / `v-else` 较好。

---

### 八、总结

`v-else` 是 Vue 条件渲染体系中不可或缺的一环，它与 `v-if`、`v-else-if` 共同组成了完整的条件渲染链。通过 `v-else`，我们可以用声明式的方式优雅地处理"非此即彼"的 UI 逻辑。

**核心要点回顾：**

- `v-else` 必须紧跟在 `v-if` 或 `v-else-if` 后面使用，不能单独出现
- 它是真正的条件渲染，条件不满足时元素不会出现在 DOM 中
- 可以配合 `<template>` 包裹多个元素，不会产生额外的 DOM 节点
- 注意元素复用机制，必要时使用 `key` 强制不复用
- 频繁切换场景优先使用 `v-show`，条件稳定的场景优先使用 `v-if` / `v-else`
- 复杂条件逻辑应抽离为计算属性，保持模板简洁
