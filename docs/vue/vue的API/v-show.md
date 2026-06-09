# v-show

## 作用

`v-show` 根据表达式的真假值，切换元素的 CSS `display` 属性来控制显示与隐藏。

与 `v-if` 不同，`v-show` 的元素**始终会被渲染并保留在 DOM 中**，只是通过 CSS 进行切换。

> [Vue 官方文档 - v-show](https://cn.vuejs.org/api/built-in-directives#v-show)

## 基本用法

```vue
<template>
  <div v-show="isVisible">显示或隐藏的内容</div>
  <button @click="isVisible = !isVisible">切换显示</button>
</template>

<script setup>
import { ref } from 'vue'
const isVisible = ref(true)
</script>
```

## 与 v-if 的区别

| 特性 | v-show | v-if |
|------|--------|------|
| **实现方式** | CSS `display` 切换 | DOM 创建/销毁 |
| **初始渲染** | 始终渲染到 DOM | 条件为 false 时不渲染 |
| **切换开销** | 低（只改 CSS） | 高（销毁/重建 DOM 和子组件） |
| **初始渲染开销** | 高（无论条件都渲染） | 低（按需渲染） |
| **适用场景** | 频繁切换显示状态 | 条件很少改变 |
| **支持 `<template>`** | ❌ 不支持 | ✅ 支持 |
| **配合 `v-else`** | ❌ 不支持 | ✅ 支持 |
| **组件生命周期** | 不触发（始终存在） | 触发 mounted/unmounted |
| **`keep-alive`** | 无影响 | 可配合缓存 |

### 选择建议

```vue
<template>
  <!-- ✅ 频繁切换 → 用 v-show（如 tab 切换、展开收起） -->
  <div v-show="activeTab === 'home'">首页内容</div>
  <div v-show="activeTab === 'profile'">个人资料</div>
  <div v-show="activeTab === 'settings'">设置</div>

  <!-- ✅ 条件很少变化 → 用 v-if（如权限判断、初始加载状态） -->
  <AdminPanel v-if="isAdmin" />
  <div v-else>无权限访问</div>
</template>
```

## 使用场景

### 1. Tab 标签页切换

```vue
<template>
  <div class="tabs">
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: currentTab === tab.key }"
        @click="currentTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <div v-show="currentTab === 'info'">
        <h3>基本信息</h3>
        <p>用户的基本信息内容...</p>
      </div>
      <div v-show="currentTab === 'security'">
        <h3>安全设置</h3>
        <p>密码、两步验证等安全设置...</p>
      </div>
      <div v-show="currentTab === 'notification'">
        <h3>通知偏好</h3>
        <p>邮件、短信通知设置...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref('info')
const tabs = [
  { key: 'info', label: '基本信息' },
  { key: 'security', label: '安全设置' },
  { key: 'notification', label: '通知偏好' }
]
</script>
```

### 2. 展开/收起面板

```vue
<template>
  <div class="collapse">
    <div class="collapse-header" @click="expanded = !expanded">
      <span>{{ title }}</span>
      <span :class="{ 'arrow-down': expanded }">▶</span>
    </div>
    <div class="collapse-body" v-show="expanded">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  }
})

const expanded = ref(false)
</script>

<style scoped>
.collapse-body {
  padding: 12px;
  border: 1px solid #eee;
}
.arrow-down {
  transform: rotate(90deg);
}
</style>
```

### 3. 加载状态切换

```vue
<template>
  <button :disabled="loading" @click="handleSubmit">
    <span v-show="!loading">提交</span>
    <span v-show="loading">
      <span class="spinner" /> 提交中...
    </span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await submitForm()
  } finally {
    loading.value = false
  }
}
</script>
```

### 4. 搜索结果过滤

```vue
<template>
  <div>
    <input v-model="keyword" placeholder="搜索..." />

    <div v-for="item in items" :key="item.id" v-show="matchKeyword(item)">
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
const items = ref([
  { id: 1, name: '苹果' },
  { id: 2, name: '香蕉' },
  { id: 3, name: '橙子' },
  { id: 4, name: '草莓' }
])

function matchKeyword(item) {
  if (!keyword.value) return true
  return item.name.includes(keyword.value)
}
</script>
```

### 5. 密码显示/隐藏

```vue
<template>
  <div class="password-input">
    <input
      :type="showPassword ? 'text' : 'password'"
      v-model="password"
      placeholder="请输入密码"
    />
    <button @click="showPassword = !showPassword">
      <span v-show="!showPassword">👁 显示</span>
      <span v-show="showPassword">🙈 隐藏</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const password = ref('')
const showPassword = ref(false)
</script>
```

### 6. 侧边栏/抽屉

```vue
<template>
  <div>
    <button @click="sidebarOpen = true">打开菜单</button>

    <!-- 遮罩层 -->
    <div class="overlay" v-show="sidebarOpen" @click="sidebarOpen = false" />

    <!-- 侧边栏 -->
    <div class="sidebar" v-show="sidebarOpen">
      <nav>
        <a href="#" @click.prevent>首页</a>
        <a href="#" @click.prevent>关于</a>
        <a href="#" @click.prevent>联系我们</a>
      </nav>
      <button @click="sidebarOpen = false">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background: white;
  z-index: 20;
  padding: 20px;
}
</style>
```

### 7. 响应式布局

```vue
<template>
  <div>
    <!-- 桌面端显示侧边栏 -->
    <aside v-show="isDesktop" class="desktop-sidebar">
      侧边导航
    </aside>

    <!-- 移动端显示底部导航 -->
    <nav v-show="!isDesktop" class="mobile-nav">
      <a href="#">首页</a>
      <a href="#">搜索</a>
      <a href="#">我的</a>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isDesktop = ref(true)

function checkScreenSize() {
  isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>
```

## 注意事项

### 1. 不能用在 `<template>` 上

```vue
<template>
  <!-- ❌ 错误：v-show 不能用在 template 上（template 不是真实 DOM 元素，无法设置 display） -->
  <template v-show="visible">
    <div>内容A</div>
    <div>内容B</div>
  </template>

  <!-- ✅ 正确：用在真实 DOM 元素上 -->
  <div v-show="visible">
    <div>内容A</div>
    <div>内容B</div>
  </div>
</template>
```

### 2. 不能配合 v-else 使用

```vue
<template>
  <!-- ❌ 错误：v-show 不支持 v-else -->
  <div v-show="condition">A</div>
  <div v-else>B</div>

  <!-- ✅ 正确：分别使用 v-show -->
  <div v-show="condition">A</div>
  <div v-show="!condition">B</div>
</template>
```

### 3. 不支持 `<Transition>` 组件的离场动画

```vue
<template>
  <!-- ❌ v-show 的元素始终在 DOM 中，离开动画不会触发 -->
  <Transition name="fade">
    <div v-if="show">使用 v-if 才有离场动画</div>
  </Transition>

  <!-- ✅ v-show 配合 Transition 可以触发进入和离开动画 -->
  <!-- 因为 v-show 切换 display，Transition 可以检测到 -->
  <Transition name="fade">
    <div v-show="show">v-show 也可以配合 Transition</div>
  </Transition>
</template>
```

### 4. 组件内的状态会保留

```vue
<template>
  <!-- ⚠️ v-show 隐藏的组件不会被销毁，内部状态会保留 -->
  <UserForm v-show="showForm" />

  <!-- 如果需要重置组件状态，使用 v-if -->
  <UserForm v-if="showForm" />
</template>
```

### 5. CSS 优先级影响

```vue
<template>
  <!-- ⚠️ 如果元素有 display: flex 等样式，v-show 可能会覆盖它 -->
  <div v-show="visible" style="display: flex">
    <!-- v-show="false" 会设置 display: none，覆盖原有的 flex -->
    <!-- v-show="true" 时，Vue 会移除 display: none，恢复原有样式 -->
  </div>
</template>
```

## 最佳实践

1. **频繁切换用 v-show**：如 Tab 切换、展开收起、加载状态等频繁切换的场景
2. **少变条件用 v-if**：如权限判断、初始化加载状态等几乎不变的条件
3. **避免 v-show 嵌套 v-if**：两者混用时优先级需要特别注意
4. **注意 SEO**：v-show 的内容始终在 DOM 中，对 SEO 可能有影响（SSR 场景）
5. **配合 Transition**：v-show 可以配合 `<Transition>` 实现动画效果
