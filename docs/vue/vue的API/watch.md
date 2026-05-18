# watch

## 作用
`watch()` 用于侦听响应式数据的变化，并在变化时执行副作用。与 computed 不同，watch 不返回值，而是执行回调函数。

## 用法

### 基本用法

```text
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个 ref
watch(count, (newValue, oldValue) =&gt; {
  console.log(`count 从 ${oldValue} 变为 ${newValue}`)
})

count.value = 1 // 输出: count 从 0 变为 1
```

### 侦听 getter 函数

```text
const count = ref(0)
const doubled = computed(() =&gt; count.value * 2)

// 使用 getter 函数
watch(() =&gt; count.value, (newVal, oldVal) =&gt; {
  console.log('count 变化:', newVal)
})

// 侦听计算属性
watch(() =&gt; doubled.value, (newVal) =&gt; {
  console.log('doubled 变化:', newVal)
})
```

### 侦听多个来源

```text
const firstName = ref('Vue')
const lastName = ref('JS')

// 数组形式侦听多个来源
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) =&gt; {
  console.log(`${oldFirst} ${oldLast} -&gt; ${newFirst} ${newLast}`)
})

firstName.value = 'React'
lastName.value = 'Native'
// 输出: Vue JS -&gt; React Native
```

### 侦听 reactive 对象

```text
import { reactive, watch } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// ⚠️ 默认深层侦听
watch(() =&gt; state, (newState, oldState) =&gt; {
  // newState 和 oldState 是同一个对象引用
  console.log('state 变化')
})

// 推荐使用 getter
watch(() =&gt; state.count, (newVal, oldVal) =&gt; {
  console.log(`count: ${oldVal} -&gt; ${newVal}`)
})

state.count++ // 触发 watch
```

### deep 选项（深层侦听）

```text
const state = reactive({
  user: {
    name: 'Vue',
    info: {
      age: 3
    }
  }
})

// 启用深层侦听
watch(() =&gt; state, (newVal, oldVal) =&gt; {
  console.log('深层变化')
}, { deep: true })

// 或者直接侦听对象（reactive 默认 deep）
watch(state, () =&gt; {
  console.log('变化了')
})
```

### immediate 选项（立即执行）

```text
const count = ref(0)

watch(count, (newVal, oldVal) =&gt; {
  console.log(`count: ${oldVal} -&gt; ${newVal}`)
}, { immediate: true })
// 立即输出: count: undefined -&gt; 0

count.value = 1 // 输出: count: 0 -&gt; 1
```

### once 选项（只执行一次）

```text
const count = ref(0)

watch(count, (newVal) =&gt; {
  console.log('count 变化:', newVal)
}, { once: true })

count.value = 1 // 输出: count 变化: 1
count.value = 2 // 不再触发
count.value = 3 // 不再触发
```

### flush 选项（回调时机）

```text
const count = ref(0)

// pre: 组件更新前调用（默认）
watch(count, () =&gt; {
  console.log('pre flush')
}, { flush: 'pre' })

// sync: 同步调用
watch(count, () =&gt; {
  console.log('sync flush')
}, { flush: 'sync' })

// post: 组件更新后调用
watch(count, () =&gt; {
  console.log('post flush')
}, { flush: 'post' })
```

### 停止侦听器

```text
const count = ref(0)

const stop = watch(count, (newVal) =&gt; {
  console.log('count:', newVal)
})

count.value = 1 // 输出: count: 1

stop() // 停止侦听

count.value = 2 // 不再触发
```

### 副作用清理

```text
const id = ref(0)

watch(id, async (newId, oldId, onCleanup) =&gt; {
  const { cancel } = doAsyncWork(newId)

  // 在 watch 再次触发或停止时清理
  onCleanup(() =&gt; {
    cancel()
  })
})

function doAsyncWork(id) {
  let cancelled = false

  const promise = fetch(`/api/data/${id}`)
    .then(res =&gt; res.json())
    .then(data =&gt; {
      if (cancelled) return
      console.log('数据:', data)
    })

  return {
    cancel: () =&gt; { cancelled = true }
  }
}
```

### 在 setup 中使用

```text
import { ref, watch, onUnmounted } from 'vue'

export default {
  setup() {
    const count = ref(0)

    watch(count, (newVal, oldVal) =&gt; {
      console.log(`count: ${oldVal} -&gt; ${newVal}`)
    })

    return { count }
  }
}
```

