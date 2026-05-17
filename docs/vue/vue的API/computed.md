# computed

## 作用
`computed()` 用于创建计算属性，它会基于响应式依赖自动缓存结果。只有当依赖发生变化时才会重新计算，否则返回缓存值。

## 用法

### 基本用法

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// 创建计算属性
const doubled = computed(() => count.value * 2)

console.log(doubled.value) // 0

count.value = 1
console.log(doubled.value) // 2（重新计算）
```

### getter 函数形式（只读）

```javascript
const firstName = ref('Vue')
const lastName = ref('JS')

const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})

// ❌ 错误：只读计算属性不能赋值
fullName.value = 'New Name'
```

### getter + setter 形式（可写）

```javascript
const firstName = ref('Vue')
const lastName = ref('JS')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

console.log(fullName.value) // 'Vue JS'

fullName.value = 'React Native'
console.log(firstName.value) // 'React'
console.log(lastName.value) // 'Native'
```

### 在 <script setup> 中使用

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>原始值: {{ count }}</p>
    <p>计算值: {{ doubled }}</p>
    <button @click="increment">增加</button>
  </div>
</template>
```

### 计算属性 vs 方法

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// ✅ 计算属性：有缓存
const doubled = computed(() => count.value * 2)

// ❌ 方法：每次调用都执行
function getDoubled() {
  return count.value * 2
}
</script>

<template>
  <div>
    <!-- 多次访问也只计算一次 -->
    <p>{{ doubled }}</p>
    <p>{{ doubled }}</p>

    <!-- 每次都重新计算 -->
    <p>{{ getDoubled() }}</p>
    <p>{{ getDoubled() }}</p>
  </div>
</template>
```

### 复杂计算逻辑

```javascript
const products = ref([
  { name: 'Apple', price: 10, quantity: 2 },
  { name: 'Banana', price: 5, quantity: 5 },
  { name: 'Orange', price: 8, quantity: 3 }
])

const cartSummary = computed(() => {
  return products.value.reduce((summary, product) => {
    summary.totalItems += product.quantity
    summary.totalPrice += product.price * product.quantity
    return summary
  }, {
    totalItems: 0,
    totalPrice: 0
  })
})
```

### 选项式 API 中使用

```javascript
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubled() {
      return this.count * 2
    },
    // 可写计算属性
    fullName: {
      get() {
        return this.firstName + ' ' + this.lastName
      },
      set(value) {
        [this.firstName, this.lastName] = value.split(' ')
      }
    }
  }
}
```

## 注意事项

### 1. 计算属性不应该有副作用

```javascript
// ❌ 错误：计算属性中有副作用
const doubled = computed(() => {
  console.log('计算中...') // 副作用
  count.value++ // 修改依赖 - 不应该这样做
  return count.value * 2
})

// ✅ 正确：纯函数
const doubled = computed(() => count.value * 2)
```

### 2. 避免在 getter 中修改响应式数据

```javascript
// ❌ 错误：getter 中修改数据
const invalid = computed(() => {
  count.value++ // 不要这样做
  return count.value
})

// ✅ 正确：使用 watch
watch(() => {
  count.value++
  return someValue
}, (newVal) => {
  // 处理逻辑
})
```

### 3. 计算属性会自动缓存

```javascript
const count = ref(0)
const doubled = computed(() => {
  console.log('计算执行') // 只在 count 变化时执行
  return count.value * 2
})

console.log(doubled.value) // "计算执行" 输出
console.log(doubled.value) // 无输出（使用缓存）
count.value = 1
console.log(doubled.value) // "计算执行" 输出
```

### 4. 可写计算属性的限制

```javascript
const count = ref(0)

// ⚠️ 可写计算属性的 setter 不应该直接修改自己
const weird = computed({
  get() {
    return count.value
  },
  set(newValue) {
    weird.value = newValue // ❌ 无限循环
  }
})

// ✅ 正确：修改其他响应式数据
const valid = computed({
  get() {
    return count.value
  },
  set(newValue) {
    count.value = newValue // ✅ 修改依赖
  }
})
```

### 5. 计算属性 vs watch

```javascript
// computed：适用于派生状态
const fullName = computed(() => firstName.value + ' ' + lastName.value)

// watch：适用于副作用
watch(fullName, (newName) => {
  console.log('名字变更为:', newName)
})
```

### 6. TypeScript 类型支持

```typescript
import { Ref, ComputedRef } from 'vue'

