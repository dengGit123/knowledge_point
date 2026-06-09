# v-once

## 作用

`v-once` 让元素及其所有子节点只渲染**一次**。首次渲染后，该元素及其所有内容将被视为静态内容并跳过后续更新。这可以用于优化更新性能。

> [Vue 官方文档 - v-once](https://cn.vuejs.org/api/built-in-directives#v-once)

## 基本用法

```vue
<template>
  <!-- 只渲染一次，后续 message 变化不会更新此元素 -->
  <span v-once>{{ message }}</span>

  <button @click="message = 'Changed'">改变内容</button>
  <!-- 点击后 span 的内容仍然是初始值 -->
</template>

<script setup>
import { ref } from 'vue'
const message = ref('初始内容')
</script>
```

## 使用场景

### 1. 静态内容优化

```vue
<template>
  <div>
    <!-- 站点标题不会变化，使用 v-once 跳过更新 -->
    <header v-once>
      <h1>我的网站</h1>
      <p>网站描述文本</p>
    </header>

    <!-- 动态内容正常更新 -->
    <main>
      <p>{{ dynamicContent }}</p>
    </main>
  </div>
</template>
```

### 2. 只渲染一次的组件

```vue
<template>
  <div>
    <!-- 组件只会挂载一次，后续 props 变化不会更新 -->
    <InitialBanner v-once :user="currentUser" />

    <!-- 这个组件会正常响应 props 变化 -->
    <UserProfile :user="currentUser" />

    <button @click="currentUser = newUser">切换用户</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InitialBanner from './InitialBanner.vue'
import UserProfile from './UserProfile.vue'

const currentUser = ref({ name: '张三' })
</script>
```

### 3. 配合 v-for 使用

```vue
<template>
  <ul>
    <!-- 每个列表项只渲染一次 -->
    <li v-for="item in items" :key="item.id" v-once>
      {{ item.name }}
    </li>
  </ul>

  <!-- ⚠️ 注意：使用 v-once 后，即使 items 数据变化，列表也不会更新 -->
</template>

<script setup>
import { ref } from 'vue'
const items = ref([
  { id: 1, name: '项目一' },
  { id: 2, name: '项目二' }
])
</script>
```

### 4. 初始值快照

```vue
<template>
  <div>
    <p>当前时间：{{ currentTime }}</p>
    <p v-once>页面加载时间：{{ initialTime }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const initialTime = ref(new Date().toLocaleString())
const currentTime = ref(new Date().toLocaleString())

// 每秒更新当前时间
setInterval(() => {
  currentTime.value = new Date().toLocaleString()
}, 1000)
</script>
```

### 5. 版权信息/版本号

```vue
<template>
  <footer v-once>
    <p>© {{ year }} My Company. All rights reserved.</p>
    <p>Version: {{ version }}</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
const version = __APP_VERSION__ // 构建时注入
</script>
```

### 6. 多根节点场景

```vue
<template>
  <!-- v-once 作用于整个片段 -->
  <div v-once>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <ul>
      <li v-for="item in features" :key="item">{{ item }}</li>
    </ul>
  </div>

  <!-- 动态内容不受影响 -->
  <div>
    <p>{{ dynamicContent }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('功能介绍')
const description = ref('这是一段描述')
const features = ref(['功能一', '功能二', '功能三'])
const dynamicContent = ref('可变内容')
</script>
```

### 7. 条件渲染中的首次结果缓存

```vue
<template>
  <!-- 首次渲染后，即使条件变化也不会重新渲染 -->
  <div v-if="showContent" v-once>
    {{ heavyContent }}
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showContent = ref(true)

const heavyContent = computed(() => {
  // 一些计算量较大的操作
  return '计算结果'
})
</script>
```

## 与 v-memo 的对比

| 特性 | v-once | v-memo |
|------|--------|--------|
| **版本** | Vue 2.x+ | Vue 3.2+ |
| **更新策略** | 永远不更新 | 依赖变化时更新 |
| **参数** | 无 | 接受依赖数组 |
| **灵活性** | 低（只能永不更新） | 高（自定义依赖） |
| **适用场景** | 纯静态内容 | 部分条件不变的内容 |

```vue
<template>
  <!-- v-once：永远不更新 -->
  <div v-once>{{ message }}</div>

  <!-- v-memo：只在 valueA 变化时更新 -->
  <div v-memo="[valueA]">
    <p>{{ valueA }}</p>
    <p>{{ valueB }}</p>
  </div>
</template>
```

## 注意事项

### 1. 会影响所有子节点

```vue
<template>
  <!-- ⚠️ v-once 会作用于整个子树 -->
  <div v-once>
    <!-- 这些都不会再更新 -->
    <p>{{ message }}</p>
    <ChildComponent :data="dynamicData" />
  </div>
</template>
```

### 2. 组件的 props 变化不会触发更新

```vue
<template>
  <!-- ⚠️ 组件只会渲染一次，后续 count 变化不会更新组件 -->
  <Counter v-once :count="count" />

  <button @click="count++">增加</button>
  <!-- Counter 不会响应 count 的变化 -->
</template>

<script setup>
import { ref } from 'vue'
import Counter from './Counter.vue'
const count = ref(0)
</script>
```

### 3. 事件监听器仍然有效

```vue
<template>
  <!-- ✅ v-once 只跳过渲染更新，事件仍然可以正常触发 -->
  <button v-once @click="handleClick">
    {{ buttonText }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
const buttonText = ref('点击我')

function handleClick() {
  console.log('按钮被点击了')
  // ⚠️ 注意：修改 buttonText 不会更新按钮文本
  buttonText.value = '已点击'
}
</script>
```

### 4. 不适用于频繁变化的内容

```vue
<template>
  <!-- ❌ 错误用法：对需要更新的内容使用 v-once -->
  <span v-once>{{ currentTime }}</span>

  <!-- ✅ 正确：需要更新的内容不加 v-once -->
  <span>{{ currentTime }}</span>
</template>
```

## 最佳实践

1. **用于纯静态内容**：只对确定不会变化的内容使用 `v-once`，如版权信息、版本号、静态标题
2. **性能优化谨慎使用**：现代 Vue 的渲染性能已经很好，`v-once` 的优化效果有限，不要过度使用
3. **优先考虑 v-memo**：如果内容有可能变化，使用 `v-memo` 更灵活
4. **注意子节点影响**：`v-once` 会作用于整个子树，确保子树中不包含需要更新的内容
5. **组件初始值快照**：在需要"记住"组件首次渲染结果的场景中使用
