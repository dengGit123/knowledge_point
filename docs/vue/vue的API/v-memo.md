# v-memo

## 作用

`v-memo` 是 Vue 3.2+ 新增的指令，用于记忆（缓存）一个子树的渲染结果。接受一个依赖值数组，**只有当数组中的值发生变化时**才会重新渲染。

当数组中的每个值都与上一次渲染相同，则该子树的所有更新都会被跳过。这对于**性能优化**非常有用，特别是在渲染大型 `v-for` 列表时。

📖 [Vue 官方文档 - v-memo](https://cn.vuejs.org/api/built-in-directives#v-memo)

## 基本用法

```vue
<template>
  <!-- 只有当 valueA 或 valueB 改变时才重新渲染 -->
  <div v-memo="[valueA, valueB]">
    <p>Value A: {{ valueA }}</p>
    <p>Value B: {{ valueB }}</p>
    <p>Value C: {{ valueC }}</p>
    <!-- ⚠️ Value C 变化时不会触发这个 div 的重新渲染 -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
const valueA = ref(1)
const valueB = ref(2)
const valueC = ref(3)
</script>
```

## 依赖数组详解

```vue
<template>
  <!-- 空数组：永远不更新（等同于 v-once） -->
  <div v-memo="[]">
    {{ content }}
  </div>

  <!-- 单个依赖 -->
  <div v-memo="[userId]">
    <!-- 只有 userId 变化时才更新 -->
    <UserProfile :id="userId" />
  </div>

  <!-- 多个依赖 -->
  <div v-memo="[userId, isActive]">
    <!-- userId 或 isActive 任一变化时更新 -->
    <UserCard :id="userId" :active="isActive" />
  </div>

  <!-- 复杂表达式依赖 -->
  <div v-memo="[user.role, user.permissions.length]">
    <!-- 角色或权限数量变化时更新 -->
    <PermissionPanel :role="user.role" />
  </div>
</template>
```

## 使用场景

### 1. 优化大型 v-for 列表（核心场景）

```vue
<template>
  <!-- 只有当 item.selected 状态变化时才更新对应的列表项 -->
  <div
    v-for="item in list"
    :key="item.id"
    v-memo="[item.selected]"
  >
    <div :class="{ selected: item.selected }">
      <input
        type="checkbox"
        :checked="item.selected"
        @change="toggleSelect(item.id)"
      />
      <span>{{ item.name }}</span>
      <span>{{ item.description }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const list = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `项目 ${i}`,
    description: `描述 ${i}`,
    selected: false
  }))
)

function toggleSelect(id) {
  const item = list.value.find(item => item.id === id)
  if (item) item.selected = !item.selected
}
</script>
```

### 2. 复杂组件条件更新

```vue
<template>
  <!-- ExpensiveChart 渲染开销大，只在必要数据变化时才重新渲染 -->
  <ExpensiveChart
    v-memo="[chartType, dateRange, datasetId]"
    :type="chartType"
    :range="dateRange"
    :data="chartData"
    :theme="theme"
  >
    <!-- theme 变化不会触发重新渲染 -->
  </ExpensiveChart>
</template>

<script setup>
import { ref } from 'vue'
import ExpensiveChart from './ExpensiveChart.vue'

const chartType = ref('line')
const dateRange = ref('7d')
const datasetId = ref(1)
const chartData = ref({})
const theme = ref('light')
</script>
```

### 3. 表格行级别优化

```vue
<template>
  <table>
    <thead>
      <tr>
        <th>选择</th>
        <th>名称</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.id"
        v-memo="[row.selected, row.status]"
        :class="{ 'row-selected': row.selected, 'row-disabled': row.status === 'disabled' }"
      >
        <td>
          <input
            type="checkbox"
            :checked="row.selected"
            @change="row.selected = !row.selected"
          />
        </td>
        <td>{{ row.name }}</td>
        <td>
          <span :class="`status-${row.status}`">{{ row.statusText }}</span>
        </td>
        <td>
          <button @click="handleAction(row)">操作</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref } from 'vue'

const rows = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `项目 ${i}`,
    selected: false,
    status: i % 3 === 0 ? 'disabled' : 'active',
    statusText: i % 3 === 0 ? '已禁用' : '正常'
  }))
)
</script>
```

### 4. 条件渲染优化

```vue
<template>
  <div v-memo="[activeTab]">
    <!-- 只有切换 tab 时才重新渲染 -->
    <TabContent v-if="activeTab === 'home'" :data="homeData" />
    <TabContent v-else-if="activeTab === 'profile'" :data="profileData" />
    <TabContent v-else-if="activeTab === 'settings'" :data="settingsData" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabContent from './TabContent.vue'

const activeTab = ref('home')
const homeData = ref({})
const profileData = ref({})
const settingsData = ref({})
</script>
```

### 5. 搜索过滤列表

```vue
<template>
  <div>
    <input v-model="keyword" placeholder="搜索..." />

    <div
      v-for="item in filteredList"
      :key="item.id"
      v-memo="[keyword]"
    >
      <!-- 搜索关键词不变时跳过重新渲染 -->
      <h3>{{ item.title }}</h3>
      <p>{{ item.content }}</p>
      <span v-for="tag in item.tags" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const keyword = ref('')
const items = ref([
  { id: 1, title: 'Vue 3', content: 'Vue 3 新特性', tags: ['vue', '前端'] },
  { id: 2, title: 'TypeScript', content: '类型系统', tags: ['ts', '前端'] }
])

const filteredList = computed(() => {
  if (!keyword.value) return items.value
  return items.value.filter(item =>
    item.title.includes(keyword.value) || item.content.includes(keyword.value)
  )
})
</script>
```

### 6. 虚拟列表中的节点缓存

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <div
      v-for="item in visibleItems"
      :key="item.id"
      v-memo="[item.id]"
      class="list-item"
    >
      <!-- ID 不变时跳过更新（虚拟列表中位置可能变化但内容不变） -->
      <img :src="item.avatar" :alt="item.name" />
      <div>
        <h4>{{ item.name }}</h4>
        <p>{{ item.bio }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const allItems = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  avatar: `/avatars/${i}.jpg`,
  bio: `这是用户 ${i} 的简介`
})))

