# onServerPrefetch

## 作用

`onServerPrefetch()` 是一个生命周期钩子，仅在**服务器端渲染（SSR）**期间、组件渲染之前调用，用于预取异步数据。客户端渲染时它不会执行。回调应返回一个 `Promise`，服务器会等待所有 prefetch 完成后才渲染该组件，因此预取到的数据会直接出现在首屏 HTML 中。

```ts
// 函数签名
function onServerPrefetch(callback: () => Promise<any>): void
```

📖 [官方文档：onServerPrefetch](https://cn.vuejs.org/api/composition-api-lifecycle.html#onserverprefetch)

## 基本用法

```javascript
import { onServerPrefetch, ref } from 'vue'

export default {
  setup() {
    const data = ref(null)
    
    onServerPrefetch(async () => {
      // 在服务器端预取数据，服务器会等待这个 Promise 完成
      data.value = await fetch('https://api.example.com/data')
        .then(res => res.json())
    })
    
    return { data }
  }
}
```

> 💡 回调不返回 `Promise` 也可以注册，但服务器不会等待，数据可能来不及写入首屏。

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

### 1. 仅在服务器端执行

回调只在服务器端初始渲染时执行一次，客户端不会执行（客户端水合后也不会再触发）。代码里不能依赖 `window`、`document` 等浏览器对象。

### 2. 客户端的兜底逻辑用 onMounted

预取的数据已随首屏 HTML 下发，但如果组件在客户端还需要重新请求数据（如用户操作后刷新），用 `onMounted` 处理：

```javascript
import { onServerPrefetch, onMounted, ref } from 'vue'

export default {
  setup() {
    const data = ref(null)

    // 服务器端：预取首屏数据
    onServerPrefetch(() => fetchData().then(res => (data.value = res)))

    // 客户端：水合后如果数据为空，做兜底请求
    onMounted(() => {
      if (!data.value) {
        fetchData().then(res => (data.value = res))
      }
    })

    function fetchData() {
      return fetch('https://api.example.com/data').then(res => res.json())
    }

    return { data }
  }
}
```

### 3. 必须在 setup 同步阶段注册

与所有生命周期钩子一样，`onServerPrefetch` 必须在 `setup()` 或 `<script setup>` 的同步执行阶段调用，不能放在异步回调中注册。
