# watchPostEffect

> 📖 [Vue 官方文档 - watchPostEffect](https://cn.vuejs.org/api/reactivity-core#watchposteffect)

### 一、概述

`watchPostEffect()` 是 Vue 3 提供的一个响应式副作用 API，等价于带有 `flush: 'post'` 选项的 `watchEffect()`。它的核心作用是**在组件 DOM 更新完成之后**才执行回调函数，确保你能够安全地访问和操作更新后的 DOM 元素。当你需要在响应式数据变化后立即读取或操作最新的 DOM 状态（如获取元素尺寸、聚焦输入框、执行动画等），`watchPostEffect` 就是最佳选择。

### 二、核心原理

#### 工作机制

`watchPostEffect` 的底层原理与 `watchEffect` 一致，都是**自动追踪响应式依赖**并创建副作用函数。区别在于执行时机：

- **`watchEffect`**（默认 `flush: 'pre'`）：在组件更新**之前**执行副作用，此时 DOM 尚未更新。
- **`watchPostEffect`**（即 `flush: 'post'`）：在组件更新**之后**执行副作用，此时 DOM 已经完成渲染。

#### 简单类比

想象你在装修房子：

- `watchEffect` 就像是设计师在施工队进场**之前**去测量尺寸——可能数据不准确，因为墙壁还没砌好。
- `watchPostEffect` 就像是设计师在施工队完工**之后**再去测量尺寸——此时房子已经是最终状态，测量结果完全准确。

#### 响应式依赖追踪

`watchPostEffect` 会自动追踪回调函数内访问的所有响应式数据（`ref`、`reactive`、`computed` 等）。当这些数据发生变化时，Vue 会重新调度组件更新，更新完成后再执行回调。

### 三、详细用法

#### 1. 基本用法

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const count = ref(0)

// watchPostEffect 会自动追踪内部依赖
// 当 count 变化时，在 DOM 更新后执行回调
watchPostEffect(() => {
  console.log('count:', count.value)
  // 此时 DOM 已经更新，可以安全访问更新后的 DOM
})
</script>

<template>
  <div>
    <p>当前计数：{{ count }}</p>
    <button @click="count++">增加</button>
  </div>
</template>
```

#### 2. 进阶用法

##### 2.1 访问模板引用（Template Ref）

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const list = ref<string[]>(['苹果', '香蕉'])
const newItem = ref('')
const listRef = ref<HTMLUListElement | null>(null)

// 每次 list 变化后，滚动到列表底部
watchPostEffect(() => {
  // 访问 list.value 触发依赖追踪
  const _ = list.value.length
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
})

const addItem = () => {
  if (newItem.value.trim()) {
    list.value.push(newItem.value.trim())
    newItem.value = ''
  }
}
</script>

<template>
  <div>
    <ul ref="listRef" style="height: 100px; overflow-y: auto">
      <li v-for="item in list" :key="item">{{ item }}</li>
    </ul>
    <input v-model="newItem" @keyup.enter="addItem" placeholder="输入新项目" />
    <button @click="addItem">添加</button>
  </div>
</template>
```

##### 2.2 清理副作用（onCleanup）

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const userId = ref(1)
const data = ref<Record<string, unknown> | null>(null)

watchPostEffect((onCleanup) => {
  const controller = new AbortController()

  // ✅ 正确：使用 onCleanup 注册清理函数，避免竞态问题
  onCleanup(() => {
    controller.abort()
  })

  fetch(`/api/user/${userId.value}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((json) => {
      data.value = json
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('请求失败：', err)
      }
    })
})
</script>
```

##### 2.3 手动停止侦听

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const counter = ref(0)

// watchPostEffect 返回一个停止函数
const stop = watchPostEffect(() => {
  console.log('counter:', counter.value)
})

// 当满足某个条件时手动停止侦听
const handleClick = () => {
  counter.value++
  if (counter.value >= 10) {
    stop() // 停止侦听，之后 counter 变化不再触发回调
    console.log('已停止侦听')
  }
}
</script>

<template>
  <button @click="handleClick">计数（{{ counter }}）</button>
</template>
```

##### 2.4 结合 computed 使用

```vue
<script setup lang="ts">
import { ref, computed, watchPostEffect } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

const fullName = computed(() => `${firstName.value}${lastName.value}`)

// 当 computed 值变化后，在 DOM 更新后执行操作
watchPostEffect(() => {
  console.log('全名已更新：', fullName.value)
})
</script>

<template>
  <div>
    <input v-model="firstName" placeholder="姓" />
    <input v-model="lastName" placeholder="名" />
    <p>全名：{{ fullName }}</p>
  </div>
</template>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `effect` | `(onCleanup: (cleanupFn: () => void) => void) => void` | 副作用函数，接收一个 `onCleanup` 回调用于注册清理函数 |
| **返回值** | `() => void` | 返回一个停止函数，调用即可停止侦听 |
| `onCleanup` | `(cleanupFn: () => void) => void` | 用于注册副作用清理函数，在下次副作用执行前调用 |

> 💡 **提示：** `watchPostEffect` 的函数签名与 `watchEffect` 完全一致，唯一的区别是执行时机不同。

### 四、实现效果

#### 示例：自动聚焦输入框

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const showInput = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// ✅ 使用 watchPostEffect：在 DOM 更新后聚焦，此时 input 元素已渲染
watchPostEffect(() => {
  // 访问 showInput.value 触发依赖追踪
  if (showInput.value && inputRef.value) {
    inputRef.value.focus()
    console.log('输入框已自动聚焦') // 输出：输入框已自动聚焦
  }
})

const toggleInput = () => {
  showInput.value = !showInput.value
}
</script>

<template>
  <div>
    <button @click="toggleInput">
      {{ showInput ? '隐藏' : '显示' }}输入框
    </button>
    <!-- 当 showInput 变为 true 时，input 渲染到 DOM -->
    <!-- watchPostEffect 在 DOM 更新后执行，此时可以安全 focus -->
    <input
      v-if="showInput"
      ref="inputRef"
      type="text"
      placeholder="我会自动获得焦点"
    />
  </div>
</template>
```

运行效果说明：

1. 点击「显示输入框」按钮 → `showInput` 变为 `true`
2. Vue 更新 DOM → `<input>` 元素被渲染到页面
3. `watchPostEffect` 回调执行 → 检测到 `showInput.value` 为 `true` 且 `inputRef.value` 存在
4. 调用 `inputRef.value.focus()` → 输入框获得焦点

> ⚠️ **注意：** 如果使用 `watchEffect` 而不是 `watchPostEffect`，在回调执行时 `<input>` 元素可能尚未渲染到 DOM，`inputRef.value` 为 `null`，导致聚焦失败。

### 五、使用场景

#### 1. 自动聚焦表单元素

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const editMode = ref(false)
const editInputRef = ref<HTMLInputElement | null>(null)
const title = ref('点击编辑')

// 进入编辑模式后自动聚焦输入框
watchPostEffect(() => {
  if (editMode.value && editInputRef.value) {
    editInputRef.value.focus()
    editInputRef.value.select()
  }
})
</script>

<template>
  <div>
    <span v-if="!editMode" @dblclick="editMode = true">{{ title }}</span>
    <input
      v-else
      ref="editInputRef"
      v-model="title"
      @blur="editMode = false"
      @keyup.enter="editMode = false"
    />
  </div>
</template>
```

#### 2. 测量 DOM 元素尺寸

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const items = ref<string[]>(['项目 A', '项目 B', '项目 C'])
const containerRef = ref<HTMLDivElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })

// 列表变化后重新测量容器尺寸
watchPostEffect(() => {
  // 访问 items.value.length 触发依赖追踪
  const _ = items.value.length
  if (containerRef.value) {
    containerSize.value = {
      width: containerRef.value.offsetWidth,
      height: containerRef.value.offsetHeight,
    }
  }
})

const addItem = () => {
  items.value.push(`项目 ${String.fromCharCode(65 + items.value.length)}`)
}
</script>

<template>
  <div>
    <div ref="containerRef" style="border: 1px solid #ccc; padding: 10px">
      <div v-for="item in items" :key="item">{{ item }}</div>
    </div>
    <p>容器尺寸：{{ containerSize.width }} x {{ containerSize.height }}</p>
    <button @click="addItem">添加项目</button>
  </div>
</template>
```

#### 3. 自动滚动到新内容

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

interface Message {
  id: number
  text: string
}

const messages = ref<Message[]>([])
const chatContainerRef = ref<HTMLDivElement | null>(null)
const inputText = ref('')

// 新消息到来后自动滚动到底部
watchPostEffect(() => {
  // 访问 messages.value.length 触发依赖追踪
  const _ = messages.value.length
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
})

const sendMessage = () => {
  if (inputText.value.trim()) {
    messages.value.push({
      id: Date.now(),
      text: inputText.value.trim(),
    })
    inputText.value = ''
  }
}
</script>

<template>
  <div>
    <div
      ref="chatContainerRef"
      style="height: 200px; overflow-y: auto; border: 1px solid #ccc"
    >
      <div v-for="msg in messages" :key="msg.id">{{ msg.text }}</div>
    </div>
    <input v-model="inputText" @keyup.enter="sendMessage" />
    <button @click="sendMessage">发送</button>
  </div>
</template>
```

#### 4. 第三方库 DOM 操作（如图表初始化）

```vue
<script setup lang="ts">
import { ref, watchPostEffect, onBeforeUnmount } from 'vue'

// 模拟图表库
interface ChartInstance {
  destroy: () => void
  setData: (data: number[]) => void
}

declare function createChart(el: HTMLElement, data: number[]): ChartInstance

const chartData = ref([10, 20, 30, 40, 50])
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: ChartInstance | null = null

// 数据变化后重新创建或更新图表
watchPostEffect((onCleanup) => {
  if (chartRef.value) {
    // 清理旧的图表实例
    onCleanup(() => {
      chartInstance?.destroy()
      chartInstance = null
    })

    chartInstance = createChart(chartRef.value, chartData.value)
  }
})

onBeforeUnmount(() => {
  chartInstance?.destroy()
})

const addDataPoint = () => {
  chartData.value.push(Math.round(Math.random() * 100))
}
</script>

<template>
  <div>
    <div ref="chartRef" style="width: 400px; height: 300px"></div>
    <button @click="addDataPoint">添加数据点</button>
  </div>
</template>
```

#### 5. 条件渲染后的 DOM 初始化

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const showModal = ref(false)
const modalContentRef = ref<HTMLDivElement | null>(null)

// 弹窗打开后初始化内容（如绑定事件、设置样式等）
watchPostEffect(() => {
  if (showModal.value && modalContentRef.value) {
    // 弹窗渲染后执行初始化操作
    modalContentRef.value.style.opacity = '1'
    modalContentRef.value.style.transform = 'translateY(0)'
    console.log('弹窗 DOM 已初始化')
  }
})
</script>

<template>
  <div>
    <button @click="showModal = true">打开弹窗</button>
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div
        ref="modalContentRef"
        class="modal-content"
        style="opacity: 0; transform: translateY(-20px); transition: all 0.3s"
      >
        <h2>弹窗标题</h2>
        <p>弹窗内容</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
}
</style>
```

#### 6. 动态列表渲染后执行操作

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

interface TodoItem {
  id: number
  text: string
  done: boolean
}

const todos = ref<TodoItem[]>([
  { id: 1, text: '学习 Vue 3', done: false },
  { id: 2, text: '学习 TypeScript', done: false },
])

const filter = ref<'all' | 'active' | 'done'>('all')
const listRef = ref<HTMLUListElement | null>(null)

// 筛选条件变化后，获取可见项数量
watchPostEffect(() => {
  // 访问 filter.value 和 todos.value 触发依赖追踪
  const visibleCount = todos.value.filter((todo) => {
    if (filter.value === 'active') return !todo.done
    if (filter.value === 'done') return todo.done
    return true
  }).length

  console.log(`当前可见 ${visibleCount} 项`)

  // 确保列表已渲染
  if (listRef.value) {
    console.log('列表 DOM 子元素数量：', listRef.value.children.length)
  }
})

const toggleDone = (id: number) => {
  const todo = todos.value.find((t) => t.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <div>
    <select v-model="filter">
      <option value="all">全部</option>
      <option value="active">未完成</option>
      <option value="done">已完成</option>
    </select>
    <ul ref="listRef">
      <li
        v-for="todo in todos.filter((t) => {
          if (filter === 'active') return !t.done
          if (filter === 'done') return t.done
          return true
        })"
        :key="todo.id"
        @click="toggleDone(todo.id)"
        :style="{ textDecoration: todo.done ? 'line-through' : 'none' }"
      >
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>
```

#### 7. 结合 IntersectionObserver 实现懒加载

```vue
<script setup lang="ts">
import { ref, watchPostEffect, onBeforeUnmount } from 'vue'

const items = ref(Array.from({ length: 20 }, (_, i) => `项目 ${i + 1}`))
const sentinelRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

// 当哨兵元素渲染后创建 IntersectionObserver
watchPostEffect((onCleanup) => {
  if (sentinelRef.value) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // 加载更多数据
        const currentLength = items.value.length
        for (let i = 0; i < 10; i++) {
          items.value.push(`项目 ${currentLength + i + 1}`)
        }
      }
    })

    observer.observe(sentinelRef.value)

    onCleanup(() => {
      observer?.disconnect()
      observer = null
    })
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div style="height: 300px; overflow-y: auto">
    <div v-for="item in items" :key="item" style="padding: 8px 0">
      {{ item }}
    </div>
    <!-- 哨兵元素，出现在可视区域时触发加载更多 -->
    <div ref="sentinelRef" style="height: 1px"></div>
  </div>
</template>
```

#### 8. 监听样式变化后获取布局信息

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

const isExpanded = ref(false)
const contentRef = ref<HTMLDivElement | null>(null)
const contentHeight = ref(0)

// 展开/折叠后获取实际内容高度
watchPostEffect(() => {
  // 访问 isExpanded.value 触发依赖追踪
  const _ = isExpanded.value
  if (contentRef.value) {
    contentHeight.value = contentRef.value.scrollHeight
    console.log('内容实际高度：', contentRef.value.scrollHeight)
  }
})
</script>

<template>
  <div>
    <button @click="isExpanded = !isExpanded">
      {{ isExpanded ? '折叠' : '展开' }}
    </button>
    <div
      ref="contentRef"
      :style="{
        maxHeight: isExpanded ? `${contentHeight}px` : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }"
    >
      <div style="padding: 16px">
        <p>这是一段可折叠的内容。</p>
        <p>展开后可以看到完整信息。</p>
        <p>通过 watchPostEffect 获取准确的 scrollHeight。</p>
      </div>
    </div>
  </div>
