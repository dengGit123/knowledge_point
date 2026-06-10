# onErrorCaptured

> 📖 [Vue 官方文档 - onErrorCaptured](https://cn.vuejs.org/api/composition-api-lifecycle#onerrorcaptured)

注册一个钩子，用于捕获来自后代组件的错误。

## 语法

```javascript
import { onErrorCaptured } from 'vue'

onErrorCaptured((error, instance, info) => {
  // 错误处理逻辑
  return false // 阻止错误继续传播
})
```

## 参数

- `callback`: 错误捕获回调函数
  - `error`: 错误对象
  - `instance`: 发生错误的组件实例
  - `info`: 错误来源字符串

## 返回值

返回 `false` 可以阻止错误继续向上传播

## 基础用法

```vue
<template>
  <div>
    <ErrorComponent />
  </div>
</template>

<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err)
  console.log('错误组件:', instance)
  console.log('错误信息:', info)

  return false // 阻止错误传播
})
</script>
```

## 错误边界组件

```vue
<template>
  <div v-if="hasError" class="error-boundary">
    <h2>出错了</h2>
    <p>{{ error.message }}</p>
    <button @click="retry">重试</button>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const error = ref(null)

onErrorCaptured((err) => {
  hasError.value = true
  error.value = err
  return false
})

function retry() {
  hasError.value = false
  error.value = null
}
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  background: #fee;
  border: 1px solid #f00;
  border-radius: 4px;
}
</style>
```

## 错误信息类型

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  switch (info) {
    case 'render':
      console.error('渲染错误')
      break
    case 'setup':
      console.error('setup 函数错误')
      break
    case 'v-on':
      console.error('事件处理器错误')
      break
    default:
      console.error('未知错误类型:', info)
  }

  // 记录到错误追踪服务
  logErrorToService(err, info)

  return false
})
</script>
```

## 多层错误捕获

```vue
<template>
  <div>
    <ParentBoundary>
      <ChildBoundary>
        <ProblemComponent />
      </ChildBoundary>
    </ParentBoundary>
  </div>
</template>

<script setup>
// ParentBoundary.vue
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.log('父级边界捕获')
  // 不返回 false，让错误继续传播
})

// ChildBoundary.vue
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.log('子级边界捕获')
  return false // 阻止传播到父级
})
</script>
```

## 错误上报

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  const errorReport = {
    message: err.message,
    stack: err.stack,
    component: instance?.$options?.name || 'Unknown',
    errorType: info,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }

  // 发送到错误追踪服务
  fetch('/api/error-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorReport)
  })

  return false
})
</script>
```

## 开发环境特殊处理

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  if (import.meta.env.DEV) {
    console.group('❌ 错误详情')
    console.error('错误:', err)
    console.log('组件:', instance)
    console.log('来源:', info)
    console.groupEnd()
  } else {
    // 生产环境：上报错误
    reportError(err)
  }

  return false
})
</script>
```

## 加载状态处理

```vue
<template>
  <div v-if="error">
    <div class="error-message">
      <p>加载失败</p>
      <button @click="retry">重试</button>
    </div>
  </div>
  <div v-else-if="loading">
    <p>加载中...</p>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)
const loading = ref(false)

onErrorCaptured((err) => {
  error.value = err
  loading.value = false
  return false
})

function retry() {
  error.value = null
  loading.value = true
}
</script>
```

## 全局错误处理配置

```javascript
// app.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.log('组件:', instance)
  console.log('信息:', info)
}

app.mount('#app')
```

## 与 Suspense 配合

```vue
<template>
  <ErrorBoundary>
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <p>加载中...</p>
      </template>
    </Suspense>
  </ErrorBoundary>
</template>

<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err) => {
  console.error('异步组件加载失败:', err)
  return false
})
</script>
```

## 异步操作错误

```vue
<template>
  <button @click="fetchData">获取数据</button>
</template>

<script setup>
import { onErrorCaptured } from 'vue'

async function fetchData() {
  // 这里的错误不会被 onErrorCaptured 捕获
  const response = await fetch('/api/data')
  const data = await response.json()
  return data
}

// 异步错误需要在 try-catch 中处理
async function safeFetchData() {
  try {
    const response = await fetch('/api/data')
    return await response.json()
  } catch (err) {
    console.error('请求失败:', err)
  }
}

// onErrorCaptured 主要捕获同步错误
onErrorCaptured((err) => {
  console.error('捕获到错误:', err)
  return false
})
</script>
```

## 注意事项

1. **捕获范围**：只捕获后代组件的错误，不捕获当前组件的错误

2. **传播控制**：返回 `false` 阻止传播，不返回则继续向上

3. **异步错误**：不捕获异步操作的错误，需要使用 try-catch

4. **多个钩子**：可以注册多个 onErrorCaptured 钩子

5. **执行顺序**：从内到外执行，先执行子组件的错误处理

6. **与全局 handler 的关系**：
   - 组件级 onErrorCaptured 优先
   - 未处理或继续传播的到达全局 handler

7. **适用场景**：
   - 创建错误边界组件
   - 优雅地降级显示
   - 错误日志收集

8. **不捕获的错误**：
   - 异步错误
   - Promise rejection
   - 定时器中的错误
