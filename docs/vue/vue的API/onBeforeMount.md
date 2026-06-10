# onBeforeMount

> 📖 [Vue 官方文档 - onBeforeMount](https://cn.vuejs.org/api/composition-api-lifecycle#onbeforemount)

## 作用

`onBeforeMount()` 是 Vue 3 的生命周期钩子，在组件挂载到 DOM 之前调用。这是在组件的 DOM 结构创建之前执行的最后一个钩子。

## 用法

### 基本用法

```javascript
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  console.log('组件即将挂载到 DOM')
  console.log('此时 DOM 还未创建')
  console.log('this.$el 尚不存在')
})
```

### 与 setup() 的关系

```javascript
import { ref, onBeforeMount } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    onBeforeMount(() => {
      console.log('onBeforeMount 被调用')
      console.log('count.value:', count.value) // 可以访问响应式数据
    })
    
    return { count }
  }
}
```

### 在 `` `<script setup>`` 中使用

```vue
<script setup>
import { ref, onBeforeMount } from 'vue'

const message = ref('Hello')

onBeforeMount(() => {
  console.log('组件准备挂载')
  console.log('message 的值:', message.value)
})
</script>
```

## 执行时机

```javascript
import { 
  ref, 
  onBeforeMount, 
  onMounted,
  onBeforeUpdate,
  onUpdated
} from 'vue'

export default {
  setup() {
    const logs = ref([])
    
    const addLog = (msg) => {
      logs.value.push(`${new Date().toISOString()}: ${msg}`)
    }
    
    onBeforeMount(() => {
      addLog('1. onBeforeMount - DOM 未创建')
    })
    
    onMounted(() => {
      addLog('2. onMounted - DOM 已创建')
    })
    
    return { logs }
  }
}
```

## 使用场景

### 1. 初始化数据

```javascript
import { ref, onBeforeMount } from 'vue'

export default {
  setup() {
    const user = ref(null)
    const isLoading = ref(false)
    
    onBeforeMount(() => {
      // 在挂载前开始加载用户数据
      isLoading.value = true
      fetchUserData()
    })
    
    async function fetchUserData() {
      const response = await fetch('/api/user')
      user.value = await response.json()
      isLoading.value = false
    }
    
    return { user, isLoading }
  }
}
```

### 2. 设置事件监听器（早期设置）

```javascript
import { onBeforeMount, onUnmounted } from 'vue'

export default {
  setup() {
    const handleResize = () => {
      console.log('窗口大小改变')
    }
    
    onBeforeMount(() => {
      // 在组件挂载前就设置监听器
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }
}
```

### 3. 初始化第三方库

```javascript
import { onBeforeMount, onMounted, ref } from 'vue'

export default {
  setup() {
    const chartInstance = ref(null)
    const chartRef = ref(null)
    
    onBeforeMount(() => {
      // 初始化图表配置
      console.log('准备初始化图表')
    })
    
    onMounted(() => {
      // 在 DOM 可用后才真正创建图表
      chartInstance.value = new Chart(chartRef.value, {
        type: 'bar',
        data: { /* ... */ }
      })
    })
    
    return { chartRef }
  }
}
```

### 4. 数据预加载

```javascript
import { ref, onBeforeMount } from 'vue'

export default {
  setup() {
    const products = ref([])
    const categories = ref([])
    
    onBeforeMount(async () => {
      // 并行预加载数据
      const [productsData, categoriesData] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json())
      ])
      
      products.value = productsData
      categories.value = categoriesData
    })
    
    return { products, categories }
  }
}
```

### 5. 权限检查

```javascript
import { ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userRole = ref(null)
    
    onBeforeMount(async () => {
      // 在挂载前检查权限
      userRole.value = await getUserRole()
      
      if (!userRole.value) {
        router.push('/login')
      } else if (!hasAccess(route, userRole.value)) {
        router.push('/403')
      }
    })
    
    return { userRole }
  }
}
```

## 注意事项

### 1. DOM 尚未创建

```javascript
import { ref, onBeforeMount } from 'vue'

export default {
  setup() {
    const elementRef = ref(null)
    
    onBeforeMount(() => {
      // ⚠️ 此时 elementRef.value 是 null
      console.log(elementRef.value) // null
      
      // ❌ 不能操作 DOM
      // elementRef.value.focus() // 错误！
    })
    
    return { elementRef }
  }
}
```

### 2. setup() 同步执行

```javascript
import { onBeforeMount, ref } from 'vue'

export default {
  setup() {
    console.log('1. setup 开始执行')
    
    const count = ref(0)
    
    onBeforeMount(() => {
      console.log('2. onBeforeMount 执行')
    })
    
    console.log('3. setup 执行完毕')
    
    // 执行顺序：1 -> 3 -> 2
  }
}
```

### 3. 只在组件 setup 中调用

```javascript
import { onBeforeMount } from 'vue'

// ❌ 错误：不能在普通函数中调用
function initApp() {
  onBeforeMount(() => {
    console.log('这不会执行')
  })
}

// ✅ 正确：在 setup() 中调用
export default {
  setup() {
    onBeforeMount(() => {
      console.log('这是正确的')
    })
  }
}
```

### 4. 不能使用 async

```javascript
import { onBeforeMount } from 'vue'

export default {
  setup() {
    // ❌ 错误：不能直接使用 async
    onBeforeMount(async () => {
      await fetchData()
    })
    
    // ✅ 正确：在内部使用异步操作
    onBeforeMount(() => {
      fetchData().then(data => {
        console.log(data)
      })
    })
  }
}
```

## 生命周期对比

```javascript
import { 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

export default {
  setup() {
    const logs = []
    
    onBeforeMount(() => {
      logs.push('beforeMount: DOM 未创建')
    })
    
    onMounted(() => {
      logs.push('mounted: DOM 已创建并挂载')
    })
    
    onBeforeUpdate(() => {
      logs.push('beforeUpdate: 数据变化，DOM 更新前')
    })
    
    onUpdated(() => {
      logs.push('updated: DOM 更新完成')
    })
    
    onBeforeUnmount(() => {
      logs.push('beforeUnmount: 组件即将卸载')
    })
    
    onUnmounted(() => {
      logs.push('unmounted: 组件已卸载')
    })
    
    return { logs }
  }
}
```

## TypeScript 支持

```typescript
import { onBeforeMount } from 'vue'

// 基本使用
onBeforeMount(() => {
  console.log('组件挂载前')
})

// 带参数的回调
onBeforeMount(() => {
  // 执行初始化逻辑
})
```

## 完整示例

```vue
<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'

const loading = ref(true)
const data = ref(null)
const error = ref(null)

onBeforeMount(async () => {
  try {
    // 组件挂载前开始加载数据
    const response = await fetch('/api/data')
    data.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

onMounted(() => {
  // 此时可以安全地操作 DOM
  console.log('组件已挂载')
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error }}</div>
  <div v-else>{{ data }}</div>
</template>
```

## 最佳实践

1. **数据预加载**：在 `onBeforeMount` 中开始数据加载
2. **权限验证**：在组件挂载前进行权限检查
3. **避免 DOM 操作**：此时 DOM 不存在，不要操作 DOM
4. **初始化配置**：设置组件初始配置和状态
