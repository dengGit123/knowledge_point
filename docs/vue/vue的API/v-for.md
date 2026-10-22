# v-for

## 作用

`v-for` 是 Vue 的列表渲染指令，基于数组或对象来渲染列表或重复元素。官方推荐在任何可行的时候为 `v-for` 提供一个 `key`，帮助 Vue 跟踪每个节点的身份。

📖 [官方文档：v-for](https://cn.vuejs.org/api/built-in-directives#v-for)

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

### 1. 为 v-for 提供 key

```vue
<template>
  <!-- ✅ 推荐：使用唯一且稳定的 key（如数据自带的 id） -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

> ⚠️ **注意：** 不写 `key` 时 Vue 会采用「就地更新」策略：数据顺序变化时不移动 DOM 元素，而是就地复用并更新内容，可能导致输入框等带有内部状态的元素错位。使用索引作为 `key` 在列表发生插入、删除、排序时也会出现同样的问题；只有列表完全静态、不会重排时才可以接受。另外 key 必须是字符串或数字等原始值，不要用对象作为 key。

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

模板表达式应当只负责读取，把修改数组的逻辑放到事件处理函数中，并使用数组方法来操作：

```vue
<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3])

// ✅ 在事件处理函数中用数组方法修改
function addItem() {
  items.value.push(4)
}
</script>

<template>
  <button @click="addItem">添加一项</button>

  <!-- 模板中只负责展示 -->
  <div v-for="item in items" :key="item">
    {{ item }}
  </div>
</template>
```

### 4. 响应式更新数组

Vue 3 的响应式系统基于 Proxy，**直接通过索引赋值、修改 `length` 也能被检测到**：

```vue
<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3])

// ✅ Vue 3 中这些都是响应式的
items.value[0] = 99     // 触发更新
items.value.length = 2  // 触发更新
items.value.push(4)     // 触发更新
items.value.sort()      // 触发更新
</script>
```

> ⚠️ **注意：** 「索引赋值不会触发更新，要改用 `splice` 或 `Vue.set`」是 Vue 2 的限制（`Object.defineProperty` 无法侦测索引变化），Vue 3 中已不存在。另外，用 `filter`、`map`、`slice` 等方法生成新数组后整体替换（如 `items.value = items.value.filter(...)`）语义更清晰，也是官方推荐的方式。

### 5. v-for 和 v-if 的优先级

Vue 3 中，当 `v-if` 和 `v-for` 同时存在于一个元素上时，**`v-if` 会首先执行**（Vue 2 相反，`v-for` 优先级更高）。因此 `v-if` 的条件无法访问 `v-for` 作用域内的变量：

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1', visible: true },
  { id: 2, name: 'Item 2', visible: false }
])

const visibleItems = computed(() => items.value.filter(item => item.visible))
</script>

<template>
  <!-- ❌ Vue 3 中会报错：v-if 先执行，此时 item 还不存在 -->
  <li v-for="item in items" v-if="item.visible" :key="item.id">
    {{ item.name }}
  </li>

  <!-- ✅ 用 template 包裹 v-for，把 v-if 放在内层元素上 -->
  <template v-for="item in items" :key="item.id">
    <li v-if="item.visible">{{ item.name }}</li>
  </template>

  <!-- ✅ 过滤场景推荐直接用计算属性 -->
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
})))
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

官方文档明确：遍历对象时，**顺序会基于对该对象调用 `Object.values()` 的返回值来决定**。即整数类键（如 `0`、`1`）按数值升序排在前面，其余字符串键按插入顺序排列：

```vue
<script setup>
import { reactive } from 'vue'

const obj = reactive({
  c: 3,
  a: 1,
  b: 2
})

// Object.keys(obj) → ['c', 'a', 'b']，v-for 按此顺序遍历
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
import { ref, reactive } from 'vue'

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

1. **尽可能提供 key**：使用唯一且稳定的 key（如数据自带的 id）
2. **谨慎使用索引作为 key**：仅当列表不会重排时才可接受
3. **使用计算属性过滤**：而不是 v-if 和 v-for 混用
4. **大列表考虑虚拟滚动**：提高性能
5. **保持 key 简单**：使用原始值而不是对象
6. **合理更新数组**：Vue 3 中索引赋值也能触发更新；用 `filter`/`map` 生成新数组整体替换往往更清晰
