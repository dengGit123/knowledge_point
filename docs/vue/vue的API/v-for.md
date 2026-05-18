# v-for

## 作用
`v-for` 是 Vue 的列表渲染指令，基于数组或对象来渲染列表或重复元素。它需要使用 `key` 来帮助 Vue 跟踪每个节点的身份。

## 用法

### 基本用法 - 数组

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul&gt;
    &lt;li v-for="item in items" :key="item.id"&gt;
      {{ item.name }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 使用索引

```text
`&lt;template&gt;`
  &lt;ul&gt;
    &lt;!-- 语法: (item, index) in items --&gt;
    &lt;li v-for="(item, index) in items" :key="item.id"&gt;
      {{ index + 1 }}. {{ item.name }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 对象遍历

```text
`&lt;script setup&gt;`
import { reactive } from 'vue'

const user = reactive({
  name: 'Vue',
  age: 3,
  role: 'framework'
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;ul&gt;
    &lt;!-- 语法: (value, key, index) in object --&gt;
    &lt;li v-for="(value, key, index) in user" :key="key"&gt;
      {{ index }}. {{ key }}: {{ value }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 数字遍历

```text
`&lt;template&gt;`
  &lt;div&gt;
    &lt;span v-for="n in 10" :key="n"&gt;
      {{ n }}
    &lt;/span&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 字符串遍历

```text
`&lt;script setup&gt;`
const message = 'Hello'
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;span v-for="(char, index) in message" :key="index"&gt;
    {{ char }}
  &lt;/span&gt;
`&lt;/template&gt;`
```

### 嵌套循环

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-for="category in categories" :key="category.name"&gt;
    &lt;h3&gt;{{ category.name }}&lt;/h3&gt;
    &lt;ul&gt;
      &lt;li v-for="(item, index) in category.items" :key="index"&gt;
        {{ item }}
      &lt;/li&gt;
    &lt;/ul&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 在组件上使用

```text
`&lt;script setup&gt;`
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, text: 'Learn Vue', done: false },
  { id: 2, text: 'Build something', done: false }
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;TodoItem
    v-for="todo in todos"
    :key="todo.id"
    :todo="todo"
  /&gt;
`&lt;/template&gt;`
```

### 使用 template

```text
`&lt;template&gt;`
  &lt;!-- 渲染多个元素 --&gt;
  `&lt;template&gt;`
    &lt;div class="header"&gt;{{ item.title }}&lt;/div&gt;
    &lt;div class="content"&gt;{{ item.description }}&lt;/div&gt;
    &lt;div class="footer"&gt;{{ item.footer }}&lt;/div&gt;
  `&lt;/template&gt;`
`&lt;/template&gt;`
```

### 与 v-if 配合

```text
`&lt;template&gt;`
  &lt;!-- Vue 3 中 v-if 优先级更高 --&gt;
  `&lt;template&gt;`
    &lt;li v-if="item.visible"&gt;
      {{ item.name }}
    &lt;/li&gt;
  `&lt;/template&gt;`

  &lt;!-- 或使用计算属性过滤（推荐） --&gt;
  &lt;li v-for="item in visibleItems" :key="item.id"&gt;
    {{ item.name }}
  &lt;/li&gt;
`&lt;/template&gt;`
```

### of 作为分隔符

```text
`&lt;template&gt;`
  &lt;!-- in 和 of 可以互换 --&gt;
  &lt;div v-for="item of items" :key="item.id"&gt;
    {{ item.name }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 注意事项

### 1. 必须使用 key

```text
`&lt;template&gt;`
  &lt;!-- ✅ 正确：使用唯一的 key --&gt;
  &lt;li v-for="item in items" :key="item.id"&gt;
    {{ item.name }}
  &lt;/li&gt;

  &lt;!-- ❌ 错误：不使用 key --&gt;
  &lt;li v-for="item in items"&gt;
    {{ item.name }}
  &lt;/li&gt;

  &lt;!-- ❌ 错误：使用索引作为 key --&gt;
  &lt;li v-for="(item, index) in items" :key="index"&gt;
    {{ item.name }}
  &lt;/li&gt;
`&lt;/template&gt;`
```

### 2. key 的唯一性

```text
`&lt;script setup&gt;`
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 1, name: 'Item 2' } // 重复的 id
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- ❌ key 必须唯一 --&gt;
  &lt;li v-for="item in items" :key="item.id"&gt;
    {{ item.name }}
  &lt;/li&gt;

  &lt;!-- ✅ 使用组合键确保唯一性 --&gt;
  &lt;li v-for="(item, index) in items" :key="`${item.id}-${index}`"&gt;
    {{ item.name }}
  &lt;/li&gt;
`&lt;/template&gt;`
```

### 3. 避免在模板中修改数组

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-for="item in items" :key="item"&gt;
    {{ item }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 响应式更新数组

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`
```

### 5. v-for 和 v-if 的优先级

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1', visible: true },
  { id: 2, name: 'Item 2', visible: false }
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- Vue 3: v-if 优先级更高，只渲染可见项 --&gt;
  &lt;li v-for="item in items" v-if="item.visible" :key="item.id"&gt;
    {{ item.name }}
  &lt;/li&gt;

  &lt;!-- 推荐使用计算属性过滤 --&gt;
  &lt;li v-for="item in visibleItems" :key="item.id"&gt;
    {{ item.name }}
  &lt;/li&gt;
`&lt;/template&gt;`
```

### 6. 大列表性能

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

// 对于大列表，考虑虚拟滚动
const largeList = ref(Array.from({ length: 10000 }, (_, i) =&gt; ({
  id: i,
  name: `Item ${i}`
}))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 使用虚拟滚动组件 --&gt;
  &lt;VirtualScroller :items="largeList" /&gt;
`&lt;/template&gt;`
```

### 7. 在循环中使用 ref

```text
`&lt;script setup&gt;`
import { ref, onMounted } from 'vue'

const items = ref([1, 2, 3])
const itemRefs = ref([])

onMounted(() =&gt; {
  console.log(itemRefs.value) // [div, div, div]
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div
    v-for="(item, index) in items"
    :key="item"
    :ref="(el) =&gt; { if (el) itemRefs[index] = el }"
  &gt;
    {{ item }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 对象遍历的顺序

```text
`&lt;script setup&gt;`
import { reactive } from 'vue'

const obj = reactive({
  c: 3,
  a: 1,
  b: 2
})

// Object.keys() 的顺序不一定
// 在大多数现代浏览器中会按插入顺序
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-for="(value, key) in obj" :key="key"&gt;
    {{ key }}: {{ value }}
  &lt;/div&gt;
`&lt;/template&gt;`
```

## 使用场景

### 1. 列表渲染

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'Product 1', price: 99.99 },
  { id: 2, name: 'Product 2', price: 149.99 },
  { id: 3, name: 'Product 3', price: 199.99 }
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="product-list"&gt;
    &lt;div
      v-for="product in products"
      :key="product.id"
      class="product-card"
    &gt;
      &lt;h3&gt;{{ product.name }}&lt;/h3&gt;
      &lt;p&gt;¥{{ product.price }}&lt;/p&gt;
      &lt;button&gt;Add to Cart&lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 2. 动态表单字段

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const fields = ref([
  { name: 'username', label: '用户名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'email' },
  { name: 'password', label: '密码', type: 'password' }
])

const formData = reactive({})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form&gt;
    &lt;div v-for="field in fields" :key="field.name"&gt;
      &lt;label&gt;{{ field.label }}&lt;/label&gt;
      &lt;input
        :type="field.type"
        v-model="formData[field.name]"
      /&gt;
    &lt;/div&gt;
    &lt;button type="submit"&gt;提交&lt;/button&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 3. 表格数据

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;table&gt;
    &lt;thead&gt;
      &lt;tr&gt;
        &lt;th v-for="col in columns" :key="col.key"&gt;
          {{ col.label }}
        &lt;/th&gt;
      &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
      &lt;tr v-for="row in data" :key="row.id"&gt;
        &lt;td v-for="col in columns" :key="col.key"&gt;
          {{ row[col.key] }}
        &lt;/td&gt;
      &lt;/tr&gt;
    &lt;/tbody&gt;
  &lt;/table&gt;
`&lt;/template&gt;`
```

### 4. 标签页

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const tabs = ref([
  { id: 'home', label: '首页', icon: 'home' },
  { id: 'profile', label: '资料', icon: 'user' },
  { id: 'settings', label: '设置', icon: 'settings' }
])

const activeTab = ref('home')
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="tabs"&gt;
    &lt;div class="tab-nav"&gt;
      &lt;button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      &gt;
        &lt;i :class="tab.icon"&gt;&lt;/i&gt;
        {{ tab.label }}
      &lt;/button&gt;
    &lt;/div&gt;
    &lt;div class="tab-content"&gt;
      &lt;slot :name="activeTab" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 面包屑导航

```text
`&lt;script setup&gt;`
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() =&gt; {
  return route.matched.map((record, index) =&gt; ({
    path: record.path,
    name: record.name,
    isLast: index === route.matched.length - 1
  }))
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;nav class="breadcrumb"&gt;
    &lt;span v-for="(crumb, index) in breadcrumbs" :key="crumb.path"&gt;
      &lt;router-link v-if="!crumb.isLast" :to="crumb.path"&gt;
        {{ crumb.name }}
      &lt;/router-link&gt;
      &lt;span v-else&gt;{{ crumb.name }}&lt;/span&gt;
      &lt;span v-if="index &lt; breadcrumbs.length - 1"&gt;/&lt;/span&gt;
    &lt;/span&gt;
  &lt;/nav&gt;
`&lt;/template&gt;`
```

### 6. 评论列表

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="comments"&gt;
    &lt;div v-for="comment in comments" :key="comment.id" class="comment"&gt;
      &lt;div class="comment-header"&gt;
        &lt;strong&gt;{{ comment.author }}&lt;/strong&gt;
      &lt;/div&gt;
      &lt;div class="comment-body"&gt;{{ comment.content }}&lt;/div&gt;

      &lt;!-- 嵌套回复 --&gt;
      &lt;div v-if="comment.replies.length &gt; 0" class="replies"&gt;
        &lt;div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply"
        &gt;
          &lt;strong&gt;{{ reply.author }}&lt;/strong&gt;: {{ reply.content }}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 动态类名列表

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const buttons = ref([
  { type: 'primary', label: '主要按钮' },
  { type: 'success', label: '成功按钮' },
  { type: 'danger', label: '危险按钮' }
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button
      v-for="btn in buttons"
      :key="btn.type"
      :class="['btn', `btn-${btn.type}`]"
    &gt;
      {{ btn.label }}
    &lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. 图片画廊

```text
`&lt;script setup&gt;`
import { ref } from 'vue'

const images = ref([
  { id: 1, url: '/images/1.jpg', title: 'Image 1' },
  { id: 2, url: '/images/2.jpg', title: 'Image 2' },
  { id: 3, url: '/images/3.jpg', title: 'Image 3' }
])
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="gallery"&gt;
    &lt;figure v-for="image in images" :key="image.id"&gt;
      &lt;img :src="image.url" :alt="image.title" loading="lazy" /&gt;
      &lt;figcaption&gt;{{ image.title }}&lt;/figcaption&gt;
    &lt;/figure&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 9. 时间线

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div class="timeline"&gt;
    &lt;div v-for="event in events" :key="event.id" class="timeline-item"&gt;
      &lt;div class="timeline-date"&gt;{{ event.date }}&lt;/div&gt;
      &lt;div class="timeline-content"&gt;
        &lt;h3&gt;{{ event.title }}&lt;/h3&gt;
        &lt;p&gt;{{ event.description }}&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 10. 分页数据

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 100 }, (_, i) =&gt; ({
  id: i + 1,
  name: `Item ${i + 1}`
})))

const currentPage = ref(1)
const pageSize = 10

const paginatedItems = computed(() =&gt; {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return items.value.slice(start, end)
})

const totalPages = computed(() =&gt; Math.ceil(items.value.length / pageSize))
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;ul&gt;
      &lt;li v-for="item in paginatedItems" :key="item.id"&gt;
        {{ item.name }}
      &lt;/li&gt;
    &lt;/ul&gt;

    &lt;div class="pagination"&gt;
      &lt;button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="{ active: currentPage === page }"
      &gt;
        {{ page }}
      &lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

## v-for 最佳实践

1. **始终使用 key**：使用唯一且稳定的 key
2. **避免使用索引作为 key**：除非列表是静态的
3. **使用计算属性过滤**：而不是 v-if 和 v-for 混用
4. **大列表考虑虚拟滚动**：提高性能
5. **保持 key 简单**：使用原始值而不是对象
6. **数组更新使用正确方法**：使用 Vue 能检测到的数组方法
