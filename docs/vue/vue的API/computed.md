# computed

## 作用
`computed()` 用于创建计算属性，它会基于响应式依赖自动缓存结果。只有当依赖发生变化时才会重新计算，否则返回缓存值。

## 用法

### 基本用法

```text
import { ref, computed } from 'vue'

const count = ref(0)

// 创建计算属性
const doubled = computed(() =&gt; count.value * 2)

console.log(doubled.value) // 0

count.value = 1
console.log(doubled.value) // 2（重新计算）
```

### getter 函数形式（只读）

```text
const firstName = ref('Vue')
const lastName = ref('JS')

const fullName = computed(() =&gt; {
  return firstName.value + ' ' + lastName.value
})

// ❌ 错误：只读计算属性不能赋值
fullName.value = 'New Name'
```

### getter + setter 形式（可写）

```text
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

### 在 `&lt;script setup&gt;` 中使用

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() =&gt; count.value * 2)

function increment() {
  count.value++
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;p&gt;原始值: {{ count }}&lt;/p&gt;
    &lt;p&gt;计算值: {{ doubled }}&lt;/p&gt;
    &lt;button @click="increment"&gt;增加&lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 计算属性 vs 方法

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const count = ref(0)

// ✅ 计算属性：有缓存
const doubled = computed(() =&gt; count.value * 2)

// ❌ 方法：每次调用都执行
function getDoubled() {
  return count.value * 2
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;!-- 多次访问也只计算一次 --&gt;
    &lt;p&gt;{{ doubled }}&lt;/p&gt;
    &lt;p&gt;{{ doubled }}&lt;/p&gt;

    &lt;!-- 每次都重新计算 --&gt;
    &lt;p&gt;{{ getDoubled() }}&lt;/p&gt;
    &lt;p&gt;{{ getDoubled() }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 复杂计算逻辑

```text
const products = ref([
  { name: 'Apple', price: 10, quantity: 2 },
  { name: 'Banana', price: 5, quantity: 5 },
  { name: 'Orange', price: 8, quantity: 3 }
])

