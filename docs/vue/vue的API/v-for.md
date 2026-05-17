# v-for

## 作用
`v-for` 是 Vue 的列表渲染指令，基于数组或对象来渲染列表或重复元素。它需要使用 `key` 来帮助 Vue 跟踪每个节点的身份。

## 用法

### 基本用法 - 数组

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
])
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>
```

### 使用索引

```vue
<template>
  <ul>
    <!-- 语法: (item, index) in items -->
    <li v-for="(item, index) in items" :key="item.id">
      {{ index + 1 }}. {{ item.name }}
    </li>
  </ul>
</template>
```

### 对象遍历

```vue
<script setup>
import { reactive } from 'vue'

const user = reactive({
  name: 'Vue',
  age: 3,
  role: 'framework'
})
</script>

<template>
  <ul>
    <!-- 语法: (value, key, index) in object -->
    <li v-for="(value, key, index) in user" :key="key">
      {{ index }}. {{ key }}: {{ value }}
    </li>
  </ul>
</template>
```

### 数字遍历

```vue
<template>
  <div>
    <span v-for="n in 10" :key="n">
      {{ n }}
    </span>
  </div>
</template>
```

### 字符串遍历

```vue
<script setup>
const message = 'Hello'
</script>

<template>
  <span v-for="(char, index) in message" :key="index">
    {{ char }}
  </span>
</template>
```

### 嵌套循环

```vue
<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    name: 'Category 1',
    items: ['Item 1', 'Item 2']
  },
  {
    name: 'Category 2',
    items: ['Item 3', 'Item 4']
  }
])
</script>

<template>
  <div v-for="category in categories" :key="category.name">
    <h3>{{ category.name }}</h3>
    <ul>
      <li v-for="(item, index) in category.items" :key="index">
        {{ item }}
      </li>
    </ul>
  </div>
</template>
```

### 在组件上使用

```vue
<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, text: 'Learn Vue', done: false },
  { id: 2, text: 'Build something', done: false }
])
</script>

<template>
  <TodoItem
    v-for="todo in todos"
    :key="todo.id"
    :todo="todo"
  />
</template>
```

### 使用 template

```vue
<template>
  <!-- 渲染多个元素 -->
  <template v-for="item in items" :key="item.id">
    <div class="header">{{ item.title }}</div>
    <div class="content">{{ item.description }}</div>
    <div class="footer">{{ item.footer }}</div>
  </template>
</template>
```

### 与 v-if 配合

```vue
<template>
  <!-- Vue 3 中 v-if 优先级更高 -->
  <template v-for="item in items" :key="item.id">
    <li v-if="item.visible">
      {{ item.name }}
    </li>
  </template>

  <!-- 或使用计算属性过滤（推荐） -->
  <li v-for="item in visibleItems" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

### of 作为分隔符

```vue
<template>
  <!-- in 和 of 可以互换 -->
  <div v-for="item of items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

## 注意事项

### 1. 必须使用 key

```vue
<template>
  <!-- ✅ 正确：使用唯一的 key -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>

  <!-- ❌ 错误：不使用 key -->
  <li v-for="item in items">
    {{ item.name }}
  </li>

  <!-- ❌ 错误：使用索引作为 key -->
  <li v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </li>
</template>
```

### 2. key 的唯一性

```vue
<script setup>
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 1, name: 'Item 2' } // 重复的 id
])
</script>

<template>
  <!-- ❌ key 必须唯一 -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>

  <!-- ✅ 使用组合键确保唯一性 -->
  <li v-for="(item, index) in items" :key="`${item.id}-${index}`">
    {{ item.name }}
  </li>
</template>
```

### 3. 避免在模板中修改数组

```vue
<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3])

// ❌ 错误：在模板中直接修改
function addNewItem() {
  // items.value.push(4) // 如果在模板中使用会有问题
}

// ✅ 正确：使用数组方法
function addNewItem() {
  items.value.push(4)
}
</script>

<template>
  <div v-for="item in items" :key="item">
    {{ item }}
  </div>
