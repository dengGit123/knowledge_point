### 一、概述

Action 是 Pinia Store 中的**方法/函数**，相当于 Vue 组件中的 `methods`。与 Getter 不同，Action 专门用于**执行操作和修改 State**，而且支持**异步操作**（如网络请求、定时器等）。

简单理解：**Action 是仓库的"操作员"——你想改数据、发请求、做业务逻辑，都交给 Action。**

> 📖 [Pinia 官方文档 - Actions](https://pinia.vuejs.org/zh/core-concepts/actions.html)

### 二、定义 Action

#### 1. 选项式 Store 中定义

```js
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
  }),

  getters: {
    productCount: (state) => state.products.length,
  },

  actions: {
    // 同步 action
    addProduct(product) {
      this.products.push(product) // 通过 this 访问和修改 state
    },

    removeProduct(id) {
      this.products = this.products.filter((p) => p.id !== id)
    },

    clearProducts() {
      this.products = []
      this.error = null
    },

    // 异步 action（直接写 async 函数即可）
    async fetchProducts() {
      this.loading = true
      this.error = null

      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        this.products = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async createProduct(product) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        })
        const data = await res.json()
        this.products.push(data) // 请求成功后更新 state
      } catch (err) {
        this.error = err.message
        throw err // 可以选择向上抛出，让组件处理
      }
    },
  },
})
```

#### 2. Setup Store 中定义

直接写普通函数：

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductStore = defineStore('product', () => {
  // state
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 同步 action：普通函数
  function addProduct(product) {
    products.value.push(product) // 通过 .value 访问和修改 ref
  }

  function removeProduct(id) {
    products.value = products.value.filter((p) => p.id !== id)
  }

  function clearProducts() {
    products.value = []
    error.value = null
  }

  // 异步 action：async 函数
  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      products.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createProduct(product) {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const data = await res.json()
      products.value.push(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // 所有 action 必须 return 暴露
  return {
    products,
    loading,
    error,
    addProduct,
    removeProduct,
    clearProducts,
    fetchProducts,
    createProduct,
  }
})
```

### 三、在组件中调用 Action

#### 1. 直接调用

```vue
<script setup>
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

// 调用同步 action
function handleAdd() {
  productStore.addProduct({ id: 1, name: 'Laptop', price: 999 })
}

// 调用异步 action
async function handleFetch() {
  await productStore.fetchProducts()
  console.log('加载完成，共', productStore.products.length, '件商品')
}

// 调用带错误处理的异步 action
async function handleCreate() {
  try {
    await productStore.createProduct({ name: 'Phone', price: 699 })
  } catch (err) {
    alert('创建失败：' + err.message)
  }
}
</script>

<template>
  <button @click="handleFetch" :disabled="productStore.loading">
    {{ productStore.loading ? '加载中...' : '获取商品' }}
  </button>
  <button @click="handleAdd">添加商品</button>
</template>
```

#### 2. 解构调用

```vue
<script setup>
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

// ✅ action 可以直接解构，不需要 storeToRefs
const { addProduct, removeProduct, fetchProducts } = productStore
</script>

<template>
  <!-- 解构后直接调用 -->
  <button @click="fetchProducts">获取</button>
  <button @click="addProduct({ id: 1, name: 'Book' })">添加</button>
</template>
```

> 💡 **提示：** Action 是普通函数，解构后仍然是函数引用，不会丢失响应性（与 state/getter 不同）。

### 四、Action 的核心能力

#### 1. 修改 State

```js
// 选项式 Store：通过 this
actions: {
  increment() {
    this.count++                          // 直接修改
    this.user = { ...this.user, age: 26 } // 展开修改
    this.list.push(item)                  // 数组操作
  },
}

// Setup Store：通过 .value
function increment() {
  count.value++
  user.value = { ...user.value, age: 26 }
  list.value.push(item)
}
```

#### 2. 异步操作

```js
async function login(credentials) {
  loading.value = true

  try {
    // 发送请求
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()

    // 请求成功后更新 state
    token.value = data.token
    userInfo.value = data.user
  } catch (err) {
    error.value = err.message
    throw err // 向上抛出，让组件知道失败了
  } finally {
    loading.value = false
  }
}
```

#### 3. 调用其他 Action

```js
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)

  async function login(credentials) {
    const res = await fetch('/api/login', { /* ... */ })
    const data = await res.json()
    token.value = data.token
    userInfo.value = data.user

    // 登录成功后调用其他 action
    await fetchPermissions()  // ✅ 直接调用同 store 的其他 action
  }

  async function fetchPermissions() {
    const res = await fetch('/api/permissions', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    const data = await res.json()
    // ...
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    clearPermissions() // ✅ 调用同步 action 也可以
  }

  function clearPermissions() { /* ... */ }

  return { token, userInfo, login, logout }
})
```

#### 4. 调用其他 Store 的 Action

```js
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { useNotificationStore } from './notification'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  async function checkout() {
    // ✅ 在 action 内部获取其他 store
    const cartStore = useCartStore()
    const notifyStore = useNotificationStore()

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items: cartStore.items }),
      })
      const order = await res.json()

      orders.value.push(order)

      // 调用其他 store 的 action
      cartStore.clearCart()
      notifyStore.success('下单成功！')
    } catch (err) {
      notifyStore.error('下单失败：' + err.message)
      throw err
    }
  }

  return { orders, checkout }
})
```

### 五、Action 订阅（$onAction）

使用 `$onAction` 可以监听 Store 中所有 Action 的调用，常用于**日志记录、错误处理、性能分析**。

#### 1. 基本用法

```js
const productStore = useProductStore()

