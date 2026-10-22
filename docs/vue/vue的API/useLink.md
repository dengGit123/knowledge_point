# useLink

> 📖 [Vue Router 官方文档 - useLink](https://router.vuejs.org/zh/api/#Functions-useLink)

---

### 一、概述

`useLink` 是 Vue Router 4.x 提供的一个**组合式函数（Composable）**，它是 `<RouterLink>` 组件底层逻辑的函数式封装。简单来说，`<RouterLink>` 组件内部就是通过调用 `useLink` 来实现所有导航能力的。

**为什么需要 `useLink`？**

- 当 `<RouterLink>` 的默认渲染行为（渲染为 `<a>` 标签）无法满足需求时，你可以用 `useLink` 来构建**完全自定义的导航组件**
- 它将链接解析、路由匹配、导航执行等核心逻辑从组件模板中解耦出来，让你可以自由控制渲染结构
- 适用于需要自定义标签、添加权限控制、嵌入动画、组合其他逻辑等高级场景

**一句话总结**：`useLink` 让你拥有 `RouterLink` 的全部能力，同时获得 100% 的渲染自由度。

---

### 二、核心原理

`useLink` 的核心工作流程如下：

```text
props（传入 to、replace 等）
        │
        ▼
  ┌─────────────────────────────────┐
  │          useLink(props)          │
  │                                  │
  │  1. 解析 to → 生成 href          │
  │  2. 监听路由变化 → 计算 isActive  │
  │  3. 监听路由变化 → 计算 isExactActive │
  │  4. 封装 navigate 导航函数       │
  │  5. 维护 link 路由对象引用       │
  └─────────────────────────────────┘
        │
        ▼
  返回 { route, href, isActive, isExactActive, navigate }
```

`<RouterLink>` 组件本质上做的事情：

```ts
// RouterLink 的简化内部实现
import { useLink } from 'vue-router'

// RouterLink 内部调用 useLink 获取所有导航能力
const { route, href, isActive, isExactActive, navigate } = useLink(props)

// 然后根据这些返回值渲染 <a> 标签
```

因此，当你使用 `useLink` 时，你就是在**手动接管** `<RouterLink>` 的内部逻辑，然后自己决定怎么渲染。

---

### 三、详细用法

#### 1. 基本用法

最简单的自定义导航组件，用 `useLink` 替代 `<RouterLink>` 的默认行为。

```vue
<!-- AppLink.vue -->
<template>
  <a :href="href" @click="navigate">
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
}

const props = defineProps<Props>()

// ✅ 传入 props，获取完整的导航能力
const { href, navigate } = useLink(props)
</script>
```

使用该组件：

```vue
<template>
  <AppLink to="/home">首页</AppLink>
  <AppLink :to="{ name: 'about' }">关于我们</AppLink>
</template>
```

#### 2. 进阶用法

##### 2.1 带激活状态样式的自定义链接

```vue
<!-- NavLink.vue -->
<template>
  <a
    :href="href"
    :class="[
      'nav-link',
      isActive ? activeClass : '',
      isExactActive ? exactActiveClass : '',
    ]"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  activeClass?: string
  exactActiveClass?: string
}

// useLink 不消费 activeClass/exactActiveClass，激活类名由我们自己绑定
const props = withDefaults(defineProps<Props>(), {
  activeClass: 'router-link-active',
  exactActiveClass: 'router-link-exact-active',
})

const { href, navigate, isActive, isExactActive } = useLink(props)
</script>
```

##### 2.2 支持外部链接的自定义链接

```vue
<!-- SmartLink.vue -->
<template>
  <!-- 外部链接直接用原生 <a> -->
  <a
    v-if="isExternal"
    :href="String(to)"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
    <span class="external-icon">↗</span>
  </a>
  <!-- 内部路由使用 useLink -->
  <a
    v-else
    :href="href"
    :class="{ active: isActive }"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
}

const props = defineProps<Props>()

// ✅ 判断是否为外部链接
const isExternal = computed(() => {
  if (typeof props.to !== 'string') return false
  return props.to.startsWith('http://') || props.to.startsWith('https://')
})

// 只有内部链接才需要 useLink
const { href, navigate, isActive } = useLink(props)
</script>
```

##### 2.3 结合 Transition 实现导航动画

```vue
<!-- AnimatedLink.vue -->
<template>
  <a
    :href="href"
    :class="{ 'is-active': isActive }"
    @click="handleNavigate"
  >
    <slot />
    <span v-if="isNavigating" class="loading-indicator">加载中...</span>
  </a>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
}

const props = defineProps<Props>()
const { href, navigate, isActive } = useLink(props)

const isNavigating = ref(false)

async function handleNavigate(e: MouseEvent) {
  e.preventDefault()

  if (isNavigating.value) return

  isNavigating.value = true

  try {
    // ✅ navigate 是异步函数，等待导航完成
    await navigate()
  } finally {
    // 导航完成后重置状态（通常在 nextTick 或短暂延迟后）
    setTimeout(() => {
      isNavigating.value = false
    }, 300)
  }
}
</script>

<style scoped>
.loading-indicator {
  margin-left: 4px;
  color: #999;
  font-size: 12px;
}

.is-active {
  color: #1677ff;
  font-weight: bold;
}
</style>
```

##### 2.4 带权限控制的导航组件

```vue
<!-- AuthLink.vue -->
<template>
  <!-- ✅ 有权限时显示为可点击链接 -->
  <a
    v-if="isAuthorized"
    :href="href"
    :class="{ active: isActive }"
    @click="navigate"
  >
    <slot />
  </a>
  <!-- ❌ 无权限时显示为禁用状态 -->
  <span v-else class="link-disabled" :title="`需要 ${permission} 权限`">
    <slot />
    <span class="lock-icon">🔒</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  permission?: string
}

const props = defineProps<Props>()
const { href, navigate, isActive } = useLink(props)

// 模拟权限判断（实际项目中对接权限 store）
const userPermissions = ['dashboard', 'profile', 'settings']

const isAuthorized = computed(() => {
  if (!props.permission) return true
  return userPermissions.includes(props.permission)
})
</script>

<style scoped>
.link-disabled {
  color: #ccc;
  cursor: not-allowed;
  pointer-events: none;
}

.lock-icon {
  margin-left: 4px;
  font-size: 12px;
}
</style>
```

#### 3. API 参数说明

**参数（类型为 `UseLinkOptions`，官方文档中写作 `VueUseOptions<RouterLinkOptions>`）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `to` | `MaybeRef<RouteLocationRaw>` | 是 | 目标路由，可以是路径字符串或路由对象。接受 ref/响应式对象，目标变化时 `href` 等返回值会自动重新解析 |
| `replace` | `MaybeRef<boolean>` | 否 | 为 `true` 时调用 `router.replace` 替换当前历史记录，而不是 `push`（默认 `false`） |
| `viewTransition` | `boolean` | 否 | 将导航交给 `document.startViewTransition()` 处理（较新版本的 Vue Router 4 才支持） |

> ⚠️ **注意：** `useLink` 只接受上表三个选项。`activeClass`、`exactActiveClass`、`custom`、`ariaCurrentValue` 是 `<RouterLink>` 组件的 props，不属于 `useLink` 的参数。`force`、`state` 则是 `router.push()` 的导航选项，同样不能传给 `useLink`——激活类名需要你在自己的模板中根据 `isActive` / `isExactActive` 手动绑定。

**返回值（类型为 `UseLinkReturn`）：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `route` | `ComputedRef<RouteLocationResolved>` | 解析后的目标路由位置对象（官方文档类型写作 `ComputedRef<RouteLocation & { href: string }>`） |
| `href` | `ComputedRef<string>` | 解析后的完整 URL 路径 |
| `isActive` | `ComputedRef<boolean>` | 当前路由是否匹配此链接（包含匹配，即父路由也算激活） |
| `isExactActive` | `ComputedRef<boolean>` | 当前路由是否**精确**匹配此链接 |
| `navigate` | `(e?: MouseEvent) => Promise<void \| NavigationFailure>` | 执行导航的异步函数，可传入原生事件对象，返回导航结果或导航失败信息 |

> 💡 **提示：** `route`、`href`、`isActive`、`isExactActive` 都是 `ComputedRef`。在模板中会自动解包（直接写 `href`、`isActive`），在 `<script>` 中需要通过 `.value` 获取值。

---

### 四、实现效果

使用 `useLink` 后，自定义导航组件可以获得与 `<RouterLink>` 完全一致的以下能力：

```vue
<template>
  <a
    :href="href"
    :class="{
      'link-active': isActive,         // ✅ 父路由匹配时也会激活
      'link-exact-active': isExactActive, // ✅ 只有精确匹配才激活
    }"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
}>()

const { href, navigate, isActive, isExactActive, route } = useLink(props)

// ✅ 监听 href 变化 —— 当 to 属性动态变化时，href 会自动更新
watch(href, (newHref) => {
  console.log('链接路径更新为：', newHref)
})

// ✅ 监听激活状态变化
watch(isActive, (active) => {
  console.log('激活状态变化：', active)
})

// ✅ route 包含完整的路由信息
console.log('目标路由名称：', route.value.name)
console.log('目标路由参数：', route.value.params)
console.log('目标路由查询参数：', route.value.query)
</script>
```

**行为说明：**

| 行为 | 效果 |
|------|------|
| 点击链接 | 触发 `navigate()`，执行路由跳转 |
| 路由匹配 | `isActive` 为 `true`，可据此添加高亮样式 |
| 精确路由匹配 | `isExactActive` 为 `true`，仅当前路由完全匹配时 |
| `to` 动态变化 | `href` 自动重新解析，无需手动更新 |
| 调用 `navigate()` | 返回 Promise，可 `await` 等待导航完成 |

---

### 五、使用场景

#### 场景 1：自定义导航标签（非 `<a>` 标签）

当需要将导航链接渲染为 `<button>`、`<li>` 等非 `<a>` 标签时。

```vue
<!-- ButtonLink.vue -->
<template>
  <button
    :class="{ 'btn-active': isActive }"
    @click="navigate"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
}>()

const { navigate, isActive } = useLink(props)
</script>

<style scoped>
button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.btn-active {
  border-color: #1677ff;
  color: #1677ff;
  background: #e6f4ff;
}
</style>
```

#### 场景 2：导航栏组件（NavMenu）

在导航菜单中统一管理链接的激活状态样式。推荐做法是把 `useLink` 封装进子组件，每个列表项内部各自调用一次。

```vue
<!-- NavMenu.vue -->
<template>
  <nav class="nav-menu">
    <NavItem
      v-for="item in menuItems"
      :key="String(item.path)"
      :to="item.path"
    >
      <span :class="item.icon" />
      {{ item.label }}
    </NavItem>
  </nav>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import NavItem from './NavItem.vue'

interface MenuItem {
  path: RouteLocationRaw
  label: string
  icon: string
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: '仪表盘', icon: 'icon-dashboard' },
  { path: '/profile', label: '个人中心', icon: 'icon-user' },
  { path: '/settings', label: '设置', icon: 'icon-setting' },
]
</script>
```

```vue
<!-- NavItem.vue -->
<template>
  <a
    :href="href"
    :class="{ 'nav-active': isActive }"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
}>()

// ✅ 每个子组件实例内部各自调用一次 useLink
const { href, navigate, isActive } = useLink(props)
</script>
```

> 💡 **提示：** 在 `v-for` 场景中不要在父组件里缓存 `useLink` 的返回值再于渲染中调用——抽离子组件让每个列表项自己调用，既天然隔离激活状态，也符合「在 setup 中同步调用」的约束。

#### 场景 3：面包屑导航

同样用「父组件渲染结构 + 子组件内部调用 `useLink`」的方式来组织面包屑。

```vue
<!-- Breadcrumb.vue -->
<template>
  <div class="breadcrumb">
    <template v-for="(crumb, index) in crumbs" :key="index">
      <!-- ✅ 最后一项不可点击 -->
      <span v-if="index === crumbs.length - 1" class="crumb-current">
        {{ crumb.label }}
      </span>
      <!-- ✅ 其他项可点击导航 -->
      <BreadcrumbLink v-else :to="crumb.path">
        {{ crumb.label }}
      </BreadcrumbLink>
      <span v-if="index < crumbs.length - 1" class="separator">/</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import BreadcrumbLink from './BreadcrumbLink.vue'

interface Crumb {
  path: RouteLocationRaw
  label: string
}

defineProps<{
  crumbs: Crumb[]
}>()
</script>
```

```vue
<!-- BreadcrumbLink.vue -->
<template>
  <a :href="href" @click="navigate">
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
}>()

const { href, navigate } = useLink(props)
</script>
```

#### 场景 4：带确认弹窗的离开导航

在用户离开当前页面前弹出确认提示，防止未保存的数据丢失。

```vue
<!-- ConfirmLink.vue -->
<template>
  <a :href="href" @click="handleClick">
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  confirmMessage?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmMessage: '你有未保存的更改，确定要离开吗？',
  disabled: false,
})

const { href, navigate } = useLink(props)

async function handleClick(e: MouseEvent) {
  e.preventDefault()

  // ✅ 禁用状态不导航
  if (props.disabled) return

  // ✅ 弹出确认框
  const confirmed = window.confirm(props.confirmMessage)
  if (!confirmed) return

  await navigate()
}
</script>
```

#### 场景 5：带分析追踪的导航链接

在导航时自动上报埋点数据。

```vue
<!-- TrackLink.vue -->
<template>
  <a :href="href" @click="handleClick">
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  trackEvent?: string
  trackData?: Record<string, any>
}

const props = defineProps<Props>()
const { href, navigate, route } = useLink(props)

async function handleClick(e: MouseEvent) {
  e.preventDefault()

  // ✅ 导航前上报埋点
  if (props.trackEvent) {
    console.log('埋点上报：', {
      event: props.trackEvent,
      targetRoute: route.value.path,
      timestamp: Date.now(),
      ...props.trackData,
    })
    // 实际项目中调用埋点 SDK
    // await analytics.track(props.trackEvent, { ... })
  }

  await navigate()
}
</script>
```

#### 场景 6：带图标的导航项

为导航项添加图标和徽标。

```vue
<!-- IconNavLink.vue -->
<template>
  <a
    :href="href"
    :class="['icon-nav-link', { active: isActive }]"
    @click="navigate"
  >
    <span :class="icon" class="nav-icon" />
    <span class="nav-label"><slot /></span>
    <span v-if="badge" class="nav-badge">{{ badge }}</span>
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  icon: string
  badge?: number | string
}

const props = defineProps<Props>()
const { href, navigate, isActive } = useLink(props)
</script>

<style scoped>
.icon-nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.icon-nav-link:hover {
  background-color: #f5f5f5;
}

.icon-nav-link.active {
  color: #1677ff;
  background-color: #e6f4ff;
}

.nav-badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
</style>
```

#### 场景 7：Tab 切换组件

用路由驱动的 Tab 切换，每个 Tab 对应一个路由。Tab 项封装为子组件，内部各自调用 `useLink`。

```vue
<!-- RouteTab.vue -->
<template>
  <div class="route-tabs">
    <RouteTabItem
      v-for="tab in tabs"
      :key="String(tab.to)"
      :to="tab.to"
    >
      {{ tab.label }}
    </RouteTabItem>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import RouteTabItem from './RouteTabItem.vue'

interface Tab {
  to: RouteLocationRaw
  label: string
}

defineProps<{
  tabs: Tab[]
}>()
</script>

<style scoped>
.route-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
}

/* 子组件的根元素是 <a class="tab-item">，父组件的 scoped 样式同样作用于它 */
.tab-item {
  padding: 10px 20px;
  text-decoration: none;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
}

.tab-item:hover {
  color: #333;
}
</style>
```

```vue
<!-- RouteTabItem.vue -->
<template>
  <a
    :href="href"
    :class="['tab-item', { active: isActive }]"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
}>()

const { href, navigate, isActive } = useLink(props)
</script>
```

#### 场景 8：带键盘快捷键的导航

```vue
<!-- ShortcutLink.vue -->
<template>
  <a
    :href="href"
    :class="{ active: isActive }"
    @click="navigate"
  >
    <slot />
    <kbd v-if="shortcut" class="shortcut-key">{{ shortcut }}</kbd>
  </a>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useLink, type RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  shortcut?: string // 例如 'ctrl+k'
}

const props = defineProps<Props>()
const { href, navigate, isActive } = useLink(props)

function handleKeydown(e: KeyboardEvent) {
  if (!props.shortcut) return

  const parts = props.shortcut.toLowerCase().split('+')
  const ctrlRequired = parts.includes('ctrl')
  const altRequired = parts.includes('alt')
  const shiftRequired = parts.includes('shift')
  const key = parts.find((p) => !['ctrl', 'alt', 'shift'].includes(p))

  if (
    ctrlRequired === (e.ctrlKey || e.metaKey) &&
    altRequired === e.altKey &&
    shiftRequired === e.shiftKey &&
    key &&
    e.key.toLowerCase() === key
  ) {
    e.preventDefault()
    // ✅ 通过快捷键触发导航
    navigate()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.shortcut-key {
  margin-left: 8px;
  padding: 2px 6px;
  font-size: 11px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  color: #999;
}
</style>
```

#### 场景 9：带条件渲染的侧边栏链接

根据用户角色和路由配置动态显示侧边栏菜单项。

```vue
<!-- Sidebar.vue -->
<template>
  <aside class="sidebar">
    <SidebarItem
      v-for="item in visibleItems"
      :key="item.path"
      :to="item.path"
      :icon="item.icon"
    >
      {{ item.label }}
    </SidebarItem>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

interface SidebarMenuItem {
  path: RouteLocationRaw
  label: string
  icon: string
  roles?: string[] // 允许访问的角色
}

const props = defineProps<{
  userRole: string
}>()

const allItems: SidebarMenuItem[] = [
  { path: '/dashboard', label: '仪表盘', icon: 'icon-home' },
  { path: '/users', label: '用户管理', icon: 'icon-team', roles: ['admin'] },
  { path: '/settings', label: '系统设置', icon: 'icon-setting', roles: ['admin'] },
  { path: '/profile', label: '个人中心', icon: 'icon-user' },
]

// ✅ 根据角色过滤可见菜单
const visibleItems = computed(() =>
  allItems.filter(
    (item) => !item.roles || item.roles.includes(props.userRole)
  )
)
</script>
```

```vue
<!-- SidebarItem.vue -->
<template>
  <a
    :href="href"
    :class="['sidebar-item', { active: isActive }]"
    @click="navigate"
  >
    <span :class="icon" />
    <span><slot /></span>
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
  icon: string
}>()

const { href, navigate, isActive } = useLink(props)
</script>
```

#### 场景 10：带预加载（Prefetch）的链接

在用户鼠标悬停时预加载目标路由的组件，提升用户体验。

```vue
<!-- PrefetchLink.vue -->
<template>
  <a
    :href="href"
    :class="{ active: isActive }"
    @mouseenter="prefetch"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useLink, type RouteLocationRaw, useRouter } from 'vue-router'

interface Props {
  to: RouteLocationRaw
}

const props = defineProps<Props>()
const { href, navigate, isActive, route } = useLink(props)
const router = useRouter()

let prefetched = false

// ✅ 鼠标悬停时预加载目标路由组件
function prefetch() {
  if (prefetched) return

  const resolved = router.resolve(props.to)

  // 利用路由的 lazy loading 机制触发预加载
  const matchedRoute = resolved.matched[resolved.matched.length - 1]
  if (matchedRoute?.components?.default instanceof Function) {
    matchedRoute.components.default()
    prefetched = true
  }
}
</script>
```

---

### 六、注意事项

#### 1. 必须在 Vue Router 环境中使用

`useLink` 依赖 Vue Router 的上下文，必须在 `setup` 函数或 `<script setup>` 中调用，且应用必须安装了 Vue Router。

```ts
// ❌ 在 setup 外部调用
const { href } = useLink({ to: '/home' })
// 开发环境会收到 inject 警告，拿不到 router 上下文，
// href 等计算属性在求值时会抛出 TypeError

// ✅ 在 setup 中调用
import { useLink } from 'vue-router'

// 在 <script setup> 中使用
const { href, navigate } = useLink({ to: '/home' })
```

#### 2. `navigate` 是异步函数

`navigate()` 返回一个 `Promise`，在需要等待导航完成后执行后续操作时，务必使用 `await`。

```ts
// ❌ 导航可能还未完成就执行了后续代码
navigate()
console.log('已导航') // 导航可能尚未完成

// ✅ 正确等待导航完成
async function handleNav() {
  await navigate()
  console.log('导航已完成')
}
```

#### 3. 避免在 `v-for` 循环中直接重复调用

在 `v-for` 中直接使用 `useLink` 会导致每次渲染都重新创建，应封装为子组件。

```vue
<!-- ❌ 不推荐：在父组件 v-for 中缓存 useLink -->
<template>
  <div v-for="item in items" :key="item.path">
    <a :href="getLink(item.path).href.value" @click="getLink(item.path).navigate">
      {{ item.label }}
    </a>
  </div>
</template>

<!-- ✅ 推荐：封装为子组件 -->
<template>
  <div v-for="item in items" :key="item.path">
    <NavItem :to="item.path">{{ item.label }}</NavItem>
  </div>
</template>
```

#### 4. `isActive` 和 `isExactActive` 的区别

`isActive` 使用包含匹配，父路由激活时子路由链接也会处于激活状态；`isExactActive` 只在精确匹配时为 `true`。

```ts
// 假设当前路由为 /users/profile
const { isActive, isExactActive } = useLink({ to: '/users' })

console.log(isActive.value)       // ✅ true，因为 /users 是 /users/profile 的父路由
console.log(isExactActive.value)  // ❌ false，因为不是精确匹配
```

#### 5. 外部链接需要额外处理

`useLink` 只处理 Vue Router 的内部路由，外部链接（`http://`、`https://`）不会被正确解析，需要额外判断。

```vue
<!-- ❌ 外部链接直接传给 useLink 会解析为路由路径 -->
<a :href="href" @click="navigate">Vue 官网</a>

<!-- ✅ 先判断是否外部链接，分情况处理 -->
<a
  v-if="isExternal"
  :href="String(to)"
  target="_blank"
  rel="noopener noreferrer"
>
  Vue 官网
</a>
<a v-else :href="href" @click="navigate">Vue 官网</a>
```

#### 6. `navigate` 需要阻止默认行为

在 `<a>` 标签上使用时，如果不阻止默认行为，浏览器会先执行原生跳转再执行路由导航。

```ts
// ❌ 不阻止默认行为，可能导致双重导航
function handleClick() {
  navigate() // 浏览器已经因 <a href> 发起了跳转
}

// ✅ 先阻止默认行为，再调用 navigate
async function handleClick(e: MouseEvent) {
  e.preventDefault()
  await navigate()
}
```

#### 7. `to` 属性支持多种格式

`to` 属性可以接收字符串路径、命名路由对象、带参数和查询的对象，格式非常灵活。

```ts
// ✅ 以下格式都支持
useLink({ to: '/home' })
useLink({ to: { name: 'home' } })
useLink({ to: { path: '/home' } })
useLink({ to: { name: 'user', params: { id: '123' } } })
useLink({ to: { path: '/search', query: { q: 'vue' } } })
useLink({ to: { path: '/login', hash: '#section' } })
```

#### 8. `replace` 模式不会留下历史记录

传入 `replace: true` 时，导航会替换当前历史记录而不是新增一条，用户点击浏览器后退按钮时不会回到前一个页面。

```ts
// ✅ 登录成功后替换历史记录，防止用户后退回到登录页
const { navigate } = useLink({ to: '/dashboard', replace: true })
```

#### 9. 响应式特性

`useLink` 的参数 `to`、`replace` 均接受 `MaybeRef`，返回值（`route`、`href`、`isActive`、`isExactActive`）都是 `ComputedRef`：当 `to` 属性或当前路由发生变化时会自动更新，无需手动监听。

```ts
const toPath = ref('/home')

// ✅ to 变化时，href 和 isActive 会自动更新
const { href, isActive } = useLink({ to: toPath })

// 当 toPath 变为 '/about' 时，href 自动更新为 '/about'
toPath.value = '/about'
```

#### 10. 与 `<RouterLink>` 的 `custom` 插槽对比

`<RouterLink>` 也提供了 `custom` 属性配合作用域插槽来实现自定义渲染。如果只是简单的自定义，优先考虑这种方式；如果需要更复杂的逻辑组合，则使用 `useLink`。

```vue
<!-- ✅ 简单自定义：用 RouterLink 的 custom + 作用域插槽 -->
<RouterLink to="/home" custom v-slot="{ href, navigate, isActive }">
  <a :href="href" :class="{ active: isActive }" @click="navigate">
    首页
  </a>
</RouterLink>

<!-- ✅ 复杂自定义：用 useLink（需要组合多个逻辑时更灵活） -->
<!-- 见前文示例 -->
```

---

### 七、相关 API 对比

| 特性 | `useLink` | `<RouterLink>` | `<RouterLink custom>` |
|------|-----------|----------------|----------------------|
| 使用方式 | 组合式函数（`setup` 中） | 组件（模板中） | 组件 + 作用域插槽 |
| 渲染自由度 | 完全自由 | 固定渲染为 `<a>` | 自由 |
| 逻辑复用 | 可在多个组件中复用 | 仅模板内 | 仅模板内 |
| 类型安全 | TypeScript 完整支持 | 模板中有限 | 模板中有限 |
| 适用场景 | 复杂自定义导航 | 标准导航链接 | 简单自定义渲染 |
| 学习成本 | 中等 | 低 | 低 |

**选择建议：**

- **简单导航**：直接使用 `<RouterLink>`
- **简单自定义渲染**：使用 `<RouterLink custom>` + 作用域插槽
- **复杂自定义逻辑**（权限、动画、埋点、预加载等）：使用 `useLink` 封装独立组件

---

### 八、总结

`useLink` 是 Vue Router 4.x 中面向高级场景的导航利器，它的核心价值在于：

1. **解耦渲染与逻辑**：将 `<RouterLink>` 的导航能力抽离为函数，让你可以完全控制渲染结构
2. **响应式导航状态**：`href`、`isActive`、`isExactActive` 都是响应式的，自动跟随路由变化
3. **灵活组合**：可以与权限控制、埋点追踪、加载动画、快捷键等任意逻辑自由组合
4. **类型安全**：完整的 TypeScript 支持，开发体验优秀

**核心原则**：能用 `<RouterLink>` 解决的问题就用 `<RouterLink>`，当它不够用时，`useLink` 是你的终极武器。