</template>
```

### 4. 响应式更新数组

```vue
<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3])

// Vue 能检测到的数组方法
items.value.push(4)           // 添加
items.value.pop()             // 移除最后一个
items.value.shift()           // 移除第一个
items.value.unshift(0)        // 添加到开头
items.value.splice(1, 1)      // 替换/删除
items.value.sort()            // 排序
items.value.reverse()         // 反转

// ⚠️ 直接赋值索引不是响应式的
items.value[0] = 99           // 不会触发更新

// ✅ 正确方式
items.value.splice(0, 1, 99)  // 会触发更新
</script>
```

### 5. v-for 和 v-if 的优先级

```vue
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1', visible: true },
  { id: 2, name: 'Item 2', visible: false }
])
</script>

<template>
  <!-- Vue 3: v-if 优先级更高，只渲染可见项 -->
  <li v-for="item in items" v-if="item.visible" :key="item.id">
    {{ item.name }}
  </li>

  <!-- 推荐使用计算属性过滤 -->
  <li v-for="item in visibleItems" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

### 6. 大列表性能

```vue
<script setup>
import { ref } from 'vue'

// 对于大列表，考虑虚拟滚动
const largeList = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
}))
</script>

<template>
  <!-- 使用虚拟滚动组件 -->
  <VirtualScroller :items="largeList" />
</template>
```

### 7. 在循环中使用 ref

```vue
<script setup>
import { ref, onMounted } from 'vue'

const items = ref([1, 2, 3])
const itemRefs = ref([])

onMounted(() => {
  console.log(itemRefs.value) // [div, div, div]
})
</script>

<template>
  <div
    v-for="(item, index) in items"
    :key="item"
    :ref="(el) => { if (el) itemRefs[index] = el }"
  >
    {{ item }}
  </div>
</template>
```

### 8. 对象遍历的顺序

```vue
<script setup>
import { reactive } from 'vue'

const obj = reactive({
  c: 3,
  a: 1,
  b: 2
})

// Object.keys() 的顺序不一定
// 在大多数现代浏览器中会按插入顺序
</script>

<template>
  <div v-for="(value, key) in obj" :key="key">
    {{ key }}: {{ value }}
  </div>
</template>
```

## 使用场景

### 1. 列表渲染

```vue
<script setup>
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'Product 1', price: 99.99 },
  { id: 2, name: 'Product 2', price: 149.99 },
  { id: 3, name: 'Product 3', price: 199.99 }
])
</script>

<template>
  <div class="product-list">
    <div
      v-for="product in products"
      :key="product.id"
      class="product-card"
    >
      <h3>{{ product.name }}</h3>
      <p>¥{{ product.price }}</p>
      <button>Add to Cart</button>
    </div>
  </div>
</template>
```

### 2. 动态表单字段

```vue
<script setup>
import { ref } from 'vue'

const fields = ref([
  { name: 'username', label: '用户名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'email' },
  { name: 'password', label: '密码', type: 'password' }
])

const formData = reactive({})
</script>

<template>
  <form>
    <div v-for="field in fields" :key="field.name">
      <label>{{ field.label }}</label>
      <input
        :type="field.type"
        v-model="formData[field.name]"
      />
    </div>
    <button type="submit">提交</button>
  </form>
</template>
```

### 3. 表格数据

```vue
<script setup>
import { ref, computed } from 'vue'

const columns = ref([
  { key: 'name', label: '姓名' },
  { key: 'age', label: '年龄' },
  { key: 'email', label: '邮箱' }
])

const data = ref([
  { id: 1, name: 'Alice', age: 25, email: 'alice@example.com' },
  { id: 2, name: 'Bob', age: 30, email: 'bob@example.com' }
])
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in data" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          {{ row[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 4. 标签页

```vue
<script setup>
import { ref } from 'vue'

const tabs = ref([
  { id: 'home', label: '首页', icon: 'home' },
  { id: 'profile', label: '资料', icon: 'user' },
  { id: 'settings', label: '设置', icon: 'settings' }
])

