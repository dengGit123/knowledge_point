# onBeforeUpdate

## 作用

`onBeforeUpdate()` 是 Vue 3 的生命周期钩子，在组件响应式状态变化而更新 DOM 之前调用。这个钩子非常适合在更新之前访问现有的 DOM 状态。

## 用法

### 基本用法

```javascript
import { onBeforeUpdate } from 'vue'

onBeforeUpdate(() => {
  console.log('组件即将更新')
  console.log('此时 DOM 还是旧的状态')
})
```

### 访问更新前的 DOM

```javascript
import { ref, onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    onBeforeUpdate(() => {
      console.log('更新前的 count:', count.value)
      // 此时 DOM 还没有更新，可以访问旧的 DOM
      const oldElement = document.getElementById('counter')
      console.log('旧值:', oldElement.textContent)
    })
    
    onUpdated(() => {
      console.log('更新后的 count:', count.value)
      // 此时 DOM 已经更新
    })
    
    return { count }
  }
}
```

### 在 `` `<script setup>`` 中使用

```vue
<script setup>
import { ref, onBeforeUpdate } from 'vue'

const message = ref('Hello')

onBeforeUpdate(() => {
  console.log('数据即将变化，DOM 即将更新')
})
</script>

<template>
  <div>{{ message }}</div>
  <button @click="message = 'World'">改变</button>
</template>
```

## 执行时机

```javascript
import { ref, onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const logs = ref([])
    
    const addLog = (msg) => {
      logs.value.push(`${new Date().toISOString()}: ${msg}`)
    }
    
    onBeforeUpdate(() => {
      addLog('1. onBeforeUpdate - 数据已变，DOM 未更新')
    })
    
    onUpdated(() => {
      addLog('2. onUpdated - DOM 已更新')
    })
    
    function increment() {
      count.value++
      addLog(`count 变为 ${count.value}`)
    }
    
    return { count, logs, increment }
  }
}
```

## 使用场景

### 1. 缓存 DOM 信息

```javascript
import { ref, onBeforeUpdate } from 'vue'

export default {
  setup() {
    const listRef = ref(null)
    const oldScrollTop = ref(0)
    
    onBeforeUpdate(() => {
      // 在更新前保存滚动位置
      if (listRef.value) {
        oldScrollTop.value = listRef.value.scrollTop
      }
    })
    
    return { listRef }
  }
}
```

### 2. 对比更新前后的值

```javascript
import { ref, onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    const items = ref(['a', 'b', 'c'])
    let oldLength = 0
    
    onBeforeUpdate(() => {
      oldLength = items.value.length
      console.log('更新前长度:', oldLength)
    })
    
    onUpdated(() => {
      console.log('更新后长度:', items.value.length)
      if (items.value.length !== oldLength) {
        console.log('列表长度发生了变化')
      }
    })
    
    function addItem() {
      items.value.push('d')
    }
    
    return { items, addItem }
  }
}
```

### 3. 手动操作 DOM（不推荐）

```javascript
import { ref, onBeforeUpdate } from 'vue'

export default {
  setup() {
    const inputRef = ref(null)
    
    onBeforeUpdate(() => {
      // 在更新前保存输入框的值
      if (inputRef.value) {
        const oldValue = inputRef.value.value
        console.log('保存的值:', oldValue)
      }
    })
    
    return { inputRef }
  }
}
```

### 4. 性能优化

```javascript
import { ref, onBeforeUpdate } from 'vue'

export default {
  setup() {
    const list = ref([])
    const shouldUpdate = ref(true)
    
    onBeforeUpdate(() => {
      if (!shouldUpdate.value) {
        // 阻止更新
        return false
      }
    })
    
    return { list, shouldUpdate }
  }
}
```

### 5. 动画状态保存

```javascript
import { ref, onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    const isAnimating = ref(false)
    const currentItem = ref(0)
    
    onBeforeUpdate(() => {
      // 保存当前动画状态
      if (isAnimating.value) {
        console.log('动画进行中，保存状态')
      }
    })
    
    onUpdated(() => {
      // 更新完成后恢复或启动动画
      startAnimation()
    })
    
    function startAnimation() {
      // 动画逻辑
    }
    
    function changeItem(index) {
      currentItem.value = index
    }
    
    return { isAnimating, currentItem, changeItem }
  }
}
```

## 注意事项

### 1. 不要在 onBeforeUpdate 中修改响应式数据

```javascript
import { ref, onBeforeUpdate } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    onBeforeUpdate(() => {
      // ⚠️ 小心：修改响应式数据可能导致无限循环
      count.value++ // 可能导致无限更新循环
    })
    
    return { count }
  }
}
```

### 2. 性能考虑

```javascript
import { ref, onBeforeUpdate } from 'vue'

export default {
  setup() {
    const data = ref({})
    
    onBeforeUpdate(() => {
      // ⚠️ onBeforeUpdate 会在每次更新时调用
      // 避免在这里执行耗时操作
      console.log('这次更新会被频繁调用')
    })
    
    return { data }
  }
}
```

### 3. 与 watch 的区别

```javascript
import { ref, onBeforeUpdate, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    // onBeforeUpdate：任何响应式变化都会触发
    onBeforeUpdate(() => {
      console.log('组件即将更新')
    })
    
    // watch：只监听特定数据的变化
    watch(count, (newVal, oldVal) => {
      console.log('count 从', oldVal, '变为', newVal)
    })
    
    return { count }
  }
}
```

## 完整示例

```vue
<script setup>
import { ref, onBeforeUpdate, onUpdated } from 'vue'

const items = ref([
  { id: 1, text: '项目 1' },
  { id: 2, text: '项目 2' },
  { id: 3, text: '项目 3' }
])

const updateLog = ref([])

onBeforeUpdate(() => {
  // 记录更新前的状态
  updateLog.value.push({
    time: new Date().toISOString(),
    action: 'beforeUpdate',
    count: items.value.length
  })
})

onUpdated(() => {
  // 记录更新后的状态
  updateLog.value.push({
    time: new Date().toISOString(),
    action: 'updated',
    count: items.value.length
  })
})

function addItem() {
  const newId = Math.max(...items.value.map(i => i.id)) + 1
  items.value.push({ id: newId, text: `项目 ${newId}` })
}

function removeItem(id) {
  const index = items.value.findIndex(item => item.id === id)
  if (index > -1) {
    items.value.splice(index, 1)
  }
}
</script>

<template>
  <div>
    <button @click="addItem">添加项目</button>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.text }}
        <button @click="removeItem(item.id)">删除</button>
      </li>
    </ul>
    <div class="logs">
      <h3>更新日志</h3>
      <pre>{{ updateLog }}</pre>
    </div>
  </div>
</template>
```

## 最佳实践

1. **读取 DOM 状态**：在更新前读取 DOM 状态用于对比
2. **保存状态**：保存更新前的状态用于后续恢复
3. **避免副作用**：不要在这个钩子中修改响应式数据
4. **性能优化**：避免执行耗时操作
