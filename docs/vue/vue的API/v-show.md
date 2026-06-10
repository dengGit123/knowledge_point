### v-show

> 📖 [Vue 官方文档 - v-show](https://cn.vuejs.org/api/built-in-directives#v-show)

---

### 一、概述

`v-show` 是 Vue 3 内置的一个指令，用于**根据条件控制元素的显示与隐藏**。它的核心机制非常简单——通过切换元素 CSS 的 `display` 属性来实现可见性的切换。

你可以把它想象成一扇"推拉门"：门始终在那里，只是有时候被推到墙里看不见了。而 `v-if` 则像是一扇"拆卸门"——不需要的时候直接把门拆掉，需要的时候再重新装上去。

**为什么需要 `v-show`？**

- 有些元素需要**频繁切换**显示状态（如 Tab 标签页、加载动画、下拉菜单），如果每次都用 `v-if` 销毁再重建 DOM，性能开销会很大
- `v-show` 只操作 CSS 属性，**切换开销极低**，非常适合这类高频切换场景
- 被隐藏的元素仍然保留在 DOM 中，内部状态不会丢失

---

### 二、核心原理

`v-show` 的底层工作方式：

1. **编译阶段**：Vue 编译器检测到 `v-show` 指令后，会生成对应的指令处理代码
2. **渲染阶段**：元素**始终会被渲染到 DOM 中**，无论条件是否为真
3. **切换机制**：
   - 当表达值为 `false` 时，设置 `element.style.display = 'none'`
   - 当表达值为 `true` 时，移除 `display: none`，恢复元素原有的显示状态

```
v-show 的渲染流程：

┌──────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│ 表达式为 true │ ──→ │ 移除 display: none   │ ──→ │ 元素正常显示       │
└──────────────┘     └──────────────────────┘     └───────────────────┘

┌──────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│ 表达式为 false│ ──→ │ 设置 display: none   │ ──→ │ 元素隐藏但仍存在DOM│
└──────────────┘     └──────────────────────┘     └───────────────────┘
```

> 💡 **提示：** `v-show` 与 `v-if` 最大的区别在于——`v-show` 的元素**始终存在于 DOM 中**，`v-if` 的元素在条件为 `false` 时会被完全移除。

---

### 三、详细用法

#### 1. 基本用法

`v-show` 接受一个可以转换为布尔值的表达式，当值为 truthy 时显示元素，为 falsy 时隐藏元素。

```vue
<template>
  <!-- 最简单的用法：绑定一个 ref 响应式变量 -->
  <div v-show="isVisible">我是可见的内容</div>

  <!-- 绑定计算属性 -->
  <div v-show="hasPermission">需要权限才能看到的内容</div>

  <!-- 绑定表达式 -->
  <div v-show="count > 0">计数大于 0 时显示</div>

  <!-- 控制按钮 -->
  <button @click="toggle">切换显示</button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isVisible = ref(true)
const count = ref(5)

// 计算属性也可以作为 v-show 的表达式
const hasPermission = computed(() => {
  return true
})

function toggle() {
  isVisible.value = !isVisible.value
}
</script>
```

#### 2. 进阶用法

##### 2.1 配合 Transition 实现动画

`v-show` 可以与 Vue 的 `<Transition>` 组件配合使用，实现进入和离开的过渡动画。`<Transition>` 组件能检测到 `display` 属性的变化，从而触发 CSS 过渡效果。

```vue
<template>
  <button @click="show = !show">切换动画</button>

  <!-- ✅ v-show 配合 Transition，进入和离开动画都会触发 -->
  <Transition name="fade">
    <div v-show="show" class="box">带动画的内容</div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<style scoped>
.box {
  width: 200px;
  height: 100px;
  background-color: #42b883;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 进入和离开的过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

##### 2.2 与 v-for 结合使用

`v-show` 可以与 `v-for` 一起使用，实现列表的条件显示（如搜索过滤），且不会重新创建 DOM。

```vue
<template>
  <input v-model="keyword" placeholder="搜索水果..." />

  <ul>
    <!-- v-show 控制每一项的可见性，DOM 节点始终存在 -->
    <li
      v-for="item in fruitList"
      :key="item.id"
      v-show="matchKeyword(item.name)"
    >
      {{ item.name }} - ¥{{ item.price }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Fruit {
  id: number
  name: string
  price: number
}

const keyword = ref('')

const fruitList = ref<Fruit[]>([
  { id: 1, name: '苹果', price: 5 },
  { id: 2, name: '香蕉', price: 3 },
  { id: 3, name: '橙子', price: 4 },
  { id: 4, name: '草莓', price: 15 },
  { id: 5, name: '芒果', price: 8 }
])

function matchKeyword(name: string): boolean {
  if (!keyword.value) return true
  return name.includes(keyword.value)
}
</script>
```

##### 2.3 在组件上使用 v-show

`v-show` 也可以直接用在子组件的根元素上，控制整个组件的显示与隐藏。被隐藏的组件**不会被卸载**，内部状态完整保留。

```vue
<template>
  <button @click="showChart = !showChart">切换图表</button>

  <!-- 组件不会被销毁，图表的数据和状态都会保留 -->
  <ChartPanel v-show="showChart" />

  <!-- 对比：v-if 会销毁并重建组件，状态会丢失 -->
  <!-- <ChartPanel v-if="showChart" /> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChartPanel from './ChartPanel.vue'

const showChart = ref(true)
</script>
```

##### 2.4 多条件互斥显示

由于 `v-show` 不支持 `v-else`，需要通过独立的表达式来实现多条件互斥显示。

```vue
<template>
  <!-- ✅ 正确：用独立的 v-show 表达式实现互斥 -->
  <div v-show="status === 'loading'">加载中...</div>
  <div v-show="status === 'success'">加载成功！</div>
  <div v-show="status === 'error'">加载失败，请重试</div>

  <!-- ❌ 错误：v-show 不支持 v-else / v-else-if -->
  <!-- <div v-show="status === 'loading'">加载中</div>
  <div v-else>其他状态</div> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Status = 'loading' | 'success' | 'error'
const status = ref<Status>('loading')
</script>
```

##### 2.5 结合响应式窗口尺寸控制布局

```vue
<template>
  <div class="app-layout">
    <!-- 桌面端侧边栏 -->
    <aside v-show="isDesktop" class="sidebar">
      <nav>
        <a v-for="item in navItems" :key="item.path" :href="item.path">
          {{ item.label }}
        </a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="content">
      <slot />
    </main>

    <!-- 移动端底部导航 -->
    <nav v-show="!isDesktop" class="bottom-nav">
      <a v-for="item in navItems" :key="item.path" :href="item.path">
        {{ item.label }}
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface NavItem {
  path: string
  label: string
}

const isDesktop = ref(true)

const navItems = ref<NavItem[]>([
  { path: '/home', label: '首页' },
  { path: '/search', label: '搜索' },
  { path: '/profile', label: '我的' }
])

function handleResize(): void {
  isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #f5f5f5;
  padding: 16px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f5f5f5;
  padding: 8px 0;
}
</style>
```

#### 3. API 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `expression` | `boolean \| any` | 是 | 任意可以转换为布尔值的表达式。truthy 显示元素，falsy 隐藏元素 |
| **支持的元素** | - | - | 所有 HTML 元素和 Vue 组件 |
| **不支持的元素** | - | - | `<template>`（因为 `<template>` 不是真实 DOM 元素，无法设置 `display`） |
| **与 v-else 兼容** | - | - | 不支持，不能配合 `v-else` 或 `v-else-if` 使用 |
| **与 Transition 兼容** | - | - | 完全支持，可以触发进入和离开过渡动画 |

> 💡 **提示：** `v-show` 的表达式会被 JavaScript 自动做布尔转换。`0`、`""`、`null`、`undefined`、`NaN`、`false` 这些 falsy 值都会使元素隐藏，其他值（包括空对象 `{}` 和空数组 `[]`）都会使元素显示。

---

### 四、实现效果

使用 `v-show` 后的具体表现：

#### 1. DOM 结构始终保留

```html
<!-- v-show="true" 时，渲染结果 -->
<div style="">可见的内容</div>

<!-- v-show="false" 时，渲染结果 -->
<div style="display: none;">隐藏的内容</div>

<!-- 注意：元素始终在 DOM 中，不会被移除 -->
```

#### 2. 切换行为说明

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>
    <div v-show="show" class="content">
      <p>这段内容会保留在 DOM 中</p>
      <input v-model="text" placeholder="输入的内容不会丢失" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
const text = ref('')

// 行为说明：
// 1. 在 input 中输入文字
// 2. 点击"切换"按钮隐藏内容（display: none）
// 3. 再次点击按钮显示内容
// 4. input 中之前输入的文字仍然保留，因为 DOM 元素从未被销毁
</script>

<style scoped>
.content {
  padding: 16px;
  border: 1px solid #ddd;
  margin-top: 8px;
}
</style>
```

#### 3. 与 Transition 配合的动画效果

```vue
<template>
  <Transition name="slide">
    <div v-show="open" class="panel">
      <!-- 当 open 变为 false 时 -->
      <!-- 1. Transition 检测到 v-show 的变化 -->
      <!-- 2. 添加 slide-leave-active 和 slide-leave-to 类 -->
      <!-- 3. 过渡动画完成后设置 display: none -->
    </div>
  </Transition>
</template>

<style scoped>
/* 进入和离开的过渡持续时间 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 进入的起始状态和离开的结束状态 */
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
```

---

### 五、使用场景

#### 场景一：Tab 标签页切换

Tab 切换是 `v-show` 最典型的使用场景，因为用户会在不同标签之间**频繁切换**，而每个标签的内容应该保持不变（如表单填写进度）。

```vue
<template>
  <div class="tabs-container">
    <!-- 标签头部 -->
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 标签内容：使用 v-show 保持各面板状态 -->
    <div class="tab-content">
      <div v-show="currentTab === 'basic'" class="tab-panel">
        <h3>基本信息</h3>
        <input v-model="form.name" placeholder="姓名" />
        <input v-model="form.email" placeholder="邮箱" />
      </div>

      <div v-show="currentTab === 'security'" class="tab-panel">
        <h3>安全设置</h3>
        <input v-model="form.oldPassword" type="password" placeholder="旧密码" />
        <input v-model="form.newPassword" type="password" placeholder="新密码" />
      </div>

      <div v-show="currentTab === 'notify'" class="tab-panel">
        <h3>通知偏好</h3>
        <label>
          <input v-model="form.emailNotify" type="checkbox" />
          接收邮件通知
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Tab {
  key: string
  label: string
}

const tabs: Tab[] = [
  { key: 'basic', label: '基本信息' },
  { key: 'security', label: '安全设置' },
  { key: 'notify', label: '通知偏好' }
]

const currentTab = ref('basic')

// 表单数据在切换 Tab 时不会丢失
const form = reactive({
  name: '',
  email: '',
  oldPassword: '',
  newPassword: '',
  emailNotify: false
})
</script>

<style scoped>
.tab-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #42b883;
  border-bottom-color: #42b883;
}

.tab-panel {
  padding: 16px 0;
}
</style>
```

#### 场景二：展开/收起面板（Accordion）

手风琴/折叠面板需要频繁在展开和收起之间切换，且展开的内容（如表单填写）需要在收起后再展开时保持不变。

```vue
<template>
  <div class="accordion">
    <div
      v-for="(item, index) in panels"
      :key="index"
      class="accordion-item"
    >
      <!-- 面板头部：点击展开/收起 -->
      <div class="accordion-header" @click="togglePanel(index)">
        <span>{{ item.title }}</span>
        <span :class="['arrow', { expanded: item.expanded }]">▸</span>
      </div>

      <!-- 面板内容：v-show 保持状态 -->
      <div v-show="item.expanded" class="accordion-body">
        <slot :name="item.slotName">{{ item.content }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Panel {
  title: string
  content: string
  expanded: boolean
  slotName: string
}

const panels = reactive<Panel[]>([
  { title: '订单信息', content: '订单详情...', expanded: true, slotName: 'order' },
  { title: '配送地址', content: '地址信息...', expanded: false, slotName: 'address' },
  { title: '支付方式', content: '支付信息...', expanded: false, slotName: 'payment' }
])

function togglePanel(index: number): void {
  panels[index].expanded = !panels[index].expanded
}
</script>

<style scoped>
.accordion-item {
  border: 1px solid #e0e0e0;
  margin-bottom: -1px;
}

.accordion-header {
  padding: 12px 16px;
  background-color: #fafafa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-body {
  padding: 16px;
}

.arrow {
  transition: transform 0.3s;
  display: inline-block;
}

.arrow.expanded {
  transform: rotate(90deg);
}
</style>
```

#### 场景三：按钮加载状态切换

按钮的"正常"与"加载中"状态切换非常频繁，使用 `v-show` 可以避免重复创建 DOM 元素。

```vue
<template>
  <button
    :class="['submit-btn', { loading }]"
    :disabled="loading"
    @click="handleSubmit"
  >
    <!-- 两种状态使用 v-show 切换，DOM 始终存在 -->
    <span v-show="!loading">提交数据</span>
    <span v-show="loading" class="loading-text">
      <span class="spinner"></span>
      提交中...
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

async function handleSubmit(): Promise<void> {
  if (loading.value) return

  loading.value = true
  try {
    // 模拟异步请求
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('提交成功')
  } catch (error) {
    console.error('提交失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.submit-btn {
  padding: 10px 24px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

#### 场景四：密码输入框显示/隐藏

密码的明文和密文切换是高频操作，且输入框内容不应因切换而丢失。

```vue
<template>
  <div class="password-field">
    <label>密码</label>
    <div class="input-wrapper">
      <input
        :type="showPassword ? 'text' : 'password'"
        v-model="password"
        placeholder="请输入密码"
        class="password-input"
      />
      <button
        type="button"
        class="toggle-btn"
        @click="showPassword = !showPassword"
        :aria-label="showPassword ? '隐藏密码' : '显示密码'"
      >
        <!-- 图标切换：v-show 保证两个图标都在 DOM 中 -->
        <span v-show="!showPassword">显示</span>
        <span v-show="showPassword">隐藏</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('')
const showPassword = ref(false)
</script>

<style scoped>
.password-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.password-input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
}

.toggle-btn {
  padding: 8px 12px;
  background: none;
  border: none;
  border-left: 1px solid #d9d9d9;
  cursor: pointer;
  color: #666;
  font-size: 12px;
}

.toggle-btn:hover {
  background-color: #f5f5f5;
}
</style>
```

#### 场景五：搜索结果过滤

列表过滤时，所有数据项需要在显示和隐藏之间频繁切换，使用 `v-show` 比 `v-if` 更高效。

```vue
<template>
  <div class="search-container">
    <input
      v-model="keyword"
      placeholder="输入关键词搜索..."
      class="search-input"
    />

    <ul class="result-list">
      <li
        v-for="item in dataList"
        :key="item.id"
        v-show="isMatch(item)"
        class="result-item"
      >
        <span class="name">{{ item.name }}</span>
        <span class="tag">{{ item.category }}</span>
      </li>
    </ul>

    <!-- 无结果提示 -->
    <div v-show="hasNoResult" class="empty-tip">
      没有匹配的结果
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DataItem {
  id: number
  name: string
  category: string
}

const keyword = ref('')

const dataList = ref<DataItem[]>([
  { id: 1, name: 'JavaScript 高级编程', category: '前端' },
  { id: 2, name: 'TypeScript 实战指南', category: '前端' },
  { id: 3, name: 'Node.js 服务端开发', category: '后端' },
  { id: 4, name: 'Vue 3 设计与实现', category: '前端' },
  { id: 5, name: 'Python 数据分析', category: '数据' }
])

function isMatch(item: DataItem): boolean {
  if (!keyword.value.trim()) return true
  const key = keyword.value.toLowerCase()
  return (
    item.name.toLowerCase().includes(key) ||
    item.category.toLowerCase().includes(key)
  )
}

const hasNoResult = computed(() => {
  return keyword.value.trim() !== '' && dataList.value.every((item) => !isMatch(item))
})
</script>

<style scoped>
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.tag {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #e8f5e9;
  color: #42b883;
  border-radius: 10px;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 24px 0;
}
</style>
```

#### 场景六：侧边栏/抽屉菜单

侧边栏的打开和关闭非常频繁，且侧边栏中的导航状态需要保持。

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <button class="menu-btn" @click="sidebarOpen = true">☰ 菜单</button>

    <!-- 遮罩层 -->
    <div
      v-show="sidebarOpen"
      class="overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- 侧边栏 -->
    <aside v-show="sidebarOpen" class="sidebar">
      <div class="sidebar-header">
        <h3>导航菜单</h3>
        <button @click="sidebarOpen = false">✕</button>
      </div>
      <nav class="sidebar-nav">
        <a
          v-for="nav in navList"
          :key="nav.path"
          :href="nav.path"
          :class="{ active: currentPath === nav.path }"
        >
          {{ nav.label }}
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Nav {
  path: string
  label: string
}

const sidebarOpen = ref(false)
const currentPath = ref('/home')

const navList = ref<Nav[]>([
  { path: '/home', label: '首页' },
  { path: '/discover', label: '发现' },
  { path: '/messages', label: '消息' },
  { path: '/profile', label: '我的' }
])
</script>

<style scoped>
.menu-btn {
  padding: 8px 16px;
  border: none;
  background-color: #42b883;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background-color: white;
  z-index: 200;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.sidebar-nav a {
  padding: 12px 20px;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}

.sidebar-nav a.active {
  color: #42b883;
  background-color: #f0faf5;
}
</style>
```

#### 场景七：表格列显示/隐藏控制

数据表格中允许用户自定义显示哪些列，列的切换需要保留数据状态。

```vue
<template>
  <div class="table-wrapper">
    <!-- 列控制面板 -->
    <div class="column-control">
      <span>显示列：</span>
      <label v-for="col in columns" :key="col.key">
        <input
          type="checkbox"
          v-model="col.visible"
        />
        {{ col.label }}
      </label>
    </div>

    <!-- 数据表格 -->
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" v-show="col.visible">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in tableData" :key="index">
          <td v-for="col in columns" :key="col.key" v-show="col.visible">
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Column {
  key: string
  label: string
  visible: boolean
}

interface Row {
  [key: string]: string | number
}

const columns = reactive<Column[]>([
  { key: 'name', label: '姓名', visible: true },
  { key: 'age', label: '年龄', visible: true },
  { key: 'email', label: '邮箱', visible: true },
  { key: 'phone', label: '电话', visible: false },
  { key: 'address', label: '地址', visible: false }
])

const tableData = reactive<Row[]>([
  { name: '张三', age: 28, email: 'zhangsan@example.com', phone: '13800001111', address: '北京市' },
  { name: '李四', age: 32, email: 'lisi@example.com', phone: '13800002222', address: '上海市' },
  { name: '王五', age: 25, email: 'wangwu@example.com', phone: '13800003333', address: '广州市' }
])
</script>

<style scoped>
.column-control {
  padding: 12px 0;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.column-control label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  cursor: pointer;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  background-color: #fafafa;
  font-weight: 600;
}
</style>
```

#### 场景八：图片轮播/幻灯片

轮播图在不同图片之间频繁切换，使用 `v-show` 避免图片被反复销毁和加载。

```vue
<template>
  <div class="carousel">
    <!-- 图片区域：v-show 保持图片已加载的状态 -->
    <div class="carousel-body">
      <img
        v-for="(img, index) in images"
        :key="index"
        v-show="currentIndex === index"
        :src="img.url"
        :alt="img.alt"
        class="carousel-img"
      />
    </div>

    <!-- 指示器 -->
    <div class="carousel-indicators">
      <button
        v-for="(_, index) in images"
        :key="index"
        :class="['indicator', { active: currentIndex === index }]"
        @click="currentIndex = index"
      ></button>
    </div>

    <!-- 前后按钮 -->
    <button class="carousel-btn prev" @click="prev">‹</button>
    <button class="carousel-btn next" @click="next">›</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ImageItem {
  url: string
  alt: string
}

const images: Image[] = [
  { url: 'https://picsum.photos/600/300?random=1', alt: '图片 1' },
  { url: 'https://picsum.photos/600/300?random=2', alt: '图片 2' },
  { url: 'https://picsum.photos/600/300?random=3', alt: '图片 3' },
  { url: 'https://picsum.photos/600/300?random=4', alt: '图片 4' }
]

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next(): void {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

function prev(): void {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
}

// 自动播放
onMounted(() => {
  timer = setInterval(next, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.carousel {
  position: relative;
  width: 600px;
  margin: 0 auto;
}

.carousel-body {
  position: relative;
  height: 300px;
}

.carousel-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  padding: 0;
}

.indicator.active {
  background-color: #42b883;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.carousel-btn.prev {
  left: 8px;
}

.carousel-btn.next {
  right: 8px;
}
</style>
```

#### 场景九：Tooltip / Popover 提示气泡

Tooltip 在鼠标悬停时出现、离开时消失，切换频率很高，适合使用 `v-show`。

```vue
<template>
  <div class="tooltip-wrapper">
    <button
      class="trigger-btn"
      @mouseenter="visible = true"
      @mouseleave="visible = false"
    >
      悬停查看提示
    </button>

    <Transition name="tooltip-fade">
      <div v-show="visible" class="tooltip-content">
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content?: string
}

withDefaults(defineProps<Props>(), {
  content: '这是一条提示信息'
})

const visible = ref(false)
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.trigger-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.tooltip-content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background-color: #333;
  color: white;
  font-size: 13px;
  border-radius: 4px;
  white-space: nowrap;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
```

#### 场景十：多步骤表单/向导

多步骤表单中，用户可能需要在不同步骤之间来回切换，各步骤的表单数据需要保留。

```vue
<template>
  <div class="wizard">
    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="['step-dot', { active: currentStep === index }]"
      >
        {{ index + 1 }}
      </div>
    </div>

    <!-- 各步骤内容：v-show 保持所有步骤的数据不丢失 -->
    <div v-show="currentStep === 0" class="step-content">
      <h3>第一步：基本信息</h3>
      <input v-model="formData.username" placeholder="用户名" />
      <input v-model="formData.email" placeholder="邮箱" />
    </div>

    <div v-show="currentStep === 1" class="step-content">
      <h3>第二步：详细信息</h3>
      <input v-model="formData.phone" placeholder="手机号" />
      <textarea v-model="formData.address" placeholder="地址"></textarea>
    </div>

    <div v-show="currentStep === 2" class="step-content">
      <h3>第三步：确认信息</h3>
      <p>用户名：{{ formData.username }}</p>
      <p>邮箱：{{ formData.email }}</p>
      <p>手机号：{{ formData.phone }}</p>
      <p>地址：{{ formData.address }}</p>
    </div>

    <!-- 导航按钮 -->
    <div class="wizard-actions">
      <button v-show="currentStep > 0" @click="currentStep--">上一步</button>
      <button v-show="currentStep < steps.length - 1" @click="currentStep++">
        下一步
      </button>
      <button v-show="currentStep === steps.length - 1" @click="submit">
        提交
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface FormData {
  username: string
  email: string
  phone: string
  address: string
}

const steps = ['基本信息', '详细信息', '确认信息']
const currentStep = ref(0)

// 所有步骤共享同一份表单数据，切换步骤时数据不会丢失
const formData = reactive<FormData>({
  username: '',
  email: '',
  phone: '',
  address: ''
})

function submit(): void {
  console.log('提交数据：', formData)
}
</script>

<style scoped>
.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s;
}

.step-dot.active {
  background-color: #42b883;
  color: white;
}

.step-content {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-content input,
.step-content textarea {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.wizard-actions button {
  padding: 10px 24px;
  border: 1px solid #d9d9d9;
  background-color: #42b883;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

---

### 六、注意事项

#### 1. 不能用在 `<template>` 标签上

`<template>` 是一个虚拟容器，不会被渲染为真实的 DOM 元素，因此无法给它设置 `display` 属性。

```vue
<template>
  <!-- ❌ 错误：v-show 对 template 无效 -->
  <template v-show="visible">
    <div>内容 A</div>
    <div>内容 B</div>
  </template>

  <!-- ✅ 正确：包裹在一个真实 DOM 元素中 -->
  <div v-show="visible">
    <div>内容 A</div>
    <div>内容 B</div>
  </div>
</template>
```

#### 2. 不支持 v-else 和 v-else-if

`v-show` 是独立的指令，不能像 `v-if` 一样配合 `v-else` 或 `v-else-if` 使用链式条件判断。

```vue
<template>
  <!-- ❌ 错误：v-show 后面不能跟 v-else -->
  <div v-show="status === 'A'">状态 A</div>
  <div v-else>其他状态</div>

  <!-- ✅ 正确：每个条件独立使用 v-show -->
  <div v-show="status === 'A'">状态 A</div>
  <div v-show="status !== 'A'">其他状态</div>
</template>
```

#### 3. 隐藏的组件不会触发生命周期

使用 `v-show` 隐藏的组件仍然存在于 DOM 中，**不会触发 `unmounted` 钩子**，再次显示时也不会触发 `mounted` 钩子。

```vue
<template>
  <!-- ⚠️ ChildComponent 不会被销毁，内部 onUnmounted 不会执行 -->
  <ChildComponent v-show="showChild" />

  <!-- 如果需要在隐藏时执行清理逻辑，使用 v-if -->
  <ChildComponent v-if="showChild" />
</template>
```

#### 4. 组件内部状态会保留

`v-show` 隐藏的组件不会被销毁，其内部状态（如表单输入、滚动位置、子组件状态）都会保留。这既是优点也是需要注意的地方。

```vue
<template>
  <!-- 用户在 FormPanel 中填写的表单数据会被保留 -->
  <FormPanel v-show="activeTab === 'form'" />

  <!-- ⚠️ 如果需要每次显示时重置状态，应该用 v-if -->
  <FormPanel v-if="activeTab === 'form'" />
</template>
```

#### 5. CSS 优先级问题

`v-show` 通过内联样式 `display: none` 来隐藏元素。如果元素上有 `!important` 的 display 样式，可能会覆盖 `v-show` 的行为。

```css
/* ❌ 这会导致 v-show 失效 */
.always-visible {
  display: flex !important;
}
```

```vue
<template>
  <!-- 如果有上面的 CSS，v-show 将无法隐藏该元素 -->
  <div v-show="false" class="always-visible">我无法被隐藏</div>
</template>
```

> ⚠️ **注意：** 避免在 CSS 中使用 `display: xxx !important` 来覆盖 `v-show` 的控制，否则会导致隐藏失效。

#### 6. display 属性值的恢复

当 `v-show` 从 `false` 变为 `true` 时，Vue 会尝试恢复元素原始的 `display` 属性值。但如果元素本身没有设置 display，Vue 会使用默认值。

```vue
<template>
  <!-- v-show="true" 时，display 会恢复为 "flex" -->
  <div v-show="visible" style="display: flex">内容</div>
</template>
```

> 💡 **提示：** Vue 在首次渲染时会记录元素原始的 `display` 值，之后切换为 `true` 时会恢复该值，而不是简单地移除 `display: none`。

#### 7. SSR 中的行为差异

在服务端渲染（SSR）场景中，`v-show` 和 `v-if` 有重要的行为差异：

- `v-show` 的元素在服务端**始终会被渲染**到 HTML 中（即使条件为 `false`，也会带上 `display: none`）
- `v-if="false"` 的元素在服务端**不会渲染**到 HTML 中

```vue
<template>
  <!-- SSR 输出：<div style="display:none;">秘密内容</div> -->
  <!-- ⚠️ 内容可以被查看源代码看到，不适合隐藏敏感信息 -->
  <div v-show="false">秘密内容</div>

  <!-- SSR 输出：不会渲染该元素 -->
  <!-- ✅ 适合隐藏敏感或不需要的内容 -->
  <div v-if="false">秘密内容</div>
</template>
```

#### 8. 性能考量：初始渲染开销

`v-show` 无论条件真假都会将元素渲染到 DOM 中，这意味着：

- 如果条件**初始为 `false` 且几乎不会变为 `true`**，使用 `v-show` 会浪费初始渲染的性能
- 如果条件**初始为 `false` 但后续会频繁切换**，`v-show` 的总性能通常优于 `v-if`

#### 9. 与 v-for 的优先级

在 Vue 3 中，`v-if` 的优先级高于 `v-for`，但 `v-show` 没有优先级冲突——它始终是在元素渲染后再切换显示状态。

```vue
<template>
  <!-- ✅ v-show 在每个列表项渲染后应用，无需担心优先级问题 -->
  <div v-for="item in list" :key="item.id" v-show="item.active">
    {{ item.name }}
  </div>
</template>
```

#### 10. 可访问性（a11y）考虑

`v-show` 通过 `display: none` 隐藏元素时，屏幕阅读器**不会读取被隐藏的内容**。如果需要视觉上隐藏但屏幕阅读器仍可访问，应使用专门的 CSS 类。

```css
/* 视觉隐藏，但屏幕阅读器可访问 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

### 七、相关 API 对比

#### v-show vs v-if

| 特性 | `v-show` | `v-if` |
|------|----------|--------|
| **实现方式** | CSS `display` 属性切换 | DOM 元素的创建与销毁 |
| **初始渲染** | 始终渲染到 DOM | 条件为 `false` 时不渲染 |
| **切换开销** | 极低（只改 CSS 属性） | 较高（销毁/重建 DOM 及子组件） |
| **初始渲染开销** | 较高（无论条件都渲染） | 较低（按需渲染） |
| **适用场景** | 频繁切换显示状态 | 条件很少改变 |
| **支持 `<template>`** | 不支持 | 支持 |
| **配合 `v-else`** | 不支持 | 支持 |
| **配合 `v-else-if`** | 不支持 | 支持 |
| **组件生命周期** | 不触发（组件始终存在） | 触发 `mounted` / `unmounted` |
| **状态保留** | 自动保留 | 销毁后丢失（除非用 `<KeepAlive>`） |
| **配合 `<Transition>`** | 支持（进入和离开动画均可） | 支持（进入和离开动画均可） |
| **SSR 渲染行为** | 始终渲染到 HTML（`display: none`） | 条件为 `false` 时不渲染 |
| **`<KeepAlive>` 缓存** | 无需（始终在 DOM） | 可配合缓存组件实例 |

#### 选择指南

```
需要频繁切换？ ─── 是 ──→ v-show
       │
       否
       │
条件几乎不变？ ─── 是 ──→ v-if
       │
       不确定
       │
需要状态保留？ ─── 是 ──→ v-show
       │
       否
       │
初始条件为 false 且渲染成本高？ ──→ v-if
```

> 💡 **提示：** 当不确定该用 `v-show` 还是 `v-if` 时，默认选择 `v-if`，只在确认需要频繁切换时才改用 `v-show`。

---

### 八、总结

| 要点 | 说明 |
|------|------|
| **核心机制** | 通过 CSS `display: none` 控制元素的显示与隐藏 |
| **DOM 状态** | 元素始终存在于 DOM 中，不会被移除或重新创建 |
| **最佳场景** | 需要频繁切换显示状态的场景（Tab、加载动画、展开收起等） |
| **状态保留** | 隐藏时内部状态完整保留（表单数据、滚动位置等） |
| **限制** | 不能用在 `<template>` 上，不支持 `v-else` / `v-else-if` |
| **动画支持** | 可以配合 `<Transition>` 实现进入和离开动画 |
| **性能选择** | 频繁切换用 `v-show`，条件少变用 `v-if` |
| **SSR 注意** | `v-show="false"` 的内容仍会被渲染到 HTML 中，不适合隐藏敏感信息 |