const activeTab = ref('home')
</script>

<template>
  <div class="tabs">
    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <slot :name="activeTab" />
    </div>
  </div>
</template>
```

### 5. 面包屑导航

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  return route.matched.map((record, index) => ({
    path: record.path,
    name: record.name,
    isLast: index === route.matched.length - 1
  }))
})
</script>

<template>
  <nav class="breadcrumb">
    <span v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
      <router-link v-if="!crumb.isLast" :to="crumb.path">
        {{ crumb.name }}
      </router-link>
      <span v-else>{{ crumb.name }}</span>
      <span v-if="index < breadcrumbs.length - 1">/</span>
    </span>
  </nav>
</template>
```

### 6. 评论列表

```vue
<script setup>
import { ref } from 'vue'

const comments = ref([
  {
    id: 1,
    author: 'Alice',
    content: 'First comment',
    replies: [
      { id: 11, author: 'Bob', content: 'Reply to first' }
    ]
  },
  {
    id: 2,
    author: 'Charlie',
    content: 'Second comment',
    replies: []
  }
])
</script>

<template>
  <div class="comments">
    <div v-for="comment in comments" :key="comment.id" class="comment">
      <div class="comment-header">
        <strong>{{ comment.author }}</strong>
      </div>
      <div class="comment-body">{{ comment.content }}</div>

      <!-- 嵌套回复 -->
      <div v-if="comment.replies.length > 0" class="replies">
        <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply"
        >
          <strong>{{ reply.author }}</strong>: {{ reply.content }}
        </div>
      </div>
    </div>
  </div>
</template>
```

### 7. 动态类名列表

```vue
<script setup>
import { ref } from 'vue'

const buttons = ref([
  { type: 'primary', label: '主要按钮' },
  { type: 'success', label: '成功按钮' },
  { type: 'danger', label: '危险按钮' }
])
</script>

<template>
  <div>
    <button
      v-for="btn in buttons"
      :key="btn.type"
      :class="['btn', `btn-${btn.type}`]"
    >
      {{ btn.label }}
    </button>
  </div>
</template>
```

### 8. 图片画廊

```vue
<script setup>
import { ref } from 'vue'

const images = ref([
  { id: 1, url: '/images/1.jpg', title: 'Image 1' },
  { id: 2, url: '/images/2.jpg', title: 'Image 2' },
  { id: 3, url: '/images/3.jpg', title: 'Image 3' }
])
</script>

<template>
  <div class="gallery">
    <figure v-for="image in images" :key="image.id">
      <img :src="image.url" :alt="image.title" loading="lazy" />
      <figcaption>{{ image.title }}</figcaption>
    </figure>
  </div>
</template>
```

### 9. 时间线

```vue
<script setup>
import { ref } from 'vue'

const events = ref([
  {
    id: 1,
    date: '2024-01-01',
    title: '项目启动',
    description: '项目正式启动'
  },
  {
    id: 2,
    date: '2024-02-15',
    title: '第一个里程碑',
    description: '完成第一阶段开发'
  }
])
</script>

<template>
  <div class="timeline">
    <div v-for="event in events" :key="event.id" class="timeline-item">
      <div class="timeline-date">{{ event.date }}</div>
      <div class="timeline-content">
        <h3>{{ event.title }}</h3>
        <p>{{ event.description }}</p>
      </div>
    </div>
  </div>
</template>
```

### 10. 分页数据

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`
})))

const currentPage = ref(1)
const pageSize = 10

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return items.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(items.value.length / pageSize))
</script>

<template>
  <div>
    <ul>
      <li v-for="item in paginatedItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>

    <div class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>
```

## v-for 最佳实践

1. **始终使用 key**：使用唯一且稳定的 key
2. **避免使用索引作为 key**：除非列表是静态的
3. **使用计算属性过滤**：而不是 v-if 和 v-for 混用
4. **大列表考虑虚拟滚动**：提高性能
5. **保持 key 简单**：使用原始值而不是对象
6. **数组更新使用正确方法**：使用 Vue 能检测到的数组方法