</template>
```

#### 9. 表单验证后滚动到错误字段

```vue
<script setup lang="ts">
import { ref, watchPostEffect } from 'vue'

interface FormData {
  name: string
  email: string
  password: string
}

interface FormError {
  field: string
  message: string
}

const form = ref<FormData>({ name: '', email: '', password: '' })
const errors = ref<FormError[]>([])
const errorRefs = ref<Record<string, HTMLElement | null>>({})

// 错误变化后滚动到第一个错误字段
watchPostEffect(() => {
  if (errors.value.length > 0) {
    const firstError = errors.value[0]
    const errorEl = errorRefs.value[firstError.field]
    if (errorEl) {
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      console.log('已滚动到错误字段：', firstError.field)
    }
  }
})

const validate = () => {
  errors.value = []
  if (!form.value.name.trim()) {
    errors.value.push({ field: 'name', message: '请输入姓名' })
  }
  if (!form.value.email.includes('@')) {
    errors.value.push({ field: 'email', message: '请输入有效的邮箱' })
  }
  if (form.value.password.length < 6) {
    errors.value.push({ field: 'password', message: '密码至少 6 位' })
  }
}
</script>

<template>
  <form @submit.prevent="validate">
    <div :ref="(el) => (errorRefs['name'] = el as HTMLElement)">
      <label>姓名：</label>
      <input v-model="form.name" />
      <span v-if="errors.find((e) => e.field === 'name')" style="color: red">
        {{ errors.find((e) => e.field === 'name')?.message }}
      </span>
    </div>
    <div :ref="(el) => (errorRefs['email'] = el as HTMLElement)">
      <label>邮箱：</label>
      <input v-model="form.email" type="email" />
      <span v-if="errors.find((e) => e.field === 'email')" style="color: red">
        {{ errors.find((e) => e.field === 'email')?.message }}
      </span>
    </div>
    <div :ref="(el) => (errorRefs['password'] = el as HTMLElement)">
      <label>密码：</label>
      <input v-model="form.password" type="password" />
      <span
        v-if="errors.find((e) => e.field === 'password')"
        style="color: red"
      >
        {{ errors.find((e) => e.field === 'password')?.message }}
      </span>
    </div>
    <button type="submit">验证</button>
  </form>
