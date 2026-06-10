# onBeforeUnmount

## 作用

📖 [Vue 官方文档 - onBeforeUnmount](https://cn.vuejs.org/api/composition-api-lifecycle#onbeforeunmount)

`onBeforeUnmount()` 是 Vue 3 的生命周期钩子，在组件卸载之前调用。这是执行清理工作的理想位置，比如清除定时器、取消事件监听、断开网络连接等。

## 用法

### 基本用法

```javascript
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  console.log('组件即将卸载')
  console.log('此时组件实例仍然可用')
})
```

### 清理定时器

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const count = ref(0)
    let timer = null

    // 开始定时器
    timer = setInterval(() => {
      count.value++
    }, 1000)

    // 组件卸载前清除定时器
    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })

    return { count }
  }
}
```

### 清理事件监听器

```javascript
import { onBeforeUnmount, onMounted } from 'vue'

export default {
  setup() {
    const handleResize = () => {
      console.log('窗口大小:', window.innerWidth)
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })
  }
}
```

### 在 `<script setup>` 中使用

```vue
<script setup>
import { ref, onBeforeUnmount } from 'vue'

const connection = ref(null)

onBeforeUnmount(() => {
  // 关闭 WebSocket 连接
  if (connection.value) {
    connection.value.close()
  }
})
</script>
```

## 使用场景

### 1. 清理网络请求

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const abortController = ref(null)

    const fetchData = async () => {
      abortController.value = new AbortController()

      try {
        const response = await fetch('/api/data', {
          signal: abortController.value.signal
        })
        const data = await response.json()
        return data
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('请求已取消')
        }
      }
    }

    onBeforeUnmount(() => {
      // 取消进行中的请求
      if (abortController.value) {
        abortController.value.abort()
      }
    })

    return { fetchData }
  }
}
```

### 2. 清理 WebSocket

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const socket = ref(null)
    const messages = ref([])

    const connect = () => {
      socket.value = new WebSocket('ws://localhost:8080')

      socket.value.onopen = () => {
        console.log('WebSocket 已连接')
      }

      socket.value.onmessage = (event) => {
        messages.value.push(JSON.parse(event.data))
      }

      socket.value.onerror = (error) => {
        console.error('WebSocket 错误:', error)
      }
    }

    onBeforeUnmount(() => {
      // 关闭 WebSocket 连接
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.close()
      }
    })

    return { messages, connect }
  }
}
```

### 3. 保存组件状态

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const formData = ref({
      name: '',
      email: '',
      message: ''
    })

    onBeforeUnmount(() => {
      // 保存表单数据到 localStorage
      localStorage.setItem('draft-form', JSON.stringify(formData.value))
    })

    return { formData }
  }
}
```

### 4. 清理第三方实例

```javascript
import { ref, onBeforeUnmount, onMounted } from 'vue'

export default {
  setup() {
    const chartInstance = ref(null)
    const chartRef = ref(null)

    onMounted(() => {
      // 初始化图表
      chartInstance.value = new Chart(chartRef.value, {
        type: 'bar',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{
            label: '数据',
            data: [10, 20, 30]
          }]
        }
      })
    })

    onBeforeUnmount(() => {
      // 销毁图表实例
      if (chartInstance.value) {
        chartInstance.value.destroy()
        chartInstance.value = null
      }
    })

    return { chartRef }
  }
}
```

### 5. 清理订阅

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const subscription = ref(null)
    const data = ref(null)

    const subscribe = () => {
      // 假设有一个 Observable
      subscription.value = observable$.subscribe({
        next: (value) => {
          data.value = value
        },
        error: (err) => {
          console.error(err)
        }
      })
    }

    onBeforeUnmount(() => {
      // 取消订阅
      if (subscription.value) {
        subscription.value.unsubscribe()
        subscription.value = null
      }
    })

    return { data, subscribe }
  }
}
```

### 6. 清理动画

```javascript
import { ref, onBeforeUnmount, onMounted } from 'vue'

