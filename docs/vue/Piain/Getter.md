### 一、概述

Getter 是 Pinia Store 中的**计算属性**，相当于 Vue 组件中的 `computed`。它基于 State（或其他 Getter）**派生**出新的数据，并且会**自动缓存**——只有当依赖的 State 发生变化时才会重新计算。

简单理解：**Getter 是从仓库数据中"计算"出来的衍生数据，用的时候自动算，不变就不重算。**

> 📖 [Pinia 官方文档 - Getters](https://pinia.vuejs.org/zh/core-concepts/getters.html)

### 二、定义 Getter

#### 1. 选项式 Store 中定义

```js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [
      { id: 1, name: 'Laptop', price: 999, quantity: 2 },
      { id: 2, name: 'Mouse', price: 29, quantity: 1 },
    ],
    discount: 0.1, // 10% 折扣
  }),

  getters: {
    // 基本形式：接收 state 参数
    itemCount: (state) => state.items.length,

    // 返回一个函数（支持传参的 getter）
    getItemById: (state) => {
      return (id) => state.items.find((item) => item.id === id)
    },

    // 通过 this 访问其他 getter（注意：不能用箭头函数）
    subtotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },

    // 通过 this 访问另一个 getter
    totalPrice() {
      return this.subtotal * (1 - this.discount)
    },
  },
})
```

#### 2. Setup Store 中定义

使用 `computed` 定义：

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref([
    { id: 1, name: 'Laptop', price: 999, quantity: 2 },
    { id: 2, name: 'Mouse', price: 29, quantity: 1 },
  ])
  const discount = ref(0.1)

  // getter：基本用法
  const itemCount = computed(() => items.value.length)

  // getter：复杂计算
  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  // getter：依赖其他 getter
  const totalPrice = computed(() => subtotal.value * (1 - discount.value))

  // getter：返回函数（支持传参）
  const getItemById = computed(() => {
    return (id) => items.value.find((item) => item.id === id)
  })

  return { items, discount, itemCount, subtotal, totalPrice, getItemById }
})
```

> 💡 **提示：** Setup Store 中定义 Getter 就是写 `computed`，完全遵循 Vue 3 组合式 API 的写法。

### 三、Getter 的核心特性

#### 1. 自动缓存

Getter 只在依赖变化时重新计算，多次访问返回缓存值：

```js
const cartStore = useCartStore()

console.log(cartStore.totalPrice) // 计算 → 1836.1
console.log(cartStore.totalPrice) // 缓存 → 1836.1（不重新计算）
console.log(cartStore.totalPrice) // 缓存 → 1836.1（不重新计算）

// 修改 state → getter 自动重新计算
cartStore.items.push({ id: 3, name: 'Keyboard', price: 79, quantity: 1 })
console.log(cartStore.totalPrice) // 重新计算 → 1907.2
```

#### 2. 只读

Getter 默认是**只读**的，不能直接赋值：

```js
const cartStore = useCartStore()

// ❌ 不能修改 getter
cartStore.totalPrice = 100 // 警告：Readonly
```

#### 3. 响应式

Getter 会自动追踪依赖，依赖变化时自动更新：

```vue
<script setup>
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
</script>

<template>
  <!-- getter 会自动响应 state 的变化 -->
  <p>商品数：{{ cartStore.itemCount }}</p>
  <p>小计：{{ cartStore.subtotal }}</p>
  <p>总价：{{ cartStore.totalPrice }}</p>
</template>
```

### 四、Getter 的各种用法

#### 1. 基本计算

```js
// 数组过滤
const activeUsers = computed(() =>
  users.value.filter((u) => u.isActive)
)

// 数量统计
const totalCount = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity, 0)
)

// 条件判断
const isEmpty = computed(() => items.value.length === 0)

// 字符串处理
const displayName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}` : '未登录'
)
```

#### 2. 依赖其他 Getter

```js
const items = ref([...])
const discount = ref(0.1)

// getter A
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// getter B 依赖 getter A
const totalPrice = computed(() => subtotal.value * (1 - discount.value))

// getter C 依赖 getter B
const formattedTotal = computed(() =>
  new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(totalPrice.value)
)
```

#### 3. 返回函数（支持传参）

有时需要根据参数动态获取数据。Getter 本身不接受参数，但可以**返回一个函数**：

```js
// 返回一个查找函数
const getItemById = computed(() => {
  return (id) => items.value.find((item) => item.id === id)
})

// 使用
const item = cartStore.getItemById(1) // { id: 1, name: 'Laptop', ... }
```

```js
// 返回过滤函数
const filterByCategory = computed(() => {
  return (category) => items.value.filter((item) => item.category === category)
})

// 使用
const fruits = cartStore.filterByCategory('fruit')
const vegetables = cartStore.filterByCategory('vegetable')
```

> ⚠️ **注意：** 返回函数的 Getter **不会缓存结果**。每次调用函数时都会重新计算。因为 Getter 缓存的是"函数本身"，而不是"函数调用的结果"。

```js
// 这个 getter 的缓存是指：返回的函数引用不变
// 但每次调用 getItemById(1) 都会执行 find
const getItemById = computed(() => (id) => items.value.find(...))

// 如果需要缓存参数化结果，应该用 Map 或其他方式手动管理
```

#### 4. 访问其他 Store 的 Getter

```js
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // 在 getter 中访问其他 store
  const canCheckout = computed(() => {
    const userStore = useUserStore() // 在 computed 回调内调用
    return userStore.isLoggedIn && items.value.length > 0
  })

  return { items, canCheckout }
})
```

### 五、在组件中使用 Getter

#### 1. 直接访问

```vue
<script setup>
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
</script>

<template>
  <p>商品数：{{ cartStore.itemCount }}</p>
  <p>总价：{{ cartStore.totalPrice }}</p>
</template>
```

