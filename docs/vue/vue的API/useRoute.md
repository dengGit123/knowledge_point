# useRoute

Vue Router 提供的组合式函数，用于访问当前路由。

## 语法

```javascript
import { useRoute } from 'vue-router'

const route = useRoute()
```

## 参数

无

## 返回值

返回当前路由对象

## 基础用法

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.path)      // 当前路径
console.log(route.params)    // 路由参数
console.log(route.query)     // 查询参数
console.log(route.name)      // 路由名称
</script>
```

## 访问路由参数

```vue
<template>
  <div>
    <h1>用户: {{ username }}</h1>
    <p>文章: {{ postId }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const username = computed(() => route.params.username)
const postId = computed(() => route.params.id)
</script>

<!-- 路由配置 -->
<!-- /user/:username/post/:id -->
```

## 访问查询参数

```vue
<template>
  <div>
    <p>搜索关键词: {{ searchQuery }}</p>
    <p>页码: {{ page }}</p>
    <p>排序: {{ sortBy }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const searchQuery = computed(() => route.query.q || '')
const page = computed(() => parseInt(route.query.page) || 1)
const sortBy = computed(() => route.query.sort || 'date')
</script>
```

## 路由元信息

```vue
<template>
  <div :class="pageClass">
    <h1>{{ pageTitle }}</h1>
    <main>
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const pageTitle = computed(() => route.meta.title || '默认标题')
const pageClass = computed(() => route.meta.pageClass || 'default-page')
const requiresAuth = computed(() => route.meta.requiresAuth || false)
</script>

<!-- 路由配置 -->
{
  path: '/admin',
  component: Admin,
  meta: {
    title: '管理后台',
    pageClass: 'admin-page',
    requiresAuth: true
  }
}
```

## 监听路由变化

```vue
<script setup>
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log(`ID 从 ${oldId} 变为 ${newId}`)
    // 重新加载数据
    loadData(newId)
  },
  { immediate: true }
)

async function loadData(id) {
  // 根据 ID 加载数据
}
</script>
```

## 路由守卫

```vue
<script setup>
import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()

// 离开守卫
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = confirm('确定要离开吗？未保存的更改将丢失。')
    if (!answer) return false
  }
})

// 更新守卫
onBeforeRouteUpdate((to, from) => {
  console.log('从', from.path, '到', to.path)
  loadData(to.params.id)
})
</script>
```

## 嵌套路由

```vue
<template>
  <div class="user-profile">
    <aside>
      <RouterLink to="">个人信息</RouterLink>
      <RouterLink to="posts">文章</RouterLink>
      <RouterLink to="settings">设置</RouterLink>
    </aside>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute, computed } from 'vue-router'

const route = useRoute()

const currentTab = computed(() => {
  const pathParts = route.path.split('/')
  return pathParts[pathParts.length - 1] || 'profile'
})
</script>
```

## 路由哈希

```vue
<template>
  <div>
    <p>当前哈希: {{ route.hash }}</p>
    <a href="#section1">第一节</a>
    <a href="#section2">第二节</a>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
```

## 获取完整路径

```vue
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 获取完整 URL（包含协议、主机等）
const fullUrl = computed(() => window.location.href)

// 获取路径（包含查询参数）
const fullPath = computed(() => route.fullPath)

// 仅获取路径
const path = computed(() => route.path)
</script>
```

## 历史记录

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

console.log('路由对象:', route)
console.log('来自:', route.redirectedFrom) // 重定向来源
</script>
```

## 与状态管理结合

```vue
<script setup>
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { watch } from 'vue'

const route = useRoute()
const store = useStore()

// 根据路由参数更新状态
watch(
  () => route.params.categoryId,
  (categoryId) => {
    if (categoryId) {
      store.dispatch('fetchProducts', categoryId)
    }
  },
  { immediate: true }
)
</script>
```

## TypeScript 支持

```typescript
<script setup lang="ts">
import { useRoute } from 'vue-router'

interface RouteParams {
  userId: string
  postId: string
}

const route = useRoute()

// 类型安全地访问参数
const userId = computed(() => route.params.userId as string)
const postId = computed(() => route.params.postId as string)
</script>
```

## 注意事项

1. **只能在 setup 中调用**：必须在组件的 setup 函数中调用

2. **响应式**：返回的路由对象是响应式的

3. **与 useRouter 的区别**：
   - `useRoute`：获取当前路由信息
   - `useRouter`：获取路由器实例（用于编程导航）

4. **监听变化**：使用 watch 监听路由变化

5. **服务端渲染**：SSR 中也能正常工作

6. **最佳实践**：
   - 使用 computed 计算派生值
   - 使用 watch 处理路由变化
   - 使用命名路由提高代码可维护性