// 监听所有 action 调用
const unsubscribe = productStore.$onAction(({ name, store, args, after, onError }) => {
  // name：action 的名称
  // store：store 实例
  // args：调用 action 时传入的参数数组
  console.log(`[${name}] 被调用，参数：`, args)

  // after：action 成功执行后的回调
  after((result) => {
    console.log(`[${name}] 执行成功，返回值：`, result)
  })

  // onError：action 抛出错误时的回调
  onError((error) => {
    console.error(`[${name}] 执行失败：`, error)
  })
})

// 取消监听
unsubscribe()
```

#### 2. 实际应用：日志插件

```js
// 通过 Pinia 插件为所有 store 添加 action 日志
function actionLoggerPlugin({ store }) {
  store.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now()
    console.log(`[${store.$id}] ${name} 开始执行`, args)

    after((result) => {
      const duration = Date.now() - startTime
      console.log(`[${store.$id}] ${name} 完成 (${duration}ms)`, result)
    })

    onError((error) => {
      const duration = Date.now() - startTime
      console.error(`[${store.$id}] ${name} 失败 (${duration}ms)`, error)
    })
  })
}

// 注册
const pinia = createPinia()
pinia.use(actionLoggerPlugin)
```

#### 3. 实际应用：全局错误处理

```js
function errorHandlingPlugin({ store }) {
  store.$onAction(({ name, onError }) => {
    onError((error) => {
      // 统一错误上报
      console.error(`Action "${name}" in store "${store.$id}" failed:`, error)

      // 可以接入错误监控服务
      // trackError(error, { store: store.$id, action: name })
    })
  })
}
```

### 六、Action 完整流程示例

一个完整的 CRUD 流程：

```js
// stores/product.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentId = ref(null)

  // getter
  const currentProduct = computed(() =>
    products.value.find((p) => p.id === currentId.value)
  )

  // action：获取列表
  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('获取失败')
      products.value = await res.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // action：获取单个
  async function fetchProduct(id) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error('获取失败')
      const data = await res.json()
      currentId.value = data.id
      // 更新列表中的对应项
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = data
      } else {
        products.value.push(data)
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // action：创建
  async function createProduct(product) {
    error.value = null
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      if (!res.ok) throw new Error('创建失败')
      const data = await res.json()
      products.value.push(data)
      return data // 返回创建的数据
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // action：更新
  async function updateProduct(id, updates) {
    error.value = null
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('更新失败')
      const data = await res.json()
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // action：删除
  async function deleteProduct(id) {
    error.value = null
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
      products.value = products.value.filter((p) => p.id !== id)
      if (currentId.value === id) currentId.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    currentId,
    currentProduct,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { storeToRefs } from 'pinia'

const productStore = useProductStore()
const { products, loading, error } = storeToRefs(productStore)
const { fetchProducts, deleteProduct, createProduct } = productStore

onMounted(() => {
  fetchProducts()
})

async function handleDelete(id) {
  if (!confirm('确认删除？')) return
  try {
    await deleteProduct(id)
  } catch (err) {
    alert('删除失败')
  }
}

async function handleCreate() {
  try {
    await createProduct({ name: 'New Product', price: 99 })
  } catch (err) {
    alert('创建失败')
  }
}
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else>
    <button @click="handleCreate">添加商品</button>
    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} - ¥{{ product.price }}
        <button @click="handleDelete(product.id)">删除</button>
      </li>
    </ul>
  </div>
</template>
```

### 七、常见问题与注意事项

#### 1. Action 中不要忘记 return 暴露

```js
// Setup Store 中定义了 action 但忘记 return
export const useStore = defineStore('store', () => {
  function doSomething() {
    // ...
  }

  // ❌ 忘记 return doSomething
  return {}
})

// 组件中调用会报错：store.doSomething is not a function
```

#### 2. 不要在 Store 顶层获取其他 Store

```js
// ❌ 错误：在 store 定义顶层获取其他 store
export const useOrderStore = defineStore('order', () => {
  const cartStore = useCartStore() // 此时 cartStore 可能还未初始化

  function checkout() {
    cartStore.clearCart() // 可能报错
  }
  return { checkout }
})

// ✅ 正确：在 action 函数内部获取
export const useOrderStore = defineStore('order', () => {
  function checkout() {
    const cartStore = useCartStore() // 安全，此时所有 store 已安装
    cartStore.clearCart()
  }
  return { checkout }
})
```

#### 3. Action 可以是 async 也可以是同步

```js
// 同步 action：不需要 async
function increment() {
  count.value++
}

// 异步 action：加 async
async function fetchData() {
  const res = await fetch('/api/data')
  data.value = await res.json()
}

// 调用方式取决于是否是异步
store.increment()          // 同步，直接调用
await store.fetchData()    // 异步，需要 await
```

#### 4. 错误处理策略

```js
// 策略 1：action 内部处理，不向上抛出
async function fetchProducts() {
  try {
    const res = await fetch('/api/products')
    products.value = await res.json()
  } catch (err) {
    error.value = err.message
    // 不 throw，组件不需要处理
  }
}

// 策略 2：向上抛出，让组件决定如何处理
async function createProduct(product) {
  const res = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error('创建失败')
  const data = await res.json()
  products.value.push(data)
  return data
}

// 组件中
try {
  await productStore.createProduct(newProduct)
  showToast('创建成功')
} catch (err) {
  showToast('创建失败：' + err.message)
}
```

#### 5. 选项式 Store 中 Action 的 this

```js
// 选项式 Store 中，action 中的 this 指向 Store 实例
actions: {
  increment() {
    this.count++                    // ✅ this 指向 store
    this.fetchData()                // ✅ 调用其他 action
    console.log(this.doubledCount)  // ✅ 访问 getter
  },
}

// ❌ 不要用箭头函数定义 action（会丢失 this）
actions: {
  increment: () => {
    this.count++ // ❌ this 不是 store！
  },
}
```

### 八、Action vs Getter vs 直接修改 State

| 场景 | 推荐方式 | 原因 |
| :--: | :--: | :--: |
| 简单赋值 `store.name = 'Bob'` | 直接修改 | 简单直接 |
| 派生数据 `total = count * 2` | Getter | 自动缓存 |
| 批量修改多个 state | Action | 封装逻辑，可复用 |
| 异步操作（请求 API） | Action | Getter 不支持异步 |
| 修改 state 后有副作用 | Action | Getter 不能有副作用 |
| 多组件复用的修改逻辑 | Action | 统一入口，好维护 |

### 九、总结

| 特性 | 说明 |
| :--: | :--: |
| **定义方式** | 选项式：`actions: { fn() {} }`；Setup Store：普通函数 |
| **修改 State** | 选项式用 `this.xxx`；Setup Store 用 `xxx.value` |
| **异步支持** | ✅ 原生支持 `async/await` |
| **调用其他 Action** | 直接函数调用 |
| **调用其他 Store** | 在 action 内部 `useXxxStore()` |
| **错误处理** | try/catch，可选择 throw 向上抛出 |
| **监听** | `$onAction` 订阅所有 action 调用 |
