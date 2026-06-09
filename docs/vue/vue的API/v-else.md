# v-else

## 作用

`v-else` 为 `v-if` 或 `v-else-if` 添加一个"else 块"。当前面的 `v-if` / `v-else-if` 条件均为 false 时，渲染 `v-else` 所在的元素。

> [Vue 官方文档 - v-if / v-else](https://cn.vuejs.org/api/built-in-directives#v-if)

## 基本用法

```vue
<template>
  <div v-if="isLoggedIn">欢迎回来！</div>
  <div v-else>请先登录</div>
</template>

<script setup>
import { ref } from 'vue'
const isLoggedIn = ref(true)
</script>
```

## 使用场景

### 1. 条件分支判断

```vue
<template>
  <!-- 登录状态判断 -->
  <div v-if="user">
    <span>你好，{{ user.name }}</span>
    <button @click="logout">退出</button>
  </div>
  <div v-else>
    <button @click="showLoginDialog = true">登录</button>
    <button @click="showRegisterDialog = true">注册</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref(null)
const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)

function logout() {
  user.value = null
}
</script>
```

### 2. 多条件分支链

```vue
<template>
  <div v-if="status === 'loading'">加载中...</div>
  <div v-else-if="status === 'error'">加载失败：{{ errorMsg }}</div>
  <div v-else-if="status === 'empty'">暂无数据</div>
  <div v-else>
    <!-- 成功加载 -->
    <ul>
      <li v-for="item in dataList" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const status = ref('loading')
const errorMsg = ref('')
const dataList = ref([])
</script>
```

### 3. 配合 `<template>` 使用

```vue
<template>
  <!-- v-else 可以配合 template 包裹多个元素 -->
  <template v-if="isAdmin">
    <AdminDashboard />
    <AdminMenu />
    <AdminStats />
  </template>
  <template v-else>
    <UserDashboard />
    <UserMenu />
  </template>
</template>
```

### 4. 空状态展示

```vue
<template>
  <div class="list-container">
    <ul v-if="items.length > 0">
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
    <div v-else class="empty-state">
      <img src="/empty.svg" alt="空状态" />
      <p>暂无数据</p>
      <button @click="addItem">添加第一条</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([])
</script>
```

### 5. 表单验证反馈

```vue
<template>
  <div class="form-field">
    <input v-model="email" placeholder="请输入邮箱" />

    <p v-if="emailError" class="error">{{ emailError }}</p>
    <p v-else-if="email && !emailError" class="success">邮箱格式正确</p>
    <p v-else class="hint">请输入有效的邮箱地址</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const email = ref('')
const emailError = computed(() => {
  if (!email.value) return ''
  if (!email.value.includes('@')) return '邮箱必须包含 @'
  if (!email.value.includes('.')) return '邮箱格式不正确'
  return ''
})
</script>
```

### 6. 权限控制

```vue
<template>
  <div class="article-actions">
    <template v-if="canEdit">
      <button @click="edit">编辑</button>
      <button @click="remove">删除</button>
    </template>
    <template v-else>
      <button @click="report">举报</button>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userId: Number,
  authorId: Number,
  role: String
})

const canEdit = computed(() => {
  return props.userId === props.authorId || props.role === 'admin'
})
</script>
```

### 7. 组件条件渲染

```vue
<template>
  <!-- 根据状态渲染不同的组件 -->
  <LoadingSpinner v-if="loading" />
  <ErrorPage v-else-if="error" :error="error" />
  <ContentPage v-else :data="pageData" />
</template>

<script setup>
import { ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorPage from './ErrorPage.vue'
import ContentPage from './ContentPage.vue'

const loading = ref(true)
const error = ref(null)
const pageData = ref(null)
</script>
```

### 8. 响应式文本

```vue
<template>
  <span v-if="count === 0">没有消息</span>
  <span v-else-if="count === 1">1 条未读消息</span>
  <span v-else>{{ count }} 条未读消息</span>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(5)
</script>
```

## 注意事项

### 1. 必须紧跟 v-if / v-else-if

```vue
<template>
  <!-- ❌ 错误：v-else 和 v-if 之间有其他元素 -->
  <div v-if="condition">A</div>
  <p>中间内容</p>
  <div v-else>B</div>

  <!-- ✅ 正确：v-else 紧跟 v-if -->
  <div v-if="condition">A</div>
  <div v-else>B</div>
</template>
```

### 2. 不能单独使用

```vue
<template>
  <!-- ❌ 错误：v-else 必须配合 v-if 使用 -->
  <div v-else>内容</div>
</template>
```

### 3. 不能和 v-show 配合

```vue
<template>
  <!-- ❌ 错误：v-show 不支持 v-else -->
  <div v-show="condition">A</div>
  <div v-else>B</div>

  <!-- ✅ 正确：使用两个 v-show -->
  <div v-show="condition">A</div>
  <div v-show="!condition">B</div>

  <!-- ✅ 或者使用 v-if -->
  <div v-if="condition">A</div>
  <div v-else>B</div>
</template>
```

### 4. key 的管理

```vue
<template>
  <!-- ⚠️ Vue 会自动为 v-if/v-else 生成不同的 key，通常不需要手动指定 -->
  <div v-if="type === 'a'">A</div>
  <div v-else>B</div>

  <!-- 如果需要强制替换（不复用元素），手动添加 key -->
  <div v-if="type === 'a'" key="a">A</div>
  <div v-else key="b">B</div>
</template>
```

## 最佳实践

1. **保持条件链简洁**：如果条件分支超过 3-4 个，考虑使用计算属性或策略模式简化
2. **配合 template 使用**：需要渲染多个元素时使用 `<template>` 包裹
3. **优先使用 v-if/v-else**：互斥条件使用 `v-if` + `v-else`，比两个独立的 `v-show` 语义更清晰
4. **注意元素复用**：Vue 默认复用相同标签的元素，需要时可使用 `key` 强制替换