const count: Ref<number> = ref(0)
const doubled: ComputedRef<number> = computed(() => count.value * 2)

// 可写计算属性
const fullName = computed<string>({
  get: () => firstName.value + ' ' + lastName.value,
  set: (val: string) => {
    // ...
  }
})
```

### 7. 调试计算属性

```javascript
const doubled = computed(() => count.value * 2)

// 在开发环境中可以添加调试
console.log('doubled:', doubled.value)

// 使用 watch 监听变化
watch(doubled, (newVal, oldVal) => {
  console.log('doubled 变化:', { old: oldVal, new: newVal })
})
```

### 8. 计算属性返回值类型

```javascript
// ✅ 返回基本类型
const count = computed(() => list.value.length)

// ✅ 返回对象
const summary = computed(() => ({
  total: items.value.reduce((sum, item) => sum + item.price, 0),
  count: items.value.length
}))

// ✅ 返回数组
const filteredList = computed(() => items.value.filter(item => item.active))

// ⚠️ 返回 null/undefined
const maybeValue = computed(() => condition.value ? value.value : null)
```

## 使用场景

### 1. 数据派生和转换

```vue
<script setup>
import { ref, computed } from 'vue'

const users = ref([
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
])

// 获取所有用户名
const userNames = computed(() => users.value.map(u => u.name))

// 获取成年人
const adults = computed(() => users.value.filter(u => u.age >= 18))

// 按年龄排序
const sortedByAge = computed(() =>
  [...users.value].sort((a, b) => a.age - b.age)
)
</script>
```

### 2. 表单验证

```vue
<script setup>
import { ref, computed } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')

const errors = computed(() => {
  const errs = {}

  if (username.value.length < 3) {
    errs.username = '用户名至少3个字符'
  }

  if (!email.value.includes('@')) {
    errs.email = '请输入有效的邮箱'
  }

  if (password.value.length < 6) {
    errs.password = '密码至少6个字符'
  }

  return errs
})

const isValid = computed(() => Object.keys(errors.value).length === 0)
</script>

<template>
  <form>
    <input v-model="username" />
    <span class="error">{{ errors.username }}</span>

    <input v-model="email" />
    <span class="error">{{ errors.email }}</span>

    <button :disabled="!isValid">提交</button>
  </form>
</template>
```

### 3. 过滤和搜索

```vue
<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const items = ref([
  { id: 1, name: 'Apple', category: 'fruit' },
  { id: 2, name: 'Carrot', category: 'vegetable' },
  { id: 3, name: 'Banana', category: 'fruit' }
])

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value

  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
})
</script>

<template>
  <input v-model="searchQuery" placeholder="搜索..." />
  <ul>
    <li v-for="item in filteredItems" :key="item.id">
      {{ item.name }} ({{ item.category }})
    </li>
  </ul>
</template>
```

### 4. 列表分页

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`
})))

const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() =>
  Math.ceil(items.value.length / pageSize.value)
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return items.value.slice(start, end)
})

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
</script>

<template>
  <div>
    <ul>
      <li v-for="item in paginatedItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
    <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
    <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
    <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
  </div>
</template>
```

### 5. 购物车计算

```vue
<script setup>
import { ref, computed } from 'vue'

const cart = ref([
  { id: 1, name: 'Laptop', price: 999, quantity: 1 },
  { id: 2, name: 'Mouse', price: 29, quantity: 2 },
  { id: 3, name: 'Keyboard', price: 79, quantity: 1 }
])

const discount = ref(0) // 折扣百分比

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const discountAmount = computed(() =>
  subtotal.value * (discount.value / 100)
)

const total = computed(() =>
  subtotal.value - discountAmount.value
)

const itemCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
)

function updateQuantity(id, quantity) {
  const item = cart.value.find(i => i.id === id)
  if (item) item.quantity = Math.max(0, quantity)
}

function removeItem(id) {
  cart.value = cart.value.filter(item => item.id !== id)
}
</script>

<template>
  <div>
    <h2>购物车 ({{ itemCount }} 件商品)</h2>

    <div v-for="item in cart" :key="item.id">
      <h3>{{ item.name }}</h3>
      <p>单价: ¥{{ item.price }}</p>
      <input
        type="number"
        :value="item.quantity"
        @input="updateQuantity(item.id, Number($event.target.value))"
        min="0"
      />
      <button @click="removeItem(item.id)">删除</button>
    </div>

    <div class="summary">
      <p>小计: ¥{{ subtotal }}</p>
      <p>折扣: -¥{{ discountAmount }}</p>
      <h3>总计: ¥{{ total }}</h3>
    </div>
  </div>