export default {
  setup() {
    const elementRef = ref(null)
    let animationId = null

    const animate = () => {
      if (!elementRef.value) return

      // 动画逻辑
      elementRef.value.style.transform = `translateX(${Date.now() % 1000}px)`

      animationId = requestAnimationFrame(animate)
    }

    onMounted(() => {
      animationId = requestAnimationFrame(animate)
    })

    onBeforeUnmount(() => {
      // 取消动画帧
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    })

    return { elementRef }
  }
}
```

## 与 onUnmounted 的区别

```javascript
import { ref, onBeforeUnmount, onUnmounted } from 'vue'

export default {
  setup() {
    const data = ref(null)

    onBeforeUnmount(() => {
      console.log('onBeforeUnmount: 组件即将卸载')
      console.log('此时组件实例仍然可用')
      console.log('仍然可以访问 data:', data.value)

      // 可以执行最后的清理操作
      saveData(data.value)
    })

    onUnmounted(() => {
      console.log('onUnmounted: 组件已卸载')
      console.log('此时组件实例已被销毁')
      // 大多数清理工作应该在 onBeforeUnmount 中完成
    })

    return { data }
  }
}
```

## 注意事项

### 1. DOM 仍然可访问

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const elementRef = ref(null)

    onBeforeUnmount(() => {
      // 此时 DOM 仍然存在
      if (elementRef.value) {
        console.log('元素仍然存在:', elementRef.value)
        // 可以获取元素的尺寸、位置等信息
        const rect = elementRef.value.getBoundingClientRect()
        console.log('元素位置:', rect)
      }
    })

    return { elementRef }
  }
}
```

### 2. 避免创建新副作用

```javascript
import { ref, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const count = ref(0)

    onBeforeUnmount(() => {
      // ⚠️ 不要在卸载钩子中创建新的副作用
      // setInterval(() => {
      //   count.value++
      // }, 1000) // 这是不好的做法

      // 应该只做清理工作
      console.log('清理完成')
    })

    return { count }
  }
}
```

### 3. 清理顺序很重要

```javascript
import { onBeforeUnmount } from 'vue'

export default {
  setup() {
    let timer1 = null
    let timer2 = null
    let socket = null

    onBeforeUnmount(() => {
      // 按正确的顺序清理资源
      // 先关闭可能依赖其他资源的连接
      if (socket) {
        socket.close()
      }

      // 然后清除定时器
      if (timer1) clearInterval(timer1)
      if (timer2) clearInterval(timer2)
    })
  }
}
```

## 完整示例

```vue
<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue'

const messages = ref([])
const socket = ref(null)
const isConnected = ref(false)

const connect = () => {
  socket.value = new WebSocket('ws://localhost:8080')

  socket.value.onopen = () => {
    isConnected.value = true
    addMessage('系统', '已连接到服务器')
  }

  socket.value.onmessage = (event) => {
    const data = JSON.parse(event.data)
    addMessage('服务器', data.message)
  }

  socket.value.onclose = () => {
    isConnected.value = false
    addMessage('系统', '连接已断开')
  }

  socket.value.onerror = (error) => {
    addMessage('错误', error.message)
  }
}

const disconnect = () => {
  if (socket.value) {
    socket.value.close()
  }
}

const sendMessage = (text) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({ message: text }))
    addMessage('我', text)
  }
}

const addMessage = (sender, text) => {
  messages.value.push({
    id: Date.now(),
    sender,
    text,
    time: new Date().toLocaleTimeString()
  })
}

onBeforeUnmount(() => {
  // 组件卸载前关闭连接
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.close()
  }
})
</script>

<template>
  <div class="chat">
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <span class="sender">{{ msg.sender }}:</span>
        <span class="text">{{ msg.text }}</span>
        <span class="time">{{ msg.time }}</span>
      </div>
    </div>

    <div class="controls">
      <button v-if="!isConnected" @click="connect">连接</button>
      <button v-else @click="disconnect">断开</button>
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage(newMessage)"
        :disabled="!isConnected"
        placeholder="输入消息..."
      />
    </div>
  </div>
</template>
```

## 最佳实践

1. **清理所有资源**：定时器、事件监听器、网络请求、WebSocket 等
2. **保存状态**：在卸载前保存需要持久化的状态
3. **清理顺序**：按照正确的依赖关系清理资源
4. **避免新副作用**：不要在卸载钩子中创建新的副作用