#### 2. 解构访问（storeToRefs）

```vue
<script setup>
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
// getter 和 state 一样，需要 storeToRefs 保持响应式
const { itemCount, totalPrice, subtotal } = storeToRefs(cartStore)
</script>

<template>
  <p>商品数：{{ itemCount }}</p>
  <p>总价：{{ totalPrice }}</p>
</template>
```

#### 3. 在 computed 中包装

```vue
<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

// 在组件的 computed 中进一步处理 store getter
const displayPrice = computed(() =>
  `¥${cartStore.totalPrice.toFixed(2)}`
)

const cartStatus = computed(() =>
  cartStore.isEmpty ? '购物车是空的' : `共 ${cartStore.itemCount} 件商品`
)
</script>
```

### 六、选项式 Store 中 Getter 的 this 指向

在选项式 Store 中，Getter 使用普通函数时，`this` 指向 Store 实例：

```js
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    discount: 0.1,
  }),

  getters: {
    // 箭头函数：只能通过 state 参数访问 state，无法访问其他 getter
    itemCount: (state) => state.items.length,

    // ❌ 箭头函数中没有 this，无法访问其他 getter
    // totalPrice: (state) => this.subtotal * (1 - state.discount) // 报错！

    // ✅ 普通函数：可以通过 this 访问 state 和其他 getter
    subtotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },

    totalPrice() {
      // this.subtotal 访问上面定义的 getter
      return this.subtotal * (1 - this.discount)
    },
  },
})
```

| 函数形式 | 能否访问 State | 能否访问其他 Getter | 适用场景 |
| :--: | :--: | :--: | :--: |
| 箭头函数 `(state) =>` | ✅ 通过参数 | ❌ | 简单的、不依赖其他 getter 的场景 |
| 普通函数 `fn()` | ✅ 通过 `this` | ✅ 通过 `this` | 需要访问其他 getter 的场景 |

### 七、常见应用场景

#### 1. 列表过滤与搜索

```js
export const useProductStore = defineStore('product', () => {
  const products = ref([...])
  const searchQuery = ref('')
  const selectedCategory = ref('all')

  // 按关键词搜索
  const searchResults = computed(() => {
    if (!searchQuery.value) return products.value
    const query = searchQuery.value.toLowerCase()
    return products.value.filter((p) =>
      p.name.toLowerCase().includes(query)
    )
  })

  // 按分类过滤
  const filteredProducts = computed(() => {
    if (selectedCategory.value === 'all') return searchResults.value
    return searchResults.value.filter(
      (p) => p.category === selectedCategory.value
    )
  })

  // 分类列表
  const categories = computed(() => {
    const cats = new Set(products.value.map((p) => p.category))
    return ['all', ...cats]
  })

  return { products, searchQuery, selectedCategory, searchResults, filteredProducts, categories }
})
```

#### 2. 表单验证

```js
export const useFormStore = defineStore('form', () => {
  const username = ref('')
  const email = ref('')
  const password = ref('')

  const errors = computed(() => {
    const errs = {}
    if (username.value.length < 3) errs.username = '用户名至少 3 个字符'
    if (!email.value.includes('@')) errs.email = '邮箱格式不正确'
    if (password.value.length < 6) errs.password = '密码至少 6 个字符'
    return errs
  })

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  return { username, email, password, errors, isValid }
})
```

#### 3. 权限判断

```js
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const permissions = ref([])

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const hasPermission = computed(() => {
    return (permission) => permissions.value.includes(permission)
  })

  const canEdit = computed(() =>
    isAdmin.value || permissions.value.includes('write')
  )

  const canDelete = computed(() =>
    isAdmin.value || permissions.value.includes('delete')
  )

  return { user, permissions, isLoggedIn, isAdmin, hasPermission, canEdit, canDelete }
})
```

### 八、常见问题与注意事项

#### 1. Getter 中不应该有副作用

```js
// ❌ 错误：在 getter 中修改 state
const badGetter = computed(() => {
  count.value++         // 副作用！不要这样做
  return count.value * 2
})

// ✅ 正确：getter 只做纯计算
const goodGetter = computed(() => count.value * 2)
```

#### 2. 返回函数的 Getter 不会缓存调用结果

```js
// 这个 getter 缓存的是函数引用，不是调用结果
const getItemById = computed(() => (id) => items.value.find((i) => i.id === id))

// 每次 getItemById(1) 调用都会执行 find
// 如果 items 很大且频繁调用，可能有性能问题

// 替代方案：用 Map 缓存
const itemMap = computed(() => {
  const map = new Map()
  items.value.forEach((item) => map.set(item.id, item))
  return map
})

// 使用：O(1) 查找
const item = itemMap.value.get(1)
```

#### 3. 选项式 Store 的 Getter 不要用箭头函数访问 this

```js
getters: {
  // ❌ 箭头函数没有 this
  total: (state) => {
    return this.subtotal // undefined！
  },

  // ✅ 用普通函数
  total() {
    return this.subtotal * (1 - this.discount)
  },
}
```

### 九、总结

| 操作 | 选项式 Store | Setup Store |
| :--: | :--: | :--: |
| 定义 | `getters: { xxx: (state) => ... }` | `const xxx = computed(() => ...)` |
| 访问 state | `state` 参数 或 `this.xxx` | `xxx.value` |
| 访问其他 getter | `this.otherGetter` | `otherGetter.value` |
| 返回函数 | `getters: { fn: (state) => (param) => ... }` | `computed(() => (param) => ...)` |
| 缓存 | ✅ 自动缓存 | ✅ 自动缓存 |
| 副作用 | ❌ 不允许 | ❌ 不允许 |
