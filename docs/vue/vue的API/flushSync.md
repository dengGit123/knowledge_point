# flushSync

> 📖 [Vue 官方文档 - flushSync](https://cn.vuejs.org/api/reactivity-advanced#flushsync)

强制同步刷新所有待处理的响应式效果。

## 语法

```javascript
import { flushSync } from 'vue'

flushSync(() => {
  // 状态更新
})
```

## 参数

- `fn`: 包含状态更新的函数

## 返回值

返回函数执行的返回值

## 基础用法

```vue
<script setup>
import { ref, flushSync } from 'vue'

const count = ref(0)

function incrementTwice() {
  flushSync(() => {
    count.value++
  })

  // DOM 已经更新
  console.log(document.querySelector('.count').textContent) // 1

  flushSync(() => {
    count.value++
  })

  // DOM 再次更新
  console.log(document.querySelector('.count').textContent) // 2
}
</script>
```

## 强制同步更新

```vue
<template>
  <div>
    <button @click="update">更新</button>
    <div ref="container">{{ count }}</div>
  </div>
</template>

<script setup>
import { ref, flushSync } from 'vue'

const count = ref(0)
const container = ref(null)

function update() {
  flushSync(() => {
    count.value = 1
  })

  // 立即访问 DOM
  console.log(container.value.textContent) // "1"

  flushSync(() => {
    count.value = 2
  })

  console.log(container.value.textContent) // "2"
}
</script>
```

## 与 nextTick 的区别

```vue
<script setup>
import { ref, nextTick, flushSync } from 'vue'

const count = ref(0)

async function testUpdate() {
  // nextTick: 等待下一个 tick
  count.value = 1
  await nextTick()
  console.log('nextTick 后:', count.value) // 1

  // flushSync: 立即同步更新
  flushSync(() => {
    count.value = 2
  })
  console.log('flushSync 后:', count.value) // 2
}
</script>
```

## 批量更新同步

```vue
<script setup>
import { ref, flushSync } from 'vue'

const items = ref([])

function addItemsSynchronously() {
  flushSync(() => {
    items.value.push({ id: 1, name: 'Item 1' })
    items.value.push({ id: 2, name: 'Item 2' })
    items.value.push({ id: 3, name: 'Item 3' })
  })

  // 所有项目都已渲染到 DOM
  const domItems = document.querySelectorAll('.item')
  console.log('DOM 项目数量:', domItems.length) // 3
}
</script>
```

## 表单提交同步

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="username" />
    <input v-model="email" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { ref, flushSync } from 'vue'

const username = ref('')
const email = ref('')

function handleSubmit() {
  // 确保所有响应式更新同步完成
  flushSync(() => {
    // 验证前确保值已更新
    username.value = username.value.trim()
    email.value = email.value.trim()
  })

  // 现在可以安全地验证
  if (!username.value || !email.value) {
    alert('请填写所有字段')
    return
  }

  // 提交表单...
}
</script>
```

## 测试中的使用

```javascript
import { flushSync } from 'vue'
import { mount } from '@vue/test-utils'

test('同步更新测试', () => {
  const wrapper = mount(Component)

  flushSync(() => {
    wrapper.vm.count++
  })

  // DOM 已更新，可以立即断言
  expect(wrapper.find('.count').text()).toBe('1')
})
```

## 动画同步

```vue
<template>
  <div>
    <button @click="startAnimation">开始动画</button>
    <div ref="box" class="box" :class="{ active: isActive }"></div>
  </div>
</template>

<script setup>
import { ref, flushSync } from 'vue'

const isActive = ref(false)
const box = ref(null)

function startAnimation() {
  // 确保类名添加同步完成
  flushSync(() => {
    isActive.value = true
  })

  // 可以立即获取元素的新尺寸
  const rect = box.value.getBoundingClientRect()
  console.log('元素尺寸:', rect.width, rect.height)
}
</script>
```

## 测量 DOM 尺寸

```vue
<template>
  <div>
    <button @click="measure">测量</button>
    <div ref="container" :style="{ width: width + 'px' }">
      内容
    </div>
  </div>
</template>

<script setup>
import { ref, flushSync } from 'vue'

const width = ref(100)
const container = ref(null)

function measure() {
  flushSync(() => {
    width.value = 200
  })

  // 可以立即获取新宽度
  const rect = container.value.getBoundingClientRect()
  console.log('实际宽度:', rect.width) // 200
}
</script>
```

## 与 watch 配合

```vue
<script setup>
import { ref, watch, flushSync } from 'vue'

const count = ref(0)

watch(
  () => count.value,
  (newVal, oldVal) => {
    console.log('count 变化:', oldVal, '->', newVal)
  },
  { flush: 'sync' }
)

function update() {
  flushSync(() => {
    count.value = 1
  })
  // watch 回调已经执行
}
</script>
```

## 滚动同步

```vue
<template>
  <div>
    <button @click="scrollToItem">滚动</button>
    <div ref="list" class="list">
      <div v-for="item in items" :key="item" class="item">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, flushSync } from 'vue'

const items = ref([1, 2, 3, 4, 5])
const list = ref(null)

function scrollToItem() {
  // 添加新项目
  flushSync(() => {
    items.value.push(6)
  })

  // 立即滚动到新项目
  const newItems = list.value.querySelectorAll('.item')
  newItems[newItems.length - 1].scrollIntoView({
    behavior: 'auto' // 使用 auto 因为已经同步更新
  })
}
</script>
```

## 错误处理

```vue
<script setup>
import { ref, flushSync } from 'vue'

const data = ref(null)

async function loadData() {
  try {
    const response = await fetch('/api/data')
    const result = await response.json()

    flushSync(() => {
      data.value = result
    })

    // DOM 已更新
    console.log('数据已渲染')
  } catch (error) {
    console.error('加载失败:', error)
  }
}
</script>
```

## 注意事项

1. **性能影响**：强制同步更新可能影响性能，谨慎使用

2. **使用场景**：
   - 需要立即访问更新后的 DOM
   - 测试中需要同步断言
   - 与第三方库集成需要同步更新

3. **与 nextTick 的选择**：
   - 需要异步更新 → 用 `nextTick`
   - 需要同步更新 → 用 `flushSync`

4. **嵌套调用**：支持嵌套调用

5. **错误传播**：函数中的错误会被抛出

6. **响应式追踪**：保持响应式依赖关系

7. **不推荐滥用**：大多数情况下应该让 Vue 自动批量更新