### 在 `&lt;script setup&gt;` 中使用

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newVal, oldVal) =&gt; {
  console.log(`count: ${oldVal} -&gt; ${newVal}`)
})

function increment() {
  count.value++
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button @click="increment"&gt;{{ count }}&lt;/button&gt;
`&lt;/template&gt;`
```

### 选项式 API 中使用

```text
export default {
  data() {
    return {
      count: 0,
      user: {
        name: 'Vue'
      }
    }
  },
  watch: {
    // 侦听基本类型
    count(newVal, oldVal) {
      console.log(`count: ${oldVal} -&gt; ${newVal}`)
    },

    // 侦听对象（需要 deep 或 handler）
    user: {
      handler(newVal) {
        console.log('user 变化:', newVal)
      },
      deep: true,
      immediate: true
    },

    // 使用字符串形式
    'user.name'(newVal, oldVal) {
      console.log(`name: ${oldVal} -&gt; ${newVal}`)
    }
  }
}
```

## 注意事项

### 1. 侦听 ref 需要 .value

```text
const count = ref(0)

// ✅ 正确
watch(() =&gt; count.value, (newVal) =&gt; {})

// ❌ 错误
watch(count, (newVal) =&gt; {}) // 这其实是正确的，直接传 ref

// ✅ 也可以直接传 ref
watch(count, (newVal) =&gt; {
  console.log(newVal)
})
```

### 2. 侦听 reactive 对象的问题

```text
const state = reactive({ count: 0 })

// ⚠️ newState 和 oldVal 是同一个对象
watch(() =&gt; state, (newState, oldState) =&gt; {
  console.log(newState === oldState) // true
})

// ✅ 推荐侦听具体属性
watch(() =&gt; state.count, (newVal, oldVal) =&gt; {
  console.log(newVal, oldVal) // 不同
})
```

### 3. deep 的性能影响

```text
const bigData = reactive({ /* 大量嵌套数据 */ })

// ⚠️ deep 会有性能开销
watch(bigData, () =&gt; {}, { deep: true })

// ✅ 侦听具体属性更高效
watch(() =&gt; bigData.specificProp, () =&gt; {})
```

### 4. 在 watch 中修改依赖

```text
const count = ref(0)
const doubled = ref(0)

// ⚠️ 可能导致无限循环
watch(count, () =&gt; {
  doubled.value = count.value * 2
  count.value++ // 可能导致无限循环
})

// ✅ 使用条件避免
watch(count, (newVal) =&gt; {
  if (doubled.value !== newVal * 2) {
    doubled.value = newVal * 2
  }
})
```

### 5. watch vs watchEffect

```text
// watch: 明确指定依赖
const count = ref(0)
watch(() =&gt; count.value, (newVal) =&gt; {
  console.log('count 变化:', newVal)
})

// watchEffect: 自动收集依赖
watchEffect(() =&gt; {
  console.log('count 变化:', count.value)
})

// 区别：
// 1. watch 需要明确指定侦听源
// 2. watchEffect 自动追踪依赖
// 3. watch 可以访问旧值，watchEffect 不行
```

### 6. 异步操作的竞态问题

```text
const id = ref(1)

// ❌ 可能有竞态问题
watch(id, async (newId) =&gt; {
  const res = await fetch(`/api/${newId}`)
  data.value = await res.json()
})

// ✅ 使用 onCleanup 清理
watch(id, async (newId, oldId, onCleanup) =&gt; {
  const controller = new AbortController()

  onCleanup(() =&gt; {
    controller.abort()
  })

  const res = await fetch(`/api/${newId}`, {
    signal: controller.signal
  })

  data.value = await res.json()
})
```

### 7. flush 时机选择

```text
const count = ref(0)

// sync: 立即同步执行
watch(count, () =&gt; {
  console.log('sync - DOM 还未更新')
}, { flush: 'sync' })

// pre: DOM 更新前（默认）
watch(count, () =&gt; {
  console.log('pre - DOM 即将更新')
}, { flush: 'pre' })

// post: DOM 更新后
watch(count, () =&gt; {
  console.log('post - DOM 已更新')
  // 可以访问更新后的 DOM
}, { flush: 'post' })
```

### 8. TypeScript 类型支持

```text
import { Ref, WatchSource } from 'vue'

const count: Ref&lt;number&gt; = ref(0)

// 单个来源
watch(count, (newVal: number, oldVal: number) =&gt; {
  // ...
})

// 多个来源
watch([count, another] as WatchSource[], ([newCount, newAnother]) =&gt; {
  // ...
})
```

## 使用场景

### 1. 数据变化时发送请求

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const error = ref(null)

watch(searchQuery, async (newQuery) =&gt; {
  if (!newQuery) {
    results.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const res = await fetch(`/api/search?q=${newQuery}`)
    results.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="searchQuery" placeholder="搜索..." /&gt;
  &lt;p v-if="loading"&gt;加载中...&lt;/p&gt;
  &lt;p v-if="error"&gt;{{ error }}&lt;/p&gt;
  &lt;ul v-if="results.length"&gt;
    &lt;li v-for="item in results" :key="item.id"&gt;
      {{ item.name }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 2. 表单验证

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const email = ref('')
const touched = ref(false)
const error = ref('')

watch(email, (newEmail) =&gt; {
  if (!touched.value) return

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!newEmail) {
    error.value = '邮箱不能为空'
  } else if (!emailRegex.test(newEmail)) {
    error.value = '请输入有效的邮箱'
  } else {
    error.value = ''
  }
})

function onBlur() {
  touched.value = true
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input
    v-model="email"
    @blur="onBlur"
    :class="{ error: !!error }"
  /&gt;
  &lt;span v-if="error" class="error-message"&gt;{{ error }}&lt;/span&gt;
`&lt;/template&gt;`
```

### 3. 路由变化时重新加载数据

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = computed(() =&gt; route.params.id)
const user = ref(null)
const loading = ref(false)

watch(userId, async (newId) =&gt; {
  if (!newId) return

  loading.value = true
  try {
    const res = await fetch(`/api/users/${newId}`)
    user.value = await res.json()
  } finally {
    loading.value = false
  }
}, { immediate: true })
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div v-if="loading"&gt;加载中...&lt;/div&gt;
  &lt;div v-else-if="user"&gt;
    &lt;h1&gt;{{ user.name }}&lt;/h1&gt;
    &lt;p&gt;{{ user.email }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 4. 本地存储同步

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const settings = ref({
  theme: 'light',
  fontSize: 14,
  language: 'zh-CN'
})

// 从 localStorage 加载
const saved = localStorage.getItem('settings')
if (saved) {
  settings.value = JSON.parse(saved)
}

// 保存到 localStorage
watch(settings, (newSettings) =&gt; {
  localStorage.setItem('settings', JSON.stringify(newSettings))
}, { deep: true })
`&lt;/script&gt;`
```

### 5. 防抖输入

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const searchQuery = ref('')
const results = ref([])

function debounce(fn, delay) {
  let timeoutId
  return (...args) =&gt; {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() =&gt; fn(...args), delay)
  }
}

const debouncedSearch = debounce(async (query) =&gt; {
  if (!query) {
    results.value = []
    return
  }
  const res = await fetch(`/api/search?q=${query}`)
  results.value = await res.json()
}, 300)

watch(searchQuery, debouncedSearch)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input v-model="searchQuery" placeholder="搜索..." /&gt;
  &lt;ul&gt;
    &lt;li v-for="item in results" :key="item.id"&gt;
      {{ item.name }}
    &lt;/li&gt;
  &lt;/ul&gt;
`&lt;/template&gt;`
```

### 6. 监听窗口大小变化

```text
`&lt;script setup&gt;`
import { ref, watch, onMounted, onUnmounted } from 'vue'

const windowSize = ref({
  width: window.innerWidth,
  height: window.innerHeight
})

const updateSize = () =&gt; {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

onMounted(() =&gt; {
  window.addEventListener('resize', updateSize)
})

onUnmounted(() =&gt; {
  window.removeEventListener('resize', updateSize)
})

watch(windowSize, (newSize) =&gt; {
  console.log('窗口大小变化:', newSize)
  // 可以根据大小调整布局
})

const isMobile = computed(() =&gt; windowSize.value.width &lt; 768)
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;div :class="{ mobile: isMobile }"&gt;
    &lt;p&gt;窗口: {{ windowSize.width }} x {{ windowSize.height }}&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 7. 文件上传进度

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const file = ref(null)
const progress = ref(0)
const status = ref('idle')

watch(file, async (newFile) =&gt; {
  if (!newFile) return

  status.value = 'uploading'
  progress.value = 0

  const formData = new FormData()
  formData.append('file', newFile)

  try {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) =&gt; {
      if (e.lengthComputable) {
        progress.value = (e.loaded / e.total) * 100
      }
    })

    xhr.addEventListener('load', () =&gt; {
      status.value = 'completed'
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  } catch (e) {
    status.value = 'error'
  }
})
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;input type="file" @change="file = $event.target.files[0]" /&gt;
  &lt;div v-if="status === 'uploading'"&gt;
    &lt;progress :value="progress" max="100"&gt;&lt;/progress&gt;
    &lt;p&gt;{{ Math.round(progress) }}%&lt;/p&gt;
  &lt;/div&gt;
`&lt;/template&gt;`
```

### 8. WebSocket 消息处理

```text
`&lt;script setup&gt;`
import { ref, watch, onUnmounted } from 'vue'

const messages = ref([])
const socket = ref(null)
const connected = ref(false)

const connect = () =&gt; {
  socket.value = new WebSocket('ws://localhost:8080')

  socket.value.onopen = () =&gt; {
    connected.value = true
  }

  socket.value.onmessage = (event) =&gt; {
    messages.value.push(JSON.parse(event.data))
  }

  socket.value.onclose = () =&gt; {
    connected.value = false
  }
}

const disconnect = () =&gt; {
  if (socket.value) {
    socket.value.close()
    socket.value = null
  }
}

watch(connected, (isConnected) =&gt; {
  if (isConnected) {
    console.log('WebSocket 已连接')
  } else {
    console.log('WebSocket 已断开')
  }
})

onMounted(connect)
onUnmounted(disconnect)
`&lt;/script&gt;`
```

### 9. 权限变化时的界面更新

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'
import { useAuth } from './composables/useAuth'

const { user, permissions } = useAuth()

const canEdit = ref(false)
const canDelete = ref(false)

watch([user, permissions], ([newUser, newPerms]) =&gt; {
  canEdit.value = newPerms.includes('edit') || newUser?.role === 'admin'
  canDelete.value = newPerms.includes('delete') || newUser?.role === 'admin'

  // 权限变化时可能需要重新加载某些数据
  if (newUser) {
    loadUserData(newUser.id)
  } else {
    // 用户登出时清理数据
    clearData()
  }
}, { immediate: true })
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;button v-if="canEdit"&gt;编辑&lt;/button&gt;
  &lt;button v-if="canDelete"&gt;删除&lt;/button&gt;
`&lt;/template&gt;`
```

### 10. 动画/过渡控制

```text
`&lt;script setup&gt;`
import { ref, watch } from 'vue'

const isVisible = ref(true)
const isAnimating = ref(false)

watch(isVisible, async (newVisible, oldVisible) =&gt; {
  if (newVisible === oldVisible) return

  isAnimating.value = true

  if (newVisible) {
    // 进入动画
    await animateIn()
  } else {
    // 离开动画
    await animateOut()
  }

  isAnimating.value = false
})

async function animateIn() {
  return new Promise(resolve =&gt; {
    // 动画逻辑
    setTimeout(resolve, 300)
  })
}

async function animateOut() {
  return new Promise(resolve =&gt; {
    // 动画逻辑
    setTimeout(resolve, 300)
  })
}
`&lt;/script&gt;`

`&lt;template&gt;`
  &lt;transition
    @before-enter="isAnimating = true"
    @after-enter="isAnimating = false"
  &gt;
    &lt;div v-if="isVisible" class="content"&gt;
      内容
    &lt;/div&gt;
  &lt;/transition&gt;

  &lt;button @click="isVisible = !isVisible" :disabled="isAnimating"&gt;
    {{ isVisible ? '隐藏' : '显示' }}
  &lt;/button&gt;
`&lt;/template&gt;`
```

## watch 选项总结

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| deep | boolean | false | 深层侦听对象 |
| immediate | boolean | false | 立即执行回调 |
| flush | 'pre' \| 'sync' \| 'post' | 'pre' | 回调执行时机 |
| once | boolean | false | 只执行一次 |

## 最佳实践

1. **明确侦听源**：使用 watch 时明确指定要侦听的数据
2. **避免深度侦听**：对于大对象，侦听具体属性而非整个对象
3. **清理副作用**：使用 onCleanup 清理定时器、请求等
4. **处理竞态**：异步操作时注意处理并发请求
5. **合理使用 immediate**：需要在组件挂载时就执行时使用