</template>
```

#### 10. 组件动态加载后初始化

```vue
<script setup lang="ts">
import { ref, watchPostEffect, type Component } from 'vue'

const currentComponent = ref<Component | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// 动态组件切换后执行初始化操作
watchPostEffect(() => {
  // 访问 currentComponent.value 触发依赖追踪
  if (currentComponent.value && containerRef.value) {
    console.log('组件已渲染，容器子节点数：', containerRef.value.children.length)
    // 可以在这里执行组件渲染后的额外初始化
  }
})

// 模拟动态加载组件
const loadComponent = async (name: string) => {
  const modules = import.meta.glob('../components/*.vue')
  const mod = await modules[`../components/${name}.vue`]()
  currentComponent.value = (mod as { default: Component }).default
}
</script>

<template>
  <div>
    <button @click="loadComponent('UserList')">加载用户列表</button>
    <button @click="loadComponent('Settings')">加载设置</button>
    <div ref="containerRef">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
</template>
```

### 六、注意事项

1. **执行时机是 DOM 更新之后**：`watchPostEffect` 的回调在组件 DOM 更新完成后异步执行，不要在回调中修改响应式数据后再依赖同步的 DOM 状态。

2. **首次立即执行**：`watchPostEffect` 会在创建时**立即执行一次**回调，即使没有任何响应式数据发生变化。这意味着回调中的 DOM 操作可能在首次执行时找不到目标元素。

   ```ts
   // ❌ 首次执行时 showInput 可能为 false，inputRef.value 为 null
   watchPostEffect(() => {
     inputRef.value?.focus() // 首次可能无效，但不会报错
   })

   // ✅ 加入条件判断，确保目标元素存在
   watchPostEffect(() => {
     if (showInput.value && inputRef.value) {
       inputRef.value.focus()
     }
   })
   ```

3. **不支持惰性侦听**：与 `watch` 不同，`watchPostEffect` 不支持 `immediate: false` 选项，它总是在创建时立即执行一次。如果需要惰性侦听，请使用 `watch` 并设置 `flush: 'post'`。

4. **回调是异步调度的**：`watchPostEffect` 的回调不是同步执行的，而是通过微任务队列调度的。多个响应式数据的同步变更只会在下一个微任务中触发一次回调。

   ```ts
   // ✅ 两次赋值只会触发一次 watchPostEffect 回调
   firstName.value = '李'
   lastName.value = '四'
   // 回调在 DOM 更新后执行，此时两个值都已更新
   ```

5. **避免在回调中直接修改被追踪的响应式数据**：这可能导致无限循环。

   ```ts
   // ❌ 无限循环：在回调中修改了被追踪的数据
   watchPostEffect(() => {
     count.value = count.value + 1 // 永无止境
   })

   // ✅ 正确：只读取数据，不修改被追踪的依赖
   watchPostEffect(() => {
     console.log('count:', count.value)
   })
   ```

6. **记得清理副作用**：当副作用涉及异步操作、事件监听或第三方库时，务必使用 `onCleanup` 注册清理函数，避免内存泄漏。

   ```ts
   // ❌ 没有清理，可能造成内存泄漏
   watchPostEffect(() => {
     window.addEventListener('resize', handleResize)
   })

   // ✅ 使用 onCleanup 清理
   watchPostEffect((onCleanup) => {
     window.addEventListener('resize', handleResize)
     onCleanup(() => {
       window.removeEventListener('resize', handleResize)
     })
   })
   ```

7. **组件卸载时自动停止**：在 `setup()` 或 `<script setup>` 中创建的 `watchPostEffect` 会在组件卸载时自动停止，无需手动清理。但如果在异步回调或非组件上下文中使用，需要手动调用停止函数。

8. **SSR 兼容性**：在服务端渲染（SSR）环境中，`watchPostEffect` 的回调会在组件渲染后同步执行。但由于服务端没有真实的 DOM，任何 DOM 操作都会失败，请确保 DOM 操作仅在客户端执行。

   ```ts
   // ✅ 安全的 SSR 写法
   watchPostEffect(() => {
     if (typeof document !== 'undefined' && elementRef.value) {
       elementRef.value.focus()
     }
   })
   ```

9. **与 `nextTick` 的区别**：`watchPostEffect` 和 `nextTick` 都能在 DOM 更新后执行代码，但 `watchPostEffect` 是自动追踪依赖的响应式侦听器，而 `nextTick` 是一次性的回调。如果你只需要在某个操作后等待 DOM 更新一次，使用 `nextTick` 更合适。

   ```ts
   // 使用 nextTick —— 一次性等待 DOM 更新
   count.value++
   await nextTick()
   console.log('DOM 已更新')

   // 使用 watchPostEffect —— 自动追踪，每次变化后都执行
   watchPostEffect(() => {
     console.log('count 变化后 DOM 已更新：', count.value)
   })
   ```

10. **性能考量**：`watchPostEffect` 的回调在每次依赖变化后都会执行，且发生在 DOM 更新之后。如果回调中有耗时操作（如复杂的 DOM 查询或计算），可能影响渲染性能。对于高频变化的场景，考虑使用 `watch` 配合防抖来优化。

### 七、相关 API 对比

| 特性 | `watchEffect` | `watchPostEffect` | `watch` + `flush: 'post'` |
|------|--------------|-------------------|--------------------------|
| **执行时机** | 组件更新前（同步调度） | 组件更新后（`flush: 'post'`） | 组件更新后（`flush: 'post'`） |
| **首次执行** | 立即执行 | 立即执行 | 可选（`immediate` 选项） |
| **依赖追踪** | 自动追踪 | 自动追踪 | 显式指定侦听源 |
| **惰性侦听** | 不支持 | 不支持 | 支持（默认惰性） |
| **旧值访问** | 不支持 | 不支持 | 支持（回调参数） |
| **适用场景** | 通用副作用 | DOM 操作相关副作用 | 需要精确控制的侦听 |
| **等价写法** | `watchEffect(fn, { flush: 'pre' })` | `watchEffect(fn, { flush: 'post' })` | — |

```ts
// 以下三种写法等价：