const cartSummary = computed(() =&gt; {
  return products.value.reduce((summary, product) =&gt; {
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

```text
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

```text
// ❌ 错误：计算属性中有副作用
const doubled = computed(() =&gt; {
  console.log('计算中...') // 副作用
  count.value++ // 修改依赖 - 不应该这样做
  return count.value * 2
})

// ✅ 正确：纯函数
const doubled = computed(() =&gt; count.value * 2)
```

### 2. 避免在 getter 中修改响应式数据

```text
// ❌ 错误：getter 中修改数据
const invalid = computed(() =&gt; {
  count.value++ // 不要这样做
  return count.value
})

// ✅ 正确：使用 watch
watch(() =&gt; {
  count.value++
  return someValue
}, (newVal) =&gt; {
  // 处理逻辑
})
```

### 3. 计算属性会自动缓存

```text
const count = ref(0)
const doubled = computed(() =&gt; {
  console.log('计算执行') // 只在 count 变化时执行
  return count.value * 2
})

console.log(doubled.value) // "计算执行" 输出
console.log(doubled.value) // 无输出（使用缓存）
count.value = 1
console.log(doubled.value) // "计算执行" 输出
```

### 4. 可写计算属性的限制

```text
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

```text
// computed：适用于派生状态
const fullName = computed(() =&gt; firstName.value + ' ' + lastName.value)

// watch：适用于副作用
watch(fullName, (newName) =&gt; {
  console.log('名字变更为:', newName)
})
```

### 6. TypeScript 类型支持

```text
import { Ref, ComputedRef } from 'vue'

const count: Ref&lt;number&gt; = ref(0)
const doubled: ComputedRef&lt;number&gt; = computed(() =&gt; count.value * 2)

// 可写计算属性
const fullName = computed&lt;string&gt;({
  get: () =&gt; firstName.value + ' ' + lastName.value,
  set: (val: string) =&gt; {
    // ...
  }
})
```

### 7. 调试计算属性

```text
const doubled = computed(() =&gt; count.value * 2)

// 在开发环境中可以添加调试
console.log('doubled:', doubled.value)

// 使用 watch 监听变化
watch(doubled, (newVal, oldVal) =&gt; {
  console.log('doubled 变化:', { old: oldVal, new: newVal })
})
```

### 8. 计算属性返回值类型

```text
// ✅ 返回基本类型
const count = computed(() =&gt; list.value.length)

// ✅ 返回对象
const summary = computed(() =&gt; ({
  total: items.value.reduce((sum, item) =&gt; sum + item.price, 0),
  count: items.value.length
}))

// ✅ 返回数组
const filteredList = computed(() =&gt; items.value.filter(item =&gt; item.active))

// ⚠️ 返回 null/undefined
const maybeValue = computed(() =&gt; condition.value ? value.value : null)
```

## 使用场景

### 1. 数据派生和转换

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const users = ref([
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
])

// 获取所有用户名
const userNames = computed(() =&gt; users.value.map(u =&gt; u.name))

// 获取成年人
const adults = computed(() =&gt; users.value.filter(u =&gt; u.age &gt;= 18))

// 按年龄排序
const sortedByAge = computed(() =&gt;
  [...users.value].sort((a, b) =&gt; a.age - b.age)
)
`&lt;/script&gt;`
```

### 2. 表单验证

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')

const errors = computed(() =&gt; {
  const errs = {}

  if (username.value.length &lt; 3) {
    errs.username = '用户名至少3个字符'
  }

  if (!email.value.includes('@')) {
    errs.email = '请输入有效的邮箱'
  }

  if (password.value.length &lt; 6) {
    errs.password = '密码至少6个字符'
  }

  return errs
})

const isValid = computed(() =&gt; Object.keys(errors.value).length === 0)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;form&gt;
    &lt;input v-model="username" /&gt;
    &lt;span class="error"&gt;{{ errors.username }}&lt;/span&gt;

    &lt;input v-model="email" /&gt;
    &lt;span class="error"&gt;{{ errors.email }}&lt;/span&gt;

    &lt;button :disabled="!isValid"&gt;提交&lt;/button&gt;
  &lt;/form&gt;
`&lt;/template&gt;`
```

### 3. 过滤和搜索

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const searchQuery = ref('')
const items = ref([
  { id: 1, name: 'Apple', category: 'fruit' },
  { id: 2, name: 'Carrot', category: 'vegetable' },
  { id: 3, name: 'Banana', category: 'fruit' }
])

const filteredItems = computed(() =&gt; {
  if (!searchQuery.value) return items.value

  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item =&gt;
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="searchQuery" placeholder="搜索..." /&gt;
  &lt;ul&gt;
    &lt;li v-for="item in filteredItems" :key="item.id"&gt;
      {{ item.name }} ({{ item.category }})
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 4. 列表分页

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 100 }, (_, i) =&gt; ({
  id: i + 1,
  name: `Item ${i + 1}`
})))

const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() =&gt;
  Math.ceil(items.value.length / pageSize.value)
)

const paginatedItems = computed(() =&gt; {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return items.value.slice(start, end)
})

function nextPage() {
  if (currentPage.value &lt; totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value &gt; 1) {
    currentPage.value--
  }
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;ul&gt;
      &lt;li v-for="item in paginatedItems" :key="item.id"&gt;
        {{ item.name }}
      &lt;/li&gt;
    &lt;/ul&gt;
    &lt;button @click="prevPage" :disabled="currentPage === 1"&gt;上一页&lt;/button&gt;
    &lt;span&gt;第 {{ currentPage }} / {{ totalPages }} 页&lt;/span&gt;
    &lt;button @click="nextPage" :disabled="currentPage === totalPages"&gt;下一页&lt;/button&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 5. 购物车计算

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const cart = ref([
  { id: 1, name: 'Laptop', price: 999, quantity: 1 },
  { id: 2, name: 'Mouse', price: 29, quantity: 2 },
  { id: 3, name: 'Keyboard', price: 79, quantity: 1 }
])

const discount = ref(0) // 折扣百分比

const subtotal = computed(() =&gt;
  cart.value.reduce((sum, item) =&gt; sum + item.price * item.quantity, 0)
)

const discountAmount = computed(() =&gt;
  subtotal.value * (discount.value / 100)
)

const total = computed(() =&gt;
  subtotal.value - discountAmount.value
)

const itemCount = computed(() =&gt;
  cart.value.reduce((sum, item) =&gt; sum + item.quantity, 0)
)

function updateQuantity(id, quantity) {
  const item = cart.value.find(i =&gt; i.id === id)
  if (item) item.quantity = Math.max(0, quantity)
}

function removeItem(id) {
  cart.value = cart.value.filter(item =&gt; item.id !== id)
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;h2&gt;购物车 ({{ itemCount }} 件商品)&lt;/h2&gt;

    &lt;div v-for="item in cart" :key="item.id"&gt;
      &lt;h3&gt;{{ item.name }}&lt;/h3&gt;
      &lt;p&gt;单价: ¥{{ item.price }}&lt;/p&gt;
      &lt;input
        type="number"
        :value="item.quantity"
        @input="updateQuantity(item.id, Number($event.target.value))"
        min="0"
      /&gt;
      &lt;button @click="removeItem(item.id)"&gt;删除&lt;/button&gt;
    &lt;/div&gt;

    &lt;div class="summary"&gt;
      &lt;p&gt;小计: ¥{{ subtotal }}&lt;/p&gt;
      &lt;p&gt;折扣: -¥{{ discountAmount }}&lt;/p&gt;
      &lt;h3&gt;总计: ¥{{ total }}&lt;/h3&gt;
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 6. 样式类名计算

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const isActive = ref(true)
const isLoading = ref(false)
const hasError = ref(false)

const buttonClasses = computed(() =&gt; ({
  'btn': true,
  'btn-active': isActive.value,
  'btn-loading': isLoading.value,
  'btn-error': hasError.value
}))

const buttonClassString = computed(() =&gt; {
  return [
    'btn',
    isActive.value && 'btn-active',
    isLoading.value && 'btn-loading',
    hasError.value && 'btn-error'
  ].filter(Boolean).join(' ')
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;!-- 对象语法 --&gt;
  &lt;button :class="buttonClasses"&gt;按钮&lt;/button&gt;

  &lt;!-- 数组语法 --&gt;
  &lt;button :class="[
    'btn',
    { 'btn-active': isActive, 'btn-loading': isLoading }
  ]"&gt;
    按钮
  &lt;/button&gt;
`&lt;/template&gt;`
```

### 7. 数据格式化

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const price = ref(1234.567)

const formattedPrice = computed(() =&gt; {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(price.value)
})

const date = ref('2024-01-15')

const formattedDate = computed(() =&gt; {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date.value))
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;p&gt;价格: {{ formattedPrice }}&lt;/p&gt;
  &lt;p&gt;日期: {{ formattedDate }}&lt;/p&gt;
`&lt;/template&gt;`
```

### 8. 权限检查

```text
`&lt;script setup&gt;`
import { ref, computed } from 'vue'

const user = ref({
  name: 'Alice',
  role: 'editor',
  permissions: ['read', 'write']
})

const isAdmin = computed(() =&gt; user.value.role === 'admin')

const canEdit = computed(() =&gt;
  user.value.permissions.includes('write')
)

const canDelete = computed(() =&gt;
  user.value.role === 'admin' ||
  user.value.permissions.includes('delete')
)

const availableActions = computed(() =&gt; {
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div&gt;
    &lt;button v-if="canEdit"&gt;编辑&lt;/button&gt;
    &lt;button v-if="canDelete"&gt;删除&lt;/button&gt;

    &lt;div v-for="action in availableActions" :key="action"&gt;
      {{ action }}
    &lt;/div&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 9. 双向绑定的可写计算属性

```text
`&lt;script setup&gt;`
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
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="fullName" placeholder="全名" /&gt;
  &lt;p&gt;名: {{ firstName }}&lt;/p&gt;
  &lt;p&gt;姓: {{ lastName }}&lt;/p&gt;

  &lt;input v-model="celsius" type="number" /&gt; 摄氏度
  &lt;input v-model="fahrenheit" type="number" /&gt; 华氏度
`&lt;/template&gt;`
```

### 10. 性能优化：缓存昂贵计算

```text
import { ref, computed } from 'vue'

const items = ref(/* 大量数据 */)

// ❌ 每次都重新计算（如果在方法中）
function getProcessedItems() {
  return items.value
    .filter(item =&gt; item.active)
    .map(item =&gt; ({ ...item, processed: true }))
    .sort((a, b) =&gt; a.order - b.order)
}

// ✅ 使用计算属性缓存结果
const processedItems = computed(() =&gt; {
  return items.value
    .filter(item =&gt; item.active)
    .map(item =&gt; ({ ...item, processed: true }))
    .sort((a, b) =&gt; a.order - b.order)
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