const scrollTop = ref(0)
const itemHeight = 80
const visibleCount = 20

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  return allItems.value.slice(start, start + visibleCount)
})

function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}
</script>
```

## 与 v-once 的对比

| 特性 | v-memo | v-once |
|------|--------|--------|
| **版本** | Vue 3.2+ | Vue 2.x+ |
| **更新策略** | 依赖变化时更新 | **永远不更新** |
| **参数** | 依赖值数组 | 无 |
| **灵活性** | 高（自定义依赖） | 低（只能永不更新） |
| **适用场景** | 部分条件不变 | 完全静态内容 |
| **等价写法** | — | `v-memo="[]"` |

```vue
<template>
  <!-- 以下两种写法效果相同 -->
  <div v-once>{{ staticContent }}</div>
  <div v-memo="[]">{{ staticContent }}</div>
</template>
```

## 注意事项

### 1. 依赖值使用原始值

```vue
<template>
  <!-- ✅ 使用原始值作为依赖 -->
  <div v-memo="[user.id, user.name]">
    {{ user.name }}
  </div>

  <!-- ⚠️ 不推荐使用对象作为依赖（引用比较，几乎总不相等） -->
  <div v-memo="[user]">
    {{ user.name }}
  </div>
</template>
```

### 2. 不要过度使用

```vue
<template>
  <!-- ❌ 不推荐：简单内容不需要 v-memo -->
  <div v-memo="[count]">{{ count }}</div>

  <!-- ✅ 推荐：只在渲染开销大的场景使用 -->
  <ComplexChart v-memo="[chartConfig]" :config="chartConfig" />
</template>
```

### 3. 事件处理器不受影响

```vue
<template>
  <!-- ✅ 事件处理器始终正常工作 -->
  <div v-memo="[item.id]" @click="handleClick(item)">
    {{ item.name }}
  </div>
</template>
```

### 4. 依赖数组的比较是浅比较

```vue
<template>
  <!-- ⚠️ 数组中的对象是引用比较 -->
  <div v-memo="[filters]">
    <!-- 只有 filters 引用变了才会更新 -->
    <!-- 如果修改了 filters.name 但引用没变，不会触发更新 -->
  </div>

  <!-- ✅ 使用原始值 -->
  <div v-memo="[filters.name, filters.status]">
    {{ filters.name }} - {{ filters.status }}
  </div>
</template>
```

## 最佳实践

1. **用于大型 v-for 列表**：这是 `v-memo` 最有价值的场景，特别是列表项包含复杂组件时
2. **选择合适的依赖**：只把真正影响渲染输出的值放入依赖数组
3. **使用原始值**：数字、字符串、布尔值作为依赖比对象更可靠
4. **配合 key 使用**：`v-for` 中始终配合 `:key` 使用
5. **性能分析**：使用 Vue DevTools 分析渲染性能，只在确实有性能问题时使用 `v-memo`
6. **不要过度优化**：简单的模板渲染不需要 `v-memo`，Vue 的虚拟 DOM diff 已经足够快