</template>
```

### 6. 样式类名计算

```vue
<script setup>
import { ref, computed } from 'vue'

const isActive = ref(true)
const isLoading = ref(false)
const hasError = ref(false)

const buttonClasses = computed(() => ({
  'btn': true,
  'btn-active': isActive.value,
  'btn-loading': isLoading.value,
  'btn-error': hasError.value
}))

const buttonClassString = computed(() => {
  return [
    'btn',
    isActive.value && 'btn-active',
    isLoading.value && 'btn-loading',
    hasError.value && 'btn-error'
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <!-- 对象语法 -->
  <button :class="buttonClasses">按钮</button>

  <!-- 数组语法 -->
  <button :class="[
    'btn',
    { 'btn-active': isActive, 'btn-loading': isLoading }
  ]">
    按钮
  </button>
</template>
```

### 7. 数据格式化

```vue
<script setup>
import { ref, computed } from 'vue'

const price = ref(1234.567)

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(price.value)
})

const date = ref('2024-01-15')

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date.value))
})
</script>

<template>
  <p>价格: {{ formattedPrice }}</p>
  <p>日期: {{ formattedDate }}</p>
</template>
```

### 8. 权限检查

```vue
<script setup>
import { ref, computed } from 'vue'

const user = ref({
  name: 'Alice',
  role: 'editor',
  permissions: ['read', 'write']
})

const isAdmin = computed(() => user.value.role === 'admin')

const canEdit = computed(() =>
  user.value.permissions.includes('write')
)

const canDelete = computed(() =>
  user.value.role === 'admin' ||
  user.value.permissions.includes('delete')
)

const availableActions = computed(() => {
  const actions = []

  if (user.value.permissions.includes('read')) {
    actions.push('view')
  }

  if (user.value.permissions.includes('write')) {
    actions.push('edit')
  }

  if (canDelete.value) {
    actions.push('delete')
  }

  return actions
})
</script>

<template>
  <div>
    <button v-if="canEdit">编辑</button>
    <button v-if="canDelete">删除</button>

    <div v-for="action in availableActions" :key="action">
      {{ action }}
    </div>
  </div>
</template>
```

### 9. 双向绑定的可写计算属性

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('')
const lastName = ref('')

const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`.trim()
  },
  set(value) {
    const parts = value.split(' ')
    firstName.value = parts[0] || ''
    lastName.value = parts.slice(1).join(' ') || ''
  }
})

// 单位转换
const celsius = ref(0)

const fahrenheit = computed({
  get() {
    return (celsius.value * 9/5) + 32
  },
  set(value) {
    celsius.value = (value - 32) * 5/9
  }
})
</script>

<template>
  <input v-model="fullName" placeholder="全名" />
  <p>名: {{ firstName }}</p>
  <p>姓: {{ lastName }}</p>

  <input v-model="celsius" type="number" /> 摄氏度
  <input v-model="fahrenheit" type="number" /> 华氏度
</template>
```

### 10. 性能优化：缓存昂贵计算

```javascript
import { ref, computed } from 'vue'

const items = ref(/* 大量数据 */)

// ❌ 每次都重新计算（如果在方法中）
function getProcessedItems() {
  return items.value
    .filter(item => item.active)
    .map(item => ({ ...item, processed: true }))
    .sort((a, b) => a.order - b.order)
}

// ✅ 使用计算属性缓存结果
const processedItems = computed(() => {
  return items.value
    .filter(item => item.active)
    .map(item => ({ ...item, processed: true }))
    .sort((a, b) => a.order - b.order)
})
```

## computed vs watch 区别

| 特性 | computed | watch |
|-----|----------|-------|
| 用途 | 派生值 | 副作用 |
| 返回值 | 必须有返回值 | 无返回值 |
| 缓存 | 自动缓存 | 不缓存 |
| 使用场景 | 数据转换、格式化 | 异步操作、DOM操作 |
| 可写性 | 默认只读，可设为可写 | 不适用 |

## 最佳实践

1. **优先使用 computed**：用于数据派生和转换
2. **避免副作用**：computed 中不应有副作用
3. **合理使用 watch**：需要执行副作用时使用 watch
4. **复杂逻辑拆分**：将复杂计算拆分成多个简单的 computed
5. **类型明确**：TypeScript 中明确指定类型
