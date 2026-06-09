# onServerPrefetch

## 作用

`onServerPrefetch()` 是一个生命周期钩子，用于在服务器端渲染期间，在组件实例在服务器上渲染之前调用。用于预取数据。

> [官方文档：onServerPrefetch](https://cn.vuejs.org/api/composition-api-lifecycle#onserverprefetch)

## 基本用法

```javascript
import { onServerPrefetch, ref } from 'vue'

export default {
  setup() {
    const data = ref(null)
    
    onServerPrefetch(async () => {
      // 在服务器端预取数据
      data.value = await fetch('https://api.example.com/data')
        .then(res => res.json())
    })
    
    return { data }
  }
}
```

## 使用场景

### 1. 预取数据

```javascript
import { onServerPrefetch, ref } from 'vue'

export default {
  setup() {
    const user = ref(null)
    
    onServerPrefetch(async () => {
      // SSR 时预取用户数据
      user.value = await fetchUser()
    })
    
    return { user }
  }
}
```

### 2. 与 pinia 配合

```javascript
import { onServerPrefetch } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  setup() {
    const userStore = useUserStore()
    
    onServerPrefetch(async () => {
      // 预取 store 数据
      await userStore.fetchUser()
    })
    
    return {}
  }
}
```

## 注意事项

```javascript
import { onServerPrefetch } from 'vue'

export default {
  setup() {
    onServerPrefetch(() => {
      // ⚠️ 只在服务器端执行
      console.log('仅在 SSR 时运行')
    })
    
    return {}
  }
}
```