// 1. watchPostEffect
watchPostEffect(() => {
  console.log(count.value)
})

// 2. watchEffect + flush: 'post'
watchEffect(
  () => {
    console.log(count.value)
  },
  { flush: 'post' }
)

// 3. watch + flush: 'post'（但 watch 可以访问旧值，且默认惰性）
watch(
  () => count.value,
  (newVal, oldVal) => {
    console.log(newVal, oldVal)
  },
  { flush: 'post', immediate: true }
)
```

> 💡 **提示：** 选择建议——如果需要操作 DOM，优先用 `watchPostEffect`；如果需要精确控制侦听源或访问旧值，用 `watch` + `flush: 'post'`。

### 八、总结

`watchPostEffect` 是 Vue 3 响应式系统中一个实用的 API，专门解决「在 DOM 更新后执行副作用」这一常见需求。它的核心价值在于：

- **安全的 DOM 操作**：确保回调执行时 DOM 已经是最新状态，避免读取到过时的 DOM 信息。
- **自动依赖追踪**：无需手动指定侦听的数据源，Vue 自动追踪回调中使用的响应式数据。
- **简洁的 API**：等价于 `watchEffect(fn, { flush: 'post' })` 的简写形式，语义清晰。

在实际开发中，凡是涉及「响应式数据变化后需要操作 DOM」的场景，如自动聚焦、滚动定位、测量尺寸、第三方库初始化等，`watchPostEffect` 都是首选方案。对于不需要操作 DOM 的普通副作用，使用 `watchEffect` 即可；对于需要更精细控制的场景，则可以考虑 `watch` 配合 `flush: 'post'` 选项。
